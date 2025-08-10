import { SectionConfig } from "@/components/DynamicForm/DynamicForm";

/**
 * Centralized form configurations for inventory-related forms
 * This ensures consistency across different components that use the same forms
 */

// Product form configuration
export const getInventoryProductFormSections = (): SectionConfig[] => [
  {
    id: "product-info",
    title: "Información del Producto",
    description: "Configure los datos básicos del producto de inventario",
    fields: [
      {
        id: "name",
        name: "name",
        label: "Nombre del Producto",
        type: "text",
        placeholder: "Nombre del producto",
        required: true,
      },
      {
        id: "description",
        name: "description",
        label: "Descripción",
        type: "textarea",
        placeholder: "Descripción detallada del producto (opcional)",
        required: false,
      },
      {
        id: "category",
        name: "category",
        label: "Categoría",
        type: "text",
        placeholder: "Categoría del producto (opcional)",
        required: false,
      },
      {
        id: "structureType",
        name: "structureType",
        label: "Tipo de Estructura",
        type: "select",
        required: true,
        options: [
          { label: "Unitario", value: "unit" },
          { label: "Serie", value: "series" },
        ],
      },
      {
        id: "unit",
        name: "unit",
        label: "Unidad de Medida",
        type: "text",
        placeholder: "Ej: kg, litros, unidades, cajas",
        required: true,
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
  structureType: product?.structureType || "unit",
  unit: product?.unit || "",
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
  name: data.name,
  description: data.description,
  category: data.category,
  structureType: data.structureType,
  unit: data.unit,
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