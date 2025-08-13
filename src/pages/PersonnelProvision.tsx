import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  UserCheck,
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
import { IPersonnelProvision } from "@eon-lib/eon-mongoose";
import { z } from "zod";
import personnelProvisionService from "@/_services/personnelProvisionService";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

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
    id: "deliveryDate",
    header: "Fecha de Entrega",
    accessor: "deliveryDate",
    visible: true,
    sortable: true,
    groupable: true,
    render: (value: string) => format(new Date(value), 'dd/MM/yyyy'),
  },
  {
    id: "dniRut",
    header: "DNI/RUT",
    accessor: "dniRut",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "workerName",
    header: "Nombre del Trabajador",
    accessor: "workerName",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "category",
    header: "Categoría",
    accessor: "category",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "product",
    header: "Producto",
    accessor: "product",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "quantity",
    header: "Cantidad",
    accessor: "quantity",
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
    id: "user",
    header: "Usuario",
    accessor: "user",
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
    render: renderState,
  }
];

// Expandable content for each row
const expandableContent = (row: any) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.workerName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Fecha de Entrega:</strong> {format(new Date(row.deliveryDate), 'dd/MM/yyyy')}
        </p>
        <p>
          <strong>DNI/RUT:</strong> {row.dniRut}
        </p>
        <p>
          <strong>Categoría:</strong> {row.category}
        </p>
        <p>
          <strong>Producto:</strong> {row.product}
        </p>
      </div>
      <div>
        <p>
          <strong>Cantidad:</strong> {row.quantity}
        </p>
        <p>
          <strong>Observación:</strong> {row.observation}
        </p>
        <p>
          <strong>Usuario:</strong> {row.user}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new personnel provision
const formSections: SectionConfig[] = [
  {
    id: "personnel-provision-info",
    title: "Información de Dotación al Personal",
    description: "Ingrese los datos de la nueva dotación al personal",
    fields: [
      {
        id: "deliveryDate",
        type: "date",
        label: "Fecha de Entrega",
        name: "deliveryDate",
        required: true,
        helperText: "Fecha en que se realizó la entrega"
      },
      {
        id: "dniRut",
        type: "text",
        label: "DNI/RUT",
        name: "dniRut",
        placeholder: "Ej: 12345678-9",
        required: true,
        helperText: "Documento de identidad del trabajador"
      },
      {
        id: "workerName",
        type: "text",
        label: "Nombre del Trabajador",
        name: "workerName",
        placeholder: "Nombre completo",
        required: true,
        helperText: "Nombre completo del trabajador"
      },
      {
        id: "category",
        type: "text",
        label: "Categoría",
        name: "category",
        placeholder: "Ej: Equipamiento, Herramientas",
        required: true,
        helperText: "Categoría del producto entregado"
      },
      {
        id: "product",
        type: "text",
        label: "Producto",
        name: "product",
        placeholder: "Nombre del producto",
        required: true,
        helperText: "Nombre del producto entregado"
      },
      {
        id: "quantity",
        type: "number",
        label: "Cantidad",
        name: "quantity",
        placeholder: "0",
        required: true,
        helperText: "Cantidad de productos entregados"
      },
      {
        id: "observation",
        type: "textarea",
        label: "Observación",
        name: "observation",
        placeholder: "Observaciones adicionales",
        required: false,
        helperText: "Observaciones o notas adicionales"
      },
      {
        id: "user",
        type: "text",
        label: "Usuario",
        name: "user",
        placeholder: "Nombre del usuario que registra",
        required: true,
        helperText: "Usuario que realiza el registro"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el registro está actualmente activo"
      },
    ],
  }
];

// Form validation schema
const formValidationSchema = z.object({
  deliveryDate: z.string().min(1, { message: "La fecha de entrega es obligatoria" }),
  dniRut: z.string().min(1, { message: "El DNI/RUT es obligatorio" }),
  workerName: z.string().min(1, { message: "El nombre del trabajador es obligatorio" }),
  category: z.string().min(1, { message: "La categoría es obligatoria" }),
  product: z.string().min(1, { message: "El producto es obligatorio" }),
  quantity: z.number().min(1, { message: "La cantidad debe ser mayor a 0" }),
  observation: z.string().optional(),
  user: z.string().min(1, { message: "El usuario es obligatorio" }),
  state: z.boolean().default(true)
});

