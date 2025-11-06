# 📋 Historias de Usuario - Semana 1 (Frontend Only)

**Proyecto:** Sistema de Gestión Inteligente de Emails  
**Sprint:** Semana 1 - Maqueta Visual (UI Mockup)  
**Objetivo:** Desplegar interfaz navegable con datos mock en Vercel

---

## 🔐 HU-UI-001: Pantalla de Login con Google

> **Descripción:** Pantalla inicial que simula el proceso de autenticación mediante Google OAuth.

**Como:** Ejecutivo comercial  
**Quiero:** Ver una pantalla de inicio de sesión profesional con opción de Google  
**Para:** Entender cómo será el flujo de acceso al sistema

---

### 2. Resumen Técnico (Frontend)

Se creará una página en `/login` que mostrará una interfaz centrada con el logo del sistema, un título de bienvenida y un botón para "Iniciar sesión con Google". Al hacer clic, el botón simulará la navegación hacia `/emails` (ruta protegida) usando un simple router.push(). No habrá validación real de OAuth en esta semana, solo la maqueta visual del flujo.

---

### 3. Criterios de Aceptación (CA) - Foco 100% Visual

#### CA-L: Layout y Estructura (El "Dónde")

* **CA-L-01:** La interfaz debe estar centrada vertical y horizontalmente en la pantalla, ocupando el viewport completo.
* **CA-L-02:** El layout debe ser totalmente responsive: se ve correctamente en Desktop (>1024px), Tablet (768-1024px) y Móvil (<768px).
* **CA-L-03:** No debe existir navegación visible (sidebar/navbar) en esta pantalla, solo el contenido de login.

#### CA-C: Componentes (El "Qué")

* **CA-C-01:** Debe renderizarse un logo o ícono representativo del sistema (puede ser un ícono de `lucide-react` como `Mail` o `Inbox`) en la parte superior.
* **CA-C-02:** Debe mostrarse un título principal (H1) con el texto "Sistema de Gestión de Emails" o similar.
* **CA-C-03:** Debe incluirse un subtítulo (párrafo) con texto descriptivo como "Organiza tus emails con inteligencia artificial".
* **CA-C-04:** Debe renderizarse un componente `<Button>` de shadcn/ui con el texto "Continuar con Google" y un ícono de Google.
* **CA-C-05:** Debe incluirse un footer con texto legal opcional como "Al continuar, aceptas nuestros términos de servicio".

#### CA-I: Interacciones Simuladas (El "Cómo")

* **CA-I-01:** Al hacer clic en el botón "Continuar con Google", se debe navegar a la ruta `/emails` (simulando autenticación exitosa).
* **CA-I-02:** El botón debe mostrar un estado visual de hover con cambio de color o sombra.
* **CA-I-03:** El botón debe tener un estado de loading simulado (opcional): mostrar un spinner durante 1 segundo antes de navegar.

---

### 4. Flujo y Estados de la UI (Maquetados)

* **Estado Ideal (Success):**
  * Se muestra la pantalla completa de login con todos los elementos descritos.
* **Estado de Carga (Loading - Opcional):**
  * Al hacer clic en el botón, este cambia su texto a "Iniciando sesión..." y muestra un spinner por 1 segundo antes de navegar.

---

### 5. Estándares de UI y Calidad Visual

* **Accesibilidad (a11y):** El botón principal debe ser navegable por teclado (Tab + Enter).
* **Consistencia:** Usar los colores primarios definidos en el sistema de diseño para el botón principal.
* **Fidelidad:** La UI debe seguir el mockup generado en v0.dev para esta pantalla.

---

### 6. Dependencias (Assets Requeridos)

* **Diseño:** Mockup de v0.dev para pantalla de login (guardar screenshot en `/mockups/login.png`).
* **Iconos:** Ícono de Google (puede ser de `lucide-react` o SVG personalizado), ícono de email para logo.
* **Datos Falsos:** No requiere mock data, solo elementos estáticos.

---

### 7. Componentes Involucrados (UI Kit)

* **Componentes de shadcn/ui:**
  * `Button` (variante default y con ícono)
  * `Card` (opcional, si se quiere encapsular el contenido de login)
* **Componentes Locales (Nuevos):**
  * No se requieren componentes personalizados adicionales para esta vista.

---

### 8. Estructura de Datos Mock (El Contrato Falso)

No aplica para esta historia de usuario. No se requieren datos mock.


---

## 📧 HU-UI-002: Listado de Emails con Tabla Interactiva

> **Descripción:** Pantalla principal que muestra todos los emails importados en formato de tabla, permitiendo búsqueda, ordenamiento y selección múltiple.

**Como:** Ejecutivo comercial  
**Quiero:** Ver mis emails organizados en una tabla clara con opciones de búsqueda y filtrado  
**Para:** Localizar rápidamente emails importantes y seleccionar los que necesito procesar

---

### 2. Resumen Técnico (Frontend)

Se creará una página en `/emails` que mostrará una tabla interactiva consumiendo datos desde `/lib/mock-data/emails.ts`. La página incluirá un header con barra de búsqueda, botones de acción ("Importar JSON", "Procesar con IA"), y una tabla con columnas: checkbox, remitente, asunto, fecha y estado. La tabla debe permitir ordenamiento por fecha, búsqueda por remitente/asunto, y selección múltiple mediante checkboxes. Al hacer clic en una fila, se navega a `/emails/[id]` para ver el detalle.

---

### 3. Criterios de Aceptación (CA) - Foco 100% Visual

#### CA-L: Layout y Estructura (El "Dónde")

