# OpenAI Service (HITO 1)

Servicio de integración con OpenAI para procesamiento inteligente de emails.
Incluye: cliente singleton, prompts estructurados, validación Zod, procesamiento batch (<=10), retry con backoff exponencial, rate limiting básico y logging de uso/costos.

## Archivos relevantes

- src/services/openai.ts
- src/lib/prompts/email-processing.ts
- src/types/ai.ts

## Requisitos de entorno

Configura en .env:
OPENAI_API_KEY=

Opcionales:
OPENAI_MODEL_PRIMARY=gpt-4-turbo
OPENAI_MODEL_FALLBACK=gpt-3.5-turbo

## API

`processEmailsBatch(emails: EmailInput[]): Promise<ProcessBatchResult>`

Tipos clave: EmailInput, EmailAnalysis, ProcessBatchResult, TokenUsage

ProcessBatchResult:
- analyses: EmailAnalysis[]
- modelUsed: string
- usage?: { promptTokens?, completionTokens?, totalTokens?, costUSDApprox? }
- rawText?: string
- errors?: string[]

## Ejemplo de uso

```ts
import { processEmailsBatch } from "@/services/openai";
import type { EmailInput } from "@/types/ai";

const emails: EmailInput[] = [
  { id: "e-1", email: "cliente@empresa.com", received_at: "2025-11-01T09:15:00Z", subject: "...", body: "..." },
  { id: "e-2", email: "interno@miempresa.com", received_at: "2025-11-02T12:00:00Z", subject: "...", body: "..." },
];

(async () => {
  const res = await processEmailsBatch(emails);
  if (res.errors?.length) {
    console.warn("Validación con advertencias:", res.errors);
  }
  console.log("Modelo:", res.modelUsed);
  console.log("Analyses:", res.analyses);
  console.log("Uso estimado:", res.usage);
})();
```

## Seguridad y Sanitización

- Antes de enviar el prompt, se sanitizan subject y body con `sanitizeTextForAI` para enmascarar posibles secrets/tokens.
- No envíes claves ni PII innecesaria.

## Rate limiting

- Intervalo mínimo de 300ms entre requests en memoria (RateLimiter).
- Ajustable en RATE_MIN_INTERVAL_MS.

## Retry y manejo de errores

- Hasta 3 intentos con backoff exponencial base 500ms + jitter.
- Se reintenta ante 429 y 5xx, o errores de red ETIMEDOUT/ECONNRESET/EAI_AGAIN.
- Si el modelo primario falla, se usa fallback automáticamente.

## Logging de uso y costos

- Se calcula costo aproximado a partir de `usage` devuelto por OpenAI y tarifas de referencia.
- Se loguea: prompt/completion/total tokens y costo aproximado por request.

## Validación de respuesta

- La respuesta del modelo debe ser un array JSON; se extrae la primera secuencia `[ ... ]` si el modelo agregó texto.
- Se valida con Zod (`EmailAnalysisSchema`).
- En caso de discrepancia en la cantidad esperada de elementos, se retorna en `errors`.

## Testing con mock

- El servicio permite inyectar un cliente mock con `__setOpenAIClientForTesting` para pruebas sin llamar a OpenAI:

```ts
import { __setOpenAIClientForTesting, processEmailsBatch } from "@/services/openai";
import type { OpenAIChatLike } from "@/services/openai";
import type { EmailInput } from "@/types/ai";

const fakeClient: OpenAIChatLike = {
  chat: {
    completions: {
      async create({ model, messages, temperature }) {
        const content = JSON.stringify([
          {
            email_id: "e-1",
            category: "cliente",
            priority: "alta",
            summary: "Ejemplo de análisis",
            contact_name: "Cliente Ejemplo",
            tasks: [
              {
                description: "Agendar reunión",
                due_date: null,
                tags: ["reunión"],
                participants: ["cliente@empresa.com"]
              }
            ]
          }
        ]);
        return {
          choices: [{ message: { role: "assistant", content } }],
          usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 }
        };
      }
    }
  }
};

__setOpenAIClientForTesting(fakeClient as unknown as any);

(async () => {
  const inputs: EmailInput[] = [
    { id: "e-1", email: "cliente@empresa.com", received_at: "2025-11-01T09:15:00Z", subject: "S", body: "B" }
  ];
  const res = await processEmailsBatch(inputs);
  console.log(res.analyses[0].email_id); // "e-1"
})();
```

- Puedes ejecutar pruebas manuales con tsx:

```bash
npx tsx src/tests/openai.mock.test.ts
```

## Límites y consideraciones

- Tamaño máximo batch: 10.
- `temperature` por defecto 0.2 para respuestas más determinísticas.
- Diseñado para Server Actions (no desde el cliente).