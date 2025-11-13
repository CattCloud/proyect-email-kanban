# Feature: Procesamiento Inteligente de Emails con IA (OpenAI GPT)

### Información General

**Tipo:** Feature

El sistema actual de gestión de emails permite importar, visualizar y organizar correos electrónicos, pero carece de capacidades inteligentes para extraer automáticamente metadata y tareas implícitas. Los usuarios deben clasificar manualmente cada email por categoría (`cliente`, `lead`, `interno`, `spam`) y prioridad (`alta`, `media`, `baja`), además de identificar manualmente las tareas accionables contenidas en el cuerpo del mensaje.

Esta situación genera ineficiencias operativas críticas: ejecutivos comerciales que reciben 50-100 emails diarios pierden 1-2 horas en clasificación manual, tareas implícitas se olvidan debido a la falta de estructura, y no existe visibilidad clara entre pendientes urgentes versus informativos. El problema se agrava con el volumen creciente de comunicaciones, resultando en oportunidades de negocio perdidas y clientes insatisfechos por falta de respuesta oportuna.

La implementación del procesamiento inteligente mediante OpenAI GPT eliminará la clasificación manual, automatizará la extracción de tareas mediante análisis semántico, y proporcionará un flujo de revisión humana que mantenga control y confianza del usuario final. El sistema integra completamente con la arquitectura Smart Actions existente y aprovecha la infraestructura de base de datos PostgreSQL ya implementada.

### Objetivo

Implementar un sistema de procesamiento inteligente que integre OpenAI GPT con la arquitectura Smart Actions existente, permitiendo seleccionar lotes de emails y procesarlos automáticamente para extraer metadata (categoría, prioridad, resumen, nombre de contacto) y tareas accionables estructuradas que se almacenen en la base de datos PostgreSQL y se visualicen en un flujo de revisión antes de su publicación al tablero Kanban.

### Resultado final esperado

Al finalizar la implementación, el sistema proporcionará un flujo completo de procesamiento inteligente donde los usuarios podrán seleccionar múltiples emails desde la tabla principal, triggear procesamiento batch con OpenAI GPT, y recibir análisis estructurado que incluya categorización automática, detección de prioridad basada en contenido y urgencia, extracción de tareas concretas con fechas límite inferidas, identificación de participantes, y una interfaz de revisión pre-Kanban que permita confirmar, editar o rechazar los resultados antes de marcar los emails como procesados con timestamp `processedAt`. El sistema mantendrá consistencia con los cambios implementados (`processedAt`, `idEmail`, `createdAt`) y proporcionará trazabilidad completa del procesamiento mediante auditoría temporal.

### Hitos del Proyecto

Este desarrollo se realizará en **4 hitos** secuenciales:

**HITO 1: Infraestructura de IA y Configuración OpenAI**  
Se implementará la integración completa con OpenAI API incluyendo configuración de variables de entorno, creación del servicio de IA con prompts optimizados, schemas de validación Zod para respuestas, y funciones de procesamiento batch con manejo robusto de errores y rate limiting. Este hito establece la base técnica para todo el procesamiento inteligente.

**HITO 2: Server Actions y Lógica de Procesamiento**  
Se desarrollarán las Server Actions necesarias para selección de emails, envío a IA, validación de respuestas y persistencia en base de datos, incluyendo nuevas tablas Task y Contact según el esquema propuesto, actualización del modelo EmailMetadata, y implementación de transacciones para garantizar consistencia de datos con el campo `processedAt`.

**HITO 3: Interfaz de Usuario para Procesamiento Batch**  
Se creará la UI para selección múltiple de emails, triggerear procesamiento, mostrar progreso en tiempo real, y manejar estados de loading/error/success, incluyendo integración con EmailTable existente, modal de confirmación de procesamiento, y indicadores visuales de emails en proceso.

