# Planificación de Desarrollo: Sistema de Historial de Actividad por Usuario

**Fecha de creación:** 26 de Noviembre, 2025  
**Versión:** 1.0.0  
**Responsable:** Equipo de Desarrollo  
**Revisado por:** Sistema Maestro v3.0.1

---

## Feature/Fix: Sistema de Historial de Actividad por Usuario

### Información General

**Tipo:** Feature

El sistema actual ya dispone de las operaciones core de negocio descritas en el Sistema Maestro [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md) y de un diseño detallado del **sistema de historial funcional por usuario** en [`doc/historial-actividad.md`](doc/historial-actividad.md). Sin embargo, este historial aún **no está planificado ni integrado** como feature incremental bajo el protocolo de planificación.

Este feature introduce un **Sistema de Historial de Actividad por Usuario** que registra, de forma estructurada y auditable, las 3 actividades core del sistema:

- Importaciones de emails.
- Procesamientos con IA (batch/individual) con coste aproximado de tokens.
- Cambios de estado en el Kanban (movimiento de tareas entre columnas).

El alcance de este feature se limita estrictamente a:

- Modelar y persistir el historial de actividad por usuario (`ActivityLog`) en la base de datos.
- Exponer un servicio backend de logging y consulta reutilizable por las Server Actions existentes.
- Integrar el logging en las acciones críticas actuales: importación de emails, procesamiento IA y actualización de tareas Kanban.
- Implementar una página `/activity` con UI dedicada (estadísticas + timeline) para que el usuario vea su propio historial.

**Fuera de alcance (solo contexto futuro, NO se implementa en este feature):**

- Facturación real por uso (planes, invoices, límites de consumo).
- Nuevos tipos de actividad distintos a los definidos en [`doc/historial-actividad.md`](doc/historial-actividad.md) (por ejemplo, eliminación de emails, automatizaciones adicionales).
- Paginación avanzada, filtrado por rango de fechas o exportación del historial a CSV/Excel.

### Objetivo

Diseñar e implementar un sistema de historial por usuario que:

- Registre de forma robusta y no intrusiva las operaciones críticas de negocio (importación, IA, Kanban).
- Permita a cada usuario visualizar sus métricas de uso (número de operaciones y coste acumulado de IA).
- Aporte trazabilidad suficiente para auditoría funcional básica y futura facturación por uso.
- Respete los principios de rendimiento, privacidad y no interferencia con el flujo principal (el logging **nunca** debe romper operaciones core).

### Resultado final esperado

Al finalizar este feature:

- Existirá un modelo `ActivityLog` en [`prisma/schema.prisma`](prisma/schema.prisma) correctamente migrado y relacionado con `User`, con índices que soporten consultas eficientes por `userId`, `activityType` y `createdAt`.
- Existirá un servicio backend centralizado [`src/lib/activity-logger.ts`](src/lib/activity-logger.ts) que exponga al menos las funciones [`logActivity()`](src/lib/activity-logger.ts:1), [`getUserActivityLog()`](src/lib/activity-logger.ts:1) y [`getUserActivityStats()`](src/lib/activity-logger.ts:1).
- Las Server Actions de importación de emails, procesamiento IA y Kanban ([`src/actions/emails.ts`](src/actions/emails.ts), [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts) y [`src/actions/kanban.ts`](src/actions/kanban.ts)) registrarán eventos en el historial según las estructuras de metadata definidas en [`doc/historial-actividad.md`](doc/historial-actividad.md).
- Existirá una nueva página protegida [`src/app/(protected)/activity/page.tsx`](src/app/(protected)/activity/page.tsx) que muestre, para el usuario autenticado, estadísticas agregadas y un timeline de sus últimas actividades.
- Los componentes UI específicos de actividad ([`src/components/activity/ActivityStats.tsx`](src/components/activity/ActivityStats.tsx), [`src/components/activity/ActivityTimeline.tsx`](src/components/activity/ActivityTimeline.tsx) y, opcionalmente, [`src/components/activity/ActivityFilters.tsx`](src/components/activity/ActivityFilters.tsx)) estarán implementados y estilados según el sistema de diseño existente en [`src/app/globals.css`](src/app/globals.css).
- Se dispondrá de una batería mínima de casos de prueba manuales y/o automatizados que validen el registro correcto de actividad y la visualización en `/activity`, y la documentación del Sistema Maestro estará actualizada para reflejar este nuevo subsistema.

