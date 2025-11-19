"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  KanbanTask,
  KanbanTasksResult,
  KanbanContact,
  KanbanContactsResult,
  TaskStatus,
} from "@/types";
import { requireCurrentUserId } from "@/lib/auth-session";

/**
 * Hito Semana 4 + Asociación por usuario
 * Server Actions específicas para:
 * - Obtener tareas filtradas por contacto(s), estado y usuario actual
 * - Obtener contactos para el selector del Kanban (solo del usuario actual)
 * - Actualizar el estado de una tarea (todo, doing, done) del usuario actual
 *
 * Requisitos:
 * - Sin romper compatibilidad con el Kanban actual (basado en EmailMetadata.taskStatus)
 * - Preparado para múltiples tareas por email (modelo Task)
 * - Aislar datos por userId (multiusuario básico)
 */

// ========================= Schemas =========================

const TaskStatusSchema = z.enum(["todo", "doing", "done"]);

const KanbanFilterSchema = z.object({
  /**
   * Lista opcional de IDs de Contact seleccionados.
   * Si se proporciona, se mapean a sus emails para filtrar tareas.
   */
  contactIds: z.array(z.string().min(1)).optional(),
  /**
   * Lista opcional de emails de contacto seleccionados.
   * Se combinan con los derivados de contactIds.
   */
  contactEmails: z.array(z.string().email()).optional(),
  /**
   * Estados opcionales a filtrar.
   * Si no se especifican, se devuelven tareas en cualquier estado.
   */
  statuses: z.array(TaskStatusSchema).optional(),
});

const UpdateTaskStatusSchema = z.object({
  taskId: z.string().min(1, "ID de tarea requerido"),
  status: TaskStatusSchema,
});

type GetKanbanTasksInput = z.infer<typeof KanbanFilterSchema>;
type UpdateTaskStatusInput = z.infer<typeof UpdateTaskStatusSchema>;

// ========================= Tipos internos =========================

/**
 * Proyección mínima de Task + EmailMetadata + Email necesaria para el Kanban.
 */
interface TaskWithEmailAndMetadata {
  id: string;
  description: string;
  status: string;
  dueDate: Date | null;
  tags: string[];
  participants: string[];
  createdAt: Date;
  userId: string;
  emailMetadata: {
    id: string;
    emailId: string;
    category: string | null;
    priority: string | null;
    email: {
      id: string;
      subject: string;
      from: string;
      processedAt: Date | null;
      approvedAt: Date | null;
      userId: string;
    };
  };
}

interface ContactSnapshot {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
}

/**
 * Resultado estándar de operaciones sobre una única tarea Kanban.
 */
export interface KanbanTaskOperationResult {
  success: boolean;
  data?: KanbanTask;
  error?: string;
  message?: string;
}

// ========================= Helpers =========================

function revalidateKanbanPaths(): void {
  try {
    revalidatePath("/kanban");
  } catch {
    // Evitar que un fallo de revalidación rompa la acción (tests/CLI)
  }

  try {
    revalidatePath("/dashboard");
  } catch {
    // No crítico
  }

  try {
    revalidatePath("/emails");
  } catch {
    // No crítico
  }
}

function mapTaskToKanbanTask(
  task: TaskWithEmailAndMetadata,
  contact?: ContactSnapshot
): KanbanTask {
  const email = task.emailMetadata.email;
  const status = task.status as TaskStatus;

  return {
    id: task.id,
    description: task.description,
    status,
    dueDate: task.dueDate,
    tags: task.tags,
    participants: task.participants,
    createdAt: task.createdAt,
    emailId: email.id,
    emailSubject: email.subject,
    emailFrom: email.from,
    contactId: contact?.id ?? null,
    contactName: contact?.name ?? null,
    contactEmail: contact?.email ?? email.from,
    // Enriquecimiento visual
    category: task.emailMetadata.category,
    priority: task.emailMetadata.priority,
    approvedAt: email.approvedAt,
  };
}

// ========================= Server Actions =========================

/**
 * Obtiene tareas para el Kanban por contacto, filtradas por:
 * - Uno o varios contactos (por Contact.id y/o email)
 * - Estado(s) de tarea (todo, doing, done)
 * - userId del usuario autenticado
 *
 * Reglas:
 * - Solo considera tareas cuyos emails estén procesados por IA (processedAt != null)
 * - Mantiene compatibilidad con el modelo actual basado en EmailMetadata
 */
