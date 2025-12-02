import { PrismaClient } from '@prisma/client';
import config from '../../prisma/prisma.config'; // Importa tu config

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: config.db.url  // ← PASA LA URL AQUÍ
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
