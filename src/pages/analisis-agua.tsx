import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  Beaker,
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
  FieldType,
} from "@/components/DynamicForm/DynamicForm";
import { IWaterAnalysis } from "@eon-lib/eon-mongoose";
import { z } from "zod";
import waterAnalysisService from "@/_services/waterAnalysisService";
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
    id: "date",
    header: "Fecha",
    accessor: "date",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "requestedBy",
    header: "Solicitado Por",
    accessor: "requestedBy",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "samplingCode",
    header: "Código de Muestreo",
    accessor: "samplingCode",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "samplingSite",
    header: "Lugar de Muestreo",
    accessor: "samplingSite",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "samplingHour",
    header: "Hora de Muestreo",
    accessor: "samplingHour",
    visible: true,
    sortable: true,
  },
  {
    id: "waterType",
    header: "Tipo de Agua",
    accessor: "waterType",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "weatherType",
    header: "Tipo de Clima",
    accessor: "weatherType",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "sampleBy",
    header: "Muestreado Por",
    accessor: "sampleBy",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "totalColiforms",
    header: "Coliformes Totales",
    accessor: "totalColiforms",
    visible: true,
    sortable: true,
  },
  {
    id: "escherichiaColi",
    header: "Escherichia Coli",
    accessor: "escherichiaColi",
    visible: true,
    sortable: true,
  },
  {
    id: "temperature",
    header: "Temperatura",
    accessor: "temperature",
    visible: true,
    sortable: true,
  },
  {
    id: "chlorine",
    header: "Cloro",
    accessor: "chlorine",
    visible: true,
    sortable: true,
  },
  {
    id: "turbidity",
    header: "Turbidez",
    accessor: "turbidity",
    visible: true,
    sortable: true,
  },
  {
    id: "nitrites",
    header: "Nitritos",
    accessor: "nitrites",
    visible: true,
    sortable: true,
  },
  {
    id: "chlorides",
    header: "Cloruros",
    accessor: "chlorides",
    visible: true,
    sortable: true,
  },
  {
    id: "waterHardness",
    header: "Dureza del Agua",
    accessor: "waterHardness",
    visible: true,
    sortable: true,
  },
  {
    id: "conductivity",
    header: "Conductividad",
    accessor: "conductivity",
    visible: true,
    sortable: true,
  },
  {
    id: "ph",
    header: "pH",
    accessor: "ph",
    visible: true,
    sortable: true,
  },
  {
    id: "residual",
    header: "Residual",
    accessor: "residual",
    visible: true,
    sortable: true,
  },
  {
    id: "iron",
    header: "Hierro",
    accessor: "iron",
    visible: true,
    sortable: true,
  },
  {
    id: "aluminum",
    header: "Aluminio",
    accessor: "aluminum",
    visible: true,
    sortable: true,
  },
  {
    id: "sulphates",
    header: "Sulfatos",
    accessor: "sulphates",
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
    <h3 className="text-lg font-semibold mb-2">Análisis de Agua - {row.samplingCode}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p><strong>Fecha:</strong> {row.date}</p>
        <p><strong>Solicitado Por:</strong> {row.requestedBy}</p>
        <p><strong>Código de Muestreo:</strong> {row.samplingCode}</p>
        <p><strong>Lugar de Muestreo:</strong> {row.samplingSite}</p>
        <p><strong>Hora de Muestreo:</strong> {row.samplingHour}</p>
        <p><strong>Tipo de Agua:</strong> {row.waterType}</p>
        <p><strong>Tipo de Clima:</strong> {row.weatherType}</p>
        <p><strong>Muestreado Por:</strong> {row.sampleBy}</p>
      </div>
      <div>
        <p><strong>Coliformes Totales:</strong> {row.totalColiforms}</p>
        <p><strong>Escherichia Coli:</strong> {row.escherichiaColi}</p>
        <p><strong>Temperatura:</strong> {row.temperature}</p>
        <p><strong>Cloro:</strong> {row.chlorine}</p>
        <p><strong>Turbidez:</strong> {row.turbidity}</p>
        <p><strong>Nitritos:</strong> {row.nitrites}</p>
        <p><strong>Cloruros:</strong> {row.chlorides}</p>
        <p><strong>Dureza del Agua:</strong> {row.waterHardness}</p>
      </div>
      <div>
        <p><strong>Conductividad:</strong> {row.conductivity}</p>
        <p><strong>pH:</strong> {row.ph}</p>
        <p><strong>Residual:</strong> {row.residual}</p>
        <p><strong>Hierro:</strong> {row.iron}</p>
        <p><strong>Aluminio:</strong> {row.aluminum}</p>
        <p><strong>Sulfatos:</strong> {row.sulphates}</p>
        <p><strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}</p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new water analysis - matches exactly the model structure
