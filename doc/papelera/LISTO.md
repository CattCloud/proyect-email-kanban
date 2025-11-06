Quiero que actues como un senior full stack y Documentation Specialist
    roleDefinition:
      You are a technical writing expert specializing in clear, comprehensive documentation. You excel at explaining complex concepts simply and creating well-structured docs.
Contexto: Soy parte de un bootcamp , se desarrollara un Sistema Web , te voy a compartir todo la informacion(aunque esta desordenada) que nos indico el cliente que desea la pagina web y tambien las tareas o consejos que nos indico el docente que nos enseña en el bootcamp
IMPORTANTE : El tiempo aproximado que se tiene es de 14 dias(2 semanas) asi que se priorizara MVP

# Informacion del Proyecto Brindado por el cliente
Problema
Ejecutivos comerciales pierden oportunidades de negocio porque:

Reciben 50-100 emails diarios con solicitudes mezcladas entre spam y clientes importantes
Clasificar manualmente consume 1-2 horas diarias
Tareas implícitas en emails se olvidan o pierden prioridad
No hay visibilidad clara de pendientes urgentes vs informativos
Impacto: Oportunidades de negocio perdidas, clientes insatisfechos, caos operativo.

Solución Propuesta
Sistema que procesa emails, extrae tareas automáticamente con IA y organiza todo en tablero Kanban visual.

MVP: Procesamiento batch manual con JSON + IA + visualización Kanban

Versión futura: Integración directa Gmail + procesamiento automático

Historias de Usuario Core
US-01: Importar y visualizar emails
Como ejecutivo comercial
Quiero importar mis emails desde JSON y verlos organizados en una tabla
Para tener mi bandeja centralizada y accesible

Criterios de aceptación:

Importo JSON con formato: {id, email, received_at, subject, body}
Veo tabla con: remitente, asunto, fecha
Puedo buscar y ordenar por fecha
Click en fila muestra email completo
US-02: Procesar emails con IA
Como usuario
Quiero seleccionar emails y procesarlos automáticamente con IA
Para obtener categorización y detección de tareas sin trabajo manual

Criterios de aceptación:

Selecciono múltiples emails con checkboxes
IA retorna: categoría (cliente/lead/interno), prioridad (alta/media/baja), si tiene tarea, descripción de tarea
Veo metadata generada en cada email
Proceso batch de 10 emails en < 15 segundos
Categorías:

Cliente: solicitud/consulta de cliente existente
Lead: prospecto nuevo interesado
Interno: comunicación del equipo
Spam: sin valor comercial
US-03: Visualizar tareas en Kanban
Como usuario
Quiero ver todas mis tareas en tablero Kanban
Para tener claridad visual de pendientes y su progreso

Criterios de aceptación:

3 columnas: Por hacer / En progreso / Completado
Solo aparecen emails que IA detectó como tareas
Card muestra: asunto, prioridad badge, remitente
Drag & drop funciona (desktop y mobile)
Click en card abre email completo en modal
US-04: Acceso seguro y privado
Como usuario
Quiero login con Google y ver solo mis datos
Para mantener privacidad y seguridad

Criterios de aceptación:

Login OAuth con Google
Cada usuario ve únicamente sus emails/tareas
No puedo acceder a datos de otros usuarios
User Journey
Login con Google
Importar JSON con 20 emails
Seleccionar 15 emails → Procesar con IA
Revisar categorización y tareas detectadas
Ir a Kanban → Ver 10 tareas en “Por hacer”
Mover 3 a “En progreso”, completar 1
Click en tarea → Ver contexto completo del email
Tiempo: 5-8 minutos para 20 emails

Formato JSON Esperado
[
  {
    "id": "email-001",
    "email": "cliente@empresa.com",
    "received_at": "2024-11-01T09:15:00Z",
    "subject": "Reunión urgente - Propuesta Q4",
    "body": "Necesito que revisemos la propuesta..."
  }
]
Out of Scope (MVP)
Gmail API automático
Polling/webhooks
Notificaciones
Multi-workspace
Team Collaboration




# Stack
[Lo siguiente es un stack no definido completamente, es decir que se pueden adicionar nuevas librerias]
Next.js (App Router)
Por qué: facilita crear páginas modernas y soporta Server Actions (funciones del servidor que llamas desde el cliente sin endpoints explícitos). Ideal para este patrón donde el frontend invoca lógica server-side (ej. procesar emails con IA).

React
Por qué: librería para construir la interfaz (componentes, estado, interactividad). El Kanban y la tabla se implementan como componentes React.

TypeScript
Por qué: añade tipos al código (contratos claros). Esto ayuda a evitar errores y a definir bien las estructuras del JSON, respuestas de la IA y modelos de datos.
Prisma (con MySQL/Postgres/SQLite en dev)

