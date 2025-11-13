export default function LoadingReviewPage() {
  // Skeletons de carga para la página de Revisión de IA (HITO 4)
  // Estructura: encabezado + 3 tarjetas "plegables" en estado loading
  return (
    <section aria-label="Cargando revisión de IA" className="space-y-4">
      {/* Header skeleton */}
      <header className="flex items-center justify-between">
        <div className="h-6 w-48 rounded bg-[color:var(--color-bg-muted)] animate-pulse" aria-hidden />
        <div className="h-4 w-24 rounded bg-[color:var(--color-bg-muted)] animate-pulse" aria-hidden />
      </header>

      {/* Tarjetas skeleton (x3) */}
      {[0, 1, 2].map((i) => (
        <article key={i} className="card-base p-0 overflow-hidden" aria-hidden>
          {/* Encabezado compacto skeleton */}
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-[color:var(--color-border-light)]">
            <div className="min-w-0 flex-1">
              <div className="h-3 w-32 rounded bg-[color:var(--color-bg-muted)] animate-pulse mb-2" />
              <div className="h-4 w-3/4 rounded bg-[color:var(--color-bg-muted)] animate-pulse mb-1" />
              <div className="h-3 w-40 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
            </div>
            <div className="h-6 w-20 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
          </div>

          {/* Panel expandido skeleton */}
          <div className="p-4 bg-[color:var(--color-bg-muted)]/40">
            {/* Contenido del email */}
            <div className="mb-3">
              <div className="h-3 w-24 rounded bg-[color:var(--color-bg-muted)] animate-pulse mb-2" />
              <div className="border border-[color:var(--color-border-light)] rounded-md p-3 bg-[color:var(--color-bg-card)] space-y-2">
                <div className="h-3 w-full rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
                <div className="h-3 w-11/12 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
              </div>
            </div>

            {/* Análisis IA */}
            <div className="mb-3">
              <div className="h-3 w-24 rounded bg-[color:var(--color-bg-muted)] animate-pulse mb-2" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="h-3 w-20 rounded bg-[color:var(--color-bg-muted)] animate-pulse mb-2" />
                  <div className="h-6 w-24 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
                </div>
                <div>
                  <div className="h-3 w-20 rounded bg-[color:var(--color-bg-muted)] animate-pulse mb-2" />
                  <div className="h-6 w-24 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
                </div>
                <div className="sm:col-span-2">
                  <div className="h-3 w-20 rounded bg-[color:var(--color-bg-muted)] animate-pulse mb-2" />
                  <div className="h-4 w-2/3 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
                </div>
                <div className="sm:col-span-2">
                  <div className="h-3 w-20 rounded bg-[color:var(--color-bg-muted)] animate-pulse mb-2" />
                  <div className="h-4 w-40 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Tareas */}
            <div className="mb-4">
              <div className="h-3 w-28 rounded bg-[color:var(--color-bg-muted)] animate-pulse mb-2" />
              <ul className="space-y-2">
                {[0, 1].map((t) => (
                  <li key={t} className="border border-[color:var(--color-border-light)] rounded-md p-3 bg-[color:var(--color-bg-card)]">
                    <div className="h-4 w-3/4 rounded bg-[color:var(--color-bg-muted)] animate-pulse mb-2" />
                    <div className="flex gap-2">
                      <div className="h-3 w-24 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
                      <div className="h-3 w-20 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <div className="h-4 w-10 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
                      <div className="h-4 w-12 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
                      <div className="h-4 w-8 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2">
              <div className="h-9 w-28 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
              <div className="h-9 w-28 rounded bg-[color:var(--color-bg-muted)] animate-pulse" />
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}