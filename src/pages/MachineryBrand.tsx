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
import machineryBrandService from "@/_services/machineryBrandService";
import { IMachineryBrand } from "@eon-lib/eon-mongoose/types";
import propertyService from "@/_services/propertyService";

interface MachineryBrandProps {
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

const expandableContent = (row: IMachineryBrand) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.brandName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Nombre:</strong> {row.brandName || 'N/A'}
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

const MachineryBrand = ({ isModal = false }: MachineryBrandProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [machineryBrands, setMachineryBrands] = useState<IMachineryBrand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMachineryBrand, setSelectedMachineryBrand] = useState<IMachineryBrand | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);

  useEffect(() => {
    fetchMachineryBrands();
    fetchProperties();
  }, []);
  
  const fetchMachineryBrands = async () => {
    setIsLoading(true);
    try {
      const data = await machineryBrandService.findAll();
      setMachineryBrands(data);
    } catch (error) {
      console.error("Error loading machinery brands:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las marcas de maquinaria. Intente nuevamente.",
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
  
  const handleAddMachineryBrand = async (data: Partial<IMachineryBrand>) => {
    try {
      await machineryBrandService.createMachineryBrand(data)
      
      toast({
        title: "Éxito",
        description: "Marca de maquinaria agregada correctamente.",
      });
      
      fetchMachineryBrands();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar marca de maquinaria:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la marca de maquinaria. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateMachineryBrand = async (id: string | number, data: Partial<IMachineryBrand>) => {
    try {
      await machineryBrandService.updateMachineryBrand(id, data)
      
      toast({
        title: "Éxito",
        description: "Marca de maquinaria actualizada correctamente.",
      });
      
      fetchMachineryBrands();
      setIsDialogOpen(false);
      setSelectedMachineryBrand(null);
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar marca de maquinaria ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la marca de maquinaria. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMachineryBrand = async (id: string | number) => {
    try {
      await machineryBrandService.softDeleteMachineryBrand(id)
      
      toast({
        title: "Éxito",
        description: "Marca de maquinaria eliminada correctamente.",
      });
      
      fetchMachineryBrands();
    } catch (error) {
      console.error(`Error al eliminar marca de maquinaria ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la marca de maquinaria. Intente nuevamente.",
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
      id: "brandName",
      header: "Nombre",
      accessor: "brandName",
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
      id: "machineryBrand-info",
      title: "Información de la Marca de Maquinaria",
      description: "Ingrese los datos de la nueva marca de maquinaria",
      fields: [
        {
          id: "brandName",
          type: "text",
          label: "Nombre *",
          name: "brandName",
          placeholder: "Ingrese nombre de la marca",
          required: true,
          helperText: "Ingrese el nombre identificativo de la marca de maquinaria"
        },
        {
          id: "order",
          type: "number",
          label: "Orden",
          name: "order",
          placeholder: "Ingrese el orden de la marca",
          required: false,
          helperText: "Orden de clasificación de la marca"
        },
        {
          id: "assignedProperties",
          type: "checkboxGroup",
          label: "Predios Asignados",
          name: "assignedProperties",
          required: false,
          helperText: "Seleccione los predios donde estará disponible esta marca (deje vacío para todos)",
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
          helperText: "Indica si la marca está activa"
        }
      ],
    }
  ], [properties]);

  const formValidationSchema = z.object({
    brandName: z.string().min(1, { message: "El nombre es obligatorio" }),
    order: z.number().optional(),
    state: z.boolean().default(true),
    assignedProperties: z.array(z.string()).optional().default([])
  });

  const handleFormSubmit = (data: Partial<IMachineryBrand>) => {
    if (isEditMode && selectedMachineryBrand && selectedMachineryBrand._id) {
      handleUpdateMachineryBrand(selectedMachineryBrand._id, data);
    } else {
      handleAddMachineryBrand(data);
    }
  };

  const handleEditClick = (machineryBrand: IMachineryBrand) => {
    setSelectedMachineryBrand(machineryBrand);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const renderActions = (row: IMachineryBrand) => {
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
            if (window.confirm(`¿Está seguro de eliminar la marca ${row.brandName}?`)) {
              handleDeleteMachineryBrand(row._id);
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
          <h1 className="text-2xl font-bold">Marcas de Maquinaria</h1>
          <p className="text-muted-foreground">
            {isModal 
              ? "Gestione las marcas de maquinaria"
              : "Gestione las marcas de maquinaria para su organización"
            }
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedMachineryBrand(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Marca
        </Button>
      </div>

      <div className={isModal ? "px-0.5 h-[calc(100vh-200px)] overflow-hidden" : ""}>
        <Grid
          data={machineryBrands}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          isLoading={isLoading}
          gridId="machineryBrands-grid"
          idField="_id"
          title=""
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Marca de Maquinaria" : "Agregar Nueva Marca de Maquinaria"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} una marca de maquinaria.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedMachineryBrand ? {
              brandName: selectedMachineryBrand.brandName,
              order: selectedMachineryBrand.order || 0,
              state: selectedMachineryBrand.state,
              assignedProperties: selectedMachineryBrand.assignedProperties || []
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

export default MachineryBrand;