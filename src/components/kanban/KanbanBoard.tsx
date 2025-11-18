"use client";

import { useEffect, useState } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import type { KanbanTask, KanbanContact, TaskStatus } from "@/types";
import {
  getKanbanTasks,
  getKanbanContacts,
  updateKanbanTaskStatus,
} from "@/actions/kanban";
import KanbanColumn from "./KanbanColumn";
import KanbanContactSelector from "./KanbanContactSelector";
import EmptyState from "@/components/shared/EmptyState";

/**
 * KanbanBoard (Semana 4 - Kanban por contacto)
 * - Consume Server Actions específicas de Kanban:
 *   - getKanbanContacts(): contactos con tareas
 *   - getKanbanTasks(): tareas filtradas por contacto(s)
 * - Agrupa por estado de tarea: 'todo' | 'doing' | 'done'
 * - Incluye selector múltiple de contactos en la parte superior
 * - HITO 4: Drag & Drop real con @dnd-kit/core + persistencia en updateKanbanTaskStatus
 */
export default function KanbanBoard() {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [contacts, setContacts] = useState<KanbanContact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingContacts, setLoadingContacts] = useState(true);

  const [tasksError, setTasksError] = useState<string | null>(null);
  const [contactsError, setContactsError] = useState<string | null>(null);

  const [dragUpdating, setDragUpdating] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  // Cargar contactos con tareas (para el selector)
  useEffect(() => {
    async function loadContacts() {
      try {
        setLoadingContacts(true);
        setContactsError(null);
        const res = await getKanbanContacts();
        if (res.success) {
          setContacts(res.data || []);
        } else {
          setContactsError(res.error || "Error al cargar contactos");
        }
      } catch (err) {
        console.error("Error loading kanban contacts:", err);
        setContactsError("Error de conexión al cargar contactos");
      } finally {
        setLoadingContacts(false);
      }
    }

    loadContacts();
  }, []);

  // Cargar tareas según contactos seleccionados
  useEffect(() => {
    async function loadTasks() {
      try {
        setLoadingTasks(true);
        setTasksError(null);

        const hasSelection = selectedContactIds.length > 0;

        const res = await getKanbanTasks(
          hasSelection ? { contactIds: selectedContactIds } : undefined
        );

        if (res.success) {
          setTasks(res.data || []);
        } else {
          setTasksError(res.error || "Error al cargar las tareas");
        }
      } catch (err) {
        console.error("Error loading kanban tasks:", err);
        setTasksError("Error de conexión al servidor");
      } finally {
        setLoadingTasks(false);
      }
    }

    loadTasks();
  }, [selectedContactIds]);

  // Agrupar tareas por estado
  const todo = tasks.filter((t) => t.status === "todo");
  const doing = tasks.filter((t) => t.status === "doing");
  const done = tasks.filter((t) => t.status === "done");

  const isInitialLoading = loadingTasks && tasks.length === 0;

  // HITO 4: Manejo de drag & drop
  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const targetStatus = String(over.id) as TaskStatus;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === targetStatus) {
      return;
    }

    // Optimistic update
    const prevTasks = tasks;
    setTasks((current) =>
      current.map((t) =>
        t.id === taskId ? { ...t, status: targetStatus } : t
      )
    );
    setDragError(null);
    setDragUpdating(true);

    try {
      const res = await updateKanbanTaskStatus({
        taskId,
        status: targetStatus,
      });

      if (!res.success) {
        setTasks(prevTasks);
        setDragError(
          res.error || "No se pudo actualizar el estado de la tarea."
        );
      }
    } catch (err) {
      console.error("Error al actualizar estado de tarea via DnD:", err);
      setTasks(prevTasks);
      setDragError("Error de conexión al actualizar la tarea.");
    } finally {
      setDragUpdating(false);
    }
  }

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--color-primary-500)]" />
        <span className="ml-2 text-[color:var(--color-text-secondary)]">
          Cargando tareas...
        </span>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="p-8 text-center">
        <div className="text-[color:var(--color-danger-500)] mb-4">
          Error: {tasksError}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[color:var(--color-primary-500)] text-white rounded hover:bg-[color:var(--color-primary-600)]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const noTasks = !loadingTasks && tasks.length === 0;

  return (
    <div className="relative">
      {/* Toast de estado de guardado / error del tablero (más visible) */}
      {(dragUpdating || dragError) && (
        <div className="fixed bottom-4 right-4 z-40">
          <div
            className={`px-3 py-2 rounded-md shadow-md text-xs flex items-center gap-2 ${
              dragError
                ? "bg-[color:var(--color-danger-50)] text-[color:var(--color-danger-700)] border border-[color:var(--color-danger-200)]"
                : "bg-[color:var(--color-primary-50)] text-[color:var(--color-primary-800)] border border-[color:var(--color-primary-200)]"
            }`}
          >
            {dragError
              ? dragError
              : "Guardando cambios del tablero..."}
          </div>
        </div>
      )}

      {/* Selector de contactos */}
      <KanbanContactSelector
        contacts={contacts}
        selectedIds={selectedContactIds}
        onChange={setSelectedContactIds}
        loading={loadingContacts}
        error={contactsError}
      />

      {/* Estado vacío específico cuando no hay tareas para el filtro actual */}
      {noTasks ? (
        <div className="p-8">
          <EmptyState
            title="No hay tareas para este conjunto de contactos"
            description={
              selectedContactIds.length > 0
                ? "Prueba ajustando la selección de contactos o limpiando el filtro."
                : "No se encontraron tareas en el sistema."
            }
          />
        </div>
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          <section className="kanban-board" aria-label="Tablero Kanban">
            <KanbanColumn title="Por Hacer" tasks={todo} status="todo" />
            <KanbanColumn title="En Progreso" tasks={doing} status="doing" />
            <KanbanColumn title="Completado" tasks={done} status="done" />
          </section>
        </DndContext>
      )}
    </div>
  );
}