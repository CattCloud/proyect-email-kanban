## 🎯 Propuesta Final Refinada: Filtrado de Correos No Procesables

### ✅ Análisis de la Decisión

**Decisión correcta y alineada con el objetivo del sistema** (procesar correos de negocio). La estrategia de dos capas es sólida.

---

## 📋 Estructura de Filtrado en Dos Capas

### **CAPA 1: Filtros de Gmail API (Query optimizada)**

**Objetivo:** Traer SOLO correos útiles desde el origen, reduciendo volumen y costos de procesamiento.

**Filtros Gmail disponibles y recomendados:**

```
Query base actual: "in:inbox newer_than:7d"

Query optimizada propuesta:
"in:inbox newer_than:7d -category:promotions -category:social -category:updates"
```

**Filtros Gmail nativos aplicables:**

| Filtro | Sintaxis | Justificación |
|--------|----------|---------------|
| **Excluir promociones** | `-category:promotions` | Elimina 80% del spam comercial |
| **Excluir redes sociales** | `-category:social` | Notificaciones de Facebook, LinkedIn, etc. |
| **Excluir actualizaciones** | `-category:updates` | Newsletters automáticos, confirmaciones |
| **Solo con texto** | `has:nouserlabels` (NO funciona para esto) | ❌ Gmail NO tiene filtro nativo "solo texto" |

**Limitación crítica identificada:**
- ❌ Gmail API **NO puede filtrar por "correos con imágenes vs solo texto"** en la query
- ✅ Esta detección DEBE hacerse en CAPA 2 (código del sistema)

**Query final recomendada para CAPA 1:**
```
"in:inbox newer_than:7d -category:promotions -category:social -category:updates"
```

---

### **CAPA 2: Validación en Código del Sistema**

**Objetivo:** Detectar y descartar correos no procesables ANTES de mostrarlos en la tabla de emails.

**Criterios de descarte (validación post-importación):**

| Criterio | Detección | Acción |
|----------|-----------|--------|
| **Sin cuerpo de texto** | `body === null` o `body.trim().length === 0` | Marcar como no procesable |
| **Solo imágenes** | Cuerpo HTML sin texto plano extraíble (ej: solo tags `<img>`) | Marcar como no procesable |
| **Correo vacío** | `subject` vacío Y `body` vacío | Marcar como no procesable |
| **Contenido binario/adjuntos pesados** | Detectar si Gmail devolvió `payload.parts` con solo attachments | Marcar como no procesable |

---

## 🗄️ Ajuste al Modelo de Datos

**Campo nuevo en tabla `Email`:**

```typescript
// Agregar a schema.prisma
model Email {
  // ... campos existentes
  isProcessable  Boolean  @default(true)  // ← NUEVO
}
```

**Valores:**
- `isProcessable = true`: Correo válido, se muestra en `/emails` y puede procesarse con IA
- `isProcessable = false`: Correo descartado, se guarda en BD (para control de `idEmail`) pero NO se muestra en tabla

**Alternativa sin campo nuevo (usando estados existentes):**
```typescript
// Opción B: Reutilizar campo existente
processedAt = "1970-01-01"  // Marca especial "descartado por filtro"
```
❌ **NO recomendado**: confunde semántica de "procesado por IA" con "descartado por filtro"

---

## 🔄 Flujo de Importación Actualizado

```
1. Gmail API con query optimizada
   ↓
2. Obtener messageId list (ya filtrados por categorías Gmail)
   ↓
3. Para cada messageId:
   a. Obtener detalle completo
   b. Extraer texto del cuerpo (payload.parts analysis)
   c. VALIDAR criterios CAPA 2:
      ✅ Si tiene texto útil → isProcessable = true
      ❌ Si solo imágenes/vacío → isProcessable = false
   d. Persistir en BD con flag correspondiente
   ↓
4. Actualizar lastSyncAt
   ↓
5. En UI (/emails):
   - Filtrar WHERE isProcessable = true
   - Mostrar mensaje: "X correos ocultos (promocionales/sin contenido)"
```

---

## 📊 Lógica de Detección de "Solo Texto Útil"

**Algoritmo propuesto para CAPA 2:**

```typescript
// Pseudocódigo de validación
function isEmailProcessable(gmailMessage): boolean {
  const textBody = extractTextFromPayload(gmailMessage.payload);
  
  // Regla 1: Cuerpo completamente vacío
  if (!textBody || textBody.trim().length === 0) {
    return false;
  }
  
  // Regla 2: Cuerpo muy corto (menos de 20 caracteres)
  if (textBody.trim().length < 20) {
    return false;
  }
  
  // Regla 3: Solo contiene URLs (correos automáticos de tracking)
  const urlPattern = /^(https?:\/\/[^\s]+\s*)+$/;
  if (urlPattern.test(textBody.trim())) {
    return false;
  }
  
  // Regla 4: HTML sin texto (solo tags <img>, <a> sin contenido)
  const htmlWithoutTags = textBody.replace(/<[^>]*>/g, '').trim();
  if (htmlWithoutTags.length < 20) {
    return false;
  }
  
  return true; // ✅ Correo procesable
}
```