**HITO 4: Pantalla de Revisión y Confirmación de Resultados**  
Se implementará la interfaz completa de revisión donde usuarios pueden ver, editar y confirmar los resultados del análisis de IA antes de enviarlos al Kanban, incluyendo preview de tareas extraídas, controles de edición inline, botones de aceptar/rechazar por email, y integración final con el flujo de actualización de `processedAt` y navegación al tablero Kanban.

## HITO 1: Infraestructura de IA y Configuración OpenAI

### Objetivo del Hito
Establecer la infraestructura completa de integración con OpenAI API, implementando el servicio de procesamiento de IA con prompts optimizados, schemas de validación robustos, y manejo profesional de errores y rate limiting que sirva como base sólida para todo el procesamiento inteligente de emails.

### Entregables
- Configuración completa de OpenAI API con variables de entorno seguras
- Servicio de IA con prompts estructurados basados en [`doc/SEMANA 3/PromptPropuesto.md`](doc/SEMANA 3/PromptPropuesto.md)
- Schemas Zod implementados para validación de respuestas según [`doc/SEMANA 3/propuestaEsquema.md`](doc/SEMANA 3/propuestaEsquema.md)
- Función de procesamiento batch con límites de concurrencia
- Sistema de retry y fallback para fallos de API
- Testing unitario de integración OpenAI
- Documentación técnica del servicio de IA

### Tareas

#### Configuración y Setup
- [ ] **Configurar variables de entorno OpenAI**
- [x] Agregar `OPENAI_API_KEY` a [`.env`](/.env) local
- [ ] Documentar variable en [`.env.example`](/.env.example)
- [x] Verificar instalación de `openai@6.8.1` en [`package.json`](package.json:21)

#### Backend - Servicio de IA
- [ ] **Crear archivo de prompts estructurados**
- [x] Implementar `src/lib/prompts/email-processing.ts` basado en [`doc/SEMANA 3/PromptPropuesto.md`](doc/SEMANA 3/PromptPropuesto.md)
- [x] Exportar función `buildEmailProcessingPrompt(emails: EmailInput[])`
- [x] Incluir tipos `EmailInput`, `EmailAnalysis`, `Task` desde el documento fuente
- [x] Implementar función `validateEmailAnalysisResponse()` con Zod
- [ ] **Crear servicio OpenAI**
- [x] Implementar `src/services/openai.ts` con cliente singleton
- [x] Función `processEmailsBatch(emails: EmailInput[])` con límite de 10 emails
- [ ] Configurar modelo GPT-4 como primario, GPT-3.5 como fallback
- [x] Implementar retry automático con backoff exponencial
- [x] Rate limiting para respetar límites de OpenAI API

#### Validación y Schemas
- [ ] **Implementar schemas Zod completos**
- [x] `TaskSchema` con validaciones detalladas en `src/types/ai.ts`
- [x] `EmailAnalysisSchema` según especificaciones del prompt
- [x] Validaciones custom para `due_date` ISO 8601 con timezone UTC
- [x] Validaciones de email format en `participants`
- [x] Exportar tipos TypeScript inferidos desde schemas

#### Testing y Validación
- [ ] **Tests unitarios del servicio de IA**
- [x] Test de conexión OpenAI API con mock
- [x] Test de validación de respuestas con Zod
- [x] Test de manejo de errores y timeouts
- [x] Test de procesamiento batch con diferentes volúmenes
- [ ] **Testing de integración**
- [x] Procesamiento real con emails de ejemplo
- [x] Validación de consistencia en respuestas múltiples
- [x] Verificación de cumplimiento de rate limits

### Dependencias
- **Internas:** 
  - OpenAI API instalado en [`package.json`](package.json:21)
  - Sistema de tipos existente en [`src/types/email.ts`](src/types/email.ts)
  - Utilidades Zod en [`src/actions/emails.ts`](src/actions/emails.ts:8-44)
