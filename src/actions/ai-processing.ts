"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { processEmailsBatch, type TokenUsage } from "@/services/openai";
import {
  mapEmailToAIInput,
  buildEmailMetadataUpsertArgs,
  buildContactsUpserts,
} from "@/lib/ai-mapper";
import { normalizeTagLabel } from "@/lib/tag-utils";
import type { EmailAnalysis } from "@/types/ai";
import { Prisma } from "@prisma/client";
import { requireCurrentUserId } from "@/lib/auth-session";

// Wrapper seguro para revalidación (evita fallos en entorno de tests/CLI)
function revalidateSafe(path: string): void {
  try {
    if (process.env.SKIP_REVALIDATE === "1") return;
    revalidatePath(path);
  } catch {
    // noop en tests o entornos sin Next runtime
  }
}

// ========================= Schemas =========================

const EmailIdsSchema = z
  .array(z.string().min(1, "ID de email requerido"))
  .min(1, "Se requiere al menos 1 email")
  .max(10, "Máximo 10 emails por batch");

const SingleEmailIdSchema = z.string().min(1, "ID de email requerido");

const PaginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
});

// ========================= Tipos de Retorno =========================

export interface ProcessEmailsSummary {
  success: boolean;
  processed: number;
  errors: Array<{ emailId: string; error: string }>;
  modelUsed?: string;
  usage?: TokenUsage;
  validationErrors?: string[];
}

export interface PagedEmailsResult {
  success: boolean;
  data?: unknown[];
  total?: number;
  page?: number;
  pageSize?: number;
  error?: string;
}

export interface GenericActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface SnapshotTask {
  id: string;
  description: string;
  dueDate: Date | null;
  tags: string[];
  participants: string[];
  status: string;
}

interface SnapshotMetadata {
  category: string | null;
  priority: string | null;
  summary: string | null;
  contactName: string | null;
  hasTask: boolean;
  taskStatus: string | null;
  tasks?: SnapshotTask[];
}

// ========================= Server Actions =========================

/**
 * Devuelve emails no procesados (processedAt IS NULL) del usuario actual con orden:
 *  - receivedAt desc
 *  - createdAt desc
 * Paginado (page, pageSize)
 *
 * HITO 2 (Filtrado Correos No Procesables):
 *  - Solo devuelve emails isProcessable = true.
 */
export async function getUnprocessedEmails(
  page = 1,
  pageSize = 10
): Promise<PagedEmailsResult> {
  try {
    const userId = await requireCurrentUserId();
    const { page: p, pageSize: ps } = PaginationSchema.parse({ page, pageSize });

    const where = {
      processedAt: null,
      isProcessable: true,
      user: {
        is: {
          id: userId,
        },
      },
    } as unknown as Prisma.EmailWhereInput;

    const [total, data] = await Promise.all([
      prisma.email.count({ where }),
      prisma.email.findMany({
        where,
        include: {
          metadata: {
            include: { tasks: true },
          },
        } as unknown as Prisma.EmailInclude,
        orderBy: [{ receivedAt: "desc" }],
        skip: (p - 1) * ps,
        take: ps,
      }),
    ]);

    return { success: true, data, total, page: p, pageSize: ps };
  } catch (error) {
    console.error("getUnprocessedEmails error:", error);
    return { success: false, error: "Error al obtener emails sin procesar" };
  }
}

/**
 * Procesa emails con IA (máximo 10) del usuario actual:
 *  - Obtiene emails por IDs y userId
 *  - Llama a OpenAI (batch)
 *  - Valida y mapea resultados
 *  - Upsert de EmailMetadata + Task[] + Contact
 *  - Manejo de errores granular por email
 *
 * HITO 2 (Filtrado Correos No Procesables):
 *  - Solo procesa emails isProcessable = true.
 */
