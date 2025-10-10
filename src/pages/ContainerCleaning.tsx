import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
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
} from "@/components/DynamicForm/DynamicForm";
import { z } from "zod";
import { IContainerCleaning } from "@eon-lib/eon-mongoose/types";
import containerCleaningService from "@/_services/containerCleaningService";
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
  handleResponseWithFallback,
  handleErrorWithEnhancedFormat,
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

// Render function for boolean fields
const renderBoolean = (value: boolean) => {
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
    id: "location",
    header: "Ubicación",
    accessor: "location",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "container",
    header: "Contenedor",
    accessor: "container",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "containerNumber",
    header: "N° Contenedor",
    accessor: "containerNumber",
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
    id: "washed",
    header: "Lavado",
    accessor: "washed",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderBoolean,
  },
  {
    id: "rinsed",
    header: "Enjuagado",
    accessor: "rinsed",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderBoolean,
  },
  {
    id: "hung",
    header: "Colgado",
    accessor: "hung",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderBoolean,
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
    <h3 className="text-lg font-semibold mb-4">Detalle de Limpieza de Contenedor</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Información General</h4>
        <p className="text-sm"><strong>Fecha:</strong> {row.date}</p>
        <p className="text-sm"><strong>Ubicación:</strong> {row.location}</p>
        <p className="text-sm"><strong>Supervisor:</strong> {row.supervisor}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Contenedor</h4>
        <p className="text-sm"><strong>Tipo:</strong> {row.container}</p>
        <p className="text-sm"><strong>Número:</strong> {row.containerNumber}</p>
        <p className="text-sm"><strong>Variedad Cosechada:</strong> {row.harvestedVariety}</p>
        {row.crew && <p className="text-sm"><strong>Cuadrilla:</strong> {row.crew}</p>}
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Proceso de Limpieza</h4>
        <p className="text-sm"><strong>Lavado:</strong> {row.washed ? 'Sí' : 'No'}</p>
        <p className="text-sm"><strong>Enjuagado:</strong> {row.rinsed ? 'Sí' : 'No'}</p>
        <p className="text-sm"><strong>Colgado:</strong> {row.hung ? 'Sí' : 'No'}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Responsable</h4>
        <p className="text-sm"><strong>Persona:</strong> {row.responsiblePerson}</p>
      </div>
      {(row.photo1 || row.photo2 || row.photo3) && (
        <div>
          <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Fotografías</h4>
          {row.photo1 && <p className="text-sm"><strong>Foto 1:</strong> {row.photo1}</p>}
          {row.photo2 && <p className="text-sm"><strong>Foto 2:</strong> {row.photo2}</p>}
          {row.photo3 && <p className="text-sm"><strong>Foto 3:</strong> {row.photo3}</p>}
        </div>
      )}
    </div>
  </div>
);

