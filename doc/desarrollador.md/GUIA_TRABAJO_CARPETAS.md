# 📚 **Guía de Flujo de Trabajo y Arquitectura de Carpetas (General para Sistemas Web Modernos)**

---

## ✅ **1. Flujo de Trabajo General del Sistema**

Este flujo describe cómo viaja la información desde el usuario hasta la base de datos o un servicio externo y regresa con una respuesta.

```
Usuario (UI)  
   ↓  
Componente / Página del Frontend  
   ↓  
Acción del Servidor (actions/)  
   ↓  
Validación de datos (Zod u otra librería)  
   ↓  
Servicio (services/) o Base de Datos  
   ↓  
Respuesta a la Acción  
   ↓  
Actualización de interfaz / Caché / Navegación  
```

### 📌 **Descripción del flujo paso a paso**

| Paso                                                | Descripción                                                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **1. Interacción del usuario**                      | El usuario envía un formulario, hace clic en un botón o realiza una acción en la interfaz.                                           |
| **2. Componente llama una acción**                  | El frontend no hace directamente una llamada HTTP, sino que invoca una función del lado del servidor dentro de `actions/`.           |
| **3. Validación de datos**                          | La acción valida los datos recibidos (por ejemplo, con schemas de Zod o Joi).                                                        |
| **4. Ejecución de lógica de negocio**               | La acción ejecuta reglas del negocio y decide si consulta la base de datos o usa un servicio en `services/`.                         |
| **5. Llamada a servicios externos / base de datos** | Los servicios encapsulan lógica para interactuar con APIs externas, SDKs, Canvas, PayPal, etc.                                       |
| **6. Retorno de datos + actualización de UI**       | La acción devuelve una respuesta, actualiza la interfaz o invalida caché si es necesario (`revalidatePath`, `router.refresh`, etc.). |

---

## ✅ **2. Estructura de Carpetas Recomendada**

```
/src
├── actions/              # Acciones del servidor (lógica de negocio + validaciones)
│   ├── users/
│   │   ├── createUser.action.ts
│   │   ├── updateUser.action.ts
│   │   └── deleteUser.action.ts
│   └── courses/
│       ├── syncCourses.action.ts
│       └── enrollUser.action.ts
│
├── services/             # Interacción con APIs externas o microservicios
│   ├── canvasService.ts
│   ├── paymentService.ts
│   └── authService.ts
│
├── lib/                  # Utilidades, helpers y configuración global
│   ├── prisma.ts         # Conexión a base de datos
│   ├── validations/      # Esquemas de validación
│   └── utils.ts          # Funciones reutilizables
│
├── components/           # Componentes reutilizables del frontend
├── app/                  # Páginas, rutas y UI
│
├── types/                # Tipos TypeScript compartidos (DTOs, Interfaces)
└── middleware/           # Autenticación, permisos, logging
```



---

## ✅ **3. Responsabilidades de Cada Carpeta**

