import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  GalleryVerticalEnd,
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
import { IMonitoringOfPhenologicalState } from "@eon-lib/eon-mongoose/types";
import monitoringOfPhenologicalStateService from "@/_services/monitoringOfPhenologicalStateService";
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

// Render function for the exist column (boolean)
const renderExist = (value: boolean) => {
  return value ? (
    <div className="flex items-center">
      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
      <span>Sí</span>
    </div>
  ) : (
    <div className="flex items-center">
      <XCircle className="h-4 w-4 text-red-500 mr-2" />
      <span>No</span>
    </div>
  );
};

// Render function for images
const renderImages = (value: string) => {
  if (!value) return <span>Sin imagen</span>;
  return (
    <div className="flex items-center">
      <GalleryVerticalEnd className="h-4 w-4 mr-2" />
      <span>Ver imagen</span>
    </div>
  );
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
    groupable: true,
  },
  {
    id: "crop",
    header: "Cultivo",
    accessor: "crop",
    visible: true,
    sortable: true,
    groupable: true,
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
    id: "phenologicalState",
    header: "Estado Fenológico",
    accessor: "phenologicalState",
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
    id: "exist",
    header: "Existe",
    accessor: "exist",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderExist,
  },
  {
    id: "image1",
    header: "Imagen 1",
    accessor: "image1",
    visible: true,
    render: renderImages,
  },
  {
    id: "image2",
    header: "Imagen 2",
    accessor: "image2",
    visible: true,
    render: renderImages,
  },
  {
    id: "image3",
    header: "Imagen 3",
    accessor: "image3",
    visible: true,
    render: renderImages,
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
    <h3 className="text-lg font-semibold mb-2">Detalles de Monitoreo</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p><strong>Fecha:</strong> {row.date}</p>
        <p><strong>Cultivo:</strong> {row.crop}</p>
        <p><strong>Cuartel:</strong> {row.barracks}</p>
        <p><strong>Estado Fenológico:</strong> {row.phenologicalState}</p>
        <p><strong>Observación:</strong> {row.observation}</p>
        <p><strong>Existe:</strong> {row.exist ? "Sí" : "No"}</p>
      </div>
      <div>
        <p><strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}</p>
        <div className="mt-4">
          <h4 className="text-md font-semibold mb-2">Imágenes</h4>
          <div className="grid grid-cols-3 gap-2">
            {row.image1 && (
              <div className="border p-2 rounded">
                <p className="text-sm mb-1">Imagen 1</p>
                <div className="h-20 bg-gray-200 flex items-center justify-center">
                  <GalleryVerticalEnd className="h-6 w-6" />
                </div>
              </div>
            )}
            {row.image2 && (
              <div className="border p-2 rounded">
                <p className="text-sm mb-1">Imagen 2</p>
                <div className="h-20 bg-gray-200 flex items-center justify-center">
                  <GalleryVerticalEnd className="h-6 w-6" />
                </div>
              </div>
            )}
            {row.image3 && (
              <div className="border p-2 rounded">
                <p className="text-sm mb-1">Imagen 3</p>
                <div className="h-20 bg-gray-200 flex items-center justify-center">
                  <GalleryVerticalEnd className="h-6 w-6" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Form configuration for adding new monitoring record
const formSections: SectionConfig[] = [
  {
    id: "monitoring-info",
    title: "Información del Monitoreo",
    description: "Ingrese los datos del nuevo monitoreo de estado fenológico",
    fields: [
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        placeholder: "Seleccione una fecha",
        required: true,
        helperText: "Fecha del monitoreo"
      },
      {
        id: "crop",
        type: "text",
        label: "Cultivo",
        name: "crop",
        placeholder: "Ej: Manzana, Pera, Uva",
        required: true,
        helperText: "Cultivo monitoreado"
      },
      {
        id: "barracks",
        type: "text",
        label: "Cuartel",
        name: "barracks",
        placeholder: "Nombre del cuartel",
        required: true,
        helperText: "Cuartel donde se realizó el monitoreo"
      },
      {
        id: "phenologicalState",
        type: "text",
        label: "Estado Fenológico",
        name: "phenologicalState",
        placeholder: "Ej: Floración, Maduración, Cosecha",
        required: true,
        helperText: "Estado fenológico observado"
      },
      {
        id: "observation",
        type: "textarea",
        label: "Observación",
        name: "observation",
        placeholder: "Ingrese sus observaciones",
        required: true,
        helperText: "Observaciones detalladas del monitoreo"
      },
      {
        id: "exist",
        type: "checkbox",
        label: "¿Existe?",
        name: "exist",
        required: true,
        helperText: "Indica si existe el estado fenológico observado"
      },
    ]
  },
  {
    id: "images-section",
    title: "Imágenes",
    description: "Ingrese las imágenes del monitoreo",
    fields: [
      {
        id: "image1",
        type: "text",
        label: "Imagen 1",
        name: "image1",
        placeholder: "URL de la imagen 1",
        required: true,
        helperText: "URL de la primera imagen"
      },
      {
        id: "image2",
        type: "text",
        label: "Imagen 2",
        name: "image2",
        placeholder: "URL de la imagen 2",
        required: true,
        helperText: "URL de la segunda imagen"
      },
      {
        id: "image3",
        type: "text",
        label: "Imagen 3",
        name: "image3",
        placeholder: "URL de la imagen 3",
        required: true,
        helperText: "URL de la tercera imagen"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el registro está activo"
      },
    ]
  }
];

// Form validation schema
const formValidationSchema = z.object({
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  crop: z.string().min(1, { message: "El cultivo es obligatorio" }),
  barracks: z.string().min(1, { message: "El cuartel es obligatorio" }),
  phenologicalState: z.string().min(1, { message: "El estado fenológico es obligatorio" }),
  observation: z.string().min(1, { message: "La observación es obligatoria" }),
  exist: z.boolean().default(false),
  image1: z.string().min(1, { message: "La imagen 1 es obligatoria" }),
  image2: z.string().min(1, { message: "La imagen 2 es obligatoria" }),
  image3: z.string().min(1, { message: "La imagen 3 es obligatoria" }),
  state: z.boolean().default(true),
});

const MonitoreoEstadoFenologico = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [monitoringRecords, setMonitoringRecords] = useState<IMonitoringOfPhenologicalState[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonitoring, setSelectedMonitoring] = useState<IMonitoringOfPhenologicalState | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingMonitoringData, setPendingMonitoringData] = useState<Partial<IMonitoringOfPhenologicalState> | null>(null);
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
  
  // Fetch monitoring records on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchMonitoringRecords();
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
  
  // Function to fetch monitoring records data
  const fetchMonitoringRecords = async () => {
    setIsLoading(true);
    try {
      const response = await monitoringOfPhenologicalStateService.findAll();
      // Handle different response structures
      if (Array.isArray(response)) {
        setMonitoringRecords(response);
      } else if (response && typeof response === 'object') {
        const data = response.data || [];
        setMonitoringRecords(Array.isArray(data) ? data : []);
      } else {
        setMonitoringRecords([]);
      }
    } catch (error) {
      console.error("Error loading monitoring records:", error);
      // toast({
      //   title: "Error",
      //   description: "No se pudieron cargar los registros de monitoreo",
      //   variant: "destructive",
      // });
      setMonitoringRecords([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new monitoring record
  const handleAddMonitoring = async (data: Partial<IMonitoringOfPhenologicalState>) => {
    // Store the data and show the work association question
    setPendingMonitoringData(data);
    setIsDialogOpen(false);
    setShowWorkQuestion(true);
  };

  // Function to handle work association completion
  const handleWorkAssociation = async (workAssociationData: WorkAssociationData) => {
    try {
      if (!pendingMonitoringData) return;

      if (workAssociationData.associateWork) {
        // Create monitoring with associated work
        const result = await createMonitoringWithWork(pendingMonitoringData, workAssociationData);
        
        // Handle enhanced response format
        handleResponseWithFallback(
          result,
          'creation',
          'MONITORING_PHENOLOGICAL_STATE',
          "Monitoreo de estado fenológico creado correctamente"
        );
      } else {
        // Create monitoring without work (using endpoint_sin_trabajo equivalent)
        const result = await createMonitoringWithoutWork(pendingMonitoringData);
        
        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'MONITORING_PHENOLOGICAL_STATE',
          "Monitoreo de estado fenológico creado correctamente"
        );
      }

      fetchMonitoringRecords();
      setShowWorkWizard(false);
      setPendingMonitoringData(null);
      
    } catch (error) {
      console.error("Error creating monitoring with work association:", error);
      
      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'MONITORING_PHENOLOGICAL_STATE',
        "No se pudo crear el monitoreo de estado fenológico"
      );
    }
  };

  // Create monitoring without associated work
  const createMonitoringWithoutWork = async (data: Partial<IMonitoringOfPhenologicalState>) => {
    await monitoringOfPhenologicalStateService.createMonitoring(data);
  };

  // Create monitoring with associated work
  const createMonitoringWithWork = async (
    monitoringData: Partial<IMonitoringOfPhenologicalState>, 
    workAssociationData: WorkAssociationData
  ) => {
    // Create work with entity using the new endpoint
    // taskType y task serán asignados automáticamente por el backend
    const result = await workService.createWorkWithEntity(
      "MONITORING_PHENOLOGICAL_STATE", // Usar el nombre correcto de la entidad
      monitoringData,
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
      if (!pendingMonitoringData) return;
      
      const result = await createMonitoringWithoutWork(pendingMonitoringData);
      
      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'creation',
        'MONITORING_PHENOLOGICAL_STATE',
        "Monitoreo de estado fenológico creado correctamente"
      );
      
      fetchMonitoringRecords();
      setShowConfirmation(false);
      setPendingMonitoringData(null);
      
    } catch (error) {
      console.error("Error creating monitoring:", error);
      
      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'MONITORING_PHENOLOGICAL_STATE',
        "No se pudo crear el monitoreo de estado fenológico"
      );
    }
  };

  // Function to handle work wizard cancellation
  const handleWorkWizardCancel = () => {
    setShowWorkWizard(false);
    setPendingMonitoringData(null);
  };

  // Function to cancel all operations
  const handleCancelAll = () => {
    setShowWorkQuestion(false);
    setShowWorkWizard(false);
    setShowConfirmation(false);
    setPendingMonitoringData(null);
  };
  
  // Function to handle updating a monitoring record
  const handleUpdateMonitoring = async (id: string | number, data: Partial<IMonitoringOfPhenologicalState>) => {
    try {
      const result = await monitoringOfPhenologicalStateService.updateMonitoring(id, data);
      
      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'MONITORING_PHENOLOGICAL_STATE',
        "Monitoreo actualizado correctamente"
      );
      
      fetchMonitoringRecords();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedMonitoring(null);
    } catch (error) {
      console.error(`Error updating monitoring record ${id}:`, error);
      
      handleErrorWithEnhancedFormat(
        error,
        'update',
        'MONITORING_PHENOLOGICAL_STATE',
        "No se pudo actualizar el monitoreo"
      );
    }
  };
  
  // Function to handle deleting a monitoring record
  const handleDeleteMonitoring = async (id: string | number) => {
    try {
      await monitoringOfPhenologicalStateService.softDeleteMonitoring(id);
      toast({
        title: "Éxito",
        description: "Monitoreo eliminado correctamente",
      });
      fetchMonitoringRecords();
    } catch (error) {
      console.error(`Error deleting monitoring record ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el monitoreo",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IMonitoringOfPhenologicalState>) => {
    if (isEditMode && selectedMonitoring && selectedMonitoring._id) {
      handleUpdateMonitoring(selectedMonitoring._id, data);
    } else {
      handleAddMonitoring(data);
    }
  };
  
  // Function to handle edit click
  const handleEditClick = (monitoring: IMonitoringOfPhenologicalState) => {
    setSelectedMonitoring(monitoring);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Function to render action buttons for each row
  const renderActions = (row: IMonitoringOfPhenologicalState) => {
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
          onClick={() => handleDeleteMonitoring(row._id as string)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Monitoreo de Estado Fenológico</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedMonitoring(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Monitoreo
        </Button>
      </div>
      
      <Grid
        data={monitoringRecords}
        columns={[...columns, {
          id: "actions",
          header: "Acciones",
          accessor: "actions",
          visible: true,
          render: renderActions,
        }]}
        gridId="monitoreo-estado-fenologico"
        title="Registros de Monitoreo"
        expandableContent={expandableContent}
        actions={renderActions}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Monitoreo" : "Agregar Nuevo Monitoreo"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Modifique la información del monitoreo existente" 
                : "Complete la información para crear un nuevo monitoreo de estado fenológico"}
            </DialogDescription>
          </DialogHeader>
          
          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedMonitoring ? selectedMonitoring : undefined}
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
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
              ¿Está seguro que desea crear el monitoreo sin asociar un trabajo?
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
          
          {showWorkWizard && pendingMonitoringData && (
            <WorkAssociationWizard
              entityType="monitoreoEstadoFenologico"
              entityData={{
                id: "new-monitoring"
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

export default MonitoreoEstadoFenologico; 