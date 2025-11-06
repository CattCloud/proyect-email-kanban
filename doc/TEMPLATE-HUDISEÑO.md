

## 1\. HU-UI-[NNN] : [Título Descriptivo de la historia de usuario]

> **Descripción:** La narrativa que justifica la existencia de esta pantalla o componente.

**Como:** `[Rol del Usuario, ej: Padre, Director]`
**Quiero:** `[Acción u Objetivo Visual, ej: Ver una pantalla con una cuadrícula de comunicados]`
**Para:** `[Beneficio, ej: Entender cómo se verá la información relevante]`

-----

### 2\. Resumen Técnico (Frontend)

> **Descripción:** Una sinopsis para el desarrollador de frontend. ¿Qué se va a construir visualmente?

`[Ej: Se creará una nueva página en /dashboard/comunicados que mostrará una cuadrícula de tarjetas (Cards) consumiendo datos mock locales desde /lib/mock-data/comunicados.ts. La página incluirá una barra de filtros (sin lógica funcional) y un botón de "Crear" que navega a la página del formulario.]`

-----

### 3\. Criterios de Aceptación (CA) - Foco 100% Visual

> **Descripción:** El checklist detallado para definir el "Hecho" (Done) de la maqueta visual.

#### CA-L: Layout y Estructura (El "Dónde")

  * **CA-L-01:** `[Disposición, ej: La interfaz se divide en una Barra de Herramientas superior y una Cuadrícula (Grid) principal.]`
  * **CA-L-02:** `[Responsive, ej: El grid debe ser de 3 columnas en Desktop (>1024px), 2 en Tablet (768-1024px) y 1 en Móvil (<768px).]`
  * **CA-L-03:** `[Navegación, ej: El enlace "Comunicados" en el Sidebar debe estar activo al estar en esta ruta.]`

#### CA-C: Componentes (El "Qué")

  * **CA-C-01:** `[Componente, ej: La Barra de Herramientas debe renderizar los componentes <Input> (para búsqueda) y <Select> (para filtros) de shadcn/ui.]`
  * **CA-C-02:** `[Componente, ej: El botón "✍️ Nuevo Comunicado" (componente <Button>) debe ser visible en la esquina superior derecha.]`
  * **CA-C-03:** `[Componente, ej: La Cuadrícula debe renderizar un componente <ComunicadoCard> por cada ítem en el array de mock data.]`
  * **CA-C-04:** `[Condicional, ej: Si el mock data está vacío, se debe mostrar el componente <EmptyState>.]`

#### CA-I: Interacciones Simuladas (El "Cómo")

  * **CA-I-01:** `[Navegación, ej: Al hacer clic en el botón "✍️ Nuevo Comunicado", se debe navegar a la ruta /comunicados/nuevo.]`
  * **CA-I-02:** `[Hover, ej: Al hacer hover sobre una tarjeta, esta debe mostrar una sombra más pronunciada (efecto visual).]`
  * **CA-I-03:** `[Click, ej: Al hacer clic en una tarjeta o en su botón "Leer más", se debe navegar a la ruta /comunicados/[id] (usando el ID del mock data).]`
  * **CA-I-04:** `[Simulación, ej: Al hacer clic en el botón "Eliminar" (en el menú ⋮), se debe mostrar un <AlertDialog> de confirmación. Al confirmar, el ítem debe desaparecer *visualmente* de la lista (simulación en el estado local, sin persistencia).]`
  * **CA-I-05:** `[Feedback, ej: Al simular la eliminación (CA-I-04), debe aparecer un <Toast> de "Éxito" (simulado).]`

-----

### 4\. Flujo y Estados de la UI (Maquetados)

> **Descripción:** Define cómo debe reaccionar la interfaz en todos los escenarios visuales, usando datos mock.

  * **Estado Ideal (Success):**
      * `[Descripción: Se muestra la cuadrícula renderizando los datos de /lib/mock-data/comunicados.ts.]`
  * **Estado Vacío (Empty):**
      * `[Descripción: Importar un array vacío (ej: mockComunicados = []) y verificar que el componente <EmptyState> se renderice correctamente con el mensaje: "No hay comunicados publicados aún."]`
  * **(Opcional) Estado de Carga (Loading):**
      * `[Descripción: Simular un estado de carga (ej: con un setTimeout de 1s) para verificar que los componentes <Skeleton> se muestren correctamente antes de renderizar los datos.]`

