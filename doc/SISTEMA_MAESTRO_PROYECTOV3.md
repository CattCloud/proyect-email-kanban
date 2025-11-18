# Sistema de Gestión Inteligente de Emails

_Guía completa y fuente de verdad para todo el desarrollo del sistema._

**Última actualización:** 18 de Noviembre, 2025  
**Versión del documento:** v3.0.1  
**Próxima revisión:** 25 de Noviembre, 2025

---

## Índice

1. Resumen Ejecutivo y Visión General  
2. Stack Tecnológico y Dependencias  
3. Arquitectura del Sistema  
4. Estructura de Carpetas  
5. Base de Datos y Modelado  
6. Autenticación y Autorización  
7. Servicios y Acciones del Backend  
8. Componentes UI y Sistema de Diseño  
9. Flujos de Datos y Procesos Clave  
10. Integraciones Externas  
11. Configuración y Despliegue  
12. Seguridad y Rendimiento  
13. Patrones y Convenciones de Código  
14. Estado Actual y Roadmap  
15. Protocolo de Planificación  

---

## 📋 Reglas del Agente (Instrucciones Fijas)

> **Estas son metainstrucciones críticas que DEBE seguir cualquier IA o desarrollador que trabaje en este proyecto. Son reglas no negociables.**

### ⚠️ Reglas Críticas de Código

**R1. TypeScript Estricto:**
- ✅ **SIEMPRE** usa TypeScript en todos los archivos de lógica y UI.
- ❌ **NUNCA** uses `any`; usa tipos específicos o `unknown`.
- ✅ Define interfaces o tipos (`type`) para todas las estructuras de datos relevantes.
- ✅ Exporta tipos desde archivos dedicados en [`src/types/`](src/types/).

**R2. Arquitectura Smart Actions:**
- ✅ **SIEMPRE** usa Server Actions para la lógica de backend en [`src/actions/`](src/actions/).
- ✅ **SIEMPRE** marca Server Actions con `"use server"` al inicio del archivo.
- ✅ **SIEMPRE** marca componentes interactivos con `"use client"`.
- ❌ **NUNCA** crees endpoints API tradicionales (`/api/*`) sin justificación explícita.

**R3. Sistema de Diseño:**
- ✅ **SIEMPRE** usa el sistema de diseño central definido en [`src/app/globals.css`](src/app/globals.css).
- ✅ **SIEMPRE** usa componentes UI base en [`src/components/ui/`](src/components/ui/).
- ✅ **SIEMPRE** usa clases de badge predefinidas (`.badge-categoria-*`, `.badge-prioridad-*`) en listados y tarjetas.
- ❌ **NUNCA** hardcodees colores; usa `var(--color-*)`.

### 📁 Reglas de Estructura y Organización

**R4. Convenciones de Nomenclatura:**
- ✅ Componentes React: archivos `PascalCase.tsx` (ej.: [`EmailTable.tsx`](src/components/emails/EmailTable.tsx)).
- ✅ Páginas Next.js: `page.tsx`, `layout.tsx`.
- ✅ Server Actions: archivos en `camelCase` (ej.: [`emails.ts`](src/actions/emails.ts), [`ai-processing.ts`](src/actions/ai-processing.ts), [`kanban.ts`](src/actions/kanban.ts)).
- ✅ Interfaces y tipos: `PascalCase` (ej.: definido en [`src/types/email.ts`](src/types/email.ts)).
- ✅ Constantes: `UPPER_SNAKE_CASE` (ej.: `PAGE_SIZE` en componentes de tabla).

