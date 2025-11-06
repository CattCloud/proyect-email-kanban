# 📅 PLAN DE TRABAJO - SEMANA 1
## Sistema de Gestión Inteligente de Emails

**Duración:** Clases 31 y 32 (+ trabajo asíncrono)  
**Objetivo:** Desplegar MVP mínimo con UI navegable y Feature 1 conectada a BD real  
**Filosofía:** Deploy temprano, iterar rápido, mockups antes que código

---

## 🎯 OBJETIVOS DE LA SEMANA

Al finalizar la Semana 1, tendrás:

✅ Proyecto configurado con arquitectura escalable  
✅ Mockups profesionales de las 3 features core generados con IA  
✅ UI navegable desplegada en Vercel con datos mock  
✅ **Feature 1 (Importar y Visualizar Emails) funcionando con BD real**  
✅ Autenticación con Google OAuth implementada  
✅ README técnico documentando alcance y decisiones

---

## 📋 ENTREGABLES DE LA SEMANA

### Checkpoint 1 - Fin Clase 31 (Lunes)
- [ ] Repositorio GitHub público configurado
- [ ] App desplegada en Vercel (aunque sea vacía)
- [ ] 3 mockups profesionales generados con IA
- [ ] README.md con problema, solución y features core
- [ ] UI navegable con datos mock

### Checkpoint 2 - Fin Clase 32 (Martes)
- [ ] Feature 1 (Importar JSON + Visualizar tabla) conectada a PostgreSQL
- [ ] Autenticación Google OAuth funcional
- [ ] Schema Prisma con modelo User y Email
- [ ] Deploy actualizado con Feature 1 funcionando
- [ ] Datos mock solo en Features 2 y 3

---

## 🗓️ CLASE 31 (LUNES) - Setup + UI con Datos Mock

**Duración estimada:** 3 horas  
**Resultado:** App desplegada con navegación completa usando datos simulados

---

### 📍 BLOQUE 1: Ideación y Validación (30 min)

#### 1.1 Confirmar Alcance del MVP ✅

**Qué hacer:**
- Revisar la documentación del proyecto completa
- Confirmar que las 3 features core están claras y son viables
- Validar que el alcance es realista para 3 semanas

**Validación con IA:**

Usa Claude o Perplexity con este prompt adaptado:

```
Actúa como product manager experto en proyectos fullstack.

Voy a construir un Sistema de Gestión Inteligente de Emails en 3 semanas.

PROBLEMA:
Ejecutivos comerciales pierden oportunidades porque reciben 50-100 
emails diarios mezclados con spam. Clasificar manualmente consume 
1-2 horas diarias y las tareas implícitas se olvidan.

SOLUCIÓN:
Sistema que procesa emails, extrae tareas con IA y organiza en Kanban.

FEATURES CORE PROPUESTAS:
1. Importar JSON + visualizar emails en tabla (US-01)
2. Procesar emails con IA para extraer metadata (US-02)
3. Visualizar tareas detectadas en tablero Kanban (US-03)

ADICIONALES:
- Login con Google OAuth (US-04)
- Edición de metadata generada por IA
- Drag & Drop en Kanban

TECH STACK:
Next.js 15, TypeScript, PostgreSQL (Neon), Prisma, NextAuth, 
OpenAI API, shadcn/ui, TanStack Table, Zod

Ayúdame a:
1. Validar si estas 3 features son suficientes para un MVP de 3 semanas
2. Identificar qué feature debería ir primero, segunda y tercera
3. Sugerir qué dejar fuera si el alcance es muy ambicioso
4. Confirmar que el problema es claro y el value proposition es fuerte

Sé directo. Desafíame si algo no tiene sentido.
```

**Entregable:** Confirmación documentada de que el alcance es viable

---

#### 1.2 Documentar en README.md ✅

**Qué hacer:**
Crear archivo README.md en la raíz del proyecto con esta estructura:

