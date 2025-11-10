import type { ReactNode } from "react";
import { ProtectedShell } from "@/components/layout";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <ProtectedShell>{children}</ProtectedShell>
    </ErrorBoundary>
  );
}