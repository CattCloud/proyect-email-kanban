# Email-to-Kanban

## Propósito del Proyecto

El Sistema de Gestión Inteligente de Emails busca convertir una bandeja de entrada caótica en un flujo de trabajo estructurado:

- Centraliza emails de negocio en una base de datos real (PostgreSQL).
- Automatiza la clasificación y extracción de tareas con IA (OpenAI).
- Visualiza las tareas resultantes en un tablero Kanban por estados y contactos.
- Permite revisión humana de la metadata IA (aceptar/rechazar), con trazabilidad del procesamiento.


## Problema

Ejecutivos comerciales y equipos de operaciones pierden oportunidades de negocio porque:

- Reciben entre 50 y 100 correos diarios mezclando:
  - Solicitudes de clientes importantes.
  - Leads nuevos.
  - Comunicaciones internas.
  - Correos irrelevantes o spam.
- Clasificar manualmente esos correos consume entre 1 y 2 horas diarias:
  - Revisar asunto y cuerpo.
  - Decidir si hay una tarea implícita.
  - Recordar qué hacer y cuándo.
- Las tareas que vienen “escondidas” en los correos se olvidan o pierden prioridad:
  - No hay un lugar único donde ver todas las tareas.
  - Es difícil saber qué está “Por hacer”, qué está “En progreso” y qué está “Completado”.
- No existe visibilidad clara de:
  - Qué es urgente vs. informativo.
  - Qué está bloqueado vs. qué avanza.

**Impacto:**

- Oportunidades de negocio perdidas.
- Clientes insatisfechos (respuestas tardías o inexistentes).
- Caos operativo y baja trazabilidad del trabajo realizado desde el email.

---

## Solución Propuesta

Un sistema web que:

1. **Centraliza los correos en una bandeja única por usuario**  
   - Importa correos desde:
     - Archivos JSON con histórico de correos.
     - La bandeja de entrada de Gmail del usuario, usando autenticación con Google.
   - Filtra automáticamente correos no procesables (vacíos, solo links, HTML sin texto, promociones, social, updates) para que la bandeja se enfoque en correos de negocio.

2. **Procesa correos con IA para extraer metadata y tareas accionables**  
   - Clasifica cada correo (cliente / lead / interno / spam).
   - Asigna prioridad (alta / media / baja).
   - Detecta si hay tareas asociadas, con descripción, fecha y participantes.
   - Genera un resumen legible y el nombre de contacto principal.

3. **Permite revisar los resultados de IA antes de publicarlos**  
   - Pantalla de Revisión IA donde el usuario:
     - Ve, por correo, la metadata propuesta por IA y las tareas sugeridas.
     - Acepta o rechaza resultados.
     - En caso de rechazo, se guarda un snapshot del análisis y el motivo.

4. **Convierte las tareas aprobadas en un tablero Kanban real**  
   - Tablero por usuario con columnas “Por hacer”, “En progreso” y “Completado”.
   - Cada tarjeta representa una tarea extraída de un correo, con:
     - Asunto, prioridad, remitente.
     - Estado y tags.
   - Cambiar de columna actualiza el estado de la tarea y la metadata asociada.

5. **Ofrece acceso seguro y multiusuario basado en Google**  
   - Login real con Google OAuth (NextAuth).
   - Cada usuario:
     - Ve solo sus correos.
     - Procesa solo sus tareas.
     - Conecta su propia cuenta de Gmail para importar correos recientes.

**Feature diferenciador / valor agregado:**

- Integra **todo el flujo de trabajo email → IA → revisión → Kanban** en una sola herramienta:
  - Importación desde Gmail y JSON.
  - Filtrado inteligente de correos no procesables.
  - Procesamiento batch con IA y validación con Zod.
  - Revisión humana con opción de rechazo y trazabilidad.
  - Tablero Kanban accionable integrado con los correos originales.
- La experiencia está diseñada para ejecutivos:
  - En 5–8 minutos se puede revisar y organizar decenas de correos en tareas claras.

---

## MVP: Procesamiento batch manual con JSON + IA + visualización Kanban (versión actual)

El estado actual del proyecto implementa un **MVP funcional** con:

- **Frontend**: aplicación web con Next.js (App Router), React y TypeScript.
- **Backend**: Server Actions sobre Next.js, base de datos PostgreSQL con Prisma.
- **Autenticación**: NextAuth con Google OAuth2 (inicio de sesión real).
- **Fuentes de correos**:
  - Importación **manual desde JSON** con un formato predefinido.
  - Importación **manual desde Gmail**:
    - Conexión de cuenta Gmail por usuario.
    - Importación de correos de los últimos 7 días desde `INBOX`, excluyendo Promotions/Social/Updates.
    - Filtrado de correos no procesables mediante heurísticas sobre el cuerpo del mensaje.
- **Procesamiento con IA (OpenAI)**:
  - Procesamiento batch de hasta 10 correos por lote.
  - Clasificación por categoría y prioridad.
  - Detección y creación de tareas estructuradas.
  - Generación de resumen y contacto principal.
