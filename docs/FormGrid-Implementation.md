# FormGrid - Grid con Validaciones de Formulario

## Descripción

El componente `FormGrid` es una extensión mejorada del componente `Grid` existente que integra validaciones de formulario usando **react-hook-form** y **zod**. Proporciona una experiencia de usuario mejorada con validaciones en tiempo real y manejo de errores robusto para la edición y adición de registros inline.

## Características Principales

### ✅ Validaciones Automáticas
- Validaciones en tiempo real mientras el usuario edita
- Esquemas de validación usando Zod
- Mensajes de error personalizados
- Prevención de guardado con datos inválidos

### ✅ Integración con React Hook Form
- Control completo del estado del formulario
- Manejo automático de dirty fields
- Reset automático después de operaciones exitosas
- Gestión de errores integrada

### ✅ Configuración de Campos Flexible
- Tipos de campo predefinidos (text, number, select, checkbox, date, time, email)
- Configuración de placeholders, min/max values, opciones de select
- Renderizado personalizado opcional para casos especiales

### ✅ Manejo de Errores Mejorado
- Notificaciones toast automáticas para éxito/error
- Validación antes de envío
- Rollback automático en caso de error

## Uso Básico

```tsx
import { FormGrid } from "@/components/Grid/FormGrid";
import { z } from "zod";

// Definir esquema de validación
const validationSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  age: z.number().min(18, "Debe ser mayor de 18 años"),
});

// Configurar campos
const fieldConfigurations = {
  name: {
    type: 'text',
    placeholder: "Ingrese el nombre"
  },
  email: {
    type: 'email',
    placeholder: "correo@ejemplo.com"
  },
  age: {
    type: 'number',
    min: 18,
    max: 100
  }
};

// Usar el componente
<FormGrid
  columns={columns}
  data={data}
  editValidationSchema={validationSchema}
  addValidationSchema={validationSchema}
  fieldConfigurations={fieldConfigurations}
  enableInlineEdit={true}
  enableInlineAdd={true}
  onEditSave={handleEditSave}
  onInlineAdd={handleInlineAdd}
  // ... otras props
/>
```

## Implementación en OrdenAplicacion

### Schemas de Validación Creados

#### 1. Workers Schema (`workerFormSchema`)
```typescript
// Validaciones para trabajadores
worker: z.string().min(1, "Debe seleccionar un trabajador"),
classification: z.string().min(1, "La clasificación es requerida"),
salary: z.coerce.number().min(0, "El salario debe ser mayor o igual a 0"),
yield: z.coerce.number().min(0, "El rendimiento debe ser mayor o igual a 0"),
// ... más campos
```

#### 2. Machinery Schema (`machineryFormSchema`)
```typescript
// Validaciones para maquinaria
machinery: z.string().min(1, "El nombre de la maquinaria es requerido"),
timeValue: z.coerce.number().min(0, "El valor tiempo debe ser mayor o igual a 0"),
totalValue: z.coerce.number().min(0, "El valor total debe ser mayor o igual a 0"),
// ... más campos
```

#### 3. Product Schema (`productFormSchema`)
```typescript
// Validaciones para productos
product: z.string().min(1, "Debe seleccionar un producto"),
unitOfMeasurement: z.string().min(1, "La unidad de medida es requerida"),
amount: z.coerce.number().min(0, "La cantidad debe ser mayor o igual a 0"),
// ... más campos
```

### Configuraciones de Campo

El FormGrid incluye configuraciones detalladas para cada tipo de campo:

- **Select Fields**: Con opciones dinámicas (trabajadores, categorías, productos)
- **Number Fields**: Con validaciones de rango y formato
- **Date/Time Fields**: Con controles nativos del navegador
- **Text Fields**: Con placeholders descriptivos
- **Checkbox Fields**: Para campos booleanos

### Manejo de Tipos de Datos

Dado que las interfaces existentes (`IWorkers`, `IMachinery`, `IProduct`) esperan strings para campos numéricos, se implementó conversión automática:

