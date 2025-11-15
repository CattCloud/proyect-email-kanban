"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import SearchBar from "@/components/shared/SearchBar";
import { EmailFilterCategoria, EmailFilterPriority, SortDirection }  from "@/types";
import {
  confirmProcessingResults,
  rejectProcessingResults,
  type GenericActionResult,
} from "@/actions/ai-processing";

export interface ReviewTask {
  id: string;
  description: string;
  dueDate: string | null;
  tags: string[];
  participants: string[];
  status: string; // 'todo' | 'doing' | 'done'
}

export interface ReviewMetadata {
  id: string;
  category: string | null;
  priority: string | null;
  summary?: string | null;
  contactName?: string | null;
  tasks?: ReviewTask[];
}

export interface ReviewEmailItem {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string | Date;
  createdAt: string | Date;
  processedAt: Date | null;
  metadata: ReviewMetadata | null;
}

// Formateo de fecha legible en español
function formatReadableDate(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "Fecha inválida";

  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const day = d.getUTCDate();
  const month = months[d.getUTCMonth()];
  const hour = d.getUTCHours();
  const minute = d.getUTCMinutes();

  const formatTime = (h: number, m: number) => {
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    return `${hh}:${mm}`;
  };

  return ` ${day} de ${month} a las ${formatTime(hour, minute)}`;
}

