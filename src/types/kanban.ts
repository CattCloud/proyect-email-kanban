/**
 * Tipos específicos para el Kanban por contacto.
 *
 * Reglas del Sistema Maestro:
 * - TypeScript estricto (sin any)
 * - Tipos exportados desde src/types/ (R1)
 * - Pensados para usar con Server Actions de Kanban (Hito Semana 4)
 */

/**
 * Estados válidos de una tarea en el tablero Kanban.
 * Deben mantenerse alineados con el modelo Prisma Task.status.
 */
export type TaskStatus = "todo" | "doing" | "done";

/**
 * Representa una tarea individual tal como se usa en el Kanban por contacto.
 * Cada tarjeta del tablero corresponde a una instancia de este tipo.
 */
export interface KanbanTask {
  /** ID de la tarea (Task.id en base de datos) */
  id: string;
  /** Descripción breve de la tarea (Task.description) */
  description: string;
  /** Estado actual de la tarea (todo, doing, done) */
  status: TaskStatus;
  /** Fecha límite opcional de la tarea (Task.dueDate) */
  dueDate: Date | null;
  /** Lista de tags normalizados asociados a la tarea (Task.tags) */
  tags: string[];
  /** Lista de participantes (emails) asociados (Task.participants) */
  participants: string[];
  /** Fecha de creación de la tarea (Task.createdAt) */
  createdAt: Date;

  /** ID del email origen de la tarea (Email.id) */
  emailId: string;
  /** Asunto del email origen (Email.subject) */
  emailSubject: string;
  /** Email del remitente principal (Email.from) */
  emailFrom: string;

  /**
   * Contacto principal asociado a la tarea.
   * Normalmente corresponde al remitente del email (modelo Contact).
   */
  contactId: string | null;
  contactName: string | null;
  contactEmail: string;

  /**
   * Campos de metadata opcionales para enriquecer la tarjeta:
   * se derivan de EmailMetadata cuando aplica.
   */
  category?: string | null;
  priority?: string | null;
  approvedAt?: Date | null;
}

/**
 * Contacto mostrado en el selector de Kanban.
 * Representa la vista agregada por persona (cliente, lead o interno).
 */
export interface KanbanContact {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;

  /**
   * Contadores opcionales calculados por Server Actions.
   * Pueden usarse para mostrar carga de trabajo por contacto.
   */
  totalTasks?: number;
  todoTasks?: number;
  doingTasks?: number;
  doneTasks?: number;
}

/**
 * Resultado estándar de Server Actions que retornan tareas para el Kanban.
 */
export interface KanbanTasksResult {
  success: boolean;
  data?: KanbanTask[];
  error?: string;
}

/**
 * Resultado estándar de Server Actions que retornan contactos para el Kanban.
 */
export interface KanbanContactsResult {
  success: boolean;
  data?: KanbanContact[];
  error?: string;
}