- **Externas:** 
  - OpenAI API key válido
  - Acceso a internet para llamadas API
  - Zod 4.1.12 para validaciones

### Consideraciones
- **Performance:** Límite de 10 emails por batch para evitar timeouts de OpenAI
- **Costos:** Control de usage con logging de tokens consumidos
- **Seguridad:** Sanitización de contenido sensible antes de envío a OpenAI
- **Reliability:** Retry automático para fallos transitorios de red
- **Escalabilidad:** Diseño preparado para múltiples modelos (GPT-4, GPT-3.5, local LLM)

## HITO 2: Server Actions y Lógica de Procesamiento

### Objetivo del Hito
Desarrollar la arquitectura completa de Server Actions para procesamiento de IA, incluyendo nuevas tablas de base de datos para tareas y contactos, migración del modelo EmailMetadata existente, y lógica de persistencia que integre seamlessly con el sistema `processedAt` y `idEmail` implementados en cambios previos.

### Entregables  
- Schema Prisma actualizado con modelos Task, Contact y EmailMetadata reestructurado
- Migraciones de base de datos ejecutadas y verificadas
- Server Actions para procesamiento de IA con validación Zod
- Integración con servicio OpenAI del Hito 1
- Funciones de consulta optimizadas para datos procesados
- Sistema de transacciones para operaciones batch consistency
- Testing de persistencia y integridad de datos

### Tareas

#### Base de Datos y Schema
- [ ] **Actualizar schema Prisma según propuesta**
- [x] Reestructurar `model EmailMetadata` con campos `summary`, `contactName`
- [x] Crear `model Task` con relación a EmailMetadata según [`doc/SEMANA 3/propuestaEsquema.md`](doc/SEMANA 3/propuestaEsquema.md:17-27)
- [x] Crear `model Contact` para gestión de contactos únicos
- [x] Configurar índices optimizados en nuevas tablas
- [x] Mantener compatibilidad con campos existentes (`processedAt`, `idEmail`, `createdAt`)
- [ ] **Ejecutar migraciones de base de datos**
  - [ ] Generar migración para nuevas tablas con `npx prisma migrate dev`
  - [ ] Migración de datos existentes de EmailMetadata si es necesaria
  - [ ] Verificar integridad referencial y constraints
  - [ ] Actualizar seed data con estructura completa

#### Server Actions de Procesamiento  
- [ ] **Crear Server Action principal de procesamiento**
- [x] `processEmailsWithAI(emailIds: string[])` en `src/actions/ai-processing.ts`
- [x] Validación de input con schema Zod para IDs of emails
- [x] Integración con servicio OpenAI del Hito 1
- [x] Manejo de errores granular por email individual
- [x] Transacciones para operaciones batch atómicas
- [ ] **Server Action de consulta de emails sin procesar**
- [x] `getUnprocessedEmails()` usando filtro `WHERE processedAt IS NULL`
- [x] Optimización con paginación y límites
- [x] Ordenamiento por `receivedAt` desc, `createdAt` desc (aprovechar doble ordenamiento)
- [ ] **Server Actions de gestión de resultados**
- [x] `getPendingAIResults(emailIds: string[])` para revisión
- [x] `confirmAIResults(emailId: string, confirmed: boolean)`
- [x] `updateProcessedAt(emailIds: string[])` para marcar como completados

#### Integración y Validación
- [ ] **Mapeo de datos IA → Base de datos**
- [x] Función para convertir `EmailAnalysis` a records Prisma
- [x] Validación de consistencia entre análisis IA y schema BD
- [ ] Manejo de campos opcionales (`due_date`, `tags`, `summary`)
- [x] Creación automática de registros Contact si no existen

#### Testing y Validación
- [ ] **Tests de Server Actions**
- [x] Test procesamiento exitoso con emails válidos
- [x] Test manejo de errores de OpenAI API
- [x] Test transacciones batch con rollback en fallos parciales
- [x] Test integridad de datos y relaciones FK
- [ ] **Tests de migración y schema**
- [x] Validación de nueva estructura de base de datos
- [x] Test de queries optimizadas con nuevos índices
- [x] Verificación de compatibilidad con campos existentes

