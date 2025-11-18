"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

/**
 * Providers de alto nivel para la App Router.
 * Actualmente solo envuelve con SessionProvider de NextAuth.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}