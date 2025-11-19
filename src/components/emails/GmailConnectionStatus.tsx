"use client";

import { useEffect, useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import Button from "@/components/ui/button";
import {
  getGmailConnectionStatusForCurrentUser,
  importGmailInboxForCurrentUser,
} from "@/actions/gmail";

interface GmailConnectionStatusProps {
  onImported?: () => void;
}

type ServerStatus = {
  connected: boolean;
  lastSyncAt: Date | null;
  error: string | null;
};

interface UiStatus extends ServerStatus {
  loading: boolean;
}

type ImportStatus = "idle" | "running" | "success" | "error";

interface ImportProgressState {
  active: boolean;
  stepIndex: number;
  status: ImportStatus;
}

const IMPORT_STEPS: string[] = [
  "Conectando con Gmail…",
  "Sincronizando metadatos de la bandeja de entrada…",
  "Importando correos recientes…",
  "Filtrando correos no procesables…",
  "Actualizando tu bandeja de entrada…",
];

export default function GmailConnectionStatus({
  onImported,
}: GmailConnectionStatusProps) {
  const [status, setStatus] = useState<UiStatus>({
    loading: true,
    connected: false,
    lastSyncAt: null,
    error: null,
  });
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Estado de progreso para la importación (bloquea la ventana con overlay)
  const [importProgress, setImportProgress] = useState<ImportProgressState>({
    active: false,
    stepIndex: 0,
    status: "idle",
  });

  async function fetchStatusFromServer(): Promise<ServerStatus> {
    try {
      const result = await getGmailConnectionStatusForCurrentUser();
      if (!result.success) {
        return {
          connected: false,
          lastSyncAt: null,
          error:
            result.error ??
            "Error al consultar el estado de conexión con Gmail.",
        };
      }

      // lastSyncAt puede llegar serializado; normalizamos a Date o null
      const rawLastSync = result.lastSyncAt as unknown as string | Date | null;
      const lastSyncAtDate =
        rawLastSync instanceof Date
          ? rawLastSync
          : rawLastSync
          ? new Date(rawLastSync)
          : null;

      const safeLastSyncAt =
        lastSyncAtDate && !Number.isNaN(lastSyncAtDate.getTime())
          ? lastSyncAtDate
          : null;

      return {
        connected: result.connected,
        lastSyncAt: safeLastSyncAt,
        error: null,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("[GmailConnectionStatus] Error cargando estado", error);
      return {
        connected: false,
        lastSyncAt: null,
        error: "Error al consultar el estado de conexión con Gmail.",
      };
    }
  }

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setStatus((prev) => ({ ...prev, loading: true, error: null }));
      const serverStatus = await fetchStatusFromServer();
      if (cancelled) return;
      setStatus({
        loading: false,
        ...serverStatus,
      });
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  function formatLastSync(lastSyncAt: Date | null): string {
    if (!lastSyncAt) {
      return "Nunca sincronizado";
    }
    const d = lastSyncAt;
    const date = d.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
    const time = d.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `Última actualización: ${date} ${time}`;
  }

  function handleConnectClick() {
    // Para conectar Gmail pedimos nuevamente el login/consent con Google,
    // reutilizando el flujo de NextAuth que ya incluye el scope gmail.readonly.
    window.location.href = "/api/auth/signin/google?callbackUrl=/emails";
  }

  function handleImportClick() {
    // Reiniciamos mensajes y activamos overlay de progreso
    setImportMessage(null);
    setStatus((prev) => ({ ...prev, loading: true }));
    setImportProgress({
      active: true,
      stepIndex: 0,
      status: "running",
    });

    startTransition(async () => {
      try {
        // Paso 1: Conectando con Gmail…
        setImportProgress((prev) => ({
          ...prev,
          active: true,
          stepIndex: 0,
          status: "running",
        }));

        const result = await importGmailInboxForCurrentUser();

        // Avance lógico de pasos tras la llamada principal
        setImportProgress((prev) => ({
          ...prev,
          active: true,
          stepIndex: 2,
          status: "running",
        }));

        // Construir mensaje final según resultado
        let message: string;
        if (!result.success && result.errors.length > 0) {
          // Mostramos el primer error significativo
          message = result.errors[0];
        } else if (result.imported === 0 && result.nonProcessable > 0) {
          // Solo hubo correos no procesables
          message = "No hay nuevos correos de negocio en los últimos 7 días.";
        } else if (result.imported === 0 && result.nonProcessable === 0) {
          // No hubo nuevos correos en Gmail
          message = "No tienes nuevos correos en los últimos días.";
        } else if (result.imported > 0 && result.nonProcessable > 0) {
          // Mezcla: algunos importados y otros descartados
          message = `Se importaron ${result.imported} correos nuevos, ${result.nonProcessable} descartados por filtros.`;
        } else {
          // Solo importados procesables
          message = `Se importaron ${result.imported} correos nuevos.`;
        }
        setImportMessage(message);

        // Paso final: Actualizando tu bandeja de entrada…
        const serverStatus = await fetchStatusFromServer();
        setStatus({
          loading: false,
          ...serverStatus,
        });

        const finalStatus: ImportStatus = result.success ? "success" : "error";

        setImportProgress({
          active: true,
          stepIndex: IMPORT_STEPS.length - 1,
          status: finalStatus,
        });

        if (result.success && onImported) {
          onImported();
        }

        // Ocultar el overlay después de un breve tiempo si fue exitoso
        if (result.success) {
          setTimeout(() => {
            setImportProgress({
              active: false,
              stepIndex: 0,
              status: "idle",
            });
          }, 1500);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          "[GmailConnectionStatus] Error crítico al importar correos desde Gmail",
          error
        );
        setImportMessage(
          "Error crítico al importar correos desde Gmail. Intenta nuevamente más tarde."
        );
        setStatus((prev) => ({ ...prev, loading: false }));
        setImportProgress({
          active: true,
          stepIndex: 3,
          status: "error",
        });
      }
    });
  }

  const showConnectButton = !status.connected && !status.loading;
  const showImportButton = status.connected && !status.loading;

  // Cálculo de porcentaje de progreso para la barra
  const progressPercent =
    importProgress.status === "idle" || !importProgress.active
      ? 0
      : ((importProgress.stepIndex + 1) / IMPORT_STEPS.length) * 100;

  return (
    <div className="flex flex-col gap-2 rounded-md border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-card)] p-3 text-sm">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-[color:var(--color-text-primary)]">
            Bandeja Gmail por usuario
          </span>

          {status.loading ? (
            <span className="text-[color:var(--color-text-secondary)]">
              Consultando estado de conexión con Gmail…
            </span>
          ) : status.error ? (
            <span className="text-[color:var(--color-danger-700)]">
              {status.error}
            </span>
          ) : showConnectButton ? (
            <span className="text-[color:var(--color-text-secondary)]">
              Aún no has conectado tu Gmail. Conéctalo para importar los correos
              de los últimos 7 días de tu bandeja de entrada.
            </span>
          ) : (
            <span className="text-[color:var(--color-text-secondary)]">
              Tu cuenta Gmail está conectada. {formatLastSync(status.lastSyncAt)}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {showConnectButton && (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleConnectClick}
              aria-label="Conectar mi Gmail"
            >
              Conectar mi Gmail
            </Button>
          )}

          {showImportButton && (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleImportClick}
              disabled={isPending}
              leftIcon={
                <RefreshCw
                  className={`w-4 h-4 ${
                    isPending ? "animate-spin" : ""
                  }`}
                  aria-hidden
                />
              }
              aria-label="Importar correos recientes de Gmail"
            >
              {isPending
                ? "Importando correos recientes…"
                : "Importar correos recientes"}
            </Button>
          )}
        </div>
      </div>

      {/* Mensaje simple cuando no hay overlay activo pero sí información del último resultado */}
      {!importProgress.active && importMessage && (
        <div className="text-xs text-[color:var(--color-text-secondary)]">
          {importMessage}
        </div>
      )}

      {/* Overlay de pantalla completa para bloquear interacción durante la importación */}
      {importProgress.active && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md mx-4 rounded-lg border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-card)] p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-[color:var(--color-text-primary)]">
                {importProgress.status === "success"
                  ? "Bandeja actualizada"
                  : importProgress.status === "error"
                  ? "Error al importar correos"
                  : "Importando correos recientes…"}
              </span>
              {importProgress.status === "running" && (
                <span className="text-[color:var(--color-text-secondary)] text-xs">
                  Paso {importProgress.stepIndex + 1} de {IMPORT_STEPS.length}
                </span>
              )}
            </div>

            {/* Barra de progreso */}
            <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--color-bg-muted)]">
              <div
                className="h-full bg-[color:var(--color-primary-500)] transition-[width] duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Lista de pasos */}
            <ul className="flex flex-col gap-1 text-[0.75rem] text-[color:var(--color-text-secondary)] mb-2">
              {IMPORT_STEPS.map((label, index) => {
                const completed =
                  importProgress.status === "success" ||
                  index < importProgress.stepIndex;
                const current =
                  importProgress.status === "running" &&
                  index === importProgress.stepIndex;
                return (
                  <li key={label} className="flex items-center gap-2">
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[0.6rem] ${
                        completed
                          ? "bg-[color:var(--color-primary-500)] text-white"
                          : current
                          ? "bg-[color:var(--color-primary-100)] text-[color:var(--color-primary-700)]"
                          : "bg-[color:var(--color-bg-card)] text-[color:var(--color-text-muted)] border border-[color:var(--color-border-light)]"
                      }`}
                    >
                      {completed ? "✔" : index + 1}
                    </span>
                    <span>{label}</span>
                  </li>
                );
              })}
            </ul>

            {/* Mensajes finales en overlay */}
            {importProgress.status === "error" && importMessage && (
              <div className="mt-1 text-[0.75rem] text-[color:var(--color-danger-700)]">
                {importMessage}
              </div>
            )}
            {importProgress.status === "success" && importMessage && (
              <div className="mt-1 text-[0.75rem] text-[color:var(--color-text-secondary)]">
                {importMessage}
              </div>
            )}

            {importProgress.status === "error" && (
              <div className="mt-3 flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setImportProgress({
                      active: false,
                      stepIndex: 0,
                      status: "idle",
                    })
                  }
                >
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}