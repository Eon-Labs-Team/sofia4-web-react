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
import { ISoilType } from "@eon-lib/eon-mongoose";
import soilTypeService from "@/_services/soilTypeService";
import propertyService from "@/_services/propertyService";

interface SoilTypeProps {
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
const expandableContent = (row: ISoilType) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.soilTypeName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Nombre:</strong> {row.soilTypeName || 'N/A'}
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

const SoilType = ({ isModal = false }: SoilTypeProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [soilTypes, setSoilTypes] = useState<ISoilType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSoilType, setSelectedSoilType] = useState<ISoilType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  // Fetch soilTypes on component mount
  useEffect(() => {
    fetchSoilTypes();
    fetchProperties();
  }, []);
  
  // Function to fetch soilTypes data
  const fetchSoilTypes = async () => {
    setIsLoading(true);
    try {
      const data = await soilTypeService.findAll();
      setSoilTypes(data);
    } catch (error) {
      console.error("Error loading soil types:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de suelo. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchProperties = async () => {
    setIsLoading(true);
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
    } finally {
    setIsLoading(false);
  }
  };
  // Function to handle adding a new soilType
  const handleAddSoilType = async (data: Partial<ISoilType>) => {
    try {
      await soilTypeService.createSoilType(data);
      
      toast({
        title: "Éxito",
        description: "Tipo de suelo agregado correctamente.",
      });
      
      // Refresh data
      fetchSoilTypes();
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar tipo de suelo:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el tipo de suelo. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a soilType
  const handleUpdateSoilType = async (id: string | number, data: Partial<ISoilType>) => {
    try {
      await soilTypeService.updateSoilType(id, data);
      
      toast({
        title: "Éxito",
        description: "Tipo de suelo actualizado correctamente.",
      });
      
      // Refresh data
      fetchSoilTypes();
      // Close dialog
      setIsDialogOpen(false);
      // Reset selected soilType
      setSelectedSoilType(null);
      // Reset edit mode
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar tipo de suelo ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el tipo de suelo. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a soilType
  const handleDeleteSoilType = async (id: string | number) => {
    try {
      await soilTypeService.softDeleteSoilType(id);
      
      toast({
        title: "Éxito",
        description: "Tipo de suelo eliminado correctamente.",
      });
      
      // Refresh data
      fetchSoilTypes();
    } catch (error) {
      console.error(`Error al eliminar tipo de suelo ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el tipo de suelo. Intente nuevamente.",
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
      id: "soilTypeName",
      header: "Nombre",
      accessor: "soilTypeName",
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

  // Form configuration for adding new soilType
  const getFormSections = useCallback((): SectionConfig[] => [
    {
      id: "soilType-info",
      title: "Información del Tipo de Suelo",
      description: "Ingrese los datos del nuevo tipo de suelo",
      fields: [
        {
          id: "soilTypeName",
          type: "text",
          label: "Nombre *",
          name: "soilTypeName",
          placeholder: "Ingrese nombre del tipo de suelo",
          required: true,
          helperText: "Ingrese el nombre identificativo del tipo de suelo"
        },
        {
          id: "order",
          type: "number",
          label: "Orden",
          name: "order",
          placeholder: "Ingrese el orden del tipo de suelo",
          required: false,
          helperText: "Orden de clasificación del tipo de suelo"
        },
        {
          id: "assignedProperties",
          type: "checkboxGroup",
          label: "Predios Asignados",
          name: "assignedProperties",
          required: false,
          helperText: "Seleccione los predios donde estará disponible esta faena (deje vacío para todos)",
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
          helperText: "Indica si el tipo de suelo está activo"
        }
      ],
    }
  ], [properties]);

  // Form validation schema
  const formValidationSchema = z.object({
    soilTypeName: z.string().min(1, { message: "El nombre es obligatorio" }),
    order: z.number().optional(),
    state: z.boolean().default(true),
    assignedProperties: z.array(z.string()).optional().default([])
  });

  // Form submit handler
  const handleFormSubmit = (data: Partial<ISoilType>) => {
    if (isEditMode && selectedSoilType && selectedSoilType._id) {
      handleUpdateSoilType(selectedSoilType._id, data);
    } else {
      handleAddSoilType(data);
    }
  };

  // Handle edit button click
  const handleEditClick = (soilType: ISoilType) => {
    setSelectedSoilType(soilType);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: ISoilType) => {
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
            if (window.confirm(`¿Está seguro de eliminar el tipo de suelo ${row.soilTypeName}?`)) {
              handleDeleteSoilType(row._id);
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
          <h1 className="text-2xl font-bold">Tipos de Suelo</h1>
          <p className="text-muted-foreground">
            {isModal 
              ? "Gestione los tipos de suelo"
              : "Gestione los tipos de suelo para su organización"
            }
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedSoilType(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Tipo
        </Button>
      </div>

      <div className={isModal ? "px-0.5 h-[calc(100vh-200px)] overflow-hidden" : ""}>
        <Grid
          data={soilTypes}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          isLoading={isLoading}
          gridId="soilTypes-grid"
          idField="_id"
          title=""
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Tipo de Suelo" : "Agregar Nuevo Tipo de Suelo"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} un tipo de suelo.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedSoilType ? {
              soilTypeName: selectedSoilType.soilTypeName,
              order: selectedSoilType.order || 0,
              state: selectedSoilType.state,
              assignedProperties: selectedSoilType.assignedProperties || []
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

export default SoilType;