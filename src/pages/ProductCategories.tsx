import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  Tag,
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
  FieldType,
} from "@/components/DynamicForm/DynamicForm";
import { IProductCategory } from "@eon-lib/eon-mongoose";
import { z } from "zod";
import productCategoryService from "@/_services/productCategoryService";
import { toast } from "@/components/ui/use-toast";

// Render function for the state column (boolean)
const renderState = (value: boolean) => {
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
    id: "idOrder",
    header: "Orden",
    accessor: "idOrder",
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
    groupable: true,
  },
  {
    id: "subCategory",
    header: "Subcategoría",
    accessor: "subCategory",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "numberSubCategory",
    header: "Número de Subcategoría",
    accessor: "numberSubCategory",
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
    render: renderState,
  }
];

// Expandable content for each row
const expandableContent = (row: any) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.description}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Subcategoría:</strong> {row.subCategory}
        </p>
        <p>
          <strong>Número de Subcategoría:</strong> {row.numberSubCategory}
        </p>
      </div>
      <div>
        <p>
          <strong>Orden:</strong> {row.idOrder}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding/editing categories
const formSections: SectionConfig[] = [
  {
    id: "product-category-info",
    title: "Información de la Categoría de Producto",
    description: "Ingrese los datos de la categoría de producto",
    fields: [
      {
        id: "Nombre categoría",
        type: "text",
        label: "Descripción",
        name: "description",
        placeholder: "Descripción de la categoría",
        required: true,
        helperText: "Ingrese la descripción de la categoría de producto"
      },
      {
        id: "subCategory",
        type: "text",
        label: "Subcategorías",
        name: "subCategory",
        placeholder: "Subcategoría",
        required: true,
        helperText: "Lista de subcategorías"
      },
      {
        id: "numberSubCategory",
        type: "number",
        label: "Número de Subcategoría",
        name: "numberSubCategory",
        placeholder: "Cantidad de subcategorías",
        required: true,
        helperText: ""
      },
      {
        id: "idOrder",
        type: "number",
        label: "Orden",
        name: "idOrder",
        placeholder: "Número de orden",
        required: true,
        helperText: "Ingrese el número de orden"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si la categoría está actualmente en uso"
      },
    ],
  }
];

// Form validation schema
const formValidationSchema = z.object({
  description: z.string().min(1, { message: "La descripción es obligatoria" }),
  subCategory: z.string().min(1, { message: "La subcategoría es obligatoria" }),
  numberSubCategory: z.number().min(0, { message: "El número de subcategoría debe ser mayor o igual a 0" }),
  idOrder: z.number().min(0, { message: "El orden debe ser mayor o igual a 0" }),
  state: z.boolean().default(false)
});

const ProductCategories = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productCategories, setProductCategories] = useState<IProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IProductCategory | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchProductCategories();
  }, []);
  
  // Function to fetch categories data
  const fetchProductCategories = async () => {
    setIsLoading(true);
    try {
      const response = await productCategoryService.findByEnterpriseId();
      // Handle different response formats
      let categoriesData: IProductCategory[] = [];
      if (Array.isArray(response)) {
        categoriesData = response;
      } else if (response && typeof response === 'object') {
        const responseObject = response as any;
        if (responseObject.data && Array.isArray(responseObject.data)) {
          categoriesData = responseObject.data;
        }
      }
      setProductCategories(categoriesData);
    } catch (error) {
      console.error("Error loading product categories:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías de productos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new category
  const handleAddCategory = async (data: Partial<IProductCategory>) => {
    try {
      await productCategoryService.createProductCategory(data);
      
      toast({
        title: "Éxito",
        description: "Categoría de producto creada correctamente",
      });
      
      // Refresh the grid
      fetchProductCategories();
      
      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating product category:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la categoría de producto",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a category
  const handleUpdateCategory = async (id: string, data: Partial<IProductCategory>) => {
    try {
      await productCategoryService.updateProductCategory(id, data);
      
      toast({
        title: "Éxito",
        description: "Categoría de producto actualizada correctamente",
      });
      
      // Refresh the grid
      fetchProductCategories();
      
      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error(`Error updating product category ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría de producto",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a category
  const handleDeleteCategory = async (id: string) => {
    try {
      await productCategoryService.softDeleteProductCategory(id);
      
      toast({
        title: "Éxito",
        description: "Categoría de producto eliminada correctamente",
      });
      
      // Refresh the grid
      fetchProductCategories();
    } catch (error) {
      console.error(`Error deleting product category ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría de producto",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IProductCategory>) => {
    if (isEditMode && selectedCategory) {
      handleUpdateCategory(selectedCategory._id, data);
    } else {
      handleAddCategory(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (category: IProductCategory) => {
    setSelectedCategory(category);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render actions column with edit and delete buttons
  const renderActions = (row: IProductCategory) => {
    return (
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon" onClick={() => handleEditClick(row)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteCategory(row._id)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categorías de Productos</h1>
        <Button
          onClick={() => {
            setSelectedCategory(null);
            setIsEditMode(false);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Categoría
        </Button>
      </div>

      {/* Grid component */}
      <Grid
        data={productCategories}
        columns={[
          ...columns, 
          { 
            id: "actions", 
            header: "Acciones", 
            accessor: "_id", 
            visible: true,
            sortable: false,
            render: renderActions 
          }
        ]}
        gridId="product-categories-grid"
        title="Categorías de Productos"
        expandableContent={expandableContent}
        actions={renderActions}
      />
      {isLoading && <div className="py-8 text-center">Cargando categorías de productos...</div>}

      {/* Add/Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar" : "Agregar"} Categoría de Producto
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} una categoría de producto.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            validationSchema={formValidationSchema}
            defaultValues={isEditMode && selectedCategory ? selectedCategory : undefined}
          />

          <DialogFooter>
            <Button type="submit" form="dynamic-form">
              {isEditMode ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCategories; 