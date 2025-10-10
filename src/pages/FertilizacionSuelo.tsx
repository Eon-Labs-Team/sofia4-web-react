import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import Grid from "@/components/Grid/Grid";
import { Column } from "@/lib/store/gridStore";
import DynamicForm, { FieldType, SectionConfig } from "@/components/DynamicForm/DynamicForm";
import { ISoilFertilization } from "@eon-lib/eon-mongoose/types";
import soilFertilizationService from "@/_services/soilFertilizationService";
import { Plus, Edit, Trash2 } from "lucide-react";
import * as z from "zod";
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

// Helper function to render the state
const renderState = (value: boolean) => (
  <span className={value ? "text-green-600" : "text-red-600"}>
    {value ? "Activo" : "Inactivo"}
  </span>
);

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
    id: "property",
    header: "Propiedad",
    accessor: "property",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "dateFertilization",
    header: "Fecha de Fertilización",
    accessor: "dateFertilization",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "classification",
    header: "Clasificación",
    accessor: "classification",
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
    id: "depth",
    header: "Profundidad",
    accessor: "depth",
    visible: true,
    sortable: true,
  },
  {
    id: "texture",
    header: "Textura",
    accessor: "texture",
    visible: true,
    sortable: true,
  },
  {
    id: "nitrogen",
    header: "Nitrógeno",
    accessor: "nitrogen",
    visible: true,
    sortable: true,
  },
  {
    id: "phosphorus",
    header: "Fósforo",
    accessor: "phosphorus",
    visible: true,
    sortable: true,
  },
  {
    id: "potassium",
    header: "Potasio",
    accessor: "potassium",
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
    <h3 className="text-lg font-semibold mb-2">{row.property} - Cuartel: {row.barracks}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p><strong>Fecha de Fertilización:</strong> {row.dateFertilization}</p>
        <p><strong>Clasificación:</strong> {row.classification}</p>
        <p><strong>Profundidad:</strong> {row.depth}</p>
        <p><strong>Textura:</strong> {row.texture}</p>
      </div>
      <div>
        <p><strong>Nitrógeno:</strong> {row.nitrogen}</p>
        <p><strong>Fósforo:</strong> {row.phosphorus}</p>
        <p><strong>Potasio:</strong> {row.potassium}</p>
        <p><strong>Calcio:</strong> {row.calcium}</p>
        <p><strong>Manganeso:</strong> {row.manganese}</p>
      </div>
      <div>
        <p><strong>PH Agua:</strong> {row.phWater}</p>
        <p><strong>Cobre:</strong> {row.copper}</p>
        <p><strong>Zinc:</strong> {row.zinc}</p>
        <p><strong>Boro:</strong> {row.boron}</p>
        <p><strong>CE:</strong> {row.ce}</p>
        <p><strong>CIC:</strong> {row.cic}</p>
        <p><strong>MO:</strong> {row.mo}</p>
      </div>
    </div>
    {row.observation && (
      <div className="mt-4">
        <p><strong>Observación:</strong> {row.observation}</p>
      </div>
    )}
  </div>
);

// Validation schema for the form
const formValidationSchema = z.object({
  property: z.string().min(1, { message: "La propiedad es requerida" }),
  dateFertilization: z.string().min(1, { message: "La fecha de fertilización es requerida" }),
  classification: z.string().min(1, { message: "La clasificación es requerida" }),
  barracks: z.string().min(1, { message: "El cuartel es requerido" }),
  depth: z.string().min(1, { message: "La profundidad es requerida" }),
  texture: z.string().min(1, { message: "La textura es requerida" }),
  nitrogen: z.number().optional(),
  phosphorus: z.number().optional(),
  potassium: z.number().optional(),
  calcium: z.number().optional(),
  manganese: z.number().optional(),
  phWater: z.number().optional(),
  copper: z.number().optional(),
  zinc: z.number().optional(),
  boron: z.number().optional(),
  ce: z.number().optional(),
  cic: z.number().optional(),
  mo: z.number().optional(),
  observation: z.string().optional(),
  state: z.boolean().default(true)
});

