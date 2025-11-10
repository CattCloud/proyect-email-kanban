import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de datos...');

  // Crear emails de ejemplo
  const emails = [
    {
      from: 'cliente@ejemplo.com',
      subject: 'Consulta sobre producto',
      body: 'Hola, estoy interesado en su producto. ¿Podrían enviarme más información?',
      receivedAt: new Date('2025-11-01T10:00:00Z'),
      processed: true,
      metadata: {
        category: 'cliente',
        priority: 'alta',
        hasTask: true,
        taskDescription: 'Responder consulta del cliente',
        taskStatus: 'todo'
      }
    },
    {
      from: 'lead@ejemplo.com',
      subject: 'Solicitud de cotización',
      body: 'Buen día, me gustaría solicitar una cotización para los siguientes servicios...',
      receivedAt: new Date('2025-11-02T14:30:00Z'),
      processed: true,
      metadata: {
        category: 'lead',
        priority: 'media',
        hasTask: true,
        taskDescription: 'Preparar cotización para el lead',
        taskStatus: 'doing'
      }
    },
    {
      from: 'interno@empresa.com',
      subject: 'Reunión de equipo',
      body: 'Recordatorio: mañana a las 10:00 AM tendremos reunión de equipo para discutir el proyecto X.',
      receivedAt: new Date('2025-11-03T09:15:00Z'),
      processed: false,
      metadata: {
        category: 'interno',
        priority: 'baja',
        hasTask: true,
        taskDescription: 'Preparar agenda para reunión',
        taskStatus: 'done'
      }
    },
    {
      from: 'noreply@spam.com',
      subject: 'Oferta especial',
      body: '¡Felicidades! Ha sido seleccionado para recibir una oferta especial...',
      receivedAt: new Date('2025-11-04T16:45:00Z'),
      processed: false,
      metadata: {
        category: 'spam',
        priority: 'baja',
        hasTask: false,
        taskDescription: null,
        taskStatus: null
      }
    },
    {
      from: 'cliente2@ejemplo.com',
      subject: 'Seguimiento de pedido',
      body: 'Estimado cliente, le escribo para hacer seguimiento de su pedido #12345...',
      receivedAt: new Date('2025-11-05T11:20:00Z'),
      processed: true,
      metadata: {
        category: 'cliente',
        priority: 'alta',
        hasTask: true,
        taskDescription: 'Verificar estado del pedido y responder al cliente',
        taskStatus: 'todo'
      }
    }
  ];

  try {
    // Insertar emails con sus metadatos
    for (const email of emails) {
      await prisma.email.create({
        data: {
          from: email.from,
          subject: email.subject,
          body: email.body,
          receivedAt: email.receivedAt,
          processed: email.processed,
          metadata: email.metadata ? {
            create: {
              category: email.metadata.category,
              priority: email.metadata.priority,
              hasTask: email.metadata.hasTask,
              taskDescription: email.metadata.taskDescription,
              taskStatus: email.metadata.taskStatus
            }
          } : undefined
        }
      });
    }

    console.log('Seed completado exitosamente');
  } catch (error) {
    console.error('Error durante el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });