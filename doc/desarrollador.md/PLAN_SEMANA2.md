
# ✅ **📆 Semana 2 — Feature 1 con Base de Datos Real**

**Objetivo general:**
Pasar de un sistema visual con datos ficticios (Semana 1) a un sistema funcional real que **guarde y lea datos desde una base de datos en la nube (PostgreSQL + Prisma + Neon)**.

---

## 🎯 **¿Qué se debe lograr al finalizar esta semana?**

Tu sistema debe:

✔ Tener una base de datos real conectada.
✔ Permitir **crear, leer, actualizar y eliminar (CRUD)** registros del Feature 1.
✔ Mostrar esos datos en el frontend (ya no desde un JSON falso).
✔ Estar desplegado en **Vercel y conectado a Neon**.
✔ Tener un commit claro:
`feat: Feature 1 with real database`.

---

## 🧱 **¿Qué es exactamente el Feature 1 en tu sistema?**

Depende de cómo tú lo definas, pero en tu proyecto Email-to-Kanban normalmente es:

> **Feature 1 = Importar y mostrar emails almacenados en la base de datos.**

Esto implica:
✅ Modelo Email en base de datos → con campos como id, remitente, asunto, cuerpo, fecha.
✅ API para guardar y leer emails.
✅ Frontend que los muestra desde esta API, no desde mocks.

---

## 🛠️ **Bloques de trabajo de la Semana 2 (explicado como profesor):**

### **1. Diseñar la base de datos (Schema de Prisma)**

Antes de escribir código, debes decidir cómo será la estructura de tus datos.
Por ejemplo, el modelo `Email` podría tener:

| Campo     | Tipo          | Descripción          |
| --------- | ------------- | -------------------- |
| id        | String (cuid) | Identificador único  |
| from      | String        | Remitente            |
| subject   | String        | Asunto               |
| body      | String        | Contenido del correo |
| createdAt | DateTime      | Fecha de creación    |

Este diseño se escribe en el archivo `prisma/schema.prisma`.

📌 *Esto se llama “schema-first”: primero diseño de datos, después código.*

---

### **2. Conectar Prisma + Base de Datos en Neon**

Pasos simples:

1. Crear cuenta en **neon.tech** (base de datos PostgreSQL en la nube).
2. Crear una base de datos.
3. Copiar la cadena de conexión → ponerla en `.env` como `DATABASE_URL=...`.
4. Ejecutar:

```
npx prisma migrate dev
```

Esto **crea físicamente las tablas en Neon**.

---

### **3. Crear API Routes (backend)**

Ahora necesitas que el frontend pueda **hablar con la base de datos a través de HTTP**.

Estructura típica:

```
app/api/emails/
  route.ts       → GET todos los emails, POST nuevo email
  [id]/route.ts  → GET uno, PATCH update, DELETE eliminar
```

Ejemplo de ruta GET:

```ts
export async function GET() {
  const data = await prisma.email.findMany();
  return NextResponse.json(data);
}
```

📌 Estas funciones son **Serverless API Routes de Next.js**.

---

### **4. Conectar Frontend con Backend**

Ahora que ya tienes tu API, en el frontend reemplazas los datos mock por llamadas reales:

✅ Antes → `emails = mockData`
✅ Ahora → `const emails = await fetch('/api/emails')`

Debes manejar:
✔ Loading (cargando datos)
✔ Error (si falla la API)
✔ Estado actualizado automáticamente al crear o eliminar un email

---

### **5. Deploy real en Vercel con DB conectada**

Último paso:

1. Subir cambios a GitHub.
2. Vercel detecta y despliega automáticamente.
3. En Vercel > Settings > Env Variables → pegar `DATABASE_URL`.
4. Verificar que los datos que creas en producción realmente se guardan en Neon.

---

## ✅ **Checklist final de Semana 2**

✔ Modelo de base de datos creado en Prisma
✔ Migraciones ejecutadas en Neon
✔ Rutas API funcionando (GET, POST, PATCH, DELETE)
✔ Frontend consumiendo datos reales
✔ App funcionando en Vercel + DB real
✔ Commit: `"feat: Feature 1 with real database"`

---

## 🧠 **¿Qué NO se hace todavía?**

⛔ IA que analiza correos
⛔ Kanban inteligente
⛔ Autenticación Google
⛔ Drag and drop
⛔ Seguridad avanzada

---

## ✅ **Resumen en una frase:**

> Semana 2 convierte tu sistema de una “maqueta con datos falsos” a una **aplicación funcional real con base de datos y API conectada**.

---