Por qué: ORM que simplifica trabajar con la base de datos.
SQLite para desarrollo (fácil, sin servidor), Postgres/MySQL en producción (robustos y escalables).

Zod
Por qué: librería para validar y "tipar" datos en runtime. Útil para validar el JSON de entrada y la respuesta de la IA antes de guardarla.

Servidor de IA (OpenAI u otro)
Por qué: procesará el contenido de emails y devolverá la metadata (categoría, prioridad, tarea). En desarrollo puedes usar un mock para simular respuestas rápidas.

NextAuth (Google OAuth)
Por qué: permite que los usuarios inicien sesión con Google de forma segura. Luego cada usuario verá solamente sus emails y sus kanban.

Lucide React para iconos modernos

Tailwind CSS  para estilos 
 
shadcn/ui para componentes reutilizables y uniformizacion de la interfaz

zustand para gestión de estado

react table tanstack para tablas

[Aun es posible adicionar librerias necesarias]

# FLUJO DE TRABAJO PROPUESTO POR MI

La idea es **automatizar la etapa de clasificación y extracción de tareas** usando IA, y presentar el resultado en un tablero Kanban.

El flujo propuesto describe **cómo el usuario interactúa con el sistema desde que entra hasta que tiene sus tareas organizadas en el Kanban**.

Es como el “camino lógico” que sigue el usuario. Si este flujo está claro, todo lo demás (UI, backend, BD) se ordena solo.

Lo dividimos en 8 pasos.

---

### 🟦 **Paso 1 — Login (Google OAuth)**

🔹 **¿Qué pasa aquí?**
El usuario entra al sistema y se autentica usando su cuenta de Google.

🔹 **¿Por qué es importante?**

* Evita crear usuarios manualmente.
* Cada usuario tendrá su propio espacio: sus correos, sus tareas, su tablero.

🔹 **Resultado final:**

* El sistema crea o busca al usuario en la base de datos (via NextAuth + Prisma).
* Todos los datos que se guarden después se vinculan a `userId`.

---

### 🟦 **Paso 2 — Importar JSON con emails**

🔹 **¿Qué hace el usuario?**

* Sube un archivo `.json` que contiene correos simulados o descargados.

🔹 **¿Qué hace el sistema?**

* Valida el archivo (estructura correcta con Zod).
* Los guarda en la base de datos como `emails`, con estado inicial

  * `procesado = false`
  * `categoria = null`, `prioridad = null`, `tarea = null`
  * `userId = id_del_usuario_actual`

🔹 **¿Para qué sirve esta etapa?**
Simula lo que en el futuro será la conexión a Gmail/Outlook, pero sin complicar el MVP.

---

### 🟦 **Paso 3 — Seleccionar emails para procesar**

🔹 El usuario ve una tabla/lista de todos sus correos importados.
🔹 Marca cuáles quiere analizar con IA (checkboxes → seleccionar en batch).

👉 Esto evita procesar todo de golpe y permite elegir solo lo relevante.

---

### 🟦 **Paso 4 — Procesar con IA (batch)**

🔹 El usuario presiona un botón: **"Procesar con IA"**.
🔹 El sistema toma esos emails seleccionados y los envía a la IA (puede ser 1 por 1 o juntos, según estrategia).

🔹 La IA devuelve para cada email categoria,prioridad,tareas en caso las tenga:


🔹 Luego el sistema guarda esta información en la base de datos.

---

### 🟦 **Paso 5 — Revisar y confirmar resultados**

🔹 Aquí el usuario actúa como supervisor.

* Ve los resultados generados por la IA.
* Puede **editar** si algo está incorrecto (ejemplo: la IA dijo “interno” y es un cliente real).
* Presiona **"Confirmar"** o **"Guardar"**.

🔹 ¿Para qué sirve esto?

* La IA no es perfecta → el humano corrige lo necesario antes de que las tareas aparezcan en Kanban.
* Esta retroalimentación puede usarse luego para mejorar el modelo.

---

### 🟦 **Paso 6 — Ver Kanban**

Solo los emails que tienen tareas se convierten en tarjetas en el **tablero Kanban**.

Columnas típicas:

* **Por hacer** (To Do)
* **En progreso**
* **Completado**

Cada tarjeta tiene:
✔ Título (extracto del correo o la tarea)
✔ Prioridad (alta, media, baja)
✔ Categoría (cliente, lead, etc.)
✔ Estado actual

---

### 🟦 **Paso 7 — Mover tarjetas (Drag & Drop)**

🔹 El usuario arrastra las tarjetas entre columnas para organizar su flujo de trabajo.

* Ejemplo: pasa de **"Por hacer" → "En progreso"**.

🔹 Cada movimiento actualiza el campo `status` en la base de datos (`todo`, `doing`, `done`).

