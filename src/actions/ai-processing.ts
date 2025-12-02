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
import type { EmailAnalysis, EmailInput } from "@/types/ai";
import { Prisma } from "@prisma/client";
import { requireCurrentUserId } from "@/lib/auth-session";
import { calculateConfidenceLevel } from "@/lib/confidence-calculator";
import { logActivity } from "@/lib/activity-logger";
import type { AIProcessingMetadata } from "@/types/activity";

// Precios de OpenAI (verificar actualizaciones periódicamente)
const MODEL_PRICING = {
  "gpt-4o-mini": { 
    prompt: 0.150 / 1_000_000, 
    completion: 0.600 / 1_000_000 
  },
  "gpt-4o": { 
    prompt: 2.50 / 1_000_000, 
    completion: 10.00 / 1_000_000 
  },
};

function calculateAICost(usage: TokenUsage | undefined, model: string): number {
  if (!usage || !usage.promptTokens || !usage.completionTokens) {
    return 0; // Sin costo si no hay usage data
  }
  
  const pricing = MODEL_PRICING[model as keyof typeof MODEL_PRICING] || MODEL_PRICING["gpt-4o-mini"];
  
  const cost = 
    (usage.promptTokens * pricing.prompt) +
    (usage.completionTokens * pricing.completion);
  
  return cost * 100; // Convertir a centavos
}

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

