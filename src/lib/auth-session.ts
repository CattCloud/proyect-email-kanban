// src/lib/auth-session.ts
// Helper centralizado para obtener la sesión de NextAuth en el servidor.

import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth-options";

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