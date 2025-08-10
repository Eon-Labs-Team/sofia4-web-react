import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
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
} from "@/components/ui/dialog";
import DynamicForm, {
  SectionConfig,
} from "@/components/DynamicForm/DynamicForm";
import { z } from "zod";
import { IFacilityCleaningRecord } from "@eon-lib/eon-mongoose";
import facilityCleaningService from "@/_services/facilityCleaningService";
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

// Column configuration for the grid - matches the API structure
const columns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: true,
    sortable: true,
  },
  {
    id: "reviewDate",
    header: "Fecha de Revisión",
    accessor: "reviewDate",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "reviewTime",
    header: "Hora de Revisión",
    accessor: "reviewTime",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "facility",
    header: "Instalación",
    accessor: "facility",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "identification",
    header: "Identificación",
    accessor: "identification",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "facilityType",
    header: "Tipo de Instalación",
    accessor: "facilityType",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "location",
    header: "Ubicación",
    accessor: "location",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "numberOfPeople",
    header: "Número de Personas",
    accessor: "numberOfPeople",
    visible: true,
    sortable: true,
  },
  {
    id: "status",
    header: "Estado",
    accessor: "status",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "cleaningMethod",
    header: "Método de Limpieza",
    accessor: "cleaningMethod",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "responsiblePerson",
    header: "Persona Responsable",
    accessor: "responsiblePerson",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "observations",
    header: "Observaciones",
    accessor: "observations",
    visible: true,
    sortable: true,
  },
  {
    id: "state",
    header: "Estado Activo",
    accessor: "state",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderState,
  }
];

// Form configuration for adding new facility cleaning record - matches exactly the model structure
const formSections: SectionConfig[] = [
  {
    id: "facility-cleaning-info",
    title: "Información de Limpieza de Instalación",
    description: "Ingrese los datos de limpieza de instalación",
    fields: [
      {
        id: "reviewDate",
        type: "date",
        label: "Fecha de Revisión",
        name: "reviewDate",
        required: true,
        helperText: "Fecha en que se realizó la limpieza"
      },
      {
        id: "reviewTime",
        type: "text",
        label: "Hora de Revisión",
        name: "reviewTime",
        required: true,
        helperText: "Hora en que se realizó la limpieza"
      },
      {
        id: "facility",
        type: "text",
        label: "Instalación",
        name: "facility",
        placeholder: "Nombre de la instalación",
        required: true,
        helperText: "Nombre de la instalación limpiada"
      },
      {
        id: "identification",
        type: "text",
        label: "Identificación",
        name: "identification",
        placeholder: "Código o identificador",
        required: true,
        helperText: "Identificador único de la instalación"
      },
      {
        id: "facilityType",
        type: "text",
        label: "Tipo de Instalación",
        name: "facilityType",
        placeholder: "Ej: Oficina, Bodega, Baño",
        required: true,
        helperText: "Tipo de instalación limpiada"
      },
      {
        id: "location",
        type: "text",
        label: "Ubicación",
        name: "location",
        placeholder: "Ubicación de la instalación",
        required: true,
        helperText: "Ubicación física de la instalación"
      },
      {
        id: "numberOfPeople",
        type: "number",
        label: "Número de Personas",
        name: "numberOfPeople",
        placeholder: "0",
        required: true,
        helperText: "Cantidad de personas que utilizan la instalación"
      },
      {
        id: "status",
        type: "text",
        label: "Estado",
        name: "status",
        placeholder: "Estado de la instalación",
        required: true,
        helperText: "Estado actual de la instalación"
      },
      {
        id: "cleaningMethod",
        type: "text",
        label: "Método de Limpieza",
        name: "cleaningMethod",
        placeholder: "Ej: Detergente, Desinfección",
        required: true,
        helperText: "Método utilizado para la limpieza"
      },
      {
        id: "responsiblePerson",
        type: "text",
        label: "Persona Responsable",
        name: "responsiblePerson",
        placeholder: "Nombre del responsable",
        required: true,
        helperText: "Persona responsable de realizar la limpieza"
      },
      {
        id: "observations",
        type: "textarea",
        label: "Observaciones",
        name: "observations",
        placeholder: "Observaciones adicionales",
        required: true,
        helperText: "Observaciones o notas adicionales"
      },
    ],
  },
  {
    id: "images-section",
    title: "Imágenes",
    description: "Ingrese las imágenes de la limpieza",
    fields: [
      {
        id: "image1",
        type: "text",
        label: "Imagen 1",
        name: "image1",
        placeholder: "URL de la imagen 1",
        required: true,
        helperText: "URL de la primera imagen"
      },
      {
        id: "image2",
        type: "text",
        label: "Imagen 2",
        name: "image2",
        placeholder: "URL de la imagen 2",
        required: true,
        helperText: "URL de la segunda imagen"
      },
      {
        id: "image3",
        type: "text",
        label: "Imagen 3",
        name: "image3",
        placeholder: "URL de la imagen 3",
        required: true,
        helperText: "URL de la tercera imagen"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el registro está activo"
      },
    ]
  }
];

