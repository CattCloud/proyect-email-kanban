# Sistema de Diseño - Email Management System

**Versión:** 1.0 MVP  
**Fecha:** Noviembre 2025  
**Propósito:** Guía visual unificada para desarrollo frontend en Semana 1

---

## 1. Reglas del Frontend

### 1.1 Variables de Espaciado (Spacing Scale)

**Sistema base:** Escala de Tailwind CSS (múltiplos de 4px)

**Espaciado permitido:**

| Token | Valor | Uso Principal |
|-------|-------|---------------|
| `space-1` | 4px | Spacing mínimo entre iconos y texto |
| `space-2` | 8px | Padding interno de badges, gaps pequeños |
| `space-3` | 12px | Padding de botones pequeños |
| `space-4` | 16px | Spacing estándar entre elementos relacionados |
| `space-6` | 24px | Padding de cards, separación entre secciones |
| `space-8` | 32px | Márgenes de página, separación entre módulos |
| `space-12` | 48px | Espaciado de layout principal |
| `space-16` | 64px | Márgenes externos grandes |

**Clases Tailwind equivalentes:**
- Usar: `p-4`, `m-6`, `gap-4`, `space-y-4`
- Evitar: valores arbitrarios como `p-[13px]` o `m-[25px]`

---

### 1.2 Uso Consistente de Tailwind

**✅ CLASES PERMITIDAS:**

**Spacing:**
- `p-{n}`, `px-{n}`, `py-{n}`, `pt-{n}`, `pr-{n}`, `pb-{n}`, `pl-{n}`
- `m-{n}`, `mx-{n}`, `my-{n}`, `mt-{n}`, `mr-{n}`, `mb-{n}`, `ml-{n}`
- `gap-{n}`, `space-x-{n}`, `space-y-{n}`
- Donde `{n}` = 1, 2, 3, 4, 6, 8, 12, 16

**Layout:**
- `flex`, `grid`, `block`, `inline-block`, `hidden`
- `flex-row`, `flex-col`, `flex-wrap`
- `justify-{start|end|center|between|around}`
- `items-{start|end|center|baseline|stretch}`
- `grid-cols-{1-12}`, `col-span-{n}`

**Sizing:**
- `w-full`, `w-fit`, `w-auto`, `w-{fracciones como 1/2, 1/3}`
- `h-full`, `h-screen`, `h-auto`, `min-h-screen`
- `max-w-{sm|md|lg|xl|2xl|4xl|7xl}`

**❌ CLASES PROHIBIDAS:**

- Valores arbitrarios: `w-[347px]`, `text-[19px]`
- Colores hardcodeados: `bg-[#ff6b6b]` (usar variables CSS Tailwind)
- Spacing inconsistente: `p-5`, `m-7`, `gap-11`
- Transform complejos inline: `transform rotate-[37deg]`

**Excepción:** Se permiten valores arbitrarios SOLO para casos específicos documentados (ej: `w-[250px]` para el sidebar).

---

### 1.3 Convenciones de Naming

**Componentes:**
- PascalCase para archivos: `EmailTable.tsx`, `KanbanBoard.tsx`
- PascalCase para componentes: `<EmailCard />`, `<MetricCard />`

**Funciones y Variables:**
- camelCase: `getUserEmails()`, `isProcessed`, `emailList`
- Booleans con prefijo: `isLoading`, `hasTask`, `canEdit`

**Constantes:**
- UPPER_SNAKE_CASE: `MAX_EMAILS_PER_BATCH`, `DEFAULT_PAGE_SIZE`

**Clases CSS (si se usan custom):**
- kebab-case: `.email-card`, `.kanban-column`
- BEM para componentes complejos: `.email-card__header`, `.email-card--active`

**Archivos:**
- Components: PascalCase - `EmailTable.tsx`
- Utilities: camelCase - `formatDate.ts`
- Types: camelCase - `email.ts`, `user.ts`
- Mock data: camelCase - `emails.ts`, `navigation.ts`

---

### 1.4 Grid/Layout System

**Container Principal:**
- Max width: `max-w-7xl` (1280px)
- Padding horizontal: `px-4` en móvil, `px-6` en tablet, `px-8` en desktop
- Centrado: `mx-auto`

**Grid Responsive:**

```
Desktop (>1024px):  grid-cols-12
Tablet (768-1024):  grid-cols-8
Mobile (<768px):    grid-cols-4
```

**Layouts Comunes:**

| Layout | Desktop | Tablet | Mobile |
|--------|---------|--------|--------|
| Dashboard Metrics | 4 columnas | 2 columnas | 1 columna |
| Email Table | Tabla completa | Ocultar 1 columna | Cards apiladas |
| Kanban Board | 3 columnas | 2 columnas scroll | 1 columna apilada |
| Detail View | 70/30 split | 60/40 split | Stack vertical |

