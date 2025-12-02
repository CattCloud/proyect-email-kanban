# 📊 Sistema de Historial de Actividad por Usuario

**Versión:** 1.0  
**Fecha:** Noviembre 2025  
**Tipo:** Especificación de Implementación

---

## 🎯 Visión General del Sistema

Un sistema de **historial funcional** que registre las 3 actividades core del sistema sin complejidad excesiva:

1. **Importaciones de emails** (cuántos, cuándo, resultado)
2. **Procesamientos IA** (lote/individual, costos aproximados, éxito/fallo)
3. **Cambios de estado en Kanban** (tarea movida, de qué estado a qué estado)

### Objetivos Principales

- ✅ **Transparencia de uso**: El usuario ve su actividad completa
- ✅ **Tracking de costos IA**: Cálculo aproximado de gastos OpenAI
- ✅ **Auditoría simple**: Registro de acciones importantes
- ✅ **Base para facturación futura**: Preparación para billing por uso

---

## 🗂️ Base de Datos - Modelo de Historial

### Tabla Nueva: `ActivityLog`

**Agregar al archivo `prisma/schema.prisma`:**

```prisma
model ActivityLog {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  
  // Usuario que ejecutó la acción
  userId String
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Tipo de actividad (enum limitado)
  activityType String // "email_import" | "ai_processing" | "kanban_update"
  
  // Metadata específica según tipo (JSON flexible)
  metadata Json
  
  // Resultado de la operación
  status String // "success" | "partial_success" | "error"
  
  // Mensaje descriptivo para el usuario
  description String
  
  // Costo aproximado (solo para ai_processing)
  estimatedCost Float? // En centavos de USD ($0.01 = 1 centavo)
  
  // Opcional: relacionar con entidades específicas
  relatedEmailIds String[] // IDs de emails involucrados
  relatedTaskIds  String[] // IDs de tareas involucradas
  
  @@index([userId, createdAt])
  @@index([activityType, userId])
  @@index([createdAt])
}
```

### Actualizar Modelo `User`

**Agregar relación en modelo existente:**

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())

  // ... relaciones existentes ...
  emails       Email[]
  tasks        Task[]
  gmailAccount GmailAccount?
  
  // NUEVA RELACIÓN
  activityLogs ActivityLog[]
}
```

---

## 📋 Estructura de Metadata por Tipo de Actividad

### 1. Email Import (`email_import`)

**Estructura del JSON `metadata`:**

```typescript
interface EmailImportMetadata {
  totalEmails: number;        // Total intentados
  successfulImports: number;  // Importados exitosamente
  failedImports: number;      // Fallidos
  duplicates: number;         // Duplicados detectados
  source: "json_upload" | "gmail_sync"; // Futura compatibilidad
  
  // Opcional: resumen de errores (máximo 5 para no saturar)
  errors?: Array<{
    idEmail: string;
    reason: string;
  }>;
}
```

**Ejemplo de registro completo:**

```json
{
  "activityType": "email_import",
  "status": "partial_success",
  "description": "Importados 8 de 10 emails desde JSON",
  "metadata": {
    "totalEmails": 10,
    "successfulImports": 8,
    "failedImports": 2,
    "duplicates": 0,
    "source": "json_upload",
    "errors": [
      { "idEmail": "email-001", "reason": "Email duplicado" },
      { "idEmail": "email-002", "reason": "Formato de fecha inválido" }
    ]
  },
  "relatedEmailIds": ["cuid1", "cuid2", "cuid3"],
  "estimatedCost": null
}
```

**Lógica de `status`:**
- `"success"`: Todos importados sin errores
- `"partial_success"`: Algunos exitosos, algunos fallidos
- `"error"`: Todos fallaron

---

### 2. AI Processing (`ai_processing`)

**Estructura del JSON `metadata`:**

```typescript
interface AIProcessingMetadata {
  totalEmailsProcessed: number;
  successfulAnalysis: number;
  failedAnalysis: number;
  
  // Cálculo de costo aproximado
  tokensUsed: {
    prompt: number;    // Tokens del prompt
    completion: number; // Tokens de la respuesta
    total: number;     // Suma
  };
  
  model: string; // "gpt-4o-mini" | "gpt-4o" | ...
  
  // Resumen de confianza promedio
  averageConfidence?: number; // 0-100
  
  // Emails con baja confianza (requieren revisión)
  lowConfidenceCount: number;
  
