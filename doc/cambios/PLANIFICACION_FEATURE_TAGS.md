## Feature/Fix: Integración de la tabla de etiquetas en el sistema

### Información General

**Tipo:** Feature

Este feature introduce una tabla de etiquetas centralizada (`Tag`) en la base de datos del Sistema de Gestión Inteligente de Emails, siguiendo la arquitectura descrita en [`SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md).  

Actualmente, las etiquetas asociadas a las tareas generadas por IA se almacenan como listas de `string` en el modelo `Task` (campo `tags: string[]`) definido en [`schema.prisma`](prisma/schema.prisma). No existe un catálogo persistente de etiquetas, lo que genera:

- Duplicados lógicos de etiquetas (ej: `reunion`, `reunión`, `reunion-cliente`).
- Inconsistencias de formato (acentos, mayúsculas, separadores).
- Dificultad para auditar, refactorizar y reutilizar etiquetas a nivel global.

El nuevo prompt de procesamiento IA ya está definido en [`NUEVOPROMPT.md`](doc/NUEVOPROMPT.md) y en la implementación de [`buildEmailProcessingPrompt()`](src/lib/prompts/email-processing.ts:147). Este prompt soporta explícitamente:

- Recibir un catálogo de etiquetas existentes (`existingTags`).
- Priorizar el uso de dichas etiquetas.
- Proponer nuevas etiquetas **solo cuando sea necesario**, siguiendo reglas estrictas de etiquetado.

Sin embargo, aún falta:

- Una tabla de etiquetas (`Tag`) en base de datos.
- La integración entre `Tag` y el flujo de IA en [`ai-processing.ts`](src/actions/ai-processing.ts:105).
- La lógica para registrar automáticamente en `Tag` las nuevas etiquetas propuestas por la IA.

Este feature aborda exclusivamente la creación e integración de la tabla de etiquetas con el flujo de IA. No incluye UI de administración de etiquetas ni filtros de UI basados en etiquetas (considerados fuera de alcance).

### Objetivo

Implementar un sistema completo de gestión de etiquetas que:

1. **Centralice** todas las etiquetas en una tabla `Tag`, con propiedades mínimas:
   - `id`
   - `descripcion`
   - `createdAt`
2. **Evite duplicados lógicos** mediante normalización y unicidad sobre `descripcion`.
3. **Alimente a la IA** con el catálogo existente de etiquetas, pasándolo como `existingTags` a [`buildEmailProcessingPrompt()`](src/lib/prompts/email-processing.ts:147) según [`NUEVOPROMPT.md`](doc/NUEVOPROMPT.md).
4. **Registre nuevas etiquetas propuestas por IA** en la tabla `Tag`, normalizándolas y asegurando que no existan duplicados.
5. Mantenga la compatibilidad con los modelos y flujos actuales (emails, tareas, Kanban), sin romper UI ni lógica existente.

### Resultado final esperado

Al completar este feature:

- Existirá una tabla `Tag` en la base de datos (Prisma + PostgreSQL), representando el **catálogo global de etiquetas** del sistema.
- El flujo de procesamiento IA en [`processEmailsWithAI()`](src/actions/ai-processing.ts:105):
  - Consultará el catálogo actual de `Tag`.
  - Pasará las etiquetas existentes a [`buildEmailProcessingPrompt()`](src/lib/prompts/email-processing.ts:147) como `existingTags`.
  - Recibirá `tasks[].tags` desde la IA, alineadas con el catálogo.
- Cualquier etiqueta nueva propuesta por la IA:
  - Se normalizará (lowercase, sin acentos, sin espacios, etc.).
  - Se contrastará con `Tag` para evitar duplicados lógicos.
  - Se insertará en la tabla `Tag` solo si realmente no existe.
- El sistema quedará listo para futuras extensiones (UI de gestión de etiquetas, métricas, filtros por etiqueta), que se declaran explícitamente como **fuera de alcance** de este feature.

---

### Hitos del Proyecto

Este desarrollo se realizará en **4 hitos** secuenciales:

**HITO 1: Modelo de Datos y Tabla Tag**  
Definir el modelo `Tag` en Prisma, crear la migración correspondiente, garantizar la unicidad de `descripcion` y actualizar los tipos TypeScript y la documentación del modelo de datos. Al finalizar, la base de datos estará preparada para almacenar etiquetas únicas del sistema.

**HITO 2: Integración de Tag con el Prompt de IA**  
Integrar la tabla `Tag` con el flujo de IA: leer las etiquetas existentes desde la base de datos y pasarlas a [`buildEmailProcessingPrompt()`](src/lib/prompts/email-processing.ts:147) como `existingTags`, siguiendo exactamente las reglas definidas en [`NUEVOPROMPT.md`](doc/NUEVOPROMPT.md).

**HITO 3: Persistencia de Nuevas Etiquetas Propuestas por IA**  
Implementar la lógica que detecta etiquetas nuevas propuestas en `tasks[].tags`, las normaliza, y las persiste en la tabla `Tag` sin duplicados lógicos, integrándolo con el flujo actual de persistencia de resultados IA en [`ai-mapper`](src/lib/ai-mapper.ts:1) y [`ai-processing`](src/actions/ai-processing.ts:105).

**HITO 4: Validación, Consistencia y Documentación Técnica**  
Validar el flujo completo de extremo a extremo, añadir pruebas mínimas para la lógica de etiquetas, y actualizar el Sistema Maestro y documentación complementaria. El feature será desplegable de forma independiente y sin romper funcionalidades existentes.

---

## HITO 1: Modelo de Datos y Tabla Tag

### Objetivo del Hito

Diseñar y crear el modelo `Tag` en la base de datos (Prisma + PostgreSQL), asegurando:

- Estructura mínima (`id`, `descripcion`, `createdAt`).
- Unicidad sobre `descripcion` para evitar duplicados lógicos.
- Tipos TypeScript correspondientes y documentación en el Sistema Maestro.

### Entregables

- [ ] Modelo `Tag` agregado al schema Prisma en [`schema.prisma`](prisma/schema.prisma).
- [ ] Migración Prisma creada y aplicada en base de datos (Neon).
- [ ] Índice único en `descripcion` para garantizar unicidad lógica.
- [ ] Tipos TypeScript de `Tag` definidos y exportados desde [`src/types`](src/types/index.ts).
- [ ] Documentación del modelo `Tag` en la sección 5.2 (Modelo de Datos) de [`SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md).

