# Planificación de Desarrollo: Implementación del Nivel de Confianza IA

**Fecha de creación:** 25 de Noviembre, 2025  
**Versión:** 1.0.0  
**Responsable:** Equipo de Desarrollo  
**Revisado por:** Sistema Maestro v3.0.x

---

## Feature/Fix: Implementación del Nivel de Confianza IA

### Información General

**Tipo:** Feature

El sistema actual ya dispone de un flujo completo de procesamiento IA de emails (importación → análisis IA → revisión → Kanban) descrito en [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md) y en el feature de procesamiento IA [`doc/FEATURE2_PROCESAMIENTO_IA.md`](doc/FEATURE2_PROCESAMIENTO_IA.md). Sin embargo, la calidad del análisis IA se presenta al usuario como “todo o nada”: la metadata generada se muestra sin una métrica explícita que indique cuán confiable es el resultado ni por qué.

El documento de diseño funcional y técnico del **Sistema de Nivel de Confianza IA para Metadata de Emails** se encuentra en [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md) y define:

- Una métrica compuesta de **0–100%** calculada **en el servidor**, nunca por la IA.  
- 7 factores objetivos (validez de tareas, coherencia de prioridad, claridad de contenido, completitud de metadata, coincidencia con patrones, calidad de tags e historial de feedback).  
- Una estructura de datos y algoritmos TypeScript para calcular el score y entregar un desglose auditables.  
- Una propuesta de integración en base de datos, Server Actions y componentes UI.

Este feature tiene como objetivo **implementar completamente** ese sistema de nivel de confianza en el código real, respetando la arquitectura existente (Smart Actions + Prisma + Next.js) y sin introducir cambios que se salgan del alcance definido en [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md).

**Fuera de alcance (solo contexto, NO se implementa en este feature):**

- Cualquier cambio en el prompt de IA más allá de lo estrictamente necesario para seguir validando la misma estructura de `EmailAnalysis`.  
- Métricas globales o dashboards adicionales basados en el nivel de confianza (gráficas, informes históricos, etc.).  
- Aprendizaje automático real a partir del feedback (ajuste dinámico de pesos o factores).  
- Reprocesamiento automático basado en confianza baja (los reprocesos siguen siendo manuales, usando los flujos definidos en features previos).

### Objetivo

Incorporar al sistema una **métrica visible y persistente de Nivel de Confianza IA** para cada email procesado, de modo que:

- El servidor calcule un **score compuesto 0–100** para cada análisis IA usando las reglas de [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md).  
- El score y su desglose se persistan en base de datos en una entidad dedicada.  
- Las Server Actions de revisión IA puedan **ordenar y priorizar** los emails según la confianza.  
- La UI de revisión IA muestre un **indicador claro** (color + texto + explicación) del nivel de confianza, ayudando al usuario a decidir cuánto revisar.  
- Todo el cálculo se realice **exclusivamente en backend**, sin exponer lógica crítica en el cliente.

### Resultado final esperado

Al finalizar este feature:

- Existirá un modelo `AIConfidenceScore` relacionado 1:1 con `Email` en [`prisma/schema.prisma`](prisma/schema.prisma), que almacenará el score global, el desglose por factor, la interpretación semántica y un texto de explicación.  
- El modelo `Email` incluirá el campo `reprocessCount` para soportar el factor de historial de feedback, tal y como se describe en [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md).  
- Se habrá implementado un servicio de cálculo en [`src/lib/confidence-calculator.ts`](src/lib/confidence-calculator.ts) que reciba `EmailInput`, `EmailAnalysis` y contexto, y devuelva un `ConfidenceBreakdown` tipado y validado mediante Zod (tipos y schemas en [`src/types/ai.ts`](src/types/ai.ts)).  
- La Server Action de procesamiento IA [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts) calculará y persistirá el nivel de confianza para cada email procesado, usando transacciones Prisma.  
- La query de revisión [`getPendingAllAIResults`](src/actions/ai-processing.ts) ordenará por prioridad de revisión basada en el nivel de confianza (baja confianza primero).  
- La UI de revisión IA, basada en [`src/components/processing/ReviewAccordion.tsx`](src/components/processing/ReviewAccordion.tsx), mostrará un componente indicador de confianza (nuevo componente `ConfidenceIndicator`) con color, porcentaje, etiqueta textual y explicación.  
- El Sistema Maestro [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md) reflejará la existencia de este sistema en las secciones de Base de Datos, Server Actions, Flujos de Datos y Nuevas Funcionalidades.

