# Feature: Kanban por contacto y gestión visual de tareas (Semana 4)

## Información General

**Tipo:** Feature  

Este feature toma el tablero Kanban existente y lo evoluciona hacia una herramienta estratégica **centrada en las personas** (contactos: clientes, leads y contactos internos). El foco del tablero deja de ser solo la lista de tareas derivadas de emails y pasa a ser una **agenda visual organizada por contacto**, donde cada tarjeta representa una tarea concreta proveniente de un email procesado.

El desarrollo parte del estado actual del sistema descrito en [`doc/SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md), donde ya existen:

- Un tablero Kanban funcional conectado a base de datos, implementado en:
  - Página de ruta protegida: [`src/app/(protected)/kanban/page.tsx`](src/app/(protected)/kanban/page.tsx)
  - Componentes de dominio Kanban:
    - [`KanbanBoard.tsx`](src/components/kanban/KanbanBoard.tsx)
    - [`KanbanColumn.tsx`](src/components/kanban/KanbanColumn.tsx)
    - [`TaskCard.tsx`](src/components/kanban/TaskCard.tsx)
    - [`KanbanFilters.tsx`](src/components/kanban/KanbanFilters.tsx)
- Modelos de datos reales en [`prisma/schema.prisma`](prisma/schema.prisma) (incluyendo `Email`, `EmailMetadata`, `Task`, `Contact`).
- Server Actions para emails y tareas definidas en [`src/actions/emails.ts`](src/actions/emails.ts) y [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts).
- Sistema de diseño y componentes UI base en [`src/app/globals.css`](src/app/globals.css) y [`src/components/ui/button.tsx`](src/components/ui/button.tsx).

Este feature **no introduce nuevas áreas funcionales** (como autenticación, notificaciones, IA adicional o analytics). Toda la planificación se limita estrictamente a:

- Kanban por contacto.
- Selector múltiple de contactos.
- Filtro dinámico de tareas por contacto.
- Soporte completo para múltiples tareas por email.
- Drag & Drop funcional entre columnas y persistencia del estado de las tareas.

## Objetivo

Transformar el tablero Kanban actual en un **Kanban por contacto**, donde:

1. El usuario puede **seleccionar uno o varios contactos** y ver únicamente las tareas asociadas a esos contactos.
2. Cada email procesado puede generar **cero, una o varias tareas**, todas visibles como tarjetas independientes.
3. El usuario puede **mover visualmente** las tareas entre columnas (Por hacer, En progreso, Completado) mediante drag & drop.
4. Cada movimiento de tarjeta se refleja de forma persistente en la base de datos, manteniendo la **visión real del trabajo** al recargar el tablero.

## Resultado final esperado

Al finalizar la Semana 4:

- El tablero accesible desde `/kanban` mostrará las tareas organizadas por estado (Por hacer, En progreso, Completado), con **filtro dinámico por contacto** mediante un selector múltiple en la parte superior.
- El ejecutivo podrá:
  - Enfocarse en un subconjunto de contactos (uno o varios) y ver solo las tareas relevantes para ese grupo.
  - Visualizar todas las tareas generadas desde emails procesados, incluyendo escenarios con múltiples tareas por un mismo email.
  - Arrastrar tarjetas entre columnas y saber que ese cambio **actualiza realmente el estado de la tarea en la base de datos**.
- El sistema mantendrá, al recargar la página, la **distribución exacta de tareas** según el último estado guardado, ofreciendo una vista confiable de la carga de trabajo.

---

## Hitos del Proyecto

Este desarrollo se realizará en **4 hitos** secuenciales:

**HITO 1: Backend Kanban por contacto (datos y Server Actions)**  
Definir/ajustar el modelo de datos y las Server Actions necesarias para soportar consultas de tareas por contacto(s) y estado, y la actualización de estado de tareas, manteniendo compatibilidad con el Kanban existente.

**HITO 2: Selector múltiple de contactos y filtro dinámico en el Kanban**  
Implementar el selector múltiple de contactos en la UI, integrarlo en la ruta `/kanban` y conectar el tablero para que se actualice dinámicamente según la selección de uno o varios contactos.

**HITO 3: Soporte visual completo para múltiples tareas por email**  
Refinar la representación de tarjetas y columnas para que múltiples tareas por email se visualicen como tarjetas independientes, con información clara del contacto y del origen (email), manteniendo consistencia con el diseño existente.

**HITO 4: Drag & Drop funcional y persistencia del estado de tareas**  
Implementar la interacción de drag & drop con `@dnd-kit/core`, conectar el movimiento de tarjetas con las Server Actions de actualización de estado y garantizar la persistencia del estado en base de datos.

---

## HITO 1: Backend Kanban por contacto (datos y Server Actions)

### Objetivo del Hito

Preparar el backend para que el Kanban pueda:

- Obtener tareas filtradas por uno o varios contactos.
- Trabajar con múltiples tareas por email sin romper el comportamiento anterior.
- Actualizar el estado de las tareas de forma segura y consistente.

Todo el trabajo de este hito debe ser desplegable sin cambios visibles disruptivos en la UI (la UI puede seguir mostrando un Kanban similar al actual), pero el modelo de datos y las Server Actions deben quedar lista para la integración del selector de contactos y del drag & drop en hitos posteriores.

### Entregables

- [ ] Revisión y, si es necesario, ajustes mínimos al modelo de datos de tareas y contactos en [`prisma/schema.prisma`](prisma/schema.prisma) (sin nuevas entidades, solo ajustes de índices/campos relacionados con contacto/estado).
- [ ] Server Actions específicas para:
  - [ ] Obtener tareas filtradas por:
    - Estado (todo, doing, done).
    - Uno o varios contactos (por email de contacto o `Contact.id`).
  - [ ] Actualizar el estado de una tarea (por ejemplo, mover de `todo` a `doing`).
- [ ] Tipos TypeScript actualizados para tareas/contactos en [`src/types/email.ts`](src/types/email.ts) o, si aplica, en un archivo dedicado a tareas.
- [ ] Documentación técnica breve del contrato de datos del Kanban por contacto en [`src/actions/README.md`](src/actions/README.md) o documento equivalente.

### Tareas

#### Backend

- [ ] Revisar modelos y relaciones actuales:
  - [ ] Abrir [`prisma/schema.prisma`](prisma/schema.prisma) y validar:
    - Relación entre `Email`, `EmailMetadata` y `Task`.
    - Modelo `Contact` y cómo se relaciona con los emails/tareas (al menos por `email` del remitente).
  - [ ] Confirmar estrategia para asociar cada `Task` a un contacto:
    - Contacto principal derivado del campo `Email.from` y modelo `Contact`.
    - Validar si es suficiente para el alcance de Semana 4 (sin introducir relaciones complejas adicionales como múltiples contactos por tarea).
- [ ] Diseñar query de tareas por contacto:
  - [ ] Definir filtro por uno o varios contactos (lista de `contactId` o lista de emails de contacto).
  - [ ] Definir filtro por estado (`status` de la tarea).
  - [ ] Asegurar uso de índices existentes (`status`, `emailMetadataId`, campos de `Contact`) para rendimiento correcto.
- [ ] Implementar Server Action de obtención de tareas:
  - [ ] Crear o extender un archivo de Server Actions específico para Kanban (por ejemplo, [`src/actions/kanban.ts`](src/actions/kanban.ts)) o reutilizar [`src/actions/emails.ts`](src/actions/emails.ts) si la lógica ya está concentrada ahí.
  - [ ] Implementar una acción que:
    - Reciba como entrada: conjunto de contactos seleccionados y estado(s) de tarea relevantes.
    - Devuelva: lista de tareas con información suficiente para el Kanban (id de tarea, estado, descripción, referencia al email, nombre/email del contacto).
  - [ ] Validar todos los inputs con Zod, siguiendo el patrón descrito en [`src/actions/emails.ts`](src/actions/emails.ts).
- [ ] Implementar Server Action de actualización de estado de tarea:
  - [ ] Acción que reciba: `taskId`, estado objetivo (`todo`, `doing`, `done`).
  - [ ] Valide que el estado destino es válido.
  - [ ] Actualice el campo de estado en la tabla de tareas.
  - [ ] Mantenga compatibilidad con la metadata previa (por ejemplo, si existe `taskStatus` en `EmailMetadata`, definir si se sincroniza con el estado de la tarea principal o se mantiene solo como legacy).
  - [ ] Use `revalidatePath("/kanban")` (u otras rutas necesarias) para actualizar la UI tras cambios.

#### Testing

- [ ] Crear tests básicos de las nuevas Server Actions (unitarios o de integración mínima):
  - [ ] Test de obtención de tareas por contacto (contacto con tareas, contacto sin tareas).
  - [ ] Test de actualización de estado válido (todo → doing, doing → done).
  - [ ] Test de manejo de errores (contacto inexistente, `taskId` inválido, estado no permitido).

#### Documentación

- [ ] Actualizar [`src/actions/README.md`](src/actions/README.md) con:
  - [ ] Descripción de las nuevas Server Actions para Kanban por contacto.
  - [ ] Formato de parámetros de entrada/salida.
  - [ ] Reglas de negocio básicas (por ejemplo, estados válidos, manejo de contactos sin tareas).

### Dependencias

- **Internas:**
  - Modelos `Task` y `Contact` ya presentes en [`prisma/schema.prisma`](prisma/schema.prisma).
  - Conexión Prisma configurada en [`src/lib/prisma.ts`](src/lib/prisma.ts).
- **Externas:**
  - Ninguna nueva dependencia externa. Se reutiliza Prisma y Zod ya instalados.

### Consideraciones

- **Performance:**  
  - Asegurar queries eficientes con filtros por contacto y estado.
  - Evitar `include` innecesarios en las relaciones.
- **Seguridad:**  
  - Preparar las Server Actions para filtrar por `userId` en el futuro (aunque el feature actual no implemente autenticación real).
- **Compatibilidad:**  
  - No romper el comportamiento del Kanban actual mientras la UI no haya sido migrada al modo "por contacto".

---

## HITO 2: Selector múltiple de contactos y filtro dinámico en el Kanban

### Objetivo del Hito

Incorporar en la interfaz del tablero `/kanban` un **selector múltiple de contactos** que permita al usuario:

- Ver todos los contactos con tareas pendientes (y/o contactos relevantes del sistema).
- Seleccionar uno o varios contactos.
- Hacer que el tablero Kanban muestre **solo las tareas asociadas a los contactos seleccionados**, manteniendo estados de loading/error consistentes y una UX clara.

### Entregables

- [ ] Selector múltiple de contactos implementado en la parte superior del tablero Kanban.
- [ ] Integración del selector con la lógica de filtrado de tareas:
  - [ ] Filtro reactivo (cuando cambia la selección, se actualizan las tareas mostradas).
- [ ] Manejo de estados de carga, error y “sin tareas para este conjunto de contactos”.
- [ ] Comportamiento razonable con muchos contactos (incluir búsqueda y/o ordenamiento básico).

### Tareas

#### Frontend

- [ ] Diseñar la zona de filtros del Kanban:
  - [ ] Revisar estructura actual de [`KanbanBoard.tsx`](src/components/kanban/KanbanBoard.tsx) y [`KanbanFilters.tsx`](src/components/kanban/KanbanFilters.tsx).
  - [ ] Definir ubicación exacta del selector múltiple de contactos (por ejemplo, en la misma barra donde ya se muestran filtros por categoría/prioridad si existen).
- [ ] Implementar componente de selector múltiple:
  - [ ] Crear o extender un componente de filtro de contactos (puede ubicarse junto a [`KanbanFilters.tsx`](src/components/kanban/KanbanFilters.tsx)).
  - [ ] Soportar:
    - Búsqueda por nombre/email de contacto.
    - Selección múltiple con scroll interno si la lista es extensa.
  - [ ] Utilizar componentes UI existentes (botones, inputs) desde [`src/components/ui/`](src/components/ui/).
  - [ ] Respetar diseño y variables de estilo definidas en [`src/app/globals.css`](src/app/globals.css).
- [ ] Integrar el selector con el Kanban:
  - [ ] Modificar [`KanbanBoard.tsx`](src/components/kanban/KanbanBoard.tsx) para:
    - Mantener en estado local la lista de contactos seleccionados.
    - Invocar la Server Action del Hito 1 para obtener tareas filtradas por contacto(s) y estado.
    - Manejar estados `loading`, `error` y `empty` de forma consistente.
  - [ ] Asegurar que, si no hay contactos seleccionados, el tablero:
    - Muestra todas las tareas, o
    - Muestra un mensaje claro indicando que se debe seleccionar al menos un contacto (definir comportamiento explícito y coherente con UX deseada).

#### Backend

- [ ] Si es necesario, ajustar la Server Action de tareas para permitir:
  - [ ] Parámetro opcional “sin contactos seleccionados” (devolver todas las tareas).
  - [ ] Parámetro con lista de contactos y validación clara.

#### Testing

- [ ] Tests manuales / automáticos:
  - [ ] Selección de un solo contacto → solo tareas de dicho contacto.
  - [ ] Selección de múltiples contactos → unión de tareas asociadas a cualquiera de ellos.
  - [ ] Ningún contacto seleccionado → comportamiento por defecto validado.
  - [ ] Manejo de casos con muchos contactos (verificar rendimiento de UI y usabilidad del selector).

#### Documentación

- [ ] Actualizar documentación de Kanban en [`doc/SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md) (sección de componentes Kanban y flujos de datos) para describir:
  - [ ] Nuevo filtro por contacto.
  - [ ] Comportamiento esperado del tablero al cambiar la selección.

