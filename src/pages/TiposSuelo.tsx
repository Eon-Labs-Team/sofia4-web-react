import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
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
  FieldType,
} from "@/components/DynamicForm/DynamicForm";
import { ISoilType } from "@eon-lib/eon-mongoose";
import { z } from "zod";
import soilTypeService from "@/_services/soilTypeService";
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
    <h3 className="text-lg font-semibold mb-2">Tipo de Suelo: {row.description}</h3>
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

// Form configuration for adding new soil type
const formSections: SectionConfig[] = [
  {
    id: "soil-type-info",
    title: "Información del Tipo de Suelo",
    description: "Ingrese los datos del nuevo tipo de suelo",
    fields: [
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
        id: "description",
        type: "text",
        label: "Descripción",
        name: "description",
        placeholder: "Descripción del tipo de suelo",
        required: true,
        helperText: "Ingrese la descripción del tipo de suelo"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el tipo de suelo está actualmente en uso"
      },
    ],
  }
];

// Form validation schema
const formValidationSchema = z.object({
  idOrder: z.number().int().min(1, { message: "El orden es obligatorio y debe ser mayor a 0" }),
  description: z.string().min(1, { message: "La descripción es obligatoria" }),
  state: z.boolean().default(true)
});

const TiposSuelo = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [soilTypes, setSoilTypes] = useState<ISoilType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSoilType, setSelectedSoilType] = useState<ISoilType | null>(null);
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
  
  // Fetch soil types on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchSoilTypes();
    }
  }, [propertyId]);
  
  // Function to fetch soil types data
  const fetchSoilTypes = async () => {
    setIsLoading(true);
    try {
      const data = await soilTypeService.findAll(propertyId);
      // Handle different API response formats
      // @ts-ignore
      setSoilTypes(Array.isArray(data) ? data : (data?.data || []));
    } catch (error) {
      console.error("Error loading soil types:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de suelo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new soil type
  const handleAddSoilType = async (data: Partial<ISoilType>) => {
    try {
      const soilTypeData: Partial<ISoilType> = {
        idOrder: data.idOrder,
        description: data.description,
        state: data.state !== undefined ? data.state : true
      };
      
      await soilTypeService.createSoilType(soilTypeData, propertyId);
      
      toast({
        title: "Éxito",
        description: "Tipo de suelo agregado correctamente",
      });
      
      // Refresh soil types list
      fetchSoilTypes();
      
      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding soil type:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el tipo de suelo",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a soil type
  const handleUpdateSoilType = async (id: string | number, data: Partial<ISoilType>) => {
    try {
      await soilTypeService.updateSoilType(id, data);
      
      toast({
        title: "Éxito",
        description: "Tipo de suelo actualizado correctamente",
      });
      
      // Refresh soil types list
      fetchSoilTypes();
      
      // Close the dialog and reset selected soil type
      setIsDialogOpen(false);
      setSelectedSoilType(null);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating soil type:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el tipo de suelo",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a soil type
  const handleDeleteSoilType = async (id: string | number) => {
    try {
      await soilTypeService.softDeleteSoilType(id);
      
      toast({
        title: "Éxito",
        description: "Tipo de suelo eliminado correctamente",
      });
      
      // Refresh soil types list
      fetchSoilTypes();
    } catch (error) {
      console.error("Error deleting soil type:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el tipo de suelo",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<ISoilType>) => {
    if (isEditMode && selectedSoilType) {
      handleUpdateSoilType(selectedSoilType._id!, data);
    } else {
      handleAddSoilType(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (soilType: ISoilType) => {
    setSelectedSoilType(soilType);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render action buttons for each row
  const renderActions = (row: ISoilType) => {
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
          onClick={() => handleDeleteSoilType(row._id!)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tipos de Suelo</h1>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedSoilType(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Tipo de Suelo
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Cargando tipos de suelo...</p>
        </div>
      ) : (
        <Grid
          data={soilTypes}
          columns={columns}
          title="Tipos de Suelo"
          expandableContent={expandableContent}
          gridId="tiposSuelo"
          actions={renderActions}
        />
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Tipo de Suelo" : "Agregar Tipo de Suelo"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique los datos del tipo de suelo existente"
                : "Complete los datos para crear un nuevo tipo de suelo"}
            </DialogDescription>
          </DialogHeader>
          
          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedSoilType ? {
              idOrder: selectedSoilType.idOrder,
              description: selectedSoilType.description,
              state: selectedSoilType.state
            } : { state: true }}
          />
          
          <DialogFooter className="sm:justify-start">
            <div className="w-full flex justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsDialogOpen(false);
                  setSelectedSoilType(null);
                  setIsEditMode(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TiposSuelo; 