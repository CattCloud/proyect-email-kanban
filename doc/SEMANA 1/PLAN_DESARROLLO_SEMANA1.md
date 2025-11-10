# 📋 Plan de Desarrollo - Semana 1: Implementación de Interfaz de Usuario

**Proyecto:** Sistema de Gestión Inteligente de Emails (Email-to-Kanban con IA)  
**Sprint:** Semana 1 - Maqueta Visual (UI Mockup)  
**Objetivo:** Desplegar interfaz navegable con datos mock en Vercel  
**Fecha:** 6 de Noviembre 2025

---

## 🎯 **Objetivo General**

Construir y desplegar la **primera versión visual del sistema**, con navegación real y datos mock (falsos pero realistas), sin conexión a base de datos ni IA todavía. La app debe estar **ya online en Vercel** y permitir navegar entre las 3 features core usando datos simulados.

---

## 📊 **Análisis de Historias de Usuario**

### ✅ **6 Historias de Usuario Identificadas**

| HU ID | Título | Página/Componente | Prioridad | Complejidad | Dependencias |
|-------|--------|-------------------|-----------|-------------|--------------|
| **HU-UI-001** | Pantalla de Login | `/login` | 🔴 Alta | ⭐ Baja | Layout base |
| **HU-UI-006** | Navegación Global | Layout compartido | 🔴 Alta | ⭐⭐ Media | Dashboard, Emails, Kanban |
| **HU-UI-002** | Listado de Emails | `/emails` | 🔴 Alta | ⭐⭐⭐ Alta | Mock Data Emails |
| **HU-UI-005** | Dashboard Principal | `/` | 🟡 Media | ⭐⭐ Media | Mock Data, Layout |
| **HU-UI-003** | Vista Detalle Email | `/emails/[id]` | 🟡 Media | ⭐⭐ Media | Listado Emails |
| **HU-UI-004** | Tablero Kanban | `/kanban` | 🟡 Media | ⭐⭐⭐ Alta | Mock Data, Layout |

---

## 🚀 **Estrategia de Implementación Secuencial**

### **Fase 1: Fundación (Días 1-2)**
Implementación del layout base y navegación para establecer la estructura fundamental.

### **Fase 2: Core Features (Días 2-4)**
Desarrollo de las 3 features principales: Dashboard, Emails (listado y detalle), y Kanban.

### **Fase 3: Finalización (Día 4-5)**
Refinamiento, responsive design, testing manual y deploy.

---

## 📅 **Cronograma Detallado de Desarrollo**

### **Día 1: Layout y Navegación**

#### **🔧 Setup Inicial (1h)**
- [ ] Verificar estructura de carpetas
- [ ] Instalar dependencias adicionales de UI (`@radix-ui/*`)
- [ ] Configurar aliases de importación
- [ ] Crear mockup screenshots en `/public/mockups/`

#### **🏗️ Layout Base (3h)**
- [ ] **HU-UI-006**: Implementar layout compartido en `/app/(protected)/layout.tsx`
  - Sidebar con navegación (Desktop: colapsable, Móvil: overlay)
  - Header con breadcrumbs y menú de usuario
  - Responsive design completo
  - Estados interactivos simulados

#### **🔐 Pantalla Login (2h)**
- [ ] **HU-UI-001**: Crear `/app/(auth)/login/page.tsx`
  - Interfaz centrada y responsive
  - Botón "Continuar con Google" (simulado)
  - Navegación a `/emails` al hacer clic

**Deliverable Día 1:** Layout funcional con navegación y login

---

### **Día 2: Dashboard y Datos Mock**

#### **📊 Dashboard (4h)**
- [ ] **HU-UI-005**: Implementar `/app/(protected)/page.tsx` (Dashboard)
  - 4 metric cards calculadas desde mock data
  - Accesos rápidos a funcionalidades
  - Lista de emails recientes
  - Estados vacío y de carga

#### **📋 Mock Data (2h)**
- [ ] Crear `lib/mock-data/emails.ts` (15 emails variados)
- [ ] Crear `lib/mock-data/user.ts` (usuario demo)
- [ ] Crear `lib/mock-data/navigation.ts` (config menú)
- [ ] Definir tipos TypeScript en `lib/types/`

**Deliverable Día 2:** Dashboard funcional con datos mock

---

