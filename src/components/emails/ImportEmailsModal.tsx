"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Upload, X, FileJson, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { importEmailsFromJSON } from "@/actions/emails";
import type { ImportResult } from "@/actions/emails";

type Step = "idle" | "preview" | "importing" | "result";

interface PreviewItem {
  from: string;
  subject: string;
  body?: string;
  receivedAt?: string;
  processed?: boolean;
  category?: string | null;
  priority?: string | null;
  hasTask?: boolean;
  taskDescription?: string | null;
  taskStatus?: string | null;
}

interface ImportEmailsModalProps { onImported?: (summary: ImportResult) => void; }
export default function ImportEmailsModal({ onImported }: ImportEmailsModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [clientError, setClientError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const modalTitleId = "import-emails-modal-title";

  const resetState = useCallback(() => {
    setStep("idle");
    setFileName(null);
    setJsonText(null);
    setPreview([]);
    setTotalItems(0);
    setClientError(null);
    setResult(null);
    setLoading(false);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setTimeout(resetState, 150);
  }, [resetState]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, closeModal]);

  const handleFileChange = async (file: File | undefined | null) => {
    setClientError(null);
    setPreview([]);
    setTotalItems(0);
    setResult(null);

    if (!file) {
      setFileName(null);
      setJsonText(null);
      setStep("idle");
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setClientError("El archivo debe contener un arreglo JSON de emails.");
        setStep("idle");
        return;
      }

      // Mapeo para vista previa: Product Brief -> formato interno
      const simplified: PreviewItem[] = parsed.slice(0, 5).map((it: Record<string, unknown>) => ({
        from: typeof it.email === "string" ? it.email : "(sin remitente)",
        subject: typeof it.subject === "string" ? it.subject : "(sin asunto)",
        body: typeof it.body === "string" ? it.body : undefined,
        receivedAt: typeof it.received_at === "string" ? it.received_at : undefined,
        // Los campos de metadata no están en el Product Brief
        processed: false,  // Por defecto sin procesar
        category: undefined,
        priority: undefined,
        hasTask: false,
        taskDescription: undefined,
        taskStatus: undefined,
      }));

      setFileName(file.name);
      setJsonText(text);
      setPreview(simplified);
      setTotalItems(parsed.length);
      setStep("preview");
    } catch {
      setClientError("No se pudo leer o parsear el archivo JSON.");
      setStep("idle");
    }
  };

  const handleImport = async () => {
    if (!jsonText) return;
    try {
      setLoading(true);
      setStep("importing");
      const res = await importEmailsFromJSON(jsonText);
      setResult(res);
      setStep("result");
    } catch {
      setResult({
        success: false,
        imported: 0,
        errors: [{ index: 0, error: "Error inesperado del cliente al importar" }],
        total: totalItems,
      });
      setStep("result");
    } finally {
      setLoading(false);
    }
  };

  const headerDescription = useMemo(() => {
    if (step === "idle") return "Selecciona un archivo .json con tus emails.";
    if (step === "preview") return `Se detectaron ${totalItems} emails. Revisa una vista previa antes de importar.`;
    if (step === "importing") return "Importando emails, por favor espera...";
    if (step === "result") return "Resultado del proceso de importación.";
    return "";
  }, [step, totalItems]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-start">
        <Button
          variant="primary"
          size="md"
          onClick={() => setOpen(true)}
          leftIcon={<Upload className="w-4 h-4" />}
          aria-label="Abrir modal para importar emails en formato JSON"
        >
          Importar Emails
        </Button>
      </div>

      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby={modalTitleId}
          style={{ zIndex: 1050 }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "var(--color-bg-overlay)" }}
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="relative card-base w-[min(720px,92vw)] p-6 animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 id={modalTitleId} className="text-[length:var(--font-size-xl)] font-semibold text-[color:var(--color-text-primary)]">
                  Importar emails desde JSON
                </h2>
                <p className="mt-1 text-[length:var(--font-size-sm)] text-[color:var(--color-text-muted)]">
                  {headerDescription}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={closeModal}
                aria-label="Cerrar modal"
                className="ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {(step === "idle" || step === "preview") && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-[color:var(--color-text-secondary)]">
                        <FileJson className="w-5 h-5" />
                        <span className="text-[length:var(--font-size-sm)]">
                          {fileName ? fileName : "Ningún archivo seleccionado"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <input
                        ref={inputRef}
                        type="file"
                        accept=".json,application/json"
                        className="sr-only"
                        onChange={(e) => handleFileChange(e.target.files?.[0])}
                        aria-label="Seleccionar archivo JSON para importación"
                      />
                      <Button
                        variant="outline"
                        onClick={() => inputRef.current?.click()}
                        leftIcon={<Upload className="w-4 h-4" />}
                      >
                        Seleccionar archivo
                      </Button>
                    </div>
                  </div>

                  {clientError && (
                    <div className="flex items-start gap-2 rounded-md border border-[color:var(--color-border-error)] p-3 text-[color:var(--color-error-text)]">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      <div className="text-[length:var(--font-size-sm)]">{clientError}</div>
                    </div>
                  )}

                  {step === "preview" && (
                    <div className="rounded-md border border-[color:var(--color-border-light)]">
                      <div className="px-4 py-3 border-b border-[color:var(--color-border-light)] bg-[color:var(--color-bg-muted)] rounded-t-md">
                        <p className="text-[length:var(--font-size-sm)] text-[color:var(--color-text-secondary)]">
                          Vista previa de {Math.min(preview.length, 5)} / {totalItems} emails
                        </p>
                      </div>
                      <div className="max-h-60 overflow-auto p-4 scrollbar-thin">
                        <ul className="space-y-3">
                          {preview.map((item, idx) => (
                            <li key={idx} className="p-3 rounded-md border border-[color:var(--color-border-light)]">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-[color:var(--color-text-primary)]">
                                  {item.subject}
                                </div>
                                <span className="text-[length:var(--font-size-xs)] text-[color:var(--color-text-muted)]">
                                  {item.receivedAt ?? "-"}
                                </span>
                              </div>
                              <div className="text-[length:var(--font-size-sm)] text-[color:var(--color-text-secondary)]">
                                {item.from}
                              </div>
                              {item.category && (
                                <div className="mt-1 text-[length:var(--font-size-xs)] text-[color:var(--color-text-muted)]">
                                  {item.category} {item.priority ? `• ${item.priority}` : ""}
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === "importing" && (
                <div className="flex items-center gap-3 p-4 rounded-md border border-[color:var(--color-border-light)]">
                  <span className="spinner" aria-hidden />
                  <span className="text-[length:var(--font-size-sm)] text-[color:var(--color-text-secondary)]">
                    Importando emails en lotes... esto puede tardar unos segundos.
                  </span>
                </div>
              )}

              {step === "result" && result && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle2 className="w-5 h-5 text-[color:var(--color-success)]" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-[color:var(--color-error)]" />
                    )}
                    <p className="text-[length:var(--font-size-sm)] text-[color:var(--color-text-primary)]">
                      {result.imported} importados de {result.total}. {result.errors.length} errores.
                    </p>
                  </div>

                  {result.errors.length > 0 && (
                    <div className="rounded-md border border-[color:var(--color-border-light)]">
                      <div className="px-4 py-3 border-b border-[color:var(--color-border-light)] bg-[color:var(--color-bg-muted)] rounded-t-md">
                        <p className="text-[length:var(--font-size-sm)] text-[color:var(--color-text-secondary)]">
                          Detalle de errores (máx. 25 mostrados)
                        </p>
                      </div>
                      <div className="max-h-60 overflow-auto p-4 scrollbar-thin">
                        <ul className="space-y-2">
                          {result.errors.slice(0, 25).map((e, i) => (
                            <li key={i} className="text-[length:var(--font-size-xs)] text-[color:var(--color-error-text)]">
                              #{e.index + 1}: {e.email ?? "(sin asunto)"} — {e.error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="text-[length:var(--font-size-xs)] text-[color:var(--color-text-muted)]">
                Formato esperado: arreglo JSON con campos: id?, email, received_at?, subject, body
              </div>

              <div className="flex items-center gap-2">
                {step !== "importing" && (
                  <Button variant="ghost" onClick={closeModal}>Cerrar</Button>
                )}
                {(step === "idle" || step === "preview") && (
                  <Button
                    variant="primary"
                    onClick={handleImport}
                    disabled={!jsonText || step === "idle"}
                    loading={loading}
                    aria-disabled={!jsonText || loading}
                  >
                    {step === "preview" ? `Importar ${totalItems} emails` : "Importar"}
                  </Button>
                )}
                {step === "result" && (
                  <Button variant="link" asChild>
                    <Link href="/emails" aria-label="Ir a la lista de emails">Ver Emails</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}