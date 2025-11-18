# ✅ Semana 5 — Autenticación con Google y Correos por Usuario

**Objetivo general:**  
Transformar la plataforma en un espacio totalmente personalizado y seguro para cada ejecutivo, asegurando que el acceso y visualización de información sea exclusivo y automatizado vía autenticación con Google y correspondencia uno a uno entre usuarios y sus emails.

En esta etapa el sistema dará un salto: dejará de ser una bandeja común para convertirse en una experiencia individualizada, donde cada quien ve solo su información, y podrá, además, conectar su cuenta de Gmail para traer sus propios correos directo al sistema.

***

## 🧩 ¿Qué tareas principales se trabajan?

| Bloque                                 | ¿Qué se hace?                                                                                  | ¿Por qué es importante?                                                        |
| --------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1. Autenticación con Google (OAuth2)    | Se implementa login usando la cuenta Google de cada usuario (Gmail o Workspace).               | Brinda acceso seguro, elimina contraseñas, simplifica onboarding y soporte IT. |
| 2. Asociación de datos por usuario      | Cada email importado y cada tarea analizada queda asociada al usuario autenticado.             | Garantiza privacidad y relevancia: cada quien ve solo sus propios pendietes.   |
| 3. Bandeja de emails por usuario        | El sistema permite traer los correos de cada usuario usando permisos de Google (Gmail API).    | Automatiza la importación, elimina cargas manuales, y asegura actualización.   |

***

## 🖥️ Cómo se ve la experiencia final para el usuario

1. El usuario ingresa al sistema y elige “Iniciar sesión con Google”.
2. Autoriza, de ser necesario, acceso seguro a su cuenta Gmail vía Google.
3. Tras autenticarse, toda la aplicación (tablero, emails, actividades, Kanban) muestra exclusivamente la información correspondiente a su usuario.
4. Puede otorgar permisos para conectar su bandeja de entrada y así importar automáticamente sus mensajes recientes de Gmail.
5. Todos los flujos y vistas filtran emails y tareas por el usuario logueado, respetando privacidad y evitando errores de mezcla de información.
6. Al cerrar sesión o cambiar de usuario, toda la app se refresca y actualiza a los datos del nuevo usuario autenticado.

***

## 📌 ¿Qué mejora esta semana respecto al estado actual?

- De plataforma anónima o genérica a plataforma con identidad: cada ejecutivo es dueño de su información.
- De carga manual a importación automática: elimina fricciones, errores humanos y falta de actualización.
- De posible cruce de información a privacidad sólida: ningún usuario puede ver ni modificar los correos, tareas o tableros de otro.
- Incrementa la seguridad y la trazabilidad operativa, facilitando cumplimiento y gobierno de datos.
- Facilita la integración futura con otras herramientas del ecosistema Google (Calendario, Drive, etc.).

***

## ⚠️ Riesgos o retos de la semana

| Problema potencial           | ¿Qué podría pasar?                                                      | Enfoque de solución                                                  |
| --------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Problemas de permisos OAuth | Un usuario puede rechazar (o no entender) los permisos requeridos.      | Mensajes claros y UX de consentimiento educativo, proceso escalonado.|
| Validación en ambientes de prueba | Límites de usuarios en apps no verificadas de Google.           | Testear primero con usuarios internos, luego solicitar verificación. |
| Confusión por acceso múltiple| Si un usuario tiene varios correos Google puede no saber cuál usó.      | Confirmar email activo en la interfaz y dar opción para cambiar.     |
| Desincronización tras logout | Caché de datos visibles tras cerrar sesión, potencial riesgo de sesión. | Forzar borrado de sesión y refresco de datos/UI al cerrar sesión.    |

***

## ✅ Resultado esperado al final de la semana

- Usuarios pueden ingresar con su cuenta Google, de manera fácil y segura.
- Cada correo y cada tarea está correctamente ligada a un usuario autenticado.
- Solo se muestran emails, tareas y flujos que corresponden al usuario actual.
- Si el usuario da permiso, su bandeja de entrada de Gmail se sincroniza automáticamente con la plataforma.
- Privacidad, seguridad y personalización del sistema llevadas a nivel profesional, listas para escalar en equipos o empresas.

***

**En resumen:**  
Esta integración convierte la plataforma en una herramienta personalizada, segura y preparada para automatizar flujos de información, donde cada ejecutivo tiene bajo control y en un solo lugar todo lo que realmente le corresponde revisar, priorizar y ejecutar.

