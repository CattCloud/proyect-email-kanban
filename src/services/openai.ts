/* eslint-disable no-console */
import OpenAI from "openai";
import { buildEmailProcessingPrompt, validateEmailAnalysisResponse } from "@/lib/prompts/email-processing";
import type { EmailInput, EmailAnalysis } from "@/types/ai";

/**
 * Servicio OpenAI - HITO 1
 * - Cliente singleton
 * - Procesamiento batch (máx 10 emails)
 * - GPT-4 primario, GPT-3.5 fallback
 * - Retry con backoff exponencial en errores transitorios
 * - Rate limiting básico (min interval entre requests)
 * - Logging de tokens y costo aproximado
 * - Sanitización previa se realiza en el builder del prompt
 */

// ========================= Configuración =========================
const MODEL_PRIMARY = process.env.OPENAI_MODEL_PRIMARY ?? "gpt-4-turbo";
//const MODEL_PRIMARY = process.env.OPENAI_MODEL_PRIMARY ?? "gpt-3.5-turbo";
const MODEL_FALLBACK = process.env.OPENAI_MODEL_FALLBACK ?? "gpt-3.5-turbo";

const MAX_BATCH = 10;
const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 500;
const RATE_MIN_INTERVAL_MS = 300;

// Precios aproximados USD por 1K tokens (pueden variar, solo referencia)
const PRICING_USD_PER_1K: Record<string, { prompt: number; completion: number }> = {
  "gpt-4-turbo": { prompt: 0.01, completion: 0.03 },
  "gpt-3.5-turbo": { prompt: 0.0005, completion: 0.0015 },
};

// Flag de depuración para imprimir respuestas de IA en consola (solo desarrollo)
const OPENAI_DEBUG = process.env.OPENAI_DEBUG === "1";

// ========================= Utilidades =========================

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

class RateLimiter {
  private last = 0;
  constructor(private minIntervalMs: number) {}
  async wait() {
    const now = Date.now();
    const waitFor = Math.max(0, this.minIntervalMs - (now - this.last));
    if (waitFor > 0) {
      await delay(waitFor);
    }
    this.last = Date.now();
  }
}
const rateLimiter = new RateLimiter(RATE_MIN_INTERVAL_MS);

type HttpLikeError = {
  status?: number;
  response?: { status?: number };
  cause?: { status?: number; code?: string };
  code?: string;
};

function isRetryableError(err: unknown): boolean {
  const e = (err as Partial<HttpLikeError>) ?? {};
  const status = e.status ?? e.response?.status ?? e.cause?.status;
  const code = e.code ?? e.cause?.code;

  if (typeof status === "number" && (status === 429 || (status >= 500 && status < 600))) {
    return true;
  }
  if (typeof code === "string" && ["ETIMEDOUT", "ECONNRESET", "EAI_AGAIN"].includes(code)) {
    return true;
  }
  // En casos ambiguos, no reintentar por defecto
  return false;
}

function computeApproxCostUSD(
  model: string,
  promptTokens?: number,
  completionTokens?: number
): number | undefined {
  if (!promptTokens && !completionTokens) return undefined;
  const pricing = PRICING_USD_PER_1K[model];
  if (!pricing) return undefined;
  const p = (promptTokens ?? 0) / 1000;
  const c = (completionTokens ?? 0) / 1000;
  return parseFloat(((p * pricing.prompt) + (c * pricing.completion)).toFixed(6));
}

function logUsage(
  model: string,
  rawUsage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number },
  costUSD?: number
): void {
  if (!rawUsage) return;
  const prompt = rawUsage.prompt_tokens ?? 0;
  const completion = rawUsage.completion_tokens ?? 0;
  const total = rawUsage.total_tokens ?? (prompt + completion);
  // Logging informativo (no datos sensibles)
  console.info(
    `[OpenAI][${model}] usage prompt=${prompt} completion=${completion} total=${total} cost≈$${(costUSD ?? 0).toFixed(6)}`
  );
}

function extractJSONArray(text: string): string {
  // Extrae la primera secuencia tipo array JSON desde el contenido
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) {
    // Si no encuentra brackets, retorna original (luego fallará JSON.parse con error claro)
    return text.trim();
  }
  return text.substring(start, end + 1).trim();
}

// ========================= Singleton =========================

let _client: OpenAI | null = null;

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export interface OpenAIChatCompletion {
  create(args: {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
  }): Promise<{
    choices: Array<{ message?: { role?: string; content?: string } }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  }>;
}

export type OpenAIChatLike = {
  chat: { completions: OpenAIChatCompletion };
};

/**
 * Permite inyectar un cliente mock para testing unitario.
 * Nota: Restablece el singleton al mock provisto.
 */
export function __setOpenAIClientForTesting(fake: OpenAIChatLike) {
  _client = fake as unknown as OpenAI;
}

export function getOpenAIClient(): OpenAI {
  if (_client) return _client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY no configurado. Defínelo en .env");
  }
  _client = new OpenAI({ apiKey });
  return _client;
}

// ========================= Tipos de retorno =========================

export interface TokenUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  costUSDApprox?: number;
}

