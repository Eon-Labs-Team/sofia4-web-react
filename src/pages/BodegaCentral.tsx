import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Tag,
  Box,
  ArrowRightLeft,
  Warehouse,
} from "lucide-react";
import { Column } from "@/lib/store/gridStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { IInventoryProduct, IInventoryWarehouse, IInventoryLot } from "@eon-lib/eon-mongoose";
import inventoryProductService from "@/_services/inventoryProductService";
import inventoryWarehouseService from "@/_services/inventoryWarehouseService";
import inventoryMovementService from "@/_services/inventoryMovementService";
import inventoryLotService from "@/_services/inventoryLotService";
import propertyService from "@/_services/propertyService";
import productCategoryService from "@/_services/productCategoryService";
import productSubcategoryService from "@/_services/productSubcategoryService";
import costClassificationService from "@/_services/costClassificationService";
import costSubclassificationService from "@/_services/costSubclassificationService";
import measurementUnitsService from "@/_services/measurementUnitsService";
import genericTreatmentService from "@/_services/genericTreatmentService";
import { toast } from "@/components/ui/use-toast";
import DynamicForm from "@/components/DynamicForm/DynamicForm";
import { 
  getInventoryProductFormSections,
  getDefaultProductValues,
  processProductFormData
} from "@/lib/forms/inventoryForms";
import { z } from "zod";
import { FormGridRules } from "@/lib/validationSchemas";

// Schema de validación para asignación de stock
const assignStockSchema = z.object({
  productId: z.string().min(1, "El producto es obligatorio"),
  quantity: z.number().positive("La cantidad debe ser mayor a 0"),
  destinationWarehouseId: z.string().min(1, "La bodega destino es obligatoria"),
  propertyId: z.string().min(1, "El predio destino es obligatorio"),
  comments: z.string().optional(),
});

// Schema de validación para crear bodega central
const centralWarehouseSchema = z.object({
  name: z.string().min(1, "El nombre de la bodega es obligatorio"),
  locationName: z.string().min(1, "La ubicación es obligatoria"),
  locationCapacity: z.number().positive("La capacidad debe ser positiva").optional(),
});

// Field rules para el formulario de asignación
const createAssignFieldRules = (
  allWarehouses: IInventoryWarehouse[]
): FormGridRules => {
  return {
    rules: [
      // Regla 1: Cuando se selecciona un predio, filtrar las bodegas disponibles
      {
        trigger: { 
          field: 'propertyId',
          condition: (value) => value !== null && value !== undefined && value !== ''
        },
        action: {
          type: 'filterOptions',
          targetField: 'destinationWarehouseId',
          filterListKey: 'warehousesOptions',
          filterByField: 'propertyId', // Filtrar por propertyId
        }
      },
      // Regla 2: Limpiar bodega destino cuando cambia el predio
      {
        trigger: { 
          field: 'propertyId',
          condition: (value) => value !== null && value !== undefined && value !== ''
        },
        action: {
          type: 'preset',
          targetField: 'destinationWarehouseId',
          preset: () => '' // Limpiar selección cuando cambia el predio
        }
      },
      // Regla 3: Cuando se deselecciona el predio, limpiar bodega destino y mostrar todas
      {
        trigger: { 
          field: 'propertyId',
          condition: (value) => value === null || value === undefined || value === ''
        },
        action: {
          type: 'preset',
          targetField: 'destinationWarehouseId',
          preset: () => ''
        }
      }
    ],
    externalData: {
      warehousesOptions: allWarehouses
        .filter(w => w.propertyId !== '0') // Excluir bodegas centrales para destino
        .map(warehouse => ({
          _id: warehouse._id,
          name: warehouse.name,
          propertyId: warehouse.propertyId, // Asegurar que propertyId esté disponible para filtrado
          location: warehouse.location
        }))
    }
  };
};

