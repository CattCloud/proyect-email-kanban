# Sistema de Nivel de Confianza IA para Metadata de Emails

**Versión:** 1.0  
**Fecha:** Noviembre 2025  
**Estado:** Especificación Técnica Completa

---

## 📊 Visión General del Sistema

El **Nivel de Confianza** es una métrica compuesta (0-100%) que indica qué tan confiable es el análisis IA de un email. **NO es un número que la IA genere arbitrariamente**, sino una puntuación calculada **server-side** basada en señales objetivas y verificables del contenido y el análisis generado.

### Principio Fundamental

> **La IA se enfoca en hacer buen análisis, el servidor evalúa la calidad después.**

La IA (OpenAI GPT) genera metadata estructurada (categoría, prioridad, resumen, tareas). El servidor analiza ese output y calcula el nivel de confianza usando algoritmos heurísticos y validaciones objetivas.

---

## 🎯 Objetivos del Sistema

1. **Transparencia:** El usuario entiende POR QUÉ un análisis tiene baja/alta confianza
2. **Priorización:** Emails con baja confianza van primero a revisión humana
3. **Eficiencia:** Emails con alta confianza (≥80%) pueden trabajarse sin revisión formal
4. **Mejora continua:** El sistema aprende de rechazos y ajusta criterios

---

## 🧮 Cálculo del Nivel de Confianza

### Fórmula Base

```
Nivel de Confianza = Σ (Factor_i × Peso_i) / Σ Peso_i
```

### Factores de Confianza (7 dimensiones)

| Factor | Peso | Descripción |
|--------|------|-------------|
| **1. Validez de Tareas Extraídas** | **30%** | ⭐ MÁS CRÍTICO: Verifica que tareas estén en el email |
| **2. Coherencia de Priorización** | **20%** | Valida que prioridad sea coherente con contenido |
| **3. Claridad del Contenido** | **15%** | Mide estructura y explicitez del email |
| **4. Completitud de Metadata** | **15%** | Verifica que metadata esté completa |
| **5. Coincidencia con Patrones** | **10%** | Compara con emails previos exitosos |
| **6. Calidad de Tags** | **5%** | Valida uso estratégico de etiquetas |
| **7. Historial de Feedback** | **5%** | Penaliza reprocesos tras rechazos |

---

## 📐 Desglose de Cada Factor

### 1. Validez de Tareas Extraídas (30%)

**Objetivo:** Garantizar que las tareas generadas por la IA estén realmente respaldadas por el contenido del email.

**Criterios de Validación:**

✅ **Tarea válida (100 pts c/u):**
- Contiene verbo de acción al inicio
- Al menos 50% de palabras clave aparecen en el email original
- Es específica (no genérica como "responder email")
- Tiene longitud razonable (10-150 caracteres)

❌ **Tarea inválida (penalización -30 pts c/u):**
- Menos del 50% de palabras clave aparecen en el email
- Es interpretación excesiva del contenido
- Es demasiado genérica o vaga

**Algoritmo:**

```typescript
function calculateTaskValidityScore(
  email: EmailInput,
  analysis: EmailAnalysis
): number {
  if (analysis.tasks.length === 0) {
    return 60; // Sin tareas: incompleto pero no error
  }

  const emailText = `${email.subject} ${email.body}`.toLowerCase();
  let validTasks = 0;
  let invalidTasks = 0;

  for (const task of analysis.tasks) {
    const taskWords = task.description
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3); // Solo palabras significativas

    // Match de palabras clave
    const matchingWords = taskWords.filter(word => 
      emailText.includes(word)
    );
    
    const matchRate = matchingWords.length / taskWords.length;

    if (matchRate >= 0.5) {
      validTasks++;
    } else {
      invalidTasks++;
    }
  }

  // Scoring: +15 pts por tarea válida, -30 pts por inválida
  const score = (validTasks * 15) - (invalidTasks * 30);

  return Math.max(0, Math.min(100, 60 + score));
}
```

