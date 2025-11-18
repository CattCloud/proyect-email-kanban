# Planificación de Desarrollo: Integración del Estado "Aprobado" a los Emails

**Fecha de creación:** 16 de Noviembre, 2025  
**Versión:** 1.0.0  
**Responsable:** Equipo de Desarrollo  
**Revisado por:** Sistema Maestro v3.0.0

---

## Feature: Integración del Estado "Aprobado" a los Emails

### Información General

**Tipo:** Feature

El sistema de gestión de emails cuenta actualmente con dos estados fundamentales para el ciclo de vida de un email:

1. **Estado "No procesado":** El email fue cargado al sistema mediante importación JSON, pero aún no ha sido analizado por el servicio de IA. En la base de datos, esto se representa con el campo [`processedAt`](prisma/schema.prisma:18) = `null`.

2. **Estado "Procesado por IA":** El email ya pasó por el análisis automático de inteligencia artificial, generando metadata como categoría, prioridad y tareas asociadas. Este estado se marca con una fecha en el campo [`processedAt`](prisma/schema.prisma:18).

El presente feature introduce un tercer estado en el ciclo de vida: **"Aprobado"**. Este estado representa la validación humana del resultado generado por la IA. Un usuario revisor (típicamente un supervisor o ejecutivo comercial) confirma que los datos extraídos por la IA son correctos y pueden ser utilizados para la operación del negocio.

**Contexto funcional:**
- El campo [`processedAt`](prisma/schema.prisma:18) permanece intacto y continúa determinando si un email fue procesado por IA
- El nuevo campo `approvedAt` (DateTime?) será añadido al modelo [`Email`](prisma/schema.prisma:10) de Prisma
- Un email puede estar "Procesado por IA" pero "No aprobado" (processedAt con fecha, approvedAt null)
- Un email solo puede estar "Aprobado" si previamente fue "Procesado por IA" (lógica de negocio)
- Las tareas extraídas por IA aparecen en el Kanban independientemente de la aprobación (filtro basado solo en processedAt)

**Motivación del negocio:**
La revisión humana de los resultados de IA es crítica para casos donde:
- La IA puede malinterpretar el contexto de un email comercial
- Se requiere validación antes de ejecutar acciones basadas en prioridades/categorías
- El compliance empresarial exige supervisión humana de clasificaciones automáticas
- Se necesita trazabilidad de quién aprobó qué y cuándo para auditorías

### Objetivo

Implementar un sistema completo de aprobación para emails procesados por IA que permita:

1. **Persistir el estado de aprobación** mediante un nuevo campo `approvedAt` en la base de datos
2. **Visualizar el estado de aprobación** mediante badges adicionales en todas las vistas de emails
3. **Aprobar emails procesados** desde la interfaz de usuario con un flujo claro y accesible
4. **Mantener coherencia de estados** garantizando que solo emails procesados puedan ser aprobados
5. **Proporcionar trazabilidad** registrando la fecha exacta de aprobación para auditorías

### Resultado final esperado

Al completar este feature, el sistema contará con un flujo de tres estados claramente diferenciados para los emails:

**No procesado → Procesado por IA → Aprobado (opcional)**

Los usuarios podrán:
- **Visualizar** el estado de aprobación mediante un badge distintivo que aparece junto al badge de "Procesado IA"
- **Aprobar emails** procesados desde la vista de detalle del email ([`/emails/[id]`](src/app/(protected)/emails/[id]/page.tsx))
- **Filtrar** emails por estado de aprobación en la tabla principal ([`EmailTable`](src/components/emails/EmailTable.tsx))
- **Auditar** cuándo fue aprobado cada email mediante el timestamp `approvedAt`

El sistema garantizará que:
- Solo los emails con `processedAt != null` puedan ser aprobados
- El Kanban continúe mostrando tareas de emails procesados, aprobados o no
- Los badges visuales respeten el sistema de diseño existente ([`globals.css`](src/app/globals.css))
- No exista badge para "No aprobado" (la ausencia del badge de aprobación lo implica)
- La funcionalidad sea accesible, responsive y consistente con la arquitectura del sistema

### Hitos del Proyecto

Este desarrollo se realizará en **4 hitos** secuenciales:

**HITO 1: Base de Datos - Campo approvedAt y Migración**  
Se modificará el schema de Prisma para agregar el campo `approvedAt` al modelo Email, se creará la migración correspondiente y se actualizarán los tipos TypeScript relacionados. Este hito establece la infraestructura de datos necesaria para soportar la aprobación. Al finalizar este hito, la base de datos estará preparada para almacenar estados de aprobación aunque la funcionalidad aún no esté expuesta en la UI.

**HITO 2: Server Actions - Lógica de Aprobación**  
Se implementarán las Server Actions necesarias para gestionar el estado de aprobación: aprobar emails individuales, obtener emails aprobados/no aprobados con filtros, y validar las reglas de negocio. Este hito proporciona la capa de lógica de backend que garantiza la integridad de los datos. Al finalizar, existirá una API funcional para aprobar emails que podrá ser consumida desde cualquier componente frontend.

**HITO 3: UI/UX - Badges y Flujos de Aprobación**  
Se diseñarán e implementarán los elementos visuales y de interacción: badge de "Aprobado" en el sistema de diseño, botón de aprobación en la vista de detalle del email, y actualización de filtros en la tabla de emails. Este hito hace visible la funcionalidad para los usuarios finales. Al completarlo, los usuarios podrán visualizar y gestionar el estado de aprobación desde la interfaz.

**HITO 4: Integración Completa y Validación**  
Se integrará la funcionalidad de aprobación en todos los puntos relevantes del sistema (Dashboard, Kanban, vistas de lista), se implementarán validaciones exhaustivas, se actualizará la documentación técnica, y se verificará la consistencia del feature en todos los flujos de usuario. Este hito garantiza que el feature funciona correctamente en el sistema completo.

