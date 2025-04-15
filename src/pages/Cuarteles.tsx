import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
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
import { Cuartel } from "@/types/cuartel";
import cuartelService from "@/_services/cuartelService";
import { toast } from "@/components/ui/use-toast";

// Mock data for cuarteles that matches the API structure

// Mock data for equipment that can be assigned to cuarteles


// Equipment grid columns
const equipmentColumns = [
  {
    id: "name",
    header: "Nombre",
    accessor: "name"
  },
  {
    id: "type",
    header: "Tipo",
    accessor: "type"
  },
  {
    id: "status",
    header: "Estado",
    accessor: "status"
  },
  {
    id: "lastMaintenance",
    header: "Último mantenimiento",
    accessor: "lastMaintenance"
  }
];

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

// Column configuration for the grid - updated to match the API structure
const columns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: true,
    sortable: true,
  },
  {
    id: "barracks",
    header: "Nombre",
    accessor: "barracks",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "species",
    header: "Especie",
    accessor: "species",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "variety",
    header: "Variedad",
    accessor: "variety",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "phenologicalState",
    header: "Estado Fenológico",
    accessor: "phenologicalState",
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

// Expandable content for each row - updated for new structure
const expandableContent = (row: any) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.barracks}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Especie:</strong> {row.species}
        </p>
        <p>
          <strong>Variedad:</strong> {row.variety}
        </p>
      </div>
      <div>
        <p>
          <strong>Estado Fenológico:</strong> {row.phenologicalState}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new cuartel - matches exactly the model structure
const formSections: SectionConfig[] = [
  {
    id: "cuartel-info",
    title: "Información del Cuartel",
    description: "Ingrese los datos del nuevo cuartel",
    fields: [
      {
        id: "barracks",
        type: "text",
        label: "Nombre del Cuartel",
        name: "barracks",
        placeholder: "Nombre del cuartel",
        required: true,
        helperText: "Ingrese el nombre identificativo del cuartel"
      },
      {
        id: "species",
        type: "text",
        label: "Especie",
        name: "species",
        placeholder: "Ej: Manzana, Pera, Uva",
        required: true,
        helperText: "Especie principal cultivada en este cuartel"
      },
      {
        id: "variety",
        type: "text",
        label: "Variedad",
        name: "variety",
        placeholder: "Ej: Fuji, Bartlett, Cabernet",
        required: true,
        helperText: "Variedad específica de la especie"
      },
      {
        id: "phenologicalState",
        type: "text",
        label: "Estado Fenológico",
        name: "phenologicalState",
        placeholder: "Ej: Floración, Maduración, Cosecha",
        required: true,
        helperText: "Estado actual de desarrollo de la planta"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el cuartel está actualmente en uso"
      },
    ],
  }
];

// Form validation schema - matches exactly the model requirements
const formValidationSchema = z.object({
  barracks: z.string().min(1, { message: "El nombre del cuartel es obligatorio" }),
  species: z.string().min(1, { message: "La especie es obligatoria" }),
  variety: z.string().min(1, { message: "La variedad es obligatoria" }),
  phenologicalState: z.string().min(1, { message: "El estado fenológico es obligatorio" }),
  state: z.boolean().default(false)
});

