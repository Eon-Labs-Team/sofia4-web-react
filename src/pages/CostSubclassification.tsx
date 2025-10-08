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
import { ICostSubclassification, ICostClassification } from "@eon-lib/eon-mongoose/types";
import costSubclassificationService from "@/_services/costSubclassificationService";
import costClassificationService from "@/_services/costClassificationService";
import propertyService from "@/_services/propertyService";
import { toast } from "@/components/ui/use-toast";

interface CostSubclassificationProps {
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

const CostSubclassification = ({ isModal = false }: CostSubclassificationProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [costSubclassifications, setCostSubclassifications] = useState<ICostSubclassification[]>([]);
  const [costClassifications, setCostClassifications] = useState<ICostClassification[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCostSubclassification, setSelectedCostSubclassification] = useState<ICostSubclassification | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Column configuration for the grid
  const columns: Column[] = [
    {
      id: "id",
      header: "ID",
      accessor: "_id",
      visible: false,
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
      id: "costClassificationId",
      header: "Clasificación padre",
      accessor: "costClassificationId",
      visible: true,
      sortable: true,
      groupable: true,
      render: (costClassificationId: string) => {
        const classification = costClassifications.find(cls => cls._id === costClassificationId);
        return classification?.name || 'Sin clasificación';
      },
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
  const expandableContent = (row: ICostSubclassification) => {
    const parentClassification = costClassifications.find(cls => cls._id === row.costClassificationId);
    
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{row.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Nombre:</strong> {row.name || 'N/A'}
            </p>
            <p>
              <strong>Clasificación padre:</strong> {parentClassification?.name || 'Sin clasificación'}
            </p>
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
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchCostSubclassifications();
    fetchCostClassifications();
    fetchProperties();
  }, []);
  
  // Function to fetch costSubclassifications data
  const fetchCostSubclassifications = async () => {
    setIsLoading(true);
    try {
      const data = await costSubclassificationService.findAll();
      setCostSubclassifications(data as ICostSubclassification[]);
    } catch (error) {
      console.error("Error loading cost subclassifications:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las subclasificaciones de costos. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch cost classifications for the dropdown
  const fetchCostClassifications = async () => {
    try {
      const data = await costClassificationService.findAll();
      setCostClassifications(data as ICostClassification[]);
    } catch (error) {
      console.error("Error loading cost classifications:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las clasificaciones de costos.",
        variant: "destructive",
      });
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
  
  // Function to handle adding a new costSubclassification
  const handleAddCostSubclassification = async (data: Partial<ICostSubclassification>) => {
    try {
      await costSubclassificationService.create(data);
      
      toast({
        title: "Éxito",
        description: "Subclasificación de costo agregada correctamente.",
      });
      
      // Refresh data
      fetchCostSubclassifications();
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar subclasificación de costo:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la subclasificación de costo. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a costSubclassification
  const handleUpdateCostSubclassification = async (id: string | number, data: Partial<ICostSubclassification>) => {
    try {
      await costSubclassificationService.update(id, data);
      
      toast({
        title: "Éxito",
        description: "Subclasificación de costo actualizada correctamente.",
      });
      
      // Refresh data
      fetchCostSubclassifications();
      // Close dialog
      setIsDialogOpen(false);
      // Reset selected costSubclassification
      setSelectedCostSubclassification(null);
      // Reset edit mode
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar subclasificación de costo ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la subclasificación de costo. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a costSubclassification
  const handleDeleteCostSubclassification = async (id: string | number) => {
    try {
      await costSubclassificationService.softDelete(id);
      
      toast({
        title: "Éxito",
        description: "Subclasificación de costo eliminada correctamente.",
      });
      
      // Refresh data
      fetchCostSubclassifications();
    } catch (error) {
      console.error(`Error al eliminar subclasificación de costo ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la subclasificación de costo. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Form configuration for adding new costSubclassification
  const getFormSections = useCallback((): SectionConfig[] => [
    {
      id: "costSubclassification-info",
      title: "Información de la Subclasificación",
      description: "Ingrese los datos de la nueva subclasificación de costo",
      fields: [
        {
          id: "name",
          type: "text",
          label: "Nombre *",
          name: "name",
          placeholder: "Ingrese nombre de la subclasificación",
          required: true,
          helperText: "Ingrese el nombre identificativo de la subclasificación"
        },
        {
          id: "costClassificationId",
          type: "select",
          label: "Clasificación padre *",
          name: "costClassificationId",
          placeholder: "Seleccione una clasificación",
          required: true,
          helperText: "Seleccione la clasificación a la que pertenece esta subclasificación",
          options: costClassifications.map(classification => ({
            value: classification._id,
            label: classification.name
          }))
        },
        {
          id: "state",
          type: "checkbox",
          label: "Activo",
          name: "state",
          required: false,
          helperText: "Indica si la subclasificación está activa"
        },
        {
          id: "assignedProperties",
          type: "checkboxGroup",
          label: "Predios Asignados",
          name: "assignedProperties",
          required: false,
          helperText: "Seleccione los predios donde estará disponible esta subclasificación (deje vacío para todos)",
          options: properties.map(property => ({
            value: property.id,
            label: `${property.propertyName} - ${property.region}, ${property.city}`
          }))
        }
      ],
    }
  ], [costClassifications, properties]);

  // Form validation schema
  const formValidationSchema = z.object({
    name: z.string().min(1, { message: "El nombre es obligatorio" }),
    costClassificationId: z.string().min(1, { message: "La clasificación padre es obligatoria" }),
    state: z.boolean().default(true),
    assignedProperties: z.array(z.string()).optional().default([])
  });

  // Form submit handler
  const handleFormSubmit = (data: Partial<ICostSubclassification>) => {
    if (isEditMode && selectedCostSubclassification && selectedCostSubclassification._id) {
      handleUpdateCostSubclassification(selectedCostSubclassification._id, data);
    } else {
      handleAddCostSubclassification(data);
    }
  };

  // Handle edit button click
  const handleEditClick = (costSubclassification: ICostSubclassification) => {
    setSelectedCostSubclassification(costSubclassification);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: ICostSubclassification) => {
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
            if (window.confirm(`¿Está seguro de eliminar la subclasificación ${row.name}?`)) {
              handleDeleteCostSubclassification(row._id);
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
          <h1 className="text-2xl font-bold">Subclasificaciones de Costos</h1>
          <p className="text-muted-foreground">
            {isModal 
              ? "Gestione las subclasificaciones de costos"
              : "Gestione las subclasificaciones de costos para su organización"
            }
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedCostSubclassification(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Subclasificación
        </Button>
      </div>

      <div className={isModal ? "px-0.5 h-[calc(100vh-200px)] overflow-hidden" : ""}>
        <Grid
          data={costSubclassifications}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          isLoading={isLoading}
          gridId="costSubclassifications-grid"
          idField="_id"
          title=""
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Subclasificación" : "Agregar Nueva Subclasificación"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} una subclasificación de costo.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedCostSubclassification ? {
              name: selectedCostSubclassification.name,
              costClassificationId: selectedCostSubclassification.costClassificationId,
              state: selectedCostSubclassification.state,
              assignedProperties: selectedCostSubclassification.assignedProperties || []
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

export default CostSubclassification;