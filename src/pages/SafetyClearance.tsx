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
import { ISafetyClearance } from "@eon-lib/eon-mongoose/types";
import safetyClearanceService from "@/_services/safetyClearanceService";
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
    id: "companyName",
    header: "Empresa",
    accessor: "companyName",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "startDate",
    header: "Fecha de Inicio",
    accessor: "startDate",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "from",
    header: "Desde",
    accessor: "from",
    visible: true,
    sortable: true,
  },
  {
    id: "to",
    header: "Hasta",
    accessor: "to",
    visible: true,
    sortable: true,
  },
  {
    id: "reviewer",
    header: "Revisor",
    accessor: "reviewer",
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
    <h3 className="text-lg font-semibold mb-4">Detalle de Liberación de Inocuidad</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Información General</h4>
        <p className="text-sm"><strong>Código:</strong> {row.code}</p>
        <p className="text-sm"><strong>Área:</strong> {row.area}</p>
        <p className="text-sm"><strong>Empresa:</strong> {row.companyName}</p>
        <p className="text-sm"><strong>Fecha Inicio:</strong> {row.startDate}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Período</h4>
        <p className="text-sm"><strong>Desde:</strong> {row.from}</p>
        <p className="text-sm"><strong>Hasta:</strong> {row.to}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Responsables</h4>
        <p className="text-sm"><strong>Revisor:</strong> {row.reviewer}</p>
        <p className="text-sm"><strong>Firma Responsable:</strong> {row.responsibleSignature}</p>
        <p className="text-sm"><strong>Firma Superior:</strong> {row.superiorSignature}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Observaciones</h4>
        <p className="text-sm">{row.observation}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Imágenes</h4>
        <p className="text-sm"><strong>Imagen 1:</strong> {row.image1}</p>
        <p className="text-sm"><strong>Imagen 2:</strong> {row.image2}</p>
        <p className="text-sm"><strong>Imagen 3:</strong> {row.image3}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Verificaciones</h4>
        <p className="text-sm"><strong>Checks:</strong> {row.checks ? `${row.checks.filter((c: boolean) => c).length} de ${row.checks.length}` : '0'}</p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new safety clearance
const formSections: SectionConfig[] = [
  {
    id: "general-info",
    title: "Información General",
    description: "Datos generales de la liberación de inocuidad",
    fields: [
      {
        id: "code",
        type: "text",
        label: "Código",
        name: "code",
        placeholder: "Ingrese el código",
        required: true,
        helperText: "Código único de la liberación"
      },
      {
        id: "area",
        type: "text",
        label: "Área",
        name: "area",
        placeholder: "Ingrese el área",
        required: true,
        helperText: "Área donde se realiza la liberación"
      },
      {
        id: "companyName",
        type: "text",
        label: "Nombre de la Empresa",
        name: "companyName",
        placeholder: "Ingrese el nombre de la empresa",
        required: true,
        helperText: "Empresa responsable"
      },
      {
        id: "startDate",
        type: "date",
        label: "Fecha de Inicio",
        name: "startDate",
        placeholder: "Seleccione la fecha",
        required: true,
        helperText: "Fecha de inicio de la liberación",
        defaultValue: new Date().toISOString().split('T')[0],
      },
    ]
  },
  {
    id: "period-info",
    title: "Período",
    description: "Información del período de validez",
    fields: [
      {
        id: "from",
        type: "text",
        label: "Desde",
        name: "from",
        placeholder: "Ej: 08:00",
        required: true,
        helperText: "Hora de inicio"
      },
      {
        id: "to",
        type: "text",
        label: "Hasta",
        name: "to",
        placeholder: "Ej: 18:00",
        required: true,
        helperText: "Hora de término"
      },
    ]
  },
  {
    id: "responsible-info",
    title: "Información de Responsables",
    description: "Datos de las personas responsables",
    fields: [
      {
        id: "reviewer",
        type: "text",
        label: "Revisor",
        name: "reviewer",
        placeholder: "Nombre del revisor",
        required: true,
        helperText: "Persona que revisa la liberación"
      },
      {
        id: "responsibleSignature",
        type: "text",
        label: "Firma del Responsable",
        name: "responsibleSignature",
        placeholder: "Firma o código del responsable",
        required: true,
        helperText: "Firma del responsable"
      },
      {
        id: "superiorSignature",
        type: "text",
        label: "Firma del Superior",
        name: "superiorSignature",
        placeholder: "Firma o código del superior",
        required: true,
        helperText: "Firma del superior jerárquico"
      },
    ]
  },
  {
    id: "images",
    title: "Imágenes de Evidencia",
    description: "URLs de las imágenes de evidencia",
    fields: [
      {
        id: "image1",
        type: "text",
        label: "Imagen 1",
        name: "image1",
        placeholder: "URL de la imagen 1",
        required: true,
        helperText: "URL de la primera imagen de evidencia"
      },
      {
        id: "image2",
        type: "text",
        label: "Imagen 2",
        name: "image2",
        placeholder: "URL de la imagen 2",
        required: true,
        helperText: "URL de la segunda imagen de evidencia"
      },
      {
        id: "image3",
        type: "text",
        label: "Imagen 3",
        name: "image3",
        placeholder: "URL de la imagen 3",
        required: true,
        helperText: "URL de la tercera imagen de evidencia"
      },
    ]
  },
  {
    id: "checks-info",
    title: "Verificaciones",
    description: "Lista de verificaciones realizadas",
    fields: [
      {
        id: "checks",
        type: "text",
        label: "Checks (separados por coma)",
        name: "checks",
        placeholder: "Ej: true,false,true",
        required: true,
        helperText: "Lista de verificaciones (true/false separados por coma)"
      },
    ]
  },
  {
    id: "observation-info",
    title: "Observaciones",
    description: "Observaciones adicionales",
    fields: [
      {
        id: "observation",
        type: "textarea",
        label: "Observaciones",
        name: "observation",
        placeholder: "Ingrese observaciones adicionales",
        required: true,
        rows: 3,
        helperText: "Observaciones sobre la liberación"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: false,
        defaultValue: true,
        helperText: "Indica si la liberación está activa"
      },
    ]
  }
];

// Form validation schema
const formValidationSchema = z.object({
  code: z.string().min(1, { message: "El código es obligatorio" }),
  area: z.string().min(1, { message: "El área es obligatoria" }),
  companyName: z.string().min(1, { message: "El nombre de la empresa es obligatorio" }),
  from: z.string().min(1, { message: "La hora de inicio es obligatoria" }),
  to: z.string().min(1, { message: "La hora de término es obligatoria" }),
  startDate: z.string().min(1, { message: "La fecha de inicio es obligatoria" }),
  checks: z.string().min(1, { message: "Las verificaciones son obligatorias" }),
  responsibleSignature: z.string().min(1, { message: "La firma del responsable es obligatoria" }),
  superiorSignature: z.string().min(1, { message: "La firma del superior es obligatoria" }),
  reviewer: z.string().min(1, { message: "El revisor es obligatorio" }),
  image1: z.string().min(1, { message: "La imagen 1 es obligatoria" }),
  image2: z.string().min(1, { message: "La imagen 2 es obligatoria" }),
  image3: z.string().min(1, { message: "La imagen 3 es obligatoria" }),
  observation: z.string().min(1, { message: "Las observaciones son obligatorias" }),
  state: z.boolean().default(true)
});

const SafetyClearance = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [safetyClearanceData, setSafetyClearanceData] = useState<ISafetyClearance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSafetyClearance, setSelectedSafetyClearance] = useState<ISafetyClearance | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<ISafetyClearance> | null>(null);
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

  // Fetch safety clearance data on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchSafetyClearance();
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

  // Function to fetch safety clearance data
  const fetchSafetyClearance = async () => {
    setIsLoading(true);
    try {
      const response = await safetyClearanceService.findAll();
      // Handle different response structures
      if (Array.isArray(response)) {
        setSafetyClearanceData(response);
      } else if (response && typeof response === 'object') {
        const data = (response as any).data || [];
        setSafetyClearanceData(Array.isArray(data) ? data : []);
      } else {
        setSafetyClearanceData([]);
      }
    } catch (error) {
      console.error("Error loading safety clearance:", error);
      setSafetyClearanceData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle adding a new safety clearance
  const handleAddSafetyClearance = async (data: any) => {
    // Convert checks string to array of booleans
    const checksArray = data.checks.split(',').map((c: string) => c.trim().toLowerCase() === 'true');

    const safetyClearanceData = {
      ...data,
      checks: checksArray
    };

    // Store the data and show the work association question
    setPendingData(safetyClearanceData);
    setIsDialogOpen(false);
    setShowWorkQuestion(true);
  };

  // Function to handle work association completion
  const handleWorkAssociation = async (workAssociationData: WorkAssociationData) => {
    try {
      if (!pendingData) return;

      if (workAssociationData.associateWork) {
        // Create safety clearance with associated work
        const result = await createSafetyClearanceWithWork(pendingData, workAssociationData);

        handleResponseWithFallback(
          result,
          'creation',
          'SAFETY_CLEARANCE',
          "Liberación de inocuidad creada correctamente"
        );
      } else {
        // Create safety clearance without work
        const result = await createSafetyClearanceWithoutWork(pendingData);

        handleResponseWithFallback(
          result,
          'creation',
          'SAFETY_CLEARANCE',
          "Liberación de inocuidad creada correctamente"
        );
      }

      fetchSafetyClearance();
      setShowWorkWizard(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating safety clearance with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'SAFETY_CLEARANCE',
        "No se pudo crear la liberación de inocuidad"
      );
    }
  };

  // Create safety clearance without associated work
  const createSafetyClearanceWithoutWork = async (data: Partial<ISafetyClearance>) => {
    await safetyClearanceService.createSafetyClearance(data);
  };

  // Create safety clearance with associated work
  const createSafetyClearanceWithWork = async (
    safetyClearanceData: Partial<ISafetyClearance>,
    workAssociationData: WorkAssociationData
  ) => {
    const result = await workService.createWorkWithEntity(
      "SAFETY_CLEARANCE",
      safetyClearanceData,
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

      const result = await createSafetyClearanceWithoutWork(pendingData);

      handleResponseWithFallback(
        result,
        'creation',
        'SAFETY_CLEARANCE',
        "Liberación de inocuidad creada correctamente"
      );

      fetchSafetyClearance();
      setShowConfirmation(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating safety clearance:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'SAFETY_CLEARANCE',
        "No se pudo crear la liberación de inocuidad"
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

  // Function to handle updating a safety clearance
  const handleUpdateSafetyClearance = async (id: string | number, data: any) => {
    try {
      // Convert checks string to array of booleans if it's a string
      const safetyClearanceData = typeof data.checks === 'string'
        ? {
            ...data,
            checks: data.checks.split(',').map((c: string) => c.trim().toLowerCase() === 'true')
          }
        : data;

      const result = await safetyClearanceService.updateSafetyClearance(id, safetyClearanceData);

      handleResponseWithFallback(
        result,
        'update',
        'SAFETY_CLEARANCE',
        "Liberación de inocuidad actualizada correctamente"
      );

      fetchSafetyClearance();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedSafetyClearance(null);
    } catch (error) {
      console.error(`Error updating safety clearance ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'SAFETY_CLEARANCE',
        "No se pudo actualizar la liberación de inocuidad"
      );
    }
  };

  // Function to handle deleting a safety clearance
  const handleDeleteSafetyClearance = async (id: string | number) => {
    try {
      await safetyClearanceService.softDeleteSafetyClearance(id);
      toast({
        title: "Éxito",
        description: "Liberación de inocuidad eliminada correctamente",
      });
      fetchSafetyClearance();
    } catch (error) {
      console.error(`Error deleting safety clearance ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la liberación de inocuidad",
        variant: "destructive",
      });
    }
  };

  // Function to handle form submission
  const handleFormSubmit = (data: any) => {
    if (isEditMode && selectedSafetyClearance && selectedSafetyClearance._id) {
      handleUpdateSafetyClearance(selectedSafetyClearance._id, data);
    } else {
      handleAddSafetyClearance(data);
    }
  };

  // Function to handle edit click
  const handleEditClick = (safetyClearance: ISafetyClearance) => {
    // Convert checks array to string for form
    const formData = {
      ...safetyClearance,
      checks: safetyClearance.checks ? safetyClearance.checks.join(',') : ''
    };
    setSelectedSafetyClearance(formData as any);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Function to render action buttons for each row
  const renderActions = (row: ISafetyClearance) => {
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
          onClick={() => handleDeleteSafetyClearance(row._id as string)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Liberación de Inocuidad</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedSafetyClearance(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Liberación
        </Button>
      </div>

      <Grid
        data={safetyClearanceData}
        columns={[...columns, {
          id: "actions",
          header: "Acciones",
          accessor: "actions",
          visible: true,
          render: renderActions,
        }]}
        gridId="safety-clearance-grid"
        title="Registros de Liberación de Inocuidad"
        expandableContent={expandableContent}
        actions={renderActions}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Liberación de Inocuidad" : "Agregar Nueva Liberación de Inocuidad"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique la información de la liberación de inocuidad existente"
                : "Complete la información para crear una nueva liberación de inocuidad"}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedSafetyClearance ? selectedSafetyClearance : undefined}
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
              ¿Está seguro que desea crear la liberación de inocuidad sin asociar un trabajo?
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
              entityType="safetyClearance"
              entityData={{
                id: "new-safety-clearance"
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

export default SafetyClearance;
