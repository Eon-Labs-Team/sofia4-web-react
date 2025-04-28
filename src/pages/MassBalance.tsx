import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Scale,
} from "lucide-react";
import { Column } from "@/lib/store/gridStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DynamicForm, {
  SectionConfig,
} from "@/components/DynamicForm/DynamicForm";
import { z } from "zod";
import { IMassBalance } from "@/types/IMassBalance";
import massBalanceService from "@/_services/massBalanceService";
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
    id: "period",
    header: "Periodo",
    accessor: "period",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "harvestFormat",
    header: "Formato Cosecha",
    accessor: "harvestFormat",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "packagingFormat",
    header: "Formato Embalaje",
    accessor: "packagingFormat",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "plants",
    header: "Plantas",
    accessor: "plants",
    visible: true,
    sortable: true,
  },
  {
    id: "hectares",
    header: "Hectáreas",
    accessor: "hectares",
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
    <h3 className="text-lg font-semibold mb-2">Balance de Masa - {row.period}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Formato Cosecha:</strong> {row.harvestFormat}
        </p>
        <p>
          <strong>Formato Embalaje:</strong> {row.packagingFormat}
        </p>
      </div>
      <div>
        <p>
          <strong>Plantas:</strong> {row.plants}
        </p>
        <p>
          <strong>Hectáreas:</strong> {row.hectares}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new mass balance
const formSections: SectionConfig[] = [
  {
    id: "mass-balance-info",
    title: "Información del Balance de Masa",
    description: "Ingrese los datos del nuevo balance de masa",
    fields: [
      {
        id: "period",
        type: "text",
        label: "Periodo",
        name: "period",
        placeholder: "Ej: 2023-2024",
        required: true,
        helperText: "Ingrese el periodo del balance de masa"
      },
      {
        id: "harvestFormat",
        type: "text",
        label: "Formato Cosecha",
        name: "harvestFormat",
        placeholder: "Ej: Bin, Caja",
        required: true,
        helperText: "Formato utilizado para la cosecha"
      },
      {
        id: "packagingFormat",
        type: "text",
        label: "Formato Embalaje",
        name: "packagingFormat",
        placeholder: "Ej: Caja, Granel",
        required: true,
        helperText: "Formato utilizado para el embalaje"
      },
      {
        id: "plants",
        type: "number",
        label: "Plantas",
        name: "plants",
        placeholder: "Cantidad de plantas",
        required: true,
        helperText: "Número total de plantas"
      },
      {
        id: "hectares",
        type: "number",
        label: "Hectáreas",
        name: "hectares",
        placeholder: "Cantidad de hectáreas",
        required: true,
        helperText: "Superficie total en hectáreas"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el balance está actualmente activo"
      },
    ],
  }
];

// Form validation schema
const formValidationSchema = z.object({
  period: z.string().min(1, { message: "El periodo es obligatorio" }),
  harvestFormat: z.string().min(1, { message: "El formato de cosecha es obligatorio" }),
  packagingFormat: z.string().min(1, { message: "El formato de embalaje es obligatorio" }),
  plants: z.number({ required_error: "El número de plantas es obligatorio" })
    .positive({ message: "El número de plantas debe ser positivo" }),
  hectares: z.number({ required_error: "La cantidad de hectáreas es obligatoria" })
    .positive({ message: "La cantidad de hectáreas debe ser positiva" }),
  state: z.boolean().default(true)
});

const MassBalance = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [massBalances, setMassBalances] = useState<IMassBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMassBalance, setSelectedMassBalance] = useState<IMassBalance | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch mass balances on component mount
  useEffect(() => {
    fetchMassBalances();
  }, []);
  
  // Function to fetch mass balances data
  const fetchMassBalances = async () => {
    setIsLoading(true);
    try {
      const response = await massBalanceService.findAll();
      // Handle both response formats
      const data = Array.isArray(response) ? response : 
                   (response as any)?.data || [];
      setMassBalances(data);
    } catch (error) {
      console.error("Error loading mass balances:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los balances de masa",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new mass balance
  const handleAddMassBalance = async (data: Partial<IMassBalance>) => {
    try {
      // Prepare data according to the exact model structure
      const massBalanceData: Partial<IMassBalance> = {
        period: data.period,
        harvestFormat: data.harvestFormat,
        packagingFormat: data.packagingFormat,
        plants: data.plants,
        hectares: data.hectares,
        state: data.state !== undefined ? data.state : true
      };

      await massBalanceService.createMassBalance(massBalanceData);
      
      toast({
        title: "Éxito",
        description: "Balance de masa creado correctamente",
        variant: "default",
      });
      
      // Refresh the data
      fetchMassBalances();
      
      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating mass balance:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el balance de masa",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a mass balance
  const handleUpdateMassBalance = async (id: string | number, data: Partial<IMassBalance>) => {
    try {
      await massBalanceService.updateMassBalance(id, data);
      
      toast({
        title: "Éxito",
        description: "Balance de masa actualizado correctamente",
        variant: "default",
      });
      
      // Refresh the data
      fetchMassBalances();
      
      // Close the dialog
      setIsDialogOpen(false);
      // Reset selected mass balance
      setSelectedMassBalance(null);
      // Reset edit mode
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error updating mass balance ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el balance de masa",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a mass balance
  const handleDeleteMassBalance = async (id: string | number) => {
    try {
      await massBalanceService.softDeleteMassBalance(id);
      
      toast({
        title: "Éxito",
        description: "Balance de masa eliminado correctamente",
        variant: "default",
      });
      
      // Refresh the data
      fetchMassBalances();
    } catch (error) {
      console.error(`Error deleting mass balance ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el balance de masa",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IMassBalance>) => {
    // Parse number fields
    const parsedData = {
      ...data,
      plants: typeof data.plants === 'string' ? parseInt(data.plants, 10) : data.plants,
      hectares: typeof data.hectares === 'string' ? parseFloat(data.hectares) : data.hectares,
    };

    if (isEditMode && selectedMassBalance) {
      handleUpdateMassBalance(selectedMassBalance._id, parsedData);
    } else {
      handleAddMassBalance(parsedData);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (massBalance: IMassBalance) => {
    setSelectedMassBalance(massBalance);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render actions column
  const renderActions = (row: IMassBalance) => {
    return (
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon" onClick={() => handleEditClick(row)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleDeleteMassBalance(row._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  // Add actions column to the columns
  const columnsWithActions = [
    ...columns,
    {
      id: "actions",
      header: "Acciones",
      accessor: "_id",
      visible: true,
      sortable: false,
      render: renderActions,
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Balance de Masa</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedMassBalance(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Balance
        </Button>
      </div>
      
      {isLoading ? (
        <div>Cargando...</div>
      ) : (
        <Grid
          columns={columnsWithActions}
          data={massBalances}
          expandableContent={expandableContent}
          gridId="mass-balance-table"
        />
      )}
      
      {/* Dialog for adding/editing a mass balance */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Balance de Masa" : "Agregar Balance de Masa"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Edite los detalles del balance de masa seleccionado."
                : "Complete el formulario para agregar un nuevo balance de masa."}
            </DialogDescription>
          </DialogHeader>
          
          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            defaultValues={selectedMassBalance || {
              state: true,
            }}
            validationSchema={formValidationSchema}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MassBalance; 