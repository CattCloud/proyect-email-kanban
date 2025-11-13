

### Mejoras Visuales y Funcionales para el Kanban

#### 1. Multiselect de Contactos (Usuarios)
- Implementa un componente multiselect encima del tablero Kanban, permitiendo elegir uno o varios correos/contactos.
- Al seleccionar, las columnas filtran y muestran solo las tareas vinculadas a los contactos elegidos.
- Visualiza chips/badges para los contactos activos, mostrando color o inicial para cada uno.

#### 2. Organización y claridad por columna
- Mantén el contador de tareas visible en cada columna (“Por hacer”, “En progreso”, “Completado”).
- Cards limpias: email principal, título de tarea destacado, prioridad y categoría en badges (como ya tienes).

#### 3. Detalle y acciones rápidas
- Añade tooltip al pasar sobre contacto, mostrando nombre completo si existe.
- Incluye un menú de opciones (tres puntos) en cada card para acciones rápidas: “Ver email”, “Editar tarea” (en futuro), “Mover rápido”, “Eliminar”.

#### 4. Filtros adicionales (opcional, para escalar)
- Si tienes muchas tareas, permite filtrar adicionalmente por categoría o prioridad.
- Agrega iconos sutiles (por ejemplo, 🔴 🟡 🔵) para prioridad.

#### 5. Visual feedback y estados claros
- Drag & drop con animación fluida, que destaque la card al moverla.
- Mostrar un pequeño “loading” si se está procesando actualización de estado de tarea.

#### 6. Accesibilidad y respuesta móvil
- Cards y columnas con márgenes generosos, bordes suaves, fuentes legibles.
- Diseño responsivo: en móvil, las columnas pueden apilarse verticalmente y el multiselect debe estar visible y usable fácilmente.

***

### Ejemplo textual de funcionalidad para documentación

> El Tablero Kanban permite la visualización, gestión y filtrado de las tareas extraídas de los emails, segmentando dinámicamente por uno o varios contactos seleccionados (multiselect en la parte superior).
>
> Cada columna muestra el estado (“Por hacer”, “En progreso”, “Completado”) y el número de tareas por columna. Las tarjetas presentan correo del contacto, título, acción de la tarea, prioridad, categoría y acciones rápidas.
>
> Al seleccionar contactos en el filtro, solo las tareas vinculadas a esos usuarios se muestran en el tablero. Las tareas pueden moverse entre columnas con drag & drop, manteniendo la visualización limpia y responsiva.
