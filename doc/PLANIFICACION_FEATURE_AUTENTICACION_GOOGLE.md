# Planificación de Desarrollo: Autenticación con Google (OAuth2)

**Fecha de creación:** 18 de Noviembre, 2025  
**Versión:** 1.0.0  
**Responsable:** Equipo de Desarrollo  
**Revisado por:** Sistema Maestro v3.0.1

---

## Feature/Fix: Autenticación con Google (OAuth2) para la Plataforma

### Información General

**Tipo:** Feature

El sistema actualmente utiliza un **login simulado** basado en un usuario mock definido en [`src/lib/mock-data/user.ts`](src/lib/mock-data/user.ts). Las rutas bajo `(protected)` no están realmente protegidas por sesión y las Server Actions no filtran ni validan usuario autenticado, tal como se describe en la sección 6 del Sistema Maestro [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md).

Este feature implementa **autenticación real con Google (OAuth2)** usando la librería `next-auth` (ya instalada según [`package.json`](package.json)), de manera que los usuarios puedan iniciar sesión con su cuenta de Google (Gmail o Workspace) y obtener una sesión segura en toda la aplicación.

El alcance de este feature se limita estrictamente a:

- Configurar NextAuth con Google como proveedor OAuth2.
- Proteger las rutas bajo `(protected)` utilizando sesión real.
- Integrar el flujo de login/logout en la UI existente (página de login y layout principal).
- Exponer en el frontend y en las Server Actions la identidad básica del usuario autenticado (al menos `email`, `name`, `image`).

**Fuera de alcance (solo contexto futuro, no se implementa en este feature):**

- Asociación de datos de negocio por usuario (campos `userId` en modelos Prisma como `Email`, `Task`, etc.).
- Sincronización de bandejas Gmail reales vía Gmail API.
- Definición de roles y permisos avanzados (admin, ejecutivo, supervisor).

### Objetivo

Reemplazar el login simulado por un sistema de **autenticación real con Google OAuth2** que:

- Permita a cualquier usuario autorizado iniciar sesión con su cuenta Google.
- Mantenga una sesión segura y accesible desde páginas, componentes y Server Actions.
- Restrinja el acceso a las rutas de negocio (`/emails`, `/kanban`, `/processing/review`, `/dashboard`, etc.) únicamente a usuarios autenticados.
- Prepare la base técnica para que, en features posteriores, se pueda filtrar información por usuario sin cambios disruptivos.

### Resultado final esperado

Al finalizar este feature:

- La página de login [`src/app/(auth)/login/page.tsx`](src/app/(auth)/login/page.tsx) mostrará un botón funcional “Iniciar sesión con Google” que inicia el flujo real de OAuth2.
- Las rutas bajo [`src/app/(protected)/`](src/app/(protected)/) solo serán accesibles si existe una sesión válida de NextAuth; en caso contrario, el usuario será redirigido a `/login`.
- El layout protegido [`src/app/(protected)/layout.tsx`](src/app/(protected)/layout.tsx) dispondrá de la información del usuario autenticado para mostrar, al menos, su nombre y avatar en el header (aunque sea de forma mínima).
- Existirá un mecanismo visible de “Cerrar sesión” que invalide la sesión y redirija a `/login`.
- La configuración de variables de entorno (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) estará documentada y probada en entorno local.

### Hitos del Proyecto

Este desarrollo se realizará en **3 hitos** secuenciales:

**HITO 1: Configuración base de NextAuth con Google**  
Configurar NextAuth y el proveedor de Google OAuth2, incluyendo variables de entorno, handler de autenticación y definición de tipos de sesión. Al finalizar, el flujo `/api/auth/*` funcionará correctamente en local y será posible iniciar/cerrar sesión, aunque aún sin integrar completamente la UI existente.

**HITO 2: Integración de sesión y protección de rutas `(protected)`**  
Integrar la sesión de NextAuth en el layout protegido y en las Server Actions críticas, de modo que todas las rutas bajo `(protected)` requieran usuario autenticado. Se definirá el comportamiento de redirección a `/login` para usuarios no autenticados.

