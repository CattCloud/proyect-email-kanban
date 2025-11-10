"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Zod schemas para validación
const EmailSchema = z.object({
  from: z.string().email("Email inválido"),
  subject: z.string().min(1, "El asunto es requerido"),
  body: z.string().min(1, "El contenido es requerido"),
  receivedAt: z.string().optional(),
  processed: z.boolean().default(false)
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
  metadata: EmailMetadataSchema.optional()
})

const UpdateEmailSchema = z.object({
  from: z.string().email("Email inválido").optional(),
  subject: z.string().min(1, "El asunto es requerido").optional(),
  body: z.string().min(1, "El contenido es requerido").optional(),
  processed: z.boolean().optional(),
  metadata: EmailMetadataSchema.optional()
})

// Tipos exportados
export type EmailData = z.infer<typeof EmailSchema>
export type EmailMetadataData = z.infer<typeof EmailMetadataSchema>
export type CreateEmailData = z.infer<typeof CreateEmailSchema>
export type UpdateEmailData = z.infer<typeof UpdateEmailSchema>

// Schema para validación de importación JSON (Product Brief)
const ImportEmailSchema = z.object({
  id: z.string().optional(), // Se ignora (auto-generado)
  email: z.string().email("Email inválido"),
  received_at: z.string().optional(),
  subject: z.string().min(1, "El asunto es requerido"),
  body: z.string().min(1, "El contenido es requerido")
  // Nota: Los campos de metadata (category, priority, etc.) no se incluyen
  // ya que la importación inicial será solo de emails básicos
  // El procesamiento con IA se hará posteriormente
})

const ImportEmailsSchema = z.array(ImportEmailSchema)

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
        from: validatedData.email.from,
        subject: validatedData.email.subject,
        body: validatedData.email.body,
        receivedAt: validatedData.email.receivedAt ? 
          new Date(validatedData.email.receivedAt) : 
          new Date(),
        processed: validatedData.email.processed,
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
        ...(validatedData.from && { from: validatedData.from }),
        ...(validatedData.subject && { subject: validatedData.subject }),
        ...(validatedData.body && { body: validatedData.body }),
        ...(validatedData.processed !== undefined && { processed: validatedData.processed }),
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
 * Obtener emails con tareas (para el Kanban)
 */
export async function getEmailsWithTasks() {
  try {
    const emails = await prisma.email.findMany({
      where: {
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
                  from: emailData.email,        // email -> from
                  subject: emailData.subject,
                  body: emailData.body,
                  receivedAt: emailData.received_at ?
                    new Date(emailData.received_at) :  // received_at -> receivedAt
                    new Date(),
                  processed: false  // Por defecto false (sin procesar con IA)
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