**Sidebar Layout:**
- Desktop expandido: `w-[250px]`
- Desktop colapsado: `w-[60px]`
- Mobile: `w-[280px]` (overlay)

---

---

## 2. Tipografía

### 2.1 Font Family

**Primary Font:** Inter (default de shadcn/ui)

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

**Fallback:** System fonts nativos para performance

**Carga:** Variable font via Google Fonts o local bundle

---

### 2.2 Escala de Tamaños

| Nombre | Tailwind Class | Tamaño | Uso Principal |
|--------|----------------|--------|---------------|
| **Display** | `text-4xl` | 36px | Títulos de páginas principales |
| **H1** | `text-3xl` | 30px | Título principal de sección |
| **H2** | `text-2xl` | 24px | Subtítulos importantes |
| **H3** | `text-xl` | 20px | Títulos de cards/módulos |
| **H4** | `text-lg` | 18px | Subtítulos secundarios |
| **Body Large** | `text-base` | 16px | Texto principal de contenido |
| **Body** | `text-sm` | 14px | Texto estándar, labels |
| **Small** | `text-xs` | 12px | Metadata, timestamps, badges |
| **Tiny** | `text-[11px]` | 11px | Texto auxiliar (uso excepcional) |

**Line Heights:**
- Títulos: `leading-tight` (1.25)
- Cuerpo: `leading-normal` (1.5)
- Párrafos largos: `leading-relaxed` (1.625)

---

### 2.3 Pesos y Estilos

**Font Weights:**

| Peso | Tailwind | Valor | Uso |
|------|----------|-------|-----|
| Light | `font-light` | 300 | NO USAR (excepto displays grandes) |
| Normal | `font-normal` | 400 | Texto de cuerpo estándar |
| Medium | `font-medium` | 500 | Énfasis suave, labels importantes |
| Semibold | `font-semibold` | 600 | Subtítulos, botones, navegación activa |
| Bold | `font-bold` | 700 | Títulos principales, llamados a la acción |

**Estilos:**
- Itálica: `italic` (solo para citas o énfasis excepcional)
- Uppercase: `uppercase` (solo para labels muy cortos como badges)
- Capitalize: `capitalize` (para nombres propios si es necesario)

**Regla de oro:** Usar máximo 3 pesos diferentes por página.

---

### 2.4 Jerarquía Visual

**Página Completa (Ejemplo: `/emails`):**

```
1. Título de página:    text-3xl font-bold
2. Subtítulo/descripción: text-base text-muted-foreground
3. Títulos de sección:  text-xl font-semibold
4. Labels de formulario: text-sm font-medium
5. Contenido de tabla:  text-sm font-normal
6. Metadata/timestamps: text-xs text-muted-foreground
```

**Card/Componente (Ejemplo: EmailCard):**

```
1. Título de card:      text-lg font-semibold
2. Contenido principal: text-sm
3. Metadata inferior:   text-xs text-muted-foreground
```


---

---

## 3. Espaciado y Layout

### 3.1 Variables de Espaciado

**Componentes Internos:**

| Componente | Padding | Gap/Spacing |
|------------|---------|-------------|
| Button | `px-4 py-2` | gap-2 entre ícono y texto |
| Card | `p-6` | space-y-4 para contenido interno |
| Table Cell | `p-4` | - |
| Badge | `px-2 py-1` | - |
| Input | `px-3 py-2` | - |
| Modal/Dialog | `p-6` | space-y-6 entre secciones |

**Secciones de Página:**

| Sección | Spacing |
|---------|---------|
| Entre header y contenido | `mt-8` |
| Entre secciones principales | `mb-12` |
| Entre cards en grid | `gap-6` |
| Entre elementos de lista | `space-y-2` |
| Padding de container principal | `p-8` desktop, `p-4` móvil |

---

### 3.2 Grid System

**Dashboard Metrics (4 cards):**
```
Desktop:  grid-cols-4 gap-6
Tablet:   grid-cols-2 gap-4
Mobile:   grid-cols-1 gap-4
```

**Email Table:**
```
Desktop:  Tabla nativa con columnas fijas
Tablet:   Tabla con 1 columna oculta
Mobile:   Cards apiladas (grid-cols-1 gap-3)
```

**Kanban Board:**
```
Desktop:  grid-cols-3 gap-6
Tablet:   grid-cols-2 gap-4 (scroll horizontal)
Mobile:   grid-cols-1 gap-4
```

**Detail View (Email Detail):**
```
Desktop:  grid-cols-[1fr_350px] gap-6
Tablet:   grid-cols-1 gap-4 (stack)
Mobile:   grid-cols-1 gap-4
```

---

### 3.3 Breakpoints Responsive

**Breakpoints de Tailwind (usar estos):**

