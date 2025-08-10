import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Droplets
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
import { ICalibrateSprinkler } from "@eon-lib/eon-mongoose";
import calibrateSprinklerService from "@/_services/calibrateSprinklerService";
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
    header: "Cuartel",
    accessor: "barracks",
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
    id: "equipment",
    header: "Equipo",
    accessor: "equipment",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "dischargeShot1",
    header: "Disparo 1",
    accessor: "dischargeShot1",
    visible: true,
    sortable: true,
  },
  {
    id: "dischargeShot2",
    header: "Disparo 2",
    accessor: "dischargeShot2",
    visible: true,
    sortable: true,
  },
  {
    id: "dischargeShot3",
    header: "Disparo 3",
    accessor: "dischargeShot3",
    visible: true,
    sortable: true,
  },
  {
    id: "averageDischarge",
    header: "Descarga Promedio",
    accessor: "averageDischarge",
    visible: true,
    sortable: true,
  },
  {
    id: "nozzleReference",
    header: "Referencia Boquilla",
    accessor: "nozzleReference",
    visible: true,
    sortable: true,
  },
  {
    id: "dischargeData",
    header: "Datos de Descarga",
    accessor: "dischargeData",
    visible: true,
    sortable: true,
  },
  {
    id: "dischargeRange",
    header: "Rango de Descarga",
    accessor: "dischargeRange",
    visible: true,
    sortable: true,
  },
  {
    id: "nozzleState",
    header: "Estado de Boquilla",
    accessor: "nozzleState",
    visible: true,
    sortable: true,
  },
  {
    id: "operator",
    header: "Operador",
    accessor: "operator",
    visible: true,
    sortable: true,
  },
  {
    id: "observation",
    header: "Observación",
    accessor: "observation",
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
    <h3 className="text-lg font-semibold mb-2">Calibración de Aspersión - {row.barracks}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Cuartel:</strong> {row.barracks}
        </p>
        <p>
          <strong>Fecha:</strong> {row.date}
        </p>
        <p>
          <strong>Equipo:</strong> {row.equipment}
        </p>
        <p>
          <strong>Disparo 1:</strong> {row.dischargeShot1}
        </p>
        <p>
          <strong>Disparo 2:</strong> {row.dischargeShot2}
        </p>
        <p>
          <strong>Disparo 3:</strong> {row.dischargeShot3}
        </p>
        <p>
          <strong>Descarga Promedio:</strong> {row.averageDischarge}
        </p>
      </div>
      <div>
        <p>
          <strong>Referencia Boquilla:</strong> {row.nozzleReference}
        </p>
        <p>
          <strong>Datos de Descarga:</strong> {row.dischargeData}
        </p>
        <p>
          <strong>Rango de Descarga:</strong> {row.dischargeRange}
        </p>
        <p>
          <strong>Estado de Boquilla:</strong> {row.nozzleState}
        </p>
        <p>
          <strong>Operador:</strong> {row.operator}
        </p>
        <p>
          <strong>Observación:</strong> {row.observation}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new calibrate sprinkler
const formSections: SectionConfig[] = [
  {
    id: "calibrateSprinkler-info",
    title: "Información de Calibración de Aspersión",
    description: "Ingrese los datos de la nueva calibración",
    fields: [
      {
        id: "barracks",
        type: "text",
        label: "Cuartel",
        name: "barracks",
        placeholder: "Nombre del cuartel",
        required: true,
        helperText: "Ingrese el cuartel donde se realizó la calibración"
      },
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        placeholder: "Fecha de calibración",
        required: true,
        helperText: "Fecha en que se realizó la calibración"
      },
      {
        id: "equipment",
        type: "text",
        label: "Equipo",
        name: "equipment",
        placeholder: "Equipo utilizado",
        required: true,
        helperText: "Equipo utilizado para la calibración"
      },
      {
        id: "dischargeShot1",
        type: "number",
        label: "Disparo 1",
        name: "dischargeShot1",
        placeholder: "Valor del primer disparo",
        required: true,
        helperText: "Valor del primer disparo en la calibración"
      },
      {
        id: "dischargeShot2",
        type: "number",
        label: "Disparo 2",
        name: "dischargeShot2",
        placeholder: "Valor del segundo disparo",
        required: true,
        helperText: "Valor del segundo disparo en la calibración"
      },
      {
        id: "dischargeShot3",
        type: "number",
        label: "Disparo 3",
        name: "dischargeShot3",
        placeholder: "Valor del tercer disparo",
        required: true,
        helperText: "Valor del tercer disparo en la calibración"
      },
      {
        id: "averageDischarge",
        type: "number",
        label: "Descarga Promedio",
        name: "averageDischarge",
        placeholder: "Promedio de descarga",
        required: true,
        helperText: "Promedio de los tres disparos"
      },
      {
        id: "nozzleReference",
        type: "text",
        label: "Referencia Boquilla",
        name: "nozzleReference",
        placeholder: "Referencia de la boquilla",
        required: true,
        helperText: "Referencia de la boquilla utilizada"
      },
      {
        id: "dischargeData",
        type: "text",
        label: "Datos de Descarga",
        name: "dischargeData",
        placeholder: "Datos de la descarga",
        required: true,
        helperText: "Datos adicionales sobre la descarga"
      },
      {
        id: "dischargeRange",
        type: "text",
        label: "Rango de Descarga",
        name: "dischargeRange",
        placeholder: "Rango de descarga",
        required: true,
        helperText: "Rango de descarga obtenido"
      },
      {
        id: "nozzleState",
        type: "text",
        label: "Estado de Boquilla",
        name: "nozzleState",
        placeholder: "Estado de la boquilla",
        required: true,
        helperText: "Estado actual de la boquilla"
      },
      {
        id: "operator",
        type: "text",
        label: "Operador",
        name: "operator",
        placeholder: "Nombre del operador",
        required: true,
        helperText: "Nombre del operador que realizó la calibración"
      },
      {
        id: "observation",
        type: "textarea",
        label: "Observación",
        name: "observation",
        placeholder: "Observaciones adicionales",
        required: false,
        helperText: "Observaciones adicionales sobre la calibración"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si la calibración está activa"
      },
    ],
  }
];

