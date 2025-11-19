# Planificación de Desarrollo: Filtrado de Correos No Procesables

**Fecha de creación:** 18 de Noviembre, 2025  
**Versión:** 1.0.0  
**Responsable:** Equipo de Desarrollo  
**Revisado por:** Sistema Maestro v3.x

---

## Feature/Fix: Filtrado de Correos No Procesables

### Información General

**Tipo:** Feature

El sistema ya permite importar correos reales desde Gmail para cada usuario e insertarlos en la tabla `Email` (ver modelo en [`schema.prisma`](prisma/schema.prisma:420)) a través de la Server Action [`importGmailInboxForCurrentUser`](src/actions/gmail.ts:214). Sin embargo, muchos de esos correos contienen contenido no adecuado para el procesamiento IA (solo imágenes, HTML casi vacío, notificaciones automáticas, tracking, etc.), lo que introduce ruido en la experiencia y desperdicia recursos de IA.

La propuesta funcional detallada en [`TAREA_FILTRADO_CORREOS_NOPROCESABLES.md`](doc/TAREA_FILTRADO_CORREOS_NOPROCESABLES.md:1) define una arquitectura de filtrado en dos capas:

- **Capa 1 (Gmail API):** reducir volumen desde la consulta con una query optimizada que excluye categorías de Gmail irrelevantes para negocio.  
- **Capa 2 (Código del sistema):** validar, a partir del cuerpo textual del email, si el contenido es procesable por IA y marcar el correo como procesable o no.

Este feature se centra únicamente en implementar esa estrategia de filtrado, sin modificar la lógica principal de procesamiento IA ni otros dominios (Kanban, revisión IA, etc.), salvo lo estrictamente necesario para impedir que correos no procesables lleguen a la IA o saturen la UI.

**Alcance:**

- Añadir un flag semántico `isProcessable` al modelo `Email` para distinguir correos aptos o no para IA.  
- Optimizar la query de Gmail utilizada en la importación para excluir categorías poco útiles (promociones, social, updates).  
- Implementar lógica de validación de contenido textual (Capa 2) durante la importación desde Gmail.  
- Ajustar las Server Actions y la UI para que solo correos `isProcessable = true` se muestren en `/emails` y sean candidatos a procesamiento IA.

**Fuera de alcance (solo mencionados):**

- Cambios en el modelo de IA o en los prompts de procesamiento.  
- Procesar adjuntos (PDF, imágenes) con IA.  
- Interfaces avanzadas para inspeccionar y recuperar correos no procesables.  
- Cualquier lógica de clasificación semántica avanzada que requiera nuevos modelos IA específicos.

### Objetivo

Diseñar e implementar un sistema de filtrado que garantice que **solo correos con contenido textual suficiente y relevante**:

- Se muestren en la bandeja `/emails`.  
- Sean elegibles para el flujo de procesamiento IA definido en [`FEATURE2_PROCESAMIENTO_IA.md`](doc/FEATURE2_PROCESAMIENTO_IA.md:1).  
- No introduzcan ruido ni desperdicien tokens procesando spam, promociones, correos vacíos o con solo imágenes/URLs.

### Resultado final esperado

Al finalizar este feature:

- La importación desde Gmail usará una **query optimizada**:  
  `in:inbox newer_than:7d -category:promotions -category:social -category:updates`.  
- Cada email importado desde Gmail se almacenará con un flag `isProcessable` que indica si contiene texto útil suficiente para IA.  
- La bandeja `/emails` mostrará por defecto solamente correos `isProcessable = true`.  
- Las Server Actions de IA (`getUnprocessedEmails`, `processEmailsWithAI`, etc.) solo operarán sobre correos `isProcessable = true`.  
- Correos no procesables seguirán almacenados (para evitar reimportes y mantener trazabilidad), pero permanecerán ocultos del flujo estándar y nunca llegarán a IA.

---

## Hitos del Proyecto

Este desarrollo se realizará en **3 hitos** secuenciales:

**HITO 1: Extensión del modelo de datos e integración Gmail para marcar correos procesables**  
Definir el campo `isProcessable` en `Email`, ajustar migraciones y asegurar que todas las rutas de ingreso de emails (especialmente importación Gmail) lo establezcan explícitamente, manteniendo el sistema estable aunque la lógica de filtrado semántico aún no esté activa.

