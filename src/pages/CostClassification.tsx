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
import { ICostClassification } from "@eon-lib/eon-mongoose";
import costClassificationService from "@/_services/costClassificationService";
import propertyService from "@/_services/propertyService";
import { toast } from "@/components/ui/use-toast";

// Extended interface for CostClassification with MongoDB _id
interface CostClassificationWithId extends ICostClassification {
  _id: string;
}

interface CostClassificationProps {
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





const CostClassification = ({ isModal = false }: CostClassificationProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [costClassifications, setCostClassifications] = useState<CostClassificationWithId[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCostClassification, setSelectedCostClassification] = useState<CostClassificationWithId | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch costClassifications on component mount
  useEffect(() => {
    fetchCostClassifications();
    fetchProperties();
  }, []);

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
    id: "name",
    header: "Nombre",
    accessor: "name",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "assignedProperties",
    header: "Predios Asignados",
    accessor: "assignedProperties",
    visible: true,
    render: (value: string[], row: any) => {
      if (!value || value.length === 0) return 'Todos';
      if (!Array.isArray(value)) return 'Todos';
      if (typeof properties === "undefined" || !Array.isArray(properties)) return value.join(", ");
      const names = value
        .map((id) => {
          const prop = properties.find((p) => p.id === id);
          return prop ? prop.propertyName : id;
        })
        .filter(Boolean);
      return names.length > 0 ? names.join(", ") : 'Todos';
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

// Expandable content for each row
const expandableContent = (row: CostClassificationWithId) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.name}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Estado:</strong> {row.state ? 'Activo' : 'Inactivo'}
        </p>
        <p>
          <strong>Predios Asignados:</strong> {row.assignedProperties && row.assignedProperties.length > 0 ? 
            properties.length > 0 ? 
              row.assignedProperties
                .map((id) => {
                  const prop = properties.find((p) => p.id === id);
                  return prop ? prop.propertyName : id;
                })
                .filter(Boolean)
                .join(", ") || 'Todos'
              : row.assignedProperties.join(", ")
            : 'Todos'
          }
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
          <strong>Creado por:</strong> {row.createdBy || 'N/A'}
        </p>
      </div>
    </div>
  </div>
);
  
  // Function to fetch costClassifications data
  const fetchCostClassifications = async () => {
    setIsLoading(true);
    try {
      const data = await costClassificationService.findAll();
      setCostClassifications(data as CostClassificationWithId[]);
    } catch (error) {
      console.error("Error loading cost classifications:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las clasificaciones de costos. Intente nuevamente.",
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
  
  // Function to handle adding a new costClassification
  const handleAddCostClassification = async (data: Partial<ICostClassification>) => {
    try {
      await costClassificationService.create(data);
      
      toast({
        title: "Éxito",
        description: "Clasificación de costo agregada correctamente.",
      });
      
      // Refresh data
      fetchCostClassifications();
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar clasificación de costo:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la clasificación de costo. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a costClassification
  const handleUpdateCostClassification = async (id: string | number, data: Partial<ICostClassification>) => {
    try {
      await costClassificationService.update(id, data);
      
      toast({
        title: "Éxito",
        description: "Clasificación de costo actualizada correctamente.",
      });
      
      // Refresh data
      fetchCostClassifications();
      // Close dialog
      setIsDialogOpen(false);
      // Reset selected costClassification
      setSelectedCostClassification(null);
      // Reset edit mode
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar clasificación de costo ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la clasificación de costo. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a costClassification
  const handleDeleteCostClassification = async (id: string | number) => {
    try {
      await costClassificationService.softDelete(id);
      
      toast({
        title: "Éxito",
        description: "Clasificación de costo eliminada correctamente.",
      });
      
      // Refresh data
      fetchCostClassifications();
    } catch (error) {
      console.error(`Error al eliminar clasificación de costo ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la clasificación de costo. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Form configuration for adding new costClassification
  const getFormSections = useCallback((): SectionConfig[] => [
    {
      id: "costClassification-info",
      title: "Información de la Clasificación",
      description: "Ingrese los datos de la nueva clasificación de costo",
      fields: [
        {
          id: "name",
          type: "text",
          label: "Nombre *",
          name: "name",
          placeholder: "Ingrese nombre de la clasificación",
          required: true,
          helperText: "Ingrese el nombre identificativo de la clasificación"
        },
        {
          id: "state",
          type: "checkbox",
          label: "Activo",
          name: "state",
          required: false,
          helperText: "Indica si la clasificación está activa"
        },
        {
          id: "assignedProperties",
          type: "checkboxGroup",
          label: "Predios Asignados",
          name: "assignedProperties",
          required: false,
          helperText: "Seleccione los predios donde estará disponible esta clasificación (deje vacío para todos)",
          options: properties.map(property => ({
            value: property.id,
            label: `${property.propertyName} - ${property.region}, ${property.city}`
          }))
        }
      ],
    }
  ], [properties]);

  // Form validation schema
  const formValidationSchema = z.object({
    name: z.string().min(1, { message: "El nombre es obligatorio" }),
    state: z.boolean().default(true),
    assignedProperties: z.array(z.string()).optional().default([])
  });

  // Form submit handler
  const handleFormSubmit = (data: Partial<ICostClassification>) => {
    if (isEditMode && selectedCostClassification && selectedCostClassification._id) {
      handleUpdateCostClassification(selectedCostClassification._id, data);
    } else {
      handleAddCostClassification(data);
    }
  };

  // Handle edit button click
  const handleEditClick = (costClassification: CostClassificationWithId) => {
    setSelectedCostClassification(costClassification);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: CostClassificationWithId) => {
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
            if (window.confirm(`¿Está seguro de eliminar la clasificación ${row.name}?`)) {
              handleDeleteCostClassification(row._id);
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
          <h1 className="text-2xl font-bold">Clasificaciones de Costos</h1>
          <p className="text-muted-foreground">
            {isModal 
              ? "Gestione las clasificaciones de costos"
              : "Gestione las clasificaciones de costos para su organización"
            }
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedCostClassification(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Clasificación
        </Button>
      </div>

      <div className={isModal ? "px-0.5 h-[calc(100vh-200px)] overflow-hidden" : ""}>
        <Grid
          data={costClassifications}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          isLoading={isLoading}
          gridId="costClassifications-grid"
          idField="_id"
          title=""
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Clasificación" : "Agregar Nueva Clasificación"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} una clasificación de costo.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedCostClassification ? {
              name: selectedCostClassification.name,
              state: selectedCostClassification.state,
              assignedProperties: selectedCostClassification.assignedProperties || []
            } : {
              state: true,
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

export default CostClassification;