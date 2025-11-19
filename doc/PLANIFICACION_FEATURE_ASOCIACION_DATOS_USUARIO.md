# Planificación de Desarrollo: Asociación de Datos por Usuario

**Fecha de creación:** 18 de Noviembre, 2025  
**Versión:** 1.0.0  
**Responsable:** Equipo de Desarrollo  
**Revisado por:** Sistema Maestro v3.0.x

---

## Feature/Fix: Asociación de datos por usuario (multiusuario básico)

### Información General

**Tipo:** Feature

El sistema actual gestiona todos los emails, metadata y tareas de forma **global**, sin distinguir a qué usuario pertenecen. Aunque ya existe autenticación real con Google (NextAuth + OAuth2), los datos en base de datos (`Email`, `Task`, etc.) no están asociados al usuario autenticado, y todas las vistas operan sobre un único espacio de datos compartido.

Este feature implementa la **asociación explícita de datos por usuario**, de forma que:

- Cada email importado quede asociado al usuario autenticado al momento de la importación.
- Cada tarea generada por IA (`Task`) quede también asociada al mismo usuario.
- Todas las consultas de negocio (emails, procesamiento IA, Kanban, dashboard) se filtren por el usuario autenticado.
- Se mantenga la compatibilidad con la arquitectura existente (Smart Actions + Prisma + NextAuth).

**Alcance estricto del feature:**

- Extender el modelo de datos para soportar multiusuario básico.
- Asociar **emails** y **tareas** al usuario autenticado.
- Ajustar Server Actions y vistas para operar **siempre** en el contexto del usuario actual.

**Fuera de alcance (solo mencionados, no implementados en este feature):**

- Roles y permisos avanzados (admin, supervisor, etc.).
- Compartición de emails/tareas entre usuarios (colaboración multiusuario).
- Asociación de contactos (`Contact`) y tags (`Tag`) por usuario (seguirán siendo globales en este feature).
- Reportes globales cross-usuario.

### Objetivo

Garantizar que **cada usuario vea únicamente sus propios emails y tareas**, asegurando privacidad y relevancia:

- Un email importado solo es visible para el usuario que lo importó.
- Las tareas generadas por IA para esos emails se consideran propiedad de ese usuario.
- Todas las operaciones de lectura y mutación se realizan en el contexto del usuario autenticado (sesión NextAuth).

### Resultado final esperado

Al finalizar este feature:

- El modelo de datos incluirá un **modelo `User`** y campos `userId` en las entidades relevantes (`Email`, `Task`).
- Los flujos de importación de emails, procesamiento IA y creación de tareas persistirán datos siempre asociados al `userId` del usuario autenticado.
- Las Server Actions de emails, IA y Kanban solo devolverán y modificarán datos pertenecientes al usuario actual.
- Las vistas `/emails`, `/emails/[id]`, `/kanban` y `/dashboard` mostrarán únicamente información del usuario autenticado, sin romper la experiencia visual actual.
- El comportamiento actual para un único usuario seguirá funcionando sin regresiones, pero el sistema estará listo para operar en modo multiusuario.

---

### Hitos del Proyecto

Este desarrollo se realizará en **3 hitos** secuenciales:

**HITO 1: Modelo de datos multiusuario y migraciones**  
Extender el esquema Prisma para introducir un modelo de usuario de aplicación y asociar `Email` y `Task` a dicho usuario mediante `userId`. Este hito se centra en la capa de datos y tipos TypeScript, y es desplegable sin cambiar todavía el comportamiento de las consultas (los datos existentes se mantienen sin perderse).

**HITO 2: Integración con autenticación y Server Actions (scoping por usuario)**  
Conectar la capa de datos con la autenticación real (NextAuth). Las Server Actions se adaptan para:
- Requerir sesión válida.
- Crear nuevos datos con el `userId` del usuario autenticado.
- Filtrar todas las consultas para que solo consideren datos del usuario actual.

**HITO 3: Ajustes de UI, mensajes y documentación multiusuario**  
Actualizar las vistas y textos para reflejar el comportamiento multiusuario (mensajes de “no hay emails” por usuario, etc.), validar los flujos end-to-end y documentar la funcionalidad y las nuevas restricciones en el Sistema Maestro.

---

## HITO 1: Modelo de datos multiusuario y migraciones

### Objetivo del Hito

