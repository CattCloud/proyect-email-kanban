# 📁 Estructura del Proyecto - Email Management System

Este documento describe la estructura completa de carpetas del proyecto y su organización según las mejores prácticas de Next.js 15 y el patrón Smart Actions.

## 🏗️ Arquitectura General

La aplicación sigue un patrón **Smart Actions** donde la lógica de negocio se ejecuta directamente en el servidor mediante funciones `"use server"`, eliminando la necesidad de endpoints API tradicionales.

```
📦 Proyecto
├── 📂 app/                 # App Router de Next.js (páginas y rutas)
├── 📂 actions/             # Smart Actions (lógica de servidor)
├── 📂 services/            # Integraciones externas y APIs
├── 📂 lib/                 # Configuraciones y utilidades centrales
├── 📂 components/          # Componentes React reutilizables
├── 📂 hooks/               # Custom hooks para lógica de estado
├── 📂 types/               # Tipos TypeScript compartidos
├── 📂 prisma/              # Base de datos y migraciones
├── 📂 public/              # Assets estáticos
├── 📂 tests/               # Pruebas (unit, integration, e2e)
└── 📂 config/              # Configuraciones del proyecto
```

## 🎯 Flujo de Datos

```
Usuario (UI)
    ↓
Componente React
    ↓
Smart Action (use server)
    ↓
Validación (Zod)
    ↓
Service / Base de Datos
    ↓
Respuesta → Actualización UI
```

## 📂 Directorios Principales

### 📂 `src/actions/`
- **Propósito**: Funciones del servidor que implementan la lógica de negocio
- **Responsabilidad**: CRUD, validaciones, gestión de caché
- **Tecnología**: Funciones `"use server"` con TypeScript

### 📂 `src/services/`
- **Propósito**: Comunicación con APIs externas y servicios de terceros
- **Responsabilidad**: OpenAI, parseo JSON, manejo de archivos
- **Tecnología**: Wrappers de APIs, manejo de errores y reintentos

### 📂 `src/lib/`
- **Propósito**: Configuraciones globales y utilidades centrales
- **Responsabilidad**: Prisma Client, NextAuth, validaciones Zod
- **Tecnología**: Configuraciones singleton, esquemas de validación

### 📂 `src/components/`
- **Propósito**: Componentes React reutilizables organizados por dominio
- **Responsabilidad**: UI modular y responsive
- **Tecnología**: React + TypeScript + Tailwind CSS

### 📂 `src/hooks/`
- **Propósito**: Custom hooks para lógica de estado y efectos
- **Responsabilidad**: Separación de lógica de estado de componentes
- **Tecnología**: React hooks + TypeScript

### 📂 `src/types/`
- **Propósito**: Interfaces y tipos TypeScript compartidos
- **Responsabilidad**: Type-safety end-to-end
- **Tecnología**: TypeScript interfaces y types

### 📂 `src/app/`
- **Propósito**: App Router de Next.js 15
- **Responsabilidad**: Páginas, layouts, routing
- **Tecnología**: App Router con Server Components

## 🔧 Configuración de Desarrollo

### Estructura de Rutas
```
app/
├── (auth)/           # Rutas públicas
│   └── login/
├── (protected)/      # Rutas protegidas
│   ├── dashboard/
│   ├── emails/
│   ├── kanban/
│   └── import/
```

### Variables de Entorno
```bash
# .env.local
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
OPENAI_API_KEY="..."
```

## 🚀 Comandos de Desarrollo

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Tests
npm test
npm run test:watch
npm run test:coverage

# Base de datos
npx prisma generate
npx prisma migrate dev
npx prisma studio

# Linting
npm run lint
npm run lint:fix
```

## 📋 Convenciones de Código

### Nomenclatura
- **Archivos**: kebab-case (`email-actions.ts`)
- **Componentes**: PascalCase (`EmailCard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useEmails.ts`)
- **Types**: PascalCase (`Email`, `User`)

### Estructura de Archivos
```typescript
// 1. Imports
import { type } from '@/lib/types'

// 2. Types/Interfaces
interface ComponentProps { ... }

// 3. Constants
const CONSTANT = 'value'

// 4. Main Component/Function
export function Component() { ... }

// 5. Helpers
function helper() { ... }
```

## 🔐 Seguridad

- **Autenticación**: NextAuth con Google OAuth
- **Autorización**: Verificación en cada Smart Action
- **Validación**: Zod schemas para todos los inputs
- **Sanitización**: XSS protection en outputs
- **HTTPS**: Solo en producción

## 🧪 Testing Strategy

1. **Unit Tests**: Componentes y funciones aisladas
2. **Integration Tests**: Smart Actions y servicios
3. **E2E Tests**: User journeys completos
4. **API Tests**: Pruebas de integración externa

## 📊 Performance

- **Server Components**: Reducción del bundle del cliente
- **Streaming**: Carga progresiva de datos
- **Caching**: revalidatePath para invalidación de caché
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: `npm run analyze`