---

## HITO 1: Base de Datos - Campo approvedAt y Migración

### Objetivo del Hito

Modificar el modelo de datos del sistema para soportar el nuevo estado de aprobación mediante la adición del campo `approvedAt` en la tabla `Email`, crear la migración de base de datos correspondiente, actualizar todos los tipos TypeScript relacionados, y preparar la infraestructura de datos para los hitos posteriores.

### Entregables

- [x] Campo `approvedAt` agregado al modelo Email en [`schema.prisma`](prisma/schema.prisma:10)
- [x] Migración de Prisma creada y lista para ejecutar (ej: `20251116000000_add_approved_at_field`)
- [x] Índice de base de datos en el campo `approvedAt` para optimizar consultas
- [x] Tipos TypeScript actualizados en [`src/types/email.ts`](src/types/email.ts)
- [x] Documentación del cambio de schema en comentarios del código
- [x] Verificación de compatibilidad con datos existentes (migración no destructiva)

### Tareas

#### Backend - Schema y Migración

- [ ] **Modificar schema.prisma**
  - [ ] Agregar campo `approvedAt DateTime?` al modelo `Email` (después de `processedAt`)
  - [ ] Agregar comentario descriptivo: `// Null = no aprobado aún, fecha = aprobado en esa fecha`
  - [ ] Agregar índice: `@@index([approvedAt])`
  - [ ] Agregar índice compuesto para consultas eficientes: `@@index([processedAt, approvedAt])`
  - [ ] Verificar que la relación con `EmailMetadata` no se vea afectada
  
- [ ] **Crear migración de Prisma**
  - [ ] Ejecutar `npx prisma migrate dev --name add_approved_at_field`
  - [ ] Revisar y validar el SQL generado en `prisma/migrations/`
  - [ ] Verificar que la migración sea compatible con PostgreSQL en Neon
  - [ ] Confirmar que el campo se crea como nullable (permite datos existentes)
  - [ ] Documentar la migración en el archivo SQL con comentarios explicativos

- [ ] **Actualizar Prisma Client**
  - [ ] Ejecutar `npx prisma generate` para regenerar el cliente
  - [ ] Verificar que el nuevo campo aparece en los tipos generados
  - [ ] Confirmar que `Email` incluye `approvedAt: Date | null` en el tipo

#### Frontend - Tipos TypeScript

- [ ] **Actualizar tipos en [`src/types/email.ts`](src/types/email.ts)**
  - [ ] Agregar `approvedAt: Date | null` a la interfaz `PrismaEmail` (línea ~28)
  - [ ] Agregar `approvedAt: Date | null` a la interfaz `EmailWithMetadata` (línea ~32)
  - [ ] Verificar que las interfaces exportadas sean consistentes
  - [ ] Agregar comentarios JSDoc explicando el campo:
    ```typescript
    /**
     * Fecha de aprobación del email por un revisor humano.
     * - null: El email no ha sido aprobado aún
     * - Date: El email fue aprobado en esta fecha
     * Nota: Solo emails con processedAt != null pueden ser aprobados
     */
    approvedAt: Date | null;
    ```

- [ ] **Crear tipos auxiliares para filtros de aprobación**
  - [ ] Agregar tipo `EmailFilterAprobacion = "todos" | "aprobado" | "no-aprobado"` en `email.ts`
  - [ ] Exportar el nuevo tipo desde [`src/types/index.ts`](src/types/index.ts)

#### Testing y Validación

- [ ] **Validar migración local**
  - [ ] Ejecutar migración en base de datos de desarrollo
  - [ ] Verificar que se crea el campo `approvedAt` como `TIMESTAMP NULL`
  - [ ] Confirmar que los índices se crean correctamente
  - [ ] Probar consulta SQL: `SELECT id, processedAt, approvedAt FROM "Email" LIMIT 5`

- [ ] **Validar compatibilidad con datos existentes**
  - [ ] Verificar que emails existentes tienen `approvedAt = null` por defecto
  - [ ] Confirmar que las consultas existentes no se rompen
  - [ ] Ejecutar `npm run build` para verificar compilación TypeScript

#### Documentación

