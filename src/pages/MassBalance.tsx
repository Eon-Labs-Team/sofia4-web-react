import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Scale,
} from "lucide-react";
import { Column } from "@/lib/store/gridStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DynamicForm, {
  SectionConfig,
} from "@/components/DynamicForm/DynamicForm";
import { z } from "zod";
import { IMassBalance } from "@eon-lib/eon-mongoose/types";
import massBalanceService from "@/_services/massBalanceService";
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
    id: "period",
    header: "Periodo",
    accessor: "period",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "harvestFormat",
    header: "Formato Cosecha",
    accessor: "harvestFormat",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "packagingFormat",
    header: "Formato Embalaje",
    accessor: "packagingFormat",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "plants",
    header: "Plantas",
    accessor: "plants",
    visible: true,
    sortable: true,
  },
  {
    id: "hectares",
    header: "Hectáreas",
    accessor: "hectares",
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
    <h3 className="text-lg font-semibold mb-2">Balance de Masa - {row.period}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Formato Cosecha:</strong> {row.harvestFormat}
        </p>
        <p>
          <strong>Formato Embalaje:</strong> {row.packagingFormat}
        </p>
      </div>
      <div>
        <p>
          <strong>Plantas:</strong> {row.plants}
        </p>
        <p>
          <strong>Hectáreas:</strong> {row.hectares}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new mass balance
const formSections: SectionConfig[] = [
  {
    id: "mass-balance-info",
    title: "Información del Balance de Masa",
    description: "Ingrese los datos del nuevo balance de masa",
    fields: [
      {
        id: "period",
        type: "text",
        label: "Periodo",
        name: "period",
        placeholder: "Ej: 2023-2024",
        required: true,
        helperText: "Ingrese el periodo del balance de masa"
      },
      {
        id: "harvestFormat",
        type: "text",
        label: "Formato Cosecha",
        name: "harvestFormat",
        placeholder: "Ej: Bin, Caja",
        required: true,
        helperText: "Formato utilizado para la cosecha"
      },
      {
        id: "packagingFormat",
        type: "text",
        label: "Formato Embalaje",
        name: "packagingFormat",
        placeholder: "Ej: Caja, Granel",
        required: true,
        helperText: "Formato utilizado para el embalaje"
      },
      {
        id: "plants",
        type: "number",
        label: "Plantas",
        name: "plants",
        placeholder: "Cantidad de plantas",
        required: true,
        helperText: "Número total de plantas"
      },
      {
        id: "hectares",
        type: "number",
        label: "Hectáreas",
        name: "hectares",
        placeholder: "Cantidad de hectáreas",
        required: true,
        helperText: "Superficie total en hectáreas"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el balance está actualmente activo"
      },
    ],
  }
];

// Form validation schema
const formValidationSchema = z.object({
  period: z.string().min(1, { message: "El periodo es obligatorio" }),
  harvestFormat: z.string().min(1, { message: "El formato de cosecha es obligatorio" }),
  packagingFormat: z.string().min(1, { message: "El formato de embalaje es obligatorio" }),
  plants: z.number({ required_error: "El número de plantas es obligatorio" })
    .positive({ message: "El número de plantas debe ser positivo" }),
  hectares: z.number({ required_error: "La cantidad de hectáreas es obligatoria" })
    .positive({ message: "La cantidad de hectáreas debe ser positiva" }),
  state: z.boolean().default(true)
});

const MassBalance = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [massBalances, setMassBalances] = useState<IMassBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMassBalance, setSelectedMassBalance] = useState<IMassBalance | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<IMassBalance> | null>(null);
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
  
  // Fetch mass balances on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchMassBalances();
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
  
  // Function to fetch mass balances data
  const fetchMassBalances = async () => {
    setIsLoading(true);
    try {
      const response = await massBalanceService.findAll();
      // Handle both response formats
      const data = Array.isArray(response) ? response : 
                   (response as any)?.data || [];
      setMassBalances(data);
    } catch (error) {
      console.error("Error loading mass balances:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los balances de masa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new mass balance
  const handleAddMassBalance = async (data: Partial<IMassBalance>) => {
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
        // Create entity with associated work
        const result = await createEntityWithWork(pendingData, workAssociationData);

        // Handle enhanced response format
        handleResponseWithFallback(
          result,
          'creation',
          'MASS_BALANCE',
          "Balance de masa creado correctamente"
        );
      } else {
        // Create entity without work
        const result = await createEntityWithoutWork(pendingData);

        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'MASS_BALANCE',
          "Balance de masa creado correctamente"
        );
      }

      fetchMassBalances();
      setShowWorkWizard(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating mass balance with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'MASS_BALANCE',
        "No se pudo crear el balance de masa"
      );
    }
  };

  // Create entity without associated work
  const createEntityWithoutWork = async (data: Partial<IMassBalance>) => {
    // Prepare data according to the exact model structure
    const massBalanceData: Partial<IMassBalance> = {
      period: data.period,
      harvestFormat: data.harvestFormat,
      packagingFormat: data.packagingFormat,
      plants: data.plants,
      hectares: data.hectares,
      state: data.state !== undefined ? data.state : true
    };

    await massBalanceService.createMassBalance(massBalanceData);
  };

  // Create entity with associated work
  const createEntityWithWork = async (
    entityData: Partial<IMassBalance>,
    workAssociationData: WorkAssociationData
  ) => {
    // Prepare data according to the exact model structure
    const massBalanceData: Partial<IMassBalance> = {
      period: entityData.period,
      harvestFormat: entityData.harvestFormat,
      packagingFormat: entityData.packagingFormat,
      plants: entityData.plants,
      hectares: entityData.hectares,
      state: entityData.state !== undefined ? entityData.state : true
    };

    // Create work with entity using the new endpoint
    const result = await workService.createWorkWithEntity(
      "MASS_BALANCE",
      massBalanceData,
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
        'MASS_BALANCE',
        "Balance de masa creado correctamente"
      );

      fetchMassBalances();
      setShowConfirmation(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating mass balance:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'MASS_BALANCE',
        "No se pudo crear el balance de masa"
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
  
  // Function to handle updating a mass balance
  const handleUpdateMassBalance = async (id: string | number, data: Partial<IMassBalance>) => {
    try {
      const result = await massBalanceService.updateMassBalance(id, data);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'MASS_BALANCE',
        "Balance de masa actualizado correctamente"
      );

      fetchMassBalances();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedMassBalance(null);
    } catch (error) {
      console.error(`Error updating mass balance ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'MASS_BALANCE',
        "No se pudo actualizar el balance de masa"
      );
    }
  };
  
  // Function to handle deleting a mass balance
  const handleDeleteMassBalance = async (id: string | number) => {
    try {
      await massBalanceService.softDeleteMassBalance(id);
      
      toast({
        title: "Éxito",
        description: "Balance de masa eliminado correctamente",
        variant: "default",
      });
      
      // Refresh the data
      fetchMassBalances();
    } catch (error) {
      console.error(`Error deleting mass balance ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el balance de masa",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IMassBalance>) => {
    // Parse number fields
    const parsedData = {
      ...data,
      plants: typeof data.plants === 'string' ? parseInt(data.plants, 10) : data.plants,
      hectares: typeof data.hectares === 'string' ? parseFloat(data.hectares) : data.hectares,
    };

    if (isEditMode && selectedMassBalance) {
      handleUpdateMassBalance(selectedMassBalance._id, parsedData);
    } else {
      handleAddMassBalance(parsedData);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (massBalance: IMassBalance) => {
    setSelectedMassBalance(massBalance);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render actions column
  const renderActions = (row: IMassBalance) => {
    return (
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon" onClick={() => handleEditClick(row)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleDeleteMassBalance(row._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  // Add actions column to the columns
  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: "Acciones",
      accessor: "_id",
      visible: true,
      sortable: false,
      render: renderActions,
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Balance de Masa</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedMassBalance(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Balance
        </Button>
      </div>
      
      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <Grid
          columns={columnsWithActions}
          data={massBalances}
          expandableContent={expandableContent}
          gridId="mass-balance-table"
        />
      )}
      
      {/* Dialog for adding/editing a mass balance */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Balance de Masa" : "Agregar Balance de Masa"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Edite los detalles del balance de masa seleccionado."
                : "Complete el formulario para agregar un nuevo balance de masa."}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            defaultValues={selectedMassBalance || {
              state: true,
            }}
            validationSchema={formValidationSchema}
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
              ¿Está seguro que desea crear el balance de masa sin asociar un trabajo?
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
              entityType="massBalance"
              entityData={{
                id: "new-mass-balance"
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

export default MassBalance; 