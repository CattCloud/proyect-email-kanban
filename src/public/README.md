# Public - Assets Estáticos

Este directorio contiene todos los recursos estáticos de la aplicación (imágenes, iconos, datos, etc.) que se sirven directamente desde el servidor.

## Estructura

```
/public
├── images/          # Imágenes de la aplicación
│   ├── logo.png
│   ├── hero-bg.jpg
│   └── placeholders/
├── icons/           # Iconos SVG personalizados
│   ├── app-icon.svg
│   └── favicon.ico
├── data/            # Datos estáticos y JSON
│   ├── sample-emails.json
│   └── default-config.json
└── robots.txt       # SEO y crawlers
```

## Convenciones

### Imágenes
- **Optimizadas**: Usar formatos modernos (WebP, AVIF)
- **Responsivas**: Múltiples tamaños para diferentes dispositivos
- **Accesibles**: Alt text descriptivo
- **Nomenclatura**: kebab-case (ej: `user-avatar.png`)

### Iconos
- **SVG**: Preferir SVG para escalabilidad
- **Consistencia**: Usar un set de iconos uniforme
- **Tamaños**: Múltiples tamaños (16px, 24px, 32px)

### Datos
- **JSON**: Archivos de configuración o datos de ejemplo
- **Versionados**: Incluir versión en nombres si hay múltiples
- **Validados**: Verificar estructura JSON

## Ejemplo de uso

```typescript
// En componentes
import logo from '@/public/images/logo.png'
// Se resuelve como: /images/logo.png

// En CSS
.hero-bg {
  background-image: url('/images/hero-bg.jpg');
}