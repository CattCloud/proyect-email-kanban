"use client";

import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
};

/**
 * SearchBar: barra de búsqueda reutilizable (HU-UI-002)
 * Estilos basados en tokens de src/app/globals.css
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  ariaLabel = "Buscar",
  className = "",
}: SearchBarProps) {
  return (
    <div
      className={`flex items-center gap-2 w-full max-w-xl border border-[color:var(--color-border-light)] rounded-md bg-[color:var(--color-bg-card)] px-3 py-2 ${className}`}
      role="search"
      aria-label={ariaLabel}
    >
      <Search className="w-4 h-4 text-[color:var(--color-text-muted)]" aria-hidden />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-placeholder)]"
        aria-label={ariaLabel}
      />
    </div>
  );
}