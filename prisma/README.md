# Base de Datos - Modelo de Datos

## Overview

Este documento describe el modelo de datos del Sistema de Gestión Inteligente de Emails implementado con Prisma ORM y PostgreSQL (Neon).

## Modelos

### Email

Representa los emails importados al sistema.

**Campos:**
- `id` (String, Primary Key): Identificador único del email
- `from` (String): Dirección de email del remitente
- `subject` (String): Asunto del email
- `body` (String): Contenido completo del email
- `receivedAt` (DateTime): Fecha y hora de recepción (auto-generado)
- `processed` (Boolean): Indica si el email ha sido procesado por IA (default: false)

**Índices:**
- `from`: Para búsquedas por remitente
- `subject`: Para búsquedas por asunto
- `processed`: Para filtrar emails procesados vs no procesados
- `receivedAt`: Para ordenamiento por fecha

### EmailMetadata

Representa la metadata generada por el procesamiento con IA.

**Campos:**
- `id` (String, Primary Key): Identificador único de la metadata
- `emailId` (String, Foreign Key): Referencia al email original (único)
- `category` (String, Optional): Categorización del email ('cliente' | 'lead' | 'interno' | 'spam' | null)
- `priority` (String, Optional): Prioridad del email ('alta' | 'media' | 'baja' | null)
- `hasTask` (Boolean): Indica si el email contiene una tarea detectada (default: false)
- `taskDescription` (String, Optional): Descripción de la tarea detectada
- `taskStatus` (String, Optional): Estado de la tarea ('todo' | 'doing' | 'done' | null)

**Índices:**
- `emailId`: Índice único para la relación
- `category`: Para filtrar por categoría
- `priority`: Para filtrar por prioridad
- `hasTask`: Para filtrar emails con tareas
- `taskStatus`: Para filtrar por estado de tarea

## Relaciones

```
Email (1) ──── (1) EmailMetadata
```

- Un Email puede tener cero o una EmailMetadata
- EmailMetadata depende completamente de Email (onDelete: Cascade)

## Consideraciones de Diseño

### Separación de Responsabilidades
- **Email**: Datos crudos del email (inmutables)
- **EmailMetadata**: Datos generados por IA (pueden regenerarse)

### Performance
- Índices en todos los campos frecuentemente consultados
- Separación permite queries más eficientes (solo Email cuando no se necesita metadata)

### Escalabilidad
- Diseño preparado para añadir User en el futuro (campo userId en Email)
- Estructura que soporta múltiples sistemas de categorización
- Metadata extensible para futuras funcionalidades de IA

## Operaciones Comunes

### Obtener todos los emails (con metadata opcional)
```typescript
const emails = await prisma.email.findMany({
  include: {
    metadata: true
  },
  orderBy: {
    receivedAt: 'desc'
  }
})
```

### Obtener emails con tareas
```typescript
const emailsWithTasks = await prisma.email.findMany({
  where: {
    metadata: {
      hasTask: true
    }
  },
  include: {
    metadata: true
  }
})
```

### Crear email con metadata
```typescript
const email = await prisma.email.create({
  data: {
    from: 'user@example.com',
    subject: 'Asunto',
    body: 'Contenido',
    metadata: {
      create: {
        category: 'cliente',
        priority: 'alta',
        hasTask: true,
        taskDescription: 'Tarea detectada',
        taskStatus: 'todo'
      }
    }
  },
  include: {
    metadata: true
  }
})
```

## Estado Actual

- **Versión**: v1.0 (MVP Semana 2)
- **Tablas creadas**: 2 (Email, EmailMetadata)
- **Índices**: 9 totales
- **Relaciones**: 1 (Email → EmailMetadata)
- **Base de datos**: Neon PostgreSQL
- **ORM**: Prisma 6.19.0

## Próximos Cambios Planeados

- Añadir modelo User para autenticación (Semana 2+)
- Añadir campo userId a Email para multi-tenancy
- Considerar modelo Tasks separado para gestión avanzada
- Implementar soft deletes para auditoría