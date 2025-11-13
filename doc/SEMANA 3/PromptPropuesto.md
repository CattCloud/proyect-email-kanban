// src/lib/prompts/email-processing.ts

/**
 * PROMPT DE PROCESAMIENTO INTELIGENTE DE EMAILS
 * Versión: 2.0.0
 * Última actualización: 11 de Noviembre, 2025
 * 
 * Sistema especializado en extracción de metadata, tareas y contactos
 * desde emails comerciales para visualización en Kanban.
 */

import { z } from 'zod';

// ============================================================
// SCHEMAS DE VALIDACIÓN
// ============================================================

export const TaskSchema = z.object({
  description: z.string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(150, "La descripción no debe exceder 150 caracteres"),
  due_date: z.string().nullable()
    .refine((val) => val === null || !isNaN(Date.parse(val)), {
      message: "due_date debe ser fecha ISO 8601 válida o null"
    }),
  tags: z.array(z.string()).default([]),
  participants: z.array(z.string().email("Formato de email inválido"))
});

export const EmailAnalysisSchema = z.object({
  email_id: z.string(),
  category: z.enum(['cliente', 'lead', 'interno', 'spam'], {
    errorMap: () => ({ message: "Categoría debe ser: cliente, lead, interno o spam" })
  }),
  priority: z.enum(['alta', 'media', 'baja'], {
    errorMap: () => ({ message: "Prioridad debe ser: alta, media o baja" })
  }),
  summary: z.string()
    .min(5, "El resumen debe tener al menos 5 caracteres")
    .max(100, "El resumen no debe exceder 100 caracteres"),
  contact_name: z.string()
    .min(2, "El nombre de contacto debe tener al menos 2 caracteres")
    .max(80, "El nombre de contacto no debe exceder 80 caracteres"),
  tasks: z.array(TaskSchema)
});

export type EmailAnalysis = z.infer<typeof EmailAnalysisSchema>;
export type Task = z.infer<typeof TaskSchema>;

// ============================================================
// 1. CONTEXTO DEL SISTEMA
// ============================================================
const SYSTEM_CONTEXT = `
Eres un asistente de IA especializado en análisis de emails comerciales para ejecutivos.
Tu objetivo es extraer metadata estructurada y tareas accionables desde correos electrónicos.
Los resultados se visualizarán en un tablero Kanban, por lo que debes priorizar claridad y concisión.
Mantén objetividad técnica y enfócate exclusivamente en la información solicitada.
`.trim();

// ============================================================
// 2. INSTRUCCIONES PRINCIPALES
// ============================================================
const MAIN_INSTRUCTIONS = `
Para cada email del array proporcionado, debes analizar y extraer:

1. **email_id**: Conserva el ID original recibido (campo "id" del input)
2. **category**: Clasifica en 'cliente', 'lead', 'interno' o 'spam'
3. **priority**: Evalúa como 'alta', 'media' o 'baja'
4. **summary**: Resume el propósito en máximo 100 caracteres
5. **contact_name**: Extrae o infiere el nombre del remitente desde el campo "email"
6. **tasks**: Lista de tareas concretas identificadas en el cuerpo del email

**IMPORTANTE:**
- Procesa TODOS los emails del array proporcionado
- Devuelve un array JSON con un objeto de análisis por cada email
- Mantén el orden original de los emails en la respuesta
`.trim();

