import { useState, useEffect, useCallback } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Column } from "@/lib/store/gridStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import DynamicForm, {
  SectionConfig,
} from "@/components/DynamicForm/DynamicForm";
import { z } from "zod";
import { toast } from "@/components/ui/use-toast";
import { IProductCategory } from "@eon-lib/eon-mongoose";
import productCategoryService from "@/_services/productCategoryService";


interface ProductCategoryProps {
  isModal?: boolean;
}

// Render function for the boolean fields
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

// Column configuration for the grid
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
    header: "Nombre",
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
  },
  {
    id: "state",
    header: "Estado",
    accessor: "state",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderBoolean,
  },
];

// Expandable content for each row
const expandableContent = (row: IProductCategory) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.categoryName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Nombre:</strong> {row.categoryName || 'N/A'}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? 'Activo' : 'Inactivo'}
        </p>
      </div>
      <div>
        <p>
          <strong>Creado:</strong> {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
        </p>
        <p>
          <strong>Actualizado:</strong> {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : 'N/A'}
        </p>
      </div>
    </div>
  </div>
);

const ProductCategory = ({ isModal = false }: ProductCategoryProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productCategories, setProductCategories] = useState<IProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProductCategory, setSelectedProductCategory] = useState<IProductCategory | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch productCategories on component mount
  useEffect(() => {
    fetchProductCategories();
  }, []);
  
  // Function to fetch productCategories data
  const fetchProductCategories = async () => {
    setIsLoading(true);
    try {
      const data = await productCategoryService.findAll();
      setProductCategories(data as IProductCategory[]);
    } catch (error) {
      console.error("Error loading product categories:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías de productos. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new productCategory
  const handleAddProductCategory = async (data: Partial<IProductCategory>) => {
    try {
      await productCategoryService.createProductCategory(data)
      
      toast({
        title: "Éxito",
        description: "Categoría de producto agregada correctamente.",
      });
      
      // Refresh data
      fetchProductCategories();
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar categoría de producto:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la categoría de producto. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a productCategory
  const handleUpdateProductCategory = async (id: string, data: Partial<IProductCategory>) => {
    try {
      await productCategoryService.updateProductCategory(id,data)
      
      toast({
        title: "Éxito",
        description: "Categoría de producto actualizada correctamente.",
      });
      
      // Refresh data
      fetchProductCategories();
      // Close dialog
      setIsDialogOpen(false);
      // Reset selected productCategory
      setSelectedProductCategory(null);
      // Reset edit mode
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar categoría de producto ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría de producto. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a productCategory
  const handleDeleteProductCategory = async (id: string) => {
    try {
      await productCategoryService.softDeleteProductCategory(id)
      
      toast({
        title: "Éxito",
        description: "Categoría de producto eliminada correctamente.",
      });
      
      // Refresh data
      fetchProductCategories();
    } catch (error) {
      console.error(`Error al eliminar categoría de producto ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría de producto. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Form configuration for adding new productCategory
  const getFormSections = useCallback((): SectionConfig[] => [
    {
      id: "productCategory-info",
      title: "Información de la Categoría",
      description: "Ingrese los datos de la nueva categoría de producto",
      fields: [
        {
          id: "name",
          type: "text",
          label: "Nombre *",
          name: "name",
          placeholder: "Ingrese nombre de la categoría",
          required: true,
          helperText: "Ingrese el nombre identificativo de la categoría"
        },
        {
          id: "description",
          type: "textarea",
          label: "Descripción",
          name: "description",
          placeholder: "Descripción de la categoría",
          required: false,
          helperText: "Descripción opcional de la categoría"
        },
        {
          id: "state",
          type: "checkbox",
          label: "Activo",
          name: "state",
          required: false,
          helperText: "Indica si la categoría está activa"
        }
      ],
    }
  ], []);

  // Form validation schema
  const formValidationSchema = z.object({
    name: z.string().min(1, { message: "El nombre es obligatorio" }),
    description: z.string().optional(),
    state: z.boolean().default(true)
  });

  // Form submit handler
  const handleFormSubmit = (data: Partial<IProductCategory>) => {
    if (isEditMode && selectedProductCategory && selectedProductCategory._id) {
      handleUpdateProductCategory(selectedProductCategory._id, data);
    } else {
      handleAddProductCategory(data);
    }
  };

  // Handle edit button click
  const handleEditClick = (productCategory: IProductCategory) => {
    setSelectedProductCategory(productCategory);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: IProductCategory) => {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick(row);
          }}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm(`¿Está seguro de eliminar la categoría ${row.categoryName}?`)) {
              handleDeleteProductCategory(row._id);
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className={isModal ? "w-full h-full overflow-hidden" : "container mx-auto py-6"}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Categorías de Productos</h1>
          <p className="text-muted-foreground">
            {isModal 
              ? "Gestione las categorías de productos"
              : "Gestione las categorías de productos para su organización"
            }
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedProductCategory(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Categoría
        </Button>
      </div>

      <div className={isModal ? "px-0.5 h-[calc(100vh-200px)] overflow-hidden" : ""}>
        <Grid
          data={productCategories}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          isLoading={isLoading}
          gridId="productCategories-grid"
          idField="_id"
          title=""
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Categoría" : "Agregar Nueva Categoría"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} una categoría de producto.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedProductCategory ? {
              name: selectedProductCategory.categoryName,
              state: selectedProductCategory.state
            } : {
              state: true
            }}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
          />
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="dynamic-form">
              {isEditMode ? "Actualizar" : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCategory;