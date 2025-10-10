import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Building2,
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
import { IAnimalAdmission } from "@eon-lib/eon-mongoose/types";
import animalAdmissionService from "@/_services/animalAdmissionService";
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

// Column configuration for the grid - based on the IAnimalAdmission model
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
    id: "quarterLot",
    header: "Lote de Cuartel",
    accessor: "quarterLot",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "code",
    header: "Código",
    accessor: "code",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "area",
    header: "Área",
    accessor: "area",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "reviser",
    header: "Revisor",
    accessor: "reviser",
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
    <h3 className="text-lg font-semibold mb-2">Ingreso de Animales: {row.code}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Fecha:</strong> {row.date}
        </p>
        <p>
          <strong>Lote de Cuartel:</strong> {row.quarterLot}
        </p>
        <p>
          <strong>Código:</strong> {row.code}
        </p>
        <p>
          <strong>Área:</strong> {row.area}
        </p>
      </div>
      <div>
        <p>
          <strong>Revisor:</strong> {row.reviser}
        </p>
        <p>
          <strong>Supervisor:</strong> {row.supervisor}
        </p>
        <p>
          <strong>Observación:</strong> {row.observation || "Sin observaciones"}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new animal admission - matches the model structure
const formSections: SectionConfig[] = [
  {
    id: "animal-admission-info",
    title: "Información de Ingreso de Animales",
    description: "Ingrese los datos del nuevo ingreso de animales",
    fields: [
      {
        id: "date",
        type: "text",
        label: "Fecha",
        name: "date",
        required: true,
        helperText: "Fecha del ingreso de animales"
      },
      {
        id: "quarterLot",
        type: "text",
        label: "Lote de Cuartel",
        name: "quarterLot",
        placeholder: "Ingrese el lote de cuartel",
        required: true,
        helperText: "Lote de cuartel relacionado con el ingreso"
      },
      {
        id: "code",
        type: "text",
        label: "Código",
        name: "code",
        placeholder: "Ingrese el código",
        required: true,
        helperText: "Código de identificación del ingreso"
      },
      {
        id: "area",
        type: "text",
        label: "Área",
        name: "area",
        placeholder: "Ingrese el área",
        required: true,
        helperText: "Área relacionada con el ingreso"
      },
      {
        id: "reviser",
        type: "text",
        label: "Revisor",
        name: "reviser",
        placeholder: "Nombre del revisor",
        required: true,
        helperText: "Persona encargada de revisar el ingreso"
      },
      {
        id: "supervisor",
        type: "text",
        label: "Supervisor",
        name: "supervisor",
        placeholder: "Nombre del supervisor",
        required: true,
        helperText: "Persona encargada de supervisar el ingreso"
      },
      {
        id: "observation",
        type: "textarea",
        label: "Observación",
        name: "observation",
        placeholder: "Ingrese observaciones",
        required: false,
        helperText: "Observaciones adicionales sobre el ingreso"
      },
      {
        id: "supervisorSing",
        type: "text",
        label: "Firma del Supervisor",
        name: "supervisorSing",
        placeholder: "Firma del supervisor",
        required: true,
        helperText: "Firma o identificación del supervisor"
      },
      {
        id: "image1",
        type: "text",
        label: "Imagen 1",
        name: "image1",
        placeholder: "URL de la imagen 1",
        required: false,
        helperText: "URL de la primera imagen relacionada"
      },
      {
        id: "image2",
        type: "text",
        label: "Imagen 2",
        name: "image2",
        placeholder: "URL de la imagen 2",
        required: false,
        helperText: "URL de la segunda imagen relacionada"
      },
      {
        id: "image3",
        type: "text",
        label: "Imagen 3",
        name: "image3",
        placeholder: "URL de la imagen 3",
        required: false,
        helperText: "URL de la tercera imagen relacionada"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: false,
        helperText: "Indica si el ingreso está actualmente activo"
      },
    ],
  }
];

// Form validation schema - matches the model requirements
const formValidationSchema = z.object({
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  quarterLot: z.string().min(1, { message: "El lote de cuartel es obligatorio" }),
  code: z.string().min(1, { message: "El código es obligatorio" }),
  area: z.string().min(1, { message: "El área es obligatoria" }),
  reviser: z.string().min(1, { message: "El revisor es obligatorio" }),
  supervisor: z.string().min(1, { message: "El supervisor es obligatorio" }),
  observation: z.string().optional(),
  supervisorSing: z.string().min(1, { message: "La firma del supervisor es obligatoria" }),
  image1: z.string().optional(),
  image2: z.string().optional(),
  image3: z.string().optional(),
  state: z.boolean().default(true)
});

