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
import { IHandWashingRecord } from "@eon-lib/eon-mongoose";
import handWashingService from "@/_services/handWashingService";
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

// Column configuration for the grid - based on HandWashingRecord model
const columns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: true,
    sortable: true,
  },
  {
    id: "dniRut",
    header: "DNI/RUT",
    accessor: "dniRut",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "date",
    header: "Fecha",
    accessor: "date",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "time",
    header: "Hora",
    accessor: "time",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "observation",
    header: "Observación",
    accessor: "observation",
    visible: true,
    sortable: true,
  },
  {
    id: "user",
    header: "Usuario",
    accessor: "user",
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
    <h3 className="text-lg font-semibold mb-2">Registro de Lavado de Manos</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>DNI/RUT:</strong> {row.dniRut}
        </p>
        <p>
          <strong>Fecha:</strong> {row.date}
        </p>
        <p>
          <strong>Hora:</strong> {row.time}
        </p>
      </div>
      <div>
        <p>
          <strong>Observación:</strong> {row.observation}
        </p>
        <p>
          <strong>Usuario:</strong> {row.user}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new hand washing record
const formSections: SectionConfig[] = [
  {
    id: "handwashing-info",
    title: "Información de Lavado de Manos",
    description: "Ingrese los datos del registro de lavado de manos",
    fields: [
      {
        id: "dniRut",
        type: "text",
        label: "DNI/RUT",
        name: "dniRut",
        placeholder: "Ingrese DNI o RUT",
        required: true,
        helperText: "Documento de identidad de la persona"
      },
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        required: true,
        helperText: "Fecha del registro"
      },
      {
        id: "time",
        type: "text",
        label: "Hora",
        name: "time",
        placeholder: "Ej: 14:30",
        required: true,
        helperText: "Hora del registro"
      },
      {
        id: "observation",
        type: "textarea",
        label: "Observación",
        name: "observation",
        placeholder: "Ingrese observaciones",
        required: true,
        helperText: "Detalles adicionales sobre el registro"
      },
      {
        id: "user",
        type: "text",
        label: "Usuario",
        name: "user",
        placeholder: "Nombre del usuario",
        required: true,
        helperText: "Usuario que realiza el registro"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el registro está activo"
      },
    ],
  }
];

// Form validation schema
const formValidationSchema = z.object({
  dniRut: z.string().min(1, { message: "El DNI/RUT es obligatorio" }),
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  time: z.string().min(1, { message: "La hora es obligatoria" }),
  observation: z.string().min(1, { message: "La observación es obligatoria" }),
  user: z.string().min(1, { message: "El usuario es obligatorio" }),
  state: z.boolean().default(true)
});

const LavadoManos = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [handWashingRecords, setHandWashingRecords] = useState<IHandWashingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IHandWashingRecord | null>(null);
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
  
  // Fetch records on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchHandWashingRecords();
    }
  }, [propertyId]);
  
  // Function to fetch records data
  const fetchHandWashingRecords = async () => {
    setIsLoading(true);
    try {
      const response = await handWashingService.findAll();

      const data = response && typeof response === 'object' && 'data' in response 
      ? response.data as IHandWashingRecord[]
      : Array.isArray(response) ? response as IHandWashingRecord[] : [] as IHandWashingRecord[];

      setHandWashingRecords(data);
    } catch (error) {
      console.error("Error loading hand washing records:", error);
      // Use empty array in case of API failure
      setHandWashingRecords([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new record
  const handleAddRecord = async (data: Partial<IHandWashingRecord>) => {
    try {
      const recordData: Partial<IHandWashingRecord> = {
        dniRut: data.dniRut,
        date: data.date,
        time: data.time,
        observation: data.observation,
        user: data.user,
        state: data.state !== undefined ? data.state : true
      };
      
      await handWashingService.createHandWashingRecord(recordData);
      await fetchHandWashingRecords();
      
      toast({
        title: "Éxito",
        description: "Registro de lavado de manos añadido correctamente",
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding hand washing record:", error);
      
      toast({
        title: "Error",
        description: "No se pudo añadir el registro. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a record
  const handleUpdateRecord = async (id: string | number, data: Partial<IHandWashingRecord>) => {
    try {
      await handWashingService.updateHandWashingRecord(id, data);
      await fetchHandWashingRecords();
      
      toast({
        title: "Éxito",
        description: "Registro de lavado de manos actualizado correctamente",
      });
      
      setIsDialogOpen(false);
      setSelectedRecord(null);
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error updating hand washing record ${id}:`, error);
      
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a record
  const handleDeleteRecord = async (id: string | number) => {
    try {
      await handWashingService.softDeleteHandWashingRecord(id);
      await fetchHandWashingRecords();
      
      toast({
        title: "Éxito",
        description: "Registro de lavado de manos eliminado correctamente",
      });
    } catch (error) {
      console.error(`Error deleting hand washing record ${id}:`, error);
      
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      });
    }
  };
  
  // Form submission handler
  const handleFormSubmit = (data: Partial<IHandWashingRecord>) => {
    if (isEditMode && selectedRecord) {
      handleUpdateRecord(selectedRecord._id, data);
    } else {
      handleAddRecord(data);
    }
  };
  
  // Edit button click handler
  const handleEditClick = (record: IHandWashingRecord) => {
    setSelectedRecord(record);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render actions column with edit and delete buttons
  const renderActions = (row: IHandWashingRecord) => {
    return (
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon" onClick={() => handleEditClick(row)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteRecord(row._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Acciones como columna adicional
  const actionsColumn: Column = {
    id: 'actions',
    header: 'Acciones',
    accessor: '',
    visible: true,
    sortable: false,
    render: renderActions
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registros de Lavado de Manos</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedRecord(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Registro
        </Button>
      </div>
      
      <Grid
        data={handWashingRecords}
        columns={[...columns, actionsColumn]}
        expandableContent={expandableContent}
        gridId="handWashing"
        title="Registros de Lavado de Manos"
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Registro de Lavado de Manos" : "Nuevo Registro de Lavado de Manos"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Actualice los detalles del registro existente"
                : "Complete el formulario para añadir un nuevo registro de lavado de manos"}
            </DialogDescription>
          </DialogHeader>
          
          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedRecord ? {
              dniRut: selectedRecord.dniRut,
              date: selectedRecord.date,
              time: selectedRecord.time,
              observation: selectedRecord.observation,
              user: selectedRecord.user,
              state: selectedRecord.state
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

export default LavadoManos; 