```typescript
// Conversión automática de números a strings
const workerData = {
  ...newWorker,
  salary: String(newWorker.salary || 0),
  yield: String(newWorker.yield || 0),
  // ... otros campos numéricos
};
```

## Beneficios de la Implementación

### 1. **Validación Robusta**
- Evita errores en datos de entrada
- Feedback inmediato al usuario
- Consistency en los datos guardados

### 2. **Mejor UX**
- Indicadores visuales de campos requeridos
- Mensajes de error descriptivos
- Prevención de acciones con datos inválidos

### 3. **Mantenibilidad**
- Schemas centralizados y reutilizables
- Separación clara entre validación y UI
- Fácil extensión para nuevos campos

### 4. **Type Safety**
- TypeScript types generados automáticamente desde schemas
- Autocompletado mejorado en el IDE
- Detección temprana de errores de tipado

## Archivos Modificados/Creados

### Nuevos Archivos
- `src/components/Grid/FormGrid.tsx` - Componente principal
- `src/lib/validationSchemas.ts` - Schemas de validación
- `docs/FormGrid-Implementation.md` - Esta documentación

### Archivos Modificados
- `src/pages/OrdenAplicacion.tsx` - Integración del FormGrid

## Consideraciones Futuras

### Extensibilidad
- El FormGrid puede reutilizarse en otras páginas
- Los schemas pueden extenderse fácilmente
- Nuevos tipos de campo pueden agregarse según necesidad

### Optimizaciones Posibles
- Lazy loading de opciones para selects grandes
- Debouncing para validaciones costosas
- Caching de datos de referencia

### Migración Gradual
- Otras páginas pueden migrar gradualmente al FormGrid
- El Grid original sigue disponible para compatibilidad
- Configuración por feature flags si es necesario

## Conclusión

La implementación del FormGrid proporciona una base sólida para formularios complejos con validaciones robustas, mejorando significativamente la experiencia del usuario y la calidad de los datos en la aplicación. 

## 🔄 Sistema de Reglas de Campos (Field Rules System)

El FormGrid incluye un poderoso sistema de reglas que permite:
1. **Preseleccionar automáticamente** valores de campos basados en selecciones
2. **Calcular automáticamente** valores entre campos
3. **Acceder a datos** del formulario padre y registros externos

### 📋 Características Principales

- **Declarativo**: Se define QUÉ hacer, no CÓMO hacerlo
- **Flexible**: Soporta preselección y cálculos complejos
- **Reutilizable**: Se puede usar en cualquier FormGrid
- **Acceso completo**: Datos del padre, registro seleccionado y externos
- **Condicional**: Reglas que se ejecutan solo bajo ciertas condiciones
- **Tiempo real**: Se ejecuta automáticamente al cambiar campos

### 🚀 Uso Básico

```typescript
import { FormGridRules, FieldRule } from "@/lib/validationSchemas";

// Definir reglas
const workerGridRules: FormGridRules = {
  rules: [
    // Preseleccionar valor del formulario padre
    {
      trigger: { field: 'worker' },
      action: {
        type: 'preset',
        targetField: 'yieldValue',
        source: 'parent',
        sourceField: 'taskPrice'
      }
    },
    
    // Calcular valores automáticamente
    {
      trigger: { field: 'yield' },
      action: {
        type: 'calculate',
        targetField: 'totalDeal',
        calculate: (formData) => (formData.yield || 0) * (formData.yieldValue || 0)
      }
    },
    
    // Preselección con función personalizada
    {
      trigger: { field: 'worker' },
      action: {
        type: 'preset',
        targetField: 'classification',
        preset: (formData, parentData, externalData) => {
          const worker = externalData?.workerList?.find(w => w._id === formData.worker);
          return worker?.defaultClassification || 'General';
        }
      }
    }
  ],
  parentData: selectedOrder, // datos del formulario padre
  externalData: {
    workerList: workerList,
    taskPrice: selectedOrder?.taskPrice
  }
};

// Usar en FormGrid
<FormGrid
  // ... otras props
  fieldRules={workerGridRules}
/>
```