| Breakpoint | Min Width | Dispositivo | Prefijo |
|------------|-----------|-------------|---------|
| Mobile | 0-639px | Móviles | (default) |
| SM | 640px+ | Móviles grandes | `sm:` |
| MD | 768px+ | Tablets | `md:` |
| LG | 1024px+ | Laptops | `lg:` |
| XL | 1280px+ | Desktops | `xl:` |
| 2XL | 1536px+ | Pantallas grandes | `2xl:` |

**Mobile-First Approach:**
```
Escribir estilos base para móvil primero:
<div className="p-4 md:p-6 lg:p-8">
  
Orden: mobile → tablet → desktop
```

**Comportamientos por Breakpoint:**

| Elemento | Mobile | Tablet | Desktop |
|----------|--------|--------|---------|
| Sidebar | Overlay hamburguesa | Overlay | Fijo visible |
| Navigation | Bottom bar / hamburguesa | Sidebar colapsado | Sidebar expandido |
| Table | Cards | Tabla reducida | Tabla completa |
| Modals | Full screen | 80% width | Max 600px centered |
| Metrics Grid | 1 col | 2 cols | 4 cols |

---

---

## 4. Iconografía

### 4.1 Librería (Lucide React)

**Por qué Lucide:**
- Consistencia visual con shadcn/ui
- Tree-shakeable (solo importas lo que usas)
- Ligera y performante
- Estilo outline moderno

**Instalación:**
```bash
npm install lucide-react
```

**Importación:**
```typescript
import { Mail, Search, Filter, Plus } from 'lucide-react'
```

---

### 4.2 Tamaños y Uso

**Tamaños Estándar:**

| Contexto | Clase Tailwind | Tamaño | Uso |
|----------|----------------|--------|-----|
| **Icon Small** | `size-4` | 16px | Dentro de badges, texto inline |
| **Icon Default** | `size-5` | 20px | Botones, navegación, labels |
| **Icon Medium** | `size-6` | 24px | Headers, títulos de sección |
| **Icon Large** | `size-8` | 32px | Empty states, landing sections |
| **Icon XL** | `size-12` | 48px | Páginas de error, onboarding |

**Reglas de Uso:**

1. **Color:**
   - Heredar del texto: no especificar color en el ícono
   - Usar: `<Mail className="size-5" />` ✅
   - Evitar: `<Mail className="size-5 text-blue-500" />` ❌

2. **Spacing con texto:**
   - Gap de `gap-2` entre ícono y texto en botones
   - `mr-2` si el ícono va antes del texto
   - `ml-2` si el ícono va después del texto

3. **Stroke Width:**
   - Por defecto: `strokeWidth={2}` (valor de Lucide)
   - Para íconos grandes (decorativos): `strokeWidth={1.5}`
   - Para íconos pequeños (claridad): `strokeWidth={2.5}`

---

**Iconos Principales del Sistema:**

| Categoría | Iconos | Contexto de Uso |
|-----------|--------|-----------------|
| **Navegación** | Home, Mail, Columns, Menu, X | Sidebar, navegación principal |
| **Acciones** | Plus, Edit, Trash2, Download, Upload, RefreshCw | Botones de acción |
| **Estados** | CheckCircle, XCircle, AlertCircle, Clock, Loader2 | Feedback visual, estados |
| **UI** | Search, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight | Interacciones, ordenamiento |
| **Email** | Mail, Inbox, Send, Archive, Tag, Paperclip | Específicos de emails |
| **Kanban** | Columns, MoreVertical, GripVertical | Tablero y cards |
| **Usuario** | User, Settings, LogOut, Bell | Menú de usuario |
| **Datos** | BarChart, TrendingUp, Calendar, FileText | Dashboard y métricas |

---

**Empty States Icons:**

Para estados vacíos, usar íconos grandes con color sutil:

```typescript
<Mail className="size-12 text-muted-foreground/50" />
```

---

---

## 5. Componentes Base (shadcn/ui)

### 5.1 Componentes a Utilizar

**Lista completa de componentes shadcn/ui requeridos:**

| Componente | Instalación | Uso Principal |
|------------|-------------|---------------|
| **Button** | `npx shadcn@latest add button` | Acciones primarias, secundarias, destructivas |
| **Card** | `npx shadcn@latest add card` | Contenedores de información, metrics, emails |
| **Input** | `npx shadcn@latest add input` | Búsqueda, formularios |
| **Table** | `npx shadcn@latest add table` | Listado de emails |
| **Badge** | `npx shadcn@latest add badge` | Categorías, prioridades, estados |
| **Checkbox** | `npx shadcn@latest add checkbox` | Selección múltiple de emails |
| **Select** | `npx shadcn@latest add select` | Filtros, dropdowns |
| **Dialog** | `npx shadcn@latest add dialog` | Modals, confirmaciones |
| **Dropdown Menu** | `npx shadcn@latest add dropdown-menu` | Menú de usuario, acciones contextuales |
| **Avatar** | `npx shadcn@latest add avatar` | Foto de usuario |
| **Separator** | `npx shadcn@latest add separator` | Divisores visuales |
| **Skeleton** | `npx shadcn@latest add skeleton` | Estados de carga |
| **Toast** | `npx shadcn@latest add toast` | Notificaciones |
| **Alert** | `npx shadcn@latest add alert` | Mensajes importantes, warnings |
| **Sheet** | `npx shadcn@latest add sheet` | Sidebar móvil (overlay) |
| **Textarea** | `npx shadcn@latest add textarea` | Campos de texto largo |

