"use client";

import { useState, useTransition } from "react";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  confirmProcessingResults,
  rejectProcessingResults,
  type GenericActionResult,
} from "@/actions/ai-processing";

interface ReviewTask {
  id: string;
  description: string;
  dueDate: string | null;
  tags: string[];
  participants: string[];
  status: string; // 'todo' | 'doing' | 'done'
}

interface ReviewMetadata {
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

function formatDateHuman(d: string | Date): string {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";
  return date.toLocaleString();
}

function truncateText(text: string, length = 240): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}…`;
}

/**
 * HITO 4 - EmailReviewCard
 * - Componente cliente para revisión y confirmación/rechazo de resultados IA
 * - Próximos pasos: edición inline (dropdowns, inputs, task editor) antes de confirmar
 */
export default function EmailReviewCard({ email }: { email: ReviewEmailItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<"accept" | "reject" | null>(null);
  const md = email.metadata;
  const tasks = md?.tasks ?? [];

  async function onAccept() {
    setBusy("accept");
    try {
      const res = (await confirmProcessingResults(email.id)) as GenericActionResult;
      if (!res.success) {
        alert(res.error ?? "Error al confirmar resultados IA");
        return;
      }
      startTransition(() => router.refresh());
    } catch (e) {
      // fallback UX
      alert("Fallo al confirmar resultados");
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setBusy(null);
    }
  }

  async function onReject() {
    setBusy("reject");
    try {
      const res = (await rejectProcessingResults(email.id)) as GenericActionResult;
      if (!res.success) {
        alert(res.error ?? "Error al rechazar resultados IA");
        return;
      }
      startTransition(() => router.refresh());
    } catch (e) {
      alert("Fallo al rechazar resultados");
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setBusy(null);
    }
  }

  const disabled = pending || busy !== null;

  return (
    <article className="card-base p-4" role="region" aria-labelledby={`email-${email.id}-title`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Columna izquierda: Email original */}
        <div>
          <div className="mb-3">
            <div className="text-xs text-[color:var(--color-text-muted)]">
              Recibido: {formatDateHuman(email.receivedAt)}
            </div>
            <h2
              id={`email-${email.id}-title`}
              className="text-[color:var(--color-text-primary)] font-medium mt-1"
            >
              {email.subject}
            </h2>
            <div className="text-sm text-[color:var(--color-text-secondary)]">{email.from}</div>
          </div>
          <div className="border border-[color:var(--color-border-light)] rounded-md p-3 bg-[color:var(--color-bg-card)]">
            <div className="text-sm text-[color:var(--color-text-primary)] whitespace-pre-wrap">
              {truncateText(email.body, 800)}
            </div>
          </div>
        </div>

        {/* Columna derecha: Análisis IA */}
        <div>
          <div className="mb-3">
            <h3 className="text-[color:var(--color-text-primary)] font-semibold">Análisis de IA</h3>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-[color:var(--color-text-secondary)]">Categoría</div>
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
                <div className="text-[color:var(--color-text-secondary)]">Prioridad</div>
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
              <div className="col-span-2">
                <div className="text-[color:var(--color-text-secondary)]">Resumen</div>
                <div className="mt-1 text-[color:var(--color-text-primary)]">
                  {md?.summary ?? <span className="text-[color:var(--color-text-muted)]">—</span>}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-[color:var(--color-text-secondary)]">Contacto</div>
                <div className="mt-1 text-[color:var(--color-text-primary)]">
                  {md?.contactName ?? <span className="text-[color:var(--color-text-muted)]">—</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-[color:var(--color-text-primary)] font-semibold mb-2">
              Tareas ({tasks.length})
            </h4>
            {tasks.length === 0 ? (
              <div className="text-sm text-[color:var(--color-text-secondary)]">No se detectaron tareas.</div>
            ) : (
              <ul className="space-y-2">
                {tasks.map((t) => (
                  <li key={t.id} className="border border-[color:var(--color-border-light)] rounded-md p-3">
                    <div className="text-sm text-[color:var(--color-text-primary)]">{t.description}</div>
                    <div className="mt-1 text-xs text-[color:var(--color-text-secondary)] flex flex-wrap gap-2">
                      <span>Estado: {t.status}</span>
                      <span>Vence: {t.dueDate ? formatDateHuman(t.dueDate) : "—"}</span>
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

          {/* Controles Aceptar/Rechazar */}
          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={onAccept}
              loading={busy === "accept"}
              disabled={disabled}
              aria-label="Aceptar resultados de IA"
            >
              Aceptar
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={onReject}
              loading={busy === "reject"}
              disabled={disabled}
              aria-label="Rechazar resultados de IA"
            >
              Descartar
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}