---

### Hitos del Proyecto

Este desarrollo se realizará en **3 hitos** secuenciales:

**HITO 1: Modelo de datos, tipos y servicio de cálculo del Nivel de Confianza**  
Definir el modelo `AIConfidenceScore` y `reprocessCount` en Prisma, ajustar migraciones y tipos TypeScript en [`src/types/ai.ts`](src/types/ai.ts), e implementar el servicio de cálculo del nivel de confianza según los algoritmos descritos en [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md). Este hito se centra en la capa de datos y lógica pura, sin integrar aún con Server Actions ni UI.

**HITO 2: Integración del cálculo de confianza en el pipeline de procesamiento IA**  
Integrar el servicio de cálculo con la Server Action [`processEmailsWithAI`](src/actions/ai-processing.ts) para que, tras cada análisis IA validado, se calcule y persista el nivel de confianza en `AIConfidenceScore`. Además, adaptar las consultas de revisión para ordenar por prioridad de revisión basada en el score.

**HITO 3: Integración UI del indicador de confianza y documentación**  
Crear e integrar el componente visual de indicador de confianza en la pantalla de revisión IA, ajustar textos y estados de la UI para reflejar el nuevo concepto, y actualizar la documentación en el Sistema Maestro. Se realizarán smoke tests end‑to‑end del flujo incluyendo la visualización de confianza.

---

## HITO 1: Modelo de datos, tipos y servicio de cálculo del Nivel de Confianza

### Objetivo del Hito

Introducir en la base de datos y en la capa de tipos un modelo formal para el nivel de confianza IA, e implementar la lógica de cálculo puramente determinista descrita en [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md), de forma independiente a las Server Actions. Al finalizar este hito, será posible calcular un `ConfidenceBreakdown` en memoria para un `EmailInput` + `EmailAnalysis` + contexto dado, y persistirlo manualmente mediante Prisma.

### Entregables

- [ ] Modelo `AIConfidenceScore` definido en [`prisma/schema.prisma`](prisma/schema.prisma) con todos los campos especificados en el diseño.  
- [ ] Campo `reprocessCount Int @default(0)` añadido al modelo `Email` en [`prisma/schema.prisma`](prisma/schema.prisma).  
- [ ] Migraciones Prisma generadas y aplicadas en entorno de desarrollo para ambos cambios.  
- [ ] Tipos `ConfidenceSignals`, `ConfidenceBreakdown` y `ConfidenceBreakdownSchema` añadidos y exportados en [`src/types/ai.ts`](src/types/ai.ts), alineados con la estructura descrita en [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md).  
- [ ] Servicio de cálculo implementado en [`src/lib/confidence-calculator.ts`](src/lib/confidence-calculator.ts) con todas las funciones auxiliares (`calculateTaskValidityScore`, `calculatePriorityCoherenceScore`, `calculateClarityScore`, `calculateCompletenessScore`, `calculatePatternMatchScore`, `calculateTagsQualityScore`, `calculateFeedbackPenalty`, `calculateConfidenceLevel`, `generateConfidenceReason`).  
- [ ] Tests unitarios básicos para el servicio de cálculo (por ejemplo, en [`src/tests/ai-confidence.mock.test.ts`](src/tests/ai-confidence.mock.test.ts)) que cubran casos representativos de puntajes altos, medios y bajos.  
- [ ] Documentación mínima del nuevo modelo y tipos en el Sistema Maestro (sección de Base de Datos y Tipos IA).

### Tareas

#### Backend – Prisma / Base de Datos

- [ ] Definir el modelo `AIConfidenceScore` en [`prisma/schema.prisma`](prisma/schema.prisma) siguiendo la propuesta de [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md):
  - [ ] Campos base: `id`, `createdAt`, `updatedAt`.  
  - [ ] Relación 1:1 con `Email` mediante `emailId` (`@unique`) y `onDelete: Cascade`.  
  - [ ] Campos numéricos de score: `overallScore`, `clarityScore`, `patternMatchScore`, `completenessScore`, `priorityCoherenceScore`, `taskValidityScore`, `tagsQualityScore`, `feedbackPenalty`.  
  - [ ] Campos interpretativos: `interpretation` (string restringido a los valores esperados), `requiresReview` (boolean), `reviewPriority` (int 0–100, calculado como `100 - overallScore`), `confidenceReason` (string).  
  - [ ] Campo opcional `breakdown Json?` para almacenar el objeto completo de señales con fines de debugging.  
  - [ ] Índices en `overallScore` y `reviewPriority` para consultas rápidas.  
