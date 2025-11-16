"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const EmailSchema = z.object({
  from: z.string().email("Email inválido"),
  subject: z.string().min(1, "El asunto es requerido"),
  body: z.string().min(1, "El contenido es requerido"),
  receivedAt: z.string().optional(),
  processedAt: z.string().optional().nullable()
})

// Schema para Email con idEmail
const EmailWithIdSchema = z.object({
  idEmail: z.string().min(1, "El ID del email es requerido"),
  from: z.string().email("Email inválido"),
  subject: z.string().min(1, "El asunto es requerido"),
  body: z.string().min(1, "El contenido es requerido"),
  receivedAt: z.string().optional(),
  processedAt: z.string().optional().nullable()
})

const EmailMetadataSchema = z.object({
  category: z.string().nullable(),
  priority: z.string().nullable(),
  hasTask: z.boolean().default(false),
  taskDescription: z.string().nullable(),
  taskStatus: z.string().nullable()
})

const CreateEmailSchema = z.object({
  email: EmailSchema,
  idEmail: z.string().min(1, "El ID del email es requerido"),
  metadata: EmailMetadataSchema.optional()
})

const UpdateEmailSchema = z.object({
  from: z.string().email("Email inválido").optional(),
  subject: z.string().min(1, "El asunto es requerido").optional(),
  body: z.string().min(1, "El contenido es requerido").optional(),
  processedAt: z.string().nullable().optional(),
  approvedAt: z.string().nullable().optional(),
  metadata: EmailMetadataSchema.optional(),
  idEmail: z.string().min(1, "El ID del email es requerido").optional()
})

// Schemas para operaciones de aprobación
const ApproveEmailSchema = z.object({
  emailId: z.string().min(1, "Email ID requerido")
})

const UnapproveEmailSchema = z.object({
  emailId: z.string().min(1, "Email ID requerido")
})

const GetEmailsByApprovalStatusSchema = z.object({
  status: z.enum(["approved", "not-approved", "all"])
})

// Schema para validación de importación JSON (Product Brief actualizado)
const ImportEmailSchema = z.object({
  id: z.string().min(1, "El ID del email es requerido"), // Ahora es requerido
  email: z.string().email("Email inválido"),
  received_at: z.string().optional(),
  subject: z.string().min(1, "El asunto es requerido"),
  body: z.string().min(1, "El contenido es requerido")
  // Nota: Los campos de metadata (category, priority, etc.) no se incluyen
  // ya que la importación inicial será solo de emails básicos
  // El procesamiento con IA se hará posteriormente
})

const ImportEmailsSchema = z.array(ImportEmailSchema)

// Tipos exportados
export type EmailData = z.infer<typeof EmailSchema>
export type EmailMetadataData = z.infer<typeof EmailMetadataSchema>
export type CreateEmailData = z.infer<typeof CreateEmailSchema>
export type UpdateEmailData = z.infer<typeof UpdateEmailSchema>

// Tipos para operaciones de aprobación
export type ApproveEmailData = z.infer<typeof ApproveEmailSchema>
export type UnapproveEmailData = z.infer<typeof UnapproveEmailSchema>
export type GetEmailsByApprovalStatusData = z.infer<typeof GetEmailsByApprovalStatusSchema>

export type ImportEmailData = z.infer<typeof ImportEmailSchema>
export type ImportEmailsData = z.infer<typeof ImportEmailsSchema>

// Tipos para resultados de importación
export interface ImportResult {
  success: boolean;
  imported: number;
  errors: Array<{
    index: number;
    email?: string;
    error: string;
  }>;
  total: number;
}

/**
 * Función auxiliar para validar si un email puede ser aprobado
 * Regla de negocio: Solo emails con processedAt != null pueden ser aprobados
 */
function canApproveEmail(email: { processedAt: Date | null, approvedAt: Date | null }): boolean {
  return email.processedAt !== null && email.approvedAt === null
}

// Server Actions

/**
 * Obtener todos los emails con su metadata
 */
export async function getEmails() {
  try {
    const emails = await prisma.email.findMany({
      include: {
        metadata: true
      },
      orderBy: {
        receivedAt: 'desc'
      }
    })
    
    return { success: true, data: emails }
  } catch (error) {
    console.error("Error al obtener emails:", error)
    return { 
      success: false, 
      error: "Error al obtener los emails" 
    }
  }
}

/**
 * Obtener un email específico por ID con su metadata
 */
