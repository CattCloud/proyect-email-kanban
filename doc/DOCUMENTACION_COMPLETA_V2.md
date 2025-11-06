# Sistema de Gestión Inteligente de Emails - Documentación Completa

**Versión:** 2.0 (MVP)  
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

### 5.1 User Journey

- Login simulado/basic OAuth
- Importación JSON de hasta 20 emails
- Selección y procesamiento IA en lotes de hasta 10 emails
- Revisión rápida de metadata generada
- Visualización de tareas extraídas en Kanban
- Mover cards manualmente si posible; edición superficial permitida solo si hay tiempo[1]

### 5.2 Features Core (Indispensables)

| # | Feature            | Historia | Prioridad    |
|---|--------------------|----------|--------------|
| 1 | Login básico       | US-04    | Crítica      |
| 2 | Importar JSON      | US-01    | Crítica      |
| 3 | Tabla emails       | US-01    | Crítica      |
| 4 | Seleccionar emails | US-02    | Crítica      |
| 5 | IA batch           | US-02    | Crítica      |
| 6 | Kanban visual      | US-03    | Crítica      |

### 5.3 Features Agregadas (Solo si hay tiempo)

| # | Feature                    | Prioridad  |
|---|----------------------------|------------|
| 7 | Edición superficial        | Media      |
| 8 | Drag & Drop + Modal        | Media      |

### 5.4 Exclusiones (Fuera de alcance)

- Integración con inbox real (Gmail, Outlook, etc.)
- Polling automático/webhooks
- Notificaciones push/email
- Multi-workspace o colaboración real
- Analytics y reportes
- Integración con otros clientes

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
| **react spinners** |  | Para estados de carga en la UI |
| **react-loading-skeleton** |  | Para skeletons en la UI |


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

### 8.1 Resumen del Flujo

1. **Login**: Acceso mediante Google OAuth o, en caso de cuello de botella, login dummy (usuario único de prueba).
2. **Importar JSON**: Usuario importa archivo JSON de emails demo (no se admiten uploads de usuarios externos en la demo).
3. **Visualizar y seleccionar**: Emails se presentan en tabla interactiva (buscable, ordenable). Usuario selecciona hasta 10 para procesamiento IA.
4. **Procesar con IA**: Usuario ejecuta IA sobre emails seleccionados. El sistema marca fallos o pendientes para revisión manual.
5. **Revisar metadata**: Si el tiempo lo permite, usuario puede editar la metadata generada. Si no, solo revisa el resultado.
6. **Kanban**: Solo emails con tarea pasan al Kanban. Visualización mínima (sin drag & drop real si el sprint se complica).
7. **Detalle de tareas**: Visualización sencilla del detalle de tarea, ya sea mediante card expandida, sección lateral o modal sencillo (según capacidad técnica restante).[1]

### 8.2 Características importantes y degradaciones permitidas

- El flujo debe funcionar end-to-end aunque login, edición avanzada, drag & drop o modales sean simplificados.
- Los fallos de IA o errores deben marcarse en UI, no bloquear completamente el proceso.
- Priorizar robustez y fluidez básica sobre interacción avanzada para asegurar entrega en plazo.

***

## 9. Procesamiento con IA 

### 9.1 Estrategia Técnica MVP

- Procesamiento únicamente batch (máx 10 emails por tanda).
- Solicitud concurrente limitada (p. ej. 3 requests simultáneos).
- El prompt a IA está estrictamente definido y las salidas se validan con Zod antes de guardar.
- Si falla la validación, el email afectado queda con estado “error IA” para revisión posterior manual.
- Retry automático simple (máx 2 intentos por email; si falla se marca como error).
- Feedback visual mínimo (loader y posible progress bar básica).

### 9.2 Detalle de la integración
- El procesamiento NO se detona automáticamente al importar: siempre requiere acción del usuario.
- El prompt a IA debe exigir JSON estricto con los campos acordados, sin respuestas generativas adicionales.
- La metadata NO debe editarse por el usuario salvo que la capacidad lo permita dentro del plazo.
- Los emails con tareas generadas son los únicos que pasan a tablero Kanban.
- No se contempla integración con mailbox real, webhooks, polling ni automatismos en esta etapa.
- Documentar todos los fallos detectados para priorizarlos en siguientes iteraciones o roadmap post-MVP.

***


