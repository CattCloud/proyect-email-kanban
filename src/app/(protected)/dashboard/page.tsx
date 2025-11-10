"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Mail, Clock, CheckSquare, BarChart2, ArrowRight, RefreshCw } from "lucide-react";
import MetricCard from "@/components/dashboard/MetricCard";
import { getEmails, getEmailsWithTasks, getRecentEmails } from "@/actions/emails";
import Button from "@/components/ui/button";
import { DashboardMetrics } from "@/types";
import { EmailWithMetadata } from "@/types";
import ImportEmailsModal from "@/components/emails/ImportEmailsModal";

/**
 * HU-UI-005: Dashboard Principal
 * - 4 Metric Cards (desde Server Actions)
 * - Accesos rápidos (Emails / Kanban / Importar)
 * - Lista de Emails recientes (5)
 * - Botón "Refrescar" con Server Actions
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para las métricas
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEmails: 0,
    unprocessedEmails: 0,
    pendingTasks: 0,
    completedTasks: 0
  });

  const [recent, setRecent] = useState<EmailWithMetadata[]>([]);

  // useEffect para cargar datos reales
  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true);
        setError(null);

        // Obtener todos los emails
        const allEmailsResult = await getEmails();
        if (allEmailsResult.success && allEmailsResult.data) {
          const total = allEmailsResult.data.length;
          const unprocessed = allEmailsResult.data.filter(e => !e.processed).length;

          setMetrics(prev => ({
            ...prev,
            totalEmails: total,
            unprocessedEmails: unprocessed
          }));
        }

        // Obtener emails con tareas
        const tasksResult = await getEmailsWithTasks();
        if (tasksResult.success && tasksResult.data) {
          const pending = tasksResult.data.filter(e => e.metadata?.taskStatus === "todo" || e.metadata?.taskStatus === "doing").length;
          const completed = tasksResult.data.filter(e => e.metadata?.taskStatus === "done").length;

          setMetrics(prev => ({
            ...prev,
            pendingTasks: pending,
            completedTasks: completed
          }));
        }

        // Obtener emails recientes (últimos 5)
        const recentResult = await getRecentEmails(5);
        if (recentResult.success && recentResult.data) {
          setRecent(recentResult.data);
        }

      } catch (err) {
        setError("Error al cargar las métricas");
        console.error("Error loading metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    // Ejecutar la carga después de que el componente se monte
    loadMetrics();
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      // Recargar métricas
      window.location.reload();
    }, 800);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[color:var(--color-primary-500)]"></div>
        <span className="ml-2 text-[color:var(--color-text-secondary)]">Cargando métricas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[color:var(--color-primary-500)] text-white rounded hover:bg-[color:var(--color-primary-600)]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleRefresh}
            aria-label="Refrescar métricas"
            variant="outline"
            size="md"
            loading={refreshing}
            leftIcon={!refreshing ? <RefreshCw className="w-4 h-4" aria-hidden /> : undefined}
          >
            {refreshing ? "Actualizando..." : "Refrescar"}
          </Button>
          <ImportEmailsModal onImported={() => window.location.reload()} />
        </div>
      </div>

      {/* Grid métricas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total de Emails"
          value={metrics.totalEmails}
          description="Todos los emails en el sistema"
          Icon={Mail}
          onClick={() => router.push("/emails")}
          aria-label="Ver todos los emails"
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
      <section className="grid grid-cols-1 sm:grid-cols-2  gap-4">
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
          <div className="text-center py-8">
            <div className="text-lg font-medium text-[color:var(--color-text-primary)] mb-2">Sin emails recientes</div>
            <div className="text-sm text-[color:var(--color-text-secondary)]">
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
                    {formatRelative(e.receivedAt.toISOString())}
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