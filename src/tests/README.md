# Tests - Pruebas del Proyecto

Este directorio contiene todos los archivos de prueba organizados por tipo de test.

## Estructura

```
/tests
├── unit/              # Pruebas unitarias
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── integration/       # Pruebas de integración
│   ├── actions/
│   └── pages/
└── e2e/              # Pruebas end-to-end
    ├── auth/
    ├── emails/
    └── kanban/
```

## Tipos de Pruebas

### Unit Tests
- **Objetivo**: Probar funciones/componentes aislados
- **Framework**: Jest + React Testing Library
- **Velocidad**: Rápidas (ms)
- **Cobertura**: >80% objetivo

### Integration Tests
- **Objetivo**: Probar interacciones entre componentes
- **Framework**: Jest + React Testing Library
- **Velocidad**: Medias (s)
- **Cobertura**: Flujos principales

### E2E Tests
- **Objetivo**: Probar flujos completos de usuario
- **Framework**: Playwright
- **Velocidad**: Lentas (min)
- **Cobertura**: User journeys críticos

## Comandos de Test

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage

# E2E tests
npm run test:e2e