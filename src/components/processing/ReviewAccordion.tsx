"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
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

  const ordered = useMemo(() => {
    // Orden por receivedAt desc luego createdAt desc (consistente con server)
    return [...items].sort((a, b) => {
      const ra = new Date(a.receivedAt).getTime();
      const rb = new Date(b.receivedAt).getTime();
      if (rb !== ra) return rb - ra;
      const ca = new Date(a.createdAt).getTime();
      const cb = new Date(b.createdAt).getTime();
      return cb - ca;
    });
  }, [items]);

  function toggle(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
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
    <div className="space-y-3">
      {ordered.map((email) => {
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
              <div className="min-w-0">
                <div className="text-xs text-[color:var(--color-text-muted)]">
                  {formatDateUTC(email.receivedAt)}
                </div>
                <h2
                  id={`rev-${email.id}-title`}
                  className="text-[color:var(--color-text-primary)] font-medium truncate"
                  title={email.subject}
                >
                  {email.subject}
                </h2>
                <div className="text-xs text-[color:var(--color-text-secondary)] truncate">
                  {email.from}
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
              <div className="p-4 bg-[color:var(--color-bg-muted)]/40 transition-all">
                {/* Cuerpo del email (resumen) */}
                <div className="mb-3">
                  <div className="text-[color:var(--color-text-secondary)] text-sm mb-1">Contenido</div>
                  <div className="border border-[color:var(--color-border-light)] rounded-md p-3 bg-[color:var(--color-bg-card)] text-sm text-[color:var(--color-text-primary)] whitespace-pre-wrap">
                    {truncateText(email.body, 900)}
                  </div>
                </div>

                {/* Análisis IA (metadata) */}
                <div className="mb-3">
                  <div className="text-[color:var(--color-text-secondary)] text-sm mb-2">Análisis IA</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-[color:var(--color-text-secondary)]">Categoría</div>
                      <div className="mt-1">
                        {md?.category ? (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                              md.category === "cliente"
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
                      <div className="text-xs text-[color:var(--color-text-secondary)]">Prioridad</div>
                      <div className="mt-1">
                        {md?.priority ? (
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                              md.priority === "alta"
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
                      <div className="text-xs text-[color:var(--color-text-secondary)]">Resumen</div>
                      <div className="mt-1 text-[color:var(--color-text-primary)] text-sm">
                        {md?.summary ?? <span className="text-[color:var(--color-text-muted)]">—</span>}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-xs text-[color:var(--color-text-secondary)]">Contacto</div>
                      <div className="mt-1 text-[color:var(--color-text-primary)] text-sm">
                        {md?.contactName ?? <span className="text-[color:var(--color-text-muted)]">—</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tareas IA */}
                <div className="mb-4">
                  <div className="text-[color:var(--color-text-secondary)] text-sm mb-2">Tareas ({tasks.length})</div>
                  {tasks.length === 0 ? (
                    <div className="text-sm text-[color:var(--color-text-secondary)]">
                      No se detectaron tareas.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {tasks.map((t) => (
                        <li key={t.id} className="border border-[color:var(--color-border-light)] rounded-md p-3 bg-[color:var(--color-bg-card)]">
                          <div className="text-sm text-[color:var(--color-text-primary)]">{t.description}</div>
                          <div className="mt-1 text-xs text-[color:var(--color-text-secondary)] flex flex-wrap gap-2">
                            <span>Estado: {t.status}</span>
                            <span>Vence: {t.dueDate ? formatDateUTC(t.dueDate) : "—"}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {t.tags?.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-[color:var(--color-bg-muted)] text-[color:var(--color-text-secondary)]"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div className="mt-2">
                            <div className="text-[10px] text-[color:var(--color-text-muted)]">Participantes</div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {t.participants?.map((p) => (
                                <span
                                  key={p}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-[color:var(--color-primary-50)] text-[color:var(--color-primary-700)]"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
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
      })}
    </div>
  );
}