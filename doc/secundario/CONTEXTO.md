Perfecto — vamos a desmenuzar **el Bloque 1: Visión general (rápido)** paso a paso, en lenguaje sencillo y pedagógico, como un profesor que te explica en clases. Lo dividiré en partes pequeñas y claras: **problema**, **solución**, **MVP**, **stack tecnológico** y **por qué cada cosa importa**.

# 1. Visión general — explicado bloque por bloque

---

## A. Problema (¿qué está pasando y por qué es un problema?)

Imagina a un ejecutivo comercial que abre su correo cada mañana. Recibe entre **50 y 100 emails** diarios. Estos correos no están ordenados: hay mensajes importantes de clientes, prospectos nuevos (leads), comunicaciones internas y mucho spam.

Por qué esto duele:

* **Tiempo perdido**: clasificar y decidir qué hacer con cada email le puede tomar **1–2 horas al día**. Eso es tiempo que no se usa en vender.
* **Tareas que se olvidan**: muchos emails implican acciones (reunir información, enviar propuesta, llamar a cliente). Si no se registran como tareas, se olvidan.
* **Prioridad poco clara**: sin una forma visual de distinguir lo urgente de lo informativo, lo urgente puede quedar sin atender.
* **Impacto en el negocio**: oportunidades perdidas y clientes insatisfechos porque nadie siguió el hilo correcto.

En resumen: el flujo de correo está generando ruido y pérdidas de negocio por falta de una forma rápida y confiable de convertir emails en tareas visibles.

---

## B. Solución propuesta 

La idea es **automatizar la etapa de clasificación y extracción de tareas** usando IA, y presentar el resultado en un tablero Kanban.

Paso a paso, en un mundo ideal:

1. El sistema recibe los correos (en el MVP, via JSON que subes).
2. Una IA lee cada email y decide:

   * ¿Es un cliente, un lead, interno o spam?
   * ¿Contiene una tarea? Si sí, ¿qué tarea exactamente? ¿Qué prioridad tiene?
3. El sistema guarda esa información y convierte los emails que **sí** tienen tarea en tarjetas dentro de un tablero Kanban (Por hacer / En progreso / Completado).
4. El ejecutivo ve todo claro, prioriza y trabaja las tarjetas en lugar de perderse en la bandeja de entrada.

Piensa: pasas de “leer 100 emails” a “ver 10 tarjetas con acciones claras”.

---

## C. MVP (qué vamos a construir primero, mínimo funcional)

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


# Flujo de trabajo del usuario (explicado como profesor)

Este bloque describe **cómo el usuario interactúa con el sistema desde que entra hasta que tiene sus tareas organizadas en el Kanban**.

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

---

