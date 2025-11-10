# Server Actions API

Este documento describe todas las Server Actions disponibles en el sistema, siguiendo el patrón Smart Actions de Next.js 15.

## Overview

Las Server Actions son funciones que se ejecutan en el servidor y proporcionan una API type-safe para el frontend. Eliminan la necesidad de endpoints API tradicionales y proporcionan validación automática con Zod.

## Convenciones

- **Directiva "use server"**: Todas las acciones deben incluir esta directiva al inicio del archivo
- **Validación con Zod**: Todos los datos de entrada se validan con schemas Zod
- **Manejo de errores**: Todas las acciones retornan `{ success: boolean, data?: any, error?: string }`
- **Revalidación de caché**: Las acciones de escritura llaman a `revalidatePath()`

## API de Emails

### `getEmails()`

Obtiene todos los emails con su metadata.

```typescript
export async function getEmails(): Promise<{
  success: boolean;
  data?: Email[];
  error?: string;
}>
```

**Retorna:**
- `success: true` y `data: Email[]` si la consulta es exitosa
- `success: false` y `error: string` si hay un error

**Uso en frontend:**
```typescript
"use client";
import { getEmails } from "@/actions/emails";

export default function EmailList() {
  const [emails, setEmails] = useState([]);
  
  const loadEmails = async () => {
    const result = await getEmails();
    if (result.success) {
      setEmails(result.data);
    } else {
      console.error(result.error);
    }
  };
  
  // ...
}
```

---

### `getEmailById(id: string)`

Obtiene un email específico por ID con su metadata.

```typescript
export async function getEmailById(id: string): Promise<{
  success: boolean;
  data?: Email;
  error?: string;
}>
```

**Parámetros:**
- `id: string` - ID del email a buscar

**Retorna:**
- `success: true` y `data: Email` si se encuentra el email
- `success: false` y `error: string` si no se encuentra o hay error

---

### `createEmail(data: CreateEmailData)`

Crea un nuevo email con metadata opcional.

```typescript
export async function createEmail(data: CreateEmailData): Promise<{
  success: boolean;
  data?: Email;
  error?: string;
}>
```

**Parámetros:**
- `data: CreateEmailData` - Datos del email a crear
  - `email: EmailData` - Datos básicos del email
  - `metadata?: EmailMetadataData` - Metadata opcional

**Validación:**
- `email.from` - Debe ser un email válido
- `email.subject` - Requerido, mínimo 1 carácter
- `email.body` - Requerido, mínimo 1 carácter
- `metadata.*` - Validado según schema de metadata

**Retorna:**
- `success: true` y `data: Email` si se crea correctamente
- `success: false` y `error: string` si hay error de validación o creación

---

### `updateEmail(id: string, data: UpdateEmailData)`

Actualiza un email existente y su metadata.

```typescript
export async function updateEmail(id: string, data: UpdateEmailData): Promise<{
  success: boolean;
  data?: Email;
  error?: string;
}>
```

**Parámetros:**
- `id: string` - ID del email a actualizar
- `data: UpdateEmailData` - Datos a actualizar (todos opcionales)

**Validación:**
- Solo se validan los campos proporcionados
- Si el email no existe, retorna error

**Retorna:**
- `success: true` y `data: Email` si se actualiza correctamente
- `success: false` y `error: string` si hay error

---

### `deleteEmail(id: string)`

Elimina un email (soft delete con cascade).

```typescript
export async function deleteEmail(id: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}>
```

**Parámetros:**
- `id: string` - ID del email a eliminar

**Comportamiento:**
- Elimina el email y su metadata (cascade)
- Revalida las rutas principales

**Retorna:**
- `success: true` y `message: string` si se elimina correctamente
- `success: false` y `error: string` si hay error

---

### `getEmailsWithTasks()`

Obtiene emails que contienen tareas (para el Kanban).

```typescript
export async function getEmailsWithTasks(): Promise<{
  success: boolean;
  data?: Email[];
  error?: string;
}>
```

**Filtro:**
- Solo emails donde `metadata.hasTask === true`

**Retorna:**
- `success: true` y `data: Email[]` si la consulta es exitosa
- `success: false` y `error: string` si hay error

---

### `getRecentEmails(limit?: number)`

Obtiene los emails más recientes (para el dashboard).

```typescript
export async function getRecentEmails(limit: number = 5): Promise<{
  success: boolean;
  data?: Email[];
  error?: string;
}>
```

**Parámetros:**
- `limit?: number` - Límite de emails a retornar (default: 5)

**Ordenamiento:**
- Por `receivedAt` descendente (más recientes primero)

**Retorna:**
- `success: true` y `data: Email[]` si la consulta es exitosa
- `success: false` y `error: string` si hay error

## Tipos de Datos

### `EmailData`
```typescript
type EmailData = {
  from: string;        // Email del remitente (validado)
  subject: string;      // Asunto (requerido)
  body: string;         // Contenido (requerido)
  receivedAt?: string;  // Fecha ISO (opcional)
  processed?: boolean;  // Estado de procesamiento (default: false)
}
```

### `EmailMetadataData`
```typescript
type EmailMetadataData = {
  category?: 'cliente' | 'lead' | 'interno' | 'spam';  // Categoría
  priority?: 'alta' | 'media' | 'baja';              // Prioridad
  hasTask?: boolean;                                   // Tiene tarea (default: false)
  taskDescription?: string;                             // Descripción de tarea
  taskStatus?: 'todo' | 'doing' | 'done';             // Estado de tarea
}
```

### `CreateEmailData`
```typescript
type CreateEmailData = {
  email: EmailData;
  metadata?: EmailMetadataData;
}
```

### `UpdateEmailData`
```typescript
type UpdateEmailData = {
  from?: string;
  subject?: string;
  body?: string;
  processed?: boolean;
  metadata?: EmailMetadataData;
}
```

## Manejo de Errores

Todas las acciones siguen el patrón de manejo de errores:

```typescript
try {
  // Lógica de la acción
  return { success: true, data: result }
} catch (error) {
  console.error("Error en [nombre acción]:", error);
  return { 
    success: false, 
    error: "Mensaje descriptivo para el usuario" 
  }
}
```

## Revalidación de Caché

Las acciones de escritura (create, update, delete) revalidan automáticamente:

```typescript
// Revalidar rutas principales
revalidatePath("/emails");
revalidatePath("/");
revalidatePath(`/emails/${id}`); // Para actualizaciones específicas
```

## Consideraciones de Seguridad

- **Validación server-side**: Todos los datos se validan con Zod antes de procesar
- **Sin exposición de datos sensibles**: Los errores no exponen información interna
- **Type safety**: TypeScript previene errores en tiempo de desarrollo

## Próximas Acciones Planificadas

- `importEmailsFromJSON()` - Importación masiva desde archivos JSON
- `processEmailWithAI()` - Procesamiento con OpenAI API
- `updateEmailMetadata()` - Actualización específica de metadata

## Estado Actual

**Versión:** v1.0 (HITO 2 - Semana 2)
**Acciones implementadas:** 6
**Validación:** Zod schemas completos
**Caché:** Revalidación automática implementada
**Testing:** Pendiente de implementación