---

### 2. Coherencia de Priorización (20%)

**Objetivo:** Validar que la prioridad asignada tenga respaldo en el contenido.

**Reglas de Coherencia:**

| Prioridad | Debe cumplir AL MENOS 1 de: | Penalización si no cumple |
|-----------|------------------------------|---------------------------|
| **Alta** | - Menciona "urgente" o "ASAP"<br>- Fecha < 48h<br>- Cliente VIP | -30 pts |
| **Media** | - Fecha entre 3-7 días<br>- Palabras "importante", "revisar" | -15 pts |
| **Baja** | - Sin fecha explícita<br>- Palabras "FYI", "informativo" | -10 pts |

**Algoritmo:**

```typescript
function calculatePriorityCoherenceScore(
  email: EmailInput,
  analysis: EmailAnalysis
): number {
  const text = `${email.subject} ${email.body}`.toLowerCase();
  let score = 100;

  if (analysis.priority === "alta") {
    const hasUrgency = /urgente|asap|inmediato|crítico|hoy/.test(text);
    const hasShortDeadline = analysis.tasks.some(task => {
      if (!task.due_date) return false;
      const daysUntil = getDaysUntil(task.due_date);
      return daysUntil <= 2;
    });
    
    if (!hasUrgency && !hasShortDeadline) {
      score -= 30; // Penalización fuerte
    }
  }

  if (analysis.priority === "media") {
    const hasImportance = /importante|revisar|pronto/.test(text);
    if (!hasImportance) {
      score -= 15;
    }
  }

  if (analysis.priority === "baja") {
    const isInformational = /fyi|informativo|nota|actualización/.test(text);
    const hasUrgency = /urgente|asap|inmediato/.test(text);
    
    if (hasUrgency) {
      score -= 20; // Contradicción clara
    }
  }

  return Math.max(0, score);
}
```

---

### 3. Claridad del Contenido (15%)

**Objetivo:** Medir qué tan estructurado y explícito es el email.

**Señales Positivas (+):**
- Email contiene fechas explícitas ("antes del viernes", "15 de diciembre")
- Usa verbos de acción claros ("enviar", "revisar", "agendar")
- Tiene estructura clara (saludo, cuerpo, cierre)
- Menciona nombres de personas/empresas

**Señales Negativas (-):**
- Email vago o ambiguo ("veamos luego", "cuando puedas")
- Sin estructura (solo una línea)
- Lenguaje coloquial excesivo
- Muchas palabras de relleno

**Algoritmo:**

```typescript
function calculateClarityScore(
  email: EmailInput,
  analysis: EmailAnalysis
): number {
  let score = 50; // Base neutral
  const text = `${email.subject} ${email.body}`.toLowerCase();
  
  // +20 si hay fechas explícitas
  const datePattern = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/;
  if (datePattern.test(text)) score += 20;
  
  // +15 si hay verbos de acción
  const actionVerbs = ["enviar", "revisar", "agendar", "validar", "aprobar", "actualizar"];
  const hasActions = actionVerbs.some(verb => text.includes(verb));
  if (hasActions) score += 15;
  
  // +10 si menciona entidades (nombres propios o números)
  if (/[A-Z][a-z]+|\d+/.test(email.body)) score += 10;
  
  // +10 si tiene estructura (párrafos)
  const paragraphs = email.body.split("\n\n").length;
  if (paragraphs >= 2 && paragraphs <= 5) score += 10;
  
  // -20 si es muy corto (<50 caracteres)
  if (email.body.length < 50) score -= 20;
  
  // -15 si tiene palabras vagas
  const vagueWords = ["luego", "pronto", "cuando puedas", "tal vez"];
  if (vagueWords.some(word => text.includes(word))) score -= 15;
  
  return Math.max(0, Math.min(100, score));
}
```

---

### 4. Completitud de Metadata (15%)

**Objetivo:** Verificar que el análisis IA esté completo.

