// Tipos para el Sistema de Historial de Actividad por Usuario

export type ActivityType = "email_import" | "ai_processing" | "kanban_update";
export type ActivityStatus = "success" | "partial_success" | "error";

// Metadata específica para importación de emails
export interface EmailImportMetadata {
  totalEmails: number;        // Total intentados
  successfulImports: number;  // Importados exitosamente
  failedImports: number;      // Fallidos
  duplicates: number;         // Duplicados detectados
  source: "json_upload" | "gmail_sync"; // Fuente de importación
  
  // Opcional: resumen de errores (máximo 5 para no saturar)
  errors?: Array<{
    idEmail: string;
    reason: string;
  }>;
}

// Metadata específica para procesamiento IA
export interface AIProcessingMetadata {
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

// Metadata específica para actualización de Kanban
export interface KanbanUpdateMetadata {
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

// Tipo unificado para metadata de actividad
export type ActivityMetadata = EmailImportMetadata | AIProcessingMetadata | KanbanUpdateMetadata;

// Entrada de historial de actividad para el usuario
export interface UserActivityLogEntry {
  id: string;
  createdAt: Date;
  activityType: ActivityType;
  status: ActivityStatus;
  description: string;
  metadata: ActivityMetadata;
  estimatedCost: number | null;
  relatedEmailIds: string[];
  relatedTaskIds: string[];
  
  // Relación con User (simplificada para el frontend)
  user: {
    id: string;
    email: string;
    name?: string;
    image?: string;
  };
}

// Estadísticas agregadas de actividad por usuario
export interface UserActivityStats {
  totalImports: number;
  totalProcessings: number;
  totalKanbanUpdates: number;
  totalCostUSD: number; // Convertido de centavos a USD
}

// Parámetros para logging de actividad
export interface LogActivityParams {
  userId: string;
  activityType: ActivityType;
  status: ActivityStatus;
  description: string;
  metadata: ActivityMetadata;
  estimatedCost?: number; // En centavos
  relatedEmailIds?: string[];
  relatedTaskIds?: string[];
}

// Filtros para consultas de historial
export interface ActivityLogFilters {
  activityType?: ActivityType;
  limit?: number;
  offset?: number;
}

// Respuesta estándar de Server Actions de actividad
export interface ActivityLogResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}