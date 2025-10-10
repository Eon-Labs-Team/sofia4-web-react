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
import { IVisitorLog } from "@eon-lib/eon-mongoose/types";
import { z } from "zod";
import visitorLogService from "@/_services/visitorLogService";
import { toast } from "@/components/ui/use-toast";
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
  handleEnhancedResponse,
  handleResponseWithFallback,
  handleErrorWithEnhancedFormat,
  isEnhancedResponse,
  StandardResponse
} from "@/lib/utils/responseHandler";

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
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingVisitorLogData, setPendingVisitorLogData] = useState<Partial<IVisitorLog> | null>(null);
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
    // Store the data and show the work association question
    setPendingVisitorLogData(data);
    setIsDialogOpen(false);
    setShowWorkQuestion(true);
  };

  // Function to handle work association completion
  const handleWorkAssociation = async (workAssociationData: WorkAssociationData) => {
    try {
      if (!pendingVisitorLogData) return;

      if (workAssociationData.associateWork) {
        // Create visitor log with associated work
        const result = await createVisitorLogWithWork(pendingVisitorLogData, workAssociationData);

        // Handle enhanced response format
        handleResponseWithFallback(
          result,
          'creation',
          'VISITOR_LOG',
          "Registro de visita creado correctamente"
        );
      } else {
        // Create visitor log without work
        const result = await createVisitorLogWithoutWork(pendingVisitorLogData);

        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'VISITOR_LOG',
          "Registro de visita creado correctamente"
        );
      }

      fetchVisitorLogs();
      setShowWorkWizard(false);
      setPendingVisitorLogData(null);

    } catch (error) {
      console.error("Error creating visitor log with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'VISITOR_LOG',
        "No se pudo crear el registro de visita"
      );
    }
  };

  // Create visitor log without associated work
  const createVisitorLogWithoutWork = async (data: Partial<IVisitorLog>) => {
    await visitorLogService.createVisitorLog(data);
  };

  // Create visitor log with associated work
  const createVisitorLogWithWork = async (
    visitorLogData: Partial<IVisitorLog>,
    workAssociationData: WorkAssociationData
  ) => {
    // Create work with entity using the new endpoint
    const result = await workService.createWorkWithEntity(
      "VISITOR_LOG",
      visitorLogData,
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
      if (!pendingVisitorLogData) return;

      const result = await createVisitorLogWithoutWork(pendingVisitorLogData);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'creation',
        'VISITOR_LOG',
        "Registro de visita creado correctamente"
      );

      fetchVisitorLogs();
      setShowConfirmation(false);
      setPendingVisitorLogData(null);

    } catch (error) {
      console.error("Error creating visitor log:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'VISITOR_LOG',
        "No se pudo crear el registro de visita"
      );
    }
  };

  // Function to handle work wizard cancellation
  const handleWorkWizardCancel = () => {
    setShowWorkWizard(false);
    setPendingVisitorLogData(null);
  };

  // Function to cancel all operations
  const handleCancelAll = () => {
    setShowWorkQuestion(false);
    setShowWorkWizard(false);
    setShowConfirmation(false);
    setPendingVisitorLogData(null);
  };
  
  // Function to handle updating a visitor log
  const handleUpdateVisitorLog = async (id: string | number, data: Partial<IVisitorLog>) => {
    try {
      const result = await visitorLogService.updateVisitorLog(id, data);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'VISITOR_LOG',
        "Registro de visita actualizado correctamente"
      );

      fetchVisitorLogs();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedVisitorLog(null);
    } catch (error) {
      console.error(`Error updating visitor log ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'VISITOR_LOG',
        "No se pudo actualizar el registro de visita"
      );
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
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
              ¿Está seguro que desea crear el registro de visita sin asociar un trabajo?
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

          {showWorkWizard && pendingVisitorLogData && (
            <WorkAssociationWizard
              entityType="visitorLog"
              entityData={{
                id: "new-visitor-log"
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

export default VisitorLog; 