- [ ] Extender el modelo `Email` en [`prisma/schema.prisma`](prisma/schema.prisma) con:  
  - [ ] Campo `reprocessCount Int @default(0)` para contabilizar reprocesamientos.  
  - [ ] Relación opcional `confidenceScore AIConfidenceScore?` (1:1) para vincular el score al email.  
- [ ] Generar y aplicar migración Prisma:  
  - [ ] Ejecutar `npx prisma migrate dev --name add_ai_confidence_score_and_reprocess_count`.  
  - [ ] Verificar en la base de datos que las tablas y columnas nuevas se han creado correctamente.  
- [ ] Actualizar [`prisma/seed.ts`](prisma/seed.ts) para:  
  - [ ] Inicializar `reprocessCount` en `0` para todos los emails de ejemplo.  
  - [ ] (Opcionalmente) crear uno o dos registros de `AIConfidenceScore` de ejemplo para facilitar pruebas manuales iniciales.

#### Backend – Tipos TypeScript

- [ ] Actualizar [`src/types/ai.ts`](src/types/ai.ts) para incluir:  
  - [ ] Interface `ConfidenceSignals` con los campos numéricos 0–100 definidos en [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md).  
  - [ ] Interface `ConfidenceBreakdown` con `overallScore`, `signals`, `interpretation`, `color`, `requiresReview` y `reason`.  
  - [ ] Schema Zod `ConfidenceBreakdownSchema` para validar que los valores se mantienen en los rangos 0–100 y los enums permitidos.  
- [ ] Asegurar que todos los nuevos tipos se exportan desde [`src/types/index.ts`](src/types/index.ts) si es consistente con las convenciones actuales.  
- [ ] Extender tipos relacionados con `Email` en [`src/types/email.ts`](src/types/email.ts) si se requiere incluir `reprocessCount` o la relación `confidenceScore` en tipos agregados usados en la UI.

#### Backend – Servicio de cálculo

- [ ] Crear el archivo [`src/lib/confidence-calculator.ts`](src/lib/confidence-calculator.ts) siguiendo las reglas de arquitectura (`lib` para lógica pura, sin dependencias de React ni Next.js).  
- [ ] Implementar las funciones de cálculo descritas en [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md), asegurando:  
  - [ ] Tipado estricto en TypeScript (sin `any`).  
  - [ ] No dependencia de estado global (todas las funciones son puras y deterministas).  
  - [ ] Manejo robusto de casos límite (emails sin tareas, sin metadata completa, sin historial, etc.).  
- [ ] Implementar `calculateConfidenceLevel` como punto de entrada principal que:  
  - [ ] Reciba `email: EmailInput`, `analysis: EmailAnalysis` y un contexto con `existingTags`, `historicalApprovals?` y `knownCategory?`.  
  - [ ] Calcule cada señal individual llamando a las funciones auxiliares.  
  - [ ] Combine las señales con los pesos definidos (30% tareas, 20% prioridad, 15% claridad, 15% completitud, 10% patrones, 5% tags, 5% feedback).  
  - [ ] Devuelva un `ConfidenceBreakdown` completamente tipado.  
- [ ] Implementar `generateConfidenceReason` para producir una explicación legible basada en la señal más débil y el rango del score global.

#### Testing

- [ ] Crear un archivo de tests (por ejemplo, [`src/tests/ai-confidence.mock.test.ts`](src/tests/ai-confidence.mock.test.ts)) que:  
  - [ ] Ejecute `calculateConfidenceLevel` sobre casos sintéticos de:  
    - [ ] Email muy claro con tareas bien alineadas (debería producir `overallScore` alto, ≥90).  
    - [ ] Email ambiguo con tareas poco alineadas (score medio/bajo).  
    - [ ] Email reprocesado con `reprocessCount` > 0 (verificar impacto de `feedbackPenalty`).  
  - [ ] Verifique que el `color`, `interpretation` y `requiresReview` son coherentes con la tabla de rangos.  