| Carpeta         | Rol dentro del sistema                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **actions/**    | Contiene funciones que se ejecutan en el servidor. Reemplazan endpoints tradicionales. Incluyen lógica de negocio, validaciones, permisos y conexión con servicios. |
| **services/**   | Encapsula llamadas a APIs externas, servicios de terceros o lógica compleja reutilizable (Canvas LMS, pasarelas de pago, correos, etc.).                            |
| **lib/**        | Contiene utilidades generales del sistema: conexión a base de datos, validaciones, manejadores de errores, configuraciones globales.                                |
| **components/** | Elementos visuales reutilizables del frontend como botones, formularios, tablas, modales.                                                                           |
| **app/**        | Define rutas, páginas y el flujo visual del usuario. Puede incluir `page.tsx`, `layout.tsx`, loaders o data fetching.                                               |
| **types/**      | Interfaces, tipos, estructuras de datos compartidas entre frontend, backend y servicios.                                                                            |
| **middleware/** | Intercepta peticiones para verificar autenticación, roles, logs o restricciones antes de cargar páginas o ejecutar acciones.                                        |


## Propósito de la carpeta `actions/` 

La carpeta `actions/` es un componente fundamental de la arquitectura del proyecto que implementa el **patrón "Smart Actions"** de Next.js 15. Su propósito principal es:

### 🎯 **Función Principal**
Actuar como una capa intermedia entre los componentes de la interfaz de usuario y la lógica de negocio del servidor, permitiendo ejecutar código del servidor directamente desde el cliente sin necesidad de crear endpoints API tradicionales.

### 📋 **Responsabilidades Específicas**

1. **Ejecución de Lógica del Servidor**
   - Todas las funciones en `actions/` se marcan con `"use server"` al inicio
   - Esto permite que se ejecuten en el servidor cuando son llamadas desde componentes del cliente
   - Evitan el overhead de las llamadas HTTP tradicionales

2. **Validación de Datos**
   - Implementan validación type-safe utilizando Zod schemas
   - Garantizan que los datos recibidos del cliente sean correctos antes de procesarlos
   - Proporcionan mensajes de error claros cuando la validación falla

3. **Manejo de Base de Datos**
   - Realizan operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en la base de datos
   - Utilizan Prisma ORM para consultas type-safe
   - Implementan lógica de negocio compleja cuando es necesario

4. **Gestión de Cache**
   - Utilizan `revalidatePath()` para invalidar caché de Next.js automáticamente
   - Aseguran que la UI se actualice con los datos más recientes después de las operaciones

5. **Control de Permisos**
   - Validan que los usuarios tengan los permisos necesarios para realizar operaciones
   - Implementan la lógica de autorización de forma centralizada



### 💡 **Ejemplo Práctico**

Un archivo en la carpeta `actions/` podria verse asi:

```typescript
"use server";  // ← Marca que indica que se ejecuta en el servidor

import { ucwords } from '@/lib/utils';
import { createPerson, getUserByEmail, listPeopleByTerm, getUserById, getUserSectionHistory } from "@/services/userService";

// Función para agregar una persona
const addPerson = async (data: CreatePerson): Promise<boolean> => {
  // Normalización de datos
  const first_name = data.first_name.toLowerCase();
  const last_name = data.last_name.toLowerCase();
  const email = data.email.toLowerCase();
  
  // Llamada al servicio de base de datos
  const addedUser = await createPerson({ ...data, first_name, last_name, email });
  
  // Retorno simple
  return !!addedUser;
};

// Función de autocompletado para búsqueda de personas
const searchPeopleAutocomplete = async (term: string = ""): Promise<PeopleAutocompleteData[] | null> => {
  if (term === "") return null;
  const fixedTerm = term.toLocaleLowerCase().trim();
  const list = await listPeopleByTerm(fixedTerm);
  
  // Transformación de datos para el componente de autocompletado
  return list.slice(0, 20).map((user) => ({
    value: user.id.toString(),
    label: `${ucwords(user.first_name)} ${ucwords(user.last_name)}`
  }));
};
```
### 🔄 **Flujo de Trabajo**

1. Un componente del cliente llama a una función de `actions/`
2. Next.js serializa los parámetros y los envía al servidor
3. La función se ejecuta en el servidor con acceso completo a la base de datos
4. El resultado se serializa y se devuelve al cliente
5. El componente actualiza su estado con el resultado


## Propósito de la carpeta `services/` 


La carpeta `services/` es una capa fundamental de la arquitectura del sistema que actúa como **intermediario entre la lógica de negocio y las fuentes de datos externas**. Su propósito principal es:

### 🎯 **Función Principal**
Encapsular y centralizar toda la lógica de comunicación con sistemas externos y APIs, proporcionando una interfaz unificada para que las Smart Actions y otros componentes del sistema puedan interactuar con servicios externos de manera consistente.

### 📋 **Responsabilidades Específicas**

1. **Comunicación con APIs Externas**
   - Realizar llamadas HTTP a servicios externos (Canvas LMS, WhatsApp, etc.)
   - Manejar autenticación con APIs externas
   - Procesar respuestas y errores de manera centralizada

2. **Abstracción de Lógica de Negocio**
   - Encapsular lógica compleja de integración
   - Proporcionar interfaces simples para operaciones complejas
   - Separar la lógica de comunicación de la lógica del negocio principal

3. **Transformación de Datos**
   - Convertir datos de APIs externas al formato interno del sistema
   - Normalizar estructuras de datos diferentes
   - Implementar mapeos entre modelos externos e internos

4. **Manejo de Errores y Reintentos**
   - Implementar lógica de reintentos automáticos
   - Manejar códigos de error específicos de cada API
   - Proporcionar mensajes de error consistentes


### 💡 **Ejemplo Práctico**

Un archivo en la carpeta `services/` podria verse asi:

```typescript
"use server";  // ← Se ejecuta en el servidor

import { getCanvasInfo } from "./canvasService";

// Interfaces TypeScript para type safety
export interface CanvasAssignmentStats {
  totalAssignments: number;
  completedAssignments: number;
  pendingAssignments: number;
  pastDueAssignments: number;
  averageScore: number;
  // ... otros campos
}

// Función principal que obtiene estadísticas de Canvas
export async function getCanvasAssignmentStats(sectionId: number): Promise<CanvasAssignmentStats | null> {
  try {
    // 1. Obtener vinculación local con Canvas
    const canvasLink = await getCanvasInfo(sectionId);
    if (!canvasLink) {
      return null;
    }
    
    // 2. Configurar autenticación con API externa
    const courseId = canvasLink.course_id;
    const apiUrl = process.env.CANVAS_API_URL;
    const apiKey = process.env.CANVAS_API_KEY;
    
    // 3. Realizar llamadas a API externa
    const assignmentsResponse = await fetch(`${apiUrl}/courses/${courseId}/assignments?include[]=submission`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      }
    });
    
    // 4. Procesar y transformar datos
    const assignmentsData = await assignmentsResponse.json();
    
    // 5. Calcular estadísticas y retornar en formato interno
    return {
      totalAssignments: assignmentsData.length,
      completedAssignments: totalComplete,
      pendingAssignments: totalPending,
      // ... otros cálculos
    };
  } catch (error) {
    console.error("Error al obtener estadísticas de tareas:", error);
    return null;
  }
}
```
### 🔄 **Flujo de Trabajo**

1. Una Smart Action necesita datos de un sistema externo
2. Llama a la función correspondiente en `services/`
3. El servicio maneja la comunicación con la API externa
4. El servicio transforma los datos al formato interno
5. El servicio retorna los datos procesados a la Smart Action
6. La Smart Action continúa con su lógica de negocio
---

## ✅ **4. Buenas Prácticas en Este Patrón**

✔ **Mantener lógica separada del UI** → Nada de lógica de base de datos dentro de componentes.

✔ **Toda llamada crítica parte de `actions/`** → Evita exponer rutas API innecesarias.

✔ **Los `services/` no conocen la UI** → Solo ejecutan tareas técnicas (fetch, axios, SDKs).

✔ **Validaciones centralizadas** → Usar esquemas para evitar duplicar reglas.

✔ **Código predecible y escalable** → Ideal para equipos grandes y proyectos de largo plazo.

---
