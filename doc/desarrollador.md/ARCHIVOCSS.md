/* ================================================================
  SISTEMA DE DISEÑO COMPLETO - EMAIL MANAGEMENT SYSTEM v2.0
  Basado en paleta de colores de referencia #607e9d
  
  Este archivo centraliza TODOS los tokens de diseño:
  - Colores (primarios, semánticos, de dominio)
  - Espaciado (spacing scale)
  - Tipografía (tamaños, pesos, line-heights)
  - Sombras y bordes
  - Breakpoints responsive
  - Animaciones
  
  Uso: Importar estos tokens en toda la aplicación mediante
  var(--nombre-variable) o clases utility de Tailwind personalizadas.
  ================================================================
*/

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* ============================================
     * PALETA DE COLORES BASE
     * Generada a partir de: #607e9d (Slate Blue)
     * ============================================ */

    /* ============================================
     * COLORES PRIMARIOS - SLATE BLUE
     * Usado para: UI principal, enlaces, foco, categoría "Cliente"
     * Base: #607e9d
     * ============================================ */
    --color-primary-50: #f4f7fa;
    --color-primary-100: #e8eef5;
    --color-primary-200: #d1dde9;
    --color-primary-300: #aac2d8;
    --color-primary-400: #7da0c3;
    --color-primary-500: #607e9d;    /* BASE - Color principal del diseño */
    --color-primary-600: #4f6a84;
    --color-primary-700: #43596f;
    --color-primary-800: #3a4c5d;
    --color-primary-900: #33414f;
    --color-primary-950: #1f2834;

    /* ============================================
     * COLORES SECUNDARIOS - ESMERALDA (Lead / Éxito)
     * Usado para: Acciones positivas, "Lead", estados "success"
     * Paleta armonizada
     * ============================================ */
    --color-secondary-50: #ecfdf5;
    --color-secondary-100: #d1fae5;
    --color-secondary-200: #a7f3d0;
    --color-secondary-300: #6ee7b7;
    --color-secondary-400: #34d399;
    --color-secondary-500: #10b981;
    --color-secondary-600: #059669;
    --color-secondary-700: #047857;
    --color-secondary-800: #065f46;
    --color-secondary-900: #064e3b;
    --color-secondary-950: #022c22;

    /* ============================================
     * COLORES DE PELIGRO - ROJO (Spam / Prioridad Alta / Error)
     * Usado para: Acciones destructivas, alertas, "Spam"
     * Semilla: #ff646a
     * ============================================ */
    --color-danger-50: #fff5f5;
    --color-danger-100: #ffe8e9;
    --color-danger-200: #ffd2d4;
    --color-danger-300: #ffb2b5;
    --color-danger-400: #ff898e;
    --color-danger-500: #ff646a; /* Semilla Identificada */
    --color-danger-600: #e85258;
    --color-danger-700: #c34147;
    --color-danger-800: #a1353a;
    --color-danger-900: #862f33;
    --color-danger-950: #491416;

    /* ============================================
     * COLORES DE ADVERTENCIA - AMBER
     * Usado para: Alertas no críticas, categoría "Prioridad Media"
     * Complementario cálido con la paleta fría
     * ============================================ */
    --color-warning-50: #fffbeb;
    --color-warning-100: #fef3c7;
    --color-warning-200: #fde68a;
    --color-warning-300: #fcd34d;
    --color-warning-400: #fbbf24;
    --color-warning-500: #f59e0b;     /* Amarillo advertencia */
    --color-warning-600: #d97706;
    --color-warning-700: #b45309;
    --color-warning-800: #92400e;
    --color-warning-900: #78350f;
    --color-warning-950: #451a03;

    /* ============================================
     * COLORES NEUTRALES - COOL GRAY
     * Usado para: Texto, fondos, bordes, categorías "Interno" y "Baja"
     * Base: #7f8c8d y #3b3b3b (del diseño)
     * ============================================ */
    --color-neutral-50: #f8f8f8;      /* BASE - Header bg del diseño */
    --color-neutral-100: #f1f3f4;
    --color-neutral-200: #e4e7e9;
    --color-neutral-300: #cfd3d6;
    --color-neutral-400: #a8afb3;
    --color-neutral-500: #7f8c8d;     /* BASE - Gris medio del diseño */
    --color-neutral-600: #6b7779;
    --color-neutral-700: #596366;
    --color-neutral-800: #4d5557;
    --color-neutral-900: #3b3b3b;     /* BASE - Texto oscuro del diseño */
    --color-neutral-950: #1a1a1a;

    /* ============================================
     * COLORES DE FONDO (BACKGROUNDS)
     * ============================================ */
    --color-bg-app: #ffffff;                       /* BASE - Fondo principal (blanco) */
    --color-bg-card: #ffffff;                      /* Fondo de Cards, Modales */
    --color-bg-header: #f8f8f8;                    /* BASE - Header del diseño */
    --color-bg-sidebar: #ffffff;                   /* Sidebar background */
    --color-bg-hover: var(--color-neutral-50);     /* Hover genérico */
    --color-bg-active: var(--color-primary-50);    /* Estado activo */
    --color-bg-disabled: var(--color-neutral-100); /* Elementos deshabilitados */
    --color-bg-overlay: rgba(59, 59, 59, 0.6);     /* Overlay de modales */
    --color-bg-muted: var(--color-neutral-50);     /* Fondos sutiles */

    /* ============================================
     * COLORES DE TEXTO - Jerarquía Tipográfica
     * ============================================ */
    --color-text-primary: #3b3b3b;                 /* BASE - Texto principal oscuro */
    --color-text-secondary: var(--color-neutral-700); /* Texto secundario */
    --color-text-muted: var(--color-neutral-500);  /* Metadata, ayuda */
    --color-text-placeholder: var(--color-neutral-400);
    --color-text-disabled: var(--color-neutral-400);
    --color-text-inverse: #ffffff;                 /* Texto sobre fondos oscuros */
    --color-text-link: var(--color-primary-600);   /* Enlaces */
    --color-text-link-hover: var(--color-primary-700);

    /* ============================================
     * BORDES Y DIVISORES
     * ============================================ */
    --color-border-light: var(--color-neutral-200);    /* Bordes sutiles */
    --color-border-default: var(--color-neutral-300);  /* Bordes estándar */
    --color-border-strong: var(--color-neutral-400);   /* Bordes destacados */
    --color-border-hover: var(--color-neutral-400);
    --color-border-focus: var(--color-primary-500);    /* Anillo de foco */
    --color-border-error: var(--color-danger-500);
    --color-border-success: var(--color-secondary-500);

    /* ============================================
     * ESTADOS DEL SISTEMA (SEMÁNTICOS)
     * ============================================ */
    --color-success: var(--color-secondary-600);
    --color-success-light: var(--color-secondary-100);
    --color-success-text: var(--color-secondary-800);

    --color-warning: var(--color-warning-500);
    --color-warning-light: var(--color-warning-100);
    --color-warning-text: var(--color-warning-800);

    --color-error: var(--color-danger-500);
    --color-error-light: var(--color-danger-100);
    --color-error-text: var(--color-danger-800);

    --color-info: var(--color-primary-600);
    --color-info-light: var(--color-primary-100);
    --color-info-text: var(--color-primary-800);

    /* ============================================
     * COLORES DE DOMINIO - Email Management System
     * ============================================ */
    
    /* Categorías de Email */
    --color-categoria-cliente-bg: var(--color-primary-100);
    --color-categoria-cliente-text: var(--color-primary-800);
    --color-categoria-cliente-border: var(--color-primary-200);
    
    --color-categoria-lead-bg: var(--color-secondary-100);
    --color-categoria-lead-text: var(--color-secondary-800);
    --color-categoria-lead-border: var(--color-secondary-200);
    
    --color-categoria-interno-bg: var(--color-neutral-100);
    --color-categoria-interno-text: var(--color-neutral-800);
    --color-categoria-interno-border: var(--color-neutral-200);
    
    --color-categoria-spam-bg: var(--color-danger-100);
    --color-categoria-spam-text: var(--color-danger-800);
    --color-categoria-spam-border: var(--color-danger-200);
    
    /* Prioridades de Tareas */
    --color-prioridad-alta-bg: var(--color-danger-100);
    --color-prioridad-alta-text: var(--color-danger-800);
    --color-prioridad-alta-border: var(--color-danger-200);
    
    --color-prioridad-media-bg: var(--color-warning-100);
    --color-prioridad-media-text: var(--color-warning-800);
    --color-prioridad-media-border: var(--color-warning-200);
    
    --color-prioridad-baja-bg: var(--color-neutral-100);
    --color-prioridad-baja-text: var(--color-neutral-700);
    --color-prioridad-baja-border: var(--color-neutral-200);

    /* Estados de Tarea (Kanban) */
    --color-estado-todo-bg: var(--color-primary-100);
    --color-estado-todo-text: var(--color-primary-800);
    
    --color-estado-doing-bg: var(--color-warning-100);
    --color-estado-doing-text: var(--color-warning-800);
    
    --color-estado-done-bg: var(--color-secondary-100);
    --color-estado-done-text: var(--color-secondary-800);

    /* Estados de Procesamiento */
    --color-procesado-bg: var(--color-secondary-100);
    --color-procesado-text: var(--color-secondary-800);
    
    --color-sin-procesar-bg: var(--color-neutral-100);
    --color-sin-procesar-text: var(--color-neutral-700);

    /* ============================================
     * ESPACIADO (SPACING SCALE)
     * Base: múltiplos de 4px
     * ============================================ */
    --space-0: 0;
    --space-1: 0.25rem;    /* 4px */
    --space-2: 0.5rem;     /* 8px */
    --space-3: 0.75rem;    /* 12px */
    --space-4: 1rem;       /* 16px - Spacing estándar */
    --space-5: 1.25rem;    /* 20px */
    --space-6: 1.5rem;     /* 24px */
    --space-8: 2rem;       /* 32px */
    --space-10: 2.5rem;    /* 40px */
    --space-12: 3rem;      /* 48px */
    --space-16: 4rem;      /* 64px */
    --space-20: 5rem;      /* 80px */
    --space-24: 6rem;      /* 96px */

    /* Spacing Semántico */
    --space-xs: var(--space-1);
    --space-sm: var(--space-2);
    --space-md: var(--space-4);
    --space-lg: var(--space-6);
    --space-xl: var(--space-8);
    --space-2xl: var(--space-12);
    --space-3xl: var(--space-16);

    /* ============================================
     * TIPOGRAFÍA
     * Font Family: Inter (default de shadcn/ui)
     * ============================================ */
    --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-family-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;

    /* Font Sizes */
    --font-size-xs: 0.6875rem;   /* 11px - Uso excepcional */
    --font-size-sm: 0.875rem;    /* 14px - Texto estándar, labels */
    --font-size-base: 1rem;      /* 16px - Body large */
    --font-size-lg: 1.125rem;    /* 18px - Subtítulos secundarios */
    --font-size-xl: 1.25rem;     /* 20px - Títulos de cards */
    --font-size-2xl: 1.5rem;     /* 24px - Subtítulos importantes */
    --font-size-3xl: 1.875rem;   /* 30px - Títulos principales */
    --font-size-4xl: 2.25rem;    /* 36px - Display */
    --font-size-5xl: 3rem;       /* 48px - Hero */

    /* Font Weights */
    --font-weight-light: 300;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    --font-weight-extrabold: 800;

    /* Line Heights */
    --line-height-none: 1;
    --line-height-tight: 1.25;
    --line-height-snug: 1.375;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.625;
    --line-height-loose: 2;

    /* Letter Spacing */
    --letter-spacing-tighter: -0.05em;
    --letter-spacing-tight: -0.025em;
    --letter-spacing-normal: 0;
    --letter-spacing-wide: 0.025em;
    --letter-spacing-wider: 0.05em;
    --letter-spacing-widest: 0.1em;

    /* ============================================
     * RADIOS (BORDER RADIUS)
     * ============================================ */
    --radius-none: 0;
    --radius-sm: 0.25rem;      /* 4px */
    --radius-base: 0.375rem;   /* 6px - Default de shadcn */
    --radius-md: 0.5rem;       /* 8px */
    --radius-lg: 0.75rem;      /* 12px */
    --radius-xl: 1rem;         /* 16px */
    --radius-2xl: 1.5rem;      /* 24px */
    --radius-full: 9999px;     /* Círculo completo */

    /* ============================================
     * SOMBRAS (SHADOWS)
     * ============================================ */
    --shadow-xs: 0 1px 2px 0 rgba(59, 59, 59, 0.05);
    --shadow-sm: 0 1px 3px 0 rgba(59, 59, 59, 0.1), 0 1px 2px -1px rgba(59, 59, 59, 0.1);
    --shadow-md: 0 4px 6px -1px rgba(59, 59, 59, 0.1), 0 2px 4px -2px rgba(59, 59, 59, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(59, 59, 59, 0.1), 0 4px 6px -4px rgba(59, 59, 59, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(59, 59, 59, 0.1), 0 8px 10px -6px rgba(59, 59, 59, 0.1);
    --shadow-2xl: 0 25px 50px -12px rgba(59, 59, 59, 0.25);
    --shadow-inner: inset 0 2px 4px 0 rgba(59, 59, 59, 0.05);
    
    /* Sombras específicas */
    --shadow-card: var(--shadow-sm);
    --shadow-card-hover: var(--shadow-lg);
    --shadow-dropdown: var(--shadow-xl);
    --shadow-modal: var(--shadow-2xl);

    /* ============================================
     * TAMAÑOS DE COMPONENTES
     * ============================================ */
    
    /* Buttons */
    --button-height-sm: 2rem;      /* 32px */
    --button-height-md: 2.5rem;    /* 40px */
    --button-height-lg: 3rem;      /* 48px */
    --button-padding-x-sm: var(--space-3);
    --button-padding-x-md: var(--space-4);
    --button-padding-x-lg: var(--space-6);

    /* Inputs */
    --input-height-sm: 2rem;       /* 32px */
    --input-height-md: 2.5rem;     /* 40px */
    --input-height-lg: 3rem;       /* 48px */
    --input-padding-x: var(--space-3);
    --input-padding-y: var(--space-2);

    /* Cards */
    --card-padding-sm: var(--space-4);
    --card-padding-md: var(--space-6);
    --card-padding-lg: var(--space-8);

    /* Badges */
    --badge-height: 1.25rem;       /* 20px */
    --badge-padding-x: var(--space-2);
    --badge-padding-y: var(--space-1);

    /* Avatars */
    --avatar-size-xs: 1.5rem;      /* 24px */
    --avatar-size-sm: 2rem;        /* 32px */
    --avatar-size-md: 2.5rem;      /* 40px */
    --avatar-size-lg: 3rem;        /* 48px */
    --avatar-size-xl: 4rem;        /* 64px */

    /* Icons */
    --icon-size-xs: 0.875rem;      /* 14px */
    --icon-size-sm: 1rem;          /* 16px */
    --icon-size-md: 1.25rem;       /* 20px */
    --icon-size-lg: 1.5rem;        /* 24px */
    --icon-size-xl: 2rem;          /* 32px */

    /* ============================================
     * LAYOUT - Sidebar y Container
     * ============================================ */
    --sidebar-width-expanded: 250px;
    --sidebar-width-collapsed: 60px;
    --sidebar-width-mobile: 280px;
    
    --header-height: 4rem;         /* 64px */
    --footer-height: 3rem;         /* 48px */
    
    --container-max-width-sm: 640px;
    --container-max-width-md: 768px;
    --container-max-width-lg: 1024px;
    --container-max-width-xl: 1280px;
    --container-max-width-2xl: 1536px;
    --container-max-width-full: 1920px;

    /* ============================================
     * BREAKPOINTS (para uso en JS)
     * ============================================ */
    --breakpoint-sm: 640px;
    --breakpoint-md: 768px;
    --breakpoint-lg: 1024px;
    --breakpoint-xl: 1280px;
    --breakpoint-2xl: 1536px;

    /* ============================================
     * Z-INDEX SCALE
     * ============================================ */
    --z-index-dropdown: 1000;
    --z-index-sticky: 1020;
    --z-index-fixed: 1030;
    --z-index-modal-backdrop: 1040;
    --z-index-modal: 1050;
    --z-index-popover: 1060;
    --z-index-tooltip: 1070;

    /* ============================================
     * DURACIONES DE ANIMACIÓN
     * ============================================ */
    --duration-fast: 100ms;
    --duration-base: 200ms;
    --duration-slow: 300ms;
    --duration-slower: 500ms;

    /* ============================================
     * TIMING FUNCTIONS (EASING)
     * ============================================ */
    --ease-linear: linear;
    --ease-in: cubic-bezier(0.4, 0, 1, 1);
    --ease-out: cubic-bezier(0, 0, 0.2, 1);
    --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
    --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

    /* ============================================
     * OPACIDADES
     * ============================================ */
    --opacity-disabled: 0.5;
    --opacity-muted: 0.7;
    --opacity-hover: 0.9;
    --opacity-overlay: 0.6;

    /* ============================================
     * BLUR
     * ============================================ */
    --blur-sm: 4px;
    --blur-md: 8px;
    --blur-lg: 16px;
    --blur-xl: 24px;
  }

  /* ============================================
   * DARK MODE (Opcional - para implementación futura)
   * ============================================ */
  .dark {
    --color-bg-app: var(--color-neutral-950);
    --color-bg-card: var(--color-neutral-900);
    --color-bg-header: var(--color-neutral-900);
    --color-bg-hover: var(--color-neutral-800);
    
    --color-text-primary: var(--color-neutral-50);
    --color-text-secondary: var(--color-neutral-300);
    --color-text-muted: var(--color-neutral-500);
    
    --color-border-light: var(--color-neutral-800);
    --color-border-default: var(--color-neutral-700);
    --color-border-strong: var(--color-neutral-600);
  }
}