- [ ] Ejecutar `npm run build` para confirmar que los nuevos tipos y archivos no rompen la compilación.

### Dependencias

- **Internas:**  
  - Estado actual de modelos `Email`, `EmailMetadata`, `Task`, `Tag` documentados en [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md).  
  - Tipos IA existentes en [`src/types/ai.ts`](src/types/ai.ts) (especialmente `EmailInput`, `EmailAnalysis`).  
- **Externas:**  
  - Base de datos PostgreSQL (Neon) accesible para aplicar migraciones Prisma.

### Consideraciones

- **Compatibilidad:** Este hito no debe modificar todavía el comportamiento funcional de las pantallas; introduce únicamente nuevo modelo y lógica de cálculo reutilizable.  
- **Rendimiento:** El cálculo de confianza es relativamente ligero y se ejecutará por email procesado; se recomienda mantener las funciones puras y evitar accesos innecesarios a BD en esta capa.  
- **Auditoría:** El campo `breakdown Json?` permitirá inspeccionar señales individuales en debugging sin exponer esta estructura compleja directamente en todas las UIs.

---

## HITO 2: Integración del cálculo de confianza en el pipeline de procesamiento IA

### Objetivo del Hito

Conectar el servicio de cálculo del nivel de confianza con la Server Action de procesamiento IA y con las consultas de revisión, de forma que cada procesamiento IA genere y persista un registro consistente de `AIConfidenceScore`, y que la bandeja de revisión ordene los emails pendientes dando prioridad a los de menor confianza.

### Entregables

- [ ] Server Action [`processEmailsWithAI`](src/actions/ai-processing.ts) actualizada para:  
  - [ ] Calcular el nivel de confianza para cada email analizado.  
  - [ ] Persistir o actualizar el registro asociado en `AIConfidenceScore` dentro de la misma transacción que actualiza `EmailMetadata` y `Task`.  
- [ ] Server Action [`getPendingAllAIResults`](src/actions/ai-processing.ts) ajustada para:  
  - [ ] Incluir `confidenceScore` en el `include`.  
  - [ ] Ordenar primero por `confidenceScore.reviewPriority desc` (baja confianza primero) y luego por `processedAt desc`, tal como propone [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md).  
- [ ] Cualquier otra Server Action de revisión IA que liste resultados pendientes incluirá el `confidenceScore` junto con `EmailMetadata`.  
- [ ] Se garantizará que reprocesamientos (rechazos y nuevos procesamientos) actualicen adecuadamente `reprocessCount` y el registro de `AIConfidenceScore` asociado.  
- [ ] Tests mock de IA actualizados para cubrir el cálculo y persistencia de confianza en el flujo de procesamiento.

### Tareas

#### Backend – Integración en `processEmailsWithAI`

- [ ] Actualizar la implementación de [`processEmailsWithAI`](src/actions/ai-processing.ts) para:  
  - [ ] Obtener el catálogo de tags existentes (`Tag`) como ya se hace actualmente.  
  - [ ] Construir el contexto requerido por `calculateConfidenceLevel` (`existingTags`, y cuando esté disponible, `historicalApprovals` y `knownCategory`).  
  - [ ] Para cada resultado `analysis` del batch de IA:  
    - [ ] Invocar `calculateConfidenceLevel(emailInput, analysis, context)` desde [`src/lib/confidence-calculator.ts`](src/lib/confidence-calculator.ts).  
    - [ ] Incluir en la transacción Prisma correspondiente al email:  
      - [ ] Upsert de `EmailMetadata` (ya existente).  
      - [ ] Upsert de `AIConfidenceScore` usando `emailId` como clave única (`where: { emailId }`).  
      - [ ] Actualización de `Email.reprocessCount` si se trata de un reprocesamiento (en coordinación con la lógica de rechazo existente).  
      - [ ] Guardar en `AIConfidenceScore` los campos `overallScore`, señales individuales, `interpretation`, `requiresReview`, `reviewPriority`, `confidenceReason` y `breakdown` (este último usando directamente el objeto `signals`).
- [ ] Asegurar que el uso de Prisma respeta las reglas de TypeScript estricto y no introduce tipos `any` en [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts).

#### Backend – Integración con flujos de rechazo y reprocesamiento