### Dependencias

- **Internas:**
  - Server Actions de Hito 1 listas y estables.
  - Componentes Kanban existentes en [`src/components/kanban/`](src/components/kanban/).
- **Externas:**
  - Ninguna nueva librería. Se reutilizan componentes UI y hooks de React.

### Consideraciones

- **UX:**
  - El selector debe ser claro para usuarios que no están acostumbrados al filtro por contacto (etiquetas, placeholders y textos de ayuda).
- **Performance:**
  - Evitar recargar la página completa al cambiar filtros; priorizar actualización vía estado local y Server Actions.
- **Accesibilidad:**
  - Asegurar navegación por teclado (Tab/Enter/Escape) y `aria-label` adecuados.

---

## HITO 3: Soporte visual completo para múltiples tareas por email

### Objetivo del Hito

Asegurar que el Kanban represente correctamente el caso real de negocio donde **un mismo email puede generar varias tareas**. Cada tarea debe aparecer como una tarjeta independiente con:

- Información clara del contacto.
- Resumen corto de la tarea.
- Referencia suficiente al email origen (para que el usuario entienda el contexto).

El tablero debe seguir siendo legible incluso cuando un contacto tiene muchas tareas.

### Entregables

- [ ] `TaskCard` actualizado para mostrar claramente:
  - [ ] Contacto principal asociado (nombre/email).
  - [ ] Descripción breve de la tarea.
  - [ ] Referencia visual al email asociado (por ejemplo, asunto resumido).
