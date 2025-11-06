"use client";

import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import Button from "@/components/ui/button";

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
        <Button type="button" onClick={onAction} variant="outline" size="md">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}