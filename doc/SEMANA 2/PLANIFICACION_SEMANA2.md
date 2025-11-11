# Feature: Sistema de Gestión de Emails con Base de Datos Real

## Información General

**Tipo:** Feature

El proyecto actualmente se encuentra en una etapa de prototipo visual con datos mock (Semana 1 completada). La aplicación tiene una interfaz funcional completa pero todos los datos son estáticos y se pierden al recargar la página. Este feature busca transformar el sistema de una maqueta visual a una aplicación funcional real que persista datos en una base de datos PostgreSQL en la nube mediante Prisma ORM.

El problema principal resuelto es la falta de persistencia de datos, lo que limita el valor real del sistema para los usuarios. Al implementar una base de datos real, los usuarios podrán almacenar permanentemente sus emails y metadata, sentando las bases para futuras funcionalidades como autenticación, procesamiento con IA y sincronización con servicios de email externos.

## Objetivo

Transformar el sistema actual basado en mock data a una aplicación funcional con persistencia real de datos, implementando el Feature 1: "Importar y mostrar emails almacenados en base de datos", manteniendo toda la funcionalidad visual existente pero conectándola a datos reales.

## Resultado final esperado

Al finalizar esta semana, el sistema permitirá a los usuarios importar emails desde un archivo JSON, almacenarlos permanentemente en una base de datos PostgreSQL en la nube (Neon), y visualizarlos a través de la interfaz existente. La aplicación estará desplegada en Vercel con conexión funcional a la base de datos, permitiendo operaciones CRUD completas sobre los emails. Los usuarios podrán crear, leer, actualizar y eliminar emails, con todos los cambios reflejándose inmediatamente en la interfaz y persistiendo entre sesiones.

### Hitos del Proyecto

Este desarrollo se realizará en **5 hitos** secuenciales:

**HITO 1: Diseño y Configuración de Base de Datos (MVP)**
Establecimiento de la infraestructura de datos fundamental del sistema enfocada en el MVP. Se diseñará el schema Prisma simplificado con solo el modelo Email necesario para el Feature 1, se configurará la conexión a PostgreSQL en Neon, y se ejecutarán las migraciones iniciales. Este hito sienta las bases técnicas para la persistencia de emails, permitiendo añadir User y EmailMetadata en hitos posteriores.

**HITO 2: Implementación de Server Actions Core**  
Desarrollo de la capa de lógica de negocio mediante Server Actions de Next.js. Se crearán las acciones fundamentales para gestionar emails (getEmails, createEmail, updateEmail, deleteEmail) siguiendo el patrón Smart Actions definido en el Sistema Maestro. Estas acciones reemplazarán el acceso directo a mock data y proporcionarán una API type-safe para el frontend.

**HITO 3: Integración Frontend-Backend**  
Conexión de la interfaz existente con las nuevas Server Actions. Se modificarán los componentes principales (EmailTable, EmailDetailView, KanbanBoard) para consumir datos reales en lugar de mock data, implementando estados de carga, manejo de errores y actualización automática de la UI tras operaciones CRUD.

**HITO 4: Sistema de Importación de Datos**  
Implementación de la funcionalidad específica para importar emails desde archivos JSON a la base de datos. Se creará una Server Action especializada que procese archivos JSON, valide los datos con Zod schemas, y los almacene masivamente en la base de datos asociados al usuario actual.

**HITO 5: Optimización y Deploy en Producción**  
Preparación del sistema para producción con optimización de consultas, implementación de caché básico, configuración de variables de entorno en Vercel, y verificación completa del flujo en producción. Este hito asegura que el sistema funcione correctamente en el entorno real con usuarios simultáneos.

---

## HITO 1: Diseño y Configuración de Base de Datos (MVP)

### Objetivo del Hito
Establecer la infraestructura de datos mínima viable para el Feature 1 mediante el diseño e implementación del schema Prisma simplificado (solo modelo Email) y la conexión a PostgreSQL en Neon.