### Tareas

#### Backend – Base de Datos (Prisma / PostgreSQL)

- [ ] Diseñar schema Prisma para `Tag`
  - [ ] Agregar al modelo de datos en [`schema.prisma`](prisma/schema.prisma):
    ```prisma
    model Tag {
      id          String   @id @default(cuid())
      descripcion String   @unique
      createdAt   DateTime @default(now())

      @@index([descripcion])
    }
    ```
  - [ ] Verificar que no se introducen relaciones en este hito (integración con `Task` quedará implícita vía tags de texto).

- [ ] Crear migración inicial de `Tag`
  - [ ] Ejecutar:
    ```bash
    npx prisma migrate dev --name add_tag_table
    ```
  - [ ] Revisar `migration.sql` en `prisma/migrations/[timestamp]_add_tag_table/migration.sql` para confirmar:
    - Creación de tabla `Tag`.
    - Restricción `UNIQUE` sobre `descripcion`.
  - [ ] Validar compatibilidad con PostgreSQL en Neon (tipos y constraints).

- [ ] Actualizar Prisma Client
  - [ ] Ejecutar:
    ```bash
    npx prisma generate
    ```
  - [ ] Confirmar que el tipo `Tag` aparece en `@prisma/client` y puede usarse desde [`ai-processing.ts`](src/actions/ai-processing.ts:105).

#### Backend – Tipos TypeScript

