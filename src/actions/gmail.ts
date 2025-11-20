"use server";

import type { gmail_v1 } from "googleapis";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireCurrentUserId } from "@/lib/auth-session";
import { createGmailClientForUser } from "@/services/gmail";
import { isEmailProcessableFromText } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Tipos y helpers comunes
// -----------------------------------------------------------------------------

// Schema de email importado desde Gmail (estructura mínima que persistiremos)
const GmailEmailSchema = z.object({
  idEmail: z.string().min(1, "El ID del mensaje de Gmail es requerido"),
  from: z.string().min(1, "El remitente es requerido"),
  subject: z.string().min(1, "El asunto es requerido"),
  body: z.string().min(1, "El cuerpo del mensaje es requerido"),
  receivedAt: z.date(),
  isProcessable: z.boolean().default(true),
});

type GmailEmailInput = z.infer<typeof GmailEmailSchema>;

export interface GmailImportResult {
  success: boolean;
  imported: number;
  nonProcessable: number;
  errors: string[];
}

/**
 * Extrae la dirección de email desde un header From completo.
 * Ejemplos:
 *  - "Nombre Apellido <correo@ejemplo.com>" -> "correo@ejemplo.com"
 *  - "\"Nombre\" <correo@ejemplo.com>"      -> "correo@ejemplo.com"
 *  - "correo@ejemplo.com"                  -> "correo@ejemplo.com"
 */
function extractEmailAddress(rawFrom: string | null | undefined): string {
  if (!rawFrom) return "";
  const match = rawFrom.match(/<([^>]+)>/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return rawFrom.trim();
}

/**
 * Decodifica contenido base64 URL-safe utilizado por Gmail.
 */
function decodeBase64Url(data: string | null | undefined): string {
  if (!data) return "";
  try {
    const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
    const buffer = Buffer.from(normalized, "base64");
    return buffer.toString("utf8");
  } catch {
    return "";
  }
}

/**
 * Busca recursivamente el mejor cuerpo de texto desde el payload de Gmail.
 * - Prioriza text/plain.
 * - Si no existe, usa text/html como fallback.
 */
function extractBodyFromPayload(
  payload: gmail_v1.Schema$MessagePart | null | undefined
): string {
  if (!payload) return "";

  // Si el propio payload es texto
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }

  let htmlFallback = "";

  if (payload.mimeType === "text/html" && payload.body?.data) {
    htmlFallback = decodeBase64Url(payload.body.data);
  }

  // Si hay partes hijas, recorrerlas
  if (Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      const text = extractBodyFromPayload(part);
      if (text) {
        // Si encontramos texto plano, lo devolvemos inmediatamente
        if (part.mimeType === "text/plain") {
          return text;
        }
        // Si es HTML, lo guardamos como fallback
        if (!htmlFallback && part.mimeType === "text/html") {
          htmlFallback = text;
        }
      }
    }
  }

  return htmlFallback;
}

/**
 * Obtiene el valor de un header específico (ignorando mayúsculas/minúsculas).
 */
function getHeaderValue(
  headers: gmail_v1.Schema$MessagePartHeader[] | null | undefined,
  name: string
): string | null {
  if (!headers) return null;
  const target = name.toLowerCase();
  const header = headers.find(
    (h) => typeof h.name === "string" && h.name.toLowerCase() === target
  );
  return (header?.value as string | undefined) ?? null;
}

/**
 * Convierte un mensaje completo de Gmail a un objeto GmailEmailInput validado con Zod.
 * Aplica la heurística de isEmailProcessableFromText para marcar isProcessable.
 */
