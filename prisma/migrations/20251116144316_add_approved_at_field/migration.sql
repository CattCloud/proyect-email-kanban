-- Migration: Agregar campo approvedAt al modelo Email
-- Objetivo: Soportar el estado "Aprobado" para emails procesados por IA
-- 
-- Estado de aprobación:
-- - NULL: Email no ha sido aprobado aún
-- - TIMESTAMP: Email fue aprobado en esta fecha
-- 
-- Regla de negocio: Solo emails con processedAt != null pueden ser aprobados
-- 
-- Aplicado el: 2025-11-16 14:43:16
-- Autor: Feature "Estado Aprobado" - HITO 1

-- AlterTable
ALTER TABLE "Email" ADD COLUMN     "approvedAt" TIMESTAMP(3);

-- CreateIndex
-- Índice individual para optimizar consultas por estado de aprobación
CREATE INDEX "Email_approvedAt_idx" ON "Email"("approvedAt");

-- CreateIndex  
-- Índice compuesto para optimizar consultas combinando procesamiento y aprobación
-- Ejemplo: SELECT * FROM "Email" WHERE processedAt IS NOT NULL AND approvedAt IS NULL
-- Ejemplo: SELECT * FROM "Email" WHERE processedAt IS NOT NULL AND approvedAt IS NOT NULL
CREATE INDEX "Email_processedAt_approvedAt_idx" ON "Email"("processedAt", "approvedAt");