const AnimalAdmission = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [animalAdmissions, setAnimalAdmissions] = useState<IAnimalAdmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnimalAdmission, setSelectedAnimalAdmission] = useState<IAnimalAdmission | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<IAnimalAdmission> | null>(null);
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
  
  // Fetch animal admissions on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchAnimalAdmissions();
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
  
  // Function to fetch animal admissions data
  const fetchAnimalAdmissions = async () => {
    setIsLoading(true);
    try {
      const data = await animalAdmissionService.findAll();
      // Handle both array format and any potential data property
      setAnimalAdmissions(Array.isArray(data) ? data : (data as any).data || []);
    } catch (error) {
      console.error("Error loading animal admissions:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los ingresos de animales",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new animal admission
  const handleAddAnimalAdmission = async (data: Partial<IAnimalAdmission>) => {
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
        // Create animal admission with associated work
        const result = await createEntityWithWork(pendingData, workAssociationData);

        // Handle enhanced response format
        handleResponseWithFallback(
          result,
          'creation',
          'ANIMAL_ADMISSION',
          "Ingreso de animales creado correctamente"
        );
      } else {
        // Create animal admission without work
        const result = await createEntityWithoutWork(pendingData);

        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'ANIMAL_ADMISSION',
          "Ingreso de animales creado correctamente"
        );
      }

      fetchAnimalAdmissions();
      setShowWorkWizard(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating animal admission with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'ANIMAL_ADMISSION',
        "No se pudo crear el ingreso de animales"
      );
    }
  };

  // Create animal admission without associated work
  const createEntityWithoutWork = async (data: Partial<IAnimalAdmission>) => {
    await animalAdmissionService.createAnimalAdmission(data);
  };

  // Create animal admission with associated work
  const createEntityWithWork = async (
    entityData: Partial<IAnimalAdmission>,
    workAssociationData: WorkAssociationData
  ) => {
    // Create work with entity using the new endpoint
    const result = await workService.createWorkWithEntity(
      "ANIMAL_ADMISSION",
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
        'ANIMAL_ADMISSION',
        "Ingreso de animales creado correctamente"
      );

      fetchAnimalAdmissions();
      setShowConfirmation(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating animal admission:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'ANIMAL_ADMISSION',
        "No se pudo crear el ingreso de animales"
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
  
  // Function to handle updating an animal admission
  const handleUpdateAnimalAdmission = async (id: string | number, data: Partial<IAnimalAdmission>) => {
    try {
      const result = await animalAdmissionService.updateAnimalAdmission(id, data);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'ANIMAL_ADMISSION',
        "Ingreso de animales actualizado correctamente"
      );

      fetchAnimalAdmissions();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedAnimalAdmission(null);
    } catch (error) {
      console.error(`Error updating animal admission ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'ANIMAL_ADMISSION',
        "No se pudo actualizar el ingreso de animales"
      );
    }
  };
  
  // Function to handle deleting an animal admission (soft delete)
  const handleDeleteAnimalAdmission = async (id: string | number) => {
    if (confirm("¿Está seguro de que desea eliminar este ingreso de animales?")) {
      try {
        await animalAdmissionService.softDeleteAnimalAdmission(id);
        
        toast({
          title: "Éxito",
          description: "Ingreso de animales eliminado correctamente",
        });
        
        // Refresh the data
        await fetchAnimalAdmissions();
      } catch (error) {
        console.error("Error deleting animal admission:", error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el ingreso de animales",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle form submission based on mode (add/edit)
  const handleFormSubmit = (data: Partial<IAnimalAdmission>) => {
    if (isEditMode && selectedAnimalAdmission?._id) {
      handleUpdateAnimalAdmission(selectedAnimalAdmission._id, data);
    } else {
      handleAddAnimalAdmission(data);
    }
  };
  
  // Handle edit button click
  const handleEditClick = (animalAdmission: IAnimalAdmission) => {
    setSelectedAnimalAdmission(animalAdmission);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: IAnimalAdmission) => (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleEditClick(row);
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteAnimalAdmission(row._id as string);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Ingreso de Animales</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedAnimalAdmission(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Ingreso
        </Button>
      </div>

      <Grid
        data={animalAdmissions}
        columns={[...columns, { 
          id: "actions", 
          header: "Acciones", 
          accessor: "", 
          visible: true,
          sortable: false,
          render: renderActions 
        }]}
        gridId="animalAdmission"
        expandableContent={expandableContent}
      />

      {/* Dialog for add/edit animal admission */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Ingreso de Animales" : "Agregar Nuevo Ingreso de Animales"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Actualice los detalles del ingreso de animales seleccionado"
                : "Complete el formulario para agregar un nuevo ingreso de animales"}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedAnimalAdmission ? {
              date: selectedAnimalAdmission.date,
              quarterLot: selectedAnimalAdmission.quarterLot,
              code: selectedAnimalAdmission.code,
              area: selectedAnimalAdmission.area,
              reviser: selectedAnimalAdmission.reviser,
              supervisor: selectedAnimalAdmission.supervisor,
              observation: selectedAnimalAdmission.observation,
              supervisorSing: selectedAnimalAdmission.supervisorSing,
              image1: selectedAnimalAdmission.image1,
              image2: selectedAnimalAdmission.image2,
              image3: selectedAnimalAdmission.image3,
              state: selectedAnimalAdmission.state
            } : {
              state: true,
            }}
          />

          <DialogFooter className="mt-6">
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
              ¿Está seguro que desea crear el ingreso de animales sin asociar un trabajo?
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
              entityType="animalAdmission"
              entityData={{
                id: "new-animal-admission"
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

export default AnimalAdmission; 