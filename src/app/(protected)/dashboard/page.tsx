"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Mail, Clock, CheckSquare, BarChart2, ArrowRight, RefreshCw } from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import { mockEmails, getRecentEmails } from "@/lib/mock-data/emails";

/**
 * HU-UI-005: Dashboard Principal
 * - 4 Metric Cards (desde mock data)
 * - Accesos rápidos (Emails / Kanban / Importar)
 * - Lista de Emails recientes (5)
 * - Botón "Refrescar" simulado
 * Estilos: usar tokens/clases definidas en globals.css
 */

function formatRelative(iso: string): string {
  const now = new Date().getTime();
  const ts = new Date(iso).getTime();
  const diff = Math.max(0, now - ts);
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return "Justo ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Hace ${days} d`;
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString("es-CO", { month: "short" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function DashboardPage() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const metrics = useMemo(() => {
    const totalEmails = mockEmails.length;
    const unprocessedEmails = mockEmails.filter((e) => !e.processed).length;
    const pendingTasks = mockEmails.filter((e) => e.hasTask && e.taskStatus !== "done").length;
    const completedTasks = mockEmails.filter((e) => e.hasTask && e.taskStatus === "done").length;
    return { totalEmails, unprocessedEmails, pendingTasks, completedTasks };
  }, []);

  const recent = useMemo(() => getRecentEmails(5), []);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // Simular toast con alert (Semana 1)
      alert("Actualizado");
    }, 800);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 ">
        <div className="flex items-baseline gap-3">
          <h1>Bienvenido, Usuario</h1>
          <span className="text-sm text-[color:var(--color-text-muted)]">
            {new Date().toLocaleString("es-CO", {
              weekday: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-2 px-3 py-2 rounded-md border border-[color:var(--color-border-light)] hover:bg-[color:var(--color-bg-hover)] transition-colors focus-ring"
          aria-label="Refrescar métricas"
        >
          {!refreshing ? (
            <>
              <RefreshCw className="w-4 h-4" aria-hidden />
              <span>Refrescar</span>
            </>
          ) : (
            <span className="flex items-center gap-2">
              <span className="spinner" aria-hidden />
              Actualizando...
            </span>
          )}
        </button>
      </div>

      {/* Grid métricas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total de Emails"
          value={metrics.totalEmails}
          description="Todos los emails importados"
          Icon={Mail}
          onClick={() => router.push("/emails")}
          aria-label="Ir a emails"
        />
        <MetricCard
          label="Emails Sin Procesar"
          value={metrics.unprocessedEmails}
          description="Pendientes de IA"
          Icon={Clock}
          onClick={() => router.push("/emails")}
          aria-label="Ver emails sin procesar"
        />
        <MetricCard
          label="Tareas Pendientes"
          value={metrics.pendingTasks}
          description="Por hacer / En progreso"
          Icon={BarChart2}
          onClick={() => router.push("/kanban")}
          aria-label="Ir a tablero Kanban"
        />
        <MetricCard
          label="Tareas Completadas"
          value={metrics.completedTasks}
          description="Cerradas"
          Icon={CheckSquare}
          onClick={() => router.push("/kanban")}
          aria-label="Ver tareas completadas"
        />
      </section>

      {/* Accesos rápidos */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/emails"
          className="card-clickable p-6 flex items-center justify-between"
          aria-label="Ver todos los emails"
        >
          <div>
            <div className="text-sm text-[color:var(--color-text-muted)] mb-1 uppercase tracking-wide">
              Acceso rápido
            </div>
            <div className="text-lg font-semibold">Ver Todos los Emails</div>
            <div className="text-sm text-[color:var(--color-text-muted)] mt-1">
              Tabla interactiva con búsqueda y filtros
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[color:var(--color-primary-500)]" aria-hidden />
        </Link>

        <Link
          href="/kanban"
          className="card-clickable p-6 flex items-center justify-between"
          aria-label="Ir al Kanban"
        >
          <div>
            <div className="text-sm text-[color:var(--color-text-muted)] mb-1 uppercase tracking-wide">
              Acceso rápido
            </div>
            <div className="text-lg font-semibold">Ir al Kanban</div>
            <div className="text-sm text-[color:var(--color-text-muted)] mt-1">
              Tareas por estado (visual)
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[color:var(--color-primary-500)]" aria-hidden />
        </Link>

        <button
          type="button"
          onClick={() => alert("Funcionalidad disponible en Semana 2")}
          className="card-clickable p-6 flex items-center justify-between text-left"
          aria-label="Importar Emails"
        >
          <div>
            <div className="text-sm text-[color:var(--color-text-muted)] mb-1 uppercase tracking-wide">
              Utilidad
            </div>
            <div className="text-lg font-semibold">Importar Emails</div>
            <div className="text-sm text-[color:var(--color-text-muted)] mt-1">
              Cargar JSON (simulado)
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[color:var(--color-primary-500)]" aria-hidden />
        </button>
      </section>

      {/* Emails recientes */}
      <section className="card-base p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Emails Recientes</h3>
          <Link
            href="/emails"
            className="text-sm text-[color:var(--color-text-link)] hover:text-[color:var(--color-text-link-hover)]"
          >
            Ver todos
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-title">Sin emails recientes</div>
            <div className="empty-state-description">
              Aún no hay datos disponibles. Importa un archivo JSON para comenzar.
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-[color:var(--color-border-light)]">
            {recent.map((e) => (
              <li key={e.id} className="py-3">
                <Link
                  href={`/emails/${e.id}`}
                  className="flex items-center justify-between gap-4 group"
                  aria-label={`Abrir ${e.subject}`}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[color:var(--color-text-primary)] truncate">
                      {e.subject}
                    </div>
                    <div className="text-xs text-[color:var(--color-text-muted)] truncate">
                      {e.from}
                    </div>
                  </div>
                  <div className="text-xs text-[color:var(--color-text-muted)] whitespace-nowrap">
                    {formatRelative(e.receivedAt)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}