* **CA-L-01:** La interfaz se divide en tres secciones verticales: Header con título y acciones, Barra de herramientas con búsqueda y filtros, y Tabla principal con datos.
* **CA-L-02:** El layout debe ser responsive: en Desktop (>1024px) mostrar tabla completa, en Tablet (768-1024px) ocultar columna de estado, en Móvil (<768px) mostrar cards apiladas en lugar de tabla.
* **CA-L-03:** Debe existir un Sidebar de navegación visible con las opciones: "Emails", "Kanban", y debe mostrar "Emails" como activo.
* **CA-L-04:** Debe incluirse paginación al final de la tabla mostrando "Mostrando 1-10 de 15 emails" (según el mock data).

#### CA-C: Componentes (El "Qué")

* **CA-C-01:** El Header debe renderizar un título (H1) "Mis Emails" y dos botones: "Importar JSON" y "Procesar con IA" (ambos deshabilitados visualmente por ahora).
* **CA-C-02:** La Barra de herramientas debe incluir un componente `<Input>` con placeholder "Buscar por remitente o asunto..." y un ícono de búsqueda.
* **CA-C-03:** La Tabla debe renderizar las columnas: Checkbox, Remitente (email), Asunto, Fecha recibida, Estado (badge).
* **CA-C-04:** Cada fila de la tabla debe renderizar un componente `<Checkbox>` al inicio, datos de texto en las columnas centrales, y un `<Badge>` al final según el estado (procesado/sin procesar).
* **CA-C-05:** La columna "Fecha" debe mostrar formato amigable como "Hace 2 días" o "28 Oct 2024".
* **CA-C-06:** Si el mock data está vacío, se debe mostrar un componente `<EmptyState>` con mensaje "No hay emails importados aún" y un botón "Importar JSON".
* **CA-C-07:** El botón "Procesar con IA" debe mostrar un contador dinámico como "Procesar con IA (3)" cuando hay emails seleccionados.

#### CA-I: Interacciones Simuladas (El "Cómo")

* **CA-I-01:** Al hacer clic en el checkbox del header de la tabla, todos los checkboxes de las filas deben marcarse/desmarcarse (selección masiva simulada).
* **CA-I-02:** Al seleccionar uno o más emails mediante checkboxes, el botón "Procesar con IA" debe habilitarse visualmente y mostrar el contador.
* **CA-I-03:** Al hacer clic en una fila de la tabla (excluyendo el checkbox), se debe navegar a `/emails/[id]` usando el ID del mock data.
* **CA-I-04:** Al escribir en la barra de búsqueda, la tabla debe filtrar visualmente los resultados en tiempo real según coincidencias en remitente o asunto.
* **CA-I-05:** Al hacer clic en el header de la columna "Fecha", la tabla debe reordenarse alternando entre ascendente/descendente (mostrar ícono de flecha).
* **CA-I-06:** Al hacer hover sobre una fila, debe cambiar el color de fondo sutilmente para indicar que es clickeable.
* **CA-I-07:** El botón "Importar JSON" debe mostrar un `<Toast>` simulado con mensaje "Funcionalidad disponible en Semana 2" al hacer clic.
* **CA-I-08:** El botón "Procesar con IA" (cuando esté habilitado) debe mostrar un `<Toast>` simulado con mensaje "Procesamiento con IA disponible en Semana 2".

---

### 4. Flujo y Estados de la UI (Maquetados)

* **Estado Ideal (Success):**
  * Se muestra la tabla renderizando los 15 emails del archivo `/lib/mock-data/emails.ts`.
* **Estado Vacío (Empty):**
  * Importar un array vacío (`mockEmails = []`) y verificar que el componente `<EmptyState>` se renderice correctamente.
* **Estado de Búsqueda sin Resultados:**
  * Al buscar un término que no coincide con ningún email, mostrar mensaje "No se encontraron emails con ese criterio".
* **Estado de Selección Activa:**
  * Al tener emails seleccionados, el botón "Procesar con IA" debe cambiar de color para indicar que está activo.

---

### 5. Estándares de UI y Calidad Visual

* **Accesibilidad (a11y):** La tabla debe ser navegable por teclado (Tab para moverse entre filas, Enter para abrir detalle).
* **Consistencia:** Usar badges con colores semánticos: "Sin procesar" (gris), "Procesado" (verde).
* **Fidelidad:** La UI debe coincidir con el mockup de v0.dev para esta pantalla.

---

### 6. Dependencias (Assets Requeridos)

* **Diseño:** Mockup de v0.dev para listado de emails (guardar en `/mockups/emails-list.png`).
* **Datos Falsos:** Crear archivo `/lib/mock-data/emails.ts` con al menos 15 emails (ver sección 8).
* **Iconos:** Íconos de `lucide-react`: Search, Upload, Sparkles (para IA), ChevronDown/Up (ordenamiento).

---

### 7. Componentes Involucrados (UI Kit)

* **Componentes de shadcn/ui:**
  * `Button`
  * `Input`
  * `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`
  * `Checkbox`
  * `Badge`
  * `Toast`
* **Componentes Locales (Nuevos):**
  * `src/components/emails/EmailTable.tsx`
  * `src/components/emails/EmailTableRow.tsx`
  * `src/components/shared/SearchBar.tsx`
  * `src/components/shared/EmptyState.tsx`

---

### 8. Estructura de Datos Mock (El Contrato Falso)

**Ubicación:** `lib/mock-data/emails.ts`

**Tipo (Interface):**

```typescript
interface EmailMock {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string; // ISO format
  processed: boolean;
  category: 'cliente' | 'lead' | 'interno' | 'spam' | null;
  priority: 'alta' | 'media' | 'baja' | null;
  hasTask: boolean;
  taskDescription: string | null;
  taskStatus: 'todo' | 'doing' | 'done' | null;
}
```

**Datos (Array de Ejemplo):**

