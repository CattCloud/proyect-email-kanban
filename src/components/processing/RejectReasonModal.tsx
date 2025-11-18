"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const REJECTION_OPTIONS = [
  "Categoría incorrecta",
  "Prioridad mal asignada",
  "Tareas mal extraídas",
  "Resumen poco útil",
  "Otro",
] as const;

type RejectionOption = (typeof REJECTION_OPTIONS)[number];

interface RejectReasonModalProps {
  open: boolean;
  emailSubject?: string;
  onClose: () => void;
  /**
   * Recibe el motivo final ya resuelto:
   *  - Si se seleccionan solo opciones predefinidas: unión de los textos, ej.
   *      "Categoría incorrecta | Prioridad mal asignada"
   *  - Si se selecciona "Otro": el texto libre reemplaza "Otro" en la unión, ej.
   *      "Tareas mal extraídas | El contacto es interno, no cliente"
   */
  onConfirm: (reason: string) => Promise<void> | void;
}

/**
 * Modal reutilizable para capturar el motivo de rechazo de resultados IA.
 *
 * Diseño alineado al sistema:
 *  - Usa overlay + card-base como ImportEmailsModal
 *  - Usa Button de ui/button con variantes primary/ghost
 *  - Usa variables de color definidas en globals.css
 *
 * Comportamiento según FEATURE_RECHAZO_METADATAEMAIL:
 *  - Selección múltiple de motivos (checkboxes).
 *  - Si se incluye "Otro", en la cadena final NO se guarda la palabra Otro,
 *    sino el contenido del campo de texto.
 */
export function RejectReasonModal(props: RejectReasonModalProps) {
  const { open, emailSubject, onClose, onConfirm } = props;

  const [selectedOptions, setSelectedOptions] = useState<RejectionOption[]>([]);
  const [otherText, setOtherText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const modalTitleId = "reject-reason-modal-title";

  const resetState = useCallback(() => {
    setSelectedOptions([]);
    setOtherText("");
    setError(null);
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    if (submitting) return;
    onClose();
    // Pequeño retraso para permitir animación de salida si se añade
    setTimeout(resetState, 150);
  }, [onClose, resetState, submitting]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleClose]);

  if (!open) return null;

  const showOtherTextarea = selectedOptions.includes("Otro");

  function toggleOption(option: RejectionOption) {
    setError(null);
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((o) => o !== option)
        : [...prev, option]
    );
  }

  async function handleConfirm() {
    setError(null);

    if (selectedOptions.length === 0) {
      setError("Debes seleccionar al menos un motivo de la lista.");
      return;
    }

    const includesOther = selectedOptions.includes("Otro");
    let trimmedOther: string | null = null;

    if (includesOther) {
      trimmedOther = otherText.trim();
      if (trimmedOther.length < 10) {
        setError(
          "Debes escribir al menos 10 caracteres explicando el motivo del rechazo."
        );
        return;
      }
    }

    // Construir motivo final:
    // - Para cada opción distinta de "Otro" se usa el texto literal.
    // - Para "Otro" se usa el texto libre (NO la palabra Otro).
    const parts: string[] = [];

    for (const opt of selectedOptions) {
      if (opt === "Otro") {
        if (trimmedOther) {
          parts.push(trimmedOther);
        }
      } else {
        parts.push(opt);
      }
    }

    const finalReason = parts.join(" | ");

    if (!finalReason) {
      setError("El motivo de rechazo no puede estar vacío.");
      return;
    }

    try {
      setSubmitting(true);
      await onConfirm(finalReason);
      handleClose();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error al confirmar rechazo:", err);
      setError(
        "Ocurrió un error al registrar el rechazo. Intenta nuevamente en unos segundos."
      );
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      style={{ zIndex: 1070 }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--color-bg-overlay)" }}
        aria-hidden="true"
        onClick={handleClose}
      />

      {/* Contenedor del modal */}
      <div className="relative card-base w-[min(520px,92vw)] max-h-[90vh] flex flex-col animate-slide-up">
        <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2
                  id={modalTitleId}
                  className="text-[length:var(--font-size-xl)] font-semibold text-[color:var(--color-text-primary)]"
                >
                  Motivo del rechazo
                </h2>
                <p className="mt-1 text-[length:var(--font-size-sm)] text-[color:var(--color-text-muted)]">
                  Indica por qué el análisis de IA no es correcto. Puedes
                  seleccionar uno o varios motivos. Este feedback se usará en el
                  próximo reprocesamiento para evitar repetir los mismos errores.
                </p>
                {emailSubject && (
                  <p className="mt-2 text-[length:var(--font-size-xs)] text-[color:var(--color-text-secondary)]">
                    <span className="font-semibold">Email:</span> {emailSubject}
                  </p>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                aria-label="Cerrar modal de motivo de rechazo"
                className="ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Opciones de motivo (selección múltiple) */}
            <div className="space-y-4 mt-2">
              <fieldset>
                <legend className="text-[length:var(--font-size-sm)] font-medium text-[color:var(--color-text-primary)] mb-2">
                  Selecciona uno o varios motivos
                </legend>
                <div className="space-y-2">
                  {REJECTION_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className="flex items-start gap-2 rounded-md border border-[color:var(--color-border-light)] px-3 py-2 cursor-pointer hover:bg-[color:var(--color-bg-hover)]"
                    >
                      <input
                        type="checkbox"
                        className="mt-1"
                        name="rejectionReason"
                        value={option}
                        checked={selectedOptions.includes(option)}
                        onChange={() => toggleOption(option)}
                      />
                      <span className="text-[length:var(--font-size-sm)] text-[color:var(--color-text-primary)]">
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Texto libre solo si se selecciona "Otro" */}
              {showOtherTextarea && (
                <div className="space-y-2">
                  <label
                    htmlFor="reject-other-reason"
                    className="text-[length:var(--font-size-sm)] font-medium text-[color:var(--color-text-primary)]"
                  >
                    Describe el motivo del rechazo
                  </label>
                  <textarea
                    id="reject-other-reason"
                    className="w-full min-h-[96px] rounded-md border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-card)] px-3 py-2 text-[length:var(--font-size-sm)] text-[color:var(--color-text-primary)] focus-ring resize-y"
                    placeholder="Ejemplo: El contacto es interno, no cliente..."
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                  />
                  <p className="text-[length:var(--font-size-xs)] text-[color:var(--color-text-muted)]">
                    Mínimo 10 caracteres. 
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-md border border-[color:var(--color-border-error)] bg-[color:var(--color-error-bg)] px-3 py-2 text-[length:var(--font-size-sm)] text-[color:var(--color-error-text)]">
                  {error}
                </div>
              )}
            </div>

            {/* Footer acciones */}
            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                size="md"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => void handleConfirm()}
                loading={submitting}
                aria-disabled={submitting}
              >
                Confirmar rechazo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}