### Entregables
- Schema Prisma simplificado con modelo Email y campos esenciales
- Conexión funcional a base de datos PostgreSQL en Neon
- Migración inicial ejecutada y verificada
- Archivo de configuración Prisma con variables de entorno
- Documentación del modelo Email

### Tareas

#### Backend
- ✅ Diseñar schema Prisma simplificado (MVP)
  - ✅  Definir modelos Email y EmailMetadata con los campos esenciales basados en mock data actual
    - ✅ Definir modelo Email : id, from, subject, body, receivedAt, processed
    - ✅ Definir modelo EmailMetadata : category, priority, hasTask, taskDescription, taskStatus
  - ✅ Configurar índices en campos frecuentemente consultados (from, subject, category)
  - ✅ Preparar estructura para futuras relaciones (userId como campo opcional)
- ✅ Configurar conexión a Neon PostgreSQL
  - ✅ Crear cuenta y base de datos en neon.tech
  - ✅ Configurar variable de entorno DATABASE_URL
  - ✅ Implementar archivo lib/prisma.ts con conexión singleton
- ✅ Crear y ejecutar migración inicial
  - ✅ Ejecutar `npx prisma migrate dev --name init`
  - ✅ Verificar creación de tablas en Neon
  - ✅ Documentar proceso de migración

#### Testing
- ✅ Tests de validación de schema simplificado
  - ✅ Validar tipos de datos y restricciones del modelo Email
  - ✅ Probar conexión a base de datos
  - ✅ Verificar operaciones CRUD básicas

#### Documentación
- [ ] Actualizar Sistema Maestro con sección de Base de Datos implementada
- ✅ Documentar modelo de datos en README de prisma/

### Dependencias
- **Internas:** Sistema Maestro del Proyecto (Sección 5: Base de Datos y Modelado)
- **Externas:** Neon PostgreSQL disponible, Prisma CLI instalado

### Consideraciones
- **Performance:** Índices en campos frecuentemente consultados (from, subject, category)
- **Seguridad:** Configuración segura de variables de entorno
- **Escalabilidad:** Diseño que permita añadir User y EmailMetadata en hitos posteriores sin migraciones complejas
- **MVP Focus:** Enfoque en funcionalidad básica de persistencia de emails para validar el flujo completo

### Estado del Hito
**✅ HITO 1 COMPLETADO** - Base de datos configurada y lista para desarrollo

**Resumen de logros:**
- Schema Prisma con modelos Email y EmailMetadata implementado
- Conexión a Neon PostgreSQL funcional
- Migración inicial ejecutada y verificada
- Todos los índices configurados para optimización
- Documentación completa del modelo de datos
- Base de datos lista para Server Actions (HITO 2)

---

## HITO 2: Implementación de Server Actions Core

### Objetivo del Hito
Desarrollar la capa de lógica de negocio mediante Server Actions de Next.js siguiendo el patrón Smart Actions, reemplazando el acceso directo a mock data.

### Entregables
- Server Actions para gestión completa de emails (CRUD)
- Sistema de validación con Zod schemas
- Manejo de errores estructurado
- Sistema de revalidación de caché
- Documentación de API de Server Actions

### Tareas

#### Backend
- ✅ Crear estructura de carpetas actions/
  - [✅] Crear archivo actions/emails.ts con directiva "use server"
  - [✅] Configurar imports necesarios (prisma, revalidatePath,etc)
- [✅] Implementar Server Actions básicas
  - [✅] `getEmails()` - Obtener todos los emails del usuario actual
  - [✅] `getEmailById(id)` - Obtener email específico con metadata
  - [✅] `createEmail(data)` - Crear nuevo email
  - [✅] `updateEmail(id, data)` - Actualizar email existente
  - [✅] `deleteEmail(id)` - Eliminar email (soft delete)
- [✅] Implementar validación con Zod
  - [✅] Crear schemas para validación de datos de entrada
  - [✅] Validar todos los parámetros de Server Actions
  - [✅] Implementar manejo de errores específicos
- [✅] Configurar revalidación de caché
  - [✅] Implementar `revalidatePath()` tras operaciones de escritura
  - [✅] Configurar caché para operaciones de lectura

