# Sistema de Gestión Inteligente de Emails

## Problema
Ejecutivos comerciales pierden oportunidades de negocio porque reciben 
50-100 emails diarios con solicitudes mezcladas entre spam y clientes 
importantes. Clasificar manualmente consume 1-2 horas diarias, las tareas 
implícitas se olvidan y no hay visibilidad clara de pendientes urgentes.

**Impacto:** Oportunidades perdidas, clientes insatisfechos, caos operativo.

## Solución
Sistema web que procesa emails automáticamente con IA, extrae tareas 
implícitas y las organiza en un tablero Kanban visual para priorización 
eficiente.

## Features Core (MVP - 3 Semanas)

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
- Drag & drop para mover tareas (si es viable dentro del sprint)
- Modal o sección lateral para contexto completo del email

### Feature Base: Autenticación Segura (Semana 1)
- Login con Google OAuth (o login dummy temporal si el tiempo lo exige)
- Privacidad: cada usuario ve solo sus datos

## Tech Stack
- **Frontend:** Next.js 15 (App Router), React, TypeScript, Tailwind CSS, Notify
- **UI Components:** shadcn/ui, Lucide React, TanStack Table
- **Backend:** Next.js Server Actions, Prisma ORM
- **Database:** PostgreSQL (Neon en producción)
- **Auth:** NextAuth.js con Google OAuth
- **IA:** OpenAI API (GPT-4/3.5)
- **Validación:** Zod
- **Deploy:** Vercel

## Deployment
- **App:** [URL de Vercel - se agregará después del deploy]
- **Repositorio:** [URL de GitHub]

## Equipo
 - Erick Verde
 - Luis 