- [ ] Comportamiento consistente cuando hay múltiples tareas por el mismo email:
  - [ ] Cada tarea se muestra como una tarjeta independiente.
  - [ ] No se rompe la navegación hacia la vista detalle del email (ruta `/emails/[id]`).
- [ ] Revisión de la estructura de columnas para asegurar legibilidad con muchas tarjetas.

### Tareas

#### Frontend

- [ ] Revisar implementación actual de `TaskCard`:
  - [ ] Abrir [`src/components/kanban/TaskCard.tsx`](src/components/kanban/TaskCard.tsx).
  - [ ] Identificar qué información se muestra actualmente (estadísticas por `taskStatus`, metadata, etc.).
- [ ] Rediseñar la tarjeta para múltiples tareas:
  - [ ] Incluir:
    - Nombre o email del contacto principal.
    - Breve descripción de la tarea.
    - Indicador del estado actual (Por hacer/En progreso/Completado) alineado con el color/estilo de la columna.
    - Breve referencia al asunto del email.
  - [ ] Usar las clases de badge y sistema de colores definidos en [`src/app/globals.css`](src/app/globals.css), incluyendo badges de categoría y prioridad cuando aplique.
- [ ] Asegurar navegación a detalle de email:
  - [ ] Validar que el click en `TaskCard` siga permitiendo navegar a la ruta `/emails/[id]`:
    - Revisar lógica actual en [`src/app/(protected)/emails/[id]/page.tsx`](src/app/(protected)/emails/[id]/page.tsx).
