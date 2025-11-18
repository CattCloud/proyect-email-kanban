/* eslint-disable no-console */
import { prisma } from "@/lib/prisma";
import {
  getKanbanTasks,
  getKanbanContacts,
  updateKanbanTaskStatus,
  type KanbanTaskOperationResult,
} from "@/actions/kanban";
import type { Email, EmailMetadata, Task, Contact } from "@prisma/client";

/**
 * Tests básicos (sin framework) para las Server Actions de Kanban por contacto.
 *
 * Cubre:
 * - getKanbanTasks: sin filtros, por contacto y por estado
 * - getKanbanContacts: contactos con contadores de tareas
 * - updateKanbanTaskStatus: actualización de estado + sincronización EmailMetadata.taskStatus
 */

// Utilidad simple de aserción
function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

interface KanbanTestData {
  contacts: Contact[];
  emails: Email[];
  metadata: EmailMetadata[];
  tasks: Task[];
}

// Crea datos mínimos para probar Kanban por contacto
async function createKanbanTestData(): Promise<KanbanTestData> {
  const unique = `kanban-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

  const contacts: Contact[] = [];
  const emails: Email[] = [];
  const metadata: EmailMetadata[] = [];
  const tasks: Task[] = [];

  for (let i = 0; i < 2; i++) {
    const emailAddress = `kanban-contact-${i}-${unique}@example.com`;

    // Contact
    const contact = await prisma.contact.upsert({
      where: { email: emailAddress },
      create: {
        email: emailAddress,
        name: `Contacto Kanban ${i}`,
      },
      update: {},
    });
    contacts.push(contact);

    // Email (procesado por IA para que entre en el filtro processedAt != null)
    const email = await prisma.email.create({
      data: {
        idEmail: `kanban-email-${i}-${unique}`,
        from: emailAddress,
        subject: `Asunto Kanban ${i}`,
        body: `Cuerpo del email de prueba para Kanban (${i}).`,
        receivedAt: new Date(Date.now() - (i + 1) * 60000),
        processedAt: new Date(),
        approvedAt: null,
      },
    });
    emails.push(email);

    // EmailMetadata (legacy) con hasTask = true
    const md = await prisma.emailMetadata.create({
      data: {
        emailId: email.id,
        category: i === 0 ? "cliente" : "lead",
        priority: i === 0 ? "alta" : "media",
        summary: `Resumen IA Kanban ${i}`,
        contactName: contact.name,
        hasTask: true,
        taskDescription: `Tarea principal Kanban ${i}`,
        taskStatus: "todo",
      },
    });
    metadata.push(md);

    // Crear 2 tareas por email con distintos estados
    const t1 = await prisma.task.create({
      data: {
        emailMetadataId: md.id,
        description: `Primera tarea Kanban para ${emailAddress}`,
        status: "todo",
        dueDate: null,
        tags: ["kanban", "test"],
        participants: [emailAddress],
      },
    });
    const t2 = await prisma.task.create({
      data: {
        emailMetadataId: md.id,
        description: `Segunda tarea Kanban para ${emailAddress}`,
        status: i === 0 ? "doing" : "done",
        dueDate: null,
        tags: ["kanban"],
        participants: [emailAddress],
      },
    });

    tasks.push(t1, t2);
  }

  return { contacts, emails, metadata, tasks };
}

// Limpieza de datos de prueba
async function cleanupKanbanTestData(data: KanbanTestData): Promise<void> {
  // Eliminar emails (cascade elimina EmailMetadata y Task)
  for (const e of data.emails) {
    try {
      await prisma.email.delete({ where: { id: e.id } });
    } catch {
      // noop
    }
  }

  // Eliminar contactos
  for (const c of data.contacts) {
    try {
      await prisma.contact.delete({ where: { id: c.id } });
    } catch {
      // noop
    }
  }
}

// Test principal de flujo de Server Actions de Kanban
async function test_kanban_actions_flow(): Promise<void> {
  console.info("[KANBAN] Iniciando tests básicos de Server Actions (HITO 1)");

  const data = await createKanbanTestData();
  const [c1] = data.contacts;

  // 1) getKanbanTasks sin filtros
  {
    const res = await getKanbanTasks();
    console.log("[KANBAN] getKanbanTasks() sin filtros →", {
      success: res.success,
      count: res.data?.length ?? 0,
    });

    assert(res.success, "getKanbanTasks debe retornar success=true");
    assert(Array.isArray(res.data), "getKanbanTasks.data debe ser array");
    assert(
      (res.data as unknown[]).length >= data.tasks.length,
      "getKanbanTasks.data debe contener al menos las tareas de prueba"
    );
  }

  // 2) getKanbanTasks filtrado por email de contacto + estado
  {
    const res = await getKanbanTasks({
      contactEmails: [c1.email],
      statuses: ["todo"],
    });

    console.log("[KANBAN] getKanbanTasks({ contactEmails: [c1.email], statuses: ['todo'] }) →", {
      success: res.success,
      count: res.data?.length ?? 0,
    });

    assert(res.success, "getKanbanTasks filtrado debe retornar success=true");
    assert(
      res.data && res.data.length > 0,
      "getKanbanTasks filtrado debe devolver al menos una tarea"
    );
    for (const t of res.data!) {
      assert(
        t.contactEmail === c1.email,
        "Todas las tareas filtradas deben pertenecer al contacto c1"
      );
      assert(
        t.status === "todo",
        "Todas las tareas filtradas deben estar en estado 'todo'"
      );
    }
  }

  // 3) getKanbanContacts y validación de contadores
  {
    const res = await getKanbanContacts();
    console.log("[KANBAN] getKanbanContacts() →", {
      success: res.success,
      count: res.data?.length ?? 0,
    });

    assert(res.success, "getKanbanContacts debe retornar success=true");
    assert(Array.isArray(res.data), "getKanbanContacts.data debe ser array");
    assert(
      (res.data as unknown[]).length >= data.contacts.length,
      "Debe haber al menos tantos contactos en el selector como contactos de prueba"
    );

    const selectorContact = res.data!.find((c) => c.email === c1.email);
    assert(
      !!selectorContact,
      "El contacto c1 debe aparecer en el selector de Kanban"
    );
    assert(
      (selectorContact!.totalTasks ?? 0) >= 1,
      "El contacto c1 debe tener al menos una tarea asociada"
    );
  }

  // 4) updateKanbanTaskStatus: cambiar una tarea de 'todo' a 'doing'
  {
    const taskToUpdate = data.tasks.find((t) => t.status === "todo");
    assert(!!taskToUpdate, "Debe existir al menos una tarea en estado 'todo' para actualizar");

    const result: KanbanTaskOperationResult = await updateKanbanTaskStatus({
      taskId: taskToUpdate!.id,
      status: "doing",
    });

    console.log("[KANBAN] updateKanbanTaskStatus →", result);

    assert(result.success, "updateKanbanTaskStatus debe retornar success=true");
    assert(
      result.data?.status === "doing",
      "La tarea retornada debe tener estado 'doing'"
    );

    // Verificar en base de datos
    const dbTask = await prisma.task.findUnique({
      where: { id: taskToUpdate!.id },
      include: {
        emailMetadata: true,
      },
    });

    assert(dbTask?.status === "doing", "Task.status debe haberse actualizado a 'doing'");
    assert(
      dbTask?.emailMetadata?.taskStatus === "doing",
      "EmailMetadata.taskStatus debe sincronizarse con el nuevo estado"
    );
  }

  await cleanupKanbanTestData(data);
  console.log(
    "Resumen (KANBAN HITO 1): flujo OK → obtener tareas por contacto/estado, obtener contactos del selector y actualizar estado de tarea con persistencia."
  );
}

(async function main() {
  try {
    // Evita que la revalidación de Next falle en entorno CLI (las acciones ya capturan errores, pero mantenemos coherencia)
    process.env.SKIP_REVALIDATE = "1";
    await test_kanban_actions_flow();
    console.info("Todos los tests de Kanban (HITO 1) se ejecutaron correctamente.");
  } catch (err) {
    console.error("Test Kanban HITO 1 falló:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();