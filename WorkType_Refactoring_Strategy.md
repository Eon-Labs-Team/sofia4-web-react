# Estrategia de Refactoring: Desacoplamiento de WorkTypes

## Análisis del Problema Actual

### Estado Actual
- **OrdenAplicacion.tsx** está fuertemente acoplado al tipo `WorkType: 'A'`
- El componente tiene lógica específica para aplicación de productos
- Se necesita agregar soporte para tipos 'C' (Cosecha) y 'T' (Trabajo Agrícola)

### Tipos de Trabajo Identificados
```typescript
type WorkType = 'A' | 'C' | 'T';
// A = APLICACION DE PRODUCTOS (actual)
// C = COSECHA 
// T = TRABAJO AGRICOLA
```

## Estrategias de Refactoring

### **Opción 1: Component Factory Pattern (Recomendada)**

#### Estructura Propuesta
```
src/pages/Work/
├── WorkManager.tsx              // Componente principal que rutea por workType
├── shared/                      // Lógica y componentes compartidos
│   ├── hooks/
│   │   ├── useWorkData.ts      // Hook para datos comunes
│   │   ├── useWorkForm.ts      // Hook para formulario base
│   │   └── useWorkGrid.ts      // Hook para grid
│   ├── components/
│   │   ├── WorkGrid.tsx        // Grid base configurable
│   │   ├── WorkForm.tsx        // Formulario base
│   │   └── WorkModals.tsx      // Modales compartidos
│   ├── services/
│   │   └── workService.ts      // Servicio base
│   └── types/
│       └── workTypes.ts        // Types compartidos
├── aplicacion/                  // Lógica específica de Aplicación (A)
│   ├── AplicacionConfig.ts     // Configuraciones específicas
│   ├── AplicacionRules.ts      // Reglas de campo específicas
│   ├── AplicacionForm.tsx      // Formulario específico
│   └── components/
│       ├── ProductGrid.tsx     // Grid de productos
│       ├── PPESection.tsx      // Sección EPP
│       └── WashingSection.tsx  // Protocolo lavado
├── cosecha/                     // Nueva lógica para Cosecha (C)
│   ├── CosechaConfig.ts
│   ├── CosechaRules.ts
│   ├── CosechaForm.tsx
│   └── components/
│       ├── HarvestGrid.tsx     // Grid de cosecha
│       └── YieldSection.tsx    // Sección de rendimientos
└── trabajo/                     // Nueva lógica para Trabajo Agrícola (T)
    ├── TrabajoConfig.ts
    ├── TrabajoRules.ts
    ├── TrabajoForm.tsx
    └── components/
        └── TaskGrid.tsx        // Grid de tareas agrícolas
```

#### Implementación del Factory Pattern
```typescript
// WorkManager.tsx
const WorkManager = () => {
  const [selectedWorkType, setSelectedWorkType] = useState<WorkType>('A');
  
  const renderWorkComponent = () => {
    switch (selectedWorkType) {
      case 'A':
        return <AplicacionWork />;
      case 'C':
        return <CosechaWork />;
      case 'T':
        return <TrabajoWork />;
      default:
        return <AplicacionWork />;
    }
  };
  
  return (
    <div>
      <WorkTypeSelector 
        selectedType={selectedWorkType}
        onTypeChange={setSelectedWorkType}
      />
      {renderWorkComponent()}
    </div>
  );
};
```

#### Ventajas
✅ **Separación clara** de responsabilidades por tipo de trabajo  
✅ **Reutilización** de componentes y lógica común  
✅ **Escalabilidad** fácil para agregar nuevos tipos  
✅ **Mantenibilidad** - cambios aislados por tipo  
✅ **Testing** - cada tipo se puede testear independientemente  

#### Desventajas
❌ Requiere refactoring significativo inicial  
❌ Mayor complejidad de estructura de archivos  

---

### **Opción 2: Configuration-Driven Pattern**

#### Estructura
```typescript
// Configuración por tipo de trabajo
interface WorkTypeConfig {
  workType: WorkType;
  title: string;
  formSections: SectionConfig[];
  fieldRules: FormGridRules;
  gridColumns: Column[];
  specificComponents?: {
    additionalModals?: React.ComponentType[];
    customSections?: React.ComponentType[];
  };
}

const WORK_CONFIGS: Record<WorkType, WorkTypeConfig> = {
  'A': aplicacionConfig,
  'C': cosechaConfig, 
  'T': trabajoConfig
};
```

#### Componente Principal
```typescript
const UniversalWorkComponent = () => {
  const [workType, setWorkType] = useState<WorkType>('A');
  const config = WORK_CONFIGS[workType];
  
  return (
    <div>
      <WorkTypeSelector workType={workType} onChange={setWorkType} />
      <UniversalWorkGrid 
        columns={config.gridColumns}
        workType={workType}
      />
      <UniversalWorkForm 
        sections={config.formSections}
        fieldRules={config.fieldRules}
        workType={workType}
      />
      {config.specificComponents?.additionalModals?.map(Modal => <Modal key={Modal.name} />)}
    </div>
  );
};
```

