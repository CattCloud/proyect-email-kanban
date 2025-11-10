## Protocolo de planificación

Antes de desarrollar cualquier feature o corregir un bug, realiza una planificación explícita. Esta sección define el protocolo operativo que debe seguir el modelo de codificación: incluye principios, reglas, criterios de completitud y una plantilla de trabajo para estructurar hitos y entregables.

### Estructura del protocolo de planificación

#### Principios fundamentales

1.  Desarrollo incremental por hitos: cada semana/feature/fix se divide en hitos independientes pero secuenciales
2.  Entregables concretos: cada hito produce valor tangible y funcional
3.  Independencia funcional: cada hito puede existir de forma autónoma en producción
4.  Progresión secuencial: desarrollo ordenado (Hito 1 → Hito 2 → Hito N)

---

### Reglas del protocolo

#### Regla 1: Cantidad de hitos

-   Mínimo: 3 hitos (para cualquier feature/fix de complejidad media-alta)
-   Máximo: N hitos según complejidad
-   Criterio:
    -   Features simples: 3 hitos
    -   Features medias: 4–5 hitos
    -   Features complejas: 6+ hitos

#### Regla 2: Independencia funcional

-   Cada hito DEBE poder desplegarse a producción de forma independiente
-   Si se completa solo el Hito 1, el sistema debe seguir funcionando correctamente
-   Ningún hito debe romper funcionalidad existente

#### Regla 3: Desarrollo secuencial

-   Los hitos se desarrollan en orden: 1 → 2 → 3 → N
-   No se puede iniciar el Hito 2 sin completar el Hito 1
-   Excepción: tareas de investigación/preparación pueden adelantarse

#### Regla 4: Entregables tangibles

Cada hito debe producir al menos uno de:

-   Funcionalidad visible para el usuario final
-   Componente reutilizable para el sistema
-   Mejora de infraestructura medible
-   Documentación técnica completa

#### Regla 5: Criterios de completitud

Condiciones para que un hito se considere completo:

1.  Todas las tareas están finalizadas (documentación y/o codificación)
2.  Tests pasan correctamente
3.  Code review aprobado
4.  Desplegable a producción sin errores

---

### Anatomía de un hito

Cada hito debe contener:

```
HITO N: [Nombre Descriptivo]
├── Entregables
│   ├── [Entregable funcional 1]
│   └── [Entregable funcional 2]
├── Tareas
│   ├── Documentación previa
│   ├── Backend
│   │   ├── [ ] Schema/Models
│   │   ├── [ ] Smart Actions
│   │   ├── [ ] Services
│   │   └── [ ] etc.
│   ├── Frontend
│   │   ├── [ ] Componentes UI
│   │   ├── [ ] Páginas/Rutas
│   │   ├── [ ] Integraciones
│   │   └── [ ] etc.
│   ├── Testing
│   │   ├── [ ] Unit tests
│   │   └── [ ] Integration tests
│   └── Actualización de documentación
├── Dependencias
│   ├── Internas: [Hitos previos necesarios]
│   └── Externas: [APIs, servicios, etc.]
```

---

### Plantilla de planificación

```markdown
## Feature/Fix: [NOMBRE]

### Información General

**Tipo:** [Feature | Fix | Refactor]

[Párrafo de descripción del Feature/Fix. Explicar el contexto, por qué es necesario, qué problema resuelve o qué mejora aporta al sistema. Incluir cualquier información relevante sobre el alcance y las limitaciones.]

### Objetivo

[Descripción clara y concisa del objetivo del feature/fix. Qué se busca lograr específicamente con este desarrollo.]

### Resultado final esperado

[Párrafo breve con descripción clara del resultado final esperado. Qué funcionalidades estarán disponibles, cómo impactará a los usuarios, qué valor agregará al sistema. Ser específico sobre el estado final del feature/fix.]

### Hitos del Proyecto

Este desarrollo se realizará en **[N] hitos** secuenciales:

**HITO 1: [Nombre del Hito 1]**  
[Párrafo breve describiendo qué se logrará en este hito, qué componentes principales se desarrollarán y qué entregables producirá. Enfocarse en el valor que aporta este hito de forma independiente.]

**HITO 2: [Nombre del Hito 2]**  
[Párrafo breve describiendo qué se logrará en este hito, cómo se construye sobre el Hito 1, qué funcionalidades adicionales se implementarán y qué entregables producirá.]

**[HITO N: [Nombre del Hito N]]** *(si aplica)*  
[Párrafo breve describiendo qué se logrará en este hito adicional.]

## HITO 1: [Nombre Detallado]

### Objetivo del Hito
[Qué se logrará con este hito]

### Entregables
[Descripción detallada y explicativa de cada entregable]
- [ ] Schema de base de datos implementado
- [ ] Migraciones ejecutadas
- [ ] Seeders si son necesarios
- [ ] ...

### Tareas

#### Backend/Frontend/...
- [ ] Diseñar schema Prisma
  - [ ] Definir modelos
  - [ ] Establecer relaciones
  - [ ] Configurar índices
- [ ] Crear migración inicial
- [ ] Implementar seeds de prueba (TEMPORAL)

#### Testing
- [ ] Tests de schema (validaciones)
- [ ] Tests de relaciones

### Dependencias
- **Internas:** 
- **Externas:** MySQL disponible, Canvas API, etc.

### Consideraciones
- **Performance:** Índices en campos frecuentemente consultados
- **Seguridad:** Soft deletes en todas las entidades
- **Migración:** Compatible con datos existentes
```