// Field rules para el formulario de productos
const createProductFieldRules = (
  subcategories: any[],
  costSubclassifications: any[]
): FormGridRules => {
  return {
    rules: [
      // =====================================
      // REGLAS PARA CATEGORÍA Y SUBCATEGORÍA
      // =====================================
      
      // Regla 1: Cuando se selecciona una categoría, filtrar subcategorías
      {
        trigger: { 
          field: 'category',
          condition: (value) => value !== null && value !== undefined && value !== ''
        },
        action: {
          type: 'filterOptions',
          targetField: 'subcategory',
          filterListKey: 'subcategoriesOptions',
          filterByField: 'categoryId',
        }
      },
      
      // Regla 2: Limpiar subcategoría solo cuando el usuario cambia manualmente la categoría
      // (no cuando se establece automáticamente desde subcategoría)
      {
        trigger: { 
          field: 'category',
          condition: (value) => value !== null && value !== undefined && value !== ''
        },
        action: {
          type: 'preset',
          targetField: 'subcategory',
          preset: (formData, _parentData, externalData) => {
            const categoryId = formData.category;
            const currentSubcategory = formData.subcategory;
            
            // Si no hay subcategoría actual, simplemente limpiar
            if (!currentSubcategory) return '';
            
            // Buscar la subcategoría actual para verificar si pertenece a la nueva categoría
            const selectedSubcategory = externalData?.subcategoriesOptions?.find((subcat: any) => 
              subcat._id === currentSubcategory
            );
            
            // Si la subcategoría actual pertenece a la nueva categoría, mantenerla
            if (selectedSubcategory && selectedSubcategory.categoryId === categoryId) {
              return currentSubcategory;
            }
            
            // Si no pertenece, limpiarla
            return '';
          }
        }
      },
      
      // Regla 3: Cuando se deselecciona categoría, mostrar todas las subcategorías
      {
        trigger: { 
          field: 'category',
          condition: (value) => value === null || value === undefined || value === ''
        },
        action: {
          type: 'filterOptions',
          targetField: 'subcategory',
          filterListKey: 'subcategoriesOptions',
          filterFunction: (allSubcategories) => {
            return [...allSubcategories];
          }
        }
      },
      
      // Regla 4: Cuando se selecciona una subcategoría, establecer automáticamente su categoría
      {
        trigger: { 
          field: 'subcategory',
          condition: (value) => value !== null && value !== undefined && value !== ''
        },
        action: {
          type: 'lookup',
          source: 'list',
          listKey: 'subcategoriesOptions',
          lookupField: '_id',
          targetField: 'category',
          mappingField: 'categoryId'
        }
      },
      
      // Regla 5: No limpiar categoría cuando se deselecciona subcategoría
      // Esto permite mayor flexibilidad al usuario

      // =====================================
      // REGLAS PARA CLASIFICACIÓN Y SUBCLASIFICACIÓN
      // =====================================
      
      // Regla 6: Cuando se selecciona una clasificación de costo, filtrar subclasificaciones
      {
        trigger: { 
          field: 'costClassification',
          condition: (value) => value !== null && value !== undefined && value !== ''
        },
        action: {
          type: 'filterOptions',
          targetField: 'costSubclassification',
          filterListKey: 'costSubclassificationsOptions',
          filterByField: 'costClassificationId',
        }
      },
      
      // Regla 7: Limpiar subclasificación solo cuando el usuario cambia manualmente la clasificación
      // (no cuando se establece automáticamente desde subclasificación)
      {
        trigger: { 
          field: 'costClassification',
          condition: (value) => value !== null && value !== undefined && value !== ''
        },
        action: {
          type: 'preset',
          targetField: 'costSubclassification',
          preset: (formData, _parentData, externalData) => {
            const classificationId = formData.costClassification;
            const currentSubclassification = formData.costSubclassification;
            
            // Si no hay subclasificación actual, simplemente limpiar
            if (!currentSubclassification) return '';
            
            // Buscar la subclasificación actual para verificar si pertenece a la nueva clasificación
            const selectedSubclassification = externalData?.costSubclassificationsOptions?.find((subclass: any) => 
              subclass._id === currentSubclassification
            );
            
            // Si la subclasificación actual pertenece a la nueva clasificación, mantenerla
            if (selectedSubclassification && selectedSubclassification.costClassificationId === classificationId) {
              return currentSubclassification;
            }
            
            // Si no pertenece, limpiarla
            return '';
          }
        }
      },
      
      // Regla 8: Cuando se deselecciona clasificación, mostrar todas las subclasificaciones
      {
        trigger: { 
          field: 'costClassification',
          condition: (value) => value === null || value === undefined || value === ''
        },
        action: {
          type: 'filterOptions',
          targetField: 'costSubclassification',
          filterListKey: 'costSubclassificationsOptions',
          filterFunction: (allSubclassifications) => {
            return [...allSubclassifications];
          }
        }
      },
      
      // Regla 9: Cuando se selecciona una subclasificación, establecer automáticamente su clasificación
      {
        trigger: { 
          field: 'costSubclassification',
          condition: (value) => value !== null && value !== undefined && value !== ''
        },
        action: {
          type: 'lookup',
          source: 'list',
          listKey: 'costSubclassificationsOptions',
          lookupField: '_id',
          targetField: 'costClassification',
          mappingField: 'costClassificationId'
        }
      },
      
      // Regla 10: No limpiar clasificación cuando se deselecciona subclasificación
      // Esto permite mayor flexibilidad al usuario
    ],
    externalData: {
      subcategoriesOptions: subcategories.map(subcat => ({
        _id: subcat._id,
        name: subcat.subcategoryName || subcat.name,
        categoryId: subcat.categoryId,
        value: subcat._id,
        label: subcat.subcategoryName || subcat.name
      })),
      costSubclassificationsOptions: costSubclassifications.map(subclass => ({
        _id: subclass._id,
        name: subclass.name,
        costClassificationId: subclass.costClassificationId,
        value: subclass._id,
        label: subclass.name
      }))
    }
  };
};