**HITO 2: Implementación de la Capa 2 de filtrado (validación de contenido) y protección del pipeline IA**  
Implementar la lógica de negocio que decide si un correo es procesable a partir de su cuerpo textual, integrarla en la importación Gmail, y adaptar las Server Actions de IA para trabajar únicamente con correos procesables.

**HITO 3: Ajustes de UI y feedback al usuario sobre correos ocultos/no procesables**  
Adaptar la bandeja `/emails` y los mensajes del bloque de conexión Gmail para reflejar el nuevo comportamiento: mostrar solo correos procesables, indicar que algunos correos se han ocultado por ser no procesables y mejorar los mensajes de resultados de importación.

---

## HITO 1: Extensión del modelo de datos e integración Gmail para marcar correos procesables

### Objetivo del Hito

Introducir en la base de datos el concepto de **correo procesable** mediante un nuevo campo en `Email`, y asegurar que la importación desde Gmail y cualquier otra fuente establezcan este flag de forma consistente (aunque inicialmente se marque todo como procesable). El sistema debe seguir funcionando como hasta ahora, sin filtrar aún por contenido.

### Entregables

- [ ] Campo `isProcessable Boolean @default(true)` añadido al modelo `Email` en [`schema.prisma`](prisma/schema.prisma:420).  
- [ ] Migración Prisma creada y aplicada para reflejar el nuevo campo en la base de datos.  
- [ ] Server Action [`importGmailInboxForCurrentUser`](src/actions/gmail.ts:214) actualizada para asignar explícitamente `isProcessable` al crear nuevos `Email`.  
- [ ] Server Action [`importEmailsFromJSON`](src/actions/emails.ts:532) actualizada para establecer `isProcessable = true` en todos los emails importados por JSON.  
- [ ] Documentación interna breve del nuevo campo y su semántica en este feature.

### Tareas

#### Backend – Modelo y migración Prisma

- [ ] Actualizar modelo `Email` en [`schema.prisma`](prisma/schema.prisma:420):
  - [ ] Añadir campo:
  - ```prisma
    model Email {
      // ...
      isProcessable Boolean @default(true)
    }
    ```
- [ ] Crear migración:
  - [ ] Ejecutar `npx prisma migrate dev --name add_is_processable_to_email`.  
  - [ ] Verificar en BD que el campo `is_processable` aparece con `DEFAULT true`.

#### Backend – Integración con importaciones existentes

- [ ] Actualizar [`importGmailInboxForCurrentUser`](src/actions/gmail.ts:214) para incluir `isProcessable` en los `data` de creación de `Email` (inicialmente siempre `true` en este hito).  
- [ ] Actualizar [`importEmailsFromJSON`](src/actions/emails.ts:532) para que todos los emails importados manualmente se creen con `isProcessable = true`.  
- [ ] Confirmar que no existe otra ruta de creación de `Email` sin `isProcessable` (p. ej. `createEmail` en [`emails.ts`](src/actions/emails.ts:171)) y ajustarla si corresponde.

#### Testing

- [ ] Ejecutar `npm run build` para verificar que no hay errores de tipos tras el cambio de modelo.  
- [ ] Importar emails desde JSON y desde Gmail y comprobar que los nuevos registros tienen `isProcessable = true`.  
- [ ] Verificar que `/emails` sigue mostrando todos los correos como antes (el filtrado se aplicará en Hito 3).

### Dependencias

- **Internas:**  
  - Importación Gmail funcional (`importGmailInboxForCurrentUser`) ya implementada.  
  - Flujo de importación JSON ya operativo.  
- **Externas:**  
  - Base de datos accesible y migraciones Prisma funcionando.

### Consideraciones

- Este hito no cambia el comportamiento visible para el usuario final; introduce únicamente la nueva columna y la prepara para ser utilizada en los hitos siguientes.  
- El valor por defecto `true` garantiza compatibilidad hacia atrás con datos existentes.

---

## HITO 2: Implementación de la Capa 2 de filtrado y protección del pipeline IA

### Objetivo del Hito

Implementar la lógica de negocio que analiza el contenido textual del email (a partir del cuerpo extraído de Gmail) para decidir si el correo es procesable o no, marcando `isProcessable` en consecuencia durante la importación. Además, asegurar que el pipeline de IA solo considere correos procesables.

### Entregables

- [ ] Función de dominio `isEmailProcessableFromText(body: string): boolean` implementada y testeada.  
- [ ] Actualización de [`importGmailInboxForCurrentUser`](src/actions/gmail.ts:214) para:
  - [ ] Evaluar el cuerpo textual de cada correo importado.  
  - [ ] Establecer `isProcessable = true/false` según las reglas del documento de tarea.  