```markdown
# 📧 Sistema de Gestión Inteligente de Emails

## 🎯 Problema
Ejecutivos comerciales pierden oportunidades de negocio porque reciben 
50-100 emails diarios con solicitudes mezcladas entre spam y clientes 
importantes. Clasificar manualmente consume 1-2 horas diarias, las tareas 
implícitas se olvidan y no hay visibilidad clara de pendientes urgentes.

**Impacto:** Oportunidades perdidas, clientes insatisfechos, caos operativo.

## 💡 Solución
Sistema web que procesa emails automáticamente con IA, extrae tareas 
implícitas y las organiza en un tablero Kanban visual para priorización 
eficiente.

## ✨ Features Core (MVP - 3 Semanas)

### Feature 1: Importar y Visualizar Emails (Semana 1)
- Importar emails desde archivo JSON
- Visualizar en tabla con búsqueda y ordenamiento
- Ver detalle completo de cada email

### Feature 2: Procesamiento Inteligente con IA (Semana 2)
- Selección batch de emails para procesar
- IA extrae: categoría, prioridad, tareas
- Revisión y edición de metadata generada

### Feature 3: Tablero Kanban Visual (Semana 2)
- Visualizar tareas en 3 columnas (Por hacer/En progreso/Completado)
- Drag & drop para mover tareas
- Modal con contexto completo del email

### Feature Base: Autenticación Segura (Semana 1)
- Login con Google OAuth
- Privacidad: cada usuario ve solo sus datos

## 🛠️ Tech Stack
- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui, Lucide React, TanStack Table
- **Backend:** Next.js Server Actions, Prisma ORM
- **Database:** PostgreSQL (Neon en producción)
- **Auth:** NextAuth.js con Google OAuth
- **IA:** OpenAI API (GPT-4/3.5)
- **Validación:** Zod
- **Deploy:** Vercel

## 🚀 Deployment
- **App:** [URL de Vercel - se agregará después del deploy]
- **Repositorio:** [URL de GitHub]

## 👥 Equipo
[Nombres de los integrantes]

## 📅 Timeline
- **Semana 1:** Setup + Feature 1 + Auth
- **Semana 2:** Feature 2 + Feature 3
- **Semana 3:** Polish + Feature diferenciadora + Demo
```

**Entregable:** README.md completo en repositorio

---

### 📍 BLOQUE 2: Diseño de Mockups con IA (40 min)

**Objetivo:** Generar 3 mockups profesionales (uno por feature core) usando v0.dev o Claude

---

#### 2.1 Mockup Feature 1: Tabla de Emails ✅

**Prompt para v0.dev:**

```
Create a professional email inbox table view for an Email Management System.

Include:
- Header with "Mis Emails" title and "Importar JSON" button
- Search bar with icon
- Table with columns: Checkbox, From (email), Subject, Date, Status badge
- At least 5 email rows with realistic data
- Each row clickable to view details
- Action buttons: "Procesar con IA" (primary), "Eliminar seleccionados"
- Pagination at bottom (showing "1-10 of 45 emails")

Design:
- Use shadcn/ui components (Table, Button, Badge, Input)
- Clean, professional interface
- Status badges: "Sin procesar" (gray), "Procesado" (green)
- Responsive layout

Tech: Next.js, TypeScript, Tailwind CSS, shadcn/ui
```

**Qué hacer después:**
- Guardar screenshot del mockup generado
- Descargar código si v0.dev lo permite
- Guardar en carpeta `/mockups/feature-1-tabla-emails.png`

---

#### 2.2 Mockup Feature 2: Procesamiento IA ✅

**Prompt para v0.dev:**

```
Create an email detail view with AI-generated metadata for an Email 
Management System.

Include:
- Email header: From, Subject, Date received
- Full email body (scrollable if long)
- Right sidebar with AI-generated metadata:
  * Category badge (Cliente/Lead/Interno/Spam with colors)
  * Priority badge (Alta/Media/Baja with red/yellow/green)
  * Detected task section (if exists)
  * Task description in card format
- Edit metadata button
- Action buttons: "Confirmar metadata", "Volver a tabla"

Design:
- Split layout: 70% email content, 30% metadata sidebar
- Use shadcn/ui (Card, Badge, Button, Textarea)
- Professional, clean spacing
- Icons from lucide-react

Example data:
- Category: "Cliente" (blue badge)
- Priority: "Alta" (red badge)
- Task: "Enviar presupuesto antes del viernes"

Tech: Next.js, TypeScript, Tailwind CSS, shadcn/ui
```