- **Pantalla de Revisión IA**:
  - Lista de correos procesados por IA y no aprobados.
  - Para cada correo:
    - Se ve el contenido original.
    - Metadata IA (categoría, prioridad, resumen, contacto).
    - Tareas sugeridas.
  - El usuario puede:
    - Confirmar resultados (publicar en el sistema).
    - Rechazar resultados (guardando snapshot y motivo, el correo vuelve a “sin procesar”).
  - Los correos que ya tengan tareas en “En progreso” o “Completado” en el Kanban dejan de aparecer aquí (aunque el email no esté formalmente “aprobado”).
- **Tablero Kanban**:
  - Tareas agrupadas en columnas: “Por hacer”, “En progreso” y “Completado”.
  - Vista filtrable por contacto y estado.
  - Cambiar el estado de la tarjeta actualiza también la metadata del correo en la base de datos.
- **Dashboard básico**:
  - Métricas agregadas:
    - Conteo de correos por categoría.
    - Conteo de correos por prioridad.
    - Remitente más frecuente.
  - Vista rápida del estado general de la bandeja.

### Ejemplo de comandos útiles

Instalación e inicio en desarrollo:

```bash
npm install
npm run dev
```

Ejecutar el seed de la base de datos (datos de ejemplo):

```bash
npm run db:seed
```

---

## Versión futura: Integraciones y automatización

A partir del MVP actual, la evolución natural incluye:

- **Procesamiento automático continuo de Gmail**:
  - Polling o webhooks para procesar correos sin interacción manual.
  - Reprocesamiento inteligente basado en feedback (rechazos IA).
- **Notificaciones y recordatorios**:
  - Alertas cuando nuevas tareas críticas aparecen.
  - Recordatorios de tareas próximas a vencer.
- **Mejoras en Kanban**:
  - Drag & drop nativo completo para mover tareas entre columnas.
  - Vistas adicionales (por proyecto, por cliente).
- **Colaboración en equipo**:
  - Varios usuarios compartiendo tableros.
  - Roles, permisos y workspaces.

Estas funcionalidades están fuera del MVP actual, pero el diseño de la base de datos y de las Server Actions ya considera su futura incorporación.

---

## Historias de Usuario Core

### US-01: Importar y visualizar emails

**Como** ejecutivo comercial  
**Quiero** importar mis emails desde JSON y verlos organizados en una tabla  
**Para** tener mi bandeja centralizada y accesible

**Criterios de aceptación:**

- Puedo importar un archivo JSON que cumpla el formato esperado.
- Tras la importación:
  - Veo una tabla de correos con:
    - Remitente.
    - Asunto.
    - Fecha de recepción.
    - Estado de procesamiento (sin procesar / procesado / aprobado).
  - Puedo:
    - Buscar por remitente o asunto.
    - Ordenar por fecha.
    - Navegar por páginas si hay muchos correos.
- Al hacer clic en una fila:
  - Accedo a una vista de detalle donde veo el cuerpo completo del email y (si existe) su metadata IA.

Adicionalmente, por usuario:

- Puedo importar correos desde mi Gmail (últimos 7 días) con el botón “Importar correos recientes”.
- Solo se muestran en la tabla:
  - Correos procesables (con contenido de texto suficiente).
  - Correos pertenecientes a mi cuenta (multiusuario).

---

### US-02: Procesar emails con IA

**Como** usuario  
**Quiero** seleccionar emails y procesarlos automáticamente con IA  
**Para** obtener categorización y detección de tareas sin trabajo manual

**Criterios de aceptación:**

- En la tabla de correos:
  - Puedo seleccionar varios correos mediante checkboxes (hasta 10 por lote).
  - Puedo lanzar el procesamiento IA mediante el botón “Procesar con IA”.
- El procesamiento IA, para cada email:
  - Clasifica por categoría:
    - Cliente: solicitud/consulta de cliente existente.
    - Lead: prospecto nuevo interesado.
    - Interno: comunicación del equipo.
    - Spam: sin valor comercial.
  - Asigna prioridad:
    - Alta / media / baja.
  - Indica si hay tarea asociada (sí/no) y su descripción.
  - Puede generar tareas detalladas:
    - Descripción.
    - Fecha objetivo.
    - Participantes.
    - Tags.
- El procesamiento batch:
  - Permite hasta 10 correos por ejecución.
  - Muestra un estado de progreso (porcentaje y pasos).
  - Informa errores por correo (si alguno falla, el resto sigue).
- La metadata generada se ve:
  - En la vista de detalle del email.
  - En la pantalla de Revisión IA.
  - En el tablero Kanban (para las tareas aceptadas).

---

### US-03: Visualizar tareas en Kanban

**Como** usuario  
**Quiero** ver todas mis tareas en un tablero Kanban  
**Para** tener claridad visual de pendientes y su progreso

**Criterios de aceptación:**

- Existe un tablero Kanban por usuario con 3 columnas:
  - Por hacer.
  - En progreso.
  - Completado.
- Solo aparecen en el tablero:
  - Tareas derivadas de correos procesados por IA y aceptados (no se muestran correos sin tareas).
