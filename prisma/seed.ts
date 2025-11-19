/*import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface PrismaUserModel {
  deleteMany: (args?: unknown) => Promise<unknown>;
  create: (args: { data: { email: string; name: string | null; image: string | null } }) => Promise<{ id: string }>;
}

// Cast ampliado para usar el modelo User recién definido en schema.prisma
const prismaWithUser = prisma as typeof prisma & { user: PrismaUserModel };

async function main() {
  console.log('Iniciando seed de datos...');

  // Limpieza de datos previos (solo desarrollo)
  // Orden: primero dependientes para respetar FKs
  await prisma.task.deleteMany({});
  await prisma.emailMetadata.deleteMany({});
  await prisma.contact.deleteMany({});
  await prisma.email.deleteMany({});
  await prismaWithUser.user.deleteMany({});

  // Crear un usuario demo al que se asociarán todos los datos del seed
  const demoUser = await prismaWithUser.user.create({
    data: {
      email: "demo-seed-user@example.com",
      name: "Usuario Demo Seed",
      image: null,
    },
  });

  // Crear emails de ejemplo con diferentes createdAt para testing
  const now = new Date("2025-11-11T16:22:17.000Z"); // Tiempo base para el seed

  interface SeedEmail {
    idEmail: string;
    from: string;
    subject: string;
    body: string;
    receivedAt: Date;
    createdAt: Date;
    processedAt: Date | null;
    rejectionReason?: string | null;
    previousAIResult?: unknown; // se serializa solo cuando existe
    metadata?: {
      category: string | null;
      priority: string | null;
      hasTask: boolean;
      taskDescription: string | null;
      taskStatus: string | null;
    };
  }

  const emails: SeedEmail[] = [
    {
      idEmail: "email-ai-001",
      from: "maria.garcia@clientex.com",
      subject: "Revisión urgente de propuesta Q4 antes del viernes",
      body: "Hola equipo, necesitamos revisar la propuesta Q4 y agendar una reunión antes del viernes. Por favor enviar el borrador del contrato actualizado. Copiar a director@miempresa.com en la comunicación. Gracias, María.",
      receivedAt: new Date("2025-11-01T10:00:00Z"),
      createdAt: new Date(now.getTime() - 4 * 60 * 1000),
      processedAt: null,
      // Caso con rechazo previo simulado
      rejectionReason: "Tareas mal extraídas",
      previousAIResult: {
        category: "cliente",
        priority: "alta",
        summary:
          "Propuesta Q4 pendiente de revisión y envío de borrador de contrato.",
        tasks: [
          {
            description:
              "Enviar borrador de contrato Q4 a María García",
            status: "todo",
          },
        ],
      },
    },
    {
      idEmail: "email-ai-002",
      from: "prospecto@nuevaempresa.com",
      subject: "Solicitud de información y llamada exploratoria",
      body: "Buenos días, estamos evaluando sus servicios de consultoría. ¿Podrían enviar paquetes y precios? Nos gustaría agendar una llamada la próxima semana.",
      receivedAt: new Date("2025-11-02T14:30:00Z"),
      createdAt: new Date(now.getTime() - 6 * 60 * 1000),
      processedAt: null,
    },
    {
      idEmail: "email-ai-003",
      from: "rrhh@miempresa.com",
      subject: "Recordatorio: Capacitación de seguridad jueves 10 AM",
      body: "Equipo, recordamos capacitación obligatoria de seguridad este jueves a las 10 AM en la sala principal. Duración aproximada: 2 horas.",
      receivedAt: new Date("2025-11-03T09:15:00Z"),
      createdAt: new Date(now.getTime() - 10 * 60 * 1000),
      processedAt: null,
    },
    {
      idEmail: "email-ai-004",
      from: "cliente.vip@corporacion.com",
      subject: "Escalamiento: Incidente crítico en producción",
      body: "URGENTE: Incidente crítico en producción afectando a 500+ usuarios. Coordinar con soporte@miempresa.com y enviar reporte en 2 horas. Incluir a director@miempresa.com en la comunicación.",
      receivedAt: new Date("2025-11-04T16:45:00Z"),
      createdAt: new Date(now.getTime() - 8 * 60 * 1000),
      processedAt: null,
    },
    {
      idEmail: "email-ai-005",
      from: "info@startupxyz.com",
      subject: "Solicitud de demo del producto",
      body: "Hola, estamos interesados en una demo del producto este jueves en la mañana. Por favor confirmar disponibilidad y requerimientos.",
      receivedAt: new Date("2025-11-05T11:20:00Z"),
      createdAt: new Date(now.getTime() - 3 * 60 * 1000),
      processedAt: null,
    },
    {
      idEmail: "email-ai-006",
      from: "marketing@promos.com",
      subject: "¡OFERTA EXCLUSIVA! 50% de descuento HOY",
      body: "No te lo pierdas: 50% de descuento en todos nuestros productos solo por hoy. Haz clic aquí para aprovechar esta oportunidad.",
      receivedAt: new Date("2025-11-06T08:00:00Z"),
      createdAt: new Date(now.getTime() - 30 * 1000),
      processedAt: null,
    },
  ];

  try {
    // Insertar emails con sus metadatos, asociados al usuario demo
    for (const email of emails) {
      const data: Prisma.EmailUncheckedCreateInput = {
        idEmail: email.idEmail,
        from: email.from,
        subject: email.subject,
        body: email.body,
        receivedAt: email.receivedAt,
        createdAt: email.createdAt,
        processedAt: email.processedAt,
        rejectionReason: email.rejectionReason ?? null,
        previousAIResult:
          email.previousAIResult !== undefined
            ? (email.previousAIResult as Prisma.InputJsonValue)
            : null,
        userId: demoUser.id,
        // metadata se crea de forma separada si existe, para evitar problemas de tipos
      };

      const createdEmail = await prisma.email.create({
        data,
      });

      if (email.metadata) {
        // Crear EmailMetadata + (opcionalmente) una Task simple asociada al mismo userId
        const metadata = await prisma.emailMetadata.create({
          data: {
            emailId: createdEmail.id,
            category: email.metadata.category,
            priority: email.metadata.priority,
            summary: email.subject,
            contactName: null,
            hasTask: email.metadata.hasTask,
            taskDescription: email.metadata.taskDescription,
            taskStatus: email.metadata.taskStatus,
          },
        });

        if (email.metadata.hasTask) {
          await prisma.task.create({
            data: {
              emailMetadataId: metadata.id,
              description:
                email.metadata.taskDescription ??
                "Tarea generada desde seed",
              dueDate: null,
              tags: [],
              participants: [email.from],
              status: email.metadata.taskStatus ?? "todo",
              userId: demoUser.id,
            },
          });
        }
      }
    }

    console.log("Seed completado exitosamente");
  } catch (error) {
    console.error("Error durante el seed:", error);
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

  */