// ============================================================
// 3. CRITERIOS DE DECISIÓN DETALLADOS
// ============================================================
const DECISION_CRITERIA = `
## 3.1 CATEGORIZACIÓN (category)

**'cliente'**: 
- Email de cliente existente identificado por dominio conocido o contexto previo
- Solicitudes de servicio, consultas post-venta, seguimiento de proyectos
- Menciones de contratos vigentes, facturas, o relación comercial establecida

**'lead'**: 
- Prospecto nuevo o primer contacto sin relación comercial previa
- Solicitudes de cotización, información de productos/servicios
- Consultas exploratorias o interés inicial en servicios

**'interno'**: 
- Email del mismo dominio corporativo (@miempresa.com)
- Comunicaciones de equipo, notificaciones internas
- Coordinación entre departamentos, reportes, updates de proyecto

**'spam'**: 
- Contenido promocional masivo no solicitado
- Ofertas genéricas sin contexto de negocio
- Emails con múltiples enlaces sospechosos o lenguaje de marketing agresivo
- Remitentes desconocidos con contenido irrelevante

---

## 3.2 PRIORIZACIÓN (priority)

**'alta'**: 
- Menciones explícitas de urgencia: "urgente", "ASAP", "prioritario", "inmediato"
- Fechas límite próximas mencionadas (menos de 48 horas)
- Impacto crítico: pérdida de cliente, riesgo de contrato, escalamiento ejecutivo
- Palabras clave: "problema crítico", "bloqueante", "CEO solicitó", "cliente esperando"

**'media'**: 
- Solicitudes importantes sin urgencia temporal inmediata
- Fechas límite entre 3-7 días
- Coordinación de reuniones, seguimiento de propuestas
- Palabras clave: "necesito", "favor de", "cuando puedas", "esta semana"

**'baja'**: 
- Información general, FYI (For Your Information)
- Sin fechas límite o con plazos flexibles (>7 días)
- Actualizaciones, notificaciones, cortesías
- Palabras clave: "informar", "notificar", "compartir", "para tu conocimiento"

---

## 3.3 EXTRACCIÓN DE RESUMEN (summary)

**Objetivo:** Capturar el propósito principal en máximo 100 caracteres

**Reglas de redacción:**
- Usar verbos de acción: "Solicita", "Requiere", "Informa", "Propone"
- Eliminar saludos, despedidas y contenido de cortesía
- Priorizar sustantivos concretos sobre adjetivos
- Mantener nombres propios si son relevantes (productos, proyectos)

**Ejemplos buenos:**
✅ "Solicita reunión urgente para revisar propuesta Q4"
✅ "Requiere cotización de servicios cloud para proyecto Alpha"
✅ "Informa cambio de fecha de reunión semanal a martes"

**Ejemplos malos:**
❌ "El cliente nos está contactando para solicitarnos amablemente..."
❌ "Hola, espero que estés bien, te escribo para..."

---

## 3.4 EXTRACCIÓN DE NOMBRE DE CONTACTO (contact_name)

**Prioridad de extracción:**
1. Nombre en firma del email (si está presente en el cuerpo)
2. Nombre antes del "@" en el email (ej: "juan.perez@empresa.com" → "Juan Pérez")
3. Nombre de la empresa si es un email genérico (ej: "info@acme.com" → "ACME")

**Formato esperado:**
- Capitalizar primera letra de cada palabra
- Remover números y caracteres especiales
- Si solo hay email genérico, usar dominio como nombre

**Ejemplos:**
- Input: "maria.garcia@clientex.com" → Output: "María García"
- Input: "info@startupxyz.com" → Output: "StartupXYZ"
- Input: "ventas@proveedor.com" + firma "Equipo Comercial" → Output: "Equipo Comercial"

---

## 3.5 DETECCIÓN Y EXTRACCIÓN DE TAREAS (tasks)

**Criterios de inclusión:**
Solo incluir tareas que cumplan AL MENOS UNO de estos criterios:
1. **Acción explícita:** Verbos imperativos o solicitudes directas
   - "Envía el reporte", "Agenda reunión", "Revisa propuesta"
2. **Compromiso implícito:** Promesas o acuerdos del remitente
   - "Necesito que nos reunamos", "Esperamos tu respuesta"
3. **Fecha límite mencionada:** Plazos temporales específicos
   - "antes del viernes", "para el 15 de noviembre"

**Criterios de exclusión:**
❌ NO crear tareas para:
- Saludos o cortesías ("Espero que estés bien")
- Información general sin acción ("Te comento que...")
- Preguntas retóricas o contexto de fondo
- Emails de spam o promocionales

---

### 3.5.1 description (de cada tarea)

**Formato:** Verbo infinitivo + objeto + complemento (máximo 150 caracteres)

**Ejemplos correctos:**
✅ "Agendar reunión con cliente para presentar propuesta Q4 antes del viernes"
✅ "Enviar cotización de servicios cloud incluyendo costos de migración"
✅ "Revisar contrato actualizado y enviar feedback al equipo legal"

**Ejemplos incorrectos:**
❌ "Reunión" (falta verbo y contexto)
❌ "El cliente quiere que agendemos una reunión para..." (muy largo, no directo)

---

### 3.5.2 due_date (de cada tarea)

**Criterios de inferencia:**
- **Fecha explícita:** "antes del 15 de noviembre" → "2025-11-15T23:59:00Z"
- **Día específico:** "el viernes" → calcular próximo viernes desde received_at
- **Urgencia sin fecha:** "urgente", "ASAP" → +24 horas desde received_at
- **Plazo vago:** "esta semana", "pronto" → +3 días desde received_at
- **Sin mención temporal:** null

**Formato obligatorio:** ISO 8601 completo con timezone UTC
- ✅ Correcto: "2025-11-15T23:59:00Z"
- ❌ Incorrecto: "2025-11-15" (falta hora y timezone)

**Regla crítica:** Si no puedes inferir una fecha con al menos 70% de confianza, usa null

---

### 3.5.3 tags (de cada tarea)

**Objetivo:** Etiquetas temáticas para filtrado y agrupación en Kanban

**Categorías recomendadas:**
- **Tipo de acción:** "reunión", "llamada", "email", "documento", "cotización"
- **Área funcional:** "ventas", "soporte", "legal", "finanzas", "técnico"
- **Tema:** "propuesta", "contrato", "factura", "demo", "onboarding"

**Reglas:**
- Máximo 3 tags por tarea
- Usar minúsculas sin espacios
- Priorizar tags reutilizables y genéricos
- Si no hay tags claros, devolver array vacío []

**Ejemplos:**
- Tarea: "Agendar demo del producto para nuevo prospecto"
  → tags: ["reunión", "demo", "ventas"]
- Tarea: "Revisar contrato y enviar comentarios al equipo legal"
  → tags: ["documento", "contrato", "legal"]

---

### 3.5.4 participants (de cada tarea)

**Objetivo:** Lista de emails de personas involucradas en la tarea

**Criterios de inclusión:**
1. **Siempre incluir:** Email del remitente (campo "email" del input)
2. **Buscar en el cuerpo:** Menciones de emails en formato válido
3. **Buscar en CC/BCC:** Si están disponibles en el input (actualmente no)
4. **NO inventar:** Solo incluir emails explícitamente mencionados

**Formato:**
- Array de strings con emails válidos
- Validar formato con regex estándar de email
- Eliminar duplicados
- Si solo está el remitente, devolver array con un solo elemento

**Ejemplos:**
- Email solo del remitente → participants: ["cliente@empresa.com"]
- Email menciona: "Copia a juan@team.com en tu respuesta"
  → participants: ["cliente@empresa.com", "juan@team.com"]
`.trim();