---

#### 2.3 Mockup Feature 3: Tablero Kanban ✅

**Prompt para v0.dev:**

```
Create a Kanban board for task management in an Email Management System.

Include:
- Header with "Mis Tareas" title and filter dropdown
- 3 columns: "Por Hacer", "En Progreso", "Completado"
- Each column has:
  * Title with task count badge
  * 3-4 task cards
- Task card shows:
  * Email subject (truncated if long)
  * Priority badge (Alta/Media/Baja with colors)
  * Category badge (Cliente/Lead/Interno)
  * Sender email
  * Click to open detail modal
- Visual drag & drop affordance (cursor pointer, hover effect)

Design:
- 3 equal-width columns with subtle borders
- Cards with shadow on hover
- Use shadcn/ui (Card, Badge)
- Clean spacing, professional look
- Responsive: stack columns on mobile

Tech: Next.js, TypeScript, Tailwind CSS, shadcn/ui
```

---

**Entregable Bloque 2:**
- [ ] 3 mockups generados y guardados como imágenes
- [ ] Código de mockups descargado (si disponible)
- [ ] Carpeta `/mockups/` creada en proyecto con las 3 imágenes

---

### 📍 BLOQUE 3: Setup del Proyecto (30 min)

#### 3.1 Crear Proyecto Next.js ✅

**Comandos:**

```bash
# Crear proyecto
npx create-next-app@latest email-management-system --typescript --tailwind --app --eslint

cd email-management-system

# Instalar shadcn/ui
npx shadcn@latest init

# Cuando pregunte, seleccionar:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes
```

---

#### 3.2 Instalar Componentes shadcn/ui ✅

```bash
npx shadcn@latest add button card input table badge dialog \
  dropdown-menu select textarea avatar separator
```

**Componentes instalados:**
- `button`: Acciones principales
- `card`: Contenedores de información
- `input`: Campos de formulario
- `table`: Tabla de emails
- `badge`: Estados y categorías
- `dialog`: Modales
- `dropdown-menu`: Menús desplegables
- `select`: Selects personalizados
- `textarea`: Textos largos
- `avatar`: Foto de usuario
- `separator`: Divisores visuales

---

#### 3.3 Crear Estructura de Carpetas ✅

```bash
# Desde la raíz del proyecto
mkdir -p app/\(auth\) app/\(protected\) actions services lib/types \
  lib/utils lib/mock-data components/emails components/kanban \
  components/shared hooks mockups
```

**Resultado esperado:**

```
/src o /
├── app/
│   ├── (auth)/           # Rutas de autenticación
│   └── (protected)/      # Rutas protegidas (dashboard, emails, kanban)
├── actions/              # Server Actions (vacío por ahora)
├── services/             # Servicios externos (vacío por ahora)
├── lib/
│   ├── types/            # Tipos TypeScript
│   ├── utils/            # Utilidades
│   └── mock-data/        # Datos de prueba
├── components/
│   ├── ui/               # shadcn components (ya existe)
│   ├── emails/           # Componentes de emails
│   ├── kanban/           # Componentes de Kanban
│   └── shared/           # Componentes compartidos
├── hooks/                # Custom hooks
└── mockups/              # Screenshots de mockups
```

---

#### 3.4 Configurar TypeScript Paths ✅

Editar `tsconfig.json` para asegurar que los paths estén configurados:

```json
{
  "compilerOptions": {
    // ... otras opciones
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/actions/*": ["./actions/*"],
      "@/services/*": ["./services/*"],
      "@/hooks/*": ["./hooks/*"]
    }
  }
}
```

---

### 📍 BLOQUE 4: Datos Mock y Tipos (30 min)

#### 4.1 Crear Tipos TypeScript ✅

**Archivo:** `lib/types/email.ts`

```typescript
export type EmailCategory = 'cliente' | 'lead' | 'interno' | 'spam'
export type EmailPriority = 'alta' | 'media' | 'baja'
export type TaskStatus = 'todo' | 'doing' | 'done'

export interface Email {
  id: string
  from: string
  subject: string
  body: string
  receivedAt: Date
  processed: boolean
  // Metadata generada por IA (null si no procesado)
  category: EmailCategory | null
  priority: EmailPriority | null
  hasTask: boolean
  taskDescription: string | null
  taskStatus: TaskStatus | null
}

export interface User {
  id: string
  email: string
  name: string
  image?: string
}
```