### Dependencias
- **Internas:**
  - Hito 1: Servicio OpenAI funcionando completamente
  - Schema Prisma existente con Email y EmailMetadata en [`prisma/schema.prisma`](prisma/schema.prisma)
  - Server Actions base en [`src/actions/emails.ts`](src/actions/emails.ts)
  - Cambios aplicados: `processedAt`, `idEmail`, `createdAt` fields
- **Externas:**
  - PostgreSQL en Neon con permisos de migración
  - OpenAI API key configurado desde Hito 1

### Consideraciones
- **Compatibilidad:** Mantener retrocompatibilidad con EmailMetadata existente
- **Performance:** Índices optimizados para queries de emails sin procesar y agrupación de tareas
- **Transacciones:** Operaciones atómicas para evitar estados inconsistentes
- **Migración:** Plan de rollback si migración falla en producción
- **Validación:** Strict schemas Zod para garantizar integridad de datos IA

## HITO 3: Interfaz de Usuario para Procesamiento Batch

### Objetivo del Hito
Desarrollar la interfaz completa de usuario para selección múltiple de emails, trigger de procesamiento de IA, y visualización de progreso en tiempo real, integrando seamlessly con la EmailTable existente y proporcionando feedback visual inmediato sobre el estado del procesamiento para mejorar la experiencia de usuario.

### Entregables
- Selección múltiple avanzada en EmailTable con filtros por `processedAt IS NULL`
- Modal de confirmación de procesamiento con preview de emails seleccionados
- Sistema de progress tracking en tiempo real con indicadores por email
- Estados de loading/error/success integrados con el sistema de diseño existente
- Integración con Server Actions del Hito 2
- Feedback visual contextual en tabla principal
- Testing de UX y flujos de usuario

### Tareas

#### Frontend - EmailTable Enhancement
- [ ] **Implementar selección múltiple en EmailTable**
- [x] Agregar checkbox column en [`src/components/emails/EmailTable.tsx`](src/components/emails/EmailTable.tsx)
- [x] Estado global de selección con `useState` para IDs seleccionados
- [x] Filtro automático para mostrar solo emails con `processedAt === null`
- [x] Botón "Procesar con IA" visible solo cuando hay selección
- [x] Counter de emails seleccionados con límite máximo (10 emails)
- [ ] **Estados visuales de procesamiento**
- [x] Badge "En procesamiento" para emails siendo procesados por IA
- [x] Spinner inline en filas durante procesamiento activo
- [ ] Estados de success/error visibles en tabla principal
- [x] Integración con sistema de badges existente (`.badge-procesado`, `.badge-sin-procesar`)

#### Frontend - Modal de Procesamiento
- [ ] **Crear Modal de Confirmación**
- [x] `src/components/emails/ProcessEmailsModal.tsx` con diseño responsive
- [x] Preview de emails seleccionados con subject y from
- [x] Estimación de tiempo y costo aproximado (número de tokens)
- [x] Botones de confirmación y cancelación con estados loading
- [x] Integración con sistema de diseño existente en [`src/app/globals.css`](src/app/globals.css)
- [ ] **Progress Tracking en tiempo real**
- [x] Progress bar con porcentaje de completitud
- [ ] Lista de emails con status individual (pending/processing/completed/error)
- [x] Log de errores específicos por email si ocurren fallos
- [x] Botón para cerrar modal solo cuando procesamiento esté completo

