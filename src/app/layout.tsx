import "@/app/globals.css";
import type { ReactNode } from "react";
import { AppProviders } from "@/app/Providers";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
