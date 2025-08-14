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
import machineryTypeService from "@/_services/machineryTypeService";
import { IMachineryType } from "@eon-lib/eon-mongoose";
import propertyService from "@/_services/propertyService";

interface MachineryTypeProps {
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

const expandableContent = (row: IMachineryType) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.machineryTypeName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Nombre:</strong> {row.machineryTypeName || 'N/A'}
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

const MachineryType = ({ isModal = false }: MachineryTypeProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [machineryTypes, setMachineryTypes] = useState<IMachineryType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMachineryType, setSelectedMachineryType] = useState<IMachineryType | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    fetchMachineryTypes();
    fetchProperties();
  }, []);
  
  const fetchMachineryTypes = async () => {
    setIsLoading(true);
    try {
      const data = await machineryTypeService.findAll();
      setMachineryTypes(data);
    } catch (error) {
      console.error("Error loading machinery types:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tipos de maquinaria. Intente nuevamente.",
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
  
  const handleAddMachineryType = async (data: Partial<IMachineryType>) => {
    try {
      await machineryTypeService.createMachineryType(data)
      
      toast({
        title: "Éxito",
        description: "Tipo de maquinaria agregado correctamente.",
      });
      
      fetchMachineryTypes();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar tipo de maquinaria:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el tipo de maquinaria. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMachineryType = async (id: string | number, data: Partial<IMachineryType>) => {
    try {
      await machineryTypeService.updateMachineryType(id, data)
      
      toast({
        title: "Éxito",
        description: "Tipo de maquinaria actualizado correctamente.",
      });
      
      fetchMachineryTypes();
      setIsDialogOpen(false);
      setSelectedMachineryType(null);
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar tipo de maquinaria ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el tipo de maquinaria. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMachineryType = async (id: string | number) => {
    try {
      await machineryTypeService.softDeleteMachineryType(id)
      
      toast({
        title: "Éxito",
        description: "Tipo de maquinaria eliminado correctamente.",
      });
      
      fetchMachineryTypes();
    } catch (error) {
      console.error(`Error al eliminar tipo de maquinaria ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el tipo de maquinaria. Intente nuevamente.",
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
      id: "machineryTypeName",
      header: "Nombre",
      accessor: "machineryTypeName",
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
      id: "machineryType-info",
      title: "Información del Tipo de Maquinaria",
      description: "Ingrese los datos del nuevo tipo de maquinaria",
      fields: [
        {
          id: "machineryTypeName",
          type: "text",
          label: "Nombre *",
          name: "machineryTypeName",
          placeholder: "Ingrese nombre del tipo",
          required: true,
          helperText: "Ingrese el nombre identificativo del tipo de maquinaria"
        },
        {
          id: "order",
          type: "number",
          label: "Orden",
          name: "order",
          placeholder: "Ingrese el orden del tipo",
          required: false,
          helperText: "Orden de clasificación del tipo"
        },
        {
          id: "assignedProperties",
          type: "checkboxGroup",
          label: "Predios Asignados",
          name: "assignedProperties",
          required: false,
          helperText: "Seleccione los predios donde estará disponible este tipo (deje vacío para todos)",
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
          helperText: "Indica si el tipo está activo"
        }
      ],
    }
  ], [properties]);

  const formValidationSchema = z.object({
    machineryTypeName: z.string().min(1, { message: "El nombre es obligatorio" }),
    order: z.number().optional(),
    state: z.boolean().default(true),
    assignedProperties: z.array(z.string()).optional().default([])
  });

  const handleFormSubmit = (data: Partial<IMachineryType>) => {
    if (isEditMode && selectedMachineryType && selectedMachineryType._id) {
      handleUpdateMachineryType(selectedMachineryType._id, data);
    } else {
      handleAddMachineryType(data);
    }
  };

  const handleEditClick = (machineryType: IMachineryType) => {
    setSelectedMachineryType(machineryType);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const renderActions = (row: IMachineryType) => {
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
            if (window.confirm(`¿Está seguro de eliminar el tipo ${row.machineryTypeName}?`)) {
              handleDeleteMachineryType(row._id);
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
          <h1 className="text-2xl font-bold">Tipos de Maquinaria</h1>
          <p className="text-muted-foreground">
            {isModal 
              ? "Gestione los tipos de maquinaria"
              : "Gestione los tipos de maquinaria para su organización"
            }
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedMachineryType(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Tipo
        </Button>
      </div>

      <div className={isModal ? "px-0.5 h-[calc(100vh-200px)] overflow-hidden" : ""}>
        <Grid
          data={machineryTypes}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          isLoading={isLoading}
          gridId="machineryTypes-grid"
          idField="_id"
          title=""
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Tipo de Maquinaria" : "Agregar Nuevo Tipo de Maquinaria"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} un tipo de maquinaria.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedMachineryType ? {
              machineryTypeName: selectedMachineryType.machineryTypeName,
              order: selectedMachineryType.order || 0,
              state: selectedMachineryType.state,
              assignedProperties: selectedMachineryType.assignedProperties || []
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

export default MachineryType;