Preparar la base de datos y los tipos TypeScript para soportar multiusuario básico, añadiendo:

- Un modelo `User` de la aplicación (persistencia mínima).
- Campos `userId` en `Email` y `Task` con las restricciones adecuadas.
- Migraciones Prisma aplicables en desarrollo y producción.
- Tipos TypeScript actualizados para reflejar esta nueva dimensión.

### Entregables

- [ ] Modelo `User` definido en [`schema.prisma`](prisma/schema.prisma).
- [ ] Campos `userId` añadidos a `Email` y `Task` con relaciones a `User`.
- [ ] Migraciones Prisma generadas y aplicadas en entorno de desarrollo.
- [ ] Tipos TypeScript actualizados en [`email.ts`](src/types/email.ts) y [`ai.ts`](src/types/ai.ts).
- [ ] Seed de datos ajustado en [`seed.ts`](prisma/seed.ts) (asociación básica a un usuario demo).
- [ ] Documentación mínima del nuevo modelo en el Sistema Maestro (sección de BD).

### Tareas

#### Backend – Prisma / Base de datos

- [ ] Definir `model User` en [`schema.prisma`](prisma/schema.prisma) con campos mínimos:
  - [ ] `id` (string, `@id`): coincide con el identificador de usuario que se usará desde NextAuth (ej. `sub` del token).
  - [ ] `email` (string, único).
  - [ ] `name` (string opcional).
  - [ ] `image` (string opcional).
  - [ ] `createdAt` (`DateTime @default(now())`).
- [ ] Extender `model Email`:
  - [ ] Añadir campo `userId` (string, requerido).
  - [ ] Definir relación con `User`:
    - `user   User @relation(fields: [userId], references: [id])`.
  - [ ] Añadir índice para consultas por usuario (`@@index([userId, receivedAt])`).
- [ ] Extender `model Task`:
  - [ ] Añadir campo `userId` (string, requerido).
  - [ ] Añadir relación con `User` (similar a la de `Email`).
  - [ ] Índice para consultas por usuario y estado (`@@index([userId, status])`).
- [ ] Generar migración Prisma:
  - [ ] `npx prisma migrate dev --name add_user_and_userId_to_email_task`.
  - [ ] Verificar que los campos nuevos son **compatibles** con datos existentes:
    - Estrategia: permitir `userId` temporalmente como opcional o asignar un usuario por defecto en la migración SQL (usuario “legacy”) y luego convertir a requerido.

#### Backend – Tipos TypeScript

- [ ] Actualizar [`email.ts`](src/types/email.ts) para:
  - [ ] Incluir `userId: string` en `PrismaEmail`.
  - [ ] Si existe un tipo `EmailWithMetadata`, incluir también `userId`.
- [ ] Actualizar [`ai.ts`](src/types/ai.ts) si `Task` se refleja allí:
  - [ ] Agregar campo `userId: string` en los tipos de tareas persistidas si aplica.
- [ ] Exportar (si es necesario) un tipo `User` o `AppUser` desde [`index.ts`](src/types/index.ts) para uso en otras capas.

#### Backend – Seed de datos

- [ ] Modificar [`seed.ts`](prisma/seed.ts) para:
  - [ ] Crear un registro `User` de prueba (por ejemplo, match con el email demo que sueles usar al loguearte).
  - [ ] Asociar emails y tareas del seed a ese `userId`.
- [ ] Validar que tras ejecutar `npm run db:seed`, todos los registros requeridos tienen un `userId` válido.

#### Testing

- [ ] Ejecutar `npx prisma migrate dev` en local y revisar que la migración:
  - [ ] Se aplica sin errores.
  - [ ] Crea las columnas y relaciones esperadas.
- [ ] Ejecutar `npm run build` para asegurar que los cambios en tipos no rompen la compilación.

### Dependencias

- **Internas:**
  - Estado actual de modelos `Email` y `Task` en [`schema.prisma`](prisma/schema.prisma).
  - Tipos actuales en [`email.ts`](src/types/email.ts) y [`ai.ts`](src/types/ai.ts).
- **Externas:**
  - Base de datos Neon accesible para aplicar migraciones.

### Consideraciones

- **Seguridad:**  
  La presencia de `userId` es la base para aplicar control de acceso; el enforcement se hará en Hito 2.
