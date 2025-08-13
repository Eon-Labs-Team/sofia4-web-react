import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  UserCheck,
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
import { IVisitorLog } from "@eon-lib/eon-mongoose";
import { z } from "zod";
import visitorLogService from "@/_services/visitorLogService";
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
    id: "entryDate",
    header: "Fecha de Entrada",
    accessor: "entryDate",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "entryTime",
    header: "Hora de Entrada",
    accessor: "entryTime",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "visitorName",
    header: "Nombre del Visitante",
    accessor: "visitorName",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "temperature",
    header: "Temperatura",
    accessor: "temperature",
    visible: true,
    sortable: true,
  },
  {
    id: "origin",
    header: "Origen",
    accessor: "origin",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "purpose",
    header: "Propósito",
    accessor: "purpose",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "vehiclePlate",
    header: "Placa del Vehículo",
    accessor: "vehiclePlate",
    visible: true,
    sortable: true,
  },
  {
    id: "exitDate",
    header: "Fecha de Salida",
    accessor: "exitDate",
    visible: true,
    sortable: true,
  },
  {
    id: "exitTime",
    header: "Hora de Salida",
    accessor: "exitTime",
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
    <h3 className="text-lg font-semibold mb-2">{row.visitorName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Fecha de Entrada:</strong> {row.entryDate}
        </p>
        <p>
          <strong>Hora de Entrada:</strong> {row.entryTime}
        </p>
        <p>
          <strong>Temperatura:</strong> {row.temperature}
        </p>
        <p>
          <strong>Origen:</strong> {row.origin}
        </p>
        <p>
          <strong>Propósito:</strong> {row.purpose}
        </p>
      </div>
      <div>
        <p>
          <strong>Comentarios:</strong> {row.comments}
        </p>
        <p>
          <strong>Placa del Vehículo:</strong> {row.vehiclePlate}
        </p>
        <p>
          <strong>Fecha de Salida:</strong> {row.exitDate}
        </p>
        <p>
          <strong>Hora de Salida:</strong> {row.exitTime}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new visitor log - matches exactly the model structure
const formSections: SectionConfig[] = [
  {
    id: "visitor-log-info",
    title: "Información del Registro de Visita",
    description: "Ingrese los datos del nuevo registro de visita",
    fields: [
      {
        id: "entryDate",
        type: "date",
        label: "Fecha de Entrada",
        name: "entryDate",
        required: true,
        helperText: "Fecha en que ingresó el visitante"
      },
      {
        id: "entryTime",
        type: "text",
        label: "Hora de Entrada",
        name: "entryTime",
        required: true,
        helperText: "Hora en que ingresó el visitante"
      },
      {
        id: "visitorName",
        type: "text",
        label: "Nombre del Visitante",
        name: "visitorName",
        placeholder: "Nombre completo",
        required: true,
        helperText: "Nombre completo del visitante"
      },
      {
        id: "temperature",
        type: "number",
        label: "Temperatura",
        name: "temperature",
        placeholder: "36.5",
        required: true,
        helperText: "Temperatura corporal del visitante"
      },
      {
        id: "origin",
        type: "text",
        label: "Origen",
        name: "origin",
        placeholder: "Lugar de procedencia",
        required: true,
        helperText: "Lugar de donde proviene el visitante"
      },
      {
        id: "purpose",
        type: "text",
        label: "Propósito",
        name: "purpose",
        placeholder: "Motivo de la visita",
        required: true,
        helperText: "Motivo o propósito de la visita"
      },
      {
        id: "comments",
        type: "textarea",
        label: "Comentarios",
        name: "comments",
        placeholder: "Observaciones adicionales",
        required: false,
        helperText: "Comentarios adicionales sobre la visita"
      },
      {
        id: "vehiclePlate",
        type: "text",
        label: "Placa del Vehículo",
        name: "vehiclePlate",
        placeholder: "ABC-123",
        required: false,
        helperText: "Placa del vehículo del visitante"
      },
      {
        id: "exitDate",
        type: "date",
        label: "Fecha de Salida",
        name: "exitDate",
        required: false,
        helperText: "Fecha en que salió el visitante"
      },
      {
        id: "exitTime",
        type: "text",
        label: "Hora de Salida",
        name: "exitTime",
        required: false,
        helperText: "Hora en que salió el visitante"
      },
      {
        id: "visitorSignature",
        type: "text",
        label: "Firma del Visitante",
        name: "visitorSignature",
        required: false,
        helperText: "Firma o identificación del visitante"
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

// Form validation schema - matches exactly the model requirements
const formValidationSchema = z.object({
  entryDate: z.string().min(1, { message: "La fecha de entrada es obligatoria" }),
  entryTime: z.string().min(1, { message: "La hora de entrada es obligatoria" }),
  visitorName: z.string().min(1, { message: "El nombre del visitante es obligatorio" }),
  temperature: z.coerce.number().min(30, { message: "La temperatura debe ser mayor a 30°C" }).max(45, { message: "La temperatura debe ser menor a 45°C" }),
  origin: z.string().min(1, { message: "El origen es obligatorio" }),
  purpose: z.string().min(1, { message: "El propósito es obligatorio" }),
  comments: z.string().optional(),
  vehiclePlate: z.string().optional(),
  exitDate: z.string().optional(),
  exitTime: z.string().optional(),
  visitorSignature: z.string().optional(),
  state: z.boolean().default(true)
});

const VisitorLog = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visitorLogs, setVisitorLogs] = useState<IVisitorLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVisitorLog, setSelectedVisitorLog] = useState<IVisitorLog | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Get propertyId from AuthStore
  const { propertyId } = useAuthStore();
  
  // Redirect to homepage if no propertyId is available
  useEffect(() => {
    if (!propertyId) {
      // You could add a navigation here to redirect to home page if needed
      toast({
        title: "Error",
        description: "No hay un predio seleccionada. Por favor, seleccione un predio desde la página principal.",
        variant: "destructive",
      });
    }
  }, [propertyId]);
  
  // Fetch visitor logs on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchVisitorLogs();
    }
  }, [propertyId]);
  
  // Function to fetch visitor logs data
  const fetchVisitorLogs = async () => {
    setIsLoading(true);
    try {
      const data = await visitorLogService.findAll();
      setVisitorLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading visitor logs:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros de visitas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new visitor log
  const handleAddVisitorLog = async (data: Partial<IVisitorLog>) => {
    try {
      await visitorLogService.createVisitorLog(data);
      
      toast({
        title: "Éxito",
        description: "Registro de visita creado con éxito",
      });
      
      // Refresh the list
      fetchVisitorLogs();
      
      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating visitor log:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el registro de visita",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a visitor log
  const handleUpdateVisitorLog = async (id: string | number, data: Partial<IVisitorLog>) => {
    try {
      await visitorLogService.updateVisitorLog(id, data);
      
      toast({
        title: "Éxito",
        description: "Registro de visita actualizado con éxito",
      });
      
      // Refresh the list
      fetchVisitorLogs();
      
      // Close the dialog and reset selection
      setIsDialogOpen(false);
      setSelectedVisitorLog(null);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating visitor log:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro de visita",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a visitor log
  const handleDeleteVisitorLog = async (id: string | number) => {
    try {
      await visitorLogService.softDeleteVisitorLog(id);
      
      toast({
        title: "Éxito",
        description: "Registro de visita eliminado con éxito",
      });
      
      // Refresh the list
      fetchVisitorLogs();
    } catch (error) {
      console.error("Error deleting visitor log:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro de visita",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IVisitorLog>) => {
    if (isEditMode && selectedVisitorLog) {
      handleUpdateVisitorLog(selectedVisitorLog._id, data);
    } else {
      handleAddVisitorLog(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (visitorLog: IVisitorLog) => {
    setSelectedVisitorLog(visitorLog);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render function for action buttons
  const renderActions = (row: IVisitorLog) => {
    return (
      <div className="flex items-center space-x-2">
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
          onClick={() => handleDeleteVisitorLog(row._id)}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Registro de Visitas</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedVisitorLog(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Registro
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Cargando registros de visitas...</p>
        </div>
      ) : (
        <Grid
          data={visitorLogs}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          title="Registro de Visitas"
          gridId="visitorLogs"
        />
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Registro de Visita" : "Agregar Nuevo Registro de Visita"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique los campos necesarios para actualizar este registro de visita."
                : "Complete el formulario para agregar un nuevo registro de visita."}
            </DialogDescription>
          </DialogHeader>
          
          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={
              isEditMode && selectedVisitorLog 
                ? selectedVisitorLog
                : { state: true }
            }
          />
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedVisitorLog(null);
                setIsEditMode(false);
              }}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitorLog; 