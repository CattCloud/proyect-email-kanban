"use client";

import KanbanBoard from "@/components/kanban/KanbanBoard";
import EmptyState from "@/components/shared/EmptyState";
import { ClipboardList } from "lucide-react";

/**
 * HU-UI-004: Tablero Kanban
 * - Consume Server Actions para obtener emails con tareas
 * - Agrupación automática por taskStatus: 'todo' | 'doing' | 'done'
 * - Filtros por categoría y prioridad (implementados en componentes hijos)
 * - Drag & drop solo visual (indicador en TaskCard)
 * - Navega a /emails/[id] al hacer click en la card
 * - Estados de carga y error manejados en KanbanBoard
 */

export default function KanbanPage() {
  return (
    <div >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Tablero de Tareas</h1>
          <p className="text-sm text-[color:var(--color-text-secondary)] mt-1">
            Visualiza y gestiona tareas extraídas de tus emails
          </p>
        </div>
      </div>

      {/* Componente KanbanBoard que maneja todo internamente */}
      <KanbanBoard />
    </div>
  );
}