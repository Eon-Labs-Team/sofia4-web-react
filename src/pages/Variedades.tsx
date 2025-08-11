import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Leaf,
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
import { IVarietyType } from "@eon-lib/eon-mongoose";
import { z } from "zod";
import varietyTypeService from "@/_services/varietyTypeService";
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

// Column configuration for the grid - based on the IVarietyType model
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
    id: "cropName",
    header: "Nombre del Cultivo",
    accessor: "cropName",
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
    <h3 className="text-lg font-semibold mb-2">{row.cropName}</h3>
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

// Form configuration for adding new variety type - matches exactly the model structure
const formSections: SectionConfig[] = [
  {
    id: "variety-info",
    title: "Información de la Variedad",
    description: "Ingrese los datos de la nueva variedad",
    fields: [
      {
        id: "idOrder",
        type: "number",
        label: "Orden",
        name: "idOrder",
        placeholder: "Número de orden",
        required: true,
        helperText: "Ingrese el número de orden para esta variedad"
      },
      {
        id: "cropName",
        type: "text",
        label: "Nombre del Cultivo",
        name: "cropName",
        placeholder: "Ej: Manzana, Pera, Uva",
        required: true,
        helperText: "Nombre de esta variedad de cultivo"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si la variedad está actualmente en uso"
      },
    ],
  }
];

// Form validation schema - matches exactly the model requirements
const formValidationSchema = z.object({
  idOrder: z.number({ required_error: "El orden es obligatorio" }),
  cropName: z.string().min(1, { message: "El nombre del cultivo es obligatorio" }),
  state: z.boolean().default(true)
});

const Variedades = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [varieties, setVarieties] = useState<IVarietyType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVariety, setSelectedVariety] = useState<IVarietyType | null>(null);
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
  
  // Fetch varieties on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchVarieties();
    }
  }, [propertyId]);
  
  // Function to fetch varieties data
  const fetchVarieties = async () => {
    setIsLoading(true);
    try {
      const response = await varietyTypeService.findAll(propertyId);
      // Verificar si la respuesta es un array o un objeto con propiedad data
      const data = Array.isArray(response) ? response : (response as any).data || [];
      setVarieties(data);
    } catch (error) {
      console.error("Error loading varieties:", error);
      setVarieties([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new variety
  const handleAddVariety = async (data: Partial<IVarietyType>) => {
    try {
      await varietyTypeService.createVariety(data, propertyId);
      toast({
        title: "Variedad agregada",
        description: "La variedad ha sido agregada exitosamente.",
      });
      fetchVarieties();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding variety:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al agregar la variedad.",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a variety
  const handleUpdateVariety = async (id: string | number, data: Partial<IVarietyType>) => {
    try {
      await varietyTypeService.updateVariety(id, data);
      toast({
        title: "Variedad actualizada",
        description: "La variedad ha sido actualizada exitosamente.",
      });
      fetchVarieties();
      setIsDialogOpen(false);
      setSelectedVariety(null);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating variety:", error);
      toast({
        title: "Error",
        description: "Hubo un problema al actualizar la variedad.",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a variety
  const handleDeleteVariety = async (id: string | number) => {
    if (confirm("¿Está seguro que desea eliminar esta variedad?")) {
      try {
        await varietyTypeService.softDeleteVariety(id);
        toast({
          title: "Variedad eliminada",
          description: "La variedad ha sido eliminada exitosamente.",
        });
        fetchVarieties();
      } catch (error) {
        console.error("Error deleting variety:", error);
        toast({
          title: "Error",
          description: "Hubo un problema al eliminar la variedad.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Function to handle form submission (add or update)
  const handleFormSubmit = (data: Partial<IVarietyType>) => {
    if (isEditMode && selectedVariety) {
      handleUpdateVariety(selectedVariety._id, data);
    } else {
      handleAddVariety(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (variety: IVarietyType) => {
    setSelectedVariety(variety);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render action buttons for each row
  const renderActions = (row: IVarietyType) => {
    return (
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleEditClick(row)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDeleteVariety(row._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Variedades</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedVariety(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Variedad
        </Button>
      </div>
      
      <Grid
        gridId="varieties-grid"
        data={varieties}
        columns={columns}
        idField="_id"
        title="Variedades"
        expandableContent={expandableContent}
        actions={renderActions}
      />
      
      {/* Dialog for adding/editing varieties */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Variedad" : "Agregar Nueva Variedad"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique los detalles de la variedad seleccionada."
                : "Complete el formulario para agregar una nueva variedad."}
            </DialogDescription>
          </DialogHeader>
          
          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={
              isEditMode && selectedVariety
                ? {
                    idOrder: selectedVariety.idOrder,
                    cropName: selectedVariety.cropName,
                    state: selectedVariety.state,
                  }
                : {
                    idOrder: 0,
                    cropName: "",
                    state: true,
                  }
            }
          />
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedVariety(null);
                setIsEditMode(false);
              }}
              className="mr-2"
            >
              Cancelar
            </Button>
            <Button form="dynamic-form" type="submit">
              {isEditMode ? "Actualizar" : "Agregar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Variedades; 