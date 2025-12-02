"use client";

import { useState } from "react";
import type { ConfidenceSignals } from "@/types/ai";

export interface ConfidenceIndicatorProps {
  score: number; // 0-100
  reason: string;
  breakdown?: ConfidenceSignals;
  showDetails?: boolean;
}

/**
 * Indicador visual del Nivel de Confianza IA para un email.
 *
 * - Muestra porcentaje + etiqueta semántica (Excelente/Bueno/Aceptable/Dudoso/Bajo).
 * - Usa clases de estilo definidas en globals.css (no hardcodea colores).
 * - Opcionalmente permite ver un desglose de señales (breakdown).
 */
export function ConfidenceIndicator({
  score,
  reason,
  breakdown,
  showDetails = false,
}: ConfidenceIndicatorProps) {
  const [expanded, setExpanded] = useState(false);

  const clampedScore = Math.max(0, Math.min(100, score));

  const getColorClass = (): string => {
    if (clampedScore >= 90) return "confidence-excellent";
    if (clampedScore >= 75) return "confidence-good";
    if (clampedScore >= 60) return "confidence-acceptable";
    if (clampedScore >= 40) return "confidence-doubtful";
    return "confidence-low";
  };

  const getLabel = (): string => {
    if (clampedScore >= 90) return "Excelente";
    if (clampedScore >= 75) return "Bueno";
    if (clampedScore >= 60) return "Aceptable";
    if (clampedScore >= 40) return "Dudoso";
    return "Bajo";
  };

  return (
    <section
      className="confidence-indicator"
      aria-label="Indicador de nivel de confianza del análisis IA"
    >
      <div className={`confidence-badge ${getColorClass()}`}>
        <span className="confidence-score" aria-label={`Nivel de confianza ${clampedScore} por ciento`}>
          {clampedScore}%
        </span>
        <span className="confidence-label">{getLabel()}</span>
      </div>

      {showDetails && (
        <div className="confidence-details">
          <p className="confidence-reason">{reason}</p>

          {breakdown && (
            <div className="confidence-breakdown-wrapper">
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="confidence-toggle"
                aria-expanded={expanded}
                aria-label={
                  expanded
                    ? "Ocultar desglose del nivel de confianza"
                    : "Ver desglose del nivel de confianza"
                }
              >
                {expanded ? "Ocultar detalle" : "Ver detalle de confianza"}
              </button>

              {expanded && (
                <dl className="confidence-breakdown">
                  <div className="confidence-breakdown-row">
                    <dt>¿Las tareas están respaldadas por el contenido del email?</dt>
                    <dd>{Math.round(breakdown.taskValidityScore)}%</dd>
                  </div>
                  <div className="confidence-breakdown-row">
                    <dt>¿La prioridad asignada coincide con la urgencia del mensaje?</dt>
                    <dd>{Math.round(breakdown.priorityCoherenceScore)}%</dd>
                  </div>
                  <div className="confidence-breakdown-row">
                    <dt>¿El email es claro y tiene estructura bien definida?</dt>
                    <dd>{Math.round(breakdown.clarityScore)}%</dd>
                  </div>
                  <div className="confidence-breakdown-row">
                    <dt>¿Se extrajo toda la información necesaria (categoría, tareas, fechas)?</dt>
                    <dd>{Math.round(breakdown.completenessScore)}%</dd>
                  </div>
                  <div className="confidence-breakdown-row">
                    <dt>¿El análisis coincide con patrones de emails similares aprobados?</dt>
                    <dd>{Math.round(breakdown.patternMatchScore)}%</dd>
                  </div>
                  <div className="confidence-breakdown-row">
                    <dt>¿Las etiquetas utilizadas son apropiadas y del catálogo existente?</dt>
                    <dd>{Math.round(breakdown.tagsQualityScore)}%</dd>
                  </div>
                  <div className="confidence-breakdown-row">
                    <dt>¿Este email ha sido reprocesado múltiples veces tras rechazos?</dt>
                    <dd>{Math.round(breakdown.feedbackPenalty)}%</dd>
                  </div>
                </dl>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}