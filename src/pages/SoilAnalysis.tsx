import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Building2,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  FileBox,
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
import { z } from "zod";
import { ISoilAnalysis } from "@eon-lib/eon-mongoose";
import soilAnalysisService from "@/_services/soilAnalysisService";
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

// Column configuration for the grid - matched to ISoilAnalysis
const columns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: true,
    sortable: true,
  },
  {
    id: "classification",
    header: "Clasificación",
    accessor: "classification",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "barracks",
    header: "Cuartel",
    accessor: "barracks",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "reportNumber",
    header: "Número de Reporte",
    accessor: "reportNumber",
    visible: true,
    sortable: true,
  },
  {
    id: "sampleNumber",
    header: "Número de Muestra",
    accessor: "sampleNumber",
    visible: true,
    sortable: true,
  },
  {
    id: "dateReception",
    header: "Fecha de Recepción",
    accessor: "dateReception",
    visible: true,
    sortable: true,
  },
  {
    id: "dateSampling",
    header: "Fecha de Muestreo",
    accessor: "dateSampling",
    visible: true,
    sortable: true,
  },
  {
    id: "crop",
    header: "Cultivo",
    accessor: "crop",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "variety",
    header: "Variedad",
    accessor: "variety",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "depth",
    header: "Profundidad",
    accessor: "depth",
    visible: true,
    sortable: true,
  },
  {
    id: "texture",
    header: "Textura",
    accessor: "texture",
    visible: true,
    sortable: true,
  },
  {
    id: "laboratory",
    header: "Laboratorio",
    accessor: "laboratory",
    visible: true,
    sortable: true,
  },
  {
    id: "nitrogen",
    header: "Nitrógeno",
    accessor: "nitrogen",
    visible: true,
    sortable: true,
  },
  {
    id: "phosphorus",
    header: "Fósforo",
    accessor: "phosphorus",
    visible: true,
    sortable: true,
  },
  {
    id: "potassium",
    header: "Potasio",
    accessor: "potassium",
    visible: true,
    sortable: true,
  },
  {
    id: "copper",
    header: "Cobre",
    accessor: "copper",
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
    id: "manganese",
    header: "Manganeso",
    accessor: "manganese",
    visible: true,
    sortable: true,
  },
  {
    id: "zinc",
    header: "Zinc",
    accessor: "zinc",
    visible: true,
    sortable: true,
  },
  {
    id: "boron",
    header: "Boro",
    accessor: "boron",
    visible: true,
    sortable: true,
  },
  {
    id: "sulfur",
    header: "Azufre",
    accessor: "sulfur",
    visible: true,
    sortable: true,
  },
  {
    id: "magnesium",
    header: "Magnesio",
    accessor: "magnesium",
    visible: true,
    sortable: true,
  },
  {
    id: "calcium",
    header: "Calcio",
    accessor: "calcium",
    visible: true,
    sortable: true,
  },
  {
    id: "cerium",
    header: "Cerio",
    accessor: "cerium",
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
    id: "cic",
    header: "CIC",
    accessor: "cic",
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
    <h3 className="text-lg font-semibold mb-2">Análisis de suelo: {row.classification}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p><strong>Cuartel:</strong> {row.barracks}</p>
        <p><strong>Núm. Reporte:</strong> {row.reportNumber}</p>
        <p><strong>Núm. Muestra:</strong> {row.sampleNumber}</p>
        <p><strong>Fecha Recepción:</strong> {row.dateReception}</p>
        <p><strong>Fecha Muestreo:</strong> {row.dateSampling}</p>
      </div>
      <div>
        <p><strong>Cultivo:</strong> {row.crop}</p>
        <p><strong>Variedad:</strong> {row.variety}</p>
        <p><strong>Profundidad:</strong> {row.depth}</p>
        <p><strong>Textura:</strong> {row.texture}</p>
        <p><strong>Laboratorio:</strong> {row.laboratory}</p>
      </div>
      <div>
        <p><strong>Nitrógeno:</strong> {row.nitrogen}</p>
        <p><strong>Fósforo:</strong> {row.phosphorus}</p>
        <p><strong>Potasio:</strong> {row.potassium}</p>
        <p><strong>pH:</strong> {row.ph}</p>
        <p><strong>CIC:</strong> {row.cic}</p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new soil analysis
const formSections: SectionConfig[] = [
  {
    id: "soil-analysis-basic",
    title: "Información Básica",
    description: "Información básica del análisis de suelo",
    fields: [
      {
        id: "classification",
        type: "text",
        label: "Clasificación",
        name: "classification",
        placeholder: "Clasificación del análisis",
        required: true,
        helperText: "Nombre identificativo del análisis de suelo"
      },
      {
        id: "barracks",
        type: "text",
        label: "Cuartel",
        name: "barracks",
        placeholder: "Nombre del cuartel",
        required: true,
        helperText: "Cuartel donde se realizó el muestreo"
      },
      {
        id: "reportNumber",
        type: "text",
        label: "Número de Reporte",
        name: "reportNumber",
        placeholder: "Número de reporte",
        required: true,
        helperText: "Número identificativo del reporte"
      },
      {
        id: "sampleNumber",
        type: "text",
        label: "Número de Muestra",
        name: "sampleNumber",
        placeholder: "Número de muestra",
        required: true,
        helperText: "Número identificativo de la muestra"
      },
      {
        id: "dateReception",
        type: "date",
        label: "Fecha de Recepción",
        name: "dateReception",
        required: true,
        helperText: "Fecha de recepción de la muestra"
      },
      {
        id: "dateSampling",
        type: "date",
        label: "Fecha de Muestreo",
        name: "dateSampling",
        required: true,
        helperText: "Fecha de toma de la muestra"
      },
    ]
  },
  {
    id: "soil-analysis-crop",
    title: "Información del Cultivo",
    description: "Información del cultivo y características de la muestra",
    fields: [
      {
        id: "crop",
        type: "text",
        label: "Cultivo",
        name: "crop",
        placeholder: "Ej: Manzana, Pera, Uva",
        required: true,
        helperText: "Cultivo asociado a la muestra"
      },
      {
        id: "variety",
        type: "text",
        label: "Variedad",
        name: "variety",
        placeholder: "Variedad del cultivo",
        required: true,
        helperText: "Variedad específica del cultivo"
      },
      {
        id: "depth",
        type: "text",
        label: "Profundidad",
        name: "depth",
        placeholder: "Ej: 0-30 cm",
        required: true,
        helperText: "Profundidad de la muestra"
      },
      {
        id: "texture",
        type: "text",
        label: "Textura",
        name: "texture",
        placeholder: "Ej: Arcilloso, Franco, Arenoso",
        required: true,
        helperText: "Textura del suelo"
      },
      {
        id: "laboratory",
        type: "text",
        label: "Laboratorio",
        name: "laboratory",
        placeholder: "Nombre del laboratorio",
        required: true,
        helperText: "Laboratorio donde se analizó la muestra"
      },
    ]
  },
  {
    id: "soil-analysis-nutrients",
    title: "Macronutrientes",
    description: "Valores de los macronutrientes principales",
    fields: [
      {
        id: "nitrogen",
        type: "number",
        label: "Nitrógeno",
        name: "nitrogen",
        placeholder: "Valor de nitrógeno",
        required: true,
        helperText: "Valor del nitrógeno (N)"
      },
      {
        id: "phosphorus",
        type: "number",
        label: "Fósforo",
        name: "phosphorus",
        placeholder: "Valor de fósforo",
        required: true,
        helperText: "Valor del fósforo (P)"
      },
      {
        id: "potassium",
        type: "number",
        label: "Potasio",
        name: "potassium",
        placeholder: "Valor de potasio",
        required: true,
        helperText: "Valor del potasio (K)"
      },
      {
        id: "magnesium",
        type: "number",
        label: "Magnesio",
        name: "magnesium",
        placeholder: "Valor de magnesio",
        required: true,
        helperText: "Valor del magnesio (Mg)"
      },
      {
        id: "calcium",
        type: "number",
        label: "Calcio",
        name: "calcium",
        placeholder: "Valor de calcio",
        required: true,
        helperText: "Valor del calcio (Ca)"
      },
      {
        id: "sulfur",
        type: "number",
        label: "Azufre",
        name: "sulfur",
        placeholder: "Valor de azufre",
        required: true,
        helperText: "Valor del azufre (S)"
      },
    ]
  },
  {
    id: "soil-analysis-micronutrients",
    title: "Micronutrientes",
    description: "Valores de los micronutrientes",
    fields: [
      {
        id: "copper",
        type: "number",
        label: "Cobre",
        name: "copper",
        placeholder: "Valor de cobre",
        required: true,
        helperText: "Valor del cobre (Cu)"
      },
      {
        id: "iron",
        type: "number",
        label: "Hierro",
        name: "iron",
        placeholder: "Valor de hierro",
        required: true,
        helperText: "Valor del hierro (Fe)"
      },
      {
        id: "manganese",
        type: "number",
        label: "Manganeso",
        name: "manganese",
        placeholder: "Valor de manganeso",
        required: true,
        helperText: "Valor del manganeso (Mn)"
      },
      {
        id: "zinc",
        type: "number",
        label: "Zinc",
        name: "zinc",
        placeholder: "Valor de zinc",
        required: true,
        helperText: "Valor del zinc (Zn)"
      },
      {
        id: "boron",
        type: "number",
        label: "Boro",
        name: "boron",
        placeholder: "Valor de boro",
        required: true,
        helperText: "Valor del boro (B)"
      },
      {
        id: "cerium",
        type: "number",
        label: "Cerio",
        name: "cerium",
        placeholder: "Valor de cerio",
        required: true,
        helperText: "Valor del cerio (Ce)"
      },
    ]
  },
  {
    id: "soil-analysis-properties",
    title: "Propiedades del Suelo",
    description: "Otras propiedades importantes del suelo",
    fields: [
      {
        id: "ph",
        type: "number",
        label: "pH",
        name: "ph",
        placeholder: "Valor de pH",
        required: true,
        helperText: "Nivel de pH del suelo"
      },
      {
        id: "cic",
        type: "number",
        label: "CIC",
        name: "cic",
        placeholder: "Valor de CIC",
        required: true,
        helperText: "Capacidad de Intercambio Catiónico"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el análisis está activo"
      },
    ]
  }
];

// Form validation schema
const formValidationSchema = z.object({
  classification: z.string().min(1, { message: "La clasificación es obligatoria" }),
  barracks: z.string().min(1, { message: "El cuartel es obligatorio" }),
  reportNumber: z.string().min(1, { message: "El número de reporte es obligatorio" }),
  sampleNumber: z.string().min(1, { message: "El número de muestra es obligatorio" }),
  dateReception: z.string().min(1, { message: "La fecha de recepción es obligatoria" }),
  dateSampling: z.string().min(1, { message: "La fecha de muestreo es obligatoria" }),
  crop: z.string().min(1, { message: "El cultivo es obligatorio" }),
  variety: z.string().min(1, { message: "La variedad es obligatoria" }),
  depth: z.string().min(1, { message: "La profundidad es obligatoria" }),
  texture: z.string().min(1, { message: "La textura es obligatoria" }),
  laboratory: z.string().min(1, { message: "El laboratorio es obligatorio" }),
  nitrogen: z.coerce.number().min(0, { message: "El valor debe ser positivo" }),
  phosphorus: z.coerce.number().min(0, { message: "El valor debe ser positivo" }),
  potassium: z.coerce.number().min(0, { message: "El valor debe ser positivo" }),
  copper: z.coerce.number().min(0, { message: "El valor debe ser positivo" }),
  iron: z.coerce.number().min(0, { message: "El valor debe ser positivo" }),
  manganese: z.coerce.number().min(0, { message: "El valor debe ser positivo" }),
  zinc: z.coerce.number().min(0, { message: "El valor debe ser positivo" }),
  boron: z.coerce.number().min(0, { message: "El valor debe ser positivo" }),
  sulfur: z.coerce.number().min(0, { message: "El valor debe ser positivo" }),
  magnesium: z.coerce.number().min(0, { message: "El valor debe ser positivo" }),
  calcium: z.coerce.number().min(0, { message: "El valor debe ser positivo" }),
  cerium: z.coerce.number().min(0, { message: "El valor debe ser positivo" }),
  ph: z.coerce.number().min(0, { message: "El valor debe ser positivo" }),
  cic: z.coerce.number().min(0, { message: "El valor debe ser positivo" }),
  state: z.boolean().default(false)
});

const SoilAnalysis = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [soilAnalyses, setSoilAnalyses] = useState<ISoilAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSoilAnalysis, setSelectedSoilAnalysis] = useState<ISoilAnalysis | null>(null);
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
  
  // Fetch soil analyses on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchSoilAnalyses();
    }
  }, [propertyId]);
  
  // Function to fetch soil analyses data
  const fetchSoilAnalyses = async () => {
    setIsLoading(true);
    try {
      const data = await soilAnalysisService.findAll(propertyId);
      // @ts-ignore
      setSoilAnalyses(data.data);
    } catch (error) {
      console.error("Error loading soil analyses:", error);
      // Use mock data in case of API failure
      // setSoilAnalyses([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new soil analysis
  const handleAddSoilAnalysis = async (data: Partial<ISoilAnalysis>) => {
    try {
      await soilAnalysisService.createSoilAnalysis(data, propertyId);
      toast({
        title: "Análisis de suelo creado",
        description: "El análisis de suelo se ha creado correctamente",
      });
      fetchSoilAnalyses();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating soil analysis:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el análisis de suelo",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a soil analysis
  const handleUpdateSoilAnalysis = async (id: string | number, data: Partial<ISoilAnalysis>) => {
    try {
      await soilAnalysisService.updateSoilAnalysis(id, data);
      toast({
        title: "Análisis de suelo actualizado",
        description: "El análisis de suelo se ha actualizado correctamente",
      });
      fetchSoilAnalyses();
      setIsDialogOpen(false);
      setSelectedSoilAnalysis(null);
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error updating soil analysis ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el análisis de suelo",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a soil analysis
  const handleDeleteSoilAnalysis = async (id: string | number) => {
    try {
      await soilAnalysisService.softDeleteSoilAnalysis(id);
      toast({
        title: "Análisis de suelo eliminado",
        description: "El análisis de suelo se ha eliminado correctamente",
      });
      fetchSoilAnalyses();
    } catch (error) {
      console.error(`Error deleting soil analysis ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el análisis de suelo",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<ISoilAnalysis>) => {
    if (isEditMode && selectedSoilAnalysis) {
      handleUpdateSoilAnalysis(selectedSoilAnalysis._id, data);
    } else {
      handleAddSoilAnalysis(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (soilAnalysis: ISoilAnalysis) => {
    setSelectedSoilAnalysis(soilAnalysis);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render function for action buttons
  const renderActions = (row: ISoilAnalysis) => {
    return (
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            handleEditClick(row);
          }}
          title="Editar"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={(e) => {
            e.stopPropagation();
            if (row._id) {
              handleDeleteSoilAnalysis(row._id);
            }
          }}
          title="Eliminar"
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Análisis de Suelo</h1>
          <p className="text-muted-foreground">
            Gestione los análisis de suelo de sus cultivos
          </p>
        </div>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedSoilAnalysis(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Análisis
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Cargando análisis de suelo...</p>
        </div>
      ) : (
        <Grid
          data={soilAnalyses}
          columns={columns}
          title="Análisis de Suelo"
          gridId="soilAnalysis"
          actions={renderActions}
        />
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Análisis de Suelo" : "Nuevo Análisis de Suelo"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique los datos del análisis de suelo seleccionado"
                : "Complete el formulario para agregar un nuevo análisis de suelo"}
            </DialogDescription>
          </DialogHeader>
          
          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={
              isEditMode && selectedSoilAnalysis 
                ? {
                    classification: selectedSoilAnalysis.classification,
                    barracks: selectedSoilAnalysis.barracks,
                    reportNumber: selectedSoilAnalysis.reportNumber,
                    sampleNumber: selectedSoilAnalysis.sampleNumber,
                    dateReception: selectedSoilAnalysis.dateReception,
                    dateSampling: selectedSoilAnalysis.dateSampling,
                    crop: selectedSoilAnalysis.crop,
                    variety: selectedSoilAnalysis.variety,
                    depth: selectedSoilAnalysis.depth,
                    texture: selectedSoilAnalysis.texture,
                    laboratory: selectedSoilAnalysis.laboratory,
                    nitrogen: selectedSoilAnalysis.nitrogen,
                    phosphorus: selectedSoilAnalysis.phosphorus,
                    potassium: selectedSoilAnalysis.potassium,
                    copper: selectedSoilAnalysis.copper,
                    iron: selectedSoilAnalysis.iron,
                    manganese: selectedSoilAnalysis.manganese,
                    zinc: selectedSoilAnalysis.zinc,
                    boron: selectedSoilAnalysis.boron,
                    sulfur: selectedSoilAnalysis.sulfur,
                    magnesium: selectedSoilAnalysis.magnesium,
                    calcium: selectedSoilAnalysis.calcium,
                    cerium: selectedSoilAnalysis.cerium,
                    ph: selectedSoilAnalysis.ph,
                    cic: selectedSoilAnalysis.cic,
                    state: selectedSoilAnalysis.state,
                  }
                : { state: false }
            }
          />
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SoilAnalysis; 