### Hitos del Proyecto

Este desarrollo se realizará en **4 hitos** secuenciales:

**HITO 1: Modelo de datos y servicio base de logging**  
Definir e implementar el modelo `ActivityLog` en Prisma, sus relaciones con `User` y los tipos TypeScript asociados, junto con el servicio backend de logging y consulta básico (sin integración aún en las acciones core ni UI).

**HITO 2: Integración de logging en Server Actions críticas**  
Integrar el servicio de logging en las Server Actions de importación de emails, procesamiento IA y Kanban, siguiendo las estructuras de metadata y reglas de coste/estado descritas en [`doc/historial-actividad.md`](doc/historial-actividad.md).

**HITO 3: Página de Historial de Actividad y componentes UI**  
Crear la página `/activity` y los componentes de UI asociados (estadísticas, timeline y filtros básicos) consumiendo las Server Actions de historial, garantizando una experiencia consistente con el resto del sistema.

**HITO 4: Pruebas, rendimiento, privacidad y documentación**  
Realizar pruebas end-to-end del flujo de historial, revisar puntos críticos de rendimiento y privacidad, y actualizar el Sistema Maestro y documentación auxiliar para consolidar el feature.

---

## HITO 1: Modelo de datos y servicio base de logging

### Objetivo del Hito
Diseñar y materializar la **capa de datos y servicio backend** para el sistema de historial, dejando disponible un API interno estable para ser usado por el resto de la aplicación.

### Entregables

- [ ] Modelo `ActivityLog` definido en [`prisma/schema.prisma`](prisma/schema.prisma) con índices adecuados.
- [ ] Relación `User.activityLogs` añadida al modelo `User` en [`prisma/schema.prisma`](prisma/schema.prisma).
- [ ] Migraciones Prisma creadas y aplicadas en entorno local para el nuevo modelo.
- [ ] Cliente Prisma regenerado (`npx prisma generate`) funcionando sin errores de tipos.
- [ ] Servicio backend `ActivityLogger` implementado en [`src/lib/activity-logger.ts`](src/lib/activity-logger.ts) con las funciones [`logActivity()`](src/lib/activity-logger.ts:1), [`getUserActivityLog()`](src/lib/activity-logger.ts:1) y [`getUserActivityStats()`](src/lib/activity-logger.ts:1).
- [ ] Tipos TypeScript centrales de actividad definidos en [`src/types/activity.ts`](src/types/activity.ts) (tipos de actividad, estado, metadata y responses de estadísticas).

### Tareas

#### Backend – Base de datos y modelos

- [ ] Revisar el estado actual de [`prisma/schema.prisma`](prisma/schema.prisma) para confirmar la existencia del modelo `User` multiusuario.
- [ ] Implementar el modelo `ActivityLog` según la propuesta de [`doc/historial-actividad.md`](doc/historial-actividad.md), ajustando si es necesario para cumplir las reglas de tipado y diseño actuales (por ejemplo, enumeraciones vs. `String`).
- [ ] Añadir la relación inversa `activityLogs` en el modelo `User`.
- [ ] Definir índices compuestos para consultas frecuentes:
  - [ ] `@@index([userId, createdAt])` para timeline por usuario.
  - [ ] `@@index([activityType, userId])` para filtros por tipo.
  - [ ] `@@index([createdAt])` para ordenaciones globales si se necesitan.
- [ ] Crear y ejecutar migración Prisma (`npx prisma migrate dev --name add_activity_log`).
- [ ] Ejecutar [`npx prisma generate`](prisma/README.md) y verificar que no aparecen errores de tipos tras la generación.

#### Backend – Servicio `ActivityLogger`

