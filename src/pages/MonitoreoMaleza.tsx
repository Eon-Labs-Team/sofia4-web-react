import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  GalleryVerticalEnd,
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
import { IWeedMonitoring } from "@/types/IWeedMonitoring";
import weedMonitoringService from "@/_services/weedMonitoringService";
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

// Render function for images
const renderImages = (value: string) => {
  if (!value) return <span>Sin imagen</span>;
  return (
    <div className="flex items-center">
      <GalleryVerticalEnd className="h-4 w-4 mr-2" />
      <span>Ver imagen</span>
    </div>
  );
};

// Render function for development level
const renderDevelopmentLevel = (value: number) => {
  const getColor = (level: number) => {
    if (level <= 3) return "text-green-500";
    if (level <= 6) return "text-yellow-500";
    return "text-red-500";
  };
  
  return (
    <div className="flex items-center">
      <span className={`font-medium ${getColor(value)}`}>{value}</span>
      <span className="ml-2">/ 10</span>
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
    id: "date",
    header: "Fecha",
    accessor: "date",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "barracks",
    header: "Cuartel",
    accessor: "barracks",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "crop",
    header: "Cultivo",
    accessor: "crop",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "variety",
    header: "Variedad",
    accessor: "variety",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "sector",
    header: "Sector",
    accessor: "sector",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "weedType",
    header: "Tipo de maleza",
    accessor: "weedType",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "developmentLevel",
    header: "Nivel de desarrollo",
    accessor: "developmentLevel",
    visible: true,
    sortable: true,
    render: renderDevelopmentLevel,
  },
  {
    id: "responsible",
    header: "Responsable",
    accessor: "responsible",
    visible: true,
    sortable: true,
  },
  {
    id: "observation",
    header: "Observación",
    accessor: "observation",
    visible: true,
    sortable: true,
  },
  {
    id: "image1",
    header: "Imagen 1",
    accessor: "image1",
    visible: true,
    render: renderImages,
  },
  {
    id: "image2",
    header: "Imagen 2",
    accessor: "image2",
    visible: true,
    render: renderImages,
  },
  {
    id: "image3",
    header: "Imagen 3",
    accessor: "image3",
    visible: true,
    render: renderImages,
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
    <h3 className="text-lg font-semibold mb-2">Detalles de Monitoreo de Maleza</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p><strong>Fecha:</strong> {row.date}</p>
        <p><strong>Cuartel:</strong> {row.barracks}</p>
        <p><strong>Cultivo:</strong> {row.crop}</p>
        <p><strong>Variedad:</strong> {row.variety}</p>
        <p><strong>Sector:</strong> {row.sector}</p>
        <p><strong>Tipo de maleza:</strong> {row.weedType}</p>
        <p><strong>Nivel de desarrollo:</strong> {row.developmentLevel}/10</p>
      </div>
      <div>
        <p><strong>Responsable:</strong> {row.responsible}</p>
        <p><strong>Observación:</strong> {row.observation}</p>
        <p><strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}</p>
        <div className="mt-4">
          <h4 className="text-md font-semibold mb-2">Imágenes</h4>
          <div className="grid grid-cols-3 gap-2">
            {row.image1 && (
              <div className="border p-2 rounded">
                <p className="text-sm mb-1">Imagen 1</p>
                <div className="h-20 bg-gray-200 flex items-center justify-center">
                  <GalleryVerticalEnd className="h-6 w-6" />
                </div>
              </div>
            )}
            {row.image2 && (
              <div className="border p-2 rounded">
                <p className="text-sm mb-1">Imagen 2</p>
                <div className="h-20 bg-gray-200 flex items-center justify-center">
                  <GalleryVerticalEnd className="h-6 w-6" />
                </div>
              </div>
            )}
            {row.image3 && (
              <div className="border p-2 rounded">
                <p className="text-sm mb-1">Imagen 3</p>
                <div className="h-20 bg-gray-200 flex items-center justify-center">
                  <GalleryVerticalEnd className="h-6 w-6" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Form configuration for adding new weed monitoring record
const formSections: SectionConfig[] = [
  {
    id: "weed-monitoring-info",
    title: "Información del Monitoreo de Maleza",
    description: "Ingrese los datos del nuevo monitoreo de maleza",
    fields: [
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        placeholder: "Seleccione una fecha",
        required: true,
        helperText: "Fecha del monitoreo"
      },
      {
        id: "barracks",
        type: "text",
        label: "Cuartel",
        name: "barracks",
        placeholder: "Nombre del cuartel",
        required: true,
        helperText: "Cuartel donde se realizó el monitoreo"
      },
      {
        id: "crop",
        type: "text",
        label: "Cultivo",
        name: "crop",
        placeholder: "Tipo de cultivo",
        required: true,
        helperText: "Cultivo monitoreado"
      },
      {
        id: "variety",
        type: "text",
        label: "Variedad",
        name: "variety",
        placeholder: "Variedad del cultivo",
        required: true,
        helperText: "Variedad del cultivo"
      },
      {
        id: "sector",
        type: "text",
        label: "Sector",
        name: "sector",
        placeholder: "Sector del cuartel",
        required: true,
        helperText: "Sector específico donde se realizó el monitoreo"
      },
      {
        id: "weedType",
        type: "text",
        label: "Tipo de maleza",
        name: "weedType",
        placeholder: "Tipo de maleza observada",
        required: true,
        helperText: "Tipo o especie de maleza identificada"
      },
      {
        id: "developmentLevel",
        type: "number",
        label: "Nivel de desarrollo",
        name: "developmentLevel",
        placeholder: "Escala del 1 al 10",
        required: true,
        helperText: "Nivel de desarrollo de la maleza (1-10)"
      },
    ]
  },
  {
    id: "additional-info",
    title: "Información adicional",
    description: "Ingrese información adicional del monitoreo",
    fields: [
      {
        id: "responsible",
        type: "text",
        label: "Responsable",
        name: "responsible",
        placeholder: "Nombre del responsable",
        required: true,
        helperText: "Persona responsable del monitoreo"
      },
      {
        id: "observation",
        type: "textarea",
        label: "Observación",
        name: "observation",
        placeholder: "Ingrese sus observaciones",
        required: true,
        helperText: "Observaciones detalladas del monitoreo"
      },
      {
        id: "image1",
        type: "text",
        label: "Imagen 1",
        name: "image1",
        placeholder: "URL de la imagen 1",
        required: true,
        helperText: "URL de la primera imagen"
      },
      {
        id: "image2",
        type: "text",
        label: "Imagen 2",
        name: "image2",
        placeholder: "URL de la imagen 2",
        required: true,
        helperText: "URL de la segunda imagen"
      },
      {
        id: "image3",
        type: "text",
        label: "Imagen 3",
        name: "image3",
        placeholder: "URL de la imagen 3",
        required: true,
        helperText: "URL de la tercera imagen"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el registro está activo"
      },
    ]
  }
];

// Form validation schema
const formValidationSchema = z.object({
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  barracks: z.string().min(1, { message: "El cuartel es obligatorio" }),
  crop: z.string().min(1, { message: "El cultivo es obligatorio" }),
  variety: z.string().min(1, { message: "La variedad es obligatoria" }),
  sector: z.string().min(1, { message: "El sector es obligatorio" }),
  weedType: z.string().min(1, { message: "El tipo de maleza es obligatorio" }),
  developmentLevel: z.coerce.number().min(1).max(10, { message: "El nivel debe estar entre 1 y 10" }),
  responsible: z.string().min(1, { message: "El responsable es obligatorio" }),
  observation: z.string().min(1, { message: "La observación es obligatoria" }),
  image1: z.string().min(1, { message: "La imagen 1 es obligatoria" }),
  image2: z.string().min(1, { message: "La imagen 2 es obligatoria" }),
  image3: z.string().min(1, { message: "La imagen 3 es obligatoria" }),
  state: z.boolean().default(true),
});

const MonitoreoMaleza = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [weedMonitoringRecords, setWeedMonitoringRecords] = useState<IWeedMonitoring[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWeedMonitoring, setSelectedWeedMonitoring] = useState<IWeedMonitoring | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch weed monitoring records on component mount
  useEffect(() => {
    fetchWeedMonitoringRecords();
  }, []);
  
  // Function to fetch weed monitoring records data
  const fetchWeedMonitoringRecords = async () => {
    setIsLoading(true);
    try {
      const response = await weedMonitoringService.findAll();
      // Handle different response structures
      if (Array.isArray(response)) {
        setWeedMonitoringRecords(response);
      } else if (response && typeof response === 'object') {
        const data = response.data || [];
        setWeedMonitoringRecords(Array.isArray(data) ? data : []);
      } else {
        setWeedMonitoringRecords([]);
      }
    } catch (error) {
      console.error("Error loading weed monitoring records:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros de monitoreo de maleza",
        variant: "destructive",
      });
      setWeedMonitoringRecords([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new weed monitoring record
  const handleAddWeedMonitoring = async (data: Partial<IWeedMonitoring>) => {
    try {
      await weedMonitoringService.createWeedMonitoring(data);
      toast({
        title: "Éxito",
        description: "Monitoreo de maleza creado correctamente",
      });
      fetchWeedMonitoringRecords();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating weed monitoring record:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el monitoreo de maleza",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a weed monitoring record
  const handleUpdateWeedMonitoring = async (id: string | number, data: Partial<IWeedMonitoring>) => {
    try {
      await weedMonitoringService.updateWeedMonitoring(id, data);
      toast({
        title: "Éxito",
        description: "Monitoreo de maleza actualizado correctamente",
      });
      fetchWeedMonitoringRecords();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedWeedMonitoring(null);
    } catch (error) {
      console.error(`Error updating weed monitoring record ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el monitoreo de maleza",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a weed monitoring record
  const handleDeleteWeedMonitoring = async (id: string | number) => {
    try {
      await weedMonitoringService.softDeleteWeedMonitoring(id);
      toast({
        title: "Éxito",
        description: "Monitoreo de maleza eliminado correctamente",
      });
      fetchWeedMonitoringRecords();
    } catch (error) {
      console.error(`Error deleting weed monitoring record ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el monitoreo de maleza",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IWeedMonitoring>) => {
    if (isEditMode && selectedWeedMonitoring && selectedWeedMonitoring._id) {
      handleUpdateWeedMonitoring(selectedWeedMonitoring._id, data);
    } else {
      handleAddWeedMonitoring(data);
    }
  };
  
  // Function to handle edit click
  const handleEditClick = (weedMonitoring: IWeedMonitoring) => {
    setSelectedWeedMonitoring(weedMonitoring);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Function to render action buttons for each row
  const renderActions = (row: IWeedMonitoring) => {
    return (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleEditClick(row)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteWeedMonitoring(row._id as string)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Monitoreo de Maleza</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedWeedMonitoring(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Monitoreo
        </Button>
      </div>
      
      <Grid
        data={weedMonitoringRecords}
        columns={[...columns, {
          id: "actions",
          header: "Acciones",
          accessor: "actions",
          visible: true,
          render: renderActions,
        }]}
        gridId="monitoreo-maleza"
        title="Registros de Monitoreo de Maleza"
        expandableContent={expandableContent}
        actions={renderActions}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Monitoreo de Maleza" : "Agregar Nuevo Monitoreo de Maleza"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Modifique la información del monitoreo de maleza existente" 
                : "Complete la información para crear un nuevo monitoreo de maleza"}
            </DialogDescription>
          </DialogHeader>
          
          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedWeedMonitoring ? selectedWeedMonitoring : undefined}
          />
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonitoreoMaleza; 