  // Opcional: detalles de errores
  errors?: Array<{
    emailId: string;
    subject: string;
    error: string;
  }>;
}
```

**Ejemplo de registro completo:**

```json
{
  "activityType": "ai_processing",
  "status": "success",
  "description": "Procesados 5 emails con IA (promedio confianza: 78%)",
  "metadata": {
    "totalEmailsProcessed": 5,
    "successfulAnalysis": 5,
    "failedAnalysis": 0,
    "tokensUsed": {
      "prompt": 3200,
      "completion": 850,
      "total": 4050
    },
    "model": "gpt-4o-mini",
    "averageConfidence": 78,
    "lowConfidenceCount": 2
  },
  "relatedEmailIds": ["cuid1", "cuid2", "cuid3", "cuid4", "cuid5"],
  "estimatedCost": 0.06
}
```

#### Cálculo de Costo Aproximado

**Precios de OpenAI (Verificar actualizaciones en https://openai.com/pricing):**

```typescript
// Constantes de pricing (Noviembre 2024)
const MODEL_PRICING = {
  "gpt-4o-mini": {
    prompt: 0.150 / 1_000_000,      // $0.150 por 1M tokens
    completion: 0.600 / 1_000_000    // $0.600 por 1M tokens
  },
  "gpt-4o": {
    prompt: 2.50 / 1_000_000,       // $2.50 por 1M tokens
    completion: 10.00 / 1_000_000    // $10.00 por 1M tokens
  }
};

function calculateCost(
  tokensUsed: { prompt: number; completion: number },
  model: string
): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING["gpt-4o-mini"];
  
  const promptCost = tokensUsed.prompt * pricing.prompt;
  const completionCost = tokensUsed.completion * pricing.completion;
  
  // Retornar en centavos (multiplicar por 100)
  return (promptCost + completionCost) * 100;
}
```

**Ejemplo de cálculo:**

```
Tokens: 3200 prompt + 850 completion con gpt-4o-mini
Cálculo:
  - Prompt: 3200 × $0.00000015 = $0.00048
  - Completion: 850 × $0.0000006 = $0.00051
  - Total: $0.00099 ≈ 0.1 centavos

Almacenar: 0.1 (en campo estimatedCost)
Mostrar: $0.00099 USD
```

---

### 3. Kanban Update (`kanban_update`)

**Estructura del JSON `metadata`:**

```typescript
interface KanbanUpdateMetadata {
  taskId: string;
  taskDescription: string; // Primeras 50 chars para contexto
  
  previousStatus: "todo" | "doing" | "done";
  newStatus: "todo" | "doing" | "done";
  
  // Contexto del email relacionado
  relatedEmail: {
    emailId: string;
    subject: string;
    contactName?: string;
  };
  
  // Opcional: si el cambio fue manual o automático
  triggeredBy: "user_action" | "bulk_update" | "automation";
}
```

**Ejemplo de registro completo:**

```json
{
  "activityType": "kanban_update",
  "status": "success",
  "description": "Tarea movida a 'En Progreso': Revisar propuesta Q4",
  "metadata": {
    "taskId": "task_cuid",
    "taskDescription": "Revisar propuesta Q4 y agendar reunión",
    "previousStatus": "todo",
    "newStatus": "doing",
    "relatedEmail": {
      "emailId": "email_cuid",
      "subject": "Reunión urgente - Propuesta Q4",
      "contactName": "Cliente Empresa"
    },
    "triggeredBy": "user_action"
  },
  "relatedEmailIds": ["email_cuid"],
  "relatedTaskIds": ["task_cuid"],
  "estimatedCost": null
}
```

---

## 🔧 Implementación Backend

### 1. Servicio de Logging

**Archivo NUEVO: `src/lib/activity-logger.ts`**

Este servicio centraliza toda la lógica de registro de actividades.

#### Tipos TypeScript

```typescript
export type ActivityType = "email_import" | "ai_processing" | "kanban_update";
export type ActivityStatus = "success" | "partial_success" | "error";

interface LogActivityParams {
  userId: string;
  activityType: ActivityType;
  status: ActivityStatus;
  description: string;
  metadata: Record<string, any>;
  estimatedCost?: number; // En centavos
  relatedEmailIds?: string[];
  relatedTaskIds?: string[];
}
```

#### Función Principal: `logActivity`

```typescript
/**
 * Registra una actividad del usuario en el historial
 * 
 * IMPORTANTE: NO debe fallar la operación principal si el log falla
 */
