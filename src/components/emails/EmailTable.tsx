"use client";

import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Sparkles, RefreshCw, Check } from "lucide-react";
import SearchBar from "@/components/shared/SearchBar";
import Button from "@/components/ui/button";
import {
  getEmails,
  getNonProcessableEmailsCountForCurrentUser,
} from "@/actions/emails";
import ImportEmailsModal from "@/components/emails/ImportEmailsModal";
import ProcessEmailsModal from "./ProcessEmailsModal";
import { processEmailsWithAI } from "@/actions/ai-processing";
import {
  EmailWithMetadata,
  EmailFilterEstado,
  EmailFilterCategoria,
  EmailFilterAprobacion,
  EmailFilterPriority,
  SortDirection,
} from "@/types";
import type {
  Email as PrismaEmail,
  EmailMetadata as PrismaEmailMetadata,
} from "@prisma/client";

import GmailConnectionStatus from "@/components/emails/GmailConnectionStatus";
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
  return now - created < fiveMinutesInMs;
}

// Función para determinar si un email fue rechazado recientemente (en los últimos 5 minutos)
function isRecentlyRejected(email: EmailWithMetadata): boolean {
  // Un email está rechazado si:
  // 1. Tiene rejectionReason (fue rechazado)
  // 2. processedAt es null (fue revertido a estado no procesado)
  // 3. previousAIResult no es null (tiene snapshot del análisis descartado)
  // 4. rejectedAt tiene una marca de tiempo válida
  if (
    !email.rejectionReason ||
    email.processedAt !== null ||
    !email.previousAIResult ||
    !email.rejectedAt
  ) {
    return false;
  }

  const now = Date.now();
  const rejectedAtTs = new Date(email.rejectedAt).getTime();
  if (Number.isNaN(rejectedAtTs)) return false;

  const fiveMinutesInMs = 5 * 60 * 1000;

  // Solo se considera "reciente" si el rechazo fue en los últimos 5 minutos
  return now - rejectedAtTs < fiveMinutesInMs;
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

// Función para truncar texto y agregar puntos suspensivos
function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) {
    return text || "";
  }
  return text.slice(0, maxLength).trim() + "...";
}

// Función para limpiar texto HTML y obtener solo el texto plano
function cleanHtmlText(htmlText: string): string {
  // Remover tags HTML básicos y decodificar entidades HTML
  const div = document.createElement('div');
  div.innerHTML = htmlText;
  return div.textContent || div.innerText || '';
}

