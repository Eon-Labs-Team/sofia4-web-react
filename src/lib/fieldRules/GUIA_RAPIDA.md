# 🚀 Guía Rápida - FieldRulesEngine v2.0

## Configuración Básica

### 1. Crear archivo de reglas
```typescript
// src/lib/fieldRules/miEntidadRules.ts
import { FormGridRules } from "@/lib/validationSchemas";

export const miEntidadRules: FormGridRules = {
  rules: [
    // Lookup inmediato
    {
      trigger: { field: 'select1' },
      action: {
        type: 'lookup',
        source: 'list',
        listKey: 'options',
        lookupField: 'id',
        targetField: 'related',
        mappingField: 'value'
      }
    },
    
    // Cálculo con debounce
    {
      trigger: { field: 'number1', debounce: 300 },
      action: {
        type: 'calculate',
        targetField: 'result',
        calculate: (data) => data.number1 * 1.21
      }
    }
  ],
  externalData: { options: [] }
};
```

### 2. Usar en DynamicForm
```typescript
const formRules = useMemo(() => 
  createMiEntidadRules({ options: myOptions }), 
  [myOptions]
);

<DynamicForm 
  fieldRules={formRules}
  sections={sections} 
/>
```

### 3. Usar en Wizard
```typescript
const wizardRules = useMemo(() => 
  createMiEntidadRules({ options: myOptions }), 
  [myOptions]
);

<Wizard 
  fieldRules={wizardRules}
  steps={steps} 
/>
```

## Tipos de Reglas

### 🔗 Lookup
```typescript
{
  trigger: { field: 'sourceField' },
  action: {
    type: 'lookup',
    source: 'list',
    listKey: 'dataList',
    lookupField: 'id', 
    targetField: 'targetField',
    mappingField: 'name'
  }
}
```

### ⚡ Calculate
```typescript
{
  trigger: { field: 'baseValue', debounce: 300 },
  action: {
    type: 'calculate',
    targetField: 'result',
    calculate: (data) => data.baseValue * data.multiplier
  }
}
```

### 📝 Preset
```typescript
{
  trigger: { field: 'trigger' },
  action: {
    type: 'preset',
    targetField: 'target',
    preset: () => 'fixed value'
  }
}
```

## Configuración de Debouncing

### ⚡ Inmediato (sin debounce)
- Selects / Dropdowns
- Lookups / Autocompletado
- Checkboxes / Radios

### 🕐 300ms (recomendado)
- Inputs numéricos
- Cálculos automáticos
- Sliders / Ranges

### 🕐 500ms+ (lento)
- Búsquedas API
- Validaciones complejas
- Text areas largos

## Condiciones

### Con condición
```typescript
{
  trigger: { 
    field: 'field',
    condition: (value, formData) => value > 0 
  },
  action: { ... }
}
```

### Limpiar campo
```typescript
{
  trigger: { 
    field: 'select',
    condition: (value) => !value 
  },
  action: {
    type: 'preset',
    targetField: 'dependent',
    preset: () => ''
  }
}
```

## Debugging

### Logs automáticos (desarrollo)
- `FieldRulesEngine: Indexed rules by trigger field`
- `performListLookup: Found X = Y for Z = W`
- `performListLookup: No item found with X = Y`

### Debug manual
```typescript
{
  trigger: { 
    field: 'field',
    condition: (value) => {
      console.log('Debug:', value); // Solo en desarrollo
      return value !== null;
    }
  }
}
```

## Checklist de Implementación

### ✅ Setup inicial
- [ ] Crear archivo `miEntidadRules.ts`
- [ ] Definir reglas básicas
- [ ] Crear función helper `createMiEntidadRules`
- [ ] Exportar tipos de interfaces

### ✅ Optimización
- [ ] Agregar `debounce: 300` a campos numéricos
- [ ] Usar condiciones para limpiar campos
- [ ] Verificar que `listKey` existe en `externalData`
- [ ] Verificar que campos existen en formulario

### ✅ Integración
- [ ] Usar `useMemo` para crear reglas
- [ ] Pasar `fieldRules` al componente
- [ ] Remover `onChange` manuales redundantes
- [ ] Probar en desarrollo (verificar logs)

## Errores Comunes

### ❌ Regla no se ejecuta
```typescript
// Problema: field no existe
{ trigger: { field: 'nonExistentField' } }

// Solución: verificar nombre exacto
{ trigger: { field: 'correctFieldName' } }
```

### ❌ Lookup no encuentra valor
```typescript
// Problema: configuración incorrecta
listKey: 'wrongKey'
lookupField: 'wrongField'

// Solución: verificar datos
console.log(externalData.correctKey);
console.log(externalData.correctKey[0]); // Ver estructura
```

### ❌ Performance lenta
```typescript
// Problema: sin debounce en cálculos
{ trigger: { field: 'numeric' } }

// Solución: agregar debounce
{ trigger: { field: 'numeric', debounce: 300 } }
```

## Migración v1.0 → v2.0

### ✅ Backward compatible
- Todas las reglas v1.0 funcionan sin cambios
- Optimizaciones automáticas activas
- Solo agregar `debounce` para mejor performance

### ✅ Nuevas características
- Pre-indexación automática (O(1) lookup)
- Watch selectivo (menos re-renders)  
- Debouncing configurable (menos cálculos)
- Logs condicionales (console limpia en prod)

## Ejemplo Completo

```typescript
// miEntidadRules.ts
export const miEntidadRules: FormGridRules = {
  rules: [
    // Cuartel → Especie (inmediato)
    {
      trigger: { field: 'cuartel' },
      action: {
        type: 'lookup',
        source: 'list',
        listKey: 'cuarteles',
        lookupField: '_id',
        targetField: 'especie',
        mappingField: 'species'
      }
    },
    
    // Hectáreas × Cobertura = Aplicadas (con delay)
    {
      trigger: { field: 'hectares', debounce: 300 },
      action: {
        type: 'calculate',
        targetField: 'aplicadas',
        calculate: (data) => 
          (data.hectares * (data.cobertura || 100) / 100).toFixed(2)
      }
    },
    
    // Limpiar cuando se deselecciona
    {
      trigger: { 
        field: 'cuartel',
        condition: (value) => !value
      },
      action: {
        type: 'preset',
        targetField: 'especie',
        preset: () => ''
      }
    }
  ],
  externalData: { cuarteles: [] }
};

// Componente
const MyForm = ({ cuarteles }) => {
  const rules = useMemo(() => 
    createMiEntidadRules({ cuarteles }), 
    [cuarteles]
  );
  
  return <DynamicForm fieldRules={rules} sections={sections} />;
};
```