- [ ] Crear el archivo [`src/lib/activity-logger.ts`](src/lib/activity-logger.ts) siguiendo las reglas de estructura de [`src/lib/prisma.ts`](src/lib/prisma.ts) y las normas de TypeScript estricto (R1).
- [ ] Implementar [`logActivity()`](src/lib/activity-logger.ts:1) como wrapper resiliente sobre `prisma.activityLog.create`, con manejo de errores en `try/catch` que **nunca** lance excepción hacia arriba (solo `console.error` controlado).
- [ ] Implementar [`getUserActivityLog()`](src/lib/activity-logger.ts:1) con soporte de filtros simples (`activityType`, `limit`, `offset`) y ordenación por `createdAt DESC`.
- [ ] Implementar [`getUserActivityStats()`](src/lib/activity-logger.ts:1) que devuelva contadores agregados (`totalImports`, `totalProcessings`, `totalKanbanUpdates`, `totalCostUSD`) mediante agregaciones Prisma (`count`, `_sum`).
- [ ] Garantizar que las funciones del servicio usan tipos estrictos exportados desde [`src/types/activity.ts`](src/types/activity.ts) (evitar `any`).

#### Tipos y contratos

- [ ] Crear [`src/types/activity.ts`](src/types/activity.ts) con:
  - [ ] `ActivityType` (`"email_import" | "ai_processing" | "kanban_update"`).
  - [ ] `ActivityStatus` (`"success" | "partial_success" | "error"`).
  - [ ] Tipos de metadata específicos por actividad (`EmailImportMetadata`, `AIProcessingMetadata`, `KanbanUpdateMetadata`) alineados con [`doc/historial-actividad.md`](doc/historial-actividad.md).
  - [ ] Tipo `UserActivityLogEntry` tipado según lo que devuelve Prisma (`ActivityLog` + campos relacionados relevantes).
  - [ ] Tipo `UserActivityStats` con la forma esperada por la UI y Server Actions.
- [ ] Exportar estos tipos desde [`src/types/index.ts`](src/types/index.ts) para uso global en el proyecto.

#### Testing

- [ ] Crear datos de prueba mínimos para `ActivityLog` mediante:
  - [ ] Seed temporal en [`prisma/seed.ts`](prisma/seed.ts) **o**
  - [ ] Script puntual desde una tarea Node/TS (opcional) que utilice [`logActivity()`](src/lib/activity-logger.ts:1).
- [ ] Probar consultas directas con [`getUserActivityLog()`](src/lib/activity-logger.ts:1) y [`getUserActivityStats()`](src/lib/activity-logger.ts:1) en un entorno de prueba (por ejemplo, llamando desde una Server Action temporal o desde un script).

#### Actualización de documentación

- [ ] Añadir en [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md) una subsección en “5. Base de Datos y Modelado” describiendo el nuevo modelo `ActivityLog` y su relación con `User`.
- [ ] Documentar brevemente en “7. Servicios y Acciones del Backend” la existencia del servicio [`src/lib/activity-logger.ts`](src/lib/activity-logger.ts) y sus funciones principales.

### Dependencias

- **Internas:**
  - Modelo `User` ya creado en Prisma (migraciones `add_user_and_user_id_multiuser`).
  - Cliente Prisma configurado en [`src/lib/prisma.ts`](src/lib/prisma.ts).
- **Externas:**
  - Ninguna adicional para este hito (se trabaja solo sobre DB existente).

### Consideraciones

- **Performance:** El diseño de índices debe prever un volumen de historial creciente por usuario, evitando consultas sin filtro de `userId` salvo casos muy controlados (no contemplados en este feature).
- **Seguridad:** Toda consulta de historial estará pensada para filtrar por `userId` del usuario autenticado (la lógica de autenticación se gestiona en otros features, pero el contrato del servicio debe asumir multiusuario).
- **Migración:** El modelo `ActivityLog` debe añadirse de forma retrocompatible; si existen datos previos, se puede comenzar con historial vacío sin afectar al resto de funcionalidades.

---

## HITO 2: Integración de logging en Server Actions críticas

