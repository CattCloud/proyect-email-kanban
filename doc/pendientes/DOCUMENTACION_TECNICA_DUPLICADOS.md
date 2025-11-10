# Documentación Técnica: Manejo de Emails Duplicados en Sistema de Importación

**Fecha:** 10 de Noviembre, 2025  
**Versión:** 1.0  
**Estado:** Pendiente de Implementación  
**Prioridad:** Alta

---

## 📋 Resumen Ejecutivo

El sistema de importación de emails presenta un **defecto crítico** en el manejo de registros duplicados que permite la creación inadvertida de entradas redundantes en la base de datos. Esta deficiencia compromete la integridad de los datos, afecta el rendimiento del sistema y genera confusión en la experiencia del usuario final.

---

## 🔍 Descripción Detallada del Problema

### Problema Principal
La función `importEmailsFromJSON()` en `src/actions/emails.ts` ejecuta operaciones de creación directa (`prisma.email.create()`) **sin verificar previamente la existencia** de emails idénticos, lo que resulta en:

- **Creación inadvertida de duplicados** en la base de datos
- **Errores de constraint únicos** que interrumpen procesos de importación
- **Falta de diferenciación** entre tipos de errores de importación
- **Ausencia de reportes granulares** para el usuario final
- **Pérdida de datos existentes** por sobrescritura no controlada

### Impacto en el Negocio
- **Integridad de datos comprometida**: Emails duplicados afectan reportes y métricas
- **Experiencia de usuario degradada**: Confusión por entradas repetidas
- **Rendimiento del sistema**: Incremento innecesario en tamaño de base de datos
- **Procesos de negocio afectados**: Duplicación en procesos de seguimiento y categorización

---

## 🛠️ Análisis Técnico Detallado

### Ubicación del Defecto
**Archivo:** `src/actions/emails.ts`  
**Función:** `importEmailsFromJSON()` (líneas 310-415)  
**Línea específica:** 350-362

### Código Problemático Actual

```typescript
// PROBLEMA: Creación directa sin verificación
await prisma.$transaction(async (tx) => {
  for (let j = 0; j < batch.length; j++) {
    const emailData = batch[j]
    const globalIndex = i + j

    try {
      // FALLO: No verifica existencia antes de crear
      const email = await tx.email.create({
        data: {
          from: emailData.email,        // email -> from
          subject: emailData.subject,
          body: emailData.body,
          receivedAt: emailData.received_at ?
            new Date(emailData.received_at) :
            new Date(),
          processed: false  // Por defecto false
        }
      })

      result.imported++
    } catch (emailError) {
      // PROBLEMA: Error genérico, no distingue duplicados
      result.errors.push({
        index: globalIndex,
        email: emailData.subject,
        error: "Error al crear en base de datos"
      })
    }
  }
})
```

### Comportamiento Actual del Sistema

#### 1. **Fase de Validación**
- ✅ **Validación de schema**: Verifica formato JSON con `ImportEmailSchema`
- ✅ **Validación de tipos**: Confirma estructura de datos
- ❌ **FALLO**: No valida existencia en base de datos

#### 2. **Fase de Importación**
- ✅ **Procesamiento por lotes**: Maneja máximo 10 emails por transacción
- ✅ **Manejo de transacciones**: Usa `prisma.$transaction()` para atomicidad
- ❌ **FALLO**: Ignora verificación de registros existentes
- ❌ **FALLO**: No implementa lógica de deduplicación

#### 3. **Fase de Reporte**
- ✅ **Conteo de importados**: Registra cantidad de emails procesados
- ✅ **Manejo de errores genérico**: Captura errores de base de datos
- ❌ **FALLO**: No diferencia entre tipos de error
- ❌ **FALLO**: No reporta duplicados específicamente

### Escenarios de Falla Identificados

#### Escenario 1: Importación Duplicada del Mismo Archivo
```
Usuario importa archivo "emails-nov.json" dos veces
Resultado: Emails duplicados con misma fecha, remitente y asunto
```

#### Escenario 2: Múltiples Archivos con Emails Repetidos
```
Archivo A: email "reunion@cliente.com" - 2025-11-09
Archivo B: email "reunion@cliente.com" - 2025-11-09
Resultado: Dos registros idénticos en base de datos
```

#### Escenario 3: Error de Constraint Única
```
Prisma constraint violation por violación de índice único
Error capturado como "Error al crear en base de datos"
Usuario no comprende la causa real del fallo
```

---

## 🔧 Estrategias de Solución Propuestas

### Estrategia 1: Verificación Previa con Lógica UPSERT