// Form sections configuration
const formSections: SectionConfig[] = [
  {
    id: "section-general",
    title: "Información General",
    description: "Datos generales de la fertilización",
    fields: [
      {
        id: "property",
        type: "text" as FieldType,
        label: "Propiedad",
        name: "property",
        placeholder: "Ingrese el nombre de la propiedad",
        required: true
      },
      {
        id: "dateFertilization",
        type: "text" as FieldType,
        label: "Fecha de Fertilización",
        name: "dateFertilization",
        required: true
      },
      {
        id: "classification",
        type: "text" as FieldType,
        label: "Clasificación",
        name: "classification",
        placeholder: "Ingrese la clasificación",
        required: true
      },
      {
        id: "barracks",
        type: "text" as FieldType,
        label: "Cuartel",
        name: "barracks",
        placeholder: "Ingrese el cuartel",
        required: true
      },
      {
        id: "depth",
        type: "text" as FieldType,
        label: "Profundidad",
        name: "depth",
        placeholder: "Ingrese la profundidad",
        required: true
      },
      {
        id: "texture",
        type: "text" as FieldType,
        label: "Textura",
        name: "texture",
        placeholder: "Ingrese la textura",
        required: true
      }
    ]
  },
  {
    id: "section-nutrients",
    title: "Nutrientes",
    description: "Información sobre los nutrientes",
    fields: [
      {
        id: "nitrogen",
        type: "number" as FieldType,
        label: "Nitrógeno",
        name: "nitrogen",
        placeholder: "Ingrese el valor de nitrógeno",
        step: 0.01
      },
      {
        id: "phosphorus",
        type: "number" as FieldType,
        label: "Fósforo",
        name: "phosphorus",
        placeholder: "Ingrese el valor de fósforo",
        step: 0.01
      },
      {
        id: "potassium",
        type: "number" as FieldType,
        label: "Potasio",
        name: "potassium",
        placeholder: "Ingrese el valor de potasio",
        step: 0.01
      },
      {
        id: "calcium",
        type: "number" as FieldType,
        label: "Calcio",
        name: "calcium",
        placeholder: "Ingrese el valor de calcio",
        step: 0.01
      },
      {
        id: "manganese",
        type: "number" as FieldType,
        label: "Manganeso",
        name: "manganese",
        placeholder: "Ingrese el valor de manganeso",
        step: 0.01
      }
    ]
  },
  {
    id: "section-additional",
    title: "Datos Adicionales",
    description: "Información adicional sobre la fertilización",
    fields: [
      {
        id: "phWater",
        type: "number" as FieldType,
        label: "PH Agua",
        name: "phWater",
        placeholder: "Ingrese el valor de PH Agua",
        step: 0.01
      },
      {
        id: "copper",
        type: "number" as FieldType,
        label: "Cobre",
        name: "copper",
        placeholder: "Ingrese el valor de cobre",
        step: 0.01
      },
      {
        id: "zinc",
        type: "number" as FieldType,
        label: "Zinc",
        name: "zinc",
        placeholder: "Ingrese el valor de zinc",
        step: 0.01
      },
      {
        id: "boron",
        type: "number" as FieldType,
        label: "Boro",
        name: "boron",
        placeholder: "Ingrese el valor de boro",
        step: 0.01
      },
      {
        id: "ce",
        type: "number" as FieldType,
        label: "CE",
        name: "ce",
        placeholder: "Ingrese el valor de CE",
        step: 0.01
      },
      {
        id: "cic",
        type: "number" as FieldType,
        label: "CIC",
        name: "cic",
        placeholder: "Ingrese el valor de CIC",
        step: 0.01
      },
      {
        id: "mo",
        type: "number" as FieldType,
        label: "MO",
        name: "mo",
        placeholder: "Ingrese el valor de MO",
        step: 0.01
      },
      {
        id: "observation",
        type: "textarea" as FieldType,
        label: "Observación",
        name: "observation",
        placeholder: "Ingrese observaciones adicionales",
        rows: 3
      },
      {
        id: "state",
        type: "checkbox" as FieldType,
        label: "Estado Activo",
        name: "state",
        required: true,
        helperText: "Indica si está en estado activo"
      }
    ]
  }
];

