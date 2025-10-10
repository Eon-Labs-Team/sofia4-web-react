import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Presentation,
  Clock,
  Calendar,
  Users,
  FileText
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
import { ITrainingTalks } from "@eon-lib/eon-mongoose/types";
import trainingTalksService from "@/_services/trainingTalksService";
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

// Column configuration for the grid - matching the ITrainingTalks structure
const columns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: true,
    sortable: true,
  },
  {
    id: "talkType",
    header: "Tipo de Charla",
    accessor: "talkType",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "instructor",
    header: "Instructor",
    accessor: "instructor",
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
    id: "startTime",
    header: "Hora Inicio",
    accessor: "startTime",
    visible: true,
    sortable: true,
  },
  {
    id: "endTime",
    header: "Hora Fin",
    accessor: "endTime",
    visible: true,
    sortable: true,
  },
  {
    id: "topicOrObjective",
    header: "Tema/Objetivo",
    accessor: "topicOrObjective",
    visible: true,
    sortable: true,
  },
  {
    id: "materials",
    header: "Materiales",
    accessor: "materials",
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
    id: "sessionDuration",
    header: "Duración de Sesión",
    accessor: "sessionDuration",
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
    <h3 className="text-lg font-semibold mb-2">{row.talkType}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Instructor:</strong> {row.instructor}
        </p>
        <p>
          <strong>Fecha:</strong> {row.date}
        </p>
        <p>
          <strong>Hora Inicio:</strong> {row.startTime}
        </p>
        <p>
          <strong>Hora Fin:</strong> {row.endTime}
        </p>
        <p>
          <strong>Duración:</strong> {row.sessionDuration}
        </p>
      </div>
      <div>
        <p>
          <strong>Tema/Objetivo:</strong> {row.topicOrObjective}
        </p>
        <p>
          <strong>Materiales:</strong> {row.materials}
        </p>
        <p>
          <strong>Observaciones:</strong> {row.observations}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
        <p>
          <strong>Participantes:</strong> {row.participants ? row.participants.length : 0}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new training talk
const formSections: SectionConfig[] = [
  {
    id: "training-talk-info",
    title: "Información de la Capacitación",
    description: "Ingrese los datos de la nueva capacitación",
    fields: [
      {
        id: "talkType",
        type: "text",
        label: "Tipo de Charla",
        name: "talkType",
        placeholder: "Ej: Seguridad, Procedimientos, Técnica",
        required: true,
        helperText: "Ingrese el tipo de charla o capacitación"
      },
      {
        id: "instructor",
        type: "text",
        label: "Instructor",
        name: "instructor",
        placeholder: "Nombre del instructor o facilitador",
        required: true,
        helperText: "Persona responsable de impartir la capacitación"
      },
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        required: true,
        helperText: "Fecha en que se realiza la capacitación"
      },
      {
        id: "startTime",
        type: "text",
        label: "Hora de Inicio",
        name: "startTime",
        required: true,
        helperText: "Hora de inicio de la capacitación"
      },
      {
        id: "endTime",
        type: "text",
        label: "Hora de Fin",
        name: "endTime",
        required: true,
        helperText: "Hora de finalización de la capacitación"
      },
      {
        id: "topicOrObjective",
        type: "textarea",
        label: "Tema/Objetivo",
        name: "topicOrObjective",
        placeholder: "Describa el tema o objetivo de la capacitación",
        required: true,
        helperText: "Tema principal o objetivo de la capacitación"
      },
      {
        id: "materials",
        type: "textarea",
        label: "Materiales",
        name: "materials",
        placeholder: "Materiales utilizados en la capacitación",
        required: true,
        helperText: "Materiales didácticos o recursos utilizados"
      },
      {
        id: "observations",
        type: "textarea",
        label: "Observaciones",
        name: "observations",
        placeholder: "Observaciones adicionales",
        required: true,
        helperText: "Comentarios o notas adicionales sobre la capacitación"
      },
      {
        id: "sessionDuration",
        type: "text",
        label: "Duración de Sesión",
        name: "sessionDuration",
        placeholder: "Ej: 2 horas",
        required: true,
        helperText: "Duración total de la sesión de capacitación"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si la capacitación está activa o no"
      },
      // Para los participantes, normalmente se usaría un componente de selección múltiple
      // pero por simplicidad lo dejamos como texto por ahora
      {
        id: "participants",
        type: "text",
        label: "Participantes (IDs separados por coma)",
        name: "participants",
        placeholder: "ID1, ID2, ID3",
        helperText: "IDs de los trabajadores que participaron en la capacitación"
      }
    ],
  }
];