- [ ] Revisar las Server Actions de rechazo IA (`rejectProcessingResultsWithReason`, `rejectProcessingResults`) en [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts) para:  
  - [ ] Asegurar que, al rechazar un análisis, se actualiza `Email.reprocessCount` cuando el email vuelva a procesarse posteriormente.  
  - [ ] Definir una política clara para el tratamiento de `AIConfidenceScore` en rechazos:  
    - [ ] O bien mantener el registro histórico asociado al último análisis rechazado.  
    - [ ] O bien resetear `AIConfidenceScore` (por ejemplo, estableciendo `overallScore = 0` o eliminando el registro) hasta que exista un nuevo procesamiento.  
  - [ ] Esta decisión deberá ser coherente con lo descrito en [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md) y documentarse brevemente en comentarios de código y en el Sistema Maestro.

#### Backend – Consultas de revisión IA

- [ ] Actualizar `getPendingAllAIResults` en [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts) para:  
  - [ ] Incluir `confidenceScore: true` en el `include` de `prisma.email.findMany`.  
  - [ ] Añadir al `orderBy` la cláusula `{ confidenceScore: { reviewPriority: 'desc' } }` seguida de `{ processedAt: 'desc' }`.  
  - [ ] Garantizar que no se rompen las condiciones actuales de filtrado (`processedAt not null`, `approvedAt null`).  
- [ ] Revisar cualquier otra acción que liste resultados IA pendientes (por ejemplo, `getPendingAIResults`) para que también incluya `confidenceScore` cuando tenga sentido, aunque no necesariamente cambie la ordenación en todas las vistas.

#### Testing

- [ ] Actualizar o crear tests mock en [`src/tests/ai-processing.mock.test.ts`](src/tests/ai-processing.mock.test.ts) para:  
  - [ ] Verificar que, dado un análisis IA simulado, se llama a `calculateConfidenceLevel` y se persiste un registro `AIConfidenceScore` asociado.  
  - [ ] Verificar que `getPendingAllAIResults` devuelve emails ordenados primero por menor confianza (mayor `reviewPriority`).  
  - [ ] Verificar que el flujo de rechazo seguido de reprocesamiento actualiza `reprocessCount` y genera un nuevo `AIConfidenceScore` coherente.  
- [ ] Ejecutar `npm run build` y un recorrido manual básico: importar emails (JSON o Gmail) → procesar con IA → revisar que los registros en BD incluyen `AIConfidenceScore` y que la ordenación en la pantalla de revisión cambia en función del score.

### Dependencias

- **Internas:**  
  - Hito 1 completado (modelo `AIConfidenceScore`, `reprocessCount` y servicio de cálculo operativos).  
  - Server Actions de IA ya implementadas según [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md).  
- **Externas:**  
  - Ninguna adicional (se reutiliza la integración existente con OpenAI).

### Consideraciones

- **Atomicidad:** Todas las operaciones que actualizan `EmailMetadata`, `Task` y `AIConfidenceScore` para un email deben ejecutarse dentro de una misma transacción Prisma para evitar estados inconsistentes.  
- **Rendimiento:** El cálculo del nivel de confianza se suma al coste del procesamiento IA, pero es barato en comparación con la llamada a OpenAI; aun así, conviene evitar recalcularlo innecesariamente (solo cuando hay nuevo análisis IA).  
- **Backward compatibility:** Emails procesados antes de este feature no tendrán `AIConfidenceScore`; la UI en Hito 3 debe manejar este caso mostrando un estado “sin datos de confianza” o similar.

---

## HITO 3: Integración UI del indicador de confianza y documentación

### Objetivo del Hito

Exponer el nivel de confianza IA de forma clara y accionable en la interfaz de revisión de resultados IA, sin sobrecargar al usuario con detalles técnicos. El objetivo es que el usuario pueda entender de un vistazo qué emails requieren revisión más cuidadosa y por qué, apoyándose en el indicador visual y en un texto de explicación legible.

### Entregables

- [ ] Nuevo componente `ConfidenceIndicator` creado en [`src/components/processing/ConfidenceIndicator.tsx`](src/components/processing/ConfidenceIndicator.tsx), siguiendo el diseño propuesto en [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md).  
- [ ] Componente [`ReviewAccordion`](src/components/processing/ReviewAccordion.tsx) actualizado para mostrar el indicador de confianza para cada email pendiente de revisión.  
- [ ] Estilos específicos para el indicador de confianza añadidos a [`src/app/globals.css`](src/app/globals.css), respetando el sistema de diseño existente (sin hardcodear colores).  
- [ ] (Opcional) Integración ligera del nivel de confianza en componentes secundarios, como [`EmailMetadataSidebar`](src/components/emails/EmailMetadataSidebar.tsx), siempre que no desvíe el foco del flujo principal de revisión.  
- [ ] Documentación actualizada en [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md) describiendo el nuevo sistema de confianza en las secciones de Base de Datos, Server Actions, Flujos de Datos y Nuevas Funcionalidades.  
- [ ] Smoke tests end‑to‑end que verifiquen el flujo completo incluyendo visualización del indicador de confianza.

### Tareas

#### Frontend – Componente `ConfidenceIndicator`

- [ ] Implementar [`src/components/processing/ConfidenceIndicator.tsx`](src/components/processing/ConfidenceIndicator.tsx) como componente cliente (`"use client"`) que:  
  - [ ] Reciba props `score: number`, `reason: string`, `breakdown?: ConfidenceSignals`, `showDetails?: boolean`.  
  - [ ] Muestre un badge con porcentaje, etiqueta textual (`Excelente`, `Bueno`, `Aceptable`, `Dudoso`, `Bajo`) y color según los rangos definidos en [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md).  
  - [ ] Opcionalmente, permita expandir un panel de desglose (`breakdown`) para usuarios avanzados (debugging).  
  - [ ] Utilice solo clases y variables definidas en el sistema de diseño (`globals.css`) sin hardcodear colores.  
  - [ ] Respete las reglas de accesibilidad (usar texto legible además del color, `aria-label` adecuado).

#### Frontend – Integración en `ReviewAccordion`

- [ ] Actualizar [`src/components/processing/ReviewAccordion.tsx`](src/components/processing/ReviewAccordion.tsx) para:  
  - [ ] Incluir el campo `confidenceScore` en el tipo de datos utilizado por el componente (basado en lo que devuelve `getPendingAllAIResults`).  
  - [ ] Pasar al `ConfidenceIndicator` el `overallScore`, `reason` y, cuando esté disponible, el `breakdown` de señales.  
  - [ ] Colocar el indicador en un lugar visible dentro de cada panel de revisión (por ejemplo, cabecera de la tarjeta o bloque lateral).  
  - [ ] Asegurar que el componente se comporta correctamente cuando no existe `confidenceScore` (emails procesados antes del feature): mostrar un estado neutral, como “Sin datos de confianza”.

#### Frontend – Estilos y sistema de diseño

- [ ] Añadir en [`src/app/globals.css`](src/app/globals.css) las clases necesarias para el indicador de confianza (por ejemplo, `.confidence-indicator`, `.confidence-badge`, `.confidence-excellent`, `.confidence-good`, `.confidence-acceptable`, `.confidence-doubtful`, `.confidence-low`), utilizando las variables `var(--color-*)` ya definidas.  
- [ ] Verificar que el indicador se ve correctamente en temas claro/oscuro si aplica, y en resoluciones móviles y de escritorio.  
- [ ] Mantener la consistencia visual con otros badges y elementos de estado ya existentes en la aplicación.

#### Frontend – Integraciones secundarias (opcionales dentro del mismo feature)

- [ ] Evaluar la inclusión de un resumen del nivel de confianza en:  
  - [ ] [`EmailMetadataSidebar`](src/components/emails/EmailMetadataSidebar.tsx) para que, al ver el detalle de un email, se muestre también su score.  
  - [ ] Tarjetas del Kanban (`TaskCard`) **solo si** se considera estrictamente útil en el contexto del feature; de lo contrario, dejar explícito que la visualización en Kanban queda fuera de alcance.  
- [ ] En caso de no implementar integraciones secundarias, dejarlo documentado explícitamente como posible extensión futura fuera de alcance.

#### Testing – UX y smoke tests

- [ ] Realizar pruebas manuales end‑to‑end:  
  - [ ] Importar uno o más emails.  
  - [ ] Procesarlos con IA.  
  - [ ] Acceder a `/processing/review` y verificar que cada email muestra el indicador de confianza con score, color y explicación.  
  - [ ] Validar que emails con distintas características (claros vs ambiguos, con tareas bien vs mal alineadas) producen indicadores coherentes con la tabla de rangos.  
  - [ ] Verificar que la ordenación de la lista prioriza los emails de menor confianza.  
