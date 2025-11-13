Adicional a la tabla Emails estas seran las otras tablas a implementar en el esquema Prisma

//Se considera una reestructuracion
model EmailMetadata {
  id         String   @id @default(cuid()) //Autogenerado por la BD
  emailId    String   @unique      // Relación 1-1 con Email.id
  category   String   // Solo "cliente", "lead", "interno", "spam"
  priority   String   // Solo "alta", "media", "baja"
  summary    String?  // Resumen de intención principal
  contactName      String?
  createdAt        DateTime @default(now()) 
  // Relación múltiple con Task:
  tasks      Task[]

}

model Task {
  id               String   @id @default(cuid()) //Autogenerado por la bd
  emailMetadataId  String
  description      String
  dueDate          DateTime?
  tags             String[]
  participants     String[]
  createdAt        DateTime @default(now())
  status           String   @default("todo") // todo, doing, done

  emailMetadata   EmailMetadata @relation(fields: [emailMetadataId], references: [id])
}


model Contact {
  id       String   @id @default(cuid())
  email    String   @unique
  name     String?
  createdAt DateTime @default(now())
}


---

{
    // Identificador único del email, igual al recibido desde el sistema. Permite vincular tarea con su correo fuente.
    "email_id": "email-001",

    // Categoría asignada al email según la IA: "cliente", "lead", "interno" o "spam".
    "category": "cliente",

    // Importancia priorizada para el email: "alta", "media" o "baja".
    "priority": "alta",

    // Breve resumen o propósito del correo (máximo 20 palabras), optimizado para visualización en Kanban.
    "summary": "Solicita reunión urgente para revisar propuesta Q4",

    // Nombre del contacto principal (puede usarse para filtrar por remitente en el Kanban, no es un ID generado).  "nombre extraído o inferido del remitente"
    "contact_name": "Cliente Empresa"

  // Listado de tareas concretas extraídas del cuerpo del email.
  "tasks": [
    {
      // Descripción corta y precisa de la acción a realizar.
      "description": "Agendar reunión para presentar propuesta antes del viernes",

      // Fecha límite recomendada para la tarea (si puede inferirse; formato ISO 8601), puede ser null.
      "due_date": "2025-10-03T23:59:00Z",

      // Etiquetas temáticas útiles para filtro o agrupación (puede ser vacío).
      "tags": ["reunión", "propuesta"],

      // Lista de contactos (emails) relevantes para la acción; incluye remitente y otros involucrados si son detectables.
      "participants": ["cliente@empresa.com", "ejecutivo@miempresa.com"],


    }
  ]
}
