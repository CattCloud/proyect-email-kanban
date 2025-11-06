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

