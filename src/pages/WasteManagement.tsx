import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Building2,
  CheckCircle,
  XCircle,
  Recycle,
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
import { IWasteManagement } from "@eon-lib/eon-mongoose";
import wasteManagementService from "@/_services/wasteManagementService";
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

// Column configuration for the grid - based on the IWasteManagement interface
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
  },
  {
    id: "wasteOriginField",
    header: "Campo de Origen",
    accessor: "wasteOriginField",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "wasteOrigin",
    header: "Origen",
    accessor: "wasteOrigin",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "wasteType",
    header: "Tipo de Residuo",
    accessor: "wasteType",
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
    id: "weight",
    header: "Peso",
    accessor: "weight",
    visible: true,
    sortable: true,
  },
  {
    id: "wasteHandling",
    header: "Manejo",
    accessor: "wasteHandling",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "wasteDestination",
    header: "Destino",
    accessor: "wasteDestination",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "responsiblePerson",
    header: "Responsable",
    accessor: "responsiblePerson",
    visible: true,
    sortable: true,
    groupable: true,
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
    <h3 className="text-lg font-semibold mb-2">Manejo de Residuos</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <p><strong>Aplicado por:</strong> {row.appliedPerson}</p>
        <p><strong>Recomendado por:</strong> {row.recommendedBy}</p>
        <p><strong>Supervisor:</strong> {row.supervisor}</p>
      </div>
      <div>
        <p><strong>Entregado a:</strong> {row.deliveredTo}</p>
        <p><strong>Campo de Origen:</strong> {row.wasteOriginField}</p>
        <p><strong>Origen:</strong> {row.wasteOrigin}</p>
      </div>
      <div>
        <p><strong>Tipo de Residuo:</strong> {row.wasteType}</p>
        <p><strong>Cantidad:</strong> {row.quantity}</p>
        <p><strong>Peso:</strong> {row.weight}</p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new waste management - matches exactly the model structure
const formSections: SectionConfig[] = [
  {
    id: "waste-management-info",
    title: "Información de Manejo de Residuos",
    description: "Ingrese los datos del manejo de residuos",
    fields: [
      {
        id: "deliveryDate",
        type: "date",
        label: "Fecha de Entrega",
        name: "deliveryDate",
        required: true,
        helperText: "Seleccione la fecha de entrega"
      },
      {
        id: "wasteOriginField",
        type: "text",
        label: "Campo de Origen",
        name: "wasteOriginField",
        placeholder: "Campo donde se originó el residuo",
        required: true,
        helperText: "Ingrese el campo donde se originó el residuo"
      },
      {
        id: "wasteOrigin",
        type: "text",
        label: "Origen del Residuo",
        name: "wasteOrigin",
        placeholder: "Origen específico del residuo",
        required: true,
        helperText: "Ingrese el origen específico del residuo"
      },
      {
        id: "wasteType",
        type: "text",
        label: "Tipo de Residuo",
        name: "wasteType",
        placeholder: "Tipo de residuo",
        required: true,
        helperText: "Ingrese el tipo de residuo"
      },
      {
        id: "quantity",
        type: "number",
        label: "Cantidad",
        name: "quantity",
        placeholder: "Cantidad de residuos",
        required: true,
        helperText: "Ingrese la cantidad de residuos"
      },
      {
        id: "weight",
        type: "number",
        label: "Peso",
        name: "weight",
        placeholder: "Peso de los residuos",
        required: true,
        helperText: "Ingrese el peso de los residuos"
      },
      {
        id: "wasteHandling",
        type: "text",
        label: "Manejo de Residuos",
        name: "wasteHandling",
        placeholder: "Manejo aplicado a los residuos",
        required: true,
        helperText: "Ingrese el manejo aplicado a los residuos"
      },
      {
        id: "wasteDestination",
        type: "text",
        label: "Destino del Residuo",
        name: "wasteDestination",
        placeholder: "Destino final de los residuos",
        required: true,
        helperText: "Ingrese el destino final de los residuos"
      },
      {
        id: "responsiblePerson",
        type: "text",
        label: "Persona Responsable",
        name: "responsiblePerson",
        placeholder: "Persona responsable",
        required: true,
        helperText: "Ingrese la persona responsable"
      },
      {
        id: "appliedPerson",
        type: "text",
        label: "Aplicado por",
        name: "appliedPerson",
        placeholder: "Persona que aplicó",
        required: true,
        helperText: "Ingrese la persona que aplicó"
      },
      {
        id: "recommendedBy",
        type: "text",
        label: "Recomendado por",
        name: "recommendedBy",
        placeholder: "Persona que recomendó",
        required: true,
        helperText: "Ingrese la persona que recomendó"
      },
      {
        id: "supervisor",
        type: "text",
        label: "Supervisor",
        name: "supervisor",
        placeholder: "Supervisor",
        required: true,
        helperText: "Ingrese el supervisor"
      },
      {
        id: "deliveredTo",
        type: "text",
        label: "Entregado a",
        name: "deliveredTo",
        placeholder: "Entregado a",
        required: true,
        helperText: "Ingrese a quién se entregó"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el manejo de residuos está actualmente activo"
      },
    ],
  }
];

// Form validation schema - matches exactly the model requirements
const formValidationSchema = z.object({
  deliveryDate: z.string().min(1, { message: "La fecha de entrega es obligatoria" }),
  wasteOriginField: z.string().min(1, { message: "El campo de origen es obligatorio" }),
  wasteOrigin: z.string().min(1, { message: "El origen del residuo es obligatorio" }),
  wasteType: z.string().min(1, { message: "El tipo de residuo es obligatorio" }),
  quantity: z.number({ invalid_type_error: "La cantidad debe ser un número" }),
  weight: z.number({ invalid_type_error: "El peso debe ser un número" }),
  wasteHandling: z.string().min(1, { message: "El manejo de residuos es obligatorio" }),
  wasteDestination: z.string().min(1, { message: "El destino del residuo es obligatorio" }),
  responsiblePerson: z.string().min(1, { message: "La persona responsable es obligatoria" }),
  appliedPerson: z.string().min(1, { message: "La persona que aplicó es obligatoria" }),
  recommendedBy: z.string().min(1, { message: "La persona que recomendó es obligatoria" }),
  supervisor: z.string().min(1, { message: "El supervisor es obligatorio" }),
  deliveredTo: z.string().min(1, { message: "A quién se entregó es obligatorio" }),
  state: z.boolean().default(true)
});

const WasteManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [wasteManagements, setWasteManagements] = useState<IWasteManagement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWasteManagement, setSelectedWasteManagement] = useState<IWasteManagement | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
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
  
  // Fetch waste managements on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchWasteManagements();
    }
  }, [propertyId]);
  
  // Function to fetch waste managements data
  const fetchWasteManagements = async () => {
    setIsLoading(true);
    try {
      const response = await wasteManagementService.findAll(propertyId);
      const data = Array.isArray(response) ? response : 
      (response as any).data || [];
      setWasteManagements(data);
    } catch (error) {
      console.error("Error loading waste managements:", error);
      setWasteManagements([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new waste management
  const handleAddWasteManagement = async (data: Partial<IWasteManagement>) => {
    try {
      await wasteManagementService.createWasteManagement(data, propertyId);
      await fetchWasteManagements();
      setIsDialogOpen(false);
      toast({
        title: "Éxito",
        description: "Manejo de residuos agregado correctamente",
        variant: "default",
      });
    } catch (error) {
      console.error("Error adding waste management:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el manejo de residuos",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a waste management
  const handleUpdateWasteManagement = async (id: string | number, data: Partial<IWasteManagement>) => {
    try {
      await wasteManagementService.updateWasteManagement(id, data);
      await fetchWasteManagements();
      setIsDialogOpen(false);
      setSelectedWasteManagement(null);
      setIsEditMode(false);
      toast({
        title: "Éxito",
        description: "Manejo de residuos actualizado correctamente",
        variant: "default",
      });
    } catch (error) {
      console.error(`Error updating waste management ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el manejo de residuos",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a waste management
  const handleDeleteWasteManagement = async (id: string | number) => {
    try {
      await wasteManagementService.softDeleteWasteManagement(id);
      await fetchWasteManagements();
      toast({
        title: "Éxito",
        description: "Manejo de residuos eliminado correctamente",
        variant: "default",
      });
    } catch (error) {
      console.error(`Error deleting waste management ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el manejo de residuos",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IWasteManagement>) => {
    if (isEditMode && selectedWasteManagement) {
      handleUpdateWasteManagement(selectedWasteManagement._id, data);
    } else {
      handleAddWasteManagement(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (wasteManagement: IWasteManagement) => {
    setSelectedWasteManagement(wasteManagement);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render actions for each row
  const renderActions = (row: IWasteManagement) => {
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
          onClick={() => handleDeleteWasteManagement(row._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manejo de Residuos</h1>
        <Button 
          onClick={() => {
            setSelectedWasteManagement(null);
            setIsEditMode(false);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Manejo
        </Button>
      </div>

      {/* Grid for displaying waste managements */}
      <Grid
        data={wasteManagements}
        columns={columns}
        gridId="waste-management-grid"
        title="Manejo de Residuos"
        expandableContent={expandableContent}
        actions={renderActions}
      />

      {/* Dialog for adding/editing waste management */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Manejo de Residuos" : "Agregar Manejo de Residuos"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Actualice los detalles del manejo de residuos existente" 
                : "Complete el formulario para agregar un nuevo manejo de residuos"}
            </DialogDescription>
          </DialogHeader>
          
          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={selectedWasteManagement || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WasteManagement; 