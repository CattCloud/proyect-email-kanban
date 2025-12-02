/* eslint-disable no-console */
import { calculateConfidenceLevel } from "@/lib/confidence-calculator";
import type { EmailInput, EmailAnalysis } from "@/types/ai";

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

function makeBaseEmail(overrides: Partial<EmailInput> = {}): EmailInput {
  return {
    id: "email-1",
    email: "cliente@example.com",
    received_at: "2025-11-01T09:00:00Z",
    subject: "Reunión urgente con cliente VIP",
    body:
      "Hola, necesitamos agendar una reunión urgente con el cliente VIP antes del 15/12/2025. " +
      "Por favor enviar propuesta y confirmar asistencia.",
    ...overrides,
  };
}

function makeHighQualityAnalysis(): EmailAnalysis {
  return {
    email_id: "email-1",
    category: "cliente",
    priority: "alta",
    summary: "Reunión urgente con cliente VIP antes del 15/12/2025",
    contact_name: "Cliente Ejemplo",
    tasks: [
      {
        description: "Enviar propuesta detallada al cliente VIP antes del 15/12/2025",
        due_date: "2025-12-10T10:00:00Z",
        tags: ["propuesta", "cliente-vip"],
        participants: ["cliente@example.com"],
      },
      {
        description: "Agendar reunión con el cliente VIP para revisar la propuesta",
        due_date: "2025-12-12T15:00:00Z",
        tags: ["reunión", "cliente-vip"],
        participants: ["cliente@example.com"],
      },
    ],
  };
}

function makeLowQualityAnalysis(): EmailAnalysis {
  return {
    email_id: "email-2",
    category: "spam",
    priority: "baja",
    summary: "Cosas varias",
    contact_name: "Remitente Desconocido",
    tasks: [
      {
        description: "Hacer muchas cosas importantes que no se mencionan aquí",
        due_date: null,
        tags: ["importante"],
        participants: ["otro@example.com"],
      },
    ],
  };
}

function makeAmbiguousAnalysis(): EmailAnalysis {
  return {
    email_id: "email-3",
    category: "interno",
    priority: "media",
    summary: "Recordatorio de tema interno",
    contact_name: "Compañero",
    tasks: [
      {
        description: "Revisar cuando puedas el tema pendiente",
        due_date: null,
        tags: [],
        participants: ["compa@example.com"],
      },
    ],
  };
}

async function test_high_confidence(): Promise<void> {
  console.info("[CONFIDENCE] test_high_confidence");

  const email = makeBaseEmail();
  const analysis = makeHighQualityAnalysis();

  const context = {
    existingTags: ["propuesta", "cliente-vip", "reunión"],
    historicalApprovals: 90,
    knownCategory: "cliente",
  };

  const result = calculateConfidenceLevel(email, analysis, context);

  console.log("[CONFIDENCE] high result →", result);

  assert(
    result.overallScore >= 85,
    "Score alto esperado (>= 85) para análisis muy claro y coherente"
  );
  assert(
    result.color === "green",
    "Color esperado 'green' para score alto"
  );
  assert(
    result.requiresReview === false,
    "requiresReview debe ser false para score alto"
  );
}

async function test_low_confidence(): Promise<void> {
  console.info("[CONFIDENCE] test_low_confidence");

  const email: EmailInput = {
    id: "email-2",
    email: "spam@example.com",
    received_at: "2025-11-02T09:00:00Z",
    subject: "Hola",
    body: "Hola, veamos luego qué hacemos.",
  };

  const analysis = makeLowQualityAnalysis();

  const context = {
    existingTags: [] as string[],
    historicalApprovals: 0,
    // knownCategory se omite → se utilizará undefined
  };

  const result = calculateConfidenceLevel(email, analysis, context);

  console.log("[CONFIDENCE] low result →", result);

  assert(
    result.overallScore <= 60,
    "Score bajo esperado (<= 60) para análisis incoherente con el email"
  );
  assert(
    result.color === "orange" || result.color === "red",
    "Color esperado 'orange' o 'red' para score bajo"
  );
  assert(
    result.requiresReview === true,
    "requiresReview debe ser true para score bajo"
  );
}

async function test_feedback_penalty(): Promise<void> {
  console.info("[CONFIDENCE] test_feedback_penalty");

  const email: EmailInput & { reprocessCount: number } = {
    id: "email-3",
    email: "cliente@example.com",
    received_at: "2025-11-03T09:00:00Z",
    subject: "Seguimiento",
    body: "Seguimos con el mismo tema de siempre.",
    reprocessCount: 2,
  };

  const analysis = makeAmbiguousAnalysis();

  const context = {
    existingTags: [] as string[],
    historicalApprovals: 50,
    knownCategory: "interno",
  };

  const result = calculateConfidenceLevel(email, analysis, context);

  console.log("[CONFIDENCE] feedback result →", result);

  assert(
    result.overallScore < 80,
    "Score debe verse afectado negativamente por reprocessCount=2"
  );
  assert(
    result.requiresReview === true,
    "requiresReview debe ser true cuando hay reprocesos y score medio/bajo"
  );
}

(async function main() {
  try {
    await test_high_confidence();
    await test_low_confidence();
    await test_feedback_penalty();
    console.info(
      "Todos los tests de confianza IA se ejecutaron correctamente (niveles alto / bajo / penalización por reprocesos)."
    );
  } catch (err) {
    console.error("Test de confianza IA falló:", err);
    // eslint-disable-next-line no-process-exit
    process.exitCode = 1;
  }
})();