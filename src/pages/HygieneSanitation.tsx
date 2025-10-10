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
import { IHygieneSanitation } from "@eon-lib/eon-mongoose/types";
import hygieneSanitationService from "@/_services/hygieneSanitationService";
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

// Column configuration for the grid - matches the model structure
const columns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: true,
    sortable: true,
  },
  {
    id: "type",
    header: "Tipo",
    accessor: "type",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "startPeriod",
    header: "Período Inicio",
    accessor: "startPeriod",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "endPeriod",
    header: "Período Fin",
    accessor: "endPeriod",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "titleForField1",
    header: "Título Campo 1",
    accessor: "titleForField1",
    visible: true,
    sortable: true,
  },
  {
    id: "titleForField2",
    header: "Título Campo 2",
    accessor: "titleForField2",
    visible: true,
    sortable: true,
  },
  {
    id: "user",
    header: "Usuario",
    accessor: "user",
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
    <h3 className="text-lg font-semibold mb-2">{row.type}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Período Inicio:</strong> {row.startPeriod}
        </p>
        <p>
          <strong>Período Fin:</strong> {row.endPeriod}
        </p>
        <p>
          <strong>Título Campo 1:</strong> {row.titleForField1}
        </p>
      </div>
      <div>
        <p>
          <strong>Título Campo 2:</strong> {row.titleForField2}
        </p>
        <p>
          <strong>Usuario:</strong> {row.user}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
    {row.field3To20 && row.field3To20.length > 0 && (
      <div className="mt-4">
        <h4 className="font-semibold">Campos adicionales:</h4>
        <ul className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
          {row.field3To20.map((field: string, index: number) => (
            <li key={index}>{field}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// Form configuration for adding new records
const formSections: SectionConfig[] = [
  {
    id: "hygiene-sanitation-info",
    title: "Información de Higiene y Sanidad",
    description: "Ingrese los datos del nuevo registro",
    fields: [
      {
        id: "type",
        type: "text",
        label: "Tipo",
        name: "type",
        placeholder: "Tipo de registro",
        required: true,
        helperText: "Ingrese el tipo de registro de higiene y sanidad"
      },
      {
        id: "startPeriod",
        type: "date",
        label: "Período Inicio",
        name: "startPeriod",
        required: true,
        helperText: "Fecha de inicio del período"
      },
      {
        id: "endPeriod",
        type: "date",
        label: "Período Fin",
        name: "endPeriod",
        required: true,
        helperText: "Fecha de fin del período"
      },
      {
        id: "titleForField1",
        type: "text",
        label: "Título Campo 1",
        name: "titleForField1",
        placeholder: "Título para el primer campo",
        required: true,
        helperText: "Ingrese un título para el primer campo"
      },
      {
        id: "titleForField2",
        type: "text",
        label: "Título Campo 2",
        name: "titleForField2",
        placeholder: "Título para el segundo campo",
        required: true,
        helperText: "Ingrese un título para el segundo campo"
      },
      {
        id: "field3To20",
        type: "text",
        label: "Campos adicionales",
        name: "field3To20",
        placeholder: "Campo1, Campo2, Campo3, ...",
        required: false,
        helperText: "Ingrese campos adicionales separados por comas"
      },
      {
        id: "user",
        type: "text",
        label: "Usuario",
        name: "user",
        placeholder: "Usuario responsable",
        required: true,
        helperText: "Nombre del usuario responsable"
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
  type: z.string().min(1, { message: "El tipo es obligatorio" }),
  startPeriod: z.string().min(1, { message: "El período de inicio es obligatorio" }),
  endPeriod: z.string().min(1, { message: "El período de fin es obligatorio" }),
  titleForField1: z.string().min(1, { message: "El título para el campo 1 es obligatorio" }),
  titleForField2: z.string().min(1, { message: "El título para el campo 2 es obligatorio" }),
  field3To20: z.string().optional().transform(val => val ? val.split(',').map(item => item.trim()) : []),
  user: z.string().min(1, { message: "El usuario es obligatorio" }),
  state: z.boolean().default(true)
});

const HygieneSanitation = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [records, setRecords] = useState<IHygieneSanitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IHygieneSanitation | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<IHygieneSanitation> | null>(null);
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
  
  // Fetch records on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchRecords();
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
  
  // Function to fetch records data
  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const data = await hygieneSanitationService.findAll();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading hygiene and sanitation records:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los registros de higiene y sanidad. Intente nuevamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new record
  const handleAddRecord = async (data: Partial<IHygieneSanitation>) => {
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
        // Create record with associated work
        const result = await createEntityWithWork(pendingData, workAssociationData);

        // Handle enhanced response format
        handleResponseWithFallback(
          result,
          'creation',
          'HYGIENE_SANITATION',
          "Registro de higiene y sanidad creado correctamente"
        );
      } else {
        // Create record without work
        const result = await createEntityWithoutWork(pendingData);

        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'HYGIENE_SANITATION',
          "Registro de higiene y sanidad creado correctamente"
        );
      }

      fetchRecords();
      setShowWorkWizard(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating hygiene sanitation record with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'HYGIENE_SANITATION',
        "No se pudo crear el registro de higiene y sanidad"
      );
    }
  };

  // Create record without associated work
  const createEntityWithoutWork = async (data: Partial<IHygieneSanitation>) => {
    await hygieneSanitationService.createHygieneSanitation(data);
  };

  // Create record with associated work
  const createEntityWithWork = async (
    entityData: Partial<IHygieneSanitation>,
    workAssociationData: WorkAssociationData
  ) => {
    // Create work with entity using the new endpoint
    const result = await workService.createWorkWithEntity(
      "HYGIENE_SANITATION",
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
        'HYGIENE_SANITATION',
        "Registro de higiene y sanidad creado correctamente"
      );

      fetchRecords();
      setShowConfirmation(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating hygiene sanitation record:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'HYGIENE_SANITATION',
        "No se pudo crear el registro de higiene y sanidad"
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
  
  // Function to handle updating a record
  const handleUpdateRecord = async (id: string | number, data: Partial<IHygieneSanitation>) => {
    try {
      const result = await hygieneSanitationService.updateHygieneSanitation(id, data);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'HYGIENE_SANITATION',
        "Registro de higiene y sanidad actualizado correctamente"
      );

      fetchRecords();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error(`Error updating hygiene sanitation record ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'HYGIENE_SANITATION',
        "No se pudo actualizar el registro de higiene y sanidad"
      );
    }
  };
  
  // Function to handle deleting a record
  const handleDeleteRecord = async (id: string | number) => {
    try {
      await hygieneSanitationService.softDeleteHygieneSanitation(id);
      
      toast({
        title: "Éxito",
        description: "Registro eliminado correctamente.",
      });
      
      // Refresh the list
      fetchRecords();
    } catch (error) {
      console.error(`Error deleting hygiene and sanitation record ${id}:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el registro. Por favor, intente nuevamente.",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: any) => {
    if (isEditMode && selectedRecord) {
      handleUpdateRecord(selectedRecord._id, data);
    } else {
      handleAddRecord(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (record: IHygieneSanitation) => {
    setSelectedRecord(record);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Function to render action buttons for each row
  const renderActions = (row: IHygieneSanitation) => {
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
          onClick={() => handleDeleteRecord(row._id)}
          title="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Higiene y Sanidad</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedRecord(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Registro
        </Button>
      </div>
      
      <Grid
        columns={columns}
        data={records}
        gridId="hygiene-sanitation"
        title="Registros de Higiene y Sanidad"
        expandableContent={expandableContent}
        actions={renderActions}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Registro" : "Agregar Nuevo Registro"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Actualice la información del registro existente."
                : "Complete el formulario para agregar un nuevo registro de higiene y sanidad."}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedRecord ? {
              ...selectedRecord,
              field3To20: selectedRecord.field3To20 ? selectedRecord.field3To20.join(', ') : ''
            } : undefined}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setIsEditMode(false);
                setSelectedRecord(null);
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
              ¿Está seguro que desea crear el registro de higiene y sanidad sin asociar un trabajo?
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
              entityType="hygieneSanitation"
              entityData={{
                id: "new-hygiene-sanitation"
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

export default HygieneSanitation; 