// Render function for structure type
const renderStructureType = (value: 'unit' | 'series') => {
  return (
    <div className="flex items-center">
      {value === 'unit' ? (
        <>
          <Box className="h-4 w-4 text-blue-500 mr-2" />
          <span>Unidad</span>
        </>
      ) : (
        <>
          <Package className="h-4 w-4 text-green-500 mr-2" />
          <span>Serie</span>
        </>
      )}
    </div>
  );
};

// Render function for category
const renderCategory = (value: string) => {
  if (!value) return '-';
  
  return (
    <div className="flex items-center">
      <Tag className="h-4 w-4 text-purple-500 mr-2" />
      <span>{value}</span>
    </div>
  );
};

// Column configuration for central lots grid
const centralLotsColumns: Column[] = [
  // {
  //   id: "id",
  //   header: "ID",
  //   accessor: "_id",
  //   visible: true,
  //   sortable: true,
  // },
  {
    id: "lotNumber",
    header: "Número de Lote",
    accessor: "lotNumber",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "lotName",
    header: "Nombre del Lote",
    accessor: "lotName",
    visible: true,
    sortable: true,
    render: (value: string) => value || '-',
  },
  {
    id: "productId",
    header: "Producto ID",
    accessor: "productId",
    visible: true,
    sortable: true,
  },
  {
    id: "quantity",
    header: "Cantidad",
    accessor: "quantity",
    visible: true,
    sortable: true,
    render: (value: number) => {
      return (
        <div className={`font-medium ${value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-500'}`}>
          {value.toLocaleString()}
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Estado",
    accessor: "status",
    visible: true,
    sortable: true,
    groupable: true,
    render: (value: string) => {
      const statusColor = value === 'active' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50';
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {value === 'active' ? 'Activo' : value}
        </span>
      );
    },
  },
  {
    id: "expiryDate",
    header: "Fecha Vencimiento",
    accessor: "expiryDate",
    visible: true,
    sortable: true,
    render: (value: string) => {
      if (!value) return '-';
      const date = new Date(value);
      const now = new Date();
      const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let className = 'text-gray-600';
      if (diffDays < 0) className = 'text-red-600 font-medium'; // Vencido
      else if (diffDays <= 30) className = 'text-orange-600 font-medium'; // Próximo a vencer
      else if (diffDays <= 90) className = 'text-yellow-600'; // Advertencia
      
      return (
        <div className={className}>
          {date.toLocaleDateString('es-ES')}
          {diffDays < 0 && <span className="block text-xs">Vencido</span>}
          {diffDays >= 0 && diffDays <= 30 && <span className="block text-xs">{diffDays} días</span>}
        </div>
      );
    },
  },
  {
    id: "manufactureDate",
    header: "Fecha Fabricación",
    accessor: "manufactureDate",
    visible: true,
    sortable: true,
    render: (value: string) => {
      return value ? new Date(value).toLocaleDateString('es-ES') : '-';
    },
  },
  {
    id: "createdAt",
    header: "Fecha Creación",
    accessor: "createdAt",
    visible: true,
    sortable: true,
    render: (value: string) => {
      return new Date(value).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  },
];

// Column configuration for products grid
const columns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: false,
    sortable: true,
  },
  {
    id: "name",
    header: "Nombre del Producto",
    accessor: "name",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "description",
    header: "Descripción",
    accessor: "description",
    visible: true,
    sortable: false,
    render: (value: string) => value || 'Sin descripción',
  },
  {
    id: "category",
    header: "Categoría",
    accessor: "category",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderCategory,
  },
  {
    id: "structureType",
    header: "Tipo",
    accessor: "structureType",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderStructureType,
  },
  {
    id: "unit",
    header: "Unidad",
    accessor: "unit",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "createdAt",
    header: "Fecha Creación",
    accessor: "createdAt",
    visible: true,
    sortable: true,
    render: (value: string) => {
      return new Date(value).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  },
];

interface BodegaCentralProps {
  isModal?: boolean;
  onClose?: () => void;
}

const BodegaCentral: React.FC<BodegaCentralProps> = ({ isModal = false, onClose }) => {
  const [products, setProducts] = useState<IInventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IInventoryProduct | null>(null);
  
  // Estados para asignación de stock
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [productForAssign, setProductForAssign] = useState<IInventoryProduct | null>(null);
  const [centralWarehouses, setCentralWarehouses] = useState<IInventoryWarehouse[]>([]);
  const [allWarehouses, setAllWarehouses] = useState<IInventoryWarehouse[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [assignFieldRules, setAssignFieldRules] = useState<FormGridRules | null>(null);
  
  // Estados para crear bodega central
  const [isCentralWarehouseDialogOpen, setIsCentralWarehouseDialogOpen] = useState(false);
  const [warehousesLoaded, setWarehousesLoaded] = useState(false);
  
  // Estados para lotes de bodega central organizados por producto
  const [productLots, setProductLots] = useState<{[productId: string]: IInventoryLot[]}>({});
  const [loadingCentralLots, setLoadingCentralLots] = useState(false);
  const [centralLotsLoaded, setCentralLotsLoaded] = useState(false);
  
  // Estados para datos del formulario de productos
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [costClassifications, setCostClassifications] = useState<any[]>([]);
  const [costSubclassifications, setCostSubclassifications] = useState<any[]>([]);
  const [measurementUnits, setMeasurementUnits] = useState<any[]>([]);
  const [genericTreatments, setGenericTreatments] = useState<any[]>([]);
  const [loadingFormData, setLoadingFormData] = useState(false);
  const [productFieldRules, setProductFieldRules] = useState<FormGridRules | null>(null);
  
  const { user, propertyId } = useAuthStore();

  // Columnas adicionales para mostrar información de stock en el grid de productos
  const getProductColumnsWithStock = (): Column[] => {
    return [
      ...columns,
      {
        id: "totalStock",
        header: "Stock Total",
        accessor: "_id",
        visible: true,
        sortable: true,
        render: (productId: string) => {
          const lots = productLots[productId] || [];
          const totalQuantity = lots.reduce((sum, lot) => sum + lot.quantity, 0);
          return (
            <span className={`font-semibold ${
              totalQuantity > 0 ? 'text-green-600' : totalQuantity < 0 ? 'text-red-600' : 'text-gray-500'
            }`}>
              {totalQuantity.toLocaleString()}
            </span>
          );
        },
      },
      {
        id: "lotsCount",
        header: "Número de Lotes",
        accessor: "_id",
        visible: true,
        sortable: true,
        render: (productId: string) => {
          const lots = productLots[productId] || [];
          return (
            <span className="text-sm text-muted-foreground">
              {lots.length} lote{lots.length !== 1 ? 's' : ''}
            </span>
          );
        },
      },
    ];
  };

  // Función para renderizar el contenido expandible de los lotes de cada producto
  const renderProductLotsContent = (product: IInventoryProduct) => {
    const lots = productLots[product._id] || [];
    console.log(`Renderizando lotes para producto ${product.name}:`, lots);
    
    if (lots.length === 0) {
      return (
        <div className="text-center p-4 text-muted-foreground">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No hay lotes para este producto en la bodega central</p>
        </div>
      );
    }

    return (
      <div className="px-6 py-3 bg-background border-t border-border/50">
        <div className="mb-3">
          <h4 className="font-medium text-sm text-muted-foreground/80 uppercase tracking-wide">
            Lotes del Producto ({lots.length})
          </h4>
        </div>
        <div className="overflow-hidden px-1">
          <Grid
            gridId={`product-lots-${product._id}`}
            data={lots}
            columns={centralLotsColumns}
            idField="_id"
            title=""
            key={`lots-grid-${product._id}-${lots.length}`}
          />
        </div>
      </div>
    );
  };



  // Cargar datos iniciales para asignación (solo una vez)
  useEffect(() => {
    // Solo cargar si no se han cargado ya las bodegas
    if (!warehousesLoaded && !loadingWarehouses) {
      fetchWarehousesAndProperties();
      fetchProducts();
    }
  }, []);

  // Inicializar field rules cuando se cargan las bodegas
  useEffect(() => {
    if (allWarehouses.length > 0) {
      setAssignFieldRules(createAssignFieldRules(allWarehouses));
    }
  }, [allWarehouses]);

  // Cargar lotes cuando se cargan los productos y hay bodega central
  useEffect(() => {
    if (products.length > 0 && centralWarehouses.length > 0 && !centralLotsLoaded) {
      fetchCentralLots(centralWarehouses[0]._id);
    }
  }, [products, centralWarehouses, centralLotsLoaded]);

  const fetchProducts = async () => {
    console.log("trayendo productos")
    try {
      setLoading(true);
      const data = await inventoryProductService.findAll();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehousesAndProperties = async () => {
    // Evitar llamadas duplicadas
    if (loadingWarehouses || warehousesLoaded) {
      return;
    }

    try {
      setLoadingWarehouses(true);
      // Cargar todas las bodegas y propiedades en paralelo
      const [allWarehousesData, propertiesData] = await Promise.all([
        inventoryWarehouseService.findAll(),
        propertyService.findAll()
      ]);
      
      // Separar bodegas centrales (propertyId = '0') de las normales
      const centralWarehousesData = allWarehousesData.filter(warehouse => warehouse.propertyId === '0');
      
      setCentralWarehouses(centralWarehousesData);
      setAllWarehouses(allWarehousesData); // Guardar todas las bodegas para filtrado
      setProperties(propertiesData);
      setWarehousesLoaded(true); // Marcar como cargado
      
      console.log('Bodega central cargada:', centralWarehousesData);
      console.log('Propiedades cargadas:', propertiesData);
      console.log('Todas las bodegas cargadas:', allWarehousesData);
      
      // Si hay bodega central, cargar sus lotes
      if (centralWarehousesData.length > 0) {
        const centralWarehouse = centralWarehousesData[0];
        fetchCentralLots(centralWarehouse._id);
      }
    } catch (error) {
      console.error('Error fetching warehouses and properties:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las bodegas o propiedades",
        variant: "destructive",
      });
    } finally {
      setLoadingWarehouses(false);
    }
  };

  const fetchCentralLots = async (centralWarehouseId: string) => {
    // Evitar llamadas duplicadas
    if (loadingCentralLots || centralLotsLoaded) {
      return;
    }

    try {
      setLoadingCentralLots(true);
      console.log('Cargando lotes de bodega central:', centralWarehouseId);
      
      const lotsData = await inventoryLotService.getByWarehouseId(centralWarehouseId);
      const lots = lotsData || [];
      
      // Organizar lotes por producto
      const lotsByProduct: {[productId: string]: IInventoryLot[]} = {};
      lots.forEach(lot => {
        if (!lotsByProduct[lot.productId]) {
          lotsByProduct[lot.productId] = [];
        }
        lotsByProduct[lot.productId].push(lot);
      });
      
      setProductLots(lotsByProduct);
      setCentralLotsLoaded(true);
      
      console.log('Lotes de bodega central organizados por producto:', lotsByProduct);
      console.log('Número de productos con lotes:', Object.keys(lotsByProduct).length);
    } catch (error) {
      console.error('Error fetching central lots:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los lotes de la bodega central",
        variant: "destructive",
      });
      setProductLots({});
    } finally {
      setLoadingCentralLots(false);
    }
  };

  // Función para cargar los datos necesarios para el formulario de productos
  const fetchFormData = async () => {
    if (loadingFormData) return;
    
    try {
      setLoadingFormData(true);
      
      // Cargar todos los datos en paralelo
      const [
        categoriesData,
        subcategoriesData,
        costClassificationsData,
        costSubclassificationsData,
        measurementUnitsData,
        genericTreatmentsData
      ] = await Promise.all([
        productCategoryService.findAll(),
        productSubcategoryService.findAll(),
        costClassificationService.findAll(),
        costSubclassificationService.findAll(),
        measurementUnitsService.findAll(),
        genericTreatmentService.findAll()
      ]);
      
      setCategories(categoriesData);
      setSubcategories(subcategoriesData);
      setCostClassifications(costClassificationsData);
      setCostSubclassifications(costSubclassificationsData);
      setMeasurementUnits(measurementUnitsData);
      setGenericTreatments(genericTreatmentsData);
      
      // Crear field rules para filtrado
      const fieldRules = createProductFieldRules(subcategoriesData, costSubclassificationsData);
      setProductFieldRules(fieldRules);
      
      console.log('Datos del formulario cargados:', {
        categories: categoriesData.length,
        subcategories: subcategoriesData.length,
        costClassifications: costClassificationsData.length,
        costSubclassifications: costSubclassificationsData.length,
        measurementUnits: measurementUnitsData.length,
        genericTreatments: genericTreatmentsData.length
      });
      
    } catch (error) {
      console.error('Error loading form data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del formulario",
        variant: "destructive",
      });
    } finally {
      setLoadingFormData(false);
    }
  };


  const handleCreate = () => {
    setSelectedProduct(null);
    setIsEditMode(false);
    fetchFormData(); // Cargar datos del formulario
    setIsDialogOpen(true);
  };

  const handleEdit = (product: IInventoryProduct) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    fetchFormData(); // Cargar datos del formulario
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await inventoryProductService.deleteProduct(id);
      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente",
      });
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el producto",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      // Verificar que hay bodega central para crear productos
      if (!isEditMode && centralWarehouses.length === 0) {
        toast({
          title: "Error",
          description: "No se puede crear productos sin una bodega central. Crea primero una bodega central.",
          variant: "destructive",
        });
        return;
      }

      const productData = processProductFormData(data);

      if (isEditMode && selectedProduct) {
        await inventoryProductService.updateProduct(selectedProduct._id, productData);
        toast({
          title: "Éxito",
          description: "Producto actualizado correctamente",
        });
      } else {
        // Crear producto y asociar con bodega central usando endpoint secondary
        const centralWarehouse = centralWarehouses[0];
        console.log('Creando producto para bodega central:', centralWarehouse._id);
        
        const productWithWarehouseData = {
          ...productData,
          warehouseId: centralWarehouse._id, // Solo el ID de la bodega central
        };
        
        await inventoryProductService.createProduct(productWithWarehouseData);
        toast({
          title: "Éxito",
          description: "Producto creado correctamente y asociado con bodega central",
        });
      }

      setIsDialogOpen(false);
      fetchProducts();
      
      // Recargar lotes para mostrar el nuevo lote creado (si aplicable)
      if (!isEditMode && centralWarehouses.length > 0) {
        setCentralLotsLoaded(false);
        setProductLots({}); // Limpiar los datos anteriores
        fetchCentralLots(centralWarehouses[0]._id);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: `No se pudo ${isEditMode ? 'actualizar' : 'crear'} el producto`,
        variant: "destructive",
      });
    }
  };

  const handleAssign = (product: IInventoryProduct) => {
    setProductForAssign(product);
    setIsAssignDialogOpen(true);
  };

  const handleAssignFormSubmit = async (data: any) => {
    try {
      // Obtener la bodega central (primera con propertyId = '0')
      const centralWarehouse = centralWarehouses.find(warehouse => warehouse.propertyId === '0') || centralWarehouses[0];
      if (!centralWarehouse) {
        throw new Error('No se encontró la bodega central');
      }

      console.log('🏭 Bodega central seleccionada:', {
        id: centralWarehouse._id,
        name: centralWarehouse.name,
        propertyId: centralWarehouse.propertyId
      });

      const assignData = {
        productId: data.productId,
        quantity: Number(data.quantity),
        sourceWarehouseId: centralWarehouse._id, // Usar automáticamente la bodega central
        destinationWarehouseId: data.destinationWarehouseId,
        propertyId: data.propertyId,
        comments: data.comments || `Asignación de ${data.quantity} unidades de ${productForAssign?.name} desde bodega central`,
      };

      console.log('Datos de asignación:', assignData);

      await inventoryMovementService.assignStock(assignData);
      
      toast({
        title: "Éxito",
        description: `Se asignaron ${assignData.quantity} unidades de ${productForAssign?.name} correctamente`,
      });

      setIsAssignDialogOpen(false);
      setProductForAssign(null);
      
      // Opcional: recargar productos para mostrar stock actualizado
      fetchProducts();
    } catch (error) {
      console.error('Error assigning stock:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la asignación de stock",
        variant: "destructive",
      });
    }
  };

  const handleCreateCentralWarehouse = () => {
    setIsCentralWarehouseDialogOpen(true);
  };

  const handleCentralWarehouseFormSubmit = async (data: any) => {
    try {
      const warehouseData = {
        name: data.name,
        propertyId: '0', // Bodega central
        location: {
          name: data.locationName,
          capacity: data.locationCapacity || undefined
        },
        status: true
      };

      console.log('Creando bodega central:', warehouseData);

      await inventoryWarehouseService.createCentralWarehouse(warehouseData);
      
      toast({
        title: "Éxito",
        description: "Bodega central creada correctamente",
      });

      setIsCentralWarehouseDialogOpen(false);
      
      // Recargar bodegas para incluir la nueva bodega central
      setWarehousesLoaded(false); // Permitir nueva carga
      setCentralLotsLoaded(false); // Permitir nueva carga de lotes
      setProductLots({}); // Limpiar los datos anteriores
      fetchWarehousesAndProperties();
    } catch (error) {
      console.error('Error creating central warehouse:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la bodega central",
        variant: "destructive",
      });
    }
  };

  const gridActions = (row: any) => {
    const hasCentralWarehouse = centralWarehouses.length > 0;
    
    return (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleEdit(row)}
          title="Editar"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleAssign(row)}
          title={hasCentralWarehouse ? "Asignar a Predio" : "Crear bodega central primero"}
          className={hasCentralWarehouse 
            ? "text-blue-600 hover:text-blue-700" 
            : "text-gray-400 cursor-not-allowed"
          }
          disabled={!hasCentralWarehouse}
        >
          <ArrowRightLeft className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className={isModal ? "w-full h-full flex flex-col" : "container mx-auto py-6"}>
      {/* Header - conditional rendering for modal */}
      {!isModal && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Package className="mr-3 h-8 w-8" />
              Productos de Inventario
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Gestión de productos generales del sistema de inventario
            </p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleCreate} 
              className="flex items-center"
              disabled={centralWarehouses.length === 0}
              title={centralWarehouses.length === 0 ? "Crea primero una bodega central" : "Crear nuevo producto"}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
            {/* Mostrar botón para crear bodega central solo si no existe */}
            {!loadingWarehouses && centralWarehouses.length === 0 && (
              <Button 
                onClick={handleCreateCentralWarehouse} 
                variant="outline"
                className="flex items-center text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                <Warehouse className="mr-2 h-4 w-4" />
                Crear Bodega Central
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Header for modal */}
      {isModal && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Button 
              onClick={handleCreate} 
              className="flex items-center"
              disabled={centralWarehouses.length === 0}
              title={centralWarehouses.length === 0 ? "Crea primero una bodega central" : "Crear nuevo producto"}
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
            {/* Mostrar botón para crear bodega central solo si no existe */}
            {!loadingWarehouses && centralWarehouses.length === 0 && (
              <Button 
                onClick={handleCreateCentralWarehouse} 
                variant="outline"
                className="flex items-center text-orange-600 border-orange-600 hover:bg-orange-50"
              >
                <Warehouse className="mr-2 h-4 w-4" />
                Crear Bodega Central
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Alert cuando no hay bodega central */}
      {centralWarehouses.length === 0 && !loadingWarehouses && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <Warehouse className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-orange-800">
                No se encontró bodega central
              </h4>
              <p className="text-sm text-orange-700 mt-1">
                Para poder crear productos y asignar stock a los predios, necesita crear una bodega central del sistema. 
                Los productos se asociarán automáticamente con la bodega central.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="px-[1px]">
        <Grid
          data={products}
          columns={getProductColumnsWithStock()}
          gridId="bodega-central-products"
          idField="_id"
          actions={gridActions}
          expandableContent={renderProductLotsContent}
        />
      </div>


      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={isModal ? "max-w-6xl max-h-screen overflow-auto" : "max-w-2xl"}>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Producto" : "Nuevo Producto"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Modifica los datos del producto seleccionado." 
                : "Crea un nuevo producto para el sistema de inventario."
              }
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getInventoryProductFormSections(
              categories,
              subcategories,
              costClassifications,
              costSubclassifications,
              measurementUnits,
              genericTreatments
            )}
            onSubmit={handleFormSubmit}
            fieldRules={productFieldRules || undefined}
            defaultValues={
              selectedProduct 
                ? getDefaultProductValues(selectedProduct)
                : getDefaultProductValues()
            }
          />
        </DialogContent>
      </Dialog>

      {/* Assign Stock Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className={isModal ? "max-w-xl" : "max-w-2xl"}>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ArrowRightLeft className="mr-2 h-5 w-5" />
              Asignar Stock - {productForAssign?.name}
            </DialogTitle>
            <DialogDescription>
              Asigne stock desde la bodega central hacia un predio específico. 
              Primero seleccione el predio destino para cargar sus bodegas disponibles.
            </DialogDescription>
          </DialogHeader>

          {loadingWarehouses ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Cargando bodegas...</div>
            </div>
          ) : (
            <DynamicForm
              key={`assign-form-${allWarehouses.length}`} // Force re-render when warehouses change
              sections={getAssignStockFormSections(centralWarehouses, properties, allWarehouses)}
              validationSchema={assignStockSchema}
              onSubmit={handleAssignFormSubmit}
              fieldRules={assignFieldRules || undefined}
              defaultValues={{
                productId: productForAssign?._id || "",
                quantity: 1,
                destinationWarehouseId: "",
                propertyId: "",
                comments: "",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create Central Warehouse Dialog */}
      <Dialog open={isCentralWarehouseDialogOpen} onOpenChange={setIsCentralWarehouseDialogOpen}>
        <DialogContent className={isModal ? "max-w-xl" : "max-w-2xl"}>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Warehouse className="mr-2 h-5 w-5 text-orange-600" />
              Crear Bodega Central
            </DialogTitle>
            <DialogDescription>
              Cree la bodega central del sistema. Esta bodega será el origen para las asignaciones de stock a los predios.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getCentralWarehouseFormSections()}
            validationSchema={centralWarehouseSchema}
            onSubmit={handleCentralWarehouseFormSubmit}
            defaultValues={{
              name: "Bodega Central",
              locationName: "Ubicación Central",
              locationCapacity: 1000,
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Función para generar las secciones del formulario de asignación
const getAssignStockFormSections = (
  centralWarehouses: IInventoryWarehouse[], 
  properties: any[], 
  allWarehouses: IInventoryWarehouse[]
): any[] => {
  // Información de la bodega central para mostrar al usuario
  const centralWarehouse = centralWarehouses[0];
  const centralWarehouseName = centralWarehouse?.name || 'Bodega Central';

  // Opciones para propiedades
  const propertyOptions = properties.map(property => ({
    value: property._id,
    label: property.propertyName,
  }));

  // Opciones iniciales para bodegas de propiedad (todas las que no son centrales)
  // Las field rules se encargarán del filtrado dinámico
  const propertyWarehouseOptions = allWarehouses
    .filter(warehouse => warehouse.propertyId !== '0')
    .map(warehouse => ({
      value: warehouse._id,
      label: warehouse.name,
    }));
  return [
    {
      id: "assign-info",
      title: "Información de Asignación",
      description: "Configure los detalles de la asignación de stock",
      fields: [
        {
          id: "central-warehouse-info",
          type: "text",
          label: "Bodega Origen",
          name: "centralWarehouseInfo",
          value: centralWarehouseName,
          disabled: true,
          helperText: "Stock será asignado desde la bodega central del sistema",
        },
        {
          id: "quantity",
          type: "number",
          label: "Cantidad a Asignar",
          name: "quantity",
          placeholder: "Ingrese la cantidad",
          required: true,
          helperText: "Cantidad de unidades a transferir",
          min: 1,
        },
        {
          id: "propertyId",
          type: "select",
          label: "Predio Destino",
          name: "propertyId",
          placeholder: "Seleccione predio destino",
          required: true,
          helperText: "Predio que recibirá el stock",
          options: propertyOptions,
        },
        {
          id: "destinationWarehouseId",
          type: "select",
          label: "Bodega Destino",
          name: "destinationWarehouseId",
          placeholder: "Primero seleccione un predio",
          required: true,
          helperText: "Se mostrarán las bodegas disponibles del predio seleccionado",
          options: propertyWarehouseOptions, // Se filtrará dinámicamente por field rules
        },
        {
          id: "comments",
          type: "textarea",
          label: "Comentarios",
          name: "comments",
          placeholder: "Comentarios adicionales sobre la asignación",
          required: false,
          helperText: "Comentarios opcionales sobre esta operación",
        },
      ],
    },
  ];
};

// Función para generar las secciones del formulario de bodega central
const getCentralWarehouseFormSections = (): any[] => {
  return [
    {
      id: "central-warehouse-info",
      title: "Información de la Bodega Central",
      description: "Configure los datos de la bodega central del sistema",
      fields: [
        {
          id: "name",
          type: "text",
          label: "Nombre de la Bodega",
          name: "name",
          placeholder: "Ej: Bodega Central",
          required: true,
          helperText: "Nombre identificativo de la bodega central",
        },
        {
          id: "locationName",
          type: "text",
          label: "Ubicación",
          name: "locationName",
          placeholder: "Ej: Ubicación Central, Planta Principal",
          required: true,
          helperText: "Ubicación física de la bodega",
        },
        {
          id: "locationCapacity",
          type: "number",
          label: "Capacidad (opcional)",
          name: "locationCapacity",
          placeholder: "Ej: 1000",
          required: false,
          helperText: "Capacidad máxima de almacenamiento en unidades",
          min: 1,
        },
      ],
    },
  ];
};

export default BodegaCentral;