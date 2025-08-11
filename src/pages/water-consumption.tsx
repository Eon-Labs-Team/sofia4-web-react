import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Droplets,
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
} from "@/components/ui/dialog";
import DynamicForm, {
  SectionConfig,
} from "@/components/DynamicForm/DynamicForm";
import { z } from "zod";
import { IWaterConsumption } from "@eon-lib/eon-mongoose";
import waterConsumptionService from "@/_services/waterConsumptionService";
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
    id: "zone",
    header: "Zona",
    accessor: "zone",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "sectorOrBooth",
    header: "Sector o Cabina",
    accessor: "sectorOrBooth",
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
  },
  {
    id: "time",
    header: "Hora",
    accessor: "time",
    visible: true,
    sortable: true,
  },
  {
    id: "meterNumber",
    header: "Número de Medidor",
    accessor: "meterNumber",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "privateQuantity",
    header: "Cantidad Privada",
    accessor: "privateQuantity",
    visible: true,
    sortable: true,
  },
  {
    id: "publicQuantity",
    header: "Cantidad Pública",
    accessor: "publicQuantity",
    visible: true,
    sortable: true,
  },
  {
    id: "totalQuantity",
    header: "Cantidad Total",
    accessor: "totalQuantity",
    visible: true,
    sortable: true,
  },
  {
    id: "flowRate",
    header: "Caudal",
    accessor: "flowRate",
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
const expandableContent = (row: IWaterConsumption) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">Detalles de Consumo de Agua</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div>
        <p><strong>Zona:</strong> {row.zone}</p>
        <p><strong>Sector o Cabina:</strong> {row.sectorOrBooth}</p>
        <p><strong>Fecha:</strong> {row.date}</p>
        <p><strong>Hora:</strong> {row.time}</p>
      </div>
      <div>
        <p><strong>Número de Medidor:</strong> {row.meterNumber}</p>
        <p><strong>Cantidad Privada:</strong> {row.privateQuantity}</p>
        <p><strong>Cantidad Pública:</strong> {row.publicQuantity}</p>
        <p><strong>Cantidad Total:</strong> {row.totalQuantity}</p>
      </div>
      <div>
        <p><strong>Caudal:</strong> {row.flowRate}</p>
        <p><strong>Observación:</strong> {row.observation || "Sin observaciones"}</p>
        <p><strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}</p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new water consumption record
