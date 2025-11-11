"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Sparkles, RefreshCw } from "lucide-react";
import SearchBar from "@/components/shared/SearchBar";
import EmptyState from "@/components/shared/EmptyState";
import Button from "@/components/ui/button";
import { getEmails } from "@/actions/emails";
import ImportEmailsModal from "@/components/emails/ImportEmailsModal";
import {
  EmailWithMetadata,
  EmailFilterEstado,
  EmailFilterCategoria,
  SortDirection
} from "@/types";
import type { Email as PrismaEmail, EmailMetadata as PrismaEmailMetadata } from "@prisma/client";

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

const PAGE_SIZE = 10;

type ServerEmail = PrismaEmail & {
  metadata: PrismaEmailMetadata | null;
  receivedAt: string | Date;
  createdAt: string | Date;
};

// Función para determinar si un email es "nuevo" (importado en los últimos 5 minutos)
function isNewEmail(createdAt: string | Date): boolean {
  const now = new Date().getTime();
  const created = new Date(createdAt).getTime();
  const fiveMinutesInMs = 5 * 60 * 1000;
  return (now - created) < fiveMinutesInMs;
}

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
  const requestIdRef = useRef(0);

  // UI State
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [filterEstado, setFilterEstado] = useState<EmailFilterEstado>("todos");
  const [filterCategoria, setFilterCategoria] = useState<EmailFilterCategoria>("todas");
  
  // Data State
  const [emails, setEmails] = useState<EmailWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para recargar emails (reutilizable)
  const reloadEmails = useCallback(async () => {
    const reqId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError(null);
      const result = await getEmails();
      if (requestIdRef.current !== reqId) return;

      if (result.success) {
        const raw = Array.isArray(result.data) ? (result.data as ServerEmail[]) : [];
        console.log("Emails cargados (raw):", raw);
        const normalized: EmailWithMetadata[] = raw.map((e) => {
          const d = e.receivedAt instanceof Date ? e.receivedAt : new Date(e.receivedAt);
          const safeDate = isNaN(d.getTime()) ? new Date(0) : d;
          const cd = e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt);
          const safeCreatedAt = isNaN(cd.getTime()) ? new Date(0) : cd;
          return {
            ...(e as unknown as EmailWithMetadata),
            receivedAt: safeDate,
            createdAt: safeCreatedAt,
            metadata: e.metadata ?? null,
          };
        });
        console.log("Emails normalizados:", normalized);
        setEmails(normalized);
      } else {
        setError(result.error || "Error al cargar los emails");
      }
    } catch (err) {
      if (requestIdRef.current !== reqId) return;
      setError("Error de conexión al servidor");
      console.error("Error loading emails:", err);
    } finally {
      if (requestIdRef.current !== reqId) return;
      setLoading(false);
    }
  }, []);

  // Cargar emails desde Server Actions con control de concurrencia
  useEffect(() => {
    reloadEmails();
    return () => {
      // Invalida cualquier respuesta tardía de esta instancia
      requestIdRef.current++;
    };
  }, [reloadEmails]); // Se ejecuta solo al montar el componente

  // Derivados
  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  // Filtrar por búsqueda, estado y categoría
  const filtered = useMemo(() => {
    let data = [...emails];

    // Filtro por estado (procesado / sin procesar)
    if (filterEstado !== "todos") {
      data = data.filter(e => (filterEstado === "procesado" ? e.processedAt !== null : e.processedAt === null));
    }
    // Filtro por categoría
    if (filterCategoria !== "todas") {
      data = data.filter(e => e.metadata?.category === filterCategoria);
    }
    // Búsqueda
    if (query.trim() !== "") {
      const q = query.toLowerCase();
      data = data.filter(e =>
        e.from.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q)
      );
    }
    // DOBLE ORDENAMIENTO: Primario por receivedAt, Secundario por createdAt
    data.sort((a, b) => {
      const da = a.receivedAt.getTime();
      const db = b.receivedAt.getTime();
      
      // Ordenamiento primario: receivedAt
      const receivedDiff = sortDir === "asc" ? da - db : db - da;
      if (receivedDiff !== 0) return receivedDiff;
      
      // Ordenamiento secundario: createdAt (descendente por defecto para emails más recientes primero)
      const ca = a.createdAt.getTime();
      const cb = b.createdAt.getTime();
      return cb - ca; // Siempre descendente para createdAt
    });
    return data;
  }, [emails, query, sortDir, filterEstado, filterCategoria]);

  // Paginación
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(total, startIdx + PAGE_SIZE);
  const pageData = filtered.slice(startIdx, endIdx);
  
  // Asegurar que la página actual sea válida si cambia el total de páginas (evita páginas vacías intermitentes)
  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  // Debug logs
  console.log("Debug - EmailTable:", {
    emailsLength: emails.length,
    filteredLength: filtered.length,
    pageDataLength: pageData.length,
    total,
    loading,
    error
  });

  // Handlers
  function toggleSortByDate() {
    setSortDir(d => (d === "asc" ? "desc" : "asc") as SortDirection);
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

  function onRefresh() {
    window.location.reload();
  }

  function onProcessAI() {
    if (selectedCount === 0) return;
    alert(`Procesamiento con IA disponible en futuras versiones (seleccionados: ${selectedCount})`);
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
          <Button
            type="button"
            onClick={onRefresh}
            aria-label="Recargar emails"
            variant="outline"
            size="md"
            leftIcon={<RefreshCw className="w-4 h-4" aria-hidden />}
          >
            Recargar
          </Button>
          <ImportEmailsModal onImported={() => reloadEmails()} />
          <Button
            type="button"
            onClick={onProcessAI}
            disabled={selectedCount === 0}
            aria-label="Procesar con IA"
            variant="primary"
            size="md"
            leftIcon={<Sparkles className="w-4 h-4" aria-hidden />}
          >
            Procesar con IA{selectedCount ? ` (${selectedCount})` : ""}
          </Button>
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
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--color-primary-500)]"></div>
            <span className="ml-2 text-[color:var(--color-text-secondary)]">Cargando emails...</span>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-red-500 mb-4">Error: {error}</div>
            <Button onClick={onRefresh} variant="outline" size="sm">
              Reintentar
            </Button>
          </div>
        ) : emails.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="text-[color:var(--color-text-primary)] mb-4">No hay emails importados aún</div>
            <div className="text-[color:var(--color-text-secondary)] mb-6">Importa un archivo JSON para comenzar.</div>
            <ImportEmailsModal onImported={() => reloadEmails()} />
          </div>
        ) : total === 0 ? (
          <div className="p-6">
            <div className="text-center text-[color:var(--color-text-primary)]">
              No se encontraron emails con ese criterio
            </div>
            <div className="text-center text-[color:var(--color-text-secondary)] mt-2">
              Intenta ajustar la búsqueda o filtros.
            </div>
          </div>
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
                    className={isNewEmail(e.createdAt)
                      ? "email-row-nuevo cursor-pointer"
                      : "hover:bg-[color:var(--color-bg-hover)] cursor-pointer"
                    }
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
                    <td className="py-3 px-2 whitespace-nowrap">{formatRelative(e.receivedAt.toISOString())}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Badge "Nuevo" para emails importados recientemente */}
                        {isNewEmail(e.createdAt) && (
                          <span className="badge-email-nuevo inline-flex items-center px-2 py-1 rounded text-xs">Nuevo</span>
                        )}
                        {/* Badge de estado procesado/sin procesar */}
                        {e.processedAt !== null ? (
                          <span className="badge-procesado inline-flex items-center px-2 py-1 rounded text-xs">Procesado</span>
                        ) : (
                          <span className="badge-sin-procesar inline-flex items-center px-2 py-1 rounded text-xs">Sin procesar</span>
                        )}
                      </div>
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
                  className={`email-card mb-2 ${isNewEmail(e.createdAt) ? 'email-card-nuevo' : ''}`}
                  onClick={() => onRowClick(e.id)}
                  role="button"
                  aria-label={`Abrir ${e.subject}`}
                >
                  <div className="email-card-header">
                    <div className="email-card-from">{e.from}</div>
                    <div className="email-card-date">{formatRelative(e.receivedAt.toISOString())}</div>
                  </div>
                  <div className="email-card-subject">{e.subject}</div>
                  <div className="email-card-footer">
                    {/* Badge "Nuevo" para emails importados recientemente */}
                    {isNewEmail(e.createdAt) && (
                      <span className="badge-email-nuevo inline-flex items-center px-2 py-1 rounded text-xs">Nuevo</span>
                    )}
                    {/* Badge de estado procesado/sin procesar */}
                    {e.processedAt !== null ? (
                      <span className="badge-procesado inline-flex items-center px-2 py-1 rounded text-xs">Procesado</span>
                    ) : (
                      <span className="badge-sin-procesar inline-flex items-center px-2 py-1 rounded text-xs">Sin procesar</span>
                    )}
                    {/* Badge de categoría si existe */}
                    {e.metadata?.category ? (
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                        e.metadata.category === "cliente"
                          ? "badge-categoria-cliente"
                          : e.metadata.category === "lead"
                          ? "badge-categoria-lead"
                          : e.metadata.category === "interno"
                          ? "badge-categoria-interno"
                          : "badge-categoria-spam"
                      }`}>
                        {e.metadata.category}
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  aria-label="Página anterior"
                >
                  Anterior
                </Button>
                <span>Página {page} de {totalPages}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  aria-label="Página siguiente"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}