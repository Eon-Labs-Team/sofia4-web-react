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
import cropTypeService from "@/_services/cropTypeService";
import { ICropType } from "@eon-lib/eon-mongoose/types";
import propertyService from "@/_services/propertyService";

interface CropTypeProps {
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
const expandableContent = (row: ICropType) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.cropName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Nombre:</strong> {row.cropName || 'N/A'}
        </p>
        <p>
          <strong>Color del Mapa:</strong> 
          <span 
            className="ml-2 inline-block w-6 h-6 rounded border" 
            style={{ backgroundColor: row.mapColor || '#000000' }}
            title={row.mapColor || 'Sin color'}
          ></span>
          <span className="ml-2">{row.mapColor || 'N/A'}</span>
        </p>
        <p>
          <strong>Orden:</strong> {row.order || 'N/A'}
        </p>
        <p>
          <strong>Estado Lista:</strong> {row.cropListState ? 'Activo' : 'Inactivo'}
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

const CropType = ({ isModal = false }: CropTypeProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cropTypes, setCropTypes] = useState<ICropType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCropType, setSelectedCropType] = useState<ICropType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);

  
  // Fetch cropTypes on component mount
  useEffect(() => {
    fetchCropTypes();
    fetchProperties();
  }, []);
  
  // Function to fetch cropTypes data
  const fetchCropTypes = async () => {
    setIsLoading(true);
    try {
      const data = await cropTypeService.findAll();
      setCropTypes(data);
    } catch (error) {
      console.error("Error loading crop types:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de cultivo. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

    // Function to fetch properties data
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
  
  // Function to handle adding a new cropType
  const handleAddCropType = async (data: Partial<ICropType>) => {
    try {
      await cropTypeService.createCropType(data)
      
      toast({
        title: "Éxito",
        description: "Tipo de cultivo agregado correctamente.",
      });
      
      // Refresh data
      fetchCropTypes();
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar tipo de cultivo:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el tipo de cultivo. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a cropType
  const handleUpdateCropType = async (id: string | number, data: Partial<ICropType>) => {
    try {
      await cropTypeService.updateCropType(id,data)
      
      toast({
        title: "Éxito",
        description: "Tipo de cultivo actualizado correctamente.",
      });
      
      // Refresh data
      fetchCropTypes();
      // Close dialog
      setIsDialogOpen(false);
      // Reset selected cropType
      setSelectedCropType(null);
      // Reset edit mode
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar tipo de cultivo ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el tipo de cultivo. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a cropType
  const handleDeleteCropType = async (id: string | number) => {
    try {
      await cropTypeService.softDeleteCropType(id)
      
      toast({
        title: "Éxito",
        description: "Tipo de cultivo eliminado correctamente.",
      });
      
      // Refresh data
      fetchCropTypes();
    } catch (error) {
      console.error(`Error al eliminar tipo de cultivo ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el tipo de cultivo. Intente nuevamente.",
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
      id: "cropName",
      header: "Nombre",
      accessor: "cropName",
      visible: true,
      sortable: true,
      groupable: true,
    },
    {
      id: "mapColor",
      header: "Color del Mapa",
      accessor: "mapColor",
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
      id: "cropListState",
      header: "Estado Lista",
      accessor: "cropListState",
      visible: true,
      sortable: true,
      groupable: true,
      render: renderBoolean,
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
  // Form configuration for adding new cropType
  const getFormSections = useCallback((): SectionConfig[] => [
    {
      id: "cropType-info",
      title: "Información del Tipo de Cultivo",
      description: "Ingrese los datos del nuevo tipo de cultivo",
      fields: [
        {
          id: "cropName",
          type: "text",
          label: "Nombre *",
          name: "cropName",
          placeholder: "Ingrese nombre del tipo de cultivo",
          required: true,
          helperText: "Ingrese el nombre identificativo del tipo de cultivo"
        },
        {
          id: "mapColor",
          type: "text",
          label: "Color del Mapa *",
          name: "mapColor",
          placeholder: "#000000",
          required: true,
          helperText: "Seleccione el color para representar este cultivo en el mapa"
        },
        {
          id: "order",
          type: "number",
          label: "Orden",
          name: "order",
          placeholder: "Ingrese el orden del tipo de cultivo",
          required: false,
          helperText: "Orden de clasificación del tipo de cultivo"
        },
        {
          id: "cropListState",
          type: "checkbox",
          label: "Estado en Lista",
          name: "cropListState",
          required: false,
          helperText: "Indica si el tipo de cultivo aparece en las listas"
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
          helperText: "Indica si el tipo de cultivo está activo"
        }
      ],
    }
  ], [properties]);

  // Form validation schema
  const formValidationSchema = z.object({
    cropName: z.string().min(1, { message: "El nombre es obligatorio" }),
    mapColor: z.string().min(1, { message: "El color del mapa es obligatorio" }),
    order: z.number().optional(),
    cropListState: z.boolean().default(true),
    state: z.boolean().default(true),
    assignedProperties: z.array(z.string()).optional().default([])
  });

  // Form submit handler
  const handleFormSubmit = (data: Partial<ICropType>) => {
    if (isEditMode && selectedCropType && selectedCropType._id) {
      handleUpdateCropType(selectedCropType._id, data);
    } else {
      handleAddCropType(data);
    }
  };

  // Handle edit button click
  const handleEditClick = (cropType: ICropType) => {
    setSelectedCropType(cropType);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: ICropType) => {
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
            if (window.confirm(`¿Está seguro de eliminar el tipo de cultivo ${row.cropName}?`)) {
              handleDeleteCropType(row._id);
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
          <h1 className="text-2xl font-bold">Tipos de Cultivo</h1>
          <p className="text-muted-foreground">
            {isModal 
              ? "Gestione los tipos de cultivo"
              : "Gestione los tipos de cultivo para su organización"
            }
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedCropType(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Tipo
        </Button>
      </div>

      <div className={isModal ? "px-0.5 h-[calc(100vh-200px)] overflow-hidden" : ""}>
        <Grid
          data={cropTypes}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          isLoading={isLoading}
          gridId="cropTypes-grid"
          idField="_id"
          title=""
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Tipo de Cultivo" : "Agregar Nuevo Tipo de Cultivo"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} un tipo de cultivo.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedCropType ? {
              cropName: selectedCropType.cropName,
              mapColor: selectedCropType.mapColor,
              order: selectedCropType.order || 0,
              cropListState: selectedCropType.cropListState,
              state: selectedCropType.state,
              assignedProperties: selectedCropType.assignedProperties || []
            } : {
              cropListState: true,
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

export default CropType;