const formSections: SectionConfig[] = [
  {
    id: "water-analysis-info",
    title: "Información del Análisis de Agua",
    description: "Ingrese los datos del nuevo análisis de agua",
    fields: [
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        placeholder: "Fecha del análisis",
        required: true,
        helperText: "Fecha en que se realizó el análisis"
      },
      {
        id: "requestedBy",
        type: "text",
        label: "Solicitado Por",
        name: "requestedBy",
        placeholder: "Nombre del solicitante",
        required: true,
        helperText: "Persona o entidad que solicitó el análisis"
      },
      {
        id: "samplingCode",
        type: "text",
        label: "Código de Muestreo",
        name: "samplingCode",
        placeholder: "Código identificativo",
        required: true,
        helperText: "Código único que identifica la muestra"
      },
      {
        id: "samplingSite",
        type: "text",
        label: "Lugar de Muestreo",
        name: "samplingSite",
        placeholder: "Ubicación donde se tomó la muestra",
        required: true,
        helperText: "Ubicación específica donde se recolectó la muestra"
      },
      {
        id: "samplingHour",
        type: "text",
        label: "Hora de Muestreo",
        name: "samplingHour",
        placeholder: "HH:MM",
        required: true,
        helperText: "Hora en que se tomó la muestra"
      },
      {
        id: "waterType",
        type: "text",
        label: "Tipo de Agua",
        name: "waterType",
        placeholder: "Ej: Potable, Riego, etc.",
        required: true,
        helperText: "Clasificación del tipo de agua analizada"
      },
      {
        id: "weatherType",
        type: "text",
        label: "Tipo de Clima",
        name: "weatherType",
        placeholder: "Condiciones climáticas",
        required: true,
        helperText: "Condiciones climáticas durante la toma de muestra"
      },
      {
        id: "sampleBy",
        type: "text",
        label: "Muestreado Por",
        name: "sampleBy",
        placeholder: "Nombre del responsable",
        required: true,
        helperText: "Persona que tomó la muestra"
      },
    ],
  },
  {
    id: "analysis-data",
    title: "Datos Analíticos",
    description: "Resultados del análisis de laboratorio",
    fields: [
      {
        id: "totalColiforms",
        type: "number",
        label: "Coliformes Totales",
        name: "totalColiforms",
        placeholder: "Valor numérico",
        required: true,
        helperText: "Cantidad total de coliformes detectados"
      },
      {
        id: "escherichiaColi",
        type: "number",
        label: "Escherichia Coli",
        name: "escherichiaColi",
        placeholder: "Valor numérico",
        required: true,
        helperText: "Cantidad de E. coli detectada"
      },
      {
        id: "temperature",
        type: "number",
        label: "Temperatura",
        name: "temperature",
        placeholder: "°C",
        required: true,
        helperText: "Temperatura del agua en grados Celsius"
      },
      {
        id: "chlorine",
        type: "number",
        label: "Cloro",
        name: "chlorine",
        placeholder: "mg/L",
        required: true,
        helperText: "Nivel de cloro en mg/L"
      },
      {
        id: "turbidity",
        type: "number",
        label: "Turbidez",
        name: "turbidity",
        placeholder: "NTU",
        required: true,
        helperText: "Nivel de turbidez en NTU"
      },
      {
        id: "nitrites",
        type: "number",
        label: "Nitritos",
        name: "nitrites",
        placeholder: "mg/L",
        required: true,
        helperText: "Concentración de nitritos en mg/L"
      },
      {
        id: "chlorides",
        type: "number",
        label: "Cloruros",
        name: "chlorides",
        placeholder: "mg/L",
        required: true,
        helperText: "Concentración de cloruros en mg/L"
      },
      {
        id: "waterHardness",
        type: "number",
        label: "Dureza del Agua",
        name: "waterHardness",
        placeholder: "mg/L CaCO3",
        required: true,
        helperText: "Dureza del agua expresada en mg/L de CaCO3"
      },
      {
        id: "conductivity",
        type: "number",
        label: "Conductividad",
        name: "conductivity",
        placeholder: "µS/cm",
        required: true,
        helperText: "Conductividad eléctrica en µS/cm"
      },
      {
        id: "ph",
        type: "number",
        label: "pH",
        name: "ph",
        placeholder: "0-14",
        required: true,
        helperText: "Nivel de pH del agua"
      },
      {
        id: "residual",
        type: "number",
        label: "Residual",
        name: "residual",
        placeholder: "mg/L",
        required: true,
        helperText: "Nivel de residual en mg/L"
      },
      {
        id: "iron",
        type: "number",
        label: "Hierro",
        name: "iron",
        placeholder: "mg/L",
        required: true,
        helperText: "Concentración de hierro en mg/L"
      },
      {
        id: "aluminum",
        type: "number",
        label: "Aluminio",
        name: "aluminum",
        placeholder: "mg/L",
        required: true,
        helperText: "Concentración de aluminio en mg/L"
      },
      {
        id: "sulphates",
        type: "number",
        label: "Sulfatos",
        name: "sulphates",
        placeholder: "mg/L",
        required: true,
        helperText: "Concentración de sulfatos en mg/L"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el análisis está actualmente válido"
      },
    ],
  }
];

