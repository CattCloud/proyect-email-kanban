"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Upload, Sparkles } from "lucide-react";
import SearchBar from "@/components/shared/SearchBar";
import EmptyState from "@/components/shared/EmptyState";
import { mockEmails, type EmailMock } from "@/lib/mock-data/emails";

/**
 * HU-UI-002: Listado de Emails con Tabla Interactiva
 * - Búsqueda por remitente/asunto
 * - Ordenamiento por fecha (asc/desc)
 * - Selección múltiple (checkbox + header checkbox)
 * - Filtros por estado (procesado/sin procesar) y categoría
 * - Paginación visual (10 por página) con leyenda "Mostrando 1-10 de 15"
 * - Navegación a detalle al hacer click en fila (excepto checkbox)
 * - Botones "Importar JSON" y "Procesar con IA" (toasts simuladas)
 * Estilos y tokens desde src/app/globals.css
 */

type SortDir = "asc" | "desc";
const PAGE_SIZE = 10;

function formatRelative(iso: string): string {
  const now = new Date().getTime();
  const ts = new Date(iso).getTime();
  const diff = Math.max(0, now - ts);
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return "Justo ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days} d`;
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("es-CO", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function EmailTable() {
  const router = useRouter();

  // UI State
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [filterEstado, setFilterEstado] = useState<"todos" | "procesado" | "sin-procesar">("todos");
  const [filterCategoria, setFilterCategoria] = useState<"todas" | "cliente" | "lead" | "interno" | "spam">("todas");

  // Derivados
  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  // Filtrar por búsqueda, estado y categoría
  const filtered = useMemo(() => {
    let data = [...mockEmails];

    // Filtro por estado (procesado / sin procesar)
    if (filterEstado !== "todos") {
      data = data.filter(e => (filterEstado === "procesado" ? e.processed : !e.processed));
    }
    // Filtro por categoría
    if (filterCategoria !== "todas") {
      data = data.filter(e => e.category === filterCategoria);
    }
    // Búsqueda
    if (query.trim() !== "") {
      const q = query.toLowerCase();
      data = data.filter(e =>
        e.from.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q)
      );
    }
    // Ordenamiento por fecha
    data.sort((a, b) => {
      const da = new Date(a.receivedAt).getTime();
      const db = new Date(b.receivedAt).getTime();
      return sortDir === "asc" ? da - db : db - da;
    });
    return data;
  }, [query, sortDir, filterEstado, filterCategoria]);

  // Paginación
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(total, startIdx + PAGE_SIZE);
  const pageData = filtered.slice(startIdx, endIdx);

  // Handlers
  function toggleSortByDate() {
    setSortDir(d => (d === "asc" ? "desc" : "asc"));
  }

  function isAllPageSelected() {
    if (pageData.length === 0) return false;
    return pageData.every(e => selected[e.id]);
  }

  function toggleSelectAllPage() {
    const all = isAllPageSelected();
    const next: Record<string, boolean> = { ...selected };
    pageData.forEach(e => {
      next[e.id] = !all;
    });
    setSelected(next);
  }

  function toggleSelect(id: string) {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function onRowClick(id: string) {
    router.push(`/emails/${id}`);
  }

  function onImport() {
    alert("Funcionalidad disponible en Semana 2");
  }

  function onProcessAI() {
    if (selectedCount === 0) return;
    alert(`Procesamiento con IA disponible en Semana 2 (seleccionados: ${selectedCount})`);
  }

  // Reset página cuando cambian filtros/búsqueda
  function resetPaging() {
    setPage(1);
  }

  // Render
  return (
    <div className="space-y-4">
      {/* Header con título y acciones */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1>Mis Emails</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onImport}
            className="flex items-center gap-2 px-3 py-2 rounded-md border border-[color:var(--color-border-light)] hover:bg-[color:var(--color-bg-hover)] transition-colors focus-ring"
            aria-label="Importar JSON"
          >
            <Upload className="w-4 h-4" aria-hidden />
            <span>Importar JSON</span>
          </button>
          <button
            type="button"
            onClick={onProcessAI}
            disabled={selectedCount === 0}
            className={`flex items-center gap-2 px-3 py-2 rounded-md border transition-colors focus-ring ${
              selectedCount > 0
                ? "border-[color:var(--color-border-focus)] hover:bg-[color:var(--color-bg-hover)]"
                : "border-[color:var(--color-border-light)] opacity-[var(--opacity-disabled)] cursor-not-allowed"
            }`}
            aria-label="Procesar con IA"
          >
            <Sparkles className="w-4 h-4" aria-hidden />
            <span>Procesar con IA{selectedCount ? ` (${selectedCount})` : ""}</span>
          </button>
        </div>
      </div>

      {/* Barra de herramientas: búsqueda + filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchBar
          value={query}
          onChange={(val) => {
            setQuery(val);
            resetPaging();
          }}
          placeholder="Buscar por remitente o asunto..."
          ariaLabel="Buscar emails"
        />

        <div className="flex items-center gap-2">
          {/* Filtro estado */}
          <label className="text-sm text-[color:var(--color-text-secondary)]">Estado</label>
          <select
            value={filterEstado}
            onChange={(e) => {
              setFilterEstado(e.target.value as typeof filterEstado);
              resetPaging();
            }}
            className="px-2 py-2 rounded-md border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-card)] text-sm"
            aria-label="Filtrar por estado"
          >
            <option value="todos">Todos</option>
            <option value="procesado">Procesado</option>
            <option value="sin-procesar">Sin procesar</option>
          </select>

          {/* Filtro categoría */}
          <label className="text-sm text-[color:var(--color-text-secondary)] ml-2">Categoría</label>
          <select
            value={filterCategoria}
            onChange={(e) => {
              setFilterCategoria(e.target.value as typeof filterCategoria);
              resetPaging();
            }}
            className="px-2 py-2 rounded-md border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-card)] text-sm"
            aria-label="Filtrar por categoría"
          >
            <option value="todas">Todas</option>
            <option value="cliente">Cliente</option>
            <option value="lead">Lead</option>
            <option value="interno">Interno</option>
            <option value="spam">Spam</option>
          </select>
        </div>
      </div>

      {/* Tabla / Cards responsive */}
      <div className="card-base overflow-x-auto">
        {total === 0 ? (
          <EmptyState
            title="No hay emails importados aún"
            description="Importa un archivo JSON para comenzar (simulado en Semana 1)."
            actionLabel="Importar JSON"
            onAction={onImport}
          />
        ) : (
          <>
            {/* Tabla Desktop */}
            <table className="w-full text-sm hide-mobile">
              <thead>
                <tr className="text-left text-[color:var(--color-text-secondary)]">
                  <th className="py-3 pl-4 pr-2">
                    <input
                      type="checkbox"
                      aria-label="Seleccionar todos en la página"
                      checked={isAllPageSelected()}
                      onChange={toggleSelectAllPage}
                    />
                  </th>
                  <th className="py-3 px-2">Remitente</th>
                  <th className="py-3 px-2">Asunto</th>
                  <th className="py-3 px-2 cursor-pointer select-none" onClick={toggleSortByDate}>
                    <span className="inline-flex items-center gap-1">
                      Fecha recibida
                      {sortDir === "asc" ? (
                        <ChevronUp className="w-4 h-4" aria-hidden />
                      ) : (
                        <ChevronDown className="w-4 h-4" aria-hidden />
                      )}
                    </span>
                  </th>
                  <th className="py-3 px-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-[color:var(--color-bg-hover)] cursor-pointer"
                    onClick={() => onRowClick(e.id)}
                  >
                    <td className="py-3 pl-4 pr-2" onClick={(ev) => ev.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label={`Seleccionar ${e.subject}`}
                        checked={!!selected[e.id]}
                        onChange={() => toggleSelect(e.id)}
                      />
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">{e.from}</td>
                    <td className="py-3 px-2">
                      <div className="truncate-2-lines max-w-[480px]">{e.subject}</div>
                    </td>
                    <td className="py-3 px-2 whitespace-nowrap">{formatRelative(e.receivedAt)}</td>
                    <td className="py-3 px-2">
                      {e.processed ? (
                        <span className="badge-procesado inline-flex items-center px-2 py-1 rounded text-xs">Procesado</span>
                      ) : (
                        <span className="badge-sin-procesar inline-flex items-center px-2 py-1 rounded text-xs">Sin procesar</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Cards Mobile */}
            <div className="hide-desktop hide-tablet p-2">
              {pageData.map((e) => (
                <div
                  key={e.id}
                  className="email-card mb-2"
                  onClick={() => onRowClick(e.id)}
                  role="button"
                  aria-label={`Abrir ${e.subject}`}
                >
                  <div className="email-card-header">
                    <div className="email-card-from">{e.from}</div>
                    <div className="email-card-date">{formatRelative(e.receivedAt)}</div>
                  </div>
                  <div className="email-card-subject">{e.subject}</div>
                  <div className="email-card-footer">
                    {e.processed ? (
                      <span className="badge-procesado inline-flex items-center px-2 py-1 rounded text-xs">Procesado</span>
                    ) : (
                      <span className="badge-sin-procesar inline-flex items-center px-2 py-1 rounded text-xs">Sin procesar</span>
                    )}
                    {e.category ? (
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                        e.category === "cliente"
                          ? "badge-categoria-cliente"
                          : e.category === "lead"
                          ? "badge-categoria-lead"
                          : e.category === "interno"
                          ? "badge-categoria-interno"
                          : "badge-categoria-spam"
                      }`}>
                        {e.category}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer de paginación */}
            <div className="flex items-center justify-between p-3 text-xs text-[color:var(--color-text-muted)]">
              <div>
                Mostrando {total === 0 ? 0 : startIdx + 1}-{endIdx} de {total} emails
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-2 py-1 rounded border border-[color:var(--color-border-light)] hover:bg-[color:var(--color-bg-hover)]"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  aria-label="Página anterior"
                >
                  Anterior
                </button>
                <span>Página {page} de {totalPages}</span>
                <button
                  type="button"
                  className="px-2 py-1 rounded border border-[color:var(--color-border-light)] hover:bg-[color:var(--color-bg-hover)]"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  aria-label="Página siguiente"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Estado de búsqueda sin resultados */}
      {total > 0 && pageData.length === 0 ? (
        <div className="card-base p-6">
          <EmptyState
            title="No se encontraron emails con ese criterio"
            description="Intenta ajustar la búsqueda o filtros."
          />
        </div>
      ) : null}
    </div>
  );
}