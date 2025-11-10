# ✅ **Semana 4 — Kanban + Visualización + Confirmación Final**

**Objetivo general:**
Todo lo que la IA procesó ya está almacenado. Ahora el usuario necesita **ver esas tareas como tarjetas** en un tablero Kanban (To Do, En Progreso, Done), poder moverlas y ver el email original.

📌 En esta semana pasamos de **datos procesados** → **visualización interactiva y gestión de tareas.**

---

## 🧩 **¿Qué tareas principales se trabajan?**

| Bloque                            | ¿Qué se hace?                                                                                         | ¿Por qué es importante?                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 1. Filtrar solo emails con tareas | No todos los emails tienen una tarea. Solo mostramos los que la IA detectó como `tiene_tarea = true`. | El Kanban solo muestra lo útil.                    |
| 2. Mostrar tarjetas en Kanban     | Visualizar cada tarea como tarjeta: título, prioridad, categoría.                                     | El usuario entiende rápido su carga de trabajo.    |
| 3. Drag and Drop (mover tarjetas) | El usuario puede arrastrar tarjetas entre columnas: Pendiente → En Progreso → Hecho.                  | Esto convierte el sistema en algo útil y dinámico. |
| 4. Modal de detalle               | Al hacer clic en una tarjeta, se abre un modal con: email original + metadata IA.                     | El usuario no pierde contexto de la tarea.         |
| 5. Guardar cambios de estado      | Cada vez que mueves una tarjeta, la base de datos se actualiza (`status = TODO, IN_PROGRESS, DONE`).  | Persistencia de cambios = funcionalidad real.      |

---

## 🖥️ **Cómo se ve el flujo visual final**

```
[ Lista de Emails Procesados ] → Botón "Ver Kanban"
                   ↓
[ Tablero Kanban ]
   ├── Por Hacer (TODO)
   │     - Email 1: "Enviar presupuesto" (Alta)
   │     - Email 3: "Responder cliente"
   ├── En Progreso (IN_PROGRESS)
   │     - Email 2: "Preparar presentación"
   └── Completado (DONE)
                   ↓
Usuario arrastra tarjetas entre columnas
                   ↓
Click en tarjeta → aparece modal:
   - Asunto
   - Cuerpo del email
   - Categoría IA
   - Prioridad IA
   - Botón "Actualizar/Guardar"
```

---

## 📁 **¿Qué nuevas partes del sistema aparecen en esta semana?**

| Archivo / Carpeta                  | Función                                                                   |
| ---------------------------------- | ------------------------------------------------------------------------- |
| `/app/kanban/page.tsx`             | Página principal del tablero Kanban.                                      |
| `/components/kanban/Column.tsx`    | Representa cada columna (To Do, In Progress, Done).                       |
| `/components/kanban/Card.tsx`      | Tarjeta individual de tarea.                                              |
| `/components/kanban/TaskModal.tsx` | Modal para mostrar detalles del email y su tarea.                         |
| `/lib/actions/updateTaskStatus.ts` | Server Action para actualizar el estado de una tarea en la base de datos. |
| `/types/task.ts`                   | Tipos de tarea, estados, interfaces.                                      |

---

## ⚙️ **Flujo técnico detrás del Kanban**

```
UI muestra columnas (basado en status en DB)
        ↓
Usuario arrastra tarjeta de TODO → IN_PROGRESS
        ↓
Evento DnD dispara acción → updateTaskStatus(taskId, "IN_PROGRESS")
        ↓
La acción actualiza en la base de datos + revalida UI (revalidatePath)
        ↓
La tarjeta aparece en su nueva columna
```

---

## ⚠️ **Posibles errores o retos en esta semana**

| Problema                             | ¿Qué podría pasar?                                                | Solución                                 |
| ------------------------------------ | ----------------------------------------------------------------- | ---------------------------------------- |
| DnD no guarda en BD                  | El usuario mueve la tarjeta, pero al refrescar vuelve a su lugar. | Usar una Server Action inmediata.        |
| Estado inconsistente                 | Dos usuarios moviendo al mismo tiempo generan conflictos.         | ORMs como Prisma + validaciones básicas. |
| Kanban lento con muchos items        | Si hay 100 tareas se vuelve pesado.                               | Paginación o virtual rendering.          |
| Modal no muestra email correctamente | Falta de estructura en el HTML del cuerpo del email.              | Sanitizar contenido antes.               |

---

## ✅ **Resultado esperado al final de la Semana 4**

✔ El usuario ve todas las tareas detectadas en un tablero Kanban.
✔ Puede moverlas entre columnas con drag and drop.
✔ Puede hacer clic para ver el email completo y los datos IA.
✔ Se guarda el estado actualizado en la base de datos.
✔ Primera versión usable del sistema.