---

### 5.2 Variantes y Casos de Uso

#### **Button**

| Variante | Clase | Cuándo Usar |
|----------|-------|-------------|
| Default | `variant="default"` | Acción principal (Procesar IA, Guardar) |
| Secondary | `variant="secondary"` | Acciones secundarias (Cancelar, Volver) |
| Outline | `variant="outline"` | Acciones terciarias (Filtros, Opciones) |
| Ghost | `variant="ghost"` | Navegación, íconos sin fondo |
| Destructive | `variant="destructive"` | Eliminar, acciones peligrosas |
| Link | `variant="link"` | Enlaces que parecen botones |

**Tamaños:**
- `size="sm"`: Botones compactos en tablas
- `size="default"`: Uso estándar
- `size="lg"`: CTAs importantes
- `size="icon"`: Solo ícono (ej: botón hamburguesa)

---

#### **Badge**

| Variante | Clase | Uso en el Sistema |
|----------|-------|-------------------|
| Default | `variant="default"` | Estados neutros (Sin procesar) |
| Secondary | `variant="secondary"` | Categoría: Interno |
| Destructive | `variant="destructive"` | Prioridad: Alta, Categoría: Spam |
| Outline | `variant="outline"` | Estados secundarios |


---

#### **Card**

**Estructura estándar:**
```typescript
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
    <CardDescription>Descripción opcional</CardDescription>
  </CardHeader>
  <CardContent>
    Contenido principal
  </CardContent>
  <CardFooter>
    Acciones o metadata
  </CardFooter>
</Card>
```

**Variantes de Card en el sistema:**
- Metric Cards (Dashboard): Header + número grande
- Email Cards (móvil): Header + preview + footer con metadata
- Task Cards (Kanban): Todo el contenido en CardContent sin divisiones

---

#### **Table**

**Estructura:**
```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Columna 1</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Dato</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Estilos específicos:**
- Header: `font-medium text-muted-foreground`
- Filas clickeables: `hover:bg-muted/50 cursor-pointer`
- Bordes sutiles: usar defaults de shadcn

---

#### **Dialog / Modal**

**Tamaños:**
- Pequeño: `max-w-md` (confirmaciones)
- Mediano: `max-w-lg` (formularios cortos)
- Grande: `max-w-2xl` (detalle de email)
- Full: `max-w-4xl` (vistas complejas)

**Estructura:**
```typescript
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
      <DialogDescription>Descripción</DialogDescription>
    </DialogHeader>
    
    {/* Contenido */}
    
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button>Confirmar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

#### **Toast**

**Variantes:**
Se usara la libreria Notyf
```typescript
// Éxito
notyf({ type: "Éxito", description: "...", variant: "default" })

// Error
notyf({ type: "Error", description: "...", variant: "destructive" })

// Información
notyf({ type: "Info", description: "..." })
```

**Duración:** 3-5 segundos por defecto

---

---

## 6. Componentes Específicos del Sistema

### 6.1 EmailCard (Móvil)

**Propósito:** Representación de email en formato card para vista móvil de la tabla.

**Estructura visual:**
- Header: Remitente + timestamp alineados horizontal
- Body: Asunto (bold) + preview del cuerpo (truncado 2 líneas)
- Footer: Badges de categoría, prioridad, estado procesado

**Tamaño:** `w-full p-4`  
**Spacing:** `space-y-2` interno

---

### 6.2 TaskCard (Kanban)

**Propósito:** Tarjeta de tarea en el tablero Kanban.

**Estructura visual:**
- Drag handle (⋮⋮) en esquina superior izquierda
- Título de tarea (asunto del email, truncado)
- Badges: Prioridad + Categoría en fila horizontal
- Footer: Email del remitente en texto small

**Tamaño:** `w-full p-4`  
**Hover:** `hover:shadow-md transition-shadow`  
**Cursor:** `cursor-pointer`

---

### 6.3 MetricCard (Dashboard)

**Propósito:** Card con métrica numérica grande.

**Estructura visual:**
- Ícono decorativo (size-8) en esquina superior derecha con opacidad baja
- Label de métrica (text-sm text-muted-foreground)
- Número grande (text-3xl font-bold)
- Descripción opcional o trend (text-xs)