- [ ] Definir tipo `Tag` en [`src/types/email.ts`](src/types/email.ts:1) o [`src/types/ai.ts`](src/types/ai.ts:1) (según organización preferida)
  - [ ] Agregar:
    ```ts
    export interface Tag {
      id: string;
      descripcion: string;
      createdAt: Date;
    }
    ```
  - [ ] Exportar `Tag` desde [`src/types/index.ts`](src/types/index.ts:6).

#### Testing

- [ ] Tests de schema (validaciones básicas)
  - [ ] Confirmar mediante consulta SQL:
    ```sql
    SELECT id, descripcion, "createdAt" FROM "Tag" LIMIT 5;
    ```
  - [ ] Verificar que `descripcion` es realmente única.

#### Documentación

- [ ] Actualizar documentación técnica
  - [ ] En [`SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md:395), agregar subsección:
    ```markdown
    ### Modelo Tag

    El modelo `Tag` representa el catálogo global de etiquetas del sistema:

    ```prisma
    model Tag {
      id          String   @id @default(cuid())
      descripcion String   @unique
      createdAt   DateTime @default(now())
    }
    ```

    - `descripcion` almacena la etiqueta normalizada (lowercase, sin tildes).
    - Existe un índice único sobre `descripcion` para evitar duplicados lógicos.
    ```
  - [ ] Anotar este cambio en la sección de cambios de modelo de datos (si existe un changelog interno).

### Dependencias

- **Internas:** Ninguna (primer hito del feature).  
- **Externas:**  
  - Prisma CLI instalado.  
  - Base de datos de desarrollo accesible (Neon PostgreSQL).

### Consideraciones

- **Performance:**  
  - El volumen de etiquetas se espera moderado; un índice único sobre `descripcion` es suficiente.
- **Migración:**  
  - No afecta a modelos existentes; la tabla `Tag` es nueva y no requiere migración de datos anteriores.

---

## HITO 2: Integración de Tag con el Prompt de IA

### Objetivo del Hito

Integrar la tabla `Tag` con el flujo de procesamiento de emails por IA, de forma que:

- Antes de llamar a OpenAI, se consulten todas las etiquetas existentes.
- La lista de etiquetas (`existingTags: string[]`) se pase a [`buildEmailProcessingPrompt()`](src/lib/prompts/email-processing.ts:147) tal como define [`NUEVOPROMPT.md`](doc/NUEVOPROMPT.md:147).
- La IA use este catálogo como referencia principal al etiquetar tareas.

### Entregables

- [ ] Consulta de etiquetas existentes desde `Tag` en la Server Action de IA.
- [ ] Uso de `existingTags` en [`buildEmailProcessingPrompt()`](src/lib/prompts/email-processing.ts:147) según [`NUEVOPROMPT.md`](doc/NUEVOPROMPT.md).
- [ ] Prompt final incluyendo siempre el bloque de “CATÁLOGO DE ETIQUETAS EXISTENTES”.

### Tareas

#### Backend – Server Actions IA

- [ ] Integrar lectura de `Tag` en [`processEmailsWithAI()`](src/actions/ai-processing.ts:105)
  - [ ] En el inicio de la función:
    ```ts
    const tags = await prisma.tag.findMany({
      orderBy: { descripcion: "asc" },
    });

    const existingTags = tags.map((t) => t.descripcion);
    ```
  - [ ] Asegurar que `existingTags` se pasa a [`buildEmailProcessingPrompt()`](src/lib/prompts/email-processing.ts:147), usando exactamente la firma descrita en [`NUEVOPROMPT.md`](doc/NUEVOPROMPT.md:147).

- [ ] Revisar integración en [`src/services/openai.ts`](src/services/openai.ts:1) (si aplica)
  - [ ] Confirmar que la construcción del prompt usa `existingTags`:
    ```ts
    const prompt = buildEmailProcessingPrompt(aiInputs, existingTags);
    ```

#### Testing

- [ ] Tests manuales con logs controlados
  - [ ] Caso 1: Tabla `Tag` vacía → el prompt debe contener la sección de “No hay etiquetas registradas en el sistema aún”.
  - [ ] Caso 2: Tabla `Tag` con etiquetas (`["reunion", "propuesta"]`) → el prompt debe listar esas etiquetas y el conteo total.

#### Documentación

- [ ] Actualizar documentación de Server Actions
  - [ ] En sección de servicios IA de [`SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md:1402), añadir que `processEmailsWithAI()`:
    - Consulta `Tag` para obtener `existingTags`.
    - Usa `existingTags` en el prompt para guiar el etiquetado.

