# Planificación de Desarrollo: Bandeja de Emails por Usuario (Gmail API)

**Fecha de creación:** 18 de Noviembre, 2025  
**Versión:** 1.0.0  
**Responsable:** Equipo de Desarrollo  
**Revisado por:** Sistema Maestro v3.x

---

## Feature/Fix: Bandeja de emails por usuario usando Gmail API

### Información General

**Tipo:** Feature

El sistema actualmente permite:

- Autenticación real con Google (NextAuth + OAuth2) para acceso a la plataforma, ya implementada en [`auth-options.ts`](src/lib/auth-options.ts:1) y [`route.ts`](src/app/api/auth/[...nextauth]/route.ts:1).
- Asociación de datos por usuario: cada `Email` y `Task` está ligado a un `userId` (modelo `User` definido en [`schema.prisma`](prisma/schema.prisma:1)), y todas las Server Actions filtran por usuario autenticado (emails, IA, Kanban).

Sin embargo, la ingesta de correos aún depende de:

- Importación manual vía JSON (drag & drop) según el flujo documentado en [`FEATURE2_PROCESAMIENTO_IA.md`](doc/FEATURE2_PROCESAMIENTO_IA.md:1) y el Sistema Maestro [`SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md:195).
- No existe todavía una **bandeja de emails por usuario conectada directamente a Gmail**, lo que obliga a pasos manuales, genera fricción y limita la actualización automática.

Este feature implementa una **integración de lectura con Gmail API** para que:

- Cada usuario (ya autenticado con Google en la app) pueda otorgar permisos adicionales para leer sus correos.
- El sistema importe automáticamente los **correos recientes (últimos 7 días)** de la bandeja Inbox de ese usuario.
- Los correos se almacenen en la tabla `Email`, asociados al `userId` correcto, sin duplicados.
- En cada nuevo inicio de sesión, el sistema traiga únicamente **correos nuevos** desde la última importación, evitando duplicidad y saturación.

**Alcance estricto de este feature:**

- Integración con **Gmail API** usando el scope de solo lectura `https://www.googleapis.com/auth/gmail.readonly`.
- Importación y actualización de **correos de la bandeja Inbox de cada usuario**, limitados a:
  - Últimos 7 días.
  - Solo nuevos mensajes desde la última importación (control mediante `idEmail` y marcas de sincronización).
- Solo **lectura** de correos; no se envían, borran ni modifican mensajes en Gmail.
- Trabaja exclusivamente con la cuenta Google usada para autenticarse en la app.

**Fuera de alcance (solo mencionados, no planificados aquí):**

- Integración con otros proveedores (Outlook, IMAP genérico, etc.).
- Sincronización en tiempo real mediante webhooks / PubSub de Gmail.
- Sincronización de etiquetas Gmail con el modelo `Tag` del sistema.
- Gestión de múltiples cuentas Gmail por un mismo usuario.

### Objetivo

Permitir que cada usuario pueda **conectar su bandeja de entrada de Gmail** a la plataforma, de modo que:

- El sistema importe **automáticamente** sus correos recientes (Inbox últimos 7 días).
- Los correos se almacenen en la BD (`Email`), asociados a su `userId`.
- En cada nuevo login (o acción explícita) se importen únicamente correos nuevos, sin duplicados.
- Toda la experiencia esté alineada con el flujo definido en [`TAREA_BANDEJA_USUARIO.md`](doc/TAREA_BANDEJA_USUARIO.md:1) y [`TAREA_BANDEJA DE EMAILS POR USUARIO`](doc/TAREA_BANDEJA%20DE%20EMAILS%20POR%20USUARIO:1).

### Resultado final esperado

Al finalizar el feature:

- Cada usuario autenticado con Google podrá **otorgar permiso adicional** a la app para leer su Gmail (scope `gmail.readonly`).
- El sistema será capaz de:
  - Consultar Gmail con la query `in:inbox newer_than:7d` para el usuario actual.
  - Obtener los `messageId` de los correos y, para cada uno, traer su detalle (remitente, asunto, fecha, cuerpo).
  - Transformar y validar estos datos (limpieza y Zod) y persistirlos en `Email` con `userId`, `idEmail = messageId`, `from`, `subject`, `body`, `receivedAt`.
  - Evitar duplicados comprobando `idEmail` por usuario.
- La vista `/emails` mostrará la bandeja construida a partir de los correos importados de Gmail del usuario actual.
- En cada nuevo inicio de sesión, la app:
  - Revisará únicamente los correos recientes (últimos 7 días).
  - Importará solo aquellos `messageId` que aún no estén en la BD para ese usuario.
- Existirá UI básica para:
  - Conectar / reconectar Gmail.
  - Ver el estado de la conexión.
  - Lanzar (o ver el estado de) la importación de correos recientes.

---

## Hitos del Proyecto

Este desarrollo se realizará en **3 hitos** secuenciales:

**HITO 1: Infraestructura de integración con Gmail API y almacenamiento de credenciales por usuario**  
Configurar el acceso a Gmail API a nivel de backend, definiendo modelos de BD para almacenar tokens de acceso/refresh por usuario, scopes concedidos y marca de última sincronización. Preparar un servicio reutilizable (`gmailService`) que gestione la autenticación hacia Gmail en nombre de un usuario.

**HITO 2: Importación de correos recientes (últimos 7 días) y persistencia en `Email` asociada a `userId`**  
Implementar la lógica de importación desde Gmail: listar `messageId` con la query `in:inbox newer_than:7d`, obtener detalles de cada mensaje, limpiar y validar los datos, mapearlos a la tabla `Email` (sin duplicados) y actualizar el estado de sincronización por usuario.

**HITO 3: UX de conexión Gmail por usuario, control de actualización y mensajes de privacidad**  
Integrar la importación Gmail con la UI: botones de conectar/reconectar, acciones de “Importar correos recientes”, feedback de carga, mensajes de estado (“no hay nuevos correos”, “debes reconectar tu cuenta”), y documentación en el Sistema Maestro.

---

## HITO 1: Infraestructura de integración con Gmail API y almacenamiento de credenciales por usuario

### Objetivo del Hito

Establecer la base técnica para poder llamar a Gmail API **en nombre de cada usuario**:

- Definir cómo se almacenan de forma segura los tokens de acceso/refresh y metadatos de Gmail por usuario.
- Configurar Google Cloud y las credenciales OAuth con el scope `gmail.readonly`.
- Crear un servicio backend tipado que se encargue de construir el cliente `googleapis` y refrescar tokens cuando sea necesario.

### Entregables

- [ ] Modelo(s) de BD para credenciales Gmail por usuario, definidos en [`schema.prisma`](prisma/schema.prisma:1).
- [ ] Migraciones Prisma creadas y aplicadas.
- [ ] Servicio `gmailService` implementado en [`gmail.ts`](src/services/gmail.ts) con:
  - [ ] Inicialización de cliente Gmail (`googleapis`).
  - [ ] Gestión de tokens de acceso/refresh.
- [ ] Variables de entorno documentadas para credenciales Gmail y scopes.
- [ ] Documentación básica del flujo de autorización Gmail en el Sistema Maestro.

### Tareas

#### Backend – Modelado y BD

- [ ] Definir modelo `GmailAccount` (nombre sugerido) en [`schema.prisma`](prisma/schema.prisma:1):

  - [ ] Campos propuestos:
    - `id: String @id @default(cuid())`
    - `userId: String` (`@unique` o relación 1:1 con `User` dependiendo si se soporta una sola cuenta Gmail por usuario).
    - `accessToken: String`
    - `refreshToken: String`
    - `scope: String` (scope concedido, ej. `https://www.googleapis.com/auth/gmail.readonly`).
    - `tokenType: String` (ej. `Bearer`).
    - `expiryDate: DateTime` (fecha/hora estimada de expiración del access_token).
    - `lastSyncAt: DateTime?` (última sincronización realizada).
    - `createdAt: DateTime @default(now())`
    - `updatedAt: DateTime @updatedAt`
  - [ ] Relación con `User`:
    - `user   User @relation(fields: [userId], references: [id], onDelete: Cascade)`.
  - [ ] Índice: `@@index([userId])`.

- [ ] Crear y aplicar migración Prisma:

  - [ ] `npx prisma migrate dev --name add_gmail_account_per_user`.
  - [ ] Verificar en BD que la tabla se creó correctamente.

#### Backend – Configuración OAuth y entorno

- [ ] Confirmar configuración actual en Google Cloud:
  - [ ] Asegurar que el proyecto de OAuth (usado para NextAuth) permite el scope `https://www.googleapis.com/auth/gmail.readonly`.
  - [ ] Registrar en la documentación interna que este scope se añade, y que los usuarios podrían ver un nuevo consentimiento.
- [ ] Variables de entorno (si se decide separar credenciales de Gmail del login):
  - [ ] Documentar si se reutilizan `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` o si se crean específicos como `GMAIL_CLIENT_ID` / `GMAIL_CLIENT_SECRET`.
  - [ ] Añadir referencias en `.env.example`.

#### Backend – Servicio Gmail (`gmailService`)

Crear [`gmail.ts`](src/services/gmail.ts:1) con responsabilidades:

- [ ] Función `createGmailClientForUser(userId: string)`:
  - [ ] Usar `requireCurrentUserId` o equivalente para validar usuario actual (si no se pasa explícito).
  - [ ] Leer `GmailAccount` del usuario.
  - [ ] Construir cliente de Gmail con `googleapis.gmail({ version: "v1", auth })`.
  - [ ] Refrescar token cuando `expiryDate` esté cerca/pasada, usando `refreshToken`.
  - [ ] Actualizar `GmailAccount` con nuevos tokens/expiryDate.

- [ ] Tipos TypeScript para encapsular resultados y errores:
  - [ ] `GmailClientResult { success: boolean; client?: gmail_v1.Gmail; error?: string; }`.

#### Testing

- [ ] Crear pruebas manuales pequeñas con un usuario interno:
  - [ ] Confirmar que, tras el flujo de autorización, se crea un registro válido en `GmailAccount`.
  - [ ] Confirmar que `createGmailClientForUser` genera un cliente Gmail operativo.

### Dependencias

- **Internas:**
  - Modelo `User` y autenticación Google ya operativa.
  - Asociación de datos por usuario (`userId` en `Email` y `Task`).
- **Externas:**
  - Google Cloud Console (OAuth consent screen configurado y credenciales válidas).
  - Librería [`googleapis`](package.json:20) ya instalada.

### Consideraciones

- **Seguridad:**
  - En futuras implementaciones, considerar cifrado de `accessToken`/`refreshToken` en repositorio de secretos o KMS (fuera de alcance para este feature).
  - Nunca registrar tokens en logs.
- **Scopes:**
  - Scope mínimo: `gmail.readonly`.
  - No solicitar scopes como `gmail.modify` o `gmail.send` en este feature.

---

## HITO 2: Importación de correos recientes (últimos 7 días) y persistencia en `Email` asociada a `userId`

### Objetivo del Hito

Implementar el flujo de **importación de bandeja Gmail por usuario**:

- Consultar la bandeja Inbox del usuario con la query `in:inbox newer_than:7d`.
- Traer los detalles de cada mensaje (From, Subject, fecha, cuerpo).
- Limpiar y validar los datos.
- Persistir los correos como registros `Email`, asociados a `userId`, **sin duplicados** (control por `idEmail = messageId`).

### Entregables

- [ ] Función de importación backend (Server Action o servicio) para importar correos de Gmail de un usuario.
- [ ] Mapeo y limpieza de datos Gmail → `Email` conforme a [`TAREA_BANDEJA_USUARIO.md`](doc/TAREA_BANDEJA_USUARIO.md:20).
- [ ] Validación con Zod de la estructura mínima antes de persistir.
- [ ] Control de duplicidad basado en `idEmail` por usuario.
- [ ] Actualización de `lastSyncAt` en `GmailAccount` tras importación exitosa.

### Tareas

#### Backend – Servicio de importación

- [ ] Crear un servicio de dominio (por ejemplo, en [`src/services/gmail.ts`](src/services/gmail.ts:1) o en un nuevo módulo dedicado) con funciones:

  - [ ] `listRecentMessageIds(userId: string): Promise<string[]>`:
    - [ ] Usar `createGmailClientForUser`.
    - [ ] Llamar a `users.messages.list` con:
      - `q = "in:inbox newer_than:7d"`.
      - Limitar el número de resultados (ej. máximo 100) para MVP.
    - [ ] Devolver solo la lista de `message.id`.

  - [ ] `getMessageDetail(userId: string, messageId: string)`:
    - [ ] Llamar a `users.messages.get` con `format = "full"`.
    - [ ] Extraer de `payload.headers`:
      - `From`
      - `Subject`
      - `Date`
    - [ ] Extraer el cuerpo de texto principal (multipart: preferir `text/plain`, fallback a `text/html` con limpieza básica).

  - [ ] `mapGmailMessageToEmailInput(...)`:
    - [ ] Crear una estructura intermedia con:
      - `idEmail` = `message.id`
      - `from`
      - `subject`
      - `body`
      - `receivedAt` = `Date` derivado de `internalDate` o header `Date`.

- [ ] Validación y limpieza (`data cleaning`):

  - [ ] Definir un schema Zod específico para el payload resultante:
    - [ ] Campos obligatorios: `idEmail`, `from`, `subject`, `body`, `receivedAt`.
    - [ ] Normalizar `from` para extraer la dirección email (ej. `"Nombre <correo@ejemplo.com>"` → `"correo@ejemplo.com"`).
  - [ ] Descartar mensajes que:
    - [ ] No tengan remitente o asunto válido.
    - [ ] Tengan datos mínimos corruptos.

- [ ] Persistencia en `Email`:

  - [ ] Para cada mensaje validado:
    - [ ] Verificar si ya existe `Email` con `userId` actual y `idEmail = message.id`.
      - [ ] Si existe, **no crear duplicado**.
      - [ ] Si no existe, crear:
        - `Email.idEmail = message.id`
        - `Email.userId = userId`
        - `from`, `subject`, `body`, `receivedAt`, `createdAt = now()`, `processedAt = null`, `approvedAt = null`.
  - [ ] Actualizar `lastSyncAt` en `GmailAccount` al terminar:
    - [ ] `lastSyncAt = now()`.

- [ ] Exponer Server Action de alto nivel, por ejemplo en [`emails.ts`](src/actions/emails.ts:1) o en un nuevo archivo `gmail.ts` bajo `src/actions/`:
  - [ ] `importGmailInboxForCurrentUser(): Promise<{ success: boolean; imported: number; errors: string[]; }>`:
    - [ ] Obtiene `userId` actual.
    - [ ] Verifica que el usuario tiene `GmailAccount` configurado.
    - [ ] Llama a las funciones internas de listado y detalle.
    - [ ] Guarda los correos nuevos.
    - [ ] Devuelve un resumen (importados / descartados / errores).

#### Testing

- [ ] Pruebas manuales con una cuenta de Gmail de prueba:
  - [ ] Asegurar que se importan únicamente correos de los últimos 7 días.
  - [ ] Correr la importación dos veces seguidas y verificar:
    - [ ] No se crean duplicados (mismo `idEmail`).
  - [ ] Verificar que los correos aparecen correctamente en `/emails`.

- [ ] Casos de error:
  - [ ] Token expirado o revocado:
    - [ ] El servicio debe devolver un error claro: “Debes reconectar tu cuenta Gmail”.
  - [ ] Errores de cuota o API Gmail:
    - [ ] Mensaje genérico “Error al conectar con Gmail, intenta más tarde”.

### Dependencias

- **Internas:**
  - HITO 1 completo (modelo `GmailAccount`, servicio `createGmailClientForUser`).
  - Modelo `Email` y asociación por `userId` ya implementados.
- **Externas:**
  - Gmail API habilitada en Google Cloud.
  - Librería [`googleapis`](package.json:20).

### Consideraciones

- **Performance y límites:**
  - No traer demasiados mensajes en un solo batch (ej. cap de 100).
  - Limitar el tamaño de cuerpo (`body`) si es muy grande (ej. truncar a cierto tamaño para evitar registros excesivos).
- **Integridad:**
  - `idEmail` ya es único en `Email`; se usará para asegurar que un mismo `messageId` no se inserte dos veces para ese usuario.
- **Evolución futura (fuera de alcance):**
  - Uso de `historyId` de Gmail para sincronización incremental más eficiente.
  - Soporte de etiquetas Gmail → `Tag`.

---

## HITO 3: UX de conexión Gmail por usuario, control de actualización y mensajes de privacidad

### Objetivo del Hito

Ofrecer al usuario una experiencia clara y controlada para:

- Conectar y reconectar su bandeja Gmail.
- Disparar (o ver el estado de) la importación de correos recientes.
- Entender qué está haciendo la plataforma con sus correos (solo lectura y análisis interno).

### Entregables

- [ ] Componentes de UI para:
  - [ ] Botón “Conectar mi Gmail” y estados de conexión.
  - [ ] Botón o acción “Importar correos recientes” (si no se hace automáticamente al login).
  - [ ] Mensajes de estado (cargando, sin nuevos correos, error de permisos).
- [ ] Integración de estos componentes en:
  - [ ] Página `/emails` y/o header principal [`index.tsx`](src/components/layout/index.tsx:1).
- [ ] Documentación actualizada en:
  - [ ] Sección 10 “Integraciones Externas” de [`SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md:759).
  - [ ] Sección 9 “Flujos de Datos” para reflejar el nuevo flujo Gmail → Email.

### Tareas

#### Frontend – Conexión y estados

- [ ] Agregar un componente UI, por ejemplo `GmailConnectionStatus`, ubicado en [`src/components/emails/`](src/components/emails/EmailTable.tsx:1) o en layout/header:

  - [ ] Estados:
    - [ ] “Gmail no conectado”: mostrar botón “Conectar mi Gmail”.
    - [ ] “Gmail conectado”: mostrar fecha de última sincronización (`lastSyncAt`) y botón “Importar correos recientes”.
    - [ ] “Error de permisos”: mostrar mensaje y botón “Reconectar mi Gmail”.

  - [ ] Este componente consumirá una Server Action tipo `getGmailConnectionStatusForCurrentUser()` que devuelva:
    - `connected: boolean`
    - `lastSyncAt?: Date | null`
    - `error?: string`

- [ ] Crear UI para disparar la importación:
  - [ ] Botón “Importar correos recientes” que llame a `importGmailInboxForCurrentUser()`.
  - [ ] Mostrar indicador de loading mientras se ejecuta.
  - [ ] Mostrar resumen al finalizar:
    - “Se importaron X correos nuevos. Última actualización: <fecha>.”
    - O “No hay nuevos correos en los últimos días.”

- [ ] Mensajes alineados con [`TAREA_BANDEJA_USUARIO.md`](doc/TAREA_BANDEJA_USUARIO.md:72):
  - “No tienes nuevos correos en los últimos días.”
  - “Actualizando tu bandeja de entrada, por favor espera unos segundos…”
  - “Debes reconectar tu cuenta Google para seguir actualizando tus correos.”

#### Frontend – Flujo general

- [ ] Decidir y documentar comportamiento en login:
  - [ ] Opción A (MVP claro): el usuario tiene que pulsar “Importar correos recientes” manualmente.
  - [ ] Opción B (semi-automático): al entrar a `/emails` si hace X tiempo desde `lastSyncAt` (p.ej. > 1 hora), ofrecer un banner “¿Quieres actualizar tus correos?” con botón.

(El documento puede dejar esta decisión en manos de producto, pero debe contemplar ambos caminos).

#### Testing

- [ ] Probar el ciclo completo con usuario real:
  - [ ] Iniciar sesión, conectar Gmail, ver mensaje de importación inicial.
  - [ ] Confirmar que `/emails` se llena con correos de los últimos 7 días.
  - [ ] Cerrar sesión, volver a entrar y verificar que:
    - [ ] Solo se importan correos nuevos (sin duplicados).
    - [ ] Los textos de estado son correctos.

- [ ] Casos de revocación:
  - [ ] Revocar permisos desde la consola de cuenta Google.
  - [ ] Simular intento de importación y verificar que la UI muestra “Debes reconectar tu cuenta Google”.

#### Documentación

- [ ] Actualizar [`SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md:759):
  - [ ] Sección 10.2 Integraciones en uso:
    - Marcar Gmail API como integración activa con lectura de Inbox por usuario.
  - [ ] Sección 9 Flujos de Datos:
    - Incorporar un subapartado “Flujo de Importación Gmail por Usuario”:
      - `Gmail (Inbox) → Gmail API → gmailService → Email (BD) → EmailTable/IA/Kanban`.
  - [ ] Sección 6 Autenticación y Autorización:
    - Aclarar que además del login, se gestionan scopes adicionales para Gmail readonly por usuario.

### Dependencias

- **Internas:**
  - Hitos 1 y 2 completados (credenciales Gmail por usuario + importación funcional).
- **Externas:**
  - Usuarios de prueba con cuentas Gmail para validar la UX real.

### Consideraciones

- **Privacidad:**
  - La UI debe dejar explícito que:
    - Solo se leen correos para mostrar y analizarlos dentro de la plataforma.
    - No se envían correos ni se modifican mensajes en Gmail.
  - Cada usuario ve únicamente sus propios correos, gracias a `userId` y scoping ya implementado.

- **Futuras extensiones (fuera de alcance):**
  - Activar procesamiento IA automático inmediatamente después de la importación Gmail.
  - Mapear etiquetas Gmail a `Tag` para enriquecer la categorización.
  - Sincronización incremental basada en `historyId` y webhooks, en lugar de `newer_than:7d`.

---

## Supuestos, riesgos y criterios de completitud

### Supuestos

1. La autenticación con Google (NextAuth) y la asociación de datos por usuario (`userId`) ya están implementadas y probadas.
2. Se puede ampliar el scope del proveedor Google actual para incluir `gmail.readonly` sin romper los usuarios existentes (gestionando el nuevo consentimiento).
3. El volumen de correos por usuario en la ventana de 7 días es manejable para un MVP (no miles de mensajes diarios por usuario).

### Riesgos

| Riesgo                                                         | Probabilidad | Impacto | Mitigación                                                                 |
|----------------------------------------------------------------|--------------|---------|----------------------------------------------------------------------------|
| Errores de configuración en Google Cloud (redirect URIs, scopes) | Media        | Medio   | Validar cuidadosamente en entorno de prueba antes de ir a producción.     |
| Exceso de volumen de correos (7 días con demasiados mensajes)  | Media        | Medio   | Limitar hard cap de mensajes por importación (ej. 100) en Hito 2.         |
| Revocación de tokens y errores 401/403 de Gmail                | Media        | Medio   | Manejo explícito de errores y mensajes de “reconectar Gmail” en la UI.    |
| Confusión del usuario sobre qué datos se leen de Gmail         | Media        | Alto    | Mensajes de privacidad claros y documentación en la UI.                   |

### Criterios de completitud del feature

El feature se considera completo cuando:

1. ✅ Existe un modelo de BD (`GmailAccount`) que almacena de forma estable los tokens y estado de sincronización de Gmail por usuario.
2. ✅ El sistema puede, para un usuario autenticado:
   - Conectarse a su Gmail con scope `gmail.readonly`.
   - Listar y obtener detalles de mensajes `in:inbox newer_than:7d`.
3. ✅ Los correos se importan a la tabla `Email` con:
   - `idEmail` = `messageId` de Gmail.
   - `userId` = usuario autenticado.
   - Sin duplicados, controlados por `idEmail` por usuario.
4. ✅ `/emails` muestra los correos importados de Gmail para cada usuario, manteniendo el aislamiento por `userId`.
5. ✅ La UI ofrece acciones claras para conectar (y reconectar) Gmail y para importar correos recientes, mostrando estados de carga y mensajes de error entendibles.
6. ✅ La documentación del Sistema Maestro refleja:
   - La nueva integración con Gmail.
   - El flujo de datos desde Gmail hasta la bandeja por usuario.
   - Las limitaciones y consideraciones de seguridad.
7. ✅ `npm run build` pasa sin errores tras integrar este feature y se han realizado al menos smoke tests multiusuario con Gmail real.