// Form configuration for adding new container cleaning
const formSections: SectionConfig[] = [
  {
    id: "general-info",
    title: "Información General",
    description: "Datos generales de la limpieza de contenedor",
    fields: [
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        placeholder: "Seleccione la fecha",
        required: true,
        helperText: "Fecha de la limpieza",
        defaultValue: new Date().toISOString().split('T')[0],
      },
      {
        id: "location",
        type: "text",
        label: "Ubicación",
        name: "location",
        placeholder: "Ingrese la ubicación",
        required: true,
        helperText: "Lugar donde se realizó la limpieza"
      },
      {
        id: "supervisor",
        type: "text",
        label: "Supervisor",
        name: "supervisor",
        placeholder: "Nombre del supervisor",
        required: true,
        helperText: "Supervisor responsable"
      },
    ]
  },
  {
    id: "container-info",
    title: "Información del Contenedor",
    description: "Datos del contenedor limpiado",
    fields: [
      {
        id: "container",
        type: "text",
        label: "Tipo de Contenedor",
        name: "container",
        placeholder: "Ej: Bin, Caja, etc.",
        required: true,
        helperText: "Tipo de contenedor"
      },
      {
        id: "containerNumber",
        type: "text",
        label: "Número de Contenedor",
        name: "containerNumber",
        placeholder: "Ingrese el número",
        required: true,
        helperText: "Número identificador del contenedor"
      },
      {
        id: "harvestedVariety",
        type: "text",
        label: "Variedad Cosechada",
        name: "harvestedVariety",
        placeholder: "Variedad de la fruta",
        required: true,
        helperText: "Variedad que contenía el contenedor"
      },
      {
        id: "crew",
        type: "text",
        label: "Cuadrilla (Opcional)",
        name: "crew",
        placeholder: "Nombre de la cuadrilla",
        required: false,
        helperText: "Cuadrilla que realizó la limpieza"
      },
    ]
  },
  {
    id: "cleaning-process",
    title: "Proceso de Limpieza",
    description: "Estado del proceso de limpieza",
    fields: [
      {
        id: "washed",
        type: "checkbox",
        label: "Lavado",
        name: "washed",
        required: false,
        defaultValue: false,
        helperText: "¿Se lavó el contenedor?"
      },
      {
        id: "rinsed",
        type: "checkbox",
        label: "Enjuagado",
        name: "rinsed",
        required: false,
        defaultValue: false,
        helperText: "¿Se enjuagó el contenedor?"
      },
      {
        id: "hung",
        type: "checkbox",
        label: "Colgado",
        name: "hung",
        required: false,
        defaultValue: false,
        helperText: "¿Se colgó el contenedor para secar?"
      },
    ]
  },
  {
    id: "responsible-info",
    title: "Responsable",
    description: "Persona responsable de la limpieza",
    fields: [
      {
        id: "responsiblePerson",
        type: "text",
        label: "Persona Responsable",
        name: "responsiblePerson",
        placeholder: "Nombre del responsable",
        required: true,
        helperText: "Persona que realizó o supervisó la limpieza"
      },
    ]
  },
  {
    id: "photos",
    title: "Fotografías (Opcional)",
    description: "URLs de las fotografías de evidencia",
    fields: [
      {
        id: "photo1",
        type: "text",
        label: "Fotografía 1",
        name: "photo1",
        placeholder: "URL de la foto 1",
        required: false,
        helperText: "URL de la primera fotografía"
      },
      {
        id: "photo2",
        type: "text",
        label: "Fotografía 2",
        name: "photo2",
        placeholder: "URL de la foto 2",
        required: false,
        helperText: "URL de la segunda fotografía"
      },
      {
        id: "photo3",
        type: "text",
        label: "Fotografía 3",
        name: "photo3",
        placeholder: "URL de la foto 3",
        required: false,
        helperText: "URL de la tercera fotografía"
      },
    ]
  },
  {
    id: "state-info",
    title: "Estado",
    description: "Estado del registro",
    fields: [
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: false,
        defaultValue: true,
        helperText: "Indica si el registro está activo"
      },
    ]
  }
];

// Form validation schema
const formValidationSchema = z.object({
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  location: z.string().min(1, { message: "La ubicación es obligatoria" }),
  supervisor: z.string().min(1, { message: "El supervisor es obligatorio" }),
  container: z.string().min(1, { message: "El tipo de contenedor es obligatorio" }),
  containerNumber: z.string().min(1, { message: "El número de contenedor es obligatorio" }),
  harvestedVariety: z.string().min(1, { message: "La variedad cosechada es obligatoria" }),
  crew: z.string().optional(),
  washed: z.boolean().default(false),
  rinsed: z.boolean().default(false),
  hung: z.boolean().default(false),
  responsiblePerson: z.string().min(1, { message: "La persona responsable es obligatoria" }),
  photo1: z.string().optional(),
  photo2: z.string().optional(),
  photo3: z.string().optional(),
  state: z.boolean().default(true)
});

