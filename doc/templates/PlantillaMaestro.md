# [Nombre del Proyecto]

_Guía completa y fuente de verdad para todo el desarrollo del sistema._

**Última actualización:** [Fecha]  
**Versión del documento:** [vX.Y.Z]  
**Próxima revisión:** [Fecha]

---

## Índice

1. Resumen Ejecutivo y Visión General
2. Stack Tecnológico y Dependencias
3. Arquitectura del Sistema
4. Estructura de Carpetas
5. Base de Datos y Modelado
6. Autenticación y Autorización
7. Servicios y Acciones del Backend
8. Componentes UI y Sistema de Diseño
9. Flujos de Datos y Procesos Clave
10. Integraciones Externas
11. Configuración y Despliegue
12. Seguridad y Rendimiento
13. Patrones y Convenciones de Código
14. Estado Actual y Roadmap
15. Protocolo de Planificación

---

## 1. Resumen Ejecutivo y Visión General

- **Propósito del Proyecto:**  
  [Descripción concisa de qué resuelve el sistema, principales usuarios, contexto.]

---

## 2. Stack Tecnológico y Dependencias

| Tecnología     | Versión    | Rol                        | Justificación / Características |
| -------------- | ---------- | -------------------------- | ------------------------------ |
| [Next.js]      |            | Framework Frontend/Backend |                                |
| [React]        |            | Componentes de UI          |                                |
| [TypeScript]   |            | Tipado Estático            |                                |
| [Prisma]       |            | ORM                        |                                |
| [Tailwind CSS] |            | Estilos Utility-First      |                                |
| ...            |            |                            |                                |

---

## 3. Arquitectura del Sistema

### 3.1 Arquitectura General

- Descripción de capas principales y sus responsabilidades  
- Diagrama (opcional)

### 3.2 Patrones implementados

- [Smart Actions Pattern, SOLID, Server First, etc.]

---

## 4. Estructura de Carpetas del Proyecto

```
/app/              # Rutas y páginas Next.js
/actions/          # Server Actions
/components/       # Componentes React/Design System
/services/         # Servicios de negocio/API
/prisma/           # Esquema y migraciones DB
/config/           # Configuraciones generales
...

```
- Convenciones de nombres y organización.

---

## 5. Base de Datos y Modelado

- **Diagrama de entidades** (opcional)
- Tablas y relaciones clave
- Reglas de integridad y optimización

---

## 6. Autenticación y Autorización

- Proveedores y flujo
- Roles de plataforma y académicos
- Ejemplos de validación y middleware

---

## 7. Servicios y Acciones del Backend

- Descripción del patrón Smart Actions
- Validación, manejo de errores, revalidación
- Ejemplos de actions principales

---

## 8. Componentes UI y Sistema de Diseño

- Principios de diseño (consistencia, accesibilidad, rendimiento)
- Lista de componentes base y especializados
- Tokens y convenciones CSS

---

## 9. Flujos de Datos y Procesos Clave

- Desglose de los procesos principales (autenticación, gestión de cursos, sincronización externas, etc.)

---

## 10. Integraciones Externas

- APIs conectadas (Canvas, Whatsapp, Email, etc.)
- Puntos de sinergia y dependencias

---

## 11. Configuración y Despliegue

- Variables y archivos críticos (ej: .env)
- Scripts deployment y comandos útiles

---

## 12. Seguridad y Rendimiento

- Autenticación, autorización, validación de entradas
- Estrategias de cache, optimización DB, lazy loading

---

## 13. Patrones y Convenciones de Código

- Nomenclatura para archivos, carpetas, componentes, funciones, variables, constantes
- Convenciones de pruebas automáticas
- Estructura base para componentes, services y actions

---

## 14. Estado Actual y Roadmap

| Módulo             | Estado        | % Completado |
| ------------------ | ------------ | ------------ |
| Autenticación      | COMPLETADO    | 100%         |
| Cursos y Secciones | EN PROGRESO   | 90%          |
| ...                |               |              |

- Próximos hitos y mejoras planificadas

---

## 15. Protocolo de Planificación

### 15.1 Principios

- Desarrollo incremental por hitos
- Entregables funcionales y secuenciales

### 15.2 Plantilla de Hito

```
# HITO [NOMBRE]
## Descripción
- [Qué se logrará]

## Entregables
- [Listado detallado]

## Dependencias
- [Internas/Externas]

## Testing
- [Cobertura esperada]
```

---

**Nota:** Este documento es vivo y centraliza todo el conocimiento actualizado del sistema.  
_Todo cambio significativo debe documentarse aquí de inmediato y anunciarse a todo el equipo._

---
