import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Plus } from "lucide-react";
import DynamicForm, { SectionConfig } from "@/components/DynamicForm/DynamicForm";
import Grid from "@/components/Grid/Grid";
import { Column } from "@/lib/store/gridStore";
import { IIrrigationRecord } from "@eon-lib/eon-mongoose/types";
import irrigationRecordService from "@/_services/irrigationRecordService";
import { z } from "zod";
import { WorkAssociationWizard } from "@/components/Wizard";
import { WorkAssociationData } from "@/components/Wizard/types";
import workerListService from "@/_services/workerListService";
import listaCuartelesService from "@/_services/listaCuartelesService";
import inventoryProductService from "@/_services/inventoryProductService";
import listaMaquinariasService from "@/_services/machineryListService";
import workService from "@/_services/workService";
import cropTypeService from "@/_services/cropTypeService";
import varietyTypeService from "@/_services/varietyTypeService";
import {
  handleResponseWithFallback,
  handleErrorWithEnhancedFormat,
} from "@/lib/utils/responseHandler";

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
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<IIrrigationRecord> | null>(null);
  const [workWizardData, setWorkWizardData] = useState({
    workerList: [],
    cuarteles: [],
    productOptions: [],
    machineryOptions: []
  });
  const [cropTypes, setCropTypes] = useState([]);
  const [varietyTypes, setVarietyTypes] = useState([]);

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
      loadWorkWizardData();
    }
  }, [propertyId]);

  // Function to load data for WorkAssociationWizard
  const loadWorkWizardData = async () => {
    try {
      const [workerList, cuarteles, productOptions, machineryOptions, cropTypesData, varietyTypesData] = await Promise.all([
        workerListService.findAll(),
        listaCuartelesService.findAll(),
        inventoryProductService.findAll(),
        listaMaquinariasService.findAll(),
        cropTypeService.findAll(),
        varietyTypeService.findAll()
      ]);

      setWorkWizardData({
        workerList: Array.isArray(workerList) ? workerList : [],
        cuarteles: Array.isArray(cuarteles) ? cuarteles : [],
        productOptions: Array.isArray(productOptions) ? productOptions : [],
        machineryOptions: Array.isArray(machineryOptions) ? machineryOptions : []
      });

      setCropTypes(Array.isArray(cropTypesData) ? cropTypesData : []);
      setVarietyTypes(Array.isArray(varietyTypesData) ? varietyTypesData : []);
    } catch (error) {
      console.error("Error loading work wizard data:", error);
    }
  };
  
  // Function to fetch irrigation records data
  const fetchIrrigationRecords = async () => {
    setIsLoading(true);
    try {
      const response = await irrigationRecordService.findAll();
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
    // Store the data and show the work association question
    setPendingData(data);
    setIsDialogOpen(false);
    setShowWorkQuestion(true);
  };

  // Function to handle work association completion
  const handleWorkAssociation = async (workAssociationData: WorkAssociationData) => {
    try {
      if (!pendingData) return;

      if (workAssociationData.associateWork) {
        // Create irrigation record with associated work
        const result = await createEntityWithWork(pendingData, workAssociationData);

        // Handle enhanced response format
        handleResponseWithFallback(
          result,
          'creation',
          'IRRIGATION_RECORD',
          "Registro de riego creado correctamente"
        );
      } else {
        // Create irrigation record without work
        const result = await createEntityWithoutWork(pendingData);

        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'IRRIGATION_RECORD',
          "Registro de riego creado correctamente"
        );
      }

      fetchIrrigationRecords();
      setShowWorkWizard(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating irrigation record with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'IRRIGATION_RECORD',
        "No se pudo crear el registro de riego"
      );
    }
  };

  // Create irrigation record without associated work
  const createEntityWithoutWork = async (data: Partial<IIrrigationRecord>) => {
    await irrigationRecordService.createIrrigationRecord(data);
  };

  // Create irrigation record with associated work
  const createEntityWithWork = async (
    entityData: Partial<IIrrigationRecord>,
    workAssociationData: WorkAssociationData
  ) => {
    // Create work with entity using the new endpoint
    const result = await workService.createWorkWithEntity(
      "IRRIGATION_RECORD",
      entityData,
      workAssociationData.workData
    );

    return result;
  };

  // Function to handle work association question response
  const handleWorkQuestionResponse = (associateWork: boolean) => {
    setShowWorkQuestion(false);

    if (associateWork) {
      // Show the full wizard
      setShowWorkWizard(true);
    } else {
      // Show confirmation dialog for direct insertion
      setShowConfirmation(true);
    }
  };

  // Function to handle confirmation of direct insertion
  const handleConfirmInsertion = async () => {
    try {
      if (!pendingData) return;

      const result = await createEntityWithoutWork(pendingData);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'creation',
        'IRRIGATION_RECORD',
        "Registro de riego creado correctamente"
      );

      fetchIrrigationRecords();
      setShowConfirmation(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating irrigation record:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'IRRIGATION_RECORD',
        "No se pudo crear el registro de riego"
      );
    }
  };

  // Function to handle work wizard cancellation
  const handleWorkWizardCancel = () => {
    setShowWorkWizard(false);
    setPendingData(null);
  };

  // Function to cancel all operations
  const handleCancelAll = () => {
    setShowWorkQuestion(false);
    setShowWorkWizard(false);
    setShowConfirmation(false);
    setPendingData(null);
  };

  // Function to handle updating an existing irrigation record
  const handleUpdateIrrigationRecord = async (id: string | number, data: Partial<IIrrigationRecord>) => {
    try {
      const result = await irrigationRecordService.updateIrrigationRecord(id, data);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'IRRIGATION_RECORD',
        "Registro de riego actualizado correctamente"
      );

      fetchIrrigationRecords();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error(`Error updating irrigation record ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'IRRIGATION_RECORD',
        "No se pudo actualizar el registro de riego"
      );
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

      {/* Work Association Question */}
      <Dialog open={showWorkQuestion} onOpenChange={() => setShowWorkQuestion(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>¿Desear asociar un trabajo?</DialogTitle>
            <DialogDescription>
              Esto permitirá asociar costos de recursos humanos, salidas de productos de bodega y uso de maquinarias.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleWorkQuestionResponse(false)}
              className="flex-1"
            >
              No
            </Button>
            <Button
              onClick={() => handleWorkQuestionResponse(true)}
              className="flex-1"
            >
              Sí
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Direct Insertion */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="w-[95vw] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Confirmar Inserción</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea crear el registro de riego sin asociar un trabajo?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelAll}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmInsertion}
              className="flex-1"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Work Association Wizard */}
      <Dialog open={showWorkWizard} onOpenChange={setShowWorkWizard}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {/* Asociación de Trabajo */}
            </DialogTitle>
            <DialogDescription>
              {/* Configure la información del trabajo a asociar */}
            </DialogDescription>
          </DialogHeader>

          {showWorkWizard && pendingData && (
            <WorkAssociationWizard
              entityType="irrigationRecord"
              entityData={{
                id: "new-irrigation-record"
              }}
              onComplete={handleWorkAssociation}
              onCancel={handleWorkWizardCancel}
              workerList={workWizardData.workerList}
              cuarteles={workWizardData.cuarteles}
              productOptions={workWizardData.productOptions}
              machineryOptions={workWizardData.machineryOptions}
              cropTypes={cropTypes}
              varietyTypes={varietyTypes}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IrrigationRecord; 