### Objetivo del Hito
Conectar el servicio de logging con las Server Actions existentes de importación de emails, procesamiento IA y Kanban, garantizando que cada operación relevante registre una entrada coherente y útil en el historial sin afectar la estabilidad del sistema.

### Entregables

- [ ] [`src/actions/emails.ts`](src/actions/emails.ts) integrado con [`logActivity()`](src/lib/activity-logger.ts:1) al final de `importEmailsFromJSON`.
- [ ] [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts) integrado con [`logActivity()`](src/lib/activity-logger.ts:1) en `processEmailsWithAI`, incluyendo cálculo de coste aproximado por tokens usados.
- [ ] [`src/actions/kanban.ts`](src/actions/kanban.ts) integrado con [`logActivity()`](src/lib/activity-logger.ts:1) en la acción que actualiza el estado de tareas (`updateTaskStatus` o equivalente).
- [ ] Cálculo de coste IA implementado en [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts) mediante una función auxiliar (por ejemplo, [`calculateAICost()`](src/actions/ai-processing.ts:1)) con constantes de pricing actualizables.
- [ ] Todas las llamadas a logging encapsuladas en bloques `try/catch` que **no** interrumpan la operación principal en caso de fallo de escritura en `ActivityLog`.

### Tareas

#### Backend – Importación de emails

- [ ] Revisar `importEmailsFromJSON` en [`src/actions/emails.ts`](src/actions/emails.ts) para identificar el punto correcto de logging (normalmente, justo antes del `return`).
- [ ] Obtener el `userId` de la sesión real (si ya existe autenticación) o, temporalmente, del mecanismo de usuario actual definido en el proyecto (según estado real de [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md)).
- [ ] Construir el objeto de metadata de importación siguiendo la interfaz `EmailImportMetadata` definida en [`src/types/activity.ts`](src/types/activity.ts).
- [ ] Determinar el `status` de actividad (`"success"`, `"partial_success"`, `"error"`) en función de los contadores de éxito/errores/duplicados, tal como detalla [`doc/historial-actividad.md`](doc/historial-actividad.md).
- [ ] Invocar [`logActivity()`](src/lib/activity-logger.ts:1) en un bloque `try/catch` con la metadata y los IDs de emails importados.

#### Backend – Procesamiento IA

- [ ] Revisar `processEmailsWithAI` en [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts) para localizar el lugar donde se recibe la respuesta de OpenAI (`usage` de tokens).
- [ ] Implementar constantes de pricing `MODEL_PRICING` y la función [`calculateAICost()`](src/actions/ai-processing.ts:1) tal como se propone en [`doc/historial-actividad.md`](doc/historial-actividad.md), adaptándolas a las convenciones de tipos y estilos del proyecto.
- [ ] Calcular `estimatedCost` en centavos a partir de `usage.prompt_tokens`, `usage.completion_tokens` y el modelo utilizado.
- [ ] Calcular métricas de confianza media (`averageConfidence`) y número de resultados con baja confianza (`lowConfidenceCount`) a partir de la estructura actual de resultados IA.
- [ ] Construir el objeto `AIProcessingMetadata` y llamar a [`logActivity()`](src/lib/activity-logger.ts:1) con `activityType = "ai_processing"`, `status` adecuado y la lista de `emailIds` procesados.

#### Backend – Actualización de Kanban

- [ ] Revisar la acción de actualización de estado (`updateTaskStatus` o equivalente) en [`src/actions/kanban.ts`](src/actions/kanban.ts).
- [ ] Asegurarse de obtener la tarea y su estado anterior **antes** de actualizar (`previousStatus`).
- [ ] Incluir en la consulta la relación con `EmailMetadata` y `Email` para disponer de `subject` y `contactName` del email relacionado.
- [ ] Tras la actualización (dentro o justo después de la transacción Prisma), construir `KanbanUpdateMetadata` y registrar la actividad con [`logActivity()`](src/lib/activity-logger.ts:1).

#### Backend – Manejo de errores y resiliencia

- [ ] Asegurar que todas las llamadas a [`logActivity()`](src/lib/activity-logger.ts:1) están envueltas en `try/catch` locales que **no** relancen errores.
- [ ] Revisar los mensajes de `console.error` para que sean claros pero no incluyan datos sensibles ni payloads completos de emails o prompts IA.

