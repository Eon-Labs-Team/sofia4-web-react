# Guía de Inventario - Frontend Development

Esta guía detalla todos los modelos, rutas y características principales del módulo de Inventario para implementar las funcionalidades en el frontend (grillas, formularios CRUD).

## 🏗️ Arquitectura del Inventario

El módulo de inventario maneja un sistema multi-bodega con las siguientes entidades principales:

### 1. **Product** - Productos del inventario
### 2. **Warehouse** - Bodegas (centrales y de predios)
### 3. **Lot** - Lotes de productos
### 4. **InventoryMovement** - Movimientos de inventario
### 5. **Invoice** - Facturas de compra

---

## 📦 1. PRODUCTS (Productos)

### Modelo TypeScript
```typescript
interface IInventoryProduct {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  structureType: 'unit' | 'series';
  quantity?: number; // Campo legacy, no usar
  unit: string;
  isDeleted: boolean;
  propertyId: string; // ID de la propiedad/empresa
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints
```
Base URL: /product

GET    /product/:id                    - Obtener producto por ID
GET    /product/withLots/:id          - Obtener producto con sus lotes activos
GET    /product/stockLevels/:id       - Obtener niveles de stock (central/predio)
GET    /product/byName/:name          - Buscar producto por nombre
POST   /product                       - Crear producto
POST   /product/secondary             - Crear producto con lote automático
PATCH  /product/:id                   - Actualizar producto
DELETE /product/:id                   - Eliminar producto
```

### Campos Obligatorios para Formularios
- `name`: Nombre del producto (string, requerido)
- `structureType`: Tipo de estructura ('unit' | 'series')
- `unit`: Unidad de medida (string, requerido)

### Campos Opcionales
- `description`: Descripción del producto
- `category`: Categoría del producto

### Consideraciones Especiales
- El campo `quantity` está deprecated, usar lotes para manejar cantidades
- Al crear un producto, considerar usar `/product/secondary` para crear automáticamente un lote por defecto
- Los productos se filtran por `propertyId` automáticamente via middleware

---

## 🏪 2. WAREHOUSES (Bodegas)

### Modelo TypeScript
```typescript
interface IInventoryWarehouse {
  _id: string;
  name: string;
  status: boolean;
  isDeleted: boolean;
  propertyId: string; // '0' para central, otro valor para predio
  location: {
    name: string;
    id?: string;
    capacity?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints
```
Base URL: /warehouse

GET    /warehouse/findAll                    - Obtener todas las bodegas
GET    /warehouse/central                    - Obtener solo bodegas centrales (propertyId = '0')
GET    /warehouse/property                   - Obtener solo bodegas de predio (propertyId != '0')
GET    /warehouse/byPropertyId/:propertyId   - Obtener bodegas por propertyId específico
GET    /warehouse/:id                        - Obtener bodega por ID
GET    /warehouse/byName/:name               - Buscar bodega por nombre (con acentos)
POST   /warehouse                            - Crear bodega
PATCH  /warehouse/:id                        - Actualizar bodega
DELETE /warehouse/:id                        - Eliminar bodega
```

### Campos Obligatorios para Formularios
- `name`: Nombre de la bodega (string, requerido)
- `propertyId`: ID de propiedad ('0' para central, otro para predio)
- `location.name`: Nombre de ubicación

### Campos Opcionales
- `status`: Estado activo/inactivo (default: true)
- `location.capacity`: Capacidad de la bodega

### Tipos de Bodega
- **Central**: `propertyId = '0'` - Para stock central
- **Predio**: `propertyId != '0'` - Para stock específico de propiedades

---

## 📋 3. LOTS (Lotes)

### Modelo TypeScript
```typescript
interface IInventoryLot {
  _id: string;
  productId: string;
  warehouseId: string;
  lotNumber: string;
  lotName?: string;
  manufactureDate?: Date;
  expiryDate?: Date;
  quantity: number;
  status: string; // 'active', 'inactive', etc.
  propertyId: string; // Para filtrar por propiedad
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints
```
Base URL: /lot

GET    /lot/:id                                                     - Obtener lote por ID
GET    /lot/byProductId/:productId                                  - Obtener lotes por producto
GET    /lot/activeByProductId/:productId                           - Obtener lotes activos por producto
GET    /lot/activeByProductIdOrderedByExpiry/:productId            - Obtener lotes activos ordenados por vencimiento (FIFO)
GET    /lot/activeByProductIdAndPropertyId/:productId/:propertyId  - Obtener lotes activos por producto y propiedad
POST   /lot                                                         - Crear lote
PATCH  /lot/:id                                                     - Actualizar lote
DELETE /lot/:id                                                     - Eliminar lote
```

### Campos Obligatorios para Formularios
- `productId`: ID del producto (string, requerido)
- `warehouseId`: ID de la bodega (string, requerido)
- `lotNumber`: Número de lote (string, requerido)
- `quantity`: Cantidad inicial (number, requerido)
- `status`: Estado del lote (default: 'active')
- `propertyId`: ID de la propiedad

### Campos Opcionales
- `lotName`: Nombre descriptivo del lote
- `manufactureDate`: Fecha de fabricación
- `expiryDate`: Fecha de vencimiento

### Lógica de Negocio
- Los lotes manejan las cantidades reales de productos
- Se usa FIFO (First In, First Out) para consumo por fecha de vencimiento
- Lotes con `quantity = 0` siguen activos para historial
- Lotes negativos se crean para manejo de stock negativo

---

## 📈 4. INVENTORY MOVEMENTS (Movimientos de Inventario)

### Modelo TypeScript
```typescript
interface IInventoryMovement {
  _id: string;
  productId: string;
  lotId?: string;
  movementType: string;
  quantity: number;
  movementDate: Date;
  warehouseId: string;
  destinationWarehouseId?: string;
  comments?: string;
  propertyId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Tipos de Movimiento
- **ASSIGN_OUT**: Salida por asignación desde central
- **ASSIGN_IN**: Entrada por asignación a predio
- **CONSUME**: Consumo de producto
- **CONSUME_NEGATIVE**: Consumo con stock negativo
- **MANUAL_CHANGE**: Cambio manual de stock
- **RESTORE**: Restauración de stock
- **TRANSFER_OUT**: Salida por transferencia
- **TRANSFER_IN**: Entrada por transferencia

### API Endpoints
```
Base URL: /inventoryMovement

GET    /inventoryMovement/byProductId/:productId                    - Movimientos por producto
GET    /inventoryMovement/byLotId/:lotId                           - Movimientos por lote
GET    /inventoryMovement/history/:warehouseId/:productId          - Historial por bodega y producto
GET    /inventoryMovement/completeHistory/:productId               - Historial completo por producto
GET    /inventoryMovement/exportReport/:productId                  - Exportar reporte de movimientos
POST   /inventoryMovement                                          - Crear movimiento básico

# Operaciones Especiales
POST   /inventoryMovement/assign        - Asignar stock de central a predio
POST   /inventoryMovement/consume       - Consumir producto (con FIFO)
POST   /inventoryMovement/move          - Mover producto entre bodegas
POST   /inventoryMovement/manualChange  - Cambio manual de stock
POST   /inventoryMovement/restore       - Restaurar stock
```

### Operaciones Complejas

#### Asignar Stock (Central → Predio)
```typescript
POST /inventoryMovement/assign
{
  productId: string;
  quantity: number;
  sourceWarehouseId: string;    // Bodega central
  destinationWarehouseId: string; // Bodega de predio
  propertyId: string;           // ID del predio destino
}
```

#### Consumir Producto
```typescript
POST /inventoryMovement/consume
{
  productId: string;
  quantity: number;
  warehouseId: string;
  propertyId: string;
  allowNegativeStock?: boolean;  // Permitir stock negativo
  negativeStockLimit?: number;   // Límite de stock negativo
  comments?: string;
}
```

#### Cambio Manual de Stock
```typescript
POST /inventoryMovement/manualChange
{
  productId: string;
  warehouseId: string;
  newQuantity: number;          // Nueva cantidad total
  reason: string;               // Motivo del cambio
  propertyId: string;
}
```

---

## 🧾 5. INVOICES (Facturas)

### Modelo TypeScript
```typescript
interface IInventoryInvoice {
  _id: string;
  invoiceNumber: string;
  supplier: string;
  date: Date;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    lotNumber?: string;
    lotName?: string;
    manufactureDate?: Date;
    expiryDate?: Date;
  }>;
  warehouseId: string;
  totalAmount: number;
  status: string;
  propertyId: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### API Endpoints
```
Base URL: /invoice

GET    /invoice/:id                           - Obtener factura por ID
GET    /invoice/byInvoiceNumber/:number       - Obtener facturas por número
POST   /invoice/central                       - Crear factura para bodega central
POST   /invoice/property                      - Crear factura para bodega de predio
POST   /invoice                              - Crear factura básica
PATCH  /invoice/:id                          - Actualizar factura
DELETE /invoice/:id                          - Eliminar factura
```

### Estructura de Items para Formularios
```typescript
interface InvoiceItem {
  productId: string;        // ID del producto (requerido)
  quantity: number;         // Cantidad (requerido)
  unitPrice: number;        // Precio unitario (requerido)
  lotNumber?: string;       // Número de lote (opcional)
  lotName?: string;         // Nombre del lote (opcional)
  manufactureDate?: Date;   // Fecha de fabricación (opcional)
  expiryDate?: Date;        // Fecha de vencimiento (opcional)
}
```

### Campos Obligatorios para Formularios
- `invoiceNumber`: Número de factura (string, requerido)
- `supplier`: Proveedor (string, requerido)
- `date`: Fecha de factura (Date, requerido)
- `items`: Array de productos (requerido, mínimo 1 item)
- `warehouseId`: ID de bodega destino (string, requerido)
- `totalAmount`: Monto total calculado (number, requerido)

### Lógica de Negocio
- Las facturas crean automáticamente lotes para cada item
- `/invoice/central` crea lotes con `propertyId = '0'`
- `/invoice/property` crea lotes con el `propertyId` especificado
- El `totalAmount` debe calcularse: `sum(item.quantity * item.unitPrice)`

---

## 🎯 Características Principales del Sistema

### 1. Multi-Tenant por PropertyId
- Todas las entidades se filtran automáticamente por `propertyId`
- Bodegas centrales usan `propertyId = '0'`
- Bodegas de predio usan `propertyId` específico

### 2. Sistema de Lotes FIFO
- Los consumos siguen orden por fecha de vencimiento
- Lotes con cantidad 0 se mantienen para historial
- Soporte para stock negativo controlado

### 3. Operaciones Complejas
- **Asignación**: Mover stock de central a predios
- **Transferencia**: Mover stock entre bodegas
- **Consumo**: Reducir stock con FIFO automático
- **Ajustes**: Cambios manuales con rastreabilidad

### 4. Trazabilidad Completa
- Todos los movimientos se registran
- Historial completo por producto/bodega
- Comentarios obligatorios para cambios manuales

---

## 🔧 Consideraciones para el Frontend

### Formularios Sugeridos

#### 1. Producto
- Campos: name, description, category, structureType, unit
- Validaciones: name requerido, structureType enum
- Post-creación: Opcional crear lote automático

#### 2. Bodega  
- Campos: name, propertyId, location.name, location.capacity
- Validaciones: name requerido, propertyId requerido
- Dropdown: Tipo de bodega (Central/Predio)

#### 3. Lote
- Campos: productId, warehouseId, lotNumber, quantity, manufactureDate, expiryDate
- Validaciones: Todos requeridos excepto fechas
- Auto-generar: lotNumber si está vacío

#### 4. Movimiento de Inventario
- Usar endpoints especializados según operación
- Formularios específicos para: Asignar, Consumir, Transferir, Ajustar
- Siempre incluir comentarios para trazabilidad

#### 5. Factura
- Master-detail: Header + Items array
- Auto-calcular: totalAmount basado en items
- Crear lotes automáticamente al guardar

### Grillas Sugeridas

#### 1. Productos con Stock
- Columnas: name, category, centralStock, propertyStock, totalStock
- Endpoint: GET con join a lotes para mostrar stock
- Filtros: category, propertyId

#### 2. Movimientos de Inventario  
- Columnas: productName, movementType, quantity, date, comments
- Endpoint: /inventoryMovement/completeHistory/:productId
- Filtros: dateRange, movementType, warehouseId

#### 3. Lotes por Vencimiento
- Columnas: productName, lotNumber, quantity, expiryDate, status
- Endpoint: /lot/activeByProductIdOrderedByExpiry/:productId
- Alertas: Lotes próximos a vencer

### Validaciones del Frontend
- Verificar stock disponible antes de permitir consumos
- Validar fechas de vencimiento futuras
- Confirmar operaciones que generen stock negativo
- Validar permisos por propertyId

---

## 📊 Endpoints de Integración Recomendados

Para dashboards y reportes, considerar crear endpoints adicionales:
- Stock resumen por producto y bodega
- Movimientos consolidados por período
- Productos con stock bajo
- Lotes próximos a vencer
- Historial de transferencias entre bodegas