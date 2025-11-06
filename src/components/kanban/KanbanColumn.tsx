"use client";

import type { EmailMock } from "@/lib/mock-data/emails";
import TaskCard from "./TaskCard";
import { Circle, Clock, CheckCircle } from "lucide-react";

/**
 * KanbanColumn: columna del tablero (HU-UI-004)
 * - Muestra header con título y contador
 * - Lista de TaskCard por email con tarea
 * - Placeholder si no hay tareas en la columna
 * Estilos: .kanban-column, .kanban-column-header (ver src/app/globals.css)
 */
export default function KanbanColumn({
  title,
  tasks,
  status,
}: {
  title: string;
  tasks: EmailMock[];
  status: "todo" | "doing" | "done";
}) {
  const Icon =
    status === "todo" ? Circle : status === "doing" ? Clock : CheckCircle;

  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <span className="inline-flex items-center gap-2">
          <Icon className="w-4 h-4 text-[color:var(--color-text-secondary)]" aria-hidden />
          {title}
        </span>
        <span className="badge-estado-count inline-flex items-center px-2 py-1 rounded text-xs bg-[color:var(--color-bg-card)] border border-[color:var(--color-border-light)]">
          {tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="text-sm text-[color:var(--color-text-muted)] italic">
          No hay tareas en {title.toLowerCase()}.
        </div>
      ) : (
        tasks.map((email) => <TaskCard key={email.id} email={email} />)
      )}
    </div>
  );
}