-----

### 5\. Estándares de UI y Calidad Visual

> **Descripción:** Los requisitos de calidad visual y accesibilidad para esta maqueta.

  * **Accesibilidad (a11y):** `[Ej: Todos los botones deben ser navegables por teclado y tener etiquetas ARIA.]`
  * **Consistencia:** `[Ej: Usar únicamente los 'tokens' de color y 'font sizes' definidos en el 'globals.css' y 'tailwind.config.js'.]`
  * **Fidelidad:** `[Ej: La UI debe coincidir con el mockup de Figma/v0.dev para esta pantalla (ver Dependencias).]`

-----

### 6\. Dependencias (Assets Requeridos)

> **Descripción:** Lo que se necesita *antes* de empezar a construir esta UI.

  * **Diseño:** `[Mockup de Figma o v0.dev (URL/Screenshot): Enlace al diseño de referencia.]`
  * **Datos Falsos:** `[Necesidad de crear el archivo /lib/mock-data/comunicados.ts (ver sección 8).]`
  * **Iconos:** `[Lista de iconos (ej: 'Lupa', 'Editar', 'Basura') de 'lucide-react'.]`

-----

### 7\. Componentes Involucrados (UI Kit)

> **Descripción:** El inventario de componentes de UI (ej: shadcn/ui) que se usarán para construir esta pantalla.

  * **Componentes de (shadcn/ui):**
      * `[Button]`
      * `[Card]`, `[CardHeader]`, `[CardContent]`, `[CardFooter]`
      * `[Input]`
      * `[Select]`
      * `[Badge]`
      * `[DropdownMenu]`
      * `[AlertDialog]`
      * `[Toast]`
  * **Componentes Locales (Nuevos):**
      * `[src/components/comunicados/ComunicadoCard.tsx]`
      * `[src/components/comunicados/ComunicadoFilters.tsx]`

-----

### 8\. Estructura de Datos Mock (El Contrato Falso)

> **Descripción:** La definición de tipo (TypeScript) y el array de ejemplo que se usará para poblar la UI. Este es el "contrato" que el backend deberá seguir en la Semana 2.

**Ubicación:** `lib/mock-data/comunicados.ts`

**Tipo (Interface):**

```typescript
interface ComunicadoMock {
  id: string;
  tipo: 'Académico' | 'Administrativo' | 'Evento' | 'Urgente' | 'Informativo';
  titulo: string;
  extracto: string;
  autor: string;
  fechaPublicacion: string; // (Usar formato ISO para simular, ej: "2025-10-28T09:00:00Z")
  esNuevo: boolean;
  esLeido: boolean;
  esEditado: boolean;
  destinatarios: string[]; // (ej: ["2do B", "Primaria"])
}
```

**Datos (Array de Ejemplo):**

```typescript
export const mockComunicados: ComunicadoMock[] = [
  {
    id: 'com-001',
    tipo: 'Evento',
    titulo: '¡Gran Kermés de Aniversario!',
    extracto: 'No te pierdas nuestra kermés este sábado. Habrá comida, juegos...',
    autor: 'Dirección General',
    fechaPublicacion: '2025-10-28T09:00:00Z',
    esNuevo: true,
    esLeido: false,
    esEditado: false,
    destinatarios: ['Todos']
  },
  {
    id: 'com-002',
    tipo: 'Urgente',
    titulo: 'Suspensión de Clases por Corte de Agua',
    extracto: 'Debido a un corte de agua programado en el distrito, las clases...',
    autor: 'Administración',
    fechaPublicacion: '2025-10-27T15:30:00Z',
    esNuevo: false,
    esLeido: false,
    esEditado: true,
    destinatarios: ['Primaria', 'Secundaria']
  },
  // ... (Agregar 3-4 más para simular el grid)
];
```