#### Implementación Técnica
```typescript
// NUEVA IMPLEMENTACIÓN RECOMENDADA
const result = await prisma.$transaction(async (tx) => {
  // 1. Verificar existencia antes de crear
  const existingEmail = await tx.email.findFirst({
    where: {
      from: emailData.email,
      subject: emailData.subject,
      body: emailData.body,
      receivedAt: new Date(emailData.received_at)
    }
  })

  if (existingEmail) {
    // Registro duplicado encontrado
    result.duplicates++
    result.details.push({
      index: globalIndex,
      action: 'duplicate',
      email: emailData.subject,
      existingId: existingEmail.id
    })
    return
  }

  // 2. Crear nuevo registro
  const email = await tx.email.create({ /* datos */ })
  result.created++
})

// 3. Reporte diferenciado
return {
  success: true,
  created: result.created,
  updated: result.updated,
  duplicates: result.duplicates,
  errors: result.errors,
  total: parsedData.length
}
```

#### Ventajas
- ✅ **Precisión**: Identificación exacta de duplicados
- ✅ **Eficiencia**: Una consulta de verificación por email
- ✅ **Trazabilidad**: Reporte detallado de acciones realizadas
- ✅ **Flexibilidad**: Permite políticas de manejo configurables

#### Desventajas
- ❌ **Rendimiento**: N+1 queries (verificación + creación)
- ❌ **Complejidad**: Lógica adicional en función de importación

---

### Estrategia 2: Implementación de Constraint Única con UPSERT

#### Modificación de Schema Prisma
```prisma
model Email {
  id         String         @id @default(cuid())
  from       String
  subject    String
  body       String
  receivedAt DateTime       @default(now())
  processed  Boolean        @default(false)
  metadata   EmailMetadata?
  
  // NUEVO: Constraint único para deduplicación
  @@unique([from, subject, body, receivedAt], name: "email_signature")
  
  @@index([from])
  @@index([subject])
  @@index([processed])
  @@index([receivedAt])
}
```

#### Implementación con UPSERT
```typescript
const result = await prisma.$transaction(async (tx) => {
  for (const emailData of batch) {
    try {
      const email = await tx.email.upsert({
        where: {
          email_signature: {
            from: emailData.email,
            subject: emailData.subject,
            body: emailData.body,
            receivedAt: new Date(emailData.received_at || Date.now())
          }
        },
        create: {
          from: emailData.email,
          subject: emailData.subject,
          body: emailData.body,
          receivedAt: new Date(emailData.received_at || Date.now()),
          processed: false
        },
        update: {
          // Política de actualización definida aquí
          processed: false  // Ejemplo: mantener como no procesado
        }
      })

      // Detectar si fue creado o actualizado
      const action = email.createdAt > new Date() - 1000 ? 'created' : 'updated'
      result[action + 'Count']++
      
    } catch (error) {
      if (error.code === 'P2002') {
        // Error de constraint única específico
        result.duplicates++
      } else {
        // Otros errores
        result.errors.push({ /* detalles */ })
      }
    }
  }
})
```

#### Ventajas
- ✅ **Rendimiento**: Una sola operación atómica por email
- ✅ **Integridad**: Garantía de base de datos de no duplicados
- ✅ **Escalabilidad**: Manejo eficiente de grandes volúmenes
- ✅ **Consistencia**: Control a nivel de base de datos

#### Desventajas
- ❌ **Rigidez**: Difícil cambio de política de deduplicación
- ❌ **Migración**: Requiere modificación de schema existente
- ❌ **Complejidad**: Manejo de errores más específico requerido

---

### Estrategia 3: Hash de Contenido para Detección Avanzada

#### Implementación de Hash
```typescript
import crypto from 'crypto'

// Función para generar hash único del email
function generateEmailHash(email: string, subject: string, body: string, receivedAt: string): string {
  const content = `${email.toLowerCase()}|${subject.trim()}|${body.trim()}|${receivedAt}`
  return crypto.createHash('sha256').update(content).digest('hex')
}

// En schema Prisma
model Email {
  // ... campos existentes
  contentHash String @unique  // Hash único para deduplicación
  
  @@index([contentHash])
}
```

#### Lógica de Importación
```typescript
const result = await prisma.$transaction(async (tx) => {
  for (const emailData of batch) {
    const contentHash = generateEmailHash(
      emailData.email,
      emailData.subject,
      emailData.body,
      emailData.received_at
    )

    const existingEmail = await tx.email.findUnique({
      where: { contentHash }
    })

    if (existingEmail) {
      result.duplicates++
      continue
    }

    // Crear con hash incluido
    const email = await tx.email.create({
      data: {
        from: emailData.email,
        subject: emailData.subject,
        body: emailData.body,
        receivedAt: new Date(emailData.received_at),
        processed: false,
        contentHash  // Hash para futuras verificaciones
      }
    })
  }
})
```

