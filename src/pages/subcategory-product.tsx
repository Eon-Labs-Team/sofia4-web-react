import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
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
import { ISubCategoryProduct } from "@eon-lib/eon-mongoose";
import { z } from "zod";
import subcategoryProductService from "@/_services/subcategoryProductService";
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
          <strong>Orden:</strong> {row.idOrder}
        </p>
      </div>
      <div>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new subcategory
const formSections: SectionConfig[] = [
  {
    id: "subcategory-info",
    title: "Información de la Subcategoría",
    description: "Ingrese los datos de la nueva subcategoría de producto",
    fields: [
      {
        id: "idOrder",
        type: "number",
        label: "Orden",
        name: "idOrder",
        placeholder: "Número de orden",
        required: true,
        helperText: "Ingrese el número de orden de la subcategoría"
      },
      {
        id: "description",
        type: "text",
        label: "Descripción",
        name: "description",
        placeholder: "Descripción de la subcategoría",
        required: true,
        helperText: "Ingrese la descripción de la subcategoría"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si la subcategoría está actualmente en uso"
      },
    ],
  }
];

// Form validation schema
const formValidationSchema = z.object({
  idOrder: z.number().min(1, { message: "El orden es obligatorio" }),
  description: z.string().min(1, { message: "La descripción es obligatoria" }),
  state: z.boolean().default(false)
});

const SubcategoryProduct = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subcategories, setSubcategories] = useState<ISubCategoryProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ISubCategoryProduct | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Get propertyId from AuthStore
  const { propertyId } = useAuthStore();
  
  // Redirect to homepage if no propertyId is available
  useEffect(() => {
    if (!propertyId) {
      toast({
        title: "Error",
        description: "No hay un predio seleccionado. Por favor, seleccione un predio desde la página principal.",
        variant: "destructive",
      });
    }
  }, [propertyId]);
  
  // Fetch subcategories on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchSubcategories();
    }
  }, [propertyId]);
  
  // Function to fetch subcategories data
  const fetchSubcategories = async () => {
    setIsLoading(true);
    try {
      const data = await subcategoryProductService.findAll();
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading subcategories:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las subcategorías de productos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new subcategory
  const handleAddSubcategory = async (data: Partial<ISubCategoryProduct>) => {
    try {
      // Prepare data according to the exact model structure
      const subcategoryData: Partial<ISubCategoryProduct> = {
        order: (data as any).idOrder || (data as any).order || 0,
        subcategoryName: (data as any).description || data.subcategoryName,
        categoryId: data.categoryId || 0,
        state: data.state !== undefined ? data.state : false
      };
      
      await subcategoryProductService.createSubcategoryProduct(subcategoryData);
      
      // Refresh the list after adding
      await fetchSubcategories();
      
      // Close dialog and show success message
      setIsDialogOpen(false);
      toast({
        title: "Éxito",
        description: "Subcategoría agregada correctamente",
      });
    } catch (error) {
      console.error("Error adding subcategory:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la subcategoría",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a subcategory
  const handleUpdateSubcategory = async (id: string | number, data: Partial<ISubCategoryProduct>) => {
    try {
      await subcategoryProductService.updateSubcategoryProduct(id, data);
      
      // Refresh the list after updating
      await fetchSubcategories();
      
      // Close dialog and show success message
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedSubcategory(null);
      toast({
        title: "Éxito",
        description: "Subcategoría actualizada correctamente",
      });
    } catch (error) {
      console.error(`Error updating subcategory ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la subcategoría",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a subcategory
  const handleDeleteSubcategory = async (id: string | number) => {
    try {
      await subcategoryProductService.softDeleteSubcategoryProduct(id);
      
      // Refresh the list after deleting
      await fetchSubcategories();
      
      toast({
        title: "Éxito",
        description: "Subcategoría desactivada correctamente",
      });
    } catch (error) {
      console.error(`Error deactivating subcategory ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo desactivar la subcategoría",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<ISubCategoryProduct>) => {
    if (isEditMode && selectedSubcategory) {
      handleUpdateSubcategory(selectedSubcategory._id, data);
    } else {
      handleAddSubcategory(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (subcategory: ISubCategoryProduct) => {
    setSelectedSubcategory(subcategory);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render action buttons for each row
  const renderActions = (row: any) => {
    return (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleEditClick(row)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteSubcategory(row._id)}
          disabled={!row.state}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Subcategorías de Productos</h1>
          <p className="text-muted-foreground">
            Gestione las subcategorías de productos de su empresa
          </p>
        </div>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedSubcategory(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Subcategoría
        </Button>
      </div>
      
      <Grid
        data={subcategories}
        columns={columns}
        expandableContent={expandableContent}
        actions={renderActions}
        gridId="subcategory-product-grid"
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Subcategoría" : "Agregar Subcategoría"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Actualice la información de la subcategoría"
                : "Complete el formulario para agregar una nueva subcategoría"}
            </DialogDescription>
          </DialogHeader>
          
          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={
              isEditMode && selectedSubcategory
                ? {
                    order: (selectedSubcategory as any).idOrder || selectedSubcategory.order,
                    subcategoryName: (selectedSubcategory as any).description || selectedSubcategory.subcategoryName,
                    categoryId: selectedSubcategory.categoryId,
                    state: selectedSubcategory.state,
                  }
                : undefined
            }
          />
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubcategoryProduct; 