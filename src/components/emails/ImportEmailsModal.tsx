"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Upload, X, FileJson, CheckCircle2, AlertCircle, Copy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { importEmailsFromJSON } from "@/actions/emails";
import type { ImportResult } from "@/actions/emails";
import { useDropzone } from "react-dropzone";

type Step = "idle" | "preview" | "importing" | "result";

interface PreviewItem {
  id: string;  // ID del JSON
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

  // Estado y utilidades para "Ejemplo rápido"
  const [copiedExample, setCopiedExample] = useState(false);

  const exampleJSON = `[
  {
    "id": "email-001",
    "email": "cliente@empresa.com",
    "received_at": "2024-11-01T09:15:00Z",
    "subject": "Reunión urgente - Propuesta Q4",
    "body": "Necesito que revisemos la propuesta..."
  },
  {
    "id": "email-002",
    "email": "otro@cliente.com",
    "subject": "Consulta sobre servicios",
    "body": "Me gustaría conocer más detalles..."
  }
]`;

  const handleCopyExample = async () => {
    try {
      await navigator.clipboard.writeText(exampleJSON);
      setCopiedExample(true);
      setTimeout(() => setCopiedExample(false), 1500);
    } catch {
      // no-op
    }
  };

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
        id: typeof it.id === "string" ? it.id : "(sin ID)",
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