**Tamaño:** `w-full p-6`  
**Hover:** `hover:shadow-lg transition-shadow` (clickeable)

---

### 6.4 EmptyState

**Propósito:** Placeholder cuando no hay datos.

**Estructura visual:**
- Ícono grande centrado (size-12 text-muted-foreground/50)
- Título (text-lg font-medium)
- Descripción (text-sm text-muted-foreground)
- CTA Button opcional

**Spacing:** `space-y-4`  
**Centrado:** `flex flex-col items-center justify-center`  
**Padding:** `py-12`

---

### 6.5 SearchBar

**Propósito:** Input de búsqueda con ícono.

**Componentes:** Input + Search icon

**Estructura:**
```typescript
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" />
  <Input className="pl-10" placeholder="Buscar..." />
</div>
```

---

### 6.6 StatusBadge

**Propósito:** Badge estandarizado para estados del sistema.

**Props necesarios:**
- `type`: 'category' | 'priority' | 'status'
- `value`: string

**Lógica de color:** Switch statement que retorna className según type + value

---

---

## 7. Estados Visuales

### 7.1 Hover/Active

**Botones:**
```
Default:  bg-primary hover:bg-primary/90
Ghost:    hover:bg-accent hover:text-accent-foreground
Outline:  hover:bg-accent hover:text-accent-foreground
```

**Cards clickeables:**
```
hover:bg-muted/50 transition-colors duration-200
```

**Table Rows:**
```
hover:bg-muted/50 cursor-pointer
```

**Links de navegación:**
```
Inactivo:  text-muted-foreground hover:text-foreground
Activo:    bg-accent text-accent-foreground
```

**Task Cards (Kanban):**
```
hover:shadow-lg transition-shadow duration-200
```

---

### 7.2 Loading

**Skeleton Loaders:**

Usar componente `<Skeleton />` de shadcn/ui

**Para tabla de emails:**
```typescript
<TableRow>
  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
  <TableCell><Skeleton className="h-4 w-[300px]" /></TableCell>
  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
</TableRow>
```

**Para cards:**
```typescript
<Card>
  <CardHeader>
    <Skeleton className="h-6 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </CardHeader>
  <CardContent>
    <Skeleton className="h-20 w-full" />
  </CardContent>
</Card>
```

**Spinner en botones:**
```typescript
<Button disabled>
  <Loader2 className="mr-2 size-4 animate-spin" />
  Procesando...
</Button>
```

**Tiempo de simulación:** 1-2 segundos máximo para mockups.

---

### 7.3 Empty States

**Estructura estándar:**

```typescript
<div className="flex flex-col items-center justify-center py-12 space-y-4">
  <IconoGrande className="size-12 text-muted-foreground/50" />
  <div className="text-center space-y-2">
    <h3 className="text-lg font-medium">Título del estado vacío</h3>
    <p className="text-sm text-muted-foreground max-w-sm">
      Descripción explicativa de por qué está vacío
    </p>
  </div>
  <Button variant="outline">
    Acción sugerida
  </Button>
</div>
```

**Casos específicos:**

| Contexto | Ícono | Título | Descripción | CTA |
|----------|-------|--------|-------------|-----|
| Sin emails | Mail | "No hay emails importados" | "Comienza importando tus emails en formato JSON" | "Importar JSON" |
| Sin tareas | CheckSquare | "No hay tareas detectadas" | "Procesa tus emails con IA para detectar tareas" | "Procesar Emails" |
| Búsqueda sin resultados | Search | "No se encontraron resultados" | "Intenta con otros términos de búsqueda" | "Limpiar búsqueda" |
| Columna Kanban vacía | Circle | "No hay tareas en [estado]" | - | - |

---

### 7.4 Error States

**Alert de Error:**

```typescript
<Alert variant="destructive">
  <AlertCircle className="size-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Descripción del error y posible solución
  </AlertDescription>
</Alert>
```

**Toast de Error:**

```typescript
toast({
  variant: "destructive",
  title: "Error al procesar",
  description: "No se pudieron procesar los emails. Intenta nuevamente."
})
```

**Input con Error:**

```typescript
<div className="space-y-2">
  <Input className="border-destructive" />
  <p className="text-sm text-destructive">Mensaje de error</p>
</div>
```

**Estado de Error en Fetch (simulado):**

```typescript
<div className="flex flex-col items-center justify-center py-12 space-y-4">
  <XCircle className="size-12 text-destructive" />
  <div className="text-center space-y-2">
    <h3 className="text-lg font-medium">Error al cargar datos</h3>
    <p className="text-sm text-muted-foreground">
      Ocurrió un error al cargar la información
    </p>
  </div>
  <Button variant="outline" onClick={retry}>
    <RefreshCw className="mr-2 size-4" />
    Reintentar
  </Button>
</div>
```

