import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import DynamicForm, { SectionConfig } from "@/components/DynamicForm/DynamicForm";
import Grid from "@/components/Grid/Grid";
import { Column } from "@/lib/store/gridStore";
import { IIrrigationRecord } from "@eon-lib/eon-mongoose";
import irrigationRecordService from "@/_services/irrigationRecordService";
import { z } from "zod";

// Grid column configuration - maps directly to the model fields
const columns: Column[] = [
  {
    id: "classification",
    header: "Clasificación",
    accessor: "classification",
    sortable: true,
    visible: true,
    groupable: true,

  },
  {
    id: "barracks",
    header: "Cuartel",
    accessor: "barracks",
    sortable: true,
    visible: true,
    groupable: true,
  },
  {
    id: "dateStart",
    header: "Fecha Inicio",
    accessor: "dateStart",
    sortable: true,
    visible: true,
  },
  {
    id: "dateEnd",
    header: "Fecha Fin",
    accessor: "dateEnd",
    sortable: true,
    visible: true,
  },
  {
    id: "millimeters",
    header: "Milímetros",
    accessor: "millimeters",
    sortable: true,
    visible: true,
  },
  {
    id: "litersForHour",
    header: "Litros/Hora",
    accessor: "litersForHour",
    sortable: true,
    visible: true,
  },
  {
    id: "hours",
    header: "Horas",
    accessor: "hours",
    sortable: true,
    visible: true,
  },
  {
    id: "caudal",
    header: "Caudal",
    accessor: "caudal",
    sortable: true,
    visible: true,
  },
  {
    id: "inletPressure",
    header: "Presión Entrada",
    accessor: "inletPressure",
    sortable: true,
    visible: true,
  },
  {
    id: "outletPressure",
    header: "Presión Salida",
    accessor: "outletPressure",
    sortable: true,
    visible: true,
  },
  {
    id: "voltageMachinery",
    header: "Voltaje Maquinaria",
    accessor: "voltageMachinery",
    sortable: true,
    visible: true,
  },
  {
    id: "kilowattsForHour",
    header: "Kilowatts/Hora",
    accessor: "kilowattsForHour",
    sortable: true,
    visible: true,
  },
  {
    id: "amperes",
    header: "Amperios",
    accessor: "amperes",
    sortable: true,
    visible: true,
  },
  {
    id: "state",
    header: "Estado",
    accessor: "state",
    sortable: true,
    visible: true,
    render: (value: boolean) => (value ? "Activo" : "Inactivo"),
  },
];

// Form configuration for adding new irrigation record - matches exactly the model structure
const formSections: SectionConfig[] = [
  {
    id: "irrigation-info",
    title: "Información del Registro de Riego",
    description: "Ingrese los datos del nuevo registro de riego",
    fields: [
      {
        id: "classification",
        type: "text",
        label: "Clasificación",
        name: "classification",
        placeholder: "Clasificación del riego",
        required: true,
        helperText: "Ingrese la clasificación del riego"
      },
      {
        id: "barracks",
        type: "text",
        label: "Cuartel",
        name: "barracks",
        placeholder: "Nombre del cuartel",
        required: true,
        helperText: "Seleccione el cuartel donde se realizó el riego"
      },
      {
        id: "dateStart",
        type: "text",
        label: "Fecha Inicio",
        name: "dateStart",
        placeholder: "YYYY-MM-DD",
        required: true,
        helperText: "Fecha de inicio del riego"
      },
      {
        id: "dateEnd",
        type: "text",
        label: "Fecha Fin",
        name: "dateEnd",
        placeholder: "YYYY-MM-DD",
        required: true,
        helperText: "Fecha de finalización del riego"
      },
      {
        id: "millimeters",
        type: "number",
        label: "Milímetros",
        name: "millimeters",
        placeholder: "0",
        required: true,
        helperText: "Cantidad de agua en milímetros"
      },
      {
        id: "litersForHour",
        type: "number",
        label: "Litros/Hora",
        name: "litersForHour",
        placeholder: "0",
        required: true,
        helperText: "Cantidad de litros por hora"
      },
      {
        id: "hours",
        type: "text",
        label: "Horas",
        name: "hours",
        placeholder: "Duración del riego",
        required: true,
        helperText: "Duración del riego en horas"
      },
      {
        id: "caudal",
        type: "number",
        label: "Caudal",
        name: "caudal",
        placeholder: "0",
        required: true,
        helperText: "Caudal del riego"
      },
      {
        id: "inletPressure",
        type: "number",
        label: "Presión Entrada",
        name: "inletPressure",
        placeholder: "0",
        required: true,
        helperText: "Presión de entrada"
      },
      {
        id: "outletPressure",
        type: "number",
        label: "Presión Salida",
        name: "outletPressure",
        placeholder: "0",
        required: true,
        helperText: "Presión de salida"
      },
      {
        id: "voltageMachinery",
        type: "number",
        label: "Voltaje Maquinaria",
        name: "voltageMachinery",
        placeholder: "0",
        required: true,
        helperText: "Voltaje de la maquinaria"
      },
      {
        id: "kilowattsForHour",
        type: "number",
        label: "Kilowatts/Hora",
        name: "kilowattsForHour",
        placeholder: "0",
        required: true,
        helperText: "Consumo de kilowatts por hora"
      },
      {
        id: "amperes",
        type: "number",
        label: "Amperios",
        name: "amperes",
        placeholder: "0",
        required: true,
        helperText: "Consumo en amperios"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Estado Activo",
        name: "state",
        required: true,
        helperText: "Indica si está en estado activo"
      }
    ]
  }
];