export async function getEmailById(id: string) {
  try {
    const email = await prisma.email.findUnique({
      where: { id },
      include: {
        metadata: true
      }
    })
    
    if (!email) {
      return { success: false, error: "Email no encontrado" }
    }
    
    return { success: true, data: email }
  } catch (error) {
    console.error("Error al obtener email por ID:", error)
    return { 
      success: false, 
      error: "Error al obtener el email" 
    }
  }
}

/**
 * Crear un nuevo email con su metadata opcional
 */
export async function createEmail(data: CreateEmailData) {
  try {
    // Validar datos de entrada
    const validatedData = CreateEmailSchema.parse(data)
    
    // Crear email
    const email = await prisma.email.create({
      data: {
        idEmail: validatedData.idEmail,
        from: validatedData.email.from,
        subject: validatedData.email.subject,
        body: validatedData.email.body,
        receivedAt: validatedData.email.receivedAt ?
          new Date(validatedData.email.receivedAt) :
          new Date(),
        processedAt: (validatedData.email.processedAt && new Date(validatedData.email.processedAt)) ?? null, // Null = no procesado
        metadata: validatedData.metadata ? {
          create: validatedData.metadata
        } : undefined
      },
      include: {
        metadata: true
      }
    })
    
    // Revalidar caché
    revalidatePath("/emails")
    revalidatePath("/")
    
    return { success: true, data: email }
  } catch (error) {
    console.error("Error al crear email:", error)
    return { 
      success: false, 
      error: "Error al crear el email" 
    }
  }
}

/**
 * Actualizar un email existente y su metadata
 */
export async function updateEmail(id: string, data: UpdateEmailData) {
  try {
    // Validar datos de entrada
    const validatedData = UpdateEmailSchema.parse(data)
    
    // Verificar que el email existe
    const existingEmail = await prisma.email.findUnique({
      where: { id },
      include: { metadata: true }
    })
    
    if (!existingEmail) {
      return { success: false, error: "Email no encontrado" }
    }
    
    // Actualizar email
    const updatedEmail = await prisma.email.update({
      where: { id },
      data: {
        ...(validatedData.idEmail && { idEmail: validatedData.idEmail }),
        ...(validatedData.from && { from: validatedData.from }),
        ...(validatedData.subject && { subject: validatedData.subject }),
        ...(validatedData.body && { body: validatedData.body }),
        ...(validatedData.processedAt !== undefined && { processedAt: validatedData.processedAt }),
        ...(validatedData.approvedAt !== undefined && { approvedAt: validatedData.approvedAt }),
        // Actualizar metadata si se proporciona
        ...(validatedData.metadata && {
          metadata: existingEmail.metadata ? {
            update: validatedData.metadata
          } : {
            create: validatedData.metadata
          }
        })
      },
      include: {
        metadata: true
      }
    })
    
    // Revalidar caché
    revalidatePath("/emails")
    revalidatePath(`/emails/${id}`)
    revalidatePath("/")
    
    return { success: true, data: updatedEmail }
  } catch (error) {
    console.error("Error al actualizar email:", error)
    return { 
      success: false, 
      error: "Error al actualizar el email" 
    }
  }
}

/**
 * Eliminar un email (soft delete)
 */
export async function deleteEmail(id: string) {
  try {
    // Verificar que el email existe
    const existingEmail = await prisma.email.findUnique({
      where: { id }
    })
    
    if (!existingEmail) {
      return { success: false, error: "Email no encontrado" }
    }
    
    // Eliminar email (cascade eliminará metadata automáticamente)
    await prisma.email.delete({
      where: { id }
    })
    
    // Revalidar caché
    revalidatePath("/emails")
    revalidatePath("/")
    
    return { success: true, message: "Email eliminado correctamente" }
  } catch (error) {
    console.error("Error al eliminar email:", error)
    return { 
      success: false, 
      error: "Error al eliminar el email" 
    }
  }
}

/**
 * Aprobar un email procesado por IA
 * @param emailId - ID del email a aprobar
 * @returns Resultado con el email actualizado o error
 * @throws Error si el email no existe o no ha sido procesado
  */ 
