"use client";

import { useRouter } from "next/navigation";
import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Mail, Check, Tag as TagIcon } from "lucide-react";
import type { KanbanTask } from "@/types";

/**
 * TaskCard: card de tarea para el tablero Kanban (Semana 4)
 * - Representa UNA tarea (KanbanTask) generada desde un email
 * - Muestra:
 *   - Contacto principal (nombre/email)
 *   - Asunto del email origen
 *   - Descripción breve de la tarea
 *   - Etiquetas de la tarea (tags)
 *   - Badges de categoría y prioridad (si existen)
 *   - Estado de aprobado (si aplica)
 * - Click navega al detalle del email (/emails/[id])
 * - HITO 4: Hace la tarjeta draggable con @dnd-kit/core (id = task.id)
 */
export default function TaskCard({ task }: { task: KanbanTask }) {
  const router = useRouter();

  const prioridadClass =
    task.priority === "alta"
      ? "badge-prioridad-alta"
      : task.priority === "media"
      ? "badge-prioridad-media"
      : task.priority === "baja"
      ? "badge-prioridad-baja"
      : "";

  const categoriaClass =
    task.category === "cliente"
      ? "badge-categoria-cliente"
      : task.category === "lead"
      ? "badge-categoria-lead"
      : task.category === "interno"
      ? "badge-categoria-interno"
      : task.category === "spam"
      ? "badge-categoria-spam"
      : "";

  const contactLabel =
    task.contactName && task.contactName.trim().length > 0
      ? `${task.contactName} · ${task.contactEmail}`
      : task.contactEmail;

  const handleOpenEmail = () => {
    router.push(`/emails/${task.emailId}`);
  };

  // HITO 4: hacer la tarjeta draggable
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const style =
    transform != null
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      // listeners + attributes para dnd-kit (teclado y ratón)
      {...listeners}
      {...attributes}
      role="button"
      tabIndex={0}
      onClick={handleOpenEmail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleOpenEmail();
        }
      }}
      className={`kanban-card ${
        isDragging ? "opacity-70 shadow-lg ring-2 ring-[color:var(--color-primary-300)]" : ""
      }`}
      aria-label={`Abrir email: ${task.emailSubject}`}
    >
      {/* Drag handle + contacto */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[color:var(--color-text-muted)]">
          <span className="inline-flex items-center gap-1">
            <Mail className="w-3 h-3" aria-hidden />
            {contactLabel}
          </span>
        </span>
        <GripVertical
          className="w-4 h-4 text-[color:var(--color-text-muted)] cursor-grab active:cursor-grabbing"
          aria-hidden
        />
      </div>

      {/* Asunto del email */}
      <div className="font-semibold text-[color:var(--color-text-primary)] truncate-2-lines mb-1">
        {task.emailSubject}
      </div>

      {/* Descripción de tarea */}
      <div className="text-sm text-[color:var(--color-text-secondary)] truncate-3-lines mb-2">
        {task.description}
      </div>

      {/* Footer: Tags y Badges en la misma fila */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 mt-4">
        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            <TagIcon className="w-3 h-3 text-[color:var(--color-text-muted)]" aria-hidden />
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-[2px] rounded-full text-[10px] bg-[color:var(--color-bg-soft)] border border-[color:var(--color-border-subtle)] text-[color:var(--color-text-muted)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {task.priority && (
            <span
              className={`inline-flex items-center px-2 py-1 rounded text-xs ${prioridadClass}`}
            >
              {task.priority}
            </span>
          )}
          {task.category && (
            <span
              className={`inline-flex items-center px-2 py-1 rounded text-xs ${categoriaClass}`}
            >
              {task.category}
            </span>
          )}
          {task.approvedAt && (
            <span className="badge-aprobado inline-flex items-center px-2 py-1 rounded text-xs">
              <Check className="w-3 h-3 mr-1" aria-hidden />
              Aprobado
            </span>
          )}
        </div>
      </div>

    </div>
  );
}