**Checklist:**

| Item | Puntos |
|------|--------|
| ✅ Categoría asignada (obligatorio) | 20 |
| ✅ Prioridad asignada (obligatorio) | 20 |
| ✅ Resumen generado (obligatorio) | 15 |
| ✅ Nombre de contacto extraído | 15 |
| ✅ Al menos 1 tarea extraída | 20 |
| ✅ Tareas tienen fecha de vencimiento | 10 (por tarea con fecha) |

**Algoritmo:**

```typescript
function calculateCompletenessScore(
  analysis: EmailAnalysis
): number {
  let points = 0;
  const maxPoints = 100;

  // Obligatorios
  if (analysis.category) points += 20;
  if (analysis.priority) points += 20;
  if (analysis.summary && analysis.summary.length >= 10) points += 15;
  
  // Opcionales pero valiosos
  if (analysis.contact_name && analysis.contact_name.length >= 2) points += 15;
  
  // Tareas
  if (analysis.tasks.length > 0) {
    points += 20;
    
    // Bonus por fechas en tareas
    const tasksWithDate = analysis.tasks.filter(t => t.due_date !== null).length;
    points += Math.min(10, tasksWithDate * 5);
  }

  return Math.round((points / maxPoints) * 100);
}
```

---

### 5. Coincidencia con Patrones (10%)

**Objetivo:** Comparar el análisis con patrones aprendidos de emails exitosos.

**Señales:**
- Email similar a otros de la misma categoría aprobados previamente
- Usa vocabulario típico de la categoría asignada
- Estructura de asunto reconocible

**Algoritmo:**

```typescript
function calculatePatternMatchScore(
  analysis: EmailAnalysis,
  historicalData: { 
    previousApprovals: number; // % de aprobaciones del contacto
    knownCategory: string | null; // Categoría usual del contacto
  }
): number {
  let score = 50; // Base neutral

  // +30 si el contacto tiene historial de aprobaciones >80%
  if (historicalData.previousApprovals >= 80) {
    score += 30;
  } else if (historicalData.previousApprovals >= 50) {
    score += 15;
  }

  // +20 si la categoría coincide con patrones previos
  if (historicalData.knownCategory === analysis.category) {
    score += 20;
  }

  // Email completamente nuevo sin referencias: mantener base 50%
  return Math.min(100, score);
}
```

---

### 6. Calidad de Tags (5%)

**Objetivo:** Validar que los tags sean apropiados y del catálogo existente.

**Puntuación:**

| Criterio | Score |
|----------|-------|
| Todas las tareas usan tags del catálogo existente | 100 |
| Mezcla de tags existentes y nuevos razonables | 70 |
| Solo tags nuevos pero justificables | 50 |
| Tags genéricos o redundantes ("urgente", "importante") | 30 |
| Sin tags ([] en todas las tareas) | 40 |

**Algoritmo:**

```typescript
function calculateTagsQualityScore(
  analysis: EmailAnalysis,
  existingTags: string[]
): number {
  const allTags = analysis.tasks.flatMap(task => task.tags);
  
  if (allTags.length === 0) return 40;

  const existingCount = allTags.filter(tag => 
    existingTags.includes(tag)
  ).length;

  const reuseRate = existingCount / allTags.length;

  if (reuseRate === 1) return 100; // Todas del catálogo
  if (reuseRate >= 0.7) return 85;
  if (reuseRate >= 0.5) return 70;
  return 50;
}
```

---

### 7. Historial de Feedback (5%)

**Objetivo:** Penalizar emails que fueron reprocesados tras rechazos.

**Penalizaciones acumulativas:**
- Primer reprocesamiento: -10%
- Segundo reprocesamiento: -25% adicional (-35% total)
- Tercer reprocesamiento: -40% adicional (-75% total)

**Bonificación:**
- Si el contacto tiene 100% de aprobaciones previas: +15%

**Algoritmo:**

