import type {
  EmailInput,
  EmailAnalysis,
  ConfidenceSignals,
  ConfidenceBreakdown,
} from "@/types/ai";

function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function getDaysUntil(dateIso: string): number {
  const target = new Date(dateIso);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

/**
 * 1. Validez de Tareas Extraídas (30%)
 */
export function calculateTaskValidityScore(
  email: EmailInput,
  analysis: EmailAnalysis
): number {
  if (!analysis.tasks || analysis.tasks.length === 0) {
    return 60;
  }

  const emailText = `${email.subject} ${email.body}`.toLowerCase();
  let validTasks = 0;
  let invalidTasks = 0;

  for (const task of analysis.tasks) {
    const taskWords = task.description
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);

    if (taskWords.length === 0) {
      invalidTasks += 1;
      continue;
    }

    const matchingWords = taskWords.filter((word) => emailText.includes(word));
    const matchRate = matchingWords.length / taskWords.length;

    if (matchRate >= 0.5) {
      validTasks += 1;
    } else {
      invalidTasks += 1;
    }
  }

  const score = 60 + validTasks * 15 - invalidTasks * 30;
  return clampScore(score);
}

/**
 * 2. Coherencia de Priorización (20%)
 */
export function calculatePriorityCoherenceScore(
  email: EmailInput,
  analysis: EmailAnalysis
): number {
  const text = `${email.subject} ${email.body}`.toLowerCase();
  let score = 100;

  if (analysis.priority === "alta") {
    const hasUrgency = /urgente|asap|inmediato|crítico|critico|hoy/.test(text);

    const hasShortDeadline = analysis.tasks.some((task) => {
      if (!task.due_date) return false;
      const daysUntil = getDaysUntil(task.due_date);
      return daysUntil <= 2;
    });

    if (!hasUrgency && !hasShortDeadline) {
      score -= 30;
    }
  }

  if (analysis.priority === "media") {
    const hasImportance = /importante|revisar|pronto/.test(text);
    if (!hasImportance) {
      score -= 15;
    }
  }

  if (analysis.priority === "baja") {
    const isInformational =
      /fyi|informativo|nota|actualización|actualizacion/.test(text);
    const hasUrgency = /urgente|asap|inmediato/.test(text);

    if (hasUrgency) {
      score -= 20;
    } else if (!isInformational) {
      score -= 10;
    }
  }

  return clampScore(score);
}

/**
 * 3. Claridad del Contenido (15%)
 */
