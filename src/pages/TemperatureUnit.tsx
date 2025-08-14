import { useState, useEffect, useCallback } from "react";
import { Grid } from "@/components/Grid/Grid";
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
import { toast } from "@/components/ui/use-toast";
import { ITemperatureUnit } from "@eon-lib/eon-mongoose";
import temperatureUnitService from "@/_services/temperatureUnitService";

interface TemperatureUnitProps {
  isModal?: boolean;
}

// Render function for the boolean fields
const renderBoolean = (value: boolean) => {
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
    id: "temperatureUnitName",
    header: "Nombre",
    accessor: "temperatureUnitName",
    visible: true,
    sortable: true,
    groupable: true,
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
    id: "order",
    header: "Orden",
    accessor: "order",
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
    render: renderBoolean,
  },
];

// Expandable content for each row
const expandableContent = (row: ITemperatureUnit) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.temperatureUnitName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Nombre:</strong> {row.temperatureUnitName || 'N/A'}
        </p>
        <p>
          <strong>Código:</strong> {row.code || 'N/A'}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? 'Activo' : 'Inactivo'}
        </p>
        <p>
          <strong>Orden:</strong> {row.order || 'N/A'}
        </p>
      </div>
      <div>
        <p>
          <strong>Creado:</strong> {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
        </p>
        <p>
          <strong>Actualizado:</strong> {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : 'N/A'}
        </p>
        <p>
          <strong>Predios Asignados:</strong> {row.assignedProperties && row.assignedProperties.length > 0 ? row.assignedProperties.join(", ") : 'Todos'}
        </p>
      </div>
    </div>
  </div>
);

const TemperatureUnit = ({ isModal = false }: TemperatureUnitProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [temperatureUnits, setTemperatureUnits] = useState<ITemperatureUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemperatureUnit, setSelectedTemperatureUnit] = useState<ITemperatureUnit | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch temperatureUnits on component mount
  useEffect(() => {
    fetchTemperatureUnits();
  }, []);
  
  // Function to fetch temperatureUnits data
  const fetchTemperatureUnits = async () => {
    setIsLoading(true);
    try {
      const data = await temperatureUnitService.findAll();
      setTemperatureUnits(data);
    } catch (error) {
      console.error("Error loading temperature units:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las unidades de temperatura. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new temperatureUnit
  const handleAddTemperatureUnit = async (data: Partial<ITemperatureUnit>) => {
    try {
      await temperatureUnitService.createTemperatureUnit(data);
      
      toast({
        title: "Éxito",
        description: "Unidad de temperatura agregada correctamente.",
      });
      
      // Refresh data
      fetchTemperatureUnits();
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar unidad de temperatura:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la unidad de temperatura. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a temperatureUnit
  const handleUpdateTemperatureUnit = async (id: string | number, data: Partial<ITemperatureUnit>) => {
    try {
      await temperatureUnitService.updateTemperatureUnit(id, data);
      
      toast({
        title: "Éxito",
        description: "Unidad de temperatura actualizada correctamente.",
      });
      
      // Refresh data
      fetchTemperatureUnits();
      // Close dialog
      setIsDialogOpen(false);
      // Reset selected temperatureUnit
      setSelectedTemperatureUnit(null);
      // Reset edit mode
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar unidad de temperatura ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la unidad de temperatura. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a temperatureUnit
  const handleDeleteTemperatureUnit = async (id: string | number) => {
    try {
      await temperatureUnitService.softDeleteTemperatureUnit(id);
      
      toast({
        title: "Éxito",
        description: "Unidad de temperatura eliminada correctamente.",
      });
      
      // Refresh data
      fetchTemperatureUnits();
    } catch (error) {
      console.error(`Error al eliminar unidad de temperatura ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la unidad de temperatura. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Form configuration for adding new temperatureUnit
  const getFormSections = useCallback((): SectionConfig[] => [
    {
      id: "temperatureUnit-info",
      title: "Información de la Unidad de Temperatura",
      description: "Ingrese los datos de la nueva unidad de temperatura",
      fields: [
        {
          id: "temperatureUnitName",
          type: "text",
          label: "Nombre *",
          name: "temperatureUnitName",
          placeholder: "Ingrese nombre de la unidad (ej: Celsius, Fahrenheit)",
          required: true,
          helperText: "Ingrese el nombre de la unidad de temperatura"
        },
        {
          id: "code",
          type: "text",
          label: "Código *",
          name: "code",
          placeholder: "Ingrese código (ej: °C, °F, K)",
          required: true,
          helperText: "Ingrese el código o símbolo de la unidad de temperatura"
        },
        {
          id: "order",
          type: "number",
          label: "Orden",
          name: "order",
          placeholder: "Ingrese el orden de la unidad",
          required: false,
          helperText: "Orden de clasificación de la unidad de temperatura"
        },
        {
          id: "state",
          type: "checkbox",
          label: "Activo",
          name: "state",
          required: false,
          helperText: "Indica si la unidad de temperatura está activa"
        }
      ],
    }
  ], []);

  // Form validation schema
  const formValidationSchema = z.object({
    temperatureUnitName: z.string().min(1, { message: "El nombre es obligatorio" }),
    code: z.string().min(1, { message: "El código es obligatorio" }),
    order: z.number().optional(),
    state: z.boolean().default(true),
    assignedProperties: z.array(z.string()).optional().default([])
  });

  // Form submit handler
  const handleFormSubmit = (data: Partial<ITemperatureUnit>) => {
    if (isEditMode && selectedTemperatureUnit && selectedTemperatureUnit._id) {
      handleUpdateTemperatureUnit(selectedTemperatureUnit._id, data);
    } else {
      handleAddTemperatureUnit(data);
    }
  };

  // Handle edit button click
  const handleEditClick = (temperatureUnit: ITemperatureUnit) => {
    setSelectedTemperatureUnit(temperatureUnit);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: ITemperatureUnit) => {
    return (
      <div className="flex items-center space-x-2">
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
            if (window.confirm(`¿Está seguro de eliminar la unidad ${row.temperatureUnitName}?`)) {
              handleDeleteTemperatureUnit(row._id);
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className={isModal ? "w-full h-full overflow-hidden" : "container mx-auto py-6"}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Unidades de Temperatura</h1>
          <p className="text-muted-foreground">
            {isModal 
              ? "Gestione las unidades de temperatura"
              : "Gestione las unidades de temperatura para su organización"
            }
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedTemperatureUnit(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Unidad
        </Button>
      </div>

      <div className={isModal ? "px-0.5 h-[calc(100vh-200px)] overflow-hidden" : ""}>
        <Grid
          data={temperatureUnits}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          isLoading={isLoading}
          gridId="temperatureUnits-grid"
          idField="_id"
          title=""
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Unidad de Temperatura" : "Agregar Nueva Unidad de Temperatura"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} una unidad de temperatura.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedTemperatureUnit ? {
              temperatureUnitName: selectedTemperatureUnit.temperatureUnitName,
              code: selectedTemperatureUnit.code,
              order: selectedTemperatureUnit.order || 0,
              state: selectedTemperatureUnit.state,
              assignedProperties: selectedTemperatureUnit.assignedProperties || []
            } : {
              state: true,
              order: 0,
              assignedProperties: []
            }}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
          />
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="dynamic-form">
              {isEditMode ? "Actualizar" : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TemperatureUnit;