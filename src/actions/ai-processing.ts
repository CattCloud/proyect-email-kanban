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

// ========================= Server Actions =========================

/**
 * Devuelve emails no procesados (processedAt IS NULL) con orden:
 *  - receivedAt desc
 *  - createdAt desc
 * Paginado (page, pageSize)
 */
export async function getUnprocessedEmails(page = 1, pageSize = 10): Promise<PagedEmailsResult> {
  try {
    const { page: p, pageSize: ps } = PaginationSchema.parse({ page, pageSize });

    const [total, data] = await Promise.all([
      prisma.email.count({
        where: { processedAt: null },
      }),
      prisma.email.findMany({
        where: { processedAt: null },
        include: { metadata: { include: { tasks: true } } },
        orderBy: [{ receivedAt: "desc" }, { createdAt: "desc" }],
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
 * Procesa emails con IA (máximo 10):
 *  - Obtiene emails por IDs
 *  - Llama a OpenAI (batch)
 *  - Valida y mapea resultados
 *  - Upsert de EmailMetadata + Tasks + Contact
 *  - Manejo de errores granular por email
 */
export async function processEmailsWithAI(emailIds: string[]): Promise<ProcessEmailsSummary> {
  const summary: ProcessEmailsSummary = {
    success: false,
    processed: 0,
    errors: [],
  };

  try {
    const ids = EmailIdsSchema.parse(emailIds);

    // Cargar emails desde BD
    const emails = await prisma.email.findMany({
      where: { id: { in: ids } },
    });

    if (emails.length === 0) {
      return {
        ...summary,
        success: false,
        processed: 0,
        errors: [{ emailId: "-", error: "No se encontraron emails" }],
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
        const existingNormalizedSet = new Set(existingTagRows.map((t) => t.descripcion));

        const newTags = normalizedList.filter((t) => !existingNormalizedSet.has(t));

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

    // Index rápido por ID de email en BD
    const emailById = new Map(emails.map((e) => [e.id, e]));

    // Procesar cada análisis devuelto por IA de forma independiente (manejo granular)
    for (const analysis of aiResult.analyses as EmailAnalysis[]) {
      const emailId = analysis.email_id;
      const email = emailById.get(emailId);
      if (!email) {
        summary.errors.push({ emailId, error: "Análisis no coincide con un email existente" });
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
    summary.errors.push({ emailId: "-", error: "Error general de procesamiento" });
    return summary;
  }
}

/**
 * Obtiene resultados IA pendientes de revisión:
 *  - Emails con processedAt === null
 *  *  - Incluye EmailMetadata + Tasks (recientemente generados)
 *  *  - Filtra por IDs específicos
 *  */
export async function getPendingAIResults(emailIds: string[]): Promise<GenericActionResult> {
  try {
    const ids = EmailIdsSchema.parse(emailIds);

    const data = await prisma.email.findMany({
      where: {
        id: { in: ids },
        // Emails ya procesados por IA pero aún no aprobados
        processedAt: { not: null },
        approvedAt: null,
      },
      include: {
        metadata: {
          include: { tasks: true },
        },
      },
      orderBy: [{ receivedAt: "desc" }, { createdAt: "desc" }],
    });

    return { success: true, data };
  } catch (error) {
    console.error("getPendingAIResults error:", error);
    return { success: false, error: "Error al obtener resultados IA pendientes" };
  }
}

/**
 * Confirma o rechaza resultados IA de un email.
 *  - confirmed = true: marca approvedAt = now (email ya debe estar procesado por IA)
 *  - confirmed = false: elimina EmailMetadata (+ cascade elimina Tasks) y revierte processedAt/approvedAt a null
 */
export async function confirmAIResults(
  emailId: string,
  confirmed: boolean
): Promise<GenericActionResult> {
  try {
    const id = SingleEmailIdSchema.parse(emailId);

    // Verificar existencia
    const existing = await prisma.email.findUnique({
      where: { id },
      include: { metadata: true },
    });

    if (!existing) return { success: false, error: "Email no encontrado" };

    if (confirmed) {
      const updated = await prisma.email.update({
        where: { id },
        data: {
          // processedAt ya se establece al finalizar processEmailsWithAI
          approvedAt: new Date(),
        },
        include: { metadata: { include: { tasks: true } } },
      });
      revalidateSafe("/emails");
      revalidateSafe("/kanban");
      return {
        success: true,
        data: updated,
        message: "Resultados IA confirmados y marcados como aprobados",
      };
    } else {
      // Rechazar: eliminar metadata (tasks en cascade) y revertir a estado "No procesado"
      await prisma.$transaction(async (tx) => {
        await tx.emailMetadata.deleteMany({ where: { emailId: id } });
        await tx.email.update({
          where: { id },
          data: {
            processedAt: null,
            approvedAt: null,
          },
        });
      });
      revalidateSafe("/emails");
      revalidateSafe("/kanban");
      return { success: true, message: "Resultados IA rechazados y limpiados" };
    }
  } catch (error) {
    console.error("confirmAIResults error:", error);
    return { success: false, error: "Error al confirmar/rechazar resultados IA" };
  }
}

/**
 * Marca un conjunto de emails como procesados con processedAt = now
 */
export async function updateProcessedAt(emailIds: string[]): Promise<GenericActionResult> {
  try {
    const ids = EmailIdsSchema.parse(emailIds);
    const result = await prisma.email.updateMany({
      where: { id: { in: ids } },
      data: { processedAt: new Date() },
    });
    revalidateSafe("/emails");
    revalidateSafe("/kanban");
    return { success: true, data: result, message: "Emails marcados como procesados" };
  } catch (error) {
    console.error("updateProcessedAt error:", error);
    return { success: false, error: "Error al actualizar processedAt" };
  }
}

/**
 * HITO 4: Obtener TODOS los resultados IA pendientes de revisión (processedAt IS NULL)
 * Incluye EmailMetadata + Tasks para permitir edición/confirmación
 */
export async function getPendingAllAIResults(): Promise<GenericActionResult> {
  try {
    const data = await prisma.email.findMany({
      where: {
        // Emails ya procesados por IA pero aún no aprobados
        processedAt: { not: null },
        approvedAt: null,
        // Deben existir resultados IA a revisar (metadata creada)
        metadata: { isNot: null },
      },
      include: {
        metadata: {
          include: { tasks: true },
        },
      },
      orderBy: [{ receivedAt: "desc" }, { createdAt: "desc" }],
    });
    return { success: true, data };
  } catch (error) {
    console.error("getPendingAllAIResults error:", error);
    return { success: false, error: "Error al obtener resultados IA pendientes" };
  }
}

/**
 * HITO 4: Confirmar resultados IA (wrapper)
 * - Marca processedAt = now (publica resultados)
 * - Revalida rutas
 */
export async function confirmProcessingResults(emailId: string): Promise<GenericActionResult> {
  return confirmAIResults(emailId, true);
}

/**
 * HITO 4: Rechazar resultados IA (wrapper)
 * - Elimina EmailMetadata (+ cascade Tasks), mantiene processedAt = null
 * - Revalida rutas
 */
export async function rejectProcessingResults(emailId: string): Promise<GenericActionResult> {
  return confirmAIResults(emailId, false);
}