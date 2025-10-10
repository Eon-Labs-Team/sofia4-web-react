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
  Shovel,
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
import { ICalicata } from "@eon-lib/eon-mongoose/types";
import calicataService from "@/_services/calicataService";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";
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

// Format date for display
const formatDate = (value: string | Date) => {
  if (!value) return "";
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    return value.toString();
  }
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
    render: formatDate,
  },
  {
    id: "fieldOrPlot",
    header: "Campo/Parcela",
    accessor: "fieldOrPlot",
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
    id: "responsible",
    header: "Responsable",
    accessor: "responsible",
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
    <h3 className="text-lg font-semibold mb-2">Calicata - {row.fieldOrPlot}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Fecha:</strong> {formatDate(row.date)}
        </p>
        <p>
          <strong>Campo/Parcela:</strong> {row.fieldOrPlot}
        </p>
        <p>
          <strong>Profundidad:</strong> {row.depth}
        </p>
      </div>
      <div>
        <p>
          <strong>Responsable:</strong> {row.responsible}
        </p>
        <p>
          <strong>Observaciones:</strong> {row.observations || 'N/A'}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
    {(row.image1 || row.image2 || row.image3) && (
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Imágenes:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {row.image1 && (
            <div>
              <img src={row.image1} alt="Imagen 1" className="w-full h-auto rounded" />
            </div>
          )}
          {row.image2 && (
            <div>
              <img src={row.image2} alt="Imagen 2" className="w-full h-auto rounded" />
            </div>
          )}
          {row.image3 && (
            <div>
              <img src={row.image3} alt="Imagen 3" className="w-full h-auto rounded" />
            </div>
          )}
        </div>
      </div>
    )}
    {row.signature && (
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Firma:</h4>
        <img src={row.signature} alt="Firma" className="max-w-xs h-auto" />
      </div>
    )}
  </div>
);

