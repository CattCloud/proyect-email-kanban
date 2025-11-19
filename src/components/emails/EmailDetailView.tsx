"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, CalendarDays, Tag, AlertCircle, CheckCircle, Edit3, Archive, ShieldAlert, KanbanSquare, Check } from "lucide-react";
import Button from "@/components/ui/button";
import { updateEmail, approveEmail } from "@/actions/emails";
import { EmailWithMetadata } from "@/types";

type EmailDetailViewProps = {
  email: EmailWithMetadata;
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
  const [approving, setApproving] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const goBack = () => {
    if (onBack) onBack();
    else router.push("/emails");
  };

  const handleEditMetadata = async () => {
    try {
      const result = await updateEmail(email.id, {
        processedAt: email.processedAt !== null ? null : new Date().toISOString(), // Toggle: null -> fecha actual ISO, fecha actual -> null
        metadata: {
          category: email.metadata?.category ?? null,
          priority: email.metadata?.priority ?? null,
          hasTask: email.metadata?.hasTask ?? false,
          taskDescription: email.metadata?.taskDescription ?? null,
          taskStatus: email.metadata?.taskStatus ?? null
        }
      });

      if (result.success) {
        alert("Metadata actualizada correctamente");
        window.location.reload(); // Recargar para ver los cambios
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("Error al actualizar metadata");
      console.error("Error updating email:", error);
    }
  };

  const handleMarkAsSpam = async () => {
    try {
      const result = await updateEmail(email.id, {
        metadata: {
          category: "spam",
          priority: "baja",
          hasTask: false,
          taskDescription: null,
          taskStatus: null
        }
      });

      if (result.success) {
        alert("Email marcado como spam");
        router.push("/emails");
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("Error al marcar como spam");
      console.error("Error marking as spam:", error);
    }
  };

  const handleArchive = async () => {
    try {
      // Por ahora simulamos el archivado
      alert("Funcionalidad de archivado disponible en futuras versiones");
    } catch (error) {
      alert("Error al archivar email");
      console.error("Error archiving email:", error);
    }
  };

  const handleApprove = async () => {
    // Regla de negocio: solo emails procesados pueden ser aprobados
    if (email.processedAt === null) {
      setApprovalError("Solo se pueden aprobar emails procesados por IA");
      return;
    }

    try {
      setApproving(true);
      setApprovalError(null);

      const result = await approveEmail(email.id);

      if (result.success) {
        alert(result.message ?? "Email aprobado exitosamente");
        // Forzar recarga de datos actualizados desde el servidor
        router.refresh();
      } else {
        setApprovalError(result.error || "Error al aprobar email");
      }
    } catch (error) {
      console.error("Error al aprobar email:", error);
      setApprovalError("Error de conexión al servidor");
    } finally {
      setApproving(false);
    }
  };

  return (
    <section className="space-y-4">
      {/* Header con botón volver y metadatos mínimos */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={goBack}
            aria-label="Volver a Emails"
            variant="ghost"
            size="icon"
            leftIcon={<ArrowLeft className="w-5 h-5" aria-hidden />}
          >
            Volver a Emails
          </Button>
          <div className="flex items-center gap-2 text-sm text-[color:var(--color-text-secondary)]">
            <Mail className="w-4 h-4" aria-hidden />
            <span className="truncate max-w-[200px] sm:max-w-[320px]">{email.from}</span>
            <span className="mx-2">•</span>
            <CalendarDays className="w-4 h-4" aria-hidden />
            <span className="whitespace-nowrap">
              {email.receivedAt.toLocaleString("es-CO", {
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

      {/* Barra de acciones simuladas 
            <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={handleEditMetadata}
          variant="secondary"
          size="md"
          leftIcon={<Edit3 className="w-4 h-4" aria-hidden />}
        >
          Editar metadata
        </Button>

        <Button
          type="button"
          onClick={handleMarkAsSpam}
          variant="destructive"
          size="md"
          leftIcon={<ShieldAlert className="w-4 h-4" aria-hidden />}
        >
          Marcar como spam
        </Button>

        <Button
          type="button"
          onClick={handleArchive}
          variant="outline"
          size="md"
          leftIcon={<Archive className="w-4 h-4" aria-hidden />}
        >
          Archivar
        </Button>

        {email.processedAt !== null && email.approvedAt === null && (
          <Button
            type="button"
            onClick={handleApprove}
            variant="secondary"
            size="md"
            leftIcon={<Check className="w-4 h-4" aria-hidden />}
            aria-label="Aprobar email"
            loading={approving}
            disabled={approving}
          >
            {approving ? "Aprobando..." : "Aprobar Email"}
          </Button>
        )}

        {email.metadata?.hasTask ? (
          <Button
            type="button"
            onClick={() => router.push("/kanban")}
            variant="primary"
            size="md"
            className="ml-auto"
            aria-label="Ver en Kanban"
            leftIcon={<KanbanSquare className="w-4 h-4" aria-hidden />}
          >
            Ver en Kanban
          </Button>
        ) : null}
      </div>

      */}

      {approvalError && (
        <div
          className="text-sm text-[color:var(--color-error-text)] mt-2"
          role="alert"
        >
          {approvalError}
        </div>
      )}

      {/* Estado procesado/sin procesar rápido (badge) 
      
            <div className="flex items-center gap-2 text-xs">
        {email.processedAt !== null ? (
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

        {email.approvedAt !== null && (
          <span className="badge-aprobado inline-flex items-center gap-1 px-2 py-1 rounded">
            <Check className="w-3 h-3" aria-hidden />
            Aprobado
          </span>
        )}

        {email.metadata?.category ? (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded ${
              email.metadata.category === "cliente"
                ? "badge-categoria-cliente"
                : email.metadata.category === "lead"
                ? "badge-categoria-lead"
                : email.metadata.category === "interno"
                ? "badge-categoria-interno"
                : "badge-categoria-spam"
            }`}
          >
            <Tag className="w-3 h-3" aria-hidden />
            {email.metadata.category}
          </span>
        ) : null}
      </div>
      
      */}

    </section>
  );
}