#### Integración Backend-Frontend
- [ ] **Conectar con Server Actions del Hito 2**
- [x] Llamada a `processEmailsWithAI()` desde modal
- [x] Manejo de estados async con try/catch robusto
- [ ] Polling para verificar estado de procesamiento si es long-running
- [x] Revalidación automática de EmailTable tras procesamiento exitoso
- [ ] **Estados de error y recuperación**
  - [ ] Manejo específico de errores OpenAI (rate limit, API down, invalid response)
  - [ ] UI para retry de emails que fallaron individualmente
  - [ ] Fallback graceful si todo el batch falla

#### Testing y UX
- [ ] **Testing de flujos de usuario**
  - [ ] Selección múltiple con diferentes volúmenes (1, 5, 10 emails)
  - [ ] Procesamiento exitoso end-to-end
  - [ ] Manejo de errores con recovery options
  - [ ] Responsive design en móvil y desktop
- [ ] **Validación UX**
  - [ ] Feedback inmediato en todas las acciones
  - [ ] Loading states que no bloqueen navegación
  - [ ] Estados de error informativos con acciones claras

### Dependencias
- **Internas:**
  - Hito 2: Server Actions de procesamiento completamente funcionales
  - EmailTable existente en [`src/components/emails/EmailTable.tsx`](src/components/emails/EmailTable.tsx)
  - Sistema de diseño en [`src/app/globals.css`](src/app/globals.css)
  - Componentes UI base como Button en [`src/components/ui/button.tsx`](src/components/ui/button.tsx)
- **Externas:**
  - React 19.2.0 para hooks de estado
  - Lucide React para iconografía
  - Sistema de badges CSS implementado

### Consideraciones
- **Performance:** Evitar re-renders innecesarios con `useMemo()` para filtrados
- **UX:** Feedback visual inmediato sin bloquear interactividad del resto de la tabla
- **Accessibility:** ARIA labels y navegación por teclado para selección múltiple
- **Responsive:** Funcionalidad completa en móvil con adaptación de interacciones
- **Error Recovery:** Opciones claras para retry sin perder contexto de selección

## HITO 4: Pantalla de Revisión y Confirmación de Resultados

### Objetivo del Hito
Implementar la interfaz completa de revisión donde los usuarios pueden examinar, editar y confirmar los resultados del análisis de IA antes de enviarlos al tablero Kanban, proporcionando el control humano necesario para mantener confianza en el sistema automatizado y completar el ciclo de procesamiento con actualización de `processedAt`.

### Entregables
- Página de revisión de resultados IA con navegación desde EmailTable
- Interface de edición inline para metadata y tareas extraídas
- Preview contextual del email original junto a análisis de IA
- Controles granulares de aceptar/rechazar por email individual
- Flujo de confirmación final con navegación automática a Kanban
- Estados de loading/error/success para operaciones de confirmación
- Integración completa con campo `processedAt` para trazabilidad
- Testing end-to-end del flujo completo de procesamiento

### Tareas

#### Frontend - Página de Revisión
- [ ] **Crear página de revisión de resultados**
  - [ ] `src/app/(protected)/processing/review/page.tsx` con Server Component
  - [ ] Layout de dos columnas: email original + análisis IA
  - [ ] Carga de datos desde Server Action con emails pending review
  - [ ] Estados de loading skeleton mientras carga datos
  - [ ] Navegación breadcrumbs desde "Emails" → "Revisión de IA"
- [ ] **Componente de revisión individual**
  - [ ] `src/components/processing/EmailReviewCard.tsx` 
  - [ ] Preview completo del email con subject, from, body truncado
  - [ ] Sección de metadata IA con campos editables inline
  - [ ] Lista de tareas con controles de edición individual
  - [ ] Botones de acción: "Aceptar", "Rechazar", "Editar"

#### Frontend - Controles de Edición
- [ ] **Edición inline de metadata**
  - [ ] Dropdown para category con opciones válidas ('cliente', 'lead', 'interno', 'spam')
  - [ ] Dropdown para priority con opciones válidas ('alta', 'media', 'baja')
  - [ ] Input de texto para summary con validación 5-100 caracteres
  - [ ] Input para contact_name con validación 2-80 caracteres
  - [ ] Auto-save de cambios con debounce para UX fluida