export interface ProcessBatchResult {
  analyses: EmailAnalysis[];
  modelUsed: string;
  usage?: TokenUsage;
  rawText?: string; // útil para debug/logging
  errors?: string[]; // errores de validación Zod, si existen
}

// ========================= Llamada OpenAI con retry =========================

async function generateWithRetry(model: string, prompt: string) {
  let attempt = 0;
  // Nota: forzamos rate limit básico por request
  while (attempt < MAX_ATTEMPTS) {
    try {
      await rateLimiter.wait();
      const client = getOpenAIClient();
      const res = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: "Eres un analista que devuelve exclusivamente JSON válido. Sigue estrictamente las instrucciones." },
        // prompt contiene todas las instrucciones y los emails ya saneados
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      });
      return res;
    } catch (err) {
      attempt += 1;
      if (attempt >= MAX_ATTEMPTS || !isRetryableError(err)) {
        throw err;
      }
      const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
      const jitter = Math.floor(Math.random() * 150);
      await delay(backoff + jitter);
    }
  }
  // No debería llegar aquí
  throw new Error("Fallo inesperado tras reintentos");
}

// ========================= API principal =========================

/**
 * Procesa un batch de emails (máx 10) usando OpenAI.
 * - Construye prompt (con sanitización)
 * - Intenta con modelo primario y retorna
 * - Si hay error de modelo/llamada, intenta fallback
 * - Valida respuesta con Zod y retorna estructura tipada
 */
export async function processEmailsBatch(
  emails: EmailInput[],
  existingTags: string[] = []
): Promise<ProcessBatchResult> {
  if (emails.length === 0) {
    return { analyses: [], modelUsed: MODEL_PRIMARY, usage: undefined, rawText: "[]" };
  }
  if (emails.length > MAX_BATCH) {
    throw new Error(`Se permite máximo ${MAX_BATCH} emails por batch`);
  }

  const prompt = buildEmailProcessingPrompt(emails, existingTags);

  // Intento primario
  try {
    const r = await generateWithRetry(MODEL_PRIMARY, prompt);
    const content = r.choices?.[0]?.message?.content ?? "";
    const jsonText = extractJSONArray(content);
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      // Si no parsea, intentamos fallback directamente
      throw new Error(`JSON inválido del modelo primario: ${(err as Error).message}`);
    }

    const validation = validateEmailAnalysisResponse(parsed, emails.length);
    const costPrimary = r.usage
      ? computeApproxCostUSD(
          MODEL_PRIMARY,
          r.usage.prompt_tokens,
          r.usage.completion_tokens
        )
      : undefined;
    const usage = r.usage
      ? {
          promptTokens: r.usage.prompt_tokens,
          completionTokens: r.usage.completion_tokens,
          totalTokens: r.usage.total_tokens,
          costUSDApprox: costPrimary,
        }
      : undefined;
    logUsage(MODEL_PRIMARY, r.usage, costPrimary);

    if (OPENAI_DEBUG) {
      console.log("[OpenAI][DEBUG][primary] raw:", content.slice(0, 400));
    }
    console.log(`[OpenAI][${MODEL_PRIMARY}] analyses:`, validation.data);

    return {
      analyses: validation.data ?? [],
      modelUsed: MODEL_PRIMARY,
      usage,
      rawText: content,
      errors: validation.valid ? undefined : validation.errors,
    };
  } catch (primaryErr) {
    // Fallback
    try {
      const r = await generateWithRetry(MODEL_FALLBACK, prompt);
      const content = r.choices?.[0]?.message?.content ?? "";
      const jsonText = extractJSONArray(content);
      const parsed = JSON.parse(jsonText);

      const validation = validateEmailAnalysisResponse(parsed, emails.length);
      const costFallback = r.usage
        ? computeApproxCostUSD(
            MODEL_FALLBACK,
            r.usage.prompt_tokens,
            r.usage.completion_tokens
          )
        : undefined;
      const usage = r.usage
        ? {
            promptTokens: r.usage.prompt_tokens,
            completionTokens: r.usage.completion_tokens,
            totalTokens: r.usage.total_tokens,
            costUSDApprox: costFallback,
          }
        : undefined;
      logUsage(MODEL_FALLBACK, r.usage, costFallback);
  
      if (OPENAI_DEBUG) {
        console.log("[OpenAI][DEBUG][fallback] raw:", content.slice(0, 400));
      }
      console.log(`[OpenAI][${MODEL_FALLBACK}] analyses:`, validation.data);
  
      return {
        analyses: validation.data ?? [],
        modelUsed: MODEL_FALLBACK,
        usage,
        rawText: content,
        errors: validation.valid ? undefined : validation.errors,
      };
    } catch (fallbackErr) {
      // Reportar error con detalle de primario/fallback
      const detail = [
        `Primario (${MODEL_PRIMARY}) falló: ${(primaryErr as Error)?.message ?? primaryErr}`,
        `Fallback (${MODEL_FALLBACK}) falló: ${(fallbackErr as Error)?.message ?? fallbackErr}`,
      ].join(" | ");
      throw new Error(`Procesamiento IA falló. ${detail}`);
    }
  }
}