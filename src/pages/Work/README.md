# Sistema de Gestión de Trabajos Agrícolas

## Resumen

Este módulo proporciona un sistema desacoplado y escalable para gestionar diferentes tipos de trabajos agrícolas. Reemplaza el componente monolítico `OrdenAplicacion.tsx` con una arquitectura modular que soporta múltiples tipos de trabajo.

## Arquitectura

### Estructura de Directorios
```
src/pages/Work/
├── WorkManager.tsx              # Componente orquestador principal
├── OrdenAplicacionNew.tsx       # Componente de compatibilidad
├── index.ts                     # Exportaciones principales
├── README.md                    # Esta documentación
├── shared/                      # Lógica y componentes reutilizables
│   ├── hooks/
│   │   └── useWorkData.ts      # Hook principal para gestión de datos
│   ├── components/
│   │   ├── BaseWorkGrid.tsx    # Grid base configurable
│   │   └── BaseWorkForm.tsx    # Formulario base
│   └── types/
│       └── workTypes.ts        # Types y interfaces compartidas
├── aplicacion/                  # Configuración para tipo A (Aplicaciones)
│   └── configs/
│       └── aplicacionConfig.ts # Formularios, validaciones, grid
├── cosecha/                     # Configuración para tipo C (Cosecha)
│   └── configs/
│       └── cosechaConfig.ts    # Formularios, validaciones, grid
└── trabajo/                     # Configuración para tipo T (Trabajo Agrícola)
    └── configs/
        └── trabajoConfig.ts    # Formularios, validaciones, grid
```

### Tipos de Trabajo Soportados

| Tipo | Descripción | Características Específicas |
|------|-------------|------------------------------|
| **A** | Aplicaciones de Productos | EPP, protocolos de lavado, condiciones climáticas, productos químicos |
| **C** | Cosecha | Control de calidad, rendimientos, peso cosechado, grados de calidad |
| **T** | Trabajo Agrícola | Herramientas, equipos, mantenimiento, intensidad de trabajo |

## Uso

### 1. Sistema Completo (Todos los Tipos)
```tsx
import { WorkManager } from '@/pages/Work';

const MyComponent = () => {
  return <WorkManager />;
};
```

### 2. Solo Aplicaciones (Compatibilidad)
```tsx
import { OrdenAplicacionNew } from '@/pages/OrdenAplicacionNew';

const MyComponent = () => {
  return <OrdenAplicacionNew />;
};
```

### 3. Tipo Específico con Selector Oculto
```tsx
import { WorkManager } from '@/pages/Work';

const CosechaComponent = () => {
  return (
    <WorkManager 
      defaultWorkType="C"
      hideTypeSelector={true}
    />
  );
};
```

## Componentes Principales

### WorkManager
Componente orquestador que:
- Maneja la selección del tipo de trabajo
- Renderiza estadísticas y controles
- Orquesta el grid y formularios
- Gestiona el estado global

### BaseWorkGrid
Grid reutilizable que:
- Acepta columnas configurables por tipo
- Maneja acciones CRUD estándar
- Permite acciones personalizadas
- Renderiza estados de trabajo con iconos

### BaseWorkForm
Formulario base que:
- Acepta secciones configurables
- Maneja validación con Zod
- Soporta reglas de campo dinámicas
- Procesa datos maestros automáticamente

### useWorkData Hook
Hook principal que:
- Carga datos maestros filtrados por workType
- Gestiona CRUD operations
- Maneja estado local del componente
- Proporciona funciones de actualización

## Configuraciones por Tipo

Cada tipo de trabajo tiene su propia configuración que incluye:

```typescript
interface WorkTypeConfig {
  workType: WorkType;
  title: string;
  description: string;
  icon: React.ComponentType;
  
  // Configuración de formulario
  formSections: SectionConfig[];
  defaultValues: Record<string, any>;
  validationSchema: ZodSchema;
  
  // Configuración de grid
  gridColumns: Column[];
  
  // Características específicas
  features: {
    requiresProducts?: boolean;
    requiresWeather?: boolean;
    requiresPPE?: boolean;
    // ... más características
  };
}
```

## Extender el Sistema

### Agregar Nuevo Tipo de Trabajo

