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
import { IPressureUnit } from "@eon-lib/eon-mongoose/types";
import pressureUnitService from "@/_services/pressureUnitService";
import propertyService from "@/_services/propertyService";

interface PressureUnitProps {
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

// Expandable content for each row
const expandableContent = (row: IPressureUnit) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.pressureUnitName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Nombre:</strong> {row.pressureUnitName || 'N/A'}
        </p>
        <p>
          <strong>Código:</strong> {row.code || 'N/A'}
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

const PressureUnit = ({ isModal = false }: PressureUnitProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pressureUnits, setPressureUnits] = useState<IPressureUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPressureUnit, setSelectedPressureUnit] = useState<IPressureUnit | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  
  // Fetch pressureUnits and properties on component mount
  useEffect(() => {
    fetchPressureUnits();
    fetchProperties();
  }, []);
  
  // Function to fetch pressureUnits data
  const fetchPressureUnits = async () => {
    setIsLoading(true);
    try {
      const data = await pressureUnitService.findAll();
      setPressureUnits(data);
    } catch (error) {
      console.error("Error loading pressure units:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las unidades de presión. Intente nuevamente.",
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
  
  // Function to handle adding a new pressureUnit
  const handleAddPressureUnit = async (data: Partial<IPressureUnit>) => {
    try {
      await pressureUnitService.createPressureUnit(data);
      
      toast({
        title: "Éxito",
        description: "Unidad de presión agregada correctamente.",
      });
      
      // Refresh data
      fetchPressureUnits();
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar unidad de presión:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la unidad de presión. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a pressureUnit
  const handleUpdatePressureUnit = async (id: string | number, data: Partial<IPressureUnit>) => {
    try {
      await pressureUnitService.updatePressureUnit(id, data);
      
      toast({
        title: "Éxito",
        description: "Unidad de presión actualizada correctamente.",
      });
      
      // Refresh data
      fetchPressureUnits();
      // Close dialog
      setIsDialogOpen(false);
      // Reset selected pressureUnit
      setSelectedPressureUnit(null);
      // Reset edit mode
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar unidad de presión ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la unidad de presión. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a pressureUnit
  const handleDeletePressureUnit = async (id: string | number) => {
    try {
      await pressureUnitService.softDeletePressureUnit(id);
      
      toast({
        title: "Éxito",
        description: "Unidad de presión eliminada correctamente.",
      });
      
      // Refresh data
      fetchPressureUnits();
    } catch (error) {
      console.error(`Error al eliminar unidad de presión ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la unidad de presión. Intente nuevamente.",
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
      id: "pressureUnitName",
      header: "Nombre",
      accessor: "pressureUnitName",
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
    },
    {
      id: "order",
      header: "Orden",
      accessor: "order",
      visible: true,
      sortable: true,
    },    {
      id: "assignedProperties",
      header: "Predios Asignados",
      accessor: "assignedProperties",
      visible: true,
      render: (value: string[]) => {
        // Suponiendo que tienes acceso a la lista de propiedades en el scope del componente
        // y que cada propiedad tiene { id, name }
        // Si no, deberás ajustar para obtener los nombres de otra manera
        if (!value || value.length === 0) return 'Todos';
        if (!Array.isArray(value)) return 'Todos';
        // 'properties' debe estar disponible en el scope del componente
        if (typeof properties === "undefined" || !Array.isArray(properties)) return value.join(", ");
        const names = value
          .map((id) => {
            const prop = properties.find((p) => p.id === id);
            return prop ? prop.propertyName : id;
          })
          .filter(Boolean);
        return names.length > 0 ? names.join(", ") : 'Todas';
      },
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

  // Form configuration for adding new pressureUnit
  const getFormSections = useCallback((): SectionConfig[] => [
    {
      id: "pressureUnit-info",
      title: "Información de la Unidad de Presión",
      description: "Ingrese los datos de la nueva unidad de presión",
      fields: [
        {
          id: "pressureUnitName",
          type: "text",
          label: "Nombre *",
          name: "pressureUnitName",
          placeholder: "Ingrese nombre de la unidad (ej: bar, psi, Pa)",
          required: true,
          helperText: "Ingrese el nombre de la unidad de presión"
        },
        {
          id: "code",
          type: "text",
          label: "Código *",
          name: "code",
          placeholder: "Ingrese código (ej: BAR, PSI, PA)",
          required: true,
          helperText: "Código de la unidad de presión"
        },
        {
          id: "order",
          type: "number",
          label: "Orden",
          name: "order",
          placeholder: "Ingrese el orden de la unidad",
          required: false,
          helperText: "Orden de clasificación de la unidad de presión"
        },
        {
          id: "assignedProperties",
          type: "checkboxGroup",
          label: "Predios Asignados",
          name: "assignedProperties",
          required: false,
          helperText: "Seleccione los predios donde estará disponible esta unidad de presión (deje vacío para todos)",
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
          helperText: "Indica si la unidad de presión está activa"
        }
      ],
    }
  ], [properties]);

  // Form validation schema
  const formValidationSchema = z.object({
    pressureUnitName: z.string().min(1, { message: "El nombre es obligatorio" }),
    code: z.string().min(1, { message: "El código es obligatorio" }),
    order: z.number().optional(),
    state: z.boolean().default(true),
    assignedProperties: z.array(z.string()).optional().default([])
  });

  // Form submit handler
  const handleFormSubmit = (data: Partial<IPressureUnit>) => {
    if (isEditMode && selectedPressureUnit && selectedPressureUnit._id) {
      handleUpdatePressureUnit(selectedPressureUnit._id, data);
    } else {
      handleAddPressureUnit(data);
    }
  };

  // Handle edit button click
  const handleEditClick = (pressureUnit: IPressureUnit) => {
    setSelectedPressureUnit(pressureUnit);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: IPressureUnit) => {
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
            if (window.confirm(`¿Está seguro de eliminar la unidad ${row.pressureUnitName}?`)) {
              handleDeletePressureUnit(row._id);
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
          <h1 className="text-2xl font-bold">Unidades de Presión</h1>
          <p className="text-muted-foreground">
            {isModal 
              ? "Gestione las unidades de presión"
              : "Gestione las unidades de presión para su organización"
            }
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedPressureUnit(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Unidad
        </Button>
      </div>

      <div className={isModal ? "px-0.5 h-[calc(100vh-200px)] overflow-hidden" : ""}>
        <Grid
          data={pressureUnits}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          isLoading={isLoading}
          gridId="pressureUnits-grid"
          idField="_id"
          title=""
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Unidad de Presión" : "Agregar Nueva Unidad de Presión"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} una unidad de presión.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedPressureUnit ? {
              pressureUnitName: selectedPressureUnit.pressureUnitName,
              code: selectedPressureUnit.code,
              order: selectedPressureUnit.order || 0,
              state: selectedPressureUnit.state,
              assignedProperties: selectedPressureUnit.assignedProperties || []
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

export default PressureUnit;