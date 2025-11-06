# App - Páginas y Rutas (Next.js App Router)

Este directorio contiene las páginas, layouts y rutas de la aplicación usando Next.js 15 App Router.

## Estructura

```
/app
├── (auth)/              # Rutas públicas
│   └── login/           # Página de login
│       └── page.tsx
├── (protected)/         # Rutas protegidas
│   ├── dashboard/       # Dashboard principal
│   │   └── page.tsx
│   ├── emails/          # Gestión de emails
│   │   ├── page.tsx     # Lista de emails
│   │   └── [id]/        # Detalle de email
│   │       └── page.tsx
│   ├── kanban/          # Tablero Kanban
│   │   └── page.tsx
│   └── import/          # Importación JSON
│       └── page.tsx
├── globals.css          # Estilos globales
├── layout.tsx           # Layout raíz
└── page.tsx             # Página de inicio
```

## Convenciones

### Layouts
- **layout.tsx**: Layout que envuelve las páginas del grupo
- **Providers**: Context providers y configuraciones globales

### Páginas
- **page.tsx**: Componente principal de la página
- **loading.tsx**: Estado de carga
- **error.tsx**: Manejo de errores
- **not-found.tsx**: Página 404 personalizada

### Grupos de Rutas
- **(auth)**: Rutas públicas (login, registro)
- **(protected)**: Rutas que requieren autenticación

## Ejemplo de página

```tsx
// app/(protected)/emails/page.tsx
import { auth } from '@/lib/auth'
import { EmailTable } from '@/components/emails/EmailTable'

export default async function EmailsPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div>
      <h1>Gestión de Emails</h1>
      <EmailTable />
    </div>
  )
}