```typescript
function calculateFeedbackPenalty(
  email: EmailInput
): number {
  const reprocessCount = email.reprocessCount || 0;

  if (reprocessCount === 0) return 100; // Sin penalización

  const penalties = [0, 10, 35, 75];
  const penalty = penalties[Math.min(reprocessCount, 3)];

  return Math.max(0, 100 - penalty);
}
```

---

## 🎯 Score Final Compuesto

### Función Principal

```typescript
export function calculateConfidenceLevel(
  email: EmailInput,
  analysis: EmailAnalysis,
  context: {
    existingTags: string[];
    historicalApprovals?: number;
    knownCategory?: string;
  }
): ConfidenceBreakdown {
  // Calcular cada señal
  const signals: ConfidenceSignals = {
    clarityScore: calculateClarityScore(email, analysis),
    patternMatchScore: calculatePatternMatchScore(analysis, {
      previousApprovals: context.historicalApprovals || 0,
      knownCategory: context.knownCategory || null,
    }),
    completenessScore: calculateCompletenessScore(analysis),
    priorityCoherenceScore: calculatePriorityCoherenceScore(email, analysis),
    taskValidityScore: calculateTaskValidityScore(email, analysis),
    tagsQualityScore: calculateTagsQualityScore(analysis, context.existingTags),
    feedbackPenalty: calculateFeedbackPenalty(email),
  };

  // Aplicar pesos
  const weights = {
    clarityScore: 0.15,
    patternMatchScore: 0.10,
    completenessScore: 0.15,
    priorityCoherenceScore: 0.20,
    taskValidityScore: 0.30, // MÁS IMPORTANTE
    tagsQualityScore: 0.05,
    feedbackPenalty: 0.05,
  };

  const overallScore = Object.entries(signals).reduce(
    (sum, [key, value]) => sum + value * weights[key as keyof ConfidenceSignals],
    0
  );

  // Determinar interpretación
  const interpretation = 
    overallScore >= 90 ? "excelente" :
    overallScore >= 75 ? "bueno" :
    overallScore >= 60 ? "aceptable" :
    overallScore >= 40 ? "dudoso" : "bajo";

  const color = 
    overallScore >= 75 ? "green" :
    overallScore >= 60 ? "yellow" :
    overallScore >= 40 ? "orange" : "red";

  const requiresReview = overallScore < 80;

  const reason = generateConfidenceReason(signals, overallScore);

  return {
    overallScore: Math.round(overallScore),
    signals,
    interpretation,
    color,
    requiresReview,
    reason,
  };
}
```

---

## 📊 Tabla de Interpretación

| Rango | Interpretación | Comportamiento Sugerido | Indicador Visual |
|-------|---------------|-------------------------|------------------|
| **90-100%** | Excelente | Puede ir directo a Kanban sin revisión | 🟢 Verde sólido |
| **75-89%** | Bueno | Revisión rápida recomendada (5-10 seg) | 🟢 Verde claro |
| **60-74%** | Aceptable | Revisión manual necesaria | 🟡 Amarillo |
| **40-59%** | Dudoso | Revisión detallada OBLIGATORIA | 🟠 Naranja |
| **0-39%** | Bajo | Alto riesgo - revisar TODO | 🔴 Rojo |

---

## 🛠️ Implementación Técnica

### 1. Esquema de Base de Datos

**Nueva Tabla: `AIConfidenceScore`**

```prisma
model AIConfidenceScore {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relación 1:1 con Email
  emailId String @unique
  email   Email  @relation(fields: [emailId], references: [id], onDelete: Cascade)

  // Score general
  overallScore Float // 0-100

  // Desglose individual
  clarityScore           Float
  patternMatchScore      Float
  completenessScore      Float
  priorityCoherenceScore Float
  taskValidityScore      Float
  tagsQualityScore       Float
  feedbackPenalty        Float

  // Interpretación
  interpretation   String  // "excelente" | "bueno" | "aceptable" | "dudoso" | "bajo"
  requiresReview   Boolean
  reviewPriority   Int     // 0-100, inversamente proporcional a overallScore
  confidenceReason String  // Razón legible para el usuario

  // Opcional: JSON completo para debugging
  breakdown Json?

  @@index([overallScore])
  @@index([reviewPriority])
}
```