function mapGmailMessageToEmailInput(
  message: gmail_v1.Schema$Message
): GmailEmailInput | null {
  const id = message?.id as string | undefined;
  const payload = message?.payload ?? null;
  const headers = payload?.headers ?? null;

  if (!id || !payload) {
    return null;
  }

  const fromRaw = getHeaderValue(headers, "From");
  const subjectRaw = getHeaderValue(headers, "Subject") ?? "(Sin asunto)";

  const from = extractEmailAddress(fromRaw);
  const subject = subjectRaw.trim() || "(Sin asunto)";

  // Extraer cuerpo en bruto
  const rawBody = extractBodyFromPayload(payload);
  const isProcessable = isEmailProcessableFromText(rawBody);

  // Para cumplir con el schema y evitar strings vacíos, sustituimos por "(Sin contenido)" solo para body
  const body = rawBody.trim().length === 0 ? "(Sin contenido)" : rawBody;

  // Fecha de recepción: preferimos internalDate; si no, header Date; si no, ahora
  let receivedAt: Date;
  if (message.internalDate) {
    const ms = Number(message.internalDate);
    receivedAt = Number.isFinite(ms) ? new Date(ms) : new Date();
  } else {
    const dateHeader = getHeaderValue(headers, "Date");
    const parsed = dateHeader ? new Date(dateHeader) : new Date();
    receivedAt = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  const candidate = {
    idEmail: id,
    from,
    subject,
    body,
    receivedAt,
    isProcessable,
  };

  const parsed = GmailEmailSchema.safeParse(candidate);
  if (!parsed.success) {
    // Podemos loguear en servidor para depuración sin exponer datos sensibles
    // eslint-disable-next-line no-console
    console.warn(
      "[gmail-actions] Mensaje descartado por validación Zod",
      parsed.error.flatten()
    );
    return null;
  }

  return parsed.data;
}

/**
 * Obtiene la lista de mensajes recientes (últimos N días) para un usuario,
 * y los mapea a objetos GmailEmailInput listos para ser persistidos.
 *
 * Capa 1 (Gmail API): se usa query optimizada para excluir categorías irrelevantes.
 */
async function fetchRecentGmailEmailsForUser(
  userId: string,
  days: number
): Promise<{
  emails: GmailEmailInput[];
  error?: string;
}> {
  const clientResult = await createGmailClientForUser(userId);
  if (!clientResult.success || !clientResult.client) {
    return {
      emails: [],
      error: clientResult.error ?? "No se pudo inicializar el cliente de Gmail.",
    };
  }

  const client = clientResult.client;
  try {
    const safeDays = Number.isFinite(days) && days > 0 ? Math.floor(days) : 7;

    const listResponse = await client.users.messages.list({
      userId: "me",
      q: `in:inbox newer_than:${safeDays}d -category:promotions -category:social -category:updates`,
      maxResults: 100,
    });

    const messages = listResponse.data.messages ?? [];
    if (messages.length === 0) {
      return {
        emails: [],
      };
    }

    const results: GmailEmailInput[] = [];

    for (const msg of messages) {
      if (!msg.id) continue;

      try {
        const detail = await client.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full",
        });

        const mapped = mapGmailMessageToEmailInput(detail.data);
        if (mapped) {
          results.push(mapped);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          "[gmail-actions] Error al obtener detalle de mensaje Gmail",
          {
            messageId: msg.id,
            error,
          }
        );
        // Continuamos con el siguiente mensaje
      }
    }

    return {
      emails: results,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      "[gmail-actions] Error al listar mensajes recientes de Gmail",
      error
    );
    return {
      emails: [],
      error: "ERROR_LISTING_GMAIL_MESSAGES",
    };
  }
}

// -----------------------------------------------------------------------------
// Estado de conexión Gmail (GmailAccount.lastSyncAt / existencia de cuenta)
// -----------------------------------------------------------------------------

type GmailAccountStatusRecord = {
  userId: string;
  lastSyncAt: Date | null;
};

type PrismaGmailAccountStatusDelegate = {
  findUnique: (args: {
    where: { userId: string };
  }) => Promise<GmailAccountStatusRecord | null>;
};

type PrismaGmailAccountUpdateDelegate = {
  update: (args: {
    where: { userId: string };
    data: { lastSyncAt: Date };
  }) => Promise<void>;
};

const prismaWithGmailStatus = prisma as typeof prisma & {
  gmailAccount: PrismaGmailAccountStatusDelegate & PrismaGmailAccountUpdateDelegate;
};

export interface GmailConnectionStatusResult {
  success: boolean;
  connected: boolean;
  lastSyncAt: Date | null;
  error?: string;
}

/**
 * Obtiene el estado de conexión de Gmail para el usuario autenticado.
 * - connected: true si existe un GmailAccount asociado al usuario.
 * - lastSyncAt: fecha de última sincronización si existe.
 */
export async function getGmailConnectionStatusForCurrentUser(): Promise<GmailConnectionStatusResult> {
  try {
    const userId = await requireCurrentUserId();

    const account = await prismaWithGmailStatus.gmailAccount.findUnique({
      where: { userId },
    });

    if (!account) {
      return {
        success: true,
        connected: false,
        lastSyncAt: null,
      };
    }

    return {
      success: true,
      connected: true,
      lastSyncAt: account.lastSyncAt ?? null,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      "[gmail-actions] Error al obtener estado de conexión Gmail",
      error
    );
    return {
      success: false,
      connected: false,
      lastSyncAt: null,
      error: "Error al consultar el estado de conexión con Gmail.",
    };
  }
}

