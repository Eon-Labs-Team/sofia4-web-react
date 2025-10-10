import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Building2,
  CheckCircle,
  XCircle,
  Recycle,
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
import { IWasteManagement } from "@eon-lib/eon-mongoose/types";
import wasteManagementService from "@/_services/wasteManagementService";
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

// Column configuration for the grid - based on the IWasteManagement interface
const columns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: true,
    sortable: true,
  },
  {
    id: "deliveryDate",
    header: "Fecha de Entrega",
    accessor: "deliveryDate",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "wasteOriginField",
    header: "Campo de Origen",
    accessor: "wasteOriginField",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "wasteOrigin",
    header: "Origen",
    accessor: "wasteOrigin",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "wasteType",
    header: "Tipo de Residuo",
    accessor: "wasteType",
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
  },
  {
    id: "weight",
    header: "Peso",
    accessor: "weight",
    visible: true,
    sortable: true,
  },
  {
    id: "wasteHandling",
    header: "Manejo",
    accessor: "wasteHandling",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "wasteDestination",
    header: "Destino",
    accessor: "wasteDestination",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "responsiblePerson",
    header: "Responsable",
    accessor: "responsiblePerson",
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
    <h3 className="text-lg font-semibold mb-2">Manejo de Residuos</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <p><strong>Aplicado por:</strong> {row.appliedPerson}</p>
        <p><strong>Recomendado por:</strong> {row.recommendedBy}</p>
        <p><strong>Supervisor:</strong> {row.supervisor}</p>
      </div>
      <div>
        <p><strong>Entregado a:</strong> {row.deliveredTo}</p>
        <p><strong>Campo de Origen:</strong> {row.wasteOriginField}</p>
        <p><strong>Origen:</strong> {row.wasteOrigin}</p>
      </div>
      <div>
        <p><strong>Tipo de Residuo:</strong> {row.wasteType}</p>
        <p><strong>Cantidad:</strong> {row.quantity}</p>
        <p><strong>Peso:</strong> {row.weight}</p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new waste management - matches exactly the model structure
const formSections: SectionConfig[] = [
  {
    id: "waste-management-info",
    title: "Información de Manejo de Residuos",
    description: "Ingrese los datos del manejo de residuos",
    fields: [
      {
        id: "deliveryDate",
        type: "date",
        label: "Fecha de Entrega",
        name: "deliveryDate",
        required: true,
        helperText: "Seleccione la fecha de entrega"
      },
      {
        id: "wasteOriginField",
        type: "text",
        label: "Campo de Origen",
        name: "wasteOriginField",
        placeholder: "Campo donde se originó el residuo",
        required: true,
        helperText: "Ingrese el campo donde se originó el residuo"
      },
      {
        id: "wasteOrigin",
        type: "text",
        label: "Origen del Residuo",
        name: "wasteOrigin",
        placeholder: "Origen específico del residuo",
        required: true,
        helperText: "Ingrese el origen específico del residuo"
      },
      {
        id: "wasteType",
        type: "text",
        label: "Tipo de Residuo",
        name: "wasteType",
        placeholder: "Tipo de residuo",
        required: true,
        helperText: "Ingrese el tipo de residuo"
      },
      {
        id: "quantity",
        type: "number",
        label: "Cantidad",
        name: "quantity",
        placeholder: "Cantidad de residuos",
        required: true,
        helperText: "Ingrese la cantidad de residuos"
      },
      {
        id: "weight",
        type: "number",
        label: "Peso",
        name: "weight",
        placeholder: "Peso de los residuos",
        required: true,
        helperText: "Ingrese el peso de los residuos"
      },
      {
        id: "wasteHandling",
        type: "text",
        label: "Manejo de Residuos",
        name: "wasteHandling",
        placeholder: "Manejo aplicado a los residuos",
        required: true,
        helperText: "Ingrese el manejo aplicado a los residuos"
      },
      {
        id: "wasteDestination",
        type: "text",
        label: "Destino del Residuo",
        name: "wasteDestination",
        placeholder: "Destino final de los residuos",
        required: true,
        helperText: "Ingrese el destino final de los residuos"
      },
      {
        id: "responsiblePerson",
        type: "text",
        label: "Persona Responsable",
        name: "responsiblePerson",
        placeholder: "Persona responsable",
        required: true,
        helperText: "Ingrese la persona responsable"
      },
      {
        id: "appliedPerson",
        type: "text",
        label: "Aplicado por",
        name: "appliedPerson",
        placeholder: "Persona que aplicó",
        required: true,
        helperText: "Ingrese la persona que aplicó"
      },
      {
        id: "recommendedBy",
        type: "text",
        label: "Recomendado por",
        name: "recommendedBy",
        placeholder: "Persona que recomendó",
        required: true,
        helperText: "Ingrese la persona que recomendó"
      },
      {
        id: "supervisor",
        type: "text",
        label: "Supervisor",
        name: "supervisor",
        placeholder: "Supervisor",
        required: true,
        helperText: "Ingrese el supervisor"
      },
      {
        id: "deliveredTo",
        type: "text",
        label: "Entregado a",
        name: "deliveredTo",
        placeholder: "Entregado a",
        required: true,
        helperText: "Ingrese a quién se entregó"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el manejo de residuos está actualmente activo"
      },
    ],
  }
];

// Form validation schema - matches exactly the model requirements
const formValidationSchema = z.object({
  deliveryDate: z.string().min(1, { message: "La fecha de entrega es obligatoria" }),
  wasteOriginField: z.string().min(1, { message: "El campo de origen es obligatorio" }),
  wasteOrigin: z.string().min(1, { message: "El origen del residuo es obligatorio" }),
  wasteType: z.string().min(1, { message: "El tipo de residuo es obligatorio" }),
  quantity: z.number({ invalid_type_error: "La cantidad debe ser un número" }),
  weight: z.number({ invalid_type_error: "El peso debe ser un número" }),
  wasteHandling: z.string().min(1, { message: "El manejo de residuos es obligatorio" }),
  wasteDestination: z.string().min(1, { message: "El destino del residuo es obligatorio" }),
  responsiblePerson: z.string().min(1, { message: "La persona responsable es obligatoria" }),
  appliedPerson: z.string().min(1, { message: "La persona que aplicó es obligatoria" }),
  recommendedBy: z.string().min(1, { message: "La persona que recomendó es obligatoria" }),
  supervisor: z.string().min(1, { message: "El supervisor es obligatorio" }),
  deliveredTo: z.string().min(1, { message: "A quién se entregó es obligatorio" }),
  state: z.boolean().default(true)
});

const WasteManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [wasteManagements, setWasteManagements] = useState<IWasteManagement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWasteManagement, setSelectedWasteManagement] = useState<IWasteManagement | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<IWasteManagement> | null>(null);
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
  
  // Fetch waste managements on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchWasteManagements();
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
  
  // Function to fetch waste managements data
  const fetchWasteManagements = async () => {
    setIsLoading(true);
    try {
      const response = await wasteManagementService.findAll();
      const data = Array.isArray(response) ? response : 
      (response as any).data || [];
      setWasteManagements(data);
    } catch (error) {
      console.error("Error loading waste managements:", error);
      setWasteManagements([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new waste management
  const handleAdd = async (data: Partial<IWasteManagement>) => {
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
        // Create waste management with associated work
        const result = await createEntityWithWork(pendingData, workAssociationData);

        // Handle enhanced response format
        handleResponseWithFallback(
          result,
          'creation',
          'WASTE_MANAGEMENT_CONTROL',
          "Manejo de residuos creado correctamente"
        );
      } else {
        // Create waste management without work
        const result = await createEntityWithoutWork(pendingData);

        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'WASTE_MANAGEMENT_CONTROL',
          "Manejo de residuos creado correctamente"
        );
      }

      fetchWasteManagements();
      setShowWorkWizard(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating waste management with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'WASTE_MANAGEMENT_CONTROL',
        "No se pudo crear el manejo de residuos"
      );
    }
  };

  // Create waste management without associated work
  const createEntityWithoutWork = async (data: Partial<IWasteManagement>) => {
    await wasteManagementService.createWasteManagement(data);
  };

  // Create waste management with associated work
  const createEntityWithWork = async (
    wasteManagementData: Partial<IWasteManagement>,
    workAssociationData: WorkAssociationData
  ) => {
    // Create work with entity using the new endpoint
    const result = await workService.createWorkWithEntity(
      "WASTE_MANAGEMENT_CONTROL",
      wasteManagementData,
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
        'WASTE_MANAGEMENT_CONTROL',
        "Manejo de residuos creado correctamente"
      );

      fetchWasteManagements();
      setShowConfirmation(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating waste management:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'WASTE_MANAGEMENT_CONTROL',
        "No se pudo crear el manejo de residuos"
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
  
  // Function to handle updating a waste management
  const handleUpdateWasteManagement = async (id: string | number, data: Partial<IWasteManagement>) => {
    try {
      const result = await wasteManagementService.updateWasteManagement(id, data);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'WASTE_MANAGEMENT_CONTROL',
        "Manejo de residuos actualizado correctamente"
      );

      fetchWasteManagements();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedWasteManagement(null);
    } catch (error) {
      console.error(`Error updating waste management ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'WASTE_MANAGEMENT_CONTROL',
        "No se pudo actualizar el manejo de residuos"
      );
    }
  };
  
  // Function to handle deleting a waste management
  const handleDeleteWasteManagement = async (id: string | number) => {
    try {
      await wasteManagementService.softDeleteWasteManagement(id);
      await fetchWasteManagements();
      toast({
        title: "Éxito",
        description: "Manejo de residuos eliminado correctamente",
        variant: "default",
      });
    } catch (error) {
      console.error(`Error deleting waste management ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el manejo de residuos",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IWasteManagement>) => {
    if (isEditMode && selectedWasteManagement) {
      handleUpdateWasteManagement(selectedWasteManagement._id, data);
    } else {
      handleAdd(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (wasteManagement: IWasteManagement) => {
    setSelectedWasteManagement(wasteManagement);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render actions for each row
  const renderActions = (row: IWasteManagement) => {
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
          onClick={() => handleDeleteWasteManagement(row._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manejo de Residuos</h1>
        <Button 
          onClick={() => {
            setSelectedWasteManagement(null);
            setIsEditMode(false);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Manejo
        </Button>
      </div>

      {/* Grid for displaying waste managements */}
      <Grid
        data={wasteManagements}
        columns={columns}
        gridId="waste-management-grid"
        title="Manejo de Residuos"
        expandableContent={expandableContent}
        actions={renderActions}
      />

      {/* Dialog for adding/editing waste management */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Manejo de Residuos" : "Agregar Manejo de Residuos"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Actualice los detalles del manejo de residuos existente"
                : "Complete el formulario para agregar un nuevo manejo de residuos"}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={selectedWasteManagement || undefined}
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
              ¿Está seguro que desea crear el manejo de residuos sin asociar un trabajo?
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
              entityType="wasteManagement"
              entityData={{
                id: "new-waste-management"
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

export default WasteManagement; 