/* ============================================
 * UTILITY CLASSES PERSONALIZADAS
 * ============================================ */
@layer utilities {
  /* Truncate text */
  .truncate-2-lines {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .truncate-3-lines {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Scroll styling */
  .scrollbar-thin {
    scrollbar-width: thin;
  }

  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: var(--color-neutral-300);
    border-radius: var(--radius-full);
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background-color: var(--color-neutral-100);
  }

  /* Focus visible (accesibilidad) */
  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
    --tw-ring-color: var(--color-border-focus);
  }

  /* Glass morphism effect */
  .glass {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
  }

  /* Gradient backgrounds */
  .gradient-primary {
    background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-700) 100%);
  }

  .gradient-success {
    background: linear-gradient(135deg, var(--color-secondary-500) 0%, var(--color-secondary-700) 100%);
  }

  /* Animation utilities */
  .animate-fade-in {
    animation: fadeIn var(--duration-base) var(--ease-out);
  }

  .animate-slide-up {
    animation: slideUp var(--duration-slow) var(--ease-out);
  }

  .animate-slide-down {
    animation: slideDown var(--duration-slow) var(--ease-out);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      transform: translateY(10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideDown {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
}

/* ============================================
 * ESTILOS BASE GLOBALES
 * ============================================ */
@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-bg-app text-text-primary;
    font-family: var(--font-family-base);
    font-size: var(--font-size-sm);
    line-height: var(--line-height-normal);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold;
    line-height: var(--line-height-tight);
  }

  h1 {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-bold);
  }

  h2 {
    font-size: var(--font-size-2xl);
  }

  h3 {
    font-size: var(--font-size-xl);
  }

  h4 {
    font-size: var(--font-size-lg);
  }

  a {
    color: var(--color-text-link);
    text-decoration: none;
    transition: color var(--duration-base) var(--ease-in-out);
  }

  a:hover {
    color: var(--color-text-link-hover);
  }

  button {
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
  }

  /* Focus visible para accesibilidad */
  :focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
}