- [ ] **Actualizar documentación técnica**
  - [ ] Documentar el nuevo campo en [`SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md) sección 5.2 (Modelo de Datos)
  - [ ] Agregar entrada al changelog indicando la versión y el cambio de schema
  - [ ] Actualizar diagramas de base de datos si existen

### Dependencias

- **Internas:** Ninguna (primer hito del feature)
- **Externas:** 
  - PostgreSQL en Neon disponible y accesible
  - Prisma CLI instalado (`npm install -D prisma`)
  - Node.js y npm configurados correctamente

### Consideraciones

**Performance:**
- El índice en `approvedAt` optimizará las consultas de filtrado por aprobación
- El índice compuesto `[processedAt, approvedAt]` optimizará consultas que filtran por ambos estados simultáneamente
- Los índices adicionales tendrán un impacto mínimo en escritura dado el volumen esperado de emails

**Compatibilidad:**
- La migración es no destructiva (campo nullable)
- Datos existentes permanecen intactos con `approvedAt = null`
- No se requiere data migration script (valores null son el estado por defecto deseado)

**Seguridad:**
- El campo será actualizable solo mediante Server Actions con validación
- La protección a nivel de aplicación se implementará en el Hito 2

**Rollback:**
- En caso de error, la migración puede revertirse ejecutando `npx prisma migrate resolve --rolled-back <migration_name>`
- Se recomienda backup de la base de datos antes de la migración en producción

---

## HITO 2: Server Actions - Lógica de Aprobación

### Objetivo del Hito

Implementar la lógica de negocio para gestionar el estado de aprobación de emails mediante Server Actions, incluyendo funciones para aprobar/desaprobar emails, validar reglas de negocio, filtrar por estado de aprobación, y garantizar la integridad de datos con validación Zod.

### Entregables

- [x] Server Action `approveEmail(emailId: string)` implementada con validación
- [x] Server Action `unapproveEmail(emailId: string)` para revertir aprobaciones
- [x] Server Action `getEmailsByApprovalStatus()` con filtros de aprobación
- [x] Validación Zod para operaciones de aprobación
- [x] Regla de negocio implementada: solo emails con processedAt != null pueden aprobarse
- [x] Actualización de Server Actions existentes para incluir approvedAt en respuestas
- [x] Manejo de errores específico para operaciones de aprobación
- [x] Tests unitarios de Server Actions (opcional según tiempo)

### Tareas

#### Backend - Server Actions Core

- [ ] **Crear nueva Server Action: approveEmail**
  - [ ] Crear función en [`src/actions/emails.ts`](src/actions/emails.ts) (después de `deleteEmail`)
  - [ ] Firma: `export async function approveEmail(emailId: string)`
  - [ ] Validación de entrada con Zod:
    ```typescript
    const ApproveEmailSchema = z.object({
      emailId: z.string().min(1, "Email ID requerido")
    })
    ```
  - [ ] Lógica:
    1. Validar que el email existe
    2. Validar que `processedAt != null` (regla de negocio crítica)
    3. Si ya está aprobado, retornar error descriptivo
    4. Actualizar `approvedAt = new Date()`
    5. Revalidar paths: `/emails`, `/emails/[id]`, `/dashboard`
  - [ ] Retornar `{ success: boolean; data?: Email; error?: string; message?: string }`
  - [ ] Manejo de errores:
    - Email no encontrado: "Email no encontrado"
    - Email no procesado: "Solo se pueden aprobar emails procesados por IA"
    - Email ya aprobado: "Este email ya fue aprobado anteriormente"

- [ ] **Crear nueva Server Action: unapproveEmail**
  - [ ] Crear función en [`src/actions/emails.ts`](src/actions/emails.ts)
  - [ ] Firma: `export async function unapproveEmail(emailId: string)`
  - [ ] Lógica:
    1. Validar que el email existe
    2. Validar que está aprobado (`approvedAt != null`)
    3. Actualizar `approvedAt = null`
    4. Revalidar paths correspondientes
  - [ ] Manejo de error si el email no está aprobado

- [ ] **Crear nueva Server Action: getEmailsByApprovalStatus**
  - [ ] Crear función en [`src/actions/emails.ts`](src/actions/emails.ts)
  - [ ] Firma: `export async function getEmailsByApprovalStatus(status: "approved" | "not-approved" | "all")`
  - [ ] Lógica con Prisma:
    ```typescript
    const whereClause = status === "approved" 
      ? { processedAt: { not: null }, approvedAt: { not: null } }
      : status === "not-approved"
      ? { processedAt: { not: null }, approvedAt: null }
      : {}; // "all" devuelve todos
    
    const emails = await prisma.email.findMany({
      where: whereClause,
      include: { metadata: true },
      orderBy: { receivedAt: 'desc' }
    });
    ```
  - [ ] Retornar lista de emails con metadata completa

- [ ] **Actualizar Server Actions existentes**
  - [ ] Modificar [`getEmails()`](src/actions/emails.ts:88) para incluir `approvedAt` en select (ya se incluye por defecto con Prisma)
  - [ ] Modificar [`getEmailById()`](src/actions/emails.ts:112) para verificar inclusión de `approvedAt`
  - [ ] Modificar [`updateEmail()`](src/actions/emails.ts:180) para soportar actualización manual de `approvedAt` si es necesario (caso edge: corrección administrativa)
  - [ ] Verificar que todas las Server Actions devuelven `approvedAt` en los resultados

#### Validación y Schemas

- [ ] **Crear schemas Zod para aprobación**
  - [ ] `ApproveEmailSchema` para validar entrada de approveEmail
  - [ ] `UnapproveEmailSchema` para validar entrada de unapproveEmail
  - [ ] Agregar opcional `approvedAt` a `UpdateEmailSchema` existente (línea ~39)

- [ ] **Implementar validaciones de reglas de negocio**
  - [ ] Función auxiliar privada `canApproveEmail(email: Email): boolean`
    - Retorna `true` solo si `email.processedAt !== null`
  - [ ] Usar esta función en `approveEmail()` antes de actualizar
  - [ ] Agregar comentario explicando: "Solo emails procesados por IA pueden ser aprobados"

#### Testing

- [ ] **Tests de Server Actions (opcional pero recomendado)**
  - [ ] Test: `approveEmail` con email procesado → success
  - [ ] Test: `approveEmail` con email no procesado → error específico
  - [ ] Test: `approveEmail` con email ya aprobado → error específico
  - [ ] Test: `unapproveEmail` con email aprobado → success
  - [ ] Test: `getEmailsByApprovalStatus` con diferentes filtros → resultados correctos
  - [ ] Crear archivo [`src/tests/approval-actions.test.ts`](src/tests/) si se implementan tests

#### Documentación

- [ ] **Documentar Server Actions en código**
  - [ ] Agregar comentarios JSDoc a cada nueva función explicando:
    - Propósito
    - Parámetros
    - Valor de retorno
    - Errores posibles
    - Ejemplo de uso
  - [ ] Ejemplo:
    ```typescript
    /**
     * Aprueba un email que fue procesado por IA
     * @param emailId - ID del email a aprobar
     * @returns Resultado con el email actualizado o error
     * @throws Error si el email no existe o no ha sido procesado
     * @example
     * const result = await approveEmail("cm...");
     * if (result.success) { /* email aprobado */ }
     */
    ```

- [ ] **Actualizar documentación técnica**
  - [ ] Agregar `approveEmail()` a la sección 7.1 (Server Actions Implementadas) del [`SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md)
  - [ ] Agregar `unapproveEmail()` y `getEmailsByApprovalStatus()` a la misma sección
  - [ ] Documentar reglas de negocio en sección de Flujos de Datos