**HITO 3: UX de login/logout y documentación completa**  
Actualizar la página de login para usar el botón real de Google, integrar el estado del usuario en el layout (header) y exponer el botón de cierre de sesión. Además, se actualizará la documentación del Sistema Maestro y se realizarán smoke tests end-to-end del flujo de autenticación.

---

## HITO 1: Configuración base de NextAuth con Google

### Objetivo del Hito

Configurar NextAuth en el proyecto con Google como proveedor OAuth2, dejando operativo el flujo de autenticación en entorno local (inicio y cierre de sesión), con tipos TypeScript básicos para la sesión y variables de entorno claramente documentadas.

### Entregables

- [ ] Handler de NextAuth creado bajo la ruta de API correspondiente.
- [ ] Configuración de NextAuth con proveedor de Google y callbacks mínimos (`jwt`, `session`).
- [ ] Tipos TypeScript básicos para el usuario de sesión (`SessionUser`) definidos y exportados.
- [ ] Variables de entorno requeridas (`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) documentadas y probadas en local.
- [ ] Flujo de `signIn`/`signOut` funcional mediante rutas estándar de NextAuth.

### Tareas

#### Backend – Configuración de NextAuth

- [ ] Verificar la versión instalada de `next-auth` en [`package.json`](package.json).
- [ ] Crear el handler de autenticación en una ruta de API compatible con App Router, por ejemplo:
  - [ ] Archivo [`src/app/api/auth/[...nextauth]/route.ts`](src/app/api/auth/[...nextauth]/route.ts) con la configuración recomendada para Next.js 16.
- [ ] Definir la configuración central de NextAuth en un módulo reutilizable, por ejemplo:
  - [ ] Archivo [`src/lib/auth-options.ts`](src/lib/auth-options.ts) con la exportación de las opciones de autenticación.
  - [ ] Incluir al menos:
    - [ ] Proveedor de Google con `clientId` y `clientSecret` leídos desde `process.env`.
    - [ ] Estrategia de sesión (JWT) acorde a la versión actual de NextAuth.
    - [ ] Callbacks `jwt` y `session` para propagar `email`, `name` e `image` al objeto de sesión.
- [ ] Asegurar manejo robusto de errores de configuración (ej.: variables de entorno faltantes) con logs claros en servidor.

#### Backend – Variables de entorno y seguridad

- [ ] Añadir las variables necesarias en `.env.example` con descripciones claras.
- [ ] Documentar en este mismo archivo de planificación el origen de cada valor:
  - [ ] `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: obtenidos desde la consola de Google Cloud (OAuth consent screen + credentials).
  - [ ] `NEXTAUTH_URL`: URL base de la app en desarrollo y producción.
  - [ ] `NEXTAUTH_SECRET`: cadena aleatoria segura generada con herramienta recomendada (por ejemplo, `openssl rand -base64 32`).
- [ ] Verificar que estas variables **no** se versionan en el repositorio.

#### Frontend – Helpers de sesión (base)

- [ ] Definir, si es necesario, un helper para obtener la sesión en Server Components (por ejemplo, un wrapper de `getServerSession` que consuma la configuración de NextAuth).
- [ ] Definir tipos para el objeto de sesión a utilizar en componentes cliente, referenciando el tipo `SessionUser` definido en la capa de tipos.

#### Testing

- [ ] Probar en entorno local el flujo básico:
  - [ ] Acceder a `/api/auth/signin` o flujo equivalente y verificar redirección a Google.
  - [ ] Completar login con una cuenta de prueba y confirmar que NextAuth crea la sesión (cookies y JWT según configuración).
  - [ ] Probar `/api/auth/signout` o mecanismo estándar de cierre de sesión.
- [ ] Revisar los logs del servidor para detectar errores de configuración o permisos de OAuth.

#### Actualización de documentación

- [ ] Añadir en la sección 10.2 “Integraciones Pendientes / En Uso” del Sistema Maestro [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md) que NextAuth ha pasado de “instalado sin configuración” a “configurado (flujo básico activo)”.

### Dependencias

- **Internas:**
  - Arquitectura App Router descrita en [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md).
  - Librería `next-auth` listada en [`package.json`](package.json).
- **Externas:**
  - Proyecto en Google Cloud con OAuth consent screen configurado y credenciales válidas.

### Consideraciones

- **Seguridad:**
  - No registrar en logs valores sensibles (`clientSecret`, `NEXTAUTH_SECRET`).
  - Usar scopes mínimos para este feature (`openid`, `email`, `profile`), sin solicitar acceso a Gmail ni otros servicios.
- **Escalabilidad futura:**
  - Diseñar la estructura de callbacks pensando en que en futuros features se integrará un `userId` de base de datos, pero **no** implementarlo aún.

---

## HITO 2: Integración de sesión y protección de rutas (protected)

### Objetivo del Hito

Integrar la sesión de NextAuth en el layout protegido y en las Server Actions críticas, de manera que todas las rutas bajo `(protected)` requieran usuario autenticado y que la lógica de backend valide la existencia de sesión antes de ejecutar operaciones importantes.

### Entregables

- [ ] Layout protegido actualizado para obtener sesión del usuario en servidor.
- [ ] Redirección server-side a `/login` cuando no exista sesión en rutas bajo `(protected)`.
- [ ] Helper server-side para obtener la sesión reutilizable en Server Actions.
- [ ] Server Actions críticas adaptadas para rechazar operaciones sin sesión (aunque todavía sin filtrar por `userId`).

### Tareas

#### Backend – Helpers de sesión y Server Actions

- [ ] Crear un helper server-side (por ejemplo, en [`src/lib/auth-session.ts`](src/lib/auth-session.ts)) que encapsule la obtención de la sesión de NextAuth.
- [ ] Revisar las Server Actions existentes:
  - [ ] [`src/actions/emails.ts`](src/actions/emails.ts).
  - [ ] [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts).
  - [ ] [`src/actions/kanban.ts`](src/actions/kanban.ts).
- [ ] Para cada acción que modifique estado (importación, procesamiento IA, actualización de tareas, etc.):
  - [ ] Invocar el helper de sesión al inicio de la acción.
  - [ ] Si no hay sesión, devolver un resultado estándar de error (`success: false`, `error: "UNAUTHENTICATED"`), evitando ejecutar lógica de negocio.
- [ ] Mantener las consultas de Prisma **sin** filtrar por `userId` (la asociación de datos por usuario es otro feature).

#### Frontend – Layout protegido

- [ ] Actualizar [`src/app/(protected)/layout.tsx`](src/app/(protected)/layout.tsx) para obtener la sesión en el servidor usando el helper de sesión.
- [ ] Si no existe sesión:
  - [ ] Realizar redirección server-side a `/login` usando mecanismos nativos de App Router.
- [ ] Si existe sesión:
  - [ ] Pasar la información del usuario (nombre, email, imagen) al layout de UI [`src/components/layout/index.tsx`](src/components/layout/index.tsx) mediante props o contexto.
- [ ] Verificar que todas las rutas bajo `(protected)` (`/emails`, `/emails/[id]`, `/kanban`, `/processing/review`, `/dashboard`) quedan efectivamente cubiertas por este layout.

#### Testing

- [ ] Pruebas manuales en entorno local:
  - [ ] Intentar acceder a `/emails` sin sesión y verificar redirección a `/login`.
  - [ ] Iniciar sesión con Google y verificar acceso a todas las rutas bajo `(protected)`.
  - [ ] Cerrar sesión y confirmar que las rutas protegidas vuelven a ser inaccesibles.
- [ ] Probar invocaciones a Server Actions desde la UI (importación de emails, procesamiento IA, cambio de estado en Kanban) y verificar que no se ejecutan si no hay sesión.

#### Actualización de documentación

- [ ] Actualizar la sección “6. Autenticación y Autorización” en [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md) para reflejar que:
  - [ ] La autenticación ya no es simulada, sino gestionada por NextAuth + Google.
  - [ ] Las rutas bajo `(protected)` requieren sesión válida.
  - [ ] Las Server Actions críticas validan la existencia de sesión antes de ejecutar operaciones.

### Dependencias

- **Internas:**
  - Hito 1 completado (NextAuth configurado y funcional).
  - Layout y rutas `(protected)` existentes según la estructura en [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md).
- **Externas:**
  - Ninguna adicional (solo continuidad del acceso a Google OAuth).

### Consideraciones

- **Seguridad:**
  - Asegurarse de que no existan rutas internas que dependan únicamente de validación en frontend para el acceso.
  - Cualquier lógica sensible (importar datos, procesar IA, modificar Kanban) debe requerir sesión en la capa de Server Actions.
- **Experiencia de usuario:**
  - Evitar bucles de redirección (por ejemplo, que `/login` intente cargar sesión y redirija de vuelta a `(protected)` sin control).

---

## HITO 3: UX de login/logout y documentación completa

### Objetivo del Hito

Conectar la configuración técnica de NextAuth con una experiencia de usuario clara y coherente en la UI: botón “Iniciar sesión con Google” en la página de login, indicador de usuario autenticado en el layout, acción de “Cerrar sesión”, y documentación actualizada del flujo de autenticación para desarrolladores.

### Entregables

- [ ] Página de login actualizada para usar el botón real de “Iniciar sesión con Google”.
- [ ] Header/layout mostrando información básica del usuario autenticado (nombre y/o avatar).
- [ ] Botón/acción de cierre de sesión accesible desde el layout.
- [ ] Documentación actualizada del flujo de autenticación en el Sistema Maestro y/o guía específica.
- [ ] Smoke tests end-to-end del flujo de autenticación documentados.

### Tareas

#### Frontend – Página de login

- [ ] Actualizar [`src/app/(auth)/login/page.tsx`](src/app/(auth)/login/page.tsx) para:
  - [ ] Reemplazar el login simulado por un botón “Iniciar sesión con Google” que invoque el flujo de `signIn` de NextAuth.
  - [ ] Mostrar mensajes claros sobre:
    - [ ] Qué se va a hacer al iniciar sesión (uso de cuenta Google).
    - [ ] Qué permisos se solicitan (solo perfil y email).
  - [ ] Mantener el estilo consistente con el sistema de diseño (`Button` en [`src/components/ui/button.tsx`](src/components/ui/button.tsx) y `globals.css` en [`src/app/globals.css`](src/app/globals.css)).
- [ ] Opcional: mostrar un mensaje cuando el usuario ya está autenticado (por ejemplo, ofrecer acceso directo a `/emails`).

#### Frontend – Layout y header

- [ ] Actualizar [`src/components/layout/index.tsx`](src/components/layout/index.tsx) para:
  - [ ] Recibir la información del usuario autenticado desde el layout `(protected)` (nombre, email, avatar).
  - [ ] Mostrar un pequeño bloque de usuario en el header (ej.: avatar + nombre).
  - [ ] Incluir un botón o menú desplegable con la opción “Cerrar sesión”.
- [ ] Conectar el botón de “Cerrar sesión” con el flujo de `signOut` de NextAuth:
  - [ ] Asegurar estados de loading apropiados al cerrar sesión.
  - [ ] Redirigir al usuario a `/login` tras completar el logout.

#### Testing – Smoke tests end-to-end

- [ ] Documentar and ejecutar el siguiente flujo end-to-end:
  - [ ] Usuario sin sesión abre `/login`.
  - [ ] Hace clic en “Iniciar sesión con Google” y completa el flujo OAuth2.
  - [ ] Es redirigido a una ruta protegida (por ejemplo, `/emails`).
  - [ ] Navega por las principales vistas protegidas (`/emails`, `/emails/[id]`, `/kanban`, `/processing/review`, `/dashboard`).
  - [ ] Cierra sesión desde el header.
  - [ ] Intenta acceder nuevamente a `/emails` y es redirigido a `/login`.
- [ ] Ejecutar `npm run build` para confirmar que no hay errores de tipos ni de configuración tras los cambios.

#### Actualización de documentación

- [ ] Actualizar en [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md):
  - [ ] Sección 6 “Autenticación y Autorización” con la descripción del flujo real de NextAuth + Google.
  - [ ] Sección 9 “Flujos de Datos y Procesos Clave” para reflejar que el paso 1 de “Autenticación” ya no es simulado.
  - [ ] Sección 10.2 “Integraciones Pendientes / En Uso” para marcar NextAuth como integración activa.
- [ ] (Opcional) Crear una guía corta en `doc/guia/` (por ejemplo, [`doc/guia/AUTENTICACION_GOOGLE.md`](doc/guia/AUTENTICACION_GOOGLE.md)) explicando para desarrolladores:
  - [ ] Cómo configurar las credenciales de Google en local.
  - [ ] Cómo funcionan `signIn` y `signOut` en la UI del proyecto.

### Dependencias

- **Internas:**
  - Hito 1 y Hito 2 completados (NextAuth configurado + rutas protegidas).
  - Sistema de diseño y layout general descritos en [`doc/SISTEMA_MAESTRO_PROYECTOV3.md`](doc/SISTEMA_MAESTRO_PROYECTOV3.md).
- **Externas:**
  - Variables de entorno de Google y NextAuth configuradas correctamente.

### Consideraciones

- **UX:**
  - Mensajes claros de lo que implica iniciar sesión con Google (sin mención a acceso a Gmail, ya que no se implementa en este feature).
  - Botón de cierre de sesión visible y accesible desde cualquier vista protegida.
- **Accesibilidad:**
  - El botón de “Iniciar sesión con Google” debe tener `aria-label` descriptivo.
  - El bloque de información de usuario en el header debe ser navegable por teclado.

---

## Supuestos, riesgos y criterios de completitud

### Supuestos

1. Existe un proyecto en Google Cloud con OAuth consent screen aprobado para el uso interno requerido.
2. Las credenciales de OAuth (cliente y secreto) están disponibles para el equipo de desarrollo y se pueden configurar en los entornos requeridos.
3. No se requiere en esta fase persistir usuarios en la base de datos propia; se utilizará el modelo por defecto de NextAuth basado en JWT.

### Riesgos

| Riesgo                                  | Probabilidad | Impacto | Mitigación                                                                 |
|-----------------------------------------|--------------|---------|----------------------------------------------------------------------------|
| Errores de configuración OAuth (redirect URIs, scopes) | Media        | Medio   | Validar cuidadosamente la configuración en Google Cloud y probar en local antes de desplegar. |
| Confusión de usuario al ver múltiples cuentas de Google | Media        | Bajo    | Mostrar en la UI el email actualmente autenticado y permitir logout sencillo. |
| Problemas con variables de entorno en producción       | Baja         | Alto    | Documentar detalladamente las variables y validar configuración en staging antes de producción. |

### Criterios de completitud del feature

El feature se considera completo cuando:

1. ✅ Un usuario puede iniciar sesión con su cuenta de Google y navegar por todas las rutas bajo `(protected)` sin errores.
2. ✅ Un usuario sin sesión que intente acceder a una ruta protegida es redirigido a `/login`.
3. ✅ El header/layout muestra información básica del usuario autenticado y permite cerrar sesión.
4. ✅ Las Server Actions críticas rechazan operaciones si no existe sesión.
5. ✅ La documentación del Sistema Maestro está actualizada para reflejar el nuevo flujo de autenticación.
6. ✅ `npm run build` se ejecuta sin errores y se han realizado smoke tests end-to-end del flujo de autenticación.