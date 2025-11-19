Email-to-Kanban: Product Brief
Problema
Ejecutivos comerciales pierden oportunidades de negocio porque:

Reciben 50-100 emails diarios con solicitudes mezcladas entre spam y clientes importantes
Clasificar manualmente consume 1-2 horas diarias
Tareas implícitas en emails se olvidan o pierden prioridad
No hay visibilidad clara de pendientes urgentes vs informativos
Impacto: Oportunidades de negocio perdidas, clientes insatisfechos, caos operativo.

Solución Propuesta
Sistema que procesa emails, extrae tareas automáticamente con IA y organiza todo en tablero Kanban visual.

MVP: Procesamiento batch manual con JSON + IA + visualización Kanban

Versión futura: Integración directa Gmail + procesamiento automático

Historias de Usuario Core
US-01: Importar y visualizar emails
Como ejecutivo comercial
Quiero importar mis emails desde JSON y verlos organizados en una tabla
Para tener mi bandeja centralizada y accesible

Criterios de aceptación:

Importo JSON con formato: {id, email, received_at, subject, body}
Veo tabla con: remitente, asunto, fecha
Puedo buscar y ordenar por fecha
Click en fila muestra email completo
US-02: Procesar emails con IA
Como usuario
Quiero seleccionar emails y procesarlos automáticamente con IA
Para obtener categorización y detección de tareas sin trabajo manual

Criterios de aceptación:

Selecciono múltiples emails con checkboxes
IA retorna: categoría (cliente/lead/interno), prioridad (alta/media/baja), si tiene tarea, descripción de tarea
Veo metadata generada en cada email
Proceso batch de 10 emails en < 15 segundos
Categorías:

Cliente: solicitud/consulta de cliente existente
Lead: prospecto nuevo interesado
Interno: comunicación del equipo
Spam: sin valor comercial
US-03: Visualizar tareas en Kanban
Como usuario
Quiero ver todas mis tareas en tablero Kanban
Para tener claridad visual de pendientes y su progreso

Criterios de aceptación:

3 columnas: Por hacer / En progreso / Completado
Solo aparecen emails que IA detectó como tareas
Card muestra: asunto, prioridad badge, remitente
Drag & drop funciona (desktop y mobile)
Click en card abre email completo en modal
US-04: Acceso seguro y privado
Como usuario
Quiero login con Google y ver solo mis datos
Para mantener privacidad y seguridad

Criterios de aceptación:

Login OAuth con Google
Cada usuario ve únicamente sus emails/tareas
No puedo acceder a datos de otros usuarios
User Journey
Login con Google
Importar JSON con 20 emails
Seleccionar 15 emails → Procesar con IA
Revisar categorización y tareas detectadas
Ir a Kanban → Ver 10 tareas en “Por hacer”
Mover 3 a “En progreso”, completar 1
Click en tarea → Ver contexto completo del email
Tiempo: 5-8 minutos para 20 emails

Formato JSON Esperado
[
  {
    "id": "email-001",
    "email": "cliente@empresa.com",
    "received_at": "2024-11-01T09:15:00Z",
    "subject": "Reunión urgente - Propuesta Q4",
    "body": "Necesito que revisemos la propuesta..."
  }
]
Out of Scope (MVP)
Gmail API automático
Polling/webhooks
Notificaciones
Multi-workspace
Team Collaboration

---
📦 Módulo 8: Clase 31 de 36

Clase 31: Proyecto Final - Inicio Sprint 1
Resumen
Esta clase marca el inicio del Módulo 8: Proyecto Final, el cierre de Code 301 y la demostración definitiva de todo lo aprendido. Durante las próximas 3 semanas, trabajarás en equipos de 2 a 3 personas para construir una aplicación fullstack production-ready que integre el stack completo: Next.js, TypeScript, PostgreSQL, NextAuth y herramientas modernas. Este proyecto no es solo una evaluación, es tu carta de presentación profesional.

Lo que hace único a este módulo es el enfoque AI-first development: no solo construirás software profesional, sino que documentarás y demostrarás cómo usar la IA estratégicamente en cada fase del desarrollo, desde el diseño de arquitectura hasta el deployment.

🎯 Objetivos de aprendizaje
Al finalizar esta clase, serás capaz de:

