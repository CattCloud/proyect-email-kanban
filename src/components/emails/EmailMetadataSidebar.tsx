"use client";

import { BadgeCheck, AlertTriangle, ClipboardList, ChevronDown, ChevronUp, Tag, Activity, Check } from "lucide-react";
import { EmailWithMetadata } from "@/types";
import { useState } from "react";
import Button from "@/components/ui/button";

/**
 * EmailMetadataSidebar (HU-UI-003)
 * - Muestra:
 *   • Estado de procesamiento (Procesado / Aún sin procesar)
 *   • Categoría (Cliente/Lead/Interno/Spam) con badge de color
 *   • Prioridad (Alta/Media/Baja) con badge de color
 *   • Tarea Detectada (si hasTask)
 *   • Estado de Tarea (dropdown simulado, sin persistencia)
 * - Si email.processedAt === null: muestra alerta con acción deshabilitada
 *
 * Estilos desde src/app/globals.css:
 *  - badge-procesado, badge-sin-procesar
 *  - badge-categoria-*, badge-prioridad-*
 *  - card-base, focus-ring y tokens de color
 */

type Props = {
  email: EmailWithMetadata;
};

export default function EmailMetadataSidebar({ email }: Props) {
  // Estado simulado para dropdown (no persiste por requerimientos de Semana 1)
  const [openTaskState, setOpenTaskState] = useState(false);

  const categoria = email.metadata?.category;
  const prioridad = email.metadata?.priority;
  const hasTask = email.metadata?.hasTask || false;
  const taskDescription = email.metadata?.taskDescription;
  const taskStatus = email.metadata?.taskStatus;

  const categoriaClass =
    categoria === "cliente"
      ? "badge-categoria-cliente"
      : categoria === "lead"
        ? "badge-categoria-lead"
        : categoria === "interno"
          ? "badge-categoria-interno"
          : categoria === "spam"
            ? "badge-categoria-spam"
            : "";

  const prioridadClass =
    prioridad === "alta"
      ? "badge-prioridad-alta"
      : prioridad === "media"
        ? "badge-prioridad-media"
        : prioridad === "baja"
          ? "badge-prioridad-baja"
          : "";

  return (
    <aside
      className="card-base p-4 space-y-4"
      aria-label="Metadata de IA del email"
    >
      {/* Estado de procesamiento */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)] flex items-center gap-2">
          <Activity className="w-4 h-4" aria-hidden />
          Estado de procesamiento
        </h3>
        <div className="flex gap-1">
          {email.processedAt !== null ? (
            <span className="badge-procesado inline-flex items-center gap-1 px-2 py-1 rounded text-xs">
              <BadgeCheck className="w-3 h-3" aria-hidden />
              Procesado por IA
            </span>
          ) : (
            <div className="space-y-2">
              <span className="badge-sin-procesar inline-flex items-center gap-1 px-2 py-1 rounded text-xs">
                <AlertTriangle className="w-3 h-3" aria-hidden />
                Aún sin procesar
              </span>
              {
                /*
                              <Button
                type="button"
                variant="outline"
                size="md"
                disabled
                className="w-full mt-2"
              >
                Procesar ahora (Semana 2)
              </Button>
                */

              }

            </div>
          )}
          {email.approvedAt !== null && (
            <span className="badge-aprobado inline-flex items-center gap-1 px-2 py-1 rounded text-xs">
              <Check className="w-3 h-2" aria-hidden />
              Aprobado
            </span>
          )} 
        </div>
      </section>

      {/* Categoría */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)] flex items-center gap-2">
          <Tag className="w-4 h-4" aria-hidden />
          Categoría
        </h3>
        <div>
          {categoria ? (
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${categoriaClass}`}>
              {categoria}
            </span>
          ) : (
            <span className="text-xs text-[color:var(--color-text-muted)]">Sin categoría</span>
          )}
        </div>
      </section>

      {/* Prioridad */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
          Prioridad
        </h3>
        <div>
          {prioridad ? (
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${prioridadClass}`}>
              {prioridad}
            </span>
          ) : (
            <span className="text-xs text-[color:var(--color-text-muted)]">Sin prioridad</span>
          )}
        </div>
      </section>

      {/* Tarea detectada */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-[color:var(--color-text-primary)] flex items-center gap-2">
          <ClipboardList className="w-4 h-4" aria-hidden />
          Tarea Detectada
        </h3>

        {!hasTask ? (
          <div className="text-xs text-[color:var(--color-text-muted)]">
            No se detectó ninguna tarea en este email.
          </div>
        ) : (
          <>
            <div className="text-sm text-[color:var(--color-text-primary)]">
              {taskDescription}
            </div>

            {/* Estado de tarea: dropdown simulado (sin persistencia) */}
            <div className="relative">
              <Button
                type="button"
                onClick={() => setOpenTaskState((v) => !v)}
                variant="outline"
                size="md"
                className="w-full justify-between"
                aria-haspopup="listbox"
                aria-expanded={openTaskState}
                aria-label="Estado de la tarea"
                rightIcon={
                  openTaskState ? (
                    <ChevronUp className="w-4 h-4" aria-hidden />
                  ) : (
                    <ChevronDown className="w-4 h-4" aria-hidden />
                  )
                }
              >
                <span>
                  Estado:{" "}
                  <strong>
                    {taskStatus === "todo"
                      ? "Por hacer"
                      : taskStatus === "doing"
                        ? "En progreso"
                        : taskStatus === "done"
                          ? "Completado"
                          : "—"}
                  </strong>
                </span>
              </Button>

              <ul
                className={`absolute left-0 right-0 mt-1 rounded-md border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-card)] shadow-xl text-sm ${openTaskState ? "block" : "hidden"
                  }`}
                role="listbox"
                aria-label="Seleccionar estado (simulado)"
              >
                <li
                  className="px-3 py-2 hover:bg-[color:var(--color-bg-hover)] cursor-default"
                  role="option"
                  aria-selected={taskStatus === "todo"}
                  onClick={() => setOpenTaskState(false)}
                  title="Simulado: no persiste valor"
                >
                  Por hacer
                </li>
                <li
                  className="px-3 py-2 hover:bg-[color:var(--color-bg-hover)] cursor-default"
                  role="option"
                  aria-selected={taskStatus === "doing"}
                  onClick={() => setOpenTaskState(false)}
                  title="Simulado: no persiste valor"
                >
                  En progreso
                </li>
                <li
                  className="px-3 py-2 hover:bg-[color:var(--color-bg-hover)] cursor-default"
                  role="option"
                  aria-selected={taskStatus === "done"}
                  onClick={() => setOpenTaskState(false)}
                  title="Simulado: no persiste valor"
                >
                  Completado
                </li>
              </ul>
            </div>
          </>
        )}
      </section>
    </aside>
  );
}