### Dependencias

- **Internas:** 
  - HITO 1 completado (campo `approvedAt` existe en base de datos)
- **Externas:**
  - Prisma Client actualizado con el nuevo campo
  - Zod instalado y funcionando

### Consideraciones

**Validación de Reglas de Negocio:**
- La regla "solo emails procesados pueden ser aprobados" es crítica para la integridad del sistema
- Esta validación debe hacerse a nivel de Server Action, nunca confiando solo en el frontend
- Si se viola la regla, devolver error descriptivo sin modificar la base de datos

**Transacciones:**
- `approveEmail` y `unapproveEmail` son operaciones atómicas simples (un solo UPDATE)
- No requieren transacciones explícitas de Prisma
- Si en el futuro se agrega lógica adicional (ej: notificaciones), considerar usar `prisma.$transaction()`

**Rendimiento:**
- Los índices creados en HITO 1 optimizan las consultas de `getEmailsByApprovalStatus`
- Usar `include: { metadata: true }` solo cuando sea necesario (evitar overfetching)

**Revalidación de Caché:**
- Todas las operaciones que modifican `approvedAt` deben llamar a `revalidatePath()`
- Paths a revalidar: `/emails`, `/emails/[id]`, `/dashboard`, `/` (si aplica)

**Seguridad:**
- Estas Server Actions deben protegerse con autenticación cuando se implemente NextAuth
- Por ahora, asumir que cualquier usuario puede aprobar (requisito de autenticación está fuera del alcance de este feature)

---

## HITO 3: UI/UX - Badges y Flujos de Aprobación

### Objetivo del Hito

Diseñar e implementar todos los elementos visuales y de interacción relacionados con el estado de aprobación, incluyendo el badge de "Aprobado", el botón de aprobación en la vista de detalle, filtros en la tabla de emails, y actualización de todos los componentes afectados para mostrar y gestionar el nuevo estado.

### Entregables

- [x] Badge visual de "Aprobado" en el sistema de diseño ([`globals.css`](src/app/globals.css))
- [x] Botón de "Aprobar Email" en [`EmailDetailView`](src/components/emails/EmailDetailView.tsx)
- [x] Badge de aprobación visible en [`EmailTable`](src/components/emails/EmailTable.tsx)
- [x] Filtro de aprobación agregado a [`EmailTable`](src/components/emails/EmailTable.tsx)
- [x] Badge de aprobación visible en [`KanbanBoard`](src/components/kanban/KanbanBoard.tsx) (TaskCard)
- [x] Estados de loading y error durante la aprobación
- [x] Feedback visual inmediato al aprobar (optimistic UI o mensajes)
- [x] Diseño responsive para todos los componentes modificados
- [x] Accesibilidad completa (ARIA labels, navegación por teclado)

### Tareas

#### Sistema de Diseño - CSS

- [ ] **Agregar badge de aprobación a [`globals.css`](src/app/globals.css)**
  - [ ] Definir variables CSS en sección de variables (línea ~260):
    ```css
    /* Estados de Aprobación */
    --color-aprobado-bg: var(--color-secondary-100);
    --color-aprobado-text: var(--color-secondary-800);
    --color-aprobado-border: var(--color-secondary-200);
    ```
  - [ ] Crear clase `.badge-aprobado` en sección de badges (después de línea ~757):
    ```css
    .badge-aprobado {
      background-color: var(--color-aprobado-bg);
      color: var(--color-aprobado-text);
      border: 1px solid var(--color-aprobado-border);
      font-weight: var(--font-weight-medium);
    }
    ```
  - [ ] Agregar ícono opcional dentro del badge (checkmark): estilizar con Lucide React

- [ ] **Definir estilos para botón de aprobación**
  - [ ] El botón usará el componente [`Button`](src/components/ui/button.tsx) existente
  - [ ] Variant: `variant="secondary"` con ícono `<Check />` de Lucide
  - [ ] Estado disabled cuando el email no esté procesado
  - [ ] Estado de loading mientras se ejecuta la acción

#### Frontend - EmailTable

- [ ] **Agregar badge de aprobación en [`EmailTable`](src/components/emails/EmailTable.tsx)**
  - [ ] Importar tipo `EmailFilterAprobacion` desde types
  - [ ] Agregar badge después del badge de "Procesado" (línea ~439-443):
    ```tsx
    {/* Badge de aprobación */}
    {e.processedAt !== null && e.approvedAt !== null && (
      <span className="badge-aprobado inline-flex items-center px-2 py-1 rounded text-xs">
        <Check className="w-3 h-3 mr-1" aria-hidden />
        Aprobado
      </span>
    )}
    ```
  - [ ] Mostrar también en cards móviles (línea ~472-476)