export async function logActivity(params: LogActivityParams) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        activityType: params.activityType,
        status: params.status,
        description: params.description,
        metadata: params.metadata,
        estimatedCost: params.estimatedCost ?? null,
        relatedEmailIds: params.relatedEmailIds ?? [],
        relatedTaskIds: params.relatedTaskIds ?? [],
      },
    });
  } catch (error) {
    // NO lanzar error - solo registrar en consola
    console.error("[ActivityLogger] Error logging activity:", error);
  }
}
```

**Principio clave:** Si el logging falla, **no debe romper** la funcionalidad principal (importar emails, procesar IA, mover tareas).

#### Función de Consulta: `getUserActivityLog`

```typescript
/**
 * Obtiene el historial de actividades del usuario
 * 
 * @param userId - ID del usuario
 * @param options - Filtros opcionales
 * @returns Lista de actividades ordenadas por fecha descendente
 */
export async function getUserActivityLog(
  userId: string,
  options?: {
    activityType?: ActivityType;
    limit?: number;
    offset?: number;
  }
) {
  const where: any = { userId };
  
  if (options?.activityType) {
    where.activityType = options.activityType;
  }
  
  const activities = await prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
    skip: options?.offset ?? 0,
  });
  
  return activities;
}
```

#### Función de Estadísticas: `getUserActivityStats`

```typescript
/**
 * Obtiene estadísticas agregadas de uso del usuario
 * 
 * @param userId - ID del usuario
 * @returns Contadores totales y costo acumulado
 */
export async function getUserActivityStats(userId: string) {
  const [
    totalImports,
    totalProcessings,
    totalKanbanUpdates,
    totalCostCents,
  ] = await Promise.all([
    prisma.activityLog.count({
      where: { userId, activityType: "email_import" },
    }),
    prisma.activityLog.count({
      where: { userId, activityType: "ai_processing" },
    }),
    prisma.activityLog.count({
      where: { userId, activityType: "kanban_update" },
    }),
    prisma.activityLog.aggregate({
      where: { userId, activityType: "ai_processing" },
      _sum: { estimatedCost: true },
    }),
  ]);
  
  return {
    totalImports,
    totalProcessings,
    totalKanbanUpdates,
    totalCostUSD: (totalCostCents._sum.estimatedCost ?? 0) / 100, // Convertir centavos a USD
  };
}
```

---

### 2. Integración en Server Actions Existentes

#### A. Importación de Emails

**Modificar `src/actions/emails.ts`:**

**Ubicación:** Al final de la función `importEmailsFromJSON`, después de toda la lógica de importación.

```typescript
import { logActivity } from "@/lib/activity-logger";

export async function importEmailsFromJSON(
  rawData: unknown,
  userId: string // AGREGAR cuando tengas autenticación
) {
  // ... validación existente ...
  
  const results = {
    success: [] as string[],
    errors: [] as Array<{ idEmail: string; reason: string }>,
    duplicates: 0,
  };
  
  // ... lógica de importación existente ...
  
  // NUEVA SECCIÓN: Registrar en historial
  await logActivity({
    userId,
    activityType: "email_import",
    status: 
      results.errors.length === 0 
        ? "success" 
        : results.success.length > 0 
          ? "partial_success" 
          : "error",
    description: `Importados ${results.success.length} de ${validEmails.length} emails`,
    metadata: {
      totalEmails: validEmails.length,
      successfulImports: results.success.length,
      failedImports: results.errors.length,
      duplicates: results.duplicates,
      source: "json_upload",
      errors: results.errors.slice(0, 5), // Limitar a primeros 5 errores para no saturar
    },
    relatedEmailIds: results.success,
  });
  
  // ... retorno existente ...
}
```

**Decisión de `status`:**
- Todos exitosos → `"success"`
- Algunos exitosos, algunos fallidos → `"partial_success"`
- Todos fallidos → `"error"`

---

#### B. Procesamiento IA

**Modificar `src/actions/ai-processing.ts`:**

**Paso 1: Agregar constantes de pricing al inicio del archivo:**

```typescript
import { logActivity } from "@/lib/activity-logger";

// Precios de OpenAI (verificar actualizaciones periódicamente)
const MODEL_PRICING = {
  "gpt-4o-mini": { 
    prompt: 0.150 / 1_000_000, 
    completion: 0.600 / 1_000_000 
  },
  "gpt-4o": { 
    prompt: 2.50 / 1_000_000, 
    completion: 10.00 / 1_000_000 
  },
};