export async function getKanbanTasks(
  rawInput?: GetKanbanTasksInput
): Promise<KanbanTasksResult> {
  try {
    const userId = await requireCurrentUserId();
    const input = KanbanFilterSchema.parse(rawInput ?? {});

    // 1) Resolver filtro de contactos a lista de emails
    let contactEmailsFilter: string[] | undefined;

    if (input.contactIds && input.contactIds.length > 0) {
      const contacts = await prisma.contact.findMany({
        where: { id: { in: input.contactIds } },
      });

      const emailsFromIds = contacts.map((c) => c.email);
      const fromExplicit = input.contactEmails ?? [];

      contactEmailsFilter = Array.from(
        new Set<string>([...emailsFromIds, ...fromExplicit])
      );
    } else if (input.contactEmails && input.contactEmails.length > 0) {
      contactEmailsFilter = input.contactEmails;
    }

    // 2) Construir where para Task
    type TaskWhere = Prisma.TaskWhereInput;

    const statusFilter: TaskWhere =
      input.statuses && input.statuses.length > 0
        ? { status: { in: input.statuses } }
        : {};

    const emailFilterBase: Prisma.EmailWhereInput = {
      processedAt: { not: null },
      userId,
    } as Prisma.EmailWhereInput;

    const emailFilter: Prisma.EmailWhereInput =
      contactEmailsFilter && contactEmailsFilter.length > 0
        ? {
            ...emailFilterBase,
            from: { in: contactEmailsFilter },
          }
        : emailFilterBase;

    const where: TaskWhere = {
      userId,
      ...statusFilter,
      emailMetadata: {
        email: emailFilter,
      },
    };

    // 3) Ejecutar query principal de tareas
    const tasks = (await prisma.task.findMany({
      where,
      include: {
        emailMetadata: {
          include: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })) as TaskWithEmailAndMetadata[];

    if (tasks.length === 0) {
      return { success: true, data: [] };
    }

    // 4) Cargar contactos relacionados en un solo query (evitar N+1)
    const uniqueEmails = Array.from(
      new Set(tasks.map((t) => t.emailMetadata.email.from))
    );

    const contactsRaw = uniqueEmails.length
      ? await prisma.contact.findMany({
          where: { email: { in: uniqueEmails } },
        })
      : [];

    const contactByEmail = new Map<string, ContactSnapshot>(
      contactsRaw.map((c) => [
        c.email,
        {
          id: c.id,
          name: c.name,
          email: c.email,
          createdAt: c.createdAt,
        },
      ])
    );

    // 5) Mapear a modelo de Kanban
    const data: KanbanTask[] = tasks.map((task) => {
      const emailFrom = task.emailMetadata.email.from;
      const contact = contactByEmail.get(emailFrom);
      return mapTaskToKanbanTask(task, contact);
    });

    return { success: true, data };
  } catch (error) {
    console.error("getKanbanTasks error:", error);
    return {
      success: false,
      error: "Error al obtener tareas para el Kanban",
    };
  }
}

/**
 * Obtiene contactos relevantes para el selector del Kanban
 * del usuario autenticado.
 *
 * Estrategia:
 * - Parte de las tareas del usuario actual en la tabla Task
 * - Solo devuelve contactos que tienen al menos una tarea asociada
 *   (via Email.from = Contact.email)
 * - Incluye contadores de tareas por estado
 */
export async function getKanbanContacts(): Promise<KanbanContactsResult> {
  try {
    const userId = await requireCurrentUserId();

    // 1) Cargar todas las tareas del usuario con su email
    const tasks = (await prisma.task.findMany({
      where: { userId },
      include: {
        emailMetadata: {
          include: {
            email: true,
          },
        },
      },
    })) as TaskWithEmailAndMetadata[];

    if (tasks.length === 0) {
      return { success: true, data: [] };
    }

    // 2) Agrupar por email de remitente
    interface Counters {
      total: number;
      todo: number;
      doing: number;
      done: number;
    }

    const countersByEmail = new Map<string, Counters>();

    for (const task of tasks) {
      const emailFrom = task.emailMetadata.email.from;
      const current =
        countersByEmail.get(emailFrom) ?? {
          total: 0,
          todo: 0,
          doing: 0,
          done: 0,
        };

      current.total += 1;
      if (task.status === "todo") current.todo += 1;
      else if (task.status === "doing") current.doing += 1;
      else if (task.status === "done") current.done += 1;

      countersByEmail.set(emailFrom, current);
    }

    const emails = Array.from(countersByEmail.keys());

    // 3) Cargar contactos asociados a esos emails
    const contactsRaw = await prisma.contact.findMany({
      where: { email: { in: emails } },
      orderBy: [{ name: "asc" }, { email: "asc" }],
    });

    const contactByEmail = new Map<string, ContactSnapshot>(
      contactsRaw.map((c) => [
        c.email,
        {
          id: c.id,
          name: c.name,
          email: c.email,
          createdAt: c.createdAt,
        },
      ])
    );

    // 4) Construir KanbanContact solo para contactos con tareas
    const data: KanbanContact[] = emails
      .map((email) => {
        const counters = countersByEmail.get(email);
        if (!counters) {
          return null;
        }

        const contact = contactByEmail.get(email);

        const base: KanbanContact = {
          id: contact?.id ?? email,
          name: contact?.name ?? null,
          email,
          createdAt: contact?.createdAt ?? new Date(0),
          totalTasks: counters.total,
          todoTasks: counters.todo,
          doingTasks: counters.doing,
          doneTasks: counters.done,
        };

        return base;
      })
      .filter(
        (c): c is KanbanContact =>
          c !== null && c.totalTasks !== undefined && c.totalTasks > 0
      );

    return { success: true, data };
  } catch (error) {
    console.error("getKanbanContacts error:", error);
    return {
      success: false,
      error: "Error al obtener contactos para el Kanban",
    };
  }
}

/**
 * Actualiza el estado de una tarea del Kanban (todo, doing, done)
 * del usuario autenticado.
 *
 * Reglas:
 * - Valida entrada con Zod
 * - Verifica existencia de la tarea y que pertenece al usuario
 * - Actualiza Task.status
 * - Sincroniza EmailMetadata.taskStatus para compatibilidad con la UI actual
 * - Revalida rutas Kanban, Dashboard y Emails
 */
export async function updateKanbanTaskStatus(
  rawInput: UpdateTaskStatusInput
): Promise<KanbanTaskOperationResult> {
  try {
    const userId = await requireCurrentUserId();
    const input = UpdateTaskStatusSchema.parse(rawInput);

    // 1) Verificar que la tarea existe y cargar email relacionado
    const existing = (await prisma.task.findUnique({
      where: { id: input.taskId },
      include: {
        emailMetadata: {
          include: {
            email: true,
          },
        },
      },
    })) as TaskWithEmailAndMetadata | null;

    if (!existing || !existing.emailMetadata) {
      return {
        success: false,
        error: "Tarea no encontrada",
      };
    }

    // Asegurar que la tarea pertenece al usuario actual
    if (existing.userId !== userId || existing.emailMetadata.email.userId !== userId) {
      return {
        success: false,
        error: "No tienes permiso para actualizar esta tarea",
      };
    }

    let updatedTask: TaskWithEmailAndMetadata;

    // 2) Transacción: actualizar Task.status y EmailMetadata.taskStatus
    await prisma.$transaction(async (tx) => {
      // Actualizar estado de la tarea
      updatedTask = (await tx.task.update({
        where: { id: input.taskId },
        data: {
          status: input.status,
        },
        include: {
          emailMetadata: {
            include: {
              email: true,
            },
          },
        },
      })) as TaskWithEmailAndMetadata;

      // Sincronizar campo legacy taskStatus en EmailMetadata
      await tx.emailMetadata.update({
        where: { id: existing.emailMetadata.id },
        data: {
          taskStatus: input.status,
          hasTask: true,
          taskDescription: existing.description,
        },
      });
    });

    // 3) Cargar contacto asociado (si existe)
    const emailFrom = existing.emailMetadata.email.from;
    const contact = await prisma.contact.findUnique({
      where: { email: emailFrom },
    });

    const contactSnapshot: ContactSnapshot | undefined = contact
      ? {
          id: contact.id,
          name: contact.name,
          email: contact.email,
          createdAt: contact.createdAt,
        }
      : undefined;

    const kanbanTask = mapTaskToKanbanTask(updatedTask!, contactSnapshot);

    // 4) Revalidar vistas relacionadas
    revalidateKanbanPaths();

    return {
      success: true,
      data: kanbanTask,
      message: "Estado de la tarea actualizado correctamente",
    };
  } catch (error) {
    console.error("updateKanbanTaskStatus error:", error);
    return {
      success: false,
      error: "Error al actualizar el estado de la tarea",
    };
  }
}