"use client";

import { Filter, X } from "lucide-react";

export type KanbanCategory = "todas" | "cliente" | "lead" | "interno" | "spam";
export type KanbanPriority = "todas" | "alta" | "media" | "baja";

type Props = {
  category: KanbanCategory;
  priority: KanbanPriority;
  onCategoryChange: (v: KanbanCategory) => void;
  onPriorityChange: (v: KanbanPriority) => void;
  onClear: () => void;
};

/**
 * KanbanFilters (HU-UI-004)
 * - Header de filtros con Selects para Categoría y Prioridad
 * - Muestra contador "Filtros (N)" cuando hay filtros activos
 * - Botón "Limpiar filtros"
 * Estilos con tokens definidos en src/app/globals.css
 */
export default function KanbanFilters({
  category,
  priority,
  onCategoryChange,
  onPriorityChange,
  onClear,
}: Props) {
  const activeCount =
    (category !== "todas" ? 1 : 0) + (priority !== "todas" ? 1 : 0);

  return (
    <div
      className="card-base p-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
      role="region"
      aria-label="Filtros del tablero kanban"
    >
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-[color:var(--color-text-secondary)]" aria-hidden />
        <h2 className="text-base font-semibold">Mis Tareas</h2>
        <span className="text-xs text-[color:var(--color-text-muted)]">
          {activeCount > 0 ? `Filtros (${activeCount})` : "Sin filtros"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-[color:var(--color-text-secondary)]">
          Categoría
        </label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as KanbanCategory)}
          className="px-2 py-2 rounded-md border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-card)] text-sm"
          aria-label="Filtrar por categoría"
        >
          <option value="todas">Todas</option>
          <option value="cliente">Cliente</option>
          <option value="lead">Lead</option>
          <option value="interno">Interno</option>
          <option value="spam">Spam</option>
        </select>

        <label className="text-sm text-[color:var(--color-text-secondary)] ml-2">
          Prioridad
        </label>
        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value as KanbanPriority)}
          className="px-2 py-2 rounded-md border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-card)] text-sm"
          aria-label="Filtrar por prioridad"
        >
          <option value="todas">Todas</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>

        <button
          type="button"
          onClick={onClear}
          className="ml-2 inline-flex items-center gap-1 px-3 py-2 rounded-md border border-[color:var(--color-border-light)] hover:bg-[color:var(--color-bg-hover)] text-sm focus-ring"
          aria-label="Limpiar filtros"
        >
          <X className="w-4 h-4" aria-hidden />
          Limpiar
        </button>
      </div>
    </div>
  );
}