export async function processEmailsWithAI(
  emailIds: string[]
): Promise<ProcessEmailsSummary> {
  const summary: ProcessEmailsSummary = {
    success: false,
    processed: 0,
    errors: [],
  };

  try {
    const userId = await requireCurrentUserId();
    const ids = EmailIdsSchema.parse(emailIds);

    // Cargar emails desde BD, asegurando que pertenecen al usuario actual
    // y que son procesables por IA.
    const emails = await prisma.email.findMany({
      where: {
        id: { in: ids },
        isProcessable: true,
        user: {
          is: {
            id: userId,
          },
        },
      } as unknown as Prisma.EmailWhereInput,
    });

    if (emails.length === 0) {
      return {
        ...summary,
        success: false,
        processed: 0,
        errors: [
          {
            emailId: "-",
            error: "No se encontraron emails procesables del usuario actual",
          },
        ],
      };
    }

    // Mapear a input IA
    const aiInputs = emails.map(mapEmailToAIInput);

    // HITO 2: Cargar catálogo de etiquetas existentes para el prompt de IA
    const tagRowsForPrompt = await prisma.tag.findMany({
      orderBy: { descripcion: "asc" },
      select: { descripcion: true },
    });
    const existingTags = tagRowsForPrompt.map((t) => t.descripcion);

    // Llamar a OpenAI con catálogo de etiquetas existentes
    const aiResult = await processEmailsBatch(aiInputs, existingTags);

    summary.modelUsed = aiResult.modelUsed;
    summary.usage = aiResult.usage;
    if (aiResult.errors?.length) {
      summary.validationErrors = aiResult.errors;
    }

    // HITO 3: Detectar y registrar nuevas etiquetas propuestas por IA
    try {
      const normalizedFromAI = new Set<string>();

      for (const analysis of aiResult.analyses as EmailAnalysis[]) {
        for (const task of analysis.tasks ?? []) {
          for (const rawTag of task.tags ?? []) {
            const normalized = normalizeTagLabel(rawTag);
            if (normalized) {
              normalizedFromAI.add(normalized);
            }
          }
        }
      }

      if (normalizedFromAI.size > 0) {
        const normalizedList = Array.from(normalizedFromAI);

        // Consultar cuáles ya existen en Tag
        const existingTagRows = await prisma.tag.findMany({
          where: { descripcion: { in: normalizedList } },
          select: { descripcion: true },
        });
        const existingNormalizedSet = new Set(
          existingTagRows.map((t) => t.descripcion)
        );

        const newTags = normalizedList.filter(
          (t) => !existingNormalizedSet.has(t)
        );

        if (newTags.length > 0) {
          await prisma.tag.createMany({
            data: newTags.map((descripcion) => ({ descripcion })),
            skipDuplicates: true, // idempotencia ante condiciones de carrera
          });
        }
      }
    } catch (tagError) {
      console.error("Error al registrar nuevas etiquetas en Tag:", tagError);
      // Importante: no interrumpir el flujo principal de procesamiento
    }

    // Index rápido por ID de email en BD sin usar `any`
    const emailById: Record<string, (typeof emails)[number]> = {};
    for (const email of emails) {
      emailById[email.id] = email;
    }

    // Procesar cada análisis devuelto por IA de forma independiente (manejo granular)
    for (const analysis of aiResult.analyses as EmailAnalysis[]) {
      const emailId = analysis.email_id;
      const email = emailById[emailId];
      if (!email) {
        summary.errors.push({
          emailId,
          error: "Análisis no coincide con un email existente del usuario",
        });
        continue;
      }

      try {
        // Transacción por email: upsert de metadata+tasks, contactos y marca como procesado por IA
        await prisma.$transaction(async (tx) => {
          // Upsert metadata + tasks
          const mdUpsertArgs = buildEmailMetadataUpsertArgs(email, analysis);
          await tx.emailMetadata.upsert(mdUpsertArgs);

          // Upserts de contactos (remitente + participantes)
          const contactUpserts = buildContactsUpserts(email, analysis);
          for (const args of contactUpserts) {
            await tx.contact.upsert(args);
          }

          // Marcar email como procesado por IA (processedAt != null)
          await tx.email.update({
            where: { id: email.id },
            data: { processedAt: new Date() },
          });
        });

        summary.processed += 1;
      } catch (err) {
        console.error(`Fallo al persistir análisis para email ${emailId}:`, err);
        summary.errors.push({
          emailId,
          error: "Error al guardar resultados IA en base de datos",
        });
      }
    }

    // Revalidar rutas afectadas (emails, kanban, dashboard)
    revalidateSafe("/emails");
    revalidateSafe("/kanban");
    revalidateSafe("/");
    summary.success = summary.errors.length === 0;
    return summary;
  } catch (error) {
    console.error("processEmailsWithAI error:", error);
    summary.errors.push({
      emailId: "-",
      error: "Error general de procesamiento",
    });
    return summary;
  }
}

