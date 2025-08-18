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
import { IProductSubcategory, IProductCategory } from "@eon-lib/eon-mongoose";
import productSubcategoryService from "@/_services/productSubcategoryService";
import productCategoryService from "@/_services/productCategoryService";


interface ProductSubcategoryProps {
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

const ProductSubcategory = ({ isModal = false }: ProductSubcategoryProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productSubcategories, setProductSubcategories] = useState<IProductSubcategory[]>([]);
  const [productCategories, setProductCategories] = useState<IProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProductSubcategory, setSelectedProductSubcategory] = useState<IProductSubcategory | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Column configuration for the grid
  const columns: Column[] = [
    {
      id: "id",
      header: "ID",
      accessor: "_id",
      visible: false,
      sortable: true,
    },
    {
      id: "subcategoryName",
      header: "Nombre subcategoría",
      accessor: "subcategoryName",
      visible: true,
      sortable: true,
      groupable: true,
    },
    {
      id: "categoryName",
      header: "Categoría padre",
      accessor: "categoryId",
      visible: true,
      sortable: true,
      groupable: true,
      render: (categoryId: string) => {
        const category = productCategories.find(cat => cat._id === categoryId);
        return category?.categoryName || 'Sin categoría';
      },
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
  const expandableContent = (row: IProductSubcategory) => {
    const parentCategory = productCategories.find(cat => cat._id === row.categoryId);
    
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{row.subcategoryName}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Nombre:</strong> {row.subcategoryName || 'N/A'}
            </p>
            <p>
              <strong>Categoría padre:</strong> {parentCategory?.categoryName || 'Sin categoría'}
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
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchProductSubcategories();
    fetchProductCategories();
  }, []);
  
  // Function to fetch productSubcategories data
  const fetchProductSubcategories = async () => {
    setIsLoading(true);
    try {
      const data = await productSubcategoryService.findAll();
      setProductSubcategories(data as IProductSubcategory[]);
    } catch (error) {
      console.error("Error loading product subcategories:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las subcategorías de productos. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch product categories for the dropdown
  const fetchProductCategories = async () => {
    try {
      const data = await productCategoryService.findAll();
      setProductCategories(data as IProductCategory[]);
    } catch (error) {
      console.error("Error loading product categories:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías de productos.",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle adding a new productSubcategory
  const handleAddProductSubcategory = async (data: Partial<IProductSubcategory>) => {
    try {
      await productSubcategoryService.createProductSubcategory(data)
      
      toast({
        title: "Éxito",
        description: "Subcategoría de producto agregada correctamente.",
      });
      
      // Refresh data
      fetchProductSubcategories();
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar subcategoría de producto:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la subcategoría de producto. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a productSubcategory
  const handleUpdateProductSubcategory = async (id: string, data: Partial<IProductSubcategory>) => {
    try {
      await productSubcategoryService.updateProductSubcategory(id, data)
      
      toast({
        title: "Éxito",
        description: "Subcategoría de producto actualizada correctamente.",
      });
      
      // Refresh data
      fetchProductSubcategories();
      // Close dialog
      setIsDialogOpen(false);
      // Reset selected productSubcategory
      setSelectedProductSubcategory(null);
      // Reset edit mode
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar subcategoría de producto ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la subcategoría de producto. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a productSubcategory
  const handleDeleteProductSubcategory = async (id: string) => {
    try {
      await productSubcategoryService.softDeleteProductSubcategory(id)
      
      toast({
        title: "Éxito",
        description: "Subcategoría de producto eliminada correctamente.",
      });
      
      // Refresh data
      fetchProductSubcategories();
    } catch (error) {
      console.error(`Error al eliminar subcategoría de producto ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la subcategoría de producto. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Form configuration for adding new productSubcategory
  const getFormSections = useCallback((): SectionConfig[] => [
    {
      id: "productSubcategory-info",
      title: "Información de la Subcategoría",
      description: "Ingrese los datos de la nueva subcategoría de producto",
      fields: [
        {
          id: "subcategoryName",
          type: "text",
          label: "Nombre *",
          name: "subcategoryName",
          placeholder: "Ingrese nombre de la subcategoría",
          required: true,
          helperText: "Ingrese el nombre identificativo de la subcategoría"
        },
        {
          id: "categoryId",
          type: "select",
          label: "Categoría padre *",
          name: "categoryId",
          placeholder: "Seleccione una categoría",
          required: true,
          helperText: "Seleccione la categoría a la que pertenece esta subcategoría",
          options: productCategories.map(category => ({
            value: category._id,
            label: category.categoryName
          }))
        },
        {
          id: "state",
          type: "checkbox",
          label: "Activo",
          name: "state",
          required: false,
          helperText: "Indica si la subcategoría está activa"
        }
      ],
    }
  ], [productCategories]);

  // Form validation schema
  const formValidationSchema = z.object({
    subcategoryName: z.string().min(1, { message: "El nombre es obligatorio" }),
    categoryId: z.string().min(1, { message: "La categoría padre es obligatoria" }),
    state: z.boolean().default(true)
  });

  // Form submit handler
  const handleFormSubmit = (data: Partial<IProductSubcategory>) => {
    if (isEditMode && selectedProductSubcategory && selectedProductSubcategory._id) {
      handleUpdateProductSubcategory(selectedProductSubcategory._id, data);
    } else {
      handleAddProductSubcategory(data);
    }
  };

  // Handle edit button click
  const handleEditClick = (productSubcategory: IProductSubcategory) => {
    setSelectedProductSubcategory(productSubcategory);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: IProductSubcategory) => {
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
            if (window.confirm(`¿Está seguro de eliminar la subcategoría ${row.subcategoryName}?`)) {
              handleDeleteProductSubcategory(row._id);
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
          <h1 className="text-2xl font-bold">Subcategorías de Productos</h1>
          <p className="text-muted-foreground">
            {isModal 
              ? "Gestione las subcategorías de productos"
              : "Gestione las subcategorías de productos para su organización"
            }
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedProductSubcategory(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Subcategoría
        </Button>
      </div>

      <div className={isModal ? "px-0.5 h-[calc(100vh-200px)] overflow-hidden" : ""}>
        <Grid
          data={productSubcategories}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          isLoading={isLoading}
          gridId="productSubcategories-grid"
          idField="_id"
          title=""
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Subcategoría" : "Agregar Nueva Subcategoría"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} una subcategoría de producto.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedProductSubcategory ? {
              subcategoryName: selectedProductSubcategory.subcategoryName,
              categoryId: selectedProductSubcategory.categoryId,
              state: selectedProductSubcategory.state
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

export default ProductSubcategory;