- [ ] Ejecutar `npm run build` para asegurar que los cambios de UI no introducen errores de compilación ni de tipos.

### Dependencias

- **Internas:**  
  - Hito 1 y Hito 2 completados (modelo, servicio de cálculo e integración backend funcionando).  
  - Sistema de diseño definido en [`src/app/globals.css`](src/app/globals.css) y componentes existentes en [`src/components/processing/ReviewAccordion.tsx`](src/components/processing/ReviewAccordion.tsx).  
- **Externas:**  
  - Ninguna.

### Consideraciones

- **UX:** El indicador de confianza debe ayudar a priorizar sin reemplazar el juicio humano; los textos deben evitar dar una falsa sensación de certeza absoluta.  
- **Accesibilidad:** No confiar únicamente en el color para transmitir el estado; acompañar siempre con texto (“Excelente”, “Dudoso”, etc.) y porcentajes.  
- **Futuras extensiones (fuera de alcance):** Dashboards de confianza agregada, filtros avanzados por rango de confianza, o vista histórica de variación de confianza se mencionan únicamente como posibles mejoras futuras y no se planifican en este feature.

---

## Supuestos, riesgos y criterios de completitud

### Supuestos

1. El flujo actual de procesamiento IA (`processEmailsWithAI`) y de revisión (`getPendingAllAIResults`, `ReviewAccordion`) está operativo según se describe en [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md).  
2. La estructura de `EmailInput`, `EmailAnalysis` y tipos asociados en [`src/types/ai.ts`](src/types/ai.ts) ya está consolidada y validada mediante Zod.  
3. Es aceptable que emails procesados antes de este feature no dispongan de datos de confianza, siempre que la UI lo muestre de forma clara.  
4. La base de datos Neon admite sin problemas las nuevas tablas e índices propuestos (`AIConfidenceScore`, índices por score y prioridad de revisión).

### Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|-----------|
| Cálculo de confianza mal implementado respecto a la especificación de [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md) | Media | Alto | Implementar tests unitarios exhaustivos sobre casos controlados y revisar la lógica frente al documento de diseño. |
| Aumento de complejidad en las Server Actions de IA (`processEmailsWithAI`) | Media | Medio | Mantener funciones auxiliares bien delimitadas (servicio de cálculo y mapeos Prisma) y realizar refactors ligeros si es necesario. |
| Posible confusión del usuario si el indicador no se entiende | Baja | Medio | Diseñar textos de explicación (`reason`) claros y revisar la UX durante pruebas manuales. |
| Desfase entre datos de confianza y estado real del email tras reprocesos múltiples | Baja | Alto | Definir y documentar claramente la política de actualización de `AIConfidenceScore` en reprocesos y reflejarlo en tests. |

### Criterios de completitud del feature

El feature se considera completo cuando:

1. ✅ El modelo `AIConfidenceScore` y el campo `reprocessCount` están definidos en [`prisma/schema.prisma`](prisma/schema.prisma), migrados y documentados en el Sistema Maestro.  
2. ✅ El servicio de cálculo del nivel de confianza en [`src/lib/confidence-calculator.ts`](src/lib/confidence-calculator.ts) produce resultados coherentes con los ejemplos del documento [`doc/sistema-confianza-ia.md`](doc/sistema-confianza-ia.md) y está cubierto por tests unitarios básicos.  
3. ✅ `processEmailsWithAI` persiste un registro `AIConfidenceScore` coherente para cada email procesado, y las consultas de revisión (`getPendingAllAIResults`) incorporan el campo `confidenceScore` y su ordenación por `reviewPriority`.  
4. ✅ La UI de revisión IA muestra el indicador de confianza para cada email pendiente, con score, color y explicación, y se comporta correctamente cuando no hay datos de confianza.  
5. ✅ La documentación en [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md) se ha actualizado para reflejar el nuevo sistema de nivel de confianza IA.  
6. ✅ `npm run build` se ejecuta sin errores tras los cambios, y los smoke tests end‑to‑end (importar → procesar IA → revisar con indicador de confianza → Kanban) se han realizado con éxito.
