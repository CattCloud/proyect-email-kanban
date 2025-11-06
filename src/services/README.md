# Services - Integraciones Externas

Este directorio contiene la lógica de comunicación con servicios externos y APIs de terceros. Actúa como capa intermedia entre la aplicación y sistemas externos.

## Estructura

```
/services
├── aiService.ts         # Wrapper de OpenAI
├── parsingService.ts    # Parseo y validación JSON
├── storageService.ts    # Gestión de archivos
└── authService.ts       # Servicios de autenticación
```

## Principios

1. **Encapsulación** - Aíslan la lógica de comunicación externa
2. **Manejo de errores** - Lógica de reintentos y manejo de fallos
3. **Transformación de datos** - Convierten formatos externos a internos
4. **Type-safe** - Tipado completo para APIs externas
5. **Configurabilidad** - Configuración mediante variables de entorno

## Ejemplo de uso

```typescript
// services/aiService.ts
export async function processEmailWithAI(emailBody: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: AI_PROMPT },
      { role: "user", content: `Email: ${emailBody}` }
    ]
  })
  
  return parseAIResponse(response)
}