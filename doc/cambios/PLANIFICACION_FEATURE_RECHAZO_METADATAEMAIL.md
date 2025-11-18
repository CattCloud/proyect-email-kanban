## Feature/Fix: Rechazo de resultados IA con metadata en Email

### Información General

**Tipo:** Feature

Este feature incorpora en el sistema la capacidad de que el usuario rechace explícitamente un análisis de IA asociado a un email, capture el motivo estructurado del rechazo y persista un snapshot completo del resultado descartado. Esta información se utilizará como contexto adicional en reprocesamientos posteriores, mejorando progresivamente la calidad de las respuestas de la IA.

El alcance se limita a:
- Extender el modelo de datos de [`Email`](prisma/schema.prisma:409) para almacenar el motivo de rechazo y el análisis previo.
- Ajustar las Server Actions y tipos asociados al flujo de revisión de resultados IA.
- Implementar un modal de UI para captura del rechazo con opciones predefinidas y texto libre.
- Integrar esta información en el prompt de reprocesamiento según lo definido en [`doc/NUEVOPROMPT.md`](doc/NUEVOPROMPT.md).

Quedan expresamente **fuera de alcance** de este feature:
- Historial de múltiples rechazos por email (solo se conservará el último rechazo).
- Métricas o reporting de rechazos a nivel de dashboard.
- Comparación automática de similitud (>90%) entre resultados de IA para mostrar alertas (mencionada como opcional en el diseño original).

### Objetivo

Permitir que, cuando un usuario rechaza un resultado de IA sobre un email, el sistema:
1. Registre el motivo del rechazo en un campo unificado [`rejectionReason`](prisma/schema.prisma).
2. Guarde el JSON completo del análisis descartado en [`previousAIResult`](prisma/schema.prisma).
3. Utilice ambos campos como contexto adicional en el siguiente reprocesamiento del email, modificando el prompt de forma explícita para evitar repetir errores anteriores.

### Resultado final esperado

Al finalizar este desarrollo:
- Cada email podrá almacenar, de forma opcional, el motivo del último rechazo de análisis y el resultado previo descartado mediante los campos [`rejectionReason`](prisma/schema.prisma) y [`previousAIResult`](prisma/schema.prisma).
- El flujo de revisión de resultados IA dispondrá de un modal claro y validado para capturar el rechazo (checkboxes + texto libre para “Otro”).
- Las Server Actions de procesamiento y revisión IA gestionarán correctamente estos campos (creación, actualización, borrado en caso de aceptación).
- El prompt utilizado para reprocesar un email incluirá, cuando corresponda, una sección adicional de **“Feedback de rechazo previo”** siguiendo la especificación de [`doc/FEATURE_RECHAZO_METADATAEMAIL.md`](doc/FEATURE_RECHAZO_METADATAEMAIL.md:17) y [`doc/NUEVOPROMPT.md`](doc/NUEVOPROMPT.md).

### Hitos del Proyecto

Este desarrollo se realizará en **4 hitos** secuenciales:

**HITO 1: Extensión de modelo de datos y tipos para rechazo de IA**  
Se actualiza el schema Prisma y los tipos TypeScript para incorporar los campos [`rejectionReason`](prisma/schema.prisma) y [`previousAIResult`](prisma/schema.prisma) en el modelo [`Email`](prisma/schema.prisma:409), incluyendo migraciones, seeds de ejemplo y adaptación mínima de Server Actions para que el sistema siga siendo consistente y desplegable.

**HITO 2: Ajustes de Server Actions de procesamiento y revisión IA**  
Se extienden las Server Actions del flujo de procesamiento IA para soportar la escritura y limpieza de los campos de rechazo, garantizando transacciones consistentes y validación Zod, sin todavía exponer la nueva UI de modal al usuario final.

**HITO 3: Implementación del modal de rechazo en la UI de revisión**  
Se integra un nuevo modal de rechazo en la pantalla de revisión de resultados IA, con checkboxes predefinidos, soporte de texto libre para “Otro”, validaciones de longitud y conexión con las Server Actions del Hito 2.

