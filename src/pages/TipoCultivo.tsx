import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Leaf,
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
  FieldType,
} from "@/components/DynamicForm/DynamicForm";
import { z } from "zod";
import { ICropType } from "@eon-lib/eon-mongoose";
import cropTypeService from "@/_services/cropTypeService";
import { toast } from "@/components/ui/use-toast";

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

// Function to render arrays
const renderArray = (value: string[] | undefined) => {
  if (!value || value.length === 0) return <span>-</span>;
  return (
    <div className="flex flex-col">
      {value.map((item, index) => (
        <span key={index}>{item}</span>
      ))}
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
    id: "idOrder",
    header: "Orden",
    accessor: "idOrder",
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
    header: "Color",
    accessor: "mapColor",
    visible: true,
    sortable: true,
    render: (value) => (
      <div className="flex items-center">
        <div 
          className="w-6 h-6 rounded mr-2" 
          style={{ backgroundColor: value }}
        />
        <span>{value}</span>
      </div>
    ),
  },
  {
    id: "variety",
    header: "Variedades",
    accessor: "variety",
    visible: true,
    sortable: true,
    render: renderArray,
  },
  {
    id: "totalVariety",
    header: "Total Variedades",
    accessor: "totalVariety",
    visible: true,
    sortable: true,
  },
  {
    id: "phenologicalState",
    header: "Estados Fenológicos",
    accessor: "phenologicalState",
    visible: true,
    sortable: true,
    render: renderArray,
  },
  {
    id: "totalPhenologicalState",
    header: "Total Estados Fenológicos",
    accessor: "totalPhenologicalState",
    visible: true,
    sortable: true,
  },
  {
    id: "cropListState",
    header: "Estado Lista Cultivo",
    accessor: "cropListState",
    visible: true,
    sortable: true,
    render: renderState,
  },
  {
    id: "barracks",
    header: "Cuarteles",
    accessor: "barracks",
    visible: true,
    sortable: true,
    render: renderArray,
  },
  {
    id: "barracksNumber",
    header: "Número de Cuarteles",
    accessor: "barracksNumber",
    visible: true,
    sortable: true,
  },
  {
    id: "updateColorBarracks",
    header: "Actualizar Color Cuarteles",
    accessor: "updateColorBarracks",
    visible: true,
    sortable: true,
    render: renderState,
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
    <h3 className="text-lg font-semibold mb-2">{row.cropName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p><strong>Orden:</strong> {row.idOrder}</p>
        <p><strong>Color:</strong> <span className="inline-block w-4 h-4 rounded mr-2" style={{ backgroundColor: row.mapColor }}></span> {row.mapColor}</p>
        <p><strong>Variedades:</strong> {row.variety ? row.variety.join(", ") : "-"}</p>
        <p><strong>Total Variedades:</strong> {row.totalVariety}</p>
        <p><strong>Estados Fenológicos:</strong> {row.phenologicalState ? row.phenologicalState.join(", ") : "-"}</p>
      </div>
      <div>
        <p><strong>Total Estados Fenológicos:</strong> {row.totalPhenologicalState}</p>
        <p><strong>Estado Lista Cultivo:</strong> {row.cropListState ? "Activo" : "Inactivo"}</p>
        <p><strong>Cuarteles:</strong> {row.barracks ? row.barracks.join(", ") : "-"}</p>
        <p><strong>Número de Cuarteles:</strong> {row.barracksNumber}</p>
        <p><strong>Actualizar Color Cuarteles:</strong> {row.updateColorBarracks ? "Sí" : "No"}</p>
        <p><strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}</p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new crop type
const formSections: SectionConfig[] = [
  {
    id: "crop-type-info",
    title: "Información del Tipo de Cultivo",
    description: "Ingrese los datos del nuevo tipo de cultivo",
    fields: [
      {
        id: "idOrder",
        type: "number" as FieldType,
        label: "Orden",
        name: "idOrder",
        placeholder: "Número de orden",
        required: true,
        helperText: "Orden numérico del tipo de cultivo"
      },
      {
        id: "cropName",
        type: "text" as FieldType,
        label: "Nombre del Cultivo",
        name: "cropName",
        placeholder: "Nombre del cultivo",
        required: true,
        helperText: "Ingrese el nombre del tipo de cultivo"
      },
      {
        id: "mapColor",
        type: "text" as FieldType,
        label: "Color en Mapa",
        name: "mapColor",
        required: true,
        helperText: "Color que representará el cultivo en el mapa"
      },
      {
        id: "variety",
        type: "multiselect" as FieldType,
        label: "Variedades",
        name: "variety",
        placeholder: "Agregar variedad",
        required: true,
        helperText: "Agregar variedades del cultivo (presione Enter después de cada una)"
      },
      {
        id: "phenologicalState",
        type: "multiselect" as FieldType,
        label: "Estados Fenológicos",
        name: "phenologicalState",
        placeholder: "Agregar estado fenológico",
        required: true,
        helperText: "Agregar estados fenológicos del cultivo (presione Enter después de cada uno)"
      },
      {
        id: "cropListState",
        type: "checkbox" as FieldType,
        label: "Estado Lista Cultivo",
        name: "cropListState",
        required: true,
        helperText: "Indica si el cultivo está activo en la lista"
      },
      {
        id: "barracks",
        type: "multiselect" as FieldType,
        label: "Cuarteles",
        name: "barracks",
        placeholder: "Agregar cuartel",
        required: true,
        helperText: "Agregar cuarteles relacionados (presione Enter después de cada uno)"
      },
      {
        id: "updateColorBarracks",
        type: "checkbox" as FieldType,
        label: "Actualizar Color Cuarteles",
        name: "updateColorBarracks",
        required: true,
        helperText: "Indica si se debe actualizar el color de los cuarteles"
      },
      {
        id: "state",
        type: "checkbox" as FieldType,
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el tipo de cultivo está actualmente en uso"
      },
    ],
  }
];

// Form validation schema
const formValidationSchema = z.object({
  idOrder: z.number().min(1, { message: "El orden es obligatorio" }),
  cropName: z.string().min(1, { message: "El nombre del cultivo es obligatorio" }),
  mapColor: z.string().min(1, { message: "El color es obligatorio" }),
  variety: z.array(z.string()).min(1, { message: "Al menos una variedad es obligatoria" }),
  phenologicalState: z.array(z.string()).min(1, { message: "Al menos un estado fenológico es obligatorio" }),
  cropListState: z.boolean().default(false),
  barracks: z.array(z.string()).optional(),
  barracksNumber: z.number().optional(),
  updateColorBarracks: z.boolean().default(false),
  state: z.boolean().default(false)
});

const TipoCultivo = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [cropTypes, setCropTypes] = useState<ICropType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCropType, setSelectedCropType] = useState<ICropType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  
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
  
  // Fetch crop types on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchCropTypes();
    }
  }, [propertyId]);
  
  // Function to fetch crop types data
  const fetchCropTypes = async () => {
    setIsLoading(true);
    try {
      const response = await cropTypeService.findAll();
      // @ts-ignore
      setCropTypes(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading crop types:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los tipos de cultivo",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new crop type
  const handleAddCropType = async (data: Partial<ICropType>) => {
    try {
      // Calculate derived fields
      if (data.variety) {
        data.totalVariety = data.variety.length;
      }
      if (data.phenologicalState) {
        data.totalPhenologicalState = data.phenologicalState.length;
      }
      if (data.barracks) {
        data.barracksNumber = data.barracks.length;
      }
      
      await cropTypeService.createCropType(data);
      
      toast({
        title: "Éxito",
        description: "Tipo de cultivo creado correctamente",
      });
      
      fetchCropTypes();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating crop type:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el tipo de cultivo",
      });
    }
  };
  
  // Function to handle updating an existing crop type
  const handleUpdateCropType = async (id: string | number, data: Partial<ICropType>) => {
    try {
      // Calculate derived fields
      if (data.variety) {
        data.totalVariety = data.variety.length;
      }
      if (data.phenologicalState) {
        data.totalPhenologicalState = data.phenologicalState.length;
      }
      if (data.barracks) {
        data.barracksNumber = data.barracks.length;
      }
      
      await cropTypeService.updateCropType(id, data);
      
      toast({
        title: "Éxito",
        description: "Tipo de cultivo actualizado correctamente",
      });
      
      fetchCropTypes();
      setIsDialogOpen(false);
      setSelectedCropType(null);
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error updating crop type ${id}:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el tipo de cultivo",
      });
    }
  };
  
  // Function to handle deleting a crop type
  const handleDeleteCropType = async (id: string | number) => {
    try {
      await cropTypeService.softDeleteCropType(id);
      
      toast({
        title: "Éxito",
        description: "Tipo de cultivo eliminado correctamente",
      });
      
      fetchCropTypes();
      setIsConfirmDialogOpen(false);
      setDeletingId(null);
    } catch (error) {
      console.error(`Error deleting crop type ${id}:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el tipo de cultivo",
      });
    }
  };
  
  // Unified function to handle form submission
  const handleFormSubmit = (data: Partial<ICropType>) => {
    if (isEditMode && selectedCropType && selectedCropType._id) {
      handleUpdateCropType(selectedCropType._id, data);
    } else {
      handleAddCropType(data);
    }
  };
  
  // Set up editing mode
  const handleEditClick = (cropType: ICropType) => {
    setSelectedCropType(cropType);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render action buttons for each row
  const renderActions = (row: ICropType) => {
    return (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleEditClick(row)}
          aria-label="Editar"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setDeletingId(row._id);
            setIsConfirmDialogOpen(true);
          }}
          aria-label="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tipos de Cultivo</h1>
        <Button
          onClick={() => {
            setSelectedCropType(null);
            setIsEditMode(false);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Tipo de Cultivo
        </Button>
      </div>

      {/* Grid component */}
      <Grid
        data={cropTypes}
        columns={columns}
        gridId="crop-types"
        title="Tipos de Cultivo"
        expandableContent={expandableContent}
        actions={renderActions}
      />

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Tipo de Cultivo" : "Agregar Nuevo Tipo de Cultivo"}
            </DialogTitle>
            <DialogDescription>
              Complete los campos para {isEditMode ? "actualizar" : "crear"} el tipo de cultivo.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            defaultValues={selectedCropType || {}}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedCropType(null);
                setIsEditMode(false);
              }}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar este tipo de cultivo? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmDialogOpen(false);
                setDeletingId(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletingId) {
                  handleDeleteCropType(deletingId);
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TipoCultivo; 