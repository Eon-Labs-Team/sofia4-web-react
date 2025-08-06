# Pruebas del Sistema de Reglas - OrdenAplicacion

Este archivo describe las pruebas que se pueden realizar para verificar que el sistema de reglas funciona correctamente.

## ✅ Reglas Implementadas

### 1. **Cuartel → Especie/Variedad**
- **Regla 1**: Cuartel → Especie (lookup)
- **Regla 2**: Cuartel → Variedad (lookup)
- **Regla 3**: Sin cuartel → Limpiar especie
- **Regla 4**: Sin cuartel → Limpiar variedad

**Casos de prueba:**
```
1. Seleccionar cuartel "Cuartel A" → debe llenar especie "Manzana" y variedad "Gala"
2. Seleccionar cuartel "Cuartel B" → debe llenar especie "Pera" y variedad "Williams"
3. Deseleccionar cuartel → debe limpiar especie y variedad
```

### 2. **TaskType ↔ Task (Bidireccional)**
- **Regla 8**: TaskType → Limpiar task si no pertenece
- **Regla 9**: Task → Establecer taskType automáticamente
- **Regla 10**: Sin task → Limpiar taskType (opcional)

**Casos de prueba:**
```
1. Seleccionar taskType "Riego" → mantener task si pertenece a "Riego"
2. Seleccionar taskType "Fumigación" → limpiar task si pertenecía a "Riego"
3. Seleccionar task "Riego por goteo" → establecer taskType "Riego" automáticamente
4. Deseleccionar task → limpiar taskType
```

### 3. **Responsibles → Name Autocompletion**
- **Regla 11**: Supervisor userId → nombre completo
- **Regla 12**: Planner userId → nombre completo
- **Regla 13**: Technical Verifier userId → nombre completo
- **Regla 14**: Applicator userId → nombre completo

**Casos de prueba:**
```
1. Seleccionar supervisor "123" → debe llenar name "Juan Pérez"
2. Seleccionar planner "456" → debe llenar name "María González"
3. Seleccionar verifier "789" → debe llenar name "Carlos Rodríguez"
4. Seleccionar applicator "101" → debe llenar name "Ana López"
```

### 4. **Cálculos Automáticos**
- **Regla 6**: Coverage → Hectáreas aplicadas
- **Regla 7**: Hectáreas → Hectáreas aplicadas

**Casos de prueba:**
```
1. Hectáreas: 10, Coverage: 80% → Hectáreas aplicadas: 8.00
2. Hectáreas: 5, Coverage: 100% → Hectáreas aplicadas: 5.00
3. Cambiar coverage de 80% a 60% → Recalcular hectáreas aplicadas a 6.00
```

## 🧪 Cómo Probar

### En el Formulario Principal (OrdenAplicacion.tsx):
1. Abrir "Nueva Orden de Aplicación" en modo formulario (no wizard)
2. Probar cada caso de prueba mencionado arriba
3. Verificar que los logs aparezcan en la consola del navegador

### En el Wizard:
1. Abrir "Nueva Orden de Aplicación" en modo wizard
2. Ir al paso correspondiente para cada regla
3. Probar los mismos casos de prueba
4. Verificar que el comportamiento sea idéntico al formulario principal

## 🔍 Debugging

### Logs del Sistema:
```javascript
// Cuartel lookup exitoso
"performListLookup: Found varietySpecies = Manzana for _id = cuartel123"

// Task type validation
"🚨 Task cleared - it belonged to different faena: {taskName: 'Riego goteo', oldTaskTypeId: 'riego', newTaskTypeId: 'fumigacion'}"

// Responsible name lookup
"performListLookup: Found fullName = Juan Pérez for _id = worker123"
```

### Verificaciones Visuales:
- Campos deshabilitados (especie, variedad) se llenan automáticamente
- Selects se actualizan cuando cambian sus dependencias
- Cálculos se ejecutan en tiempo real
- No hay errores en la consola del navegador

## ⚠️ Casos Edge:

### Datos Faltantes:
- Qué pasa si no hay cuartelesOptions
- Qué pasa si un cuartel no tiene especie/variedad
- Qué pasa si un worker no tiene nombre completo

### Datos Inconsistentes:
- Task que no tiene taskTypeId
- TaskType que no existe en la lista
- Worker que no existe en la lista

### Comportamiento Esperado:
- Sistema debe manejar gracefully casos edge
- Logs de advertencia en lugar de errores
- Campos vacíos en lugar de crashes