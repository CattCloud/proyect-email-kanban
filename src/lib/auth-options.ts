// src/lib/auth-options.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  // En desarrollo avisamos si faltan variables de entorno para Google OAuth.
  // eslint-disable-next-line no-console
  console.warn(
    "[auth-options] GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no están definidos. " +
      "Configura las variables de entorno para habilitar el login con Google."
  );
}

type PrismaUserDelegate = {
  upsert: (args: {
    where: { email: string };
    update: { name: string | null; image: string | null };
    create: { email: string; name: string | null; image: string | null };
  }) => Promise<{ id: string; email: string }>;
};

type GmailAccountTokensUpdate = {
  accessToken: string;
  refreshToken: string;
  scope: string;
  tokenType: string;
  expiryDate: Date;
};

type GmailAccountTokensCreate = GmailAccountTokensUpdate & {
  userId: string;
};

type PrismaGmailAccountDelegate = {
  upsert: (args: {
    where: { userId: string };
    update: GmailAccountTokensUpdate;
    create: GmailAccountTokensCreate;
  }) => Promise<void>;
};

const prismaWithUserAndGmail = prisma as typeof prisma & {
  user: PrismaUserDelegate;
  gmailAccount: PrismaGmailAccountDelegate;
};

function buildExpiryDateFromAccount(account: {
  expires_at?: number | null;
}): Date | null {
  if (!account.expires_at) return null;
  return new Date(account.expires_at * 1000);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: googleClientId ?? "",
      clientSecret: googleClientSecret ?? "",
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        const email =
          (profile as { email?: string }).email ??
          (token.email as string | undefined);
        const name =
          (profile as { name?: string }).name ??
          (token.name as string | undefined);
        const picture =
          (profile as { picture?: string }).picture ??
          (token.picture as string | undefined);

        if (email) {
          const appUser = await prismaWithUserAndGmail.user.upsert({
            where: { email },
            update: {
              name: (name as string | null) ?? null,
              image: (picture as string | null) ?? null,
            },
            create: {
              email,
              name: (name as string | null) ?? null,
              image: (picture as string | null) ?? null,
            },
          });

          (token as Record<string, unknown>).appUserId = appUser.id;

          const googleAccount = account as {
            access_token?: string | null;
            refresh_token?: string | null;
            scope?: string | null;
            token_type?: string | null;
            expires_at?: number | null;
          };

          const accessToken = googleAccount.access_token ?? null;
          const refreshToken = googleAccount.refresh_token ?? null;
          const scope = googleAccount.scope ?? "";
          const tokenType = googleAccount.token_type ?? "Bearer";
          const expiryDate = buildExpiryDateFromAccount(googleAccount);

          if (accessToken && refreshToken && expiryDate) {
            await prismaWithUserAndGmail.gmailAccount.upsert({
              where: { userId: appUser.id },
              update: {
                accessToken,
                refreshToken,
                scope,
                tokenType,
                expiryDate,
              },
              create: {
                userId: appUser.id,
                accessToken,
                refreshToken,
                scope,
                tokenType,
                expiryDate,
              },
            });
          }
        }

        token.email = email ?? token.email;
        token.name = name ?? token.name;
        token.picture = picture ?? token.picture;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email =
          (token.email as string | undefined) ?? session.user.email;
        session.user.name =
          (token.name as string | undefined) ?? session.user.name;
        session.user.image =
          (token.picture as string | undefined) ?? session.user.image;

        const appUserId = (token as Record<string, unknown>).appUserId;
        if (appUserId && typeof appUserId === "string") {
          (session.user as Record<string, unknown>).id = appUserId;
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};