Definir el alcance de un proyecto fullstack en equipo considerando tiempo, recursos y complejidad técnica
Diseñar mockups profesionales usando herramientas de IA (v0.dev, Claude, etc.)
Estructurar un proyecto Next.js con arquitectura escalable desde el inicio
Implementar una UI navegable con datos mock como primera iteración
🎓 Estructura del Módulo 8 - Proyecto Final
Duración: 3 semanas (6 clases + trabajo asíncrono)
Filosofía:
Iteración rápida: Algo funcionando en producción desde el día 1
Mockup-first: Diseñar UI antes de tocar código
Datos híbridos: Avanzar con mocks, conectar DB cuando sea estratégico
AI-first: Documentar uso de IA en cada decisión técnica
Workflow Semanal:
Semana 1 - MVP Mínimo Viable
L (Clase 31): Setup + UI con datos mock
M (Clase 32): Primera feature con DB real
Entregable: Feature 1 desplegada y funcionando
Semana 2 - Features Core
L (Clase 33): Feature 2 con relaciones 1:N
M (Clase 34): Feature 3 + Auth básica
Entregable: MVP completo con 3 features
Semana 3 - Polish + Demo
L (Clase 35): Feature diferenciadora + documentación
M (Clase 36): Demo Day
Entregable: Proyecto completo + presentación
📊 Criterios de Evaluación (100 puntos)
1. Funcionalidad (30 puntos)
Features core implementadas y funcionando (15 pts)
Integración correcta entre frontend y backend (10 pts)
Autenticación funcional (5 pts)
2. Arquitectura y Código (25 puntos)
Estructura de proyecto escalable (8 pts)
Código limpio y mantenible (8 pts)
Uso correcto de TypeScript (5 pts)
Manejo de errores y validaciones (4 pts)
3. AI-First Development (20 puntos)
Prompt engineering log documentado (8 pts)
Uso estratégico de IA demostrado (7 pts)
Reflexión crítica sobre uso de IA (5 pts)
4. UI/UX Profesional (15 puntos)
Interfaz profesional y consistente (7 pts)
Responsive design (4 pts)
Loading states y feedback visual (4 pts)
5. Deployment y Documentación (10 puntos)
App desplegada y accesible (4 pts)
README técnico completo (3 pts)
Video demo profesional (3 pts)
🚀 Entregables del Módulo
Checkpoint 1 (Fin Semana 1):
Repositorio GitHub con estructura de proyecto
App desplegada en Vercel
Feature 1 funcionando con DB real
Mockups de las 3 features principales
Checkpoint 2 (Fin Semana 2):
MVP con 3 features core
Autenticación con Google OAuth
Relaciones entre entidades implementadas
UI profesional con shadcn/ui
Entrega Final (Clase 36):
Aplicación completa desplegada
Video demo (5-7 min)
README técnico con arquitectura
Prompt engineering log
Presentación en vivo (7 min)
Glosario de Nuevos Términos
MVP (Minimum Viable Product): Versión mínima de un producto que incluye solo las features esenciales necesarias para validar la idea y satisfacer a early adopters

Mockup-first development: Metodología donde se diseña la UI completa antes de implementar lógica, permitiendo iteración rápida en diseño sin código

Datos mock (mock data): Datos de prueba hardcodeados que simulan la estructura real pero sin conexión a base de datos

Feature core: Funcionalidad esencial sin la cual la aplicación no cumple su propósito principal

AI-first development: Enfoque de desarrollo donde la IA se usa estratégicamente como copiloto en diseño, código, testing y documentación

Production-ready: Software que cumple estándares de calidad, seguridad y rendimiento para ser usado por usuarios reales

💡 Consejos Pro:
Sobre el alcance:

Menos features bien hechas > muchas features a medias
Si dudas sobre incluir algo: probablemente no es core
Puedes cambiar de idea en Clase 31, pero después del setup, no cambies el proyecto
Sobre el trabajo en equipo:

Definan roles: uno más frontend, otro más backend (pero ambos tocan todo)
Commits diarios mínimo
Code review mutuo antes del merge
Comunicación constante vía WhatsApp
Sobre el uso de IA:

Genera documentos base como contexto
Utiliza SIEMPRE el modo planificador antes del modo implementador
No aceptes código sin entenderlo: utiliza un modelo barato que te pueda explicar (gemini)
La IA es el copiloto, pero tú serás siempre el Piloto principal
Sobre el deployment:

Deploy temprano, deploy frecuente
Vercel + Neon es la combinación recomendada
Tener algo en producción siempre es mejor que código perfecto en local
© Enter Tech School 2025
---
Lab 31: Proyecto Final - Sprint 1 Kickoff
Hoy defines y arrancas tu proyecto final. En 3 horas pasarás de idea a aplicación desplegada con UI funcional. Este es un laboratorio de proyecto real: menos guías paso a paso, más decisiones técnicas y ejecución profesional.

