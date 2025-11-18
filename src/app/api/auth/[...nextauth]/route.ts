import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

/**
 * Handler de NextAuth para rutas de autenticación:
 * - /api/auth/signin
 * - /api/auth/signout
 * - /api/auth/callback/google
 * - etc.
 *
 * App Router (Next.js 16) expone el handler como GET y POST.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };