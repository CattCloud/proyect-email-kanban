// prisma.config.ts
export default {
  db: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
    // accelerateUrl: process.env.ACCELERATE_URL // Si usas Accelerate
  }
};