// -----------------------------------------------------------------------------
// Server Action: importación de correos recientes (últimos 7 días)
// -----------------------------------------------------------------------------

/**
 * Importa correos recientes de Gmail (últimos N días, Inbox filtrado) para el usuario autenticado.
 * - Usa Gmail API para obtener mensajes recientes con query optimizada (Capa 1).
 * - Evalúa contenido para marcar isProcessable (Capa 2).
 * - Inserta en Email uno por uno, sin transacción larga (evita timeout).
 * - Ignora errores de clave única (P2002) para no duplicar por idEmail.
 *
 * @param rangeDays Número de días hacia atrás a considerar (1 = hoy, 7 = últimos 7 días, etc.)
 */
export async function importGmailInboxForCurrentUser(
  rangeDays: number = 7,
): Promise<GmailImportResult> {
  try {
    const userId = await requireCurrentUserId();

    const effectiveRangeDays =
      Number.isFinite(rangeDays) && rangeDays > 0 ? Math.floor(rangeDays) : 7;

    const { emails, error } = await fetchRecentGmailEmailsForUser(
      userId,
      effectiveRangeDays,
    );

    if (error && emails.length === 0) {
      // Error crítico sin datos aprovechables
      if (error === "GMAIL_ACCOUNT_NOT_FOUND") {
        return {
          success: false,
          imported: 0,
          nonProcessable: 0,
          errors: [
            "Debes conectar tu cuenta de Gmail antes de importar correos.",
          ],
        };
      }

      if (error === "ERROR_REFRESHING_GMAIL_TOKEN") {
        return {
          success: false,
          imported: 0,
          nonProcessable: 0,
          errors: [
            "Error al refrescar tus credenciales de Gmail. Debes reconectar tu cuenta.",
          ],
        };
      }

      return {
        success: false,
        imported: 0,
        nonProcessable: 0,
        errors: ["Error al conectar con Gmail. Intenta nuevamente más tarde."],
      };
    }

    if (emails.length === 0) {
      // No hay mensajes nuevos que procesar
      return {
        success: true,
        imported: 0,
        nonProcessable: 0,
        errors: [],
      };
    }

    let imported = 0;
    let nonProcessable = 0;
    const errorsList: string[] = [];

    // Persistencia: insertamos email por email, sin transacción larga.
    for (const email of emails) {
      try {
        await prisma.email.create({
          data: {
            idEmail: email.idEmail,
            from: email.from,
            subject: email.subject,
            body: email.body,
            receivedAt: email.receivedAt,
            processedAt: null,
            approvedAt: null,
            userId,
            isProcessable: email.isProcessable,
          },
        });
        imported += 1;
        if (!email.isProcessable) {
          nonProcessable += 1;
        }
      } catch (createError: unknown) {
        // Si es un error de clave única (correo ya importado), lo ignoramos para evitar duplicados
        if (
          typeof createError === "object" &&
          createError !== null &&
          "code" in createError &&
          (createError as { code?: string }).code === "P2002"
        ) {
          continue;
        }

        // eslint-disable-next-line no-console
        console.error(
          "[gmail-actions] Error al persistir email importado desde Gmail",
          { idEmail: email.idEmail, error: createError }
        );
        errorsList.push(`Error al guardar el email con ID ${email.idEmail}`);
      }
    }

    // Actualizar marca de última sincronización si al menos intentamos importar
    try {
      await prismaWithGmailStatus.gmailAccount.update({
        where: { userId },
        data: { lastSyncAt: new Date() },
      });
    } catch (updateError) {
      // eslint-disable-next-line no-console
      console.warn(
        "[gmail-actions] No se pudo actualizar lastSyncAt en GmailAccount",
        updateError
      );
    }

    // Revalidar vistas relevantes
    if (imported > 0) {
      revalidatePath("/emails");
      revalidatePath("/dashboard");
      revalidatePath("/");
    }

    return {
      success: imported > 0 || errorsList.length === 0,
      imported,
      nonProcessable,
      errors: errorsList,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[gmail-actions] Error crítico en importación de Gmail", error);
    return {
      success: false,
      imported: 0,
      nonProcessable: 0,
      errors: ["Error crítico en el servidor al importar desde Gmail."],
    };
  }
}