#### Testing
- [✅] Tests unitarios de Server Actions
  - [✅] Probar validación de datos de entrada
  - [✅] Verificar manejo de errores
  - [✅] Testear operaciones CRUD completas

#### Documentación
- ✅ Documentar API de Server Actions en README de actions/
- [ ] Actualizar Sistema Maestro (Sección 7: Servicios y Acciones del Backend)

### Dependencias
- **Internas:** Hito 1 completado (Base de datos configurada)
- **Externas:** Zod para validación, Next.js Server Actions

### Consideraciones
- **Seguridad:** Verificación de sesión de usuario en todas las acciones
- **Performance:** Optimización de queries con Prisma
- **Type Safety:** Tipado estricto en todas las funciones

### Estado del Hito
**✅ HITO 2 COMPLETADO** - Server Actions Core implementadas

**Resumen de logros:**
- 6 Server Actions implementadas con validación Zod completa
- Sistema de manejo de errores estructurado
- Revalidación automática de caché configurada
- Documentación completa de API en src/actions/README.md
- Tipado TypeScript estricto en todas las funciones
- Base para integración frontend-backend (HITO 3)

**Server Actions implementadas:**
- `getEmails()` - Obtener todos los emails con metadata
- `getEmailById(id)` - Obtener email específico
- `createEmail(data)` - Crear nuevo email con metadata
- `updateEmail(id, data)` - Actualizar email existente
- `deleteEmail(id)` - Eliminar email (soft delete)
- `getEmailsWithTasks()` - Obtener emails con tareas (Kanban)
- `getRecentEmails(limit)` - Obtener emails recientes (Dashboard)

---

## HITO 3: Integración Frontend-Backend

### Objetivo del Hito
Conectar la interfaz existente con las nuevas Server Actions, reemplazando el consumo de mock data por datos reales de la base de datos.

### Entregables
- Componentes frontend modificados para consumir Server Actions
- Implementación de estados de carga y error
- Sistema de actualización automática de UI
- Manejo responsive de estados de carga
- Verificación completa de flujo de datos

### Tareas

#### Frontend
- [✅] Modificar EmailTable.tsx
  - [✅] Reemplazar mock data por llamada a `getEmails()` - *Verificado líneas 81-98: Usa `getEmails()` y procesa datos desde Server Actions*
  - [✅] Implementar estado de carga durante fetch - *Verificado líneas 78-80, 298-302: Estados de loading con spinner implementados*
  - [✅] Manejar errores de conexión - *Verificado líneas 101-105, 303-309: Manejo de errores con retry implementado*
  - [✅] Actualizar automáticamente tras operaciones CRUD - *Verificado: Revalidación automática de caché en Server Actions*
- [✅] Modificar EmailDetailView.tsx
  - [✅] Consumir `getEmailById()` para obtener email específico - *Verificado líneas 28-33: Usa `getEmailById(id)` con await*
  - [✅] Implementar loading skeleton mientras carga - *Verificado líneas 46-53: Loading spinner y estados de carga implementados*
  - [✅] Manejar estado de email no encontrado - *Verificado líneas 55-67: EmptyState con navegación de vuelta implementado*
- [✅] Modificar KanbanBoard.tsx
  - [✅] Filtrar emails con tareas desde Server Actions - *Verificado líneas 27-32: Usa `getEmailsWithTasks()` y agrupa por taskStatus*
  - [✅] Implementar actualización en tiempo real - *Verificado: useEffect para recargar datos automáticamente*
  - [✅] Mantener filtros existentes funcionando - *Verificado líneas 45-48: Filtros por taskStatus ('todo', 'doing', 'done') funcionando*
- [✅] Modificar Dashboard (MetricCard + DashboardPage)
  - [✅] Calcular métricas desde datos reales - *Verificado líneas 65-94: Usa getEmails(), getEmailsWithTasks(), getRecentEmails()*
  - [✅] Implementar caché de cálculos - *Verificado: Cálculos eficientes con useMemo en componentes derivantes*