**HITO 4: Integración con el nuevo prompt y pruebas end-to-end**  
Se actualiza el generador de prompt de procesamiento de emails para incluir la sección de feedback de rechazo previo, se añaden pruebas automatizadas (mocks) y se actualiza la documentación técnica para reflejar el nuevo comportamiento.

---

## HITO 1: Extensión de modelo de datos y tipos para rechazo de IA

### Objetivo del Hito

Incorporar en el modelo [`Email`](prisma/schema.prisma:409) los campos opcionales [`rejectionReason`](prisma/schema.prisma) y [`previousAIResult`](prisma/schema.prisma), manteniendo la compatibilidad con datos existentes, y adaptar los tipos TypeScript y datos de ejemplo, de manera que el sistema pueda desplegarse con la nueva estructura sin requerir cambios inmediatos en la UI.

### Entregables

- [ ] Schema Prisma actualizado con campos de rechazo en [`Email`](prisma/schema.prisma:409).
- [ ] Migración Prisma creada y aplicada en entornos de desarrollo.
- [ ] Tipos TypeScript actualizados (por ejemplo [`EmailWithMetadata`](src/types/email.ts:487), tipos IA si corresponde).
- [ ] Seed de base de datos ajustado para incluir casos con y sin rechazo.
- [ ] Documentación actualizada en el Sistema Maestro sobre la nueva estructura de datos.

### Tareas

#### Backend – Base de Datos (Prisma)
- [ ] Diseñar y actualizar el modelo [`Email`](prisma/schema.prisma:409) en [`prisma/schema.prisma`](prisma/schema.prisma) para incluir:
  - [ ] Campo opcional [`rejectionReason`](prisma/schema.prisma) de tipo String? (motivo del rechazo: checkbox o texto libre).
  - [ ] Campo opcional [`previousAIResult`](prisma/schema.prisma) de tipo Json? (snapshot del análisis descartado).
- [ ] Verificar y ajustar índices si es necesario (no se esperan cambios de índice para estos campos en esta iteración).
- [ ] Crear una nueva migración Prisma para estos campos (por ejemplo `add_rejection_fields_to_email` en [`prisma/migrations/`](prisma/migrations/)).
- [ ] Ejecutar migraciones en entorno local y validar consistencia.

#### Backend – Tipos y Mapeos
- [ ] Actualizar la interfaz [`EmailWithMetadata`](src/types/email.ts:487) en [`src/types/email.ts`](src/types/email.ts) o crear un tipo equivalente que incluya:
  - [ ] Campo opcional `rejectionReason: string | null`.
  - [ ] Campo opcional `previousAIResult: unknown | null` (manteniendo la prohibición de `any`).
- [ ] Revisar si existen tipos específicos relacionados con resultados IA en [`src/types/ai.ts`](src/types/ai.ts) que deban reflejar la nueva información de rechazo (solo si es relevante para el dominio de tipos IA, no obligatorio).
- [ ] Verificar que los mapeos entre Prisma y los tipos expuestos a la UI (por ejemplo en [`src/actions/emails.ts`](src/actions/emails.ts)) contemplen los nuevos campos sin romper compatibilidad.

#### Datos de Ejemplo (Seed)
- [ ] Actualizar [`prisma/seed.ts`](prisma/seed.ts) para crear al menos:
  - [ ] Un email con [`rejectionReason`](prisma/schema.prisma) y [`previousAIResult`](prisma/schema.prisma) poblados, representando un rechazo típico (por ejemplo, “Tareas mal extraídas”).
  - [ ] Correos sin rechazo (campos null) para validar el comportamiento por defecto.

