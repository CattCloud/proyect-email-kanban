## 🎯 Propuesta Final Refinada v2

### ✅ Diseño simplificado con 2 campos únicos

---

## 📋 Campos a Agregar en Tabla `Email`

```typescript
// Campos nuevos en modelo Email
rejectionReason?: string | null      // Checkbox seleccionado O texto libre si es "Otro"
previousAIResult?: JSON | null       // Snapshot completo del análisis descartado
```

---

## 🔄 Flujo Optimizado

```
1. IA procesa email → genera resultado (pending_review)
2. Usuario revisa → RECHAZA
3. Modal aparece con:
   ✅ Checkboxes: ["Categoría incorrecta", "Prioridad mal asignada", 
                  "Tareas mal extraídas", "Resumen poco claro", "Otro"]
   ✅ Textarea: Aparece SOLO si selecciona "Otro" (obligatorio)
4. Sistema guarda:
   - rejectionReason = valor del checkbox O contenido del textarea
   - previousAIResult = JSON completo del análisis descartado
5. Usuario solicita reprocesar
6. Prompt incluye NUEVA SECCIÓN con ambos campos como contexto
```

## IMPORTANTE
El nuevo PROMPT esta indicado en el documento [NUEVOPROMPT.md](/doc/NUEVOPROMPT.md)
El contenido de este documento sobreescribira el prompto indicado en email-processing.ts
---

## 🎨 Categorías de Rechazo (Valores de `rejectionReason`)

**Checkboxes del Modal (valores predefinidos):**
- ❌ `"Categoría incorrecta"` → Cliente/lead/interno/spam mal clasificado
- ❌ `"Prioridad mal asignada"` → Debió ser alta/media/baja diferente
- ❌ `"Tareas mal extraídas"` → Extrajo tareas inexistentes o no detectó las reales
- ❌ `"Resumen poco útil"` → No captura el propósito real del email
- ❌ `"[Texto libre del usuario]"` → Si selecciona "Otro", guarda lo que escribió

---

## 💾 Lógica de Almacenamiento

| Caso | `rejectionReason` | `previousAIResult` |
|------|-------------------|-------------------|
| Usuario selecciona "Categoría incorrecta" | `"Categoría incorrecta"` | `{category: "spam", priority: "alta", ...}` |
| Usuario selecciona "Otro" y escribe "El contacto es interno, no cliente" | `"El contacto es interno, no cliente"` | `{category: "cliente", ...}` |
| Email aprobado sin rechazo | `null` | `null` |

---

## 🧠 Estrategia en el Prompt

**Sección Nueva (solo si `rejectionReason` y `previousAIResult` existen):**

```
═══════════════════════════════════════════════════════════════
## FEEDBACK DE RECHAZO PREVIO

Este email fue procesado anteriormente y el usuario RECHAZÓ el resultado.

📌 Motivo del rechazo: "{rejectionReason}"

❌ Resultado DESCARTADO anterior:
{previousAIResult JSON}

⚠️ INSTRUCCIONES CRÍTICAS:
1. NO repitas los mismos errores del análisis anterior
2. Presta especial atención al área que causó el rechazo
3. Si el motivo menciona "Categoría": reconsidera completamente la clasificación
4. Si el motivo menciona "Tareas": lee el email línea por línea de nuevo
5. Si el motivo menciona "Prioridad": reevalúa los criterios de urgencia
6. Si es texto libre del usuario: ajusta tu razonamiento según su feedback específico
7. Compara tu nuevo análisis con el descartado y asegúrate de corregir el problema

EJEMPLO:
Si rejectionReason = "Categoría incorrecta" y previousAIResult.category = "spam"
→ Evita clasificar como spam nuevamente, considera otras opciones primero
═══════════════════════════════════════════════════════════════
```

---

## ⚡ Ventajas del Diseño Simplificado

✅ **Ultra simple**: Solo 2 campos opcionales  
✅ **Flexible**: Un solo campo maneja valores predefinidos Y texto libre  
✅ **Eficiente**: No duplica información innecesariamente  
✅ **Claro**: El prompt recibe exactamente lo que el usuario dijo  
✅ **Escalable**: Puedes agregar más opciones de checkbox sin cambiar schema  

---

## 🎨 Implementación del Modal (Lógica)

```typescript
// Pseudocódigo de validación
if (selectedOption === "Otro") {
  rejectionReason = textareaValue.trim(); // Texto libre obligatorio
  if (rejectionReason.length < 10) {
    throw "Debes escribir al menos 10 caracteres explicando el motivo";
  }
} else {
  rejectionReason = selectedOption; // "Categoría incorrecta", etc.
}

previousAIResult = currentAnalysisResult; // JSON completo
```

---

## 🚨 Casos Edge a Considerar

1. **Email sin rechazo previo**:
   - `rejectionReason = null`, `previousAIResult = null`
   - Prompt NO incluye sección de feedback (se mantiene limpio)

2. **Usuario selecciona "Otro" pero no escribe nada**:
   - Validación client-side: Textarea obligatorio (min 10 caracteres)
   - Error: "Debes explicar el motivo del rechazo"

3. **Email rechazado múltiples veces**:
   - Cada reprocesamiento sobrescribe los campos con el último rechazo
   - Solo guardas el feedback MÁS RECIENTE (suficiente para aprendizaje incremental)

4. **Resultado descartado idéntico al nuevo**:
   - Opcional: Comparar `previousAIResult` con nuevo análisis antes de guardar
   - Si son >90% iguales: Alertar "La IA generó un resultado muy similar"

---

## 📊 Estructura Final de Datos

```typescript
// Email en BD después de rechazo
{
  id: "email-123",
  subject: "Propuesta Q4",
  processed: true,
  rejectionReason: "Tareas mal extraídas", // O texto libre
  previousAIResult: {
    category: "cliente",
    priority: "alta",
    tasks: [
      { description: "Tarea incorrecta que se descartó", ... }
    ]
  },
  // ... otros campos
}

// Email en BD después de aprobación (sin rechazo)
{
  id: "email-456",
  subject: "Consulta simple",
  processed: true,
  rejectionReason: null,  // ✅ Sin rechazo
  previousAIResult: null, // ✅ Sin rechazo
  // ... otros campos
}
```

---

## ✅ Confirmación Final

**Schema Prisma propuesto:**
```prisma
model Email {
  // ... campos existentes
  rejectionReason   String? // Motivo del rechazo (checkbox O texto libre)
  previousAIResult  Json?   // Análisis descartado completo
}
```