- [ ] **Agregar filtro de aprobación en EmailTable**
  - [ ] Agregar estado: `const [filterAprobacion, setFilterAprobacion] = useState<EmailFilterAprobacion>("todos")`
  - [ ] Agregar select después del filtro de categoría (línea ~340):
    ```tsx
    <label className="text-sm text-[color:var(--color-text-secondary)] ml-2">
      Aprobación
    </label>
    <select
      value={filterAprobacion}
      onChange={(e) => {
        setFilterAprobacion(e.target.value as EmailFilterAprobacion);
        resetPaging();
      }}
      className="px-2 py-2 rounded-md border border-[color:var(--color-border-light)]"
      aria-label="Filtrar por estado de aprobación"
    >
      <option value="todos">Todos</option>
      <option value="aprobado">Aprobados</option>
      <option value="no-aprobado">No aprobados</option>
    </select>
    ```
  - [ ] Actualizar lógica de filtrado en `useMemo` (línea ~143):
    ```typescript
    // Filtro por aprobación
    if (filterAprobacion !== "todos") {
      data = data.filter(e => {
        if (filterAprobacion === "aprobado") {
          return e.processedAt !== null && e.approvedAt !== null;
        } else { // "no-aprobado"
          return e.processedAt !== null && e.approvedAt === null;
        }
      });
    }
    ```

#### Frontend - EmailDetailView

- [ ] **Agregar botón de aprobación en [`EmailDetailView`](src/components/emails/EmailDetailView.tsx)**
  - [ ] Importar Server Action `approveEmail` desde actions
  - [ ] Agregar estado local:
    ```typescript
    const [approving, setApproving] = useState(false);
    const [approvalError, setApprovalError] = useState<string | null>(null);
    ```
  - [ ] Crear handler de aprobación:
    ```typescript
    async function handleApprove() {
      if (!email || email.processedAt === null) return;
      
      try {
        setApproving(true);
        setApprovalError(null);
        const result = await approveEmail(email.id);
        
        if (result.success) {
          // Actualizar email local con los datos nuevos
          setEmail(result.data!);
          alert("Email aprobado exitosamente"); // TODO: reemplazar con toast
        } else {
          setApprovalError(result.error || "Error al aprobar email");
        }
      } catch (err) {
        setApprovalError("Error de conexión al servidor");
        console.error("Error al aprobar:", err);
      } finally {
        setApproving(false);
      }
    }
    ```
  - [ ] Agregar botón en la sección de acciones (después del botón de eliminar, si existe):
    ```tsx
    {email.processedAt !== null && email.approvedAt === null && (
      <Button
        type="button"
        onClick={handleApprove}
        disabled={approving}
        variant="secondary"
        size="md"
        leftIcon={<Check className="w-4 h-4" />}
        aria-label="Aprobar email"
      >
        {approving ? "Aprobando..." : "Aprobar Email"}
      </Button>
    )}
    
    {email.approvedAt !== null && (
      <div className="flex items-center gap-2 text-sm text-[color:var(--color-success-text)]">
        <Check className="w-4 h-4" />
        <span>
          Aprobado el {new Date(email.approvedAt).toLocaleDateString('es-CO')}
        </span>
      </div>
    )}
    ```
  - [ ] Mostrar error si ocurre:
    ```tsx
    {approvalError && (
      <div className="text-sm text-red-500 mt-2">{approvalError}</div>
    )}
    ```

- [ ] **Mostrar badge de aprobado en EmailDetailView**
  - [ ] Agregar badge en la sección de metadata junto a otros badges
  - [ ] Usar la misma clase `.badge-aprobado` definida en globals.css

#### Frontend - Kanban

- [ ] **Actualizar [`TaskCard`](src/components/kanban/TaskCard.tsx) para mostrar aprobación**
  - [ ] Agregar badge de aprobación si el email está aprobado:
    ```tsx
    {email.approvedAt !== null && (
      <span className="badge-aprobado inline-flex items-center px-2 py-1 rounded text-xs">
        <Check className="w-3 h-3 mr-1" />
        Aprobado
      </span>
    )}
    ```
  - [ ] Posicionar el badge junto a otros badges de categoría/prioridad

#### Frontend - Dashboard

- [ ] **Agregar métrica de aprobación en Dashboard (opcional)**
  - [ ] Si el tiempo lo permite, agregar nueva MetricCard mostrando:
    - "Emails Aprobados": Count de emails con `approvedAt !== null`
    - "Pendientes de Aprobación": Count de emails con `processedAt !== null && approvedAt === null`
  - [ ] Usar Server Action existente o crear nueva consulta

#### Accesibilidad y UX

- [ ] **Implementar accesibilidad completa**
  - [ ] Todos los botones tienen `aria-label` descriptivo
  - [ ] Estados de loading tienen `aria-busy="true"`
  - [ ] Mensajes de error son anunciados por screen readers (`role="alert"`)
  - [ ] Badge de aprobación tiene texto descriptivo claro
  - [ ] Navegación por teclado funciona correctamente (Tab, Enter)

- [ ] **Implementar feedback visual inmediato**
  - [ ] Loading spinner mientras se aprueba
  - [ ] Cambio inmediato de estado tras aprobación exitosa
  - [ ] Mensaje de error claro y visible si falla la aprobación
  - [ ] Considerar implementar optimistic UI (actualizar UI antes de confirmación del servidor)

#### Testing Manual

- [ ] **Probar flujo completo de aprobación**
  - [ ] Navegar a un email procesado en `/emails/[id]`
  - [ ] Verificar que aparece el botón "Aprobar Email"
  - [ ] Hacer clic y verificar estado de loading
  - [ ] Confirmar que el badge "Aprobado" aparece tras éxito
  - [ ] Verificar que el botón desaparece tras aprobación
  - [ ] Probar error: intentar aprobar email no procesado (simular)

- [ ] **Probar filtros en EmailTable**
  - [ ] Filtrar por "Aprobados" → solo emails con approvedAt !== null
  - [ ] Filtrar por "No aprobados" → solo emails procesados pero sin aprobar
  - [ ] Combinar con otros filtros (categoría, estado)

- [ ] **Verificar responsive design**
  - [ ] Probar en móvil (< 640px)
  - [ ] Probar en tablet (640px - 1024px)
  - [ ] Probar en desktop (> 1024px)
  - [ ] Confirmar que badges se alinean correctamente en todos los breakpoints

