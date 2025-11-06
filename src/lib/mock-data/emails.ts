// src/lib/mock-data/emails.ts
// Mock data para emails del sistema
// Semana 1: Frontend Only - Sin conexión a base de datos

export interface EmailMock {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string; // ISO format
  processed: boolean;
  category: 'cliente' | 'lead' | 'interno' | 'spam' | null;
  priority: 'alta' | 'media' | 'baja' | null;
  hasTask: boolean;
  taskDescription: string | null;
  taskStatus: 'todo' | 'doing' | 'done' | null;
}

// Array de 15 emails con variedad para testing
export const mockEmails: EmailMock[] = [
  {
    id: 'email-001',
    from: 'maria.gonzalez@acmecorp.com',
    subject: 'Urgente: Propuesta Q4 necesita revisión',
    body: 'Hola, necesitamos revisar la propuesta para el cuarto trimestre. El cliente ha solicitado cambios específicos en el presupuesto y cronograma. ¿Podríamos agendar una reunión para esta semana?',
    receivedAt: '2024-11-01T09:15:00Z',
    processed: true,
    category: 'cliente',
    priority: 'alta',
    hasTask: true,
    taskDescription: 'Actualizar números de propuesta Q4 y agendar llamada con cliente',
    taskStatus: 'todo'
  },
  {
    id: 'email-002',
    from: 'prospecto@nuevaempresa.com',
    subject: 'Consulta sobre servicios de desarrollo',
    body: 'Buenos días, somos una startup que busca desarrollar una plataforma web para nuestro marketplace. ¿Podrían enviarme información sobre sus servicios y tarifas? Nos interesa especialmente el desarrollo con React y Next.js.',
    receivedAt: '2024-11-01T10:30:00Z',
    processed: true,
    category: 'lead',
    priority: 'media',
    hasTask: true,
    taskDescription: 'Enviar propuesta comercial y agendar demo técnica',
    taskStatus: 'doing'
  },
  {
    id: 'email-003',
    from: 'equipo@miempresa.com',
    subject: 'Actualización semanal del proyecto',
    body: 'Equipo, adjunto el reporte semanal. Todo avanza según lo planificado. El sprint actual va por buen camino y esperamos completar todas las tareas asignadas para el viernes.',
    receivedAt: '2024-11-01T14:00:00Z',
    processed: true,
    category: 'interno',
    priority: 'baja',
    hasTask: false,
    taskDescription: null,
    taskStatus: null
  },
  {
    id: 'email-004',
    from: 'spam@sospechoso.com',
    subject: '¡Oferta increíble! Gana dinero rápido',
    body: 'Has sido seleccionado para ganar $10,000 dólares. Solo necesitas hacer clic en este enlace y completar el registro. ¡Oferta limitada!',
    receivedAt: '2024-11-01T16:45:00Z',
    processed: true,
    category: 'spam',
    priority: null,
    hasTask: false,
    taskDescription: null,
    taskStatus: null
  },
  {
    id: 'email-005',
    from: 'juan.perez@techsolutions.com',
    subject: 'Renovación de contrato anual',
    body: 'Como todos los años, es tiempo de renovar nuestro acuerdo de servicios. Esta vez ourselves gustaría negociar mejores tarifas dado el volumen de trabajo que hemos manejado juntos.',
    receivedAt: '2024-11-02T08:20:00Z',
    processed: true,
    category: 'cliente',
    priority: 'media',
    hasTask: true,
    taskDescription: 'Preparar propuesta de renovación con mejores condiciones',
    taskStatus: 'todo'
  },
  {
    id: 'email-006',
    from: 'startup-innovadora@empresa.com',
    subject: 'Demo request for AI platform',
    body: 'We are a Series A startup looking for an AI-powered solution to automate our customer support. Would love to schedule a demo to see your platform in action. Our team is particularly interested in the integration capabilities.',
    receivedAt: '2024-11-02T11:10:00Z',
    processed: true,
    category: 'lead',
    priority: 'alta',
    hasTask: true,
    taskDescription: 'Coordinar demo técnica y preparar material de presentación',
    taskStatus: 'doing'
  },
  {
    id: 'email-007',
    from: 'rrhh@company.com',
    subject: 'Encuesta de satisfacción interna',
    body: 'Por favor toma unos minutos para completar la encuesta de satisfacción del empleado. Tus comentarios son muy importantes para mejorar nuestro ambiente de trabajo.',
    receivedAt: '2024-11-02T13:30:00Z',
    processed: true,
    category: 'interno',
    priority: 'baja',
    hasTask: false,
    taskDescription: null,
    taskStatus: null
  },
  {
    id: 'email-008',
    from: 'soporte@emailfalso.com',
    subject: 'Tu cuenta será suspendida',
    body: 'Su cuenta ha sido marcada por actividad sospechosa. Debe verificar su identidad haciendo clic en el enlace adjunto en las próximas 24 horas o su cuenta será suspendida permanentemente.',
    receivedAt: '2024-11-02T15:45:00Z',
    processed: true,
    category: 'spam',
    priority: null,
    hasTask: false,
    taskDescription: null,
    taskStatus: null
  },
  {
    id: 'email-009',
    from: 'ana.rodriguez@innovacion.com',
    subject: 'Partnership opportunity - Joint project',
    body: 'We have been following your work and believe there could be an interesting partnership opportunity. We are working on a revolutionary AI product and would love to explore how our technologies could complement each other.',
    receivedAt: '2024-11-03T09:00:00Z',
    processed: true,
    category: 'lead',
    priority: 'media',
    hasTask: true,
    taskDescription: 'Investigar empresa y preparar propuesta de partnership',
    taskStatus: 'done'
  },
  {
    id: 'email-010',
    from: 'direccion@miempresa.com',
    subject: 'Reunión de seguimiento mensual',
    body: 'Te recordamos que el viernes tenemos la reunión de seguimiento mensual. Por favor prepara un resumen de los KPIs de tu área y los objetivos del próximo mes.',
    receivedAt: '2024-11-03T10:15:00Z',
    processed: true,
    category: 'interno',
    priority: 'media',
    hasTask: true,
    taskDescription: 'Preparar reporte mensual con KPIs y objetivos',
    taskStatus: 'todo'
  },
  {
    id: 'email-011',
    from: 'cliente-importante@grandeempresa.com',
    subject: 'Solicitud de presupuesto urgente',
    body: 'Necesitamos una propuesta para un proyecto de transformación digital. El cliente final requiere una respuesta en 48 horas. Es un contrato grande que podría ser muy lucrative para ambas empresas.',
    receivedAt: '2024-11-04T14:30:00Z',
    processed: false,
    category: null,
    priority: null,
    hasTask: false,
    taskDescription: null,
    taskStatus: null
  },
  {
    id: 'email-012',
    from: 'eventos@tecnologia.com',
    subject: 'Invitación a TechConf 2024',
    body: 'Estás cordialmente invitado al evento TechConf 2024, donde se reunirán los líderes de la industria tecnológica. Habrá conferencias, workshops y oportunidades de networking único.',
    receivedAt: '2024-11-04T16:20:00Z',
    processed: false,
    category: null,
    priority: null,
    hasTask: false,
    taskDescription: null,
    taskStatus: null
  },
  {
    id: 'email-013',
    from: 'marketing@empresacliente.com',
    subject: 'Campaña de marketing Q1 2025',
    body: 'Para el primer trimestre de 2025 estamos planificando una campaña de marketing integral. Necesitamos un socio tecnológico que nos ayude con la implementación de la estrategia digital.',
    receivedAt: '2024-11-05T11:45:00Z',
    processed: false,
    category: null,
    priority: null,
    hasTask: false,
    taskDescription: null,
    taskStatus: null
  },
  {
    id: 'email-014',
    from: 'proveedor@outsourcing.com',
    subject: 'Optimización de procesos',
    body: 'Hemos identificado oportunidades de optimización en nuestros procesos actuales. Creemos que una consultoría especializada podría ayudarnos a mejorar la eficiencia operacional.',
    receivedAt: '2024-11-05T13:00:00Z',
    processed: false,
    category: null,
    priority: null,
    hasTask: false,
    taskDescription: null,
    taskStatus: null
  },
  {
    id: 'email-015',
    from: 'innovacion@startup.com',
    subject: 'Colaboración en AI research',
    body: 'Somos una startup enfocada en investigación de IA y nos interesa explorar posibles colaboraciones con empresas que tengan experiencia en implementación de soluciones de machine learning.',
    receivedAt: '2024-11-06T08:30:00Z',
    processed: false,
    category: null,
    priority: null,
    hasTask: false,
    taskDescription: null,
    taskStatus: null
  }
];

// Función para obtener un email por ID
export function getEmailById(id: string): EmailMock | undefined {
  return mockEmails.find(email => email.id === id);
}

// Función para obtener emails recientes (para el dashboard)
export function getRecentEmails(limit: number = 5): EmailMock[] {
  return mockEmails
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
    .slice(0, limit);
}

// Función para obtener emails con tareas (para el Kanban)
export function getEmailsWithTasks(): EmailMock[] {
  return mockEmails.filter(email => email.hasTask);
}