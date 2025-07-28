import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Calculator,
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
import { IBackPumpCalculation } from "@eon-lib/eon-mongoose";
import { z } from "zod";
import backPumpCalculationService from "@/_services/backPumpCalculationService";
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

// Format date function
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
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
    render: (value: string) => formatDate(value),
  },
  {
    id: "pumpNumber",
    header: "Número de Bomba",
    accessor: "pumpNumber",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "diameterByMeters",
    header: "Diámetro por Metros",
    accessor: "diameterByMeters",
    visible: true,
    sortable: true,
  },
  {
    id: "meters",
    header: "Metros",
    accessor: "meters",
    visible: true,
    sortable: true,
  },
  {
    id: "walkMeters",
    header: "Metros Recorridos",
    accessor: "walkMeters",
    visible: true,
    sortable: true,
  },
  {
    id: "liters1",
    header: "Litros 1",
    accessor: "liters1",
    visible: true,
    sortable: true,
  },
  {
    id: "liters2",
    header: "Litros 2",
    accessor: "liters2",
    visible: true,
    sortable: true,
  },
  {
    id: "liters3",
    header: "Litros 3",
    accessor: "liters3",
    visible: true,
    sortable: true,
  },
  {
    id: "litersByHa",
    header: "Litros por Hectárea",
    accessor: "litersByHa",
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
    <h3 className="text-lg font-semibold mb-2">Cálculo Bomba de Espalda #{row.pumpNumber}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Fecha:</strong> {formatDate(row.date)}
        </p>
        <p>
          <strong>Número de Bomba:</strong> {row.pumpNumber}
        </p>
        <p>
          <strong>Diámetro por Metros:</strong> {row.diameterByMeters}
        </p>
        <p>
          <strong>Metros:</strong> {row.meters}
        </p>
        <p>
          <strong>Metros Recorridos:</strong> {row.walkMeters}
        </p>
      </div>
      <div>
        <p>
          <strong>Litros 1:</strong> {row.liters1}
        </p>
        <p>
          <strong>Litros 2:</strong> {row.liters2}
        </p>
        <p>
          <strong>Litros 3:</strong> {row.liters3}
        </p>
        <p>
          <strong>Litros por Hectárea:</strong> {row.litersByHa}
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

// Form configuration for adding/editing back pump calculation
const formSections: SectionConfig[] = [
  {
    id: "back-pump-info",
    title: "Información del Cálculo Bomba de Espalda",
    description: "Ingrese los datos del cálculo",
    fields: [
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        required: true,
        helperText: "Fecha del cálculo"
      },
      {
        id: "pumpNumber",
        type: "text",
        label: "Número de Bomba",
        name: "pumpNumber",
        placeholder: "Ej: BP001",
        required: true,
        helperText: "Identificador de la bomba utilizada"
      },
      {
        id: "diameterByMeters",
        type: "number",
        label: "Diámetro por Metros",
        name: "diameterByMeters",
        placeholder: "Ej: 2.5",
        required: true,
        helperText: "Diámetro por metros"
      },
      {
        id: "meters",
        type: "number",
        label: "Metros",
        name: "meters",
        placeholder: "Ej: 100",
        required: true,
        helperText: "Metros"
      },
      {
        id: "walkMeters",
        type: "number",
        label: "Metros Recorridos",
        name: "walkMeters",
        placeholder: "Ej: 50",
        required: true,
        helperText: "Metros recorridos"
      },
      {
        id: "liters1",
        type: "number",
        label: "Litros 1",
        name: "liters1",
        placeholder: "Ej: 20",
        required: true,
        helperText: "Medición de litros 1"
      },
      {
        id: "liters2",
        type: "number",
        label: "Litros 2",
        name: "liters2",
        placeholder: "Ej: 20",
        required: true,
        helperText: "Medición de litros 2"
      },
      {
        id: "liters3",
        type: "number",
        label: "Litros 3",
        name: "liters3",
        placeholder: "Ej: 20",
        required: true,
        helperText: "Medición de litros 3"
      },
      {
        id: "litersByHa",
        type: "number",
        label: "Litros por Hectárea",
        name: "litersByHa",
        placeholder: "Ej: 100",
        required: true,
        helperText: "Cálculo de litros por hectárea"
      },
      {
        id: "user",
        type: "text",
        label: "Usuario",
        name: "user",
        placeholder: "Ej: Juan Pérez",
        required: true,
        helperText: "Persona que realiza el cálculo"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el registro está activo"
      },
    ],
  }
];

