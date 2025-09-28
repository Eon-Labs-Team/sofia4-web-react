# Guía de Manejo de Respuestas Mejoradas

Esta guía explica cómo implementar el manejo de respuestas estándar mejoradas en componentes que crean o actualizan entidades con posible asociación de trabajo.

## Formato de Respuesta Estándar

El backend puede devolver respuestas en el siguiente formato mejorado:

```typescript
{
  status: 'OK' | 'PARTIAL' | 'FAIL',
  data: {
    success: boolean,
    overallResult: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILURE',
    message: string,
    operations: [
      {
        operation: 'WORK_CREATION' | 'ENTITY_CREATION',
        result: 'SUCCESS' | 'FAILURE',
        error?: string,
        data?: any,
        message: string
      }
    ],
    results?: {
      entityRecords?: any[],
      workRecord?: any
    },
    metadata: {
      timestamp: string,
      entityType: string,
      recordsAttempted: number,
      recordsCreated: number
    }
  }
}
```

## Tipos de Resultado

### SUCCESS (status: 'OK')
- Ambas operaciones (creación de entidad y trabajo) fueron exitosas
- Se muestra mensaje de éxito completo

### PARTIAL_SUCCESS (status: 'PARTIAL')
- Solo una operación fue exitosa
- Se muestra alerta de éxito parcial con detalles específicos
- Ejemplo: "Monitoreo creado exitosamente, pero falló la creación del trabajo asociado"

### FAILURE (status: 'FAIL')
- Ambas operaciones fallaron o error crítico
- Se muestra mensaje de error con detalles específicos

## Implementación

### 1. Importar las Funciones de Utilidad

```typescript
import {
  handleResponseWithFallback,
  handleErrorWithEnhancedFormat
} from "@/lib/utils/responseHandler";
```

### 2. Manejar Respuestas Exitosas

```typescript
const result = await service.createEntityWithWork(entityData, workData);

handleResponseWithFallback(
  result,
  'creation', // o 'update'
  'ENTITY_TYPE', // Tipo de entidad (ver ENTITY_LABELS)
  "Mensaje de fallback para formato legacy"
);
```

### 3. Manejar Errores

```typescript
try {
  // ... operación
} catch (error) {
  handleErrorWithEnhancedFormat(
    error,
    'creation', // o 'update'
    'ENTITY_TYPE',
    "Mensaje de error de fallback"
  );
}
```

## Tipos de Entidad Soportados

Las siguientes entidades están configuradas en `ENTITY_LABELS`:

- `MONITORING_PHENOLOGICAL_STATE`: Monitoreo de Estado Fenológico
- `IRRIGATION_RECORD`: Registro de Riego
- `SOIL_ANALYSIS`: Análisis de Suelo
- `LEAF_ANALYSIS`: Análisis Foliar
- `EQUIPMENT_CALIBRATION`: Calibración de Equipo
- `FACILITY_CLEANING`: Limpieza de Instalación
- `WASTE_MANAGEMENT`: Manejo de Residuos
- `WEED_MONITORING`: Monitoreo de Maleza
- `WEATHER_EVENT`: Evento Climático
- Y muchas más...

## Ejemplo Completo

```typescript
// En handleWorkAssociation de un componente
const handleWorkAssociation = async (workAssociationData: WorkAssociationData) => {
  try {
    if (!pendingEntityData) return;

    const result = await createEntityWithWork(pendingEntityData, workAssociationData);
    
    // Manejo automático de respuesta mejorada con fallback
    handleResponseWithFallback(
      result,
      'creation',
      'MONITORING_PHENOLOGICAL_STATE',
      "Monitoreo creado correctamente"
    );

    // Actualizar estado del componente
    fetchRecords();
    setShowWorkWizard(false);
    setPendingEntityData(null);
    
  } catch (error) {
    console.error("Error creating entity:", error);
    
    // Manejo automático de errores con formato mejorado
    handleErrorWithEnhancedFormat(
      error,
      'creation',
      'MONITORING_PHENOLOGICAL_STATE',
      "No se pudo crear el monitoreo"
    );
  }
};
```

## Beneficios

1. **Información Granular**: Saber exactamente qué operación falló (trabajo vs entidad)
2. **Alertas Específicas**: Mensajes detallados según el tipo de fallo
3. **Consistencia**: Mismo manejo en toda la aplicación
4. **Retrocompatibilidad**: Funciona con respuestas legacy
5. **Reutilización**: Funciones de utilidad para todos los componentes

## Migración de Componentes Existentes

Para migrar un componente existente:

1. Importar las funciones de `responseHandler.ts`
2. Reemplazar `toast` calls manuales con `handleResponseWithFallback`
3. Reemplazar manejo de errores con `handleErrorWithEnhancedFormat`
4. Especificar el tipo de entidad correcto

## Ejemplo de Alertas (Mensajes Amigables para el Usuario)

### Éxito Completo
- **Título**: "¡Éxito completo!"
- **Descripción**: "Monitoreo creado y trabajo asociado correctamente. 3 registro(s) procesado(s)."

### Éxito Parcial
- **Título**: "Proceso completado parcialmente"
- **Descripción**: "Monitoreo creado exitosamente, pero hubo un problema al crear el trabajo asociado."
- **Acción recomendada** (después de 2s): "El registro se guardó correctamente. Podrás asociar un trabajo más tarde desde la opción de editar."

### Error Completo
- **Título**: "Error en el proceso"
- **Descripción**: "No se pudo crear el monitoreo."
- **¿Qué puedes hacer?** (después de 2s): "Hubo problemas con: registro principal y trabajo asociado. Por favor, verifica los datos ingresados e intenta nuevamente. Si el problema persiste, contacta al soporte técnico."

## Características de los Mensajes Mejorados

### ✅ Mensajes Amigables
- **Sin jerga técnica**: No se muestran errores internos de la API
- **Lenguaje claro**: Explicaciones comprensibles para cualquier usuario
- **Orientados a la acción**: Se indica qué puede hacer el usuario

### 🎯 Información Útil
- **Contexto específico**: Se indica qué parte del proceso falló
- **Recomendaciones claras**: Pasos a seguir según el tipo de error
- **Expectativas realistas**: Se explica qué se logró y qué no

### 💡 Ejemplos de Transformación

**Antes (mensaje técnico de API):**
```
❌ Trabajo: ValidationError: required field 'date' is missing
❌ Monitoreo: Database connection timeout
```

**Después (mensaje amigable):**
```
🔄 Error en el proceso
No se pudo crear el monitoreo.

¿Qué puedes hacer?
Hubo problemas con: registro principal y trabajo asociado. 
Por favor, verifica los datos ingresados e intenta nuevamente. 
Si el problema persiste, contacta al soporte técnico.
```
