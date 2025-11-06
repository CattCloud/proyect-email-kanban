---

# ✅ **📆 Semana 2 — ¿Qué significa realmente esta fase?**

En esta semana, tu proyecto **deja de ser solo visual** y **empieza a tener vida real**.

👉 El objetivo principal es:
**Conectar la primera funcionalidad real a una base de datos, con datos que se guarden de verdad (no mocks).**

---

## 🎯 **¿Cuál es el objetivo de esta semana?**

| Objetivo                               | Explicado en lenguaje humano                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------- |
| Crear el backend básico                | Tu app debe conectarse a una base de datos real.                                   |
| Implementar la primera “feature real”  | Una funcionalidad debe funcionar de verdad: guardar, leer o procesar datos reales. |
| Seguir usando Next.js + Prisma         | Comenzar a usar Prisma como ORM para conectarte a PostgreSQL.                      |
| Mantener lo que ya hiciste en Semana 1 | No se elimina, solo se le agrega lógica verdadera.                                 |

---

## 🔧 **¿Qué tareas específicas debes realizar?**

| Tarea                                               | ¿Qué te están pidiendo realmente?                                                            |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| ✅ Configurar base de datos                          | Crear una base de datos en Neon/PostgreSQL o local.                                          |
| ✅ Instalar Prisma                                   | Configurar prisma, crear el archivo `schema.prisma`, definir tu primer modelo (ej: `Email`). |
| ✅ Hacer migraciones                                 | Esto crea las tablas en la base de datos real (por ejemplo `prisma migrate dev`).            |
| ✅ Conectar el frontend a estos datos reales         | Ya no se leen emails desde un JSON falso, sino desde la base de datos.                       |
| ✅ Implementar **la primera feature completa**       | Puede ser: importar emails desde JSON → guardarlos en DB y mostrarlos.                       |
| ✅ Usar Server Actions o API Routes                  | Para ejecutar código en el servidor y guardar datos.                                         |
| ✅ Subir todo a GitHub + Vercel (con base conectada) | Tu app ya debe funcionar con base de datos en producción.                                    |

---

## ⚙️ **¿Cuál debería ser esa primera feature real? (lo típico para este proyecto)**

La más lógica y sencilla sería:

### **Feature 1 real: Importar emails y guardarlos en base de datos**

| Paso | ¿Qué hace el sistema?                                                |
| ---- | -------------------------------------------------------------------- |
| 1    | Usuario sube archivo JSON con emails (como en Semana 1).             |
| 2    | Una server action procesa ese JSON.                                  |
| 3    | Los emails se guardan en la base de datos (por usuario autenticado). |
| 4    | La UI muestra los emails desde la base de datos, no desde mock data. |

Esta feature **no tiene IA todavía**, solo almacenamiento real de correos.

---

## 📁 **Estructura que empieza a tener backend real (ya no solo frontend):**

```
/src
├── app/
│   ├── emails/page.tsx        # Mostrar emails desde DB
│   └── (otras pantallas)
│
├── actions/                   # Server Actions reales
│   └── emails/
│       ├── importEmails.action.ts   # Guarda emails en la DB
│
├── lib/
│   ├── prisma.ts              # Conexión a la base de datos
│   └── validations/           # Validar JSON antes de guardar
│
├── prisma/
│   ├── schema.prisma          # Modelos de la base de datos
│
├── types/                     # Tipos globales de Email, User, etc.
└── .env                       # Variables como DATABASE_URL
```

---

## ❌ **¿Qué NO te obligan a hacer aún en Semana 2?**

| No es obligatorio todavía    |
| ---------------------------- |
| IA para detectar tareas      |
| Tablero Kanban completo      |
| Drag & Drop funcionando      |
| Roles, permisos avanzados    |
| Notificaciones o automations |

---

## ✅ **Resumen en una frase:**

> **“Semana 2 es cuando tu app pasa de ser una maqueta a tener su primera función real usando base de datos.”**

---
