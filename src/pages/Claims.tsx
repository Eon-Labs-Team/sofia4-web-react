import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  AlertTriangle
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
import { IClaims } from "@eon-lib/eon-mongoose/types";
import claimsService from "@/_services/claimsService";
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

// Render function for evaluation concept
const renderEvaluationConcept = (value: string) => {
  const conceptColors: Record<string, string> = {
    'Aprobado': 'text-green-600',
    'Rechazado': 'text-red-600',
    'En Revisión': 'text-blue-600',
    'Requiere Ajustes': 'text-yellow-600'
  };

  return (
    <div className={`flex items-center ${conceptColors[value] || 'text-gray-600'}`}>
      <span className="font-medium">{value}</span>
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
    id: "detectionDate",
    header: "Fecha de Detección",
    accessor: "detectionDate",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "source",
    header: "Fuente",
    accessor: "source",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "detector",
    header: "Detector",
    accessor: "detector",
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
    id: "actionType",
    header: "Tipo de Acción",
    accessor: "actionType",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "evaluationConcept",
    header: "Concepto Evaluación",
    accessor: "evaluationConcept",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderEvaluationConcept,
  },
  {
    id: "description",
    header: "Descripción",
    accessor: "description",
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
    <h3 className="text-lg font-semibold mb-4">Detalle del Reclamo</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Detección</h4>
        <p className="text-sm"><strong>Fuente:</strong> {row.source}</p>
        <p className="text-sm"><strong>Detector:</strong> {row.detector}</p>
        <p className="text-sm"><strong>Fecha:</strong> {row.detectionDate}</p>
        <p className="text-sm"><strong>Descripción:</strong> {row.description}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Responsable</h4>
        <p className="text-sm"><strong>Persona:</strong> {row.responsiblePerson}</p>
        <p className="text-sm"><strong>Firma:</strong> {row.responsibleSignature}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Acción Correctiva</h4>
        <p className="text-sm"><strong>ID Acción:</strong> {row.actionId}</p>
        <p className="text-sm"><strong>Tipo:</strong> {row.actionType}</p>
        <p className="text-sm"><strong>Descripción:</strong> {row.actionDescription}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Evaluación</h4>
        <p className="text-sm"><strong>Evaluador:</strong> {row.evaluatorResponsible}</p>
        <p className="text-sm"><strong>Firma:</strong> {row.evaluatorSignature}</p>
        <p className="text-sm"><strong>Concepto:</strong> {row.evaluationConcept}</p>
        <p className="text-sm"><strong>Fecha:</strong> {row.evaluationDate}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Observaciones</h4>
        <p className="text-sm">{row.observations}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Imágenes</h4>
        <p className="text-sm"><strong>Imagen 1:</strong> {row.image1}</p>
        <p className="text-sm"><strong>Imagen 2:</strong> {row.image2}</p>
        <p className="text-sm"><strong>Imagen 3:</strong> {row.image3}</p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new claim
const formSections: SectionConfig[] = [
  {
    id: "detection-info",
    title: "Información de Detección",
    description: "Datos de detección del reclamo",
    fields: [
      {
        id: "source",
        type: "text",
        label: "Fuente",
        name: "source",
        placeholder: "Ingrese la fuente del reclamo",
        required: true,
        helperText: "Origen o fuente del reclamo"
      },
      {
        id: "detector",
        type: "text",
        label: "Detector",
        name: "detector",
        placeholder: "Nombre del detector",
        required: true,
        helperText: "Persona que detectó el problema"
      },
      {
        id: "detectionDate",
        type: "date",
        label: "Fecha de Detección",
        name: "detectionDate",
        placeholder: "Seleccione la fecha",
        required: true,
        helperText: "Fecha en que se detectó el problema",
        defaultValue: new Date().toISOString().split('T')[0],
      },
      {
        id: "description",
        type: "textarea",
        label: "Descripción",
        name: "description",
        placeholder: "Describa el reclamo",
        required: true,
        rows: 4,
        helperText: "Descripción detallada del reclamo"
      },
    ]
  },
  {
    id: "responsible-info",
    title: "Información del Responsable",
    description: "Datos del responsable del reclamo",
    fields: [
      {
        id: "responsiblePerson",
        type: "text",
        label: "Persona Responsable",
        name: "responsiblePerson",
        placeholder: "Nombre del responsable",
        required: true,
        helperText: "Persona responsable de atender el reclamo"
      },
      {
        id: "responsibleSignature",
        type: "text",
        label: "Firma del Responsable",
        name: "responsibleSignature",
        placeholder: "Firma o código del responsable",
        required: true,
        helperText: "Firma o identificación del responsable"
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
    id: "action-info",
    title: "Información de Acción Correctiva",
    description: "Datos de la acción correctiva tomada",
    fields: [
      {
        id: "actionId",
        type: "text",
        label: "ID de Acción",
        name: "actionId",
        placeholder: "Ingrese el ID de acción",
        required: true,
        helperText: "Identificador único de la acción correctiva"
      },
      {
        id: "actionDescription",
        type: "textarea",
        label: "Descripción de Acción",
        name: "actionDescription",
        placeholder: "Describa la acción correctiva",
        required: true,
        rows: 3,
        helperText: "Descripción detallada de la acción correctiva"
      },
      {
        id: "actionType",
        type: "select",
        label: "Tipo de Acción",
        name: "actionType",
        placeholder: "Seleccione el tipo",
        required: true,
        options: [
          { label: "Correctiva", value: "Correctiva" },
          { label: "Preventiva", value: "Preventiva" },
          { label: "Mejora", value: "Mejora" }
        ],
        helperText: "Tipo de acción correctiva"
      },
    ]
  },
  {
    id: "evaluation-info",
    title: "Información de Evaluación",
    description: "Datos de evaluación del reclamo",
    fields: [
      {
        id: "evaluatorResponsible",
        type: "text",
        label: "Responsable Evaluador",
        name: "evaluatorResponsible",
        placeholder: "Nombre del evaluador",
        required: true,
        helperText: "Persona responsable de evaluar el reclamo"
      },
      {
        id: "evaluatorSignature",
        type: "text",
        label: "Firma del Evaluador",
        name: "evaluatorSignature",
        placeholder: "Firma o código del evaluador",
        required: true,
        helperText: "Firma o identificación del evaluador"
      },
      {
        id: "evaluationConcept",
        type: "select",
        label: "Concepto de Evaluación",
        name: "evaluationConcept",
        placeholder: "Seleccione el concepto",
        required: true,
        options: [
          { label: "Aprobado", value: "Aprobado" },
          { label: "Rechazado", value: "Rechazado" },
          { label: "En Revisión", value: "En Revisión" },
          { label: "Requiere Ajustes", value: "Requiere Ajustes" }
        ],
        helperText: "Concepto de la evaluación"
      },
      {
        id: "evaluationDate",
        type: "date",
        label: "Fecha de Evaluación",
        name: "evaluationDate",
        placeholder: "Seleccione la fecha",
        required: true,
        helperText: "Fecha de evaluación del reclamo",
        defaultValue: new Date().toISOString().split('T')[0],
      },
      {
        id: "observations",
        type: "textarea",
        label: "Observaciones",
        name: "observations",
        placeholder: "Ingrese observaciones adicionales",
        required: true,
        rows: 3,
        helperText: "Observaciones adicionales sobre el reclamo"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: false,
        defaultValue: true,
        helperText: "Indica si el reclamo está activo"
      },
    ]
  }
];

// Form validation schema
const formValidationSchema = z.object({
  source: z.string().min(1, { message: "La fuente es obligatoria" }),
  detector: z.string().min(1, { message: "El detector es obligatorio" }),
  detectionDate: z.string().min(1, { message: "La fecha de detección es obligatoria" }),
  description: z.string().min(1, { message: "La descripción es obligatoria" }),
  responsiblePerson: z.string().min(1, { message: "El responsable es obligatorio" }),
  responsibleSignature: z.string().min(1, { message: "La firma del responsable es obligatoria" }),
  image1: z.string().min(1, { message: "La imagen 1 es obligatoria" }),
  image2: z.string().min(1, { message: "La imagen 2 es obligatoria" }),
  image3: z.string().min(1, { message: "La imagen 3 es obligatoria" }),
  actionId: z.string().min(1, { message: "El ID de acción es obligatorio" }),
  actionDescription: z.string().min(1, { message: "La descripción de acción es obligatoria" }),
  actionType: z.string().min(1, { message: "El tipo de acción es obligatorio" }),
  evaluatorResponsible: z.string().min(1, { message: "El responsable evaluador es obligatorio" }),
  evaluatorSignature: z.string().min(1, { message: "La firma del evaluador es obligatoria" }),
  evaluationConcept: z.string().min(1, { message: "El concepto de evaluación es obligatorio" }),
  evaluationDate: z.string().min(1, { message: "La fecha de evaluación es obligatoria" }),
  observations: z.string().min(1, { message: "Las observaciones son obligatorias" }),
  state: z.boolean().default(true)
});

const Claims = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [claimsData, setClaimsData] = useState<IClaims[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<IClaims | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<IClaims> | null>(null);
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

  // Fetch claims data on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchClaims();
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

  // Function to fetch claims data
  const fetchClaims = async () => {
    setIsLoading(true);
    try {
      const response = await claimsService.findAll();
      // Handle different response structures
      if (Array.isArray(response)) {
        setClaimsData(response);
      } else if (response && typeof response === 'object') {
        const data = (response as any).data || [];
        setClaimsData(Array.isArray(data) ? data : []);
      } else {
        setClaimsData([]);
      }
    } catch (error) {
      console.error("Error loading claims:", error);
      setClaimsData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle adding a new claim
  const handleAddClaim = async (data: Partial<IClaims>) => {
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
        // Create claim with associated work
        const result = await createClaimWithWork(pendingData, workAssociationData);

        handleResponseWithFallback(
          result,
          'creation',
          'CLAIMS',
          "Reclamo creado correctamente"
        );
      } else {
        // Create claim without work
        const result = await createClaimWithoutWork(pendingData);

        handleResponseWithFallback(
          result,
          'creation',
          'CLAIMS',
          "Reclamo creado correctamente"
        );
      }

      fetchClaims();
      setShowWorkWizard(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating claim with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'CLAIMS',
        "No se pudo crear el reclamo"
      );
    }
  };

  // Create claim without associated work
  const createClaimWithoutWork = async (data: Partial<IClaims>) => {
    await claimsService.createClaims(data);
  };

  // Create claim with associated work
  const createClaimWithWork = async (
    claimData: Partial<IClaims>,
    workAssociationData: WorkAssociationData
  ) => {
    const result = await workService.createWorkWithEntity(
      "CLAIMS",
      claimData,
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

      const result = await createClaimWithoutWork(pendingData);

      handleResponseWithFallback(
        result,
        'creation',
        'CLAIMS',
        "Reclamo creado correctamente"
      );

      fetchClaims();
      setShowConfirmation(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating claim:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'CLAIMS',
        "No se pudo crear el reclamo"
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

  // Function to handle updating a claim
  const handleUpdateClaim = async (id: string | number, data: Partial<IClaims>) => {
    try {
      const result = await claimsService.updateClaims(id, data);

      handleResponseWithFallback(
        result,
        'update',
        'CLAIMS',
        "Reclamo actualizado correctamente"
      );

      fetchClaims();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedClaim(null);
    } catch (error) {
      console.error(`Error updating claim ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'CLAIMS',
        "No se pudo actualizar el reclamo"
      );
    }
  };

  // Function to handle deleting a claim
  const handleDeleteClaim = async (id: string | number) => {
    try {
      await claimsService.softDeleteClaims(id);
      toast({
        title: "Éxito",
        description: "Reclamo eliminado correctamente",
      });
      fetchClaims();
    } catch (error) {
      console.error(`Error deleting claim ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el reclamo",
        variant: "destructive",
      });
    }
  };

  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IClaims>) => {
    if (isEditMode && selectedClaim && selectedClaim._id) {
      handleUpdateClaim(selectedClaim._id, data);
    } else {
      handleAddClaim(data);
    }
  };

  // Function to handle edit click
  const handleEditClick = (claim: IClaims) => {
    setSelectedClaim(claim);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Function to render action buttons for each row
  const renderActions = (row: IClaims) => {
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
          onClick={() => handleDeleteClaim(row._id as string)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Reclamos</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedClaim(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Reclamo
        </Button>
      </div>

      <Grid
        data={claimsData}
        columns={[...columns, {
          id: "actions",
          header: "Acciones",
          accessor: "actions",
          visible: true,
          render: renderActions,
        }]}
        gridId="claims-grid"
        title="Registros de Reclamos"
        expandableContent={expandableContent}
        actions={renderActions}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Reclamo" : "Agregar Nuevo Reclamo"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique la información del reclamo existente"
                : "Complete la información para crear un nuevo reclamo"}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedClaim ? selectedClaim : undefined}
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
              ¿Está seguro que desea crear el reclamo sin asociar un trabajo?
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
              entityType="claims"
              entityData={{
                id: "new-claim"
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

export default Claims;
