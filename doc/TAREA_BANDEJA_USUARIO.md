## 🔄 Flujo de trabajo: Desde autenticación hasta visualización básica de correos 
***

### 1. **Autenticación segura con Google**

- El usuario accede a la plataforma e inicia sesión con su cuenta Google (Gmail o Workspace); Google gestiona toda la autenticación y permisos.
- Durante el primer acceso, la plataforma solicita permiso explícito para **leer los correos** del usuario, usando un flujo seguro y transparente con pantalla de consentimiento Google.
- En el login OAuth2, la app solicita el **scope**:  
  `https://www.googleapis.com/auth/gmail.readonly`  
  Esto es indispensable para que la app tenga acceso de solo lectura sobre la bandeja de entrada.

***

### 2. **Obtención del access_token**

- Tras autenticación y aceptación de permisos, el sistema recibe un `access_token` válido, que permite conectarse a la API de Gmail en nombre del usuario autenticado.

***

### 3. **Importación de correos recientes**

- Una vez autorizado, la plataforma realiza una conexión segura con la API de Gmail y **trae automáticamente los correos recibidos en los últimos 7 días** desde la bandeja principal (Inbox) del usuario.
- Durante la importación, la UI muestra un mensaje claro (“Cargando tus correos recientes de los últimos 7 días…”), para que el usuario sepa exactamente qué se está procesando.
- Terminado este proceso, el sistema muestra al usuario un resumen de cuántos correos se han importado y cuándo se realizó la última actualización.
MAS DETALLADO:
- Usando la librería oficial `googleapis` y el `access_token`, la plataforma realiza una conexión segura con la API de Gmail.
- Se consulta la bandeja principal del usuario con la petición:  
   `GET https://www.googleapis.com/gmail/v1/users/me/messages?q=in:inbox newer_than:7d`  
   Esto retorna una **lista de IDs de los mensajes** recibidos en los últimos 7 días.
- Para cada ID, el sistema solicita el detalle completo del mensaje:  
   `GET https://www.googleapis.com/gmail/v1/users/me/messages/{messageId}`
- De cada mensaje, se extraen y dejan listos que requieren la tabla EMAILS de la BD:
    - Remitente (From)
    - Asunto (Subject)
    - Fecha de recepción
    - ID único (para control de duplicidad)
    - etc
***

### 4. **Limpieza y validación de datos importados**

- Cada mensaje se **transforma y valida internamente (“data cleaning”)** antes de ser almacenado:
    - Se verifica que todos los datos mínimos requeridos estén presentes y bien formateados.
    - Se eliminan entradas vacías, duplicadas o con caracteres inválidos.
    - Se valida la forma/estructura usando una herramienta como Zod, asegurando integridad y coherencia.
    - Mensajes que no cumplen requisitos se descartan.

***

### 5. **Almacenamiento seguro en la tabla de emails**

- Todos los correos validados se guardan en la **tabla de emails** de la base de datos, **siempre asociados al usuario autenticado** que los importó.
- Cada usuario ve y acciona solo sus propios correos. No hay mezcla entre diferentes cuentas.

***

### 6. **Visualización simple y efectiva en la UI**

- En la pantalla principal, el usuario tiene acceso a una **lista tipo tabla** con sus correos importados de los últimos 7 días.
- Cada entrada muestra remitente, asunto, fragmento del cuerpo y fecha de recepción.
- Puede buscar, filtrar o navegar sobre estos correos desde la interfaz básica.

***

### 7. **Gestión de privacidad y actualizaciones**

- Si el usuario revoca permisos de Google, la app deja de importar nuevos mensajes y notifica visualmente en la interfaz.
- Al iniciar nueva sesión, **solo se traen los nuevos correos** desde la última importación, sin agregar duplicados.

***

-La plataforma actualiza la información cada nuevo inicio de sesión: solo importa los correos nuevos recibidos desde la última vez, nunca duplicados.
La experiencia está acompañada por mensajes claros:

“No tienes nuevos correos en los últimos días.”

“Todos tus correos importados y analizados están listos, revisa tus tareas.”

“Actualizando tu bandeja de entrada, por favor espera unos segundos…”

“Debes reconectar tu cuenta Google para seguir actualizando tus correos.”


-La plataforma actualiza la información cada nuevo inicio de sesión: solo importa los correos nuevos recibidos desde la última vez, nunca duplicados.