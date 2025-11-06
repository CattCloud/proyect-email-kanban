"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, CalendarDays, Tag, AlertCircle, CheckCircle, Edit3, Archive, ShieldAlert, KanbanSquare } from "lucide-react";
import type { EmailMock } from "@/lib/mock-data/emails";

type EmailDetailViewProps = {
  email: EmailMock;
  onBack?: () => void;
};

/**
 * EmailDetailView: Contenido principal del email (HU-UI-003)
 * - Header con botón volver (opcional si el contenedor lo provee), remitente, fecha, asunto
 * - Cuerpo del email en card con posible scroll
 * - Barra de acciones simuladas: Editar metadata, Marcar spam, Archivar
 * - Botón "Ver en Kanban" si tiene tarea (navega a /kanban)
 *
 * Estilos desde src/app/globals.css:
 * - .card-base, .card-hover, .email-card-*, .focus-ring, tokens de color/espaciado
 */
export default function EmailDetailView({ email, onBack }: EmailDetailViewProps) {
  const router = useRouter();

  const goBack = () => {
    if (onBack) onBack();
    else router.push("/emails");
  };

  const toast = (msg: string) => alert(msg);

  return (
    <section className="space-y-4">
      {/* Header con botón volver y metadatos mínimos */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goBack}
            aria-label="Volver a Emails"
            className="px-2 py-2 rounded-md hover:bg-[color:var(--color-bg-hover)] focus-ring"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden />
          </button>
          <div className="flex items-center gap-2 text-sm text-[color:var(--color-text-secondary)]">
            <Mail className="w-4 h-4" aria-hidden />
            <span className="truncate max-w-[200px] sm:max-w-[320px]">{email.from}</span>
            <span className="mx-2">•</span>
            <CalendarDays className="w-4 h-4" aria-hidden />
            <span className="whitespace-nowrap">
              {new Date(email.receivedAt).toLocaleString("es-CO", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Asunto */}
      <h1 className="text-[color:var(--color-text-primary)]">{email.subject}</h1>

      {/* Cuerpo del email */}
      <article
        className="card-base p-4"
        role="article"
        aria-label="Contenido del email"
      >
        <div className="text-sm text-[color:var(--color-text-primary)] leading-relaxed whitespace-pre-wrap">
          {email.body}
        </div>
      </article>

      {/* Barra de acciones simuladas */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => toast("Funcionalidad disponible en Semana 2")}
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-[color:var(--color-border-light)] hover:bg-[color:var(--color-bg-hover)] transition-colors focus-ring"
        >
          <Edit3 className="w-4 h-4" aria-hidden />
          Editar metadata
        </button>

        <button
          type="button"
          onClick={() => toast("Funcionalidad disponible en Semana 2")}
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-[color:var(--color-border-light)] hover:bg-[color:var(--color-bg-hover)] transition-colors focus-ring text-[color:var(--color-danger-700)]"
        >
          <ShieldAlert className="w-4 h-4" aria-hidden />
          Marcar como spam
        </button>

        <button
          type="button"
          onClick={() => toast("Funcionalidad disponible en Semana 2")}
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-[color:var(--color-border-light)] hover:bg-[color:var(--color-bg-hover)] transition-colors focus-ring"
        >
          <Archive className="w-4 h-4" aria-hidden />
          Archivar
        </button>

        {email.hasTask ? (
          <button
            type="button"
            onClick={() => router.push("/kanban")}
            className="ml-auto flex items-center gap-2 px-3 py-2 rounded-md border border-[color:var(--color-border-focus)] hover:bg-[color:var(--color-bg-hover)] transition-colors focus-ring"
            aria-label="Ver en Kanban"
          >
            <KanbanSquare className="w-4 h-4" aria-hidden />
            Ver en Kanban
          </button>
        ) : null}
      </div>

      {/* Estado procesado/sin procesar rápido (badge) */}
      <div className="flex items-center gap-2 text-xs">
        {email.processed ? (
          <span className="badge-procesado inline-flex items-center gap-1 px-2 py-1 rounded">
            <CheckCircle className="w-3 h-3" aria-hidden />
            Procesado por IA
          </span>
        ) : (
          <span className="badge-sin-procesar inline-flex items-center gap-1 px-2 py-1 rounded">
            <AlertCircle className="w-3 h-3" aria-hidden />
            Aún sin procesar
          </span>
        )}
        {email.category ? (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded ${
              email.category === "cliente"
                ? "badge-categoria-cliente"
                : email.category === "lead"
                ? "badge-categoria-lead"
                : email.category === "interno"
                ? "badge-categoria-interno"
                : "badge-categoria-spam"
            }`}
          >
            <Tag className="w-3 h-3" aria-hidden />
            {email.category}
          </span>
        ) : null}
      </div>
    </section>
  );
}