---

### 🟦 **Paso 8 — Ver contexto de la tarjeta**

🔹 Al hacer clic en una tarjeta → Se visualiza su informacion 
🔹 Contiene:

| Información     | Ejemplo                                    |
| --------------- | ------------------------------------------ |
| Email completo  | Asunto, cuerpo original, remitente         |
| Datos IA        | Categoría: cliente, Prioridad: alta        |
| Tarea detectada | “Enviar presupuesto al cliente…”           |


Esto permite **recordar el contexto sin volver al correo original**.

---

# **Resumen visual del flujo**

1. Login
2. Importar JSON
3. Seleccionar correos
4. Procesar con IA
5. Revisar resultados
6. Ver Kanban
7. Mover tarjetas
8. Ver detalles del email + tarea


### C. MVP (qué vamos a construir primero, mínimo funcional)

MVP = la versión más pequeña que ya entrega valor. Aquí el objetivo es **probar la idea y validar que la IA realmente extrae tareas útiles**.

Características concretas del MVP:

* **Importación manual**: el usuario sube un archivo JSON con emails (formato simple y controlado). No se integra aún con Gmail.
* **Procesamiento batch**: el usuario selecciona grupos de emails (por ejemplo 10) y solicita a la IA que los procese todos juntos.
* **Salida estándar**: para cada email, la IA debe devolver:

  * categoría (cliente / lead / interno / spam)
  * prioridad (alta / media / baja)
  * si contiene tarea y la descripción de la tarea
* **Visualización Kanban**: las entradas que tengan tareas aparecen como tarjetas en el tablero.
* **Interacción**: el usuario puede revisar y editar la metadata generada por la IA.

Por qué esto es bueno: reduces complejidad (no necesitas integrar Gmail ni manejar permisos complejos), te concentras en la parte clave: **extraer tareas y mostrarlas**.

---

### ✅ **Features core (según lo que pide el cliente y el flujo)**:

| Feature Nº | Nombre                                              |
| ---------- | --------------------------------------------------- |
| 1          | Login con Google (seguridad / privacidad) *(US-04)* |
| 2          | Importar JSON *(US-01)*                             |
| 3          | Visualizar emails en tabla *(US-01)*                |
| 4          | Seleccionar emails *(US-02)*                        |
| 5          | Procesamiento con IA *(US-02)*                      |
| 7          | Visualización en Kanban *(US-03)*                   |



### ✅ Features **de valor agregado**:

Son funcionalidades que **mejoran la experiencia**, dan fluidez, aumentan usabilidad, pero **no son indispensables para validar la idea**.

### 💡 Features de valor agregado:

| Feature Nº | Nombre                            | Aporte                                                             |
| ---------- | --------------------------------- | ------------------------------------------------------------------ |
| 6          | Revisión y edición de metadata IA | Mejora control, permite corregir errores de la IA antes de usarlos |
| 8          | Drag & Drop + modal de contexto   | Hace el tablero Kanban mucho más interactivo y comprensible        |

*Nota:* En el documento original, **el drag & drop sí aparece en el MVP**, pero si estás limitado en tiempo, **puedes hacer primero una versión estática** y agregar la interacción luego.

# Estructura de carpetas sugerida (Next.js / TypeScript)
Uso del patron Server Actions

/src
├── app/                     # Rutas / páginas (App Router)
│   ├── (auth)/              # Layouts/páginas de login
│   └── (protected)/         # Rutas protegidas (dashboard, kanban, import)
├── actions/                 # Server Actions (use server) -> lógica del servidor
│   ├── nombreArchivoActions.ts ...
├── services/                # Integraciones y wrappers (IA, storage, parsing)
│   ├── nombreArchivoService.ts ...
├── lib/                     # utilidades, db client, auth helpers
│   ├── prisma.ts
│   ├── auth.ts
│   └── validators.ts        # Zod schemas
├── components/              # UI atómicos y compuestos (Modal, Table, Card, Kanban)
├── hooks/                   # hooks de cliente (useKanban, useEmails)
├── types/                   # DTOs y tipos compartidos
└── prisma/                  # schema.prisma, migrations

## Propósito de la carpeta `actions/` 

La carpeta `actions/` es un componente fundamental de la arquitectura del proyecto que implementa el **patrón "Smart Actions"** de Next.js 15. Su propósito principal es:

### 🎯 **Función Principal**
Actuar como una capa intermedia entre los componentes de la interfaz de usuario y la lógica de negocio del servidor, permitiendo ejecutar código del servidor directamente desde el cliente sin necesidad de crear endpoints API tradicionales.

### 📋 **Responsabilidades Específicas**

