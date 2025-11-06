# Types - Tipos TypeScript Compartidos

Este directorio contiene todas las interfaces y tipos TypeScript que se comparten entre frontend, backend y servicios.

## Estructura

```
/types
├── email.ts             # DTOs de emails
├── task.ts              # DTOs de tareas
├── ai.ts                # DTOs de respuestas IA
├── user.ts              # DTOs de usuarios
├── kanban.ts            # DTOs del tablero Kanban
└── common.ts            # Tipos comunes/reutilizables
```

## Principios

1. **Type-safety** - Tipado completo en toda la aplicación
2. **Reutilización** - Tipos compartidos entre diferentes capas
3. **Documentación** - JSDoc para todos los tipos
4. **Consistencia** - Convenciones de nomenclatura uniformes

## Ejemplo

```typescript
// types/email.ts
export interface Email {
  id: string
  email: string
  received_at: string
  subject: string
  body: string
  category?: EmailCategory
  priority?: Priority
  has_task?: boolean
  task_description?: string
  processed?: boolean
  created_at: string
  updated_at: string
}

export type EmailCategory = 'cliente' | 'lead' | 'interno' | 'spam'
export type Priority = 'alta' | 'media' | 'baja'