### Dependencias

- **Internas:**  
  - HITO 1 completado (modelo y tabla `Tag` existentes).

- **Externas:**  
  - Configuración de OpenAI operativa (mock o real).
  - Implementación de [`buildEmailProcessingPrompt()`](src/lib/prompts/email-processing.ts:147) alineada con [`NUEVOPROMPT.md`](doc/NUEVOPROMPT.md:147).

### Consideraciones

- **Performance:**  
  - Se lee toda la tabla `Tag` por batch de IA. Si en el futuro el volumen crece, se podrá evaluar cache o segmentación (fuera del alcance actual).
- **Compatibilidad:**  
  - No se modifican estructuras de respuesta IA ni modelos de dominio; solo se enriquece el contexto del prompt.

---

## HITO 3: Persistencia de Nuevas Etiquetas Propuestas por IA

### Objetivo del Hito

Detectar etiquetas nuevas propuestas por IA en `tasks[].tags`, normalizarlas y registrarlas en la tabla `Tag`, evitando duplicados lógicos y manteniendo la coherencia con las reglas de [`TAGS_STRATEGY`](doc/NUEVOPROMPT.md:42).

### Entregables

- [ ] Función de normalización de etiquetas implementada (ej. [`normalizeTagLabel()`](src/lib/tag-utils.ts:1)).
- [ ] Extracción y deduplicación de etiquetas desde `tasks[].tags` en la respuesta IA.
- [ ] Inserción idempotente de nuevas etiquetas en `Tag`.
- [ ] Garantía de unicidad lógica mediante normalización + índice único en BD.

### Tareas

#### Backend – Lógica de Etiquetas

- [ ] Definir función de normalización [`normalizeTagLabel()`](src/lib/tag-utils.ts:1)
  - Archivo sugerido: `src/lib/tag-utils.ts`.
  - Reglas (alineadas con [`TAGS_STRATEGY`](doc/NUEVOPROMPT.md:42)):
    - Pasar a minúsculas.
    - Remover acentos/caracteres especiales.
    - Reemplazar espacios por guiones o eliminarlos (ej: `"migración datos"` → `"migracion-datos"`).
    - Limitar longitud si se requiere (ej. < 50 caracteres).
  - Ejemplo:
    ```ts
    export function normalizeTagLabel(raw: string): string {
      // Implementar normalización determinista
    }
    ```

- [ ] Extraer etiquetas desde la respuesta IA en [`processEmailsWithAI()`](src/actions/ai-processing.ts:105)
  - [ ] Dentro del loop por `analysis`:
    - Recolectar todas las `tags` de `analysis.tasks`.
    - Normalizarlas con [`normalizeTagLabel()`](src/lib/tag-utils.ts:1).
    - Acumular en un `Set<string>` por batch o por email.

- [ ] Comparar con `Tag` y determinar etiquetas nuevas
  - [ ] Consultar todas las etiquetas ya registradas que coincidan con las normalizadas.
  - [ ] Construir un conjunto de `newTags = normalizedTagsSet - existingTagsSet`.

