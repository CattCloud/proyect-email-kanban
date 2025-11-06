"use client";

import Link from "next/link";
import { Mail, Sparkles, Trash2, ExternalLink, ChevronRight } from "lucide-react";
import Button from "@/components/ui/button";

export default function ButtonsPlaygroundPage() {
  return (
    <main className="container-padding py-6 space-y-8">
      <header>
        <h1 className="mb-1">Playground de Button</h1>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Variantes, tamaños y estados del componente Button estandarizado. Esta página es temporal para verificación visual (Semana 1).
        </p>
      </header>

      {/* Variantes */}
      <section className="card-base p-6 space-y-4" aria-label="Variantes">
        <h2 className="text-base font-semibold">Variantes</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="default" leftIcon={<Mail className="w-4 h-4" aria-hidden />}>
            default
          </Button>
          <Button variant="primary" leftIcon={<Sparkles className="w-4 h-4" aria-hidden />}>
            primary
          </Button>
          <Button variant="secondary">secondary</Button>
          <Button variant="outline">outline</Button>
          <Button variant="ghost">ghost</Button>
          <Button variant="destructive" leftIcon={<Trash2 className="w-4 h-4" aria-hidden />}>
            destructive
          </Button>
          <Button variant="link" rightIcon={<ExternalLink className="w-4 h-4" aria-hidden />}>
            link
          </Button>
        </div>
      </section>

      {/* Tamaños */}
      <section className="card-base p-6 space-y-4" aria-label="Tamaños">
        <h2 className="text-base font-semibold">Tamaños</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm">
            sm
          </Button>
          <Button variant="primary" size="md">
            md
          </Button>
          <Button variant="primary" size="lg">
            lg
          </Button>
          <Button
            variant="primary"
            size="icon"
            aria-label="Abrir"
            leftIcon={<ChevronRight className="w-5 h-5" aria-hidden />}
          >
            Abrir
          </Button>
        </div>
      </section>

      {/* Estados */}
      <section className="card-base p-6 space-y-4" aria-label="Estados">
        <h2 className="text-base font-semibold">Estados</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">normal</Button>
          <Button variant="primary" disabled>
            disabled
          </Button>
          <Button variant="primary" loading aria-label="Cargando">
            Cargando
          </Button>
          <Button variant="outline" loading aria-label="Cargando outline">
            Cargando outline
          </Button>
          <Button variant="destructive" loading aria-label="Eliminando">
            Eliminando
          </Button>
        </div>
      </section>

      {/* asChild + Link (mantener semántica de navegación) */}
      <section className="card-base p-6 space-y-4" aria-label="asChild y Link">
        <h2 className="text-base font-semibold">asChild con Next.js Link</h2>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Usa asChild para que el Button delegue semántica y navegación a un <code>{"<Link />"}</code> sin perder estilado del botón.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="primary" size="md" leftIcon={<Mail className="w-4 h-4" aria-hidden />}>
            <Link href="/emails" aria-label="Ir a Emails">
              Ir a Emails
            </Link>
          </Button>

          <Button asChild variant="outline" size="md" rightIcon={<ExternalLink className="w-4 h-4" aria-hidden />}>
            <Link href="/kanban" aria-label="Ir al Kanban">
              Ir al Kanban
            </Link>
          </Button>

          <Button asChild variant="link" size="md">
            <Link href="/dashboard" aria-label="Volver al Dashboard">
              Volver al Dashboard
            </Link>
          </Button>
        </div>
      </section>

      {/* Accesibilidad */}
      <section className="card-base p-6 space-y-4" aria-label="Accesibilidad">
        <h2 className="text-base font-semibold">Accesibilidad</h2>
        <ul className="list-disc pl-5 text-sm text-[color:var(--color-text-secondary)] space-y-1">
          <li>Tabulación y foco consistente con focus-ring.</li>
          <li>aria-busy y aria-live en estado loading.</li>
          <li><code>{`size={'icon'}`}</code> requiere aria-label descriptivo.</li>
          <li>asChild mantiene semántica de <code>{"<a>"}</code> para navegación.</li>
        </ul>
      </section>
    </main>
  );
}