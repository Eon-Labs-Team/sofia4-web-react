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
  Recycle
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
import { IWasteRemoval } from "@eon-lib/eon-mongoose/types";
import { z } from "zod";
import wasteRemovalService from "@/_services/wasteRemovalService";
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
    id: "date",
    header: "Fecha",
    accessor: "date",
    visible: true,
    sortable: true,
    groupable: true,
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
    id: "residueType",
    header: "Tipo de Residuo",
    accessor: "residueType",
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
    id: "quantity",
    header: "Cantidad",
    accessor: "quantity",
    visible: true,
    sortable: true,
  },
  {
    id: "dispatchGuide",
    header: "Guía de Despacho",
    accessor: "dispatchGuide",
    visible: true,
    sortable: true,
  },
  {
    id: "moveTo",
    header: "Mover a",
    accessor: "moveTo",
    visible: true,
    sortable: true,
  },
  {
    id: "responsible",
    header: "Responsable",
    accessor: "responsible",
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
    <h3 className="text-lg font-semibold mb-2">Retiro de Residuos - {row.date}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Sitio:</strong> {row.site}
        </p>
        <p>
          <strong>Supervisor:</strong> {row.supervisor}
        </p>
        <p>
          <strong>Tipo de Residuo:</strong> {row.residueType}
        </p>
        <p>
          <strong>Clasificación:</strong> {row.classification}
        </p>
        <p>
          <strong>Cantidad:</strong> {row.quantity}
        </p>
      </div>
      <div>
        <p>
          <strong>Guía de Despacho:</strong> {row.dispatchGuide}
        </p>
        <p>
          <strong>Mover a:</strong> {row.moveTo}
        </p>
        <p>
          <strong>Responsable:</strong> {row.responsible}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new waste removal
const formSections: SectionConfig[] = [
  {
    id: "waste-removal-info",
    title: "Información del Retiro de Residuos",
    description: "Ingrese los datos del nuevo retiro de residuos",
    fields: [
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        required: true,
        helperText: "Fecha del retiro de residuos"
      },
      {
        id: "site",
        type: "text",
        label: "Sitio",
        name: "site",
        placeholder: "Ingrese el sitio",
        required: true,
        helperText: "Sitio donde se realiza el retiro"
      },
      {
        id: "supervisor",
        type: "text",
        label: "Supervisor",
        name: "supervisor",
        placeholder: "Nombre del supervisor",
        required: true,
        helperText: "Supervisor a cargo del retiro"
      },
      {
        id: "residueType",
        type: "text",
        label: "Tipo de Residuo",
        name: "residueType",
        placeholder: "Tipo de residuo",
        required: true,
        helperText: "Tipo de residuo retirado"
      },
      {
        id: "classification",
        type: "text",
        label: "Clasificación",
        name: "classification",
        placeholder: "Clasificación del residuo",
        required: true,
        helperText: "Clasificación del residuo"
      },
      {
        id: "quantity",
        type: "number",
        label: "Cantidad",
        name: "quantity",
        placeholder: "Cantidad",
        required: true,
        helperText: "Cantidad de residuo retirado"
      },
      {
        id: "dispatchGuide",
        type: "text",
        label: "Guía de Despacho",
        name: "dispatchGuide",
        placeholder: "Número de guía",
        required: true,
        helperText: "Número de guía de despacho"
      },
      {
        id: "moveTo",
        type: "text",
        label: "Mover a",
        name: "moveTo",
        placeholder: "Lugar de destino",
        required: true,
        helperText: "Lugar donde se moverán los residuos"
      },
      {
        id: "responsible",
        type: "text",
        label: "Responsable",
        name: "responsible",
        placeholder: "Nombre del responsable",
        required: true,
        helperText: "Persona responsable del retiro"
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
  residueType: z.string().min(1, { message: "El tipo de residuo es obligatorio" }),
  classification: z.string().min(1, { message: "La clasificación es obligatoria" }),
  quantity: z.number().min(0, { message: "La cantidad debe ser un número válido" }),
  dispatchGuide: z.string().min(1, { message: "La guía de despacho es obligatoria" }),
  moveTo: z.string().min(1, { message: "El destino es obligatorio" }),
  responsible: z.string().min(1, { message: "El responsable es obligatorio" }),
  state: z.boolean().default(true)
});

const WasteRemoval = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [wasteRemovals, setWasteRemovals] = useState<IWasteRemoval[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWasteRemoval, setSelectedWasteRemoval] = useState<IWasteRemoval | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingWasteRemovalData, setPendingWasteRemovalData] = useState<Partial<IWasteRemoval> | null>(null);
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

  // Fetch waste removals on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchWasteRemovals();
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
  
  // Function to fetch waste removals data
  const fetchWasteRemovals = async () => {
    setIsLoading(true);
    try {
      const response = await wasteRemovalService.findAll();
      // Handle response correctly
      const data = Array.isArray(response) ? response : 
      (response as any).data || [];
      setWasteRemovals(data);
    } catch (error) {
      console.error("Error loading waste removals:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los retiros de residuos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new waste removal
  const handleAddWasteRemoval = async (data: Partial<IWasteRemoval>) => {
    // Store the data and show the work association question
    setPendingWasteRemovalData(data);
    setIsDialogOpen(false);
    setShowWorkQuestion(true);
  };

  // Function to handle work association completion
  const handleWorkAssociation = async (workAssociationData: WorkAssociationData) => {
    try {
      if (!pendingWasteRemovalData) return;

      if (workAssociationData.associateWork) {
        // Create waste removal with associated work
        const result = await createWasteRemovalWithWork(pendingWasteRemovalData, workAssociationData);

        // Handle enhanced response format
        handleResponseWithFallback(
          result,
          'creation',
          'WASTE_REMOVAL',
          "Retiro de residuos creado correctamente"
        );
      } else {
        // Create waste removal without work
        const result = await createWasteRemovalWithoutWork(pendingWasteRemovalData);

        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'WASTE_REMOVAL',
          "Retiro de residuos creado correctamente"
        );
      }

      fetchWasteRemovals();
      setShowWorkWizard(false);
      setPendingWasteRemovalData(null);

    } catch (error) {
      console.error("Error creating waste removal with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'WASTE_REMOVAL',
        "No se pudo crear el retiro de residuos"
      );
    }
  };

  // Create waste removal without associated work
  const createWasteRemovalWithoutWork = async (data: Partial<IWasteRemoval>) => {
    await wasteRemovalService.createWasteRemoval(data);
  };

  // Create waste removal with associated work
  const createWasteRemovalWithWork = async (
    wasteRemovalData: Partial<IWasteRemoval>,
    workAssociationData: WorkAssociationData
  ) => {
    // Create work with entity using the new endpoint
    const result = await workService.createWorkWithEntity(
      "WASTE_REMOVAL",
      wasteRemovalData,
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
      if (!pendingWasteRemovalData) return;

      const result = await createWasteRemovalWithoutWork(pendingWasteRemovalData);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'creation',
        'WASTE_REMOVAL',
        "Retiro de residuos creado correctamente"
      );

      fetchWasteRemovals();
      setShowConfirmation(false);
      setPendingWasteRemovalData(null);

    } catch (error) {
      console.error("Error creating waste removal:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'WASTE_REMOVAL',
        "No se pudo crear el retiro de residuos"
      );
    }
  };

  // Function to handle work wizard cancellation
  const handleWorkWizardCancel = () => {
    setShowWorkWizard(false);
    setPendingWasteRemovalData(null);
  };

  // Function to cancel all operations
  const handleCancelAll = () => {
    setShowWorkQuestion(false);
    setShowWorkWizard(false);
    setShowConfirmation(false);
    setPendingWasteRemovalData(null);
  };
  
  // Function to handle updating a waste removal
  const handleUpdateWasteRemoval = async (id: string | number, data: Partial<IWasteRemoval>) => {
    try {
      const result = await wasteRemovalService.updateWasteRemoval(id, data);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'WASTE_REMOVAL',
        "Retiro de residuos actualizado correctamente"
      );

      await fetchWasteRemovals();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating waste removal:", error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'WASTE_REMOVAL',
        "No se pudo actualizar el retiro de residuos"
      );
    }
  };
  
  // Function to handle deleting a waste removal
  const handleDeleteWasteRemoval = async (id: string | number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este retiro de residuos?")) {
      try {
        await wasteRemovalService.softDeleteWasteRemoval(id);
        await fetchWasteRemovals();
        toast({
          title: "Éxito",
          description: "Retiro de residuos eliminado correctamente",
        });
      } catch (error) {
        console.error("Error deleting waste removal:", error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el retiro de residuos",
          variant: "destructive",
        });
      }
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IWasteRemoval>) => {
    if (isEditMode && selectedWasteRemoval) {
      handleUpdateWasteRemoval(selectedWasteRemoval._id, data);
    } else {
      handleAddWasteRemoval(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (wasteRemoval: IWasteRemoval) => {
    setSelectedWasteRemoval(wasteRemoval);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render row actions (edit, delete buttons)
  const renderActions = (row: IWasteRemoval) => {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick(row);
          }}
        >
          <Edit size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteWasteRemoval(row._id);
          }}
        >
          <Trash2 size={16} />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Recycle className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Retiro de Residuos</h1>
        </div>
        <Button
          onClick={() => {
            setSelectedWasteRemoval(null);
            setIsEditMode(false);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Agregar Retiro
        </Button>
      </div>

      <Grid
        data={wasteRemovals}
        columns={columns}
        gridId="waste-removal-grid"
        title="Retiro de Residuos"
        expandableContent={expandableContent}
        actions={renderActions}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Retiro de Residuos" : "Agregar Retiro de Residuos"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Actualice los detalles del retiro de residuos seleccionado"
                : "Complete el formulario para agregar un nuevo retiro de residuos"}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode ? selectedWasteRemoval : { state: true }}
          />

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
              }}
            >
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
              ¿Está seguro que desea crear el retiro de residuos sin asociar un trabajo?
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

          {showWorkWizard && pendingWasteRemovalData && (
            <WorkAssociationWizard
              entityType="wasteRemoval"
              entityData={{
                id: "new-waste-removal"
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

export default WasteRemoval; 