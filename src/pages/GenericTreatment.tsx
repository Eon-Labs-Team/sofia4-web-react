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
import { IGenericTreatment } from "@eon-lib/eon-mongoose";
import genericTreatmentService from "@/_services/genericTreatmentService";
import propertyService from "@/_services/propertyService";

interface GenericTreatmentProps {
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

const GenericTreatment = ({ isModal = false }: GenericTreatmentProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [genericTreatments, setGenericTreatments] = useState<IGenericTreatment[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenericTreatment, setSelectedGenericTreatment] = useState<IGenericTreatment | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
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
      header: "Nombre del Tratamiento",
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
  const expandableContent = (row: IGenericTreatment) => (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">{row.name}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p>
            <strong>Nombre:</strong> {row.name || 'N/A'}
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
        </div>
      </div>
    </div>
  );
  
  // Fetch genericTreatments on component mount
  useEffect(() => {
    fetchGenericTreatments();
    fetchProperties();
  }, []);
  
  // Function to fetch genericTreatments data
  const fetchGenericTreatments = async () => {
    setIsLoading(true);
    try {
      const data = await genericTreatmentService.findAll();
      setGenericTreatments(data as IGenericTreatment[]);
    } catch (error) {
      console.error("Error loading generic treatments:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los tratamientos genéricos. Intente nuevamente.",
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
  
  // Function to handle adding a new genericTreatment
  const handleAddGenericTreatment = async (data: Partial<IGenericTreatment>) => {
    try {
      await genericTreatmentService.create(data);
      
      toast({
        title: "Éxito",
        description: "Tratamiento genérico agregado correctamente.",
      });
      
      // Refresh data
      fetchGenericTreatments();
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar tratamiento genérico:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el tratamiento genérico. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a genericTreatment
  const handleUpdateGenericTreatment = async (id: string, data: Partial<IGenericTreatment>) => {
    try {
      await genericTreatmentService.update(id, data);
      
      toast({
        title: "Éxito",
        description: "Tratamiento genérico actualizado correctamente.",
      });
      
      // Refresh data
      fetchGenericTreatments();
      // Close dialog
      setIsDialogOpen(false);
      // Reset selected genericTreatment
      setSelectedGenericTreatment(null);
      // Reset edit mode
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar tratamiento genérico ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el tratamiento genérico. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a genericTreatment
  const handleDeleteGenericTreatment = async (id: string) => {
    try {
      await genericTreatmentService.softDelete(id);
      
      toast({
        title: "Éxito",
        description: "Tratamiento genérico eliminado correctamente.",
      });
      
      // Refresh data
      fetchGenericTreatments();
    } catch (error) {
      console.error(`Error al eliminar tratamiento genérico ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el tratamiento genérico. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Form configuration for adding new genericTreatment
  const getFormSections = useCallback((): SectionConfig[] => [
    {
      id: "genericTreatment-info",
      title: "Información del Tratamiento",
      description: "Ingrese los datos del nuevo tratamiento genérico",
      fields: [
        {
          id: "name",
          type: "text",
          label: "Nombre *",
          name: "name",
          placeholder: "Ingrese nombre del tratamiento",
          required: true,
          helperText: "Ingrese el nombre identificativo del tratamiento"
        },
        {
          id: "state",
          type: "checkbox",
          label: "Activo",
          name: "state",
          required: false,
          helperText: "Indica si el tratamiento está activo"
        },
        {
          id: "assignedProperties",
          type: "checkboxGroup",
          label: "Predios Asignados",
          name: "assignedProperties",
          required: false,
          helperText: "Seleccione los predios donde estará disponible este tratamiento (deje vacío para todos)",
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
  const handleFormSubmit = (data: Partial<IGenericTreatment>) => {
    if (isEditMode && selectedGenericTreatment && selectedGenericTreatment._id) {
      handleUpdateGenericTreatment(selectedGenericTreatment._id, data);
    } else {
      handleAddGenericTreatment(data);
    }
  };

  // Handle edit button click
  const handleEditClick = (genericTreatment: IGenericTreatment) => {
    setSelectedGenericTreatment(genericTreatment);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: IGenericTreatment) => {
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
            if (window.confirm(`¿Está seguro de eliminar el tratamiento ${row.name}?`)) {
              handleDeleteGenericTreatment(row._id);
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
          <h1 className="text-2xl font-bold">Tratamientos Genéricos</h1>
          <p className="text-muted-foreground">
            {isModal 
              ? "Gestione los tratamientos genéricos"
              : "Gestione los tratamientos genéricos para su organización"
            }
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedGenericTreatment(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Tratamiento
        </Button>
      </div>

      <div className={isModal ? "px-0.5 h-[calc(100vh-200px)] overflow-hidden" : ""}>
        <Grid
          data={genericTreatments}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          isLoading={isLoading}
          gridId="genericTreatments-grid"
          idField="_id"
          title=""
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Tratamiento" : "Agregar Nuevo Tratamiento"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} un tratamiento genérico.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedGenericTreatment ? {
              name: selectedGenericTreatment.name,
              state: selectedGenericTreatment.state,
              assignedProperties: selectedGenericTreatment.assignedProperties || []
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

export default GenericTreatment;