1. **Crear configuración**:
```typescript
// src/pages/Work/nuevoTipo/configs/nuevoTipoConfig.ts
export const nuevoTipoConfig: WorkTypeConfig = {
  workType: "N",
  title: "Nuevo Tipo",
  formSections: [...],
  gridColumns: [...],
  // ... resto de configuración
};
```

2. **Actualizar tipos**:
```typescript
// Agregar 'N' al tipo WorkType en @eon-lib/eon-mongoose
type WorkType = 'A' | 'C' | 'T' | 'N';
```

3. **Registrar en WorkManager**:
```typescript
const WORK_TYPE_CONFIGS = {
  A: aplicacionConfig,
  C: cosechaConfig,
  T: trabajoConfig,
  N: nuevoTipoConfig,
};
```

### Personalizar Componentes

El sistema permite personalización a través de:

1. **Componentes específicos**:
```typescript
specificComponents: {
  customModals: [CustomModal],
  customSections: [CustomSection],
  customGrids: [CustomGrid],
}
```

2. **Reglas de campo personalizadas**:
```typescript
// Implementar en src/lib/fieldRules/nuevoTipoRules.ts
export const createNuevoTipoRules = (options) => {
  return {
    rules: [
      // Reglas específicas del tipo
    ]
  };
};
```

## Field Rules Engine

El sistema utiliza un motor de reglas declarativo para manejar:

- **Auto-población**: Llenar campos automáticamente
- **Cálculos dinámicos**: Calcular valores basados en otros campos
- **Filtrado**: Filtrar opciones de selects
- **Validación**: Validación reactiva
- **Lookup**: Búsqueda bidireccional entre campos

Ejemplo de regla:
```typescript
{
  trigger: { field: 'barracks' },
  action: {
    type: 'calculate',
    targetField: 'species',
    calculate: (formData, _, externalData) => {
      const cuartel = externalData?.cuartelesOptions?.find(c => c._id === formData.barracks);
      return cuartel?.cropType?.cropTypeName || '';
    }
  }
}
```

## Migración desde OrdenAplicacion.tsx

### Compatibilidad Inmediata
```tsx
// Cambio mínimo - funcionalidad idéntica
- import OrdenAplicacion from '@/pages/OrdenAplicacion';
+ import OrdenAplicacion from '@/pages/OrdenAplicacionNew';
```

### Migración Completa
```tsx
// Acceso a todos los tipos de trabajo
- import OrdenAplicacion from '@/pages/OrdenAplicacion';
+ import { WorkManager } from '@/pages/Work';

- <OrdenAplicacion />
+ <WorkManager />
```

## Performance

### Optimizaciones Implementadas

1. **Carga por tipo**: Solo carga taskTypes del workType específico
2. **useMemo**: Cálculos costosos cacheados
3. **Lazy loading**: Entidades relacionadas cargadas bajo demanda
4. **Renderizado condicional**: UI renderizada solo cuando necesaria

### Métricas Esperadas

- **Tiempo de carga inicial**: Reducido ~30% vs OrdenAplicacion original
- **Memoria**: Reducido ~40% al cargar solo datos relevantes
- **Re-renders**: Minimizados por mejor gestión de estado

## Testing

### Estrategia de Testing

1. **Hooks**: Unit tests para `useWorkData`
2. **Componentes**: Integration tests para componentes base
3. **Configuraciones**: Validation tests para cada tipo
4. **Field Rules**: Logic tests para reglas específicas

### Ejemplo de Test
```typescript
describe('useWorkData', () => {
  it('should filter works by workType', async () => {
    const { result } = renderHook(() => useWorkData('A'));
    await waitFor(() => {
      expect(result.current.state.works).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ workType: 'A' })
        ])
      );
    });
  });
});
```

## Próximos Pasos

### Fase 2: Implementación Avanzada
1. Crear reglas de campo para tipos C y T
2. Implementar componentes específicos (wizards, modales especiales)
3. Añadir funcionalidades avanzadas (mapas, gantt charts)
4. Optimizar performance

### Fase 3: Integración Completa
1. Reemplazar OrdenAplicacion.tsx original
2. Actualizar rutas y navegación
3. Migrar tests existentes
4. Documentar cambios para el equipo

## Soporte

Para preguntas o issues relacionados con este sistema:

1. Revisar esta documentación
2. Consultar ejemplos en los archivos de configuración
3. Revisar el componente WorkManager para patterns de uso
4. Crear issue en el repositorio del proyecto