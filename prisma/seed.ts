import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de datos...');

  // Crear emails de ejemplo con diferentes createdAt para testing
  const now = new Date('2025-11-11T16:22:17.000Z'); // Tiempo base para el seed
  
  const emails = [
    {
      idEmail: 'email-001',
      from: 'cliente@ejemplo.com',
      subject: 'Consulta sobre producto',
      body: 'Hola, estoy interesado en su producto. ¿Podrían enviarme más información?',
      receivedAt: new Date('2025-11-01T10:00:00Z'),
      createdAt: new Date(now.getTime() - 2 * 60 * 1000), // 2 minutos atrás (NUEVO)
      processedAt: new Date(), // Procesado
      metadata: {
        category: 'cliente',
        priority: 'alta',
        hasTask: true,
        taskDescription: 'Responder consulta del cliente',
        taskStatus: 'todo'
      }
    },
    {
      idEmail: 'email-002',
      from: 'lead@ejemplo.com',
      subject: 'Solicitud de cotización',
      body: 'Buen día, me gustaría solicitar una cotización para los siguientes servicios...',
      receivedAt: new Date('2025-11-02T14:30:00Z'),
      createdAt: new Date(now.getTime() - 1 * 60 * 1000), // 1 minuto atrás (NUEVO)
      processedAt: new Date(), // Procesado
      metadata: {
        category: 'lead',
        priority: 'media',
        hasTask: true,
        taskDescription: 'Preparar cotización para el lead',
        taskStatus: 'doing'
      }
    },
    {
      idEmail: 'email-003',
      from: 'interno@empresa.com',
      subject: 'Reunión de equipo',
      body: 'Recordatorio: mañana a las 10:00 AM tendremos reunión de equipo para discutir el proyecto X.',
      receivedAt: new Date('2025-11-03T09:15:00Z'),
      createdAt: new Date(now.getTime() - 10 * 60 * 1000), // 10 minutos atrás (NO NUEVO)
      processedAt: null, // Sin procesar
      metadata: {
        category: 'interno',
        priority: 'baja',
        hasTask: true,
        taskDescription: 'Preparar agenda para reunión',
        taskStatus: 'done'
      }
    },
    {
      idEmail: 'email-004',
      from: 'noreply@spam.com',
      subject: 'Oferta especial',
      body: '¡Felicidades! Ha sido seleccionado para recibir una oferta especial...',
      receivedAt: new Date('2025-11-04T16:45:00Z'),
      createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutos atrás (NO NUEVO)
      processedAt: null, // Sin procesar
      metadata: {
        category: 'spam',
        priority: 'baja',
        hasTask: false,
        taskDescription: null,
        taskStatus: null
      }
    },
    {
      idEmail: 'email-005',
      from: 'cliente2@ejemplo.com',
      subject: 'Seguimiento de pedido',
      body: 'Estimado cliente, le escribo para hacer seguimiento de su pedido #12345...',
      receivedAt: new Date('2025-11-05T11:20:00Z'),
      createdAt: new Date(now.getTime() - 3 * 60 * 1000), // 3 minutos atrás (NUEVO)
      processedAt: new Date(), // Procesado
      metadata: {
        category: 'cliente',
        priority: 'alta',
        hasTask: true,
        taskDescription: 'Verificar estado del pedido y responder al cliente',
        taskStatus: 'todo'
      }
    },
    {
      idEmail: 'email-006',
      from: 'proveedor@empresa.com',
      subject: 'Actualización de precios',
      body: 'Le informamos sobre las nuevas tarifas para el próximo trimestre...',
      receivedAt: new Date('2025-11-05T15:30:00Z'),
      createdAt: new Date(now.getTime() - 8 * 60 * 1000), // 8 minutos atrás (NO NUEVO)
      processedAt: new Date(), // Procesado
      metadata: {
        category: 'cliente',
        priority: 'media',
        hasTask: true,
        taskDescription: 'Revisar nueva estructura de precios',
        taskStatus: 'todo'
      }
    },
    {
      idEmail: 'email-007',
      from: 'marketing@digital.com',
      subject: 'Campaña de Black Friday',
      body: 'Prepárate para la mayor campaña del año con descuentos increíbles...',
      receivedAt: new Date('2025-11-06T08:00:00Z'),
      createdAt: new Date(now.getTime() - 30 * 1000), // 30 segundos atrás (MUY NUEVO)
      processedAt: null, // Sin procesar
      metadata: {
        category: 'spam',
        priority: 'baja',
        hasTask: false,
        taskDescription: null,
        taskStatus: null
      }
    }
  ];

  try {
    // Insertar emails con sus metadatos
    for (const email of emails) {
      await prisma.email.create({
        data: {
          idEmail: email.idEmail,
          from: email.from,
          subject: email.subject,
          body: email.body,
          receivedAt: email.receivedAt,
          createdAt: email.createdAt,
          processedAt: email.processedAt,
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