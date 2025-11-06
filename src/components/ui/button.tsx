"use client";

import React, { forwardRef, useMemo } from "react";
import { Loader2 } from "lucide-react";

/**
 * Utilidad local para unir clases sin dependencias externas (clsx/twMerge).
 */
function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export type ButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "link"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /**
   * Variante visual del botón.
   */
  variant?: ButtonVariant;
  /**
   * Tamaño del botón.
   */
  size?: ButtonSize;
  /**
   * Renderiza a través del hijo (ej. Next.js <Link>) preservando semántica y estilos.
   * Ejemplo:
   *  <Button asChild>
   *    <Link href="/emails">Ir a Emails</Link>
   *  </Button>
   */
  asChild?: boolean;
  /**
   * Estado de carga. Deshabilita el botón, muestra spinner y aria-busy.
   */
  loading?: boolean;
  /**
   * Ícono opcional a la izquierda.
   */
  leftIcon?: React.ReactNode;
  /**
   * Ícono opcional a la derecha.
   */
  rightIcon?: React.ReactNode;
}

/**
 * Mapea variantes a clases basadas en el tema actual (src/app/globals.css).
 * Se usan variables CSS para asegurar consistencia con el sistema de diseño.
 */
function getVariantClasses(variant: ButtonVariant) {
  switch (variant) {
    case "primary":
      return "bg-[color:var(--color-primary-500)] text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-primary-600)] active:bg-[color:var(--color-primary-700)]";
    case "secondary":
      return "bg-[color:var(--color-bg-muted)] text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-neutral-200)] active:bg-[color:var(--color-neutral-300)]";
    case "outline":
      return "border border-[color:var(--color-border-default)] bg-transparent text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-hover)] active:bg-[color:var(--color-neutral-200)]";
    case "ghost":
      return "bg-transparent text-[color:var(--color-text-primary)] hover:bg-[color:var(--color-bg-hover)] active:bg-[color:var(--color-neutral-200)]";
    case "link":
      return "bg-transparent text-[color:var(--color-text-link)] hover:text-[color:var(--color-text-link-hover)] underline-offset-4 hover:underline";
    case "destructive":
      return "bg-[color:var(--color-danger-500)] text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-danger-600)] active:bg-[color:var(--color-danger-700)]";
    case "default":
    default:
      return "bg-[color:var(--color-primary-500)] text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-primary-600)] active:bg-[color:var(--color-primary-700)]";
  }
}

/**
 * Mapea tamaños a clases (usa tokens del diseño definidos en globals.css).
 */
function getSizeClasses(size: ButtonSize) {
  switch (size) {
    case "sm":
      return "h-[var(--button-height-sm)] px-[var(--button-padding-x-sm)] text-[length:var(--font-size-sm)]";
    case "lg":
      return "h-[var(--button-height-lg)] px-[var(--button-padding-x-lg)] text-[length:var(--font-size-lg)]";
    case "icon":
      return "h-[var(--button-height-md)] w-[var(--button-height-md)] p-0";
    case "md":
    default:
      return "h-[var(--button-height-md)] px-[var(--button-padding-x-md)] text-[length:var(--font-size-base)]";
  }
}

/**
 * Spinner para estado de carga.
 */
function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      aria-hidden
      className={cn(
        "animate-spin",
        // Asegura contraste en todas las variantes (texto actual)
        "text-current",
        className
      )}
    />
  );
}

/**
 * Button de shadcn/ui alineado al sistema de diseño.
 * - Variantes: default, primary, secondary, outline, ghost, link, destructive
 * - Tamaños: sm, md, lg, icon
 * - Estados: hover, focus (focus-ring), active, disabled, loading
 * - Accesibilidad: aria-busy, aria-live, aria-disabled, soporte teclado
 * - asChild: para envolver <Link> y preservar semántica de ancla
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "md",
      asChild = false,
      loading = false,
      disabled,
      type,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseClasses =
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md transition-colors focus-ring disabled:opacity-[var(--opacity-disabled)] disabled:pointer-events-none select-none";

    const variantClasses = getVariantClasses(variant);
    const sizeClasses = getSizeClasses(size);

    const composedClassName = cn(baseClasses, variantClasses, sizeClasses, className);

    // Asegura type="button" por defecto para evitar submits accidentales
    const resolvedType = useMemo(() => {
      if (type) return type;
      return "button";
    }, [type]);

    // asChild: clona el hijo (ej. <Link>) inyectando clases y atributos ARIA
    if (asChild && React.isValidElement(children)) {
      type ChildProps = {
        className?: string;
        onClick?: (e: React.MouseEvent) => void;
        children?: React.ReactNode;
      };
      const child = children as React.ReactElement<ChildProps>;
      const { className: childClassName, onClick: childOnClick, children: childContent } = child.props ?? {};

      const childProps: Record<string, unknown> = {
        className: cn(childClassName, composedClassName),
        "aria-busy": loading || undefined,
        "aria-live": loading ? "polite" : undefined,
        "data-variant": variant,
        "data-size": size,
        // no forzamos role para respetar semántica de <a>
        onClick: (e: React.MouseEvent) => {
          if (isDisabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          if (typeof childOnClick === "function") {
            childOnClick(e);
          }
        },
      };

      return React.cloneElement(
        child,
        childProps,
        <>
          {loading && <Spinner className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />}
          {!loading && leftIcon}
          <span className={size === "icon" ? "sr-only" : undefined}>{childContent ?? null}</span>
          {!loading && rightIcon}
        </>
      );
    }

    // Caso normal: botón nativo
    return (
      <button
        ref={ref}
        type={resolvedType as "button" | "submit" | "reset"}
        className={composedClassName}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        aria-live={loading ? "polite" : undefined}
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {loading && <Spinner className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />}
        {!loading && leftIcon}
        <span className={size === "icon" ? "sr-only" : undefined}>{children}</span>
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;