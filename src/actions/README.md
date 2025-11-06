# Actions - Server Actions

Este directorio contiene las **Smart Actions** del sistema, que son funciones del servidor que implementan la lógica de negocio y la comunicación con la base de datos.

## Estructura

```
/actions
├── emailActions.ts      # CRUD de emails
├── aiActions.ts         # Procesamiento con IA
├── taskActions.ts       # Gestión de tareas/Kanban
├── importActions.ts     # Importación JSON
└── authActions.ts       # Autenticación
```

## Principios

1. **Funciones `"use server"`** - Se ejecutan en el servidor
2. **Type-safe** - Tipado completo con TypeScript
3. **Validación con Zod** - Validación de datos robusta
4. **Gestión de caché** - Usan `revalidatePath()` cuando es necesario
5. **Control de permisos** - Validan autenticación y autorización

## Ejemplo de uso

```typescript
// actions/emailActions.ts
"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getEmails() {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
  
  return await prisma.email.findMany({
    where: { userId: session.user.id }
  })
}