**Actualizar modelo `Email`:**

```prisma
model Email {
  // ... campos existentes ...

  // Relación con scores de confianza
  confidenceScore AIConfidenceScore?

  // Tracking de reprocesos
  reprocessCount Int @default(0)
}
```

---

### 2. Tipos TypeScript

```typescript
// src/types/ai.ts

export interface ConfidenceSignals {
  clarityScore: number;           // 0-100
  patternMatchScore: number;      // 0-100
  completenessScore: number;      // 0-100
  priorityCoherenceScore: number; // 0-100
  taskValidityScore: number;      // 0-100
  tagsQualityScore: number;       // 0-100
  feedbackPenalty: number;        // 0-100 (100 = sin penalización)
}

export interface ConfidenceBreakdown {
  overallScore: number; // 0-100
  signals: ConfidenceSignals;
  interpretation: "excelente" | "bueno" | "aceptable" | "dudoso" | "bajo";
  color: "green" | "yellow" | "orange" | "red";
  requiresReview: boolean;
  reason: string; // Explicación legible
}

// Schema Zod para validación
export const ConfidenceBreakdownSchema = z.object({
  overallScore: z.number().min(0).max(100),
  signals: z.object({
    clarityScore: z.number().min(0).max(100),
    patternMatchScore: z.number().min(0).max(100),
    completenessScore: z.number().min(0).max(100),
    priorityCoherenceScore: z.number().min(0).max(100),
    taskValidityScore: z.number().min(0).max(100),
    tagsQualityScore: z.number().min(0).max(100),
    feedbackPenalty: z.number().min(0).max(100),
  }),
  interpretation: z.enum(["excelente", "bueno", "aceptable", "dudoso", "bajo"]),
  color: z.enum(["green", "yellow", "orange", "red"]),
  requiresReview: z.boolean(),
  reason: z.string(),
});
```

---

### 3. Servicio de Cálculo

**Archivo: `src/lib/confidence-calculator.ts`**

Este servicio contiene todas las funciones de cálculo descritas anteriormente más:

```typescript
/**
 * Genera explicación legible del nivel de confianza
 */
function generateConfidenceReason(
  signals: ConfidenceSignals,
  overall: number
): string {
  // Encontrar la señal más débil
  const entries = Object.entries(signals);
  const weakestSignal = entries.sort(([, a], [, b]) => a - b)[0];

  const reasons: Record<string, string> = {
    clarityScore: "El contenido del email es ambiguo o poco estructurado",
    taskValidityScore: "Las tareas extraídas no están respaldadas por el email",
    completenessScore: "Falta metadata importante (ej: fecha, tareas)",
    priorityCoherenceScore: "La prioridad asignada no es coherente con el contenido",
    patternMatchScore: "No se encontraron patrones similares en emails previos",
    tagsQualityScore: "Los tags usados no son óptimos",
    feedbackPenalty: "Este email fue reprocesado tras rechazo previo",
  };

  if (overall >= 90) return "Análisis de alta calidad, confiable para uso directo";
  if (overall >= 75) return "Análisis sólido, revisión rápida recomendada";
  if (overall >= 60) return `Revisión necesaria: ${reasons[weakestSignal[0]]}`;
  return `Alta incertidumbre: ${reasons[weakestSignal[0]]}. Revisar cuidadosamente.`;
}
```

---

### 4. Integración en Server Actions

**Archivo: `src/actions/ai-processing.ts`**

