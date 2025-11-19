# ✅ **Semana 1 — ¿Qué significa realmente este plan?**

El objetivo principal de esta semana es:
👉 **Tener visible la idea del producto, organizada, pensada y con pantallas (mockups/UI), aunque no funcione todavía.**

Es decir, **una maqueta visual completa del sistema**, lista para mostrar a alguien y decirle:
*"Esto es lo que hará mi sistema y así se verá"*.

---

## 🎯 **Objetivo de la Semana 1**

| Objetivo                                | ¿Qué significa para ti?                                                            |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| Tener listo el “esqueleto” del proyecto | Definir qué va a hacer tu app, cómo se va a navegar y cómo se verá cada pantalla.  |
| No hay backend todavía                  | No guardarás datos reales en bases de datos, solo usarás datos falsos (mock data). |
| Publicarlo en Vercel                    | Aunque no funcione completamente, debe estar subido a internet para mostrarlo.     |

---

## 📌 **Tareas principales de la Semana 1 (desglosadas y explicadas en lenguaje humano):**

| Tarea                                 | ¿Qué te están pidiendo realmente?                                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| ✅ Definir bien tu proyecto            | Escribir claramente: ¿cuál es el problema?, ¿quién lo sufre?, ¿cómo lo solucionarás?, ¿qué hace tu sistema?             |
| ✅ Definir solo 3 features principales | Elegir las 3 funciones más importantes del sistema (las que dan valor real). No más. No extras.                         |
| ✅ Hacer Mockups de pantallas          | Dibujar cómo se verá cada pantalla (puede ser en Figma, papel o IA como v0.dev). Ej: Login, Lista de Emails, Kanban…    |
| ✅ Crear el proyecto en Next.js        | Generar la app base, con carpetas: `/app`, `/components`, `/lib`, etc. Aunque no tenga backend funcional.               |
| ✅ Simular datos (mock data)           | Usar archivos `.json` o arrays de ejemplo para mostrar emails, tareas o usuarios en pantalla. No hay base de datos aún. |
| ✅ Mostrar la UI con esos datos falsos | Que se pueda navegar en la app: ver tabla de emails, ver el tablero Kanban… aunque los datos no se guarden realmente.   |
| ✅ Subir el proyecto a Vercel          | Publicarlo para que se pueda ver en internet al terminar la semana.                                                     |

---

## 📂 **¿Qué entregable final esperan al terminar la semana 1?**

✅ Una app que se puede abrir en un link de Vercel.
✅ Tiene las pantallas necesarias (aunque los botones no hagan mucho).
✅ Usa datos falsos/mocks para simular cómo se verán los emails o tareas.
✅ Tiene claro el problema, la solución y las 3 features core.
✅ Está ordenado el proyecto en carpetas (frontend solamente).

---

## 🧠 **¿Qué NO te piden esta semana? (para que no te estreses)**

❌ No base de datos real.
❌ No lógica de IA todavía.
❌ No login real con Google aún.
❌ No drag & drop funcionando 100%.
❌ No procesamiento real de emails.

---

## ✅ **Resumido en una frase:**

> **“Semana 1 es para pensar, diseñar y mostrar la idea visual del proyecto al mundo (con datos de mentira). No para programar lógica real todavía.”**

---


---

# ✅ **📆 Semana 2 — ¿Qué significa realmente esta fase?**

En esta semana, tu proyecto **deja de ser solo visual** y **empieza a tener vida real**.

👉 El objetivo principal es:
**Conectar la primera funcionalidad real a una base de datos, con datos que se guarden de verdad (no mocks).**

---

## 🎯 **¿Cuál es el objetivo de esta semana?**

| Objetivo                               | Explicado en lenguaje humano                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| Crear el backend básico                | Tu app debe conectarse a una base de datos real.                                   |
| Implementar la primera “feature real”  | Una funcionalidad debe funcionar de verdad: guardar, leer o procesar datos reales. |
| Seguir usando Next.js + Prisma         | Comenzar a usar Prisma como ORM para conectarte a PostgreSQL.                      |
| Mantener lo que ya hiciste en Semana 1 | No se elimina, solo se le agrega lógica verdadera.                                 |

---

## 🔧 **¿Qué tareas específicas debes realizar?**