#### Ventajas
- ✅ **Precisión**: Detección basada en contenido real
- ✅ **Flexibilidad**: Permite configurar campos para hash
- ✅ **Escalabilidad**: Búsqueda directa por hash único
- ✅ **Evolución**: Fácil agregar nuevos campos al hash

#### Desventajas
- ❌ **Almacenamiento**: Campo adicional en base de datos
- ❌ **Complejidad**: Lógica de hash adicional
- ❌ **Performance**: Cálculo de hash por email

---

## 📊 Análisis Comparativo de Estrategias

| Criterio | Estrategia 1 (Verificación Previa) | Estrategia 2 (Constraint Única) | Estrategia 3 (Hash) |
|----------|-----------------------------------|--------------------------------|---------------------|
| **Rendimiento** | Medio (N+1 queries) | Alto (1 query) | Alto (1 query) |
| **Precisión** | Alta | Alta | Muy Alta |
| **Flexibilidad** | Muy Alta | Media | Alta |
| **Complejidad** | Media | Alta | Media |
| **Migración** | No requiere | Requiere | Requiere |
| **Escalabilidad** | Media | Muy Alta | Alta |
| **Mantenimiento** | Simple | Complejo | Medio |

### Recomendación Técnica
**Estrategia 2 (Constraint Única)** para implementaciones nuevas o sistemas con baja cantidad de datos existentes.

**Estrategia 1 (Verificación Previa)** para sistemas en producción con necesidad de reportes detallados y flexibilidad.

---

## 🚀 Plan de Implementación Recomendado

### Fase 1: Implementación de Estrategia de Verificación Previa

#### 1.1 Modificación de Tipos de Retorno
```typescript
// Tipos mejorados para ImportResult
interface DetailedImportResult {
  success: boolean;
  created: number;      // Emails nuevos creados
  updated: number;      // Emails existentes actualizados
  duplicates: number;   // Emails duplicados omitidos
  errors: Array<{
    index: number;
    email?: string;
    error: string;
    type: 'validation' | 'database' | 'duplicate' | 'unknown';
  }>;
  total: number;
}
```

#### 1.2 Implementación de Función de Verificación
```typescript
// Nueva función helper
async function checkEmailExists(tx: any, emailData: ImportEmailData): Promise<{exists: boolean, email?: any}> {
  return await tx.email.findFirst({
    where: {
      from: emailData.email,
      subject: emailData.subject,
      body: emailData.body,
      receivedAt: emailData.received_at ? new Date(emailData.received_at) : undefined
    },
    select: { id: true, processed: true, metadata: true }
  })
}
```

#### 1.3 Lógica de Actualización Condicional
```typescript
// Política de actualización configurable
const UPDATE_POLICY = {
  preserveMetadata: true,      // No sobrescribir metadata existente
  updateProcessed: false,      // No cambiar estado de processed
  updateReceivedAt: false      // No actualizar fecha de recepción
}

if (existingEmail && UPDATE_POLICY.preserveMetadata) {
  // Omitir para preservar datos existentes
  result.duplicates++
  return
}
```

### Fase 2: Mejora de Reportes al Usuario

#### 2.1 Componente de Reporte Detallado
```typescript
// En ImportEmailsModal.tsx
const renderDetailedResult = (result: DetailedImportResult) => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <div className="success-stat">
        <span className="text-2xl font-bold text-green-600">{result.created}</span>
        <span className="text-sm text-gray-600">Emails nuevos</span>
      </div>
      <div className="warning-stat">
        <span className="text-2xl font-bold text-yellow-600">{result.duplicates}</span>
        <span className="text-sm text-gray-600">Duplicados omitidos</span>
      </div>
      <div className="error-stat">
        <span className="text-2xl font-bold text-red-600">{result.errors.length}</span>
        <span className="text-sm text-gray-600">Errores</span>
      </div>
    </div>
    
    {/* Detalles por categoría de error */}
    {result.errors.length > 0 && (
      <ErrorDetailsList errors={result.errors} />
    )}
  </div>
)
```

#### 2.2 Configuración de Políticas de Deduplicación
```typescript
// Configuración centralizada
const DEDUPLICATION_CONFIG = {
  strategy: 'skip_duplicates',  // 'skip' | 'update' | 'merge'
  updatePolicy: {
    preserveMetadata: true,
    updateProcessed: false,
    conflictResolution: 'existing_wins'  // 'existing_wins' | 'incoming_wins'
  },
  notificationLevel: 'detailed'  // 'minimal' | 'detailed'
}
```