export async function approveEmail(emailId: string) {
  try {
    // Validar entrada con Zod
    const validatedData = ApproveEmailSchema.parse({ emailId })
    
    // Verificar que el email existe
    const email = await prisma.email.findUnique({
      where: { id: validatedData.emailId }
    })
    
    if (!email) {
      return { 
        success: false, 
        error: "Email no encontrado" 
      }
    }
    
    // Validar regla de negocio: solo emails procesados pueden ser aprobados
    if (!canApproveEmail(email)) {
      if (email.processedAt === null) {
        return { 
          success: false, 
          error: "Solo se pueden aprobar emails procesados por IA" 
        }
      } else if (email.approvedAt !== null) {
        return { 
          success: false, 
          error: "Este email ya fue aprobado anteriormente" 
        }
      }
    }
    
    // Actualizar approvedAt
    const updatedEmail = await prisma.email.update({
      where: { id: validatedData.emailId },
      data: { approvedAt: new Date() },
      include: { metadata: true }
    })
    
    // Revalidar cachés
    revalidatePath("/emails")
    revalidatePath(`/emails/${validatedData.emailId}`)
    revalidatePath("/")
    
    return { 
      success: true, 
      data: updatedEmail,
      message: "Email aprobado exitosamente" 
    }
  } catch (error) {
    console.error("Error al aprobar email:", error)
    return { 
      success: false, 
      error: "Error al aprobar el email" 
    }
  }
}

/**
 * Desaprobar un email (revertir aprobación)
 * @param emailId - ID del email a desaprobar
 * @returns Resultado con el email actualizado o error
 * @throws Error si el email no existe o no está aprobado
 */
export async function unapproveEmail(emailId: string) {
  try {
    // Validar entrada con Zod
    const validatedData = UnapproveEmailSchema.parse({ emailId })
    
    // Verificar que el email existe y está aprobado
    const email = await prisma.email.findUnique({
      where: { id: validatedData.emailId }
    })
    
    if (!email) {
      return { 
        success: false, 
        error: "Email no encontrado" 
      }
    }
    
    if (email.approvedAt === null) {
      return { 
        success: false, 
        error: "Este email no está aprobado" 
      }
    }
    
    // Actualizar approvedAt a null
    const updatedEmail = await prisma.email.update({
      where: { id: validatedData.emailId },
      data: { approvedAt: null },
      include: { metadata: true }
    })
    
    // Revalidar cachés
    revalidatePath("/emails")
    revalidatePath(`/emails/${validatedData.emailId}`)
    revalidatePath("/")
    
    return { 
      success: true, 
      data: updatedEmail,
      message: "Email desaprobado exitosamente" 
    }
  } catch (error) {
    console.error("Error al desaprobar email:", error)
    return { 
      success: false, 
      error: "Error al desaprobar el email" 
    }
  }
}

/**
 * Obtener emails filtrados por estado de aprobación
 * @param status - Filtro: "approved", "not-approved", "all"
 * @returns Lista de emails con metadata completa
 */
export async function getEmailsByApprovalStatus(status: "approved" | "not-approved" | "all") {
  try {
    // Validar entrada con Zod
    const validatedData = GetEmailsByApprovalStatusSchema.parse({ status })
    
    // Construir cláusula where basada en el filtro
    const whereClause = validatedData.status === "approved" 
      ? { processedAt: { not: null }, approvedAt: { not: null } }
      : validatedData.status === "not-approved"
      ? { processedAt: { not: null }, approvedAt: null }
      : {}; // "all" devuelve todos
    
    const emails = await prisma.email.findMany({
      where: whereClause,
      include: { metadata: true },
      orderBy: { receivedAt: 'desc' }
    })
    
    return { success: true, data: emails }
  } catch (error) {
    console.error("Error al obtener emails por estado de aprobación:", error)
    return {
      success: false,
      error: "Error al obtener los emails por estado de aprobación"
    }
  }
}

/**
 * Obtener emails con tareas (para el Kanban)
 */
export async function getEmailsWithTasks() {
  try {
    const emails = await prisma.email.findMany({
      where: {
        // HITO 4: Mostrar SOLO tareas de emails confirmados (processedAt != null)
        processedAt: { not: null },
        metadata: {
          hasTask: true
        }
      },
      include: {
        metadata: true
      },
      orderBy: {
        receivedAt: 'desc'
      }
    })
    
    return { success: true, data: emails }
  } catch (error) {
    console.error("Error al obtener emails con tareas:", error)
    return {
      success: false,
      error: "Error al obtener los emails con tareas"
    }
  }
}

/**
 * Obtener emails recientes (para el dashboard)
 */
