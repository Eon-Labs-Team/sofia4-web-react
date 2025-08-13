import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import * as z from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Column } from "@/lib/store/gridStore";
import Grid from "@/components/Grid/Grid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import equipmentCalibrationService from "@/_services/equipmentCalibrationService";
import { IEquipmentCalibration } from "@eon-lib/eon-mongoose";
import DynamicForm, { SectionConfig } from "@/components/DynamicForm/DynamicForm";

// Columns configuration for the grid
const columns: Column[] = [
  {
    id: "date",
    header: "Fecha",
    accessor: "date",
    visible: true,
    render: (value) => {
      try {
        return format(new Date(value), 'dd/MM/yyyy', { locale: es });
      } catch (error) {
        return value || "";
      }
    }
  },
  {
    id: "measurementType",
    header: "Tipo de Medición",
    accessor: "measurementType",
    visible: true
  },
  {
    id: "reference",
    header: "Referencia",
    accessor: "reference",
    visible: true
  },
  {
    id: "capacity",
    header: "Capacidad",
    accessor: "capacity",
    visible: true
  },
  {
    id: "standardType",
    header: "Tipo de Patrón",
    accessor: "standardType",
    visible: true
  },
  {
    id: "standardWeight",
    header: "Peso Patrón",
    accessor: "standardWeight",
    visible: true
  },
  {
    id: "obtainedWeight",
    header: "Peso Obtenido",
    accessor: "obtainedWeight",
    visible: true
  },
  {
    id: "result",
    header: "Resultado",
    accessor: "result",
    visible: true
  },
  {
    id: "operator",
    header: "Operador",
    accessor: "operator",
    visible: true
  },
  {
    id: "correctiveAction",
    header: "Acción Correctiva",
    accessor: "correctiveAction",
    visible: true
  },
  {
    id: "timestamp",
    header: "Marca de Tiempo",
    accessor: "timestamp",
    visible: true
  },
  {
    id: "user",
    header: "Usuario",
    accessor: "user",
    visible: true
  },
  {
    id: "state",
    header: "Estado",
    accessor: "state",
    visible: true,
    render: (value) => (value ? "Activo" : "Inactivo")
  }
];

// Form sections configuration
const formSections: SectionConfig[] = [
  {
    id: "calibration-info",
    title: "Información de Calibración",
    description: "Ingrese los datos de la calibración del equipo",
    fields: [
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        placeholder: "Seleccione una fecha",
        required: true,
        helperText: "Fecha de la calibración"
      },
      {
        id: "measurementType",
        type: "text",
        label: "Tipo de Medición",
        name: "measurementType",
        placeholder: "Ej: Peso, Temperatura, Presión",
        required: true,
        helperText: "Tipo de medición realizada"
      },
      {
        id: "reference",
        type: "text",
        label: "Referencia",
        name: "reference",
        placeholder: "Referencia del equipo",
        required: true,
        helperText: "Referencia del equipo calibrado"
      },
      {
        id: "capacity",
        type: "number",
        label: "Capacidad",
        name: "capacity",
        placeholder: "Capacidad del equipo",
        required: true,
        helperText: "Capacidad del equipo de medición"
      },
      {
        id: "standardType",
        type: "text",
        label: "Tipo de Patrón",
        name: "standardType",
        placeholder: "Tipo de patrón utilizado",
        required: true,
        helperText: "Tipo de patrón utilizado para la calibración"
      },
      {
        id: "standardWeight",
        type: "number",
        label: "Peso Patrón",
        name: "standardWeight",
        placeholder: "Peso del patrón",
        required: true,
        helperText: "Peso del patrón utilizado"
      },
      {
        id: "obtainedWeight",
        type: "number",
        label: "Peso Obtenido",
        name: "obtainedWeight",
        placeholder: "Peso obtenido en la medición",
        required: true,
        helperText: "Peso obtenido en la medición"
      },
      {
        id: "result",
        type: "text",
        label: "Resultado",
        name: "result",
        placeholder: "Resultado de la calibración",
        required: true,
        helperText: "Resultado de la calibración"
      },
      {
        id: "operator",
        type: "text",
        label: "Operador",
        name: "operator",
        placeholder: "Nombre del operador",
        required: true,
        helperText: "Persona que realizó la calibración"
      },
      {
        id: "correctiveAction",
        type: "textarea",
        label: "Acción Correctiva",
        name: "correctiveAction",
        placeholder: "Acciones correctivas realizadas",
        required: true,
        helperText: "Acciones correctivas realizadas si fueron necesarias"
      },
      {
        id: "image1",
        type: "text",
        label: "Imagen 1",
        name: "image1",
        placeholder: "URL de la imagen 1",
        required: false,
        helperText: "URL de la primera imagen (opcional)"
      },
      {
        id: "image2",
        type: "text",
        label: "Imagen 2",
        name: "image2",
        placeholder: "URL de la imagen 2",
        required: false,
        helperText: "URL de la segunda imagen (opcional)"
      },
      {
        id: "image3",
        type: "text",
        label: "Imagen 3",
        name: "image3",
        placeholder: "URL de la imagen 3",
        required: false,
        helperText: "URL de la tercera imagen (opcional)"
      },
      {
        id: "timestamp",
        type: "text",
        label: "Marca de Tiempo",
        name: "timestamp",
        placeholder: "Marca de tiempo",
        required: true,
        helperText: "Marca de tiempo de la calibración"
      },
      {
        id: "user",
        type: "text",
        label: "Usuario",
        name: "user",
        placeholder: "Nombre del usuario",
        required: true,
        helperText: "Usuario que registra la calibración"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si la calibración está activa"
      },
    ]
  }
];