#### Testing

- [ ] Ejecutar flujos manuales en entorno local:
  - [ ] Importar un lote de emails desde el modal de importación y comprobar que se crean registros `email_import` en `ActivityLog`.
  - [ ] Procesar un conjunto de emails con IA y verificar la creación de registros `ai_processing` con `tokensUsed` y `estimatedCost` razonables.
  - [ ] Mover tareas entre columnas en `/kanban` y comprobar que se registran actividades `kanban_update` con `previousStatus` y `newStatus` correctos.
- [ ] Validar, a través de consultas directas a BD o usando `getUserActivityLog`, que los datos de metadata coinciden con las operaciones realizadas.

#### Actualización de documentación

- [ ] Añadir en la sección “7. Servicios y Acciones del Backend” de [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md) una descripción breve de cómo las Server Actions principales ahora registran actividad en `ActivityLog`.

### Dependencias

- **Internas:**
  - Hito 1 completado (modelo `ActivityLog`, servicio `ActivityLogger` y tipos de actividad).
  - Server Actions de emails, IA y Kanban ya implementadas según el estado actual del proyecto.
- **Externas:**
  - OpenAI API funcional para obtener `usage` en el procesamiento IA.

### Consideraciones

- **No interferencia:** Bajo ninguna circunstancia un fallo de logging debe evitar que una importación, procesamiento IA o cambio de estado en Kanban se complete (salvo errores ajenos al historial).
- **Consistencia de datos:** La metadata registrada debe ser lo suficientemente estable como para servir de base futura a facturación por uso; evitar cambios de estructura no versionados.
- **Privacidad:** No almacenar contenido completo de emails ni prompts/respuestas detalladas de IA; limitarse a asuntos, IDs y resúmenes numéricos (tal como define [`doc/historial-actividad.md`](doc/historial-actividad.md)).

---

## HITO 3: Página de Historial de Actividad y componentes UI

### Objetivo del Hito
Ofrecer al usuario una **vista clara y amigable** de su historial de actividad y métricas de uso, mediante una nueva página `/activity` integrada en la navegación protegida, utilizando Server Components y componentes cliente según las reglas del sistema de diseño.

### Entregables

- [ ] Nueva ruta protegida [`src/app/(protected)/activity/page.tsx`](src/app/(protected)/activity/page.tsx) que consume las Server Actions de historial.
- [ ] Server Actions específicas de historial implementadas en [`src/actions/activity.ts`](src/actions/activity.ts) (por ejemplo, [`getActivityHistory()`](src/actions/activity.ts:1) y [`getActivityStatistics()`](src/actions/activity.ts:1)).
- [ ] Componente [`ActivityStats`](src/components/activity/ActivityStats.tsx:1) creado en [`src/components/activity/ActivityStats.tsx`](src/components/activity/ActivityStats.tsx) para mostrar métricas agregadas de actividad.
- [ ] Componente [`ActivityTimeline`](src/components/activity/ActivityTimeline.tsx:1) creado en [`src/components/activity/ActivityTimeline.tsx`](src/components/activity/ActivityTimeline.tsx) para listar cronológicamente las actividades con metadata contextual.
- [ ] Componente opcional [`ActivityFilters`](src/components/activity/ActivityFilters.tsx:1) creado en [`src/components/activity/ActivityFilters.tsx`](src/components/activity/ActivityFilters.tsx) para filtrar por tipo de actividad.
- [ ] Estilos específicos de actividad añadidos o ajustados en [`src/app/globals.css`](src/app/globals.css) respetando el sistema de diseño existente.

### Tareas

#### Backend – Server Actions de historial

- [ ] Crear el archivo [`src/actions/activity.ts`](src/actions/activity.ts) marcado con `"use server"` según las reglas de Server Actions.
- [ ] Implementar [`getActivityHistory()`](src/actions/activity.ts:1) que:
  - [ ] Obtenga el `userId` de la sesión actual (o del mecanismo temporal de usuario si la autenticación real aún no está activa).
  - [ ] Invoque [`getUserActivityLog()`](src/lib/activity-logger.ts:1) con filtros opcionales (`activityType`, `limit`, `offset`).
  - [ ] Devuelva un objeto estándar `{ success: boolean; data?: UserActivityLogEntry[]; error?: string }`.