- **Migración:**  
  Es crítico definir una estrategia clara para los datos existentes:
  - Usuario “legacy” por defecto (ej.: `legacy-user`) asignado a todos los registros previos.
- **Compatibilidad:**  
  Este hito no debe cambiar el comportamiento funcional visible aún; solo preparar el modelo.

---

## HITO 2: Integración con autenticación y Server Actions (scoping por usuario)

### Objetivo del Hito

Conectar el modelo multiusuario con la autenticación real (NextAuth), de forma que:

- Toda mutación (crear emails, procesar IA, crear tareas) **siempre** se realice con el `userId` del usuario autenticado.
- Toda lectura (emails, Kanban, dashboard) se limite a los datos cuyo `userId` coincide con el usuario actual.
- No se permita ejecutar Server Actions críticas sin sesión válida.

### Entregables

- [ ] Helper robusto para obtener el usuario actual (`getAuthSession`) reutilizado en Server Actions.
- [ ] Server Actions de emails, IA y Kanban adaptadas para:
  - [ ] Requerir sesión.
  - [ ] Filtrar por `userId` en lecturas.
  - [ ] Grabar `userId` en mutaciones.
- [ ] Estrategia clara para el usuario “legacy” (si existe) y su coexistencia con usuarios reales.
- [ ] Logs y mensajes de error coherentes cuando falta autenticación.

### Tareas

#### Backend – Obtención y mapeo de usuario

- [ ] Extender [`auth-session.ts`](src/lib/auth-session.ts) o crear un helper adicional, p.ej. `getCurrentUserId()`:
  - [ ] Usar `getServerSession(authOptions)` para obtener la sesión.
  - [ ] Extraer un identificador consistente de usuario:
    - Preferentemente el `email` (`session.user.email`) como `User.id` (si el diseño de `User` lo adoptó así), o un `sub` si está disponible.
  - [ ] Resolver/crear el registro `User` en BD si no existe:
    - `upsert` sobre el modelo [`User`](prisma/schema.prisma).
- [ ] Definir una función de utilidad (por ejemplo, `requireUser()`):
  - [ ] Lanza un error o devuelve un resultado estándar si no hay sesión.
  - [ ] Devuelve `{ userId, user }` cuando la autenticación es válida.

#### Backend – Server Actions de Emails

En [`emails.ts`](src/actions/emails.ts):

- [ ] Para acciones de lectura:
  - [ ] `getEmails()`:
    - [ ] Obtener `userId` con `requireUser()`.
    - [ ] Añadir `where: { userId }` en la consulta `findMany`.
  - [ ] `getEmailById(id)`:
    - [ ] Incluir condición `where: { id, userId }` para evitar leer emails de otros usuarios.
  - [ ] Acciones agregadas (`getEmailsByCategory`, `getEmailsByPriority`, `getRecentEmails`, etc.):
    - [ ] Incorporar el filtro `userId` en las consultas a `prisma.email`.
- [ ] Para acciones de mutación:
  - [ ] `createEmail`:
    - [ ] Obtener `userId` actual.
    - [ ] Incluir `userId` en el `data` de creación.
  - [ ] `importEmailsFromJSON`:
    - [ ] Dentro del `transaction`, usar el `userId` del usuario autenticado para todos los `create` de `email`.
  - [ ] Acciones de aprobación / desaprobación, delete, update:
    - [ ] Verificar que el email pertenece al `userId` actual:
      - [ ] `where: { id, userId }` en las búsquedas previas a la mutación.

#### Backend – Server Actions de Procesamiento IA

En [`ai-processing.ts`](src/actions/ai-processing.ts):

- [ ] `getUnprocessedEmails(page, pageSize)`:
  - [ ] Añadir filtro `where: { processedAt: null, userId }`.
- [ ] `processEmailsWithAI(emailIds)`:
  - [ ] Validar que todos los `emailIds` pertenecen al `userId` actual (`where: { id: { in: ids }, userId }`).
  - [ ] Asegurar que las `Task` creadas en el flujo de IA se crean con `userId` correcto (propagando desde `Email`).
- [ ] `getPendingAIResults`, `getPendingAllAIResults`, `confirmAIResults`, `rejectProcessingResultsWithReason`:
  - [ ] Incorporar `userId` en consultas a `prisma.email`.
  - [ ] Garantizar que un usuario no pueda aprobar/rechazar resultados de otro usuario.

