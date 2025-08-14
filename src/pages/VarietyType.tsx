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
import { IVarietyType, ICropType } from "@eon-lib/eon-mongoose";
import varietyTypeService from "@/_services/varietyTypeService";
import cropTypeService from "@/_services/cropTypeService";

interface VarietyTypeProps {
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



const VarietyType = ({ isModal = false }: VarietyTypeProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [varietyTypes, setVarietyTypes] = useState<IVarietyType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVarietyType, setSelectedVarietyType] = useState<IVarietyType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [cropTypes, setCropTypes] = useState<ICropType[]>([]);
  
  // Helper function to get crop type name by ID
  const getCropTypeName = (cropTypeId: string) => {
    const cropType = cropTypes.find(ct => ct._id === cropTypeId);
    return cropType ? cropType.cropName : cropTypeId;
  };


// Expandable content for each row
const expandableContent = (row: IVarietyType) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.varietyName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Nombre:</strong> {row.varietyName || 'N/A'}
        </p>
        <p>
          <strong>Tipo de Cultivo:</strong> {getCropTypeName(row.cropTypeId) || 'N/A'}
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
      id: "varietyName",
      header: "Nombre",
      accessor: "varietyName",
      visible: true,
      sortable: true,
      groupable: true,
    },
    {
      id: "cropTypeId",
      header: "Tipo de Cultivo",
      accessor: "cropTypeId",
      visible: true,
      sortable: true,
      groupable: true,
      render: (value: string) => getCropTypeName(value),
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
  
  // Fetch varietyTypes and cropTypes on component mount
  useEffect(() => {
    fetchVarietyTypes();
    fetchCropTypes();
  }, []);
  
  // Function to fetch varietyTypes data
  const fetchVarietyTypes = async () => {
    setIsLoading(true);
    try {
      const data = await varietyTypeService.findAll();
      setVarietyTypes(data);
    } catch (error) {
      console.error("Error loading variety types:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de variedades. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch cropTypes data
  const fetchCropTypes = async () => {
    try {
      const data = await cropTypeService.findAll();
      setCropTypes(data);
    } catch (error) {
      console.error("Error loading crop types:", error);
    }
  };
  
  // Function to handle adding a new varietyType
  const handleAddVarietyType = async (data: Partial<IVarietyType>) => {
    try {
      await varietyTypeService.createVarietyType(data);
      
      toast({
        title: "Éxito",
        description: "Tipo de variedad agregado correctamente.",
      });
      
      // Refresh data
      fetchVarietyTypes();
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar tipo de variedad:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el tipo de variedad. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a varietyType
  const handleUpdateVarietyType = async (id: string | number, data: Partial<IVarietyType>) => {
    try {
      await varietyTypeService.updateVarietyType(id, data);
      
      toast({
        title: "Éxito",
        description: "Tipo de variedad actualizado correctamente.",
      });
      
      // Refresh data
      fetchVarietyTypes();
      // Close dialog
      setIsDialogOpen(false);
      // Reset selected varietyType
      setSelectedVarietyType(null);
      // Reset edit mode
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar tipo de variedad ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el tipo de variedad. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a varietyType
  const handleDeleteVarietyType = async (id: string | number) => {
    try {
      await varietyTypeService.softDeleteVarietyType(id);
      
      toast({
        title: "Éxito",
        description: "Tipo de variedad eliminado correctamente.",
      });
      
      // Refresh data
      fetchVarietyTypes();
    } catch (error) {
      console.error(`Error al eliminar tipo de variedad ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el tipo de variedad. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Form configuration for adding new varietyType
  const getFormSections = useCallback((): SectionConfig[] => [
    {
      id: "varietyType-info",
      title: "Información del Tipo de Variedad",
      description: "Ingrese los datos del nuevo tipo de variedad",
      fields: [
        {
          id: "varietyName",
          type: "text",
          label: "Nombre *",
          name: "varietyName",
          placeholder: "Ingrese nombre del tipo de variedad",
          required: true,
          helperText: "Ingrese el nombre identificativo del tipo de variedad"
        },
        {
          id: "cropTypeId",
          type: "select",
          label: "Tipo de Cultivo *",
          name: "cropTypeId",
          placeholder: "Seleccione el tipo de cultivo",
          required: true,
          helperText: "Seleccione el tipo de cultivo asociado",
          options: cropTypes.map(cropType => ({
            value: cropType._id,
            label: cropType.cropName
          }))
        },
        {
          id: "order",
          type: "number",
          label: "Orden",
          name: "order",
          placeholder: "Ingrese el orden del tipo de variedad",
          required: false,
          helperText: "Orden de clasificación del tipo de variedad"
        },
        {
          id: "state",
          type: "checkbox",
          label: "Activo",
          name: "state",
          required: false,
          helperText: "Indica si el tipo de variedad está activo"
        }
      ],
    }
  ], [cropTypes]);

  // Form validation schema
  const formValidationSchema = z.object({
    varietyName: z.string().min(1, { message: "El nombre es obligatorio" }),
    cropTypeId: z.string().min(1, { message: "El tipo de cultivo es obligatorio" }),
    order: z.number().optional(),
    state: z.boolean().default(true),
    assignedProperties: z.array(z.string()).optional().default([])
  });

  // Form submit handler
  const handleFormSubmit = (data: Partial<IVarietyType>) => {
    if (isEditMode && selectedVarietyType && selectedVarietyType._id) {
      handleUpdateVarietyType(selectedVarietyType._id, data);
    } else {
      handleAddVarietyType(data);
    }
  };

  // Handle edit button click
  const handleEditClick = (varietyType: IVarietyType) => {
    setSelectedVarietyType(varietyType);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: IVarietyType) => {
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
            if (window.confirm(`¿Está seguro de eliminar el tipo de variedad ${row.varietyName}?`)) {
              handleDeleteVarietyType(row._id);
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
          <h1 className="text-2xl font-bold">Tipos de Variedades</h1>
          <p className="text-muted-foreground">
            {isModal 
              ? "Gestione los tipos de variedades"
              : "Gestione los tipos de variedades para su organización"
            }
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedVarietyType(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Tipo
        </Button>
      </div>

      <div className={isModal ? "px-0.5 h-[calc(100vh-200px)] overflow-hidden" : ""}>
        <Grid
          data={varietyTypes}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          isLoading={isLoading}
          gridId="varietyTypes-grid"
          idField="_id"
          title=""
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Tipo de Variedad" : "Agregar Nuevo Tipo de Variedad"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} un tipo de variedad.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedVarietyType ? {
              varietyName: selectedVarietyType.varietyName,
              cropTypeId: selectedVarietyType.cropTypeId,
              order: selectedVarietyType.order || 0,
              state: selectedVarietyType.state,
              assignedProperties: selectedVarietyType.assignedProperties || []
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

export default VarietyType;