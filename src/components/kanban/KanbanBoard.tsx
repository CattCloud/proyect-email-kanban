"use client";

import { useEffect, useState } from "react";
import { EmailWithMetadata } from "@/types";
import { getEmailsWithTasks } from "@/actions/emails";
import KanbanColumn from "./KanbanColumn";
import EmptyState from "@/components/shared/EmptyState";

/**
 * KanbanBoard (HU-UI-004)
 * - Consume Server Actions para obtener emails con tareas
 * - Agrupa por taskStatus: 'todo' | 'doing' | 'done'
 * - Renderiza 3 columnas con títulos definidos
 * - Usa clase .kanban-board definida en globals.css para el layout
 */
export default function KanbanBoard() {
  const [tasks, setTasks] = useState<EmailWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar emails con tareas desde Server Actions
  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        setError(null);
        const result = await getEmailsWithTasks();
        
        if (result.success) {
          setTasks((result.data || []) as EmailWithMetadata[]);
        } else {
          setError(result.error || "Error al cargar las tareas");
        }
      } catch (err) {
        setError("Error de conexión al servidor");
        console.error("Error loading tasks:", err);
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []); // Se ejecuta solo al montar el componente

  // Filtrar tareas por estado
  const todo = tasks.filter((t) => t.metadata?.taskStatus === "todo");
  const doing = tasks.filter((t) => t.metadata?.taskStatus === "doing");
  const done = tasks.filter((t) => t.metadata?.taskStatus === "done");

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--color-primary-500)]"></div>
        <span className="ml-2 text-[color:var(--color-text-secondary)]">Cargando tareas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-(--color-danger-500) mb-4">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-(--color-primary-500) text-white rounded hover:bg-(--color-primary-600)"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          title="No hay tareas encontradas"
          description="No se encontraron emails con tareas asignadas."
        />
      </div>
    );
  }

  return (
    <section className="kanban-board" aria-label="Tablero Kanban">
      <KanbanColumn title="Por Hacer" tasks={todo} status="todo" />
      <KanbanColumn title="En Progreso" tasks={doing} status="doing" />
      <KanbanColumn title="Completado" tasks={done} status="done" />
    </section>
  );
}