interface EmailUpdateWithReprocessCount {
  processedAt: Date;
  reprocessCount: number;
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
    };

    const [total, data] = await Promise.all([
      prisma.email.count({ where }),
      prisma.email.findMany({
        where,
        include: {
          metadata: {
            include: { tasks: true },
          },
        },
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
 *  - Cálculo y persistencia de AIConfidenceScore
 *  - Manejo de errores granular por email
 *
 *  HITO 2 (Filtrado Correos No Procesables):
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
      },
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

    // Índice rápido EmailInput por id (para usar en cálculo de confianza)
    const inputById: Record<string, EmailInput> = {};
    for (const input of aiInputs) {
      inputById[input.id] = input;
    }

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

    // HITO 3 (tags): Detectar y registrar nuevas etiquetas propuestas por IA
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
            skipDuplicates: true,
          });
        }
      }
    } catch (tagError) {
      console.error("Error al registrar nuevas etiquetas en Tag:", tagError);
      // Importante: no interrumpir el flujo principal de procesamiento
    }

    // Index rápido por ID de email en BD
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

      // Extender temporalmente el email para acceder a campos faltantes en la interfaz TS
      const emailExtended = email as typeof email & { 
        reprocessCount?: number; 
        rejectedAt?: Date | null; 
      };
      
      // Construir EmailInput extendido con reprocessCount para el cálculo
      const baseInput = inputById[emailId] ?? mapEmailToAIInput(email);
      const reprocessCount = emailExtended.reprocessCount ?? 0;
      
      const extendedInput: EmailInput & { reprocessCount: number } = {
        ...baseInput,
        reprocessCount,
      };

      const confidence = calculateConfidenceLevel(extendedInput, analysis, {
        existingTags,
        historicalApprovals: 0,
        knownCategory: undefined,
      });

      try {
        // 1) Transacción: metadata + tasks + contactos + email (estado)
        await prisma.$transaction(async (tx) => {
          // Upsert metadata + tasks
          const mdUpsertArgs = buildEmailMetadataUpsertArgs(email, analysis);
          await tx.emailMetadata.upsert(mdUpsertArgs);

          // Upserts de contactos (remitente + participantes)
          const contactUpserts = buildContactsUpserts(email, analysis);
          for (const args of contactUpserts) {
            await tx.contact.upsert(args);
          }

          // Determinar si se trata de un reprocesamiento (email previamente rechazado)
          const isReprocess =
            email.rejectionReason !== null ||
            email.previousAIResult !== null ||
            emailExtended.rejectedAt !== null;

          // Obtener reprocessCount de forma segura
          const currentReprocessCount = emailExtended.reprocessCount ?? 0;

          const newReprocessCount = isReprocess
            ? currentReprocessCount + 1
            : currentReprocessCount;

          // Marcar email como procesado por IA y actualizar reprocessCount
          await tx.email.update({
            where: { id: email.id },
            data: {
              processedAt: new Date(),
              reprocessCount: newReprocessCount,
            } as EmailUpdateWithReprocessCount, // Campo existe en BD pero no en la interfaz TS actual
          });
        });

        // 2) Upsert de AIConfidenceScore usando SQL directo
        // Usar prisma.$executeRaw para manejar casos donde el modelo no esté en el cliente TS
        try {
          const breakdownJson = JSON.stringify(confidence.signals);
          
          await prisma.$executeRaw`
            INSERT INTO "AIConfidenceScore" (
              "id", "createdAt", "updatedAt", "emailId", "overallScore",
              "clarityScore", "patternMatchScore", "completenessScore",
              "priorityCoherenceScore", "taskValidityScore", "tagsQualityScore",
              "feedbackPenalty", "interpretation", "requiresReview", "reviewPriority",
              "confidenceReason", "breakdown"
            ) VALUES (
              ${crypto.randomUUID()},
              ${new Date()},
              ${new Date()},
              ${email.id},
              ${confidence.overallScore},
              ${confidence.signals.clarityScore},
              ${confidence.signals.patternMatchScore},
              ${confidence.signals.completenessScore},
              ${confidence.signals.priorityCoherenceScore},
              ${confidence.signals.taskValidityScore},
              ${confidence.signals.tagsQualityScore},
              ${confidence.signals.feedbackPenalty},
              ${confidence.interpretation},
              ${confidence.requiresReview},
              ${100 - confidence.overallScore},
              ${confidence.reason},
              ${breakdownJson}::jsonb
            )
            ON CONFLICT ("emailId") DO UPDATE SET
              "updatedAt" = ${new Date()},
              "overallScore" = ${confidence.overallScore},
              "clarityScore" = ${confidence.signals.clarityScore},
              "patternMatchScore" = ${confidence.signals.patternMatchScore},
              "completenessScore" = ${confidence.signals.completenessScore},
              "priorityCoherenceScore" = ${confidence.signals.priorityCoherenceScore},
              "taskValidityScore" = ${confidence.signals.taskValidityScore},
              "tagsQualityScore" = ${confidence.signals.tagsQualityScore},
              "feedbackPenalty" = ${confidence.signals.feedbackPenalty},
              "interpretation" = ${confidence.interpretation},
              "requiresReview" = ${confidence.requiresReview},
              "reviewPriority" = ${100 - confidence.overallScore},
              "confidenceReason" = ${confidence.reason},
              "breakdown" = ${breakdownJson}::jsonb
          `;
        } catch (confidenceError) {
          console.warn("AI confidence score update failed (table may not exist yet):", confidenceError);
          // No fallar si la tabla no existe aún - continuar sin guardar el score
        }

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

    // Registrar actividad en el historial
    try {
      // Calcular costo aproximado
      const estimatedCost = calculateAICost(summary.usage, summary.modelUsed || "gpt-4o-mini")
      
      // Calcular confianza promedio y baja confianza
      const averageConfidence = 75 // TODO: calcular confianza promedio real basada en confidenceScore
      const lowConfidenceCount = 0 // TODO: calcular número real de emails con baja confianza
      
      const metadata: AIProcessingMetadata = {
        totalEmailsProcessed: summary.processed,
        successfulAnalysis: summary.processed,
        failedAnalysis: summary.errors.length,
        tokensUsed: summary.usage ? {
          prompt: summary.usage.promptTokens || 0,
          completion: summary.usage.completionTokens || 0,
          total: summary.usage.totalTokens || 0,
        } : {
          prompt: 0,
          completion: 0,
          total: 0,
        },
        model: summary.modelUsed || "gpt-4o-mini",
        averageConfidence: Math.round(averageConfidence),
        lowConfidenceCount,
        errors: summary.errors.slice(0, 5).map(err => ({
          emailId: err.emailId,
          subject: "Email processing failed", // TODO: obtener subject real del email si es necesario
          error: err.error
        }))
      }

      // Determinar estado de la actividad
      let activityStatus: "success" | "partial_success" | "error" = "error"
      if (summary.errors.length === 0 && summary.processed > 0) {
        activityStatus = "success"
      } else if (summary.processed > 0) {
        activityStatus = "partial_success"
      }

      await logActivity({
        userId,
        activityType: "ai_processing",
        status: activityStatus,
        description: `Procesados ${summary.processed} emails con IA (confianza promedio: ${Math.round(averageConfidence)}%)`,
        metadata,
        estimatedCost,
        relatedEmailIds: emailIds,
      })
    } catch (activityError) {
      console.error("Error al registrar actividad de procesamiento IA:", activityError)
      // No interrumpir el flujo principal si falla el logging
    }

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
        processedAt: { not: null },
        approvedAt: null,
        isProcessable: true,
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
        confidenceScore: true,
      },
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
 */
