import Link from "next/link";
import Button from "@/components/ui/button";
import ReviewAccordion, { type ReviewEmailItem } from "@/components/processing/ReviewAccordion";
import { getPendingAllAIResults } from "@/actions/ai-processing";

/**
 * HITO 4 - Página de Revisión de IA (rediseño)
 * - Reemplaza layout de 2 columnas por tarjetas verticales plegables (accordion)
 * - Solo una tarjeta expandida a la vez
 * - Acciones Aceptar/Rechazar dentro del panel expandido
 * - Enlace "Ver email" separado del trigger de expandir
 */
export default async function ReviewPage() {
  const pending = await getPendingAllAIResults();

  if (!pending.success) {
    return (
      <section className="card-base p-6">
        <h1 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-2">
          Revisión de IA
        </h1>
        <p className="text-[color:var(--color-danger-500)]">
          Error al cargar resultados pendientes: {pending.error ?? "Error desconocido"}
        </p>
        <div className="mt-4">
          <Link href="/emails" className="inline-block">
            <Button variant="primary" size="md" aria-label="Volver a Emails">
              Volver a Emails
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  const items = (pending.data as unknown as ReviewEmailItem[]) ?? [];

  if (items.length === 0) {
    return (
      <section className="card-base p-6">
        <h1 className="text-lg font-semibold text-[color:var(--color-text-primary)] mb-2">
          Revisión de IA
        </h1>
        <p className="text-[color:var(--color-text-secondary)]">
          No hay resultados de IA pendientes de revisión.
        </p>
        <div className="mt-4">
          <Link href="/emails" className="inline-block">
            <Button variant="primary" size="md" aria-label="Volver a Emails">
              Volver a Emails
            </Button>
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Revisión de resultados de IA" className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
          Revisión de IA
        </h1>
        <div className="text-sm text-[color:var(--color-text-secondary)]">
          Pendientes: {items.length}
        </div>
      </header>

      {/* Nuevo diseño: acordeón de tarjetas plegables */}
      <ReviewAccordion items={items} />
    </section>
  );
}