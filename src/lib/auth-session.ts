// src/lib/auth-session.ts
// Helpers centralizados para autenticación y usuario actual (NextAuth + Prisma)

import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

/**
 * Proyección mínima del modelo User de Prisma usada en la app.
 * Evitamos importar tipos directos de @prisma/client porque aún no se ha regenerado
 * el cliente después de los cambios en schema.prisma.
 */
export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  createdAt: Date;
}

type PrismaUserDelegate = {
  upsert: (args: {
    where: { email: string };
    update: { name: string | null; image: string | null };
    create: { email: string; name: string | null; image: string | null };
  }) => Promise<AppUser>;
};

// Cast ampliado del cliente Prisma para incluir el modelo User según schema.prisma
const prismaWithUser = prisma as typeof prisma & { user: PrismaUserDelegate };

/**
 * Obtiene la sesión actual del usuario autenticado usando NextAuth.
 *
 * - Devuelve `null` si no hay sesión válida.
 * - Se usa en layouts protegidos y Server Actions.
 */
export async function getAuthSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  return session;
}

/**
 * Resuelve (o crea) el usuario de aplicación a partir de la sesión de NextAuth.
 *
 * Estrategia:
 * - Usa session.user.email como clave única.
 * - Si el usuario no existe en BD, lo crea.
 * - Actualiza name/image cuando cambian.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const session = await getAuthSession();

  const email = session?.user?.email;
  if (!email) {
    return null;
  }

  const name = session.user?.name ?? null;
  const image = session.user?.image ?? null;

  const user = await prismaWithUser.user.upsert({
    where: { email },
    update: {
      name,
      image,
    },
    create: {
      email,
      name,
      image,
    },
  });

  return user;
}

/**
 * Versión estricta: lanza error si no hay usuario autenticado.
 *
 * Útil en Server Actions que requieren autenticación obligatoria.
 */
export async function requireCurrentUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("UNAUTHENTICATED");
  }
  return user;
}

/**
 * Helper de conveniencia para obtener solo el userId actual.
 */
export async function requireCurrentUserId(): Promise<string> {
  const user = await requireCurrentUser();
  return user.id;
}