- [ ] Ajustar distribución de columnas:
  - [ ] Revisar [`src/components/kanban/KanbanColumn.tsx`](src/components/kanban/KanbanColumn.tsx) para:
    - Asegurar scroll vertical adecuado cuando hay muchas tarjetas.
    - Mantener contadores de tareas por columna correctos (contar tareas, no emails).

#### Backend

- [ ] Verificar que la Server Action usada por el Kanban devuelve:
  - [ ] Lista de tareas (no solo emails con bandera `hasTask`).
  - [ ] Información necesaria para renderizar la tarjeta (contacto, descripción, asunto).
- [ ] Si fuera necesario, ajustar el shape de los datos enviados al frontend en el archivo de Server Actions relevante.

#### Testing

- [ ] Casos específicos:
  - [ ] Email con 1 tarea → 1 tarjeta en el Kanban.
  - [ ] Email con 3 tareas → 3 tarjetas visibles, todas asociadas al mismo contacto.
  - [ ] Contacto con muchas tareas → tablero sigue usable (scroll, diseño, contadores correctos).

#### Documentación

- [ ] Actualizar sección de Kanban en [`doc/SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md) para reflejar:
  - [ ] Que el Kanban ahora trabaja a nivel de tareas (no solo `hasTask` a nivel de `EmailMetadata`).
  - [ ] Ejemplos de cómo se ve un email con múltiples tareas en el tablero.

### Dependencias

- **Internas:**
  - Hito 1 y Hito 2 completados (acciones y filtros funcionales).
  - Componentes Kanban ya integrados con datos reales.
- **Externas:**
  - Ninguna nueva dependencia externa.

### Consideraciones

- **UX:**
  - Evitar sobrecargar la tarjeta con demasiada información; priorizar lo esencial (contacto, tarea, contexto mínimo del email).
- **Performance:**
  - Mantener uso de `useMemo` y patrones de memoización donde sea necesario para evitar re-renders innecesarios si la cantidad de tareas crece.

---

## HITO 4: Drag & Drop funcional y persistencia del estado de tareas

### Objetivo del Hito

Activar el **drag & drop real** en el tablero Kanban para que:

- El usuario pueda arrastrar tarjetas entre columnas (Por hacer, En progreso, Completado).
- Cada cambio de posición/columna actualice el estado de la tarea en la base de datos.
- El tablero muestre siempre un estado consistente al recargar (persistencia real).

Este hito completa la transición del Kanban desde un tablero principalmente visual hacia una herramienta operativa de gestión diaria.

### Entregables

- [ ] Drag & drop implementado en el Kanban usando la librería `@dnd-kit/core` ya instalada.
- [ ] Conexión entre operaciones de drag & drop y Server Actions de actualización de estado (Hito 1).
- [ ] Manejo de estados de carga y error durante el cambio de estado de una tarea.
- [ ] Verificación de consistencia al recargar la página (persistencia efectiva).

### Tareas

#### Frontend

- [ ] Revisar estado actual de integración de `@dnd-kit/core`:
  - [ ] Abrir [`src/components/kanban/KanbanBoard.tsx`](src/components/kanban/KanbanBoard.tsx) y verificar si existe estructura parcial de drag & drop.
- [ ] Implementar drag & drop:
  - [ ] Configurar contenedores de columnas como “droppable areas”.
  - [ ] Configurar tarjetas de tareas como “draggable items”.
  - [ ] Definir identificadores únicos por tarea para el sistema de drag & drop.
- [ ] Conectar movimiento con cambio de estado:
  - [ ] Al soltar una tarjeta en una columna diferente:
    - Determinar el estado destino (Por hacer/En progreso/Completado).
    - Invocar la Server Action de actualización de estado de tarea.
    - Actualizar el estado local del Kanban tras la respuesta.
  - [ ] Mostrar feedback visual de operación:
    - Estado de “moviendo tarea” mientras se completa la operación.
    - Mensaje de error si la actualización falla y rollback visual al estado anterior.
- [ ] Mantener estructura responsive:
  - [ ] Validar que el drag & drop funciona correctamente en desktop y que no rompe la UX móvil (cuando aplique).

#### Backend

- [ ] Ajustar (si fuese necesario) la Server Action de actualización de estado para:
  - [ ] Aceptar múltiples cambios en lote (opcional; fuera de alcance si no es estrictamente necesario).
  - [ ] Registrar la fecha de cambio de estado si existe un campo relevante (solo si ya definido en modelo; no se introducen campos nuevos no previstos en el esquema).

#### Testing

- [ ] Casos de prueba:
  - [ ] Mover tarea de “Por hacer” a “En progreso” → estado `doing` persistido correctamente.
  - [ ] Mover tarea a “Completado” → estado `done` persistido.
  - [ ] Recargar `/kanban` después de movimientos → tablero refleja los cambios.
  - [ ] Intentos de movimiento con fallo de backend → rollback visual y mensaje claro.

#### Documentación

- [ ] Documentar en [`doc/SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md) y/o en un documento específico de Kanban:
  - [ ] Comportamiento del drag & drop.
  - [ ] Estados posibles de las tareas.
  - [ ] Limitaciones actuales (por ejemplo, sin reordenamiento dentro de la misma columna si no se implementa).

