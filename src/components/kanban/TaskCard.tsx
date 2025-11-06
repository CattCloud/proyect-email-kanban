"use client";

import { useRouter } from "next/navigation";
import { GripVertical, Mail } from "lucide-react";
import type { EmailMock } from "@/lib/mock-data/emails";

/**
 * TaskCard: card de tarea para el tablero Kanban (HU-UI-004)
 * - Muestra asunto, prioridad, categoría, remitente y descripción de tarea
 * - Click navega al detalle del email (/emails/[id])
 * - Usa clases definidas en globals.css: .kanban-card, badges y utilidades de truncado
 */
export default function TaskCard({ email }: { email: EmailMock }) {
  const router = useRouter();

  const prioridadClass =
    email.priority === "alta"
      ? "badge-prioridad-alta"
      : email.priority === "media"
      ? "badge-prioridad-media"
      : email.priority === "baja"
      ? "badge-prioridad-baja"
      : "";

  const categoriaClass =
    email.category === "cliente"
      ? "badge-categoria-cliente"
      : email.category === "lead"
      ? "badge-categoria-lead"
      : email.category === "interno"
      ? "badge-categoria-interno"
      : email.category === "spam"
      ? "badge-categoria-spam"
      : "";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/emails/${email.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/emails/${email.id}`);
        }
      }}
      className="kanban-card"
      aria-label={`Abrir email: ${email.subject}`}
    >
      {/* Drag handle */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[color:var(--color-text-muted)]">
          {/* Remitente compacto */}
          <span className="inline-flex items-center gap-1">
            <Mail className="w-3 h-3" aria-hidden />
            {email.from}
          </span>
        </span>
        <GripVertical className="w-4 h-4 text-[color:var(--color-text-muted)]" aria-hidden />
      </div>

      {/* Asunto */}
      <div className="font-semibold text-[color:var(--color-text-primary)] truncate-2-lines mb-2">
        {email.subject}
      </div>

      {/* Descripción de tarea (si existe) */}
      {email.hasTask && email.taskDescription ? (
        <div className="text-sm text-[color:var(--color-text-secondary)] truncate-3-lines mb-3">
          {email.taskDescription}
        </div>
      ) : null}

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2">
        {email.priority ? (
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${prioridadClass}`}>
            {email.priority}
          </span>
        ) : null}
        {email.category ? (
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${categoriaClass}`}>
            {email.category}
          </span>
        ) : null}
      </div>
    </div>
  );
}