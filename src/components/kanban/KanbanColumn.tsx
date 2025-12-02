"use client";

import { useDroppable } from "@dnd-kit/core";
import type { KanbanTask, TaskStatus } from "@/types";
import TaskCard from "./TaskCard";
import KanbanEmptyPlaceholder from "./KanbanEmptyPlaceholder";
import { Circle, Clock, CheckCircle } from "lucide-react";

/**
 * KanbanColumn: columna del tablero (Semana 4 - Kanban por contacto)
 * - Muestra header con título y contador de tareas
 * - Lista de TaskCard por tarea individual (KanbanTask)
 * - Placeholder si no hay tareas en la columna
 * - Indicador lateral de color según estado:
 *   - todo: gris (neutral)
 *   - doing: azul (primary)
 *   - done: verde (secondary)
 * - HITO 4: Actúa como área droppable para @dnd-kit/core (id = status)
 * Estilos: .kanban-column, .kanban-column-header (ver src/app/globals.css)
 */
export default function KanbanColumn({
  title,
  tasks,
  status,
}: {
  title: string;
  tasks: KanbanTask[];
  status: TaskStatus;
}) {
  const Icon =
    status === "todo" ? Circle : status === "doing" ? Clock : CheckCircle;

  // Área droppable para DnD Kit
  const { setNodeRef, isOver } = useDroppable({
    id: status, // targetStatus en KanbanBoard.handleDragEnd
  });

  // Indicador lateral de color por estado
  const borderClass =
    status === "todo"
      ? "border-l-4 border-l-[color:var(--color-neutral-300)]"
      : status === "doing"
      ? "border-l-4 border-l-[color:var(--color-primary-500)]"
      : "border-l-4 border-l-[color:var(--color-secondary-500)]";

  const isEmpty = tasks.length === 0;

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${borderClass} ${
        isOver ? "bg-[color:var(--color-primary-50)]/40" : ""
      }`}
    >
      <div className="kanban-column-header">
        <span className="inline-flex items-center gap-2">
          <Icon
            className="w-4 h-4 text-[color:var(--color-text-secondary)]"
            aria-hidden
          />
          {title}
        </span>
        <span className="badge-estado-count inline-flex items-center px-2 py-1 rounded text-xs bg-[color:var(--color-bg-card)] border border-[color:var(--color-border-light)]">
          {tasks.length}
        </span>
      </div>

      <div className="relative">
        {isEmpty ? (
          // Placeholder fantasma SOLO cuando no hay tareas
          <KanbanEmptyPlaceholder status={status} />
        ) : (
          // Lista de tarjetas con entrada suave
          <div className="transition-opacity duration-200 ease-out animate-fade-in">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
