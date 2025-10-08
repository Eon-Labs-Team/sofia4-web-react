import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Building2,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Droplets,
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
import { IChlorineRegistration } from "@eon-lib/eon-mongoose/types";
import { z } from "zod";
import chlorineRegistrationService from "@/_services/chlorineRegistrationService";
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
    id: "code",
    header: "Código",
    accessor: "code",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "area",
    header: "Área",
    accessor: "area",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "plotLot",
    header: "Lote",
    accessor: "plotLot",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "frequency",
    header: "Frecuencia",
    accessor: "frequency",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "supervisor",
    header: "Supervisor",
    accessor: "supervisor",
    visible: true,
    sortable: true,
  },
  {
    id: "observations",
    header: "Observaciones",
    accessor: "observations",
    visible: true,
    sortable: true,
  },
  {
    id: "reviewer",
    header: "Revisor",
    accessor: "reviewer",
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
    <h3 className="text-lg font-semibold mb-2">{row.code}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Área:</strong> {row.area}
        </p>
        <p>
          <strong>Lote:</strong> {row.plotLot}
        </p>
        <p>
          <strong>Frecuencia:</strong> {row.frequency}
        </p>
      </div>
      <div>
        <p>
          <strong>Supervisor:</strong> {row.supervisor}
        </p>
        <p>
          <strong>Observaciones:</strong> {row.observations}
        </p>
        <p>
          <strong>Revisor:</strong> {row.reviewer}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new chlorine registration
const formSections: SectionConfig[] = [
  {
    id: "chlorine-registration-info",
    title: "Información del Registro de Cloro en Láminas de Espuma",
    description: "Ingrese los datos del nuevo registro",
    fields: [
      {
        id: "code",
        type: "text",
        label: "Código",
        name: "code",
        placeholder: "Código del registro",
        required: true,
        helperText: "Ingrese el código identificativo del registro"
      },
      {
        id: "area",
        type: "text",
        label: "Área",
        name: "area",
        placeholder: "Área",
        required: true,
        helperText: "Área donde se realizó el registro"
      },
      {
        id: "plotLot",
        type: "text",
        label: "Lote",
        name: "plotLot",
        placeholder: "Lote",
        required: true,
        helperText: "Lote donde se aplicó el cloro"
      },
      {
        id: "frequency",
        type: "text",
        label: "Frecuencia",
        name: "frequency",
        placeholder: "Frecuencia de aplicación",
        required: true,
        helperText: "Frecuencia con la que se aplica el cloro"
      },
      {
        id: "supervisor",
        type: "text",
        label: "Supervisor",
        name: "supervisor",
        placeholder: "Nombre del supervisor",
        required: true,
        helperText: "Nombre de la persona que supervisó el proceso"
      },
      {
        id: "observations",
        type: "textarea",
        label: "Observaciones",
        name: "observations",
        placeholder: "Observaciones del proceso",
        required: true,
        helperText: "Observaciones relevantes del proceso"
      },
      {
        id: "reviewer",
        type: "text",
        label: "Revisor",
        name: "reviewer",
        placeholder: "Nombre del revisor",
        required: true,
        helperText: "Nombre de la persona que revisó el registro"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el registro está actualmente activo"
      },
    ],
  }
];

// Form validation schema
const formValidationSchema = z.object({
  code: z.string().min(1, { message: "El código es obligatorio" }),
  area: z.string().min(1, { message: "El área es obligatoria" }),
  plotLot: z.string().min(1, { message: "El lote es obligatorio" }),
  frequency: z.string().min(1, { message: "La frecuencia es obligatoria" }),
  supervisor: z.string().min(1, { message: "El supervisor es obligatorio" }),
  observations: z.string().min(1, { message: "Las observaciones son obligatorias" }),
  reviewer: z.string().min(1, { message: "El revisor es obligatorio" }),
  state: z.boolean().default(true)
});

const ChlorineRegistration = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [chlorineRegistrations, setChlorineRegistrations] = useState<IChlorineRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChlorineRegistration, setSelectedChlorineRegistration] = useState<IChlorineRegistration | null>(null);
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
  
  // Fetch chlorine registrations on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchChlorineRegistrations();
    }
  }, [propertyId]);
  
  // Function to fetch chlorine registration data
  const fetchChlorineRegistrations = async () => {
    setIsLoading(true);
    try {
      const response = await chlorineRegistrationService.findAll();
      // Manejar caso donde la respuesta puede ser un objeto con propiedad data o directamente un array
      if (Array.isArray(response)) {
        setChlorineRegistrations(response);
      } else if (response && response.data) {
        setChlorineRegistrations(response.data);
      } else {
        setChlorineRegistrations([]);
      }
    } catch (error) {
      console.error("Error loading chlorine registrations:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros de cloro.",
        variant: "destructive",
      });
      setChlorineRegistrations([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new chlorine registration
  const handleAddChlorineRegistration = async (data: Partial<IChlorineRegistration>) => {
    try {
      await chlorineRegistrationService.createChlorineRegistration(data);
      
      toast({
        title: "Éxito",
        description: "Registro de cloro creado correctamente.",
      });
      
      fetchChlorineRegistrations();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating chlorine registration:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el registro de cloro.",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a chlorine registration
  const handleUpdateChlorineRegistration = async (id: string | number, data: Partial<IChlorineRegistration>) => {
    try {
      await chlorineRegistrationService.updateChlorineRegistration(id, data);
      
      toast({
        title: "Éxito",
        description: "Registro de cloro actualizado correctamente.",
      });
      
      fetchChlorineRegistrations();
      setIsDialogOpen(false);
      setSelectedChlorineRegistration(null);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating chlorine registration:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro de cloro.",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a chlorine registration
  const handleDeleteChlorineRegistration = async (id: string | number) => {
    try {
      await chlorineRegistrationService.softDeleteChlorineRegistration(id);
      
      toast({
        title: "Éxito",
        description: "Registro de cloro eliminado correctamente.",
      });
      
      fetchChlorineRegistrations();
    } catch (error) {
      console.error("Error deleting chlorine registration:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro de cloro.",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IChlorineRegistration>) => {
    if (isEditMode && selectedChlorineRegistration) {
      handleUpdateChlorineRegistration(selectedChlorineRegistration._id, data);
    } else {
      handleAddChlorineRegistration(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (chlorineRegistration: IChlorineRegistration) => {
    setSelectedChlorineRegistration(chlorineRegistration);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Function to render action buttons for each row
  const actionsRenderer = (row: IChlorineRegistration) => {
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
          onClick={() => handleDeleteChlorineRegistration(row._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Registro de Cloro en Láminas de Espuma</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedChlorineRegistration(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" /> Agregar Registro
        </Button>
      </div>

      <Grid 
        data={chlorineRegistrations} 
        columns={columns} 
        expandableContent={expandableContent}
        actions={actionsRenderer}
        gridId="chlorine-registration-grid"
        title="Registros de Cloro en Láminas de Espuma"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Registro de Cloro" : "Agregar Nuevo Registro de Cloro"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Actualice la información del registro de cloro en este formulario."
                : "Complete los detalles para agregar un nuevo registro de cloro."
              }
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedChlorineRegistration ? {
              code: selectedChlorineRegistration.code,
              area: selectedChlorineRegistration.area,
              plotLot: selectedChlorineRegistration.plotLot,
              frequency: selectedChlorineRegistration.frequency,
              supervisor: selectedChlorineRegistration.supervisor,
              observations: selectedChlorineRegistration.observations,
              reviewer: selectedChlorineRegistration.reviewer,
              state: selectedChlorineRegistration.state
            } : undefined}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChlorineRegistration; 