// Form validation schema - matches exactly the model requirements
const formValidationSchema = z.object({
  classification: z.string().min(1, { message: "La clasificación es obligatoria" }),
  barracks: z.string().min(1, { message: "El cuartel es obligatorio" }),
  dateStart: z.string().min(1, { message: "La fecha de inicio es obligatoria" }),
  dateEnd: z.string().min(1, { message: "La fecha de fin es obligatoria" }),
  millimeters: z.number().min(0, { message: "Los milímetros deben ser positivos" }),
  litersForHour: z.number().min(0, { message: "Los litros por hora deben ser positivos" }),
  hours: z.string().min(1, { message: "Las horas son obligatorias" }),
  caudal: z.number().min(0, { message: "El caudal debe ser positivo" }),
  inletPressure: z.number().min(0, { message: "La presión de entrada debe ser positiva" }),
  outletPressure: z.number().min(0, { message: "La presión de salida debe ser positiva" }),
  voltageMachinery: z.number().min(0, { message: "El voltaje debe ser positivo" }),
  kilowattsForHour: z.number().min(0, { message: "Los kilowatts por hora deben ser positivos" }),
  amperes: z.number().min(0, { message: "Los amperios deben ser positivos" }),
  state: z.boolean().default(true)
});

const IrrigationRecord = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [irrigationRecords, setIrrigationRecords] = useState<IIrrigationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IIrrigationRecord | null>(null);
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
  
  // Fetch irrigation records on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchIrrigationRecords();
    }
  }, [propertyId]);
  
  // Function to fetch irrigation records data
  const fetchIrrigationRecords = async () => {
    setIsLoading(true);
    try {
      const response = await irrigationRecordService.findAll(propertyId);
      // Handle different response formats
      const data = response && typeof response === 'object' && 'data' in response 
      ? response.data as IIrrigationRecord[]
      : Array.isArray(response) ? response as IIrrigationRecord[] : [] as IIrrigationRecord[];
    setIrrigationRecords(data);
    } catch (error) {
      console.error("Error loading irrigation records:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new irrigation record
  const handleAddIrrigationRecord = async (data: Partial<IIrrigationRecord>) => {
    try {
      const newIrrigationRecord = await irrigationRecordService.createIrrigationRecord(data, propertyId);
      await fetchIrrigationRecords();
      setIsDialogOpen(false);
      toast({
        title: "Registro creado",
        description: `El registro de riego para el cuartel ${data.barracks} ha sido creado exitosamente.`,
      });
    } catch (error) {
      console.error("Error creating irrigation record:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el registro de riego. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating an existing irrigation record
  const handleUpdateIrrigationRecord = async (id: string | number, data: Partial<IIrrigationRecord>) => {
    try {
      await irrigationRecordService.updateIrrigationRecord(id, data);
      await fetchIrrigationRecords();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedRecord(null);
      toast({
        title: "Registro actualizado",
        description: `El registro de riego para el cuartel ${data.barracks} ha sido actualizado exitosamente.`,
      });
    } catch (error) {
      console.error("Error updating irrigation record:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro de riego. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting an irrigation record
  const handleDeleteIrrigationRecord = async (id: string | number) => {
    try {
      await irrigationRecordService.softDeleteIrrigationRecord(id);
      setIrrigationRecords((prevRecords) => prevRecords.filter((record) => record._id !== id));
      toast({
        title: "Registro eliminado",
        description: "El registro de riego ha sido eliminado exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting irrigation record:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro de riego. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IIrrigationRecord>) => {
    if (isEditMode && selectedRecord?._id) {
      handleUpdateIrrigationRecord(selectedRecord._id, data);
    } else {
      handleAddIrrigationRecord(data);
    }
  };

  // Render action buttons for each row
  const renderActions = (row: IIrrigationRecord) => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          setSelectedRecord(row);
          setIsEditMode(true);
          setIsDialogOpen(true);
        }}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => handleDeleteIrrigationRecord(row._id as string)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Registro de Riego</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedRecord(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Riego
        </Button>
      </div>

      <Grid
        data={irrigationRecords}
        columns={columns}
        idField="_id"
        title="Registros de Riego"
        gridId="irrigation-records-grid"
        actions={renderActions}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Registro de Riego" : "Añadir Nuevo Registro de Riego"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Modifique el formulario para actualizar el registro de riego." 
                : "Complete el formulario para añadir un nuevo registro de riego al sistema."
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
                    classification: selectedRecord.classification,
                    barracks: selectedRecord.barracks,
                    dateStart: selectedRecord.dateStart,
                    dateEnd: selectedRecord.dateEnd,
                    millimeters: selectedRecord.millimeters,
                    litersForHour: selectedRecord.litersForHour,
                    hours: selectedRecord.hours,
                    caudal: selectedRecord.caudal,
                    inletPressure: selectedRecord.inletPressure,
                    outletPressure: selectedRecord.outletPressure,
                    voltageMachinery: selectedRecord.voltageMachinery,
                    kilowattsForHour: selectedRecord.kilowattsForHour,
                    amperes: selectedRecord.amperes,
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

export default IrrigationRecord; 