function calculateAICost(usage: {
  prompt_tokens: number;
  completion_tokens: number;
  model: string;
}): number {
  const pricing = MODEL_PRICING[usage.model] || MODEL_PRICING["gpt-4o-mini"];
  
  const cost = 
    (usage.prompt_tokens * pricing.prompt) +
    (usage.completion_tokens * pricing.completion);
  
  return cost * 100; // Convertir a centavos
}
```

**Paso 2: Capturar `usage` de OpenAI y registrar en historial:**

```typescript
export async function processEmailsWithAI(
  emailIds: string[],
  userId: string // AGREGAR cuando tengas autenticación
) {
  // ... lógica existente de procesamiento ...
  
  // Llamar a OpenAI
  const openaiResponse = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    // ... resto de config existente ...
  });
  
  // CAPTURAR USAGE de la respuesta
  const usage = openaiResponse.usage; 
  // Estructura: { prompt_tokens, completion_tokens, total_tokens }
  
  // ... lógica existente de procesamiento de resultados ...
  
  // Calcular costo aproximado
  const estimatedCost = usage ? calculateAICost({
    prompt_tokens: usage.prompt_tokens,
    completion_tokens: usage.completion_tokens,
    model: "gpt-4o-mini", // O el modelo que uses
  }) : 0;
  
  // Calcular confianza promedio (usando tus resultados existentes)
  const avgConfidence = resultsWithConfidence.reduce(
    (sum, r) => sum + r.confidence.overallScore,
    0
  ) / resultsWithConfidence.length;
  
  const lowConfidenceCount = resultsWithConfidence.filter(
    r => r.confidence.overallScore < 60
  ).length;
  
  // REGISTRAR EN HISTORIAL
  await logActivity({
    userId,
    activityType: "ai_processing",
    status: "success", // Ajustar según errores si los hay
    description: `Procesados ${emailIds.length} emails con IA (confianza promedio: ${Math.round(avgConfidence)}%)`,
    metadata: {
      totalEmailsProcessed: emailIds.length,
      successfulAnalysis: emailIds.length,
      failedAnalysis: 0,
      tokensUsed: usage ? {
        prompt: usage.prompt_tokens,
        completion: usage.completion_tokens,
        total: usage.total_tokens,
      } : null,
      model: "gpt-4o-mini",
      averageConfidence: Math.round(avgConfidence),
      lowConfidenceCount,
    },
    relatedEmailIds: emailIds,
    estimatedCost,
  });
  
  // ... retorno existente ...
}
```

**Notas importantes:**
- `openaiResponse.usage` contiene los tokens usados
- Calcular costo **antes** de registrar en historial
- Usar `Math.round()` para confianza promedio (evitar decimales innecesarios)

---

#### C. Actualización de Kanban

**Modificar `src/actions/kanban.ts`:**

**Ubicación:** Dentro de la función que mueve tareas entre columnas.

```typescript
import { logActivity } from "@/lib/activity-logger";

export async function updateTaskStatus(
  taskId: string,
  newStatus: "todo" | "doing" | "done",
  userId: string // AGREGAR cuando tengas autenticación
) {
  // IMPORTANTE: Obtener tarea ANTES de actualizar para capturar estado anterior
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      emailMetadata: {
        include: {
          email: true,
        },
      },
    },
  });
  
  if (!task) {
    return { success: false, error: "Tarea no encontrada" };
  }
  
  const previousStatus = task.status;
  
  // Actualizar tarea (lógica existente)
  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });
    
    // ... sincronización con EmailMetadata existente ...
  });
  
  // REGISTRAR EN HISTORIAL
  await logActivity({
    userId,
    activityType: "kanban_update",
    status: "success",
    description: `Tarea movida a '${getStatusLabel(newStatus)}': ${task.description.slice(0, 50)}...`,
    metadata: {
      taskId: task.id,
      taskDescription: task.description,
      previousStatus,
      newStatus,
      relatedEmail: {
        emailId: task.emailMetadata.email.id,
        subject: task.emailMetadata.email.subject,
        contactName: task.emailMetadata.contactName,
      },
      triggeredBy: "user_action",
    },
    relatedEmailIds: [task.emailMetadata.email.id],
    relatedTaskIds: [task.id],
  });
  
  // ... revalidación y retorno ...
}

// Función helper para labels legibles
function getStatusLabel(status: string): string {
  const labels = {
    todo: "Por Hacer",
    doing: "En Progreso",
    done: "Completado",
  };
  return labels[status] || status;
}
```

**Punto clave:** Capturar `previousStatus` **antes** de actualizar la tarea.

---

### 3. Server Actions para la Página de Historial

**Archivo NUEVO: `src/actions/activity.ts`**

Estas son las funciones que consumirá el frontend.

```typescript
"use server";

