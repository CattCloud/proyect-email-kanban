/**
 * Servicio centralizado para el registro y consulta de actividad de usuarios
 * 
 * Proporciona funciones para:
 * - Registrar actividades en el historial
 * - Obtener historial de actividad por usuario
 * - Calcular estadísticas agregadas de uso
 */

import { prisma } from "./prisma";
import type { Prisma } from "@prisma/client";
import type {
  ActivityType,
  ActivityStatus,
  ActivityMetadata,
  LogActivityParams,
  ActivityLogFilters,
  UserActivityLogEntry,
  UserActivityStats,
} from "../types/activity";

/**
 * Registra una actividad del usuario en el historial
 * 
 * IMPORTANTE: NO debe fallar la operación principal si el log falla
 * @param params - Parámetros de la actividad a registrar
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        activityType: params.activityType,
        status: params.status,
        description: params.description,
        metadata: (params.metadata as unknown) as Prisma.InputJsonValue,
        estimatedCost: params.estimatedCost ?? null,
        relatedEmailIds: params.relatedEmailIds ?? [],
        relatedTaskIds: params.relatedTaskIds ?? [],
      },
    });
  } catch (error) {
    // NO lanzar error - solo registrar en consola
    console.error("[ActivityLogger] Error logging activity:", {
      error: error instanceof Error ? error.message : "Unknown error",
      activityType: params.activityType,
      userId: params.userId,
      description: params.description,
    });
  }
}

/**
 * Obtiene el historial de actividades del usuario
 * 
 * @param userId - ID del usuario
 * @param options - Filtros opcionales
 * @returns Lista de actividades ordenadas por fecha descendente
 */
export async function getUserActivityLog(
  userId: string,
  options?: ActivityLogFilters
): Promise<UserActivityLogEntry[]> {
  try {
    const where: Record<string, unknown> = { userId };
    
    if (options?.activityType) {
      where.activityType = options.activityType;
    }
    
    const activities = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    return activities.map((activity) => ({
      id: activity.id,
      createdAt: activity.createdAt,
      activityType: activity.activityType as ActivityType,
      status: activity.status as ActivityStatus,
      description: activity.description,
      metadata: (activity.metadata as unknown) as ActivityMetadata,
      estimatedCost: activity.estimatedCost,
      relatedEmailIds: activity.relatedEmailIds,
      relatedTaskIds: activity.relatedTaskIds,
      user: {
        id: activity.user.id,
        email: activity.user.email,
        name: activity.user.name ?? undefined,
        image: activity.user.image ?? undefined,
      },
    }));
  } catch (error) {
    console.error("[ActivityLogger] Error getting user activity log:", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
      activityType: options?.activityType,
    });
    return [];
  }
}

/**
 * Obtiene estadísticas agregadas de uso del usuario
 * 
 * @param userId - ID del usuario
 * @returns Contadores totales y costo acumulado
 */
export async function getUserActivityStats(
  userId: string
): Promise<UserActivityStats> {
  try {
    const [
      totalImports,
      totalProcessings,
      totalKanbanUpdates,
      totalCostCents,
    ] = await Promise.all([
      prisma.activityLog.count({
        where: { userId, activityType: "email_import" },
      }),
      prisma.activityLog.count({
        where: { userId, activityType: "ai_processing" },
      }),
      prisma.activityLog.count({
        where: { userId, activityType: "kanban_update" },
      }),
      prisma.activityLog.aggregate({
        where: { userId, activityType: "ai_processing" },
        _sum: { estimatedCost: true },
      }),
    ]);
    
    return {
      totalImports,
      totalProcessings,
      totalKanbanUpdates,
      totalCostUSD: (totalCostCents._sum.estimatedCost ?? 0) / 100, // Convertir centavos a USD
    };
  } catch (error) {
    console.error("[ActivityLogger] Error getting user activity stats:", {
      error: error instanceof Error ? error.message : "Unknown error",
      userId,
    });
    
    // Retornar estadísticas por defecto en caso de error
    return {
      totalImports: 0,
      totalProcessings: 0,
      totalKanbanUpdates: 0,
      totalCostUSD: 0,
    };
  }
}

/**
 * Función helper para obtener un ActivityLog específico por ID
 * Útil para debugging o validaciones específicas
 * 
 * @param id - ID del registro de actividad
 * @returns El registro de actividad encontrado o null
 */
export async function getActivityLogById(
  id: string
): Promise<UserActivityLogEntry | null> {
  try {
    const activity = await prisma.activityLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
      },
    });
    
    if (!activity) {
      return null;
    }
    
    return {
      id: activity.id,
      createdAt: activity.createdAt,
      activityType: activity.activityType as ActivityType,
      status: activity.status as ActivityStatus,
      description: activity.description,
      metadata: (activity.metadata as unknown) as ActivityMetadata,
      estimatedCost: activity.estimatedCost,
      relatedEmailIds: activity.relatedEmailIds,
      relatedTaskIds: activity.relatedTaskIds,
      user: {
        id: activity.user.id,
        email: activity.user.email,
        name: activity.user.name ?? undefined,
        image: activity.user.image ?? undefined,
      },
    };
  } catch (error) {
    console.error("[ActivityLogger] Error getting activity by ID:", {
      error: error instanceof Error ? error.message : "Unknown error",
      id,
    });
    return null;
  }
}

/**
 * Función para limpiar actividad antigua (opcional, para mantenimiento)
 * Útil para limitar el tamaño de la base de datos en producción
 * 
 * @param olderThanDays - Eliminar actividad anterior a estos días
 * @returns Número de registros eliminados
 */
export async function cleanupOldActivity(
  olderThanDays: number = 90
): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const result = await prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    
    console.log(`[ActivityLogger] Cleaned up ${result.count} old activity records`);
    return result.count;
  } catch (error) {
    console.error("[ActivityLogger] Error cleaning up old activity:", {
      error: error instanceof Error ? error.message : "Unknown error",
      olderThanDays,
    });
    return 0;
  }
}