**R5. Estructura de Carpetas:**
- ✅ **SIEMPRE** respeta la estructura descrita en [Sección 4](#4-estructura-de-carpetas-del-proyecto--actualizada).
- ✅ Mock data únicamente donde está previsto (`src/lib/mock-data/`).
- ✅ Componentes específicos de dominio en carpetas propias: `emails/`, `kanban/`, `dashboard/`, `processing/`.
- ❌ **NUNCA** mezcles componentes de dominios distintos en la misma carpeta.

**R6. Imports y Dependencias:**
- ✅ **SIEMPRE** agrupa imports: Node/standard → terceros → internos (`@/…`).
- ✅ **SIEMPRE** usa paths absolutos con `@/` para código bajo [`src/`](src/).
- ✅ **SIEMPRE** verifica que las dependencias estén declaradas en [`package.json`](package.json).
- ❌ **NUNCA** importes APIs privadas de librerías externas salvo que sea estrictamente necesario.

### 🔒 Reglas de Validación y Seguridad

**R7. Validación de Datos:**
- ✅ Valida toda entrada externa (JSON de importación, parámetros de Server Actions) con Zod.
- ✅ Valida todas las respuestas de IA con schemas Zod antes de persistirlas (`EmailAnalysis`, `Task`, etc., definidos en [`src/types/ai.ts`](src/types/ai.ts)).
- ❌ **NUNCA** confíes en datos enviados desde el cliente sin validación server-side.

**R8. Autenticación y Autorización:**
- ✅ Diseña todas las Server Actions pensando en un futuro `userId` para multiusuario.
- ✅ Prevé filtrado por usuario en consultas cuando se active NextAuth.
- ❌ **NUNCA** expongas información sensible en mensajes de error o logs.

### 🎨 Reglas de UI y UX

**R9. Accesibilidad:**
- ✅ **SIEMPRE** incluye `aria-label` en botones con solo icono o sin texto claro.
- ✅ **SIEMPRE** usa roles semánticos (`main`, `navigation`, `dialog`, etc.).
- ✅ **SIEMPRE** permite navegación por teclado (Tab, Enter, Escape) en modales y controles clave.

**R10. Responsive Design:**
- ✅ **SIEMPRE** implementa Mobile First.
- ✅ **SIEMPRE** usa utilidades responsive definidas en `globals.css` y Tailwind.
- ✅ **SIEMPRE** prueba al menos en móviles y pantallas de escritorio.

**R11. Estados de Loading y Error:**
- ✅ **SIEMPRE** muestra estados de carga con spinners, placeholders o skeletons.
- ✅ **SIEMPRE** maneja estados de error con UI clara para el usuario.
- ✅ Usa [`ErrorBoundary`](src/components/shared/ErrorBoundary.tsx) donde tenga sentido.

### 📋 Reglas de Planificación y Documentación

**R12. Protocolo de Planificación:**
- ✅ **ANTES** de desarrollar una feature, sigue el [Protocolo de Planificación](doc/Protocolo%20de%20Planificacion.md).
- ✅ **SIEMPRE** divide features en hitos claramente definidos y desplegables.
- ✅ **SIEMPRE** cierra cada hito con verificación funcional y actualización de documentación.

**R13. Actualización de Documentación:**
- ✅ Cualquier cambio en modelos Prisma DEBE reflejarse en este Sistema Maestro.
- ✅ Cualquier nueva Server Action DEBE documentarse en [Sección 7](#7-servicios-y-acciones-del-backend--completamente-implementado).
- ✅ Cualquier cambio relevante en flujo IA DEBE actualizar [Secciones 9, 16, 17 y 21](#16-nuevas-funcionalidades-implementadas--).

### ⚡ Reglas de Performance y Optimización

**R14. Optimización React:**
- ✅ Usa `useMemo` y `useCallback` para listas y cálculos costosos (tabla de emails, filtros en revisión IA, Kanban).
- ✅ Evita renders innecesarios en componentes con muchos elementos (Kanban, revisión IA).
- ❌ **NUNCA** hagas fetching redundante desde el cliente cuando exista Server Action o Server Component adecuado.

**R15. Next.js Best Practices:**
- ✅ Usa App Router en toda la aplicación.
- ✅ Prefiere Server Components cuando solo se leen datos.
- ✅ Usa componentes cliente únicamente para interactividad real (`useState`, `useEffect`, `useTransition`, etc.).

### 🧪 Reglas de Testing y Quality

**R16. Testing (Pendiente consolidación):**
- ✅ Existen tests mock para IA y Kanban en [`src/tests/`](src/tests/).
- ⏳ Aún no hay comando único `npm test`; se usan archivos de prueba específicos.
- ✅ **ANTES** de cerrar un hito crítico, realiza smoke tests manuales end-to-end (importar → procesar IA → revisar → Kanban).

**R17. Code Review:**
- ✅ **ANTES** de commit, ejecuta `npm run build` y corrige errores.
- ✅ Elimina `console.log` y `alert` de depuración permanentes.
- ✅ Usa mensajes de commit descriptivos (`feat:`, `fix:`, `refactor:`, etc.).

---

## 1. Resumen Ejecutivo y Visión General

### 1.1 Propósito del Proyecto

El Sistema de Gestión Inteligente de Emails busca convertir una bandeja de entrada caótica en un flujo de trabajo estructurado:

- Centraliza emails de negocio en una base de datos real (PostgreSQL).
- Automatiza la clasificación y extracción de tareas con IA (OpenAI).
- Visualiza las tareas resultantes en un tablero Kanban por estados y contactos.
- Permite revisión humana de la metadata IA (aceptar/rechazar), con trazabilidad del procesamiento.

**Problemas que resuelve:**

- Volumen elevado de emails (50–100 diarios).
- Tiempo significativo invertido en clasificación manual (1–2 horas/día).
- Tareas implícitas que se pierden o atienden tarde.
- Falta de visibilidad clara de prioridades y estado de tareas.

### 1.2 Solución Propuesta

La solución consiste en:

1. **Importar** emails desde JSON usando un modal con drag & drop.
2. **Procesar** emails seleccionados en lotes mediante OpenAI:
   - Clasificar por categoría y prioridad.
   - Extraer tareas accionables con fechas, tags y participantes.
   - Generar resúmenes y nombres de contacto.
3. **Persistir** resultados IA en modelos estructurados (`EmailMetadata`, `Task`, `Contact`, `Tag`).
4. **Revisar** los resultados IA antes de aprobarlos (pantalla de revisión).
5. **Organizar** las tareas aprobadas en un tablero Kanban filtrable por estado y contacto.

### 1.3 Enfoque MVP vs. Versión Futura

| Aspecto        | MVP (Semanas 1–3) ✅ | Versión Futura (Plan)        |
|----------------|----------------------|------------------------------|
| Ingesta        | JSON manual          | Gmail / Outlook API          |
| Procesamiento  | Batch manual (UI)    | Procesamiento automático     |
| Revisión IA    | Pantalla dedicada    | Edición avanzada de metadata |
| Kanban         | Por tarea/contacto   | DnD completo + más vistas    |
| Seguridad      | Login simulado       | NextAuth + roles/usuarios    |

### 1.4 Objetivos del MVP (✅ COMPLETADOS)

- ✅ Persistencia real de emails en PostgreSQL (Neon) con Prisma.
- ✅ Importación de emails desde JSON con validación.
- ✅ Procesamiento IA con OpenAI e integración Zod.
- ✅ Persistencia de metadata y tareas (`EmailMetadata`, `Task`).
- ✅ Kanban real basado en tareas (`Task`) y contactos (`Contact`).
- ✅ Pantalla de revisión IA con aceptación/rechazo y registro de motivo y snapshot de análisis.

---

## 2. Stack Tecnológico y Dependencias

### 2.1 Frontend

Según [`package.json`](package.json):

| Tecnología   | Versión  | Rol                        | Estado |
|-------------|----------|----------------------------|--------|
| **Next.js** | 16.0.1   | Framework fullstack        | ✅ App Router + Server Actions |
| **React**   | 19.2.0   | Librería de componentes    | ✅ Componentes cliente y server |
| **TypeScript** | 5+    | Tipado estático            | ✅ Configurado en todo el proyecto |
| **Tailwind CSS** | 4+  | Estilos utility-first      | ✅ Integrado con `postcss` |

### 2.2 Backend & Database

| Tecnología           | Versión   | Rol                         | Estado |
|----------------------|-----------|-----------------------------|--------|
| **Prisma**           | ^6.19.0   | ORM para PostgreSQL         | ✅ Modelos y migraciones en [`prisma/schema.prisma`](prisma/schema.prisma) |
| **@prisma/client**   | ^6.19.0   | Cliente Prisma              | ✅ Usado en Server Actions y `ai-mapper` |
| **PostgreSQL (Neon)**| -         | Base de datos persistente   | ✅ Conectada vía `DATABASE_URL` |

### 2.3 UI & Estado

| Tecnología                   | Versión   | Rol                               | Estado |
|-----------------------------|-----------|-----------------------------------|--------|
| **class-variance-authority**| ^0.7.1    | Variantes de componentes          | ✅ Usado en Button |
| **clsx**                    | ^2.1.1    | Composición de clases             | ✅ Integrado en `cn()` |
| **tailwind-merge**          | ^3.3.1    | Merge de clases Tailwind          | ✅ Integrado en `cn()` |
| **lucide-react**            | ^0.552.0  | Iconos                            | ✅ Usado en múltiples vistas |
| **zustand**                 | ^5.0.8    | Estado global ligero              | ⏳ Instalado, no crítico en MVP actual |

### 2.4 Validación y Tipos

| Librería | Versión   | Rol                      | Estado |
|----------|-----------|--------------------------|--------|
| **Zod**  | ^4.1.12   | Validación runtime       | ✅ Schemas en Server Actions y tipos IA |

### 2.5 Inteligencia Artificial

| Librería | Versión   | Propósito         | Estado |
|----------|-----------|-------------------|--------|
| **openai** | 6.8.1   | Cliente OpenAI    | ✅ Integrado en [`src/services/openai.ts`](src/services/openai.ts) |

### 2.6 Funcionalidad Específica (Instalada)

| Librería                  | Versión    | Rol                        | Estado |
|---------------------------|-----------|----------------------------|--------|
| **react-dropzone**        | ^14.3.8   | Drag & drop JSON           | ✅ Usado en importación |
| **@dnd-kit/core**         | ^6.3.1    | Drag & drop Kanban         | ⏳ Instalado, pendiente de uso en Kanban |
| **@tanstack/react-table** | ^8.21.3   | Tablas avanzadas           | ⏳ Instalado, tabla actual no se basa en esta librería |
| **next-auth**             | ^4.24.13  | Autenticación OAuth        | ⏳ Instalado, sin configuración activa |
| **notyf**                 | ^3.10.0   | Notificaciones toast       | ⏳ Instalado, no integrado aún |
| **react-loading-skeleton**| ^3.5.0    | Skeletons de carga         | ⏳ Opcional |
| **react-spinners**        | ^0.17.0   | Spinners de carga          | ⏳ Opcional |

---

## 3. Arquitectura del Sistema

### 3.1 Arquitectura Implementada ✅

El sistema sigue el **Smart Actions Pattern** sobre Next.js App Router:

- Capa de presentación en `src/app` y `src/components`.
- Capa de negocio y acceso a datos en Server Actions (`src/actions`).
- Capa de datos en PostgreSQL manejada por Prisma (`prisma/schema.prisma`).

Capas:

- **Presentación:**  
  - Páginas en `src/app/(protected)` (dashboard, emails, kanban, revisión IA).
  - Componentes de dominio en `src/components/*`.

- **Lógica de negocio (Server Actions):**  
  - Emails: [`src/actions/emails.ts`](src/actions/emails.ts).  
  - Procesamiento IA: [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts).  
  - Kanban: [`src/actions/kanban.ts`](src/actions/kanban.ts).

- **Datos:**  
  - Modelos `Email`, `EmailMetadata`, `Task`, `Contact`, `Tag` en [`prisma/schema.prisma`](prisma/schema.prisma).  
  - Migraciones en `prisma/migrations/`.  
  - Seed de datos en [`prisma/seed.ts`](prisma/seed.ts).

### 3.2 Patrones Implementados ✅

- **Smart Actions (Next.js 16):**  
  - Sin endpoints REST extra; la UI llama directamente a Server Actions tipadas.
  - Revalidación de rutas tras mutaciones (`revalidatePath`).

- **Orquestación de Procesamiento IA:**  
  - Server Action de procesamiento (`processEmailsWithAI` en [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts)) que:
    - Lee emails desde BD.
    - Construye el prompt con [`buildEmailProcessingPrompt`](src/lib/prompts/email-processing.ts).
    - Llama a OpenAI vía [`processEmailsBatch`](src/services/openai.ts).
    - Persiste resultados en `EmailMetadata`, `Task` y `Contact`.

- **Patrón de Revisión y Rechazo IA:**  
  - `getPendingAllAIResults` obtiene emails con resultados IA pendientes (procesados pero no aprobados).
  - `confirmProcessingResults` aprueba resultados IA.
  - `rejectProcessingResultsWithReason` rechaza resultados IA, guarda motivo y snapshot (`previousAIResult`), y devuelve el email a estado “sin procesar”.

### 3.3 Patrones Pendientes de Implementación

- Autenticación y autorización reales con NextAuth.
- Kanban con drag & drop nativo usando `@dnd-kit/core`.
- Suspense/streaming en rutas con alto volumen de datos.

---

## 4. Estructura de Carpetas del Proyecto ✅ ACTUALIZADA

```text
/src
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── emails/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── kanban/
│   │   │   └── page.tsx
│   │   └── processing/
│   │       └── review/
│   │           ├── page.tsx
│   │           └── loading.tsx
│   ├── playground/
│   │   └── buttons/
│   │       └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── actions/
│   ├── emails.ts
│   ├── ai-processing.ts
│   ├── kanban.ts
│   └── README.md
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── emails/
│   ├── kanban/
│   ├── dashboard/
│   ├── processing/
│   └── shared/
│
├── lib/
│   ├── prisma.ts
│   ├── utils.ts
│   ├── ai-mapper.ts
│   ├── tag-utils.ts
│   └── prompts/
│       └── email-processing.ts
│
├── services/
│   ├── openai.ts
│   └── README.md
│
├── types/
│   ├── email.ts
│   ├── ai.ts
│   ├── kanban.ts
│   └── index.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
└── tests/
    ├── ai-processing.mock.test.ts
    ├── kanban.mock.test.ts
    ├── openai.mock.test.ts
    └── README.md

/public/templates/
└── email-import-template.json
```

### 4.1 Convenciones de Nomenclatura ✅ IMPLEMENTADAS

- Componentes React: archivos `PascalCase.tsx` en `src/components/**`.
- Páginas Next.js: `page.tsx` y `layout.tsx` en minúsculas.
- Server Actions: archivos en `camelCase` bajo `src/actions/`.
- Tipos: un archivo por dominio en `src/types/`.

Ejemplo de patrón interno (simplificado):

```typescript
// Interfaces: PascalCase
export interface EmailWithMetadata { /* ... */ }

// Constantes: UPPER_SNAKE_CASE
const PAGE_SIZE = 10;

// Funciones: camelCase
function formatRelative(/* ... */) { /* ... */ }

// Server Action: camelCase en archivo de acciones
export async function getEmails() { /* ... */ }
```

---

## 5. Base de Datos y Modelado ✅ IMPLEMENTADO

### 5.1 Estado Actual - Base de Datos Real Funcionando

- DB: PostgreSQL en Neon.
- Conexión: `DATABASE_URL` definida en `.env`.
- Cliente Prisma: [`src/lib/prisma.ts`](src/lib/prisma.ts).
- Migraciones: ubicadas en [`prisma/migrations/`](prisma/migrations/).
- Seed: [`prisma/seed.ts`](prisma/seed.ts) crea ejemplos con estructura IA.

### 5.2 Modelo de Datos Implementado ✅

Modelo resumido de [`prisma/schema.prisma`](prisma/schema.prisma):

- `Email`:
  - Campos clave: `id`, `idEmail`, `from`, `subject`, `body`, `receivedAt`, `createdAt`.
  - Campos de estado IA: `processedAt`, `approvedAt`.
  - Campos de rechazo: `rejectionReason` (string opcional), `previousAIResult` (JSON opcional).
  - Relación 1:1 opcional con `EmailMetadata`.

- `EmailMetadata`:
  - Campos de clasificación: `category`, `priority`.
  - Resumen y contacto: `summary`, `contactName`.
  - Tareas resumidas: `hasTask`, `taskDescription`, `taskStatus`.
  - Relación 1:N con `Task`.

- `Task`:
  - Tarea concreta: `description`, `dueDate`, `tags[]`, `participants[]`.
  - Estado: `status` (`todo`, `doing`, `done`).
  - Relación con `EmailMetadata`.

- `Contact`:
  - Contactos únicos por email (`email` único).
  - Nombre opcional y `createdAt`.

- `Tag`:
  - `descripcion` único (etiqueta normalizada).
  - Usado como catálogo global de tags producidos por IA.

### 5.3 Tipos TypeScript Relacionados ✅

En [`src/types/email.ts`](src/types/email.ts):

- `EmailMetadata` (tipo UI).
- `PrismaEmail` (shape compatible con lo devuelto por Prisma).
- `EmailWithMetadata` (email + metadata).
- Tipos de filtro (estado, categoría, prioridad).
- `DashboardMetrics` (métricas de dashboard).

En [`src/types/ai.ts`](src/types/ai.ts):

- Tipos `EmailInput`, `Task`, `EmailAnalysis` usados por IA.
- Schemas Zod para validar respuestas IA (consumidos por `validateEmailAnalysisResponse`).

---

## 6. Autenticación y Autorización

### 6.1 Estado Actual (Simulado)

- Página de login en [`src/app/(auth)/login/page.tsx`](src/app/(auth)/login/page.tsx) con login simulado.
- Usuario demo en [`src/lib/mock-data/user.ts`](src/lib/mock-data/user.ts).
- Rutas bajo `(protected)` no están realmente protegidas por sesión.
- Server Actions no filtran por usuario.

### 6.2 Próximos Pasos (Semana 3+)

- Configurar NextAuth (librería ya instalada) con Google OAuth como proveedor principal.
- Añadir `userId` a `Email` y otros modelos necesarios.
- Actualizar Server Actions para filtrar por `userId`.
- Añadir middleware para proteger rutas bajo `(protected)`.

---

## 7. Servicios y Acciones del Backend ✅ COMPLETAMENTE IMPLEMENTADO

### 7.1 Server Actions de Emails (Estado Real)

**Archivo principal:** [`src/actions/emails.ts`](src/actions/emails.ts)

Responsabilidades cubiertas:

- **Lectura:**
  - Obtener lista de emails con metadata.
  - Obtener un email específico por `id`.
  - Obtener emails filtrados por estado de aprobación.
  - Obtener emails con tareas para Kanban legacy.
  - Obtener emails recientes para dashboard.
  - Obtener conteos agregados por categoría y prioridad.
  - Obtener remitente más frecuente.

- **Mutaciones:**
  - Crear y actualizar emails (incluyendo metadata).
  - Eliminar emails (hard delete con cascade a metadata/tareas).
  - Importar emails desde JSON en lotes (máx 10 por transacción).
  - Aprobar y desaprobar emails en función de `processedAt`/`approvedAt`.

Todas las mutaciones:

- Validan entrada con Zod.
- Usan Prisma para operaciones atómicas.
- Revalidan rutas relevantes (principalmente `/emails` y `/`).

### 7.2 Server Actions de Procesamiento IA

**Archivo:** [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts)

Responsabilidades:

- Listar emails sin procesar (`processedAt IS NULL`) con paginación.
- Procesar emails seleccionados con IA (OpenAI):
  - Construir inputs a partir de `Email`.
  - Consultar catálogo de tags existentes (`Tag`) para contexto IA.
  - Procesar lote de emails con `processEmailsBatch` en [`src/services/openai.ts`](src/services/openai.ts).
  - Registrar nuevas etiquetas IA en `Tag` (normalizadas).
  - Persistir metadata y tareas en `EmailMetadata` y `Task`.
  - Crear o actualizar contactos en `Contact`.
  - Marcar `processedAt`.

- Gestionar revisión y rechazo:
  - Obtener resultados IA pendientes (`getPendingAIResults`, `getPendingAllAIResults`).
  - Confirmar resultados IA (aprobar).
  - Rechazar resultados IA con motivo (`rejectionReason`) y snapshot (`previousAIResult`).
  - Actualizar `processedAt`, `approvedAt`, `rejectionReason` y `previousAIResult` de forma consistente.

Todas las operaciones siguen el patrón:

- Validar argumentos con Zod.
- Ejecutar operaciones de BD con Prisma, usando transacciones por email cuando aplica.
- Revalidar rutas (`/emails`, `/kanban`, `/`).

### 7.3 Server Actions de Kanban

**Archivo:** [`src/actions/kanban.ts`](src/actions/kanban.ts)

Responsabilidades:

- Obtener tareas para Kanban en base al modelo `Task`:
  - Filtro por contacto (`Contact.id` o email).
  - Filtro por estado (`todo`, `doing`, `done`).
  - Solo tareas de emails con `processedAt != null`.

- Obtener contactos para el selector Kanban:
  - Contactos con al menos una tarea.
  - Conteos de tareas por estado por contacto.

- Actualizar estado de una tarea:
  - Actualizar `Task.status` en BD.
  - Sincronizar campos `taskStatus`, `hasTask` y `taskDescription` en `EmailMetadata` para compatibilidad con vistas que dependen de estos campos.
  - Revalidar vistas (`/kanban`, `/dashboard`, `/emails`).

### 7.4 Validación de Datos ✅ COMPLETAMENTE IMPLEMENTADO

- Todos los módulos de acciones (`emails`, `ai-processing`, `kanban`) usan Zod para validar:
  - IDs (`string` no vacía).
  - Listas de IDs (mín. 1, máx. 10 para IA).
  - Paginación.
  - Estructura de JSON de importación.

### 7.5 Manejo de Errores ✅ IMPLEMENTADO

- Uso consistente de bloques `try/catch`.
- Logging en servidor con contexto (mensajes claros).
- Respuestas uniformes `{ success: boolean; data?; error?; message? }` en Server Actions.

---

## 8. Componentes UI y Sistema de Diseño ✅ IMPLEMENTADO Y AMPLIADO

### 8.1 Sistema de Diseño Completo

**Archivo principal:** [`src/app/globals.css`](src/app/globals.css)

Incluye:

- Variables de color, tipografía y espaciados.
- Estilos para:
  - Layout general (cards, contenedores, sidebar).
  - Badges de categoría/prioridad.
  - Tablero Kanban (columnas y tarjetas).
  - Estados de carga.
  - Utilidades responsive (`.hide-mobile`, etc.).

### 8.2 Componentes Base Implementados

**Button:** [`src/components/ui/button.tsx`](src/components/ui/button.tsx)

- Variantes (primary, secondary, outline, ghost, link, destructive).
- Tamaños (sm, md, lg, icon).
- Estados (disabled, loading) integrados con el sistema de diseño.

### 8.3 Componentes de Layout

**Layout principal:** [`src/components/layout/index.tsx`](src/components/layout/index.tsx)

- Sidebar con navegación (usando mock `navigation.ts`).
- Header con breadcrumbs y menú de usuario.
- Estructura responsive para rutas en `(protected)`.

### 8.4 Componentes de Emails

Ubicados en [`src/components/emails/`](src/components/emails/):

- `EmailTable`:
  - Tabla de emails con filtros básicos.
  - Selección múltiple de emails para procesamiento IA.
  - Integración con `ProcessEmailsModal`.

- `EmailDetailView`:
  - Detalle de email.
  - Muestra metadata IA si existe.

- `EmailMetadataSidebar`:
  - Muestra categoría, prioridad, resumen y tareas vinculadas.

- `ImportEmailsModal`:
  - Modal con drag & drop (`react-dropzone`).
  - Validación mínima de JSON en el cliente.
  - Enlace a plantilla `email-import-template.json`.

- `ProcessEmailsModal`:
  - Permite lanzar procesamiento IA sobre emails seleccionados.
  - Muestra progreso general y errores por email.

### 8.5 Componentes de Kanban

Ubicados en [`src/components/kanban/`](src/components/kanban/):

- `KanbanBoard`:
  - Renderiza columnas según `Task.status` (`todo`, `doing`, `done`).
  - Consume tareas desde `getKanbanTasks`.

- `KanbanColumn`:
  - Representa una columna de estado con contador de tareas.

- `TaskCard`:
  - Tarjeta con descripción, estado, tags, participantes y enlace al email.

- `KanbanFilters`:
  - Permite filtrar por contacto y estado de tarea.

- `KanbanContactSelector`:
  - Selector de contactos asociado al Kanban, basado en `getKanbanContacts`.

### 8.6 Componentes de Dashboard

Ubicados en [`src/components/dashboard/`](src/components/dashboard/):

- `MetricCard`:
  - Muestra métricas agregadas (total de emails, sin procesar, tareas, etc.).

- `CategoryChart`, `PriorityChart`:
  - Consumen datos de `getEmailsByCategory` y `getEmailsByPriority` para visualización.

### 8.7 Componentes de Procesamiento IA

Ubicados en [`src/components/processing/`](src/components/processing/):

- `ReviewAccordion`:
  - Lista de resultados IA pendientes como tarjetas plegables.
  - Filtros por categoría, prioridad y búsqueda.
  - Controles para aceptar o abrir modal de rechazo.

- `RejectReasonModal`:
  - Modal para capturar motivo(s) de rechazo.
  - Permite seleccionar una o varias razones predefinidas y/o texto libre (“Otro”).
  - Aplica validación mínima de longitud en texto libre.

- `EmailReviewCard`:
  - Componente cliente para revisión de un email con IA (estructura anterior).
  - El flujo actual de revisión usa `ReviewAccordion` y `RejectReasonModal` como solución unificada.

### 8.8 Shared Components

Ubicados en [`src/components/shared/`](src/components/shared/):

- `SearchBar`:
  - Componente reutilizable de búsqueda con icono y eventos.

- `EmptyState`:
  - Estados vacíos consistentes.

- `ErrorBoundary`:
  - Manejo de errores en la UI cliente.

### 8.9 Badges y Estados Semánticos ✅ IMPLEMENTADOS

- Badges de categoría (`cliente`, `lead`, `interno`, `spam`) y prioridad (`alta`, `media`, `baja`).
- Estilos usados en tablas, Kanban y pantalla de revisión IA.

### 8.10 Responsive Design ✅ COMPLETAMENTE IMPLEMENTADO

- Layouts adaptados a móvil y escritorio.
- Componentes críticos probados en pantallas pequeñas (tabla, Kanban, revisión IA).

---

## 9. Flujos de Datos y Procesos Clave ✅ DATOS REALES

### 9.1 Flujo Principal del Usuario ✅ FUNCIONANDO CON BASE DE DATOS

1. **Autenticación (Simulada):**
   - Usuario accede a `/login` y se simula login.
   - Redirección a `/emails`.

2. **Gestión de Emails:**
   - `/emails` muestra la tabla de emails desde BD.
   - Se pueden aplicar filtros básicos (según implementación actual).

3. **Procesamiento IA:**
   - Usuario selecciona emails sin procesar.
   - Abre `ProcessEmailsModal` y confirma procesamiento.
   - Se ejecuta `processEmailsWithAI`:
     - Llama a OpenAI.
     - Persiste metadata y tareas.
     - Marca `processedAt`.

4. **Revisión de Resultados IA:**
   - Usuario accede a `/processing/review`.
   - `getPendingAllAIResults` obtiene emails con IA procesada, aún no aprobados.
   - A través de `ReviewAccordion` puede:
     - Aceptar resultados (se marca `approvedAt`).
     - Rechazar resultados (se abre `RejectReasonModal`):
       - Se guarda `rejectionReason` y `previousAIResult`.
       - Se elimina metadata y tareas.
       - Se vuelve a estado `processedAt = null`.

5. **Visualización Kanban:**
   - `/kanban` muestra tareas (`Task`) en columnas por estado.
   - Permite filtrar por contacto y estado.

6. **Dashboard:**
   - `/dashboard` muestra métricas agregadas y gráficos por categoría/prioridad.

### 9.2 Procesamiento con IA (Estructura Lista)

- Emails importados se guardan en `Email`.
- IA genera `EmailMetadata` + `Task[]` + contactos relacionados (`Contact`).
- Resultados IA se almacenan antes de revisión (pendientes de aprobación).
- La UI usa estos datos para revisión y Kanban.

### 9.3 Flujos de Navegación ✅ IMPLEMENTADOS

- `/` → entrada principal (redirección o dashboard, según implementación actual).
- `/login` → login simulado.
- `/emails` → tabla de emails.
- `/emails/[id]` → detalle de email.
- `/processing/review` → revisión IA.
- `/kanban` → tablero Kanban.
- `/dashboard` → métricas.

---

## 10. Integraciones Externas

### 10.1 Base de Datos ✅ FUNCIONANDO

- PostgreSQL (Neon) con migraciones aplicadas.
- Prisma configurado en [`src/lib/prisma.ts`](src/lib/prisma.ts).

### 10.2 Integraciones Pendientes / En Uso

- **OpenAI API**:
  - Integración real en [`src/services/openai.ts`](src/services/openai.ts).
  - Uso controlado desde `processEmailsWithAI`.

- **NextAuth**:
  - Instalado pero no configurado (pendiente autenticación real).

### 10.3 No Implementado (Fuera de Alcance MVP)

- Integraciones con inbox real (Gmail/Outlook/IMAP/POP3).
- Notificaciones push/email externas.

---

## 11. Configuración y Despliegue ✅ CONFIGURADO

### 11.1 Scripts Disponibles ✅

Desde [`package.json`](package.json):

```json
{
  "scripts": {
    "dev": "next dev --webpack",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "eslint",
    "db:seed": "npx tsx prisma/seed.ts"
  }
}
```

### 11.2 Variables de Entorno ✅ IMPLEMENTADAS

- `DATABASE_URL` → conexión a Neon.
- `NEXT_PUBLIC_APP_URL` / `APP_URL` → URL de la app en local/producción (según configuración).
- `OPENAI_API_KEY` → requerida para procesamiento IA.

Variables previstas:

- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` para futura autenticación.

### 11.3 Despliegue (Configurado para Vercel)

- Next.js 16 App Router compatible con Vercel.
- Base de datos Neon lista.
- Pendiente completar configuración de variables en entorno de producción y pipeline de despliegue.

---

## 12. Seguridad y Rendimiento

### 12.1 Seguridad Implementada ✅

- Validación Zod en las operaciones de importación, procesamiento IA y manejo de IDs.
- Prisma protege frente a inyección SQL.
- Sin exposición directa de datos sensibles en mensajes de error.

Pendiente:

- Autenticación real y control de acceso.
- Rate limiting y protección de abuso en acciones intensivas (especialmente IA).

### 12.2 Rendimiento Implementado ✅

- Procesamiento IA en lotes de máximo 10 emails (`MAX_BATCH` en `openai.ts`).
- Rate limiter simple en llamadas a OpenAI (`RateLimiter` en `openai.ts`).
- Retry con backoff exponencial para errores transitorios.

---

## 13. Patrones y Convenciones de Código ✅ IMPLEMENTADOS

### 13.1 Convenciones de Nomenclatura ✅

- Archivos, tipos, componentes y funciones siguiendo los patrones descritos en [Sección 4.1](#41-convenciones-de-nomenclatura--implementadas).

### 13.2 Estructura de Server Actions ✅

- `"use server"` al inicio de cada archivo de acciones.
- Validación Zod antes de cualquier lógica de negocio.
- Uso de Prisma para acceso a BD.
- Uso de `revalidatePath` para mantener las vistas sincronizadas.

### 13.3 Estructura de Componentes ✅

- Componentes cliente solo cuando hay interacción (formularios, botones, filtros).
- Uso de hooks (`useState`, `useEffect`, `useTransition`, `useMemo`) donde corresponda.
- Separación entre contenedores (páginas) y componentes de presentación.

### 13.4 Gestión de Estado ✅

- Estado local para selección de emails, filtros de revisión IA y Kanban.
- Uso de Server Actions para datos persistentes.
- Pendiente definir cuándo será útil introducir Zustand para estados globales más complejos.

---

## 14. Estado Actual y Roadmap ✅ ACTUALIZADO

### 14.1 Funcionalidades Implementadas (Semanas 1–2)

- Layout y navegación con sidebar y header.
- Sistema de diseño global con CSS y utilidades responsive.
- Base de datos real con modelos IA (`Email`, `EmailMetadata`, `Task`, `Contact`, `Tag`).
- Server Actions de emails (`emails.ts`) completamente operativas.
- Importación de emails desde JSON con validación y transacciones.
- Tablero Kanban basado en `Task` y `Contact`.
- Dashboard con métricas agregadas.
- Procesamiento IA batch con OpenAI y validación Zod.

### 14.2 Roadmap por Hitos - Estado Real Verificado

Basado en documentos de planificación (**Semana 2 y 3**):

- **HITO 1 (BD)**: schema Prisma, migraciones y seed → ✅ completado.
- **HITO 2 (Server Actions core)**: acciones de emails y IA → ✅ completado.
- **HITO 3 (Integración Frontend-Backend)**: EmailTable, Kanban, Dashboard conectados → ✅ completado.
- **HITO 4 (Importación y UX)**: modal de importación con drag & drop → ✅ completado.
- **HITO 5 (Procesamiento IA + Revisión)**: flujo IA + revisión + rechazo → ✅ implementado.

### 14.3 Issues Resueltos ✅

- Reemplazo de datos mock por persistencia real.
- Gestión robusta de importación con manejo de errores por elemento.
- Integración IA real con validación y persistencia estructurada.
- Flujo de revisión y rechazo IA con campos adicionales en `Email`.

### 14.4 Issues Pendientes

- Autenticación y multiusuario.
- Drag & drop Kanban con `@dnd-kit/core`.
- Cobertura de tests más amplia y comando unificado de testing.
- Despliegue completo y verificación en entorno productivo.

---

## 15. Protocolo de Planificación ✅ SEGUIDO EXITOSAMENTE

El desarrollo del sistema sigue el protocolo documentado en [`doc/Protocolo de Planificacion.md`](doc/Protocolo%20de%20Planificacion.md):

- Features descompuestas en hitos (`HITO 1`–`HITO 4`).
- Documentación dedicada por feature:
  - [`doc/FEATURE2_PROCESAMIENTO_IA.md`](doc/FEATURE2_PROCESAMIENTO_IA.md).
  - [`doc/FEATURE_RECHAZO_METADATAEMAIL.md`](doc/FEATURE_RECHAZO_METADATAEMAIL.md).
  - [`doc/PLANIFICACION_FEATURE_RECHAZO_METADATAEMAIL.md`](doc/PLANIFICACION_FEATURE_RECHAZO_METADATAEMAIL.md).
- Cierre de hitos con verificación funcional y actualización del Sistema Maestro.

---

## 16. Nuevas Funcionalidades Implementadas ✅

### 16.1 Sistema de Importación Avanzado

- Modal con drag & drop (react-dropzone).
- Plantilla JSON descargable desde `/public/templates/email-import-template.json`.
- Validación básica client-side y validación completa server-side con Zod.
- Procesamiento por lotes (máx. 10 emails por transacción) en `importEmailsFromJSON`.

### 16.2 Procesamiento Inteligente de Emails con IA

- Servicio OpenAI en [`src/services/openai.ts`](src/services/openai.ts):
  - Modelos configurables (primario y fallback).
  - Rate limiting básico y reintentos automáticos.
  - Validación estricta de respuestas IA con Zod.
- Mapeos IA ↔ BD en [`src/lib/ai-mapper.ts`](src/lib/ai-mapper.ts):
  - Traducción de `EmailAnalysis` a `EmailMetadata` + `Task[]`.
  - Creación/actualización de contactos (`Contact`).
  - Gestión del catálogo de etiquetas (`Tag`).

### 16.3 Rechazo de Resultados IA con Metadata en `Email`

- Campos `rejectionReason` y `previousAIResult` en `Email` (ver [`prisma/schema.prisma`](prisma/schema.prisma)).
- Modal de rechazo (`RejectReasonModal`) que:
  - Permite seleccionar uno o varios motivos estándar.
  - Permite texto libre obligatorio cuando se elige “Otro”.
- Lógica en Server Actions (`confirmAIResults`, `rejectProcessingResultsWithReason`) que:
  - Persiste el motivo de rechazo.
  - Guarda un snapshot JSON del análisis descartado.
  - Restablece el estado de procesamiento del email.

---

## 17. Flujos de Datos Reales ✅ IMPLEMENTADOS

### 17.1 Arquitectura de Datos

```text
PostgreSQL (Neon) ←→ Prisma Client ←→ Server Actions ←→ React Components
```

- DB como fuente de verdad.
- Todas las vistas consumen datos reales desde Server Actions.

### 17.2 Flujo de Importación ✅ COMPLETAMENTE FUNCIONAL

```text
Archivo JSON → ImportEmailsModal → importEmailsFromJSON → Email (BD) → EmailTable
```

- Validación Zod de estructura.
- Manejo de errores por entrada y por lote.
- Revalidación de `/emails` tras importaciones exitosas.

### 17.3 Flujo de Procesamiento IA ✅ COMPLETAMENTE FUNCIONAL

```text
Selección en EmailTable → ProcessEmailsModal
   → processEmailsWithAI
      → processEmailsBatch (OpenAI)
      → ai-mapper (EmailMetadata + Task + Contact + Tag)
   → revalidatePath("/emails", "/kanban", "/")
```

### 17.4 Flujo de Revisión y Rechazo ✅ OPTIMIZADO

```text
getPendingAllAIResults → ReviewAccordion
  → Aceptar:
      confirmProcessingResults
  → Rechazar:
      RejectReasonModal
      rejectProcessingResultsWithReason
      (snapshot + motivo, email vuelve a sin procesar)
```

- UI muestra:
  - Contenido del email.
  - Clasificación IA (categoría, prioridad, resumen, contacto).
  - Tareas sugeridas con estado, fecha, tags y participantes.

---

## 18. Configuración Actual de Desarrollo ✅

### 18.1 Base de Datos Configurada

- Prisma apuntando a Neon.
- Migraciones actualizadas (incluyendo modelos IA y campos de rechazo).
- Seed con ejemplos que cubren:
  - Emails sin procesar.
  - Emails con metadata IA.
  - Emails con tareas IA.

### 18.2 Scripts de Desarrollo

- `npm run dev` → inicio en modo desarrollo.
- `npm run build` → comprobación de build y Typescript.
- `npm run lint` → linting.
- `npm run db:seed` → seed de BD con datos de ejemplo.

---

## 19. Próximos Pasos Inmediatos

### Semana 3 - Funcionalidades Avanzadas

**Prioridad Alta:**

1. Configurar autenticación real con NextAuth (Google OAuth).
2. Asignar `userId` a `Email` y filtrar por usuario en Server Actions.
3. Integrar feedback de rechazo (`rejectionReason`, `previousAIResult`) en el prompt de reprocesamiento IA.

**Prioridad Media:**

4. Implementar drag & drop real en Kanban con `@dnd-kit/core`.
5. Consolidar comandos y estrategia de testing automático.
6. Preparar despliegue a producción (Vercel) con variables de entorno apropiadas.

### Optimizaciones Técnicas Pendientes

- Uso de Suspense/streaming en rutas con listas grandes (emails, Kanban).
- Optimización de consultas Prisma con `select`/`include` mínimos.
- Monitorización de consumo de tokens y coste aproximado de IA.

---

## 20. Conclusión del Estado Actual

### 20.1 Logros Principales ✅

- El sistema ha evolucionado de un prototipo con datos mock a una aplicación funcional que:
  - Importa emails desde JSON a una BD real.
  - Procesa emails con IA real (OpenAI).
  - Genera metadata y tareas estructuradas.
  - Ofrece revisión humana y registro de rechazo IA.
  - Organiza tareas en un tablero Kanban basado en `Task` y `Contact`.

### 20.2 Valor Entregado al Usuario

- Bandeja de entrada centralizada y persistente.
- Clasificación automática con revisión humana.
- Visualización clara de tareas por estado y contacto.
- Métricas básicas de uso y distribución de emails.

### 20.3 Preparación para IA

- Modelos de datos adaptados a IA (`EmailMetadata`, `Task`, `Contact`, `Tag`).
- Servicio OpenAI configurado y validado con Zod.
- Campos adicionales en `Email` para feedback de rechazo y reprocesamiento.

### 20.4 Métricas del Proyecto (Estimación Actual)

- Código TypeScript y React en `src/` con tipado estricto.
- Esquema Prisma con múltiples modelos relacionados para IA.
- Tests mock existentes para IA y Kanban.
- Dependencias centradas en Next.js + Prisma + OpenAI.

---

## 21. Actualización Semana 3 - HITO 2 (En progreso)

### 21.1 Resumen del Avance Técnico (HITO 2 IA + Rechazo)

- Esquema Prisma actualizado con:
  - `EmailMetadata` extendido (`summary`, `contactName`, relación con `Task`).
  - Nuevos modelos `Task`, `Contact`, `Tag`.
  - Campos `rejectionReason` y `previousAIResult` en `Email`.
- Migraciones aplicadas para estos cambios.
- Seed actualizado con estructura completa (incluyendo tareas IA).
- Server Actions para procesamiento IA y revisión/rechazo implementadas en [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts).
- Pantalla de revisión IA (`/processing/review`) rediseñada sobre `ReviewAccordion` + `RejectReasonModal`.

### 21.2 Cambios de Base de Datos (HITO 2)

- Introducción de modelos `Task`, `Contact` y `Tag` (ver [`prisma/schema.prisma`](prisma/schema.prisma)).
- Extensión de `EmailMetadata` con `summary`, `contactName` y relación con `Task`.
- Extensión de `Email` con `rejectionReason` y `previousAIResult`.

### 21.3 Server Actions (HITO 2)

- `getUnprocessedEmails`:
  - Emails sin IA (`processedAt = null`) con paginación.
- `processEmailsWithAI`:
  - Orquestación completa de procesamiento IA.
- `getPendingAIResults` / `getPendingAllAIResults`:
  - Emails con IA procesada y no aprobada.
- `confirmAIResults` / `confirmProcessingResults`:
  - Confirmación y aprobación de resultados IA.
- `rejectProcessingResultsWithReason` / `rejectProcessingResults`:
  - Rechazo con motivo o sin motivo explícito.
  - Gestión de snapshot y retorno a estado sin procesar.

### 21.4 Servicio de Mapeo y Persistencia

- [`src/lib/ai-mapper.ts`](src/lib/ai-mapper.ts):
  - Funciones para mapear emails a inputs de IA.
  - Construir argumentos de upsert para `EmailMetadata` y `Task`.
  - Crear/actualizar `Contact` según remitente y participantes.

### 21.5 Seed de Datos Ajustado (Compatibilidad con IA)

- [`prisma/seed.ts`](prisma/seed.ts):
  - Datos de ejemplo con `EmailMetadata` y `Task`.
  - Casos con y sin tareas IA.
  - Preparación para probar flujos de Kanban y revisión IA.


---