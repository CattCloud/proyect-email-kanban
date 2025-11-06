# Sistema de Gestión Inteligente de Emails - Documentación Completa

**Versión:** 1.0 (MVP)  
**Fecha:** Noviembre 2025  
**Plazo:** 14 días (2 semanas)  
**Estrategia:** MVP enfocado en validación de concepto

---

## Tabla de Contenidos

1. [Contexto del Proyecto](#1-contexto-del-proyecto)
2. [Definición del Problema](#2-definición-del-problema)
3. [Solución Propuesta](#3-solución-propuesta)
4. [Historias de Usuario](#4-historias-de-usuario)
5. [Alcance del MVP](#5-alcance-del-mvp)
6. [Stack Tecnológico](#6-stack-tecnológico)
7. [Arquitectura y Estructura](#7-arquitectura-y-estructura)
8. [Flujo de Trabajo del Usuario](#8-flujo-de-trabajo-del-usuario)
9. [Procesamiento con IA](#9-procesamiento-con-ia)
10. [Consideraciones Técnicas](#10-consideraciones-técnicas)
11. [Roadmap de Implementación](#11-roadmap-de-implementación)

---

## 1. Contexto del Proyecto

Este proyecto surge de un bootcamp con un plazo de **14 días** para desarrollar un sistema web funcional. El enfoque está en entregar un **MVP (Producto Mínimo Viable)** que valide la solución propuesta.

### 1.1 Objetivo General

Desarrollar un sistema web que automatice la clasificación de emails y extracción de tareas mediante IA, organizándolas en un tablero Kanban visual.

---

## 2. Definición del Problema

### 2.1 Problema Identificado

Los ejecutivos comerciales enfrentan serios desafíos en la gestión de su comunicación por email:

**Volumen Abrumador:**
- Reciben entre 50-100 emails diarios
- Las solicitudes importantes se mezclan con spam y comunicaciones de bajo valor

**Pérdida de Tiempo:**
- Clasificar manualmente consume 1-2 horas diarias
- Tiempo que podría dedicarse a actividades comerciales de mayor valor

**Gestión Ineficiente:**
- Tareas implícitas en emails se olvidan o pierden prioridad
- No existe visibilidad clara de pendientes urgentes vs. informativos

### 2.2 Impacto del Problema

- ❌ Oportunidades de negocio perdidas
- ❌ Clientes insatisfechos por falta de respuesta oportuna
- ❌ Caos operativo en la gestión del día a día
- ❌ Estrés y sobrecarga de los ejecutivos comerciales

---

## 3. Solución Propuesta

### 3.1 Concepto Central

Sistema inteligente que:
1. **Procesa** emails automáticamente
2. **Extrae** tareas mediante IA
3. **Organiza** todo en un tablero Kanban visual

### 3.2 Enfoque MVP vs. Versión Futura

| Aspecto | MVP (14 días) | Versión Futura |
|---------|---------------|----------------|
| **Ingesta** | Importación manual vía JSON | Integración directa con Gmail API |
| **Procesamiento** | Batch manual (usuario selecciona) | Automático + polling/webhooks |
| **Visualización** | Tablero Kanban básico | Dashboard avanzado con analytics |
| **Notificaciones** | No incluidas | Push notifications + email alerts |

---

## 4. Historias de Usuario

### 🎯 US-01: Importar y Visualizar Emails

**Como** ejecutivo comercial  
**Quiero** importar mis emails desde JSON y verlos organizados en una tabla  
**Para** tener mi bandeja centralizada y accesible

**Criterios de Aceptación:**
- ✅ Puedo importar archivo JSON con formato estandarizado
- ✅ Veo tabla con columnas: remitente, asunto, fecha
- ✅ Puedo buscar y ordenar por fecha
- ✅ Al hacer clic en una fila, se muestra el email completo

**Formato JSON Esperado:**
```json
[
  {
    "id": "email-001",
    "email": "cliente@empresa.com",
    "received_at": "2024-11-01T09:15:00Z",
    "subject": "Reunión urgente - Propuesta Q4",
    "body": "Necesito que revisemos la propuesta..."
  }
]
```

---

### 🎯 US-02: Procesar Emails con IA

**Como** usuario  
**Quiero** seleccionar emails y procesarlos automáticamente con IA  
**Para** obtener categorización y detección de tareas sin trabajo manual

**Criterios de Aceptación:**
- ✅ Puedo seleccionar múltiples emails con checkboxes
- ✅ La IA retorna metadata estructurada para cada email
- ✅ Veo la metadata generada directamente en cada email
- ✅ Procesamiento batch de 10 emails en menos de 15 segundos

**Metadata Generada por IA:**

| Campo | Valores Posibles | Descripción |
|-------|------------------|-------------|
| **Categoría** | Cliente / Lead / Interno / Spam | Tipo de email |
| **Prioridad** | Alta / Media / Baja | Urgencia del email |
| **Tiene Tarea** | true / false | Si contiene acción requerida |
| **Descripción Tarea** | string o null | Tarea extraída |

**Definición de Categorías:**
- **Cliente:** Solicitud o consulta de cliente existente
- **Lead:** Prospecto nuevo interesado
- **Interno:** Comunicación del equipo interno
- **Spam:** Sin valor comercial

---

### 🎯 US-03: Visualizar Tareas en Kanban

**Como** usuario  
**Quiero** ver todas mis tareas en un tablero Kanban  
**Para** tener claridad visual de pendientes y su progreso

**Criterios de Aceptación:**
- ✅ Tablero con 3 columnas: Por hacer / En progreso / Completado
- ✅ Solo aparecen emails que la IA detectó como tareas
- ✅ Cada card muestra: asunto, badge de prioridad, remitente
- ✅ Drag & drop funciona en desktop y mobile
- ✅ Al hacer clic en una card, se abre modal con email completo

**Estructura del Kanban:**

```
┌──────────────┬──────────────┬──────────────┐
│  Por Hacer   │ En Progreso  │  Completado  │
├──────────────┼──────────────┼──────────────┤
│              │              │              │
│  [Card 1]    │  [Card 4]    │  [Card 7]    │
│  [Card 2]    │  [Card 5]    │              │
│  [Card 3]    │  [Card 6]    │              │
│              │              │              │
└──────────────┴──────────────┴──────────────┘
```

---

### 🎯 US-04: Acceso Seguro y Privado

**Como** usuario  
**Quiero** login con Google y ver solo mis datos  
**Para** mantener privacidad y seguridad

**Criterios de Aceptación:**
- ✅ Autenticación vía OAuth con Google
- ✅ Cada usuario ve únicamente sus emails/tareas
- ✅ No puedo acceder a datos de otros usuarios
- ✅ Sesión persistente con renovación automática

---

## 5. Alcance del MVP

### 5.1 User Journey Completo

**Tiempo estimado:** 5-8 minutos para procesar 20 emails

1. **Login** con Google
2. **Importar** JSON con 20 emails
3. **Seleccionar** 15 emails para procesar
4. **Procesar** con IA
5. **Revisar** categorización y tareas detectadas
6. **Ir al Kanban** → Ver 10 tareas en "Por hacer"
7. **Mover** 3 tarjetas a "En progreso", completar 1
8. **Ver detalle** → Click en tarea para ver contexto completo

### 5.2 Features Core (Indispensables)

| # | Feature | Historia | Prioridad |
|---|---------|----------|-----------|
| 1 | Login con Google | US-04 | 🔴 Crítica |
| 2 | Importar JSON | US-01 | 🔴 Crítica |
| 3 | Visualizar emails en tabla | US-01 | 🔴 Crítica |
| 4 | Seleccionar emails | US-02 | 🔴 Crítica |
| 5 | Procesamiento con IA | US-02 | 🔴 Crítica |
| 6 | Visualización en Kanban | US-03 | 🔴 Crítica |

### 5.3 Features de Valor Agregado (Mejoran UX)

| # | Feature | Aporte | Prioridad |
|---|---------|--------|-----------|
| 7 | Revisión y edición de metadata IA | Permite corregir errores antes de usar | 🟡 Media |
| 8 | Drag & Drop + modal de contexto | Hace el Kanban más interactivo | 🟡 Media |

**Nota:** Si el tiempo es limitado, el drag & drop puede implementarse como versión estática primero.

### 5.4 Fuera de Alcance (MVP)

❌ Gmail API automático  
❌ Polling/webhooks  
❌ Notificaciones push  
❌ Multi-workspace  
❌ Colaboración en equipo  
❌ Analytics y reportes  
❌ Integración con otros clientes de email

---

## 6. Stack Tecnológico

### 6.1 Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Next.js** | 15+ (App Router) | Framework principal - SSR, Server Actions |
| **React** | 18+ | Librería UI - Componentes interactivos |
| **TypeScript** | 5+ | Type safety - Prevención de errores |
| **Tailwind CSS** | 3+ | Estilos utilitarios modernos |
| **shadcn/ui** | Latest | Componentes UI reutilizables |
| **Lucide React** | Latest | Iconos modernos |

**Justificación Next.js:**
- Facilita crear páginas modernas con App Router
- Soporta Server Actions (funciones del servidor sin endpoints explícitos)
- Ideal para el patrón donde el frontend invoca lógica server-side
- Optimización automática de performance

### 6.2 Backend & Database

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Prisma** | 5+ | ORM type-safe para base de datos |
| **Neon-PostgreSQL** | Latest | BD para desarrollo y produccion |
| **NextAuth** | 4+ | Autenticación OAuth con Google |

**Justificación Prisma:**
- Simplifica operaciones de BD
- Type-safe queries
- Migraciones automáticas

### 6.3 Utilidades & Estado

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Zod** | 3+ | Validación y tipado en runtime |
| **Zustand** | 4+ | Gestión de estado global |
| **TanStack Table** | 8+ | Tablas avanzadas con sorting/filtering |
| **Notyf** |  | Library for toast notifications |

**Justificación Zod:**
- Valida JSON de entrada
- Valida respuesta de IA antes de guardar
- Schemas reutilizables
- Mensajes de error claros

### 6.4 Inteligencia Artificial

| Servicio | Propósito |
|----------|-----------|
| **OpenAI API** (GPT-4/3.5) | Procesamiento de emails y extracción de metadata |
| **Mock Service** (desarrollo) | Simular respuestas para testing rápido |

**Notas:**
- En desarrollo, usar mocks para evitar costos y latencia
- En producción, implementar rate limiting y caching

### 6.5 Librerías Adicionales (Según Necesidad)

El stack es flexible y permite agregar:
- Drag & drop: `@dnd-kit/core`
- Validación avanzada: `react-hook-form`
- Notificaciones: `notyf`
- Charts (futuro): `recharts`

---

## 7. Arquitectura y Estructura

### 7.1 Patrón de Arquitectura

**Smart Actions Pattern** (Next.js 15)

Este proyecto utiliza el patrón de Server Actions, que elimina la necesidad de crear endpoints API tradicionales.

**Ventajas:**
- ✅ Menos código boilerplate
- ✅ Type-safety end-to-end
- ✅ Validación centralizada
- ✅ Revalidación automática de cache

### 7.2 Estructura de Carpetas

```
/src
├── app/                      # Rutas y páginas (App Router)
│   ├── (auth)/              # Layouts/páginas de login
│   │   └── login/
│   └── (protected)/         # Rutas protegidas
│       ├── dashboard/       # Vista principal
│       ├── emails/          # Gestión de emails
│       ├── kanban/          # Tablero Kanban
│       └── import/          # Importación de JSON
│
├── actions/                 # Server Actions (use server)
│   ├── emailActions.ts      # CRUD de emails
│   ├── aiActions.ts         # Procesamiento con IA
│   ├── taskActions.ts       # Gestión de tareas/Kanban
│   └── importActions.ts     # Importación JSON
│
├── services/                # Integraciones externas
│   ├── aiService.ts         # Wrapper de OpenAI
│   ├── parsingService.ts    # Parseo y validación JSON
│   └── storageService.ts    # Gestión de archivos
│
├── lib/                     # Utilidades centrales
│   ├── prisma.ts            # Cliente Prisma singleton
│   ├── auth.ts              # Configuración NextAuth
│   └── validators.ts        # Schemas Zod
│
├── components/              # Componentes UI
│   ├── ui/                  # Componentes base (shadcn)
│   ├── emails/              # Tabla, card de email
│   ├── kanban/              # Board, Column, Card
│   └── shared/              # Componentes reutilizables
│
├── hooks/                   # Custom React hooks
│   ├── useEmails.ts         # Lógica de emails
│   ├── useKanban.ts         # Lógica del Kanban
│   └── useAuth.ts           # Lógica de autenticación
│
├── types/                   # Tipos TypeScript compartidos
│   ├── email.ts             # DTOs de emails
│   ├── task.ts              # DTOs de tareas
│   └── ai.ts                # DTOs de respuestas IA
│
└── prisma/                  # Base de datos
    ├── schema.prisma        # Esquema de BD
    └── migrations/          # Migraciones
```

### 7.3 Propósito de Carpetas Clave

#### 📁 `actions/`

**Función Principal:** Capa intermedia entre UI y lógica de negocio del servidor

**Responsabilidades:**
1. **Ejecución de Lógica del Servidor**
   - Funciones marcadas con `"use server"`
   - Se ejecutan en el servidor cuando se llaman desde el cliente
   - Evitan overhead de llamadas HTTP tradicionales

2. **Validación de Datos**
   - Implementan validación type-safe con Zod
   - Garantizan datos correctos antes de procesarlos
   - Mensajes de error claros

3. **Manejo de Base de Datos**
   - Operaciones CRUD con Prisma
   - Consultas type-safe
   - Lógica de negocio compleja

4. **Gestión de Cache**
   - Usan `revalidatePath()` para invalidar caché
   - Aseguran UI actualizada después de operaciones

5. **Control de Permisos**
   - Validan permisos de usuario
   - Autorización centralizada

**Flujo de Trabajo:**
```
1. Componente cliente → llama action
2. Next.js serializa parámetros → envía al servidor
3. Función se ejecuta en servidor → acceso completo a BD
4. Resultado se serializa → retorna al cliente
5. Componente actualiza estado
```

**Ejemplo:**
```typescript
// actions/emailActions.ts
"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getEmails() {
  const session = await auth()
  if (!session) throw new Error("Unauthorized")
  
  const emails = await prisma.email.findMany({
    where: { userId: session.user.id }
  })
  
  return emails
}
```

---

#### 📁 `services/`

**Función Principal:** Intermediario entre lógica de negocio y fuentes de datos externas

**Responsabilidades:**
1. **Comunicación con APIs Externas**
   - Llamadas HTTP a servicios externos
   - Manejo de autenticación
   - Procesamiento de respuestas y errores

2. **Abstracción de Lógica de Negocio**
   - Encapsula lógica compleja
   - Interfaces simples para operaciones complejas
   - Separa comunicación de lógica principal

3. **Transformación de Datos**
   - Convierte datos externos → formato interno
   - Normaliza estructuras diferentes
   - Mapeos entre modelos

4. **Manejo de Errores y Reintentos**
   - Lógica de reintentos automáticos
   - Manejo de códigos de error específicos
   - Mensajes de error consistentes

**Flujo de Trabajo:**
```
1. Smart Action necesita datos externos
2. Llama función en services/
3. Servicio maneja comunicación con API
4. Servicio transforma datos
5. Servicio retorna datos procesados
6. Smart Action continúa con lógica
```

**Ejemplo:**
```typescript
// services/aiService.ts

export async function processEmailWithAI(email: string, body: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: AI_PROMPT },
        { role: "user", content: `Email: ${body}` }
      ]
    })
    
    return parseAIResponse(response)
  } catch (error) {
    // Retry logic, error handling
    throw new AIServiceError("Failed to process email")
  }
}
```

---

## 8. Flujo de Trabajo del Usuario

### 8.1 Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO COMPLETO DEL SISTEMA                │
└─────────────────────────────────────────────────────────────┘

1. LOGIN
   ↓
   [Pantalla de Login] → OAuth Google → [Verificación] → [Dashboard]
   
2. IMPORTAR JSON
   ↓
   [Upload JSON] → [Validación Zod] → [Guardar BD] → [Tabla de Emails]
   
3. SELECCIONAR EMAILS
   ↓
   [Tabla] → [Checkboxes] → [Batch seleccionado]
   
4. PROCESAR CON IA
   ↓
   [Botón "Procesar"] → [API IA] → [Metadata generada] → [Guardar BD]
   
5. REVISAR RESULTADOS
   ↓
   [Tabla con metadata] → [Editar si necesario] → [Confirmar]
   
6. VER KANBAN
   ↓
   [Vista Kanban] → [Cards filtradas] → [3 Columnas]
   
7. MOVER TARJETAS
   ↓
   [Drag & Drop] → [Actualizar estado BD] → [Revalidar UI]
   
8. VER CONTEXTO
   ↓
   [Click en Card] → [Modal] → [Email + Metadata + Tarea]
```

### 8.2 Descripción Detallada de Cada Paso

---

#### 🔵 **Paso 1: Login (Google OAuth)**

**¿Qué pasa aquí?**
El usuario entra al sistema y se autentica usando su cuenta de Google.

**¿Por qué es importante?**
- Evita crear usuarios manualmente
- Cada usuario tendrá su propio espacio privado
- Vincula todos los datos al `userId`

**Resultado:**
- El sistema crea o busca al usuario en la BD (NextAuth + Prisma)
- Todos los datos posteriores se vinculan a este usuario

**Consideraciones técnicas:**
- NextAuth maneja el flujo OAuth completo
- Token de sesión almacenado en cookie segura
- Renovación automática de sesión

---

#### 🔵 **Paso 2: Importar JSON con Emails**

**¿Qué hace el usuario?**
Sube un archivo `.json` con correos simulados o descargados.

**¿Qué hace el sistema?**
1. Valida el archivo (estructura con Zod)
2. Guarda en BD como `emails` con estado inicial:
   - `procesado = false`
   - `categoria = null`
   - `prioridad = null`
   - `tarea = null`
   - `userId = id_del_usuario_actual`

**¿Para qué sirve?**
Simula lo que en el futuro será la conexión a Gmail/Outlook, pero sin complicar el MVP.

**Validación esperada:**
```typescript
const emailSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  received_at: z.string().datetime(),
  subject: z.string(),
  body: z.string()
})
```

---

#### 🔵 **Paso 3: Seleccionar Emails para Procesar**

**¿Qué ve el usuario?**
Tabla/lista de todos sus correos importados.

**¿Qué puede hacer?**
Marcar cuáles quiere analizar con IA usando checkboxes (selección batch).

**¿Por qué no procesar todo automáticamente?**
- Evita costos innecesarios de API
- Permite al usuario elegir solo lo relevante
- Control sobre qué se procesa

**Funcionalidad de la tabla:**
- Ordenamiento por fecha
- Búsqueda por remitente/asunto
- Selección individual o masiva

---

#### 🔵 **Paso 4: Procesar con IA (Batch)**

**¿Qué hace el usuario?**
Presiona botón: **"Procesar con IA"**

**¿Qué hace el sistema?**
1. Toma emails seleccionados
2. Los envía a la IA (OpenAI API)
3. La IA devuelve para cada email:
   - Categoría (Cliente/Lead/Interno/Spam)
   - Prioridad (Alta/Media/Baja)
   - Tarea (si existe + descripción)

**Consideraciones:**
- Procesamiento en batches de 10
- Timeout de 15 segundos máximo
- Reintentos automáticos si falla

---

#### 🔵 **Paso 5: Revisar y Confirmar Resultados**

**¿Por qué este paso?**
El usuario actúa como supervisor humano.

**¿Qué puede hacer?**
- Ver resultados generados por IA
- **Editar** si algo está incorrecto
- Confirmar y guardar

**Valor:**
- La IA no es perfecta
- Retroalimentación humana mejora futuros modelos
- Evita que tareas incorrectas lleguen al Kanban

---

#### 🔵 **Paso 6: Ver Kanban**

**¿Qué se muestra?**
Solo los emails que tienen tareas se convierten en tarjetas.

**Estructura del tablero:**

| Por Hacer | En Progreso | Completado |
|-----------|-------------|------------|
| Card 1 🔴 | Card 4 🟡  | Card 7 ✅  |
| Card 2 🟡 | Card 5 🔴  |            |
| Card 3 🟢 | Card 6 🟢  |            |

**Cada tarjeta muestra:**
- ✅ Título (extracto del correo o tarea)
- ✅ Badge de prioridad (🔴 Alta / 🟡 Media / 🟢 Baja)
- ✅ Categoría (Cliente/Lead/Interno)
- ✅ Remitente
- ✅ Estado actual

---

#### 🔵 **Paso 7: Mover Tarjetas (Drag & Drop)**

**¿Qué hace el usuario?**
Arrastra tarjetas entre columnas para organizar su flujo de trabajo.

**Ejemplo:**
- "Por hacer" → "En progreso" (comenzó la tarea)
- "En progreso" → "Completado" (terminó la tarea)

**¿Qué hace el sistema?**
- Actualiza campo `status` en BD (`todo`, `doing`, `done`)
- Revalida la UI automáticamente
- Persiste el cambio inmediatamente

---

#### 🔵 **Paso 8: Ver Contexto de la Tarjeta**

**¿Qué pasa al hacer clic?**
Se abre un modal con información completa.

**Contenido del modal:**

| Sección | Información |
|---------|-------------|
| **Email Original** | Asunto, cuerpo completo, remitente, fecha |
| **Metadata IA** | Categoría: Cliente, Prioridad: Alta |
| **Tarea Detectada** | "Enviar presupuesto al cliente antes del viernes" |
| **Acciones** | Editar, Marcar como completado, Eliminar |

**Valor:**
Permite recordar el contexto sin volver al correo original.

---

## 9. Procesamiento con IA

### 9.1 Estrategia Técnica

#### 🤖 Batching (Procesamiento por Lotes)

**Criterio MVP:** Procesar en batches de 10 emails máximo

**Implementación:**
- Control de concurrencia limitado (usar librería `p-limit`)
- Procesamiento paralelo con límite de requests simultáneos
- Progress bar para feedback visual al usuario

**Ejemplo de código:**
```typescript
import pLimit from 'p-limit'

const limit = pLimit(3) // Max 3 requests simultáneos

const promises = selectedEmails.map(email => 
  limit(() => processEmailWithAI(email))
)

const results = await Promise.all(promises)
```

---

#### 🤖 Prompting (Instrucciones a la IA)

**Objetivo:** Obtener metadata estructurada y consistente

**Prompt Template:**
```
Analiza el siguiente email y extrae:

1. CATEGORÍA (una de estas opciones):
   - cliente: solicitud o consulta de cliente existente
   - lead: prospecto nuevo interesado
   - interno: comunicación del equipo
   - spam: sin valor comercial

2. PRIORIDAD (una de estas opciones):
   - alta: requiere acción inmediata (< 24h)
   - media: importante pero no urgente (1-3 días)
   - baja: informativo o puede esperar (> 3 días)

3. TAREA (si aplica):
   - ¿Contiene una acción requerida? (true/false)
   - Si es true, describe brevemente la tarea en 1 oración

Email:
De: {email_from}
Asunto: {subject}
Cuerpo: {body}

Responde ÚNICAMENTE con JSON válido en este formato:
{
  "categoria": "cliente|lead|interno|spam",
  "prioridad": "alta|media|baja",
  "tiene_tarea": true|false,
  "descripcion_tarea": "string o null"
}
```

---

#### 🤖 Validación (Schema Zod)

**¿Por qué validar?**
La IA puede devolver respuestas inconsistentes o errores.

**Schema de validación:**
```typescript
const AIResponseSchema = z.object({
  categoria: z.enum(['cliente', 'lead', 'interno', 'spam']),
  prioridad: z.enum(['alta', 'media', 'baja']),
  tiene_tarea: z.boolean(),
  descripcion_tarea: z.string().nullable()
})

// Uso
try {
  const validated = AIResponseSchema.parse(aiResponse)
  // Guardar en BD
} catch (error) {
  // Marcar email como processed: false con error
  console.error('AI response validation failed:', error)
}
```

---

#### 🤖 Retries y Fallbacks

**Estrategia de reintentos:**
1. Primer intento
2. Si falla → retry después de 2 segundos
3. Si falla nuevamente → retry después de 5 segundos
4. Si sigue fallando → exponer para revisión manual

**Implementación:**
```typescript
async function processWithRetry(email, maxRetries = 2) {
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await callAIAPI(email)
    } catch (error) {
      if (i === maxRetries) {
        // Marcar para revisión manual
        await markEmailAsFailedProcessing(email.id, error)
        throw error
      }
      await delay(2000 * (i + 1)) // Backoff exponencial
    }
  }
}
```

---
