# Guía Completa de Implementación - FieldRulesEngine v2.0

Esta guía te enseña cómo implementar correctamente el sistema de FieldRulesEngine para crear formularios reactivos y escalables.

## 📚 Tabla de Contenidos

1. [Conceptos Fundamentales](#conceptos-fundamentales)
2. [Tipos de Reglas Disponibles](#tipos-de-reglas-disponibles)
3. [Implementación Paso a Paso](#implementación-paso-a-paso)
4. [Patrones de Uso Comunes](#patrones-de-uso-comunes)
5. [Integración con Componentes](#integración-con-componentes)
6. [Optimizaciones de Performance](#optimizaciones-de-performance)
7. [Debugging y Troubleshooting](#debugging-y-troubleshooting)
8. [Ejemplos Completos](#ejemplos-completos)

---

## 🎯 Conceptos Fundamentales

### ¿Qué es el FieldRulesEngine?

El FieldRulesEngine es un sistema declarativo que permite definir **reactividad entre campos** de formularios sin escribir código imperativo (como `onChange` manuales).

### Ventajas Clave

- ✅ **Declarativo**: Las reglas se definen una vez y se reutilizan
- ✅ **Performance Optimizada**: Watch selectivo, debouncing, pre-indexación
- ✅ **Escalable**: Maneja formularios complejos sin lag
- ✅ **Reutilizable**: Mismas reglas en DynamicForm, Wizard y FormGrid
- ✅ **Tipado**: Full TypeScript support

---

## 🔧 Tipos de Reglas Disponibles

### 1. **Preset** - Establecer Valores

Establece un valor fijo o calculado en un campo.

```typescript
{
  trigger: { field: 'sourceField' },
  action: {
    type: 'preset',
    targetField: 'targetField',
    preset: (formData) => {
      return formData.sourceField ? 'valor_calculado' : '';
    }
  }
}
```

**Casos de uso:**
- Limpiar campos cuando cambian dependencias
- Establecer valores por defecto
- Copiar valores entre campos

### 2. **Calculate** - Cálculos Automáticos

Calcula valores basados en otros campos del formulario.

```typescript
{
  trigger: { 
    field: 'baseValue',
    debounce: 300 // Recomendado para campos numéricos
  },
  action: {
    type: 'calculate',
    targetField: 'calculatedValue',
    calculate: (formData) => {
      const base = parseFloat(formData.baseValue) || 0;
      const multiplier = parseFloat(formData.multiplier) || 1;
      return (base * multiplier).toFixed(2);
    }
  }
}
```

**Casos de uso:**
- Cálculos matemáticos (hectáreas aplicadas, totales, porcentajes)
- Concatenación de strings
- Validaciones complejas

### 3. **Lookup** - Búsqueda en Listas

Busca un valor en una lista externa y establece otro campo.

```typescript
{
  trigger: { field: 'cuartel' },
  action: {
    type: 'lookup',
    source: 'list',
    listKey: 'cuartelesOptions',
    lookupField: '_id',
    targetField: 'especie',
    mappingField: 'varietySpecies'
  }
}
```

**Casos de uso:**
- Autocompletar campos relacionados
- Establecer valores basados en selección
- Sincronizar datos entre campos

### 4. **FilterOptions** - Filtrado Dinámico ⭐ NUEVO

Filtra las opciones de un select basado en otro campo.

```typescript
{
  trigger: { field: 'taskType' },
  action: {
    type: 'filterOptions',
    targetField: 'task',
    filterListKey: 'taskOptions',
    filterByField: 'taskTypeId'
  }
}
```

**Casos de uso:**
- Filtrar tasks por taskType
- Filtrar varieties por cropType
- Listas dependientes dinámicas

---

## 🚀 Implementación Paso a Paso

### Paso 1: Crear Archivo de Reglas

Crea un archivo específico para tu entidad en `src/lib/fieldRules/`:

```typescript
// src/lib/fieldRules/miEntidadRules.ts
import { FormGridRules } from "@/lib/validationSchemas";

export const miEntidadRules: FormGridRules = {
  rules: [
    // Regla inmediata (sin debounce) - para selects y lookups
    {
      trigger: { field: 'masterField' },
      action: {
        type: 'filterOptions',
        targetField: 'dependentField',
        filterListKey: 'dependentOptions',
        filterByField: 'masterId'
      }
    },
    
    // Regla con debounce - para cálculos numéricos
    {
      trigger: { 
        field: 'numeroField',
        debounce: 300
      },
      action: {
        type: 'calculate',
        targetField: 'calculatedField',
        calculate: (formData) => {
          const num = parseFloat(formData.numeroField) || 0;
          return num * 1.21; // Ejemplo: aplicar IVA
        }
      }
    }
  ],
  
  externalData: {
    dependentOptions: [], // Se llenará dinámicamente
    masterOptions: []
  }
};

// Factory function para datos dinámicos
export const createMiEntidadRules = (externalData: {
  dependentOptions?: any[];
  masterOptions?: any[];
}): FormGridRules => ({
  ...miEntidadRules,
  externalData: {
    ...miEntidadRules.externalData,
    ...externalData
  }
});
```

### Paso 2: Preparar Datos Externos

En tu componente, prepara los datos que necesitarán las reglas:

```typescript
// En tu componente React
const MyComponent = () => {
  const [masterData, setMasterData] = useState([]);
  const [dependentData, setDependentData] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      const [masters, dependents] = await Promise.all([
        masterService.findAll(),
        dependentService.findAll()
      ]);
      setMasterData(masters);
      setDependentData(dependents);
    };
    loadData();
  }, []);

  // Crear reglas con datos cargados
  const fieldRules = useMemo(() => {
    if (masterData.length === 0 || dependentData.length === 0) {
      return undefined;
    }

    return createMiEntidadRules({
      masterOptions: masterData.map(item => ({
        _id: item._id,
        name: item.name,
        // otros campos necesarios
      })),
      dependentOptions: dependentData.map(item => ({
        _id: item._id,
        name: item.name,
        masterId: item.masterId, // Campo para filtrado
        // otros campos necesarios
      }))
    });
  }, [masterData, dependentData]);

  // Resto del componente...
};
```

### Paso 3: Configurar Formulario con Selects Dinámicos

```typescript
// Función para crear secciones de formulario con datos dinámicos
const createFormSections = (
  masterData: any[], 
  dependentData: any[], 
  selectedMasterId?: string
): SectionConfig[] => {
  // Opciones para master select
  const masterOptions = masterData.map(item => ({
    value: item._id,
    label: item.name
  }));

  // Opciones filtradas para dependent select
  const dependentOptions = selectedMasterId 
    ? dependentData
        .filter(item => item.masterId === selectedMasterId)
        .map(item => ({
          value: item._id,
          label: item.name
        }))
    : [];

  return [
    {
      id: "main-section",
      title: "Información Principal",
      fields: [
        {
          id: "masterField",
          type: "select",
          label: "Campo Master",
          name: "masterField",
          placeholder: "Seleccione...",
          required: true,
          options: masterOptions
        },
        {
          id: "dependentField", 
          type: "select",
          label: "Campo Dependiente",
          name: "dependentField",
          placeholder: "Seleccione...",
          required: true,
          options: dependentOptions // Se actualizará dinámicamente
        }
      ]
    }
  ];
};
```

### Paso 4: Integrar con DynamicForm o Wizard

```typescript
// Para DynamicForm
<DynamicForm
  sections={createFormSections(masterData, dependentData)}
  onSubmit={handleSubmit}
  validationSchema={validationSchema}
  defaultValues={defaultValues}
  fieldRules={fieldRules} // ← Las reglas se aplicarán automáticamente
/>

// Para Wizard
<Wizard
  steps={wizardSteps}
  onComplete={handleComplete}
  fieldRules={fieldRules} // ← Las reglas se aplicarán automáticamente
/>
```

---

## 📋 Patrones de Uso Comunes

### Patrón 1: Master-Detail con Filtrado

```typescript
// Cuando se selecciona un tipo, filtrar elementos relacionados
{
  trigger: { field: 'tipo' },
  action: {
    type: 'filterOptions',
    targetField: 'elemento',
    filterListKey: 'elementosOptions',
    filterByField: 'tipoId'
  }
}
```

### Patrón 2: Limpiar Campo Dependiente

```typescript
// Limpiar selección cuando cambia el campo padre
{
  trigger: { field: 'campoPadre' },
  action: {
    type: 'preset',
    targetField: 'campoHijo',
    preset: () => '' // Limpiar
  }
}
```

### Patrón 3: Cálculo con Múltiples Campos

```typescript
// Calcular total basado en cantidad y precio
{
  trigger: { 
    field: 'cantidad',
    debounce: 300
  },
  action: {
    type: 'calculate',
    targetField: 'total',
    calculate: (formData) => {
      const cantidad = parseFloat(formData.cantidad) || 0;
      const precio = parseFloat(formData.precio) || 0;
      return (cantidad * precio).toFixed(2);
    }
  }
}
```

### Patrón 4: Autocompletado por Lookup

```typescript
// Autocompletar datos del usuario al seleccionarlo
{
  trigger: { field: 'userId' },
  action: {
    type: 'lookup',
    source: 'list',
    listKey: 'usersOptions',
    lookupField: '_id',
    targetField: 'userName',
    mappingField: 'fullName'
  }
}
```

### Patrón 5: Filtrado con Función Custom

```typescript
// Filtrado complejo con lógica personalizada
{
  trigger: { field: 'categoria' },
  action: {
    type: 'filterOptions',
    targetField: 'producto',
    filterListKey: 'productosOptions',
    filterFunction: (productos, categoriaSeleccionada, formData) => {
      // Lógica custom de filtrado
      return productos.filter(producto => {
        const perteneceCategoria = producto.categoriaId === categoriaSeleccionada;
        const estaActivo = producto.activo === true;
        const cumpleRequisitos = producto.stock > 0;
        
        return perteneceCategoria && estaActivo && cumpleRequisitos;
      });
    }
  }
}
```

---

## 🔌 Integración con Componentes

### DynamicForm

El DynamicForm automáticamente:
- ✅ Registra callbacks para `filterOptions`
- ✅ Actualiza opciones de selects dinámicamente
- ✅ Ejecuta reglas al cambiar valores
- ✅ Maneja cleanup de callbacks

```typescript
<DynamicForm
  sections={sections}
  fieldRules={fieldRules} // ← Automático
  onSubmit={handleSubmit}
/>
```

### Wizard

El Wizard automáticamente:
- ✅ Aplica reglas en todos los pasos
- ✅ Mantiene estado entre pasos
- ✅ Actualiza opciones por step

```typescript
<Wizard
  steps={steps}
  fieldRules={fieldRules} // ← Automático
  onComplete={handleComplete}
/>
```

### FormGrid

El FormGrid ya tenía soporte completo:
- ✅ Edición inline con reglas
- ✅ Cálculos automáticos por fila

```typescript
<FormGrid
  data={data}
  columns={columns}
  fieldRules={fieldRules} // ← Ya soportado
/>
```

---

## ⚡ Optimizaciones de Performance

### 1. Debouncing Configurado

```typescript
// ✅ Para cálculos numéricos (300ms recomendado)
{
  trigger: { 
    field: 'precio',
    debounce: 300
  },
  action: { type: 'calculate', ... }
}

// ✅ Para selects (sin debounce = inmediato)
{
  trigger: { field: 'categoria' },
  action: { type: 'filterOptions', ... }
}
```

### 2. Watch Selectivo

El sistema solo observa campos que tienen reglas activas:

```typescript
// Antes: watch() observaba TODOS los campos
// Ahora: Solo observa campos con reglas (~60% menos re-renders)
```

### 3. Pre-indexación

Las reglas se indexan por campo trigger:

```typescript
// Antes: O(n) filtrado en cada cambio
// Ahora: O(1) lookup instantáneo (~80% más rápido)
```

### 4. Condiciones Inteligentes

```typescript
{
  trigger: { 
    field: 'campo',
    condition: (value, formData) => {
      // Solo ejecutar si realmente es necesario
      return value !== null && formData.otherField === 'specific';
    }
  },
  action: { ... }
}
```

---

## 🐛 Debugging y Troubleshooting

### Logs Automáticos (Solo Desarrollo)

El sistema incluye logs automáticos cuando `NODE_ENV === 'development'`:

```console
FieldRulesEngine: Indexed rules by trigger field
performListLookup: Found varietyName = Cabernet for cropType = Wine
performOptionsFiltering: Filtered taskOptions from 50 to 12 items for task
🔄 FieldRules: Cleaning variety field due to varietySpecies change
```

### Problemas Comunes

#### 1. Regla no se ejecuta

```typescript
// ❌ Campo no existe en formulario
{ trigger: { field: 'campoInexistente' }, ... }

// ✅ Verificar que el campo existe
{ trigger: { field: 'campoExistente' }, ... }

// ✅ Agregar condición para debug
{ 
  trigger: { 
    field: 'campo',
    condition: (value) => {
      console.log('Condition check:', value);
      return value !== null;
    }
  }
}
```

#### 2. Filtrado no funciona

```typescript
// ❌ Lista no existe en externalData
filterListKey: 'listaInexistente'

// ✅ Verificar que existe
filterListKey: 'listaExistente' // Debe estar en externalData

// ✅ Verificar estructura de datos
console.log('External data:', fieldRules.externalData);
```

#### 3. Performance lenta

```typescript
// ❌ Sin debouncing en cálculos
{ trigger: { field: 'numero' }, ... }

// ✅ Con debouncing
{ trigger: { field: 'numero', debounce: 300 }, ... }
```

---

## 📚 Ejemplos Completos

### Ejemplo 1: Sistema de Órdenes (TaskType → Task)

```typescript
// ordenAplicacionRules.ts
export const ordenAplicacionRules: FormGridRules = {
  rules: [
    // Filtrar tasks cuando cambia taskType
    {
      trigger: { field: 'taskType' },
      action: {
        type: 'filterOptions',
        targetField: 'task',
        filterListKey: 'taskOptions',
        filterByField: 'taskTypeId'
      }
    },
    
    // Limpiar task si no pertenece al nuevo taskType
    {
      trigger: { field: 'taskType' },
      action: {
        type: 'preset',
        targetField: 'task',
        preset: (formData, _parentData, externalData) => {
          const taskTypeId = formData.taskType;
          const currentTaskId = formData.task;
          
          if (!currentTaskId) return currentTaskId;
          
          const currentTask = externalData?.taskOptions?.find(
            task => task._id === currentTaskId
          );
          
          // Si no pertenece al taskType, limpiar
          return currentTask?.taskTypeId === taskTypeId ? currentTaskId : '';
        }
      }
    },
    
    // Mostrar todas las tasks cuando no hay taskType
    {
      trigger: { 
        field: 'taskType',
        condition: (value) => !value
      },
      action: {
        type: 'filterOptions',
        targetField: 'task',
        filterListKey: 'taskOptions',
        filterFunction: (allTasks) => [...allTasks] // Mostrar todas
      }
    }
  ],
  
  externalData: {
    taskOptions: [],
    taskTypeOptions: []
  }
};
```

### Ejemplo 2: Sistema de Cuarteles (CropType → Variety)

```typescript
// barracksRules.ts
export const barracksRules: FormGridRules = {
  rules: [
    // Filtrar varieties cuando cambia cropType
    {
      trigger: { field: 'varietySpecies' },
      action: {
        type: 'filterOptions',
        targetField: 'variety',
        filterListKey: 'varietyTypesOptions',
        filterByField: 'cropTypeId'
      }
    },
    
    // Limpiar variety cuando cambia cropType
    {
      trigger: { field: 'varietySpecies' },
      action: {
        type: 'preset',
        targetField: 'variety',
        preset: () => ''
      }
    },
    
    // Lista vacía cuando no hay cropType
    {
      trigger: { 
        field: 'varietySpecies',
        condition: (value) => !value
      },
      action: {
        type: 'filterOptions',
        targetField: 'variety',
        filterListKey: 'varietyTypesOptions',
        filterFunction: () => [] // Lista vacía
      }
    }
  ],
  
  externalData: {
    cropTypesOptions: [],
    varietyTypesOptions: []
  }
};
```

### Ejemplo 3: Cálculos Automáticos

```typescript
// calculationRules.ts
export const calculationRules: FormGridRules = {
  rules: [
    // Calcular hectáreas aplicadas
    {
      trigger: { 
        field: 'coverage',
        debounce: 300
      },
      action: {
        type: 'calculate',
        targetField: 'appliedHectares',
        calculate: (formData) => {
          const hectares = parseFloat(formData.hectares) || 0;
          const coverage = parseFloat(formData.coverage) || 100;
          return (hectares * coverage / 100).toFixed(2);
        }
      }
    },
    
    // También calcular cuando cambian las hectáreas
    {
      trigger: { 
        field: 'hectares',
        debounce: 300
      },
      action: {
        type: 'calculate',
        targetField: 'appliedHectares',
        calculate: (formData) => {
          const hectares = parseFloat(formData.hectares) || 0;
          const coverage = parseFloat(formData.coverage) || 100;
          return (hectares * coverage / 100).toFixed(2);
        }
      }
    }
  ],
  
  externalData: {}
};
```

---

## 🎯 Mejores Prácticas

### ✅ Hacer

1. **Usar debouncing para cálculos numéricos**
2. **Nombrar reglas descriptivamente**
3. **Agrupar reglas relacionadas**
4. **Usar condiciones para optimizar**
5. **Crear factory functions para datos dinámicos**
6. **Verificar logs en desarrollo**

### ❌ Evitar

1. **No usar debouncing en selects**
2. **Reglas demasiado complejas**
3. **Ciclos infinitos entre reglas**
4. **Hardcodear valores en reglas**
5. **Ignorar condiciones de ejecución**

---

## 🔮 Extensiones Futuras

- **Validación condicional**: Validar campo solo bajo ciertas condiciones
- **Acciones múltiples**: Una regla que ejecute varias acciones
- **Dependencias complejas**: Cadenas de reglas secuenciales
- **Cache inteligente**: Optimizar lookups repetitivos
- **Reglas asíncronas**: Validaciones con llamadas API

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisa los logs de desarrollo**
2. **Verifica la estructura de datos externos**
3. **Confirma que los campos existen en el formulario**
4. **Consulta esta guía para patrones similares**
5. **Usa las condiciones para debugging**

---

**¡El FieldRulesEngine v2.0 te permite crear formularios reactivos, escalables y mantenibles con mínimo código imperativo! 🚀**