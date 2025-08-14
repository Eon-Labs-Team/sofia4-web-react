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
import { IMeasurementUnits } from "@eon-lib/eon-mongoose";
import measurementUnitsService from "@/_services/measurementUnitsService";
import propertyService from "@/_services/propertyService";


interface MeasurementUnitsProps {
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


// Expandable content for each row
const expandableContent = (row: IMeasurementUnits) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.measurementUnitName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Nombre:</strong> {row.measurementUnitName || 'N/A'}
        </p>
        <p>
          <strong>Código:</strong> {row.optionalCode || 'N/A'}
        </p>
        <p>
          <strong>Orden:</strong> {row.order || 'N/A'}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? 'Activo' : 'Inactivo'}
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

const MeasurementUnits = ({ isModal = false }: MeasurementUnitsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [measurementUnits, setMeasurementUnits] = useState<IMeasurementUnits[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMeasurementUnit, setSelectedMeasurementUnit] = useState<IMeasurementUnits | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  
  // Fetch measurementUnits and properties on component mount
  useEffect(() => {
    fetchMeasurementUnits();
    fetchProperties();
  }, []);
  
  // Function to fetch measurementUnits data
  const fetchMeasurementUnits = async () => {
    setIsLoading(true);
    try {
      const data = await measurementUnitsService.findAll();
      setMeasurementUnits(data as IMeasurementUnits[]);
    } catch (error) {
      console.error("Error loading measurement units:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las unidades de medida. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch properties data
  const fetchProperties = async () => {
    try {
      const data = await propertyService.findAll();
      // Format properties for the selectable grid
      const formattedProperties = data.map((property: any) => ({
        id: property._id,
        propertyName: property.propertyName,
        region: property.region,
        city: property.city
      }));
      setProperties(formattedProperties);
    } catch (error) {
      console.error("Error loading properties:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los predios. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle adding a new measurementUnit
  const handleAddMeasurementUnit = async (data: Partial<IMeasurementUnits>) => {
    try {
      await measurementUnitsService.createMeasurementUnit(data)
      
      toast({
        title: "Éxito",
        description: "Unidad de medida agregada correctamente.",
      });
      
      // Refresh data
      fetchMeasurementUnits();
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar unidad de medida:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la unidad de medida. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a measurementUnit
  const handleUpdateMeasurementUnit = async (id: string | number, data: Partial<IMeasurementUnits>) => {
    try {
      await measurementUnitsService.updateMeasurementUnit(id,data)
      
      toast({
        title: "Éxito",
        description: "Unidad de medida actualizada correctamente.",
      });
      
      // Refresh data
      fetchMeasurementUnits();
      // Close dialog
      setIsDialogOpen(false);
      // Reset selected measurementUnit
      setSelectedMeasurementUnit(null);
      // Reset edit mode
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar unidad de medida ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la unidad de medida. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a measurementUnit
  const handleDeleteMeasurementUnit = async (id: string | number) => {
    try {
      await measurementUnitsService.softDeleteMeasurementUnit(id)
      
      toast({
        title: "Éxito",
        description: "Unidad de medida eliminada correctamente.",
      });
      
      // Refresh data
      fetchMeasurementUnits();
    } catch (error) {
      console.error(`Error al eliminar unidad de medida ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la unidad de medida. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const columns: Column[] = [
    {
      id: "id",
      header: "ID",
      accessor: "_id",
      visible: true,
      sortable: true,
    },
    {
      id: "measurementUnitName",
      header: "Nombre",
      accessor: "measurementUnitName",
      visible: true,
      sortable: true,
      groupable: true,
    },
    {
      id: "optionalCode",
      header: "Código",
      accessor: "optionalCode",
      visible: true,
      sortable: true,
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

  // Form configuration for adding new measurementUnit
  const getFormSections = useCallback((): SectionConfig[] => [
    {
      id: "measurementUnit-info",
      title: "Información de la Unidad",
      description: "Ingrese los datos de la nueva unidad de medida",
      fields: [
        {
          id: "measurementUnitName",
          type: "text",
          label: "Nombre *",
          name: "measurementUnitName",
          placeholder: "Ingrese nombre de la unidad (ej: kg, m, L)",
          required: true,
          helperText: "Ingrese el nombre o símbolo de la unidad de medida"
        },
        {
          id: "optionalCode",
          type: "text",
          label: "Código Opcional",
          name: "optionalCode",
          placeholder: "Ingrese código (ej: KG, M, LT)",
          required: false,
          helperText: "Código opcional de la unidad de medida"
        },
        {
          id: "order",
          type: "number",
          label: "Orden",
          name: "order",
          placeholder: "Ingrese el orden de la unidad",
          required: false,
          helperText: "Orden de clasificación de la unidad de medida"
        },
        {
          id: "assignedProperties",
          type: "checkboxGroup",
          label: "Predios Asignados",
          name: "assignedProperties",
          required: false,
          helperText: "Seleccione los predios donde estará disponible esta unidad de medida (deje vacío para todos)",
          options: properties.map(property => ({
            value: property.id,
            label: `${property.propertyName} - ${property.region}, ${property.city}`
          }))
        },
        {
          id: "state",
          type: "checkbox",
          label: "Activo",
          name: "state",
          required: false,
          helperText: "Indica si la unidad de medida está activa"
        }
      ],
    }
  ], [properties]);

  // Form validation schema
  const formValidationSchema = z.object({
    measurementUnitName: z.string().min(1, { message: "El nombre es obligatorio" }),
    optionalCode: z.string().optional(),
    order: z.number().optional(),
    state: z.boolean().default(true),
    assignedProperties: z.array(z.string()).optional().default([])
  });

  // Form submit handler
  const handleFormSubmit = (data: Partial<IMeasurementUnits>) => {
    if (isEditMode && selectedMeasurementUnit && selectedMeasurementUnit._id) {
      handleUpdateMeasurementUnit(selectedMeasurementUnit._id, data);
    } else {
      handleAddMeasurementUnit(data);
    }
  };

  // Handle edit button click
  const handleEditClick = (measurementUnit: IMeasurementUnits) => {
    setSelectedMeasurementUnit(measurementUnit);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: IMeasurementUnits) => {
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
            if (window.confirm(`¿Está seguro de eliminar la unidad ${row.measurementUnitName}?`)) {
              handleDeleteMeasurementUnit(row._id);
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
          <h1 className="text-2xl font-bold">Unidades de Medida</h1>
          <p className="text-muted-foreground">
            {isModal 
              ? "Gestione las unidades de medida"
              : "Gestione las unidades de medida para su organización"
            }
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedMeasurementUnit(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Unidad
        </Button>
      </div>

      <div className={isModal ? "px-0.5 h-[calc(100vh-200px)] overflow-hidden" : ""}>
        <Grid
          data={measurementUnits}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          isLoading={isLoading}
          gridId="measurementUnits-grid"
          idField="_id"
          title=""
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Unidad" : "Agregar Nueva Unidad"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} una unidad de medida.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedMeasurementUnit ? {
              measurementUnitName: selectedMeasurementUnit.measurementUnitName,
              optionalCode: selectedMeasurementUnit.optionalCode || "",
              order: selectedMeasurementUnit.order || 0,
              state: selectedMeasurementUnit.state,
              assignedProperties: selectedMeasurementUnit.assignedProperties || []
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

export default MeasurementUnits;