- [ ] Implementar [`getActivityStatistics()`](src/actions/activity.ts:1) que:
  - [ ] Obtenga el `userId` actual.
  - [ ] Invoque [`getUserActivityStats()`](src/lib/activity-logger.ts:1).
  - [ ] Devuelva `{ success: boolean; data?: UserActivityStats; error?: string }`.

#### Frontend – Página `/activity`

- [ ] Crear [`src/app/(protected)/activity/page.tsx`](src/app/(protected)/activity/page.tsx) como Server Component que:
  - [ ] Obtenga el `userId` de la sesión (directamente o mediante helper centralizado de autenticación).
  - [ ] Llame en paralelo a [`getActivityHistory()`](src/actions/activity.ts:1) y [`getActivityStatistics()`](src/actions/activity.ts:1).
  - [ ] Maneje estados de error devolviendo una UI consistente con el resto del sistema (mensaje de error simple o componente compartido).
  - [ ] Renderice el header de página, tarjetas de estadísticas, filtros (si se implementan) y el timeline de actividades.

#### Frontend – Componentes UI de actividad

- [ ] Crear el directorio [`src/components/activity/`](src/components/activity) si aún no existe.
- [ ] Implementar [`ActivityStats`](src/components/activity/ActivityStats.tsx:1) como componente cliente (`"use client"`) con props tipadas `ActivityStatsProps`, mostrando las 4 tarjetas descritas en [`doc/historial-actividad.md`](doc/historial-actividad.md) (importaciones, procesamientos IA, movimientos Kanban, coste acumulado IA).
- [ ] Implementar [`ActivityTimeline`](src/components/activity/ActivityTimeline.tsx:1) como componente cliente que:
  - [ ] Reciba una lista de `UserActivityLogEntry` (adaptada al lado cliente).
  - [ ] Muestre cada actividad con iconos por tipo, estado (success/partial/error) y metadata específica por tipo, utilizando formateo de fechas relativo (`date-fns` con locale `es`).
  - [ ] Incluya un estado vacío claro cuando no existan actividades.
- [ ] Implementar [`ActivityFilters`](src/components/activity/ActivityFilters.tsx:1) (opcional para MVP del feature) permitiendo filtrar por tipo de actividad actualizando query params (`type=email_import | ai_processing | kanban_update`).

#### Frontend – Estilos y diseño

- [ ] Revisar [`src/app/globals.css`](src/app/globals.css) y añadir/ajustar clases:
  - [ ] `.activity-page`, `.activity-stats`, `.stat-card`, `.activity-timeline`, `.activity-item`, `.activity-meta`, `.activity-filters`, etc., siguiendo las indicaciones de diseño de [`doc/historial-actividad.md`](doc/historial-actividad.md).
  - [ ] Respetar el uso de variables `var(--color-*)` y patrones de tarjetas ya presentes en dashboard y Kanban.
- [ ] Verificar que la página `/activity` es responsive (4 tarjetas en desktop, 2 en tablet, 1 en mobile) y consistente con el resto del sistema.

#### Testing

- [ ] Smoke tests manuales de la página `/activity`:
  - [ ] Verificar que, tras realizar varias importaciones/IA/Kanban, las métricas agregadas muestran valores coherentes.
  - [ ] Verificar que el timeline presenta actividades en orden cronológico inverso y con metadata legible.
  - [ ] Probar cambios de filtro (si se implementan) y confirmar que se actualiza el listado acorde al tipo seleccionado.
- [ ] Ejecutar `npm run build` para asegurar que no hay errores de tipos derivados de los nuevos componentes y Server Actions.

#### Actualización de documentación