const FertilizacionSuelo = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [soilFertilizations, setSoilFertilizations] = useState<ISoilFertilization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSoilFertilization, setSelectedSoilFertilization] = useState<ISoilFertilization | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingSoilFertilizationData, setPendingSoilFertilizationData] = useState<Partial<ISoilFertilization> | null>(null);
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

  // Fetch soil fertilizations on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchSoilFertilizations();
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
  
  // Function to fetch soil fertilizations data
  const fetchSoilFertilizations = async () => {
    setIsLoading(true);
    try {
      const response = await soilFertilizationService.findAll();
      // Handle both formats: array of items or { data: items[] }
      const data = response && typeof response === 'object' && 'data' in response 
        ? response.data as ISoilFertilization[]
        : Array.isArray(response) ? response as ISoilFertilization[] : [] as ISoilFertilization[];
      setSoilFertilizations(data);
    } catch (error) {
      console.error("Error loading soil fertilizations:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new soil fertilization
  const handleAddSoilFertilization = async (data: Partial<ISoilFertilization>) => {
    // Store the data and show the work association question
    setPendingSoilFertilizationData(data);
    setIsDialogOpen(false);
    setShowWorkQuestion(true);
  };

  // Function to handle work association completion
  const handleWorkAssociation = async (workAssociationData: WorkAssociationData) => {
    try {
      if (!pendingSoilFertilizationData) return;

      if (workAssociationData.associateWork) {
        // Create soil fertilization with associated work
        const result = await createSoilFertilizationWithWork(pendingSoilFertilizationData, workAssociationData);

        // Handle enhanced response format
        handleResponseWithFallback(
          result,
          'creation',
          'SOIL_FERTILIZATION',
          "Fertilización de suelo creada correctamente"
        );
      } else {
        // Create soil fertilization without work
        const result = await createSoilFertilizationWithoutWork(pendingSoilFertilizationData);

        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'SOIL_FERTILIZATION',
          "Fertilización de suelo creada correctamente"
        );
      }

      fetchSoilFertilizations();
      setShowWorkWizard(false);
      setPendingSoilFertilizationData(null);

    } catch (error) {
      console.error("Error creating soil fertilization with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'SOIL_FERTILIZATION',
        "No se pudo crear la fertilización de suelo"
      );
    }
  };

  // Create soil fertilization without associated work
  const createSoilFertilizationWithoutWork = async (data: Partial<ISoilFertilization>) => {
    await soilFertilizationService.createSoilFertilization(data);
  };

  // Create soil fertilization with associated work
  const createSoilFertilizationWithWork = async (
    soilFertilizationData: Partial<ISoilFertilization>,
    workAssociationData: WorkAssociationData
  ) => {
    // Create work with entity using the new endpoint
    const result = await workService.createWorkWithEntity(
      "SOIL_FERTILIZATION",
      soilFertilizationData,
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
      if (!pendingSoilFertilizationData) return;

      const result = await createSoilFertilizationWithoutWork(pendingSoilFertilizationData);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'creation',
        'SOIL_FERTILIZATION',
        "Fertilización de suelo creada correctamente"
      );

      fetchSoilFertilizations();
      setShowConfirmation(false);
      setPendingSoilFertilizationData(null);

    } catch (error) {
      console.error("Error creating soil fertilization:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'SOIL_FERTILIZATION',
        "No se pudo crear la fertilización de suelo"
      );
    }
  };

  // Function to handle work wizard cancellation
  const handleWorkWizardCancel = () => {
    setShowWorkWizard(false);
    setPendingSoilFertilizationData(null);
  };

  // Function to cancel all operations
  const handleCancelAll = () => {
    setShowWorkQuestion(false);
    setShowWorkWizard(false);
    setShowConfirmation(false);
    setPendingSoilFertilizationData(null);
  };
  
  // Function to handle updating a soil fertilization
  const handleUpdateSoilFertilization = async (id: string | number, data: Partial<ISoilFertilization>) => {
    try {
      const result = await soilFertilizationService.updateSoilFertilization(id, data);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'SOIL_FERTILIZATION',
        "Fertilización de suelo actualizada correctamente"
      );

      await fetchSoilFertilizations();
      setIsDialogOpen(false);
    } catch (error) {
      console.error(`Error updating soil fertilization ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'SOIL_FERTILIZATION',
        "No se pudo actualizar la fertilización de suelo"
      );
    }
  };
  
  // Function to handle deleting a soil fertilization
  const handleDeleteSoilFertilization = async (id: string | number) => {
    try {
      await soilFertilizationService.softDeleteSoilFertilization(id);
      await fetchSoilFertilizations();
      toast({
        title: "Fertilización eliminada",
        description: "El registro de fertilización ha sido eliminado exitosamente.",
      });
    } catch (error) {
      console.error(`Error deleting soil fertilization ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro de fertilización. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission based on mode (create or edit)
  const handleFormSubmit = (data: Partial<ISoilFertilization>) => {
    if (isEditMode && selectedSoilFertilization && selectedSoilFertilization._id) {
      handleUpdateSoilFertilization(selectedSoilFertilization._id, data);
    } else {
      handleAddSoilFertilization(data);
    }
  };

  // Function to handle edit button click
  const handleEditClick = (soilFertilization: ISoilFertilization) => {
    setSelectedSoilFertilization(soilFertilization);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: ISoilFertilization) => {
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
              handleDeleteSoilFertilization(row._id);
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
        <h1 className="text-3xl font-bold">Fertilización de Suelo</h1>
        <Button onClick={() => {
          setSelectedSoilFertilization(null);
          setIsEditMode(false);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Fertilización
        </Button>
      </div>

      {/* Grid using Zustand store with actual data or loading state */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Cargando registros de fertilización...</p>
        </div>
      ) : (
        <Grid
          data={soilFertilizations}
          columns={columns}
          title="Fertilizaciones de Suelo"
          expandableContent={expandableContent}
          gridId="soilFertilizations"
          actions={renderActions}
        />
      )}

      {/* Dialog for adding or editing a soil fertilization */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Fertilización de Suelo" : "Añadir Nueva Fertilización de Suelo"}</DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique el formulario para actualizar el registro de fertilización."
                : "Complete el formulario para añadir un nuevo registro de fertilización al sistema."
              }
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            validationSchema={formValidationSchema}
            defaultValues={
              isEditMode && selectedSoilFertilization
                ? {
                    property: selectedSoilFertilization.property,
                    dateFertilization: selectedSoilFertilization.dateFertilization,
                    classification: selectedSoilFertilization.classification,
                    barracks: selectedSoilFertilization.barracks,
                    depth: selectedSoilFertilization.depth,
                    texture: selectedSoilFertilization.texture,
                    nitrogen: selectedSoilFertilization.nitrogen,
                    phosphorus: selectedSoilFertilization.phosphorus,
                    potassium: selectedSoilFertilization.potassium,
                    calcium: selectedSoilFertilization.calcium,
                    manganese: selectedSoilFertilization.manganese,
                    phWater: selectedSoilFertilization.phWater,
                    copper: selectedSoilFertilization.copper,
                    zinc: selectedSoilFertilization.zinc,
                    boron: selectedSoilFertilization.boron,
                    ce: selectedSoilFertilization.ce,
                    cic: selectedSoilFertilization.cic,
                    mo: selectedSoilFertilization.mo,
                    observation: selectedSoilFertilization.observation,
                    state: selectedSoilFertilization.state,
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
              ¿Está seguro que desea crear la fertilización de suelo sin asociar un trabajo?
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

          {showWorkWizard && pendingSoilFertilizationData && (
            <WorkAssociationWizard
              entityType="fertilizacionSuelo"
              entityData={{
                id: "new-soil-fertilization"
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

export default FertilizacionSuelo; 