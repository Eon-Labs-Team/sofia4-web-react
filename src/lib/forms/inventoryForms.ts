import { SectionConfig } from "@/components/DynamicForm/DynamicForm";

/**
 * Centralized form configurations for inventory-related forms
 * This ensures consistency across different components that use the same forms
 */

// Product form configuration
export const getInventoryProductFormSections = (
  categories?: any[],
  subcategories?: any[],
  costClassifications?: any[],
  costSubclassifications?: any[],
  measurementUnits?: any[],
  genericTreatments?: any[]
): SectionConfig[] => [
  {
    id: "basic-info",
    title: "Información Básica",
    description: "Datos principales del producto",
    fields: [
      {
        id: "name",
        name: "name",
        label: "Nombre del Producto *",
        type: "text",
        placeholder: "Nombre del producto",
        required: true,
        helperText: "Nombre identificativo del producto"
      },
      {
        id: "category",
        name: "category",
        label: "Categoría *",
        type: "select",
        placeholder: "Seleccione una categoría",
        required: true,
        helperText: "Categoría del producto",
        options: categories?.map(cat => ({
          value: cat._id,
          label: cat.categoryName
        })) || []
      },
      {
        id: "subcategory",
        name: "subcategory",
        label: "Subcategoría *",
        type: "select",
        placeholder: "Seleccione una subcategoría",
        required: true,
        helperText: "Subcategoría del producto (selección bidireccional con categoría)",
        options: subcategories?.map(subcat => ({
          value: subcat._id,
          label: subcat.name
        })) || []
      },
      {
        id: "structureType",
        name: "structureType",
        label: "Tipo de Estructura *",
        type: "select",
        required: true,
        helperText: "Tipo de estructura del producto",
        options: [
          { label: "Unitario", value: "unit" },
          { label: "Serie", value: "series" },
        ],
      },
      {
        id: "description",
        name: "description",
        label: "Descripción",
        type: "textarea",
        placeholder: "Descripción detallada del producto",
        required: false,
        helperText: "Descripción opcional del producto"
      },
    ],
  },
  {
    id: "units-measurements",
    title: "Unidades y Medidas",
    description: "Configuración de unidades y cantidades",
    fields: [
      {
        id: "unit",
        name: "unit",
        label: "Unidad *",
        type: "text",
        placeholder: "Ej: kg, litros, unidades, cajas",
        required: true,
        helperText: "Unidad base del producto"
      },
      {
        id: "measurementUnit",
        name: "measurementUnit",
        label: "Unidad de Medida *",
        type: "select",
        placeholder: "Seleccione unidad de medida",
        required: true,
        helperText: "Unidad de medida estándar",
        options: measurementUnits?.map(unit => ({
          value: unit._id,
          label: unit.measurementUnitName
        })) || []
      },
      {
        id: "quantity",
        name: "quantity",
        label: "Cantidad Inicial",
        type: "number",
        placeholder: "Cantidad inicial del producto",
        required: false,
        helperText: "Cantidad inicial del producto (opcional)"
      },
      {
        id: "minimumQuantity",
        name: "minimumQuantity",
        label: "Cantidad Mínima en Stock",
        type: "number",
        placeholder: "Cantidad mínima en stock",
        required: false,
        helperText: "Cantidad mínima a mantener en inventario"
      },
    ],
  },
  {
    id: "cost-classification",
    title: "Clasificación de Costos",
    description: "Configuración de clasificación contable",
    fields: [
      {
        id: "costClassification",
        name: "costClassification",
        label: "Clasificación de Costo *",
        type: "select",
        placeholder: "Seleccione clasificación de costo",
        required: true,
        helperText: "Clasificación de costo del producto",
        options: costClassifications?.map(classification => ({
          value: classification._id,
          label: classification.name
        })) || []
      },
      {
        id: "costSubclassification",
        name: "costSubclassification",
        label: "Subclasificación de Costo *",
        type: "select",
        placeholder: "Seleccione una subclasificación",
        required: true,
        helperText: "Subclasificación de costo (selección bidireccional con clasificación)",
        options: costSubclassifications?.map(subclassification => ({
          value: subclassification._id,
          label: subclassification.name
        })) || []
      },
    ],
  }, 
  {
    id: "usage-parameters",
    title: "Parámetros de Uso",
    description: "Cantidades y dosis de aplicación",
    fields: [
      {
        id: "minimumUsageQuantity",
        name: "minimumUsageQuantity",
        label: "Cantidad Mínima de Uso",
        type: "number",
        placeholder: "Cantidad mínima por uso",
        required: false,
        helperText: "Cantidad mínima por aplicación/uso"
      },
      {
        id: "maximumUsageQuantity",
        name: "maximumUsageQuantity",
        label: "Cantidad Máxima de Uso",
        type: "number",
        placeholder: "Cantidad máxima por uso",
        required: false,
        helperText: "Cantidad máxima por aplicación/uso"
      },
      {
        id: "minimumDose",
        name: "minimumDose",
        label: "Dosis Mínima",
        type: "number",
        placeholder: "Dosis mínima",
        required: false,
        helperText: "Dosis mínima recomendada"
      },
      {
        id: "maximumDose",
        name: "maximumDose",
        label: "Dosis Máxima",
        type: "number",
        placeholder: "Dosis máxima",
        required: false,
        helperText: "Dosis máxima permitida"
      },
    ],
  },
  {
    id: "safety-restrictions",
    title: "Seguridad y Restricciones",
    description: "Parámetros de seguridad y restricciones de uso",
    fields: [
      {
        id: "hitlistCode",
        name: "hitlistCode",
        label: "Código de Lista de Restricciones",
        type: "select",
        placeholder: "Seleccione código de restricción",
        required: false,
        helperText: "Nivel de restricción del producto",
        options: [
          { value: '0', label: "Altamente restringido" },
          { value: '1', label: "Prohibido" },
          { value: '2', label: "Reducir progresivamente" },
          { value: '3', label: "Restringido" },
        ]
      },
      {
        id: "carenceDays",
        name: "carenceDays",
        label: "Días de Carencia",
        type: "number",
        placeholder: "Días de carencia",
        required: false,
        helperText: "Días que deben transcurrir después de la aplicación"
      },
      {
        id: "reentryHours",
        name: "reentryHours",
        label: "Horas de Reingreso",
        type: "number",
        placeholder: "Horas de reingreso",
        required: false,
        helperText: "Horas antes de poder reingresar al área tratada"
      },
    ],
  },
  {
    id: "treatments-associations",
    title: "Tratamientos Asociados",
    description: "Tratamientos genéricos relacionados con el producto",
    fields: [
      {
        id: "treatments",
        name: "treatments",
        label: "Tratamientos Genéricos",
        type: "checkboxGroup",
        required: false,
        helperText: "Seleccione los tratamientos genéricos asociados al producto",
        options: genericTreatments?.map(treatment => ({
          value: treatment._id,
          label: treatment.name
        })) || []
      },
    ],
  },
 
];

