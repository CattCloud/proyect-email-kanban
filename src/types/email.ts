/**
 * Tipos para emails del sistema
 * Siguiendo las convenciones del Sistema Maestro:
 * - Interfaces: PascalCase + sufijo descriptivo
 * - Exportar desde archivos dedicados en src/types/
 */

export interface EmailMetadata {
  id: string;
  category: string | null;
  priority: string | null;
  hasTask: boolean;
  taskDescription: string | null;
  taskStatus: string | null;
  emailId: string;
}

// Tipo que coincide con lo que devuelve Prisma
export interface PrismaEmail {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: Date;
  processed: boolean;
  metadata?: EmailMetadata | null;
}

export interface EmailWithMetadata extends PrismaEmail {
  metadata: EmailMetadata | null;
}

// Tipos para filtros
export type EmailFilterEstado = "todos" | "procesado" | "sin-procesar";
export type EmailFilterCategoria = "todas" | "cliente" | "lead" | "interno" | "spam";
export type SortDirection = "asc" | "desc";

// Tipos para Server Actions
export interface EmailListResult {
  success: boolean;
  data?: EmailWithMetadata[];
  error?: string;
}

export interface EmailResult {
  success: boolean;
  data?: EmailWithMetadata;
  error?: string;
}

export interface EmailOperationResult {
  success: boolean;
  data?: EmailWithMetadata;
  message?: string;
  error?: string;
}

// Tipos para métricas del dashboard
export interface DashboardMetrics {
  totalEmails: number;
  unprocessedEmails: number;
  pendingTasks: number;
  completedTasks: number;
}