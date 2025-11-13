// src/lib/mock-data/navigation.ts
// Mock data para configuración de navegación
// Semana 1: Frontend Only - Sin autenticación real

export interface NavigationItem {
  label: string;
  href: string;
  icon: 'Home' | 'Mail' | 'Columns';
  description?: string;
}

// Array con items de navegación principal
export const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'Home',
    description: 'Vista general y métricas'
  },
  {
    label: 'Emails',
    href: '/emails',
    icon: 'Mail',
    description: 'Gestión de emails'
  },
  {
    label: 'Revisión IA',
    href: '/processing/review',
    icon: 'Columns',
    description: 'Revisión y confirmación de IA'
  },
  {
    label: 'Kanban',
    href: '/kanban',
    icon: 'Columns',
    description: 'Tareas pendientes'
  }
];

// Función para obtener el item activo basado en la ruta actual
export function getActiveNavigationItem(currentPath: string): NavigationItem | undefined {
  return navigationItems.find(item => {
    if (item.href === '/') {
      return currentPath === '/' || currentPath.startsWith('/dashboard');
    }
    return currentPath.startsWith(item.href);
  });
}

// Función para verificar si una ruta está activa
export function isNavigationActive(currentPath: string, itemHref: string): boolean {
  if (itemHref === '/') {
    return currentPath === '/' || currentPath.startsWith('/dashboard');
  }
  return currentPath.startsWith(itemHref);
}