```typescript
import { calculateConfidenceLevel } from "@/lib/confidence-calculator";

export async function processEmailsWithAI(emailIds: string[]) {
  // ... código existente (fetch emails, llamar OpenAI) ...

  const analysisResults = validatedResponse.data;

  // Obtener tags existentes para contexto
  const existingTags = await prisma.tag.findMany({
    select: { descripcion: true }
  });
  const tagsList = existingTags.map(t => t.descripcion);

  // Calcular confianza para cada análisis
  const resultsWithConfidence = analysisResults.map((analysis, index) => {
    const emailInput = emailInputs[index];

    const confidence = calculateConfidenceLevel(
      emailInput,
      analysis,
      { existingTags: tagsList }
    );

    return {
      analysis,
      confidence,
      email: emails[index],
    };
  });

  // Persistir en BD con confianza
  for (const { analysis, confidence, email } of resultsWithConfidence) {
    await prisma.$transaction(async (tx) => {
      // Crear/actualizar EmailMetadata
      const metadata = await tx.emailMetadata.upsert({
        where: { emailId: email.id },
        create: {
          emailId: email.id,
          category: analysis.category,
          priority: analysis.priority,
          summary: analysis.summary,
          contactName: analysis.contact_name,
        },
        update: {
          category: analysis.category,
          priority: analysis.priority,
          summary: analysis.summary,
          contactName: analysis.contact_name,
        },
      });

      // Crear/actualizar AIConfidenceScore
      await tx.aIConfidenceScore.upsert({
        where: { emailId: email.id },
        create: {
          emailId: email.id,
          overallScore: confidence.overallScore,
          clarityScore: confidence.signals.clarityScore,
          patternMatchScore: confidence.signals.patternMatchScore,
          completenessScore: confidence.signals.completenessScore,
          priorityCoherenceScore: confidence.signals.priorityCoherenceScore,
          taskValidityScore: confidence.signals.taskValidityScore,
          tagsQualityScore: confidence.signals.tagsQualityScore,
          feedbackPenalty: confidence.signals.feedbackPenalty,
          interpretation: confidence.interpretation,
          requiresReview: confidence.requiresReview,
          reviewPriority: 100 - confidence.overallScore,
          confidenceReason: confidence.reason,
          breakdown: confidence.signals,
        },
        update: {
          overallScore: confidence.overallScore,
          clarityScore: confidence.signals.clarityScore,
          patternMatchScore: confidence.signals.patternMatchScore,
          completenessScore: confidence.signals.completenessScore,
          priorityCoherenceScore: confidence.signals.priorityCoherenceScore,
          taskValidityScore: confidence.signals.taskValidityScore,
          tagsQualityScore: confidence.signals.tagsQualityScore,
          feedbackPenalty: confidence.signals.feedbackPenalty,
          interpretation: confidence.interpretation,
          requiresReview: confidence.requiresReview,
          reviewPriority: 100 - confidence.overallScore,
          confidenceReason: confidence.reason,
          breakdown: confidence.signals,
        },
      });

      // ... resto de la lógica (crear tareas, contactos, etc.) ...
    });
  }

  // ... revalidación y retorno ...
}
```

**Actualizar query de revisión para ordenar por confianza:**

```typescript
export async function getPendingAllAIResults() {
  const emails = await prisma.email.findMany({
    where: {
      processedAt: { not: null },
      approvedAt: null,
    },
    include: {
      metadata: {
        include: { tasks: true }
      },
      confidenceScore: true, // Incluir scores
    },
    orderBy: [
      { confidenceScore: { reviewPriority: 'desc' } }, // Baja confianza primero
      { processedAt: 'desc' }
    ],
  });

  return { success: true, data: emails };
}
```

---

### 5. Componentes UI