- [ ] **Edición de tareas extraídas**
  - [ ] Componente `TaskEditor` para edición individual de tareas
  - [ ] Input de description con validación 10-150 caracteres
  - [ ] Date picker para due_date con opción de null
  - [ ] Tag selector con sugerencias basadas en tags existentes  
  - [ ] Participant manager para agregar/remover emails
  - [ ] Botones para eliminar tareas o agregar nuevas

#### Backend - Server Actions de Confirmación
- [ ] **Server Action de confirmación final**
  - [ ] `confirmProcessingResults(emailId: string, data: EmailAnalysis)` 
  - [ ] Validación Zod de datos editados por usuario
  - [ ] Creación/actualización de EmailMetadata, Task, Contact records
  - [ ] Actualización de `processedAt = new Date()` para marcar como procesado
  - [ ] Revalidación de cache para `/emails` y `/kanban` pages
- [ ] **Server Action de rechazo**
  - [ ] `rejectProcessingResults(emailId: string)` 
  - [ ] Limpieza de análisis temporal si existe
  - [ ] Mantener email como no procesado (`processedAt = null`)
  - [ ] Logging de rechazo para análisis posterior

#### Integración y Flujo Completo
- [ ] **Navegación y estados finales**
  - [ ] Redirect automático a `/kanban` tras confirmaciones exitosas
  - [ ] Actualización de métricas en dashboard automática
  - [ ] Link "Ver en Kanban" para constatar que tareas aparecen correctamente
  - [ ] Notificación toast de éxito con resumen de emails procesados

#### Testing y Validación
- [ ] **Testing end-to-end del flujo completo**
  - [ ] Selección → Procesamiento IA → Revisión → Confirmación → Kanban
  - [ ] Edición de metadata con validaciones client y server  
  - [ ] Rechazo de análisis y verficación que email queda sin procesar
  - [ ] Verificación de datos en Kanban tras confirmación
- [ ] **Testing de edge cases**
  - [ ] Emails sin tareas detectadas por IA
  - [ ] Resultados IA con errores de validación Zod
  - [ ] Fallos de red durante confirmación
  - [ ] Múltiples usuarios procesando simultáneamente

### Dependencias
- **Internas:**
  - Hito 2: Server Actions de procesamiento IA funcionales
  - Hito 3: UI de selección múltiple y trigger funcionando
  - Tablero Kanban existente en [`src/components/kanban/KanbanBoard.tsx`](src/components/kanban/KanbanBoard.tsx)
  - Sistema de navegación en [`src/components/layout/index.tsx`](src/components/layout/index.tsx)
  - Campo `processedAt` implementado según [`doc/cambios/CAMBIO_PROCESSED_A_PROCESSEDAT.md`](doc/cambios/CAMBIO_PROCESSED_A_PROCESSEDAT.md)
- **Externas:**
  - Navegación Next.js App Router
  - React 19.2.0 para formularios y estado
  - Validaciones Zod client-side

### Consideraciones  
- **UX:** Interface intuitiva que genere confianza en resultados de IA
- **Performance:** Lazy loading para emails con análisis grandes
- **Validación:** Doble validación client/server para consistency
- **Audit:** Trazabilidad completa con timestamps de procesamiento
- **Rollback:** Capacidad de deshacer confirmaciones si es necesario
- **Integration:** Verificación visual que Kanban refleje cambios inmediatamente

## Supuestos y Preguntas Abiertas

### Supuestos Técnicos Establecidos
1. **OpenAI API Key:** Se asume disponibilidad de API key válida con límites suficientes para desarrollo y testing  
2. **Modelo GPT:** Se usará GPT-4 como principal con fallback a GPT-3.5-turbo por costo/performance
3. **Batch Size:** Límite de 10 emails por procesamiento para evitar timeouts y controlar costos
4. **Compatibilidad:** Full backward compatibility con sistema actual sin romper funcionalidad existente
5. **Datos existentes:** Los emails ya importados se mantendrán intactos, solo se agregará nueva funcionalidad