/**
 * Obtiene resultados IA pendientes de revisión del usuario actual:
 *  - Emails con processedAt !== null y approvedAt IS NULL
 *  - Incluye EmailMetadata + Tasks (recientemente generados)
 *  - Filtra por IDs específicos
 *
 * HITO 2 (Filtrado Correos No Procesables):
 *  - Solo devuelve emails isProcessable = true.
 */
export async function getPendingAIResults(
  emailIds: string[]
): Promise<GenericActionResult> {
  try {
    const userId = await requireCurrentUserId();
    const ids = EmailIdsSchema.parse(emailIds);

    const data = await prisma.email.findMany({
      where: {
        id: { in: ids },
        // Emails ya procesados por IA pero aún no aprobados
        processedAt: { not: null },
        approvedAt: null,
        isProcessable: true,
        user: {
          is: {
            id: userId,
          },
        },
      } as unknown as Prisma.EmailWhereInput,
      include: {
        metadata: {
          include: { tasks: true },
        },
      } as unknown as Prisma.EmailInclude,
      orderBy: [{ receivedAt: "desc" }],
    });

    return { success: true, data };
  } catch (error) {
    console.error("getPendingAIResults error:", error);
    return { success: false, error: "Error al obtener resultados IA pendientes" };
  }
}

/**
 * Confirma o rechaza resultados IA de un email del usuario actual.
 *
 * - confirmed = true:
 *    - Marca approvedAt = now (email ya debe estar procesado por IA)
 *    - Limpia rejectionReason y previousAIResult (se establece JsonNull en la columna JSON)
 * - confirmed = false:
 *    - Construye un snapshot JSON del resultado IA actual (EmailMetadata + Tasks)
 *    - Guarda rejectionReason (si se proporciona)
 *    - Guarda previousAIResult con ese snapshot JSON
 *    - Elimina EmailMetadata (+ cascade elimina Tasks)
 *    - Revierte processedAt/approvedAt a null
 */
export async function confirmAIResults(
  emailId: string,
  confirmed: boolean,
  rejectionReason?: string | null
): Promise<GenericActionResult> {
  try {
    const userId = await requireCurrentUserId();
    const id = SingleEmailIdSchema.parse(emailId);

    // Verificar existencia + cargar metadata y tasks para snapshot
    const existing = await prisma.email.findFirst({
      where: {
        id,
        user: {
          is: {
            id: userId,
          },
        },
      },
      include: {
        metadata: {
          include: { tasks: true },
        },
      } as unknown as Prisma.EmailInclude,
    });

    if (!existing) return { success: false, error: "Email no encontrado" };

    const normalizedReason = rejectionReason?.trim() || null;

    // Construir snapshot JSON solo en caso de rechazo y si existe metadata
    let previousAIResultSnapshot:
      | Prisma.InputJsonValue
      | Prisma.NullableJsonNullValueInput;

    if (!confirmed && existing.metadata) {
      const meta = existing.metadata as SnapshotMetadata;

      previousAIResultSnapshot = {
        category: meta.category,
        priority: meta.priority,
        summary: meta.summary,
        contactName: meta.contactName,
        hasTask: meta.hasTask,
        taskStatus: meta.taskStatus,
        tasks: (meta.tasks ?? []).map((t: SnapshotTask) => ({
          id: t.id,
          description: t.description,
          // Convertir Date a ISO string para que sea JSON válido
          dueDate: t.dueDate ? t.dueDate.toISOString() : null,
          tags: t.tags,
          participants: t.participants,
          status: t.status,
        })),
      } satisfies Prisma.InputJsonValue;
    } else {
      // JsonNull para representar ausencia explícita de snapshot
      previousAIResultSnapshot = Prisma.JsonNull;
    }

    if (confirmed) {
      const updated = await prisma.email.update({
        where: { id },
        data: {
          // processedAt ya se establece al finalizar processEmailsWithAI
          approvedAt: new Date(),
          rejectionReason: null,
          previousAIResult: Prisma.JsonNull,
        },
        include: {
          metadata: {
            include: { tasks: true },
          },
        } as unknown as Prisma.EmailInclude,
      });
      revalidateSafe("/emails");
      revalidateSafe("/kanban");
      return {
        success: true,
        data: updated,
        message: "Resultados IA confirmados y marcados como aprobados",
      };
    } else {
      // Rechazar: guardar snapshot + motivo y revertir a estado "No procesado"
      await prisma.$transaction(async (tx) => {
        await tx.emailMetadata.deleteMany({ where: { emailId: id } });
        await tx.email.update({
          where: { id },
          data: {
            processedAt: null,
            approvedAt: null,
            rejectionReason: normalizedReason,
            previousAIResult: previousAIResultSnapshot,
          },
        });
      });
      revalidateSafe("/emails");
      revalidateSafe("/kanban");
      return {
        success: true,
        message: "Resultados IA rechazados, guardando snapshot previo",
      };
    }
  } catch (error) {
    console.error("confirmAIResults error:", error);
    return { success: false, error: "Error al confirmar/rechazar resultados IA" };
  }
}