---

#### 4.2 Crear Datos Mock Realistas ✅

**Archivo:** `lib/mock-data/emails.ts`

```typescript
import { Email } from '@/lib/types/email'

export const mockEmails: Email[] = [
  {
    id: 'email-001',
    from: 'maria.gonzalez@acmecorp.com',
    subject: 'Urgente: Propuesta Q4 necesita revisión',
    body: 'Hola, necesitamos revisar la propuesta para el cuarto trimestre. El cliente quiere los números actualizados antes del viernes. ¿Podemos agendar una llamada mañana?',
    receivedAt: new Date('2024-11-01T09:15:00'),
    processed: true,
    category: 'cliente',
    priority: 'alta',
    hasTask: true,
    taskDescription: 'Actualizar números de propuesta Q4 y agendar llamada',
    taskStatus: 'todo'
  },
  {
    id: 'email-002',
    from: 'prospecto@nuevaempresa.com',
    subject: 'Consulta sobre servicios de desarrollo',
    body: 'Buenos días, somos una startup que busca desarrollar una plataforma web. Nos interesa conocer sus servicios y tarifas.',
    receivedAt: new Date('2024-11-01T10:30:00'),
    processed: true,
    category: 'lead',
    priority: 'media',
    hasTask: true,
    taskDescription: 'Enviar información de servicios y agendar demo',
    taskStatus: 'doing'
  },
  {
    id: 'email-003',
    from: 'equipo@miempresa.com',
    subject: 'Actualización semanal del proyecto',
    body: 'Equipo, adjunto el reporte semanal. Todo avanza según lo planificado.',
    receivedAt: new Date('2024-11-01T14:00:00'),
    processed: true,
    category: 'interno',
    priority: 'baja',
    hasTask: false,
    taskDescription: null,
    taskStatus: null
  },
  {
    id: 'email-004',
    from: 'noreply@spam.com',
    subject: '¡¡¡Oferta increíble solo HOY!!!',
    body: 'Haga clic aquí para ganar un premio...',
    receivedAt: new Date('2024-11-02T08:00:00'),
    processed: true,
    category: 'spam',
    priority: 'baja',
    hasTask: false,
    taskDescription: null,
    taskStatus: null
  },
  {
    id: 'email-005',
    from: 'cliente.importante@bigcorp.com',
    subject: 'Re: Contrato de mantenimiento 2025',
    body: 'Hemos revisado el contrato y tenemos algunas observaciones. ¿Podemos discutirlas esta semana?',
    receivedAt: new Date('2024-11-02T11:20:00'),
    processed: false,
    category: null,
    priority: null,
    hasTask: false,
    taskDescription: null,
    taskStatus: null
  },
  // Agrega al menos 10 emails más variados
]
```

**Nota:** Crear mínimo 15 emails mock con variedad de categorías, prioridades y estados.

---

### 📍 BLOQUE 5: Implementación UI (60 min)

#### 5.1 Layout Principal con Navegación ✅

**Archivo:** `app/(protected)/layout.tsx`

```typescript
// Crear un layout con sidebar para navegación entre features

Incluir:
- Logo de la app en header
- Menú lateral con enlaces a:
  * Dashboard (home)
  * Emails (Feature 1)
  * Kanban (Feature 3)
- User menu en header (dropdown con nombre y logout)
- Footer simple

Usar componentes de shadcn/ui y estructura responsive
```

---

#### 5.2 Página de Emails (Feature 1) ✅

**Archivo:** `app/(protected)/emails/page.tsx`

**Qué implementar:**
- Componente que muestra tabla de emails
- Importar datos desde `mockEmails`
- Usar `@tanstack/react-table` (instalarlo primero: `npm install @tanstack/react-table`)
- Columnas: Checkbox, From, Subject, Date, Status badge
- Búsqueda por subject o from
- Ordenamiento por fecha
- Click en fila abre modal con detalle completo
- Botón "Importar JSON" (por ahora solo decorativo)
- Botón "Procesar con IA" (deshabilitado si no hay selección)

