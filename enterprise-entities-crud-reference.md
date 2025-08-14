# Enterprise Entities - CRUD Reference

Esta documentación proporciona información para implementar el frontend de las entidades del módulo `/enterprise` de Sofia's agricultural management API.

## Configuración General

### Base URL
```
/enterprise/{entidad}
```

### Headers Requeridos
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}"
}
```

## Entidades Disponibles

| Entidad | Endpoint | Descripción |
|---------|----------|-------------|
| `costClassification` | `/enterprise/costClassification` | Clasificación de costos |
| `costSubclassification` | `/enterprise/costSubclassification` | Subclasificación de costos |
| `cropType` | `/enterprise/cropType` | Tipos de cultivos |
| `machineryBrand` | `/enterprise/machineryBrand` | Marcas de maquinaria |
| `machineryType` | `/enterprise/machineryType` | Tipos de maquinaria |
| `maritalStatus` | `/enterprise/maritalStatus` | Estados civiles |
| `measurementUnits` | `/enterprise/measurementUnits` | Unidades de medida |
| `pressureUnit` | `/enterprise/pressureUnit` | Unidades de presión |
| `productCategory` | `/enterprise/productCategory` | Categorías de productos |
| `soilType` | `/enterprise/soilType` | Tipos de suelo |
| `temperatureUnit` | `/enterprise/temperatureUnit` | Unidades de temperatura |
| `varietyType` | `/enterprise/varietyType` | Tipos de variedades |
| `wasteType` | `/enterprise/wasteType` | Tipos de residuos |
| `weatherConditions` | `/enterprise/weatherCondition` | Condiciones climáticas |
| `windConditions` | `/enterprise/windCondition` | Condiciones de viento |

## Operaciones CRUD Estándar

Todas las entidades siguen el mismo patrón de endpoints:

### 1. Obtener por ID
```http
GET /enterprise/{entidad}/:id
```
- **Uso**: Obtener un registro específico
- **Cache**: Redis habilitado para optimización
- **Response**: Objeto de la entidad

### 2. Listar Todos
```http
GET /enterprise/{entidad}
```
- **Uso**: Obtener lista paginada de registros
- **Query Parameters**:
  - `offset`: Número de registros a omitir (paginación)
  - `limit`: Cantidad máxima de registros a retornar
- **Response**: Array de objetos de la entidad

### 3. Crear Nuevo
```http
POST /enterprise/{entidad}
```
- **Uso**: Crear un nuevo registro
- **Body**: Objeto con datos de la entidad (sin ID)
- **Response**: Objeto creado con ID asignado

### 4. Actualizar
```http
PATCH /enterprise/{entidad}/:id
```
- **Uso**: Actualizar un registro existente
- **Body**: Objeto con campos a actualizar (parcial)
- **Response**: Mensaje de confirmación

### 5. Cambiar Estado
```http
PUT /enterprise/{entidad}/:id/state/:state
```
- **Uso**: Activar/desactivar registro
- **Params**:
  - `id`: ID del registro
  - `state`: Nuevo estado (`active` | `inactive`)
- **Response**: Mensaje de confirmación

## Estructura de Respuesta

### Respuesta Exitosa (GET individual)
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "state": "active|inactive",
  "createdAt": "ISO Date",
  "updatedAt": "ISO Date"
}
```

### Respuesta de Lista (GET all)
```json
[
  {
    "_id": "string",
    "name": "string",
    "description": "string",
    "state": "active|inactive",
    "createdAt": "ISO Date",
    "updatedAt": "ISO Date"
  }
]
```

### Respuesta de Operaciones (POST/PATCH/PUT)
```json
{
  "message": "string"
}
```

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| `200` | Operación exitosa |
| `201` | Registro creado exitosamente |
| `400` | Error en los datos enviados |
| `404` | Registro no encontrado |
| `500` | Error interno del servidor |

## Consideraciones para Frontend

### Paginación
- Implementar controles de paginación usando `offset` y `limit`
- Valores recomendados: `limit=10` o `limit=20`

### Cache
- Los registros individuales están en cache (Redis)
- Las listas no están cacheadas para datos en tiempo real

### Estados
- Todos los registros tienen un campo `state`
- Implementar toggle para activar/desactivar
- Filtrar por estado en el frontend si es necesario

### Validación
- Validar campos requeridos antes de enviar
- Manejar errores de validación del servidor

### UX Recomendada
- **Listado**: Tabla con paginación, filtros y búsqueda
- **Formularios**: Modal o página separada para crear/editar
- **Estados**: Toggle switch o botones de acción
- **Confirmación**: Diálogos para operaciones de eliminación/cambio de estado

## Ejemplo de Implementación (JavaScript)

```javascript
// Servicio base para entidades enterprise
class EnterpriseEntityService {
  constructor(entityName) {
    this.baseUrl = `/enterprise/${entityName}`;
  }

  async getAll(offset = 0, limit = 10) {
    const response = await fetch(`${this.baseUrl}?offset=${offset}&limit=${limit}`);
    return response.json();
  }

  async getById(id) {
    const response = await fetch(`${this.baseUrl}/${id}`);
    return response.json();
  }

  async create(data) {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async update(id, data) {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async updateState(id, state) {
    const response = await fetch(`${this.baseUrl}/${id}/state/${state}`, {
      method: 'PUT'
    });
    return response.json();
  }
}

// Uso específico
const cropTypeService = new EnterpriseEntityService('cropType');
const measurementUnitsService = new EnterpriseEntityService('measurementUnits');
```

## Notas Importantes

- **Autenticación**: Verificar que el middleware de autenticación esté configurado
- **Multi-tenant**: Todas las operaciones son por empresa (enterprise)
- **Redis**: Cache habilitado para optimización de consultas individuales
- **Consistencia**: Todas las entidades siguen exactamente el mismo patrón
- **Estado**: Implementar lógica de activación/desactivación en lugar de eliminación física