/**
 * Marca un conjunto de emails como procesados con processedAt = now
 * (solo emails del usuario actual)
 */
export async function updateProcessedAt(
  emailIds: string[]
): Promise<GenericActionResult> {
  try {
    const userId = await requireCurrentUserId();
    const ids = EmailIdsSchema.parse(emailIds);
    const result = await prisma.email.updateMany({
      where: {
        id: { in: ids },
        user: {
          is: {
            id: userId,
          },
        },
      },
      data: { processedAt: new Date() },
    });
    revalidateSafe("/emails");
    revalidateSafe("/kanban");
    return {
      success: true,
      data: result,
      message: "Emails marcados como procesados",
    };
  } catch (error) {
    console.error("updateProcessedAt error:", error);
    return { success: false, error: "Error al actualizar processedAt" };
  }
}

/**
 * Obtener TODOS los resultados IA pendientes de revisión del usuario actual
 * (processedAt IS NOT NULL y approvedAt IS NULL)
 * Incluye EmailMetadata + Tasks para permitir edición/confirmación
 *
 * HITO 2 (Filtrado Correos No Procesables):
 *  - Solo devuelve emails isProcessable = true.
 *
 * Regla adicional (tarea solicitada):
 *  - Si el email tiene tareas con estado "doing" o "done" en el Kanban,
 *    deja de mostrarse en la página de Revisión IA, aunque approvedAt siga en null.
 */
export async function getPendingAllAIResults(): Promise<GenericActionResult> {
  try {
    const userId = await requireCurrentUserId();

    const where = {
      // Emails ya procesados por IA pero aún no aprobados
      processedAt: { not: null },
      approvedAt: null,
      isProcessable: true,
      // Filtrar por usuario dueño del email
      user: {
        is: {
          id: userId,
        },
      },
      // Deben existir resultados IA a revisar (metadata creada) y
      // sus tareas no pueden estar en "doing" ni "done".
      metadata: {
        is: {
          tasks: {
            none: {
              status: { in: ["doing", "done"] },
            },
          },
        },
      },
    } as unknown as Prisma.EmailWhereInput;

    const data = await prisma.email.findMany({
      where,
      include: {
        metadata: {
          include: { tasks: true },
        },
      } as unknown as Prisma.EmailInclude,
      orderBy: [{ receivedAt: "desc" }],
    });

    return { success: true, data };
  } catch (error) {
    console.error("getPendingAllAIResults error:", error);
    return { success: false, error: "Error al obtener resultados IA pendientes" };
  }
}

/**
 * HITO 4: Confirmar resultados IA (wrapper)
 * - Marca approvedAt = now (publica resultados)
 * - Revalida rutas
 */
export async function confirmProcessingResults(
  emailId: string
): Promise<GenericActionResult> {
  return confirmAIResults(emailId, true);
}

/**
 * HITO 4/HITO 3: Rechazar resultados IA (wrapper con motivo)
 * - Rechaza el resultado IA, guarda snapshot + motivo de rechazo
 * - Revalida rutas
 *
 * Este wrapper se usará desde la UI con el modal de motivos.
 */
export async function rejectProcessingResultsWithReason(
  emailId: string,
  rejectionReason: string
): Promise<GenericActionResult> {
  return confirmAIResults(emailId, false, rejectionReason);
}

/**
 * Wrapper legacy sin motivo (compatibilidad con código existente)
 * - Rechaza el resultado IA pero no guarda un motivo explícito
 *   (rejectionReason queda en null, solo se guarda snapshot si aplica)
 */
export async function rejectProcessingResults(
  emailId: string
): Promise<GenericActionResult> {
  return confirmAIResults(emailId, false);
}