### 📖 API de Reglas

#### FieldRule Interface
```typescript
interface FieldRule {
  trigger: {
    field: string; // campo que dispara la regla
    condition?: (value: any, formData: any, parentData?: any) => boolean; // condición opcional
  };
  
  action: {
    type: 'preset' | 'calculate';
    targetField: string; // campo a modificar
    source?: 'parent' | 'external' | 'custom'; // fuente de datos para preset
    sourceField?: string; // campo fuente para preset
    calculate?: (formData: any, parentData?: any, externalData?: any) => any; // función de cálculo
    preset?: (formData: any, parentData?: any, externalData?: any) => any; // función de preselección
  };
}
```

#### FormGridRules Interface
```typescript
interface FormGridRules {
  rules: FieldRule[];
  parentData?: any; // datos del formulario padre
  externalData?: { [key: string]: any }; // datos externos (listas, etc.)
}
```

### 🎯 Casos de Uso Comunes

#### 1. Preselección desde Formulario Padre
```typescript
{
  trigger: { field: 'worker' },
  action: {
    type: 'preset',
    targetField: 'yieldValue',
    source: 'parent',
    sourceField: 'taskPrice' // toma taskPrice del formulario padre
  }
}
```

#### 2. Cálculo Automático Entre Campos
```typescript
{
  trigger: { field: 'yield' },
  action: {
    type: 'calculate',
    targetField: 'totalDeal',
    calculate: (formData) => {
      return (formData.yield || 0) * (formData.yieldValue || 0);
    }
  }
}
```

#### 3. Preselección con Lógica Personalizada
```typescript
{
  trigger: { field: 'worker' },
  action: {
    type: 'preset',
    targetField: 'date',
    preset: () => new Date().toISOString().split('T')[0] // fecha actual
  }
}
```

#### 4. Reglas Condicionales
```typescript
{
  trigger: { 
    field: 'workingDay',
    condition: (value) => value === 'complete' // solo si es jornada completa
  },
  action: {
    type: 'calculate',
    targetField: 'dayValue',
    calculate: () => 15000 // salario base
  }
}
```

#### 5. Múltiples Cálculos Encadenados
```typescript
// Calcular total diario cuando cambie cualquier componente
['salary', 'totalDeal', 'overtime', 'bonus'].map(field => ({
  trigger: { field },
  action: {
    type: 'calculate',
    targetField: 'dailyTotal',
    calculate: (formData) => {
      return (formData.salary || 0) + 
             (formData.totalDeal || 0) + 
             (formData.overtime || 0) + 
             (formData.bonus || 0);
    }
  }
}))
```

### 💡 Mejores Prácticas

1. **Agrupa reglas relacionadas** para mejor legibilidad
2. **Usa funciones helper** para cálculos complejos
3. **Valida datos** antes de usar en cálculos (`|| 0` para números)
4. **Usa useMemo** para reglas que dependen de props
5. **Documenta reglas complejas** con comentarios
6. **Testa reglas** individualmente cuando sea posible

### 🔧 Ejemplo Completo en OrdenAplicacion

Ver implementación completa en `src/pages/OrdenAplicacion.tsx` líneas 970-1165, donde se implementan:

- ✅ Preselección de valor de rendimiento desde precio de tarea padre
- ✅ Preselección de clasificación de trabajador desde datos externos
- ✅ Preselección automática de fecha actual
- ✅ Cálculo automático de total trato (rendimiento × valor rendimiento)
- ✅ Cálculo automático de total diario (suma de todos los componentes)
- ✅ Cálculo de valor día basado en tipo de jornada

### 🚀 Beneficios

- **Reduce errores**: Cálculos automáticos eliminan errores manuales
- **Mejora UX**: Preselección automática acelera entrada de datos
- **Código limpio**: Lógica centralizada y declarativa
- **Reutilizable**: Mismas reglas funcionan en diferentes contextos
- **Mantenible**: Cambios en reglas de negocio son fáciles de implementar 