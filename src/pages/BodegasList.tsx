import { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  Building2,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Package,
  Eye,
  ChevronDown,
  ChevronRight,
  History,
  TrendingDown,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Minus,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Badge,
} from "@/components/ui/badge";
import type { IInventoryWarehouse } from "@eon-lib/eon-mongoose/types";
import inventoryWarehouseService from "@/_services/inventoryWarehouseService";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/store/authStore";
import DynamicForm from "@/components/DynamicForm/DynamicForm";
import inventoryLotService from "@/_services/inventoryLotService";
import inventoryProductService from "@/_services/inventoryProductService";
import inventoryMovementService from "@/_services/inventoryMovementService";
import type { IInventoryLot, IInventoryProduct, IInventoryMovement } from "@eon-lib/eon-mongoose/types";
import { 
  getInventoryProductFormSections,
  getInventoryWarehouseFormSections,
  getDefaultProductValues,
  getDefaultWarehouseValues,
  processProductFormData,
  processWarehouseFormData
} from "@/lib/forms/inventoryForms";

// Render function for the boolean columns
const renderBoolean = (value: boolean) => {
  return value ? (
    <div className="flex items-center">
      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
      <span>Activo</span>
    </div>
  ) : (
    <div className="flex items-center">
      <XCircle className="h-4 w-4 text-red-500 mr-2" />
      <span>Inactivo</span>
    </div>
  );
};

