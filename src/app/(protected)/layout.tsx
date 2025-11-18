import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ProtectedShell } from "@/components/layout";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import { getAuthSession } from "@/lib/auth-session";

/**
 * Layout para rutas protegidas.
 * - Verifica que exista sesión válida con NextAuth.
 * - Si no hay sesión, redirige a /login.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <ErrorBoundary>
      <ProtectedShell>{children}</ProtectedShell>
    </ErrorBoundary>
  );
}