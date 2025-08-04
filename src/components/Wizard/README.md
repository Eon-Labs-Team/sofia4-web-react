# Componente Wizard

Un componente wizard reutilizable y completamente configurable que permite crear formularios de múltiples pasos con validación, reactividad y navegación integrada.

## Características

- ✅ **Múltiples pasos configurables** - Define tantos pasos como necesites
- ✅ **Validación por paso** - Usa Zod para validar cada paso individualmente
- ✅ **Reactividad con react-hook-form** - Campos reactivos con cálculos en tiempo real
- ✅ **Navegación inteligente** - Validación automática antes de avanzar
- ✅ **Pasos opcionales** - Permite saltar pasos marcados como opcionales
- ✅ **Barra de progreso visual** - Indicador de progreso claro
- ✅ **Estilo consistente** - Integrado con el design system actual
- ✅ **TypeScript completo** - Tipado fuerte para mejor DX

## Uso Básico

```typescript
import { Wizard, WizardStepConfig } from "@/components/Wizard";
import { z } from "zod";

const steps: WizardStepConfig[] = [
  {
    id: "step1",
    title: "Paso 1",
    description: "Descripción del primer paso",
    validationSchema: z.object({
      field1: z.string().min(1, "Campo requerido"),
    }),
    sections: [
      {
        id: "section1",
        title: "Sección 1",
        fields: [
          {
            id: "field1",
            type: "text",
            label: "Campo 1",
            name: "field1",
            required: true,
          }
        ]
      }
    ]
  }
];

const MyWizard = () => {
  const handleComplete = async (data: any) => {
    console.log("Datos del wizard:", data);
    // Procesar datos aquí
  };

  return (
    <Wizard
      title="Mi Wizard"
      steps={steps}
      onComplete={handleComplete}
    />
  );
};
```

## Props del Componente Wizard

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `title` | `string` | ✅ | Título principal del wizard |
| `steps` | `WizardStepConfig[]` | ✅ | Configuración de los pasos |
| `onComplete` | `(data: any) => Promise<void> \| void` | ✅ | Función ejecutada al finalizar |
| `description` | `string` | ❌ | Descripción del wizard |
| `onCancel` | `() => void` | ❌ | Función ejecutada al cancelar |
| `defaultValues` | `Record<string, any>` | ❌ | Valores por defecto |
| `validationSchema` | `z.ZodType<any>` | ❌ | Schema global de validación |
| `showProgress` | `boolean` | ❌ | Mostrar barra de progreso (default: true) |
| `allowSkipOptional` | `boolean` | ❌ | Permitir saltar pasos opcionales (default: true) |
| `submitButtonText` | `string` | ❌ | Texto del botón final (default: "Finalizar") |
| `cancelButtonText` | `string` | ❌ | Texto del botón cancelar (default: "Cancelar") |
| `nextButtonText` | `string` | ❌ | Texto del botón siguiente (default: "Siguiente") |
| `previousButtonText` | `string` | ❌ | Texto del botón anterior (default: "Anterior") |

## Configuración de Pasos (WizardStepConfig)

```typescript
interface WizardStepConfig {
  id: string;                    // ID único del paso
  title: string;                 // Título del paso
  description?: string;          // Descripción del paso
  sections: SectionConfig[];     // Secciones del formulario (reutiliza DynamicForm)
  validationSchema?: z.ZodType<any>; // Schema de validación específico del paso
  isOptional?: boolean;          // Si el paso es opcional
}
```

## Reactividad y Cálculos

Para agregar reactividad entre campos, usa la propiedad `onChange` en la configuración del campo:

```typescript
{
  id: "precio",
  type: "number",
  label: "Precio",
  name: "precio",
  onChange: (value, setValue, getValues) => {
    const cantidad = getValues("cantidad");
    if (value && cantidad) {
      setValue("total", value * cantidad);
    }
  }
}
```

## Validación

### Validación por Paso
Cada paso puede tener su propio schema de validación:

```typescript
const stepSchema = z.object({
  nombre: z.string().min(1, "Nombre requerido"),
  email: z.string().email("Email inválido"),
});
```

### Validación Global
También puedes usar un schema que cubra todos los pasos:

```typescript
const globalSchema = z.object({
  paso1: z.object({ ... }),
  paso2: z.object({ ... }),
});
```

## Pasos Opcionales

Marca un paso como opcional para permitir saltarlo:

```typescript
{
  id: "opcional",
  title: "Configuración Avanzada",
  isOptional: true,
  sections: [...]
}
```

## Ejemplo Completo

Ver `WizardExample.tsx` para un ejemplo completo con:
- Múltiples pasos
- Validación por paso
- Campos reactivos
- Pasos opcionales
- Manejo de errores

## Integración con el Sistema Existente

El wizard reutiliza completamente:
- `DynamicForm` y `FormSection` para el renderizado de formularios
- Sistema de validación con Zod
- Componentes UI existentes (Card, Button, Progress, etc.)
- react-hook-form para la gestión de estado

Esto garantiza consistencia visual y funcional con el resto de la aplicación.