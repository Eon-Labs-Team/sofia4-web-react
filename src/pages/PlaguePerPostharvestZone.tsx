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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IPlaguePerPostharvestZone } from "@eon-lib/eon-mongoose/types";
import plaguePerPostharvestZoneService from "@/_services/plaguePerPostharvestZoneService";
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
    id: "grainsInstalled",
    header: "Granos Instalados",
    accessor: "grainsInstalled",
    visible: true,
    sortable: true,
  },
  {
    id: "grainsFound",
    header: "Granos Encontrados",
    accessor: "grainsFound",
    visible: true,
    sortable: true,
  },
  {
    id: "isHarvestSeason",
    header: "Temporada de Cosecha",
    accessor: "isHarvestSeason",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderBoolean,
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
    <h3 className="text-lg font-semibold mb-4">Detalle de Plaga por Zona de Postcosecha</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Información General</h4>
        <p className="text-sm"><strong>Fecha:</strong> {row.date}</p>
        <p className="text-sm"><strong>Revisor:</strong> {row.reviewer}</p>
        <p className="text-sm"><strong>Temporada de Cosecha:</strong> {row.isHarvestSeason ? 'Sí' : 'No'}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Granos</h4>
        <p className="text-sm"><strong>Granos Instalados:</strong> {row.grainsInstalled}</p>
        <p className="text-sm"><strong>Granos Encontrados:</strong> {row.grainsFound}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Justificación</h4>
        <p className="text-sm">{row.justification}</p>
      </div>
      {row.checks && row.checks.length > 0 && (
        <div className="col-span-full">
          <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Verificaciones</h4>
          <div className="space-y-2">
            {row.checks.map((check: any, index: number) => (
              <div key={index} className="flex items-start gap-2">
                {check.value ? (
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <p className="text-sm">
                  <strong>Check {index + 1}:</strong> {check.observation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// Form configuration for adding new plague per postharvest zone
const formSections: SectionConfig[] = [
  {
    id: "general-info",
    title: "Información General",
    description: "Datos generales del monitoreo de plaga",
    fields: [
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        placeholder: "Seleccione la fecha",
        required: true,
        helperText: "Fecha del monitoreo",
        defaultValue: new Date().toISOString().split('T')[0],
      },
      {
        id: "reviewer",
        type: "text",
        label: "Revisor",
        name: "reviewer",
        placeholder: "Nombre del revisor",
        required: true,
        helperText: "Persona que realizó la revisión"
      },
      {
        id: "isHarvestSeason",
        type: "checkbox",
        label: "Temporada de Cosecha",
        name: "isHarvestSeason",
        required: false,
        defaultValue: false,
        helperText: "¿Se encuentra en temporada de cosecha?"
      },
    ]
  },
  {
    id: "grains-info",
    title: "Información de Granos",
    description: "Datos sobre granos instalados y encontrados",
    fields: [
      {
        id: "grainsInstalled",
        type: "number",
        label: "Granos Instalados",
        name: "grainsInstalled",
        placeholder: "Ingrese cantidad",
        required: true,
        helperText: "Cantidad de granos instalados para el monitoreo"
      },
      {
        id: "grainsFound",
        type: "number",
        label: "Granos Encontrados",
        name: "grainsFound",
        placeholder: "Ingrese cantidad",
        required: true,
        helperText: "Cantidad de granos encontrados con plaga"
      },
    ]
  },
  {
    id: "checks-info",
    title: "Verificaciones",
    description: "Responda cada punto y agregue observaciones",
    fields: [
      {
        id: "checks",
        type: "arrayObject",
        label: "Verificaciones",
        name: "checks",
        fixedLength: true,
        items: [
          { title: "¿El área, las herramientas y los empaques se encuentran aseados?", defaultValue: { value: false, observation: "" } },
          { title: "¿Existen evidencias o rastros de plagas (Heces, olores, elementos corroídos, nidos, plagas)?", defaultValue: { value: false, observation: "" } },
          { title: "¿Las medidas físicas y químicas (mayas, trampas, cebos, sellados etc.) para la reducción de las plagas se encuentran en buen estado?", defaultValue: { value: false, observation: "" } },
          { title: "¿Se encuentran plagas muertas en el área que requieran disposición final?", defaultValue: { value: false, observation: "" } },
        ],
        subFields: [
          { type: "checkbox", name: "value", label: "Sí/No" },
          { type: "textarea", name: "observation", label: "Observación", rows: 2 },
        ],
      },
    ]
  },
  {
    id: "justification-info",
    title: "Justificación",
    description: "Justificación y observaciones",
    fields: [
      {
        id: "justification",
        type: "textarea",
        label: "Justificación",
        name: "justification",
        placeholder: "Ingrese la justificación",
        required: true,
        rows: 4,
        helperText: "Justificación de los resultados obtenidos"
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
  reviewer: z.string().min(1, { message: "El revisor es obligatorio" }),
  isHarvestSeason: z.boolean().default(false),
  grainsInstalled: z.number().min(0, { message: "Debe ser un número positivo" }),
  grainsFound: z.number().min(0, { message: "Debe ser un número positivo" }),
  checks: z.array(z.object({ value: z.boolean(), observation: z.string().optional() })).length(4, { message: "Debe completar las 4 verificaciones" }),
  justification: z.string().min(1, { message: "La justificación es obligatoria" }),
  state: z.boolean().default(true)
});

const PlaguePerPostharvestZone = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [plaguePerPostharvestZoneData, setPlaguePerPostharvestZoneData] = useState<IPlaguePerPostharvestZone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlaguePerPostharvestZone, setSelectedPlaguePerPostharvestZone] = useState<IPlaguePerPostharvestZone | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<IPlaguePerPostharvestZone> | null>(null);
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

  // Fetch plague per postharvest zone data on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchPlaguePerPostharvestZone();
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

  // Function to fetch plague per postharvest zone data
  const fetchPlaguePerPostharvestZone = async () => {
    setIsLoading(true);
    try {
      const response = await plaguePerPostharvestZoneService.findAll();
      // Handle different response structures
      if (Array.isArray(response)) {
        setPlaguePerPostharvestZoneData(response);
      } else if (response && typeof response === 'object') {
        const data = (response as any).data || [];
        setPlaguePerPostharvestZoneData(Array.isArray(data) ? data : []);
      } else {
        setPlaguePerPostharvestZoneData([]);
      }
    } catch (error) {
      console.error("Error loading plague per postharvest zone:", error);
      setPlaguePerPostharvestZoneData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle adding a new plague per postharvest zone
  const handleAddPlaguePerPostharvestZone = async (data: any) => {
    if (!data?.checks || data.checks.length !== 4) {
      toast({
        title: "Error",
        description: "Debe completar las verificaciones.",
        variant: "destructive",
      });
      return;
    }

    const plaguePerPostharvestZoneData = { ...data };

    // Store the data and show the work association question
    setPendingData(plaguePerPostharvestZoneData);
    setIsDialogOpen(false);
    setShowWorkQuestion(true);
  };

  // Function to handle work association completion
  const handleWorkAssociation = async (workAssociationData: WorkAssociationData) => {
    try {
      if (!pendingData) return;

      if (workAssociationData.associateWork) {
        // Create plague per postharvest zone with associated work
        const result = await createPlaguePerPostharvestZoneWithWork(pendingData, workAssociationData);

        handleResponseWithFallback(
          result,
          'creation',
          'PLAGUE_PER_POSTHARVEST_ZONE',
          "Registro de plaga por zona de postcosecha creado correctamente"
        );
      } else {
        // Create plague per postharvest zone without work
        const result = await createPlaguePerPostharvestZoneWithoutWork(pendingData);

        handleResponseWithFallback(
          result,
          'creation',
          'PLAGUE_PER_POSTHARVEST_ZONE',
          "Registro de plaga por zona de postcosecha creado correctamente"
        );
      }

      fetchPlaguePerPostharvestZone();
      setShowWorkWizard(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating plague per postharvest zone with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'PLAGUE_PER_POSTHARVEST_ZONE',
        "No se pudo crear el registro de plaga por zona de postcosecha"
      );
    }
  };

  // Create plague per postharvest zone without associated work
  const createPlaguePerPostharvestZoneWithoutWork = async (data: Partial<IPlaguePerPostharvestZone>) => {
    await plaguePerPostharvestZoneService.createPlaguePerPostharvestZone(data);
  };

  // Create plague per postharvest zone with associated work
  const createPlaguePerPostharvestZoneWithWork = async (
    plaguePerPostharvestZoneData: Partial<IPlaguePerPostharvestZone>,
    workAssociationData: WorkAssociationData
  ) => {
    const result = await workService.createWorkWithEntity(
      "PLAGUE_PER_POSTHARVEST_ZONE",
      plaguePerPostharvestZoneData,
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

      const result = await createPlaguePerPostharvestZoneWithoutWork(pendingData);

      handleResponseWithFallback(
        result,
        'creation',
        'PLAGUE_PER_POSTHARVEST_ZONE',
        "Registro de plaga por zona de postcosecha creado correctamente"
      );

      fetchPlaguePerPostharvestZone();
      setShowConfirmation(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating plague per postharvest zone:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'PLAGUE_PER_POSTHARVEST_ZONE',
        "No se pudo crear el registro de plaga por zona de postcosecha"
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

  // Function to handle updating a plague per postharvest zone
  const handleUpdatePlaguePerPostharvestZone = async (id: string | number, data: any) => {
    try {
      if (!data?.checks || data.checks.length !== 4) {
        toast({
          title: "Error",
          description: "Debe completar las verificaciones.",
          variant: "destructive",
        });
        return;
      }

      const plaguePerPostharvestZoneData = { ...data };

      const result = await plaguePerPostharvestZoneService.updatePlaguePerPostharvestZone(id, plaguePerPostharvestZoneData);

      handleResponseWithFallback(
        result,
        'update',
        'PLAGUE_PER_POSTHARVEST_ZONE',
        "Registro de plaga por zona de postcosecha actualizado correctamente"
      );

      fetchPlaguePerPostharvestZone();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedPlaguePerPostharvestZone(null);
    } catch (error) {
      console.error(`Error updating plague per postharvest zone ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'PLAGUE_PER_POSTHARVEST_ZONE',
        "No se pudo actualizar el registro de plaga por zona de postcosecha"
      );
    }
  };

  // Function to handle deleting a plague per postharvest zone
  const handleDeletePlaguePerPostharvestZone = async (id: string | number) => {
    try {
      await plaguePerPostharvestZoneService.softDeletePlaguePerPostharvestZone(id);
      toast({
        title: "Éxito",
        description: "Registro de plaga por zona de postcosecha eliminado correctamente",
      });
      fetchPlaguePerPostharvestZone();
    } catch (error) {
      console.error(`Error deleting plague per postharvest zone ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro de plaga por zona de postcosecha",
        variant: "destructive",
      });
    }
  };

  // Function to handle form submission
  const handleFormSubmit = (data: any) => {
    if (isEditMode && selectedPlaguePerPostharvestZone && selectedPlaguePerPostharvestZone._id) {
      handleUpdatePlaguePerPostharvestZone(selectedPlaguePerPostharvestZone._id, data);
    } else {
      handleAddPlaguePerPostharvestZone(data);
    }
  };

  // Function to handle edit click
  const handleEditClick = (plaguePerPostharvestZone: IPlaguePerPostharvestZone) => {
    setSelectedPlaguePerPostharvestZone(plaguePerPostharvestZone);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Function to render action buttons for each row
  const renderActions = (row: IPlaguePerPostharvestZone) => {
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
          onClick={() => handleDeletePlaguePerPostharvestZone(row._id as string)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Plaga por Zona de Postcosecha</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedPlaguePerPostharvestZone(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Registro
        </Button>
      </div>

      <Grid
        data={plaguePerPostharvestZoneData}
        columns={[...columns, {
          id: "actions",
          header: "Acciones",
          accessor: "actions",
          visible: true,
          render: renderActions,
        }]}
        gridId="plague-per-postharvest-zone-grid"
        title="Registros de Plaga por Zona de Postcosecha"
        expandableContent={expandableContent}
        actions={renderActions}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Registro de Plaga" : "Agregar Nuevo Registro de Plaga"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique la información del registro de plaga existente"
                : "Complete la información para crear un nuevo registro de plaga"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Use DynamicForm for general fields */}
            <DynamicForm
              sections={formSections}
              validationSchema={formValidationSchema}
              onSubmit={handleFormSubmit}
              defaultValues={isEditMode && selectedPlaguePerPostharvestZone ? selectedPlaguePerPostharvestZone : undefined}
            />


          </div>

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
              ¿Está seguro que desea crear el registro sin asociar un trabajo?
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
              entityType="plaguePerPostharvestZone"
              entityData={{
                id: "new-plague-per-postharvest-zone"
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

export default PlaguePerPostharvestZone;
