# Diagrama de Componentes para el Procesamiento de Emails con IA

Vamos a identificar y explicar **todos los componentes** principales que interactúan cuando tu sistema procesa emails mediante IA, de forma clara y adaptada a quien apenas inicia en este proceso. Imagina este flujo como una cadena de bloques de funciones, donde cada bloque cumple una tarea clave.

## Componentes Principales y Sus Funciones

### 1. **Tabla de Emails en la BD ("emails")**
Es la entrada del sistema. Aquí se almacenan todos los emails importados vía JSON, con campos como `id`, `email`, `subject` y `body`. Es el punto de partida del procesamiento.

### 2. **Componente de Orquestador de Procesamiento**
Es una función o módulo del backend que:
- Extrae emails no procesados de la tabla `emails`.
- Llama al motor de IA para analizar cada email.
- Controla el avance y maneja errores.

### 3. **Archivo de Prompt**
Especifica **qué** le pides analizar o devolver al motor de IA. Ejemplo de orden (prompt):
> "Lee este email y extrae: tareas concretas, prioridad (alta, media, baja) y un resumen en una frase. Devuelve los datos en formato JSON."
Este archivo puede estar en tu código fuente y evolucionar según las necesidades.

### 4. **Componente Conector con IA (Vercel AI SDK / OpenAI API)**
Este módulo:
- Envía el texto del email y el prompt al modelo de IA.
- Recibe la respuesta generada automáticamente.
- Puede usar validaciones para asegurar que la respuesta encaje con lo esperado.

### 5. **Validador de Estructura (Zod u otro)**
Verifica que la respuesta de la IA sea válida (ej. que tenga todos los campos requeridos, tipos correctos, etc.).
- Si pasa, continúa el flujo.
- Si falla, registra un error para revisión o corrección manual.

### 6. **Tabla de Salida: EmailMetadata y Task**
Aquí se almacenan los datos extraídos.
Es la "salida principal" del flujo.

### 7. **Interfaz Visual (Kanban, Dashboards)**
Recibe la información ya estructurada de la tabla de salida y la presenta de manera visual, lista para que los usuarios la consulten y gestionen tareas.

***

## Esquema Visual del Flujo de Componentes

```
[Tabla emails]
     |
     v
[Orquestador de procesamiento]
     |
     v
[Archivo de prompt]
     |
     v
[Conector IA ⇆ Validador de estructura]
     |
     v
[Tabla EmailMetadata]
     |
     v
[Interfaz Visual Kanban/Dashboard]
```

- **Flechas**: indican el paso de la información.
- **Orquestador**: gobierna el flujo (puede ser una función batch o programada).

***

## Resumen del Proceso
1. Emails importados quedan en la tabla `emails`.
2. El orquestador toma cada email y prepara el prompt.
3. El conector IA envía el email y prompt, recibe la respuesta.
4. El validador Zod revisa la estructura; si es válida, almacena en `EmailMetadata`.
5. La información “procesada” alimenta tus vistas Kanban y dashboards.