#### Ventajas
✅ **Refactoring mínimo** del componente actual  
✅ **Configuración centralizada** por tipo  
✅ **DRY** - un solo componente para todos los tipos  

#### Desventajas
❌ **Complejidad creciente** del componente principal  
❌ **Acoplamiento** - lógica específica mezclada  
❌ **Difícil testing** de comportamientos específicos  

---

### **Opción 3: Hook-Based Composition Pattern**

#### Estructura con Hooks Especializados
```typescript
// Hooks por tipo de trabajo
const useAplicacionWork = () => {
  // Lógica específica de aplicación
  return { /* specific logic */ };
};

const useCosechaWork = () => {
  // Lógica específica de cosecha  
  return { /* specific logic */ };
};

const useTrabajoWork = () => {
  // Lógica específica de trabajo agrícola
  return { /* specific logic */ };
};

// Hook principal que compone según tipo
const useWorkByType = (workType: WorkType) => {
  const baseWork = useBaseWork();
  const specificWork = useMemo(() => {
    switch (workType) {
      case 'A': return useAplicacionWork();
      case 'C': return useCosechaWork(); 
      case 'T': return useTrabajoWork();
    }
  }, [workType]);
  
  return { ...baseWork, ...specificWork };
};
```

#### Ventajas
✅ **Composición flexible** de funcionalidad  
✅ **Reutilización** de lógica base  
✅ **Separación** de concerns por tipo  

#### Desventajas
❌ **Complejidad** de gestión de hooks múltiples  
❌ **Debugging** más difícil  

---

## Recomendación: Estrategia Híbrida

### Fase 1: Refactoring Preparatorio (1-2 días)

1. **Extraer lógica común** del OrdenAplicacion actual:
```typescript
// src/pages/Work/shared/hooks/useWorkData.ts
export const useWorkData = (workType: WorkType) => {
  // Lógica común de carga de datos
  // Filtrar por workType en lugar de hardcoded 'A'
};

// src/pages/Work/shared/components/BaseWorkGrid.tsx  
export const BaseWorkGrid = ({ workType, specificColumns, onEdit, onDelete }) => {
  // Grid base que acepta columnas específicas
};
```

2. **Parametrizar el workType** en lugar de hardcoded 'A'
3. **Extraer configuraciones** específicas de aplicación

### Fase 2: Implementar Component Factory (2-3 días)

1. **Crear WorkManager** como componente orquestador
2. **Mover lógica específica** de aplicación a su carpeta
3. **Implementar componentes** para Cosecha y Trabajo Agrícola

### Fase 3: Optimización y Testing (1-2 días)

1. **Optimizar hooks** compartidos
2. **Implementar tests** por tipo de trabajo
3. **Documentar** la nueva arquitectura

## Plan de Migración Paso a Paso

### Paso 1: Preparar la Base
```bash
# Crear nueva estructura
mkdir -p src/pages/Work/{shared/{hooks,components,services,types},aplicacion,cosecha,trabajo}

# Mover OrdenAplicacion.tsx a estructura temporal
mv src/pages/OrdenAplicacion.tsx src/pages/Work/aplicacion/AplicacionWork.tsx
```

### Paso 2: Extraer Lógica Común  
- Identificar funciones, hooks y componentes reutilizables
- Crear hooks base: `useWorkData`, `useWorkForm`, `useWorkGrid`
- Extraer componentes base: grid, modales, formularios

### Paso 3: Crear WorkManager
- Implementar selector de tipo de trabajo
- Implementar factory pattern para renderizado
- Conectar con lógica existente de aplicación

### Paso 4: Implementar Tipos C y T
- Crear configuraciones específicas para cada tipo
- Implementar formularios y grids específicos
- Definir reglas de campo particulares

## Consideraciones Técnicas

### Campos Específicos por Tipo

#### Tipo A (Aplicación) - Campos Únicos
- Productos químicos, EPP, protocolos de lavado
- Dosis, carencia, reingreso
- Condiciones climáticas críticas

#### Tipo C (Cosecha) - Campos Esperados  
- Rendimientos, calidad de producto
- Cuadrillas de cosecha, contenedores
- Transporte y almacenamiento

#### Tipo T (Trabajo Agrícola) - Campos Esperados
- Herramientas y equipos
- Tareas de mantenimiento
- Labores culturales

### API Integration
```typescript
// Modificar servicios para aceptar workType
const workService = {
  async getAllWorks(workType?: WorkType) {
    // Filtrar por workType si se proporciona
  },
  
  async getTaskTypes(workType: WorkType) {
    // Obtener tipos de tarea específicos del workType
  }
};
```

## Conclusión

**Recomiendo la Opción 1 (Component Factory)** por:

1. **Escalabilidad**: Fácil agregar nuevos tipos de trabajo
2. **Mantenibilidad**: Cambios aislados por tipo  
3. **Claridad**: Separación clara de responsabilidades
4. **Testing**: Cada tipo es testeable independientemente
5. **Performance**: Solo carga lógica del tipo activo

El refactoring requerirá **4-7 días** pero resultará en una arquitectura mucho más limpia y mantenible a largo plazo.