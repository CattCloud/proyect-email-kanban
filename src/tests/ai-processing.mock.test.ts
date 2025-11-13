/* eslint-disable no-console */
import { prisma } from "@/lib/prisma";
import {
  getUnprocessedEmails,
  processEmailsWithAI,
  getPendingAIResults,
  confirmAIResults,
  updateProcessedAt,
} from "@/actions/ai-processing";
import {
  __setOpenAIClientForTesting,
  type OpenAIChatLike,
} from "@/services/openai";
import type { Email } from "@prisma/client";

// Utilidad de aserción simple
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

// Crea un cliente OpenAI fake que devuelve el content provisto y usage fijo
function makeClientWithContent(content: string, usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }): OpenAIChatLike {
  return {
    chat: {
      completions: {
        async create() {
          return {
            choices: [{ message: { role: "assistant", content } }],
            usage: usage ?? { prompt_tokens: 80, completion_tokens: 160, total_tokens: 240 },
          };
        },
      },
    },
  };
}

// Crear emails de prueba no procesados
async function createTestEmails(count = 2): Promise<Email[]> {
  const created: Email[] = [];
  for (let i = 0; i < count; i++) {
    const unique = `test-ai-${Date.now()}-${i}-${Math.floor(Math.random() * 100000)}`;
    const email = await prisma.email.create({
      data: {
        idEmail: unique,
        from: `user${i}@example.com`,
        subject: `Asunto de prueba ${i}`,
        body: `Cuerpo del email ${i} con contexto y posibles tareas.`,
        receivedAt: new Date(Date.now() - (i + 1) * 60000),
        processedAt: null,
      },
    });
    created.push(email);
  }
  return created;
}

// Limpieza de datos de prueba
async function cleanupEmails(emails: Email[]): Promise<void> {
  for (const e of emails) {
    try {
      await prisma.email.delete({ where: { id: e.id } });
    } catch {
      // noop
    }
  }
}

async function test_hito2_flow() {
  console.info("[HITO2] Iniciando test de flujo de Server Actions con OpenAI mock");

  // 1) Crear emails de prueba sin procesar
  const emails = await createTestEmails(2);
  const [e1, e2] = emails;
  console.log(`Creado emails de prueba: ${e1.id}, ${e2.id}`);

  // 2) Verificar getUnprocessedEmails
  {
    const list = await getUnprocessedEmails(1, 10);
    assert(list.success, "getUnprocessedEmails debe retornar success=true");
    assert(Array.isArray(list.data), "getUnprocessedEmails.data debe ser array");
  }

  // 3) Inyectar OpenAI mock con análisis que coincide por email_id
  const content = JSON.stringify([
    {
      email_id: e1.id,
      category: "cliente",
      priority: "alta",
      summary: "Resumen IA para e1",
      contact_name: "Contacto Uno",
      tasks: [
        {
          description: "Agendar reunión de seguimiento",
          due_date: null,
          tags: ["reunión", "seguimiento"],
          participants: [e1.from],
        },
      ],
    },
    {
      email_id: e2.id,
      category: "lead",
      priority: "media",
      summary: "Resumen IA para e2",
      contact_name: "Contacto Dos",
      tasks: [
        {
          description: "Enviar propuesta inicial",
          due_date: null,
          tags: ["propuesta"],
          participants: [e2.from],
        },
      ],
    },
  ]);

  __setOpenAIClientForTesting(makeClientWithContent(content));

  // 4) Ejecutar processEmailsWithAI
  const summary = await processEmailsWithAI([e1.id, e2.id]);
  console.log("Resultado de processEmailsWithAI:", summary);
  assert(summary.processed === 2, "Deben procesarse 2 análisis IA");
  assert((summary.errors?.length ?? 0) === 0, "No debe haber errores por email");
  assert(summary.success === true || summary.success === false, "success debe existir"); // podría ser false si validationErrors existe, aceptamos ambos casos con processed=2
  assert(!!summary.modelUsed, "Debe informar modelUsed");

  // 5) Cargar metadata+tasks y validar persistencia
  {
    const after1 = await prisma.email.findUnique({
      where: { id: e1.id },
      include: { metadata: { include: { tasks: true } } },
    });
    const after2 = await prisma.email.findUnique({
      where: { id: e2.id },
      include: { metadata: { include: { tasks: true } } },
    });
    assert(!!after1?.metadata, "e1 debe tener EmailMetadata");
    assert(!!after2?.metadata, "e2 debe tener EmailMetadata");
    assert((after1?.metadata?.tasks?.length ?? 0) === 1, "e1 debe tener 1 Task");
    assert((after2?.metadata?.tasks?.length ?? 0) === 1, "e2 debe tener 1 Task");
    assert(after1?.metadata?.summary === "Resumen IA para e1", "summary e1 debe coincidir");
    assert(after2?.metadata?.summary === "Resumen IA para e2", "summary e2 debe coincidir");
  }

  // 6) Obtener resultados pendientes para revisión
  {
    const pending = await getPendingAIResults([e1.id, e2.id]);
    assert(pending.success, "getPendingAIResults debe ser success");
    assert(Array.isArray(pending.data), "pending.data debe ser array");
    assert((pending.data as unknown[]).length >= 2, "Debe traer ambos emails");
  }

  // 7) Confirmar e1 (processedAt != null)
  {
    const res = await confirmAIResults(e1.id, true);
    assert(res.success, "confirmAIResults(true) debe ser success");
    const after = await prisma.email.findUnique({ where: { id: e1.id } });
    assert(after?.processedAt !== null, "e1 debe quedar con processedAt != null");
  }

  // 8) Rechazar e2 (limpiar metadata/tasks, processedAt = null)
  {
    const res = await confirmAIResults(e2.id, false);
    assert(res.success, "confirmAIResults(false) debe ser success");
    const after = await prisma.email.findUnique({
      where: { id: e2.id },
      include: { metadata: true },
    });
    assert(after?.processedAt === null, "e2 debe mantenerse sin procesar");
    assert(after?.metadata === null, "e2 debe limpiar metadata al rechazar");
  }

  // 9) Marcar ambos como procesados (aunque e2 fue rechazado, ahora lo marcamos manualmente)
  {
    const r = await updateProcessedAt([e1.id, e2.id]);
    assert(r.success, "updateProcessedAt debe ser success");
    const after1 = await prisma.email.findUnique({ where: { id: e1.id } });
    const after2 = await prisma.email.findUnique({ where: { id: e2.id } });
    assert(after1?.processedAt !== null, "e1 processedAt no debe ser null");
    assert(after2?.processedAt !== null, "e2 processedAt no debe ser null");
  }

  // Limpieza
  await cleanupEmails(emails);

  console.log("Resumen (HITO 2 - Server Actions): flujo E2E OK → procesar IA, persistir metadata y tareas, revisar/confirmar/rechazar, y actualizar processedAt.");
}

(async function main() {
  try {
    // Evita que la revalidación de Next falle en entorno CLI
    process.env.SKIP_REVALIDATE = "1";
    await test_hito2_flow();
    console.info("Todos los tests de HITO 2 se ejecutaron correctamente.");
  } catch (err) {
    console.error("Test HITO 2 falló:", err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();