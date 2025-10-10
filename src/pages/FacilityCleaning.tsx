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
  Droplets,
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
import { IFacilityCleaningRecord } from "@eon-lib/eon-mongoose/types";
import facilityCleaningService from "@/_services/facilityCleaningService";
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
    id: "reviewDate",
    header: "Fecha de Revisión",
    accessor: "reviewDate",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "reviewTime",
    header: "Hora de Revisión",
    accessor: "reviewTime",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "facility",
    header: "Instalación",
    accessor: "facility",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "identification",
    header: "Identificación",
    accessor: "identification",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "facilityType",
    header: "Tipo de Instalación",
    accessor: "facilityType",
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
    id: "numberOfPeople",
    header: "Número de Personas",
    accessor: "numberOfPeople",
    visible: true,
    sortable: true,
  },
  {
    id: "status",
    header: "Estado",
    accessor: "status",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "cleaningMethod",
    header: "Método de Limpieza",
    accessor: "cleaningMethod",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "responsiblePerson",
    header: "Persona Responsable",
    accessor: "responsiblePerson",
    visible: true,
    sortable: true,
    groupable: true,
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
    header: "Estado Activo",
    accessor: "state",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderState,
  }
];

// Form configuration for adding new facility cleaning record - matches exactly the model structure
const formSections: SectionConfig[] = [
  {
    id: "facility-cleaning-info",
    title: "Información de Limpieza de Instalación",
    description: "Ingrese los datos de limpieza de instalación",
    fields: [
      {
        id: "reviewDate",
        type: "date",
        label: "Fecha de Revisión",
        name: "reviewDate",
        required: true,
        helperText: "Fecha en que se realizó la limpieza"
      },
      {
        id: "reviewTime",
        type: "text",
        label: "Hora de Revisión",
        name: "reviewTime",
        required: true,
        helperText: "Hora en que se realizó la limpieza"
      },
      {
        id: "facility",
        type: "text",
        label: "Instalación",
        name: "facility",
        placeholder: "Nombre de la instalación",
        required: true,
        helperText: "Nombre de la instalación limpiada"
      },
      {
        id: "identification",
        type: "text",
        label: "Identificación",
        name: "identification",
        placeholder: "Código o identificador",
        required: true,
        helperText: "Identificador único de la instalación"
      },
      {
        id: "facilityType",
        type: "text",
        label: "Tipo de Instalación",
        name: "facilityType",
        placeholder: "Ej: Oficina, Bodega, Baño",
        required: true,
        helperText: "Tipo de instalación limpiada"
      },
      {
        id: "location",
        type: "text",
        label: "Ubicación",
        name: "location",
        placeholder: "Ubicación de la instalación",
        required: true,
        helperText: "Ubicación física de la instalación"
      },
      {
        id: "numberOfPeople",
        type: "number",
        label: "Número de Personas",
        name: "numberOfPeople",
        placeholder: "0",
        required: true,
        helperText: "Cantidad de personas que utilizan la instalación"
      },
      {
        id: "status",
        type: "text",
        label: "Estado",
        name: "status",
        placeholder: "Estado de la instalación",
        required: true,
        helperText: "Estado actual de la instalación"
      },
      {
        id: "cleaningMethod",
        type: "text",
        label: "Método de Limpieza",
        name: "cleaningMethod",
        placeholder: "Ej: Detergente, Desinfección",
        required: true,
        helperText: "Método utilizado para la limpieza"
      },
      {
        id: "responsiblePerson",
        type: "text",
        label: "Persona Responsable",
        name: "responsiblePerson",
        placeholder: "Nombre del responsable",
        required: true,
        helperText: "Persona responsable de realizar la limpieza"
      },
      {
        id: "observations",
        type: "textarea",
        label: "Observaciones",
        name: "observations",
        placeholder: "Observaciones adicionales",
        required: true,
        helperText: "Observaciones o notas adicionales"
      },
    ],
  },
  {
    id: "images-section",
    title: "Imágenes",
    description: "Ingrese las imágenes de la limpieza",
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

// Form validation schema - matches exactly the model requirements
const formValidationSchema = z.object({
  reviewDate: z.string().min(1, { message: "La fecha de revisión es obligatoria" }),
  reviewTime: z.string().min(1, { message: "La hora de revisión es obligatoria" }),
  facility: z.string().min(1, { message: "La instalación es obligatoria" }),
  identification: z.string().min(1, { message: "La identificación es obligatoria" }),
  facilityType: z.string().min(1, { message: "El tipo de instalación es obligatorio" }),
  location: z.string().min(1, { message: "La ubicación es obligatoria" }),
  numberOfPeople: z.coerce.number().min(0, { message: "El número de personas debe ser positivo" }),
  status: z.string().min(1, { message: "El estado es obligatorio" }),
  cleaningMethod: z.string().min(1, { message: "El método de limpieza es obligatorio" }),
  responsiblePerson: z.string().min(1, { message: "La persona responsable es obligatoria" }),
  observations: z.string().min(1, { message: "Las observaciones son obligatorias" }),
  image1: z.string().min(1, { message: "La imagen 1 es obligatoria" }),
  image2: z.string().min(1, { message: "La imagen 2 es obligatoria" }),
  image3: z.string().min(1, { message: "La imagen 3 es obligatoria" }),
  state: z.boolean().default(true)
});

const FacilityCleaning = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [facilityCleaningRecords, setFacilityCleaningRecords] = useState<IFacilityCleaningRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IFacilityCleaningRecord | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<IFacilityCleaningRecord> | null>(null);
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
  
  // Fetch facility cleaning records on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchFacilityCleaningRecords();
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
  
  // Function to fetch facility cleaning records data
  const fetchFacilityCleaningRecords = async () => {
    setIsLoading(true);
    try {
      const data = await facilityCleaningService.findAll();
      setFacilityCleaningRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading facility cleaning records:", error);
      // Usar datos de ejemplo en caso de fallo de API
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new facility cleaning record
  const handleAdd = async (data: Partial<IFacilityCleaningRecord>) => {
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
        // Create facility cleaning with associated work
        const result = await createEntityWithWork(pendingData, workAssociationData);

        // Handle enhanced response format
        handleResponseWithFallback(
          result,
          'creation',
          'FACILITY_CLEANING_RECORD',
          "Registro de limpieza creado correctamente"
        );
      } else {
        // Create facility cleaning without work
        const result = await createEntityWithoutWork(pendingData);

        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'FACILITY_CLEANING_RECORD',
          "Registro de limpieza creado correctamente"
        );
      }

      fetchFacilityCleaningRecords();
      setShowWorkWizard(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating facility cleaning with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'FACILITY_CLEANING_RECORD',
        "No se pudo crear el registro de limpieza"
      );
    }
  };

  // Create facility cleaning without associated work
  const createEntityWithoutWork = async (data: Partial<IFacilityCleaningRecord>) => {
    await facilityCleaningService.createFacilityCleaningRecord(data);
  };

  // Create facility cleaning with associated work
  const createEntityWithWork = async (
    entityData: Partial<IFacilityCleaningRecord>,
    workAssociationData: WorkAssociationData
  ) => {
    // Create work with entity using the new endpoint
    const result = await workService.createWorkWithEntity(
      "FACILITY_CLEANING_RECORD",
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
        'FACILITY_CLEANING_RECORD',
        "Registro de limpieza creado correctamente"
      );

      fetchFacilityCleaningRecords();
      setShowConfirmation(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating facility cleaning:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'FACILITY_CLEANING_RECORD',
        "No se pudo crear el registro de limpieza"
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

  // Function to handle updating an existing facility cleaning record
  const handleUpdate = async (id: string | number, data: Partial<IFacilityCleaningRecord>) => {
    try {
      const result = await facilityCleaningService.updateFacilityCleaningRecord(id, data);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'FACILITY_CLEANING_RECORD',
        "Registro de limpieza actualizado correctamente"
      );

      fetchFacilityCleaningRecords();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error(`Error updating facility cleaning record ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'FACILITY_CLEANING_RECORD',
        "No se pudo actualizar el registro de limpieza"
      );
    }
  };

  // Function to handle deleting a facility cleaning record
  const handleDeleteFacilityCleaningRecord = async (id: string | number) => {
    try {
      await facilityCleaningService.softDeleteFacilityCleaningRecord(id);
      setFacilityCleaningRecords((prevRecords) => prevRecords.filter((record) => record._id !== id));
      toast({
        title: "Registro eliminado",
        description: "El registro ha sido eliminado exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting facility cleaning record:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission based on mode (create or edit)
  const handleFormSubmit = (data: Partial<IFacilityCleaningRecord>) => {
    if (isEditMode && selectedRecord && selectedRecord._id) {
      handleUpdate(selectedRecord._id, data);
    } else {
      handleAdd(data);
    }
  };

  // Function to handle edit button click
  const handleEditClick = (record: IFacilityCleaningRecord) => {
    setSelectedRecord(record);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: IFacilityCleaningRecord) => {
    return (
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick(row);
          }}
          title="Editar"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            if (row._id) {
              handleDeleteFacilityCleaningRecord(row._id);
            }
          }}
          title="Eliminar"
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Limpieza de Instalaciones</h1>
        <Button onClick={() => {
          setSelectedRecord(null);
          setIsEditMode(false);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Limpieza
        </Button>
      </div>

      {/* Grid using Zustand store with actual data or loading state */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Cargando registros de limpieza...</p>
        </div>
      ) : (
        <Grid
          data={facilityCleaningRecords}
          columns={columns}
          title="Limpieza de Instalaciones"
          gridId="facility-cleaning"
          actions={renderActions}
        />
      )}

      {/* Dialog for adding or editing a facility cleaning record */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Registro" : "Agregar Nuevo Registro"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique el formulario para actualizar el registro."
                : "Complete el formulario para añadir un nuevo registro de limpieza de instalación."
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
                    reviewDate: selectedRecord.reviewDate,
                    reviewTime: selectedRecord.reviewTime,
                    facility: selectedRecord.facility,
                    identification: selectedRecord.identification,
                    facilityType: selectedRecord.facilityType,
                    location: selectedRecord.location,
                    numberOfPeople: selectedRecord.numberOfPeople,
                    status: selectedRecord.status,
                    cleaningMethod: selectedRecord.cleaningMethod,
                    responsiblePerson: selectedRecord.responsiblePerson,
                    observations: selectedRecord.observations,
                    image1: selectedRecord.image1,
                    image2: selectedRecord.image2,
                    image3: selectedRecord.image3,
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
              ¿Está seguro que desea crear el registro de limpieza sin asociar un trabajo?
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
              entityType="facilityCleaning"
              entityData={{
                id: "new-facility-cleaning"
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

export default FacilityCleaning; 