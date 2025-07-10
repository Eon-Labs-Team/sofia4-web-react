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