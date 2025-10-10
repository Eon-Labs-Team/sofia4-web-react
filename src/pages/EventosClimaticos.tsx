import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Calendar,
  CheckCircle,
  XCircle,
  CloudRain,
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
import { IWeatherEvent } from "@eon-lib/eon-mongoose/types";
import weatherEventService from "@/_services/weatherEventService";
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

// Column configuration for the grid - based on IWeatherEvent model
const columns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: true,
    sortable: true,
  },
  {
    id: "eventDate",
    header: "Fecha del evento",
    accessor: "eventDate",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "temperature",
    header: "Temperatura",
    accessor: "temperature",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "temperatureUnit",
    header: "Unidad de temperatura",
    accessor: "temperatureUnit",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "damp",
    header: "Humedad",
    accessor: "damp",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "precipitation",
    header: "Precipitación",
    accessor: "precipitation",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "windSpeed",
    header: "Velocidad del viento",
    accessor: "windSpeed",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "sunRadiation",
    header: "Radiación solar",
    accessor: "sunRadiation",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "others",
    header: "Otros",
    accessor: "others",
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
    <h3 className="text-lg font-semibold mb-2">Evento del {row.eventDate}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p><strong>Temperatura:</strong> {row.temperature} {row.temperatureUnit}</p>
        <p><strong>Humedad:</strong> {row.damp}%</p>
        <p><strong>Precipitación:</strong> {row.precipitation} mm</p>
      </div>
      <div>
        <p><strong>Velocidad del viento:</strong> {row.windSpeed} km/h</p>
        <p><strong>Radiación solar:</strong> {row.sunRadiation} W/m²</p>
        <p><strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}</p>
      </div>
      <div className="col-span-2">
        <p><strong>Otros detalles:</strong> {row.others || 'No hay información adicional'}</p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new weather event