### Fase 3: Optimización y Escalabilidad

#### 3.1 Búsqueda por Índices Optimizada
```sql
-- Índices optimizados para búsquedas de duplicados
CREATE INDEX CONCURRENTLY idx_email_signature 
ON emails (from, subject, receivedAt);

CREATE INDEX CONCURRENTLY idx_email_content_hash 
ON emails (body_text) WHERE body_text IS NOT NULL;
```

#### 3.2 Cache de Verificación
```typescript
// Cache temporal para evitar verificaciones redundantes en el mismo batch
const verificationCache = new Map<string, boolean>()

function getCacheKey(emailData: ImportEmailData): string {
  return `${emailData.email}|${emailData.subject}|${emailData.received_at}`
}
```

---

## 📋 Especificaciones de Testing

### Casos de Prueba Requeridos

#### 1. Tests de Deduplicación
- ✅ **Archivo sin duplicados**: Verificar importación completa exitosa
- ✅ **Archivo con duplicados**: Validar conteo correcto de omitidos
- ✅ **Múltiples archivos**: Verificar detección entre archivos diferentes
- ✅ **Emails similares pero diferentes**: Confirmar que no se marcan como duplicados

#### 2. Tests de Actualización Condicional
- ✅ **Preservar metadata**: Verificar que metadata existente no se sobrescribe
- ✅ **Estado de processed**: Confirmar que processed=false por defecto
- ✅ **Conflictos de fecha**: Validar manejo de fechas receptoras diferentes

#### 3. Tests de Performance
- ✅ **Lote grande (1000+ emails)**: Verificar tiempo de respuesta aceptable
- ✅ **Múltiples archivos concurrentes**: Validar integridad bajo carga
- ✅ **Memoria**: Confirmar que no hay memory leaks en procesamiento

#### 4. Tests de Error Handling
- ✅ **Errores de red**: Validar rollback de transacciones
- ✅ **Errores de base de datos**: Confirmar reporte apropiado
- ✅ **Archivos corruptos**: Verificar manejo graceful de errores

---

## 🔒 Consideraciones de Seguridad

### Validación de Entrada
- **Sanitización de datos**: Prevención de inyección SQL vía Prisma
- **Límites de tamaño**: Máximo de emails por importación (configurable)
- **Rate limiting**: Prevención de abuso del endpoint de importación
- **Validación de contenido**: Verificación de longitud de campos

### Auditoría y Trazabilidad
- **Log de importaciones**: Registro de quién, cuándo y qué importó
- **Backup automático**: Snapshots antes de importaciones masivas
- **Rollback procedures**: Capacidad de deshacer importaciones problemáticas

---

## 📈 Métricas y Monitoreo

### KPIs de Importación
- **Tasa de duplicados**: Porcentaje de emails detectados como duplicados
- **Tiempo promedio de importación**: Performance por volumen de emails
- **Tasa de errores**: Porcentaje de emails que fallan al importar
- **Volumen procesado**: Cantidad de emails importados por sesión

### Alertas Recomendadas
- ⚠️ **Alto volumen de duplicados**: >20% sugiere problema de datos fuente
- ⚠️ **Tiempo de importación excesivo**: >30s para 100 emails
- ⚠️ **Tasa de errores alta**: >5% requiere investigación inmediata

---

## 📚 Referencias y Documentación Relacionada

- **Product Brief**: `doc/desarrollador.md/ProyectoFinal_Email_Kanban.md`
- **Schema de Base de Datos**: `prisma/schema.prisma`
- **Sistema de Importación**: `src/components/emails/ImportEmailsModal.tsx`
- **Corrección de Formato JSON**: `doc/CORRECCION_FORMATO_JSON.md`

---

## 🔄 Plan de Migración

### Preparación
1. **Backup completo** de base de datos antes de implementar cambios
2. **Testing en ambiente de desarrollo** con datasets de prueba
3. **Documentación de políticas** de deduplicación para el equipo

### Implementación
1. **Fase gradual**: Implementar estrategia de verificación previa
2. **Monitoreo continuo** de métricas durante rollout
3. **Rollback plan** preparado en caso de problemas

### Post-Implementación
1. **Optimización de queries** basada en performance real
2. **Ajuste de políticas** basado en feedback de usuarios
3. **Documentación actualizada** de nuevos procesos

---

**Documento preparado por:** Sistema de Documentación Técnica  
**Próxima revisión:** 17 de Noviembre, 2025  
**Estado:** Listo para implementación