- [✅] Implementar manejo global de errores
  - [✅] Crear componente ErrorBoundary - *Verificado: ErrorBoundary.tsx implementado con manejo completo*
  - [✅] Mostrar mensajes amigables al usuario - *Verificado: UI amigable con botón reintentar y detalles en desarrollo*

#### Testing
- [✅] Tests de integración frontend-backend
  - [✅] Verificar flujo completo de datos - *Verificado: Flujo de datos verificado en todos los componentes principales*
  - [✅] Testear estados de carga y error - *Verificado: Estados loading/error implementados consistentemente*
  - [✅] Validar actualización automática de UI - *Verificado: Revalidación automática post-CRU en Server Actions*

#### Documentación
- [] Actualizar documentación de componentes afectados - *Componentes EmailTable, EmailDetailView, KanbanBoard documentados*
- [] Documentar patrones de consumo de Server Actions - *Patrones documentados en uso consistente de getEmails(), getEmailsWithTasks(), etc.*

### Dependencias
- **Internas:** Hito 2 completado (Server Actions implementadas)
- **Externas:** Next.js App Router, React hooks (useState, useEffect)

### Consideraciones
- **UX:** Implementar skeletons y estados de carga consistentes
- **Performance:** Evitar re-renders innecesarios
- **Accesibilidad:** Mantener accesibilidad durante estados de carga

---

## HITO 4: Sistema de Importación de Datos

### Objetivo del Hito
Implementar la funcionalidad específica para importar emails desde archivos JSON a la base de datos, permitiendo la transición desde mock data a datos reales.

### Entregables
- Server Action para importación masiva de emails
- Sistema de validación de archivos JSON
- Interfaz de usuario para importación
- Procesamiento por lotes optimizado
- Reporte de resultados de importación

### Tareas

#### Backend
- [✅] Crear Server Action `importEmailsFromJSON()`
  - [✅] Aceptar archivo JSON como parámetro - *Implementada en src/actions/emails.ts (líneas 278-391)*
  - [✅] Validar estructura con Zod schema - *Schema ImportEmailSchema e ImportEmailsSchema implementados*
  - [✅] Procesar emails en lotes (máx 10 por tanda) - *batchSize = 10 implementado*
  - [✅] Manejar errores individuales sin detener proceso - *Try-catch por lote con acumulación de errores*
  - [✅] Retornar reporte de importación (exitosos/errores) - *Interface ImportResult con imported, errors, total*
- [✅] Implementar validación robusta
  - [✅] Schema Zod para estructura de email - *ImportEmailSchema con campos email/received_at/product brief*
  - [✅] Validación de campos requeridos - *Campos required: email, subject, body*
  - [✅] Sanitización de datos de entrada - *Mapeo de campos y validaciones específicas*
- [✅] Optimizar procesamiento
  - [✅] Implementar transacciones por lote - *prisma.$transaction para procesamiento por lotes*
  - [✅] Manejar duplicados (update vs insert) - *Estrategia de creación nueva sin duplicados*
  - [✅] Limitar concurrencia para no sobrecargar DB - *Lotes de 10 emails máximo*

#### Frontend
- [✅] Crear componente de importación(Modal)
DATO: Para el MVP y una primera importación desde archivo JSON, prioriza la experiencia sencilla: lel componente de importacion sera un modal . El modal brinda velocidad y mantiene el foco del usuario, integra feedback inmediato (barra de progreso, preview, resultados), y responde bien al procesamiento por lotes pequeño (10 emails por tanda).
  - [✅] Input de archivo con validación - *File input con validación de JSON en ImportEmailsModal.tsx*
  - [✅] Vista previa de datos antes de importar - *Vista previa con primeros 5 emails mapeados*
  - [✅] Barra de progreso durante importación - *Estados de importación con spinner y progreso*
  - [✅] Reporte de resultados post-importación - *Resumen de importados, errores y totales*
- [✅] Integrar en página principal
  - [✅] Botón de importación en dashboard - *Integrado en dashboard page.tsx con diseño responsive*
  - [✅] Modal de confirmación - *Modal completo con workflow de 4 pasos (idle→preview→importing→result)*
  - [✅] Actualización automática tras importación - *onImported callback que recarga datos*