// Form configuration for adding new calicata
const formSections: SectionConfig[] = [
  {
    id: "calicata-info",
    title: "Información de la Calicata",
    description: "Ingrese los datos de la nueva calicata",
    fields: [
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        required: true,
        helperText: "Fecha en que se realizó la calicata"
      },
      {
        id: "fieldOrPlot",
        type: "text",
        label: "Campo/Parcela",
        name: "fieldOrPlot",
        placeholder: "Ingrese el campo o parcela",
        required: true,
        helperText: "Identificador del campo o parcela donde se realizó la calicata"
      },
      {
        id: "depth",
        type: "number",
        label: "Profundidad (cm)",
        name: "depth",
        placeholder: "Profundidad en cm",
        helperText: "Profundidad de la calicata en centímetros"
      },
      {
        id: "responsible",
        type: "text",
        label: "Responsable",
        name: "responsible",
        placeholder: "Nombre del responsable",
        required: true,
        helperText: "Persona responsable del registro"
      },
      {
        id: "observations",
        type: "textarea",
        label: "Observaciones",
        name: "observations",
        placeholder: "Observaciones generales",
        helperText: "Observaciones adicionales sobre la calicata"
      },
      {
        id: "image1",
        type: "file",
        label: "Imagen 1",
        name: "image1",
        accept: "image/*",
        helperText: "Primera imagen de la calicata (opcional)"
      },
      {
        id: "image2",
        type: "file",
        label: "Imagen 2",
        name: "image2",
        accept: "image/*",
        helperText: "Segunda imagen de la calicata (opcional)"
      },
      {
        id: "image3",
        type: "file",
        label: "Imagen 3",
        name: "image3",
        accept: "image/*",
        helperText: "Tercera imagen de la calicata (opcional)"
      },
      {
        id: "signature",
        type: "signature",
        label: "Firma",
        name: "signature",
        helperText: "Firma del responsable (opcional)"
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
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  fieldOrPlot: z.string().min(1, { message: "El campo/parcela es obligatorio" }),
  depth: z.number().optional(),
  responsible: z.string().min(1, { message: "El responsable es obligatorio" }),
  observations: z.string().optional(),
  image1: z.string().optional(),
  image2: z.string().optional(),
  image3: z.string().optional(),
  signature: z.string().optional(),
  state: z.boolean().default(true)
});

const Calicata = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [calicatas, setCalicatas] = useState<ICalicata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCalicata, setSelectedCalicata] = useState<ICalicata | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<ICalicata> | null>(null);
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
  
  // Fetch calicatas on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchCalicatas();
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
  
  // Function to fetch calicatas data
  const fetchCalicatas = async () => {
    setIsLoading(true);
    try {
      const data = await calicataService.findAll();
      // @ts-ignore
      setCalicatas(data.data || data);
    } catch (error) {
      console.error("Error loading calicatas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de calicatas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new calicata
  const handleAddCalicata = async (data: Partial<ICalicata>) => {
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
        // Create calicata with associated work
        const result = await createEntityWithWork(pendingData, workAssociationData);

        // Handle enhanced response format
        handleResponseWithFallback(
          result,
          'creation',
          'CALICATA',
          "Calicata creada correctamente"
        );
      } else {
        // Create calicata without work
        const result = await createEntityWithoutWork(pendingData);

        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'CALICATA',
          "Calicata creada correctamente"
        );
      }

      fetchCalicatas();
      setShowWorkWizard(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating calicata with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'CALICATA',
        "No se pudo crear la calicata"
      );
    }
  };

  // Create calicata without associated work
  const createEntityWithoutWork = async (data: Partial<ICalicata>) => {
    await calicataService.createCalicata(data);
  };

  // Create calicata with associated work
  const createEntityWithWork = async (
    calicataData: Partial<ICalicata>,
    workAssociationData: WorkAssociationData
  ) => {
    // Create work with entity using the new endpoint
    const result = await workService.createWorkWithEntity(
      "CALICATA",
      calicataData,
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
        'CALICATA',
        "Calicata creada correctamente"
      );

      fetchCalicatas();
      setShowConfirmation(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating calicata:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'CALICATA',
        "No se pudo crear la calicata"
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
  
  // Function to handle updating a calicata
  const handleUpdateCalicata = async (id: string | number, data: Partial<ICalicata>) => {
    try {
      const result = await calicataService.updateCalicata(id, data);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'CALICATA',
        "Calicata actualizada correctamente"
      );

      fetchCalicatas();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedCalicata(null);
    } catch (error) {
      console.error(`Error updating calicata ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'CALICATA',
        "No se pudo actualizar la calicata"
      );
    }
  };
  
  // Function to handle deleting a calicata
  const handleDeleteCalicata = async (id: string | number) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta calicata?")) {
      try {
        await calicataService.softDeleteCalicata(id);
        await fetchCalicatas();
        toast({
          title: "Éxito",
          description: "Calicata eliminada correctamente",
        });
      } catch (error) {
        console.error("Error deleting calicata:", error);
        toast({
          title: "Error",
          description: "No se pudo eliminar la calicata",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle form submission
  const handleFormSubmit = (data: Partial<ICalicata>) => {
    if (isEditMode && selectedCalicata) {
      handleUpdateCalicata(selectedCalicata._id, data);
    } else {
      handleAddCalicata(data);
    }
  };

  // Handle edit button click
  const handleEditClick = (calicata: ICalicata) => {
    setSelectedCalicata(calicata);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: ICalicata) => {
    return (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleEditClick(row)}
          title="Editar"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteCalicata(row._id)}
          title="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Calicatas</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedCalicata(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Calicata
        </Button>
      </div>

      <Grid
        data={calicatas}
        columns={columns}
        // @ts-ignore
        renderExpandedContent={expandableContent}
        renderRowActions={renderActions}
        isLoading={isLoading}
        emptyMessage="No hay calicatas registradas"
        gridId="calicata-grid"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Calicata" : "Agregar Nueva Calicata"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Actualice la información de la calicata seleccionada"
                : "Complete el formulario para agregar una nueva calicata"}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            // @ts-ignore
            initialValues={isEditMode && selectedCalicata ? selectedCalicata : undefined}
            submitButtonLabel={isEditMode ? "Actualizar" : "Agregar"}
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
              ¿Está seguro que desea crear la calicata sin asociar un trabajo?
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
              entityType="calicata"
              entityData={{
                id: "new-calicata"
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

export default Calicata; 