```typescript
export const mockEmails: EmailMock[] = [
  {
    id: 'email-001',
    from: 'maria.gonzalez@acmecorp.com',
    subject: 'Urgente: Propuesta Q4 necesita revisión',
    body: 'Hola, necesitamos revisar la propuesta para el cuarto trimestre...',
    receivedAt: '2024-11-01T09:15:00Z',
    processed: true,
    category: 'cliente',
    priority: 'alta',
    hasTask: true,
    taskDescription: 'Actualizar números de propuesta Q4 y agendar llamada',
    taskStatus: 'todo'
  },
  {
    id: 'email-002',
    from: 'prospecto@nuevaempresa.com',
    subject: 'Consulta sobre servicios de desarrollo',
    body: 'Buenos días, somos una startup que busca desarrollar una plataforma web...',
    receivedAt: '2024-11-01T10:30:00Z',
    processed: true,
    category: 'lead',
    priority: 'media',
    hasTask: true,
    taskDescription: 'Enviar información de servicios y agendar demo',
    taskStatus: 'doing'
  },
  {
    id: 'email-003',
    from: 'equipo@miempresa.com',
    subject: 'Actualización semanal del proyecto',
    body: 'Equipo, adjunto el reporte semanal. Todo avanza según lo planificado.',
    receivedAt: '2024-11-01T14:00:00Z',
    processed: true,
    category: 'interno',
    priority: 'baja',
    hasTask: false,
    taskDescription: null,
    taskStatus: null
  },
  // ... agregar 12 emails más variados
];
```

---

---

## 📄 HU-UI-003: Vista Detallada de Email Individual

> **Descripción:** Pantalla o modal que muestra el contenido completo de un email seleccionado, incluyendo toda su metadata generada por IA.

**Como:** Ejecutivo comercial  
**Quiero:** Ver el contenido completo de un email con todos sus detalles y metadata de IA  
**Para:** Entender el contexto completo antes de tomar acciones

---

### 2. Resumen Técnico (Frontend)

Se creará una página dinámica en `/emails/[id]` que mostrará el detalle completo de un email. La página consumirá el email específico desde el array de mock data usando el ID de la ruta. Se dividirá en dos secciones: contenido principal del email (remitente, asunto, cuerpo) y sidebar derecho con metadata de IA (categoría, prioridad, tarea detectada). Incluirá un botón "Volver a la lista" y botones de acción simulados.

---

### 3. Criterios de Aceptación (CA) - Foco 100% Visual

#### CA-L: Layout y Estructura (El "Dónde")

* **CA-L-01:** La interfaz se divide en dos columnas: 70% para contenido del email (izquierda) y 30% para metadata de IA (derecha).
* **CA-L-02:** En Móvil (<768px), las columnas deben apilarse verticalmente: primero el contenido del email, luego la metadata.
* **CA-L-03:** Debe incluirse un header con botón "← Volver a Emails" alineado a la izquierda.
* **CA-L-04:** El Sidebar de navegación debe permanecer visible (igual que en otras páginas).

#### CA-C: Componentes (El "Qué")

* **CA-C-01:** El Header del email debe mostrar: Avatar o ícono del remitente, Nombre/Email del remitente, Fecha de recepción formateada, y Asunto como título principal (H1).
* **CA-C-02:** El Cuerpo del email debe renderizarse en un `<Card>` con fondo claro, mostrando el texto completo con scroll si es necesario.
* **CA-C-03:** El Sidebar derecho debe incluir:
  * Sección "Categoría" con un `<Badge>` de color según tipo (Cliente/Lead/Interno/Spam).
  * Sección "Prioridad" con un `<Badge>` de color según nivel (Alta/Media/Baja).
  * Sección "Tarea Detectada" (solo si `hasTask: true`) con ícono de checkbox y descripción de la tarea.
  * Sección "Estado de Tarea" (solo si tiene tarea) con dropdown simulado mostrando el estado actual.
* **CA-C-04:** Si el email NO tiene metadata de IA (`processed: false`), el sidebar debe mostrar un `<Alert>` con mensaje "Este email aún no ha sido procesado con IA" y un botón "Procesar ahora" (deshabilitado).
* **CA-C-05:** Al final del contenido, debe incluirse una barra de acciones con botones: "Editar metadata", "Marcar como spam", "Archivar" (todos simulados).

#### CA-I: Interacciones Simuladas (El "Cómo")

* **CA-I-01:** Al hacer clic en "← Volver a Emails", se debe navegar de vuelta a `/emails`.
* **CA-I-02:** Al hacer clic en cualquiera de los botones de acción (Editar, Marcar como spam, Archivar), debe mostrarse un `<Toast>` con mensaje "Funcionalidad disponible en Semana 2".
* **CA-I-03:** Al hacer clic en el dropdown de "Estado de Tarea", debe mostrarse visualmente las opciones (Por hacer/En progreso/Completado) pero sin cambiar el valor real (solo visual).
* **CA-I-04:** Si el email tiene tarea, debe mostrarse un botón adicional "Ver en Kanban" que navegue a `/kanban` con scroll automático hacia esa tarea (simulado).

---

### 4. Flujo y Estados de la UI (Maquetados)

* **Estado Ideal (Success):**
  * Email procesado con toda la metadata visible en el sidebar.
* **Estado Sin Procesar:**
  * Email sin metadata (`processed: false`), mostrando alert en sidebar.
* **Estado Sin Tarea:**
  * Email procesado pero sin tarea detectada (`hasTask: false`), ocultando sección de "Tarea Detectada".
* **Estado de Error (Simulado):**
  * Si el ID en la URL no existe en el mock data, mostrar `<EmptyState>` con mensaje "Email no encontrado" y botón para volver.

---

### 5. Estándares de UI y Calidad Visual

* **Accesibilidad (a11y):** El botón "Volver" debe ser navegable por teclado.
* **Consistencia:** Usar los mismos colores de badges que en la tabla de emails.
* **Fidelidad:** La UI debe seguir el mockup de v0.dev para vista detalle.

---

### 6. Dependencias (Assets Requeridos)

