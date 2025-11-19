"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navigationItems } from "@/lib/mock-data/navigation";
import {
  Home as HomeIcon,
  Mail as MailIcon,
  Columns as ColumnsIcon,
  Menu as MenuIcon,
  X as XIcon,
  Brain as BrainIcon,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  LogOut as LogOutIcon,
} from "lucide-react";
import Button from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession, signOut } from "next-auth/react";

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
  | "LogOut"
  | "Brain";

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
    case "Brain":
      return <BrainIcon className={className} aria-hidden />;
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
        <Image
          src="/logo.svg"
          alt="Email Kanban Logo"
          width={32}
          height={32}
          className="w-8 h-8"
          priority
        />
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
                    className={cn(
                      "w-5 h-5 shrink-0 sidebar-nav-icon",
                      !collapsed && "mr-3"
                    )}
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
        <Button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className="w-full"
          leftIcon={<Lucide name={collapsed ? "ChevronRight" : "ChevronLeft"} />}
        >
          {collapsed ? <span className="sr-only">Expandir sidebar</span> : "Colapsar"}
        </Button>
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
            <Image
              src="/logo.svg"
              alt="Email Kanban Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <h2 className="text-sm font-semibold text-[color:var(--color-text-primary)]">
              Email Kanban
            </h2>
          </div>
          <Button
            type="button"
            onClick={onClose}
            aria-label="Cerrar menú"
            variant="ghost"
            size="icon"
            leftIcon={<Lucide name="X" />}
          >
            Cerrar menú
          </Button>
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
                    <Lucide
                      name={iconName}
                      className="w-5 h-5 mr-3 shrink-0 sidebar-nav-icon"
                    />
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
 * Utilidad: iniciales del usuario para el avatar
 */
function getUserInitials(nameOrEmail?: string | null): string {
  if (!nameOrEmail) return "U";

  const trimmed = nameOrEmail.trim();
  if (!trimmed) return "U";

  const parts = trimmed.split(" ");
  if (parts.length === 1) {
    // Si es un email, intentar usar la primera letra antes de "@"
    const atIndex = trimmed.indexOf("@");
    if (atIndex > 0) {
      return trimmed[0]?.toUpperCase() ?? "U";
    }
    return trimmed[0]?.toUpperCase() ?? "U";
  }

  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return `${first ?? "U"}${last ?? ""}`.toUpperCase();
}

/**
 * Menú de Usuario (basado en sesión de NextAuth)
 */
function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);

  const isLoading = status === "loading";
  const displayName =
    session?.user?.name ?? session?.user?.email ?? "Usuario";
  const displayEmail = session?.user?.email ?? "Sin email";
  const initials = getUserInitials(session?.user?.name || session?.user?.email);

  async function handleLogout() {
    setOpen(false);
    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <div className="flex items-center gap-2">
      {/* Selector de Tema */}
      <ThemeToggle />

      {/* Menú de Usuario */}
      <div className="relative">
        <Button
          type="button"
          onClick={() => setOpen((v) => !v)}
          variant="ghost"
          size="sm"
          className="px-2 py-1"
          aria-haspopup="menu"
          aria-expanded={open}
          disabled={isLoading}
          leftIcon={
            <div
              className="flex items-center justify-center rounded-full bg-[color:var(--color-primary-100)]"
              style={{ width: "32px", height: "32px" }}
              aria-hidden
            >
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-medium text-[color:var(--color-primary-700)]">
                  {initials}
                </span>
              )}
            </div>
          }
        >
          <span className="text-sm hide-mobile">
            {isLoading ? "Cargando..." : displayName}
          </span>
        </Button>

        {/* Dropdown */}
        <div
          className={cn(
            "absolute z-50 right-0 mt-2 w-48 rounded-md border border-[color:var(--color-border-light)] bg-[color:var(--color-bg-card)] shadow-xl animate-slide-down",
            open ? "block" : "hidden"
          )}
          role="menu"
          aria-label="Menú de usuario"
        >
          <div className="px-3 py-2 text-xs text-[color:var(--color-text-muted)]">
            {displayEmail}
          </div>
          <div className="h-px bg-[color:var(--color-border-light)]" />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            disabled
            leftIcon={<UserIcon className="w-4 h-4" />}
          >
            Mi Perfil
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2"
            disabled
            leftIcon={<UserIcon className="w-4 h-4" />}
          >
            Configuración
          </Button>
          <div className="h-px bg-[color:var(--color-border-light)]" />
          <Button
            type="button"
            onClick={handleLogout}
            variant="destructive"
            size="sm"
            className="w-full justify-start gap-2"
            leftIcon={<LogOutIcon className="w-4 h-4" />}
          >
            Cerrar Sesión
          </Button>
        </div>

        {/* Overlay para cerrar */}
        {open && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}
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
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hide-desktop"
          aria-label="Abrir menú de navegación"
          onClick={onOpenMobile}
          leftIcon={<MenuIcon className="w-5 h-5" aria-hidden />}
        >
          Abrir menú
        </Button>
        <Breadcrumbs />
      </div>

      <UserMenu />
    </header>
  );
}

/**
 * Hook personalizado para manejar el estado del sidebar con localStorage
 */
function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(() => {
    // Valor por defecto consistente para SSR y CSR
    return false;
  });

  const isInitialized = useRef(false);

  // Sincronizar con localStorage solo una vez después del montaje inicial
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      
      try {
        const saved = localStorage.getItem("sidebar-collapsed");
        if (saved !== null && saved !== "false") {
          // Usar setTimeout para evitar sincronizar durante el renderizado del efecto
          setTimeout(() => {
            setCollapsed(saved === "true");
          }, 0);
        }
      } catch {
        // localStorage no disponible, mantener valor por defecto
      }
    }
  }, []); // Solo ejecutar una vez

  // Persistir cambios en localStorage
  useEffect(() => {
    if (isInitialized.current) {
      try {
        localStorage.setItem("sidebar-collapsed", String(collapsed));
      } catch {
        // localStorage no disponible, no persistir
      }
    }
  }, [collapsed]);

  return [collapsed, setCollapsed] as const;
}

/**
 * ProtectedShell: contenedor de layout para páginas protegidas
 * - Maneja estado de sidebar (colapsable) y overlay móvil
 * - Se usa dentro de /app/(protected)/layout.tsx
 */
export function ProtectedShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useSidebarCollapsed();

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-app)] text-[color:var(--color-text-primary)]">
      <div className="flex">
        {/* Sidebar Desktop */}
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />
        {/* Contenedor principal */}
        <div className="flex-1 min-w-0 ">
          <Header onOpenMobile={() => setMobileOpen(true)} />
          <main className="container-padding py-6">{children}</main>
          {/*
                    <footer className="h-[var(--footer-height)] flex items-center justify-center text-xs text-[color:var(--color-text-muted)]">
            © 2025 Sistema de Gestión de Emails | Versión 1.0
          </footer>
          
          */}

        </div>
      </div>

      {/* Sidebar móvil */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </div>
  );
}
