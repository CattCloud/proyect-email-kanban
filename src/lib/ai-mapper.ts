import type { Prisma, Email, EmailMetadata, Task as PrismaTask } from "@prisma/client";
import type { EmailAnalysis, EmailInput } from "@/types/ai";

/**
 * AI Mapper
 * - Convierte Email (DB) → EmailInput (AI)
 * - Convierte EmailAnalysis (IA) → Mutaciones Prisma (EmailMetadata + Task[])
 * - Utilidades para normalización y seguridad de datos
 *
 * Nota de compatibilidad:
 *   Aún existe compatibilidad con EmailMetadata.hasTask, taskDescription y taskStatus
 *   para no romper UI/Server Actions existentes. Se setean coherentemente a partir de tasks IA.
 */

// ==================== Email DB → EmailInput (para OpenAI) ====================

export function mapEmailToAIInput(email: Email): EmailInput {
  return {
    id: email.id, // Usamos el ID interno para trazabilidad exacta al guardar resultados
    email: email.from,
    received_at: email.receivedAt.toISOString(),
    subject: email.subject,
    body: email.body,
  };
}

// ==================== EmailAnalysis (IA) → Prisma Mutations ====================

/**
 * Normaliza arrays garantizando máximo de elementos y sin duplicados
 */
function normalizeStringArray(values: string[] | undefined | null, max: number): string[] {
  if (!values || values.length === 0) return [];
  const set = new Set<string>();
  for (const v of values) {
    const s = String(v).trim();
    if (s.length > 0) set.add(s);
    if (set.size >= max) break;
  }
  return Array.from(set);
}

/**
 * Determina hasTask, taskDescription y taskStatus a partir de las tasks IA (compatibilidad)
 */
function deriveLegacyTaskFields(analysis: EmailAnalysis): Pick<EmailMetadata, "hasTask" | "taskDescription" | "taskStatus"> {
  const hasTasks = Array.isArray(analysis.tasks) && analysis.tasks.length > 0;
  return {
    hasTask: hasTasks,
    taskDescription: hasTasks ? analysis.tasks[0]?.description ?? null : null,
    // Para compatibilidad inicial, toda nueva extracción queda como "todo"
    taskStatus: hasTasks ? "todo" : null,
  };
}

/**
 * Construye la estructura de creación/actualización de tareas relacionadas
 * - En update: se borra y re-crea para mantener consistencia con la última corrida de IA
 */
function buildTasksNestedWrites(analysis: EmailAnalysis): {
  deleteMany?: Prisma.TaskScalarWhereInput[] | Prisma.TaskWhereInput | Record<string, never>;
  create: Prisma.TaskCreateWithoutEmailMetadataInput[];
} {
  const tasks = (analysis.tasks ?? []).map((t): Prisma.TaskCreateWithoutEmailMetadataInput => ({
    description: t.description,
    dueDate: t.due_date ? new Date(t.due_date) : null,
    tags: normalizeStringArray(t.tags, 3),
    participants: normalizeStringArray(t.participants, 20),
    // estado por defecto
    status: "todo",
  }));

  return {
    deleteMany: {}, // elimina todas las tasks actuales del EmailMetadata en update
    create: tasks,
  };
}

/**
 * Construye args de upsert para EmailMetadata + Tasks anidadas
 * - Usa email.id como emailId FK
 * - Agrega category, priority, summary, contactName
 * - Mantiene compatibilidad de campos legacy (hasTask, taskDescription, taskStatus)
 */
export function buildEmailMetadataUpsertArgs(
  email: Email,
  analysis: EmailAnalysis
): Parameters<Prisma.EmailMetadataDelegate["upsert"]>[0] {
  const legacy = deriveLegacyTaskFields(analysis);
  const tasksNested = buildTasksNestedWrites(analysis);

  return {
    where: { emailId: email.id },
    create: {
      emailId: email.id,
      category: analysis.category,
      priority: analysis.priority,
      summary: analysis.summary,
      contactName: analysis.contact_name,
      hasTask: legacy.hasTask,
      taskDescription: legacy.taskDescription,
      taskStatus: legacy.taskStatus,
      tasks: {
        create: tasksNested.create,
      },
    },
    update: {
      category: analysis.category,
      priority: analysis.priority,
      summary: analysis.summary,
      contactName: analysis.contact_name,
      hasTask: legacy.hasTask,
      taskDescription: legacy.taskDescription,
      taskStatus: legacy.taskStatus,
      tasks: tasksNested, // deleteMany + create
    },
  };
}

/**
 * Construye upserts de Contact:
 * - Contact principal (remitente): email.from + analysis.contact_name
 * - Contacts para cada participant de cada task (sin nombre si no está disponible)
 */
export function buildContactsUpserts(
  email: Email,
  analysis: EmailAnalysis
): Array<Parameters<Prisma.ContactDelegate["upsert"]>[0]> {
  const upserts: Array<Parameters<Prisma.ContactDelegate["upsert"]>[0]> = [];

  // Remitente
  const senderUpsert: Parameters<Prisma.ContactDelegate["upsert"]>[0] = {
    where: { email: email.from },
    update: {
      // si ya existe, solamente actualizamos name si viene algo nuevo útil
      name: analysis.contact_name || undefined,
    },
    create: {
      email: email.from,
      name: analysis.contact_name || null,
    },
  };
  upserts.push(senderUpsert);

  // Participants de tareas
  const participantSet = new Set<string>();
  for (const t of analysis.tasks ?? []) {
    for (const p of t.participants ?? []) {
      const pe = String(p).trim();
      if (pe.length > 0) participantSet.add(pe);
    }
  }
  for (const pemail of participantSet) {
    // Evitar duplicar el remitente en participants
    if (pemail.toLowerCase() === email.from.toLowerCase()) continue;
    upserts.push({
      where: { email: pemail },
      update: {}, // no tenemos nombre aquí
      create: { email: pemail, name: null },
    });
  }

  return upserts;
}

/**
 * Helper para dividir por lotes seguros (e.g., 10 elementos)
 */
export function chunkArray<T>(arr: T[], size: number): T[][] {
  const res: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    res.push(arr.slice(i, i + size));
  }
  return res;
}