---

---

## 8. Páginas y Navegación

### 8.1 Estructura de Rutas

**Arquitectura de carpetas (App Router):**

```
/app
  ├── (auth)/
  │   └── login/
  │       └── page.tsx            → /login
  │
  └── (protected)/
      ├── layout.tsx              → Layout compartido
      ├── page.tsx                → / (Dashboard)
      ├── emails/
      │   ├── page.tsx            → /emails (Listado)
      │   └── [id]/
      │       └── page.tsx        → /emails/[id] (Detalle)
      └── kanban/
          └── page.tsx            → /kanban (Tablero)
```

**Tabla de Rutas:**

| Ruta | Componente | Descripción| Protegida | HU |
|------|------------|-------------|-----------|-----|
| `/login` | `(auth)/login/page.tsx` | Pantalla de autenticación | No | HU-UI-001 |
| `/` | `(protected)/page.tsx` | Dashboard principal | Sí | HU-UI-005 |
| `/emails` | `(protected)/emails/page.tsx` | Listado de emails | Sí | HU-UI-002 |
| `/emails/[id]` | `(protected)/emails/[id]/page.tsx` | Detalle de email | Sí | HU-UI-003 |
| `/kanban` | `(protected)/kanban/page.tsx` | Tablero Kanban | Sí | HU-UI-004 |

**Navegación programática:**

```typescript
// Usar router de Next.js
import { useRouter } from 'next/navigation'

const router = useRouter()
router.push('/emails')
router.back()
```

**Links:**

```typescript
import Link from 'next/link'

<Link href="/emails">Ver Emails</Link>
```

---

### 8.2 Layout Principal

**Estructura del Layout Protegido:**

```
┌─────────────────────────────────────────────────┐
│                    HEADER                        │
│  [☰] Breadcrumbs              [Avatar] [Menu]   │
├──────────┬──────────────────────────────────────┤
│          │                                       │
│ SIDEBAR  │         MAIN CONTENT                 │
│          │                                       │
│ [Home]   │   <Page Content Here>                │
│ [Emails] │                                       │
│ [Kanban] │                                       │
│          │                                       │
│ [Toggle] │                                       │
├──────────┴──────────────────────────────────────┤
│                    FOOTER                        │
│        © 2024 Email Management System           │
└─────────────────────────────────────────────────┘
```

---

#### **HEADER (Top Bar)**

**Altura:** `h-16` (64px)  
**Position:** `sticky top-0 z-50`  
**Background:** `bg-background border-b`

**Estructura:**
```
Left:   [Hamburger Button (móvil)] + [Breadcrumbs]
Right:  [Notifications icon (futuro)] + [Avatar + Dropdown]
```

**Componentes:**
- Hamburger: `<Button variant="ghost" size="icon">` con `<Menu />` icon
- Breadcrumbs: Lista de navegación actual separada por `/`
- Avatar: `<Avatar>` con menú dropdown

**Responsive:**
- Desktop: Ocultar hamburguesa, mostrar breadcrumbs completos
- Móvil: Mostrar hamburguesa, breadcrumbs simplificados (solo página actual)

---

#### **SIDEBAR (Navigation)**

**Desktop Expandido:**
- Width: `w-[250px]`
- Position: `fixed left-0 h-screen`
- Background: `bg-card border-r`
- Padding: `p-4`

**Desktop Colapsado:**
- Width: `w-[60px]`
- Iconos centrados, texto oculto
- Tooltip al hover mostrando label

**Móvil (Overlay):**
- Width: `w-[280px]`
- Position: `fixed left-0 h-screen z-50`
- Animación: slide desde izquierda
- Backdrop: `bg-black/50`

**Estructura Interna:**
```
┌─────────────┐
│    LOGO     │  ← Logo/Título del sistema
├─────────────┤
│             │
│ Nav Items:  │  ← Links de navegación
│ • Dashboard │
│ • Emails    │
│ • Kanban    │
│             │
│             │
│ [Toggle]    │  ← Botón colapsar (desktop only)
└─────────────┘
```

**Nav Item Activo:**
- Background: `bg-accent`
- Text: `text-accent-foreground`
- Border left: `border-l-2 border-primary`

**Nav Item Hover:**
- Background: `hover:bg-accent/50`
- Transición: `transition-colors duration-200`

---

#### **MAIN CONTENT (Área Central)**

**Desktop con Sidebar Expandido:**
- Margin left: `ml-[250px]`
- Width: `calc(100% - 250px)`

**Desktop con Sidebar Colapsado:**
- Margin left: `ml-[60px]`
- Width: `calc(100% - 60px)`

**Móvil:**
- No margin left
- Full width

**Padding interno:**
```
px-4 md:px-6 lg:px-8
py-6 md:py-8
```

**Max width del contenido:**
```
max-w-7xl mx-auto
```