### Dependencias

- **Internas:**
  - Hito 1 (Server Actions de actualización de estado) completado.
  - Hito 2 y 3 (filtros y tarjetas) integrados.
- **Externas:**
  - Librería `@dnd-kit/core` ya instalada (no requiere nuevas dependencias).

### Consideraciones

- **UX:**
  - Evitar que el drag & drop se sienta “lento” por la espera de la respuesta del servidor (optimizar patrones de actualización optimista cuando sea seguro).
- **Consistencia de datos:**
  - En contextos con varios usuarios (a futuro), podría haber cambios simultáneos. Esta semana no implementa sincronización en tiempo real, pero el diseño debe facilitar la extensión futura.

---

## Resumen de Entregables de la Semana 4

### Funcionalidades Implementadas

Al completar los 4 hitos, el sistema contará con:

- ✅ Backend preparado para Kanban por contacto:
  - Server Actions para obtener tareas por contacto(s) y estado.
  - Server Action para actualizar el estado de una tarea.
- ✅ Tablero Kanban con **selector múltiple de contactos**:
  - Filtro dinámico por uno o varios contactos.
  - Manejo de estados de carga, error y vacíos específicos.
- ✅ Soporte visual para **múltiples tareas por email**:
  - Cada tarea se muestra como tarjeta independiente.
  - Tarjetas enriquecidas con datos de contacto y contexto del email.