- [ ] Añadir en [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md) una sección dentro de “8. Componentes UI y Sistema de Diseño” que describa brevemente los nuevos componentes de actividad (`ActivityStats`, `ActivityTimeline`, `ActivityFilters`).
- [ ] Actualizar la sección de flujos de navegación para incluir la nueva ruta `/activity` como parte del conjunto de vistas protegidas.

### Dependencias

- **Internas:**
  - Hitos 1 y 2 completados (modelo y servicio de historial + integración en acciones).
  - Sistema de autenticación y layout protegido configurados (feature de autenticación con Google y asociación de usuario si ya están implementados).
- **Externas:**
  - Librerías UI ya presentes (`date-fns`, componentes `Button`, etc.), sin nuevas dependencias principales.

### Consideraciones

- **UX:** La página `/activity` debe aportar valor incluso con pocas actividades registradas, evitando sobrecargar de detalles técnicos al usuario final; centrarse en descripciones claras y métricas comprensibles.
- **Accesibilidad:** Asegurar que los elementos interactivos (chips de filtro, si se usan) son navegables por teclado y tienen `aria-label` cuando solo muestran iconos.
- **Performance:** Limitar el número de actividades obtenidas por defecto (por ejemplo, 50 últimos registros) y evaluar paginación simple si el volumen crece, pero sin implementarla aún (fuera de alcance de este feature).

---

## HITO 4: Pruebas, rendimiento, privacidad y documentación

### Objetivo del Hito
Consolidar el feature de historial de actividad asegurando su calidad mediante pruebas, revisiones de rendimiento y privacidad de datos, y actualizando la documentación oficial para que el sistema quede preparado para su uso y evolución futura (por ejemplo, facturación por uso, nuevas actividades).

### Entregables

- [ ] Conjunto mínimo de casos de prueba (manuales y/o automatizados) que cubran los escenarios clave descritos en [`doc/historial-actividad.md`](doc/historial-actividad.md) (importación exitosa/parcial, procesamiento IA, movimiento de tareas, estadísticas acumuladas).
- [ ] Verificación explícita de que el logging no introduce regresiones de rendimiento apreciables en las operaciones core (al menos en entorno local con datos de prueba).
- [ ] Revisión y ajuste de aspectos de privacidad (no almacenar contenido completo de emails ni datos excesivamente sensibles en `metadata`).
- [ ] Documentación actualizada en [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md) y, si aplica, una guía breve en `doc/guia/` para desarrolladores sobre el uso de `ActivityLog`.

### Tareas

#### Testing – Casos funcionales

- [ ] Replicar y documentar los casos de prueba recomendados en [`doc/historial-actividad.md`](doc/historial-actividad.md):
  - [ ] Importación exitosa (10/10 emails válidos).
  - [ ] Importación parcial (mezcla de duplicados y errores).
  - [ ] Procesamiento IA con un conjunto de emails y verificación de `tokensUsed`, `estimatedCost` y `averageConfidence`.
  - [ ] Movimiento de tareas entre estados en el Kanban.
  - [ ] Estadísticas acumuladas tras múltiples operaciones mixtas.
- [ ] Verificar que cada caso aparece correctamente reflejado tanto en BD (`ActivityLog`) como en la UI de `/activity`.

#### Testing – Técnicos

- [ ] Ejecutar `npm run build` para asegurar que el proyecto compila correctamente con los nuevos modelos, servicios, acciones y componentes.
- [ ] (Opcional) Añadir tests unitarios/integración de bajo coste en [`src/tests/`](src/tests/) para:
  - [ ] [`calculateAICost()`](src/actions/ai-processing.ts:1) con distintos modelos y volúmenes de tokens.
  - [ ] [`getUserActivityStats()`](src/lib/activity-logger.ts:1) con distintos escenarios de datos de actividad.

#### Revisión de rendimiento y privacidad

- [ ] Revisar logs y tiempos de respuesta en operaciones intensivas (procesamiento IA e importaciones) antes y después de activar el logging, estimando el overhead añadido.
- [ ] Confirmar que `metadata` en `ActivityLog` no almacena cuerpos completos de email ni prompts/respuestas extensas de IA, sino solo información resumida necesaria.
- [ ] Verificar que se limita el tamaño de arrays de errores/metadata (por ejemplo, máximo 5 errores en importación) según lo descrito en [`doc/historial-actividad.md`](doc/historial-actividad.md).

