"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import type { TaskStatus } from "@/types";
import Button from "@/components/ui/button";
import { ClipboardList, Clock3, CheckCircle2 } from "lucide-react";

interface KanbanEmptyPlaceholderProps {
  status: TaskStatus;
}

const STATUS_CONFIG: Record<
  TaskStatus,
  {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  todo: {
    title: "¡Aún no hay tareas!",
    description: "Tus correos procesados aparecerán aquí.",
    icon: ClipboardList,
  },
  doing: {
    title: "Nada en progreso aún",
    description: "Cuando comiences una tarea, aparecerá aquí.",
    icon: Clock3,
  },
  done: {
    title: "Sin tareas completadas",
    description: "¡Termina tus primeras tareas para verlas aquí!",
    icon: CheckCircle2,
  },
};

export default function KanbanEmptyPlaceholder({
  status,
}: KanbanEmptyPlaceholderProps) {
  const router = useRouter();
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const showCTA = status === "todo";

  const handleProcessEmails = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    router.push("/emails");
  };

  return (
    <div
      className="kanban-card border-dashed border-2 border-[color:var(--color-border-default)] bg-transparent/60 hover:bg-[color:var(--color-bg-card)]/90 hover:opacity-[var(--opacity-hover)] transition-all duration-200 ease-out cursor-default flex flex-col items-center justify-center text-center gap-2 animate-fade-in"
      aria-label={config.title}
    >
      <Icon
        className="w-6 h-6 text-[color:var(--color-text-muted)] mb-2"
        aria-hidden
      />
      <div className="font-medium text-[color:var(--color-text-primary)]">
        {config.title}
      </div>
      <p className="text-sm text-[color:var(--color-text-secondary)] max-w-[220px]">
        {config.description}
      </p>
      {showCTA && (
        <div className="mt-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleProcessEmails}
          >
            Procesar emails
          </Button>
        </div>
      )}
    </div>
  );
}