/* ============================================
 * CONFIGURACIÓN PARA TAILWIND
 * Estos valores deben sincronizarse con tailwind.config.js
 * ============================================ */
@layer base {
  :root {
    /* Valores necesarios para shadcn/ui */
    --background: 0 0% 100%;
    --foreground: 0 0% 23%;
    
    --card: 0 0% 100%;
    --card-foreground: 0 0% 23%;
    
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 23%;
    
    --primary: 210 34% 50%;        /* #607e9d convertido a HSL */
    --primary-foreground: 0 0% 100%;
    
    --secondary: 142 71% 45%;      /* Verde éxito */
    --secondary-foreground: 0 0% 100%;
    
    --muted: 0 0% 97%;
    --muted-foreground: 0 0% 50%;
    
    --accent: 0 0% 97%;
    --accent-foreground: 0 0% 23%;
    
    --destructive: 0 100% 69%;     /* #ff646a */
    --destructive-foreground: 0 0% 100%;
    
    --border: 0 0% 89%;
    --input: 0 0% 89%;
    --ring: 210 34% 50%;
    
    --radius: 0.375rem;            /* 6px - default de shadcn */
  }

  .dark {
    --background: 0 0% 10%;
    --foreground: 0 0% 97%;
    
    --card: 0 0% 15%;
    --card-foreground: 0 0% 97%;
    
    --popover: 0 0% 10%;
    --popover-foreground: 0 0% 97%;
    
    --primary: 210 34% 50%;
    --primary-foreground: 0 0% 100%;
    
    --secondary: 142 71% 45%;
    --secondary-foreground: 0 0% 100%;
    
    --muted: 0 0% 20%;
    --muted-foreground: 0 0% 60%;
    
    --accent: 0 0% 20%;
    --accent-foreground: 0 0% 97%;
    
    --destructive: 0 100% 69%;
    --destructive-foreground: 0 0% 100%;
    
    --border: 0 0% 30%;
    --input: 0 0% 30%;
    --ring: 210 34% 50%;
  }
}

