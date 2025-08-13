import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ICalibrationMeasuringEquipment } from '@eon-lib/eon-mongoose';
import calibrationMeasuringEquipmentService from '@/_services/calibrationMeasuringEquipmentService';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import DynamicForm, { SectionConfig } from '@/components/DynamicForm/DynamicForm';
import Grid from '@/components/Grid/Grid';
import { Column } from '@/lib/store/gridStore';

// Definimos las columnas de la tabla
const columns: Column[] = [
  { id: 'date', header: 'Fecha', accessor: 'date', visible: true, sortable: true },
  { id: 'measurementType', header: 'Tipo de Medición', accessor: 'measurementType', visible: true, sortable: true, groupable: true },
  { id: 'reference', header: 'Referencia', accessor: 'reference', visible: true, sortable: true },
  { id: 'capacity', header: 'Capacidad', accessor: 'capacity', visible: true, sortable: true },
  { id: 'patternType', header: 'Tipo de Patrón', accessor: 'patternType', visible: true, sortable: true },
  { id: 'weightPattern', header: 'Peso Patrón', accessor: 'weightPattern', visible: true, sortable: true },
  { id: 'weightObtained', header: 'Peso Obtenido', accessor: 'weightObtained', visible: true, sortable: true },
  { id: 'result', header: 'Resultado', accessor: 'result', visible: true, sortable: true, render: (value) => (
    <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {value ? 'Aprobado' : 'Rechazado'}
    </span>
  )},
  { id: 'operator', header: 'Operador', accessor: 'operator', visible: true, sortable: true },
  { id: 'correctiveAction', header: 'Acción Correctiva', accessor: 'correctiveAction', visible: true, sortable: true },
  { id: 'state', header: 'Estado', accessor: 'state', visible: true, sortable: true, render: (value) => (
    <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {value ? 'Activo' : 'Inactivo'}
    </span>
  )}
];

// Definimos el contenido expandible
const getExpandableContent = (row: any) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">Calibración de Equipo - {row.reference}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p><strong>Fecha:</strong> {row.date}</p>
        <p><strong>Tipo de Medición:</strong> {row.measurementType}</p>
        <p><strong>Referencia:</strong> {row.reference}</p>
        <p><strong>Capacidad:</strong> {row.capacity}</p>
        <p><strong>Tipo de Patrón:</strong> {row.patternType}</p>
      </div>
      <div>
        <p><strong>Peso Patrón:</strong> {row.weightPattern}</p>
        <p><strong>Peso Obtenido:</strong> {row.weightObtained}</p>
        <p><strong>Resultado:</strong> {row.result ? 'Aprobado' : 'Rechazado'}</p>
        <p><strong>Operador:</strong> {row.operator}</p>
        <p><strong>Acción Correctiva:</strong> {row.correctiveAction}</p>
      </div>
    </div>
  </div>
);