// Formateo estable para SSR/CSR: sin locale ni timezone variables (UTC fijo)
function formatDateUTC(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "Fecha inválida";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getUTCFullYear();
  const mm = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mi = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} UTC`;
}

function truncateText(text: string, length = 420): string {
  if (!text) return "";
  if (text.length <= length) return text;
  return `${text.slice(0, length)}…`;
}

/**
 * HITO 4 - ReviewAccordion
 * - Lista vertical de tarjetas plegables (accordion)
 * - Solo una expandida a la vez
 * - Acciones Aceptar/Rechazar en el panel expandido
 * - Enlace a detalle del email separado del trigger de despliegue
 */
export default function ReviewAccordion({ items }: { items: ReviewEmailItem[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [busyById, setBusyById] = useState<Record<string, "accept" | "reject" | null>>({});
  
  // Estados para filtros
  const [query, setQuery] = useState("");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [filterCategoria, setFilterCategoria] = useState<EmailFilterCategoria>("todas");
  const [filterPrioridad, setFilterPrioridad] = useState<EmailFilterPriority>("todas");

  const ordered = useMemo(() => {
    // Filtrar y ordenar emails
    let data = [...items];

    // Aplicar filtros
    // Filtro por categoría
    if (filterCategoria !== "todas") {
      data = data.filter(e => e.metadata?.category === filterCategoria);
    }
    // Filtro por prioridad
    if (filterPrioridad !== "todas") {
      data = data.filter(e => e.metadata?.priority === filterPrioridad);
    }
    // Búsqueda por remitente o asunto
    if (query.trim() !== "") {
      const q = query.toLowerCase();
      data = data.filter(e =>
        e.from.toLowerCase().includes(q) ||
        e.subject.toLowerCase().includes(q)
      );
    }
    
    // Ordenamiento doble: recibido primero, luego creado
    data.sort((a, b) => {
      const ra = new Date(a.receivedAt).getTime();
      const rb = new Date(b.receivedAt).getTime();
      
      // Ordenamiento primario: receivedAt
      const receivedDiff = sortDir === "asc" ? ra - rb : rb - ra;
      if (receivedDiff !== 0) return receivedDiff;
      
      // Ordenamiento secundario: createdAt (siempre descendente para mantener orden consistente)
      const ca = new Date(a.createdAt).getTime();
      const cb = new Date(b.createdAt).getTime();
      return cb - ca;
    });
    
    return data;
  }, [items, query, sortDir, filterCategoria, filterPrioridad]);

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  function toggleSortByDate() {
    setSortDir(d => (d === "asc" ? "desc" : "asc") as SortDirection);
  }

  function setBusy(id: string, v: "accept" | "reject" | null) {
    setBusyById((prev) => ({ ...prev, [id]: v }));
  }

  async function onAccept(id: string) {
    setBusy(id, "accept");
    try {
      const res = (await confirmProcessingResults(id)) as GenericActionResult;
      if (!res.success) {
        alert(res.error ?? "Error al confirmar resultados IA");
        return;
      }
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert("Fallo al confirmar resultados");
    } finally {
      setBusy(id, null);
    }
  }

  async function onReject(id: string) {
    setBusy(id, "reject");
    try {
      const res = (await rejectProcessingResults(id)) as GenericActionResult;
      if (!res.success) {
        alert(res.error ?? "Error al rechazar resultados IA");
        return;
      }
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      alert("Fallo al rechazar resultados");
    } finally {
      setBusy(id, null);
    }
  }

  useEffect(() => {
    // Si la lista cambia, cerrar acordeón para evitar UI inconsistente
    setOpenId(null);
  }, [items.length]);

  return (
    <div className="space-y-4">
      {/* Barra de herramientas: búsqueda + filtros */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchBar
          value={query}
          onChange={(val) => setQuery(val)}
          placeholder="Buscar por remitente o asunto..."
          ariaLabel="Buscar emails"
        />

        <div className="flex items-center gap-2">
          {/* Filtro categoría */}
          <label className="text-sm text-[color:var(--color-text-secondary)]">Categoría</label>
          <select
            value={filterCategoria}
            onChange={(e) => {
              setFilterCategoria(e.target.value as typeof filterCategoria);
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

          {/* Filtro prioridad */}
          <label className="text-sm text-[color:var(--color-text-secondary)] ml-2">Prioridad</label>
          <select
            value={filterPrioridad}
            onChange={(e) => {
              setFilterPrioridad(e.target.value as typeof filterPrioridad);
            }}
            className="px-2 py-2 rounded-md border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-card)] text-sm"
            aria-label="Filtrar por prioridad"
          >
            <option value="todas">Todas</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>

          {/* Control de ordenamiento */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortByDate}
            className="ml-2"
            aria-label="Cambiar orden de fecha"
            leftIcon={sortDir === "asc" ? <ChevronUp className="w-4 h-4" aria-hidden /> : <ChevronDown className="w-4 h-4" aria-hidden />}
          >
            Fecha
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {ordered.length === 0 ? (
          <div className="p-6">
            <div className="text-center text-[color:var(--color-text-primary)]">
              No se encontraron emails con ese criterio
            </div>
            <div className="text-center text-[color:var(--color-text-secondary)] mt-2">
              Intenta ajustar la búsqueda o filtros.
            </div>
          </div>
        ) : (
          ordered.map((email) => {
            const md = email.metadata;
            const tasks = md?.tasks ?? [];
            const isOpen = openId === email.id;
            const busy = pending || busyById[email.id] != null;
            const busyAccept = busyById[email.id] === "accept";
            const busyReject = busyById[email.id] === "reject";

            return (
              <article
                key={email.id}
                className="card-base p-0 overflow-hidden"
                role="region"
                aria-labelledby={`rev-${email.id}-title`}
              >
                {/* Encabezado compacto */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[color:var(--color-border-light)]">
                  <div className="min-w-0 space-y-1">
                    <div className="text-xs text-[color:var(--color-primary-600)] font-medium">
                      Recibido:  {formatReadableDate(email.receivedAt)}
                    </div>
                    <h3
                      id={`rev-${email.id}-title`}
                      className="text-[color:var(--color-text-primary)] font-semibold leading-tight truncate"
                      title={email.subject}
                    >
                      {email.subject}
                    </h3>
                    <div className="text-xs text-[color:var(--color-text-secondary)] truncate flex items-center gap-1">
                      <span className="font-medium">De:</span>
                      <span>{email.from}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/emails/${email.id}`} className="hide-mobile">
                      <Button variant="link" size="sm" aria-label="Ver detalle del email">
                        Ver email
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={isOpen ? "Contraer" : "Expandir"}
                      aria-expanded={isOpen}
                      aria-controls={`rev-panel-${email.id}`}
                      onClick={() => toggle(email.id)}
                      className="p-2"
                    >
                      {isOpen ? <ChevronUp className="w-5 h-5" aria-hidden /> : <ChevronDown className="w-5 h-5" aria-hidden />}
                    </Button>
                  </div>
                </div>

                {/* Panel expandible */}
                <div
                  id={`rev-panel-${email.id}`}
                  className={isOpen ? "block" : "hidden"}
                >
                  <div className="p-4 bg-[color:var(--color-bg-card)] transition-all">
                    {/* Cuerpo del email (resumen) */}
                    <div className="mb-3">
                      <div className="text-[color:var(--color-primary-600)] font-medium text-sm mb-1">Contenido</div>
                      <div className="border border-[color:var(--color-border-light)] rounded-md p-3 bg-[color:var(--color-bg-card)] text-sm text-[color:var(--color-text-primary)] whitespace-pre-wrap">
                        {truncateText(email.body, 900)}
                      </div>
                    </div>

                    {/* Análisis IA (metadata) */}
                    <div className="mb-3">
                      <div className="text-[color:var(--color-primary-600)] font-medium text-sm mb-2">Análisis IA</div>
                      <div className="border border-[color:var(--color-border-light)] rounded-md p-4 bg-[color:var(--color-bg-alt)] mb-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs font-semibold text-[color:var(--color-text-secondary)]">Categoría</div>
                            <div className="mt-1">
                              {md?.category ? (
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded text-xs ${md.category === "cliente"
                                    ? "badge-categoria-cliente"
                                    : md.category === "lead"
                                      ? "badge-categoria-lead"
                                      : md.category === "interno"
                                        ? "badge-categoria-interno"
                                        : "badge-categoria-spam"
                                    }`}
                                >
                                  {md.category}
                                </span>
                              ) : (
                                <span className="text-[color:var(--color-text-muted)]">—</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-[color:var(--color-text-secondary)]">Prioridad</div>
                            <div className="mt-1">
                              {md?.priority ? (
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded text-xs ${md.priority === "alta"
                                    ? "badge-prioridad-alta"
                                    : md.priority === "media"
                                      ? "badge-prioridad-media"
                                      : "badge-prioridad-baja"
                                    }`}
                                >
                                  {md.priority}
                                </span>
                              ) : (
                                <span className="text-[color:var(--color-text-muted)]">—</span>
                              )}
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <div className="text-xs font-semibold text-[color:var(--color-text-secondary)]">Resumen</div>
                            <div className="mt-1 text-[color:var(--color-text-primary)] text-md">
                              {md?.summary ?? <span className="text-[color:var(--color-text-muted)]">—</span>}
                            </div>
                          </div>
                          <div className="sm:col-span-2">
                            <div className="text-xs font-semibold text-[color:var(--color-text-secondary)]">Contacto</div>
                            <div className="mt-1 text-[color:var(--color-text-primary)] text-md">
                              {md?.contactName ?? <span className="text-[color:var(--color-text-muted)]">—</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Tareas IA */}
                    <div className="mb-4">
                      <div className="text-[color:var(--color-primary-600)] font-medium text-sm mb-2">Tareas ({tasks.length})</div>
                      {tasks.length === 0 ? (
                        <div className="text-sm text-[color:var(--color-text-secondary)]">
                          No se detectaron tareas.
                        </div>
                      ) : (
                        <ul className="grid gap-3 sm:grid-cols-2">
                          {tasks.map((t) => (
                            <li key={t.id} className="rounded-lg border bg-white p-4 flex flex-col gap-2 shadow-sm">
                              {/* Fila principal */}
                              <div className="flex justify-between items-center">
                                <div className="font-medium text-[color:var(--color-primary-700)] text-sm">{t.description}</div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${t.status === "todo"
                                  ? "bg-yellow-50 text-yellow-600"
                                  : t.status === "doing"
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-green-50 text-green-700"
                                  }`}>
                                  {t.status === "todo" ? "Por hacer" : t.status === "doing" ? "En progreso" : "Completado"}
                                </span>
                              </div>

                              {/* Fila secundaria: detalles distribuidos en columnas */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs mt-1">

                                <div>
                                  <span className="font-semibold">Tags:</span><br />
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {t.tags && t.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="bg-gray-100 text-gray-600 rounded px-2 py-0.5 text-[11px]"
                                      >#{tag}</span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <span className="font-semibold">Participantes:</span><br />
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {t.participants && t.participants.map((p) => (
                                      <span
                                        key={p}
                                        className="bg-blue-50 text-blue-700 rounded px-2 py-0.5 text-[10px] font-medium"
                                      >{p}</span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="flex text-xs mt-1">

                                <span className="font-semibold">Vence: {t.dueDate ? formatReadableDate(t.dueDate) : "—"}</span>

                              </div>
                            </li>

                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => onAccept(email.id)}
                        loading={busyAccept}
                        disabled={busy}
                        aria-label="Aceptar resultados de IA"
                      >
                        Aceptar
                      </Button>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => onReject(email.id)}
                        loading={busyReject}
                        disabled={busy}
                        aria-label="Rechazar resultados de IA"
                      >
                        Rechazar
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}