#### Backend – Server Actions de Kanban

En [`kanban.ts`](src/actions/kanban.ts):

- [ ] `getKanbanTasks`:
  - [ ] Filtrar `Task` por `userId` (además de los filtros existentes por contacto/estado).
- [ ] `getKanbanContacts`:
  - [ ] Basar el cálculo de contactos únicamente en tareas cuyos emails pertenezcan al `userId` actual.
- [ ] `updateKanbanTaskStatus`:
  - [ ] Verificar que la tarea y el email asociado pertenecen al `userId` actual antes de actualizar.

#### Testing

- [ ] Pruebas manuales con al menos **2 usuarios de Google** distintos:
  - [ ] Usuario A importa emails → solo A los ve.
  - [ ] Usuario B importa emails distintos → solo B los ve.
  - [ ] Kanban y Dashboard de A no muestran datos de B y viceversa.
- [ ] Validar que:
  - [ ] Las Server Actions devuelven error o estado adecuado si se invocan sin sesión (por ejemplo, `{ success: false, error: "UNAUTHENTICATED" }`).
  - [ ] No es posible acceder a un email por `id` que pertenezca a otro usuario.

### Dependencias

- **Internas:**
  - Hito 1 completado (modelo y migraciones con `userId`).
  - NextAuth + Google ya configurado (feature previo de autenticación).
- **Externas:**
  - Múltiples cuentas de Google para pruebas manuales.

### Consideraciones

- **Seguridad:**  
  La lógica de scoping por usuario DEBE estar en las Server Actions (backend), no solo en la UI.
- **Performance:**  
  Los índices en `userId` (y combinados con campos de orden) son clave para mantener buenas latencias.

---

## HITO 3: Ajustes de UI, mensajes y documentación multiusuario

### Objetivo del Hito

Alinear la experiencia de usuario y la documentación con el nuevo comportamiento multiusuario:

- Ajustar mensajes vacíos y estados “sin datos” para que tengan contexto de usuario.
- Verificar que la navegación entre vistas conserva la identidad del usuario y no filtra datos ajenos.
- Documentar el modelo multiusuario y las restricciones en el Sistema Maestro.

### Entregables

- [ ] Textos y mensajes de UI actualizados para reflejar que los datos son “tuyos”.
- [ ] Estados vacíos (`EmptyState`) coherentes por usuario en `/emails`, `/kanban`, `/dashboard`.
- [ ] Documentación actualizada en el Sistema Maestro:
  - [ ] Modelo `User`.
  - [ ] Relación `userId` en `Email` y `Task`.
  - [ ] Flujos de datos por usuario.
- [ ] Smoke tests end-to-end multiusuario documentados.

### Tareas

#### Frontend – Emails

En la vista principal de emails [`page.tsx`](src/app/(protected)/emails/page.tsx) y componentes asociados:

- [ ] Validar que la tabla se llena exclusivamente a partir de `getEmails()` ya filtrado por usuario.
- [ ] Revisar estados vacíos:
  - [ ] Si un usuario nuevo no tiene emails, mostrar un mensaje del tipo:
    - “Aún no tienes emails importados. Importa tu primer archivo JSON para comenzar.”
- [ ] Revisar filtros y contadores para asegurar que los totales reflejen únicamente datos del usuario actual.

#### Frontend – Kanban

En `/kanban` [`page.tsx`](src/app/(protected)/kanban/page.tsx) y [`KanbanBoard`](src/components/kanban/KanbanBoard.tsx):

- [ ] Asegurar que:
  - [ ] El board muestra únicamente tareas del usuario actual (ya garantizado por Server Actions en Hito 2).
  - [ ] Los mensajes vacíos indiquen:
    - “No tienes tareas generadas aún” (en lugar de un mensaje genérico).
- [ ] Validar filtros por contacto para múltiples usuarios (cada usuario ve sus propios contactos derivado de sus tareas).

#### Frontend – Dashboard

En [`page.tsx`](src/app/(protected)/dashboard/page.tsx):

- [ ] Confirmar que todas las métricas (`getEmailsByCategory`, `getEmailsByPriority`, conteos, etc.) están construidas desde Server Actions filtradas por usuario.
- [ ] Ajustar textos de tarjetas (`MetricCard`s) si es necesario:
  - De “Total de emails en el sistema” a “Tus emails en el sistema”, etc.