### Dependencias

- **Internas:**
  - HITO 1 completado (campo existe en BD)
  - HITO 2 completado (Server Actions funcionan)
- **Externas:**
  - Lucide React para ícono `<Check />`
  - Componente [`Button`](src/components/ui/button.tsx) existente

### Consideraciones

**Sistema de Diseño:**
- El badge de "Aprobado" usa colores del sistema existente (verde de success)
- Mantener consistencia visual con otros badges (`.badge-procesado`, `.badge-categoria-*`)
- El badge debe ser claramente distinguible pero no invasivo

**UX:**
- El botón de aprobar solo aparece si el email está procesado (evitar confusión)
- Una vez aprobado, el botón desaparece y se muestra la fecha de aprobación
- No existe botón de "desaprobar" en la UI inicial (se puede agregar en futuro si se requiere)

**Performance:**
- Evitar re-renders innecesarios al actualizar estado de aprobación
- Usar `useMemo` para derivados que dependen de `approvedAt`
- Considerar optimistic UI para mejorar percepción de velocidad

**Accesibilidad:**
- Los badges deben tener contraste suficiente (verificar con herramientas de accesibilidad)
- Estados de loading deben ser perceptibles por lectores de pantalla
- Errores deben tener `role="alert"` para anunciarse automáticamente

**Responsive:**
- En móvil, badges pueden apilarse verticalmente si no hay espacio horizontal
- Botón de aprobar debe ser fácilmente clickeable en pantallas táctiles (min 44x44px)

---

## HITO 4: Integración Completa y Validación

### Objetivo del Hito

Integrar la funcionalidad de aprobación en todos los puntos relevantes del sistema, implementar validaciones exhaustivas de casos edge, actualizar la documentación técnica completa, realizar pruebas end-to-end, y garantizar que el feature funciona correctamente en todos los flujos de usuario y componentes del sistema.

### Entregables

- [x] Integración completa del estado de aprobación en Dashboard
- [x] Validación de casos edge y manejo de errores robusto
- [x] Documentación técnica actualizada (Sistema Maestro)
- [x] Guía de usuario para el flujo de aprobación
- [x] Tests end-to-end del flujo completo (manual o automatizado)
- [x] Verificación de consistencia de datos en todos los componentes
- [x] Plan de rollback documentado
- [x] Feature completamente funcional y desplegable

### Tareas

#### Integración de Componentes

- [ ] **Integrar aprobación en Dashboard**
  - [ ] Modificar [`page.tsx`](src/app/(protected)/dashboard/page.tsx) del Dashboard
  - [ ] Agregar nuevas métricas:
    ```typescript
    // Emails aprobados
    const approvedEmails = allEmails.filter(e => e.approvedAt !== null);
    const approvedCount = approvedEmails.length;
    
    // Emails procesados pendientes de aprobación
    const processedNotApproved = allEmails.filter(
      e => e.processedAt !== null && e.approvedAt === null
    );
    const pendingApprovalCount = processedNotApproved.length;
    ```
  - [ ] Agregar cards de métricas usando [`MetricCard`](src/components/dashboard/MetricCard.tsx):
    - Card: "Emails Aprobados" con ícono `<CheckCircle />`
    - Card: "Pendientes de Aprobación" con ícono `<Clock />`
  - [ ] Hacer las cards clickeables para navegar a EmailTable con filtro correspondiente

- [ ] **Verificar integración en Kanban**
  - [ ] Confirmar que [`KanbanBoard`](src/components/kanban/KanbanBoard.tsx) muestra badges de aprobación
  - [ ] Verificar que el filtro actual de Kanban (solo emails procesados) sigue funcionando
  - [ ] Considerar agregar filtro opcional "Solo tareas aprobadas" (enhancement futuro)

- [ ] **Actualizar navegación y breadcrumbs**
  - [ ] Verificar que los breadcrumbs reflejan correctamente el estado en `/emails/[id]`
  - [ ] Asegurar que la navegación entre vistas mantiene el contexto de filtros

#### Validaciones y Casos Edge

- [ ] **Validar reglas de negocio exhaustivamente**
  - [ ] Caso: Intentar aprobar email con `processedAt = null` → error claro
  - [ ] Caso: Aprobar email ya aprobado → mensaje informativo, no error crítico
  - [ ] Caso: Email eliminado mientras se aprueba → manejo graceful de error
  - [ ] Caso: Pérdida de conexión durante aprobación → retry o mensaje claro

- [ ] **Implementar validaciones client-side adicionales**
  - [ ] Deshabilitar botón de aprobar si el email no tiene metadata (indica procesamiento incompleto)
  - [ ] Mostrar tooltip explicativo si el botón está deshabilitado
  - [ ] Validar que `email.processedAt` existe antes de mostrar botón

- [ ] **Manejar concurrencia**
  - [ ] Caso: Dos usuarios intentan aprobar el mismo email simultáneamente
  - [ ] Solución: La segunda aprobación debe ser idempotente (no error si ya aprobado)
  - [ ] Agregar optimistic lock o validación de timestamp si es necesario

#### Testing y QA

- [ ] **Tests E2E del flujo completo**
  - [ ] Test manual completo:
    1. Importar emails desde JSON
    2. Procesar emails con IA
    3. Verificar que aparecen en tabla con badge "Procesado"
    4. Navegar a detalle de email procesado
    5. Hacer clic en "Aprobar Email"
    6. Verificar badge "Aprobado" aparece
    7. Volver a tabla y filtrar por "Aprobados"
    8. Verificar que el email aprobado aparece en filtro
    9. Ir a Dashboard y verificar métricas actualizadas
    10. Ir a Kanban y verificar badge de aprobación en task card