const formSections: SectionConfig[] = [
  {
    id: "water-consumption-info",
    title: "Información del Consumo de Agua",
    description: "Ingrese los datos del nuevo registro de consumo de agua",
    fields: [
      {
        id: "zone",
        type: "text",
        label: "Zona",
        name: "zone",
        placeholder: "Zona",
        required: true,
        helperText: "Ingrese la zona donde se realizó la medición"
      },
      {
        id: "sectorOrBooth",
        type: "text",
        label: "Sector o Cabina",
        name: "sectorOrBooth",
        placeholder: "Sector o Cabina",
        required: true,
        helperText: "Ingrese el sector o cabina donde se realizó la medición"
      },
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        required: true,
        helperText: "Fecha de la medición"
      },
      {
        id: "time",
        type: "text",
        label: "Hora",
        name: "time",
        required: true,
        helperText: "Hora de la medición"
      },
      {
        id: "meterNumber",
        type: "text",
        label: "Número de Medidor",
        name: "meterNumber",
        placeholder: "Número del medidor",
        required: true,
        helperText: "Ingrese el número identificativo del medidor"
      },
      {
        id: "privateQuantity",
        type: "number",
        label: "Cantidad Privada",
        name: "privateQuantity",
        placeholder: "Cantidad privada",
        required: true,
        helperText: "Ingrese la cantidad de consumo privado"
      },
      {
        id: "publicQuantity",
        type: "number",
        label: "Cantidad Pública",
        name: "publicQuantity",
        placeholder: "Cantidad pública",
        required: true,
        helperText: "Ingrese la cantidad de consumo público"
      },
      {
        id: "totalQuantity",
        type: "number",
        label: "Cantidad Total",
        name: "totalQuantity",
        placeholder: "Cantidad total",
        required: true,
        helperText: "Ingrese la cantidad total de consumo"
      },
      {
        id: "flowRate",
        type: "number",
        label: "Caudal",
        name: "flowRate",
        placeholder: "Caudal",
        required: true,
        helperText: "Ingrese el caudal de agua"
      },
      {
        id: "observation",
        type: "textarea",
        label: "Observación",
        name: "observation",
        placeholder: "Observaciones adicionales",
        required: false,
        helperText: "Ingrese observaciones adicionales (opcional)"
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
  zone: z.string().min(1, { message: "La zona es obligatoria" }),
  sectorOrBooth: z.string().min(1, { message: "El sector o cabina es obligatorio" }),
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  time: z.string().min(1, { message: "La hora es obligatoria" }),
  meterNumber: z.string().min(1, { message: "El número de medidor es obligatorio" }),
  privateQuantity: z.number().min(0, { message: "La cantidad privada debe ser un número positivo" }),
  publicQuantity: z.number().min(0, { message: "La cantidad pública debe ser un número positivo" }),
  totalQuantity: z.number().min(0, { message: "La cantidad total debe ser un número positivo" }),
  flowRate: z.number().min(0, { message: "El caudal debe ser un número positivo" }),
  observation: z.string().optional(),
  state: z.boolean().default(true)
});

interface ApiResponse<T> {
  data: T;
}

const WaterConsumption = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [waterConsumptionData, setWaterConsumptionData] = useState<IWaterConsumption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IWaterConsumption | null>(null);
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
  
  // Fetch water consumption data on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchWaterConsumptionData();
    }
  }, [propertyId]);
  
  // Function to fetch water consumption data
  const fetchWaterConsumptionData = async () => {
    setIsLoading(true);
    try {
      const response = await waterConsumptionService.findAll(propertyId);
      // Handle the response which may come as { data: [...] } or directly as an array
      const data = Array.isArray(response) ? response : (response as unknown as ApiResponse<IWaterConsumption[]>).data;
      setWaterConsumptionData(data || []);
    } catch (error) {
      console.error("Error loading water consumption data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de consumo de agua",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new water consumption record
  const handleAddWaterConsumption = async (data: Partial<IWaterConsumption>) => {
    try {
      await waterConsumptionService.createWaterConsumption(data, propertyId);
      await fetchWaterConsumptionData();
      toast({
        title: "Éxito",
        description: "Registro de consumo de agua creado correctamente",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error adding water consumption record:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el registro de consumo de agua",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a water consumption record
  const handleUpdateWaterConsumption = async (id: string | number, data: Partial<IWaterConsumption>) => {
    try {
      await waterConsumptionService.updateWaterConsumption(id, data);
      await fetchWaterConsumptionData();
      toast({
        title: "Éxito",
        description: "Registro de consumo de agua actualizado correctamente",
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating water consumption record:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el registro de consumo de agua",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a water consumption record
  const handleDeleteWaterConsumption = async (id: string | number) => {
    try {
      await waterConsumptionService.softDeleteWaterConsumption(id);
      await fetchWaterConsumptionData();
      toast({
        title: "Éxito",
        description: "Registro de consumo de agua eliminado correctamente",
      });
    } catch (error) {
      console.error("Error deleting water consumption record:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro de consumo de agua",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IWaterConsumption>) => {
    if (isEditMode && selectedRecord) {
      handleUpdateWaterConsumption(selectedRecord._id, data);
    } else {
      handleAddWaterConsumption(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (record: IWaterConsumption) => {
    setSelectedRecord(record);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render actions for each row
  const renderActions = (row: IWaterConsumption) => (
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
          handleDeleteWaterConsumption(row._id);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Consumo de Agua</h1>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedRecord(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Consumo de Agua
        </Button>
      </div>

      <Grid
        columns={columns}
        data={waterConsumptionData}
        expandableContent={expandableContent}
        actions={renderActions}
        gridId="water-consumption-grid"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Consumo de Agua" : "Agregar Consumo de Agua"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Actualice los datos del registro de consumo de agua"
                : "Complete el formulario para registrar un nuevo consumo de agua"}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm 
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={
              isEditMode && selectedRecord
                ? {
                    zone: selectedRecord.zone,
                    sectorOrBooth: selectedRecord.sectorOrBooth,
                    date: selectedRecord.date,
                    time: selectedRecord.time,
                    meterNumber: selectedRecord.meterNumber,
                    privateQuantity: selectedRecord.privateQuantity,
                    publicQuantity: selectedRecord.publicQuantity,
                    totalQuantity: selectedRecord.totalQuantity,
                    flowRate: selectedRecord.flowRate,
                    observation: selectedRecord.observation,
                    state: selectedRecord.state
                  }
                : {
                    state: true
                  }
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaterConsumption; 