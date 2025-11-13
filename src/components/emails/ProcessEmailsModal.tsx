"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/button";
import type { EmailWithMetadata } from "@/types";

type ResultItem = { id: string; subject: string; from: string; status: "success" | "error"; error?: string };

type ProcessEmailsModalProps = {
  open: boolean;
  emails: EmailWithMetadata[]; // Lista de emails seleccionados (máx 10)
  processing?: boolean;        // Estado de procesamiento en curso (controlado por el padre)
  progress?: number;           // 0-100 progreso visual
  resultSummary?: { items: ResultItem[] } | null; // Resumen de resultados por email
  onClose: () => void;
  onConfirm: () => Promise<void> | void; // Acción que dispara el procesamiento (padre maneja el resultado)
};

/**
 * Modal de Confirmación de Procesamiento con IA (HITO 3)
 * - Preview de emails seleccionados (subject, from)
 * - Estimación aproximada de tokens/costo
 * - Botones Confirmar/Cancelar con estado de carga
 * - Accesibilidad: role="dialog", aria-modal, aria-labelledby/aria-describedby
 *
 * Notas:
 * - El componente padre (EmailTable) cierra el modal tras finalizar onConfirm()
 * - Se deshabilita el cierre mientras está confirmando para evitar estados inconsistentes
 */
export default function ProcessEmailsModal({
  open,
  emails,
  processing = false,
  progress = 0,
  resultSummary = null,
  onClose,
  onConfirm,
}: ProcessEmailsModalProps) {
  const [confirming, setConfirming] = useState(false);


  // Estimación grosera de tokens (aprox chars/4) y costo (prompt-only, referencia)
  // Precios de referencia: gpt-4-turbo prompt $0.01 / 1K tokens
  const { totalChars, approxTokens, approxCostUSD } = useMemo(() => {
    const chars = emails.reduce((acc, e) => acc + (e.subject?.length ?? 0) + (e.body?.length ?? 0), 0);
    const tokens = Math.ceil(chars / 4);
    const cost = (tokens / 1000) * 0.01; // prompt-only referencia
    return {
      totalChars: chars,
      approxTokens: tokens,
      approxCostUSD: Number.isFinite(cost) ? Number(cost.toFixed(4)) : 0,
    };
  }, [emails]);

  // Evitar scroll del body mientras el modal está abierto
  // (simple y efectivo sin dependencia externa)
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  // Si el padre cambia 'processing' a false, liberamos el estado de 'confirming'
  useEffect(() => {
    if (!processing) {
      setConfirming(false);
    }
  }, [processing]);

  if (!open) return null;

  async function handleConfirm() {
    setConfirming(true);
    try {
      await onConfirm();
    } catch (err) {
      // El padre maneja el error operativo; aquí solo permitimos reintentar
      console.error("Error en confirmación de procesamiento IA:", err);
    } finally {
      // Asegura liberar el estado de carga tanto en éxito como en error
      setConfirming(false);
    }
  }

  const canClose = !confirming;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="process-emails-title"
      aria-describedby="process-emails-desc"
      onClick={() => {
        if (canClose) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Modal card */}
      <div
        className="relative card-base w-[95%] max-w-[720px] max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[color:var(--color-border-light)] flex items-center justify-between">
          <h2 id="process-emails-title" className="text-[color:var(--color-text-primary)] text-base font-semibold">
            Confirmar procesamiento con IA
          </h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Cerrar"
            onClick={() => canClose && onClose()}
            disabled={!canClose || processing}
          >
            ✕
          </Button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4" id="process-emails-desc">
          <p className="text-sm text-[color:var(--color-text-secondary)]">
            Se procesarán {emails.length} {emails.length === 1 ? "email" : "emails"} con IA. Revisa el listado y confirma para continuar.
          </p>
 
          {/* Estimación de costo/tokens 
                    
            <div className="p-3 rounded-md bg-[color:var(--color-bg-muted)] text-xs text-[color:var(--color-text-secondary)]">
            <div>
              Estimación aproximada de uso: <strong>{approxTokens.toLocaleString()} tokens</strong> (
              {totalChars.toLocaleString()} caracteres)
            </div>
            <div>
              Costo estimado (prompt gpt-4-turbo): <strong>${approxCostUSD.toFixed(4)} USD</strong>
            </div>
            <div className="mt-1">
              Nota: Cálculo de referencia (chars/4). El costo real depende del contenido y del modelo/fallback.
            </div>
          </div>     
          */}

 
          {/* Lista de emails seleccionados */}
          <div className="border border-[color:var(--color-border-light)] rounded-md overflow-hidden">
            <div className="px-3 py-2 bg-[color:var(--color-bg-muted)] text-[color:var(--color-text-secondary)] text-xs flex justify-between">
              <span>Seleccionados ({emails.length}/10 máx)</span>
              <span>Preview</span>
            </div>
            <ul className="divide-y divide-[color:var(--color-border-light)]">
              {emails.map((e) => (
                <li key={e.id} className="px-3 py-2">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm text-[color:var(--color-text-primary)] truncate">{e.subject}</div>
                      <div className="text-xs text-[color:var(--color-text-secondary)] truncate">{e.from}</div>
                    </div>
                    <div className="text-xs text-[color:var(--color-text-muted)] whitespace-nowrap">
                      {new Date(e.receivedAt).toLocaleString()}
                    </div>
                  </div>
                </li>
              ))}
              {emails.length === 0 && (
                <li className="px-3 py-4 text-center text-sm text-[color:var(--color-text-secondary)]">
                  No hay emails seleccionados
                </li>
              )}
            </ul>
          </div>

          {/* Progreso en tiempo real */}
          {processing && (
            <div className="mt-3">
              <div className="w-full h-2 bg-[color:var(--color-bg-muted)] rounded">
                <div
                  className="h-2 bg-[color:var(--color-primary-500)] rounded transition-all"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <div className="text-xs mt-1 text-[color:var(--color-text-secondary)]">
                Procesando... {Math.round(progress)}%
              </div>
            </div>
          )}

          {/* Resultados del procesamiento */}
          {!processing && resultSummary && resultSummary.items?.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium mb-1">Resultados</div>
              <ul className="space-y-1">
                {resultSummary.items.map((item) => (
                  <li key={item.id} className="text-sm">
                    <span
                      className={
                        item.status === "success"
                          ? "text-[color:var(--color-secondary-500)]"
                          : "text-[color:var(--color-danger-500)]"
                      }
                    >
                      {item.status === "success" ? "✓" : "✕"}
                    </span>{" "}
                    {item.subject} — {item.from}
                    {item.error ? `: ${item.error}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[color:var(--color-border-light)] flex items-center justify-end gap-2">
          {resultSummary && !processing ? (
            // Tras finalizar, muestra solo un botón primario claro para cerrar
            <Button
              variant="primary"
              size="md"
              onClick={() => onClose()}
              aria-label="Cerrar"
            >
              Cerrar
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="md"
                onClick={() => canClose && onClose()}
                disabled={!canClose || processing}
                aria-label="Cancelar"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirm}
                loading={confirming}
                disabled={confirming || emails.length === 0 || processing}
                aria-label="Confirmar procesamiento"
              >
                {confirming || processing ? "Procesando..." : "Confirmar"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}