// Form validation schema
const formValidationSchema = z.object({
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  pumpNumber: z.string().min(1, { message: "El número de bomba es obligatorio" }),
  diameterByMeters: z.number().min(0, { message: "El diámetro debe ser un número positivo" }),
  meters: z.number().min(0, { message: "El valor de metros debe ser un número positivo" }),
  walkMeters: z.number().min(0, { message: "El valor de metros recorridos debe ser un número positivo" }),
  liters1: z.number().min(0, { message: "El valor de litros 1 debe ser un número positivo" }),
  liters2: z.number().min(0, { message: "El valor de litros 2 debe ser un número positivo" }),
  liters3: z.number().min(0, { message: "El valor de litros 3 debe ser un número positivo" }),
  litersByHa: z.number().min(0, { message: "El valor de litros por hectárea debe ser un número positivo" }),
  user: z.string().min(1, { message: "El usuario es obligatorio" }),
  state: z.boolean().default(true)
});

const BackPumpCalculation = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [backPumpCalculations, setBackPumpCalculations] = useState<IBackPumpCalculation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBackPumpCalculation, setSelectedBackPumpCalculation] = useState<IBackPumpCalculation | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch back pump calculations on component mount
  useEffect(() => {
    fetchBackPumpCalculations();
  }, []);
  
  // Function to fetch back pump calculations data
  const fetchBackPumpCalculations = async () => {
    setIsLoading(true);
    try {
      const response = await backPumpCalculationService.findAll();
      // Manejar tanto la respuesta como array directo o como objeto con propiedad data
      let calculationsData: IBackPumpCalculation[] = [];
      
      if (response && typeof response === 'object' && 'data' in response) {
        calculationsData = response.data as IBackPumpCalculation[];
      } else if (Array.isArray(response)) {
        calculationsData = response as IBackPumpCalculation[];
      }
      
      setBackPumpCalculations(calculationsData);
    } catch (error) {
      console.error("Error loading back pump calculations:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de cálculos de bomba de espalda",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new back pump calculation
  const handleAddBackPumpCalculation = async (data: Partial<IBackPumpCalculation>) => {
    try {
      await backPumpCalculationService.createBackPumpCalculation(data);
      toast({
        title: "Éxito",
        description: "Cálculo de bomba de espalda agregado correctamente",
      });
      fetchBackPumpCalculations();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating back pump calculation:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el cálculo de bomba de espalda",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a back pump calculation
  const handleUpdateBackPumpCalculation = async (id: string | number, data: Partial<IBackPumpCalculation>) => {
    try {
      await backPumpCalculationService.updateBackPumpCalculation(id, data);
      toast({
        title: "Éxito",
        description: "Cálculo de bomba de espalda actualizado correctamente",
      });
      fetchBackPumpCalculations();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedBackPumpCalculation(null);
    } catch (error) {
      console.error(`Error updating back pump calculation ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el cálculo de bomba de espalda",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a back pump calculation
  const handleDeleteBackPumpCalculation = async (id: string | number) => {
    if (window.confirm("¿Está seguro que desea eliminar este cálculo de bomba de espalda?")) {
      try {
        await backPumpCalculationService.softDeleteBackPumpCalculation(id);
        toast({
          title: "Éxito",
          description: "Cálculo de bomba de espalda eliminado correctamente",
        });
        fetchBackPumpCalculations();
      } catch (error) {
        console.error(`Error deleting back pump calculation ${id}:`, error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el cálculo de bomba de espalda",
          variant: "destructive",
        });
      }
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IBackPumpCalculation>) => {
    if (isEditMode && selectedBackPumpCalculation) {
      handleUpdateBackPumpCalculation(selectedBackPumpCalculation._id, data);
    } else {
      handleAddBackPumpCalculation(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (backPumpCalculation: IBackPumpCalculation) => {
    setSelectedBackPumpCalculation(backPumpCalculation);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render actions column content
  const renderActions = (row: IBackPumpCalculation) => {
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
          onClick={() => handleDeleteBackPumpCalculation(row._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Add actions column to columns array
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
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cálculo Bomba de Espalda</h1>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedBackPumpCalculation(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </div>

      <Grid
        data={backPumpCalculations}
        columns={columnsWithActions}
        expandableContent={expandableContent}
        gridId="backPumpCalculation"
        title="Cálculos de Bomba de Espalda"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar" : "Agregar"} Cálculo Bomba de Espalda
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "crear"} un cálculo de bomba de espalda
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={selectedBackPumpCalculation || {}}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setIsEditMode(false);
                setSelectedBackPumpCalculation(null);
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

export default BackPumpCalculation; 