* **Diseño:** Mockup de v0.dev para vista detalle de email (guardar en `/mockups/email-detail.png`).
* **Datos Falsos:** Usar el mismo archivo `/lib/mock-data/emails.ts`, filtrar por ID.
* **Iconos:** Íconos de `lucide-react`: ArrowLeft, Mail, Calendar, Tag, AlertCircle, CheckCircle.

---

### 7. Componentes Involucrados (UI Kit)

* **Componentes de shadcn/ui:**
  * `Card`, `CardHeader`, `CardContent`
  * `Badge`
  * `Button`
  * `Alert`, `AlertDescription`
  * `Separator`
  * `Avatar`
  * `Select` (para dropdown de estado)
  * `Toast`
* **Componentes Locales (Nuevos):**
  * `src/components/emails/EmailDetailView.tsx`
  * `src/components/emails/EmailMetadataSidebar.tsx`

---

### 8. Estructura de Datos Mock (El Contrato Falso)

Usa el mismo tipo `EmailMock` definido en HU-UI-002. El componente debe buscar el email por ID:

```typescript
const email = mockEmails.find(e => e.id === params.id)
```

---

---

## 📊 HU-UI-004: Tablero Kanban de Tareas

> **Descripción:** Vista tipo tablero Kanban que organiza visualmente las tareas detectadas en los emails procesados, divididas en tres columnas según su estado.

**Como:** Ejecutivo comercial  
**Quiero:** Ver todas mis tareas pendientes organizadas en un tablero visual tipo Kanban  
**Para:** Priorizar mi trabajo y tener claridad sobre el progreso de cada tarea

---

### 2. Resumen Técnico (Frontend)

Se creará una página en `/kanban` que mostrará un tablero con tres columnas verticales: "Por Hacer", "En Progreso" y "Completado". El componente filtrará automáticamente solo los emails que tienen `hasTask: true` desde `/lib/mock-data/emails.ts` y los agrupará según `taskStatus`. Cada tarea se renderizará como una card que muestra información resumida del email. En esta semana, el drag & drop será solo visual (no funcional), pero las cards deben verse movibles. Incluirá filtros básicos por categoría y prioridad en el header.

---

### 3. Criterios de Aceptación (CA) - Foco 100% Visual

#### CA-L: Layout y Estructura (El "Dónde")

* **CA-L-01:** La interfaz se divide en: Header con título y filtros, y Área principal con 3 columnas de igual ancho dispuestas horizontalmente.
* **CA-L-02:** Cada columna debe tener: Título de la columna, Badge con contador de tareas, y Área scrolleable con las cards de tareas.
* **CA-L-03:** En Móvil (<768px), las columnas deben apilarse verticalmente manteniendo el orden: Por Hacer → En Progreso → Completado.
* **CA-L-04:** En Tablet (768-1024px), mostrar 2 columnas por fila con scroll horizontal opcional.
* **CA-L-05:** El Sidebar de navegación debe mostrar "Kanban" como opción activa.

#### CA-C: Componentes (El "Qué")

* **CA-C-01:** El Header debe incluir: Título (H1) "Mis Tareas", y dos `<Select>` para filtrar por Categoría y Prioridad.
* **CA-C-02:** Cada columna debe renderizar: Un encabezado con título ("Por Hacer", "En Progreso", "Completado") y un `<Badge>` con el número de tareas.
* **CA-C-03:** Cada Task Card debe mostrar:
  * Asunto del email (truncado a 2 líneas máximo).
  * Badge de Prioridad (Alta/Media/Baja con colores).
  * Badge de Categoría (Cliente/Lead/Interno).
  * Email del remitente.
  * Descripción breve de la tarea (truncada a 3 líneas).
  * Ícono visual de "drag handle" (⋮⋮) para indicar que es movible.
* **CA-C-04:** Si una columna está vacía, debe mostrar un placeholder con mensaje "No hay tareas en [estado]" y un ícono decorativo.
* **CA-C-05:** Si NO hay ninguna tarea en el mock data (todos los emails tienen `hasTask: false`), mostrar un `<EmptyState>` global con mensaje "No hay tareas detectadas aún" y sugerencia de procesar emails con IA.

#### CA-I: Interacciones Simuladas (El "Cómo")

* **CA-I-01:** Al hacer clic en una Task Card, debe navegarse a `/emails/[id]` para ver el email completo en contexto.
* **CA-I-02:** Al hacer hover sobre una Task Card, debe mostrarse una sombra más pronunciada y cambio de cursor a pointer.
* **CA-I-03:** Al arrastrar una card (simulación visual solamente), debe mostrarse un efecto de "elevación" pero NO debe cambiar de columna realmente (funcionalidad para Semana 2).
* **CA-I-04:** Al cambiar los filtros de Categoría o Prioridad, las cards deben filtrarse visualmente en tiempo real (simulación con JavaScript, sin persistencia).
* **CA-I-05:** El botón de filtro debe mostrar un contador como "Filtros (2)" cuando hay filtros activos.
* **CA-I-06:** Debe existir un botón "Limpiar filtros" que resetee todas las selecciones de filtro.

---

### 4. Flujo y Estados de la UI (Maquetados)

* **Estado Ideal (Success):**
  * Se muestran las 3 columnas con las tareas distribuidas según `taskStatus` del mock data.
* **Estado Vacío General:**
  * Si NO hay emails con tareas (`hasTask: false` en todos), mostrar `<EmptyState>` global.
* **Estado de Columna Vacía:**
  * Si una columna específica no tiene tareas (ej: "Completado"), mostrar placeholder dentro de esa columna.
* **Estado Con Filtros Activos:**
  * Al aplicar filtros que no coinciden con ninguna tarea, mostrar mensaje "No se encontraron tareas con esos criterios".

---

### 5. Estándares de UI y Calidad Visual