**Estructura típica de página:**

```typescript
<main className="flex-1 overflow-y-auto p-6 md:p-8">
  <div className="max-w-7xl mx-auto space-y-8">
    {/* Page Header */}
    <div className="space-y-2">
      <h1 className="text-3xl font-bold">Título de Página</h1>
      <p className="text-muted-foreground">Descripción opcional</p>
    </div>
    
    {/* Page Content */}
    <div className="space-y-6">
      {/* Contenido específico de la página */}
    </div>
  </div>
</main>
```

---

#### **FOOTER (Opcional)**

**Altura:** `h-12` (48px)  
**Position:** `sticky bottom-0` o `relative`  
**Background:** `bg-muted/30`  
**Padding:** `px-4 py-3`

**Contenido:**
```
Centrado: © 2024 Sistema de Gestión de Emails | Versión 1.0 MVP
```

**Responsive:**
- Desktop: Una línea centrada
- Móvil: Puede omitirse o simplificarse a solo "© 2024"

---

### 8.3 Navegación Entre Páginas

**Breadcrumbs Format:**

| Ruta | Breadcrumbs |
|------|-------------|
| `/` | Dashboard |
| `/emails` | Dashboard / Emails |
| `/emails/email-001` | Dashboard / Emails / Detalle |
| `/kanban` | Dashboard / Kanban |

**Active State en Sidebar:**

El sistema debe detectar la ruta actual y marcar el item correspondiente:

```typescript
// Pseudo-lógica
const pathname = usePathname()
const isActive = pathname === href || pathname.startsWith(href + '/')
```

---

### 8.4 Transiciones de Página

**Transiciones suaves (opcional pero recomendado):**

```typescript
// En layout o componente de transición
<div className="transition-all duration-200 ease-in-out">
  {children}
</div>
```

**Fade in al cargar página:**
```typescript
<div className="animate-in fade-in duration-300">
  {/* Contenido de página */}
</div>
```

---

---

## 9. Colores y Tema
Revisar [Global CSS](/doc/PALETACOLORES.md)


## 10. Animaciones y Micro-interacciones

### 10.1 Principios de Animación

**Duraciones estándar:**
- Rápida: `duration-100` (100ms) - hover states
- Normal: `duration-200` (200ms) - transiciones estándar
- Suave: `duration-300` (300ms) - modals, overlays
- Lenta: `duration-500` (500ms) - animaciones decorativas

**Easing:**
- Default: `ease-in-out` (aceleración y desaceleración suave)
- Entrada: `ease-out` (deceleración al final)
- Salida: `ease-in` (aceleración al inicio)

---

### 10.2 Animaciones Comunes

**Hover en Cards:**
```typescript
className="transition-all duration-200 hover:shadow-lg"
```

**Fade In al Cargar:**
```typescript
className="animate-in fade-in duration-300"
```

**Slide desde arriba (Headers):**
```typescript
className="animate-in slide-in-from-top duration-300"
```

**Skeleton pulse:**
```typescript
// Ya incluido en componente Skeleton de shadcn
className="animate-pulse"
```

**Spinner de carga:**
```typescript
<Loader2 className="animate-spin" />
```

---

### 10.3 Transiciones de Estado

**Button loading:**
```typescript
// Normal → Loading
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
  {isLoading ? 'Procesando...' : 'Procesar'}
</Button>
```

**Collapse/Expand Sidebar:**
```typescript
className="transition-all duration-300 ease-in-out"
// Width cambia de 250px → 60px con animación suave
```

**Modal Overlay:**
```typescript
// Backdrop fade in
className="animate-in fade-in duration-200"

// Content slide + fade
className="animate-in fade-in-90 slide-in-from-bottom-10 duration-300"
```

---

---

## 11. Accesibilidad (a11y)

### 11.1 Principios Básicos

**Keyboard Navigation:**
- Todos los elementos interactivos deben ser accesibles con Tab
- Orden lógico de tabulación (top → bottom, left → right)
- Enter o Space para activar botones
- Escape para cerrar modals

**Focus States:**
```typescript
// Usar ring de focus de shadcn
className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
```

---

### 11.2 ARIA Labels

**Botones sin texto (icon only):**
```typescript
<Button variant="ghost" size="icon" aria-label="Abrir menú">
  <Menu className="size-5" />
</Button>
```

**Links de navegación:**
```typescript
<Link href="/emails" aria-current={isActive ? "page" : undefined}>
  Emails
</Link>
```

**Inputs:**
```typescript
<label htmlFor="search" className="sr-only">Buscar emails</label>
<Input id="search" placeholder="Buscar..." />
```

---

### 11.3 Contraste de Colores

**Ratios mínimos (WCAG AA):**
- Texto normal: 4.5:1
- Texto grande (18px+): 3:1
- Elementos UI: 3:1