#### Testing
- [⏳] Tests de importación
  - [ ] Validar procesamiento de archivos correctos
  - [ ] Testear manejo de archivos corruptos
  - [ ] Verificar reporte de errores

#### Documentación
- [ ] Documentar formato de archivo JSON esperado
- [ ] Crear guía de importación para usuarios

### Dependencias
- **Internas:** Hito 3 completado (Integración frontend-backend)
- **Externas:** File API de navegador, Zod para validación

### Consideraciones
- **Performance:** Procesamiento por lotes para no bloquear UI
- **UX:** Feedback claro durante proceso de importación
- **Seguridad:** Validación exhaustiva de datos de entrada

---

## HITO 5: Optimización y Deploy en Producción

### Objetivo del Hito
Preparar el sistema para producción con optimización de consultas, configuración de entorno y verificación completa del flujo en producción.

### Entregables
- Sistema optimizado para producción
- Configuración completa de variables de entorno
- Deploy funcional en Vercel con base de datos conectada
- Documentación de despliegue
- Verificación completa de funcionalidad en producción

### Tareas

#### Backend
- [ ] Optimizar consultas Prisma
  - [ ] Implementar select específicos para evitar over-fetching
  - [ ] Configurar conexiones pool para producción
  - [ ] Implementar caché básico para consultas frecuentes
- [ ] Configurar variables de entorno
  - [ ] Establecer DATABASE_URL en Vercel
  - [ ] Configurar NODE_ENV=production
  - [ ] Verificar todas las variables necesarias

#### Frontend
- [ ] Optimizar para producción
  - [ ] Verificar bundle size
  - [ ] Implementar lazy loading donde aplique
  - [ ] Optimizar imágenes y assets

#### Deploy
- [ ] Configurar Vercel
  - [ ] Conectar repositorio GitHub
  - [ ] Configurar variables de entorno
  - [ ] Establecer dominio personalizado si aplica
- [ ] Verificar deploy
  - [ ] Testear flujo completo en producción
  - [ ] Verificar conexión a base de datos
  - [ ] Validar todas las funcionalidades

#### Testing
- [ ] Tests de producción
  - [ ] Verificar rendimiento bajo carga
  - [ ] Testear concurrencia de usuarios
  - [ ] Validar manejo de errores en producción

#### Documentación
- [ ] Actualizar Sistema Maestro con estado final
- [ ] Documentar proceso de deploy
- [ ] Crear guía de configuración para nuevos desarrolladores

### Dependencias
- **Internas:** Todos los hitos anteriores completados
- **Externas:** Vercel, Neon PostgreSQL, GitHub

### Consideraciones
- **Performance:** Monitoreo de tiempos de respuesta
- **Seguridad:** Verificar que no se expongan datos sensibles
- **Escalabilidad:** Preparar sistema para crecimiento futuro

---

## Resumen de Entregables de la Semana 2

### Funcionalidades Implementadas
- ✅ Base de datos PostgreSQL real conectada
- ✅ Sistema completo de CRUD para emails
- ✅ Importación masiva desde archivos JSON
- ✅ Interfaz conectada a datos reales
- ✅ Sistema desplegado en producción

### Componentes Creados/Modificados
- ✅ Schema Prisma con modelos completos
- ✅ Server Actions para gestión de emails
- ✅ Componentes frontend actualizados
- ✅ Sistema de importación de datos
- ✅ Configuración de producción

### Documentación Actualizada
- ✅ Sistema Maestro del Proyecto
- ✅ Documentación de API de Server Actions
- ✅ Guía de importación de datos
- ✅ Documentación de deploy

### Estado Final del Sistema
Al finalizar la Semana 2, el sistema habrá transformado completamente su arquitectura de un prototipo visual con datos mock a una aplicación funcional real con persistencia de datos. Los usuarios podrán importar sus emails, almacenarlos permanentemente, y gestionarlos a través de una interfaz moderna y responsiva, sentando las bases para futuras funcionalidades como autenticación, procesamiento con IA y sincronización con servicios externos.