* **Accesibilidad (a11y):** Las cards deben ser navegables por teclado (Tab + Enter para abrir detalle).
* **Consistencia:** Usar los mismos badges de categoría y prioridad que en las vistas de emails.
* **Fidelidad:** La UI debe seguir el mockup de v0.dev para el Kanban.

---

### 6. Dependencias (Assets Requeridos)

* **Diseño:** Mockup de v0.dev para tablero Kanban (guardar en `/mockups/kanban-board.png`).
* **Datos Falsos:** Usar `/lib/mock-data/emails.ts`, filtrar donde `hasTask: true` y agrupar por `taskStatus`.
* **Iconos:** Íconos de `lucide-react`: GripVertical (drag handle), Filter, X (limpiar filtros), CheckCircle, Circle, Clock.

---

### 7. Componentes Involucrados (UI Kit)

* **Componentes de shadcn/ui:**
  * `Card`, `CardHeader`, `CardContent`
  * `Badge`
  * `Select`
  * `Button`
* **Componentes Locales (Nuevos):**
  * `src/components/kanban/KanbanBoard.tsx`
  * `src/components/kanban/KanbanColumn.tsx`
  * `src/components/kanban/TaskCard.tsx`
  * `src/components/kanban/KanbanFilters.tsx`

---

### 8. Estructura de Datos Mock (El Contrato Falso)

Usa el mismo tipo `EmailMock` definido en HU-UI-002. El componente debe:

1. Filtrar: `const tasks = mockEmails.filter(email => email.hasTask)`
2. Agrupar por: `taskStatus` ('todo', 'doing', 'done')

Ejemplo de agrupación visual:

```typescript
const tasksByStatus = {
  todo: tasks.filter(t => t.taskStatus === 'todo'),
  doing: tasks.filter(t => t.taskStatus === 'doing'),
  done: tasks.filter(t => t.taskStatus === 'done')
}
```

---

---

## 🏠 HU-UI-005: Dashboard Principal (Home)

> **Descripción:** Pantalla de inicio que muestra un resumen visual con métricas clave del sistema y accesos rápidos a las funcionalidades principales.

**Como:** Ejecutivo comercial  
**Quiero:** Ver un resumen general de mis emails y tareas al entrar al sistema  
**Para:** Tener una visión rápida del estado de mi bandeja y pendientes

---

### 2. Resumen Técnico (Frontend)

Se creará una página en `/` (o `/dashboard`) que servirá como landing page después del login. La página mostrará cards con métricas calculadas desde el mock data (total emails, emails sin procesar, tareas pendientes, tareas completadas), botones de acceso rápido a las funcionalidades principales, y opcionalmente un gráfico decorativo o lista de emails recientes. Esta es una vista de alto nivel sin interacciones complejas.

---

### 3. Criterios de Aceptación (CA) - Foco 100% Visual

#### CA-L: Layout y Estructura (El "Dónde")

* **CA-L-01:** La interfaz se divide en: Header con saludo personalizado, Grid de métricas (4 cards), y Sección de accesos rápidos.
* **CA-L-02:** El Grid de métricas debe ser de 4 columnas en Desktop (>1024px), 2 columnas en Tablet (768-1024px), y 1 columna en Móvil (<768px).
* **CA-L-03:** Debe existir una sección inferior opcional con "Emails Recientes" mostrando las últimas 5 entradas del mock data.
* **CA-L-04:** El Sidebar de navegación debe mostrar "Dashboard" o el ícono de inicio como activo.

#### CA-C: Componentes (El "Qué")