#### Documentación
- [ ] Actualizar la sección de modelo de datos en [`doc/SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md:395) para reflejar los nuevos campos de rechazo en [`Email`](prisma/schema.prisma:409).
- [ ] Dejar claramente indicado que solo se guarda el **último rechazo** (sobrescritura de valores anteriores).

### Dependencias
- **Internas:**
  - Ninguna, se construye sobre el modelo actual [`Email`](prisma/schema.prisma:409) descrito en [`prisma/schema.prisma`](prisma/schema.prisma:409).
- **Externas:**
  - Base de datos PostgreSQL operativa (Neon) y CLI de Prisma disponibles.

### Consideraciones
- **Migración:** Los campos se deben introducir como opcionales (String? y Json?) para ser totalmente compatibles con datos existentes.
- **Performance:** No se esperan impactos significativos; no se añaden índices nuevos en este hito.
- **Seguridad:** [`previousAIResult`](prisma/schema.prisma) puede contener datos sensibles del análisis IA; debe tratarse como cualquier otro contenido de email, sin ser expuesto fuera de los contextos de revisión autorizados.

---

## HITO 2: Ajustes de Server Actions de procesamiento y revisión IA

### Objetivo del Hito

Adaptar las Server Actions relacionadas con el procesamiento y revisión de resultados IA para soportar el flujo de rechazo, de modo que puedan leer y escribir los campos [`rejectionReason`](prisma/schema.prisma) y [`previousAIResult`](prisma/schema.prisma) de forma transaccional y validada, manteniendo la estructura actual de manejo de errores y resultados.

### Entregables

- [ ] Server Actions de revisión IA actualizadas para:
  - [ ] Registrar el rechazo de un resultado IA con [`rejectionReason`](prisma/schema.prisma) y [`previousAIResult`](prisma/schema.prisma).
  - [ ] Limpiar estos campos cuando un resultado sea finalmente aceptado.
- [ ] Validaciones Zod extendidas para inputs de rechazo.
- [ ] Contratos de tipos actualizados para las respuestas de las Server Actions.
- [ ] Documentación técnica del flujo de rechazo en el backend.

### Tareas

#### Backend – Server Actions IA
- [ ] Revisar las Server Actions existentes en [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts:1424), en particular:
  - [ ] [`processEmailsWithAI`](src/actions/ai-processing.ts:1426) – confirmar si requiere conocer [`previousAIResult`](prisma/schema.prisma) o solo se nutre de la lectura posterior en el generador de prompt.
  - [ ] [`getPendingAIResults`](src/actions/ai-processing.ts:1428) – garantizar que retorne, cuando aplique, los campos de rechazo para mostrarlos en la UI de revisión (solo lectura).
  - [ ] [`confirmAIResults`](src/actions/ai-processing.ts:1430) – extender la firma para soportar:
    - [ ] En caso de rechazo: parámetros adicionales [`rejectionReason`](prisma/schema.prisma) y snapshot del resultado IA a guardar en [`previousAIResult`](prisma/schema.prisma).
    - [ ] En caso de aceptación: limpieza de [`rejectionReason`](prisma/schema.prisma) y [`previousAIResult`](prisma/schema.prisma) para dejar el email aprobado sin marca de rechazo activa.
- [ ] Asegurar que cada operación que escriba en [`rejectionReason`](prisma/schema.prisma) / [`previousAIResult`](prisma/schema.prisma) se ejecute dentro de transacciones Prisma (por email), siguiendo el patrón existente en HITO 2 para [`processEmailsWithAI`](src/actions/ai-processing.ts:1426).

#### Validación y Tipos
- [ ] Definir o extender un schema Zod para la acción de confirmación/rechazo en [`src/actions/ai-processing.ts`](src/actions/ai-processing.ts) que valide:
  - [ ] [`rejectionReason`](prisma/schema.prisma): string no vacío, mínimo 10 caracteres si corresponde a texto libre de “Otro”.
  - [ ] Estructura base del resultado IA que será serializado en [`previousAIResult`](prisma/schema.prisma) (si se persiste desde la propia Server Action).
- [ ] Actualizar los tipos de respuesta de las Server Actions en [`src/types/ai.ts`](src/types/ai.ts) si estos tipos exponen los campos de rechazo hacia el frontend.

#### Integración con Emails “normales”
- [ ] Verificar compatibilidad con Server Actions de emails generales en [`src/actions/emails.ts`](src/actions/emails.ts), especialmente si se reutilizan para aprobación/actualización de metadata sin pasar por el flujo IA.
- [ ] Garantizar que las acciones que aprueban un email por fuera del flujo de revisión IA (por ejemplo [`approveEmail()`](src/actions/emails.ts:568) o equivalentes, si existe en la versión vigente) respeten la regla de:
  - [ ] Dejar [`rejectionReason`](prisma/schema.prisma) y [`previousAIResult`](prisma/schema.prisma) en null cuando se aprueba definitivamente un resultado.

#### Documentación
- [ ] Actualizar [`doc/SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md:553) en la sección de Servicios y Acciones del Backend para documentar:
  - [ ] Nuevos parámetros de entrada y salida en [`confirmAIResults`](src/actions/ai-processing.ts:1430) (y otras acciones afectadas).
  - [ ] Regla de sobrescritura del último rechazo.