- ✅ **Drag & drop operativo** con persistencia:
  - Movimiento de tarjetas entre columnas que actualiza la base de datos.
  - Estado del tablero consistente tras recargas.

### Componentes Creados/Modificados

- Componentes Kanban en [`src/components/kanban/`](src/components/kanban/):
  - [`KanbanBoard.tsx`](src/components/kanban/KanbanBoard.tsx)
  - [`KanbanColumn.tsx`](src/components/kanban/KanbanColumn.tsx)
  - [`TaskCard.tsx`](src/components/kanban/TaskCard.tsx)
  - [`KanbanFilters.tsx`](src/components/kanban/KanbanFilters.tsx) o componente equivalente para selector de contactos.
- Server Actions relacionadas con tareas/contactos (nuevo archivo o extensión de existentes) en [`src/actions/`](src/actions/).
- Posibles ajustes de tipos en [`src/types/email.ts`](src/types/email.ts).
- Ajustes mínimos en [`prisma/schema.prisma`](prisma/schema.prisma) si fueran necesarios para índices o compatibilidad.

### Documentación Actualizada

- Actualización del Sistema Maestro en [`doc/SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md) para reflejar:
  - Kanban por contacto y sus flujos de datos.
  - Comportamiento del selector de contactos.
  - Soporte de múltiples tareas por email.
  - Drag & drop y persistencia de estado de tareas.
- Actualización de [`src/actions/README.md`](src/actions/README.md) con las nuevas Server Actions de Kanban.

### Estado Final del Sistema tras Semana 4

Con este feature completado, el tablero Kanban deja de ser una simple visualización de tareas y se convierte en una **agenda operativa centrada en contactos**. El ejecutivo puede:

- Decidir rápidamente **qué contactos priorizar** durante el día.
- Ver todas las tareas relevantes agrupadas por estado y filtradas por personas.
- Gestionar el avance de cada tarea de forma **visual e intuitiva** mediante drag & drop.
- Confiar en que el tablero refleja el estado real y persistente de su trabajo pendiente y completado.

Este documento deja explícita la planificación de desarrollo necesaria para implementar el **Kanban por contacto y gestión visual de tareas** siguiendo el protocolo de planificación por hitos y manteniendo el alcance estrictamente dentro del feature descrito para la Semana 4.