/* ============================================
 * COMPONENTES PERSONALIZADOS
 * Estilos base para componentes del sistema
 * ============================================ */
@layer components {
  
  /* ============================================
   * BADGES - Componentes de estado
   * ============================================ */
  .badge-categoria-cliente {
    background-color: var(--color-categoria-cliente-bg);
    color: var(--color-categoria-cliente-text);
    border: 1px solid var(--color-categoria-cliente-border);
  }

  .badge-categoria-lead {
    background-color: var(--color-categoria-lead-bg);
    color: var(--color-categoria-lead-text);
    border: 1px solid var(--color-categoria-lead-border);
  }

  .badge-categoria-interno {
    background-color: var(--color-categoria-interno-bg);
    color: var(--color-categoria-interno-text);
    border: 1px solid var(--color-categoria-interno-border);
  }

  .badge-categoria-spam {
    background-color: var(--color-categoria-spam-bg);
    color: var(--color-categoria-spam-text);
    border: 1px solid var(--color-categoria-spam-border);
  }

  .badge-prioridad-alta {
    background-color: var(--color-prioridad-alta-bg);
    color: var(--color-prioridad-alta-text);
    border: 1px solid var(--color-prioridad-alta-border);
  }

  .badge-prioridad-media {
    background-color: var(--color-prioridad-media-bg);
    color: var(--color-prioridad-media-text);
    border: 1px solid var(--color-prioridad-media-border);
  }

  .badge-prioridad-baja {
    background-color: var(--color-prioridad-baja-bg);
    color: var(--color-prioridad-baja-text);
    border: 1px solid var(--color-prioridad-baja-border);
  }

  .badge-estado-todo {
    background-color: var(--color-estado-todo-bg);
    color: var(--color-estado-todo-text);
  }

  .badge-estado-doing {
    background-color: var(--color-estado-doing-bg);
    color: var(--color-estado-doing-text);
  }

  .badge-estado-done {
    background-color: var(--color-estado-done-bg);
    color: var(--color-estado-done-text);
  }

  .badge-procesado {
    background-color: var(--color-procesado-bg);
    color: var(--color-procesado-text);
  }

  .badge-sin-procesar {
    background-color: var(--color-sin-procesar-bg);
    color: var(--color-sin-procesar-text);
  }

  /* ============================================
   * CARDS - Estilos de tarjetas
   * ============================================ */
  .card-base {
    background-color: var(--color-bg-card);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    transition: all var(--duration-base) var(--ease-in-out);
  }

  .card-hover {
    @apply card-base;
  }

  .card-hover:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-2px);
  }

  .card-clickable {
    @apply card-hover cursor-pointer;
  }

  .card-clickable:active {
    transform: translateY(0);
  }

  /* ============================================
   * BUTTONS - Variantes personalizadas
   * ============================================ */
  .btn-base {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    font-weight: var(--font-weight-medium);
    transition: all var(--duration-base) var(--ease-in-out);
    cursor: pointer;
    white-space: nowrap;
  }

  .btn-base:disabled {
    opacity: var(--opacity-disabled);
    cursor: not-allowed;
  }

  .btn-sm {
    height: var(--button-height-sm);
    padding: 0 var(--button-padding-x-sm);
    font-size: var(--font-size-sm);
  }

  .btn-md {
    height: var(--button-height-md);
    padding: 0 var(--button-padding-x-md);
    font-size: var(--font-size-sm);
  }

  .btn-lg {
    height: var(--button-height-lg);
    padding: 0 var(--button-padding-x-lg);
    font-size: var(--font-size-base);
  }

  /* ============================================
   * INPUTS - Estilos de formulario
   * ============================================ */
  .input-base {
    width: 100%;
    border: 1px solid var(--color-border-default);
    border-radius: var(--radius-md);
    background-color: var(--color-bg-card);
    color: var(--color-text-primary);
    font-size: var(--font-size-sm);
    transition: all var(--duration-base) var(--ease-in-out);
  }

  .input-base:focus {
    outline: none;
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 3px rgba(96, 126, 157, 0.1);
  }

  .input-base:disabled {
    background-color: var(--color-bg-disabled);
    cursor: not-allowed;
    opacity: var(--opacity-disabled);
  }

  .input-base::placeholder {
    color: var(--color-text-placeholder);
  }

  .input-error {
    border-color: var(--color-border-error);
  }

  .input-error:focus {
    box-shadow: 0 0 0 3px rgba(255, 100, 106, 0.1);
  }

  /* ============================================
   * TABLE - Estilos de tabla
   * ============================================ */
  .table-base {
    width: 100%;
    border-collapse: collapse;
  }

  .table-header {
    background-color: var(--color-bg-muted);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    text-align: left;
  }

  .table-row {
    border-bottom: 1px solid var(--color-border-light);
    transition: background-color var(--duration-base) var(--ease-in-out);
  }

  .table-row:hover {
    background-color: var(--color-bg-hover);
  }

  .table-row-clickable {
    @apply table-row cursor-pointer;
  }

  .table-cell {
    padding: var(--space-4);
    font-size: var(--font-size-sm);
  }

  /* ============================================
   * SIDEBAR - Navegación lateral
   * ============================================ */
  .sidebar-base {
    width: var(--sidebar-width-expanded);
    height: 100vh;
    background-color: var(--color-bg-card);
    border-right: 1px solid var(--color-border-light);
    transition: width var(--duration-slow) var(--ease-in-out);
  }

  .sidebar-collapsed {
    width: var(--sidebar-width-collapsed);
  }

  .sidebar-nav-item {
    display: flex;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    color: var(--color-text-secondary);
    border-radius: var(--radius-md);
    transition: all var(--duration-base) var(--ease-in-out);
    cursor: pointer;
  }

  .sidebar-nav-item:hover {
    background-color: var(--color-bg-hover);
    color: var(--color-text-primary);
  }

  .sidebar-nav-item-active {
    background-color: var(--color-bg-active);
    color: var(--color-primary-700);
    font-weight: var(--font-weight-medium);
    border-left: 3px solid var(--color-primary-500);
  }

  /* ============================================
   * HEADER - Barra superior
   * ============================================ */
  .header-base {
    height: var(--header-height);
    background-color: var(--color-bg-header);
    border-bottom: 1px solid var(--color-border-light);
    display: flex;
    align-items: center;
    padding: 0 var(--space-6);
    position: sticky;
    top: 0;
    z-index: var(--z-index-sticky);
  }

  /* ============================================
   * MODAL / DIALOG - Modales
   * ============================================ */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: var(--color-bg-overlay);
    z-index: var(--z-index-modal-backdrop);
    animation: fadeIn var(--duration-base) var(--ease-out);
  }

  .modal-content {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--color-bg-card);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-modal);
    z-index: var(--z-index-modal);
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp var(--duration-slow) var(--ease-out);
  }

  /* ============================================
   * TOAST / NOTIFICATION - Notificaciones
   * ============================================ */
  .toast-base {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    font-size: var(--font-size-sm);
    animation: slideDown var(--duration-slow) var(--ease-bounce);
  }

  .toast-success {
    @apply toast-base;
    background-color: var(--color-success-light);
    color: var(--color-success-text);
    border-left: 4px solid var(--color-success);
  }

  .toast-error {
    @apply toast-base;
    background-color: var(--color-error-light);
    color: var(--color-error-text);
    border-left: 4px solid var(--color-error);
  }

  .toast-warning {
    @apply toast-base;
    background-color: var(--color-warning-light);
    color: var(--color-warning-text);
    border-left: 4px solid var(--color-warning);
  }

  .toast-info {
    @apply toast-base;
    background-color: var(--color-info-light);
    color: var(--color-info-text);
    border-left: 4px solid var(--color-info);
  }

  /* ============================================
   * EMPTY STATE - Estados vacíos
   * ============================================ */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-12) var(--space-6);
    text-align: center;
  }

  .empty-state-icon {
    width: var(--icon-size-xl);
    height: var(--icon-size-xl);
    color: var(--color-text-muted);
    opacity: 0.5;
    margin-bottom: var(--space-4);
  }

  .empty-state-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin-bottom: var(--space-2);
  }

  .empty-state-description {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    max-width: 400px;
    margin-bottom: var(--space-6);
  }

  /* ============================================
   * LOADING / SKELETON - Estados de carga
   * ============================================ */
  .skeleton {
    background: linear-gradient(
      90deg,
      var(--color-neutral-200) 0%,
      var(--color-neutral-100) 50%,
      var(--color-neutral-200) 100%
    );
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s ease-in-out infinite;
    border-radius: var(--radius-md);
  }

  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .spinner {
    display: inline-block;
    width: var(--icon-size-md);
    height: var(--icon-size-md);
    border: 2px solid var(--color-border-light);
    border-top-color: var(--color-primary-500);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ============================================
   * KANBAN - Tablero específico
   * ============================================ */
  .kanban-board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
    padding: var(--space-6);
  }

  .kanban-column {
    background-color: var(--color-bg-muted);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    min-height: 400px;
  }

  .kanban-column-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-4);
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-base);
  }

  .kanban-card {
    @apply card-base;
    padding: var(--space-4);
    margin-bottom: var(--space-3);
    cursor: grab;
  }

  .kanban-card:active {
    cursor: grabbing;
    transform: rotate(2deg);
  }

  .kanban-card:hover {
    box-shadow: var(--shadow-md);
  }

  /* ============================================
   * EMAIL CARD - Tarjetas de email
   * ============================================ */
  .email-card {
    @apply card-clickable;
    padding: var(--space-4);
  }

  .email-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-2);
  }

  .email-card-from {
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-sm);
    color: var(--color-text-primary);
  }

  .email-card-date {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
  }

  .email-card-subject {
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-base);
    color: var(--color-text-primary);
    margin-bottom: var(--space-2);
    @apply truncate-2-lines;
  }

  .email-card-body {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-3);
    @apply truncate-3-lines;
  }

  .email-card-footer {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  /* ============================================
   * METRIC CARD - Tarjetas de métricas
   * ============================================ */
  .metric-card {
    @apply card-hover;
    padding: var(--space-6);
    position: relative;
    overflow: hidden;
  }

  .metric-card-icon {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    width: var(--icon-size-xl);
    height: var(--icon-size-xl);
    color: var(--color-primary-300);
    opacity: 0.3;
  }

  .metric-card-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-muted);
    margin-bottom: var(--space-2);
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing-wide);
  }

  .metric-card-value {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
    color: var(--color-text-primary);
    line-height: var(--line-height-tight);
  }

  .metric-card-description {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    margin-top: var(--space-2);
  }

  /* ============================================
   * BREADCRUMBS - Migas de pan
   * ============================================ */
  .breadcrumbs {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .breadcrumbs-separator {
    color: var(--color-text-muted);
  }

  .breadcrumbs-item {
    color: var(--color-text-secondary);
  }

  .breadcrumbs-item:hover {
    color: var(--color-text-primary);
  }

  .breadcrumbs-item-active {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-medium);
  }

  /* ============================================
   * AVATAR - Avatares de usuario
   * ============================================ */
  .avatar-base {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
    overflow: hidden;
    background-color: var(--color-primary-100);
    color: var(--color-primary-700);
    font-weight: var(--font-weight-medium);
  }

  .avatar-xs {
    width: var(--avatar-size-xs);
    height: var(--avatar-size-xs);
    font-size: 0.625rem;
  }

  .avatar-sm {
    width: var(--avatar-size-sm);
    height: var(--avatar-size-sm);
    font-size: var(--font-size-xs);
  }

  .avatar-md {
    width: var(--avatar-size-md);
    height: var(--avatar-size-md);
    font-size: var(--font-size-sm);
  }

  .avatar-lg {
    width: var(--avatar-size-lg);
    height: var(--avatar-size-lg);
    font-size: var(--font-size-base);
  }

  .avatar-xl {
    width: var(--avatar-size-xl);
    height: var(--avatar-size-xl);
    font-size: var(--font-size-lg);
  }
}

