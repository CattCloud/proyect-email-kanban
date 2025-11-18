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
  idEmail: string; // ID externo del email
  from: string;
  subject: string;
  body: string;
  receivedAt: Date;
  createdAt: Date; // Fecha de importación del email
  processedAt: Date | null; // Null = no procesado, fecha = procesado
  approvedAt: Date | null; // Null = no aprobado, fecha = aprobado
  metadata?: EmailMetadata | null;
}

export interface EmailWithMetadata extends PrismaEmail {
  metadata: EmailMetadata | null;
}

export interface Tag {
  id: string;
  descripcion: string;
  createdAt: Date;
}

// Tipos para filtros
export type EmailFilterEstado = "todos" | "procesado" | "sin-procesar" | "aprobado";
export type EmailFilterCategoria = "todas" | "cliente" | "lead" | "interno" | "spam";
export type EmailFilterPriority = "todas" | "alta" | "media" | "baja";
export type EmailFilterAprobacion = "todos" | "aprobado" | "no-aprobado";
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
    mostFrequentSender?: {  
    email: string;
    count: number;
  } | null;
}