- [ ] Insertar nuevas etiquetas en `Tag`
  - [ ] Usar transacciones de Prisma (dentro del mismo `prisma.$transaction` donde ya se persisten `EmailMetadata` y `Task`).
  - [ ] Para cada etiqueta en `newTags`:
    ```ts
    await tx.tag.create({ data: { descripcion: tag } });
    ```
  - [ ] Manejar conflictos de unicidad (dos procesos intentando crear la misma etiqueta:
    - Capturar error de constraint única y continuar (idempotencia).

#### Testing

- [ ] Tests de lógica de normalización
  - [ ] Verificar que variantes como `Reunión`, `reunion`, `REUNIÓN cliente` convergen al mismo valor normalizado, p.ej. `reunion-cliente` o `reunion`.
- [ ] Tests de inserción de etiquetas
  - [ ] Caso: etiquetas ya existentes → no se crean filas nuevas.
  - [ ] Caso: etiquetas múltiples repetidas en varias tareas → solo una inserción efectiva.

#### Documentación

- [ ] Actualizar sección de Flujos de Datos IA en [`SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md:765)
  - Agregar descripción del “Flujo de Etiquetas”:
    - Consulta catálogo.
    - IA propone tags.
    - Normalización.
    - Inserción en `Tag`.

### Dependencias

- **Internas:**  
  - HITO 1 (modelo `Tag`).
  - HITO 2 (integración con prompt IA).

- **Externas:** Ninguna adicional.

### Consideraciones

- **Integridad:**  
  - Los errores al guardar nuevas etiquetas no deben abortar el procesamiento de `EmailMetadata` y `Task`.  
  - Los errores se deben registrar (log) y el flujo principal debe completarse.

- **Fuera de alcance:**  
  - Refactorizar `Task.tags` para relación directa con `Tag` (migración relacional más profunda).
  - UI para ver/editar etiquetas.

---

## HITO 4: Validación, Consistencia y Documentación Técnica

### Objetivo del Hito

Validar el flujo completo de integración de la tabla `Tag` con la IA, asegurar consistencia de datos, añadir pruebas mínimas y actualizar la documentación técnica, de forma que el feature sea desplegable sin romper la funcionalidad existente.

### Entregables

- [ ] Flujo E2E validado (procesamiento IA + registro de etiquetas).
- [ ] Tests básicos de normalización e inserción de etiquetas.
- [ ] Documentación actualizada en [`SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md) y, si aplica, `CHANGELOG`.
- [ ] Feature listo para despliegue (compilación y linter sin errores).

### Tareas

#### Testing

- [ ] Pruebas E2E manuales
  - [ ] Importar emails → procesar con IA → revisar:
    - Que la IA use etiquetas existentes cuando corresponda.
    - Que nuevas etiquetas aparezcan en la tabla `Tag`.
  - [ ] Verificar que el procesamiento de IA no falla aunque haya colisiones en etiquetas (unicidad gestionada).

- [ ] Tests automatizados mínimos
  - [ ] Unit tests de [`normalizeTagLabel()`](src/lib/tag-utils.ts:1).
  - [ ] Test de integración de `Tag` en [`processEmailsWithAI()`](src/actions/ai-processing.ts:105) usando un mock de respuesta IA.

#### Documentación

- [ ] Actualizar [`SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md)
  - [ ] Sección 5.2 – Modelo de Datos: incluir el modelo `Tag`.
  - [ ] Sección 7 – Server Actions/IA: describir uso de `Tag` en procesamiento IA.
  - [ ] Sección 9.2 – Flujos IA: diagrama lógico del flujo de etiquetas.

- [ ] Actualizar `CHANGELOG` (si existe)
  - [ ] Nueva entrada indicando:
    - Añadido modelo `Tag`.
    - Integración de etiquetas con IA.
    - Normalización y deduplicación de etiquetas.

#### Validación de despliegue

- [ ] Ejecutar:
  - [ ] `npm run build`
  - [ ] `npm run lint`
  - [ ] Verificar que las migraciones están aplicadas en entornos de staging/producción antes de desplegar el código.

### Dependencias

- **Internas:**  
  - Hitos 1, 2 y 3 completados.

- **Externas:**  
  - Entorno que ejecute las migraciones de Prisma.
  - Infraestructura existente (PostgreSQL, OpenAI).

### Consideraciones

- **Performance:**  
  - Observar posibles impactos en el tiempo de procesamiento de IA debido a la lectura/escritura de `Tag`.  
- **Seguridad:**  
  - Aunque las etiquetas no representan datos sensibles, el flujo debe seguir las reglas generales de manejo de errores y validaciones descritas en [`SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md:872).

