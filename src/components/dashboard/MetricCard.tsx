"use client";

import type { ReactNode } from "react";

type MetricCardProps = {
  label: string;
  value: number | string;
  description?: string;
  Icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  "aria-label"?: string;
};

/**
 * MetricCard: tarjeta de métricas (HU-UI-005)
 * Usa utilidades definidas en globals.css:
 * - .metric-card, .metric-card-icon, .metric-card-label, .metric-card-value, .metric-card-description
 */
export default function MetricCard({
  label,
  value,
  description,
  Icon,
  onClick,
  "aria-label": ariaLabel,
}: MetricCardProps) {
  const Content = (
    <div className="metric-card card-clickable">
      {Icon ? <Icon className="metric-card-icon" aria-hidden /> : null}
      <div className="metric-card-label">{label}</div>
      <div className="metric-card-value">{value}</div>
      {description ? (
        <div className="metric-card-description">{description}</div>
      ) : null}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left"
        aria-label={ariaLabel ?? label}
      >
        {Content}
      </button>
    );
  }

  return Content;
}
