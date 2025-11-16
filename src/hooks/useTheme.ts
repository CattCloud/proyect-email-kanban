"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";

// Store para manejar el tema de forma sincronizada
const themeStore = {
  theme: "system" as Theme,
  listeners: new Set<() => void>(),
  
  getSnapshot() {
    return themeStore.theme;
  },
  
  getServerSnapshot() {
    return "system" as Theme;
  },
  
  subscribe(listener: () => void) {
    themeStore.listeners.add(listener);
    return () => themeStore.listeners.delete(listener);
  },
  
  setTheme(newTheme: Theme) {
    themeStore.theme = newTheme;
    themeStore.listeners.forEach(listener => listener());
  },
  
  initialize() {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("theme") as Theme | null;
        if (saved) {
          themeStore.theme = saved;
        }
      } catch {
        // noop
      }
    }
  }
};

// Inicializar en el cliente
if (typeof window !== "undefined") {
  themeStore.initialize();
}

export function useTheme() {
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot
  );

  const setTheme = (newTheme: Theme) => {
    themeStore.setTheme(newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (selectedTheme: Theme) => {
      // Remover clases anteriores
      root.classList.remove("light", "dark");
      
      if (selectedTheme === "system") {
        // Detectar preferencia del sistema
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(selectedTheme);
      }
    };

    applyTheme(theme);

    // Guardar en localStorage
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // noop
    }

    // Listener para cambios en preferencia del sistema
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return { theme, setTheme };
}