// ============================================================
// 4. FORMATO DE SALIDA
// ============================================================
const OUTPUT_FORMAT = `
## 4.1 ESTRUCTURA DE RESPUESTA

Debes devolver un **array JSON** donde cada elemento corresponde al análisis de un email del input.

**FORMATO EXACTO:**

[
  {
    "email_id": "string (conservar ID original del input)",
    "category": "cliente" | "lead" | "interno" | "spam",
    "priority": "alta" | "media" | "baja",
    "summary": "string (máximo 100 caracteres)",
    "contact_name": "string (nombre extraído o inferido, 2-80 caracteres)",
    "tasks": [
      {
        "description": "string (10-150 caracteres)",
        "due_date": "string ISO 8601 con timezone UTC o null",
        "tags": ["string", "string"],
        "participants": ["email@valido.com"]
      }
    ]
  }
]

---

## 4.2 REGLAS CRÍTICAS DE FORMATO

**OBLIGATORIO:**
✅ Devolver ÚNICAMENTE el array JSON, sin texto adicional
✅ NO usar markdown (nada de \`\`\`json)
✅ NO incluir comentarios dentro del JSON
✅ Asegurar que sea JSON válido parseable con JSON.parse()
✅ Mantener el orden de emails igual que el input
✅ Incluir TODOS los emails del input, sin omitir ninguno

**VALORES POR DEFECTO:**
- Si no hay tareas detectadas: "tasks": []
- Si no se puede inferir fecha: "due_date": null
- Si no hay tags relevantes: "tags": []
- Participants siempre debe tener al menos el remitente

**VALIDACIONES AUTOMÁTICAS:**
- email_id debe coincidir con el campo "id" del email de entrada
- category debe ser exactamente uno de los 4 valores permitidos
- priority debe ser exactamente uno de los 3 valores permitidos
- summary entre 5-100 caracteres
- contact_name entre 2-80 caracteres
- Cada email en participants debe ser formato válido
`.trim();