const Cuarteles = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cuarteles, setCuarteles] = useState<Cuartel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCuartel, setSelectedCuartel] = useState<Cuartel | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch cuarteles on component mount
  useEffect(() => {
    fetchCuarteles();
  }, []);
  
  // Function to fetch cuarteles data
  const fetchCuarteles = async () => {
    setIsLoading(true);
    try {
      const data = await cuartelService.findAll();
      setCuarteles(data.data);
    } catch (error) {
      console.error("Error loading cuarteles:", error);
      // Use mock data in case of API failure
      // setCuarteles(cuartelesData);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new cuartel
  const handleAddCuartel = async (data: Partial<Cuartel>) => {
    try {
      // Preparar datos según la estructura exacta del modelo
      const cuartelData: Partial<Cuartel> = {
        barracks: data.barracks,
        species: data.species,
        variety: data.variety, 
        phenologicalState: data.phenologicalState,
        state: data.state !== undefined ? data.state : false
      };
      
      const newCuartel = await cuartelService.createCuartel(cuartelData);
      setCuarteles((prevCuarteles) => [...prevCuarteles, newCuartel]);
      setIsDialogOpen(false);
      toast({
        title: "Cuartel creado",
        description: `El cuartel ${newCuartel.barracks} ha sido creado exitosamente.`,
      });
    } catch (error) {
      console.error("Error creating cuartel:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el cuartel. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating an existing cuartel
  const handleUpdateCuartel = async (id: string | number, data: Partial<Cuartel>) => {
    try {
      console.log("updatecuartel", data);
      // Preparar datos según la estructura exacta del modelo
      const cuartelData: Partial<Cuartel> = {
        barracks: data.barracks,
        species: data.species,
        variety: data.variety,
        phenologicalState: data.phenologicalState,
        state: data.state !== undefined ? data.state : false
      };
      
      const updatedCuartel = await cuartelService.updateCuartel(id, cuartelData);
      // setCuarteles((prevCuarteles) => 
      //   prevCuarteles.map((cuartel) => 
      //     cuartel._id === id ? updatedCuartel : cuartel
      //   )
      // );
      await fetchCuarteles();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedCuartel(null);
      toast({
        title: "Cuartel actualizado",
        description: `El cuartel ${cuartelData.barracks} ha sido actualizado exitosamente.`,
      });
    } catch (error) {
      console.error("Error updating cuartel:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el cuartel. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a cuartel
  const handleDeleteCuartel = async (id: string | number) => {
    try {
      await cuartelService.softDeleteCuartel(id);
      setCuarteles((prevCuarteles) => prevCuarteles.filter((cuartel) => cuartel._id !== id));
      toast({
        title: "Cuartel eliminado",
        description: "El cuartel ha sido eliminado exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting cuartel:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el cuartel. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission based on mode (create or edit)
  const handleFormSubmit = (data: Partial<Cuartel>) => {
    if (isEditMode && selectedCuartel && selectedCuartel._id) {
      console.log("handleFormSubmit updatecuartel", data);
      handleUpdateCuartel(selectedCuartel._id, data);
    } else {
      console.log("handleFormSubmit addcuartel", data);
      handleAddCuartel(data);
    }
  };

  // Function to handle edit button click
  const handleEditClick = (cuartel: Cuartel) => {
    setSelectedCuartel(cuartel);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: Cuartel) => {
    return (
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick(row);
          }}
          title="Editar"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            if (row._id) {
              handleDeleteCuartel(row._id);
            }
          }}
          title="Eliminar"
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cuarteles</h1>
        <Button onClick={() => {
          setSelectedCuartel(null);
          setIsEditMode(false);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cuartel
        </Button>
      </div>

      {/* Grid using Zustand store with actual cuarteles data or loading state */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Cargando cuarteles...</p>
        </div>
      ) : (
        <Grid
          data={cuarteles}
          columns={columns}
          title="Cuarteles"
          // expandableContent={expandableContent}
          gridId="cuarteles"
          actions={renderActions}
        />
      )}

      {/* Dialog for adding or editing a cuartel */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Cuartel" : "Añadir Nuevo Cuartel"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Modifique el formulario para actualizar el cuartel." 
                : "Complete el formulario para añadir un nuevo cuartel al sistema."
              }
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            validationSchema={formValidationSchema}
            defaultValues={
              isEditMode && selectedCuartel 
                ? {
                    barracks: selectedCuartel.barracks,
                    species: selectedCuartel.species,
                    variety: selectedCuartel.variety,
                    phenologicalState: selectedCuartel.phenologicalState,
                    state: selectedCuartel.state,
                  }
                : { state: false }
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cuarteles;
