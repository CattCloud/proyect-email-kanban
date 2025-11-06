"use client";

import { useMemo, useState } from "react";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import KanbanFilters, {
  KanbanCategory,
  KanbanPriority,
} from "@/components/kanban/KanbanFilters";
import EmptyState from "@/components/shared/EmptyState";
import { mockEmails } from "@/lib/mock-data/emails";
import { ClipboardList } from "lucide-react";

/**
 * HU-UI-004: Tablero Kanban
 * - Filtra emails con hasTask === true
 * - Filtros por categoría y prioridad
 * - Drag & drop solo visual (indicador en TaskCard)
 * - Navega a /emails/[id] al hacer click en la card
 * - Mostrar EmptyState global si no hay tareas
 */

export default function KanbanPage() {
  const [category, setCategory] = useState<KanbanCategory>("todas");
  const [priority, setPriority] = useState<KanbanPriority>("todas");

  // Base: solo emails con tarea
  const baseTasks = useMemo(
    () => mockEmails.filter((e) => e.hasTask),
    []
  );

  // Aplicar filtros visuales (sin persistencia)
  const filtered = useMemo(() => {
    let data = [...baseTasks];
    if (category !== "todas") {
      data = data.filter((e) => e.category === category);
    }
    if (priority !== "todas") {
      data = data.filter((e) => e.priority === priority);
    }
    return data;
  }, [baseTasks, category, priority]);

  const hasAnyTasks = baseTasks.length > 0;

  function handleClear() {
    setCategory("todas");
    setPriority("todas");
  }

  return (
    <div className="space-y-4">
      {/* Header + filtros */}
      <KanbanFilters
        category={category}
        priority={priority}
        onCategoryChange={setCategory}
        onPriorityChange={setPriority}
        onClear={handleClear}
      />

      {/* Estado general si no hay tareas en mock */}
      {!hasAnyTasks ? (
        <div className="card-base p-6">
          <EmptyState
            title="No hay tareas detectadas aún"
            description="Procesa emails con IA para generar tareas (simulado para Semana 1)."
            icon={ClipboardList}
          />
        </div>
      ) : filtered.length === 0 ? (
        // Estado cuando filtros no devuelven resultados
        <div className="card-base p-6">
          <EmptyState
            title="No se encontraron tareas con esos criterios"
            description="Ajusta los filtros de categoría o prioridad."
            icon={ClipboardList}
          />
        </div>
      ) : (
        // Tablero Kanban
        <KanbanBoard tasks={filtered} />
      )}
    </div>
  );
}