// Form validation schema
const formValidationSchema = z.object({
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  measurementType: z.string().min(1, { message: "El tipo de medición es obligatorio" }),
  reference: z.string().min(1, { message: "La referencia es obligatoria" }),
  capacity: z.coerce.number().min(0, { message: "La capacidad debe ser un número positivo" }),
  standardType: z.string().min(1, { message: "El tipo de patrón es obligatorio" }),
  standardWeight: z.coerce.number().min(0, { message: "El peso patrón debe ser un número positivo" }),
  obtainedWeight: z.coerce.number().min(0, { message: "El peso obtenido debe ser un número positivo" }),
  result: z.string().min(1, { message: "El resultado es obligatorio" }),
  operator: z.string().min(1, { message: "El operador es obligatorio" }),
  correctiveAction: z.string().min(1, { message: "La acción correctiva es obligatoria" }),
  image1: z.string().optional(),
  image2: z.string().optional(),
  image3: z.string().optional(),
  timestamp: z.string().min(1, { message: "La marca de tiempo es obligatoria" }),
  user: z.string().min(1, { message: "El usuario es obligatorio" }),
  state: z.boolean().default(true)
});

const EquipmentCalibration = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [equipmentCalibrations, setEquipmentCalibrations] = useState<IEquipmentCalibration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCalibration, setSelectedCalibration] = useState<IEquipmentCalibration | null>(null);
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
  
  // Fetch equipment calibrations on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchEquipmentCalibrations();
    }
  }, [propertyId]);
  
  // Function to fetch equipment calibrations data
  const fetchEquipmentCalibrations = async () => {
    setIsLoading(true);
    try {
      const data = await equipmentCalibrationService.findAll();
      // Check if data is an array directly or has a data property
      setEquipmentCalibrations(Array.isArray(data) ? data : (data as any).data || []);
    } catch (error) {
      console.error("Error loading equipment calibrations:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new equipment calibration
  const handleAddEquipmentCalibration = async (data: Partial<IEquipmentCalibration>) => {
    try {
      const calibrationData: Partial<IEquipmentCalibration> = {
        date: data.date,
        measurementType: data.measurementType,
        reference: data.reference,
        capacity: data.capacity,
        standardType: data.standardType,
        standardWeight: data.standardWeight,
        obtainedWeight: data.obtainedWeight,
        result: data.result,
        operator: data.operator,
        correctiveAction: data.correctiveAction,
        image1: data.image1,
        image2: data.image2,
        image3: data.image3,
        timestamp: data.timestamp,
        user: data.user,
        state: data.state !== undefined ? data.state : true
      };
      
      const newCalibration = await equipmentCalibrationService.createEquipmentCalibration(calibrationData);
      setEquipmentCalibrations((prevCalibrations) => [...prevCalibrations, newCalibration]);
      setIsDialogOpen(false);
      toast({
        title: "Calibración creada",
        description: `La calibración ha sido creada exitosamente.`,
      });
    } catch (error) {
      console.error("Error creating equipment calibration:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la calibración. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating an existing equipment calibration
  const handleUpdateEquipmentCalibration = async (id: string | number, data: Partial<IEquipmentCalibration>) => {
    try {
      const calibrationData: Partial<IEquipmentCalibration> = {
        date: data.date,
        measurementType: data.measurementType,
        reference: data.reference,
        capacity: data.capacity,
        standardType: data.standardType,
        standardWeight: data.standardWeight,
        obtainedWeight: data.obtainedWeight,
        result: data.result,
        operator: data.operator,
        correctiveAction: data.correctiveAction,
        image1: data.image1,
        image2: data.image2,
        image3: data.image3,
        timestamp: data.timestamp,
        user: data.user,
        state: data.state !== undefined ? data.state : true
      };
      
      await equipmentCalibrationService.updateEquipmentCalibration(id, calibrationData);
      await fetchEquipmentCalibrations();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedCalibration(null);
      toast({
        title: "Calibración actualizada",
        description: `La calibración ha sido actualizada exitosamente.`,
      });
    } catch (error) {
      console.error("Error updating equipment calibration:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la calibración. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting an equipment calibration
  const handleDeleteEquipmentCalibration = async (id: string | number) => {
    try {
      await equipmentCalibrationService.softDeleteEquipmentCalibration(id);
      setEquipmentCalibrations((prevCalibrations) => 
        prevCalibrations.filter((calibration) => calibration._id !== id)
      );
      toast({
        title: "Calibración eliminada",
        description: "La calibración ha sido eliminada exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting equipment calibration:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la calibración. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle form submission
  const onSubmit = (formData: z.infer<typeof formValidationSchema>) => {
    if (isEditMode && selectedCalibration?._id) {
      handleUpdateEquipmentCalibration(selectedCalibration._id, formData);
    } else {
      handleAddEquipmentCalibration(formData);
    }
  };

  // Function to handle add button click
  const handleAddClick = () => {
    setSelectedCalibration(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  // Function to handle edit button click
  const handleEditClick = (calibration: IEquipmentCalibration) => {
    setSelectedCalibration(calibration);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Action buttons for each row
  const actionButtons = (row: IEquipmentCalibration) => (
    <div className="flex space-x-2">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => handleEditClick(row)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => {
          if (window.confirm("¿Está seguro de eliminar esta calibración?")) {
            handleDeleteEquipmentCalibration(row._id as string);
          }
        }}
        className="text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Calibración de Equipos</h1>
        <Button onClick={handleAddClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Agregar Calibración
        </Button>
      </div>
      
      {/* Dialog for adding/editing equipment calibration */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Calibración" : "Agregar Calibración"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} la calibración del equipo de medición.
            </DialogDescription>
          </DialogHeader>
          
          <DynamicForm
            sections={formSections}
            onSubmit={onSubmit}
            defaultValues={
              isEditMode && selectedCalibration
                ? {
                    date: selectedCalibration.date || "",
                    measurementType: selectedCalibration.measurementType || "",
                    reference: selectedCalibration.reference || "",
                    capacity: selectedCalibration.capacity || 0,
                    standardType: selectedCalibration.standardType || "",
                    standardWeight: selectedCalibration.standardWeight || 0,
                    obtainedWeight: selectedCalibration.obtainedWeight || 0,
                    result: selectedCalibration.result || "",
                    operator: selectedCalibration.operator || "",
                    correctiveAction: selectedCalibration.correctiveAction || "",
                    image1: selectedCalibration.image1 || "",
                    image2: selectedCalibration.image2 || "",
                    image3: selectedCalibration.image3 || "",
                    timestamp: selectedCalibration.timestamp || new Date().toISOString(),
                    user: selectedCalibration.user || "",
                    state: selectedCalibration.state !== undefined ? selectedCalibration.state : true
                  }
                : {
                    date: "",
                    measurementType: "",
                    reference: "",
                    capacity: 0,
                    standardType: "",
                    standardWeight: 0,
                    obtainedWeight: 0,
                    result: "",
                    operator: "",
                    correctiveAction: "",
                    image1: "",
                    image2: "",
                    image3: "",
                    timestamp: new Date().toISOString(),
                    user: "",
                    state: true
                  }
            }
            validationSchema={formValidationSchema}
          />
        </DialogContent>
      </Dialog>
      
      {/* Data grid */}
      <Grid
        data={equipmentCalibrations}
        columns={columns}
        idField="_id"
        title="Calibraciones de Equipos"
        gridId="equipment-calibration-grid"
        actions={actionButtons}
      />
    </div>
  );
};

export default EquipmentCalibration; 