### Dependencias
- **Internas:**
  - Hito 1 completado (schema Prisma actualizado y migraciones aplicadas).
  - Integración con OpenAI ya existente a través de [`src/services/openai.ts`](src/services/openai.ts).
- **Externas:**
  - Ninguna adicional; se trabaja sobre la infraestructura ya configurada.

### Consideraciones
- **Manejo de errores:** Mantener el patrón uniforme descrito en [`doc/SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md:615), devolviendo errores amigables y nunca datos sensibles.
- **Atomicidad:** Cada rechazo debe dejar el email en un estado consistente (campos de rechazo poblados, metadata IA coherente con el snapshot guardado).

---

## HITO 3: Implementación del modal de rechazo en la UI de revisión

### Objetivo del Hito

Incorporar un modal de rechazo en la interfaz de revisión de resultados IA que permita seleccionar el motivo de rechazo mediante checkboxes predefinidos, más un campo de texto libre obligatorio cuando el usuario elige “Otro”, aplicando validaciones de longitud y conectando la interacción de usuario con las Server Actions del Hito 2.

### Entregables

- [ ] Nuevo componente de modal de rechazo implementado e integrado en la vista de revisión IA.
- [ ] Lógica de selección de motivos (checkboxes) y textarea “Otro” funcional y validada.
- [ ] Integración completa con la Server Action de confirmación/rechazo.
- [ ] Estados de loading, error y éxito (feedback visual al usuario).

### Tareas

#### Frontend – Componentes y Páginas
- [ ] Analizar la estructura actual de la vista de revisión en [`src/app/(protected)/processing/review/page.tsx`](src/app/(protected)/processing/review/page.tsx) y componentes relacionados:
  - [ ] [`EmailReviewCard`](src/components/processing/EmailReviewCard.tsx)
  - [ ] [`ReviewAccordion`](src/components/processing/ReviewAccordion.tsx)
- [ ] Diseñar un nuevo componente de modal de rechazo, siguiendo el sistema de diseño existente:
  - [ ] Uso de componentes base de UI (por ejemplo [`button`](src/components/ui/button.tsx)) y estilos definidos en [`src/app/globals.css`](src/app/globals.css).
  - [ ] Estructura del modal alineada con la lógica del pseudocódigo descrito en [`doc/FEATURE_RECHAZO_METADATAEMAIL.md`](doc/FEATURE_RECHAZO_METADATAEMAIL.md:101).
- [ ] Implementar el modal con:
  - [ ] Lista de opciones de rechazo (checkbox/radio) con valores:
    - [ ] &#34;Categoría incorrecta&#34;.
    - [ ] &#34;Prioridad mal asignada&#34;.
    - [ ] &#34;Tareas mal extraídas&#34;.
    - [ ] &#34;Resumen poco útil&#34;.
    - [ ] &#34;Otro&#34;.
  - [ ] Textarea que se muestre únicamente si se selecciona “Otro”.
  - [ ] Mensajes de error en UI cuando el texto libre tenga menos de 10 caracteres.
- [ ] Conectar el botón de “Rechazar” en la vista de revisión IA para que:
  - [ ] Abra el modal.
  - [ ] Envíe los datos válidos a la Server Action [`confirmAIResults`](src/actions/ai-processing.ts:1430) (o acción específica de rechazo si se define una separada).

#### Validación y UX
- [ ] Implementar validaciones client-side consistentes con las reglas definidas en [`doc/FEATURE_RECHAZO_METADATAEMAIL.md`](doc/FEATURE_RECHAZO_METADATAEMAIL.md:119):
  - [ ] Textarea obligatorio y mínimo 10 caracteres cuando se selecciona “Otro”.
- [ ] Mostrar feedback claro al usuario:
  - [ ] Estado de carga mientras se envía la acción.
  - [ ] Mensaje de éxito cuando el rechazo se registra correctamente.
  - [ ] Mensaje de error amigable si la Server Action falla.
- [ ] Asegurar accesibilidad:
  - [ ] Roles ARIA apropiados para el modal.
  - [ ] Foco inicial en el modal y cierre con teclado (Esc).

#### Integración con Estado y Navegación
- [ ] Actualizar el estado local/global de la vista de revisión para reflejar el rechazo:
  - [ ] Marcar el resultado actual como rechazado y, si aplica, solicitar un reprocesamiento posterior (sin implementarlo aún si el flujo está definido en otro feature).
- [ ] Verificar interacción con la navegación existente (por ejemplo, lista de correos pendientes de revisión).

### Dependencias
- **Internas:**
  - Hitos 1 y 2 completados (campos y Server Actions disponibles).
  - Componentes del sistema de diseño ya implementados en [`src/components/ui/`](src/components/ui/).
- **Externas:**
  - Ninguna adicional.

### Consideraciones
- **Consistencia visual:** El modal debe respetar el sistema de diseño (colores, tipografías, espaciados) definido en [`src/app/globals.css`](src/app/globals.css:652).
- **Fuera de alcance:** No se implementarán en este hito pantallas adicionales de histórico de rechazos ni filtros por motivo de rechazo.

---

## HITO 4: Integración con el nuevo prompt y pruebas end-to-end

### Objetivo del Hito

Integrar los campos [`rejectionReason`](prisma/schema.prisma) y [`previousAIResult`](prisma/schema.prisma) en el proceso de generación de prompt para reprocesar emails con IA, añadiendo la sección de **“Feedback de rechazo previo”** únicamente cuando existan ambos campos, y cubrir el flujo completo con pruebas automatizadas y documentación actualizada.

### Entregables

- [ ] Generador de prompt actualizado según especificación de [`doc/NUEVOPROMPT.md`](doc/NUEVOPROMPT.md) y [`doc/FEATURE_RECHAZO_METADATAEMAIL.md`](doc/FEATURE_RECHAZO_METADATAEMAIL.md:59).
- [ ] Tests automatizados que verifiquen la inclusión y exclusión de la sección de feedback según los casos.
- [ ] Documentación técnica actualizada del flujo de reprocesamiento con feedback de rechazo.

### Tareas

#### Backend – Generación de Prompt
- [ ] Revisar el generador de prompt actual en [`src/lib/prompts/email-processing.ts`](src/lib/prompts/email-processing.ts) para:
  - [ ] Localizar el punto donde se construye el prompt principal de análisis de emails.
  - [ ] Integrar la nueva sección **“FEEDBACK DE RECHAZO PREVIO”** solo cuando:
    - [ ] [`rejectionReason`](prisma/schema.prisma) no sea null ni cadena vacía.
    - [ ] [`previousAIResult`](prisma/schema.prisma) contenga un JSON válido del análisis anterior.
- [ ] Implementar la sección siguiendo el formato definido en [`doc/FEATURE_RECHAZO_METADATAEMAIL.md`](doc/FEATURE_RECHAZO_METADATAEMAIL.md:63), asegurando:
  - [ ] Interpolación correcta de [`rejectionReason`](prisma/schema.prisma).
  - [ ] Serialización segura de [`previousAIResult`](prisma/schema.prisma) a texto (por ejemplo mediante JSON.stringify con control de longitud si aplica).
- [ ] Asegurar que el prompt resultante respete las restricciones de longitud de la API de OpenAI ya consideradas en el sistema.

#### Backend – Lógica de Reprocesamiento
- [ ] Verificar que la Server Action [`processEmailsWithAI`](src/actions/ai-processing.ts:1426) o equivalente:
  - [ ] Utilice, para cada email que se reprocesa, los campos [`rejectionReason`](prisma/schema.prisma) y [`previousAIResult`](prisma/schema.prisma) como parte del contexto enviado al generador de prompt.
  - [ ] No genere la sección de feedback cuando el email nunca ha sido rechazado (ambos campos null).
- [ ] Confirmar que, tras reprocesar un email, el sistema mantiene el último rechazo registrado hasta que el usuario acepte un resultado (limpiando los campos en [`confirmAIResults`](src/actions/ai-processing.ts:1430)).

#### Testing
- [ ] Extender o crear pruebas en:
  - [ ] [`src/tests/openai.mock.test.ts`](src/tests/openai.mock.test.ts) para validar el formato del prompt generado con y sin feedback de rechazo.
  - [ ] [`src/tests/ai-processing.mock.test.ts`](src/tests/ai-processing.mock.test.ts) para cubrir:
    - [ ] Caso email sin rechazo previo (no se incluye sección nueva).
    - [ ] Caso email con rechazo previo (se incluye sección con motivo y JSON anterior).
    - [ ] Caso de múltiples reprocesamientos donde solo el último rechazo es considerado.
- [ ] Ejecutar el comando npm run test (cuando esté disponible) o los comandos de testing definidos, y documentar el resultado.

#### Documentación
- [ ] Actualizar [`doc/SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md:786) en las secciones de:
  - [ ] Flujos de datos y procesos clave (anexar la mención del uso de feedback de rechazo en reprocesamiento).
  - [ ] Inteligencia Artificial (describir cómo el rechazo previo modifica el prompt).