export function calculateClarityScore(
  email: EmailInput,
  analysis: EmailAnalysis
): number {
  let score = 50;
  const text = `${email.subject} ${email.body}`.toLowerCase();

  const datePattern = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/;
  if (datePattern.test(text)) score += 20;

  const actionVerbs = [
    "enviar",
    "revisar",
    "agendar",
    "validar",
    "aprobar",
    "actualizar",
  ];
  const hasActions = actionVerbs.some((verb) => text.includes(verb));
  if (hasActions) score += 15;

  if (/[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+|\d+/.test(email.body)) score += 10;

  const paragraphs = email.body.split(/\n{2,}/).length;
  if (paragraphs >= 2 && paragraphs <= 5) score += 10;

  if (email.body.length < 50) score -= 20;

  const vagueWords = ["luego", "pronto", "cuando puedas", "tal vez"];
  if (vagueWords.some((word) => text.includes(word))) score -= 15;

  return clampScore(score);
}

/**
 * 4. Completitud de Metadata (15%)
 */
export function calculateCompletenessScore(
  analysis: EmailAnalysis
): number {
  let points = 0;
  const maxPoints = 100;

  if (analysis.category) points += 20;
  if (analysis.priority) points += 20;
  if (analysis.summary && analysis.summary.length >= 10) points += 15;

  if (analysis.contact_name && analysis.contact_name.length >= 2) {
    points += 15;
  }

  if (analysis.tasks.length > 0) {
    points += 20;

    const tasksWithDate = analysis.tasks.filter((t) => t.due_date !== null).length;
    points += Math.min(10, tasksWithDate * 5);
  }

  const ratio = points / maxPoints;
  return clampScore(Math.round(ratio * 100));
}

/**
 * 5. Coincidencia con Patrones (10%)
 */
export function calculatePatternMatchScore(
  analysis: EmailAnalysis,
  historicalData: {
    previousApprovals: number;
    knownCategory: string | null;
  }
): number {
  let score = 50;

  if (historicalData.previousApprovals >= 80) {
    score += 30;
  } else if (historicalData.previousApprovals >= 50) {
    score += 15;
  }

  if (
    historicalData.knownCategory &&
    historicalData.knownCategory === analysis.category
  ) {
    score += 20;
  }

  return clampScore(score);
}

/**
 * 6. Calidad de Tags (5%)
 */
export function calculateTagsQualityScore(
  analysis: EmailAnalysis,
  existingTags: string[]
): number {
  const allTags = analysis.tasks.flatMap((task) => task.tags ?? []);

  if (allTags.length === 0) {
    return 40;
  }

  const existingCount = allTags.filter((tag) => existingTags.includes(tag)).length;
  const reuseRate = existingCount / allTags.length;

  if (reuseRate === 1) return 100;
  if (reuseRate >= 0.7) return 85;
  if (reuseRate >= 0.5) return 70;
  return 50;
}

/**
 * 7. Historial de Feedback (5%)
 */
export function calculateFeedbackPenalty(email: EmailInput): number {
  const extended = email as EmailInput & { reprocessCount?: number };
  const raw = extended.reprocessCount ?? 0;
  const reprocessCount = raw < 0 ? 0 : raw;

  if (reprocessCount === 0) return 100;

  const penalties = [0, 10, 35, 75];
  const penalty = penalties[Math.min(reprocessCount, 3)];

  return clampScore(100 - penalty);
}

export function generateConfidenceReason(
  signals: ConfidenceSignals,
  overall: number
): string {
  const entries = Object.entries(signals) as Array<
    [keyof ConfidenceSignals, number]
  >;
  const weakestSignal = entries.sort(([, a], [, b]) => a - b)[0];

  const reasons: Record<keyof ConfidenceSignals, string> = {
    clarityScore: "El contenido del email es ambiguo o poco estructurado",
    taskValidityScore: "Las tareas extraídas no están respaldadas por el email",
    completenessScore: "Falta metadata importante (por ejemplo: fecha, tareas, contacto)",
    priorityCoherenceScore:
      "La prioridad asignada no es coherente con el contenido del email",
    patternMatchScore:
      "No se encontraron patrones similares en emails previos del mismo contacto",
    tagsQualityScore: "Los tags usados no son óptimos o no siguen el catálogo",
    feedbackPenalty:
      "Este email fue reprocesado tras uno o más rechazos de resultados IA",
  };

  if (overall >= 90) {
    return "Análisis de alta calidad, confiable para uso directo.";
  }
  if (overall >= 75) {
    return "Análisis sólido, se recomienda una revisión rápida antes de aprobar.";
  }
  if (overall >= 60) {
    return `Revisión necesaria: ${reasons[weakestSignal[0]]}.`;
  }
  return `Alta incertidumbre: ${reasons[weakestSignal[0]]}. Revisar cuidadosamente todo el análisis antes de aprobar.`;
}

export function calculateConfidenceLevel(
  email: EmailInput,
  analysis: EmailAnalysis,
  context: {
    existingTags: string[];
    historicalApprovals?: number;
    knownCategory?: string;
  }
): ConfidenceBreakdown {
  const signals: ConfidenceSignals = {
    clarityScore: calculateClarityScore(email, analysis),
    patternMatchScore: calculatePatternMatchScore(analysis, {
      previousApprovals: context.historicalApprovals ?? 0,
      knownCategory: context.knownCategory ?? null,
    }),
    completenessScore: calculateCompletenessScore(analysis),
    priorityCoherenceScore: calculatePriorityCoherenceScore(email, analysis),
    taskValidityScore: calculateTaskValidityScore(email, analysis),
    tagsQualityScore: calculateTagsQualityScore(analysis, context.existingTags),
    feedbackPenalty: calculateFeedbackPenalty(email),
  };

  const weights: Record<keyof ConfidenceSignals, number> = {
    clarityScore: 0.15,
    patternMatchScore: 0.1,
    completenessScore: 0.15,
    priorityCoherenceScore: 0.2,
    taskValidityScore: 0.3,
    tagsQualityScore: 0.05,
    feedbackPenalty: 0.05,
  };

  let overallScore = 0;
  (Object.keys(signals) as Array<keyof ConfidenceSignals>).forEach((key) => {
    overallScore += signals[key] * weights[key];
  });

  const roundedOverall = Math.round(overallScore);

  const interpretation =
    roundedOverall >= 90
      ? "excelente"
      : roundedOverall >= 75
      ? "bueno"
      : roundedOverall >= 60
      ? "aceptable"
      : roundedOverall >= 40
      ? "dudoso"
      : "bajo";

  const color =
    roundedOverall >= 75
      ? "green"
      : roundedOverall >= 60
      ? "yellow"
      : roundedOverall >= 40
      ? "orange"
      : "red";

  const requiresReview = roundedOverall < 80;
  const reason = generateConfidenceReason(signals, roundedOverall);

  return {
    overallScore: roundedOverall,
    signals,
    interpretation,
    color,
    requiresReview,
    reason,
  };
}