// Types for API response
interface ApiResponse {
  data?: IPersonnelProvision[];
  [key: string]: any;
}

const PersonnelProvision = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [personnelProvisions, setPersonnelProvisions] = useState<IPersonnelProvision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvision, setSelectedProvision] = useState<IPersonnelProvision | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Get propertyId from AuthStore
  const { propertyId } = useAuthStore();
  
  // Redirect to homepage if no propertyId is available
  useEffect(() => {
    if (!propertyId) {
      // You could add a navigation here to redirect to home page if needed
      toast({
        title: "Error",
        description: "No hay un predio seleccionado. Por favor, seleccione un predio desde la página principal.",
        variant: "destructive",
      });
    }
  }, [propertyId]);
  
  // Fetch personnel provisions on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchPersonnelProvisions();
    }
  }, [propertyId]);
  
  // Function to fetch personnel provisions data
  const fetchPersonnelProvisions = async () => {
    setIsLoading(true);
    try {
      const response = await personnelProvisionService.findAll() as ApiResponse | IPersonnelProvision[];
      // Handle different response formats
      const provisions = Array.isArray(response) ? response : response?.data || [];
      setPersonnelProvisions(provisions);
    } catch (error) {
      console.error("Error loading personnel provisions:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de dotación al personal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new personnel provision
  const handleAddPersonnelProvision = async (data: Partial<IPersonnelProvision>) => {
    try {
      await personnelProvisionService.createPersonnelProvision(data);
      
      toast({
        title: "Éxito",
        description: "Dotación al personal creada correctamente",
      });
      
      setIsDialogOpen(false);
      fetchPersonnelProvisions();
    } catch (error) {
      console.error("Error creating personnel provision:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la dotación al personal",
        variant: "destructive",
      });
    }
  };
  
  // Function to update a personnel provision
  const handleUpdatePersonnelProvision = async (id: string | number, data: Partial<IPersonnelProvision>) => {
    try {
      await personnelProvisionService.updatePersonnelProvision(id, data);
      
      toast({
        title: "Éxito",
        description: "Dotación al personal actualizada correctamente",
      });
      
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedProvision(null);
      fetchPersonnelProvisions();
    } catch (error) {
      console.error("Error updating personnel provision:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la dotación al personal",
        variant: "destructive",
      });
    }
  };
  
  // Function to delete a personnel provision
  const handleDeletePersonnelProvision = async (id: string | number) => {
    try {
      await personnelProvisionService.softDeletePersonnelProvision(id);
      
      toast({
        title: "Éxito",
        description: "Dotación al personal eliminada correctamente",
      });
      
      fetchPersonnelProvisions();
    } catch (error) {
      console.error("Error deleting personnel provision:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la dotación al personal",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IPersonnelProvision>) => {
    if (isEditMode && selectedProvision) {
      handleUpdatePersonnelProvision(selectedProvision._id, data);
    } else {
      handleAddPersonnelProvision(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (provision: IPersonnelProvision) => {
    setSelectedProvision(provision);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render actions for each row
  const renderActions = (row: IPersonnelProvision) => {
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
          onClick={() => handleDeletePersonnelProvision(row._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dotación al Personal</h1>
        <Button 
          onClick={() => {
            setIsEditMode(false);
            setSelectedProvision(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Registro
        </Button>
      </div>

      <Grid
        data={personnelProvisions}
        columns={columns}
        gridId="personnel-provision-grid"
        title="Listado de Dotación al Personal"
        expandableContent={expandableContent}
        actions={renderActions}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Dotación al Personal" : "Agregar Dotación al Personal"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} un registro de dotación al personal.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={
              isEditMode && selectedProvision
                ? {
                    deliveryDate: selectedProvision.deliveryDate,
                    dniRut: selectedProvision.dniRut,
                    workerName: selectedProvision.workerName,
                    category: selectedProvision.category,
                    product: selectedProvision.product,
                    quantity: selectedProvision.quantity,
                    observation: selectedProvision.observation,
                    user: selectedProvision.user,
                    state: selectedProvision.state,
                  }
                : undefined
            }
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setIsEditMode(false);
                setSelectedProvision(null);
              }}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonnelProvision; 