### **Día 3: Gestión de Emails**

#### **📧 Listado de Emails (4h)**
- [ ] **HU-UI-002**: Implementar `/app/(protected)/emails/page.tsx`
  - Tabla interactiva con búsqueda y ordenamiento
  - Selección múltiple con checkboxes
  - Filtros por estado y categoría
  - Empty states y loading states
  - Paginación visual

#### **📄 Vista Detalle (3h)**
- [ ] **HU-UI-003**: Implementar `/app/(protected)/emails/[id]/page.tsx`
  - Layout de 2 columnas (70% contenido, 30% metadata)
  - Sidebar con metadata de IA
  - Estados según si el email está procesado
  - Navegación de vuelta y acciones simuladas

**Deliverable Día 3:** Sistema completo de gestión de emails

---

### **Día 4: Kanban y Refinamiento**

#### **📊 Tablero Kanban (4h)**
- [ ] **HU-UI-004**: Implementar `/app/(protected)/kanban/page.tsx`
  - 3 columnas: Por Hacer, En Progreso, Completado
  - Cards de tareas con información resumida
  - Filtros por categoría y prioridad
  - Drag & drop visual (no funcional)
  - Estados vacío y mensajes de error

#### **🔧 Refinamiento (2h)**
- [ ] Verificar responsive design en todas las páginas
- [ ] Optimizar animaciones y transiciones
- [ ] Validar navegación entre todas las rutas
- [ ] Testing manual en múltiples navegadores

**Deliverable Día 4:** Kanban funcional y refinamiento

---

### **Día 5: Testing y Deploy**

#### **🧪 Testing Completo (3h)**
- [ ] Validar todas las historias de usuario
- [ ] Testing responsive en dispositivos reales
- [ ] Verificar performance básico
- [ ] Capturar screenshots finales
- [ ] Documentar URL de deploy

#### **🚀 Deploy en Vercel (2h)**
- [ ] Conectar repositorio con Vercel
- [ ] Configurar build y deploy automático
- [ ] Verificar funcionamiento en producción
- [ ] Actualizar README con descripción del proyecto
- [ ] Documentar URL pública

**Deliverable Día 5:** Aplicación desplegada y funcional

---

## 🛠️ **Desglose Técnico por Componente**

### **Componentes de Layout (Reutilizables)**

| Componente | Archivo | Responsabilidades | Dependencias |
|------------|---------|-------------------|--------------|
| `Sidebar` | `components/layout/Sidebar.tsx` | Navegación principal, colapsable | shadcn/ui, lucide-react |
| `Header` | `components/layout/Header.tsx` | Breadcrumbs, menú usuario | shadcn/ui, lucide-react |
| `UserMenu` | `components/layout/UserMenu.tsx` | Dropdown con acciones usuario | shadcn/ui |
| `Breadcrumbs` | `components/layout/Breadcrumbs.tsx` | Navegación jerárquica | lucide-react |

### **Componentes de Dashboard**

| Componente | Archivo | Responsabilidades | Dependencias |
|------------|---------|-------------------|--------------|
| `MetricCard` | `components/dashboard/MetricCard.tsx` | Cards de métricas con iconos | shadcn/ui, lucide-react |
| `QuickActionCard` | `components/dashboard/QuickActionCard.tsx` | Accesos rápidos | shadcn/ui |
| `RecentEmailsList` | `components/dashboard/RecentEmailsList.tsx` | Lista emails recientes | shadcn/ui |

### **Componentes de Emails**

| Componente | Archivo | Responsabilidades | Dependencias |
|------------|---------|-------------------|--------------|
| `EmailTable` | `components/emails/EmailTable.tsx` | Tabla principal con datos | shadcn/ui table, TanStack Table |
| `EmailTableRow` | `components/emails/EmailTableRow.tsx` | Fila individual de email | shadcn/ui, Checkbox |
| `EmailDetailView` | `components/emails/EmailDetailView.tsx` | Vista detalle completa | shadcn/ui, Card |
| `EmailMetadataSidebar` | `components/emails/EmailMetadataSidebar.tsx` | Sidebar con metadata IA | shadcn/ui, Badge |

### **Componentes de Kanban**

