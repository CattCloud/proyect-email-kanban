import {
  EmailAnalysisSchema,
  type EmailAnalysis,
  type EmailInput,
  sanitizeTextForAI,
  type ValidateEmailAnalysisResult,
} from "@/types/ai";
import type { ZodIssue } from "zod";

// Prompt y utilidades para procesamiento de emails con IA

const SYSTEM_CONTEXT = `
Eres un asistente de IA especializado en análisis de emails comerciales para ejecutivos.
Tu objetivo es extraer metadata estructurada y tareas accionables desde correos electrónicos.
Los resultados se visualizarán en un tablero Kanban; prioriza claridad y concisión.
Aprende de los rechazos previos para mejorar continuamente la calidad de tu análisis.
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
- Si un email tiene feedback de rechazo previo, ajusta tu análisis según las indicaciones
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

const TAGS_STRATEGY = `
Estrategia de Etiquetado:
PRIORIDAD 1: Usa ÚNICAMENTE etiquetas del catálogo existente cuando sean aplicables
PRIORIDAD 2: Propón nuevas etiquetas SOLO cuando:
  - Ninguna etiqueta existente describe adecuadamente la tarea
  - La nueva etiqueta será reutilizable en múltiples contextos
  - Es una categoría temática clara y específica

Reglas de etiquetado:
- Máximo 3 tags por tarea
- Formato: minúsculas, sin espacios, sin acentos (ej: "reunion", "propuesta")
- Priorizar etiquetas genéricas sobre específicas
- Si no hay etiquetas del catálogo aplicables Y no puedes crear una reutilizable: devuelve []

Buenas prácticas:
✅ Reutilizar: "reunion", "documento", "cotizacion", "demo"
✅ Proponer nueva: "migracion-datos" (si es tema recurrente)
❌ Evitar: "reunion-con-juan", "doc-temporal", "cosa-urgente"
`.trim();

const REJECTION_FEEDBACK_STRATEGY = `
Manejo de Feedback de Rechazo:
Si un email incluye información de rechazo previo, debes:

1. ANALIZAR el motivo del rechazo cuidadosamente
2. COMPARAR el resultado descartado con el contenido real del email
3. IDENTIFICAR qué aspecto específico falló (categoría, prioridad, tareas, resumen)
4. CORREGIR el error aplicando un razonamiento diferente
5. EVITAR repetir exactamente el mismo análisis descartado

Guía según tipo de rechazo:
- "Categoría incorrecta": Reconsidera la clasificación desde cero, busca señales alternativas
- "Prioridad mal asignada": Reevalúa criterios de urgencia y contexto temporal
- "Tareas mal extraídas": Lee el email línea por línea, valida cada acción contra el contenido
- "Resumen poco útil": Captura la intención principal con verbos de acción claros
- Feedback libre del usuario: Ajusta específicamente según su indicación textual

CRÍTICO: Si el resultado descartado clasificó como "spam" y fue rechazado, considera fuertemente otras categorías.
Si extrajo tareas inexistentes, valida cada tarea contra oraciones reales del email.
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
- tags: usa etiquetas del catálogo proporcionado o propón nuevas estratégicamente
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

ETIQUETAS EXISTENTES: ["reunion", "propuesta", "contrato", "demo", "soporte"]

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
      "tags": ["reunion", "propuesta"],
      "participants": ["cliente@empresa.com"]
    },
    {
      "description": "Enviar contrato actualizado",
      "due_date": "2025-11-03T23:59:00Z",
      "tags": ["contrato"],
      "participants": ["cliente@empresa.com"]
    }
  ]
}

Nota: Se usaron etiquetas del catálogo existente ("reunion", "propuesta", "contrato")
`.trim();

const CONSTRAINTS = `
- Devuelve solo el array JSON (comienza con "[" y termina con "]")
- Sin markdown ni comentarios
- Mantén el orden de los emails del input
- Valida emails en participants y evita duplicados
- Usa UTC (terminado en Z) para due_date cuando corresponda
- CRÍTICO: Prioriza etiquetas del catálogo existente antes de proponer nuevas
- CRÍTICO: Si hay feedback de rechazo, NO repitas el mismo error del análisis anterior
`.trim();

function sanitizeEmailsForAI(emails: EmailInput[]): EmailInput[] {
  return emails.map((e) => ({
    ...e,
    subject: sanitizeTextForAI(e.subject),
    body: sanitizeTextForAI(e.body),
  }));
}

/**
 * Construye sección de feedback de rechazo si existe
 */
function buildRejectionFeedbackSection(email: EmailInput): string {
  // Verificar si el email tiene información de rechazo previo
  if (!email.rejectionReason || !email.previousAIResult) {
    return "";
  }

  return `