- [ ] Ajustes en Server Actions de IA en [`ai-processing.ts`](src/actions/ai-processing.ts:511) para filtrar por `isProcessable = true`.  
- [ ] Mínimo smoke test E2E: importar Gmail → ver `/emails` → lanzar procesamiento IA sobre correos procesables.

### Tareas

#### Backend – Lógica de filtrado semántico

- [ ] Implementar `isEmailProcessableFromText` en un módulo adecuado (puede ser [`src/actions/gmail.ts`](src/actions/gmail.ts:214) o un helper en [`src/lib/`](src/lib/utils.ts:1)):
  - [ ] Regla 1: cuerpo vacío → retornar `false`.  
  - [ ] Regla 2: longitud mínima (ej. `< 20` caracteres significativos) → `false`.  
  - [ ] Regla 3: cuerpo compuesto únicamente por URLs (`/^(https?:\/\/[^\s]+\s*)+$/`) → `false`.  
  - [ ] Regla 4: si el cuerpo es HTML, limpiar tags (`/<[^>]*>/g`) y aplicar de nuevo las reglas de longitud mínima.  
  - [ ] En cualquier otro caso → `true`.

- [ ] Integrar esta función en la importación Gmail:
  - [ ] Reutilizar el texto extraído en `mapGmailMessageToEmailInput` (ya se obtiene `body` como string).  
  - [ ] Calcular `const isProcessable = isEmailProcessableFromText(body)`.  
  - [ ] Al crear `Email` en `importGmailInboxForCurrentUser`, persistir ese valor en `isProcessable`.

#### Backend – Protección del pipeline IA

- [ ] Revisar Server Actions en [`ai-processing.ts`](src/actions/ai-processing.ts:511):
  - [ ] `getUnprocessedEmails`, `getPendingAIResults`, `getPendingAllAIResults` y cualquier consulta que liste candidatos a IA.  
  - [ ] Añadir condición `isProcessable: true` en los filtros `where` de `Email`.  
- [ ] Verificar que las consultas de Kanban y dashboard (si basadas en `Email`) no asumen implícitamente que todos los emails son procesables; decidir si deben usar o no el flag (respetando siempre el alcance: no cambiar lógica de Kanban salvo que se base explícitamente en el conjunto “procesables”).

#### Testing

- [ ] Importar una bandeja Gmail con casos variados:
  - [ ] Emails con texto claro (deben quedar `isProcessable = true`).  
  - [ ] Emails vacíos / solo imágenes / solo links (deben quedar `false`).  
- [ ] Confirmar en BD (via Prisma Studio o consultas) que `Email.isProcessable` refleja correctamente las reglas.  
- [ ] Intentar lanzar procesamiento IA sobre todos los correos; verificar que solo los marcados como procesables son considerados en el listado de candidatos.

### Dependencias

- **Internas:**  
  - Hito 1 completo (campo `isProcessable` operativo en BD y en la capa de importación).  
  - Integración Gmail y pipeline IA funcionando.  
- **Externas:**  
  - Ninguna adicional, más allá de Gmail API ya configurada.

### Consideraciones

- La heurística inicial puede descartar algunos correos borderline (ej. mensajes muy cortos pero relevantes). Esto debe aceptarse como compromiso MVP.  
- Se recomienda registrar métricas básicas (por ejemplo, counts de procesables vs no procesables) para refinar las reglas en futuros features (fuera de alcance de este).

---

## HITO 3: Ajustes de UI y feedback sobre correos ocultos/no procesables

### Objetivo del Hito

Adaptar la UI para:

- Mostrar únicamente correos procesables en la bandeja estándar.  
- Comunicar al usuario que existen correos ocultos por ser promociones, notificaciones o correos sin contenido útil.  
- Mejorar los mensajes de importación desde Gmail para indicar cuántos correos se descartaron por filtros.

### Entregables

- [ ] `getEmails` en [`emails.ts`](src/actions/emails.ts:116) filtrando por `isProcessable = true` en la lista principal.  
- [ ] Banner informativo en [`EmailTable`](src/components/emails/EmailTable.tsx:68) explicando que algunos correos se han ocultado por ser no procesables.  
- [ ] Actualización de los mensajes en [`GmailConnectionStatus`](src/components/emails/GmailConnectionStatus.tsx:25) para incluir estadísticas (correos importados vs descartados) cuando estén disponibles.  
- [ ] (Opcional) Action para obtener contador de emails `isProcessable = false` a mostrar en el banner.