// Form validation schema - matches exactly the model requirements
const formValidationSchema = z.object({
  reviewDate: z.string().min(1, { message: "La fecha de revisión es obligatoria" }),
  reviewTime: z.string().min(1, { message: "La hora de revisión es obligatoria" }),
  facility: z.string().min(1, { message: "La instalación es obligatoria" }),
  identification: z.string().min(1, { message: "La identificación es obligatoria" }),
  facilityType: z.string().min(1, { message: "El tipo de instalación es obligatorio" }),
  location: z.string().min(1, { message: "La ubicación es obligatoria" }),
  numberOfPeople: z.coerce.number().min(0, { message: "El número de personas debe ser positivo" }),
  status: z.string().min(1, { message: "El estado es obligatorio" }),
  cleaningMethod: z.string().min(1, { message: "El método de limpieza es obligatorio" }),
  responsiblePerson: z.string().min(1, { message: "La persona responsable es obligatoria" }),
  observations: z.string().min(1, { message: "Las observaciones son obligatorias" }),
  image1: z.string().min(1, { message: "La imagen 1 es obligatoria" }),
  image2: z.string().min(1, { message: "La imagen 2 es obligatoria" }),
  image3: z.string().min(1, { message: "La imagen 3 es obligatoria" }),
  state: z.boolean().default(true)
});

const FacilityCleaning = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [facilityCleaningRecords, setFacilityCleaningRecords] = useState<IFacilityCleaningRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IFacilityCleaningRecord | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch facility cleaning records on component mount
  useEffect(() => {
    fetchFacilityCleaningRecords();
  }, []);
  
  // Function to fetch facility cleaning records data
  const fetchFacilityCleaningRecords = async () => {
    setIsLoading(true);
    try {
      const data = await facilityCleaningService.findAll();
      setFacilityCleaningRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading facility cleaning records:", error);
      // Usar datos de ejemplo en caso de fallo de API
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new facility cleaning record
  const handleAddFacilityCleaningRecord = async (data: Partial<IFacilityCleaningRecord>) => {
    try {
      const newRecord = await facilityCleaningService.createFacilityCleaningRecord(data);
      setFacilityCleaningRecords((prevRecords) => [...prevRecords, newRecord]);
      setIsDialogOpen(false);
      toast({
        title: "Registro creado",
        description: `El registro de limpieza de instalación ha sido creado exitosamente.`,
      });
    } catch (error) {
      console.error("Error creating facility cleaning record:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el registro. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating an existing facility cleaning record
  const handleUpdateFacilityCleaningRecord = async (id: string | number, data: Partial<IFacilityCleaningRecord>) => {
    try {
      await facilityCleaningService.updateFacilityCleaningRecord(id, data);
      await fetchFacilityCleaningRecords();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedRecord(null);
      toast({
        title: "Registro actualizado",
        description: `El registro de limpieza de instalación ha sido actualizado exitosamente.`,
      });
    } catch (error) {
      console.error("Error updating facility cleaning record:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a facility cleaning record
  const handleDeleteFacilityCleaningRecord = async (id: string | number) => {
    try {
      await facilityCleaningService.softDeleteFacilityCleaningRecord(id);
      setFacilityCleaningRecords((prevRecords) => prevRecords.filter((record) => record._id !== id));
      toast({
        title: "Registro eliminado",
        description: "El registro ha sido eliminado exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting facility cleaning record:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission based on mode (create or edit)
  const handleFormSubmit = (data: Partial<IFacilityCleaningRecord>) => {
    if (isEditMode && selectedRecord && selectedRecord._id) {
      handleUpdateFacilityCleaningRecord(selectedRecord._id, data);
    } else {
      handleAddFacilityCleaningRecord(data);
    }
  };

  // Function to handle edit button click
  const handleEditClick = (record: IFacilityCleaningRecord) => {
    setSelectedRecord(record);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: IFacilityCleaningRecord) => {
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
              handleDeleteFacilityCleaningRecord(row._id);
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
        <h1 className="text-3xl font-bold">Limpieza de Instalaciones</h1>
        <Button onClick={() => {
          setSelectedRecord(null);
          setIsEditMode(false);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Limpieza
        </Button>
      </div>

      {/* Grid using Zustand store with actual data or loading state */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Cargando registros de limpieza...</p>
        </div>
      ) : (
        <Grid
          data={facilityCleaningRecords}
          columns={columns}
          title="Limpieza de Instalaciones"
          gridId="facility-cleaning"
          actions={renderActions}
        />
      )}

      {/* Dialog for adding or editing a facility cleaning record */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Registro" : "Agregar Nuevo Registro"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Modifique el formulario para actualizar el registro." 
                : "Complete el formulario para añadir un nuevo registro de limpieza de instalación."
              }
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            validationSchema={formValidationSchema}
            defaultValues={
              isEditMode && selectedRecord 
                ? {
                    reviewDate: selectedRecord.reviewDate,
                    reviewTime: selectedRecord.reviewTime,
                    facility: selectedRecord.facility,
                    identification: selectedRecord.identification,
                    facilityType: selectedRecord.facilityType,
                    location: selectedRecord.location,
                    numberOfPeople: selectedRecord.numberOfPeople,
                    status: selectedRecord.status,
                    cleaningMethod: selectedRecord.cleaningMethod,
                    responsiblePerson: selectedRecord.responsiblePerson,
                    observations: selectedRecord.observations,
                    image1: selectedRecord.image1,
                    image2: selectedRecord.image2,
                    image3: selectedRecord.image3,
                    state: selectedRecord.state,
                  }
                : { state: true }
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacilityCleaning; 