═══════════════════════════════════════════════════════════════
## ⚠️ FEEDBACK DE RECHAZO PREVIO PARA EMAIL "${email.id}"

Este email fue procesado anteriormente y el usuario RECHAZÓ el resultado.

📌 Motivo del rechazo: "${email.rejectionReason}"

❌ Resultado DESCARTADO anterior:
${JSON.stringify(email.previousAIResult, null, 2)}

⚠️ INSTRUCCIONES CRÍTICAS PARA ESTE EMAIL:
1. NO repitas los mismos errores del análisis anterior
2. Presta especial atención al área que causó el rechazo
3. Si el motivo menciona "Categoría": reconsidera completamente la clasificación
4. Si el motivo menciona "Tareas": lee el email línea por línea de nuevo y valida cada acción
5. Si el motivo menciona "Prioridad": reevalúa los criterios de urgencia desde cero
6. Si el motivo menciona "Resumen": reformula capturando la intención principal de forma clara
7. Si es feedback libre del usuario: ajusta tu razonamiento según su indicación específica
8. Compara tu nuevo análisis con el descartado y asegúrate de corregir el problema identificado

EJEMPLO DE CORRECCIÓN:
Si rejectionReason = "Categoría incorrecta" y previousAIResult.category = "spam"
→ Evita clasificar como spam nuevamente, considera primero "cliente", "lead" o "interno"

Si rejectionReason = "Tareas mal extraídas" y previousAIResult.tasks = [tarea inexistente]
→ Lee el cuerpo del email oración por oración y extrae solo acciones explícitas mencionadas
═══════════════════════════════════════════════════════════════
`;
}

/**
 * Construye el prompt para procesamiento de emails con IA
 * @param emails - Array de emails a procesar (puede incluir rejectionReason y previousAIResult)
 * @param existingTags - Array de etiquetas existentes en el sistema (opcional)
 */
export function buildEmailProcessingPrompt(
  emails: EmailInput[],
  existingTags: string[] = []
): string {
  const safe = sanitizeEmailsForAI(emails);
  const emailsJSON = JSON.stringify(safe, null, 2);

  const tagsSection =
    existingTags.length > 0
      ? `
═══════════════════════════════════════════════════════════════
## CATÁLOGO DE ETIQUETAS EXISTENTES

A continuación se listan las etiquetas ya registradas en el sistema.
PRIORIZA el uso de estas etiquetas antes de proponer nuevas:

${JSON.stringify(existingTags, null, 2)}

Total de etiquetas disponibles: ${existingTags.length}
`
      : `
═══════════════════════════════════════════════════════════════
## CATÁLOGO DE ETIQUETAS EXISTENTES

No hay etiquetas registradas en el sistema aún.
Propón etiquetas estratégicas y reutilizables según los criterios definidos.
`;

  // Construir secciones de feedback de rechazo para emails que lo tengan
  const rejectionSections = emails
    .map((email) => buildRejectionFeedbackSection(email))
    .filter((section) => section.length > 0)
    .join("\n");

  return `
${SYSTEM_CONTEXT}

═══════════════════════════════════════════════════════════════
${MAIN_INSTRUCTIONS}

═══════════════════════════════════════════════════════════════
${DECISION_CRITERIA}

═══════════════════════════════════════════════════════════════
${TAGS_STRATEGY}
${tagsSection}
═══════════════════════════════════════════════════════════════
${REJECTION_FEEDBACK_STRATEGY}
${rejectionSections}
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
Si hay etiquetas existentes, ÚSALAS prioritariamente. Solo propón nuevas si son estratégicas.
Si algún email tiene feedback de rechazo, corrige específicamente el error señalado.
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
