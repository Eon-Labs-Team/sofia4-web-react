import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Droplets,
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
import { IIrrigationSectorCapacity } from "@eon-lib/eon-mongoose/types";
import irrigationSectorCapacityService from "@/_services/irrigationSectorCapacityService";
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
    id: "date",
    header: "Fecha",
    accessor: "date",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "variety",
    header: "Variedad",
    accessor: "variety",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "sector",
    header: "Sector",
    accessor: "sector",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "centerCost",
    header: "Centro de Costo",
    accessor: "centerCost",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "ltsByMin",
    header: "Litros por Minuto",
    accessor: "ltsByMin",
    visible: true,
    sortable: true,
  },
  {
    id: "pressure",
    header: "Presión",
    accessor: "pressure",
    visible: true,
    sortable: true,
  },
  {
    id: "pressureUnit",
    header: "Unidad de Presión",
    accessor: "pressureUnit",
    visible: true,
    sortable: true,
  },
  {
    id: "inCharge",
    header: "Responsable",
    accessor: "inCharge",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "createDate",
    header: "Fecha de Creación",
    accessor: "createDate",
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
    <h3 className="text-lg font-semibold mb-2">Aforo del Sector: {row.sector}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Fecha:</strong> {row.date}
        </p>
        <p>
          <strong>Variedad:</strong> {row.variety}
        </p>
        <p>
          <strong>Centro de Costo:</strong> {row.centerCost}
        </p>
        <p>
          <strong>Litros por Minuto:</strong> {row.ltsByMin}
        </p>
      </div>
      <div>
        <p>
          <strong>Presión:</strong> {row.pressure} {row.pressureUnit}
        </p>
        <p>
          <strong>Responsable:</strong> {row.inCharge}
        </p>
        <p>
          <strong>Fecha de Creación:</strong> {row.createDate}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new irrigation sector capacity
const formSections: SectionConfig[] = [
  {
    id: "irrigation-sector-capacity-info",
    title: "Información del Aforo por Sector de Riego",
    description: "Ingrese los datos del nuevo aforo",
    fields: [
      {
        id: "date",
        type: "text",
        label: "Fecha",
        name: "date",
        required: true,
        helperText: "Fecha en que se realizó el aforo"
      },
      {
        id: "variety",
        type: "text",
        label: "Variedad",
        name: "variety",
        placeholder: "Variedad de cultivo",
        required: true,
        helperText: "Variedad específica del cultivo"
      },
      {
        id: "sector",
        type: "text",
        label: "Sector",
        name: "sector",
        placeholder: "Sector de riego",
        required: true,
        helperText: "Sector donde se realizó el aforo"
      },
      {
        id: "centerCost",
        type: "text",
        label: "Centro de Costo",
        name: "centerCost",
        placeholder: "Centro de costo",
        required: true,
        helperText: "Centro de costo asociado"
      },
      {
        id: "ltsByMin",
        type: "number",
        label: "Litros por Minuto",
        name: "ltsByMin",
        placeholder: "Litros por minuto",
        required: true,
        helperText: "Cantidad de litros por minuto del aforo"
      },
      {
        id: "pressure",
        type: "number",
        label: "Presión",
        name: "pressure",
        placeholder: "Presión del agua",
        required: true,
        helperText: "Presión del agua en el sistema"
      },
      {
        id: "pressureUnit",
        type: "text",
        label: "Unidad de Presión",
        name: "pressureUnit",
        placeholder: "Ej: PSI, BAR",
        required: true,
        helperText: "Unidad de medida de la presión"
      },
      {
        id: "inCharge",
        type: "text",
        label: "Responsable",
        name: "inCharge",
        placeholder: "Nombre del responsable",
        required: true,
        helperText: "Persona responsable de realizar el aforo"
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
  variety: z.string().min(1, { message: "La variedad es obligatoria" }),
  sector: z.string().min(1, { message: "El sector es obligatorio" }),
  centerCost: z.string().min(1, { message: "El centro de costo es obligatorio" }),
  ltsByMin: z.number({ required_error: "Los litros por minuto son obligatorios" }),
  pressure: z.number({ required_error: "La presión es obligatoria" }),
  pressureUnit: z.string().min(1, { message: "La unidad de presión es obligatoria" }),
  inCharge: z.string().min(1, { message: "El responsable es obligatorio" }),
  state: z.boolean().default(true)
});

const IrrigationSectorCapacity = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [irrigationSectorCapacities, setIrrigationSectorCapacities] = useState<IIrrigationSectorCapacity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIrrigationSectorCapacity, setSelectedIrrigationSectorCapacity] = useState<IIrrigationSectorCapacity | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingData, setPendingData] = useState<Partial<IIrrigationSectorCapacity> | null>(null);
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
  
  // Fetch irrigation sector capacities on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchIrrigationSectorCapacities();
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
  
  // Function to fetch irrigation sector capacities data
  const fetchIrrigationSectorCapacities = async () => {
    setIsLoading(true);
    try {
      const response = await irrigationSectorCapacityService.findAll();

      const data = response && typeof response === 'object' && 'data' in response 
      ? response.data as IIrrigationSectorCapacity[]
      : Array.isArray(response) ? response as IIrrigationSectorCapacity[] : [] as IIrrigationSectorCapacity[];
      setIrrigationSectorCapacities(data);


    } catch (error) {
      console.error("Error loading irrigation sector capacities:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de aforo por sector de riego",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new irrigation sector capacity
  const handleAddIrrigationSectorCapacity = async (data: Partial<IIrrigationSectorCapacity>) => {
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
          'IRRIGATION_SECTOR_CAPACITY',
          "Aforo por sector de riego creado correctamente"
        );
      } else {
        // Create entity without work
        const result = await createEntityWithoutWork(pendingData);

        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'IRRIGATION_SECTOR_CAPACITY',
          "Aforo por sector de riego creado correctamente"
        );
      }

      fetchIrrigationSectorCapacities();
      setShowWorkWizard(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating irrigation sector capacity with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'IRRIGATION_SECTOR_CAPACITY',
        "No se pudo crear el aforo por sector de riego"
      );
    }
  };

  // Create entity without associated work
  const createEntityWithoutWork = async (data: Partial<IIrrigationSectorCapacity>) => {
    // Add current date as createDate if not provided
    if (!data.createDate) {
      data.createDate = new Date().toISOString().split('T')[0];
    }
    await irrigationSectorCapacityService.createIrrigationSectorCapacity(data);
  };

  // Create entity with associated work
  const createEntityWithWork = async (
    entityData: Partial<IIrrigationSectorCapacity>,
    workAssociationData: WorkAssociationData
  ) => {
    // Add current date as createDate if not provided
    if (!entityData.createDate) {
      entityData.createDate = new Date().toISOString().split('T')[0];
    }

    // Create work with entity using the new endpoint
    const result = await workService.createWorkWithEntity(
      "IRRIGATION_SECTOR_CAPACITY",
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
        'IRRIGATION_SECTOR_CAPACITY',
        "Aforo por sector de riego creado correctamente"
      );

      fetchIrrigationSectorCapacities();
      setShowConfirmation(false);
      setPendingData(null);

    } catch (error) {
      console.error("Error creating irrigation sector capacity:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'IRRIGATION_SECTOR_CAPACITY',
        "No se pudo crear el aforo por sector de riego"
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
  
  // Function to handle updating an irrigation sector capacity
  const handleUpdateIrrigationSectorCapacity = async (id: string | number, data: Partial<IIrrigationSectorCapacity>) => {
    try {
      const result = await irrigationSectorCapacityService.updateIrrigationSectorCapacity(id, data);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'IRRIGATION_SECTOR_CAPACITY',
        "Aforo por sector de riego actualizado correctamente"
      );

      fetchIrrigationSectorCapacities();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedIrrigationSectorCapacity(null);
    } catch (error) {
      console.error(`Error updating irrigation sector capacity ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'IRRIGATION_SECTOR_CAPACITY',
        "No se pudo actualizar el aforo por sector de riego"
      );
    }
  };
  
  // Function to handle deleting an irrigation sector capacity
  const handleDeleteIrrigationSectorCapacity = async (id: string | number) => {
    try {
      await irrigationSectorCapacityService.softDeleteIrrigationSectorCapacity(id);
      
      toast({
        title: "Éxito",
        description: "Aforo por sector de riego eliminado correctamente",
        variant: "default",
      });
      
      // Refresh the list
      fetchIrrigationSectorCapacities();
    } catch (error) {
      console.error(`Error deleting irrigation sector capacity ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el aforo por sector de riego",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission (both add and update)
  const handleFormSubmit = (data: Partial<IIrrigationSectorCapacity>) => {
    if (isEditMode && selectedIrrigationSectorCapacity?._id) {
      handleUpdateIrrigationSectorCapacity(selectedIrrigationSectorCapacity._id, data);
    } else {
      handleAddIrrigationSectorCapacity(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (irrigationSectorCapacity: IIrrigationSectorCapacity) => {
    setSelectedIrrigationSectorCapacity(irrigationSectorCapacity);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Function to render action buttons for each row
  const renderActions = (row: IIrrigationSectorCapacity) => {
    return (
      <div className="flex gap-2">
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
            handleDeleteIrrigationSectorCapacity(row._id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Aforo por Sector de Riego</h1>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedIrrigationSectorCapacity(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Aforo
        </Button>
      </div>
      
      <Grid
        gridId="irrigation-sector-capacity-grid"
        data={irrigationSectorCapacities}
        columns={columns}
        idField="_id"
        title="Aforo por Sector de Riego"
        expandableContent={expandableContent}
        actions={renderActions}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Aforo por Sector de Riego" : "Agregar Aforo por Sector de Riego"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique los detalles del aforo por sector de riego y guarde los cambios."
                : "Complete el formulario para agregar un nuevo aforo por sector de riego."}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode ? selectedIrrigationSectorCapacity || {} : {}}
          />

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setIsEditMode(false);
                setSelectedIrrigationSectorCapacity(null);
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
              ¿Está seguro que desea crear el aforo por sector de riego sin asociar un trabajo?
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
              entityType="irrigationSectorCapacity"
              entityData={{
                id: "new-irrigation-sector-capacity"
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

export default IrrigationSectorCapacity; 