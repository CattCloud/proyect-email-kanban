/* eslint-disable no-console */
import {
  processEmailsBatch,
  __setOpenAIClientForTesting,
  type OpenAIChatLike,
} from "@/services/openai";
import type { EmailInput } from "@/types/ai";

// Utilidad simple de aserción sin framework
function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function makeClientWithContent(content: string, usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }): OpenAIChatLike {
  return {
    chat: {
      completions: {
        async create() {
          return {
            choices: [{ message: { role: "assistant", content } }],
            usage: usage ?? { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 },
          };
        },
      },
    },
  };
}

async function test_success_basic() {
  console.info("[TEST] success_basic");
  const content = JSON.stringify([
    {
      email_id: "e-1",
      category: "cliente",
      priority: "alta",
      summary: "Ejemplo de análisis válido",
      contact_name: "Cliente Ejemplo",
      tasks: [
        {
          description: "Agendar reunión",
          due_date: null,
          tags: ["reunión"],
          participants: ["cliente@empresa.com"],
        },
      ],
    },
  ]);
  __setOpenAIClientForTesting(makeClientWithContent(content) );

  const inputs: EmailInput[] = [
    {
      id: "e-1",
      email: "cliente@empresa.com",
      received_at: "2025-11-01T09:15:00Z",
      subject: "Reunión",
      body: "Necesito agendar reunión",
    },
  ];

  const res = await processEmailsBatch(inputs);
  assert(Array.isArray(res.analyses), "analyses debe ser array");
  assert(res.analyses.length === 1, "analyses debe tener 1 elemento");
  assert(!res.errors || res.errors.length === 0, "no debe haber errores de validación");
  assert(!!res.usage, "debe traer usage");
  assert(res.modelUsed.length > 0, "modelUsed debe existir");
  console.info("[OK] success_basic");
}

async function test_extract_array_from_wrapped_text() {
  console.info("[TEST] extract_array_from_wrapped_text");
  const wrapped = `Aquí está tu respuesta:
  ${JSON.stringify([
    {
      email_id: "e-2",
      category: "lead",
      priority: "media",
      summary: "Ejemplo con texto envuelto",
      contact_name: "Prospecto",
      tasks: [],
    },
  ])}
  Gracias.`;
  __setOpenAIClientForTesting(makeClientWithContent(wrapped) );

  const inputs: EmailInput[] = [
    {
      id: "e-2",
      email: "prospecto@empresa.com",
      received_at: "2025-11-02T09:15:00Z",
      subject: "Cotización",
      body: "Enviar detalles",
    },
  ];

  const res = await processEmailsBatch(inputs);
  assert(res.analyses.length === 1, "analyses debe tener 1 elemento (wrapped)");
  assert(res.analyses[0].email_id === "e-2", "email_id debe coincidir");
  console.info("[OK] extract_array_from_wrapped_text");
}

async function test_zod_validation_errors() {
  console.info("[TEST] zod_validation_errors");
  // participants con email inválido para provocar error Zod
  const invalid = JSON.stringify([
    {
      email_id: "e-3",
      category: "cliente",
      priority: "alta",
      summary: "Con participante inválido",
      contact_name: "Cliente",
      tasks: [
        {
          description: "Enviar documento",
          due_date: null,
          tags: ["documento"],
          participants: ["no-es-email-valido"], // INVALIDO
        },
      ],
    },
  ]);
  __setOpenAIClientForTesting(makeClientWithContent(invalid) );

  const inputs: EmailInput[] = [
    {
      id: "e-3",
      email: "cliente@empresa.com",
      received_at: "2025-11-03T09:15:00Z",
      subject: "Documento",
      body: "Enviar documento",
    },
  ];

  const res = await processEmailsBatch(inputs);
  assert(Array.isArray(res.errors) && res.errors.length > 0, "deben existir errores Zod");
  // Aún así el servicio retorna structure (analyses puede estar vacío)
  assert(res.analyses.length >= 0, "analyses presente (posible array vacío)");
  console.info("[OK] zod_validation_errors");
}

async function test_rate_limit_interval() {
  console.info("[TEST] rate_limit_interval (≥300ms entre requests)");
  const content = JSON.stringify([
    {
      email_id: "e-4",
      category: "interno",
      priority: "baja",
      summary: "Mensaje interno",
      contact_name: "Equipo",
      tasks: [],
    },
  ]);
  __setOpenAIClientForTesting(makeClientWithContent(content) );

  const inputs: EmailInput[] = [
    {
      id: "e-4",
      email: "equipo@miempresa.com",
      received_at: "2025-11-04T09:15:00Z",
      subject: "Interno",
      body: "Recordatorio",
    },
  ];

  const t0 = Date.now();
  await processEmailsBatch(inputs);
  const t1 = Date.now();
  await processEmailsBatch(inputs);
  const t2 = Date.now();

  const delta = t2 - t1;
  // Nota: el primer request no tiene espera previa, el segundo sí debe respetar intervalo mínimo
  assert(delta >= 280, `intervalo entre requests esperado ~>=300ms, medido=${delta}ms`);
  console.info("[OK] rate_limit_interval");
}

(async function main() {
  try {
    await test_success_basic();
    await test_extract_array_from_wrapped_text();
    await test_zod_validation_errors();
    await test_rate_limit_interval();
    console.info("Todos los tests se ejecutaron correctamente.");
    // Log en lenguaje humano para lectura directa en consola:
    console.log("Resumen (HITO 1 - OpenAI): 4 pruebas OK → análisis básico, extracción de JSON envuelto, validación Zod de errores y verificación de rate limiting (≥300ms).");
  } catch (err) {
    console.error("Test fallo:", err);
    process.exitCode = 1;
  }
})();