const formSections: SectionConfig[] = [
  {
    id: "weather-event-info",
    title: "Información del Evento Climático",
    description: "Ingrese los datos del nuevo evento climático",
    fields: [
      {
        id: "eventDate",
        type: "text",
        label: "Fecha del Evento",
        name: "eventDate",
        required: true,
        helperText: "Ingrese la fecha en que ocurrió el evento climático"
      },
      {
        id: "temperature",
        type: "number",
        label: "Temperatura",
        name: "temperature",
        placeholder: "Ej: 25",
        required: true,
        helperText: "Ingrese la temperatura registrada"
      },
      {
        id: "temperatureUnit",
        type: "select",
        label: "Unidad de Temperatura",
        name: "temperatureUnit",
        required: true,
        helperText: "Seleccione la unidad de medida de temperatura",
        options: [
          { label: "Celsius (°C)", value: "°C" },
          { label: "Fahrenheit (°F)", value: "°F" }
        ]
      },
      {
        id: "damp",
        type: "number",
        label: "Humedad (%)",
        name: "damp",
        placeholder: "Ej: 65",
        required: true,
        helperText: "Ingrese el porcentaje de humedad"
      },
      {
        id: "precipitation",
        type: "number",
        label: "Precipitación (mm)",
        name: "precipitation",
        placeholder: "Ej: 10",
        required: true,
        helperText: "Ingrese la cantidad de precipitación en milímetros"
      },
      {
        id: "windSpeed",
        type: "number",
        label: "Velocidad del Viento (km/h)",
        name: "windSpeed",
        placeholder: "Ej: 15",
        required: true,
        helperText: "Ingrese la velocidad del viento en km/h"
      },
      {
        id: "sunRadiation",
        type: "number",
        label: "Radiación Solar (W/m²)",
        name: "sunRadiation",
        placeholder: "Ej: 800",
        required: true,
        helperText: "Ingrese la radiación solar en vatios por metro cuadrado"
      },
      {
        id: "others",
        type: "textarea",
        label: "Otros Detalles",
        name: "others",
        placeholder: "Ingrese información adicional sobre el evento",
        required: false,
        helperText: "Detalles adicionales sobre el evento climático (opcional)"
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
  eventDate: z.string().min(1, { message: "La fecha del evento es obligatoria" }),
  temperature: z.number({ required_error: "La temperatura es obligatoria" }),
  temperatureUnit: z.string().min(1, { message: "La unidad de temperatura es obligatoria" }),
  damp: z.number({ required_error: "El porcentaje de humedad es obligatorio" }),
  precipitation: z.number({ required_error: "La precipitación es obligatoria" }),
  windSpeed: z.number({ required_error: "La velocidad del viento es obligatoria" }),
  sunRadiation: z.number({ required_error: "La radiación solar es obligatoria" }),
  others: z.string().optional(),
  state: z.boolean().default(true)
});

const EventosClimaticos = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [weatherEvents, setWeatherEvents] = useState<IWeatherEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWeatherEvent, setSelectedWeatherEvent] = useState<IWeatherEvent | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWorkQuestion, setShowWorkQuestion] = useState(false);
  const [showWorkWizard, setShowWorkWizard] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingWeatherEventData, setPendingWeatherEventData] = useState<Partial<IWeatherEvent> | null>(null);
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
  
  // Fetch weather events on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchWeatherEvents();
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
  
  // Function to fetch weather events data
  const fetchWeatherEvents = async () => {
    setIsLoading(true);
    try {
      const response = await weatherEventService.findAll();
      // Verificar si la respuesta es un objeto con una propiedad data o directamente un array
      setWeatherEvents(Array.isArray(response) ? response : (response as any).data || []);
    } catch (error) {
      console.error("Error loading weather events:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los eventos climáticos. Intente nuevamente más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new weather event
  const handleAddWeatherEvent = async (data: Partial<IWeatherEvent>) => {
    // Store the data and show the work association question
    setPendingWeatherEventData(data);
    setIsDialogOpen(false);
    setShowWorkQuestion(true);
  };

  // Function to handle work association completion
  const handleWorkAssociation = async (workAssociationData: WorkAssociationData) => {
    try {
      if (!pendingWeatherEventData) return;

      if (workAssociationData.associateWork) {
        // Create weather event with associated work
        const result = await createWeatherEventWithWork(pendingWeatherEventData, workAssociationData);

        // Handle enhanced response format
        handleResponseWithFallback(
          result,
          'creation',
          'WEATHER_EVENT',
          "Evento climático creado correctamente"
        );
      } else {
        // Create weather event without work
        const result = await createWeatherEventWithoutWork(pendingWeatherEventData);

        // Handle enhanced response format for single entity creation
        handleResponseWithFallback(
          result,
          'creation',
          'WEATHER_EVENT',
          "Evento climático creado correctamente"
        );
      }

      fetchWeatherEvents();
      setShowWorkWizard(false);
      setPendingWeatherEventData(null);

    } catch (error) {
      console.error("Error creating weather event with work association:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'WEATHER_EVENT',
        "No se pudo crear el evento climático"
      );
    }
  };

  // Create weather event without associated work
  const createWeatherEventWithoutWork = async (data: Partial<IWeatherEvent>) => {
    await weatherEventService.createWeatherEvent(data);
  };

  // Create weather event with associated work
  const createWeatherEventWithWork = async (
    weatherEventData: Partial<IWeatherEvent>,
    workAssociationData: WorkAssociationData
  ) => {
    // Create work with entity using the new endpoint
    const result = await workService.createWorkWithEntity(
      "WEATHER_EVENT",
      weatherEventData,
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
      if (!pendingWeatherEventData) return;

      const result = await createWeatherEventWithoutWork(pendingWeatherEventData);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'creation',
        'WEATHER_EVENT',
        "Evento climático creado correctamente"
      );

      fetchWeatherEvents();
      setShowConfirmation(false);
      setPendingWeatherEventData(null);

    } catch (error) {
      console.error("Error creating weather event:", error);

      handleErrorWithEnhancedFormat(
        error,
        'creation',
        'WEATHER_EVENT',
        "No se pudo crear el evento climático"
      );
    }
  };

  // Function to handle work wizard cancellation
  const handleWorkWizardCancel = () => {
    setShowWorkWizard(false);
    setPendingWeatherEventData(null);
  };

  // Function to cancel all operations
  const handleCancelAll = () => {
    setShowWorkQuestion(false);
    setShowWorkWizard(false);
    setShowConfirmation(false);
    setPendingWeatherEventData(null);
  };

  // Function to handle updating an existing weather event
  const handleUpdateWeatherEvent = async (id: string | number, data: Partial<IWeatherEvent>) => {
    try {
      const result = await weatherEventService.updateWeatherEvent(id, data);

      // Handle enhanced response format
      handleResponseWithFallback(
        result,
        'update',
        'WEATHER_EVENT',
        "Evento climático actualizado correctamente"
      );

      fetchWeatherEvents();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedWeatherEvent(null);
    } catch (error) {
      console.error(`Error updating weather event ${id}:`, error);

      handleErrorWithEnhancedFormat(
        error,
        'update',
        'WEATHER_EVENT',
        "No se pudo actualizar el evento climático"
      );
    }
  };

  // Function to handle deleting a weather event
  const handleDeleteWeatherEvent = async (id: string | number) => {
    try {
      await weatherEventService.softDeleteWeatherEvent(id);
      setWeatherEvents((prevEvents) => prevEvents.filter((event) => event._id !== id));
      toast({
        title: "Evento climático eliminado",
        description: "El evento climático ha sido eliminado exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting weather event:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento climático. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IWeatherEvent>) => {
    if (isEditMode && selectedWeatherEvent?._id) {
      handleUpdateWeatherEvent(selectedWeatherEvent._id, data);
    } else {
      handleAddWeatherEvent(data);
    }
  };

  // Function to set up edit mode
  const handleEditClick = (weatherEvent: IWeatherEvent) => {
    setSelectedWeatherEvent(weatherEvent);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: IWeatherEvent) => {
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
          onClick={() => handleDeleteWeatherEvent(row._id as string)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Eventos Climáticos</h1>
        <Button 
          onClick={() => {
            setIsEditMode(false);
            setSelectedWeatherEvent(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Evento
        </Button>
      </div>

      <Grid
        data={weatherEvents}
        columns={columns}
        idField="_id"
        title="Eventos Climáticos"
        expandableContent={expandableContent}
        gridId="weather-events-grid"
        actions={renderActions}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Evento Climático" : "Agregar Nuevo Evento Climático"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Actualice la información del evento climático seleccionado."
                : "Ingrese los detalles del nuevo evento climático."}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedWeatherEvent ? selectedWeatherEvent : {
              temperatureUnit: "°C",
              state: true
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
              ¿Está seguro que desea crear el evento climático sin asociar un trabajo?
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

          {showWorkWizard && pendingWeatherEventData && (
            <WorkAssociationWizard
              entityType="eventosClimaticos"
              entityData={{
                id: "new-weather-event"
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

export default EventosClimaticos; 