// Form validation schema
const formValidationSchema = z.object({
  talkType: z.string().min(1, { message: "El tipo de charla es obligatorio" }),
  instructor: z.string().min(1, { message: "El instructor es obligatorio" }),
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  startTime: z.string().min(1, { message: "La hora de inicio es obligatoria" }),
  endTime: z.string().min(1, { message: "La hora de fin es obligatoria" }),
  topicOrObjective: z.string().min(1, { message: "El tema/objetivo es obligatorio" }),
  materials: z.string().min(1, { message: "Los materiales son obligatorios" }),
  observations: z.string().min(1, { message: "Las observaciones son obligatorias" }),
  sessionDuration: z.string().min(1, { message: "La duración de la sesión es obligatoria" }),
  state: z.boolean().default(true),
  participants: z.string().optional().transform(val => {
    if (!val) return [];
    // Convertir string de IDs a array de objetos { workerId: id }
    return val.split(',').map(id => ({ workerId: id.trim() }));
  })
});

const Capacitaciones = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [trainingTalks, setTrainingTalks] = useState<ITrainingTalks[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrainingTalk, setSelectedTrainingTalk] = useState<ITrainingTalks | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingTrainingTalkData, setPendingTrainingTalkData] = useState<Partial<ITrainingTalks> | null>(null);
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
  
  // Fetch training talks on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchTrainingTalks();
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
  
  // Function to fetch training talks data
  const fetchTrainingTalks = async () => {
    setIsLoading(true);
    try {
      const data = await trainingTalksService.findAll();
      setTrainingTalks(Array.isArray(data) ? data : (data as any)?.data || []);
    } catch (error) {
      console.error("Error loading training talks:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las capacitaciones",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new training talk
  const handleAddTrainingTalk = async (data: any) => {
    // Prepare participants data
    const trainingTalkData: Partial<ITrainingTalks> = {
      talkType: data.talkType,
      instructor: data.instructor,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      topicOrObjective: data.topicOrObjective,
      materials: data.materials,
      observations: data.observations,
      sessionDuration: data.sessionDuration,
      participants: data.participants,
      state: data.state !== undefined ? data.state : true
    };

    // Store the data and show the work association question
    setPendingTrainingTalkData(trainingTalkData);
    setIsDialogOpen(false);
    setShowWorkQuestion(true);
  };

  // Function to handle work association completion
  const handleWorkAssociation = async (workAssociationData: WorkAssociationData) => {
    try {
      if (!pendingTrainingTalkData) return;

      if (workAssociationData.associateWork) {
        // Create training talk with associated work
        const result = await createTrainingTalkWithWork(pendingTrainingTalkData, workAssociationData);

        // Handle enhanced response format
        handleResponseWithFallback(
          result,
          'creation',
          'TRAINING_TALKS',
          "Capacitación creada correctamente"
        );
      } else {
        // Create training talk without work
        const result = await createTrainingTalkWithoutWork(pendingTrainingTalkData);

        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'TRAINING_TALKS',
          "Capacitación creada correctamente"
        );
      }

      fetchTrainingTalks();
      setShowWorkWizard(false);
      setPendingTrainingTalkData(null);

    } catch (error) {
      console.error("Error creating training talk with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'TRAINING_TALKS',
        "No se pudo crear la capacitación"
      );
    }
  };

  // Create training talk without associated work
  const createTrainingTalkWithoutWork = async (data: Partial<ITrainingTalks>) => {
    await trainingTalksService.createTrainingTalk(data);
  };

  // Create training talk with associated work
  const createTrainingTalkWithWork = async (
    trainingTalkData: Partial<ITrainingTalks>,
    workAssociationData: WorkAssociationData
  ) => {
    // Create work with entity using the new endpoint
    const result = await workService.createWorkWithEntity(
      "TRAINING_TALKS",
      trainingTalkData,
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
      if (!pendingTrainingTalkData) return;

      const result = await createTrainingTalkWithoutWork(pendingTrainingTalkData);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'creation',
        'TRAINING_TALKS',
        "Capacitación creada correctamente"
      );

      fetchTrainingTalks();
      setShowConfirmation(false);
      setPendingTrainingTalkData(null);

    } catch (error) {
      console.error("Error creating training talk:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'TRAINING_TALKS',
        "No se pudo crear la capacitación"
      );
    }
  };

  // Function to handle work wizard cancellation
  const handleWorkWizardCancel = () => {
    setShowWorkWizard(false);
    setPendingTrainingTalkData(null);
  };

  // Function to cancel all operations
  const handleCancelAll = () => {
    setShowWorkQuestion(false);
    setShowWorkWizard(false);
    setShowConfirmation(false);
    setPendingTrainingTalkData(null);
  };
  
  // Function to handle updating a training talk
  const handleUpdateTrainingTalk = async (id: string | number, data: any) => {
    try {
      const trainingTalkData: Partial<ITrainingTalks> = {
        talkType: data.talkType,
        instructor: data.instructor,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        topicOrObjective: data.topicOrObjective,
        materials: data.materials,
        observations: data.observations,
        sessionDuration: data.sessionDuration,
        participants: data.participants,
        state: data.state
      };

      const result = await trainingTalksService.updateTrainingTalk(id, trainingTalkData);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'TRAINING_TALKS',
        "Capacitación actualizada correctamente"
      );

      fetchTrainingTalks();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedTrainingTalk(null);
    } catch (error) {
      console.error(`Error updating training talk ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'TRAINING_TALKS',
        "No se pudo actualizar la capacitación"
      );
    }
  };
  
  // Function to handle deleting a training talk
  const handleDeleteTrainingTalk = async (id: string | number) => {
    try {
      await trainingTalksService.softDeleteTrainingTalk(id);
      
      toast({
        title: "Éxito",
        description: "Capacitación eliminada correctamente",
      });
      
      // Refresh the data
      fetchTrainingTalks();
      
    } catch (error) {
      console.error(`Error deleting training talk ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la capacitación",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: any) => {
    if (isEditMode && selectedTrainingTalk) {
      handleUpdateTrainingTalk(selectedTrainingTalk._id, data);
    } else {
      handleAddTrainingTalk(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (trainingTalk: ITrainingTalks) => {
    setSelectedTrainingTalk(trainingTalk);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render actions for each row
  const renderActions = (row: ITrainingTalks) => (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleEditClick(row)}
        title="Editar"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleDeleteTrainingTalk(row._id)}
        title="Eliminar"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Capacitaciones</h1>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedTrainingTalk(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Capacitación
        </Button>
      </div>
      
      <Grid
        columns={columns}
        data={trainingTalks}
        gridId="trainingTalks"
        expandableContent={expandableContent}
        actions={renderActions}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Capacitación" : "Agregar Nueva Capacitación"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario. Haga clic en guardar cuando termine.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={
              isEditMode && selectedTrainingTalk
                ? {
                    ...selectedTrainingTalk,
                    // Convertir el array de participantes a string para el formulario
                    participants: selectedTrainingTalk.participants
                      ? selectedTrainingTalk.participants.map(p => p.workerId).join(', ')
                      : ''
                  }
                : {
                    state: true,
                  }
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
              ¿Está seguro que desea crear la capacitación sin asociar un trabajo?
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

          {showWorkWizard && pendingTrainingTalkData && (
            <WorkAssociationWizard
              entityType="capacitaciones"
              entityData={{
                id: "new-training-talk"
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

export default Capacitaciones; 