- [ ] **Tests de regresión**
  - [ ] Verificar que funcionalidad existente no se rompió:
    - Importación de emails
    - Procesamiento con IA
    - Filtros de categoría y prioridad
    - Navegación entre vistas
    - Kanban drag & drop (si está implementado)

- [ ] **Tests de performance**
  - [ ] Verificar tiempo de respuesta de `approveEmail()` (debe ser < 500ms)
  - [ ] Consultas con filtro de aprobación deben ser rápidas (< 200ms)
  - [ ] No debe haber re-renders innecesarios al actualizar estado

#### Documentación

- [ ] **Actualizar [`SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md)**
  - [ ] Agregar sección en "5. Base de Datos y Modelado":
    ```markdown
    ### Campo approvedAt
    
    El campo `approvedAt` en el modelo Email representa el estado de aprobación:
    - `null`: Email no aprobado (default)
    - `Date`: Email fue aprobado en esta fecha
    
    **Regla de negocio crítica:** Solo emails con `processedAt != null` pueden ser aprobados.
    ```
  
  - [ ] Actualizar sección "7. Servicios y Acciones del Backend" con las nuevas Server Actions
  - [ ] Agregar en "8. Componentes UI" la descripción del badge de aprobación
  - [ ] Actualizar "9. Flujos de Datos" con el nuevo flujo de tres estados:
    ```
    No procesado → Procesado por IA → Aprobado (opcional)
    ```

- [ ] **Crear guía de usuario**
  - [ ] Documento: `doc/guia/FLUJO_APROBACION.md`
  - [ ] Contenido:
    - Qué significa "Aprobar un email"
    - Cuándo aprobar (después de revisar clasificación de IA)
    - Cómo aprobar desde la vista de detalle
    - Cómo filtrar emails aprobados
    - Qué pasa si un email no está procesado (no se puede aprobar)

- [ ] **Documentar cambios en CHANGELOG**
  - [ ] Agregar entrada de versión (ej: v2.1.0):
    ```markdown
    ## [2.1.0] - 2025-11-16
    
    ### Added
    - Campo `approvedAt` en modelo Email para registro de aprobación
    - Server Actions: `approveEmail()`, `unapproveEmail()`, `getEmailsByApprovalStatus()`
    - Badge visual de "Aprobado" en todas las vistas de emails
    - Filtro de aprobación en EmailTable
    - Botón de aprobación en EmailDetailView
    - Métricas de aprobación en Dashboard
    
    ### Changed
    - Modelo de datos Email incluye nuevo campo `approvedAt`
    - Tipos TypeScript actualizados para incluir estado de aprobación
    
    ### Security
    - Validación server-side: solo emails procesados pueden ser aprobados
    ```

#### Plan de Rollback

- [ ] **Documentar estrategia de rollback**
  - [ ] Crear documento: `doc/ROLLBACK_APROBACION_FEATURE.md`
  - [ ] Contenido:
    - Cómo revertir la migración de base de datos
    - Cómo desplegar versión anterior del código
    - Qué hacer con datos de `approvedAt` si se revierte
    - Scripts de limpieza si es necesario

- [ ] **Preparar scripts de rollback**
  - [ ] Script SQL para eliminar campo (si es necesario):
    ```sql
    ALTER TABLE "Email" DROP COLUMN "approvedAt";
    DROP INDEX IF EXISTS "Email_approvedAt_idx";
    DROP INDEX IF EXISTS "Email_processedAt_approvedAt_idx";
    ```
  - [ ] Guardar en `prisma/rollback/remove_approved_at.sql`

#### Verificación Final

- [ ] **Checklist de completitud del feature**
  - [ ] ✅ Campo `approvedAt` existe en base de datos
  - [ ] ✅ Migración aplicada exitosamente
  - [ ] ✅ Server Actions funcionan correctamente
  - [ ] ✅ Validación de reglas de negocio implementada
  - [ ] ✅ Badge visual de aprobación aparece en todas las vistas
  - [ ] ✅ Botón de aprobar funciona en EmailDetailView
  - [ ] ✅ Filtro de aprobación funciona en EmailTable
  - [ ] ✅ Dashboard muestra métricas de aprobación
  - [ ] ✅ Kanban muestra badge de aprobación
  - [ ] ✅ Documentación técnica actualizada
  - [ ] ✅ Guía de usuario creada
  - [ ] ✅ Tests E2E ejecutados exitosamente
  - [ ] ✅ No hay regresiones en funcionalidad existente
  - [ ] ✅ Performance es aceptable
  - [ ] ✅ Accesibilidad verificada
  - [ ] ✅ Responsive design validado

- [ ] **Preparar para despliegue**
  - [ ] Ejecutar `npm run build` → debe compilar sin errores
  - [ ] Ejecutar `npm run lint` → debe pasar sin warnings críticos
  - [ ] Verificar que variables de entorno están configuradas
  - [ ] Confirmar que migración está lista para producción
  - [ ] Crear tag de versión en git: `git tag v2.1.0-approved-state`

### Dependencias

- **Internas:**
  - HITO 1 completado (Base de datos)
  - HITO 2 completado (Server Actions)
  - HITO 3 completado (UI/UX)
- **Externas:**
  - Todas las dependencias del sistema funcionando
  - Base de datos de producción accesible para migración

### Consideraciones

**Estrategia de Despliegue:**
- **Recomendado:** Despliegue en horario de bajo tráfico
- **Orden de despliegue:**
  1. Aplicar migración de base de datos (campo nullable, no rompe nada)
  2. Desplegar código backend (Server Actions)
  3. Desplegar código frontend (UI)
- **Verificación post-despliegue:**
  - Smoke test: aprobar un email de prueba
  - Verificar logs de servidor por errores
  - Monitorear métricas de performance

**Monitoreo:**
- Agregar logs de auditoría para operaciones de aprobación (quién aprobó qué y cuándo)
- Considerar métrica de "tasa de aprobación" (aprobados / procesados)

**Mejoras Futuras (Fuera del Alcance):**
- Botón de "Desaprobar" en la UI (actualmente solo se puede hacer vía Server Action)
- Historial de aprobaciones (múltiples aprobadores)
- Notificaciones cuando un email es aprobado
- Permisos: solo ciertos roles pueden aprobar
- Bulk approval: aprobar múltiples emails a la vez

---

## Resumen de Archivos Modificados

### Archivos Creados

1. `prisma/migrations/[timestamp]_add_approved_at_field/migration.sql` - Migración de base de datos
2. `doc/guia/FLUJO_APROBACION.md` - Guía de usuario
3. `doc/ROLLBACK_APROBACION_FEATURE.md` - Plan de rollback
4. `prisma/rollback/remove_approved_at.sql` - Script de rollback

### Archivos Modificados

#### Backend
1. [`prisma/schema.prisma`](prisma/schema.prisma) - Agregar campo `approvedAt` e índices
2. [`src/actions/emails.ts`](src/actions/emails.ts) - Nuevas Server Actions de aprobación
3. [`src/types/email.ts`](src/types/email.ts) - Agregar `approvedAt` a interfaces

#### Frontend
4. [`src/app/globals.css`](src/app/globals.css) - Badge de aprobación y variables CSS
5. [`src/components/emails/EmailTable.tsx`](src/components/emails/EmailTable.tsx) - Badge y filtro de aprobación
6. [`src/components/emails/EmailDetailView.tsx`](src/components/emails/EmailDetailView.tsx) - Botón de aprobar
7. [`src/components/kanban/TaskCard.tsx`](src/components/kanban/TaskCard.tsx) - Badge de aprobación en cards
8. [`src/app/(protected)/dashboard/page.tsx`](src/app/(protected)/dashboard/page.tsx) - Métricas de aprobación

#### Documentación
9. [`doc/SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md) - Documentación técnica actualizada
10. `CHANGELOG.md` - Registro de cambios de versión