// Definimos las secciones del formulario
const formSections: SectionConfig[] = [
  {
    id: "calibration-info",
    title: "Información de Calibración",
    description: "Ingrese los datos de la calibración del equipo de medición",
    fields: [
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        required: true,
        helperText: "Fecha de calibración"
      },
      {
        id: "measurementType",
        type: "text",
        label: "Tipo de Medición",
        name: "measurementType",
        required: true,
        helperText: "Tipo de medición"
      },
      {
        id: "reference",
        type: "text",
        label: "Referencia",
        name: "reference",
        required: true,
        helperText: "Referencia del equipo"
      },
      {
        id: "capacity",
        type: "text",
        label: "Capacidad",
        name: "capacity",
        required: true,
        helperText: "Capacidad del equipo"
      },
      {
        id: "patternType",
        type: "text",
        label: "Tipo de Patrón",
        name: "patternType",
        required: true,
        helperText: "Tipo de patrón utilizado"
      },
      {
        id: "weightPattern",
        type: "number",
        label: "Peso Patrón",
        name: "weightPattern",
        required: true,
        helperText: "Peso del patrón"
      },
      {
        id: "weightObtained",
        type: "number",
        label: "Peso Obtenido",
        name: "weightObtained",
        required: true,
        helperText: "Peso obtenido en la medición"
      },
      {
        id: "result",
        type: "checkbox",
        label: "Resultado",
        name: "result",
        required: true,
        helperText: "¿Aprobado o Rechazado?"
      },
      {
        id: "operator",
        type: "text",
        label: "Operador",
        name: "operator",
        required: true,
        helperText: "Operador que realiza la calibración"
      },
      {
        id: "correctiveAction",
        type: "textarea",
        label: "Acción Correctiva",
        name: "correctiveAction",
        helperText: "Acciones correctivas a realizar (si aplica)"
      },
      {
        id: "image1",
        type: "file",
        label: "Imagen 1",
        name: "image1",
        helperText: "Imagen de la calibración (opcional)"
      },
      {
        id: "image2",
        type: "file",
        label: "Imagen 2",
        name: "image2",
        helperText: "Imagen de la calibración (opcional)"
      },
      {
        id: "image3",
        type: "file",
        label: "Imagen 3",
        name: "image3",
        helperText: "Imagen de la calibración (opcional)"
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

const CalibrationMeasuringEquipment = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [calibrations, setCalibrations] = useState<ICalibrationMeasuringEquipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCalibration, setSelectedCalibration] = useState<ICalibrationMeasuringEquipment | null>(null);
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
  
  // Fetch calibrations on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchCalibrations();
    }
  }, [propertyId]);
  
  // Function to fetch calibrations data
  const fetchCalibrations = async () => {
    setIsLoading(true);
    try {
      const data = await calibrationMeasuringEquipmentService.findAll();
      setCalibrations(Array.isArray(data) ? data : (data as any).data || []);
    } catch (error) {
      console.error("Error loading calibrations:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new calibration
  const handleAddCalibration = async (data: Partial<ICalibrationMeasuringEquipment>) => {
    try {
      const calibrationData: Partial<ICalibrationMeasuringEquipment> = {
        date: data.date,
        measurementType: data.measurementType,
        reference: data.reference,
        capacity: data.capacity,
        patternType: data.patternType,
        weightPattern: data.weightPattern,
        weightObtained: data.weightObtained,
        result: data.result,
        operator: data.operator,
        correctiveAction: data.correctiveAction,
        image1: data.image1,
        image2: data.image2,
        image3: data.image3,
        user: "current-user", // En producción, obtener del contexto de autenticación
        state: data.state !== undefined ? data.state : true
      };
      
      const newCalibration = await calibrationMeasuringEquipmentService.createCalibrationMeasuringEquipment(calibrationData);
      setCalibrations((prevCalibrations) => [...prevCalibrations, newCalibration]);
      setIsDialogOpen(false);
      toast({
        title: "Calibración creada",
        description: `La calibración ha sido creada exitosamente.`,
      });
    } catch (error) {
      console.error("Error creating calibration:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la calibración. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating an existing calibration
  const handleUpdateCalibration = async (id: string | number, data: Partial<ICalibrationMeasuringEquipment>) => {
    try {
      const calibrationData: Partial<ICalibrationMeasuringEquipment> = {
        date: data.date,
        measurementType: data.measurementType,
        reference: data.reference,
        capacity: data.capacity,
        patternType: data.patternType,
        weightPattern: data.weightPattern,
        weightObtained: data.weightObtained,
        result: data.result,
        operator: data.operator,
        correctiveAction: data.correctiveAction,
        image1: data.image1,
        image2: data.image2,
        image3: data.image3,
        user: data.user,
        state: data.state !== undefined ? data.state : true
      };
      
      await calibrationMeasuringEquipmentService.updateCalibrationMeasuringEquipment(id, calibrationData);
      await fetchCalibrations();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedCalibration(null);
      toast({
        title: "Calibración actualizada",
        description: `La calibración ha sido actualizada exitosamente.`,
      });
    } catch (error) {
      console.error("Error updating calibration:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la calibración. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a calibration
  const handleDeleteCalibration = async (id: string | number) => {
    try {
      await calibrationMeasuringEquipmentService.softDeleteCalibrationMeasuringEquipment(id);
      setCalibrations((prevCalibrations) => prevCalibrations.filter((calibration) => calibration._id !== id));
      toast({
        title: "Calibración eliminada",
        description: "La calibración ha sido eliminada exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting calibration:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la calibración. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle form submission
  const onSubmit = (data: any) => {
    if (isEditMode && selectedCalibration?._id) {
      handleUpdateCalibration(selectedCalibration._id, data);
    } else {
      handleAddCalibration(data);
    }
  };

  // Function to handle edit button click
  const handleEdit = (calibration: ICalibrationMeasuringEquipment) => {
    setSelectedCalibration(calibration);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Function to handle delete button click
  const handleDelete = (id: string | number) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta calibración?")) {
      handleDeleteCalibration(id);
    }
  };

  // Actions para la tabla
  const renderActions = (row: ICalibrationMeasuringEquipment) => (
    <div className="flex gap-2">
      <Button variant="ghost" size="icon" onClick={() => handleEdit(row)}>
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => handleDelete(row._id || '')}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calibración de Equipos de Medición</h1>
        <Button onClick={() => { setIsEditMode(false); setSelectedCalibration(null); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Calibración
        </Button>
      </div>

      <Grid
        columns={columns}
        data={calibrations}
        title="Calibraciones"
        expandableContent={getExpandableContent}
        gridId="calibration-measuring-equipment"
        actions={renderActions}
        idField="_id"
      />

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
                    capacity: selectedCalibration.capacity || "",
                    patternType: selectedCalibration.patternType || "",
                    weightPattern: selectedCalibration.weightPattern || 0,
                    weightObtained: selectedCalibration.weightObtained || 0,
                    result: selectedCalibration.result || false,
                    operator: selectedCalibration.operator || "",
                    correctiveAction: selectedCalibration.correctiveAction || "",
                    image1: selectedCalibration.image1 || "",
                    image2: selectedCalibration.image2 || "",
                    image3: selectedCalibration.image3 || "",
                    user: selectedCalibration.user || "",
                    state: selectedCalibration.state !== undefined ? selectedCalibration.state : true
                  }
                : {
                    state: true
                  }
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalibrationMeasuringEquipment; 