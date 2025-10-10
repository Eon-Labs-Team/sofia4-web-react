import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Droplets,
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
import { IChlorination } from "@eon-lib/eon-mongoose/types";
import { z } from "zod";
import chlorinationService from "@/_services/chlorinationService";
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

// Format date helper function
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES');
};

// Column configuration for the grid
const columns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: true,
    sortable: true,
  },
  {
    id: "date",
    header: "Fecha",
    accessor: "date",
    visible: true,
    sortable: true,
    render: (value: string) => formatDate(value),
  },
  {
    id: "site",
    header: "Sitio",
    accessor: "site",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "supervisor",
    header: "Supervisor",
    accessor: "supervisor",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "frequency",
    header: "Frecuencia",
    accessor: "frequency",
    visible: true,
    sortable: true,
  },
  {
    id: "name",
    header: "Nombre",
    accessor: "name",
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
    <h3 className="text-lg font-semibold mb-2">Detalles de Cloración de Agua</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Fecha:</strong> {formatDate(row.date)}
        </p>
        <p>
          <strong>Sitio:</strong> {row.site}
        </p>
        <p>
          <strong>Supervisor:</strong> {row.supervisor}
        </p>
      </div>
      <div>
        <p>
          <strong>Frecuencia:</strong> {row.frequency}
        </p>
        <p>
          <strong>Nombre:</strong> {row.name}
        </p>
        <p>
          <strong>Observaciones:</strong> {row.observations || "-"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new chlorination record
const formSections: SectionConfig[] = [
  {
    id: "chlorination-info",
    title: "Información de Cloración de Agua",
    description: "Ingrese los datos del registro de cloración",
    fields: [
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        required: true,
        helperText: "Fecha del registro de cloración"
      },
      {
        id: "site",
        type: "text",
        label: "Sitio",
        name: "site",
        placeholder: "Ubicación donde se realizó la cloración",
        required: true,
        helperText: "Sitio donde se realizó la cloración"
      },
      {
        id: "supervisor",
        type: "text",
        label: "Supervisor",
        name: "supervisor",
        placeholder: "Nombre del supervisor",
        required: true,
        helperText: "Persona encargada de supervisar"
      },
      {
        id: "frequency",
        type: "text",
        label: "Frecuencia",
        name: "frequency",
        placeholder: "Frecuencia de cloración",
        required: true,
        helperText: "Frecuencia con la que se realiza la cloración"
      },
      {
        id: "observations",
        type: "textarea",
        label: "Observaciones",
        name: "observations",
        placeholder: "Observaciones adicionales",
        required: false,
        helperText: "Cualquier observación relevante"
      },
      {
        id: "name",
        type: "text",
        label: "Nombre",
        name: "name",
        placeholder: "Nombre del responsable",
        required: true,
        helperText: "Nombre de la persona responsable"
      },
      {
        id: "signature",
        type: "text",
        label: "Firma",
        name: "signature",
        placeholder: "Firma del responsable",
        required: true,
        helperText: "Identificador de la firma digital"
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
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  site: z.string().min(1, { message: "El sitio es obligatorio" }),
  supervisor: z.string().min(1, { message: "El supervisor es obligatorio" }),
  frequency: z.string().min(1, { message: "La frecuencia es obligatoria" }),
  observations: z.string().optional(),
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  signature: z.string().min(1, { message: "La firma es obligatoria" }),
  state: z.boolean().default(true)
});

const WaterChlorination = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [chlorinations, setChlorinations] = useState<IChlorination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChlorination, setSelectedChlorination] = useState<IChlorination | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<IChlorination> | null>(null);
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
  
  // Fetch chlorination records on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchChlorinations();
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
  
  // Function to fetch chlorination data
  const fetchChlorinations = async () => {
    setIsLoading(true);
    try {
      const data = await chlorinationService.findAll();
      // @ts-ignore
      setChlorinations(data.data || data);
    } catch (error) {
      console.error("Error loading chlorination records:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros de cloración",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new chlorination record
  const handleAddChlorination = async (data: Partial<IChlorination>) => {
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
        // Create chlorination with associated work
        const result = await createEntityWithWork(pendingData, workAssociationData);

        // Handle enhanced response format
        handleResponseWithFallback(
          result,
          'creation',
          'CHLORINATION',
          "Registro de cloración creado correctamente"
        );
      } else {
        // Create chlorination without work
        const result = await createEntityWithoutWork(pendingData);

        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'CHLORINATION',
          "Registro de cloración creado correctamente"
        );
      }

      fetchChlorinations();
      setShowWorkWizard(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating chlorination with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'CHLORINATION',
        "No se pudo crear el registro de cloración"
      );
    }
  };

  // Create chlorination without associated work
  const createEntityWithoutWork = async (data: Partial<IChlorination>) => {
    await chlorinationService.createChlorination(data);
  };

  // Create chlorination with associated work
  const createEntityWithWork = async (
    chlorinationData: Partial<IChlorination>,
    workAssociationData: WorkAssociationData
  ) => {
    // Create work with entity using the new endpoint
    const result = await workService.createWorkWithEntity(
      "CHLORINATION",
      chlorinationData,
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
        'CHLORINATION',
        "Registro de cloración creado correctamente"
      );

      fetchChlorinations();
      setShowConfirmation(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating chlorination:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'CHLORINATION',
        "No se pudo crear el registro de cloración"
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

  // Function to handle updating a chlorination record
  const handleUpdateChlorination = async (id: string | number, data: Partial<IChlorination>) => {
    try {
      const result = await chlorinationService.updateChlorination(id, data);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'CHLORINATION',
        "Registro de cloración actualizado correctamente"
      );

      fetchChlorinations();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedChlorination(null);
    } catch (error) {
      console.error(`Error updating chlorination record ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'CHLORINATION',
        "No se pudo actualizar el registro de cloración"
      );
    }
  };

  // Function to handle deleting a chlorination record
  const handleDeleteChlorination = async (id: string | number) => {
    try {
      await chlorinationService.softDeleteChlorination(id);
      await fetchChlorinations();
      toast({
        title: "Éxito",
        description: "Registro de cloración eliminado correctamente",
      });
    } catch (error) {
      console.error(`Error deleting chlorination record ${id}:`, error);
      toast({
        title: "Error",
        description: "Error al eliminar el registro de cloración",
        variant: "destructive",
      });
    }
  };

  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IChlorination>) => {
    if (isEditMode && selectedChlorination) {
      handleUpdateChlorination(selectedChlorination._id, data);
    } else {
      handleAddChlorination(data);
    }
  };

  // Function to handle edit click
  const handleEditClick = (chlorination: IChlorination) => {
    setSelectedChlorination(chlorination);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Function to render row actions
  const renderActions = (row: IChlorination) => {
    return (
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
          onClick={() => handleDeleteChlorination(row._id)}
          title="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cloración de Agua</h1>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedChlorination(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Registro
        </Button>
      </div>

      <Grid
        data={chlorinations}
        columns={columns}
        expandableContent={expandableContent}
        isLoading={isLoading}
        actions={renderActions}
        gridId="water-chlorination-grid"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Registro de Cloración" : "Agregar Registro de Cloración"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Actualice la información del registro de cloración"
                : "Complete el formulario para agregar un nuevo registro de cloración"}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedChlorination ? { ...selectedChlorination } : undefined}
            // @ts-ignore
            submitButtonText={isEditMode ? "Actualizar" : "Guardar"}
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
              ¿Está seguro que desea crear el registro de cloración sin asociar un trabajo?
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
              entityType="waterChlorination"
              entityData={{
                id: "new-chlorination"
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

export default WaterChlorination; 