**Componentes a crear:**
- `components/emails/EmailTable.tsx`
- `components/emails/EmailDetailModal.tsx`
- `components/shared/SearchBar.tsx`

---

#### 5.3 Página de Kanban (Feature 3) ✅

**Archivo:** `app/(protected)/kanban/page.tsx`

**Qué implementar:**
- Componente que muestra 3 columnas de Kanban
- Filtrar solo emails con `hasTask: true`
- Agrupar por `taskStatus`
- Drag & drop visual (sin funcionalidad real aún, solo estético)
- Cards muestran: subject, priority badge, category badge, from
- Click en card abre modal con detalle

**Componentes a crear:**
- `components/kanban/KanbanBoard.tsx`
- `components/kanban/KanbanColumn.tsx`
- `components/kanban/TaskCard.tsx`

---

#### 5.4 Página Dashboard (Home) ✅

**Archivo:** `app/(protected)/page.tsx`

**Qué implementar:**
- Cards con métricas simuladas:
  * Total de emails
  * Emails sin procesar
  * Tareas pendientes
  * Tareas completadas
- Gráfico simple (puede ser decorativo)
- Botón "Ver todos los emails"
- Botón "Ir al Kanban"

---

### 📍 BLOQUE 6: Deploy a Vercel (20 min)

#### 6.1 Preparar para Deploy ✅

```bash
# Asegurar que todo esté commiteado
git init
git add .
git commit -m "feat: Initial setup with mock data UI"
```

---

#### 6.2 Crear Repositorio en GitHub ✅

```bash
# Opción 1: Usando GitHub CLI
gh repo create email-management-system --public --source=. --push

# Opción 2: Manual
# 1. Crear repo en github.com
# 2. Agregar remote y push
git remote add origin https://github.com/TU-USUARIO/email-management-system.git
git branch -M main
git push -u origin main
```

---

#### 6.3 Deploy en Vercel ✅