const ContainerCleaning = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [containerCleaningData, setContainerCleaningData] = useState<IContainerCleaning[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContainerCleaning, setSelectedContainerCleaning] = useState<IContainerCleaning | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<IContainerCleaning> | null>(null);
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

  // Fetch container cleaning data on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchContainerCleaning();
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

  // Function to fetch container cleaning data
  const fetchContainerCleaning = async () => {
    setIsLoading(true);
    try {
      const response = await containerCleaningService.findAll();
      // Handle different response structures
      if (Array.isArray(response)) {
        setContainerCleaningData(response);
      } else if (response && typeof response === 'object') {
        const data = (response as any).data || [];
        setContainerCleaningData(Array.isArray(data) ? data : []);
      } else {
        setContainerCleaningData([]);
      }
    } catch (error) {
      console.error("Error loading container cleaning:", error);
      setContainerCleaningData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle adding a new container cleaning
  const handleAddContainerCleaning = async (data: Partial<IContainerCleaning>) => {
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
        // Create container cleaning with associated work
        const result = await createContainerCleaningWithWork(pendingData, workAssociationData);

        handleResponseWithFallback(
          result,
          'creation',
          'CONTAINER_CLEANING',
          "Limpieza de contenedor registrada correctamente"
        );
      } else {
        // Create container cleaning without work
        const result = await createContainerCleaningWithoutWork(pendingData);

        handleResponseWithFallback(
          result,
          'creation',
          'CONTAINER_CLEANING',
          "Limpieza de contenedor registrada correctamente"
        );
      }

      fetchContainerCleaning();
      setShowWorkWizard(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating container cleaning with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'CONTAINER_CLEANING',
        "No se pudo registrar la limpieza de contenedor"
      );
    }
  };

  // Create container cleaning without associated work
  const createContainerCleaningWithoutWork = async (data: Partial<IContainerCleaning>) => {
    await containerCleaningService.createContainerCleaning(data);
  };

  // Create container cleaning with associated work
  const createContainerCleaningWithWork = async (
    containerCleaningData: Partial<IContainerCleaning>,
    workAssociationData: WorkAssociationData
  ) => {
    const result = await workService.createWorkWithEntity(
      "CONTAINER_CLEANING",
      containerCleaningData,
      workAssociationData.workData
    );

    return result;
  };

  // Function to handle work association question response
  const handleWorkQuestionResponse = (associateWork: boolean) => {
    setShowWorkQuestion(false);

    if (associateWork) {
      setShowWorkWizard(true);
    } else {
      setShowConfirmation(true);
    }
  };

  // Function to handle confirmation of direct insertion
  const handleConfirmInsertion = async () => {
    try {
      if (!pendingData) return;

      const result = await createContainerCleaningWithoutWork(pendingData);

      handleResponseWithFallback(
        result,
        'creation',
        'CONTAINER_CLEANING',
        "Limpieza de contenedor registrada correctamente"
      );

      fetchContainerCleaning();
      setShowConfirmation(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating container cleaning:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'CONTAINER_CLEANING',
        "No se pudo registrar la limpieza de contenedor"
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

  // Function to handle updating a container cleaning
  const handleUpdateContainerCleaning = async (id: string | number, data: Partial<IContainerCleaning>) => {
    try {
      const result = await containerCleaningService.updateContainerCleaning(id, data);

      handleResponseWithFallback(
        result,
        'update',
        'CONTAINER_CLEANING',
        "Limpieza de contenedor actualizada correctamente"
      );

      fetchContainerCleaning();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedContainerCleaning(null);
    } catch (error) {
      console.error(`Error updating container cleaning ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'CONTAINER_CLEANING',
        "No se pudo actualizar la limpieza de contenedor"
      );
    }
  };

  // Function to handle deleting a container cleaning
  const handleDeleteContainerCleaning = async (id: string | number) => {
    try {
      await containerCleaningService.softDeleteContainerCleaning(id);
      toast({
        title: "Éxito",
        description: "Limpieza de contenedor eliminada correctamente",
      });
      fetchContainerCleaning();
    } catch (error) {
      console.error(`Error deleting container cleaning ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la limpieza de contenedor",
        variant: "destructive",
      });
    }
  };

  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IContainerCleaning>) => {
    if (isEditMode && selectedContainerCleaning && selectedContainerCleaning._id) {
      handleUpdateContainerCleaning(selectedContainerCleaning._id, data);
    } else {
      handleAddContainerCleaning(data);
    }
  };

  // Function to handle edit click
  const handleEditClick = (containerCleaning: IContainerCleaning) => {
    setSelectedContainerCleaning(containerCleaning);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Function to render action buttons for each row
  const renderActions = (row: IContainerCleaning) => {
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
          onClick={() => handleDeleteContainerCleaning(row._id as string)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Limpieza de recipientes</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedContainerCleaning(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Registro
        </Button>
      </div>

      <Grid
        data={containerCleaningData}
        columns={[...columns, {
          id: "actions",
          header: "Acciones",
          accessor: "actions",
          visible: true,
          render: renderActions,
        }]}
        gridId="container-cleaning-grid"
        title="Registros de Limpieza de recipientes"
        expandableContent={expandableContent}
        actions={renderActions}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Limpieza de Contenedor" : "Agregar Nueva Limpieza de Contenedor"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique la información de la limpieza de contenedor existente"
                : "Complete la información para registrar una nueva limpieza de contenedor"}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedContainerCleaning ? selectedContainerCleaning : undefined}
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
              ¿Está seguro que desea registrar la limpieza de contenedor sin asociar un trabajo?
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
              entityType="containerCleaning"
              entityData={{
                id: "new-container-cleaning"
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

export default ContainerCleaning;