### Preguntas Abiertas con Plan de Resolución

**Q1: ¿Debe ser el procesamiento síncróno o asíncrono?**
- **Impacto:** Afecta UX y arquitectura de progress tracking
- **Supuesto temporal:** Procesamiento síncróno con timeout de 30s máximo
- **Plan:** Evaluación en Hito 1 based on response times reales de OpenAI

**Q2: ¿Qué hacer con emails que la IA no puede categorizar con confianza?**  
- **Impacto:** Puede generar falsos positivos en categorización
- **Supuesto temporal:** Marcar como 'interno' si confianza < 70%, permitir edición manual
- **Plan:** Implementar scoring de confianza en validación Zod si OpenAI lo proporciona

**Q3: ¿Debe el sistema guardar resultados parciales durante procesamiento o solo al final?** 
- **Impacto:** Afecta recovery ante fallos y progress tracking
- **Supuesto temporal:** Transacciones atómicas por lote completo
- **Plan:** Reevaluar en Hito 2 según performance observed de OpenAI API

### Referencias a Documentos Fuente

Este documento de planificación está basado en:
- [`doc/Protocolo de Planificacion.md`](doc/Protocolo de Planificacion.md): Estructura y reglas de hitos
- [`doc/desarrollador/SEMANA3.md`](doc/desarrollador/SEMANA3.md): Objetivos y bloques de FEATURE 2
- [`doc/SEMANA 3/PromptPropuesto.md`](doc/SEMANA 3/PromptPropuesto.md): Prompt completo y schemas Zod
- [`doc/SEMANA 3/propuestaEsquema.md`](doc/SEMANA 3/propuestaEsquema.md): Esquema de base de datos Task y Contact  
- [`doc/SEMANA 3/FlujoProcesamientoIA.md`](doc/SEMANA 3/FlujoProcesamientoIA.md): Arquitectura de componentes
- [`doc/SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md): Estado actual del sistema
- [`doc/cambios/CAMBIO_PROCESSED_A_PROCESSEDAT.md`](doc/cambios/CAMBIO_PROCESSED_A_PROCESSEDAT.md): Cambio de processed a processedAt
- [`doc/cambios/CAMBIO.md`](doc/cambios/CAMBIO.md): Implementación campo idEmail
- [`doc/cambios/DOBLE_ORDENAMIENTO_INDICADOR_VISUAL.md`](doc/cambios/DOBLE_ORDENAMIENTO_INDICADOR_VISUAL.md): Sistema de ordenamiento dual

### Cronograma y Estimación

**Duración estimada:** 4-5 días de desarrollo  
**Secuencia obligatoria:** Hito 1 → Hito 2 → Hito 3 → Hito 4  
**Punto de validación:** Final de cada hito con testing funcional  
**Criterio de completitud:** Flujo completo Email Selection → IA Processing → Human Review → Kanban funcionando end-to-end

### Impacto en Sistema Existente

**Compatibilidad garantizada:**
- ✅ Emails existentes se mantienen sin cambios
- ✅ Funcionalidad actual de tabla e importación intacta  
- ✅ Campo `processedAt` usado consistentemente con lógica `null` = sin procesar
- ✅ Doble ordenamiento por `receivedAt` + `createdAt` preservado
- ✅ Campo `idEmail` utilizado para trazabilidad

**Nuevas capacidades agregadas:**
- ✅ Procesamiento batch de emails con IA
- ✅ Extracción automática de metadata y tareas 
- ✅ Flujo de revisión humana pre-Kanban
- ✅ Trazabilidad temporal con `processedAt` timestamps
- ✅ Base para análisis de eficiencia de procesamiento IA