// Form validation schema - matches exactly the model requirements
const formValidationSchema = z.object({
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  requestedBy: z.string().min(1, { message: "El solicitante es obligatorio" }),
  samplingCode: z.string().min(1, { message: "El código de muestreo es obligatorio" }),
  samplingSite: z.string().min(1, { message: "El lugar de muestreo es obligatorio" }),
  samplingHour: z.string().min(1, { message: "La hora de muestreo es obligatoria" }),
  waterType: z.string().min(1, { message: "El tipo de agua es obligatorio" }),
  weatherType: z.string().min(1, { message: "El tipo de clima es obligatorio" }),
  sampleBy: z.string().min(1, { message: "El responsable del muestreo es obligatorio" }),
  totalColiforms: z.number({
    required_error: "Este campo es obligatorio",
    invalid_type_error: "Debe ser un número",
  }),
  escherichiaColi: z.number({
    required_error: "Este campo es obligatorio",
    invalid_type_error: "Debe ser un número",
  }),
  temperature: z.number({
    required_error: "Este campo es obligatorio",
    invalid_type_error: "Debe ser un número",
  }),
  chlorine: z.number({
    required_error: "Este campo es obligatorio",
    invalid_type_error: "Debe ser un número",
  }),
  turbidity: z.number({
    required_error: "Este campo es obligatorio",
    invalid_type_error: "Debe ser un número",
  }),
  nitrites: z.number({
    required_error: "Este campo es obligatorio",
    invalid_type_error: "Debe ser un número",
  }),
  chlorides: z.number({
    required_error: "Este campo es obligatorio",
    invalid_type_error: "Debe ser un número",
  }),
  waterHardness: z.number({
    required_error: "Este campo es obligatorio",
    invalid_type_error: "Debe ser un número",
  }),
  conductivity: z.number({
    required_error: "Este campo es obligatorio",
    invalid_type_error: "Debe ser un número",
  }),
  ph: z.number({
    required_error: "Este campo es obligatorio",
    invalid_type_error: "Debe ser un número",
  }),
  residual: z.number({
    required_error: "Este campo es obligatorio",
    invalid_type_error: "Debe ser un número",
  }),
  iron: z.number({
    required_error: "Este campo es obligatorio",
    invalid_type_error: "Debe ser un número",
  }),
  aluminum: z.number({
    required_error: "Este campo es obligatorio",
    invalid_type_error: "Debe ser un número",
  }),
  sulphates: z.number({
    required_error: "Este campo es obligatorio",
    invalid_type_error: "Debe ser un número",
  }),
  state: z.boolean().default(true)
});

