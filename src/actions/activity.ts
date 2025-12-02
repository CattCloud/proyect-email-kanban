"use server";

import { getUserActivityLog, getUserActivityStats } from "@/lib/activity-logger";
import type { ActivityLogResponse, ActivityLogFilters } from "@/types/activity";

/**
 * Obtiene el historial de actividades con filtros opcionales
 */
export async function getActivityHistory(
  userId: string,
  filters?: ActivityLogFilters
): Promise<ActivityLogResponse> {
  try {
    const activities = await getUserActivityLog(userId, filters);
    
    return {
      success: true,
      data: activities,
    };
  } catch (error) {
    console.error("[getActivityHistory] Error:", error);
    return {
      success: false,
      error: "Error al obtener historial",
    };
  }
}

/**
 * Obtiene estadísticas agregadas del usuario
 */
export async function getActivityStatistics(
  userId: string
): Promise<ActivityLogResponse> {
  try {
    const stats = await getUserActivityStats(userId);
    
    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("[getActivityStatistics] Error:", error);
    return {
      success: false,
      error: "Error al obtener estadísticas",
    };
  }
}