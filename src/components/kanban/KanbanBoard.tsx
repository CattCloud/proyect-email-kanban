"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { Search } from "lucide-react";
import type { KanbanTask, KanbanContact, TaskStatus } from "@/types";
import {
  getKanbanTasks,
  getKanbanContacts,
  updateKanbanTaskStatus,
} from "@/actions/kanban";
import KanbanColumn from "./KanbanColumn";
import KanbanContactSelector from "./KanbanContactSelector";
import SearchBar from "@/components/shared/SearchBar";
import EmptyState from "@/components/shared/EmptyState";

export type KanbanPriority = "todas" | "alta" | "media" | "baja";


/**
 * KanbanBoard (Semana 4 - Kanban por contacto)
 * - Consume Server Actions específicas de Kanban:
 *   - getKanbanContacts(): contactos con tareas
 *   - getKanbanTasks(): tareas filtradas por contacto(s)
 * - Agrupa por estado de tarea: 'todo' | 'doing' | 'done'
 * - Incluye selector múltiple de contactos en la parte superior
 * - HITO 4: Drag & Drop real con @dnd-kit/core + persistencia en updateKanbanTaskStatus
 * - HITO 5: Barra de búsqueda + chips de filtro de prioridad (diseño idéntico a EmailTable)
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

  // Estado para búsqueda y filtros de prioridad (HITO 5)
  const [query, setQuery] = useState("");
  const [filterPrioridad, setFilterPrioridad] = useState<KanbanPriority>("todas");

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

  // Contadores por prioridad para los chips (HITO 5)
  const priorityCounts = useMemo(() => {
    let alta = 0;
    let media = 0;
    let baja = 0;
    let sinPrioridad = 0;

    for (const t of tasks) {
      if (!t.priority) {
        sinPrioridad += 1;
      } else if (t.priority === "alta") {
        alta += 1;
      } else if (t.priority === "media") {
        media += 1;
      } else if (t.priority === "baja") {
        baja += 1;
      } else {
        sinPrioridad += 1;
      }
    }

    return { alta, media, baja, sinPrioridad };
  }, [tasks]);

  // Tareas filtradas por búsqueda + prioridad (HITO 5)
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Filtro por búsqueda
    if (query.trim() !== "") {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.emailSubject.toLowerCase().includes(q) ||
          t.emailFrom.toLowerCase().includes(q) ||
          t.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Filtro por prioridad
    if (filterPrioridad !== "todas") {
      filtered = filtered.filter((t) => t.priority === filterPrioridad);
    }

    // Agrupar por estado después del filtrado
    return filtered;
  }, [tasks, query, filterPrioridad]);

  // Recalcular columnas con tareas filtradas
  const filteredTodo = filteredTasks.filter((t) => t.status === "todo");
  const filteredDoing = filteredTasks.filter((t) => t.status === "doing");
  const filteredDone = filteredTasks.filter((t) => t.status === "done");

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

  // Handlers para chips de prioridad (HITO 5)
  function handlePrioridadChipClick(value: KanbanPriority) {
    setFilterPrioridad((prev) => (prev === value ? "todas" : value));
  }

  // Helper para obtener clases CSS de chips de prioridad (diseño idéntico a EmailTable)
  function getPrioridadChipClasses(value: KanbanPriority) {
    const isActive = filterPrioridad === value;
    const baseClasses = "estado-chip";
    
    if (value === "todas") {
      // El chip "Todas" usa el estilo estándar de estado chip
      return isActive ? `${baseClasses} estado-chip-active` : `${baseClasses} estado-chip-faded`;
    }
    
    // Si está activo, usar color específico, si no, usar gris uniforme
    const activeClasses = {
      "alta": "chip-prioridad-alta-active",
      "media": "chip-prioridad-media-active",
      "baja": "chip-prioridad-baja-active"
    };
    
    const inactiveClasses = {
      "alta": "chip-prioridad-alta",
      "media": "chip-prioridad-media",
      "baja": "chip-prioridad-baja"
    };
    
    // Aplicar efecto faded a otros chips cuando hay filtros activos
    const isAnyFilterActive = filterPrioridad !== "todas";
    const shouldApplyFaded = isAnyFilterActive && !isActive;
    
    return `${baseClasses} ${isActive ? activeClasses[value] : inactiveClasses[value]} ${shouldApplyFaded ? "estado-chip-faded" : ""}`;
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
  const noFilteredTasks = !loadingTasks && tasks.length > 0 && filteredTasks.length === 0;

  return (
    <div className="relative">
      {/* Overlay de carga que bloquea toda la página */}
      {dragUpdating && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-6 flex flex-col items-center gap-4 min-w-[280px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-primary-500)]"></div>
            <div className="text-center">
              <p className="font-medium text-[color:var(--color-text-primary)]">
                Actualizando tarea...
              </p>
              <p className="text-sm text-[color:var(--color-text-secondary)] mt-1">
                Por favor espera mientras guardamos los cambios
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toast de error (solo cuando no está actualizando) */}
      {dragError && !dragUpdating && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="px-3 py-2 rounded-md shadow-md text-xs flex items-center gap-2 bg-[color:var(--color-danger-50)] text-[color:var(--color-danger-700)] border border-[color:var(--color-danger-200)]">
            {dragError}
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

      {/* Barra de herramientas: búsqueda + filtros de prioridad (HITO 5) */}
      <div className="flex flex-col gap-4 mt-2">
        {/* Fila principal: búsqueda + chips de prioridad */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <SearchBar
            value={query}
            onChange={(val) => setQuery(val)}
            placeholder="Buscar tareas por título, descripción o tags..."
            ariaLabel="Buscar tareas"
          />

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end md:gap-3">
            {/* Chips de prioridad con contadores - Diseño idéntico a EmailTable */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className={getPrioridadChipClasses("alta")}
                onClick={() => handlePrioridadChipClick("alta")}
                aria-pressed={filterPrioridad === "alta"}
              >
                <span>Alta</span>
                <span className="estado-chip-count">
                  {priorityCounts.alta}
                </span>
              </button>

              <button
                type="button"
                className={getPrioridadChipClasses("media")}
                onClick={() => handlePrioridadChipClick("media")}
                aria-pressed={filterPrioridad === "media"}
              >
                <span>Media</span>
                <span className="estado-chip-count">
                  {priorityCounts.media}
                </span>
              </button>

              <button
                type="button"
                className={getPrioridadChipClasses("baja")}
                onClick={() => handlePrioridadChipClick("baja")}
                aria-pressed={filterPrioridad === "baja"}
              >
                <span>Baja</span>
                <span className="estado-chip-count">
                  {priorityCounts.baja}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Contador de resultados filtrados */}
        {filteredTasks.length > 0 && (query || filterPrioridad !== "todas") && (
          <div className="text-sm text-[color:var(--color-text-secondary)] bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border-light)] rounded-lg px-4 py-2">
            {filteredTasks.length === 1 ? (
              <span>1 tarea encontrada</span>
            ) : (
              <span>{filteredTasks.length} tareas encontradas</span>
            )}
            {(query || filterPrioridad !== "todas") && (
              <button
                onClick={() => {
                  setQuery("");
                  setFilterPrioridad("todas");
                }}
                className="ml-3 text-[color:var(--color-text-link)] hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Estado vacío específico cuando no hay tareas para el filtro actual */}
      {noTasks || noFilteredTasks ? (
        <div className="p-8">
          <EmptyState
            title={noTasks ? "No hay tareas para este conjunto de contactos" : "No se encontraron tareas con ese criterio"}
            description={
              noTasks
                ? selectedContactIds.length > 0
                  ? "Prueba ajustando la selección de contactos o limpiando el filtro."
                  : "No se encontraron tareas en el sistema."
                : "Intenta ajustar la búsqueda o filtros de prioridad."
            }
          />
        </div>
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          <section className="kanban-board" aria-label="Tablero Kanban">
            <KanbanColumn title="Por Hacer" tasks={filteredTodo} status="todo" />
            <KanbanColumn title="En Progreso" tasks={filteredDoing} status="doing" />
            <KanbanColumn title="Completado" tasks={filteredDone} status="done" />
          </section>
        </DndContext>
      )}
    </div>
  );
}