1. **Ejecución de Lógica del Servidor**
   - Todas las funciones en `actions/` se marcan con `"use server"` al inicio
   - Esto permite que se ejecuten en el servidor cuando son llamadas desde componentes del cliente
   - Evitan el overhead de las llamadas HTTP tradicionales

2. **Validación de Datos**
   - Implementan validación type-safe utilizando Zod schemas
   - Garantizan que los datos recibidos del cliente sean correctos antes de procesarlos
   - Proporcionan mensajes de error claros cuando la validación falla

3. **Manejo de Base de Datos**
   - Realizan operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en la base de datos
   - Utilizan Prisma ORM para consultas type-safe
   - Implementan lógica de negocio compleja cuando es necesario

4. **Gestión de Cache**
   - Utilizan `revalidatePath()` para invalidar caché de Next.js automáticamente
   - Aseguran que la UI se actualice con los datos más recientes después de las operaciones

5. **Control de Permisos**
   - Validan que los usuarios tengan los permisos necesarios para realizar operaciones
   - Implementan la lógica de autorización de forma centralizada

### 🔄 **Flujo de Trabajo**

1. Un componente del cliente llama a una función de `actions/`
2. Next.js serializa los parámetros y los envía al servidor
3. La función se ejecuta en el servidor con acceso completo a la base de datos
4. El resultado se serializa y se devuelve al cliente
5. El componente actualiza su estado con el resultado


## Propósito de la carpeta `services/` 


La carpeta `services/` es una capa fundamental de la arquitectura del sistema que actúa como **intermediario entre la lógica de negocio y las fuentes de datos externas**. Su propósito principal es:

### 🎯 **Función Principal**
Encapsular y centralizar toda la lógica de comunicación con sistemas externos y APIs, proporcionando una interfaz unificada para que las Smart Actions y otros componentes del sistema puedan interactuar con servicios externos de manera consistente.

### 📋 **Responsabilidades Específicas**

1. **Comunicación con APIs Externas**
   - Realizar llamadas HTTP a servicios externos (Canvas LMS, WhatsApp, etc.)
   - Manejar autenticación con APIs externas
   - Procesar respuestas y errores de manera centralizada

2. **Abstracción de Lógica de Negocio**
   - Encapsular lógica compleja de integración
   - Proporcionar interfaces simples para operaciones complejas
   - Separar la lógica de comunicación de la lógica del negocio principal

3. **Transformación de Datos**
   - Convertir datos de APIs externas al formato interno del sistema
   - Normalizar estructuras de datos diferentes
   - Implementar mapeos entre modelos externos e internos

4. **Manejo de Errores y Reintentos**
   - Implementar lógica de reintentos automáticos
   - Manejar códigos de error específicos de cada API
   - Proporcionar mensajes de error consistentes

### 🔄 **Flujo de Trabajo**

1. Una Smart Action necesita datos de un sistema externo
2. Llama a la función correspondiente en `services/`
3. El servicio maneja la comunicación con la API externa
4. El servicio transforma los datos al formato interno
5. El servicio retorna los datos procesados a la Smart Action
6. La Smart Action continúa con su lógica de negocio

---




# Procesamiento IA (estrategia técnica)

Dividido en pasos prácticos.

Batching: procesar en batches de 10 (criterio de aceptación). Implementar control para paralelizar/concurrency limitado (p.ex. p-limit).

Prompting: enviar cada email (o un agrupado) con instrucciones claras al modelo: identificar categoría, prioridad, si contiene tarea y generar descripción breve.

Validación: la respuesta de la IA debe pasar por un Zod schema; si la IA falló, marcar email como processed: false con error.

Retries y fallbacks: reintentos 2 veces; si sigue fallando, exponer para revisión manual.

Tiempo objetivo: criterio del MVP indica ≤15s para 10 emails — en dev usa mocks para pruebas de velocidad; en producción monitorizar latencia.



# Consejos Pro dados por el bootcamp(No es necesario agregarlo):
## Sobre el alcance:

Menos features bien hechas > muchas features a medias
Si dudas sobre incluir algo: probablemente no es core
Puedes cambiar de idea en Clase 31, pero después del setup, no cambies el proyecto
Sobre el trabajo en equipo:



## Sobre el uso de IA:

Genera documentos base como contexto
Utiliza SIEMPRE el modo planificador antes del modo implementador
No aceptes código sin entenderlo: utiliza un modelo barato que te pueda explicar (gemini)
La IA es el copiloto, pero tú serás siempre el Piloto principal

## Sobre el deployment:

Deploy temprano, deploy frecuente
Vercel + Neon es la combinación recomendada
Tener algo en producción siempre es mejor que código perfecto en local

Ahora ademas de ponerte en contexto con la informacion que te comparto ,tambien ordename en una  documentacion con toda esa informacion , no inventes ni alucines demas informacion