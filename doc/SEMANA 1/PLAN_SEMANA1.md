# ✅ **📆 Semana 1 — Plan de Trabajo Adaptado a tu Proyecto**

**Proyecto:** Sistema de Gestión Inteligente de Emails (Email-to-Kanban con IA)

---

## 🎯 **Objetivo General de la Semana 1**

Construir y desplegar la **primera versión visual del sistema**, con navegación real y datos mock (falsos pero realistas), sin conexión a base de datos ni IA todavía.

Tu app debe estar **ya online en Vercel** y permitir navegar entre las 3 features core usando datos simulados.

---

## ✅ **1. Alcance del MVP (lo primero que se define)**

### 🔹 **Documentar en README:**

* Nombre del proyecto
* Problema que resuelve (sobrecarga y desorden de emails)
* Objetivo general del sistema
* **3 features core del MVP:**

  1. Importar emails y visualizar lista (con mock data).
  2. Previsualizar un email con detalles completos en modal o página.
  3. Vista Kanban simple con tareas detectadas (mock por ahora).

📌 *Este documento debe estar creado antes de escribir una sola línea de código.*

---

## ✅ **2. Diseño de Mockups (IA + criterio humano)**

Se deben generar **al menos 3 pantallas principales** usando herramientas como v0.dev o Claude con prompts bien construidos.

### 📌 Mockups obligatorios:

| Mockup                      | ¿Qué representa?                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| 1. Lista de Emails          | Página que muestra emails importados (mock), con remitente, asunto, fecha.               |
| 2. Vista Detalle/Modal      | Al hacer clic en un email, se visualiza completo (asunto, cuerpo, etiquetas simulado).   |
| 3. Tablero Kanban (solo UI) | Columnas: Por clasificar – Pendiente – En progreso – Finalizado, con tarjetas simuladas. |

📁 Estos mockups deben quedar **guardados como imágenes y subidos al repo.**

---

## ✅ **3. Setup del Proyecto en Next.js**

**Estructurar el proyecto sin lógica real todavía, pero con base escalable:**

```
/app
  ├─ layout.tsx
  ├─ page.tsx (home o dashboard)
/components
  ├─ ui/ (botones, tarjetas, inputs, modales reutilizables)
  ├─ email/ (EmailCard, EmailList, EmailModal)
/lib
  ├─ mock-data/ (emails falsos en JSON)
  ├─ types/ (interfaces Email, KanbanTask)
/public
  └─ screenshots/ (mockups exportados)
/docs
  └─ ia-prompts.md (prompts usados en IA para diseño y arquitectura)
```

---

## ✅ **4. Implementación de UI con datos Mock**

### 📌 ¿Qué debe verse en la app?

| Pantalla              | Qué debe mostrar                  |
| --------------------- | --------------------------------- |
| `/emails`             | Lista de emails desde mock-data.  |
| `/emails/:id` o modal | Detalle del email simulado.       |
| `/kanban`             | Tablero básico con tarjetas mock. |
| Navbar                | Navegación entre secciones.       |

*La información aún no viene de base de datos ni IA. Todo es simulado.*

---

## ✅ **5. Primer Deploy en Vercel**

* Subir el proyecto a GitHub.
* Conectar con Vercel y desplegar.
* Verificar que las rutas funcionan y que se pueden ver los datos mock.
* Incluir en README la URL del deploy.

---

## ✅ **6. Entregables Oficiales (Semana 1)**

| Entregable           | Descripción                                                                    |
| -------------------- | ------------------------------------------------------------------------------ |
| ✅ README.md          | Nombre del proyecto, problema, 3 features core, stack y objetivo.              |
| ✅ Mockups (3)        | Generados con IA, exportados como imagen y guardados en `/public/screenshots`. |
| ✅ Repositorio GitHub | Estructura del proyecto inicial + datos mock + commit inicial.                 |
| ✅ Deploy en Vercel   | App navegable con UI básica y datos mock.                                      |
| ✅ Prompt log IA      | Archivo `/docs/ia-prompts.md` con prompts usados para Mockups o Arquitectura.  |

---

## ⚠️ **Qué NO se debe hacer en Semana 1**

| No corresponde todavía                 |
| -------------------------------------- |
| Conectar base de datos                 |
| Programar Server Actions o Prisma      |
| Implementar IA para clasificar correos |
| Hacer drag & drop real en Kanban       |
| Autenticación (Google OAuth)           |
| Perdérsela en detalles visuales        |

---

## ✅ **Resumen claro en una frase:**

> **Semana 1 = Tener la app visual funcionando online con mock data + mockups + estructura lista para el backend.**


