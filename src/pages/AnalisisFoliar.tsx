import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
import {
  Leaf,
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
import { ILeafAnalysisRecord } from "@eon-lib/eon-mongoose/types";
import leafAnalysisService from "@/_services/leafAnalysisService";
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

// Column configuration for the grid - based on ILeafAnalysisRecord structure
const columns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: true,
    sortable: true,
  },
  {
    id: "filterByClassification",
    header: "Clasificación",
    accessor: "filterByClassification",
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
    id: "samplingDate",
    header: "Fecha de Muestreo",
    accessor: "samplingDate",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "specie",
    header: "Especie",
    accessor: "specie",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "plantingYear",
    header: "Año de Plantación",
    accessor: "plantingYear",
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
    id: "totalNumber",
    header: "Número Total",
    accessor: "totalNumber",
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
    id: "calcium",
    header: "Calcio",
    accessor: "calcium",
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
    id: "cooper",
    header: "Cobre",
    accessor: "cooper",
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
    id: "manganese",
    header: "Manganeso",
    accessor: "manganese",
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
    id: "boro",
    header: "Boro",
    accessor: "boro",
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

// Form configuration for adding/editing leaf analysis
const formSections: SectionConfig[] = [
  {
    id: "leaf-analysis-basic-info",
    title: "Información Básica",
    description: "Ingrese los datos básicos del análisis foliar",
    fields: [
      {
        id: "filterByClassification",
        type: "text",
        label: "Clasificación",
        name: "filterByClassification",
        placeholder: "Clasificación del análisis",
        required: true,
        helperText: "Ingrese la clasificación del análisis foliar"
      },
      {
        id: "barracks",
        type: "text",
        label: "Cuartel",
        name: "barracks",
        placeholder: "Nombre del cuartel",
        required: true,
        helperText: "Ingrese el nombre del cuartel"
      },
      {
        id: "samplingDate",
        type: "text",
        label: "Fecha de Muestreo",
        name: "samplingDate",
        placeholder: "YYYY-MM-DD",
        required: true,
        helperText: "Fecha en que se realizó el muestreo"
      },
      {
        id: "specie",
        type: "text",
        label: "Especie",
        name: "specie",
        placeholder: "Ej: Manzana, Pera, Uva",
        required: true,
        helperText: "Especie del cultivo analizado"
      },
      {
        id: "plantingYear",
        type: "text",
        label: "Año de Plantación",
        name: "plantingYear",
        placeholder: "Ej: 2020",
        required: true,
        helperText: "Año en que se realizó la plantación"
      },
      {
        id: "laboratory",
        type: "text",
        label: "Laboratorio",
        name: "laboratory",
        placeholder: "Nombre del laboratorio",
        required: true,
        helperText: "Laboratorio que realizó el análisis"
      },
      {
        id: "totalNumber",
        type: "number",
        label: "Número Total",
        name: "totalNumber",
        placeholder: "0",
        required: true,
        helperText: "Número total de muestras"
      },
    ],
  },
  {
    id: "leaf-analysis-nutrients",
    title: "Información de Nutrientes",
    description: "Ingrese los datos de nutrientes del análisis foliar",
    fields: [
      {
        id: "nitrogen",
        type: "number",
        label: "Nitrógeno",
        name: "nitrogen",
        placeholder: "0",
        required: true,
        helperText: "Valor de nitrógeno detectado"
      },
      {
        id: "phosphorus",
        type: "number",
        label: "Fósforo",
        name: "phosphorus",
        placeholder: "0",
        required: true,
        helperText: "Valor de fósforo detectado"
      },
      {
        id: "potassium",
        type: "number",
        label: "Potasio",
        name: "potassium",
        placeholder: "0",
        required: true,
        helperText: "Valor de potasio detectado"
      },
      {
        id: "calcium",
        type: "number",
        label: "Calcio",
        name: "calcium",
        placeholder: "0",
        required: true,
        helperText: "Valor de calcio detectado"
      },
      {
        id: "magnesium",
        type: "number",
        label: "Magnesio",
        name: "magnesium",
        placeholder: "0",
        required: true,
        helperText: "Valor de magnesio detectado"
      },
      {
        id: "cooper",
        type: "number",
        label: "Cobre",
        name: "cooper",
        placeholder: "0",
        required: true,
        helperText: "Valor de cobre detectado"
      },
      {
        id: "zinc",
        type: "number",
        label: "Zinc",
        name: "zinc",
        placeholder: "0",
        required: true,
        helperText: "Valor de zinc detectado"
      },
      {
        id: "manganese",
        type: "number",
        label: "Manganeso",
        name: "manganese",
        placeholder: "0",
        required: true,
        helperText: "Valor de manganeso detectado"
      },
      {
        id: "iron",
        type: "number",
        label: "Hierro",
        name: "iron",
        placeholder: "0",
        required: true,
        helperText: "Valor de hierro detectado"
      },
      {
        id: "boro",
        type: "number",
        label: "Boro",
        name: "boro",
        placeholder: "0",
        required: true,
        helperText: "Valor de boro detectado"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el análisis está actualmente vigente"
      },
    ],
  }
];

// Form validation schema based on ILeafAnalysisRecord
const formValidationSchema = z.object({
  filterByClassification: z.string().min(1, { message: "La clasificación es obligatoria" }),
  barracks: z.string().min(1, { message: "El cuartel es obligatorio" }),
  samplingDate: z.string().min(1, { message: "La fecha de muestreo es obligatoria" }),
  specie: z.string().min(1, { message: "La especie es obligatoria" }),
  plantingYear: z.string().min(1, { message: "El año de plantación es obligatorio" }),
  laboratory: z.string().min(1, { message: "El laboratorio es obligatorio" }),
  totalNumber: z.coerce.number().min(0, { message: "El número total debe ser mayor o igual a 0" }),
  nitrogen: z.coerce.number().min(0, { message: "El valor de nitrógeno debe ser mayor o igual a 0" }),
  phosphorus: z.coerce.number().min(0, { message: "El valor de fósforo debe ser mayor o igual a 0" }),
  potassium: z.coerce.number().min(0, { message: "El valor de potasio debe ser mayor o igual a 0" }),
  calcium: z.coerce.number().min(0, { message: "El valor de calcio debe ser mayor o igual a 0" }),
  magnesium: z.coerce.number().min(0, { message: "El valor de magnesio debe ser mayor o igual a 0" }),
  cooper: z.coerce.number().min(0, { message: "El valor de cobre debe ser mayor o igual a 0" }),
  zinc: z.coerce.number().min(0, { message: "El valor de zinc debe ser mayor o igual a 0" }),
  manganese: z.coerce.number().min(0, { message: "El valor de manganeso debe ser mayor o igual a 0" }),
  iron: z.coerce.number().min(0, { message: "El valor de hierro debe ser mayor o igual a 0" }),
  boro: z.coerce.number().min(0, { message: "El valor de boro debe ser mayor o igual a 0" }),
  state: z.boolean().default(true)
});

const AnalisisFoliar = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leafAnalysisRecords, setLeafAnalysisRecords] = useState<ILeafAnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLeafAnalysis, setSelectedLeafAnalysis] = useState<ILeafAnalysisRecord | null>(null);
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
  
  // Fetch leaf analysis records on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchLeafAnalysisRecords();
    }
  }, [propertyId]);
  
  // Function to fetch leaf analysis data
  const fetchLeafAnalysisRecords = async () => {
    setIsLoading(true);
    try {
      const response = await leafAnalysisService.findAll();
      // Handle both direct array response and wrapped object with data property
      const records = Array.isArray(response) 
        ? response 
        : (response as any).data || [];
      setLeafAnalysisRecords(records);
    } catch (error) {
      console.error("Error loading leaf analysis records:", error);
      // In case of error, use empty array
      setLeafAnalysisRecords([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new leaf analysis
  const handleAddLeafAnalysis = async (data: Partial<ILeafAnalysisRecord>) => {
    try {
      const newLeafAnalysis = await leafAnalysisService.createLeafAnalysis(data);
      setLeafAnalysisRecords((prevRecords) => [...prevRecords, newLeafAnalysis]);
      setIsDialogOpen(false);
      toast({
        title: "Análisis foliar creado",
        description: `El análisis foliar ha sido creado exitosamente.`,
      });
    } catch (error) {
      console.error("Error creating leaf analysis:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el análisis foliar. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating an existing leaf analysis
  const handleUpdateLeafAnalysis = async (id: string | number, data: Partial<ILeafAnalysisRecord>) => {
    try {
      await leafAnalysisService.updateLeafAnalysis(id, data);
      await fetchLeafAnalysisRecords();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedLeafAnalysis(null);
      toast({
        title: "Análisis foliar actualizado",
        description: `El análisis foliar ha sido actualizado exitosamente.`,
      });
    } catch (error) {
      console.error("Error updating leaf analysis:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el análisis foliar. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a leaf analysis
  const handleDeleteLeafAnalysis = async (id: string | number) => {
    try {
      await leafAnalysisService.softDeleteLeafAnalysis(id);
      setLeafAnalysisRecords((prevRecords) => prevRecords.filter((record) => record._id !== id));
      toast({
        title: "Análisis foliar eliminado",
        description: "El análisis foliar ha sido eliminado exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting leaf analysis:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el análisis foliar. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission based on mode (create or edit)
  const handleFormSubmit = (data: Partial<ILeafAnalysisRecord>) => {
    if (isEditMode && selectedLeafAnalysis && selectedLeafAnalysis._id) {
      handleUpdateLeafAnalysis(selectedLeafAnalysis._id, data);
    } else {
      handleAddLeafAnalysis(data);
    }
  };

  // Function to handle edit button click
  const handleEditClick = (leafAnalysis: ILeafAnalysisRecord) => {
    setSelectedLeafAnalysis(leafAnalysis);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: ILeafAnalysisRecord) => {
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
              handleDeleteLeafAnalysis(row._id);
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
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Análisis Foliar</h1>
        <Button onClick={() => {
          setSelectedLeafAnalysis(null);
          setIsEditMode(false);
          setIsDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Análisis Foliar
        </Button>
      </div>

      {/* Grid using Zustand store with actual leaf analysis data or loading state */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Cargando análisis foliar...</p>
        </div>
      ) : (
        <Grid
          data={leafAnalysisRecords}
          columns={columns}
          title="Análisis Foliar"
          gridId="leaf-analysis"
          actions={renderActions}
        />
      )}

      {/* Dialog for adding or editing a leaf analysis */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Análisis Foliar" : "Añadir Nuevo Análisis Foliar"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Modifique el formulario para actualizar el análisis foliar." 
                : "Complete el formulario para añadir un nuevo análisis foliar al sistema."
              }
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            validationSchema={formValidationSchema}
            defaultValues={
              isEditMode && selectedLeafAnalysis 
                ? {
                    filterByClassification: selectedLeafAnalysis.filterByClassification,
                    barracks: selectedLeafAnalysis.barracks,
                    samplingDate: selectedLeafAnalysis.samplingDate,
                    specie: selectedLeafAnalysis.specie,
                    plantingYear: selectedLeafAnalysis.plantingYear,
                    laboratory: selectedLeafAnalysis.laboratory,
                    totalNumber: selectedLeafAnalysis.totalNumber,
                    nitrogen: selectedLeafAnalysis.nitrogen,
                    phosphorus: selectedLeafAnalysis.phosphorus,
                    potassium: selectedLeafAnalysis.potassium,
                    calcium: selectedLeafAnalysis.calcium,
                    magnesium: selectedLeafAnalysis.magnesium,
                    cooper: selectedLeafAnalysis.cooper,
                    zinc: selectedLeafAnalysis.zinc,
                    manganese: selectedLeafAnalysis.manganese,
                    iron: selectedLeafAnalysis.iron,
                    boro: selectedLeafAnalysis.boro,
                    state: selectedLeafAnalysis.state,
                  }
                : { state: true }
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalisisFoliar; 