import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Tag,
  Box,
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
import type { IInventoryProduct } from "@eon-lib/eon-mongoose";
import inventoryProductService from "@/_services/inventoryProductService";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/store/authStore";
import DynamicForm, { SectionConfig } from "@/components/DynamicForm/DynamicForm";

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

// Column configuration for products grid
const columns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: true,
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
    render: (value: string) => value || '-',
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
  const { user } = useAuthStore();

  // Form sections for product creation/editing
  const formSections: SectionConfig[] = [
    {
      id: "product-basic",
      title: "Información Básica del Producto",
      description: "Datos principales del producto de inventario",
      fields: [
        {
          id: "name",
          type: "text",
          label: "Nombre del Producto",
          name: "name",
          placeholder: "Ej: Fertilizante NPK 20-20-20",
          required: true,
        },
        {
          id: "description",
          type: "textarea",
          label: "Descripción",
          name: "description",
          placeholder: "Descripción detallada del producto",
          required: false,
        },
        {
          id: "category",
          type: "text",
          label: "Categoría",
          name: "category",
          placeholder: "Ej: Fertilizantes, Pesticidas, Semillas",
          required: false,
        },
      ],
    },
    {
      id: "product-technical",
      title: "Información Técnica",
      description: "Especificaciones técnicas del producto",
      fields: [
        {
          id: "structureType",
          type: "select",
          label: "Tipo de Estructura",
          name: "structureType",
          required: true,
          options: [
            { value: "unit", label: "Unidad" },
            { value: "series", label: "Serie" },
          ],
        },
        {
          id: "unit",
          type: "text",
          label: "Unidad de Medida",
          name: "unit",
          placeholder: "Ej: kg, L, unidades, sacos",
          required: true,
        },
      ],
    },
  ];

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
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

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (product: IInventoryProduct) => {
    setSelectedProduct(product);
    setIsEditMode(true);
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
      const productData = {
        name: data.name,
        description: data.description,
        category: data.category,
        structureType: data.structureType,
        unit: data.unit,
      };

      if (isEditMode && selectedProduct) {
        await inventoryProductService.updateProduct(selectedProduct._id, productData);
        toast({
          title: "Éxito",
          description: "Producto actualizado correctamente",
        });
      } else {
        await inventoryProductService.createProduct(productData);
        toast({
          title: "Éxito",
          description: "Producto creado correctamente",
        });
      }

      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: `No se pudo ${isEditMode ? 'actualizar' : 'crear'} el producto`,
        variant: "destructive",
      });
    }
  };


  const gridActions = (row: any) => {
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
          <Button onClick={handleCreate} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      )}

      {/* Header for modal */}
      {isModal && (
        <div className="flex justify-between items-center mb-4">
          <Button onClick={handleCreate} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>
      )}

      {/* Main Grid */}
      <div className="px-[1px]">
        <Grid
          data={products}
          columns={columns}
          gridId="bodega-central-products"
          actions={gridActions}
        />
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={isModal ? "max-w-xl" : "max-w-2xl"}>
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
            sections={formSections}
            onSubmit={handleFormSubmit}
            defaultValues={selectedProduct || {
              name: "",
              description: "",
              category: "",
              structureType: "unit",
              unit: "",
            }}
            submitButtonText={isEditMode ? "Actualizar Producto" : "Crear Producto"}
            cancelButtonText="Cancelar"
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BodegaCentral;