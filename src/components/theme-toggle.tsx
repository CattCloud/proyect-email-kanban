"use client";

import React, { useState } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import Button from "@/components/ui/button";

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const themes = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Oscuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
  ] as const;

  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const Icon = currentTheme.icon;

  return (
    <div className="relative">
      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        variant="ghost"
        size="icon"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Tema actual: ${currentTheme.label}. Click para cambiar`}
        leftIcon={<Icon className="w-5 h-5" />}
      >
        <span className="sr-only">Cambiar tema</span>
      </Button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute z-50 right-0 mt-2 w-40 rounded-md border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-card)] shadow-[var(--shadow-dropdown)] animate-slide-down",
          open ? "block" : "hidden"
        )}
        role="menu"
        aria-label="Seleccionar tema"
      >
        {themes.map((t) => {
          const ThemeIcon = t.icon;
          const isActive = theme === t.value;

          return (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setTheme(t.value);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                "hover:bg-[color:var(--color-bg-hover)]",
                "focus:outline-none focus:bg-[color:var(--color-bg-hover)]",
                isActive && "bg-[color:var(--color-bg-active)]"
              )}
              role="menuitem"
              aria-current={isActive ? "true" : undefined}
            >
              <ThemeIcon
                className={cn(
                  "w-4 h-4",
                  isActive
                    ? "text-[color:var(--color-primary-600)]"
                    : "text-[color:var(--color-text-muted)]"
                )}
              />
              <span
                className={cn(
                  "flex-1 text-left",
                  isActive
                    ? "text-[color:var(--color-primary-700)] font-medium"
                    : "text-[color:var(--color-text-primary)]"
                )}
              >
                {t.label}
              </span>
              {isActive && (
                <Check className="w-4 h-4 text-[color:var(--color-primary-600)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Overlay para cerrar al hacer click fuera */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}