// ============================================================
// 5. EJEMPLOS COMPLETOS (FEW-SHOT)
// ============================================================
const FEW_SHOT_EXAMPLES = `
## EJEMPLO 1: Email de Cliente Urgente con Múltiples Tareas

**INPUT:**
{
  "id": "email-001",
  "email": "cliente@empresa.com",
  "received_at": "2025-11-01T09:15:00Z",
  "subject": "Reunión urgente - Propuesta Q4",
  "body": "Hola equipo, necesito que revisemos la propuesta para el Q4 antes del viernes. El cliente está esperando nuestra respuesta urgente para poder cerrar el acuerdo antes del fin del mes. Por favor agenda una reunión y envíame el borrador actualizado del contrato. Saludos, María García - Directora Comercial"
}

**OUTPUT:**
{
  "email_id": "email-001",
  "category": "cliente",
  "priority": "alta",
  "summary": "Solicita revisión urgente de propuesta Q4 y reunión antes del viernes",
  "contact_name": "María García",
  "tasks": [
    {
      "description": "Agendar reunión para revisar propuesta Q4 antes del viernes",
      "due_date": "2025-11-03T23:59:00Z",
      "tags": ["reunión", "propuesta"],
      "participants": ["cliente@empresa.com"]
    },
    {
      "description": "Enviar borrador actualizado del contrato",
      "due_date": "2025-11-03T23:59:00Z",
      "tags": ["documento", "contrato"],
      "participants": ["cliente@empresa.com"]
    }
  ]
}

---

## EJEMPLO 2: Email de Lead - Primera Consulta

**INPUT:**
{
  "id": "email-002",
  "email": "prospecto@nuevaempresa.com",
  "received_at": "2025-11-05T14:30:00Z",
  "subject": "Consulta sobre servicios de consultoría",
  "body": "Buenos días, somos una startup en crecimiento y estamos buscando servicios de consultoría en transformación digital. ¿Podrían enviarnos información sobre sus paquetes y precios? Nos gustaría agendar una llamada exploratoria la próxima semana si es posible. Gracias, Juan Pérez - CTO"
}

**OUTPUT:**
{
  "email_id": "email-002",
  "category": "lead",
  "priority": "media",
  "summary": "Solicita información de servicios y llamada exploratoria próxima semana",
  "contact_name": "Juan Pérez",
  "tasks": [
    {
      "description": "Enviar información de paquetes y precios de consultoría",
      "due_date": "2025-11-08T23:59:00Z",
      "tags": ["email", "cotización", "ventas"],
      "participants": ["prospecto@nuevaempresa.com"]
    },
    {
      "description": "Agendar llamada exploratoria para próxima semana",
      "due_date": "2025-11-12T23:59:00Z",
      "tags": ["llamada", "demo", "ventas"],
      "participants": ["prospecto@nuevaempresa.com"]
    }
  ]
}

---

## EJEMPLO 3: Email Interno Informativo (Sin Tareas)

**INPUT:**
{
  "id": "email-003",
  "email": "rrhh@miempresa.com",
  "received_at": "2025-11-07T08:00:00Z",
  "subject": "Recordatorio: Capacitación de seguridad el jueves",
  "body": "Equipo, les recordamos que la capacitación obligatoria de seguridad informática será este jueves 9 de noviembre a las 10 AM en la sala de conferencias. La sesión durará aproximadamente 2 horas. Saludos, Departamento de RRHH"
}

**OUTPUT:**
{
  "email_id": "email-003",
  "category": "interno",
  "priority": "baja",
  "summary": "Recordatorio de capacitación de seguridad el jueves 10 AM",
  "contact_name": "Departamento de RRHH",
  "tasks": []
}

---

## EJEMPLO 4: Email de Spam

**INPUT:**
{
  "id": "email-004",
  "email": "ofertas@marketing-masivo.com",
  "received_at": "2025-11-08T12:00:00Z",
  "subject": "🎉 ¡OFERTA EXCLUSIVA! 50% de descuento HOY",
  "body": "¡No te lo pierdas! Oferta exclusiva solo por hoy. Haz clic aquí para obtener 50% de descuento en todos nuestros productos. Aprovecha esta oportunidad única. [ENLACE SOSPECHOSO]"
}

**OUTPUT:**
{
  "email_id": "email-004",
  "category": "spam",
  "priority": "baja",
  "summary": "Email promocional masivo no solicitado",
  "contact_name": "Marketing Masivo",
  "tasks": []
}

---

## EJEMPLO 5: Email con Múltiples Participantes y Tags Variados

**INPUT:**
{
  "id": "email-005",
  "email": "cliente.vip@corporacion.com",
  "received_at": "2025-11-09T16:45:00Z",
  "subject": "Escalamiento: Problema crítico en producción",
  "body": "URGENTE: Tenemos un problema crítico en el ambiente de producción que está afectando a 500+ usuarios. Necesito que coordinen con el equipo técnico (soporte@miempresa.com) y me envíen un reporte del incidente en las próximas 2 horas. Por favor, también incluyan al director de operaciones (director@miempresa.com) en todas las comunicaciones. Esto es de máxima prioridad. Carlos Rodríguez - VP de Tecnología"
}

**OUTPUT:**
{
  "email_id": "email-005",
  "category": "cliente",
  "priority": "alta",
  "summary": "Problema crítico en producción afectando 500+ usuarios",
  "contact_name": "Carlos Rodríguez",
  "tasks": [
    {
      "description": "Coordinar con equipo técnico para resolver problema crítico de producción",
      "due_date": "2025-11-09T18:45:00Z",
      "tags": ["técnico", "soporte", "urgente"],
      "participants": ["cliente.vip@corporacion.com", "soporte@miempresa.com", "director@miempresa.com"]
    },
    {
      "description": "Enviar reporte de incidente en las próximas 2 horas",
      "due_date": "2025-11-09T18:45:00Z",
      "tags": ["documento", "reporte", "técnico"],
      "participants": ["cliente.vip@corporacion.com", "director@miempresa.com"]
    }
  ]
}
`.trim();