- [ ] Añadir, si corresponde, una breve nota en [`doc/FEATURE2_PROCESAMIENTO_IA.md`](doc/FEATURE2_PROCESAMIENTO_IA.md) para mantener alineado el diseño global de procesamiento IA con esta nueva capacidad (sin duplicar especificaciones).

### Dependencias
- **Internas:**
  - Hitos 1, 2 y 3 completados.
  - Servicio de OpenAI y tipos IA ya implementados en [`src/services/openai.ts`](src/services/openai.ts) y [`src/types/ai.ts`](src/types/ai.ts).
- **Externas:**
  - API de OpenAI accesible en entornos donde se ejecuten pruebas de integración reales (opcional, se pueden usar mocks).

### Consideraciones
- **Fuera de alcance:** No se implementará en este feature la lógica opcional de comparar el nuevo resultado IA con [`previousAIResult`](prisma/schema.prisma) para detectar alta similitud (>90%) ni las notificaciones asociadas; esto se documenta como posible extensión futura.
- **Seguridad:** Asegurar que los logs nunca impriman el contenido completo de [`previousAIResult`](prisma/schema.prisma) para evitar exposición accidental de datos sensibles.

---

## Resumen de criterios de completitud del feature

El feature se considerará completamente implementado cuando:
- [ ] Todas las migraciones relacionadas con [`rejectionReason`](prisma/schema.prisma) y [`previousAIResult`](prisma/schema.prisma) estén aplicadas y verificadas.
- [ ] El usuario pueda rechazar un resultado IA desde la UI de revisión utilizando el modal descrito, con validaciones correctas.
- [ ] Los rechazos queden registrados en base de datos y sean utilizados como contexto en reprocesamientos posteriores a través del nuevo prompt.
- [ ] Las pruebas automatizadas relacionadas con generación de prompt y flujo de rechazo/reprocesamiento pasen correctamente.
- [ ] La documentación en [`doc/SISTEMA_MAESTRO_PROYECTOV2.md`](doc/SISTEMA_MAESTRO_PROYECTOV2.md) y documentos de feature esté actualizada y consistente.