🎯 Objetivos
Definir alcance MVP con 3 features core validadas
Generar mockups profesionales con IA (v0.dev, Claude)
Estructurar proyecto Next.js con arquitectura escalable
Deploy de primera iteración con UI navegable y datos mock
📋 Workflow del Día
1. Ideación y Validación de Alcance (30 min)
Decisión del proyecto:

¿Qué aplicación resuelve un problema real?
¿Qué features son absolutamente necesarias?
¿Es viable construir esto en 3 semanas?
Tipos de proyectos sugeridos:

Gestión de proyectos/tareas (Trello-like)
CRM simplificado
Sistema de reservas
Dashboard de métricas
Plataforma de contenido colaborativo
Framework de validación:

Usa Perplexity.ai o Claude con este prompt:

Actúa como product manager experto. Voy a construir una aplicación 
fullstack en 3 semanas con mi compañero.

Idea: [DESCRIBE EN 2-3 ORACIONES]

Ayúdame a:
1. Identificar las 3 features CORE indispensables
2. Sugerir 2-3 features "nice-to-have" que NO incluiremos
3. Validar si el alcance es realista para 3 semanas
4. Proponer un nombre profesional

Respuestas directas. Desafíame si es muy ambicioso.
Documenta en README.md:

# [Nombre del Proyecto]

## Problema
[1-2 oraciones]

## Features Core (MVP)
1. [Feature 1]
2. [Feature 2]
3. [Feature 3]

## Tech Stack
Next.js 15 o 16, TypeScript, PostgreSQL (Neon), NextAuth, shadcn/ui, Vercel
Red flags de alcance excesivo:

Más de 4 modelos de base de datos
Integración compleja con servicios externos
No puedes explicar la app en 30 segundos
2. Diseño de Mockups con IA (40 min)
Setup de herramientas:

v0.dev (recomendado): 200 créditos mensuales gratis
Claude Artifacts: alternativa si agotaste v0
Generar mockup por feature:

Template de prompt para v0.dev:

Create a [page/component] for [TU APP] using Next.js, TypeScript, shadcn/ui.

Include:
- [Elemento específico 1]
- [Elemento específico 2]
- [Elemento específico 3]

Professional, clean design with Tailwind CSS.
Ejemplos concretos:

Para dashboard:

Create a dashboard page for TaskFlow (project management app).

Include:
- Stats cards showing: total projects, active tasks, team members
- Grid of project cards with title, description, status badge
- Quick actions: "New Project" button
- Top navbar with logo and user menu

Professional design with shadcn/ui components.
Para formulario:

Create a "New Task" form modal for TaskFlow.

Include:
- Title input (required)
- Description textarea
- Priority dropdown (Low/Medium/High)
- Assign to user selector
- Due date picker
- Submit and Cancel buttons

Use react-hook-form and shadcn/ui.
Entregable: 3 mockups (uno por feature) + screenshots guardados

3. Implementación y Deploy (50 min)
Setup proyecto:

npx create-next-app@latest proyecto-final --typescript --tailwind --app
cd proyecto-final

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input form dialog table

# Estructura
mkdir -p app/(dashboard) components/shared lib/{types,utils,mock-data}
Datos mock estratégicos:

Crea lib/mock-data.ts con interfaces TypeScript y datos realistas:

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed';
  createdAt: Date;
}

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Update corporate site',
    status: 'active',
    createdAt: new Date('2024-01-15')
  },
  // Mínimo 5 items por entidad
];
Implementar UI principal:

Usa el código generado por v0.dev, pero:

Ajusta naming a tu proyecto
Simplifica lo que no entiendas
Conecta con tus datos mock
Prioriza funcionalidad sobre perfección
Deploy inmediato:

git init && git add . && git commit -m "Initial: UI with mock data"
gh repo create proyecto-final --public --source=. --push

# Deploy a Vercel (web interface recomendado)
# vercel.com → Import Git Repository
Entregable: App desplegada con navegación entre 3 features

🎯 Checkpoints de Validación
Checkpoint 1 (30 min):

Proyecto definido en README con 3 features core
Features validadas (no muy simples, no imposibles)
Checkpoint 2 (70 min):

3 mockups generados con IA
Screenshots guardados
Código de mockups descargado
Checkpoint 3 (120 min):

Proyecto Next.js con TypeScript configurado
Datos mock con tipos TypeScript
UI implementada y navegable
App desplegada en Vercel
🚀 Extensiones Opcionales
Si terminas antes:

Dark mode: Implementar con next-themes
Interactividad mock: CRUD en memoria con useState
Animaciones: Micro-interacciones con Framer Motion
Persistencia local: Guardar datos mock en localStorage
📝 Instrucciones de Entrega
Subir antes de la próxima clase:

