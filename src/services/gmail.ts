// src/services/gmail.ts
import { google, gmail_v1 } from "googleapis";
import { prisma } from "@/lib/prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  // eslint-disable-next-line no-console
  console.warn(
    "[gmail-service] GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no están definidos. " +
      "Configura las variables de entorno para habilitar la integración con Gmail API."
  );
}

export interface GmailClientResult {
  success: boolean;
  client?: gmail_v1.Gmail;
  error?: string;
}

interface GmailAccountRecord {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  scope: string;
  tokenType: string;
  expiryDate: Date;
  lastSyncAt: Date | null;
}

type PrismaGmailAccountDelegate = {
  findUnique: (args: {
    where: { userId: string };
  }) => Promise<GmailAccountRecord | null>;
  update: (args: {
    where: { id: string };
    data: Partial<Pick<GmailAccountRecord, "accessToken" | "expiryDate">>;
  }) => Promise<GmailAccountRecord>;
};

const prismaWithGmail = prisma as typeof prisma & {
  gmailAccount: PrismaGmailAccountDelegate;
};

function isTokenExpired(expiryDate: Date): boolean {
  const now = Date.now();
  const expiryTime = expiryDate.getTime();
  const safetyWindowMs = 60 * 1000;
  return expiryTime - now <= safetyWindowMs;
}

function createOAuth2Client() {
  if (!googleClientId || !googleClientSecret) {
    return null;
  }

  return new google.auth.OAuth2({
    clientId: googleClientId,
    clientSecret: googleClientSecret,
  });
}

export async function createGmailClientForUser(
  userId: string
): Promise<GmailClientResult> {
  if (!googleClientId || !googleClientSecret) {
    return {
      success: false,
      error:
        "GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no están configurados. No es posible inicializar el cliente de Gmail.",
    };
  }

  const gmailAccount = await prismaWithGmail.gmailAccount.findUnique({
    where: { userId },
  });

  if (!gmailAccount) {
    return {
      success: false,
      error: "GMAIL_ACCOUNT_NOT_FOUND",
    };
  }

  const oauth2Client = createOAuth2Client();
  if (!oauth2Client) {
    return {
      success: false,
      error: "No se pudo inicializar el cliente OAuth2 para Gmail.",
    };
  }

  oauth2Client.setCredentials({
    access_token: gmailAccount.accessToken,
    refresh_token: gmailAccount.refreshToken,
  });

  let accessToken = gmailAccount.accessToken;
  let expiryDate = gmailAccount.expiryDate;

  if (isTokenExpired(expiryDate)) {
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      if (credentials.access_token && credentials.expiry_date) {
        accessToken = credentials.access_token;
        expiryDate = new Date(credentials.expiry_date);

        await prismaWithGmail.gmailAccount.update({
          where: { id: gmailAccount.id },
          data: {
            accessToken,
            expiryDate,
          },
        });

        oauth2Client.setCredentials({
          access_token: accessToken,
          refresh_token: gmailAccount.refreshToken,
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        "[gmail-service] Error al refrescar el token de Gmail",
        error
      );
      return {
        success: false,
        error: "ERROR_REFRESHING_GMAIL_TOKEN",
      };
    }
  }

  const client = google.gmail({
    version: "v1",
    auth: oauth2Client,
  });

  return {
    success: true,
    client,
  };
}