# Hooks - Custom React Hooks

Este directorio contiene hooks personalizados que encapsulan la lógica de estado y efectos de React para diferentes dominios.

## Estructura

```
/hooks
├── useEmails.ts         # Lógica de emails
├── useKanban.ts         # Lógica del Kanban
├── useAuth.ts           # Lógica de autenticación
├── useAI.ts             # Lógica de procesamiento IA
└── useUI.ts             # Estado global de UI
```

## Principios

1. **Separación de lógica** - Lógica de estado separada de componentes
2. **Reutilización** - Lógica compartida entre múltiples componentes
3. **Type-safety** - Tipado completo con TypeScript
4. **Error handling** - Manejo de errores consistente
5. **Loading states** - Estados de carga integrados

## Ejemplo

```typescript
// hooks/useEmails.ts
import { useState, useEffect } from 'react'
import { getEmails } from '@/actions/emailActions'

export function useEmails() {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadEmails()
  }, [])

  async function loadEmails() {
    try {
      setLoading(true)
      const data = await getEmails()
      setEmails(data)
    } catch (err) {
      setError('Error al cargar emails')
    } finally {
      setLoading(false)
    }
  }

  return { emails, loading, error, refetch: loadEmails }
}