// Warehouse form configuration
export const getInventoryWarehouseFormSections = (): SectionConfig[] => [
  {
    id: "warehouse-info",
    title: "Información de la Bodega",
    description: "Configure los datos básicos de la bodega del predio",
    fields: [
      {
        id: "name",
        name: "name",
        label: "Nombre de la Bodega",
        type: "text",
        placeholder: "Ej: Bodega Principal",
        required: true,
      },
      {
        id: "locationName",
        name: "locationName",
        label: "Nombre de la Ubicación",
        type: "text",
        placeholder: "Ej: Sector A - Galpón 1",
        required: true,
      },
      {
        id: "locationCapacity",
        name: "locationCapacity",
        label: "Capacidad",
        type: "number",
        placeholder: "Capacidad de la bodega (opcional)",
        required: false,
      },
      {
        id: "status",
        name: "status",
        label: "Estado Activo",
        type: "checkbox",
        required: false,
      },
    ],
  },
];

// Lot form configuration
export const getInventoryLotFormSections = (): SectionConfig[] => [
  {
    id: "lot-info",
    title: "Información del Lote",
    description: "Configure los datos del lote de inventario",
    fields: [
      {
        id: "lotNumber",
        name: "lotNumber",
        label: "Número de Lote",
        type: "text",
        placeholder: "Número único del lote",
        required: true,
      },
      {
        id: "lotName",
        name: "lotName",
        label: "Nombre del Lote",
        type: "text",
        placeholder: "Nombre descriptivo (opcional)",
        required: false,
      },
      {
        id: "quantity",
        name: "quantity",
        label: "Cantidad",
        type: "number",
        placeholder: "Cantidad del lote",
        required: true,
      },
      {
        id: "status",
        name: "status",
        label: "Estado",
        type: "select",
        required: true,
        options: [
          { label: "Activo", value: "active" },
          { label: "Inactivo", value: "inactive" },
        ],
      },
      {
        id: "manufactureDate",
        name: "manufactureDate",
        label: "Fecha de Fabricación",
        type: "date",
        required: false,
      },
      {
        id: "expiryDate",
        name: "expiryDate",
        label: "Fecha de Vencimiento",
        type: "date",
        required: false,
      },
    ],
  },
];