export async function confirmAIResults(
  emailId: string,
  confirmed: boolean,
  rejectionReason?: string | null
): Promise<GenericActionResult> {
  try {
    const userId = await requireCurrentUserId();
    const id = SingleEmailIdSchema.parse(emailId);

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
      },
    });

    if (!existing) return { success: false, error: "Email no encontrado" };

    const normalizedReason = rejectionReason?.trim() || null;

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
          dueDate: t.dueDate ? t.dueDate.toISOString() : null,
          tags: t.tags,
          participants: t.participants,
          status: t.status,
        })),
      } satisfies Prisma.InputJsonValue;
    } else {
      previousAIResultSnapshot = Prisma.JsonNull;
    }

    if (confirmed) {
      const updated = await prisma.email.update({
        where: { id },
        data: {
          approvedAt: new Date(),
          rejectionReason: null,
          previousAIResult: Prisma.JsonNull,
          rejectedAt: null,
        },
        include: {
          metadata: {
            include: { tasks: true },
          },
        },
      });
      revalidateSafe("/emails");
      revalidateSafe("/kanban");
      return {
        success: true,
        data: updated,
        message: "Resultados IA confirmados y marcados como aprobados",
      };
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.emailMetadata.deleteMany({ where: { emailId: id } });
        await tx.email.update({
          where: { id },
          data: {
            processedAt: null,
            approvedAt: null,
            rejectionReason: normalizedReason,
            previousAIResult: previousAIResultSnapshot,
            rejectedAt: new Date(),
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
 * Obtener TODOS los resultados IA pendientes de revisión del usuario actual.
 */
export async function getPendingAllAIResults(): Promise<GenericActionResult> {
  try {
    const userId = await requireCurrentUserId();

    const where = {
      processedAt: { not: null },
      approvedAt: null,
      isProcessable: true,
      user: {
        is: {
          id: userId,
        },
      },
      metadata: {
        is: {
          tasks: {
            none: {
              status: { in: ["doing", "done"] },
            },
          },
        },
      },
    };

    const data = await prisma.email.findMany({
      where,
      include: {
        metadata: {
          include: { tasks: true },
        },
        confidenceScore: true,
      },
      orderBy: [
        { confidenceScore: { reviewPriority: "desc" } },
        { receivedAt: "desc" },
      ],
    });

    return { success: true, data };
  } catch (error) {
    console.error("getPendingAllAIResults error:", error);
    return { success: false, error: "Error al obtener resultados IA pendientes" };
  }
}

/**
 * HITO 4: Confirmar resultados IA (wrapper)
 */
export async function confirmProcessingResults(
  emailId: string
): Promise<GenericActionResult> {
  return confirmAIResults(emailId, true);
}

/**
 * HITO 4/HITO 3: Rechazar resultados IA (wrapper con motivo)
 */
export async function rejectProcessingResultsWithReason(
  emailId: string,
  rejectionReason: string
): Promise<GenericActionResult> {
  return confirmAIResults(emailId, false, rejectionReason);
}

/**
 * Wrapper legacy sin motivo (compatibilidad con código existente)
 */
export async function rejectProcessingResults(
  emailId: string
): Promise<GenericActionResult> {
  return confirmAIResults(emailId, false);
}
