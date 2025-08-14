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
import { IWindCondition } from "@eon-lib/eon-mongoose";
import windConditionService from "@/_services/windConditionService";
import propertyService from "@/_services/propertyService";

interface WindConditionsProps {
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
const expandableContent = (row: IWindCondition) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.windConditionName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Nombre:</strong> {row.windConditionName || 'N/A'}
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

const WindConditions = ({ isModal = false }: WindConditionsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [windConditions, setWindConditions] = useState<IWindCondition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWindCondition, setSelectedWindCondition] = useState<IWindCondition | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  
  // Fetch windConditions and properties on component mount
  useEffect(() => {
    fetchWindConditions();
    fetchProperties();
  }, []);
  
  // Function to fetch windConditions data
  const fetchWindConditions = async () => {
    setIsLoading(true);
    try {
      const data = await windConditionService.findAll();
      setWindConditions(data);
    } catch (error) {
      console.error("Error loading wind conditions:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las condiciones de viento. Intente nuevamente.",
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
  
  // Function to handle adding a new windCondition
  const handleAddWindCondition = async (data: Partial<IWindCondition>) => {
    try {
      await windConditionService.createWindCondition(data);
      
      toast({
        title: "Éxito",
        description: "Condición de viento agregada correctamente.",
      });
      
      // Refresh data
      fetchWindConditions();
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar condición de viento:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la condición de viento. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a windCondition
  const handleUpdateWindCondition = async (id: string | number, data: Partial<IWindCondition>) => {
    try {
      await windConditionService.updateWindCondition(id, data);
      
      toast({
        title: "Éxito",
        description: "Condición de viento actualizada correctamente.",
      });
      
      // Refresh data
      fetchWindConditions();
      // Close dialog
      setIsDialogOpen(false);
      // Reset selected windCondition
      setSelectedWindCondition(null);
      // Reset edit mode
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar condición de viento ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la condición de viento. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a windCondition
  const handleDeleteWindCondition = async (id: string | number) => {
    try {
      await windConditionService.softDeleteWindCondition(id);
      
      toast({
        title: "Éxito",
        description: "Condición de viento eliminada correctamente.",
      });
      
      // Refresh data
      fetchWindConditions();
    } catch (error) {
      console.error(`Error al eliminar condición de viento ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la condición de viento. Intente nuevamente.",
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
      id: "windConditionName",
      header: "Nombre",
      accessor: "windConditionName",
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

  // Form configuration for adding new windCondition
  const getFormSections = useCallback((): SectionConfig[] => [
    {
      id: "windCondition-info",
      title: "Información de la Condición de Viento",
      description: "Ingrese los datos de la nueva condición de viento",
      fields: [
        {
          id: "windConditionName",
          type: "text",
          label: "Nombre *",
          name: "windConditionName",
          placeholder: "Ingrese nombre (ej: Calmo, Brisa ligera, Viento fuerte)",
          required: true,
          helperText: "Ingrese el nombre de la condición de viento"
        },
        {
          id: "order",
          type: "number",
          label: "Orden",
          name: "order",
          placeholder: "Ingrese el orden de la condición",
          required: false,
          helperText: "Orden de clasificación de la condición de viento"
        },
        {
          id: "assignedProperties",
          type: "checkboxGroup",
          label: "Predios Asignados",
          name: "assignedProperties",
          required: false,
          helperText: "Seleccione los predios donde estará disponible esta condición de viento (deje vacío para todos)",
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
          helperText: "Indica si la condición de viento está activa"
        }
      ],
    }
  ], [properties]);

  // Form validation schema
  const formValidationSchema = z.object({
    windConditionName: z.string().min(1, { message: "El nombre es obligatorio" }),
    order: z.number().optional(),
    state: z.boolean().default(true),
    assignedProperties: z.array(z.string()).optional().default([])
  });

  // Form submit handler
  const handleFormSubmit = (data: Partial<IWindCondition>) => {
    if (isEditMode && selectedWindCondition && selectedWindCondition._id) {
      handleUpdateWindCondition(selectedWindCondition._id, data);
    } else {
      handleAddWindCondition(data);
    }
  };

  // Handle edit button click
  const handleEditClick = (windCondition: IWindCondition) => {
    setSelectedWindCondition(windCondition);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: IWindCondition) => {
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
            if (window.confirm(`¿Está seguro de eliminar la condición ${row.windConditionName}?`)) {
              handleDeleteWindCondition(row._id);
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
          <h1 className="text-2xl font-bold">Condiciones de Viento</h1>
          <p className="text-muted-foreground">
            {isModal 
              ? "Gestione las condiciones de viento"
              : "Gestione las condiciones de viento para su organización"
            }
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedWindCondition(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Condición
        </Button>
      </div>

      <div className={isModal ? "px-0.5 h-[calc(100vh-200px)] overflow-hidden" : ""}>
        <Grid
          data={windConditions}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          isLoading={isLoading}
          gridId="windConditions-grid"
          idField="_id"
          title=""
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Condición de Viento" : "Agregar Nueva Condición de Viento"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} una condición de viento.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedWindCondition ? {
              windConditionName: selectedWindCondition.windConditionName,
              order: selectedWindCondition.order || 0,
              state: selectedWindCondition.state,
              assignedProperties: selectedWindCondition.assignedProperties || []
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

export default WindConditions;