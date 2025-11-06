# Lib - Utilidades Centrales

Este directorio contiene configuraciones globales, utilidades y dependencias compartidas de la aplicación.

## Estructura

```
/lib
├── prisma.ts            # Cliente Prisma singleton
├── auth.ts              # Configuración NextAuth
├── validators.ts        # Schemas Zod
├── utils.ts             # Funciones utilitarias
└── validations/         # Schemas de validación
    ├── email.ts
    ├── task.ts
    └── ai.ts
```

## Contenido

### Configuraciones
- **prisma.ts**: Instancia singleton de Prisma Client
- **auth.ts**: Configuración de NextAuth con Google OAuth

### Utilidades
- **validators.ts**: Schemas Zod para validación de datos
- **utils.ts**: Funciones helper reutilizables

### Validaciones
Schemas específicos para cada entidad del dominio usando Zod para validación runtime.

## Principios

1. **Singleton** - Una sola instancia de servicios pesados
2. **Type-safety** - Tipado completo con TypeScript
3. **Reutilización** - Funciones compartidas en toda la app
4. **Configuración centralizada** - Una fuente de verdad