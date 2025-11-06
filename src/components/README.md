# Components - Componentes UI

Este directorio contiene todos los componentes reutilizables del frontend, organizados por dominio funcional.

## Estructura

```
/components
├── ui/                  # Componentes base de shadcn/ui
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── ...
├── emails/              # Componentes específicos de emails
│   ├── EmailTable.tsx
│   ├── EmailCard.tsx
│   └── EmailModal.tsx
├── kanban/              # Componentes del tablero Kanban
│   ├── KanbanBoard.tsx
│   ├── KanbanColumn.tsx
│   └── KanbanCard.tsx
└── shared/              # Componentes reutilizables generales
    ├── Layout.tsx
    ├── Header.tsx
    └── Sidebar.tsx
```

## Principios

1. **Componentes funcionales** - Uso de React hooks y TypeScript
2. **Props tipadas** - Interface completa para cada componente
3. **Reutilización** - Componentes genéricos y específicos
4. **Responsive design** - Adaptación automática a dispositivos
5. **Accesibilidad** - Soporte para a11y (ARIA labels, keyboard navigation)

## Ejemplo

```tsx
// components/emails/EmailCard.tsx
interface EmailCardProps {
  email: Email
  onSelect?: (email: Email) => void
  className?: string
}

export function EmailCard({ email, onSelect, className }: EmailCardProps) {
  return (
    <div className={cn("email-card", className)}>
      <h3>{email.subject}</h3>
      <p>{email.from}</p>
    </div>
  )
}