// Default values factories for consistent initialization
export const getDefaultProductValues = (product?: any) => ({
  name: product?.name || "",
  description: product?.description || "",
  category: product?.category || "",
  subcategory: product?.subcategory || "",
  structureType: product?.structureType || "unit",
  quantity: product?.quantity || 0,
  unit: product?.unit || "",
  measurementUnit: product?.measurementUnit || "",
  hitlistCode: product?.hitlistCode !== undefined ? product.hitlistCode : 0,
  minimumQuantity: product?.minimumQuantity !== undefined ? product.minimumQuantity : 0,
  minimumUsageQuantity: product?.minimumUsageQuantity !== undefined ? product.minimumUsageQuantity : 0,
  maximumUsageQuantity: product?.maximumUsageQuantity !== undefined ? product.maximumUsageQuantity : 0,
  carenceDays: product?.carenceDays !== undefined ? product.carenceDays : 0,
  reentryHours: product?.reentryHours !== undefined ? product.reentryHours : 0,
  minimumDose: product?.minimumDose !== undefined ? product.minimumDose : 0,
  maximumDose: product?.maximumDose !== undefined ? product.maximumDose : 0,
  treatments: product?.treatments || [],
  costClassification: product?.costClassification || "",
  costSubclassification: product?.costSubclassification || "",
  isDeleted: product?.isDeleted || false,
});

export const getDefaultWarehouseValues = (warehouse?: any) => ({
  name: warehouse?.name || "",
  locationName: warehouse?.location?.name || "",
  locationCapacity: warehouse?.location?.capacity || "",
  status: warehouse?.status !== undefined ? warehouse.status : true,
});

export const getDefaultLotValues = (lot?: any) => ({
  lotNumber: lot?.lotNumber || "",
  lotName: lot?.lotName || "",
  quantity: lot?.quantity || 0,
  status: lot?.status || "active",
  manufactureDate: lot?.manufactureDate ? new Date(lot.manufactureDate).toISOString().split('T')[0] : "",
  expiryDate: lot?.expiryDate ? new Date(lot.expiryDate).toISOString().split('T')[0] : "",
});

// Form submission handlers for consistent data processing
export const processProductFormData = (data: any) => ({
  name: data.name, // string (required)
  description: data.description || undefined, // string? (optional)
  category: data.category || undefined, // string? (optional)
  subcategory: data.subcategory || undefined, // string? (optional)
  structureType: data.structureType, // 'unit' | 'series' (required)
  quantity: data.quantity ? Number(data.quantity) : undefined, // number? (optional)
  unit: data.unit, // string (required)
  measurementUnit: data.measurementUnit, // string (required)
  hitlistCode: data.hitlistCode !== "" ? Number(data.hitlistCode) : 0, // number (required, default 0)
  minimumQuantity: data.minimumQuantity ? Number(data.minimumQuantity) : 0, // number (required, default 0)
  minimumUsageQuantity: data.minimumUsageQuantity ? Number(data.minimumUsageQuantity) : 0, // number (required, default 0)
  maximumUsageQuantity: data.maximumUsageQuantity ? Number(data.maximumUsageQuantity) : 0, // number (required, default 0)
  carenceDays: data.carenceDays ? Number(data.carenceDays) : 0, // number (required, default 0)
  reentryHours: data.reentryHours ? Number(data.reentryHours) : 0, // number (required, default 0)
  minimumDose: data.minimumDose ? Number(data.minimumDose) : 0, // number (required, default 0)
  maximumDose: data.maximumDose ? Number(data.maximumDose) : 0, // number (required, default 0)
  treatments: data.treatments || [], // string[] (required, default empty array)
  costClassification: data.costClassification, // string (required)
  costSubclassification: data.costSubclassification, // string (required)
  isDeleted: false, // boolean (required, always false for new products)
});

export const processWarehouseFormData = (data: any) => ({
  name: data.name,
  location: {
    name: data.locationName,
    capacity: data.locationCapacity ? Number(data.locationCapacity) : undefined,
  },
  status: data.status !== undefined ? data.status : true,
});

export const processLotFormData = (data: any) => ({
  lotNumber: data.lotNumber,
  lotName: data.lotName,
  quantity: Number(data.quantity),
  status: data.status,
  manufactureDate: data.manufactureDate ? new Date(data.manufactureDate) : undefined,
  expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
});