  // Drag & Drop (react-dropzone)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles?.[0];
    if (file) {
      void handleFileChange(file);
    }
  }, [handleFileChange]);

  const { getRootProps, getInputProps, isDragActive, open: openFileDialog } = useDropzone({
    onDrop,
    accept: { 'application/json': ['.json'] },
    multiple: false,
    noClick: true
  });

  const handleImport = async () => {
    if (!jsonText) return;
    try {
      setLoading(true);
      setStep("importing");
      const res = await importEmailsFromJSON(jsonText);
      setResult(res);
      setStep("result");
      
      // Si la importación fue exitosa (aunque con algunos errores), cerrar modal automáticamente
      if (res.imported > 0) {
        // Notificar al componente padre sobre la importación exitosa
        if (onImported) {
          onImported(res);
        }
        
        // Cerrar modal después de 2 segundos para mostrar el resultado
        setTimeout(() => {
          closeModal();
        }, 2000);
      }
    } catch {
      setResult({
        success: false,
        imported: 0,
        errors: [{ index: 0, error: "Error inesperado del cliente al importar" }],
        total: totalItems,
      });
      setStep("result");
      // En caso de error, mantener modal abierto para que usuario pueda reintentar
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

          <div className="relative card-base w-[min(720px,92vw)] max-h-[90vh] flex flex-col animate-slide-up">
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
              <div className="p-6">
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
                  <div
                    {...getRootProps()}
                    role="button"
                    tabIndex={0}
                    aria-label="Arrastra tu archivo JSON aquí o haz clic para seleccionarlo"
                    className={`rounded-md border-2 ${isDragActive ? "border-[color:var(--color-primary-500)] bg-[color:var(--color-bg-muted)]" : "border-[color:var(--color-border-light)]"} border-dashed p-6 text-center transition-colors cursor-pointer`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        // Trigger input click programmatically to avoid multiple dialogs
                        const input = document.querySelector('input[type="file"][aria-label="Seleccionar archivo JSON para importación"]') as HTMLInputElement;
                        if (input) input.click();
                      }
                    }}
                  >
                    <input
                      {...getInputProps()}
                      className="sr-only"
                      aria-label="Seleccionar archivo JSON para importación"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <FileJson className="w-6 h-6 text-[color:var(--color-text-secondary)]" />
                      <p className="text-[length:var(--font-size-sm)] text-[color:var(--color-text-secondary)]">
                        {isDragActive ? "Suelta el archivo aquí" : "Arrastra tu archivo .json aquí"}
                      </p>
                      <div className="text-[length:var(--font-size-xs)] text-[color:var(--color-text-muted)]">
                        {fileName ? `Seleccionado: ${fileName}` : "O usa el botón para seleccionar"}
                      </div>
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            // Trigger input click programmatically to avoid multiple dialogs
                            const input = document.querySelector('input[type="file"][aria-label="Seleccionar archivo JSON para importación"]') as HTMLInputElement;
                            if (input) input.click();
                          }}
                          leftIcon={<Upload className="w-4 h-4" />}
                          aria-label="Seleccionar archivo desde el explorador"
                        >
                          Seleccionar archivo
                        </Button>
                      </div>
                    </div>
                  </div>

                  {clientError && (
                    <div className="flex items-start gap-2 rounded-md border border-[color:var(--color-border-error)] p-3 text-[color:var(--color-error-text)]">
                      <AlertCircle className="w-4 h-4 mt-0.5" />
                      <div className="text-[length:var(--font-size-sm)]">{clientError}</div>
                    </div>
                  )}

                  <details className="rounded-md border border-[color:var(--color-border-light)]">
                    <summary className="px-4 py-3 cursor-pointer text-[length:var(--font-size-sm)] text-[color:var(--color-text-secondary)]">
                      Ver ejemplo JSON
                    </summary>
                    <div className="px-4 pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-[length:var(--font-size-xs)] text-[color:var(--color-text-muted)]">
                          Campos requeridos: id, email, subject, body 
                          • Opcional: received_at 
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyExample}
                          leftIcon={<Copy className="w-4 h-4" />}
                          aria-label={copiedExample ? "Ejemplo copiado" : "Copiar ejemplo JSON"}
                        >
                          {copiedExample ? "Copiado" : "Copiar"}
                        </Button>
                      </div>
                      <pre className="mt-3 p-3 rounded-md bg-[color:var(--color-bg-muted)] overflow-auto text-[length:var(--font-size-xs)]">
                        <code>{exampleJSON}</code>
                      </pre>
                    </div>
                  </details>

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
                    <div className="flex items-center gap-2">
                      <p className="text-[length:var(--font-size-sm)] text-[color:var(--color-text-primary)]">
                        {result.imported} importados de {result.total}
                      </p>
                      {result.errors.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-[color:var(--color-error-bg)] text-[color:var(--color-error-text)] border border-[color:var(--color-error-border)]">
                          {result.errors.length} errores
                        </span>
                      )}
                      <p className="text-[length:var(--font-size-sm)] text-[color:var(--color-text-primary)]">.</p>
                    </div>
                  </div>

                  {result.errors.length > 0 && (
                    <div className="rounded-md border border-[color:var(--color-border-light)]">
                      <div className="px-4 py-3 border-b border-[color:var(--color-border-light)] bg-[color:var(--color-bg-muted)] rounded-t-md">
                        <p className="text-[length:var(--font-size-sm)] text-[color:var(--color-text-secondary)]">
                          Detalle de errores (máx. 25 mostrados)
                        </p>
                      </div>
                      <div className="max-h-60 overflow-auto p-4 scrollbar-thin">
                        <div className="grid grid-cols-1 gap-2">
                          {result.errors.slice(0, 25).map((e, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 p-2 rounded-md border border-[color:var(--color-border-error)] bg-[color:var(--color-error-bg)]"
                            >
                              <AlertCircle className="w-3 h-3 mt-0.5 text-[color:var(--color-error-text)]" />
                              <div className="flex-1 min-w-0">
                                <div className="text-[length:var(--font-size-xs)] text-[color:var(--color-error-text)] font-medium">
                                  Email #{e.index + 1}
                                </div>
                                <div className="text-[length:var(--font-size-xs)] text-[color:var(--color-error-text)] opacity-80">
                                  {e.email ?? "(sin asunto)"} — {e.error}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {step !== "importing" && (
                      <Button variant="secondary" asChild>
                        <a
                          href="/templates/email-import-template.json"
                          download
                          aria-label="Descargar plantilla de ejemplo JSON"
                        >
                          Descargar plantilla
                        </a>
                      </Button>
                    )}
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
          </div>
        </div>
      )}
    </div>
  );
}