#### Documentación

- [ ] Actualizar [`SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md):
  - [ ] Sección 5 “Base de Datos y Modelado”:
    - [ ] Añadir descripción de `User`.
    - [ ] Documentar campos `userId` en `Email` y `Task`.
  - [ ] Sección 6 “Autenticación y Autorización”:
    - [ ] Explicar que las Server Actions se ejecutan en contexto de usuario y filtran por `userId`.
  - [ ] Sección 9 “Flujos de Datos”:
    - [ ] Actualizar el flujo principal para reflejar que todos los pasos se realizan por usuario autenticado.
- [ ] (Opcional) Añadir una nota en `doc/desarrollador/` sobre buenas prácticas para nuevas Server Actions multiusuario:
  - [ ] Siempre obtener sesión.
  - [ ] Siempre filtrar por `userId` en lecturas.
  - [ ] Siempre asignar `userId` en mutaciones.

#### Testing – Smoke multiusuario

- [ ] Escenario 1 – Usuario nuevo:
  - [ ] Iniciar sesión con una cuenta Google nueva.
  - [ ] Verificar que `/emails`, `/kanban`, `/dashboard` se muestran vacíos con mensajes adecuados.
  - [ ] Importar emails y verificar que solo ese usuario ve esos datos.
- [ ] Escenario 2 – Dos usuarios:
  - [ ] Usuario A crea datos (importa, procesa IA, genera tareas).
  - [ ] Usuario B entra sin datos:
    - [ ] No ve nada de A.
  - [ ] Usuario B crea datos propios:
    - [ ] Usuario A no ve los datos de B.
- [ ] Ejecutar `npm run build` para asegurar estabilidad.

### Dependencias

- **Internas:**
  - Hito 1 y Hito 2 completados (modelo + Server Actions filtrando por usuario).
- **Externas:**
  - Cuentas de Google adicionales para pruebas manuales.

### Consideraciones

- **UX:**  
  Toda la interfaz debe “hablarle” al usuario en términos de “tus emails”, “tus tareas”, evitando ambigüedad acerca de que los datos sean globales.
- **Futuras extensiones (fuera de alcance):**
  - Compartición de emails/tareas entre usuarios (requiere cambios de modelo adicionales).
  - Roles y permisos por equipo o empresa.
  - Segmentación de contactos y tags por usuario.

---

## Supuestos, riesgos y criterios de completitud

### Supuestos

1. La autenticación con Google (NextAuth) está completamente operativa y probada (feature anterior).
2. El identificador de usuario a usar en `User.id` puede derivarse de la sesión (`email` o `sub`) de forma estable.
3. Es aceptable, en esta fase, mantener `Contact` y `Tag` como catálogos globales compartidos.

### Riesgos

| Riesgo                                                       | Probabilidad | Impacto | Mitigación                                                                 |
|--------------------------------------------------------------|--------------|---------|----------------------------------------------------------------------------|
| Migraciones que asignan mal el `userId` de datos existentes | Media        | Alto    | Definir usuario “legacy” y probar migraciones en entorno de staging antes de producción. |
| Bugs en scoping que permitan ver datos de otros usuarios    | Baja         | Muy Alto| Testing exhaustivo multiusuario y revisión de todas las consultas con `userId`. |
| Aumento de complejidad en consultas Prisma                  | Media        | Medio   | Usar índices adecuados, revisar `select`/`include` mínimos y monitorizar performance. |

### Criterios de completitud del feature

El feature se considera completo cuando:

1. ✅ El modelo de datos (`User`, `Email.userId`, `Task.userId`) está migrado y documentado.
2. ✅ Todas las Server Actions de emails, IA y Kanban:
   - Requieren sesión válida.
   - Filtran por `userId` en lecturas.
   - Persisten datos con el `userId` correcto en mutaciones.
3. ✅ Un usuario autenticado solo puede ver/operar sobre sus propios emails y tareas.
4. ✅ Pruebas manuales con al menos dos usuarios diferentes verifican el aislamiento de datos.
5. ✅ El Sistema Maestro documenta claramente el comportamiento multiusuario y el modelo actualizado.
6. ✅ `npm run build` se ejecuta sin errores tras los cambios, y los flujos principales (login → importación → IA → Kanban) siguen funcionando para cada usuario de forma independiente.