---

## 🎨 Cambios en la UI

**Tabla de Emails (`/emails`):**

| Cambio | Implementación |
|--------|----------------|
| **Filtrar correos** | Query Prisma: `WHERE isProcessable = true` |
| **Contador de ocultos** | Banner superior: "ℹ️ 12 correos ocultos (promocionales o sin contenido)" |
| **Opción de ver todos** | Toggle opcional "Mostrar correos descartados" (lectura, no procesables) |

**Importación Gmail:**

| Estado | Mensaje UI |
|--------|-----------|
| Importando | "Importando correos de negocio desde Gmail..." |
| Finalizado | "✅ 15 correos importados, 8 descartados (promociones/imágenes)" |
| Sin nuevos | "No hay nuevos correos de negocio en los últimos 7 días" |

---

## ⚡ Ventajas del Diseño

| Aspecto | Beneficio |
|---------|-----------|
| **Eficiencia** | CAPA 1 reduce 70-80% del volumen desde Gmail |
| **Precisión** | CAPA 2 detecta casos edge (solo imágenes, vacíos) |
| **BD limpia** | Correos descartados se guardan (control `idEmail`) pero no saturan UI |
| **Costos IA** | Evita procesar spam/promocionales con OpenAI |
| **UX clara** | Usuario entiende por qué no ve ciertos correos |

---

## 🚨 Casos Edge a Considerar

1. **Correo legítimo con imagen importante:**
   - Si un cliente envía cotización en imagen → será descartado
   - **Solución:** Mensaje en UI: "Si no ves un correo importante, revísalo en Gmail"

2. **Correo HTML rico pero con texto útil:**
   - Newsletter bien diseñado con contenido relevante
   - **Solución:** Algoritmo de CAPA 2 debe extraer texto incluso de HTML complejo

3. **Correo multipart con adjuntos:**
   - Email con PDF adjunto pero texto en cuerpo
   - **Solución:** Priorizar extracción de `text/plain` o `text/html`, ignorar adjuntos

4. **Categorías Gmail no siempre precisas:**
   - Gmail puede clasificar mal un correo de negocio como "promotions"
   - **Solución:** CAPA 2 es la red de seguridad; si pasa filtro pero no tiene texto, se descarta

---

## 📋 Resumen de Cambios Técnicos

### Modelo de Datos
- ✅ **Agregar campo:** `isProcessable: Boolean` en `Email`

### Servicio Gmail
- ✅ **Modificar query:** Agregar `-category:promotions -category:social -category:updates`
- ✅ **Agregar función:** `isEmailProcessable(gmailMessage)` con validaciones CAPA 2

### Server Actions
- ✅ **Actualizar:** `importGmailInboxForCurrentUser()` para:
  - Aplicar validación CAPA 2 antes de guardar
  - Establecer `isProcessable = true/false`
  - Devolver contador de descartados

### UI
- ✅ **Modificar:** `EmailTable` con filtro `WHERE isProcessable = true`
- ✅ **Agregar:** Banner informativo de correos ocultos
- ✅ **Actualizar:** Mensajes de importación con estadísticas

---

## ✅ Criterios de Éxito

El filtrado funciona correctamente cuando:

1. ✅ CAPA 1 reduce en 70-80% el volumen de correos importados desde Gmail
2. ✅ CAPA 2 descarta 100% de correos sin texto útil (solo imágenes, vacíos)
3. ✅ Tabla `/emails` muestra SOLO correos procesables (con `isProcessable = true`)
4. ✅ Usuario entiende por qué no ve ciertos correos (mensaje UI claro)
5. ✅ Correos descartados NO se reimportan en siguiente sincronización (`idEmail` guardado)
6. ✅ Procesamiento IA NUNCA recibe correos no procesables (validación previa)

---

## 🔄 Flujo Comparativo

### ANTES (sin filtros):
```
Gmail (100 correos) → Sistema (100) → Tabla muestra 100 → IA procesa 100
❌ Problema: 60 son spam/imágenes → desperdicio de recursos
```

### DESPUÉS (con 2 capas):
```
Gmail query filtrada (100 → 40) → CAPA 2 valida (40 → 25) → Tabla muestra 25 → IA procesa 25
✅ Solución: Solo correos útiles en todo el pipeline
```

---

## 🎯 Decisión Final Recomendada

**Opción A (Recomendada):**
- Campo `isProcessable` en `Email`
- Query Gmail: `-category:promotions -category:social -category:updates`
- Algoritmo CAPA 2 con 4 validaciones (vacío, corto, solo URLs, HTML sin texto)
- UI muestra solo `isProcessable = true` con contador de ocultos