**Verificación:**
Los colores de shadcn/ui cumplen con WCAG AA por defecto.

---

---

## 12. Priorización de Implementación

### Fase 1 (Crítico - Día 1-2)

1. ✅ Setup de Tailwind + shadcn/ui
2. ✅ Colores y variables CSS
3. ✅ Componentes base: Button, Card, Input, Badge
4. ✅ Layout principal (Sidebar + Header)
5. ✅ Tipografía y spacing

### Fase 2 (Importante - Día 2-3)

6. ✅ Componentes específicos: EmailCard, TaskCard, MetricCard
7. ✅ Estados visuales: Loading, Empty, Error
8. ✅ Navegación funcional
9. ✅ Responsive design básico

### Fase 3 (Nice-to-have - Día 3-4)

10. ✅ Animaciones y transiciones
11. ✅ Hover states refinados
12. ✅ Dark mode (solo si hay tiempo)
13. ✅ Micro-interacciones

---

---

## 13. Checklist de Implementación

### ✅ Antes de Empezar

- [ ] Instalar Tailwind CSS
- [ ] Instalar shadcn/ui con `npx shadcn@latest init`
- [ ] Configurar `globals.css` con variables de color
- [ ] Instalar Lucide React
- [ ] Configurar tipografía (Inter font)

### ✅ Durante el Desarrollo

**Por cada componente:**
- [ ] Usar spacing scale consistente (4, 8, 16, 24, etc.)
- [ ] Implementar responsive (mobile-first)
- [ ] Añadir hover states apropiados
- [ ] Verificar contraste de colores
- [ ] Añadir aria-labels donde sea necesario
- [ ] Probar navegación por teclado

**Por cada página:**
- [ ] Header consistente
- [ ] Breadcrumbs correctos
- [ ] Empty state implementado
- [ ] Loading state implementado
- [ ] Error state implementado
- [ ] Responsive en 3 breakpoints (móvil, tablet, desktop)

### ✅ Antes del Deploy

- [ ] Sin errores de TypeScript
- [ ] Sin warnings de accesibilidad en consola
- [ ] Probar en Chrome, Firefox, Safari
- [ ] Probar responsive en dispositivo real
- [ ] Verificar que todos los links funcionan
- [ ] Performance básica (Lighthouse > 80)

---

---

## 14. Recursos y Referencias

### 14.1 Documentación Oficial

- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Lucide Icons:** https://lucide.dev
- **Next.js:** https://nextjs.org/docs

### 14.2 Herramientas Útiles

- **v0.dev:** Generación de mockups (https://v0.dev)
- **Tailwind Play:** Sandbox para probar clases (https://play.tailwindcss.com)
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/

### 14.3 Figma/Mockups

- Guardar todos los mockups en `/mockups/`
- Nombrar archivos: `[feature]-[variant].png`
- Ejemplo: `emails-list-desktop.png`, `kanban-mobile.png`

---

---

## 15. Glosario de Términos

| Término | Definición |
|---------|-----------|
| **Spacing Scale** | Sistema de espaciado basado en múltiplos de 4px |
| **Breakpoint** | Punto de quiebre responsive (sm, md, lg, xl) |
| **Token** | Variable de diseño reutilizable (color, spacing, etc.) |
| **Semantic Color** | Color con significado (success, error, warning) |
| **Empty State** | Vista cuando no hay datos para mostrar |
| **Skeleton** | Placeholder animado mientras carga contenido |
| **Hover State** | Apariencia de elemento al pasar mouse |
| **Focus Ring** | Borde visible al navegar con teclado |
| **Badge** | Etiqueta pequeña con información de estado |
| **Toast** | Notificación temporal tipo popup |

---

---

## 📌 Nota Final para v0.dev

**Al generar mockups en v0.dev, incluye este resumen:**

```
Sistema: Email Management con IA
Stack: Next.js, TypeScript, Tailwind, shadcn/ui, Lucide icons

Colores:
- Categoría Cliente: bg-blue-100 text-blue-800
- Categoría Lead: bg-green-100 text-green-800
- Categoría Interno: bg-gray-100 text-gray-800
- Categoría Spam: bg-red-100 text-red-800
- Prioridad Alta: bg-red-100 text-red-800
- Prioridad Media: bg-yellow-100 text-yellow-800
- Prioridad Baja: bg-gray-100 text-gray-800

Tipografía:
- Títulos: text-3xl font-bold
- Subtítulos: text-xl font-semibold
- Body: text-sm
- Metadata: text-xs text-muted-foreground

Spacing:
- Cards: p-6 gap-4
- Buttons: px-4 py-2
- Page padding: p-8

Componentes shadcn/ui:
Button, Card, Input, Table, Badge, Avatar, Dialog, Select, Checkbox

Diseño limpio, profesional, espacioso, con énfasis en legibilidad.
```

---