URL del repo GitHub
URL de la app en Vercel
3 screenshots de los mockups
💡 Tips Profesionales
Sobre IA:

Primera iteración: prompt genérico
Segunda: refinar lo específico que no te gustó
No busques perfección: 80% bien es excelente para MVP
Sobre código generado:

Léelo antes de usarlo
Adapta naming y estructura
Borra lo que no entiendas (simplicidad > completitud)
Sobre el equipo:

Dividan: mockups + setup en paralelo
Commits frecuentes, no uno gigante al final
Main branch está bien por ahora
Sobre alcance:

Menos features bien hechas > muchas a medias
Si dudas si incluir algo: probablemente no es core
Deploy temprano > código perfecto en local
⚠️ Red Flags
❌ Cambiar de proyecto después del setup
❌ Mockups de 10 páginas diferentes
❌ Código perfecto en local sin deploy
❌ Features que requieren 4+ modelos de DB

✅ App desplegada antes de terminar clase
✅ README con alcance claro y específico
✅ Mockups simples pero profesionales
✅ UI navegable con datos mock realistas

© Enter Tech School 2025
---
📦 Módulo 8: Clase 32 de 36

Clase 32: Feature 1 con Base de Datos Real
Resumen
Hoy conectas tu aplicación con PostgreSQL. Tu Feature 1 pasa de datos mock a persistencia real usando Prisma + Neon. Este es el salto de prototipo a aplicación funcional: diseñarás el schema de datos, implementarás API routes y conectarás el frontend con el backend. Al final de la clase, Feature 1 estará completamente operativa en producción.

🎯 Objetivos de aprendizaje
Al finalizar esta clase, serás capaz de:

Diseñar schemas de Prisma para entidades relacionales con tipos y validaciones apropiadas
Implementar API routes en Next.js con manejo de errores y validaciones
Integrar frontend con backend usando fetch y manejo de estados de loading/error
Desplegar cambios de schema a producción usando Prisma migrations
🎓 Workflow de la Clase
Code Review de Avances (20 min)
Revisión de proyectos desplegados
Validación de mockups y alcance definido
Feedback sobre estructura de proyecto
Demo Técnica: Prisma + Neon (30 min)
Arquitectura de datos para apps fullstack
Prisma schema design patterns
API routes en Next.js con TypeScript
Manejo de errores y validaciones
Desarrollo Feature 1 (110 min)
Diseño de schema con validación de IA
Setup de Prisma + Neon
Implementación de API routes (CRUD)
Conexión frontend-backend
Deploy con migraciones
Planning Semana 1 (20 min)
Validación de Feature 1 desplegada
Planificación de trabajo async
Definición de Checkpoint 1
🔍 Conceptos Clave
Schema-first design: Diseñar modelo de datos antes de implementar lógica permite validar arquitectura y prevenir refactors costosos.

API Routes en Next.js: Endpoints serverless que corren en el mismo proyecto que el frontend, simplificando deployment y desarrollo.

Prisma Client: ORM type-safe que genera interfaces TypeScript automáticamente desde el schema, reduciendo errores en runtime.

Database migrations: Sistema de control de versiones para el schema que permite desplegar cambios de estructura de forma segura y reproducible.

Glosario de Nuevos Términos
Prisma Schema: Archivo declarativo que define modelos, relaciones y configuración de base de datos

Migration: Script SQL generado automáticamente que transforma el schema de la DB de un estado A a un estado B

API Route Handler: Función serverless en Next.js que maneja HTTP requests (GET, POST, etc.)

Type-safe ORM: Object-Relational Mapping que garantiza coincidencia entre tipos de TypeScript y estructura de base de datos

Connection pooling: Técnica de reutilización de conexiones a DB para optimizar performance en entornos serverless

💡 Preparación para el Trabajo Async
Para Checkpoint 1 (fin de semana) necesitas:

Feature 1 completamente funcional:
CRUD completo operando con DB real
Validaciones en frontend y backend
Estados de loading y errores manejados
UI pulida y profesional
Feature 2 con mockups listos:
Mockup generado con IA
Datos mock preparados
Schema de Prisma diseñado (sin implementar)
Documentación actualizada:
README con instrucciones de setup
Variables de entorno documentadas
Decisiones técnicas importantes registradas
Tiempo estimado async: 4-5 horas

🎯 Validación de Avance
Al final de esta clase debes tener:

✅ Feature 1 con CRUD funcional usando PostgreSQL
✅ API routes implementadas y testeadas
✅ Frontend consumiendo backend correctamente
✅ App desplegada en Vercel con Neon conectado
✅ Commit con mensaje claro: “feat: Feature 1 with real database”
© Enter Tech School 2025
---