import { getUserActivityLog, getUserActivityStats } from "@/lib/activity-logger";

/**
 * Obtiene el historial de actividades con filtros opcionales
 */
export async function getActivityHistory(
  userId: string,
  filters?: {
    activityType?: "email_import" | "ai_processing" | "kanban_update";
    limit?: number;
    offset?: number;
  }
) {
  try {
    const activities = await getUserActivityLog(userId, filters);
    
    return {
      success: true,
      data: activities,
    };
  } catch (error) {
    console.error("[getActivityHistory] Error:", error);
    return {
      success: false,
      error: "Error al obtener historial",
    };
  }
}

/**
 * Obtiene estadísticas agregadas del usuario
 */
export async function getActivityStatistics(userId: string) {
  try {
    const stats = await getUserActivityStats(userId);
    
    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("[getActivityStatistics] Error:", error);
    return {
      success: false,
      error: "Error al obtener estadísticas",
    };
  }
}
```

---

## 🎨 Frontend - Componentes UI

### 1. Página de Historial

**Archivo NUEVO: `src/app/(protected)/activity/page.tsx`**

```typescript
import { getActivityHistory, getActivityStatistics } from "@/actions/activity";
import { ActivityTimeline } from "@/components/activity/ActivityTimeline";
import { ActivityStats } from "@/components/activity/ActivityStats";
import { ActivityFilters } from "@/components/activity/ActivityFilters";

export default async function ActivityPage() {
  // TODO: Obtener userId de la sesión real (NextAuth/Clerk/etc)
  const userId = "demo-user"; // REEMPLAZAR con sesión real
  
  const [historyResult, statsResult] = await Promise.all([
    getActivityHistory(userId, { limit: 50 }),
    getActivityStatistics(userId),
  ]);
  
  if (!historyResult.success || !statsResult.success) {
    return (
      <div className="error-container">
        <p>Error al cargar historial de actividad</p>
      </div>
    );
  }
  
  return (
    <div className="activity-page">
      <header className="page-header">
        <h1>Historial de Actividad</h1>
        <p className="page-subtitle">Tu actividad reciente en el sistema</p>
      </header>
      
      {/* Tarjetas de estadísticas generales */}
      <ActivityStats stats={statsResult.data} />
      
      {/* Filtros (opcional para MVP) */}
      <ActivityFilters />
      
      {/* Timeline de actividades */}
      <ActivityTimeline activities={historyResult.data} />
    </div>
  );
}
```

---

### 2. Componente de Estadísticas

**Archivo NUEVO: `src/components/activity/ActivityStats.tsx`**

Muestra 4 tarjetas con métricas clave.

```typescript
"use client";

interface ActivityStatsProps {
  stats: {
    totalImports: number;
    totalProcessings: number;
    totalKanbanUpdates: number;
    totalCostUSD: number;
  };
}

export function ActivityStats({ stats }: ActivityStatsProps) {
  return (
    <div className="activity-stats">
      {/* Tarjeta 1: Importaciones */}
      <div className="stat-card">
        <div className="stat-icon">📥</div>
        <div className="stat-content">
          <p className="stat-label">Importaciones</p>
          <p className="stat-value">{stats.totalImports}</p>
        </div>
      </div>
      
      {/* Tarjeta 2: Procesamientos IA */}
      <div className="stat-card">
        <div className="stat-icon">🤖</div>
        <div className="stat-content">
          <p className="stat-label">Procesamientos IA</p>
          <p className="stat-value">{stats.totalProcessings}</p>
        </div>
      </div>
      
      {/* Tarjeta 3: Movimientos Kanban */}
      <div className="stat-card">
        <div className="stat-icon">📋</div>
        <div className="stat-content">
          <p className="stat-label">Movimientos Kanban</p>
          <p className="stat-value">{stats.totalKanbanUpdates}</p>
        </div>
      </div>
      
      {/* Tarjeta 4: Costo Acumulado (destacada) */}
      <div className="stat-card highlight">
        <div className="stat-icon">💰</div>
        <div className="stat-content">
          <p className="stat-label">Costo Acumulado IA</p>
          <p className="stat-value">${stats.totalCostUSD.toFixed(4)}</p>
        </div>
      </div>
    </div>
  );
}
```

**Notas de diseño:**
- Grid responsive (4 columnas en desktop, 2 en tablet, 1 en mobile)
- Tarjeta de costo destacada con fondo degradado (morado)
- Mostrar costo con 4 decimales para precisión ($0.0012)

---

### 3. Timeline de Actividades

**Archivo NUEVO: `src/components/activity/ActivityTimeline.tsx`**

Muestra lista cronológica de actividades con metadata contextual.

```typescript
"use client";