---

## Criterios de Aceptación del Feature

El feature se considera completo cuando:

1. ✅ **Base de Datos:**
   - Campo `approvedAt` existe en la tabla Email
   - Índices optimizados están creados
   - Migración funciona sin errores

2. ✅ **Lógica de Negocio:**
   - Server Actions `approveEmail()`, `unapproveEmail()`, `getEmailsByApprovalStatus()` funcionan
   - Validación: solo emails con `processedAt != null` pueden aprobarse
   - Manejo de errores robusto implementado

3. ✅ **Interfaz de Usuario:**
   - Badge "Aprobado" visible en tabla de emails, detalle, y Kanban
   - Botón "Aprobar Email" funcional en vista de detalle
   - Filtro de aprobación funcional en EmailTable
   - Métricas de aprobación en Dashboard

4. ✅ **UX/Accesibilidad:**
   - Estados de loading claros durante aprobación
   - Mensajes de error descriptivos
   - Navegación por teclado funcional
   - ARIA labels implementados
   - Diseño responsive en móvil/tablet/desktop

5. ✅ **Documentación:**
   - Sistema Maestro actualizado
   - Guía de usuario creada
   - Plan de rollback documentado
   - CHANGELOG actualizado

6. ✅ **Testing:**
   - Tests E2E ejecutados exitosamente
   - No hay regresiones en funcionalidad existente
   - Performance aceptable (< 500ms para operaciones)

7. ✅ **Despliegue:**
   - Código compila sin errores (`npm run build`)
   - Linting pasa sin warnings críticos (`npm run lint`)
   - Listo para despliegue a producción

---

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Migración falla en producción | Baja | Alto | Probar migración en staging primero; hacer backup completo de BD |
| Performance degradada por índices adicionales | Baja | Medio | Índices son necesarios para consultas; monitorear performance post-deploy |
| Confusión de usuarios sobre cuándo aprobar | Media | Bajo | Incluir tooltips explicativos; crear guía de usuario clara |
| Emails aprobados sin procesamiento | Muy Baja | Alto | Validación server-side estricta; doble check en frontend |
| Inconsistencia de estado después de aprobación | Baja | Medio | Revalidación de caché agresiva; optimistic UI con rollback |

---

## Tiempo Estimado

**Total estimado:** 16-20 horas de desarrollo

- **HITO 1:** 3-4 horas (Schema, migración, tipos)
- **HITO 2:** 4-5 horas (Server Actions, validación, testing)
- **HITO 3:** 5-6 horas (UI completa, badges, botones, filtros)
- **HITO 4:** 4-5 horas (Integración, testing E2E, documentación)

**Tiempo de buffer:** +4 horas para imprevistos, revisiones, y ajustes de UX

---

## Conclusión

Este feature introduce el estado "Aprobado" como una capa adicional de validación humana sobre los resultados generados por IA, permitiendo a los usuarios revisar y confirmar que las clasificaciones automáticas son correctas antes de basar decisiones de negocio en ellas.

La implementación se realizará en 4 hitos secuenciales e independientes, cada uno desplegable por separado, siguiendo estrictamente el protocolo de planificación del sistema. El feature respeta completamente la arquitectura existente, utiliza los patrones establecidos (Smart Actions, tipos TypeScript, sistema de diseño), y se integra de manera natural con todos los componentes del sistema.

Al finalizar, el sistema tendrá un flujo de tres estados claro y bien diferenciado:  
**No procesado → Procesado por IA → Aprobado (opcional)**

---

**Última actualización:** 16 de Noviembre, 2025  
**Próxima revisión:** Post-implementación