| Tarea                                               | ¿Qué te están pidiendo realmente?                                                            |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| ✅ Configurar base de datos                          | Crear una base de datos en Neon/PostgreSQL o local.                                          |
| ✅ Instalar Prisma                                   | Configurar prisma, crear el archivo `schema.prisma`, definir tu primer modelo (ej: `Email`). |
| ✅ Hacer migraciones                                 | Esto crea las tablas en la base de datos real (por ejemplo `prisma migrate dev`).            |
| ✅ Conectar el frontend a estos datos reales         | Ya no se leen emails desde un JSON falso, sino desde la base de datos.                       |
| ✅ Implementar **la primera feature completa**       | Puede ser: importar emails desde JSON → guardarlos en DB y mostrarlos.                       |
| ✅ Usar Server Actions o API Routes                  | Para ejecutar código en el servidor y guardar datos.                                         |
| ✅ Subir todo a GitHub + Vercel (con base conectada) | Tu app ya debe funcionar con base de datos en producción.                                    |

---

## ⚙️ **¿Cuál debería ser esa primera feature real? (lo típico para este proyecto)**

La más lógica y sencilla sería:

### **Feature 1 real: Importar emails y guardarlos en base de datos**

| Paso | ¿Qué hace el sistema?                                                |
| ---- | -------------------------------------------------------------------- |
| 1    | Usuario sube archivo JSON con emails (como en Semana 1).             |
| 2    | Una server action procesa ese JSON.                                  |
| 3    | Los emails se guardan en la base de datos (por usuario autenticado). |
| 4    | La UI muestra los emails desde la base de datos, no desde mock data. |

Esta feature **no tiene IA todavía**, solo almacenamiento real de correos.

---

## 📁 **Estructura que empieza a tener backend real (ya no solo frontend):**

```
/src
├── app/
│   ├── emails/page.tsx        # Mostrar emails desde DB
│   └── (otras pantallas)
│
├── actions/                   # Server Actions reales
│   └── emails/
│       ├── importEmails.action.ts   # Guarda emails en la DB
│
├── lib/
│   ├── prisma.ts              # Conexión a la base de datos
│   └── validations/           # Validar JSON antes de guardar
│
├── prisma/
│   ├── schema.prisma          # Modelos de la base de datos
│
├── types/                     # Tipos globales de Email, User, etc.
└── .env                       # Variables como DATABASE_URL
```

---

## ❌ **¿Qué NO te obligan a hacer aún en Semana 2?**

| No es obligatorio todavía    |
| ---------------------------- |
| IA para detectar tareas      |
| Tablero Kanban completo      |
| Drag & Drop funcionando      |
| Roles, permisos avanzados    |
| Notificaciones o automations |

---

## ✅ **Resumen en una frase:**

> **“Semana 2 es cuando tu app pasa de ser una maqueta a tener su primera función real usando base de datos.”**

---

## ✅ **Semana 3 — Procesamiento de Emails + IA (Batch)**

**Objetivo general:**
El sistema ya puede importar emails y mostrarlos. Ahora queremos que **sea inteligente** → que tome un conjunto de emails y, usando IA, detecte si hay tareas, su categoría y prioridad.

---

### 🧠 **¿Qué se busca lograr realmente?**

1. Tomar uno o varios emails seleccionados.
2. Mandarlos a un servicio de IA (OpenAI, LLM local, etc.).
3. La IA devuelve algo como:

   ```json
   {
     "subject": "Reunión con cliente",
     "tiene_tarea": true,
     "descripcion_tarea": "Agendar reunión con cliente X",
     "categoria": "Clientes",
     "prioridad": "Alta"
   }
   ```
4. Guardar esta información en la base de datos.
5. Mostrar al usuario lo que detectó para que lo revise antes de enviarlo al Kanban.

---

### 📌 **Bloques de tareas de esta semana**

| Bloque                               | ¿Qué se hace?                                                            | ¿Por qué es importante?                               |
| ------------------------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------- |
| 1. Preparar prompt de IA             | Se define QUÉ le vamos a preguntar a la IA y CÓMO queremos que responda. | Si el prompt es malo → la IA responde cosas inútiles. |
| 2. Enviar emails en batch            | Procesar 5, 10 o 20 correos a la vez, no uno por uno.                    | Ahorra tiempo y reduce costos de IA.                  |
| 3. Validar respuesta (Zod)           | Verificar que lo que devuelve la IA tiene el formato correcto.           | Evita errores como `prioridad: undefined`.            |
| 4. Guardar en BD                     | Emails procesados se actualizan con los datos de la IA.                  | Queda registrado para futuras vistas (Kanban).        |
| 5. Mostrar al usuario para confirmar | Se abre UI para revisar, editar o rechazar los datos generados.          | El humano valida antes de automatizar.                |