- Cada tarjeta en el Kanban muestra como mínimo:
  - Asunto del correo.
  - Prioridad (badge visual).
  - Remitente o contacto asociado.
- Puedo cambiar el estado de una tarea:
  - Desde la propia tarjeta (por UI específica).
  - El cambio se refleja inmediatamente en el tablero y en la metadata del email.
- Al hacer clic en una tarjeta:
  - Se puede navegar al contexto completo del email (detalle con cuerpo y metadata).

---

### US-04: Acceso seguro y privado

**Como** usuario  
**Quiero** login con Google y ver solo mis datos  
**Para** mantener privacidad y seguridad

**Criterios de aceptación:**

- Autenticación basada en Google OAuth:
  - Puedo iniciar sesión con mi cuenta de Google.
  - Si no estoy autenticado, no puedo acceder a las rutas protegidas (bandeja, Kanban, Revisión IA, dashboard).
- Multiusuario:
  - Cada usuario ve únicamente:
    - Sus correos.
    - Sus tareas.
    - Su tablero Kanban.
  - No existe forma de acceder a datos de otros usuarios desde la UI.
- Integración con Gmail:
  - Cada usuario puede conectar su propia cuenta Gmail.
  - La importación de correos se hace por usuario autenticado.

---

## User Journey

Un flujo típico para un ejecutivo trabajando con el sistema hoy es:

1. **Login con Google**  
   - Accede a la aplicación y se autentica con su cuenta de Google.
   - Queda redirigido a la bandeja de emails.

2. **Importar correos**  
   - Opción A (histórico / pruebas): importar un JSON con correos.  
   - Opción B (operación diaria): usar “Importar correos recientes” desde Gmail:
     - El sistema:
       - Conecta con Gmail.
       - Trae correos de los últimos 7 días desde `INBOX`.
       - Filtra categorías Promotions/Social/Updates.
       - Marca correos no procesables y los oculta de la bandeja.
   - Ve en `/emails` solo los correos de negocio relevantes.

3. **Seleccionar y procesar con IA**  
   - Selecciona, por ejemplo, 15 correos, en lotes de hasta 10.
   - Lanza el procesamiento IA:
     - El sistema clasifica, prioriza y extrae tareas.
     - Muestra progreso y resultados por correo.

4. **Revisar categorización y tareas detectadas**  
   - En la pantalla de Revisión IA:
     - Ve los correos procesados que aún no están aprobados ni avanzados en Kanban.
     - Revisa categoría, prioridad, resumen, contacto, tareas.
     - Acepta o rechaza los resultados IA.

5. **Trabajar en el Kanban**  
   - Va al tablero Kanban:
     - Ve las tareas creadas a partir de los correos aprobados (y algunos procesados según la lógica actual).
     - Organiza las tareas:
       - Mueve de “Por hacer” a “En progreso” y luego a “Completado”.
   - Al mover tareas a “En progreso” o “Completado”:
     - Los correos asociados dejan de aparecer en la Revisión IA, evitando ruido.

6. **Consultar contexto cuando sea necesario**  
   - Desde tarjetas o la bandeja de emails, puede abrir el detalle del correo para:
     - Ver el cuerpo completo.
     - Revisar la metadata IA.
     - Confirmar el contexto antes de actuar.

Tiempo estimado para organizar ~20 correos en tareas claras: **5–8 minutos**, dependiendo de la complejidad de los correos.

---

## Formato JSON Esperado

La importación manual de correos desde archivo JSON espera una lista de objetos con el siguiente formato mínimo:

```json
[
  {
    "id": "email-001",
    "email": "cliente@empresa.com",
    "received_at": "2024-11-01T09:15:00Z",
    "subject": "Reunión urgente - Propuesta Q4",
    "body": "Necesito que revisemos la propuesta..."
  }
]
```

- `id`: identificador único del correo en el JSON (se usa como `idEmail` interno).
- `email`: remitente del correo.
- `received_at`: fecha y hora de recepción.
- `subject`: asunto.
- `body`: cuerpo completo del mensaje.

El sistema valida la estructura y los tipos de datos antes de insertarlos en la base de datos.

---

## Out of Scope (MVP)

Aunque el sistema actual ya es funcional y cubre el flujo principal email → IA → Kanban, el MVP **no** incluye:

- **Procesamiento automático continuo de Gmail**:
  - Polling periódico.
  - Webhooks de Gmail/Google Workspace.
  - Reprocesamiento sin intervención del usuario.
- **Notificaciones externas**:
  - Emails de recordatorio.
  - Notificaciones push.
  - Integración con Slack u otras herramientas de comunicación.
- **Multi-workspace / multi-equipo**:
  - Varios equipos trabajando en espacios separados dentro de la misma instancia.
  - Compartir tableros Kanban entre varios usuarios con roles avanzados.
- **Colaboración en tiempo real**:
  - Edición concurrente de tareas.
  - Comentarios en tareas.
  - Mencciones entre usuarios.
- **Otras integraciones de calendario o CRM**:
  - Sincronización con Google Calendar, CRM externos, etc.