// Function to render movement type badge
const renderMovementType = (movementType: string) => {
  const typeConfig = {
    'ASSIGN_OUT': { label: 'Salida por Asignación', color: 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100', icon: ArrowRight },
    'ASSIGN_IN': { label: 'Entrada por Asignación', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100', icon: ArrowLeft },
    'CONSUME': { label: 'Consumo de Producto', color: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100', icon: TrendingDown },
    'CONSUME_NEGATIVE': { label: 'Consumo con Stock Negativo', color: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100', icon: TrendingDown },
    'MANUAL_CHANGE': { label: 'Cambio Manual de Stock', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100', icon: Edit },
    'RESTORE': { label: 'Restauración de Stock', color: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100', icon: RefreshCw },
    'TRANSFER_OUT': { label: 'Salida por Transferencia', color: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100', icon: ArrowRight },
    'TRANSFER_IN': { label: 'Entrada por Transferencia', color: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100', icon: ArrowLeft },
  };

  const config = typeConfig[movementType as keyof typeof typeConfig] || { 
    label: movementType, 
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    icon: Package
  };

  const IconComponent = config.icon;

  return (
    <Badge className={config.color}>
      <IconComponent className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
};

// Function to render quantity with icon
const renderQuantity = (quantity: number, movementType: string) => {
  // Clasificar tipos de movimiento como ingresos o salidas
  const ingressTypes = ['ASSIGN_IN', 'TRANSFER_IN', 'RESTORE'];
  const egressTypes = ['ASSIGN_OUT', 'TRANSFER_OUT', 'CONSUME', 'CONSUME_NEGATIVE'];
  
  const isIngress = ingressTypes.includes(movementType);
  const isEgress = egressTypes.includes(movementType);
  const isManualChange = movementType === 'MANUAL_CHANGE';
  
  // Para cambios manuales, usar la cantidad para determinar el signo
  const finalIsIngress = isManualChange ? quantity > 0 : isIngress;
  const finalIsEgress = isManualChange ? quantity < 0 : isEgress;
  
  return (
    <div className="flex items-center space-x-1">
      {finalIsIngress && <Plus className="h-4 w-4 text-green-500" />}
      {finalIsEgress && <Minus className="h-4 w-4 text-red-500" />}
      <span className={`font-mono font-semibold ${
        finalIsIngress ? 'text-green-600' : finalIsEgress ? 'text-red-600' : 'text-gray-600'
      }`}>
        {finalIsIngress ? '+' : finalIsEgress ? '-' : ''}{Math.abs(quantity)}
      </span>
    </div>
  );
};

// Column configuration for warehouses grid
const warehousesColumns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: false,
    sortable: true,
  },
  {
    id: "name",
    header: "Nombre",
    accessor: "name",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "location",
    header: "Ubicación",
    accessor: "location.name",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "capacity",
    header: "Capacidad",
    accessor: "location.capacity",
    visible: true,
    sortable: true,
    render: (value) => value ? `${value}` : "No especificada",
  },
  {
    id: "status",
    header: "Estado",
    accessor: "status",
    visible: true,
    sortable: true,
    render: renderBoolean,
  },
];


const BodegasList = () => {
  const { propertyId } = useAuthStore();
  const [bodegas, setBodegas] = useState<IInventoryWarehouse[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBodega, setSelectedBodega] = useState<IInventoryWarehouse | null>(null);
  
  // Estados para productos y lotes (needed for grid renderers)
  const [allProducts, setAllProducts] = useState<IInventoryProduct[]>([]);
  const [allLots, setAllLots] = useState<IInventoryLot[]>([]);
  
  // Estados para el modal de lotes
  const [isLotsModalOpen, setIsLotsModalOpen] = useState(false);
  const [selectedBodegaForLots, setSelectedBodegaForLots] = useState<IInventoryWarehouse | null>(null);
  const [productLots, setProductLots] = useState<Array<{
    product: IInventoryProduct;
    lots: IInventoryLot[];
  }>>([]);
  const [isLoadingLots, setIsLoadingLots] = useState(false);
  
  // Estados para el modal de edición de producto
  const [isProductEditModalOpen, setIsProductEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<IInventoryProduct | null>(null);
  
  // Estados para el modal de historial de movimientos
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedBodegaForHistory, setSelectedBodegaForHistory] = useState<IInventoryWarehouse | null>(null);
  const [movementsHistory, setMovementsHistory] = useState<IInventoryMovement[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Function to fetch all products (needed for movements history)
  const fetchAllProducts = async () => {
    try {
      const products = await inventoryProductService.findAll();
      setAllProducts(products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Function to handle viewing movements history
  const handleViewHistory = async (bodega: IInventoryWarehouse) => {
    try {
      setIsLoadingHistory(true);
      setSelectedBodegaForHistory(bodega);
      setIsHistoryModalOpen(true);

      // Get all products that have movements in this warehouse
      const productIds = allProducts.map(product => product._id);
      
      // Fetch movements history for all products in this warehouse
      const movements = await inventoryMovementService.getWarehouseHistory(bodega._id, productIds);
      
      // Sort by creation date, most recent first
      const sortedMovements = movements.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setMovementsHistory(sortedMovements);
    } catch (error) {
      console.error("Error fetching movements history:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar el historial de movimientos. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Function to close history modal
  const handleCloseHistoryModal = () => {
    setIsHistoryModalOpen(false);
    setSelectedBodegaForHistory(null);
    setMovementsHistory([]);
  };


  // Column configuration for products grid with lots
  const productsColumns: Column[] = [
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
      sortable: true,
      render: (description: string) => description || 'Sin descripción',
    },
    {
      id: "category",
      header: "Categoría",
      accessor: "category",
      visible: true,
      sortable: true,
      groupable: true,
      render: (category: string) => category || 'Sin categoría',
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
      id: "totalStock",
      header: "Stock Total",
      accessor: "_id",
      visible: true,
      sortable: true,
      render: (productId: string) => {
        const productLotsData = productLots.find(pl => pl.product._id === productId)?.lots || [];
        const totalQuantity = productLotsData.reduce((sum, lot) => sum + lot.quantity, 0);
        return (
          <span className={`font-semibold ${
            totalQuantity > 0 ? 'text-green-600' : totalQuantity < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            {totalQuantity}
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
        const productLotsData = productLots.find(pl => pl.product._id === productId)?.lots || [];
        return (
          <span className="text-sm text-muted-foreground">
            {productLotsData.length} lote{productLotsData.length !== 1 ? 's' : ''}
          </span>
        );
      },
    },
    {
      id: "structureType",
      header: "Tipo",
      accessor: "structureType",
      visible: false,
      sortable: true,
      groupable: true,
    },
  ];

  // Column configuration for lots grid (expandable content)
  const lotsColumns: Column[] = [
    {
      id: "lotName",
      header: "Nombre del Lote",
      accessor: "lotName",
      visible: true,
      sortable: true,
      render: (lotName: string, row: IInventoryLot) => {
        return lotName || `Lote ${row.lotNumber}`;
      },
    },
    {
      id: "lotNumber",
      header: "Número",
      accessor: "lotNumber",
      visible: true,
      sortable: true,
    },
    {
      id: "quantity",
      header: "Cantidad",
      accessor: "quantity",
      visible: true,
      sortable: true,
      render: (quantity: number) => (
        <span className={`font-semibold ${
          quantity > 0 ? 'text-green-600' : quantity < 0 ? 'text-red-600' : 'text-gray-500'
        }`}>
          {quantity}
        </span>
      ),
    },
    {
      id: "status",
      header: "Estado",
      accessor: "status",
      visible: true,
      sortable: true,
      groupable: true,
      render: (status: string) => (
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
          status === 'active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
        }`}>
          {status}
        </span>
      ),
    },
    {
      id: "manufactureDate",
      header: "Fecha de Fabricación",
      accessor: "manufactureDate",
      visible: true,
      sortable: true,
      render: (date: string) => {
        return date ? new Date(date).toLocaleDateString() : 'No especificada';
      },
    },
    {
      id: "expiryDate",
      header: "Fecha de Vencimiento",
      accessor: "expiryDate",
      visible: true,
      sortable: true,
      render: (date: string) => {
        if (!date) return 'No especificada';
        const expiryDate = new Date(date);
        const isExpired = expiryDate < new Date();
        return (
          <span className={isExpired ? 'text-red-600 font-semibold' : ''}>
            {expiryDate.toLocaleDateString()}
          </span>
        );
      },
    },
  ];

  // Function to render expandable content for products
  const renderProductLotsContent = (product: IInventoryProduct) => {
    const productLotsData = productLots.find(pl => pl.product._id === product._id)?.lots || [];
    
    if (productLotsData.length === 0) {
      return (
        <div className="text-center p-4 text-muted-foreground">
          <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No hay lotes para este producto en esta bodega</p>
        </div>
      );
    }

    return (
      <div className="px-6 py-3 bg-background border-t border-border/50">
        <div className="mb-3">
          <h4 className="font-medium text-sm text-muted-foreground/80 uppercase tracking-wide">
            Lotes del Producto ({productLotsData.length})
          </h4>
        </div>
        <div className="overflow-hidden px-1">
          <Grid
            gridId={`lots-${product._id}`}
            data={productLotsData}
            columns={lotsColumns}
            idField="_id"
            title=""
            key={`lots-grid-${product._id}-${productLotsData.length}`}
          />
        </div>
      </div>
    );
  };

  // Column configuration for movements history grid (inside component to access state)
  const movementsColumns: Column[] = [
    {
      id: "movementType",
      header: "Tipo de Movimiento",
      accessor: "movementType",
      visible: true,
      sortable: true,
      groupable: true,
      render: renderMovementType,
    },
    {
      id: "productName",
      header: "Producto",
      accessor: "productId",
      visible: true,
      sortable: true,
      groupable: true,
      render: (productId: string) => {
        const product = allProducts.find((p: IInventoryProduct) => p._id === productId);
        return product ? product.name : 'Producto no encontrado';
      },
    },
    {
      id: "lotName",
      header: "Lote",
      accessor: "lotId",
      visible: true,
      sortable: true,
      render: (lotId: string) => {
        if (!lotId) return 'Sin lote especificado';
        const lot = allLots.find((l: IInventoryLot) => l._id === lotId);
        return lot?.lotName || 'Sin nombre de lote';
      },
    },
    {
      id: "quantity",
      header: "Cantidad",
      accessor: "quantity",
      visible: true,
      sortable: true,
      render: (quantity: number, row: IInventoryMovement) => renderQuantity(quantity, row.movementType),
    },
    {
      id: "date",
      header: "Fecha",
      accessor: "createdAt",
      visible: true,
      sortable: true,
      render: (date: string) => {
        if (!date) return 'Sin fecha';
        const dateObj = new Date(date);
        return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;
      },
    },
    {
      id: "comments",
      header: "Comentarios",
      accessor: "comments",
      visible: true,
      sortable: false,
      render: (comments: string) => {
        if (!comments) return '-';
        return (
          <div className="max-w-[200px] truncate" title={comments}>
            {comments}
          </div>
        );
      },
    },
    {
      id: "destinationWarehouse",
      header: "Bodega Destino",
      accessor: "destinationWarehouseId",
      visible: false,
      sortable: true,
      render: (warehouseId: string) => warehouseId || 'N/A',
    },
  ];
  
  // Function to open lots modal and fetch lots for selected warehouse
  const handleViewLots = async (bodega: IInventoryWarehouse) => {
    setSelectedBodegaForLots(bodega);
    setIsLotsModalOpen(true);
    setIsLoadingLots(true);
    
    try {
      // Fetch lots for this warehouse
      const lotsData = await inventoryLotService.getByWarehouseId(bodega._id);
      const lots = lotsData || [];
      
      if (lots.length === 0) {
        setProductLots([]);
        return;
      }
      
      // Get unique product IDs from lots
      const productIds = [...new Set(lots.map(lot => lot.productId))];
      
      // Fetch all products (we might need only specific ones, but let's get all for now)
      const allProducts = await inventoryProductService.findAll();
      
      // Group lots by product
      const productLotsMap = productIds.map(productId => {
        const product = allProducts.find(p => p._id === productId);
        const productLots = lots.filter(lot => lot.productId === productId);
        
        if (!product) {
          // Skip products that don't exist
          return null;
        }
        
        return {
          product: product,
          lots: productLots
        };
      }).filter(Boolean) as Array<{
        product: IInventoryProduct;
        lots: IInventoryLot[];
      }>;
      
      setProductLots(productLotsMap);
    } catch (error) {
      console.error(`Error fetching lots for warehouse ${bodega._id}:`, error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los lotes de la bodega.",
        variant: "destructive",
      });
      setProductLots([]);
    } finally {
      setIsLoadingLots(false);
    }
  };

  // Function to close lots modal
  const handleCloseLotsModal = () => {
    setIsLotsModalOpen(false);
    setSelectedBodegaForLots(null);
    setProductLots([]);
  };


  // Function to handle product edit
  const handleEditProduct = (product: IInventoryProduct) => {
    setSelectedProduct(product);
    setIsProductEditModalOpen(true);
  };

  // Function to handle product update
  const handleUpdateProduct = async (data: any) => {
    if (!selectedProduct?._id) return;
    
    try {
      const updateData = processProductFormData(data);

      await inventoryProductService.updateProduct(selectedProduct._id, updateData);
      
      // Refresh the product lots data
      if (selectedBodegaForLots) {
        await handleViewLots(selectedBodegaForLots);
      }
      
      setIsProductEditModalOpen(false);
      setSelectedProduct(null);
      toast({
        title: "Producto actualizado",
        description: `El producto ${data.name} ha sido actualizado exitosamente.`,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };
  
  // Fetch bodegas on component mount and when propertyId changes
  useEffect(() => {
    console.log('🔄 BodegasList useEffect triggered - propertyId:', propertyId);
    if (propertyId) {
      fetchBodegas();
      fetchAllProducts(); // Load products for movements history
    } else {
      console.log('⚠️ No propertyId available, skipping fetch');
      setBodegas([]);
    }
  }, [propertyId]);
  
  // Function to fetch bodegas data
  const fetchBodegas = async () => {
    if (!propertyId) {
      console.log('❌ Cannot fetch bodegas: no propertyId');
      toast({
        title: "Error",
        description: "No hay una propiedad seleccionada",
        variant: "destructive",
      });
      return;
    }
    
    console.log('🚀 Starting fetchBodegas with propertyId:', propertyId);
    
    try {
      // For property warehouses, we need to get only the ones for this property
      const data = await inventoryWarehouseService.getPropertyWarehouses();
      console.log('📥 Raw data received from service:', data);
      
      // Handle potential data wrapping
      let processedData: IInventoryWarehouse[];
      
      if (Array.isArray(data)) {
        processedData = data;
      } else if (data && typeof data === 'object' && 'data' in data) {
        processedData = (data as any).data || [];
      } else {
        processedData = [];
      }
      
      // Filter warehouses for current property (propertyId != '0')
      const filteredData = processedData.filter(bodega => 
        bodega.propertyId !== '0' && bodega.propertyId === propertyId?.toString()
      );
      
      console.log('🔍 Processed and filtered data:', {
        length: filteredData.length,
        sample: filteredData.slice(0, 2)
      });
      
      setBodegas(filteredData);
      
      if (filteredData.length === 0) {
        console.log('ℹ️ No bodegas found for this property');
        toast({
          title: "Sin datos",
          description: "No se encontraron bodegas para esta propiedad",
        });
      } else {
        console.log(`✅ Successfully loaded ${filteredData.length} bodegas`);
      }
      
    } catch (error) {
      console.error("💥 Error loading bodegas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Por favor intente nuevamente.",
        variant: "destructive",
      });
      setBodegas([]);
    } finally {
      console.log('🏁 fetchBodegas completed');
    }
  };
  
  // Function to handle adding a new bodega
  const handleAddBodega = async (data: any) => {
    try {
      const processedData = processWarehouseFormData(data);
      const warehouseData = {
        ...processedData,
        propertyId: propertyId?.toString() || '',
      };

      const newBodega = await inventoryWarehouseService.createWarehouse(warehouseData);
      await fetchBodegas();
      setIsDialogOpen(false);
      toast({
        title: "Bodega creada",
        description: `La bodega ${newBodega.name} ha sido creada exitosamente.`,
      });
    } catch (error) {
      console.error("Error creating bodega:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la bodega. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating an existing bodega
  const handleUpdateBodega = async (data: any) => {
    if (!selectedBodega?._id) return;
    
    try {
      const updateData = processWarehouseFormData(data);

      await inventoryWarehouseService.updateWarehouse(selectedBodega._id, updateData);
      await fetchBodegas();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedBodega(null);
      toast({
        title: "Bodega actualizada",
        description: `La bodega ${data.name} ha sido actualizada exitosamente.`,
      });
    } catch (error) {
      console.error("Error updating bodega:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la bodega. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a bodega
  const handleDeleteBodega = async (id: string) => {
    try {
      await inventoryWarehouseService.deleteWarehouse(id);
      setBodegas((prev) => prev.filter((bodega) => bodega._id !== id));
      toast({
        title: "Bodega eliminada",
        description: "La bodega ha sido eliminada exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting bodega:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la bodega. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Handle edit button click
  const handleEdit = (bodega: IInventoryWarehouse) => {
    setSelectedBodega(bodega);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Handle form submission
  const handleFormSubmit = (data: any) => {
    if (isEditMode) {
      handleUpdateBodega(data);
    } else {
      handleAddBodega(data);
    }
  };

  // Actions column renderer for the grid
  const actionsRenderer = (row: IInventoryWarehouse) => (
    <div className="flex space-x-1">
      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleViewLots(row);
        }}
        size="sm"
        variant="ghost"
        title="Ver Lotes de Inventario"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleViewHistory(row);
        }}
        size="sm"
        variant="ghost"
        title="Ver Historial de Movimientos"
      >
        <History className="h-4 w-4" />
      </Button>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleEdit(row);
        }}
        size="sm"
        variant="ghost"
        title="Editar Bodega"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm(`¿Está seguro que desea eliminar la bodega ${row.name}?`)) {
            handleDeleteBodega(row._id);
          }
        }}
        size="sm"
        variant="ghost"
        className="text-red-500 hover:text-red-700"
        title="Eliminar Bodega"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Bodegas del Predio</h1>
          <p className="text-muted-foreground">
            Gestione las bodegas de inventario asociadas a esta propiedad
          </p>
        </div>
        <Button 
          onClick={() => {
            setIsEditMode(false);
            setSelectedBodega(null);
            setIsDialogOpen(true);
          }}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Bodega
        </Button>
      </div>
      
      <Grid
        gridId="bodegas-grid"
        data={bodegas}
        columns={warehousesColumns}
        idField="_id"
        title={`Bodegas del Predio (${bodegas.length} registros)`}
        actions={actionsRenderer}
        key={`bodegas-grid-${bodegas.length}-${propertyId}`}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Bodega" : "Agregar Nueva Bodega"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Modifique la información de la bodega." 
                : "Complete la información para crear una nueva bodega del predio."
              }
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            sections={getInventoryWarehouseFormSections()}
            onSubmit={handleFormSubmit}
            defaultValues={
              isEditMode && selectedBodega
                ? getDefaultWarehouseValues(selectedBodega)
                : getDefaultWarehouseValues()
            }
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Productos y Lotes */}
      <Dialog open={isLotsModalOpen} onOpenChange={handleCloseLotsModal}>
        <DialogContent className="max-w-[90vw] max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Productos e Inventario - {selectedBodegaForLots?.name}
            </DialogTitle>
            <DialogDescription>
              Visualiza todos los productos y sus lotes almacenados en esta bodega. Haz clic en una fila para expandir los lotes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto max-h-[60vh] px-2">
            {isLoadingLots ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Cargando productos y lotes...</p>
                </div>
              </div>
            ) : productLots.length > 0 ? (
              <Grid
                gridId="products-lots-grid"
                data={productLots.map(pl => pl.product)}
                columns={productsColumns}
                idField="_id"
                title={``}
                expandableContent={renderProductLotsContent}
                actions={(product: IInventoryProduct) => (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProduct(product);
                    }}
                    size="sm"
                    variant="outline"
                    title="Editar Producto"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                key={`products-grid-${productLots.length}-${selectedBodegaForLots?._id}`}
              />
            ) : (
              <div className="text-center p-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay productos en esta bodega</h3>
                <p className="text-muted-foreground">
                  Esta bodega no tiene lotes de productos almacenados actualmente.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleCloseLotsModal}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edición de Producto */}
      <Dialog open={isProductEditModalOpen} onOpenChange={setIsProductEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
            <DialogDescription>
              Modifique la información del producto seleccionado
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            sections={getInventoryProductFormSections()}
            onSubmit={handleUpdateProduct}
            defaultValues={
              selectedProduct
                ? getDefaultProductValues(selectedProduct)
                : getDefaultProductValues()
            }
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Historial de Movimientos */}
      <Dialog open={isHistoryModalOpen} onOpenChange={handleCloseHistoryModal}>
        <DialogContent className="max-w-[90vw] max-h-[85vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <History className="h-5 w-5 mr-2" />
              Historial de Movimientos - {selectedBodegaForHistory?.name}
            </DialogTitle>
            <DialogDescription>
              Visualiza el historial de movimientos de productos en esta bodega.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto max-h-[60vh] px-2">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Cargando historial de movimientos...</p>
                </div>
              </div>
            ) : movementsHistory.length > 0 ? (
              <Grid
                gridId="movements-history-grid"
                data={movementsHistory}
                columns={movementsColumns}
                idField="_id"
                title={``}
                key={`movements-grid-${movementsHistory.length}-${selectedBodegaForHistory?._id}`}
              />
            ) : (
              <div className="text-center p-8">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay movimientos en esta bodega</h3>
                <p className="text-muted-foreground">
                  Esta bodega no tiene movimientos de productos registrados actualmente.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleCloseHistoryModal}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BodegasList;