export async function getRecentEmails(limit: number = 5) {
  try {
    const emails = await prisma.email.findMany({
      include: {
        metadata: true
      },
      orderBy: {
        receivedAt: 'desc'
      },
      take: limit
    })
    
    return { success: true, data: emails }
  } catch (error) {
    console.error("Error al obtener emails recientes:", error)
    return {
      success: false,
      error: "Error al obtener los emails recientes"
    }
  }
}

/**
 * Importar emails desde archivo JSON con procesamiento por lotes
 */
export async function importEmailsFromJSON(jsonData: string): Promise<ImportResult> {
  try {
    // Validar que el JSON es válido
    let parsedData: ImportEmailsData
    try {
      const rawData = JSON.parse(jsonData)
      parsedData = ImportEmailsSchema.parse(rawData)
    } catch (parseError) {
      return {
        success: false,
        imported: 0,
        errors: [{
          index: 0,
          error: "Formato JSON inválido"
        }],
        total: 0
      }
    }

    const result: ImportResult = {
      success: true,
      imported: 0,
      errors: [],
      total: parsedData.length
    }

    // Procesar en lotes de máximo 10 emails
    const batchSize = 10
    for (let i = 0; i < parsedData.length; i += batchSize) {
      const batch = parsedData.slice(i, i + batchSize)
      
      try {
        // Procesar lote actual con transacción
        await prisma.$transaction(async (tx) => {
          for (let j = 0; j < batch.length; j++) {
            const emailData = batch[j]
            const globalIndex = i + j

            try {
              // Crear email (mapeo: Product Brief -> Base de datos)
              const email = await tx.email.create({
                data: {
                  idEmail: emailData.id,        // id del JSON -> idEmail de BD
                  from: emailData.email,        // email -> from
                  subject: emailData.subject,
                  body: emailData.body,
                  receivedAt: emailData.received_at ?
                    new Date(emailData.received_at) :  // received_at -> receivedAt
                    new Date(),
                  processedAt: null  // Por defecto null (sin procesar con IA)
                  // Nota: EmailMetadata no se crea inicialmente
                  // Se creará cuando se procese con IA posteriormente
                }
              })

              result.imported++
            } catch (emailError) {
              console.error(`Error al importar email ${globalIndex}:`, emailError)
              result.errors.push({
                index: globalIndex,
                email: emailData.subject,
                error: "Error al crear en base de datos"
              })
            }
          }
        })
      } catch (batchError) {
        console.error(`Error en lote ${i}-${i + batchSize - 1}:`, batchError)
        // Agregar error genérico para el lote completo
        for (let j = 0; j < batch.length; j++) {
          const globalIndex = i + j
          if (!result.errors.find(e => e.index === globalIndex)) {
            result.errors.push({
              index: globalIndex,
              email: batch[j].subject,
              error: "Error en procesamiento por lotes"
            })
          }
        }
      }
    }

    // Si hay errores, marcar como parcialmente exitoso
    if (result.errors.length > 0) {
      result.success = result.imported > 0
    }

    // Revalidar cachés
    if (result.imported > 0) {
      revalidatePath("/emails")
      revalidatePath("/")
    }

    return result
  } catch (error) {
    console.error("Error crítico en importación:", error)
    return {
      success: false,
      imported: 0,
      errors: [{
        index: 0,
        error: "Error crítico en el servidor"
      }],
      total: 0
    }
  }
}

/**
 * Obtiene el remitente (campo `from`) más frecuente en la base de datos
 */
export async function getMostFrequentSender() {
  try {
    const emails = await prisma.email.findMany({
      select: {
        from: true,
      },
    });

    if (emails.length === 0) {
      return {
        success: true,
        data: null,
      };
    }

    // Contar la frecuencia de cada remitente
    const frequency: Record<string, number> = {};
    
    for (const email of emails) {
      const sender = email.from;
      frequency[sender] = (frequency[sender] || 0) + 1;
    }

    // Encontrar el remitente con mayor frecuencia
    let mostFrequent = { email: "", count: 0 };
    
    for (const [email, count] of Object.entries(frequency)) {
      if (count > mostFrequent.count) {
        mostFrequent = { email, count };
      }
    }

    return {
      success: true,
      data: mostFrequent,
    };
  } catch (error) {
    console.error("Error getting most frequent sender:", error);
    return {
      success: false,
      error: "Error al obtener el remitente más frecuente",
      data: null,
    };
  }
}