// ============================================================
// 6. RESTRICCIONES Y CASOS ESPECIALES
// ============================================================
const CONSTRAINTS = `
## 6.1 VALIDACIONES OBLIGATORIAS

**Campos requeridos (no pueden ser null o vacíos):**
1. email_id (string)
2. category (enum estricto)
3. priority (enum estricto)
4. summary (string 5-100 chars)
5. contact_name (string 2-80 chars)
6. tasks (array, puede estar vacío pero no null)

**Validaciones de formato:**
- due_date: ISO 8601 completo o null (no fechas parciales)
- tags: array de strings sin espacios, máximo 3 elementos
- participants: array de emails válidos, mínimo 1 elemento (el remitente)
- summary: sin saltos de línea, sin caracteres especiales extraños

---

## 6.2 MANEJO DE CASOS ESPECIALES

**Emails en otros idiomas:**
- Si el email está en inglés, portugués u otro idioma: TRADUCIR el summary al español
- Mantener nombres propios en idioma original
- Las tareas también deben estar en español

**Emails sin cuerpo o muy cortos:**
- Si body está vacío: usar solo el subject para generar summary
- Si subject y body están vacíos: category="spam", priority="baja", tasks=[]

**Fechas ambiguas:**
- "la próxima semana" desde received_at: +7 días
- "el lunes" sin más contexto: próximo lunes desde received_at
- "fin de mes": último día del mes actual a las 23:59
- Si hay conflicto o ambigüedad: usar null y dejar que el usuario ajuste manualmente

**Emails muy largos (>2000 caracteres):**
- Priorizar el primer y último párrafo para extracción de tareas
- El summary debe capturar la idea central, no resumir todo el contenido

**Múltiples tareas similares:**
- Si hay acciones repetidas con diferentes participantes: crear tareas separadas
- Si es la misma acción mencionada varias veces: consolidar en una sola tarea

---

## 6.3 REGLAS DE CONSISTENCIA

**Al procesar múltiples emails:**
- Mantener consistencia en la clasificación de categorías y prioridades
- Usar el mismo estilo de redacción para summaries (verbos, estructura)
- Aplicar los mismos criterios de tags para facilitar filtrado

**Control de calidad:**
- Si tu confianza en la categorización es <70%: priorizar 'interno' sobre 'spam'
- Si no estás seguro de la prioridad: usar 'media' como valor por defecto
- Si una tarea parece vaga o genérica: NO incluirla (mejor tener 0 tareas que tareas inútiles)
`.trim();