const AnalisisAgua = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [waterAnalysisData, setWaterAnalysisData] = useState<IWaterAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWaterAnalysis, setSelectedWaterAnalysis] = useState<IWaterAnalysis | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch water analysis data on component mount
  useEffect(() => {
    fetchWaterAnalysisData();
  }, []);
  
  // Function to fetch water analysis data
  const fetchWaterAnalysisData = async () => {
    setIsLoading(true);
    try {
      const response = await waterAnalysisService.findAll();
      // Manejar diferentes posibles estructuras de respuesta
      if (Array.isArray(response)) {
        setWaterAnalysisData(response);
      } else if (response && typeof response === 'object') {
        // Usar aserción de tipo para evitar errores de TS
        const responseData = response as any;
        if ('data' in responseData && Array.isArray(responseData.data)) {
          setWaterAnalysisData(responseData.data);
        } else {
          setWaterAnalysisData([]);
        }
      } else {
        setWaterAnalysisData([]);
      }
    } catch (error) {
      console.error("Error loading water analysis data:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de análisis de agua.",
        variant: "destructive",
      });
      setWaterAnalysisData([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new water analysis
  const handleAddWaterAnalysis = async (data: Partial<IWaterAnalysis>) => {
    try {
      await waterAnalysisService.createWaterAnalysis(data);
      setIsDialogOpen(false);
      toast({
        title: "Éxito",
        description: "Análisis de agua creado correctamente.",
      });
      fetchWaterAnalysisData();
    } catch (error) {
      console.error("Error creating water analysis:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el análisis de agua.",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating an existing water analysis
  const handleUpdateWaterAnalysis = async (id: string | number, data: Partial<IWaterAnalysis>) => {
    try {
      await waterAnalysisService.updateWaterAnalysis(id, data);
      setIsDialogOpen(false);
      setSelectedWaterAnalysis(null);
      setIsEditMode(false);
      toast({
        title: "Éxito",
        description: "Análisis de agua actualizado correctamente.",
      });
      fetchWaterAnalysisData();
    } catch (error) {
      console.error(`Error updating water analysis ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el análisis de agua.",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a water analysis
  const handleDeleteWaterAnalysis = async (id: string | number) => {
    try {
      await waterAnalysisService.softDeleteWaterAnalysis(id);
      toast({
        title: "Éxito",
        description: "Análisis de agua eliminado correctamente.",
      });
      fetchWaterAnalysisData();
    } catch (error) {
      console.error(`Error deleting water analysis ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el análisis de agua.",
        variant: "destructive",
      });
    }
  };

  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IWaterAnalysis>) => {
    if (isEditMode && selectedWaterAnalysis) {
      handleUpdateWaterAnalysis(selectedWaterAnalysis._id, data);
    } else {
      handleAddWaterAnalysis(data);
    }
  };

  // Function to handle edit click
  const handleEditClick = (waterAnalysis: IWaterAnalysis) => {
    setSelectedWaterAnalysis(waterAnalysis);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: IWaterAnalysis) => {
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
          onClick={() => handleDeleteWaterAnalysis(row._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Análisis de Agua</h1>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedWaterAnalysis(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Análisis
        </Button>
      </div>

      <Grid
        columns={columns}
        data={waterAnalysisData}
        expandableContent={expandableContent}
        gridId="water-analysis-grid"
        title="Análisis de Agua"
        actions={renderActions}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Análisis de Agua" : "Agregar Nuevo Análisis de Agua"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} un análisis de agua.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedWaterAnalysis ? selectedWaterAnalysis : undefined}
          />

          <DialogFooter>
            <Button type="submit" form="dynamic-form">
              {isEditMode ? "Actualizar" : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalisisAgua; 