| Componente | Archivo | Responsabilidades | Dependencias |
|------------|---------|-------------------|--------------|
| `KanbanBoard` | `components/kanban/KanbanBoard.tsx` | Layout principal 3 columnas | shadcn/ui |
| `KanbanColumn` | `components/kanban/KanbanColumn.tsx` | Columna individual con header | shadcn/ui |
| `TaskCard` | `components/kanban/TaskCard.tsx` | Card individual de tarea | shadcn/ui, Badge |
| `KanbanFilters` | `components/kanban/KanbanFilters.tsx` | Filtros por categoría/prioridad | shadcn/ui, Select |

### **Componentes Compartidos**

| Componente | Archivo | Responsabilidades | Dependencias |
|------------|---------|-------------------|--------------|
| `SearchBar` | `components/shared/SearchBar.tsx` | Barra de búsqueda reutilizable | shadcn/ui, Input |
| `EmptyState` | `components/shared/EmptyState.tsx` | Estado vacío genérico | shadcn/ui |

---

## 🔗 **Matriz de Dependencias**

```
Layout Base (HU-UI-006)
    ├── Dashboard (HU-UI-005) ───┐
    ├── Emails List (HU-UI-002) ─┤
    ├── Email Detail (HU-UI-003) ─┤
    └── Kanban (HU-UI-004) ──────┘
         │
    Mock Data (emails.ts, user.ts, navigation.ts)
```

**Dependencias Críticas:**
1. **Layout → Todas las vistas**: El layout compartido debe estar listo antes de implementar cualquier vista
2. **Mock Data → Vistas con datos**: Los datos mock deben existir antes de las vistas que los consumen
3. **Emails List → Email Detail**: La vista detalle depende del formato de datos del listado

---

## ⏱️ **Estimación de Tiempo por Interfaz**

### **Fase 1: Fundación (6h total)**

| Componente | Tiempo Estimado | Complejidad | Riesgo |
|------------|----------------|-------------|---------|
| Layout Base | 3h | Media | Bajo |
| Login Screen | 2h | Baja | Bajo |
| Setup Mockups | 1h | Baja | Muy Bajo |

### **Fase 2: Core Features (11h total)**

| Componente | Tiempo Estimado | Complejidad | Riesgo |
|------------|----------------|-------------|---------|
| Dashboard | 4h | Media | Medio |
| Mock Data Creation | 2h | Media | Bajo |
| Emails List | 4h | Alta | Alto |
| Email Detail | 3h | Media | Medio |

### **Fase 3: Finalización (5h total)**

| Componente | Tiempo Estimado | Complejidad | Riesgo |
|------------|----------------|-------------|---------|
| Kanban Board | 4h | Alta | Alto |
| Testing & Refinement | 2h | Media | Bajo |
| Deploy & Documentation | 2h | Baja | Bajo |

**Total Estimado: 22 horas (4.4 días de trabajo)**

---

## ✅ **Criterios de Aceptación por Historias de Usuario**

### **HU-UI-001: Pantalla de Login**
- [ ] Layout centrado y responsive
- [ ] Botón "Continuar con Google" funcional (simulado)
- [ ] Navegación a `/emails` al hacer clic
- [ ] Estados hover y loading implementados
- [ ] Compatible con Desktop, Tablet, Móvil

### **HU-UI-006: Navegación Global**
- [ ] Sidebar funcional en desktop (colapsable)
- [ ] Menú hamburguesa en móvil/tablet
- [ ] Navegación entre todas las rutas
- [ ] Indicador de página activa
- [ ] Menú de usuario con opciones
- [ ] Responsive design completo

### **HU-UI-005: Dashboard Principal**
- [ ] 4 metric cards con datos calculados
- [ ] Accesos rápidos funcionales
- [ ] Lista de emails recientes
- [ ] Estados vacío y loading
- [ ] Navegación desde métricas
- [ ] Actualización simulada de datos

### **HU-UI-002: Listado de Emails**
- [ ] Tabla interactiva con 15 emails mock
- [ ] Búsqueda en tiempo real
- [ ] Ordenamiento por fecha
- [ ] Selección múltiple funcional
- [ ] Filtros por estado y categoría
- [ ] Navegación a detalle
- [ ] Paginación visual
- [ ] Empty states

### **HU-UI-003: Vista Detalle Email**
- [ ] Layout 2 columnas responsive
- [ ] Metadata IA en sidebar
- [ ] Estados según procesamiento
- [ ] Botón "Volver a Emails"
- [ ] Acciones simuladas con toasts
- [ ] Error handling para IDs inválidos