export default function EmailTable() {
  const router = useRouter();
  const requestIdRef = useRef(0);

  // UI State
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [filterEstado, setFilterEstado] =
    useState<EmailFilterEstado>("sin-procesar");
  const [filterCategoria, setFilterCategoria] =
    useState<EmailFilterCategoria>("todas");
  const [filterAprobacion, setFilterAprobacion] =
    useState<EmailFilterAprobacion>("todos");
  const [filterPrioridad, setFilterPrioridad] =
    useState<EmailFilterPriority>("todas");

  // Data State
  const [emails, setEmails] = useState<EmailWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processingIds, setProcessingIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultSummary, setResultSummary] = useState<{
    items: {
      id: string;
      subject: string;
      from: string;
      status: "success" | "error";
      error?: string;
    }[];
  } | null>(null);

  // Estado para correos no procesables ocultos (HITO 3 Filtrado No Procesables)
  const [nonProcessableCount, setNonProcessableCount] = useState<number | null>(
    null,
  );
  const [nonProcessableError, setNonProcessableError] = useState<string | null>(
    null,
  );

  // Función para recargar emails (reutilizable)
  const reloadEmails = useCallback(async () => {
    const reqId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError(null);

      const [result, countResult] = await Promise.all([
        getEmails(),
        getNonProcessableEmailsCountForCurrentUser(),
      ]);

      if (requestIdRef.current !== reqId) return;

      if (result.success) {
        const raw = Array.isArray(result.data)
          ? (result.data as ServerEmail[])
          : [];
        const normalized: EmailWithMetadata[] = raw.map((e) => {
          const d =
            e.receivedAt instanceof Date ? e.receivedAt : new Date(e.receivedAt);
          const safeDate = isNaN(d.getTime()) ? new Date(0) : d;
          const cd =
            e.createdAt instanceof Date ? e.createdAt : new Date(e.createdAt);
          const safeCreatedAt = isNaN(cd.getTime()) ? new Date(0) : cd;
          return {
            ...(e as unknown as EmailWithMetadata),
            receivedAt: safeDate,
            createdAt: safeCreatedAt,
            metadata: e.metadata ?? null,
          };
        });
        setEmails(normalized);
      } else {
        setError(result.error || "Error al cargar los emails");
      }

      if (countResult.success) {
        const count =
          typeof countResult.data === "number" && countResult.data >= 0
            ? countResult.data
            : 0;
        setNonProcessableCount(count);
        setNonProcessableError(null);
      } else {
        setNonProcessableCount(null);
        setNonProcessableError(
          countResult.error ?? "Error al obtener correos ocultos",
        );
      }
    } catch (err) {
      if (requestIdRef.current !== reqId) return;
      setError("Error de conexión al servidor");
      // eslint-disable-next-line no-console
      console.error("Error loading emails:", err);
    } finally {
      if (requestIdRef.current !== reqId) return;
      setLoading(false);
    }
  }, []);

  // Cargar emails desde Server Actions con control de concurrencia
  useEffect(() => {
    void reloadEmails();
    return () => {
      // Invalida cualquier respuesta tardía de esta instancia
      requestIdRef.current++;
    };
  }, [reloadEmails]); // Se ejecuta solo al montar el componente

  // Derivados
  const selectedIds = useMemo(
    () => Object.keys(selected).filter((id) => selected[id]),
    [selected],
  );
  const selectedCount = selectedIds.length;
  const isOverLimit = selectedCount > 10;
  const selectedEmails = useMemo(
    () => emails.filter((e) => selected[e.id]).slice(0, 10),
    [emails, selected],
  );

  // Contadores por estado (para chips visuales)
  const estadoCounts = useMemo(() => {
    let aprobados = 0;
    let procesados = 0;
    let sinProcesar = 0;

    for (const e of emails) {
      if (e.processedAt === null) {
        sinProcesar += 1;
      } else if (e.approvedAt !== null) {
        aprobados += 1;
      } else {
        procesados += 1;
      }
    }

    return { aprobados, procesados, sinProcesar };
  }, [emails]);

  // Filtros IA adicionales (categoría/aprobación/prioridad) solo tienen sentido cuando hay metadata IA
  const showIAFilters =
    filterEstado === "procesado" || filterEstado === "aprobado";

  // Filtrar por búsqueda, estado y categoría/prioridad
  const filtered = useMemo(() => {
    let data = [...emails];

    // Filtro por estado (no procesado / procesado / aprobado)
    if (filterEstado !== "todos") {
      data = data.filter((e) => {
        if (filterEstado === "procesado") {
          return e.processedAt !== null;
        }
        if (filterEstado === "sin-procesar") {
          return e.processedAt === null;
        }
        // "aprobado"
        return e.processedAt !== null && e.approvedAt !== null;
      });
    }

    // Filtro por categoría (solo tiene sentido cuando hay metadata IA)
    if (filterCategoria !== "todas") {
      data = data.filter((e) => e.metadata?.category === filterCategoria);
    }

    // Filtro por prioridad IA
    if (filterPrioridad !== "todas") {
      data = data.filter((e) => e.metadata?.priority === filterPrioridad);
    }

    // Filtro por aprobación (aprobado / no-aprobado dentro de procesados)
    if (filterAprobacion !== "todos") {
      data = data.filter((e) => {
        if (filterAprobacion === "aprobado") {
          return e.processedAt !== null && e.approvedAt !== null;
        }
        // "no-aprobado"
        return e.processedAt !== null && e.approvedAt === null;
      });
    }

    // Búsqueda
    if (query.trim() !== "") {
      const q = query.toLowerCase();
      data = data.filter(
        (e) =>
          e.from.toLowerCase().includes(q) ||
          e.subject.toLowerCase().includes(q),
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
  }, [
    emails,
    query,
    sortDir,
    filterEstado,
    filterCategoria,
    filterPrioridad,
    filterAprobacion,
  ]);

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

  // Handlers
  function toggleSortByDate() {
    setSortDir((d) => (d === "asc" ? "desc" : "asc") as SortDirection);
  }

  function isAllPageSelected() {
    if (pageData.length === 0) return false;
    return pageData.every((e) => selected[e.id]);
  }

  function toggleSelectAllPage() {
    const all = isAllPageSelected();
    const next: Record<string, boolean> = { ...selected };

    if (all) {
      // Deseleccionar todos en la página
      pageData.forEach((e) => {
        next[e.id] = false;
      });
    } else {
      // Seleccionar hasta completar el límite de 10
      const currentCount = Object.values(next).filter(Boolean).length;
      let remaining = Math.max(0, 10 - currentCount);
      for (const e of pageData) {
        if (!next[e.id] && remaining > 0) {
          next[e.id] = true;
          remaining--;
        }
      }
    }
    setSelected(next);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = { ...prev };
      const currentlySelected = !!next[id];
      if (!currentlySelected) {
        const count = Object.values(next).filter(Boolean).length;
        if (count >= 10) {
          // Límite alcanzado: ignorar nuevos check
          return prev;
        }
      }
      next[id] = !currentlySelected;
      return next;
    });
  }

  function onRowClick(id: string) {
    router.push(`/emails/${id}`);
  }

  function onRefresh() {
    window.location.reload();
  }

  async function onProcessAI() {
    if (selectedCount === 0 || isOverLimit) return;
    setResultSummary(null);
    setProgress(0);
    setShowModal(true);
  }

  // Reset página cuando cambian filtros/búsqueda
  function resetPaging() {
    setPage(1);
  }

  // Helpers para chips de categoría/prioridad
  function handleCategoriaChipClick(value: EmailFilterCategoria) {
    setFilterCategoria((prev) => (prev === value ? "todas" : value));
    resetPaging();
  }

  function handlePrioridadChipClick(value: EmailFilterPriority) {
    setFilterPrioridad((prev) => (prev === value ? "todas" : value));
    resetPaging();
  }

  // Helper para obtener clases CSS de chips de categoría
  function getCategoriaChipClasses(value: EmailFilterCategoria) {
    const isActive = filterCategoria === value;
    const baseClasses = "estado-chip";
    
    if (value === "todas") {
      // El chip "Todas" usa el estilo estándar de estado chip
      return isActive ? `${baseClasses} estado-chip-active` : `${baseClasses} estado-chip-faded`;
    }
    
    // Si está activo, usar color específico, si no, usar gris uniforme
    const activeClasses = {
      "cliente": "chip-categoria-cliente-active",
      "lead": "chip-categoria-lead-active",
      "interno": "chip-categoria-interno-active",
      "spam": "chip-categoria-spam-active"
    };
    
    const inactiveClasses = {
      "cliente": "chip-categoria-cliente",
      "lead": "chip-categoria-lead",
      "interno": "chip-categoria-interno",
      "spam": "chip-categoria-spam"
    };
    
    return `${baseClasses} ${isActive ? activeClasses[value] : inactiveClasses[value]}`;
  }

  // Helper para obtener clases CSS de chips de prioridad
  function getPrioridadChipClasses(value: EmailFilterPriority) {
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
    
    return `${baseClasses} ${isActive ? activeClasses[value] : inactiveClasses[value]}`;
  }

  // Render
  return (
    <div className="space-y-4">
      {/* Estado de conexión e importación desde Gmail */}
      <GmailConnectionStatus onImported={() => reloadEmails()} />

      {/* Banner de correos no procesables ocultos (HITO 3 Filtrado No Procesables) 
            {nonProcessableCount !== null && nonProcessableCount > 0 && (
        <div className="text-xs text-[color:var(--color-text-secondary)] bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border-light)] rounded-md px-3 py-2">
          ℹ️ {nonProcessableCount} correos de tu Gmail (promocionales o sin
          contenido útil) se han ocultado automáticamente para centrarse en
          correos de negocio. Revísalos en tu Gmail si los necesitas.
        </div>
      )}
      
      */}

      {nonProcessableError && (
        <div className="text-xs text-[color:var(--color-danger-700)]">
          {nonProcessableError}
        </div>
      )}

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
          {selectedCount > 0 && (
            <Button
              type="button"
              onClick={onProcessAI}
              disabled={isOverLimit}
              aria-label="Procesar con IA"
              variant="primary"
              size="md"
              leftIcon={<Sparkles className="w-4 h-4" aria-hidden />}
            >
              Procesar con IA ({Math.min(selectedCount, 10)}/10)
            </Button>
          )}
        </div>
      </div>

      {/* Barra de herramientas: búsqueda + filtros */}
      <div className="flex flex-col gap-3">
        {/* Fila principal: búsqueda + chips de estado */}
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

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end md:gap-3">
            {/* Chips de estado con contadores */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                className={`estado-chip ${
                  filterEstado === "aprobado"
                    ? "estado-chip-aprobado-active"
                    : "estado-chip-aprobado"
                } ${
                  filterEstado !== "todos" && filterEstado !== "aprobado"
                    ? "estado-chip-faded"
                    : ""
                }`}
                onClick={() => {
                  setFilterEstado((prev) =>
                    prev === "aprobado" ? "todos" : "aprobado",
                  );
                  // Al cambiar de estado, reiniciar filtros IA a "todas"
                  setFilterCategoria("todas");
                  setFilterPrioridad("todas");
                  setFilterAprobacion("todos");
                  resetPaging();
                }}
                aria-pressed={filterEstado === "aprobado"}
              >
                <span className="estado-chip-dot estado-chip-dot-aprobado" />
                <span>Aprobados</span>
                <span className="estado-chip-count">
                  {estadoCounts.aprobados}
                </span>
              </button>

              <button
                type="button"
                className={`estado-chip ${
                  filterEstado === "procesado"
                    ? "estado-chip-procesado-active"
                    : "estado-chip-procesado"
                } ${
                  filterEstado !== "todos" && filterEstado !== "procesado"
                    ? "estado-chip-faded"
                    : ""
                }`}
                onClick={() => {
                  setFilterEstado((prev) =>
                    prev === "procesado" ? "todos" : "procesado",
                  );
                  setFilterCategoria("todas");
                  setFilterPrioridad("todas");
                  setFilterAprobacion("todos");
                  resetPaging();
                }}
                aria-pressed={filterEstado === "procesado"}
              >
                <span className="estado-chip-dot estado-chip-dot-procesado" />
                <span>Procesados</span>
                <span className="estado-chip-count">
                  {estadoCounts.procesados}
                </span>
              </button>

              <button
                type="button"
                className={`estado-chip ${
                  filterEstado === "sin-procesar"
                    ? "estado-chip-sin-procesar-active"
                    : "estado-chip-sin-procesar"
                } ${
                  filterEstado !== "todos" && filterEstado !== "sin-procesar"
                    ? "estado-chip-faded"
                    : ""
                }`}
                onClick={() => {
                  setFilterEstado((prev) =>
                    prev === "sin-procesar" ? "todos" : "sin-procesar",
                  );
                  setFilterCategoria("todas");
                  setFilterPrioridad("todas");
                  setFilterAprobacion("todos");
                  resetPaging();
                }}
                aria-pressed={filterEstado === "sin-procesar"}
              >
                <span className="estado-chip-dot estado-chip-dot-sin-procesar" />
                <span>Sin procesar</span>
                <span className="estado-chip-count">
                  {estadoCounts.sinProcesar}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtros contextuales de IA (categoría / prioridad) - Bloque cohesivo */}
        {showIAFilters && (
          <div className="bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border-light)] rounded-lg p-4 animate-slide-up">
            <div className="flex flex-col gap-3">

              {/* Grid responsive para filtros IA */}
              <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
                {/* Columna de categoría */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-[color:var(--color-text-secondary)] uppercase tracking-wide">
                    Categoría:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
 

                    <button
                      type="button"
                      className={getCategoriaChipClasses("cliente")}
                      onClick={() => handleCategoriaChipClick("cliente")}
                      aria-pressed={filterCategoria === "cliente"}
                    >
                      <span>Cliente</span>
                    </button>

                    <button
                      type="button"
                      className={getCategoriaChipClasses("lead")}
                      onClick={() => handleCategoriaChipClick("lead")}
                      aria-pressed={filterCategoria === "lead"}
                    >
                      <span>Lead</span>
                    </button>

                    <button
                      type="button"
                      className={getCategoriaChipClasses("interno")}
                      onClick={() => handleCategoriaChipClick("interno")}
                      aria-pressed={filterCategoria === "interno"}
                    >
                      <span>Interno</span>
                    </button>

                    <button
                      type="button"
                      className={getCategoriaChipClasses("spam")}
                      onClick={() => handleCategoriaChipClick("spam")}
                      aria-pressed={filterCategoria === "spam"}
                    >
                      <span>Spam</span>
                    </button>
                  </div>
                </div>

                {/* Columna de prioridad */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-[color:var(--color-text-secondary)] uppercase tracking-wide">
                    Prioridad:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">


                    <button
                      type="button"
                      className={getPrioridadChipClasses("alta")}
                      onClick={() => handlePrioridadChipClick("alta")}
                      aria-pressed={filterPrioridad === "alta"}
                    >
                      <span>Alta</span>
                    </button>

                    <button
                      type="button"
                      className={getPrioridadChipClasses("media")}
                      onClick={() => handlePrioridadChipClick("media")}
                      aria-pressed={filterPrioridad === "media"}
                    >
                      <span>Media</span>
                    </button>

                    <button
                      type="button"
                      className={getPrioridadChipClasses("baja")}
                      onClick={() => handlePrioridadChipClick("baja")}
                      aria-pressed={filterPrioridad === "baja"}
                    >
                      <span>Baja</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla / Cards responsive */}
      <div className="card-base overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--color-primary-500)]"></div>
            <span className="ml-2 text-[color:var(--color-text-secondary)]">
              Cargando emails...
            </span>
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
            <div className="text-[color:var(--color-text-primary)] mb-4">
              No hay emails importados aún
            </div>
            <div className="text-[color:var(--color-text-secondary)] mb-6">
              Importa un archivo JSON para comenzar.
            </div>
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
                  <th className="py-3 px-2 min-w-[300px]">Vista previa</th>
                  <th
                    className="py-3 px-2 cursor-pointer select-none"
                    onClick={toggleSortByDate}
                  >
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
                {pageData.map((e) => {
                  const isNew = isNewEmail(e.createdAt);
                  const isRejected = isRecentlyRejected(e);

                  return (
                    <tr
                      key={e.id}
                      className={
                        isRejected
                          ? "email-row-rechazado cursor-pointer"
                          : isNew
                          ? "email-row-nuevo cursor-pointer"
                          : "hover:bg-[color:var(--color-bg-hover)] cursor-pointer"
                      }
                      onClick={() => onRowClick(e.id)}
                    >
                      <td
                        className="py-3 pl-4 pr-2"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          aria-label={`Seleccionar ${e.subject}`}
                          checked={!!selected[e.id]}
                          onChange={() => toggleSelect(e.id)}
                        />
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">{e.from}</td>
                      <td className="py-3 px-2">
                        <div className="truncate-2-lines max-w-[480px]">
                          {e.subject}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="email-preview max-w-[300px]">
                          {truncateText(cleanHtmlText(e.body || ""), 100)}
                        </div>
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        {formatRelative(e.receivedAt.toISOString())}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Badge "Rechazado" para emails rechazados recientemente */}
                          {isRejected && (
                            <span className="badge-email-rechazado inline-flex items-center px-2 py-1 rounded text-xs">
                              Rechazado
                            </span>
                          )}
                          {/* Badge "Nuevo" para emails importados recientemente */}
                          {!isRejected && isNew && (
                            <span className="badge-email-nuevo inline-flex items-center px-2 py-1 rounded text-xs">
                              Nuevo
                            </span>
                          )}
                          {/* En procesamiento */}
                          {processingIds.includes(e.id) && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-[color:var(--color-bg-muted)] text-[color:var(--color-text-primary)]">
                              <span
                                className="animate-spin rounded-full h-3 w-3 border-b-2 border-[color:var(--color-primary-500)] mr-1"
                                aria-hidden
                              ></span>
                              En procesamiento
                            </span>
                          )}
                          {/* Badge de estado procesado/sin procesar */}
                          {e.processedAt !== null ? (
                            <span className="badge-procesado inline-flex items-center px-2 py-1 rounded text-xs">
                              Procesado
                            </span>
                          ) : (
                            <span className="badge-sin-procesar inline-flex items-center px-2 py-1 rounded text-xs">
                              Sin procesar
                            </span>
                          )}
                          {/* Badge de aprobación */}
                          {e.processedAt !== null && e.approvedAt !== null && (
                            <span className="badge-aprobado inline-flex items-center px-2 py-1 rounded text-xs">
                              <Check className="w-3 h-3 mr-1" aria-hidden />
                              Aprobado
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Cards Mobile */}
            <div className="hide-desktop hide-tablet p-2">
              {pageData.map((e) => {
                const isNew = isNewEmail(e.createdAt);
                const isRejected = isRecentlyRejected(e);

                return (
                  <div
                    key={e.id}
                    className={`email-card mb-2 ${
                      isRejected
                        ? "email-card-rechazado"
                        : isNew
                        ? "email-card-nuevo"
                        : ""
                    }`}
                    onClick={() => onRowClick(e.id)}
                    role="button"
                    aria-label={`Abrir ${e.subject}`}
                  >
                    <div className="email-card-header">
                      <div className="email-card-from">{e.from}</div>
                      <div className="email-card-date">
                        {formatRelative(e.receivedAt.toISOString())}
                      </div>
                    </div>
                    <div className="email-card-subject">{e.subject}</div>
                    
                    {/* Vista previa para móvil */}
                    <div className="email-preview text-xs text-[color:var(--color-text-muted)] mt-1 line-clamp-2">
                      {truncateText(cleanHtmlText(e.body || ""), 80)}
                    </div>
                    
                    <div className="email-card-footer">
                      {/* Badge "Rechazado" para emails rechazados recientemente */}
                      {isRejected && (
                        <span className="badge-email-rechazado inline-flex items-center px-2 py-1 rounded text-xs">
                          Rechazado
                        </span>
                      )}
                      {/* Badge "Nuevo" para emails importados recientemente */}
                      {!isRejected && isNew && (
                        <span className="badge-email-nuevo inline-flex items-center px-2 py-1 rounded text-xs">
                          Nuevo
                        </span>
                      )}
                      {/* Badge de estado procesado/sin procesar */}
                      {e.processedAt !== null ? (
                        <span className="badge-procesado inline-flex items-center px-2 py-1 rounded text-xs">
                          Procesado
                        </span>
                      ) : (
                        <span className="badge-sin-procesar inline-flex items-center px-2 py-1 rounded text-xs">
                          Sin procesar
                        </span>
                      )}
                      {/* Badge de aprobación */}
                      {e.processedAt !== null && e.approvedAt !== null && (
                        <span className="badge-aprobado inline-flex items-center px-2 py-1 rounded text-xs">
                          <Check className="w-3 h-3 mr-1" aria-hidden />
                          Aprobado
                        </span>
                      )}
                      {/* Badge de categoría si existe */}
                      {e.metadata?.category ? (
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                            e.metadata.category === "cliente"
                              ? "badge-categoria-cliente"
                              : e.metadata.category === "lead"
                              ? "badge-categoria-lead"
                              : e.metadata.category === "interno"
                              ? "badge-categoria-interno"
                              : "badge-categoria-spam"
                          }`}
                        >
                          {e.metadata.category}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer de paginación */}
            <div className="flex items-center justify-between p-3 text-xs text-[color:var(--color-text-muted)]">
              <div>
                Mostrando {total === 0 ? 0 : startIdx + 1}-{endIdx} de {total}{" "}
                emails
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  aria-label="Página anterior"
                >
                  Anterior
                </Button>
                <span>
                  Página {page} de {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Modal de Procesamiento */}
      <ProcessEmailsModal
        open={showModal}
        emails={selectedEmails}
        processing={processing}
        progress={progress}
        resultSummary={resultSummary}
        onClose={() => {
          // Cerrar modal solo si no está procesando
          if (!processing) {
            setShowModal(false);
            setResultSummary(null);
            setProgress(0);
          }
        }}
        onConfirm={async () => {
          const ids = selectedEmails.map((e) => e.id);
          if (ids.length === 0) return;

          setProcessingIds(ids);
          setProcessing(true);
          setProgress(5);

          // Simulación de progreso mientras espera la respuesta real
          let local = 5;
          const timer = window.setInterval(() => {
            local = Math.min(90, local + 7);
            setProgress(local);
          }, 300);

          try {
            const result = await processEmailsWithAI(ids);
            const errorIds = (result.errors || []).map((e) => e.emailId);

            const items: {
              id: string;
              subject: string;
              from: string;
              status: "success" | "error";
              error?: string;
            }[] = selectedEmails.map((e) => {
              const failed = errorIds.includes(e.id);
              return {
                id: e.id,
                subject: e.subject,
                from: e.from,
                status: (failed ? "error" : "success") as "error" | "success",
                error: failed ? "Fallo al procesar con IA" : undefined,
              };
            });

            setResultSummary({ items });
            setProgress(100);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error("Fallo en processEmailsWithAI:", err);
            const items = selectedEmails.map((e) => ({
              id: e.id,
              subject: e.subject,
              from: e.from,
              status: "error" as const,
              error: "Error inesperado en el procesamiento",
            }));
            setResultSummary({ items });
            setProgress(100);
          } finally {
            window.clearInterval(timer);
            setProcessing(false);
            setProcessingIds([]);
            setSelected({});
            await reloadEmails();
            // Nota: dejamos el modal abierto para que el usuario lea el resumen y cierre manualmente
          }
        }}
      />
    </div>
  );
}