// Form validation schema
const formValidationSchema = z.object({
  barracks: z.string().min(1, { message: "El cuartel es obligatorio" }),
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  equipment: z.string().min(1, { message: "El equipo es obligatorio" }),
  dischargeShot1: z.coerce.number().min(0, { message: "El disparo 1 debe ser un número positivo" }),
  dischargeShot2: z.coerce.number().min(0, { message: "El disparo 2 debe ser un número positivo" }),
  dischargeShot3: z.coerce.number().min(0, { message: "El disparo 3 debe ser un número positivo" }),
  averageDischarge: z.coerce.number().min(0, { message: "La descarga promedio debe ser un número positivo" }),
  nozzleReference: z.string().min(1, { message: "La referencia de boquilla es obligatoria" }),
  dischargeData: z.string().min(1, { message: "Los datos de descarga son obligatorios" }),
  dischargeRange: z.string().min(1, { message: "El rango de descarga es obligatorio" }),
  nozzleState: z.string().min(1, { message: "El estado de boquilla es obligatorio" }),
  operator: z.string().min(1, { message: "El operador es obligatorio" }),
  observation: z.string().optional(),
  state: z.boolean().default(true)
});

const CalibrarAspersion = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [calibracionesAspersion, setCalibracionesAspersion] = useState<ICalibrateSprinkler[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCalibracion, setSelectedCalibracion] = useState<ICalibrateSprinkler | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch calibraciones on component mount
  useEffect(() => {
    fetchCalibraciones();
  }, []);
  
  // Function to fetch calibraciones data
  const fetchCalibraciones = async () => {
    setIsLoading(true);
    try {
      const response = await calibrateSprinklerService.findAll();
      
      // Since we're not sure of the exact API response format, handle different possibilities
      let calibraciones: ICalibrateSprinkler[] = [];
      
      if (Array.isArray(response)) {
        calibraciones = response;
      } else if (response && typeof response === 'object') {
        if (Array.isArray(response.data)) {
          calibraciones = response.data;
        } else {
          // If we can't determine the format, log and use empty array
          console.warn('Unexpected API response format', response);
        }
      }
      
      setCalibracionesAspersion(calibraciones);
    } catch (error) {
      console.error("Error loading calibraciones:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las calibraciones de aspersión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new calibration
  const handleAddCalibracion = async (data: Partial<ICalibrateSprinkler>) => {
    try {
      await calibrateSprinklerService.createCalibrateSprinkler(data);
      await fetchCalibraciones();
      setIsDialogOpen(false);
      toast({
        title: "Éxito",
        description: "Calibración de aspersión agregada correctamente",
      });
    } catch (error) {
      console.error("Error adding calibración:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la calibración de aspersión",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a calibration
  const handleUpdateCalibracion = async (id: string | number, data: Partial<ICalibrateSprinkler>) => {
    try {
      await calibrateSprinklerService.updateCalibrateSprinkler(id, data);
      await fetchCalibraciones();
      setIsDialogOpen(false);
      setSelectedCalibracion(null);
      setIsEditMode(false);
      toast({
        title: "Éxito",
        description: "Calibración de aspersión actualizada correctamente",
      });
    } catch (error) {
      console.error(`Error updating calibración ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la calibración de aspersión",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a calibration
  const handleDeleteCalibracion = async (id: string | number) => {
    try {
      await calibrateSprinklerService.softDeleteCalibrateSprinkler(id);
      await fetchCalibraciones();
      toast({
        title: "Éxito",
        description: "Calibración de aspersión eliminada correctamente",
      });
    } catch (error) {
      console.error(`Error deleting calibración ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la calibración de aspersión",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<ICalibrateSprinkler>) => {
    if (isEditMode && selectedCalibracion) {
      handleUpdateCalibracion(selectedCalibracion._id, data);
    } else {
      handleAddCalibracion(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (calibracion: ICalibrateSprinkler) => {
    setSelectedCalibracion(calibracion);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render actions for grid
  const renderActions = (row: ICalibrateSprinkler) => {
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
          onClick={() => handleDeleteCalibracion(row._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Additional column for actions
  const actionsColumn: Column = {
    id: "actions",
    header: "Acciones",
    accessor: "",
    visible: true,
    sortable: false,
    render: renderActions,
  };

  // All columns including actions
  const allColumns = [...columns, actionsColumn];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Calibrar Aspersión</h1>
          <p className="text-muted-foreground">
            Gestión de calibraciones de aspersión
          </p>
        </div>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedCalibracion(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Calibración
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Cargando calibraciones...</div>
      ) : (
        <Grid 
          data={calibracionesAspersion}
          columns={allColumns}
          gridId="calibrar-aspersion"
          expandableContent={expandableContent}
        />
      )}

      {/* Dialog for adding/editing calibrations */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar" : "Agregar"} Calibración de Aspersión
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar la" : "agregar una nueva"} calibración de aspersión.
            </DialogDescription>
          </DialogHeader>
          
          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedCalibracion ? selectedCalibracion : undefined}
          />
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedCalibracion(null);
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

export default CalibrarAspersion; 