### **HU-UI-004: Tablero Kanban**
- [ ] 3 columnas con tareas distribuidas
- [ ] Filtros por categoría y prioridad
- [ ] Cards con información resumida
- [ ] Estados vacío por columna
- [ ] Drag & drop visual (no funcional)
- [ ] Navegación a detalle de email
- [ ] Responsive design

---

## 🎨 **Estrategia de Implementación con Mock Data**

### **1. Estructura de Datos Mock**

```typescript
// lib/types/email.ts
interface EmailMock {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  processed: boolean;
  category: 'cliente' | 'lead' | 'interno' | 'spam' | null;
  priority: 'alta' | 'media' | 'baja' | null;
  hasTask: boolean;
  taskDescription: string | null;
  taskStatus: 'todo' | 'doing' | 'done' | null;
}
```

### **2. Distribución de Datos Mock (15 emails)**

- **5 emails sin procesar** (`processed: false`)
- **10 emails procesados** con variedad:
  - 3 Cliente, 2 Lead, 3 Interno, 2 Spam
  - 4 Alta prioridad, 3 Media, 3 Baja
  - 7 con tareas, 3 sin tareas
  - 3 Por hacer, 2 En progreso, 2 Completado

### **3. Funcionalidades Simuladas**

- **Búsqueda:** Filtrado en memoria por remitente/asunto
- **Ordenamiento:** JavaScript nativo por fecha
- **Selección:** Estado local con checkboxes
- **Navegación:** Next.js App Router con params dinámicos
- **Filtros:** Estados locales que afectan la vista
- **Toasts:** Notificaciones fake con setTimeout
- **Loading:** Skeletons y spinners con delays simulados

### **4. Estados de UI a Implementar**

- **Loading:** Skeletons en tablas y cards
- **Empty:** Mensajes y CTAs cuando no hay datos
- **Error:** Manejo de IDs inválidos en rutas dinámicas
- **No Results:** Mensajes cuando búsqueda no encuentra resultados
- **Selected:** Estados visuales para items seleccionados

---

## 🧪 **Plan de Validación y Testing**

### **Testing Manual por Historia de Usuario**

#### **HU-UI-001: Login**
- [ ] Probar en Chrome, Firefox, Safari
- [ ] Verificar responsive en dev tools
- [ ] Validar navegación al hacer clic
- [ ] Comprobar estados hover y loading

#### **HU-UI-006: Navegación**
- [ ] Test de todas las rutas desde sidebar
- [ ] Verificar collapse/expand en desktop
- [ ] Probar menú hamburguesa en móvil
- [ ] Validar indicador de página activa
- [ ] Test de menú de usuario

#### **HU-UI-005: Dashboard**
- [ ] Verificar cálculos de métricas
- [ ] Probar navegación desde cards
- [ ] Validar lista de emails recientes
- [ ] Test de botón "Refrescar"

#### **HU-UI-002: Emails List**
- [ ] Probar búsqueda con términos reales
- [ ] Verificar ordenamiento por fecha
- [ ] Test de selección múltiple
- [ ] Probar filtros de estado
- [ ] Validar navegación a detalle
- [ ] Test de estados vacío

#### **HU-UI-003: Email Detail**
- [ ] Probar navegación desde listado
- [ ] Verificar metadata según estado
- [ ] Test de botón "Volver"
- [ ] Probar acciones simuladas
- [ ] Validar error para ID inválido

#### **HU-UI-004: Kanban**
- [ ] Verificar distribución de tareas
- [ ] Probar filtros por categoría
- [ ] Test de navegación a detalle
- [ ] Validar estados vacío
- [ ] Probar drag & drop visual

### **Testing de Responsive Design**

- **Desktop (>1024px):** Layout completo, sidebar expandido
- **Tablet (768-1024px):** Sidebar colapsable, tabla adaptativa
- **Móvil (<768px):** Hamburger menu, cards apiladas

### **Testing de Performance**

- [ ] Verificar tiempo de carga < 3 segundos
- [ ] Comprobar bundle size razonable
- [ ] Validar que no hay errores en consola
- [ ] Test de memoria con navegación repetida

### **Criterios de Calidad del Código**

