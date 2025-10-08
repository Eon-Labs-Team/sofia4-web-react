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
import maritalStatusService from "@/_services/maritalStatusService";
import { IMaritalStatus } from "@eon-lib/eon-mongoose/types";
import propertyService from "@/_services/propertyService";

interface MaritalStatusProps {
  isModal?: boolean;
}

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

const expandableContent = (row: IMaritalStatus) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.description}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Nombre:</strong> {row.description || 'N/A'}
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

const MaritalStatus = ({ isModal = false }: MaritalStatusProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [maritalStatuses, setMaritalStatuses] = useState<IMaritalStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState<IMaritalStatus | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    fetchMaritalStatuses();
    fetchProperties();
  }, []);
  
  const fetchMaritalStatuses = async () => {
    setIsLoading(true);
    try {
      const data = await maritalStatusService.findAll();
      setMaritalStatuses(data);
    } catch (error) {
      console.error("Error loading marital statuses:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los estados civiles. Intente nuevamente.",
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
  
  const handleAddMaritalStatus = async (data: Partial<IMaritalStatus>) => {
    try {
      await maritalStatusService.createMaritalStatus(data)
      
      toast({
        title: "Éxito",
        description: "Estado civil agregado correctamente.",
      });
      
      fetchMaritalStatuses();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar estado civil:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el estado civil. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMaritalStatus = async (id: string | number, data: Partial<IMaritalStatus>) => {
    try {
      await maritalStatusService.updateMaritalStatus(id, data)
      
      toast({
        title: "Éxito",
        description: "Estado civil actualizado correctamente.",
      });
      
      fetchMaritalStatuses();
      setIsDialogOpen(false);
      setSelectedMaritalStatus(null);
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar estado civil ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado civil. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMaritalStatus = async (id: string | number) => {
    try {
      await maritalStatusService.softDeleteMaritalStatus(id)
      
      toast({
        title: "Éxito",
        description: "Estado civil eliminado correctamente.",
      });
      
      fetchMaritalStatuses();
    } catch (error) {
      console.error(`Error al eliminar estado civil ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el estado civil. Intente nuevamente.",
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
      id: "description",
      header: "Nombre",
      accessor: "description",
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
        if (!value || value.length === 0) return 'Todos';
        if (!Array.isArray(value)) return 'Todos';
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

  const getFormSections = useCallback((): SectionConfig[] => [
    {
      id: "maritalStatus-info",
      title: "Información del Estado Civil",
      description: "Ingrese los datos del nuevo estado civil",
      fields: [
        {
          id: "description",
          type: "text",
          label: "Nombre *",
          name: "description",
          placeholder: "Ingrese nombre del estado civil",
          required: true,
          helperText: "Ingrese el nombre identificativo del estado civil"
        },
        {
          id: "order",
          type: "number",
          label: "Orden",
          name: "order",
          placeholder: "Ingrese el orden del estado civil",
          required: false,
          helperText: "Orden de clasificación del estado civil"
        },
        {
          id: "assignedProperties",
          type: "checkboxGroup",
          label: "Predios Asignados",
          name: "assignedProperties",
          required: false,
          helperText: "Seleccione los predios donde estará disponible este estado civil (deje vacío para todos)",
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
          helperText: "Indica si el estado civil está activo"
        }
      ],
    }
  ], [properties]);

  const formValidationSchema = z.object({
    description: z.string().min(1, { message: "El nombre es obligatorio" }),
    order: z.number().optional(),
    state: z.boolean().default(true),
    assignedProperties: z.array(z.string()).optional().default([])
  });

  const handleFormSubmit = (data: Partial<IMaritalStatus>) => {
    if (isEditMode && selectedMaritalStatus && selectedMaritalStatus._id) {
      handleUpdateMaritalStatus(selectedMaritalStatus._id, data);
    } else {
      handleAddMaritalStatus(data);
    }
  };

  const handleEditClick = (maritalStatus: IMaritalStatus) => {
    setSelectedMaritalStatus(maritalStatus);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const renderActions = (row: IMaritalStatus) => {
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
            if (window.confirm(`¿Está seguro de eliminar el estado civil ${row.description}?`)) {
              handleDeleteMaritalStatus(row._id);
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
          <h1 className="text-2xl font-bold">Estados Civiles</h1>
          <p className="text-muted-foreground">
            {isModal 
              ? "Gestione los estados civiles"
              : "Gestione los estados civiles para su organización"
            }
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedMaritalStatus(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Estado
        </Button>
      </div>

      <div className={isModal ? "px-0.5 h-[calc(100vh-200px)] overflow-hidden" : ""}>
        <Grid
          data={maritalStatuses}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          isLoading={isLoading}
          gridId="maritalStatuses-grid"
          idField="_id"
          title=""
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Estado Civil" : "Agregar Nuevo Estado Civil"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} un estado civil.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedMaritalStatus ? {
              description: selectedMaritalStatus.description,
              order: selectedMaritalStatus.order || 0,
              state: selectedMaritalStatus.state,
              assignedProperties: selectedMaritalStatus.assignedProperties || []
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

export default MaritalStatus;