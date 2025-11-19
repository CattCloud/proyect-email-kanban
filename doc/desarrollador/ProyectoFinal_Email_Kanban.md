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