"use client";

import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
};

/**
 * EmptyState: componente compartido para estados vacíos
 * Usa estilos definidos en globals.css:
 * - .empty-state, .empty-state-icon, .empty-state-title, .empty-state-description
 */
export default function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Icon className="empty-state-icon" aria-hidden />
      <div className="empty-state-title">{title}</div>
      {description ? (
        <div className="empty-state-description">{description}</div>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 rounded-md border border-[color:var(--color-border-light)] hover:bg-[color:var(--color-bg-hover)] transition-colors focus-ring"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}