import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface Activity {
  id: string;
  createdAt: Date;
  activityType: string;
  status: string;
  description: string;
  metadata: any;
  estimatedCost: number | null;
}

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay actividad registrada aún</p>
      </div>
    );
  }
  
  return (
    <div className="activity-timeline">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const icon = getActivityIcon(activity.activityType);
  const colorClass = getStatusColorClass(activity.status);
  
  return (
    <div className={`activity-item ${colorClass}`}>
      {/* Icono representativo */}
      <div className="activity-icon">{icon}</div>
      
      {/* Contenido */}
      <div className="activity-content">
        <div className="activity-header">
          <p className="activity-description">{activity.description}</p>
          <time className="activity-time">
            {formatDistanceToNow(new Date(activity.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </time>
        </div>
        
        {/* Metadata específica según tipo */}
        <ActivityMetadata 
          type={activity.activityType}
          metadata={activity.metadata}
          cost={activity.estimatedCost}
        />
      </div>
    </div>
  );
}

function ActivityMetadata({ 
  type, 
  metadata, 
  cost 
}: { 
  type: string; 
  metadata: any; 
  cost: number | null;
}) {
  // Email Import
  if (type === "email_import") {
    return (
      <div className="activity-meta">
        <span>✅ {metadata.successfulImports} exitosos</span>
        {metadata.failedImports > 0 && (
          <span>❌ {metadata.failedImports} fallidos</span>
        )}
        {metadata.duplicates > 0 && (
          <span>🔁 {metadata.duplicates} duplicados</span>
        )}
      </div>
    );
  }
  
  // AI Processing
  if (type === "ai_processing") {
    return (
      <div className="activity-meta">
        <span>📊 Confianza promedio: {metadata.averageConfidence}%</span>
        {metadata.lowConfidenceCount > 0 && (
          <span>⚠️ {metadata.lowConfidenceCount} baja confianza</span>
        )}
        {cost && cost > 0 && (
          <span>💰 ${(cost / 100).toFixed(4)}</span>
        )}
      </div>
    );
  }
  
  // Kanban Update
  if (type === "kanban_update") {
    return (
      <div className="activity-meta">
        <span>
          {getStatusEmoji(metadata.previousStatus)} → {getStatusEmoji(metadata.newStatus)}
        </span>
        <span className="email-subject">{metadata.relatedEmail.subject}</span>
      </div>
    );
  }
  
  return null;
}

// Helper: Iconos por tipo de actividad
function getActivityIcon(type: string): string {
  const icons = {
    email_import: "📥",
    ai_processing: "🤖",
    kanban_update: "📋",
  };
  return icons[type] || "📌";
}

// Helper: Clases de color según estado
function getStatusColorClass(status: string): string {
  const classes = {
    success: "status-success",
    partial_success: "status-warning",
    error: "status-error",
  };
  return classes[status] || "";
}

// Helper: Emojis para estados de Kanban
function getStatusEmoji(status: string): string {
  const emojis = {
    todo: "⭕",
    doing: "🔵",
    done: "✅",
  };
  return emojis[status] || "📍";
}
```

**Funcionalidades clave:**
- Formato de fecha relativa ("hace 2 horas", "hace 3 días")
- Metadata contextual según tipo de actividad
- Indicadores visuales de estado (success, warning, error)
- Costo mostrado solo para procesamiento IA

---

### 4. Componente de Filtros (Básico)

**Archivo NUEVO: `src/components/activity/ActivityFilters.tsx`**

Filtro simple por tipo de actividad.

```typescript
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function ActivityFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<string | null>(
    searchParams.get("type")
  );
  
  const handleFilterChange = (type: string | null) => {
    setActiveFilter(type);
    
    // Actualizar URL con query params
    const params = new URLSearchParams(searchParams);
    if (type) {
      params.set("type", type);
    } else {
      params.delete("type");
    }
    router.push(`/activity?${params.toString()}`);
  };
  
  return (
    <div className="activity-filters">
      <button
        className={`filter-chip ${activeFilter === null ? "active" : ""}`}
        onClick={() => handleFilterChange(null)}
      >
        Todas
      </button>
      
      <button
        className={`filter-chip ${activeFilter === "email_import" ? "active" : ""}`}
        onClick={() => handleFilterChange("email_import")}
      >
        📥 Importaciones
      </button>
      
      <button
        className={`filter-chip ${activeFilter === "ai_processing" ? "active" : ""}`}
        onClick={() => handleFilterChange("ai_processing")}
      >
        🤖 Procesamiento IA
      </button>
      
      <button
        className={`filter-chip ${activeFilter === "kanban_update" ? "active" : ""}`}
        onClick={() => handleFilterChange("kanban_update")}
      >
        📋 Kanban
      </button>
    </div>
  );
}
```

**Nota:** Para MVP, este componente es opcional. Puede implementarse después si es necesario.

---

## 🎨 Estilos CSS

**Agregar a `src/app/globals.css`:**

### Indicaciones de Diseño (Sin código CSS específico)

#### Página de Historial
- Contenedor principal centrado, ancho máximo 1200px
- Padding general: 2rem
- Background: Fondo del sistema

#### Tarjetas de Estadísticas
- Grid responsive: 4 columnas en desktop, 2 en tablet, 1 en mobile
- Gap entre tarjetas: 1rem
- Cada tarjeta:
  - Fondo blanco
  - Borde sutil (gris claro)
  - Border radius: 8px
  - Padding: 1.5rem
  - Display flex con icono a la izquierda
  - Icono: Tamaño 2rem
  - Label: Tamaño pequeño (0.875rem), color secundario
  - Valor: Tamaño grande (1.75rem), peso bold

**Tarjeta de Costo (destacada):**
- Fondo degradado morado: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Texto blanco
- Sin borde

#### Timeline de Actividades
- Contenedor:
  - Fondo blanco
  - Borde sutil
  - Border radius: 8px
  - Padding: 1.5rem

**Items del timeline:**
- Display flex con icono a la izquierda
- Borde izquierdo de 3px según estado:
  - Success: Verde
  - Warning: Naranja
  - Error: Rojo
- Icono: Tamaño 1.5rem, flex-shrink: 0
- Header: Flex space-between (descripción vs tiempo)
- Descripción: Peso medium, color primario
- Tiempo relativo: Tamaño pequeño (0.75rem), color terciario
- Metadata: Display flex con gap, tamaño pequeño (0.875rem), color secundario

#### Filtros
- Display flex horizontal
- Gap: 0.75rem
- Chips clicables con border-radius pill
- Chip activo: Fondo del color primario, texto blanco
- Chip inactivo: Fondo transparente, borde gris

---

## 📝 Checklist de Implementación

### Backend

- [ ] **Agregar modelo `ActivityLog` a `prisma/schema.prisma`**
- [ ] **Actualizar modelo `User` con relación `activityLogs`**
- [ ] **Ejecutar migración:** `npx prisma migrate dev --name add_activity_log`
- [ ] **Generar cliente Prisma:** `npx prisma generate`
- [ ] **Crear `src/lib/activity-logger.ts`:**
  - [ ] Función `logActivity()`
  - [ ] Función `getUserActivityLog()`
  - [ ] Función `getUserActivityStats()`
- [ ] **Modificar `src/actions/emails.ts`:**
  - [ ] Importar `logActivity`
  - [ ] Registrar actividad al final de `importEmailsFromJSON`
- [ ] **Modificar `src/actions/ai-processing.ts`:**
  - [ ] Agregar constantes de pricing
  - [ ] Agregar función `calculateAICost()`
  - [ ] Capturar `usage` de OpenAI
  - [ ] Registrar actividad con costo calculado
- [ ] **Modificar `src/actions/kanban.ts`:**
  - [ ] Capturar estado anterior de la tarea
  - [ ] Registrar actividad después de actualizar
- [ ] **Crear `src/actions/activity.ts`:**
  - [ ] Función `getActivityHistory()`
  - [ ] Función `getActivityStatistics()`

### Frontend

- [ ] **Crear página `src/app/(protected)/activity/page.tsx`**
- [ ] **Crear `src/components/activity/ActivityStats.tsx`**
- [ ] **Crear `src/components/activity/ActivityTimeline.tsx`**
- [ ] **Crear `src/components/activity/ActivityFilters.tsx`** (opcional)
- [ ] **Agregar estilos en `src/app/globals.css`:**
  - [ ] Estilos para `.activity-stats`
  - [ ] Estilos para `.stat-card`
  - [ ] Estilos para `.activity-timeline`
  - [ ] Estilos para `.activity-item`
  - [ ] Estilos para filtros (si aplica)

### Pruebas

- [ ] **Importar emails y verificar registro en historial**
- [ ] **Procesar emails con IA y verificar:**
  - [ ] Cálculo correcto de costo
  - [ ] Confianza promedio calculada
  - [ ] Registro en historial
- [ ] **Mover tareas en Kanban y verificar registro**
- [ ] **Abrir página `/activity` y verificar:**
  - [ ] Estadísticas correctas
  - [ ] Timeline se muestra correctamente
  - [ ] Fechas relativas funcionan
  - [ ] Metadata se muestra según tipo

---

## 🔍 Casos de Prueba Recomendados

### 1. Importación Exitosa

**Acción:** Importar 10 emails válidos desde JSON

**Resultado esperado:**
- Registro en `ActivityLog`:
  - `activityType`: "email_import"
  - `status`: "success"
  - `metadata.successfulImports`: 10
  - `metadata.failedImports`: 0
- Visible en página de historial

### 2. Importación Parcial

**Acción:** Importar 10 emails, 2 duplicados, 1 con error

**Resultado esperado:**
- `status`: "partial_success"
- `metadata.successfulImports`: 7
- `metadata.duplicates`: 2
- `metadata.failedImports`: 1
- `metadata.errors`: Array con detalles del error

### 3. Procesamiento IA

**Acción:** Procesar 5 emails con gpt-4o-mini

**Resultado esperado:**
- `activityType`: "ai_processing"
- `metadata.tokensUsed`: Objeto con prompt/completion/total
- `estimatedCost`: Valor > 0 (en centavos)
- `metadata.averageConfidence`: Entre 0-100
- Costo mostrado en página de historial

### 4. Movimiento de Tarea

**Acción:** Mover tarea de "Por Hacer" a "En Progreso"

**Resultado esperado:**
- `activityType`: "kanban_update"
- `metadata.previousStatus`: "todo"
- `metadata.newStatus`: "doing"
- `metadata.relatedEmail`: Datos del email asociado
- Descripción legible en timeline

### 5. Estadísticas Acumuladas

**Acción:** Realizar 3 importaciones, 2 procesamientos, 5 movimientos

**Resultado esperado en `/activity`:**
- Tarjeta "Importaciones": 3
- Tarjeta "Procesamientos IA": 2
- Tarjeta "Movimientos Kanban": 5
- Tarjeta "Costo Acumulado": Suma correcta de costos

---

## 🚨 Puntos Críticos de Atención

### 1. Manejo de Errores

**Principio:** El logging NO debe romper funcionalidad principal.

```typescript
// ✅ CORRECTO: Try-catch sin lanzar error
try {
  await logActivity({...});
} catch (error) {
  console.error("Error logging:", error);
  // NO hacer: throw error;
}
```

### 2. Obtención de `userId`

**Estado actual:** Parámetro hardcodeado `"demo-user"`

**Acción futura:** Reemplazar con sesión real cuando implementes autenticación:

```typescript
// Ejemplo con NextAuth
import { getServerSession } from "next-auth";
const session = await getServerSession();
const userId = session?.user?.id;

// Ejemplo con Clerk
import { auth } from "@clerk/nextjs";
const { userId } = auth();
```

### 3. Precisión de Costos

**Importante:** Los precios de OpenAI cambian. Verificar periódicamente en https://openai.com/pricing

**Actualizar constante `MODEL_PRICING` cuando cambien precios.**

### 4. Privacidad de Datos

**Consideraciones:**
- `metadata` contiene información sensible (asuntos de emails, nombres)
- **NO** almacenar contenido completo de emails
- Limitar errores a primeros 5 (ya implementado)
- Truncar descripciones de tareas a 50 caracteres

### 5. Performance

**Optimizaciones:**
- Index en `[userId, createdAt]` para queries rápidas
- Limitar historial a 50 actividades por defecto
- Paginación para historial largo (implementar después)

---

## 📌 Notas Finales

- **Este sistema es la base para facturación futura**: El tracking de costos IA permite implementar billing por uso más adelante
- **Es extensible**: Agregar nuevos `activityType` es trivial (ej: "email_deleted", "bulk_approval")
- **Es auditable**: Cualquier acción importante queda registrada con timestamp
- **Es transparente**: El usuario siempre sabe cuánto está gastando en IA

---

**Fin del Documento**