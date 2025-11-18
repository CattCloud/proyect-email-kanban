"use client";

import { useMemo, useState, useRef, useEffect, KeyboardEvent } from "react";
import {
  Users,
  Search,
  X,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import type { KanbanContact } from "@/types";
import Button from "@/components/ui/button";

type Props = {
  contacts: KanbanContact[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  loading: boolean;
  error?: string | null;
};

/**
 * KanbanContactSelector
 *
 * MultiSelect estilo shadcn/ui pero en formato COMPACTO tipo toolbar:
 * - Ocupa una sola línea arriba del Kanban (altura baja, sin card grande).
 * - Label "Filtrar por contacto:" a la izquierda, trigger compacto a la derecha.
 * - Trigger tipo combobox con resumen ("3 contactos seleccionados") y chips reducidos.
 * - Búsqueda en vivo en el panel desplegable.
 * - Navegación por teclado (ArrowUp/Down, Enter, Escape).
 */
export default function KanbanContactSelector({
  contacts,
  selectedIds,
  onChange,
  loading,
  error,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const hasSelection = selectedIds.length > 0;

  const filteredContacts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return contacts;

    return contacts.filter((c) => {
      const name = c.name?.toLowerCase() ?? "";
      const email = c.email.toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [contacts, search]);

  const handleToggleId = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleRemoveChip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((x) => x !== id));
  };

  const handleClearAll = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange([]);
  };

  const selectedContacts = useMemo(
    () =>
      selectedIds
        .map((id) => contacts.find((c) => c.id === id))
        .filter((c): c is KanbanContact => !!c),
    [contacts, selectedIds]
  );

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        listRef.current &&
        !listRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const visibleOptions = loading || error ? [] : filteredContacts;

  const handleTriggerKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  const handleListKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (visibleOptions.length === 0) return;
      setHighlightedIndex((prev) => (prev + 1) % visibleOptions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (visibleOptions.length === 0) return;
      setHighlightedIndex((prev) =>
        (prev - 1 + visibleOptions.length) % visibleOptions.length
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (visibleOptions.length === 0) return;
      const safeIndex =
        highlightedIndex >= 0 && highlightedIndex < visibleOptions.length
          ? highlightedIndex
          : 0;
      const option = visibleOptions[safeIndex];
      if (option) {
        handleToggleId(option.id);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const placeholder = loading
    ? "Cargando contactos..."
    : "Selecciona contacto(s)";

  // Para no llenar el trigger de chips, solo mostramos hasta 2
  const MAX_VISIBLE_CHIPS = 2;
  const chipsOverflow =
    selectedContacts.length > MAX_VISIBLE_CHIPS
      ? selectedContacts.length - MAX_VISIBLE_CHIPS
      : 0;

  return (
    <section
      className="mt-2 "
      aria-label="Barra de filtros por contacto"
    >
      <div className="flex items-center justify-between gap-2">
        {/* Label compacto + resumen */}
        <div className="flex items-center gap-2 min-w-0">
          <Users
            className="w-4 h-4 text-[color:var(--color-info)]"
            aria-hidden
          />
          <span className="text-xs font-medium text-[color:var(--color-info)]">
            Filtrar por contacto:
          </span>
          <span className="text-[10px] text-[color:var(--color-text-muted)] truncate ">
            {hasSelection
              ? `${selectedIds.length} contacto(s) seleccionados`
              : "Sin filtros aplicados"}
          </span>
        </div>

        {/* Trigger compacto estilo combobox */}
        <div className="flex items-center gap-2">
          {hasSelection && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleClearAll}
              aria-label="Limpiar selección de contactos"
              className="hidden md:inline-flex items-center gap-1 text-[10px] h-7 px-2"
              leftIcon={<X className="w-3 h-3" aria-hidden />}
            >
              Limpiar
            </Button>
          )}

          <button
            ref={triggerRef}
            type="button"
            className="h-8 min-w-[160px] max-w-[260px] flex items-center justify-between rounded-md border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-card)] px-2 text-[11px] text-left hover:bg-[color:var(--color-bg-hover)] focus-ring"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            onKeyDown={handleTriggerKeyDown}
          >
            <div className="flex items-center gap-1 flex-1 min-w-0">
              {hasSelection ? (
                <>
                  {selectedContacts.slice(0, MAX_VISIBLE_CHIPS).map((contact) => (
                    <span
                      key={contact.id}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-[1px] text-[10px] bg-[color:var(--color-bg-soft)] border border-[color:var(--color-border-subtle)] text-[color:var(--color-text-primary)]"
                    >
                      <span className="max-w-[80px] truncate">
                        {contact.name ?? contact.email}
                      </span>
                      {/* IMPORTANTE: span con role="button" para evitar button dentro de button */}
                      <span
                        role="button"
                        tabIndex={-1}
                        onClick={(e) => handleRemoveChip(contact.id, e as unknown as React.MouseEvent)}
                        className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] cursor-pointer"
                        aria-label={`Quitar contacto ${contact.name ?? contact.email}`}
                      >
                        <X className="w-3 h-3" aria-hidden />
                      </span>
                    </span>
                  ))}
                  {chipsOverflow > 0 && (
                    <span className="text-[10px] text-[color:var(--color-text-muted)]">
                      +{chipsOverflow}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[10px] text-[color:var(--color-text-muted)] truncate">
                  {placeholder}
                </span>
              )}
            </div>
            <ChevronsUpDown
              className="w-3 h-3 ml-1 text-[color:var(--color-text-muted)] flex-shrink-0"
              aria-hidden
            />
          </button>
        </div>
      </div>

      {/* Panel desplegable */}
      {open && (
        <div
          ref={listRef}
          className="relative"
        >
          <div
            className="absolute right-0 mt-1 w-full max-w-[360px] rounded-md border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-card)] shadow-xl z-30"
            role="listbox"
            aria-label="Opciones de contactos"
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
          >
            {/* Buscador */}
            <div className="flex items-center px-2 py-1.5 border-b border-[color:var(--color-border-subtle)] bg-[color:var(--color-bg-elevated)]">
              <Search
                className="w-3.5 h-3.5 text-[color:var(--color-text-muted)] mr-2"
                aria-hidden
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-[11px] text-[color:var(--color-text-primary)] placeholder:text-[color:var(--color-text-muted)]"
                placeholder="Buscar por nombre o email..."
                autoFocus
              />
            </div>

            {/* Contenido */}
            {loading ? (
              <div className="p-2 text-[11px] text-[color:var(--color-text-muted)] bg-[color:var(--color-bg-card)]">
                Cargando contactos...
              </div>
            ) : error ? (
              <div className="p-2 text-[11px] text-[color:var(--color-danger-500)] bg-[color:var(--color-bg-card)]">
                Error al cargar contactos: {error}
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-2 text-[11px] text-[color:var(--color-text-muted)] bg-[color:var(--color-bg-card)]">
                No hay contactos con tareas disponibles.
              </div>
            ) : visibleOptions.length === 0 ? (
              <div className="p-2 text-[11px] text-[color:var(--color-text-muted)] bg-[color:var(--color-bg-card)]">
                No se encontraron contactos que coincidan con la búsqueda.
              </div>
            ) : (
              <div className="max-h-56 overflow-auto bg-[color:var(--color-bg-card)]">
                {visibleOptions.map((contact, index) => {
                  const checked = selectedIds.includes(contact.id);
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <button
                      key={contact.id}
                      type="button"
                      role="option"
                      aria-selected={checked}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-[11px] cursor-pointer text-left ${
                        isHighlighted
                          ? "bg-[color:var(--color-primary-50)]"
                          : "hover:bg-[color:var(--color-bg-soft)]"
                      }`}
                      onClick={() => handleToggleId(contact.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-4 w-4 items-center justify-center rounded-sm border border-[color:var(--color-border-subtle)] ${
                            checked
                              ? "bg-[color:var(--color-primary-500)] text-[color:var(--color-text-inverse)]"
                              : "bg-[color:var(--color-bg-card)]"
                          }`}
                        >
                          {checked && (
                            <Check className="w-3 h-3" aria-hidden />
                          )}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-medium text-[color:var(--color-text-primary)] truncate max-w-[200px]">
                            {contact.name ?? contact.email}
                          </span>
                          {contact.name && (
                            <span className="text-[10px] text-[color:var(--color-text-muted)] truncate max-w-[220px]">
                              {contact.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-[color:var(--color-text-muted)]">
                        {typeof contact.todoTasks === "number" &&
                          contact.todoTasks > 0 && (
                            <span>Por hacer: {contact.todoTasks}</span>
                          )}
                        {typeof contact.doingTasks === "number" &&
                          contact.doingTasks > 0 && (
                            <span>En progreso: {contact.doingTasks}</span>
                          )}
                        {typeof contact.doneTasks === "number" &&
                          contact.doneTasks > 0 && (
                            <span>Completadas: {contact.doneTasks}</span>
                          )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}