/* ============================================
 * RESPONSIVE UTILITIES
 * Clases helper para responsive design
 * ============================================ */
@layer utilities {
  /* Hide/Show por breakpoint */
  @media (max-width: 639px) {
    .hide-mobile {
      display: none !important;
    }
  }

  @media (min-width: 640px) and (max-width: 1023px) {
    .hide-tablet {
      display: none !important;
    }
  }

  @media (min-width: 1024px) {
    .hide-desktop {
      display: none !important;
    }
  }

  /* Stack en móvil */
  @media (max-width: 767px) {
    .stack-mobile {
      flex-direction: column !important;
    }
  }

  /* Container responsive padding */
  .container-padding {
    padding-left: var(--space-4);
    padding-right: var(--space-4);
  }

  @media (min-width: 768px) {
    .container-padding {
      padding-left: var(--space-6);
      padding-right: var(--space-6);
    }
  }

  @media (min-width: 1024px) {
    .container-padding {
      padding-left: var(--space-8);
      padding-right: var(--space-8);
    }
  }
}

/* ============================================
 * PRINT STYLES (Opcional)
 * ============================================ */
@media print {
  .no-print {
    display: none !important;
  }

  body {
    background-color: white;
    color: black;
  }

  .sidebar-base,
  .header-base {
    display: none;
  }
}
```

---

## 📋 Documentación de Uso del Sistema de Diseño v2.0

### Cómo usar las variables CSS:

```typescript
// En componentes React/TSX
<div className="bg-[var(--color-bg-card)] text-[var(--color-text-primary)]">

// En archivos CSS personalizados
.mi-componente {
  background-color: var(--color-primary-500);
  padding: var(--space-4);
  border-radius: var(--radius-md);
}
```

### Clases de utilidad personalizadas listas para usar:

```typescript
// Badges de categoría
<Badge className="badge-categoria-cliente">Cliente</Badge>
<Badge className="badge-prioridad-alta">Alta</Badge>
<Badge className="badge-estado-done">Completado</Badge>

// Cards
<div className="card-clickable">...</div>
<div className="email-card">...</div>
<div className="metric-card">...</div>

// Estados
<div className="empty-state">...</div>
<div className="skeleton">...</div>
<div className="spinner">...</div>

// Kanban
<div className="kanban-board">
  <div className="kanban-column">
    <div className="kanban-card">...</div>
  </div>
</div>
```

### Ventajas de esta centralización:

✅ **Único punto de verdad** para todos los estilos  
✅ **Fácil mantenimiento** - cambiar un color afecta todo el sistema  
✅ **Consistencia garantizada** - todos usan las mismas variables  
✅ **Performance** - variables CSS nativas (muy rápidas)  
✅ **Dark mode listo** - solo descomentar la sección  
✅ **Accesibilidad** - contraste y focus states incluidos