- [ ] Sin errores de TypeScript
- [ ] Componentes reutilizables bien separados
- [ ] Uso consistente de shadcn/ui
- [ ] Código limpio y documentado
- [ ] Commits frecuentes y descriptivos

---

## 📦 **Entregables Finales**

### **Funcionalidad Visual**
- [ ] 6 historias de usuario implementadas al 100%
- [ ] Navegación fluida sin errores
- [ ] Datos mock renderizándose correctamente
- [ ] Responsive design en todos los breakpoints
- [ ] Estados vacío implementados donde corresponda

### **Interacciones Simuladas**
- [ ] Búsqueda y filtrado funcionando
- [ ] Selección múltiple operativa
- [ ] Rutas dinámicas funcionando
- [ ] Toasts y feedback visual
- [ ] Sidebar responsivo funcional

### **Calidad del Código**
- [ ] Componentes reutilizables separados
- [ ] Tipos TypeScript definidos
- [ ] shadcn/ui usado consistentemente
- [ ] Sin errores de compilación
- [ ] Código bien organizado

### **Documentación y Assets**
- [ ] README.md actualizado
- [ ] 6 mockups generados y guardados
- [ ] Screenshots de la app funcionando
- [ ] Mock data bien estructurado
- [ ] Este plan de desarrollo documentado

### **Deploy**
- [ ] Aplicación desplegada en Vercel
- [ ] URL pública accesible
- [ ] No errores de build en producción
- [ ] Performance aceptable

---

## ⚠️ **Restricciones y No-Hacer Lista**

### **NO IMPLEMENTAR EN SEMANA 1:**
- ❌ Conexión a base de datos real
- ❌ Autenticación real con NextAuth
- ❌ Server Actions o API Routes
- ❌ Procesamiento con IA
- ❌ Drag & Drop funcional (solo visual)
- ❌ Persistencia de datos
- ❌ Lógica de backend
- ❌ Validaciones complejas con Zod
- ❌ Integración con servicios externos
- ❌ Testing unitario o e2e

### **SÍ PERMITIDO:**
- ✅ Simulación de interacciones con JavaScript
- ✅ Filtrado y búsqueda en memoria
- ✅ Navegación entre rutas
- ✅ Estados de UI simulados
- ✅ localStorage para preferencias de UI
- ✅ Animaciones y transiciones CSS
- ✅ Toast notifications con datos fake
- ✅ Modals y dialogs (sin lógica real)

---

## 🎯 **Estrategia de Contingencia**

### **Si hay retrasos (priorización):**
1. **Prioridad 1:** HU-UI-001, 002, 006 (Login, Emails, Layout)
2. **Prioridad 2:** HU-UI-004, 005 (Kanban, Dashboard)
3. **Prioridad 3:** HU-UI-003 (Detalle de email - puede ser modal)

### **Si hay problemas técnicos:**
- Usar modal simple en lugar de página para detalle de email
- Implementar Kanban básico sin filtros si el tiempo es escaso
- Omitir algunos estados de loading si complican el desarrollo

### **Si el deploy falla:**
- Verificar que todas las rutas sean correctas
- Comprobar imports y tipos TypeScript
- Asegurar que no hay dependencias faltantes
- Documentar URL de GitHub Pages como backup

---

## 📝 **Checklist Final de Entrega**

### **Antes del Deploy:**
- [ ] Todas las 6 HU funcionando localmente
- [ ] Testing manual completado en múltiples navegadores
- [ ] Responsive design verificado
- [ ] Performance básico validado
- [ ] Documentación actualizada

### **Después del Deploy:**
- [ ] Verificar funcionamiento en URL pública
- [ ] Comprobar que no hay errores 404
- [ ] Test de navegación en producción
- [ ] Capturar screenshots finales
- [ ] Actualizar README con URL

### **Criterios de Éxito - Semana 1 COMPLETADA:**
- ✅ App visible online en Vercel
- ✅ 6 pantallas navegables con datos mock
- ✅ 3 features core funcionando visualmente
- ✅ Responsive design completo
- ✅ Sin errores de build o consola
- ✅ Documentación completa

---

**📅 Plan creado:** 6 de Noviembre 2025  
**🎯 Objetivo:** Maqueta visual completa lista para mostrar  
**🚀 Deploy:** URL pública en Vercel  
**📋 Estado:** Listo para implementación