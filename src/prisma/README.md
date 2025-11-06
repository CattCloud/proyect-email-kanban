# Prisma - Base de Datos

Este directorio contiene la configuración de la base de datos, esquema de Prisma y migraciones.

## Estructura

```
/prisma
├── schema.prisma        # Esquema de la base de datos
├── migrations/          # Migraciones de BD
└── seed.ts              # Datos de prueba (opcional)
```

## Esquema Principal

```prisma
// schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  emails    Email[]
  tasks     Task[]
}

model Email {
  id              String      @id @default(cuid())
  email           String
  receivedAt      DateTime
  subject         String
  body            String
  category        EmailCategory?
  priority        Priority?
  hasTask         Boolean     @default(false)
  taskDescription String?
  processed       Boolean     @default(false)
  userId          String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  user            User        @relation(fields: [userId], references: [id])
  tasks           Task[]
}
```

## Comandos de Prisma

```bash
# Generar cliente
npx prisma generate

# Crear migración
npx prisma migrate dev

# Resetear base de datos
npx prisma migrate reset

# Studio (GUI)
npx prisma studio