* **CA-C-01:** El Header debe incluir: Saludo personalizado (ej: "Bienvenido, Usuario") y fecha/hora actual.
* **CA-C-02:** Cada Metric Card debe mostrar: Ícono representativo, Título de la métrica, Número grande (valor calculado del mock data), y Texto descriptivo opcional.
* **CA-C-03:** Las 4 Metric Cards deben ser:
  * "Total de Emails" (cuenta todos los emails en mock data).
  * "Emails Sin Procesar" (cuenta donde `processed: false`).
  * "Tareas Pendientes" (cuenta donde `hasTask: true` y  `taskStatus!==done` ).
  * "Tareas Completadas" (cuenta donde `hasTask: true
  y  `taskStatus === done` ).
* **CA-C-04:** La sección de accesos rápidos debe incluir 3 botones grandes tipo card:
  * "Ver Todos los Emails" → navega a `/emails`
  * "Ir al Kanban" → navega a `/kanban`
  * "Importar Emails" → muestra Toast "Disponible en Semana 2"
* **CA-C-05:** La sección "Emails Recientes" debe mostrar una lista compacta de los últimos 5 emails ordenados por fecha, mostrando: remitente, asunto (truncado), y tiempo relativo (ej: "Hace 2 horas").
* **CA-C-06:** Si el mock data está completamente vacío, mostrar un `<EmptyState>` con mensaje de bienvenida y sugerencia de "Comenzar importando emails".

#### CA-I: Interacciones Simuladas (El "Cómo")

* **CA-I-01:** Al hacer clic en cualquier Metric Card, debe navegarse a la vista correspondiente (ej: click en "Tareas Pendientes" → `/kanban`).
* **CA-I-02:** Al hacer clic en los botones de acceso rápido, debe ejecutarse la acción correspondiente (navegación o toast).
* **CA-I-03:** Al hacer clic en un email de la lista "Emails Recientes", debe navegarse a `/emails/[id]`.
* **CA-I-04:** Las Metric Cards deben mostrar efecto hover con ligero cambio de elevación para indicar que son clickeables.
* **CA-I-05:** Debe existir un pequeño botón de "Refrescar" en el header que simule actualización de métricas (muestra toast "Actualizado" sin cambiar valores reales).

---

### 4. Flujo y Estados de la UI (Maquetados)

* **Estado Ideal (Success):**
  * Dashboard completo con métricas calculadas desde mock data y lista de emails recientes.
* **Estado Vacío (Empty):**
  * Si `mockEmails = []`, mostrar `<EmptyState>` de bienvenida con ilustración y CTA para importar.
* **Estado Parcial:**
  * Si hay emails pero ninguno procesado, las métricas de "Emails Sin Procesar" y "Tareas" reflejan esto correctamente.
* **Estado de Carga (Loading - Opcional):**
  * Simular loading de 1 segundo al entrar, mostrando `<Skeleton>` en las cards de métricas.

---

### 5. Estándares de UI y Calidad Visual

* **Accesibilidad (a11y):** Todas las cards y botones deben ser navegables por teclado.
* **Consistencia:** Usar los colores del sistema de diseño para los íconos de métricas (azul para emails, verde para tareas completadas, amarillo para pendientes).
* **Fidelidad:** La UI debe seguir el mockup de v0.dev para dashboard.

---

### 6. Dependencias (Assets Requeridos)

* **Diseño:** Mockup de v0.dev para dashboard (guardar en `/mockups/dashboard.png`).
* **Datos Falsos:** Usar `/lib/mock-data/emails.ts` para calcular métricas y mostrar recientes.
* **Iconos:** Íconos de `lucide-react`: Mail, Clock, CheckSquare, BarChart, RefreshCw, ArrowRight.

---

### 7. Componentes Involucrados (UI Kit)

* **Componentes de shadcn/ui:**
  * `Card`, `CardHeader`, `CardContent`, `CardFooter`
  * `Button`
  * `Separator`
  * `Skeleton` (loading state)
* **Componentes Locales (Nuevos):**
  * `src/components/dashboard/MetricCard.tsx`
  * `src/components/dashboard/QuickActionCard.tsx`
  * `src/components/dashboard/RecentEmailsList.tsx`

---

### 8. Estructura de Datos Mock (El Contrato Falso)

Usa el mismo tipo `EmailMock` definido en HU-UI-002. El dashboard calcula:

```typescript
// Métricas calculadas desde mock data
const metrics = {
  totalEmails: mockEmails.length,
  unprocessedEmails: mockEmails.filter(e => !e.processed).length,
  pendingTasks: mockEmails.filter(e => e.hasTask && e.taskStatus !== 'done').length,
  completedTasks: mockEmails.filter(e => e.hasTask && e.taskStatus === 'done').length
}

// Emails recientes (últimos 5, ordenados por fecha)
const recentEmails = mockEmails
  .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
  .slice(0, 5)
```

---

---

## 🧭 HU-UI-006: Navegación Global y Layout Principal

> **Descripción:** Estructura de navegación persistente que aparece en todas las páginas protegidas, incluyendo sidebar, header con usuario, y footer.

**Como:** Usuario del sistema  
**Quiero:** Tener una navegación clara y consistente en todas las pantallas  
**Para:** Moverme fácilmente entre las diferentes secciones del sistema

---

### 2. Resumen Técnico (Frontend)

Se creará un layout compartido en `/app/(protected)/layout.tsx` que envuelve todas las páginas principales excepto login. Este layout incluye: Sidebar izquierdo con logo y menú de navegación, Header superior con breadcrumbs y menú de usuario, y Footer opcional. El sidebar debe ser colapsable en desktop y transformarse en menú hamburguesa en móvil. El menú de usuario mostrará nombre e imagen simulada con opción de "Cerrar sesión" que redirige a `/login`.

---

### 3. Criterios de Aceptación (CA) - Foco 100% Visual

#### CA-L: Layout y Estructura (El "Dónde")

* **CA-L-01:** El layout debe dividirse en: Sidebar fijo a la izquierda (250px de ancho), Header fijo en la parte superior, Área de contenido principal scrolleable, Footer fijo en la parte inferior (opcional).
* **CA-L-02:** En Desktop (>1024px), el sidebar debe ser visible permanentemente con opción de colapsar a modo ícono (60px de ancho).
* **CA-L-03:** En Tablet y Móvil (<1024px), el sidebar debe ocultarse y reemplazarse por un botón hamburguesa en el header que abre sidebar como overlay.
* **CA-L-04:** El contenido principal debe ajustar su padding-left según el estado del sidebar (colapsado/expandido).

#### CA-C: Componentes (El "Qué")

* **CA-C-01:** El Sidebar debe incluir:
  * Logo o nombre del sistema en la parte superior.
  * Lista de navegación con 3 items: "Dashboard" (ícono Home), "Emails" (ícono Mail), "Kanban" (ícono Columns).
  * Cada item debe mostrar ícono + texto, y solo ícono cuando está colapsado.
  * Indicador visual (fondo de color o borde) en el item activo según la ruta actual.
  * Botón de colapsar/expandir en la parte inferior del sidebar.
* **CA-C-02:** El Header debe incluir:
  * Botón hamburguesa (solo visible en móvil/tablet).
  * Breadcrumbs mostrando la ruta actual (ej: "Dashboard", "Emails > Detalle").
  * Menú de usuario a la derecha con `<Avatar>`, nombre "Usuario Demo", y `<DropdownMenu>` con opciones: "Mi Perfil" (deshabilitado), "Configuración" (deshabilitado), `<Separator>`, "Cerrar Sesión".
* **CA-C-03:** El Footer debe mostrar texto simple: "© 2024 Sistema de Gestión de Emails | Versión 1.0 (MVP)" centrado.
* **CA-C-04:** Cuando el sidebar esté en modo overlay (móvil), debe incluirse un backdrop oscuro semitransparente que cierra el menú al hacer click.

#### CA-I: Interacciones Simuladas (El "Cómo")

* **CA-I-01:** Al hacer clic en cualquier item del menú de navegación, debe:
  * Navegar a la ruta correspondiente.
  * Actualizar el indicador visual del item activo.
  * Cerrar el sidebar si está en modo overlay (móvil).
* **CA-I-02:** Al hacer clic en el botón de colapsar/expandir del sidebar (desktop), debe:
  * Alternar entre modo expandido (250px) y colapsado (60px).
  * Animar la transición suavemente.
  * Persistir el estado en localStorage (simulado, para que se mantenga al navegar).
* **CA-I-03:** Al hacer clic en el botón hamburguesa (móvil), debe:
  * Abrir el sidebar como overlay desde la izquierda con animación slide.
  * Mostrar el backdrop oscuro detrás.
* **CA-I-04:** Al hacer clic en el backdrop o en cualquier link de navegación en móvil, el sidebar debe cerrarse.
* **CA-I-05:** Al hacer clic en "Cerrar Sesión" en el menú de usuario, debe:
  * Navegar a `/login`.
  * Mostrar un `<Toast>` con mensaje "Sesión cerrada correctamente".
* **CA-I-06:** Los items de navegación deben mostrar efecto hover con cambio de fondo.

---

### 4. Flujo y Estados de la UI (Maquetados)

* **Estado Expandido (Desktop):**
  * Sidebar con 250px de ancho mostrando íconos + texto.
* **Estado Colapsado (Desktop):**
  * Sidebar con 60px de ancho mostrando solo íconos.
* **Estado Overlay (Móvil):**
  * Sidebar oculto por defecto, se abre como overlay al click en hamburguesa.
* **Estado de Navegación Activa:**
  * El item correspondiente a la ruta actual debe tener fondo de color y/o borde izquierdo destacado.

---

### 5. Estándares de UI y Calidad Visual

* **Accesibilidad (a11y):** 
  * El sidebar debe ser navegable por teclado.
  * El menú hamburguesa debe tener label "Abrir menú de navegación".
  * El botón de cerrar sesión debe tener confirmación visual clara.
* **Consistencia:** Usar colores primarios del sistema para elementos activos.
* **Animaciones:** Transiciones suaves (300ms) para colapsar/expandir y overlay.

---

### 6. Dependencias (Assets Requeridos)

* **Diseño:** Mockup de v0.dev para layout completo (guardar en `/mockups/layout-navigation.png`).
* **Iconos:** Íconos de `lucide-react`: Home, Mail, Columns, Menu, X, ChevronLeft, ChevronRight, User, Settings, LogOut.
* **Datos Falsos:** Información de usuario simulada (nombre: "Usuario Demo", email: "demo@email.com", avatar: placeholder).

---

### 7. Componentes Involucrados (UI Kit)

* **Componentes de shadcn/ui:**
  * `Button`
  * `Avatar`, `AvatarImage`, `AvatarFallback`
  * `DropdownMenu`, `DropdownMenuItem`, `DropdownMenuSeparator`
  * `Separator`
  * `Sheet` (para sidebar en móvil)
* **Componentes Locales (Nuevos):**
  * `src/components/layout/Sidebar.tsx`
  * `src/components/layout/Header.tsx`
  * `src/components/layout/NavigationMenu.tsx`
  * `src/components/layout/UserMenu.tsx`
  * `src/components/layout/Breadcrumbs.tsx`

---

### 8. Estructura de Datos Mock (El Contrato Falso)

**Ubicación:** `lib/mock-data/user.ts`

**Tipo (Interface):**

```typescript
interface UserMock {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
}
```

**Datos (Objeto de Ejemplo):**

```typescript
export const mockUser: UserMock = {
  id: 'user-001',
  name: 'Usuario Demo',
  email: 'demo@email.com',
  avatar: null, // usar iniciales en Avatar
  role: 'Ejecutivo Comercial'
}
```

**Navegación (Array de Config):**

```typescript
export const navigationItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: 'Home'
  },
  {
    label: 'Emails',
    href: '/emails',
    icon: 'Mail'
  },
  {
    label: 'Kanban',
    href: '/kanban',
    icon: 'Columns'
  }
]
```

---

---

## 📊 RESUMEN DE ENTREGABLES - SEMANA 1

### ✅ Checklist de Historias de Usuario Completadas

| HU ID | Título | Página/Componente | Estado |
|-------|--------|-------------------|--------|
| HU-UI-001 | Pantalla de Login | `/login` | ⬜ Pendiente |
| HU-UI-002 | Listado de Emails | `/emails` | ⬜ Pendiente |
| HU-UI-003 | Vista Detallada de Email | `/emails/[id]` | ⬜ Pendiente |
| HU-UI-004 | Tablero Kanban | `/kanban` | ⬜ Pendiente |
| HU-UI-005 | Dashboard Principal | `/` o `/dashboard` | ⬜ Pendiente |
| HU-UI-006 | Navegación Global | Layout compartido | ⬜ Pendiente |

---

### 📁 Estructura de Archivos a Crear

```
/app
  ├── (auth)/
  │   └── login/
  │       └── page.tsx                    [HU-UI-001]
  ├── (protected)/
  │   ├── layout.tsx                      [HU-UI-006]
  │   ├── page.tsx                        [HU-UI-005]
  │   ├── emails/
  │   │   ├── page.tsx                    [HU-UI-002]
  │   │   └── [id]/
  │   │       └── page.tsx                [HU-UI-003]
  │   └── kanban/
  │       └── page.tsx                    [HU-UI-004]