---

### 🧩 **¿Qué nuevas partes del sistema aparecen en esta semana?**

| Nueva pieza                           | ¿Qué hace?                                                                    |
| ------------------------------------- | ----------------------------------------------------------------------------- |
| `lib/ai/prompt.ts`                    | Define el mensaje base que usamos para hablar con la IA.                      |
| `lib/ai/processEmailsBatch.ts`        | Función que recibe varios emails, genera un batch de prompts y llama a la IA. |
| `schemas/emailTaskSchema.ts`          | Zod: valida el formato de respuesta de la IA antes de guardarlo.              |
| Server Action `processEmailsAction`   | Acción que conecta UI ↔ IA ↔ Base de datos.                                   |
| Página de “Revisión de resultados IA” | Pantalla donde el usuario ve lo que la IA detectó.                            |

---

### 🛠️ **Flujo mental de la Semana 3**

```
Usuario selecciona emails → Clic en "Procesar con IA"
             ↓
Server Action recibe los emails seleccionados
             ↓
Prepara prompt → Envia a IA (batch de 5-10 emails)
             ↓
IA responde JSON → Validamos con Zod
             ↓
Guardamos en base de datos (email + metadata IA)
             ↓
Mostramos previsualización editable al usuario
```

---

### ⚠️ **Riesgos y cosas a tener en cuenta**

| Riesgo                     | Consecuencia            | Solución                                            |
| -------------------------- | ----------------------- | --------------------------------------------------- |
| IA responde mal formado    | Error guardando en BD   | Validar con Zod + fallback elegante                 |
| Batch demasiado grande     | Costos altos o timeout  | Limitar a 10 emails por batch                       |
| Usuario no confía en la IA | Pérdida de adopción     | Vista de revisión manual antes de guardar en Kanban |
| Datos sensibles            | Problemas de privacidad | Anonimizar contenido o usar IA local                |

---

### ✅ **Resultado final esperado de la Semana 3**

* ✔️ Puedes seleccionar emails importados.
* ✔️ Puedes procesarlos con IA en lotes.
* ✔️ El sistema detecta tareas, categorías y prioridades.
* ✔️ Guarda esa información sin romper nada.
* ✔️ El usuario puede revisarla antes de enviarla al Kanban.

---
# ✅ Semana 4 — Kanban por contacto y gestión visual de tareas

**Objetivo general:**  
Convertir el tablero Kanban actual en una herramienta estratégica centrada en las personas, donde el ejecutivo pueda ver y gestionar las tareas que provienen de sus emails procesados, organizadas por contacto (la persona que envió el correo), con filtros claros y movimiento visual entre estados.

En esta semana pasamos de tener un Kanban genérico a un tablero inteligente por contacto, que permite priorizar rápidamente a qué clientes, leads o contactos internos se les debe responder primero.

---

## 🧩 ¿Qué tareas principales se trabajan?

| Bloque                                       | ¿Qué se hace?                                                                                                      | ¿Por qué es importante?                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| 1. Kanban por contacto                      | El tablero muestra las tareas que vienen de emails procesados, agrupadas por la persona que envió el correo.      | Permite ver de un vistazo qué pendientes hay por cliente, lead o contacto interno.     |
| 2. Selector múltiple de contactos           | Se agrega un selector múltiple arriba del tablero para elegir uno o varios contactos a la vez.                    | El ejecutivo puede enfocarse solo en los contactos clave que necesita atender hoy.     |
| 3. Filtro dinámico de tareas en el Kanban   | Al elegir uno o varios contactos, el tablero muestra solo las tareas asociadas a esos contactos seleccionados.    | Reduce ruido visual y ayuda a concentrarse en el segmento de trabajo más relevante.    |
| 4. Múltiples tareas por email procesado     | Un email procesado puede generar cero, una o varias tareas, y todas se verán como tarjetas independientes.         | Refleja mejor la realidad: un solo correo puede contener varias acciones a ejecutar.   |
| 5. Drag and Drop entre columnas             | El usuario puede arrastrar tarjetas entre las columnas (Por hacer, En progreso, Completado).                      | Facilita la gestión diaria de tareas de forma intuitiva y visual.                      |
| 6. Actualización del estado de las tareas   | Cada movimiento de tarjeta actualiza el estado de la tarea para que quede guardada de forma permanente.           | Asegura que el tablero refleje el estado real y actualizado del trabajo pendiente.     |

