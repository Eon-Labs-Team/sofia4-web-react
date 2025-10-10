import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Zap,
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
import { z } from "zod";
import { IElectricityConsumption } from "@eon-lib/eon-mongoose/types";
import electricityConsumptionService from "@/_services/electricityConsumptionService";
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
    id: "meterNumber",
    header: "Número de Medidor",
    accessor: "meterNumber",
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
    id: "quantity",
    header: "Cantidad",
    accessor: "quantity",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "unit",
    header: "Unidad",
    accessor: "unit",
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
    <h3 className="text-lg font-semibold mb-2">Consumo de Luz</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Número de Medidor:</strong> {row.meterNumber}
        </p>
        <p>
          <strong>Fecha:</strong> {row.date}
        </p>
      </div>
      <div>
        <p>
          <strong>Cantidad:</strong> {row.quantity}
        </p>
        <p>
          <strong>Unidad:</strong> {row.unit}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new electricity consumption record
const formSections: SectionConfig[] = [
  {
    id: "electricity-consumption-info",
    title: "Información del Consumo de Luz",
    description: "Ingrese los datos del nuevo registro de consumo de luz",
    fields: [
      {
        id: "meterNumber",
        type: "text",
        label: "Número de Medidor",
        name: "meterNumber",
        placeholder: "Número del medidor",
        required: true,
        helperText: "Ingrese el número identificativo del medidor"
      },
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        required: true,
        helperText: "Fecha del registro"
      },
      {
        id: "quantity",
        type: "number",
        label: "Cantidad",
        name: "quantity",
        placeholder: "Cantidad de consumo",
        required: true,
        helperText: "Ingrese la cantidad consumida"
      },
      {
        id: "unit",
        type: "text",
        label: "Unidad",
        name: "unit",
        placeholder: "Ej: kWh",
        required: true,
        helperText: "Unidad de medida"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el registro está actualmente activo"
      },
    ],
  }
];

// Form validation schema
const formValidationSchema = z.object({
  meterNumber: z.string().min(1, { message: "El número de medidor es obligatorio" }),
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  quantity: z.number().min(0, { message: "La cantidad debe ser un número positivo" }),
  unit: z.string().min(1, { message: "La unidad es obligatoria" }),
  state: z.boolean().default(true)
});

interface ApiResponse<T> {
  data: T;
}

const ElectricityConsumption = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [electricityConsumptionData, setElectricityConsumptionData] = useState<IElectricityConsumption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IElectricityConsumption | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<IElectricityConsumption> | null>(null);
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
  
  // Fetch electricity consumption data on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchElectricityConsumptionData();
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
  
  // Function to fetch electricity consumption data
  const fetchElectricityConsumptionData = async () => {
    setIsLoading(true);
    try {
      const response = await electricityConsumptionService.findAll();
      // Handle the response which may come as { data: [...] } or directly as an array
      const data = Array.isArray(response) ? response : (response as unknown as ApiResponse<IElectricityConsumption[]>).data;
      setElectricityConsumptionData(data || []);
    } catch (error) {
      console.error("Error loading electricity consumption data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de consumo de luz",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new electricity consumption record
  const handleAddElectricityConsumption = async (data: Partial<IElectricityConsumption>) => {
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
        // Create electricity consumption with associated work
        const result = await createEntityWithWork(pendingData, workAssociationData);

        // Handle enhanced response format
        handleResponseWithFallback(
          result,
          'creation',
          'ELECTRICITY_CONSUMPTION',
          "Registro de consumo de luz creado correctamente"
        );
      } else {
        // Create electricity consumption without work
        const result = await createEntityWithoutWork(pendingData);

        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'ELECTRICITY_CONSUMPTION',
          "Registro de consumo de luz creado correctamente"
        );
      }

      fetchElectricityConsumptionData();
      setShowWorkWizard(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating electricity consumption with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'ELECTRICITY_CONSUMPTION',
        "No se pudo crear el registro de consumo de luz"
      );
    }
  };

  // Create electricity consumption without associated work
  const createEntityWithoutWork = async (data: Partial<IElectricityConsumption>) => {
    await electricityConsumptionService.createElectricityConsumption(data);
  };

  // Create electricity consumption with associated work
  const createEntityWithWork = async (
    entityData: Partial<IElectricityConsumption>,
    workAssociationData: WorkAssociationData
  ) => {
    // Create work with entity using the new endpoint
    const result = await workService.createWorkWithEntity(
      "ELECTRICITY_CONSUMPTION",
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
        'ELECTRICITY_CONSUMPTION',
        "Registro de consumo de luz creado correctamente"
      );

      fetchElectricityConsumptionData();
      setShowConfirmation(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating electricity consumption:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'ELECTRICITY_CONSUMPTION',
        "No se pudo crear el registro de consumo de luz"
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
  
  // Function to handle updating an electricity consumption record
  const handleUpdateElectricityConsumption = async (id: string | number, data: Partial<IElectricityConsumption>) => {
    try {
      const result = await electricityConsumptionService.updateElectricityConsumption(id, data);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'ELECTRICITY_CONSUMPTION',
        "Registro de consumo de luz actualizado correctamente"
      );

      fetchElectricityConsumptionData();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error(`Error updating electricity consumption ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'ELECTRICITY_CONSUMPTION',
        "No se pudo actualizar el registro de consumo de luz"
      );
    }
  };
  
  // Function to handle deleting an electricity consumption record
  const handleDeleteElectricityConsumption = async (id: string | number) => {
    try {
      await electricityConsumptionService.softDeleteElectricityConsumption(id);
      await fetchElectricityConsumptionData();
      toast({
        title: "Éxito",
        description: "Registro de consumo de luz eliminado correctamente",
      });
    } catch (error) {
      console.error("Error deleting electricity consumption record:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro de consumo de luz",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IElectricityConsumption>) => {
    if (isEditMode && selectedRecord) {
      handleUpdateElectricityConsumption(selectedRecord._id, data);
    } else {
      handleAddElectricityConsumption(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (record: IElectricityConsumption) => {
    setSelectedRecord(record);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render actions for each row
  const renderActions = (row: IElectricityConsumption) => (
    <div className="flex items-center space-x-2">
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
          handleDeleteElectricityConsumption(row._id);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Consumo de Luz</h1>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedRecord(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Consumo de Luz
        </Button>
      </div>

      <Grid
        columns={columns}
        data={electricityConsumptionData}
        expandableContent={expandableContent}
        actions={renderActions}
        gridId="electricity-consumption-grid"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar" : "Agregar"} Consumo de Luz
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Actualice los datos del registro de consumo de luz seleccionado"
                : "Complete el formulario para agregar un nuevo registro de consumo de luz"}
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            validationSchema={formValidationSchema}
            defaultValues={selectedRecord || undefined}
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
              ¿Está seguro que desea crear el registro de consumo de luz sin asociar un trabajo?
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
              entityType="electricityConsumption"
              entityData={{
                id: "new-electricity-consumption"
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

export default ElectricityConsumption; 