"use client";

import type { EmailMock } from "@/lib/mock-data/emails";
import KanbanColumn from "./KanbanColumn";

/**
 * KanbanBoard (HU-UI-004)
 * - Presentacional: recibe lista de emails con tareas (hasTask === true)
 * - Agrupa por taskStatus: 'todo' | 'doing' | 'done'
 * - Renderiza 3 columnas con títulos definidos
 * - Usa clase .kanban-board definida en globals.css para el layout
 */
export default function KanbanBoard({ tasks }: { tasks: EmailMock[] }) {
  const todo = tasks.filter((t) => t.taskStatus === "todo");
  const doing = tasks.filter((t) => t.taskStatus === "doing");
  const done = tasks.filter((t) => t.taskStatus === "done");

  return (
    <section className="kanban-board" aria-label="Tablero Kanban">
      <KanbanColumn title="Por Hacer" tasks={todo} status="todo" />
      <KanbanColumn title="En Progreso" tasks={doing} status="doing" />
      <KanbanColumn title="Completado" tasks={done} status="done" />
    </section>
  );
}