#### Actualización de documentación

- [ ] Actualizar en [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md):
  - [ ] Sección 5 (Base de Datos y Modelado) para incluir `ActivityLog`.
  - [ ] Sección 7 (Servicios y Acciones del Backend) para documentar `ActivityLogger` y `src/actions/activity.ts`.
  - [ ] Sección 9 (Flujos de Datos y Procesos Clave) para describir el nuevo flujo “Registro y visualización de historial de actividad”.
- [ ] (Opcional) Crear o completar una guía en [`doc/guia/`](doc/guia) (por ejemplo, `HISTORIAL_ACTIVIDAD_USUARIO.md`) que oriente a desarrolladores sobre cómo añadir nuevos tipos de actividad en el futuro (marcándolo explícitamente como **fuera de alcance del feature actual**).

### Dependencias

- **Internas:**
  - Hitos 1, 2 y 3 completados y desplegables.
- **Externas:**
  - Ninguna adicional; reutiliza los servicios externos ya integrados (OpenAI, BD).

### Consideraciones

- **Criterios de calidad:** No se debe cerrar el feature sin comprobar los escenarios críticos de uso y sin garantizar que el logging es estable bajo las condiciones habituales de uso del sistema.
- **Evolución futura:** Aunque la extensión a facturación por uso y nuevos tipos de actividad es **fuera de alcance**, la implementación debe dejar claro cómo extender `ActivityType`, las estructuras de metadata y los componentes de UI sin romper compatibilidad hacia atrás.

---

## Supuestos, riesgos y criterios de completitud

### Supuestos

1. El sistema ya dispone de un modelo `User` en Prisma y de algún mecanismo (actual o planificado) para obtener `userId` en Server Actions (por ejemplo, a través del feature de autenticación con Google).
2. La base de datos PostgreSQL (Neon) puede asumir el volumen esperado de registros de `ActivityLog` sin necesidad de particionamiento ni optimizaciones avanzadas en este momento.
3. La integración con OpenAI ya está operativa y devuelve `usage` de tokens en las respuestas utilizadas por `processEmailsWithAI`.

### Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| Incremento de latencia en operaciones core debido al logging síncrono | Media | Medio | Mantener el logging ligero, evitar lógica pesada en `logActivity` y envolver llamadas en `try/catch` sin reintentos costosos. Evaluar en Hito 4 si fuese necesario pasar a colas asíncronas en el futuro (fuera de alcance actual). |
| Cambios futuros en precios de OpenAI que hagan inexactos los cálculos de coste | Alta | Bajo | Centralizar constantes de pricing en una única estructura (`MODEL_PRICING`) y documentar la necesidad de revisión periódica. |
| Posible almacenamiento de información sensible en `metadata` | Media | Alto | Definir claramente en tipos y documentación qué campos se permiten y revisar en Hito 4 que no se esté almacenando contenido completo ni datos excesivos. |

### Criterios de completitud del feature

El feature se considera completo cuando:

1. ✅ El modelo `ActivityLog` está presente en BD, relacionado con `User`, y las migraciones se aplican correctamente en entornos de desarrollo/pruebas.
2. ✅ Las Server Actions de importación de emails, procesamiento IA y Kanban registran entradas coherentes en `ActivityLog` para cada operación relevante, sin romper el flujo principal incluso si el logging falla.
3. ✅ La página `/activity` muestra, para un usuario concreto, estadísticas agregadas y un timeline de actividades recientes con metadata clara y consistente.
4. ✅ Se han ejecutado y documentado los casos de prueba clave (importación, IA, Kanban, estadísticas) confirmando que el historial refleja fielmente la actividad real del sistema.
5. ✅ La documentación del Sistema Maestro y, en su caso, guías auxiliares, están actualizadas para describir el nuevo subsistema de historial y cómo se integra con el resto de la arquitectura.
6. ✅ `npm run build` se ejecuta sin errores de tipos ni de compilación tras todos los cambios relacionados con este feature.