---

## 🖥️ Cómo se ve la experiencia final para el usuario

1. El usuario entra al tablero de tareas.
2. En la parte superior encuentra un selector múltiple de contactos con la lista de personas que aparecen en sus emails (clientes, leads, contactos internos, etc.).
3. El usuario selecciona uno o varios contactos y el tablero se actualiza para mostrar solo las tareas relacionadas con esos contactos.
4. El tablero Kanban se organiza en tres columnas:
   - Por hacer: tareas nuevas o pendientes.
   - En progreso: tareas en las que ya se está trabajando.
   - Completado: tareas terminadas.
5. Cada tarjeta representa una tarea proveniente de un email procesado, con información clara y resumida (contacto, breve descripción de la tarea, estado actual).
6. El usuario puede arrastrar una tarjeta de una columna a otra conforme avanza el trabajo.
7. El usuario puede cambiar de conjunto de contactos en el selector para ver distintos grupos de tareas.
8. Los cambios de estado se guardan, de modo que al regresar al tablero, la distribución de tareas sigue siendo la misma.

En la práctica, el ejecutivo pasa de una lista desordenada de correos a una agenda visual organizada por personas que le permite decidir con claridad en qué enfocarse durante el día.

---

## 📌 ¿Qué mejora esta semana respecto al estado actual?

- De Kanban genérico a Kanban por contacto: el tablero deja de ser solo una lista de tareas sueltas y se convierte en una vista centrada en las personas que más importan para el negocio.
- De una tarea por email a múltiples tareas por email: antes, como simplificación, solo se consideraba una tarea por correo; ahora se contempla que un mismo correo pueda traer varias acciones concretas, todas visibles en el Kanban.
- De vista sin filtros a vista enfocada: el nuevo filtro por contactos permite que un ejecutivo se concentre en sus clientes top, leads prioritarios o un conjunto específico de contactos internos.
- De tablero estático a tablero operativo: el arrastre de tarjetas entre columnas pasa a ser una forma real de gestionar el estado de las tareas, no solo una visualización.

---

## ⚠️ Riesgos o retos de la semana

| Problema potencial                              | ¿Qué podría pasar?                                                                                 | Enfoque de solución                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Demasiados contactos en el selector            | Si hay muchos contactos, el selector múltiple puede volverse largo y difícil de manejar.          | Diseñar una presentación ordenada y, si es necesario, agregar búsqueda dentro del filtro. |
| Muchas tareas para un mismo contacto           | Un solo contacto muy activo puede acumular muchas tarjetas en el tablero.                         | Mantener un diseño claro, con buena jerarquía visual y posibilidad de filtrar por estado. |
| Cambios de estado simultáneos                  | En contextos con varios usuarios, puede haber movimientos de tarjetas en paralelo.                | Definir reglas claras de actualización y refresco de la vista para evitar confusiones.     |
| Curva de aprendizaje del nuevo filtro          | Algunos usuarios pueden tardar en entender que el tablero ahora se filtra por contactos.          | Incluir mensajes explicativos simples y consistentes dentro de la interfaz.                |

---

## ✅ Resultado esperado al final de la Semana 4

- El usuario cuenta con un tablero Kanban por contacto donde puede ver las tareas generadas a partir de emails procesados.
- Existe un selector múltiple de contactos que permite centrarse en uno o varios contactos específicos.
- Se muestran múltiples tareas por cada email procesado cuando aplica, todas claramente visibles como tarjetas independientes.
- El usuario puede arrastrar y soltar tarjetas entre las columnas de estado, haciendo que el tablero sea realmente operativo.
- El estado de las tareas se mantiene actualizado, ofreciendo al ejecutivo una visión real y confiable de su carga de trabajo.

En resumen, la Semana 4 convierte el tablero en una herramienta de gestión diaria enfocada en las relaciones con clientes y contactos clave, alineada con la forma en que un ejecutivo organiza su día a día.

---
# ✅ Semana 5 — Autenticación con Google y Correos por Usuario