/components
  ├── layout/
  │   ├── Sidebar.tsx                     [HU-UI-006]
  │   ├── Header.tsx                      [HU-UI-006]
  │   ├── NavigationMenu.tsx              [HU-UI-006]
  │   ├── UserMenu.tsx                    [HU-UI-006]
  │   └── Breadcrumbs.tsx                 [HU-UI-006]
  ├── dashboard/
  │   ├── MetricCard.tsx                  [HU-UI-005]
  │   ├── QuickActionCard.tsx             [HU-UI-005]
  │   └── RecentEmailsList.tsx            [HU-UI-005]
  ├── emails/
  │   ├── EmailTable.tsx                  [HU-UI-002]
  │   ├── EmailTableRow.tsx               [HU-UI-002]
  │   ├── EmailDetailView.tsx             [HU-UI-003]
  │   └── EmailMetadataSidebar.tsx        [HU-UI-003]
  ├── kanban/
  │   ├── KanbanBoard.tsx                 [HU-UI-004]
  │   ├── KanbanColumn.tsx                [HU-UI-004]
  │   ├── TaskCard.tsx                    [HU-UI-004]
  │   └── KanbanFilters.tsx               [HU-UI-004]
  └── shared/
      ├── SearchBar.tsx                   [HU-UI-002]
      └── EmptyState.tsx                  [Compartido]