### Tareas

#### Backend – Server Actions de listado

- [ ] Modificar `getEmails` en [`src/actions/emails.ts`](src/actions/emails.ts:116) para incluir `isProcessable: true` en el `where`.  
- [ ] Crear (si se decide) una Server Action `getNonProcessableEmailsCountForCurrentUser` que devuelva el número de emails `isProcessable = false` para el usuario actual.

#### Frontend – Bandeja de emails

- [ ] En [`EmailTable`](src/components/emails/EmailTable.tsx:68), debajo de `GmailConnectionStatus`, añadir un banner tipo:
  - “Algunos correos de tu Gmail (promocionales o sin contenido) se han ocultado automáticamente para centrarse en correos de negocio.”  
  - Opcionalmente, si existe contador:
    - “ℹ️ {count} correos ocultos (promocionales o sin contenido). Revísalos en tu Gmail si los necesitas.”

- [ ] Ajustar `GmailConnectionStatus` para mostrar mensajes más ricos tras la importación:
  - “[...] Se importaron X correos nuevos, Y descartados por filtros.” cuando `GmailImportResult` incluya esta información.  
  - “No hay nuevos correos de negocio en los últimos 7 días.” cuando `imported = 0` y hubo correos descartados.

#### Testing – UX

- [ ] Importar correos desde Gmail y confirmar que:
  - La tabla solo muestra correos con contenido claro.  
  - El banner indica la existencia de correos ocultos.  
  - Los mensajes de estado de importación son coherentes con la realidad (importados vs descartados).  
- [ ] Verificar que el comportamiento existente (procesamiento IA, revisión, Kanban) se mantiene para correos procesables.

### Dependencias

- **Internas:**  
  - Hitos 1 y 2 completados (campo `isProcessable` y lógica de filtrado ya activos).  
- **Externas:**  
  - Ninguna adicional.

### Consideraciones

- La UI no debe intentar exponer el listado detallado de correos no procesables en este feature; basta con indicar su existencia y naturaleza general.  
- Si en el futuro se implementa una vista de auditoría de todos los correos, puede reutilizar el campo `isProcessable` para ofrecer filtros adicionales (explicitado como futura extensión fuera de alcance).

---

## Supuestos, riesgos y criterios de completitud

### Supuestos

1. La integración actual con Gmail (importación por usuario, con `idEmail` único) ya está funcionando correctamente.  
2. La mayoría de los correos de negocio contienen suficiente texto para pasar las reglas básicas de `isEmailProcessableFromText`.  
3. El equipo acepta que algunos correos límite puedan ser descartados en el MVP, a cambio de mayor limpieza general.

### Riesgos

| Riesgo                                              | Probabilidad | Impacto | Mitigación                                                                 |
|-----------------------------------------------------|--------------|---------|----------------------------------------------------------------------------|
| Correos de negocio muy breves marcados como no procesables | Media        | Alto    | Ajustar umbrales de longitud tras medición real; permitir tuning futuro.  |
| Usuarios confundidos por correos que no aparecen en `/emails` | Media        | Medio   | Banner claro y mensaje indicando que pueden revisar directamente en Gmail. |
| Regla de solo URLs demasiado agresiva              | Baja         | Medio   | Revisar muestras reales y ajustar patrón si es necesario.                 |
| Complejidad adicional en importación Gmail         | Baja         | Bajo    | Mantener lógica encapsulada y fuertemente tipada.                         |

### Criterios de completitud del feature

El feature se considera completo cuando:

1. ✅ El modelo `Email` cuenta con `isProcessable` y todas las rutas de creación asignan un valor consistente.  
2. ✅ La importación desde Gmail aplica tanto Capa 1 (query optimizada) como Capa 2 (validación de contenido) y marca `isProcessable` adecuadamente.  
3. ✅ El pipeline IA (Server Actions en [`ai-processing.ts`](src/actions/ai-processing.ts:511)) solo opera sobre correos `isProcessable = true`.  
4. ✅ La bandeja `/emails` muestra por defecto solo correos procesables, con un banner claro sobre correos ocultos.  
5. ✅ Los correos no procesables se almacenan una única vez (no se reimportan) y no llegan al procesamiento IA.  
6. ✅ `npm run build` y los smoke tests básicos (importación Gmail → emails → IA → Kanban) pasan sin errores y respetan la nueva semántica.