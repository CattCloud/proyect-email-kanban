import { z } from "zod";

/**
 * Tipos y Schemas de IA
 * Reglas clave del Sistema Maestro:
 * - TypeScript estricto (sin any)
 * - Validación con Zod antes de procesar/guardar datos externos (R7)
 * - Exportar tipos desde archivos dedicados en src/types/ (R1)
 */

/**
 * Regex ISO 8601 con timezone UTC (termina en 'Z')
 * Formatos aceptados:
 * - YYYY-MM-DDTHH:mmZ
 * - YYYY-MM-DDTHH:mm:ssZ
 * - YYYY-MM-DDTHH:mm:ss.sssZ
 */
export const ISO_UTC_REGEX = new RegExp(
  "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}(:\\d{2})?(\\.\\d+)?Z$"
);

export function isIsoUtc(value: string): boolean {
  return ISO_UTC_REGEX.test(value);
}

/**
 * Email válido (valida con Zod .email())
 */
const EmailStringSchema = z.string().email("Formato de email inválido");

/**
 * Entrada mínima requerida para construir el prompt de IA
 * Equivale a la estructura de ingesta definida en PromptPropuesto.md
 */
export interface EmailInput {
  id: string;
  email: string;
  received_at: string; // ISO 8601
  subject: string;
  body: string;
}

/**
 * Normaliza un tag:
 * - trim
 * - a minúsculas
 * - reemplaza espacios por guiones
 */
const TagStringSchema = z
  .string()
  .min(1, "El tag no puede estar vacío")
  .transform((s) => s.trim().toLowerCase().replace(/\s+/g, "-"));

/**
 * Schema de Task (Zod)
 * Reglas adicionales del HITO 1:
 * - due_date: ISO 8601 obligatorio en UTC si no es null
 * - tags: máximo 3 elementos
 * - participants: emails válidos, al menos 1
 */
export const TaskSchema = z.object({
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(150, "La descripción no debe exceder 150 caracteres"),
  due_date: z
    .string()
    .nullable()
    .refine(
      (val) => val === null || isIsoUtc(val),
      "due_date debe ser fecha ISO 8601 completa en UTC (terminada en 'Z') o null"
    ),
  tags: z.array(TagStringSchema).max(3, "Máximo 3 tags por tarea").default([]),
  participants: z
    .array(EmailStringSchema)
    .min(1, "Debe incluir al menos el email del remitente"),
});

/**
 * Schema de EmailAnalysis (Zod)
 * Reglas:
 * - category: enum estricto
 * - priority: enum estricto
 * - summary: 5-100 chars, sin saltos de línea
 * - contact_name: 2-80 chars
 * - tasks: array de TaskSchema
 */
export const EmailAnalysisSchema = z.object({
  email_id: z.string().min(1, "email_id requerido"),
  category: z.enum(["cliente", "lead", "interno", "spam"]),
  priority: z.enum(["alta", "media", "baja"]),
  summary: z
    .string()
    .min(5, "El resumen debe tener al menos 5 caracteres")
    .max(100, "El resumen no debe exceder 100 caracteres")
    .refine((s) => !/\r|\n/.test(s), "El resumen no debe contener saltos de línea"),
  contact_name: z
    .string()
    .min(2, "El nombre de contacto debe tener al menos 2 caracteres")
    .max(80, "El nombre de contacto no debe exceder 80 caracteres"),
  tasks: z.array(TaskSchema),
});

/**
 * Tipos inferidos
 */
export type Task = z.infer<typeof TaskSchema>;
export type EmailAnalysis = z.infer<typeof EmailAnalysisSchema>;

/**
 * Resultado tipado para validaciones de respuesta de IA
 */
export interface ValidateEmailAnalysisResult {
  valid: boolean;
  errors: string[];
  data?: EmailAnalysis[];
}

/**
 * Utilidad: Sanitiza texto antes de enviarlo a IA (evita exponer secretos).
 * - Redacta cadenas largas de tipo clave/API
 * - Redacta tokens tipo "sk-..." u otras secuencias alfanuméricas largas
 */
export function sanitizeTextForAI(input: string): string {
  // Redactar posibles claves (sk-...) y secuencias largas sin espacios
  const patterns: RegExp[] = [
    /\bsk-[A-Za-z0-9_\-]{10,}\b/g, // Claves OpenAI
    /\b[A-Za-z0-9]{24,}\b/g, // tokens largos genéricos
  ];
  let output = input;
  for (const p of patterns) {
    output = output.replace(p, "[REDACTED]");
  }
  return output;
}