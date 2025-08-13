import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Trash,
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
import { IMachineryCleaning } from "@eon-lib/eon-mongoose";
import machineryCleaningService from "@/_services/machineryCleaningService";
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
    id: "equipmentType",
    header: "Tipo de Equipo",
    accessor: "equipmentType",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "machinery",
    header: "Maquinaria",
    accessor: "machinery",
    visible: true,
    sortable: true,
    groupable: true,
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
    id: "hour",
    header: "Hora",
    accessor: "hour",
    visible: true,
    sortable: true,
  },
  {
    id: "detergent",
    header: "Detergente",
    accessor: "detergent",
    visible: true,
    sortable: true,
  },
  {
    id: "dose",
    header: "Dosis",
    accessor: "dose",
    visible: true,
    sortable: true,
  },
  {
    id: "dilution",
    header: "Dilución",
    accessor: "dilution",
    visible: true,
    sortable: true,
  },
  {
    id: "volume",
    header: "Volumen",
    accessor: "volume",
    visible: true,
    sortable: true,
  },
  {
    id: "wastePlace",
    header: "Lugar de Desecho",
    accessor: "wastePlace",
    visible: true,
    sortable: true,
  },
  {
    id: "operator",
    header: "Operador",
    accessor: "operator",
    visible: true,
    sortable: true,
  },
  {
    id: "supervisor",
    header: "Supervisor",
    accessor: "supervisor",
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
    <h3 className="text-lg font-semibold mb-2">{row.machinery}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p>
          <strong>Tipo de Equipo:</strong> {row.equipmentType}
        </p>
        <p>
          <strong>Maquinaria:</strong> {row.machinery}
        </p>
        <p>
          <strong>Fecha:</strong> {row.date}
        </p>
        <p>
          <strong>Hora:</strong> {row.hour}
        </p>
      </div>
      <div>
        <p>
          <strong>Detergente:</strong> {row.detergent}
        </p>
        <p>
          <strong>Dosis:</strong> {row.dose}
        </p>
        <p>
          <strong>Dilución:</strong> {row.dilution}
        </p>
        <p>
          <strong>Volumen:</strong> {row.volume}
        </p>
      </div>
      <div>
        <p>
          <strong>Lugar de Desecho:</strong> {row.wastePlace}
        </p>
        <p>
          <strong>Operador:</strong> {row.operator}
        </p>
        <p>
          <strong>Supervisor:</strong> {row.supervisor}
        </p>
        <p>
          <strong>Observación:</strong> {row.observation}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new machinery cleaning record
const formSections: SectionConfig[] = [
  {
    id: "machinery-cleaning-info",
    title: "Información de Limpieza de Maquinaria",
    description: "Ingrese los datos de la limpieza de maquinaria",
    fields: [
      {
        id: "equipmentType",
        type: "text",
        label: "Tipo de Equipo",
        name: "equipmentType",
        placeholder: "Tipo de equipo",
        required: true,
        helperText: "Ingrese el tipo de equipo"
      },
      {
        id: "machinery",
        type: "text",
        label: "Maquinaria",
        name: "machinery",
        placeholder: "Nombre de la maquinaria",
        required: true,
        helperText: "Ingrese el nombre de la maquinaria"
      },
      {
        id: "date",
        type: "text",
        label: "Fecha",
        name: "date",
        required: true,
        helperText: "Fecha de la limpieza"
      },
      {
        id: "hour",
        type: "text",
        label: "Hora",
        name: "hour",
        placeholder: "HH:MM",
        required: true,
        helperText: "Hora de la limpieza"
      },
      {
        id: "detergent",
        type: "text",
        label: "Detergente",
        name: "detergent",
        placeholder: "Nombre del detergente",
        required: true,
        helperText: "Detergente utilizado"
      },
      {
        id: "dose",
        type: "text",
        label: "Dosis",
        name: "dose",
        placeholder: "Dosis aplicada",
        required: true,
        helperText: "Dosis del detergente"
      },
      {
        id: "dilution",
        type: "text",
        label: "Dilución",
        name: "dilution",
        placeholder: "Dilución aplicada",
        required: true,
        helperText: "Dilución del detergente"
      },
      {
        id: "volume",
        type: "text",
        label: "Volumen",
        name: "volume",
        placeholder: "Volumen utilizado",
        required: true,
        helperText: "Volumen total utilizado"
      },
      {
        id: "wastePlace",
        type: "text",
        label: "Lugar de Desecho",
        name: "wastePlace",
        placeholder: "Lugar de desecho",
        required: true,
        helperText: "Donde se desecharon los residuos"
      },
      {
        id: "operator",
        type: "text",
        label: "Operador",
        name: "operator",
        placeholder: "Nombre del operador",
        required: true,
        helperText: "Persona que realizó la limpieza"
      },
      {
        id: "supervisor",
        type: "text",
        label: "Supervisor",
        name: "supervisor",
        placeholder: "Nombre del supervisor",
        required: true,
        helperText: "Persona que supervisó la limpieza"
      },
      {
        id: "observation",
        type: "textarea",
        label: "Observación",
        name: "observation",
        placeholder: "Observaciones adicionales",
        required: false,
        helperText: "Notas u observaciones adicionales"
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
  equipmentType: z.string().min(1, { message: "El tipo de equipo es obligatorio" }),
  machinery: z.string().min(1, { message: "La maquinaria es obligatoria" }),
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  hour: z.string().min(1, { message: "La hora es obligatoria" }),
  detergent: z.string().min(1, { message: "El detergente es obligatorio" }),
  dose: z.string().min(1, { message: "La dosis es obligatoria" }),
  dilution: z.string().min(1, { message: "La dilución es obligatoria" }),
  volume: z.string().min(1, { message: "El volumen es obligatorio" }),
  wastePlace: z.string().min(1, { message: "El lugar de desecho es obligatorio" }),
  operator: z.string().min(1, { message: "El operador es obligatorio" }),
  supervisor: z.string().min(1, { message: "El supervisor es obligatorio" }),
  observation: z.string().optional(),
  state: z.boolean().default(true)
});

const LimpiezaMaquinaria = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [machineryCleanings, setMachineryCleanings] = useState<IMachineryCleaning[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMachineryCleaning, setSelectedMachineryCleaning] = useState<IMachineryCleaning | null>(null);
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
  
  // Fetch machinery cleaning records on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchMachineryCleanings();
    }
  }, [propertyId]);
  
  // Function to fetch machinery cleaning data
  const fetchMachineryCleanings = async () => {
    setIsLoading(true);
    try {
      const response = await machineryCleaningService.findAll();
      const data = response && typeof response === 'object' && 'data' in response 
      ? response.data as IMachineryCleaning[]
      : Array.isArray(response) ? response as IMachineryCleaning[] : [] as IMachineryCleaning[];
      setMachineryCleanings(data);
    } catch (error) {
      console.error("Error loading machinery cleaning records:", error);
      setMachineryCleanings([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new machinery cleaning record
  const handleAddMachineryCleaning = async (data: Partial<IMachineryCleaning>) => {
    try {
      await machineryCleaningService.createMachineryCleaning(data);
      toast({
        title: "Limpieza de maquinaria agregada",
        description: "Se ha agregado correctamente la limpieza de maquinaria.",
        variant: "default",
      });
      fetchMachineryCleanings();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding machinery cleaning:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la limpieza de maquinaria.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a machinery cleaning record
  const handleUpdateMachineryCleaning = async (id: string | number, data: Partial<IMachineryCleaning>) => {
    try {
      await machineryCleaningService.updateMachineryCleaning(id, data);
      toast({
        title: "Limpieza de maquinaria actualizada",
        description: "Se ha actualizado correctamente la limpieza de maquinaria.",
        variant: "default",
      });
      fetchMachineryCleanings();
      setIsDialogOpen(false);
      setSelectedMachineryCleaning(null);
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error updating machinery cleaning ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la limpieza de maquinaria.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a machinery cleaning record
  const handleDeleteMachineryCleaning = async (id: string | number) => {
    try {
      await machineryCleaningService.softDeleteMachineryCleaning(id);
      toast({
        title: "Limpieza de maquinaria eliminada",
        description: "Se ha desactivado correctamente la limpieza de maquinaria.",
        variant: "default",
      });
      fetchMachineryCleanings();
    } catch (error) {
      console.error(`Error deleting machinery cleaning ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la limpieza de maquinaria.",
        variant: "destructive",
      });
    }
  };

  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IMachineryCleaning>) => {
    if (isEditMode && selectedMachineryCleaning?._id) {
      handleUpdateMachineryCleaning(selectedMachineryCleaning._id, data);
    } else {
      handleAddMachineryCleaning(data);
    }
  };

  // Function to handle edit button click
  const handleEditClick = (machineryCleaning: IMachineryCleaning) => {
    setSelectedMachineryCleaning(machineryCleaning);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: IMachineryCleaning) => (
    <div className="flex items-center space-x-2">
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
        onClick={() => handleDeleteMachineryCleaning(row._id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Limpieza de Maquinaria</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedMachineryCleaning(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Limpieza
        </Button>
      </div>

      <Grid
        data={machineryCleanings}
        columns={columns}
        idField="_id"
        title="Limpieza Maquinaria"
        expandableContent={expandableContent}
        gridId="machinery-cleaning-grid"
        actions={renderActions}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Limpieza de Maquinaria" : "Agregar Limpieza de Maquinaria"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Actualice los detalles de la limpieza de maquinaria"
                : "Ingrese los detalles de la nueva limpieza de maquinaria"}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode ? selectedMachineryCleaning || {} : { state: true }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LimpiezaMaquinaria; 