**Objetivo general:**  
Transformar la plataforma en un espacio totalmente personalizado y seguro para cada ejecutivo, asegurando que el acceso y visualización de información sea exclusivo y automatizado vía autenticación con Google y correspondencia uno a uno entre usuarios y sus emails.

En esta etapa el sistema dará un salto: dejará de ser una bandeja común para convertirse en una experiencia individualizada, donde cada quien ve solo su información, y podrá, además, conectar su cuenta de Gmail para traer sus propios correos directo al sistema.

***

## 🧩 ¿Qué tareas principales se trabajan?

| Bloque                                 | ¿Qué se hace?                                                                                  | ¿Por qué es importante?                                                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1. Autenticación con Google (OAuth2)    | Se implementa login usando la cuenta Google de cada usuario (Gmail o Workspace).               | Brinda acceso seguro, elimina contraseñas, simplifica onboarding y soporte IT. |
| 2. Asociación de datos por usuario      | Cada email importado y cada tarea analizada queda asociada al usuario autenticado.             | Garantiza privacidad y relevancia: cada quien ve solo sus propios pendietes.   |
| 3. Bandeja de emails por usuario        | El sistema permite traer los correos de cada usuario usando permisos de Google (Gmail API).    | Automatiza la importación, elimina cargas manuales, y asegura actualización.   |

***

## 🖥️ Cómo se ve la experiencia final para el usuario

1. El usuario ingresa al sistema y elige “Iniciar sesión con Google”.
2. Autoriza, de ser necesario, acceso seguro a su cuenta Gmail vía Google.
3. Tras autenticarse, toda la aplicación (tablero, emails, actividades, Kanban) muestra exclusivamente la información correspondiente a su usuario.
4. Puede otorgar permisos para conectar su bandeja de entrada y así importar automáticamente sus mensajes recientes de Gmail.
5. Todos los flujos y vistas filtran emails y tareas por el usuario logueado, respetando privacidad y evitando errores de mezcla de información.
6. Al cerrar sesión o cambiar de usuario, toda la app se refresca y actualiza a los datos del nuevo usuario autenticado.

***

## 📌 ¿Qué mejora esta semana respecto al estado actual?

- De plataforma anónima o genérica a plataforma con identidad: cada ejecutivo es dueño de su información.
- De carga manual a importación automática: elimina fricciones, errores humanos y falta de actualización.
- De posible cruce de información a privacidad sólida: ningún usuario puede ver ni modificar los correos, tareas o tableros de otro.
- Incrementa la seguridad y la trazabilidad operativa, facilitando cumplimiento y gobierno de datos.
- Facilita la integración futura con otras herramientas del ecosistema Google (Calendario, Drive, etc.).

***

## ⚠️ Riesgos o retos de la semana

| Problema potencial           | ¿Qué podría pasar?                                                      | Enfoque de solución                                                  |
| --------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Problemas de permisos OAuth | Un usuario puede rechazar (o no entender) los permisos requeridos.      | Mensajes claros y UX de consentimiento educativo, proceso escalonado.|
| Validación en ambientes de prueba | Límites de usuarios en apps no verificadas de Google.           | Testear primero con usuarios internos, luego solicitar verificación. |
| Confusión por acceso múltiple| Si un usuario tiene varios correos Google puede no saber cuál usó.      | Confirmar email activo en la interfaz y dar opción para cambiar.     |
| Desincronización tras logout | Caché de datos visibles tras cerrar sesión, potencial riesgo de sesión. | Forzar borrado de sesión y refresco de datos/UI al cerrar sesión.    |

***

## ✅ Resultado esperado al final de la semana

- Usuarios pueden ingresar con su cuenta Google, de manera fácil y segura.
- Cada correo y cada tarea está correctamente ligada a un usuario autenticado.
- Solo se muestran emails, tareas y flujos que corresponden al usuario actual.
- Si el usuario da permiso, su bandeja de entrada de Gmail se sincroniza automáticamente con la plataforma.
- Privacidad, seguridad y personalización del sistema llevadas a nivel profesional, listas para escalar en equipos o empresas.

***

**En resumen:**  
Esta integración convierte la plataforma en una herramienta personalizada, segura y preparada para automatizar flujos de información, donde cada ejecutivo tiene bajo control y en un solo lugar todo lo que realmente le corresponde revisar, priorizar y ejecutar.

