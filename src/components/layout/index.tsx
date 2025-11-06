"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navigationItems } from "@/lib/mock-data/navigation";
import { mockUser } from "@/lib/mock-data/user";
import {
  Home as HomeIcon,
  Mail as MailIcon,
  Columns as ColumnsIcon,
  Menu as MenuIcon,
  X as XIcon,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  LogOut as LogOutIcon,
} from "lucide-react";

/**
 * Utilidades
 */
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

function useActivePath() {
  const pathname = usePathname() || "/";
  return pathname;
}

type LucideKey =
  | "Home"
  | "Mail"
  | "Columns"
  | "Menu"
  | "X"
  | "ChevronLeft"
  | "ChevronRight"
  | "User"
  | "LogOut";

function Lucide({
  name,
  className = "w-5 h-5",
}: {
  name: LucideKey;
  className?: string;
}) {
  switch (name) {
    case "Home":
      return <HomeIcon className={className} aria-hidden />;
    case "Mail":
      return <MailIcon className={className} aria-hidden />;
    case "Columns":
      return <ColumnsIcon className={className} aria-hidden />;
    case "Menu":
      return <MenuIcon className={className} aria-hidden />;
    case "X":
      return <XIcon className={className} aria-hidden />;
    case "ChevronLeft":
      return <ChevronLeft className={className} aria-hidden />;
    case "ChevronRight":
      return <ChevronRight className={className} aria-hidden />;
    case "User":
      return <UserIcon className={className} aria-hidden />;
    case "LogOut":
      return <LogOutIcon className={className} aria-hidden />;
    default:
      return null;
  }
}

/**
 * Sidebar (desktop/colapsable) + Overlay móvil
 */
export function Sidebar({
  collapsed,
  onToggle,
  onNavigate,
}: {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}) {
  const activePath = useActivePath();

  return (
    <aside
      className={cn(
        "sidebar-base hide-mobile",
        collapsed && "sidebar-collapsed"
      )}
      aria-label="Barra lateral de navegación"
    >
      {/* Logo / Nombre */}
      <div className="flex items-center gap-2 p-4">
        <div className="w-8 h-8 rounded-md gradient-primary" aria-hidden />
        {!collapsed && (
          <h2 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
            Email Kanban
          </h2>
        )}
      </div>

      {/* Navegación */}
      <nav className="px-2 py-2">
        <ul className="flex flex-col gap-1">
          {navigationItems.map((item) => {
            const active =
              item.href === "/"
                ? activePath === "/" || activePath.startsWith("/dashboard")
                : activePath.startsWith(item.href);

            const iconName = item.icon as LucideKey;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "sidebar-nav-item",
                    active && "sidebar-nav-item-active",
                    collapsed && "justify-center",
                    "focus-ring"
                  )}
                >
                  <Lucide
                    name={iconName}
                    className={cn("w-5 h-5 shrink-0 sidebar-nav-icon", !collapsed && "mr-3")}
                  />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Botón colapsar */}
      <div className="mt-auto p-2">
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2 rounded-md text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-hover)] transition-colors"
          )}
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          <Lucide name={collapsed ? "ChevronRight" : "ChevronLeft"} />
          {!collapsed && <span className="text-xs">Colapsar</span>}
        </button>
      </div>
    </aside>
  );
}

