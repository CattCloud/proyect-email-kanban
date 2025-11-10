# ✅ **Semana 5 — Pulido, Validación y Preparación para Deploy**

**Objetivo general:**
No se agregan grandes funcionalidades nuevas. En esta semana el propósito es **asegurar que lo que ya existe funciona bien, es seguro, no se rompe y está listo para ser mostrado o desplegado.**

Aquí pasamos de *“ya funciona”* a *“es presentable y estable”*.

---

## 🧩 **¿Qué se hace en esta semana?**

| Área                                 | ¿Qué se hace?                                                            | ¿Para qué sirve?                            |
| ------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------- |
| ✅ Seguridad básica                   | Verificar que solo el usuario autenticado puede ver sus emails y tareas. | Evita ver datos de otras personas.          |
| ✅ Validación de datos                | Validar entrada del JSON, evitar datos corruptos o vacíos.               | Garantiza que el sistema no reviente.       |
| ✅ Manejo de errores (UI/servidor)    | Mostrar mensajes claros si falla IA, si JSON está mal, etc.              | Mejor experiencia de usuario.               |
| ✅ Limpieza visual (UI)               | Mejorar botones, tamaños, espaciados, responsive básico.                 | Que se vea presentable.                     |
| ✅ Pruebas manuales de flujo completo | Simular uso real: Login → Importar → Procesar → Kanban.                  | Asegurar que no se rompe nada.              |
| ✅ Setup para deploy local o Vercel   | Configurar variables de entorno, base de datos, autenticación.           | Para que lo puedas mostrar o usar tú mismo. |

---

## 📌 **Flujo final a probar completo (User Journey final)**

1. **Login con Google**
2. **Importo JSON de emails**
3. **Se muestran en tabla**
4. **Selecciono algunos → “Procesar con IA”**
5. **IA devuelve categoría + prioridad + tarea**
6. **Voy a Kanban → veo solo emails con tarea**
7. **Arrastro tarjetas entre columnas**
8. **Abro modal → veo detalle**
9. **Cierro sesión**
10. ✅ Nada se rompió, todo se guardó

---

## 📁 **¿Qué se revisa/corrige en cada parte del sistema?**

| Carpeta / Archivo | ¿Qué se revisa en esta semana?                                          |
| ----------------- | ----------------------------------------------------------------------- |
| `/app/api/*`      | Que cada endpoint valide datos, maneje errores y verifique sesión.      |
| `/lib/actions/*`  | Que no se usen datos sin validar, agregar try/catch si es necesario.    |
| `/components/*`   | Mejorar UX: que botones tengan estados (loading), evitar layouts rotos. |
| `/styles/*`       | Arreglos visuales básicos: márgenes, responsive móvil-escritorio.       |
| `.env`            | Variables de OpenAI API, Google OAuth, base de datos.                   |
| `README.md`       | Documentar cómo correr el proyecto → instalación, variables, run dev.   |

---

## ⚠️ **Errores típicos que deben resolverse en esta semana**

| Situación                                             | Problema                               | Cómo se corrige                                             |
| ----------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------- |
| Subo JSON vacío o malformado                          | El sistema explota o no muestra error. | Validar con Zod + mensaje “Formato incorrecto”.             |
| Usuario no autenticado entra a `/kanban` directamente | Ve datos sin login                     | Proteger rutas: `if(!session) redirect('/login')`.          |
| IA falla por límite de tokens                         | Pantalla se queda cargando             | Mostrar error controlado.                                   |
| Se rompe el tablero en móvil                          | UI no responsive                       | Ajustes de CSS flex/grid básicos.                           |
| Datos del usuario A visibles al usuario B             | Falla de seguridad crítica             | Filtrar cada consulta por `where userId = session.user.id`. |

---

## ✅ **Resultado esperado al final de la Semana 5**

✔ Todo el flujo funciona de inicio a fin, sin errores graves.
✔ Datos seguros y aislados por usuario.
✔ Errores controlados y mensajes claros.
✔ UI limpia, sin ser perfecta, pero usable.
✔ Proyecto listo para demo o deploy inicial (ej. Vercel + Supabase/PlanetScale).
✔ README o documentación sencilla para ejecutarlo.

---

## 📌 **¿Pasamos a ver qué sigue después del MVP?**

Opciones después de Semana 5:

* 🔹 Semana 6+ (opcional): integrarse a Gmail API (automatización real).
* 🔹 Agregar notificaciones, multiusuario, workspaces.
* 🔹 Mejorar IA (resumir correos, detectar fechas y deadlines).
* 🔹 Unit tests y CI/CD profesional.