**Pasos:**
1. Ir a [vercel.com](https://vercel.com)
2. Login con GitHub
3. Click "New Project"
4. Importar repositorio `email-management-system`
5. Framework Preset: Next.js (detecta automáticamente)
6. Environment Variables: dejar vacío por ahora
7. Click "Deploy"

**Tiempo estimado de deploy:** 2-3 minutos

**Entregable:**
- [ ] URL de la app desplegada (ej: `email-management-system.vercel.app`)
- [ ] Actualizar README.md con la URL

---

### ✅ CHECKLIST FIN CLASE 31

- [ ] README.md completo con problema, solución y features
- [ ] 3 mockups generados y guardados en `/mockups/`
- [ ] Proyecto Next.js configurado con TypeScript
- [ ] shadcn/ui instalado con componentes necesarios
- [ ] Estructura de carpetas creada
- [ ] Tipos TypeScript definidos
- [ ] Datos mock realistas (mínimo 15 emails)
- [ ] UI de las 3 features implementada con datos mock
- [ ] Navegación funcional entre páginas
- [ ] Repositorio en GitHub
- [ ] **App desplegada en Vercel y accesible**

---

## 🗓️ CLASE 32 (MARTES) - Feature 1 con BD Real

**Duración estimada:** 3 horas  
**Resultado:** Feature 1 conectada a PostgreSQL + Auth con Google

---

### 📍 BLOQUE 1: Setup Base de Datos (40 min)

#### 1.1 Crear Base de Datos en Neon ✅

**Pasos:**
1. Ir a [neon.tech](https://neon.tech)
2. Crear cuenta gratuita
3. Crear nuevo proyecto: "email-management-db"
4. Seleccionar región más cercana
5. Copiar Connection String (formato: `postgresql://user:password@host/dbname`)

---

#### 1.2 Instalar Prisma ✅

```bash
npm install prisma @prisma/client
npm install -D prisma

# Inicializar Prisma
npx prisma init
```

Esto crea:
- Carpeta `/prisma` con `schema.prisma`
- Archivo `.env` con variable `DATABASE_URL`

---

#### 1.3 Configurar Variables de Entorno ✅

**Archivo:** `.env.local` (crear si no existe)

```bash
# Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth (generar después)
NEXTAUTH_SECRET="tu-secret-aleatorio"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (configurar después)
GOOGLE_CLIENT_ID="pendiente"
GOOGLE_CLIENT_SECRET="pendiente"

# OpenAI (no usar aún, solo preparar)
OPENAI_API_KEY="pendiente"
```

**Importante:** Agregar `.env.local` a `.gitignore` (Next.js lo hace automáticamente)

---

#### 1.4 Definir Schema Prisma ✅

**Archivo:** `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailAddress  String?   // Email de Google OAuth
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relaciones
  emails        Email[]
  
  @@map("users")
}

model Email {
  id                String    @id @default(cuid())
  from              String
  subject           String
  body              String    @db.Text
  receivedAt        DateTime
  processed         Boolean   @default(false)
  
  // Metadata de IA (null si no procesado)
  category          String?   // cliente, lead, interno, spam
  priority          String?   // alta, media, baja
  hasTask           Boolean   @default(false)
  taskDescription   String?   @db.Text
  taskStatus        String?   // todo, doing, done
  
  // Relación con usuario
  userId            String
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([userId])
  @@index([processed])
  @@index([hasTask])
  @@map("emails")
}
```

---

#### 1.5 Ejecutar Migración ✅

```bash
# Crear migración y aplicarla
npx prisma migrate dev --name init

# Generar Prisma Client
npx prisma generate
```

**Resultado esperado:**
- Tablas creadas en Neon
- Prisma Client generado en `node_modules`

---

#### 1.6 Configurar Prisma Client ✅

**Archivo:** `lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Explicación:** Previene múltiples instancias de Prisma en desarrollo (hot reload de Next.js)

---

### 📍 BLOQUE 2: Autenticación con NextAuth (45 min)

#### 2.1 Instalar NextAuth ✅

```bash
npm install next-auth @auth/prisma-adapter
```

---

#### 2.2 Configurar Google OAuth ✅

**Pasos:**

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear nuevo proyecto o seleccionar existente
3. Habilitar "Google+ API"
4. Ir a "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Authorized JavaScript origins: `http://localhost:3000`
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copiar Client ID y Client Secret

**Actualizar `.env.local`:**

```bash
GOOGLE_CLIENT_ID="tu-client-id-aqui"
GOOGLE_CLIENT_SECRET="tu-client-secret-aqui"
```

---

#### 2.3 Configurar NextAuth ✅

**Archivo:** `lib/auth.ts`

```typescript
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}
```

---

#### 2.4 Crear API Route para NextAuth ✅

**Archivo:** `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
```

---

#### 2.5 Crear Página de Login ✅

**Archivo:** `app/(auth)/login/page.tsx`

```typescript
// Página simple con botón "Sign in with Google"
// Usar componente Button de shadcn/ui
// Llamar a signIn('google') al hacer click
```

---

#### 2.6 Proteger Rutas ✅

**Archivo:** `app/(protected)/layout.tsx` (actualizar)

```typescript
// Agregar verificación de sesión
// Si no hay sesión, redirigir a /login
// Mostrar datos del usuario en header
```

---

### 📍 BLOQUE 3: Feature 1 con BD Real (60 min)

#### 3.1 Crear Server Actions para Emails ✅

**Archivo:** `actions/emailActions.ts`

```typescript
'use server'

// Implementar las siguientes funciones:

// 1. getEmails(): obtener todos los emails del usuario actual
// 2. importEmailsFromJSON(jsonData): validar y guardar emails desde JSON
// 3. getEmailById(id): obtener un email específico
// 4. deleteEmails(ids[]): eliminar emails seleccionados

// Cada función debe:
// - Verificar autenticación (usar getServerSession)
// - Validar datos con Zod
// - Usar Prisma para operaciones BD
// - Manejar errores apropiadamente
// - Retornar resultado type-safe
```

**Validadores Zod necesarios:**

```typescript
// lib/validators.ts

import { z } from 'zod'

export const emailImportSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  received_at: z.string().datetime(),
  subject: z.string(),
  body: z.string()
})

export const emailsArraySchema = z.array(emailImport