**Archivo: `src/components/processing/ConfidenceIndicator.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { ConfidenceSignals } from "@/types/ai";

interface ConfidenceIndicatorProps {
  score: number; // 0-100
  reason: string;
  breakdown?: ConfidenceSignals;
  showDetails?: boolean;
}

export function ConfidenceIndicator({
  score,
  reason,
  breakdown,
  showDetails = false
}: ConfidenceIndicatorProps) {
  const [expanded, setExpanded] = useState(false);

  const getColorClass = () => {
    if (score >= 90) return "confidence-excellent";
    if (score >= 75) return "confidence-good";
    if (score >= 60) return "confidence-acceptable";
    if (score >= 40) return "confidence-doubtful";
    return "confidence-low";
  };

  const getLabel = () => {
    if (score >= 90) return "Excelente";
    if (score >= 75) return "Bueno";
    if (score >= 60) return "Aceptable";
    if (score >= 40) return "Dudoso";
    return "Bajo";
  };

  return (
    <div className="confidence-indicator">
      <div className={`confidence-badge ${getColorClass()}`}>
        <span className="confidence-score">{score}%</span>
        <span className="confidence-label">{getLabel()}</span>
      </div>

      {showDetails && (
        <>
          <p className="confidence-reason">{reason}</p>

          {breakdown && (
            <>
              <button 
                onClick={() => setExpanded(!expanded)}
                className="confidence-toggle"
              >
                {expanded ? "Ocultar desglose" : "Ver desglose"}
              </button>

              {expanded && (
                <div className="confidence-breakdown">
                  <div>Validez Tareas: {Math.round(breakdown.taskValidityScore)}%</div>
                  <div>Coherencia Prioridad: {Math.round(breakdown.priorityCoherenceScore)}%</div>
                  <div>Claridad: {Math.round(breakdown.clarityScore)}%</div>
                  <div>Completitud: {Math.round(breakdown.completenessScore)}%</div>
                  <div>Patrones: {Math.round(breakdown.patternMatchScore)}%</div>
                  <div>Tags: {Math.round(breakdown.tagsQualityScore)}%</div>
                  <div>Historial: {Math.round(breakdown.feedbackPenalty)}%</div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
```


---

## 📝 Resumen de Archivos

### Modificar:
- ✅ `prisma/schema.prisma` - Agregar `AIConfidenceScore` y `reprocessCount`
- ✅ `src/types/ai.ts` - Agregar tipos y schemas Zod
- ✅ `src/actions/ai-processing.ts` - Integrar cálculo de confianza
- ✅ `src/components/processing/ReviewAccordion.tsx` - Mostrar indicador
- ✅ `src/app/globals.css` - Estilos de confianza

### Crear:
- ✅ `src/lib/confidence-calculator.ts` - Servicio de cálculo (NUEVO)
- ✅ `src/components/processing/ConfidenceIndicator.tsx` - Componente UI (NUEVO)

---

## 🧪 Casos de Prueba Recomendados

1. **Email con alta claridad:**
   - Fechas explícitas, tareas claras → `confidenceScore >= 85%`

2. **Email ambiguo:**
   - Sin fechas, tareas vagas → `confidenceScore < 60%`

3. **Email reprocesado:**
   - Con `rejectionReason` → `feedbackPenalty` aplicado correctamente

4. **Tareas inventadas por IA:**
   - `taskValidityScore` debe ser bajo si no están en el email

5. **Prioridad incoherente:**
   - "Alta" sin urgencia → `priorityCoherenceScore` penalizado

---

## 🎯 Beneficios del Sistema

1. ✅ **Transparencia total:** Usuario entiende POR QUÉ revisar
2. ✅ **Priorización automática:** Baja confianza → revisar primero
3. ✅ **Mejora continua:** Sistema aprende de rechazos
4. ✅ **Eficiencia:** Alta confianza → saltar revisión formal
5. ✅ **Debugging:** Señales individuales ayudan a mejorar el prompt

---

## 📌 Notas Finales

- **La IA NO calcula su propia confianza** - El servidor lo hace con algoritmos objetivos
- **El cálculo es 100% server-side** - No depende de la IA para autoevaluarse
- **Es iterativo** - Los pesos pueden ajustarse según métricas reales
- **Es transparente** - Cada señal tiene lógica verificable y auditable

---

**Fin del Documento**