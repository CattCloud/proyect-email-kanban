import { EmailAnalysisSchema, type EmailAnalysis, type EmailInput, sanitizeTextForAI, type ValidateEmailAnalysisResult } from "@/types/ai";
import type { ZodIssue } from "zod";

// Prompt y utilidades para procesamiento de emails con IA

const SYSTEM_CONTEXT = `
Eres un asistente de IA especializado en análisis de emails comerciales para ejecutivos.
Tu objetivo es extraer metadata estructurada y tareas accionables desde correos electrónicos.
Los resultados se visualizarán en un tablero Kanban; prioriza claridad y concisión.
`.trim();

const MAIN_INSTRUCTIONS = `
Para cada email del array proporcionado, debes analizar y extraer:
1. email_id: Conserva el ID original recibido (campo "id" del input)
2. category: 'cliente' | 'lead' | 'interno' | 'spam'
3. priority: 'alta' | 'media' | 'baja'
4. summary: Propósito en máximo 100 caracteres (sin saltos de línea)
5. contact_name: Nombre extraído o inferido del remitente
6. tasks: Lista de tareas concretas identificadas en el cuerpo del email
IMPORTANTE:
- Procesa TODOS los emails del array proporcionado
- Devuelve un array JSON con un objeto por email, en el mismo orden
`.trim();

const DECISION_CRITERIA = `
Categorización:
- cliente: relación previa/servicios/contratos
- lead: primer contacto/solicitud de info o cotización
- interno: mismo dominio corporativo/coord. interna
- spam: promocional masivo no solicitado
Priorización:
- alta: urgencia explícita, <48h, impacto crítico
- media: importante sin urgencia inmediata (3-7 días)
- baja: informativo/FYI/actualizaciones sin plazo
Tareas:
- Incluir acciones explícitas o compromisos con plazo; excluir cortesías/ruido
`.trim();

const OUTPUT_FORMAT = `
Debes devolver únicamente un array JSON parseable con JSON.parse(), sin texto adicional.
Estructura exacta por email:
{
  "email_id": "string",
  "category": "cliente" | "lead" | "interno" | "spam",
  "priority": "alta" | "media" | "baja",
  "summary": "string (5-100 chars, sin saltos de línea)",
  "contact_name": "string (2-80 chars)",
  "tasks": [
    {
      "description": "string (10-150 chars)",
      "due_date": "ISO 8601 UTC (termina en Z) o null",
      "tags": ["string", "string"],
      "participants": ["email@valido.com"]
    }
  ]
}
Reglas:
- Si no hay tareas: "tasks": []
- Si no se puede inferir fecha: "due_date": null
- participants debe contener al menos el remitente
`.trim();

const FEW_SHOT_EXAMPLE = `
INPUT:
{
  "id": "email-001",
  "email": "cliente@empresa.com",
  "received_at": "2025-11-01T09:15:00Z",
  "subject": "Reunión urgente - Propuesta Q4",
  "body": "Necesito revisar la propuesta Q4 antes del viernes. Agenda reunión y envía contrato actualizado."
}
OUTPUT:
{
  "email_id": "email-001",
  "category": "cliente",
  "priority": "alta",
  "summary": "Revisión urgente de propuesta Q4 y reunión antes del viernes",
  "contact_name": "Cliente Empresa",
  "tasks": [
    {
      "description": "Agendar reunión para revisar propuesta Q4 antes del viernes",
      "due_date": "2025-11-03T23:59:00Z",
      "tags": ["reunión", "propuesta"],
      "participants": ["cliente@empresa.com"]
    }
  ]
}
`.trim();

const CONSTRAINTS = `
- Devuelve solo el array JSON (comienza con "[" y termina con "]")
- Sin markdown ni comentarios
- Mantén el orden de los emails del input
- Valida emails en participants y evita duplicados
- Usa UTC (terminado en Z) para due_date cuando corresponda
`.trim();

function sanitizeEmailsForAI(emails: EmailInput[]): EmailInput[] {
  return emails.map((e) => ({
    ...e,
    subject: sanitizeTextForAI(e.subject),
    body: sanitizeTextForAI(e.body),
  }));
}

export function buildEmailProcessingPrompt(emails: EmailInput[]): string {
  const safe = sanitizeEmailsForAI(emails);
  const emailsJSON = JSON.stringify(safe, null, 2);
  return `
${SYSTEM_CONTEXT}

═══════════════════════════════════════════════════════════════
${MAIN_INSTRUCTIONS}

═══════════════════════════════════════════════════════════════
${DECISION_CRITERIA}

═══════════════════════════════════════════════════════════════
${OUTPUT_FORMAT}

═══════════════════════════════════════════════════════════════
${FEW_SHOT_EXAMPLE}

═══════════════════════════════════════════════════════════════
${CONSTRAINTS}

═══════════════════════════════════════════════════════════════
## EMAILS A PROCESAR
${emailsJSON}

INSTRUCCIÓN FINAL:
Devuelve ÚNICAMENTE un array JSON válido con ${emails.length} elementos, en el mismo orden.
Comienza tu respuesta con "[" y termina con "]".
`.trim();
}

export function validateEmailAnalysisResponse(
  response: unknown,
  expectedCount: number
): ValidateEmailAnalysisResult {
  const errors: string[] = [];
  if (!Array.isArray(response)) {
    errors.push("La respuesta no es un array JSON válido");
    return { valid: false, errors };
  }
  if (response.length !== expectedCount) {
    errors.push(
      `Se esperaban ${expectedCount} emails procesados, pero se recibieron ${response.length}`
    );
  }
  const data: EmailAnalysis[] = [];
  response.forEach((item, index) => {
    const parsed = EmailAnalysisSchema.safeParse(item);
    if (!parsed.success) {
      const msg = parsed.error.issues.map((e: ZodIssue) => e.message).join(", ");
      errors.push(`Email ${index + 1}: ${msg}`);
    } else {
      data.push(parsed.data);
    }
  });
  return { valid: errors.length === 0, errors, data: data.length ? data : undefined };
}