// ============================================================
// CONSTRUCCIÓN DEL PROMPT FINAL
// ============================================================

interface EmailInput {
  id: string;
  email: string;
  received_at: string;
  subject: string;
  body: string;
}

export function buildEmailProcessingPrompt(emails: EmailInput[]): string {
  const emailsJSON = JSON.stringify(emails, null, 2);
  
  return `
${SYSTEM_CONTEXT}

═══════════════════════════════════════════════════════════════

${MAIN_INSTRUCTIONS}

═══════════════════════════════════════════════════════════════

${DECISION_CRITERIA}

═══════════════════════════════════════════════════════════════

${OUTPUT_FORMAT}

═══════════════════════════════════════════════════════════════

${FEW_SHOT_EXAMPLES}

═══════════════════════════════════════════════════════════════

${CONSTRAINTS}

═══════════════════════════════════════════════════════════════

## EMAILS A PROCESAR

A continuación se presenta el array JSON con los emails que debes analizar:

${emailsJSON}

═══════════════════════════════════════════════════════════════

**INSTRUCCIÓN FINAL:**

Procesa cada uno de los ${emails.length} emails del array anterior siguiendo ESTRICTAMENTE todas las reglas y criterios definidos.

Devuelve ÚNICAMENTE un array JSON válido con el análisis de cada email, sin texto adicional antes o después.

Comienza tu respuesta directamente con el carácter "[" y termina con "]".
`.trim();
}

// ============================================================
// FUNCIÓN DE VALIDACIÓN DE RESPUESTA
// ============================================================

export function validateEmailAnalysisResponse(
  response: unknown,
  expectedCount: number
): { valid: boolean; errors: string[]; data?: EmailAnalysis[] } {
  const errors: string[] = [];

  // Validar que sea un array
  if (!Array.isArray(response)) {
    errors.push("La respuesta no es un array JSON válido");
    return { valid: false, errors };
  }

  // Validar cantidad de elementos
  if (response.length !== expectedCount) {
    errors.push(
      `Se esperaban ${expectedCount} emails procesados, pero se recibieron ${response.length}`
    );
  }

  // Validar cada elemento con Zod
  const validatedData: EmailAnalysis[] = [];
  response.forEach((item, index) => {
    try {
      const validated = EmailAnalysisSchema.parse(item);
      validatedData.push(validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.push(
          `Email ${index + 1} (${item?.email_id || 'unknown'}): ${error.errors.map(e => e.message).join(', ')}`
        );
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    data: validatedData.length > 0 ? validatedData : undefined
  };
}

// ============================================================
// TIPOS EXPORTADOS
// ============================================================

export type { EmailInput };