export function MobileSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const activePath = useActivePath();

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-[var(--z-index-modal-backdrop)] bg-[color:var(--color-bg-overlay)] transition-opacity hide-desktop hide-tablet",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      {/* Sheet lateral */}
      <div
        className={cn(
          "fixed top-0 left-0 h-screen w-[var(--sidebar-width-mobile)] z-[var(--z-index-modal)] bg-[color:var(--color-bg-card)] border-r border-[color:var(--color-border-light)] transition-transform ease-in-out hide-desktop hide-tablet",
          open ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        <div className="flex items-center justify-between p-4 border-b border-[color:var(--color-border-light)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md gradient-primary" aria-hidden />
            <h2 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
              Email Kanban
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            className="p-2 rounded-md hover:bg-[color:var(--color-bg-hover)]"
          >
            <Lucide name="X" />
          </button>
        </div>

        <nav className="px-3 py-3">
          <ul className="flex flex-col gap-1">
            {navigationItems.map((item) => {
              const active =
                item.href === "/"
                  ? activePath === "/" || activePath.startsWith("/dashboard")
                  : activePath.startsWith(item.href);
              const iconName = item.icon as LucideKey;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "sidebar-nav-item",
                      active && "sidebar-nav-item-active"
                    )}
                  >
                    <Lucide name={iconName} className="w-5 h-5 mr-3 shrink-0 sidebar-nav-icon" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}

/**
 * Breadcrumbs
 */
export function Breadcrumbs() {
  const pathname = usePathname() || "/";
  const segments = pathname.split("/").filter(Boolean);

  const items = useMemo(() => {
    if (segments.length === 0) return [{ label: "Dashboard", href: "/" }];
    const map: Record<string, string> = {
      emails: "Emails",
      kanban: "Kanban",
      dashboard: "Dashboard",
    };
    const acc: { label: string; href: string }[] = [];
    let path = "";
    for (const seg of segments) {
      path += `/${seg}`;
      const label = map[seg] || (seg === "[id]" ? "Detalle" : seg);
      acc.push({ label, href: path });
    }
    return acc;
  }, [segments]);

  return (
    <nav className="breadcrumbs" aria-label="breadcrumbs">
      <Link href="/" className="breadcrumbs-item">
        Dashboard
      </Link>
      {items.map((it, idx) => (
        <React.Fragment key={it.href}>
          <span className="breadcrumbs-separator">/</span>
          {idx === items.length - 1 ? (
            <span className="breadcrumbs-item-active">{it.label}</span>
          ) : (
            <Link href={it.href} className="breadcrumbs-item">
              {it.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

/**
 * Menú de Usuario
 */
function UserMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    setOpen(false);
    // Simular toast con alert (Semana 1)
    alert("Sesión cerrada correctamente");
    router.push("/login");
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-[color:var(--color-bg-hover)] focus-ring"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <div
          className="flex items-center justify-center rounded-full bg-[color:var(--color-primary-100)]"
          style={{ width: "32px", height: "32px" }}
          aria-hidden
        >
          <UserIcon className="w-4 h-4 text-[color:var(--color-primary-700)]" />
        </div>
        <span className="text-sm hide-mobile">{mockUser.name}</span>
      </button>

      {/* Dropdown */}
      <div
        className={cn(
          "absolute right-0 mt-2 w-48 rounded-md border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-card)] shadow-xl",
          open ? "block" : "hidden"
        )}
        role="menu"
        aria-label="Menú de usuario"
      >
        <div className="px-3 py-2 text-xs text-[color:var(--color-text-muted)]">
          {mockUser.email}
        </div>
        <div className="h-px bg-[color:var(--color-border-light)]" />
        <button
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[color:var(--color-bg-hover)]"
          disabled
        >
          <UserIcon className="w-4 h-4" />
          Mi Perfil
        </button>
        <button
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[color:var(--color-bg-hover)]"
          disabled
        >
          <UserIcon className="w-4 h-4" />
          Configuración
        </button>
        <div className="h-px bg-[color:var(--color-border-light)]" />
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[color:var(--color-bg-hover)] text-[color:var(--color-danger-700)]"
        >
          <LogOutIcon className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

/**
 * Header con hamburguesa (móvil), breadcrumbs y menú usuario
 */
export function Header({
  onOpenMobile,
}: {
  onOpenMobile: () => void;
}) {
  return (
    <header
      className="w-full h-[var(--header-height)] bg-[color:var(--color-bg-header)] border-b border-[color:var(--color-border-light)] flex items-center justify-between px-4 container-padding"
      role="banner"
    >
      <div className="flex items-center gap-3">
        {/* Botón hamburguesa visible en móvil/tablet */}
        <button
          type="button"
          className="p-2 rounded-md hover:bg-[color:var(--color-bg-hover)] hide-desktop"
          aria-label="Abrir menú de navegación"
          onClick={onOpenMobile}
        >
          <MenuIcon className="w-5 h-5" aria-hidden />
        </button>
        <Breadcrumbs />
      </div>

      <UserMenu />
    </header>
  );
}

/**
 * ProtectedShell: contenedor de layout para páginas protegidas
 * - Maneja estado de sidebar (colapsable) y overlay móvil
 * - Se usa dentro de /app/(protected)/layout.tsx
 */
export function ProtectedShell({ children }: { children: React.ReactNode }) {
  // Inicializa el estado desde localStorage (SSR-safe)
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      const saved = localStorage.getItem("sidebar-collapsed");
      return saved === "true";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Persistir estado de colapsado en localStorage
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar-collapsed", String(collapsed));
      }
    } catch {
      // noop
    }
  }, [collapsed]);

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-app)] text-[color:var(--color-text-primary)]">
      <div className="flex">
        {/* Sidebar Desktop */}
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />
        {/* Contenedor principal */}
        <div className="flex-1 min-w-0">
          <Header onOpenMobile={() => setMobileOpen(true)} />
          <main className="container-padding py-6">{children}</main>
          <footer className="h-[var(--footer-height)] flex items-center justify-center text-xs text-[color:var(--color-text-muted)]">
            © 2024 Sistema de Gestión de Emails | Versión 1.0 (MVP)
          </footer>
        </div>
      </div>

      {/* Sidebar móvil */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}