/lib
  ├── mock-data/
  │   ├── emails.ts                       [HU-UI-002, 003, 004, 005]
  │   ├── user.ts                         [HU-UI-006]
  │   └── navigation.ts                   [HU-UI-006]
  └── types/
      ├── email.ts                        [Todas las HU]
      └── user.ts                         [HU-UI-006]

/mockups
  ├── login.png                           [HU-UI-001]
  ├── emails-list.png                     [HU-UI-002]
  ├── email-detail.png                    [HU-UI-003]
  ├── kanban-board.png                    [HU-UI-004]
  ├── dashboard.png                       [HU-UI-005]
  └── layout-navigation.png               [HU-UI-006]
```

---

### 🎨 Mock Data Requerido

**Total de archivos mock data:** 3

1. **`lib/mock-data/emails.ts`** (Mínimo 15 emails variados)
   - Usado en: HU-UI-002, 003, 004, 005
   - Debe incluir variedad de: categorías, prioridades, estados, con/sin tareas

2. **`lib/mock-data/user.ts`** (1 usuario demo)
   - Usado en: HU-UI-006
   - Información básica del usuario simulado

3. **`lib/mock-data/navigation.ts`** (Configuración de menú)
   - Usado en: HU-UI-006
   - Array con items de navegación y sus rutas

---

### 🎯 Criterios de Éxito General - Semana 1

Para considerar la Semana 1 como COMPLETADA, debe cumplirse:

#### Funcionalidad Visual
- ✅ Todas las 6 historias de usuario implementadas visualmente
- ✅ Navegación fluida entre todas las páginas sin errores
- ✅ Datos mock renderizándose correctamente en todas las vistas
- ✅ Responsive design funcionando en Desktop, Tablet y Móvil
- ✅ Estados vacíos (empty states) implementados donde corresponda

#### Interacciones Simuladas
- ✅ Búsqueda y filtrado funcionando con datos mock (solo frontend)
- ✅ Selección de emails mediante checkboxes
- ✅ Navegación entre rutas dinámicas ([id]) funcionando
- ✅ Modals/Toasts de feedback visual implementados
- ✅ Sidebar colapsable (desktop) y overlay (móvil) funcionando

#### Calidad del Código
- ✅ Componentes reutilizables correctamente separados
- ✅ Tipos TypeScript definidos para todas las interfaces
- ✅ Uso consistente de componentes de shadcn/ui
- ✅ Sin errores de TypeScript en compilación
- ✅ Código limpio y bien organizado según la estructura propuesta

#### Documentación y Assets
- ✅ README.md actualizado con descripción del proyecto
- ✅ 6 mockups generados y guardados en `/mockups/`
- ✅ Capturas de pantalla de la app funcionando
- ✅ Mock data bien estructurado y documentado

#### Deploy
- ✅ Aplicación desplegada en Vercel
- ✅ URL pública accesible y funcional
- ✅ No hay errores de build en producción
- ✅ Performance aceptable (lighthouse básico)

---

### ⚠️ Restricciones Importantes - Semana 1

**NO SE DEBE IMPLEMENTAR EN SEMANA 1:**

❌ Conexión a base de datos real  
❌ Autenticación real con NextAuth  
❌ Server Actions o API Routes  
❌ Procesamiento con IA  
❌ Drag & Drop funcional (solo visual)  
❌ Persistencia de datos (localStorage está bien para UI state)  
❌ Lógica de backend  
❌ Validaciones complejas con Zod (solo TypeScript types)  
❌ Integración con servicios externos  
❌ Testing unitario o e2e (opcional para esta semana)

**SÍ SE PERMITE:**

✅ Simulación de interacciones con JavaScript puro  
✅ Filtrado y búsqueda en memoria con datos mock  
✅ Navegación entre rutas  
✅ Estados de UI (loading, empty, error) simulados  
✅ Uso de localStorage para preferencias de UI (sidebar collapsed, etc.)  
✅ Animaciones y transiciones CSS/Framer Motion  
✅ Toast notifications con datos fake  
✅ Modals y dialogs de confirmación (sin lógica real)

---

### 📝 Notas Finales para el Equipo

1. **Priorización:** Si el tiempo es ajustado, implementar en orden:
   - Prioridad 1: HU-UI-001, 002, 006 (Login, Emails, Layout)
   - Prioridad 2: HU-UI-004, 005 (Kanban, Dashboard)
   - Prioridad 3: HU-UI-003 (Detalle de email - puede ser modal simple)

2. **Mockups con v0.dev:** Generar PRIMERO todos los mockups antes de escribir código, usar esos mockups como referencia visual exacta.

3. **Datos Mock Realistas:** Los 15 emails mock deben tener variedad real:
   - 5 sin procesar
   - 10 procesados (distribuidos en categorías y prioridades)
   - 7 con tareas (distribuidas en estados del Kanban)
   - 3 sin tareas

4. **Commits Frecuentes:** Hacer commits por cada HU completada, no uno gigante al final.

5. **Testing Manual:** Antes de marcar una HU como completa, verificar:
   - Funciona en Chrome, Firefox y Safari
   - Responsive en móvil real (no solo dev tools)
   - No hay errores en consola del navegador
   - Todos los links y botones hacen algo (aunque sea toast)

---
