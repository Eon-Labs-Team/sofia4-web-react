import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DynamicForm, { SectionConfig } from "@/components/DynamicForm/DynamicForm";
import { z } from "zod";
import { Sprout, Building2, ArrowLeft } from "lucide-react";
import cropTypeService from "@/_services/cropTypeService";
import varietyTypeService from "@/_services/varietyTypeService";
import { createBarracksRules } from "@/lib/fieldRules/barracksRules";
import type { ICropType, IVarietyType } from '@eon-lib/eon-mongoose';

interface BarracksWizardProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  isEditMode?: boolean;
}

// Esquema de validación para cuarteles no productivos (campos básicos)
const nonProductiveValidationSchema = z.object({
  isProductive: z.boolean().default(false),
  classificationZone: z.string().optional(), // No es requerido según modelo
  areaName: z.string().min(1, { message: "El nombre del cuartel/potrero es obligatorio" }),
  codeOptional: z.string().optional(), // No es requerido según modelo
  availableRecord: z.string().transform(val => parseInt(val)).refine(val => val === 0 || val === 1, { 
    message: "El registro disponible debe ser 0 (sofia y appsofia) o 1 (appsofia)" 
  }),
  active: z.boolean().default(true),
  observation: z.string().default(""), // Puede estar vacío para no productivos
  state: z.boolean().default(true)
});

// Esquema de validación completo para cuarteles productivos
const productiveValidationSchema = z.object({
  isProductive: z.boolean().default(true),
  classificationZone: z.string().optional(), // No es requerido según modelo
  areaName: z.string().min(1, { message: "El nombre del cuartel/potrero es obligatorio" }),
  codeOptional: z.string().optional(), // No es requerido según modelo
  organic: z.boolean().default(false),
  varietySpecies: z.string().min(1, { message: "La especie de variedad es obligatoria" }),
  variety: z.string().min(1, { message: "La variedad es obligatoria" }),
  qualityType: z.string().optional(),
  totalHa: z.number().positive({ message: "El total de hectáreas debe ser positivo" }),
  totalPlants: z.number().positive({ message: "El total de plantas debe ser positivo" }),
  percentToRepresent: z.number().min(0).max(100, { message: "El porcentaje debe estar entre 0 y 100" }).optional(),
  availableRecord: z.string().transform(val => parseInt(val)).refine(val => val === 0 || val === 1, { 
    message: "El registro disponible debe ser 0 (sofia y appsofia) o 1 (appsofia)" 
  }),
  active: z.boolean().default(true),
  useProration: z.boolean().default(true),

  firstHarvestDate: z.string().optional(),
  firstHarvestDay: z.number().positive({ message: "El día de primera cosecha debe ser positivo" }).optional(),
  secondHarvestDate: z.string().optional(),
  secondHarvestDay: z.number().positive({ message: "El día de segunda cosecha debe ser positivo" }).optional(),
  thirdHarvestDate: z.string().optional(),
  thirdHarvestDay: z.number().positive({ message: "El día de tercera cosecha debe ser positivo" }).optional(),

  soilType: z.string().optional(),
  texture: z.string().optional(),
  depth: z.string().optional(),
  soilPh: z.number().positive({ message: "El pH del suelo debe ser positivo" }).optional(),
  percentPending: z.number().min(0).max(100, { message: "El porcentaje pendiente debe estar entre 0 y 100" }).optional(),

  pattern: z.string().optional(),
  plantationYear: z.number().positive({ message: "El año de plantación debe ser positivo" }).optional(),
  plantNumber: z.number().positive({ message: "El número de planta debe ser positivo" }).optional(),
  rowsList: z.string().optional(),
  plantForRow: z.number().positive({ message: "La planta por fila debe ser positiva" }).optional(),
  distanceBetweenRowsMts: z.number().positive({ message: "La distancia entre filas debe ser positiva" }).optional(),
  rowsTotal: z.number().positive({ message: "El total de filas debe ser positivo" }).optional(),
  area: z.number().positive({ message: "El área debe ser positiva" }).optional(),

  irrigationType: z.string().optional(),
  ltsByHa: z.number().positive({ message: "Litros por hectárea debe ser positivo" }).optional(),
  irrigationZone: z.boolean().default(false),

  barracksLotObject: z.string().optional(),
  investmentNumber: z.string().optional(),
  observation: z.string().optional(),
  mapSectorColor: z.string().optional(),
  state: z.boolean().default(true)
});

// Configuración del formulario para cuarteles no productivos
const nonProductiveFormSections: SectionConfig[] = [
  {
    id: "basic-info",
    title: "Información Básica del Cuartel",
    description: "Ingrese los datos básicos del cuartel no productivo",
    fields: [
      {
        id: "classificationZone",
        type: "text",
        label: "Zona de Clasificación",
        name: "classificationZone",
        placeholder: "Ingrese la zona de clasificación (opcional)",
        required: false,
        helperText: "Zona donde se encuentra clasificado el cuartel"
      },
      {
        id: "areaName",
        type: "text",
        label: "Nombre Cuartel/Potrero",
        name: "areaName",
        placeholder: "Nombre del cuartel o potrero",
        required: true,
        helperText: "Nombre identificativo del cuartel o potrero"
      },
      {
        id: "codeOptional",
        type: "text",
        label: "Código",
        name: "codeOptional",
        placeholder: "Ingrese el código (opcional)",
        required: false,
        helperText: "Código identificativo"
      },
      {
        id: "availableRecord",
        type: "select",
        label: "Registro Disponible",
        name: "availableRecord",
        placeholder: "Seleccione...",
        required: true,
        helperText: "0: Sofia y AppSofia, 1: Solo AppSofia",
        options: [
          { value: "0", label: "Sofia y AppSofia" },
          { value: "1", label: "Solo AppSofia" }
        ]
      },
      {
        id: "active",
        type: "checkbox",
        label: "Activo",
        name: "active",
        required: true,
        helperText: "Indica si el cuartel está activo"
      },
      {
        id: "observation",
        type: "textarea",
        label: "Observación",
        name: "observation",
        placeholder: "Ingrese observaciones (opcional)",
        required: false,
        helperText: "Observaciones adicionales sobre el cuartel"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Estado Activo",
        name: "state",
        required: true,
        helperText: "Indica si el cuartel está activo"
      }
    ]
  }
];

// Función para crear configuración del formulario con datos dinámicos
const createProductiveFormSections = (
  cropTypes: ICropType[], 
  varietyTypes: IVarietyType[], 
  selectedCropTypeId?: string
): SectionConfig[] => {
  // Opciones para crop types
  const cropTypeOptions = cropTypes.map(ct => ({
    value: ct._id,
    label: ct.cropName
  }));

  // Opciones para variety types filtradas
  // En modo de edición, incluir todas las opciones que corresponden al selectedCropTypeId
  // para asegurar que el valor por defecto esté disponible
  const varietyTypeOptions = selectedCropTypeId 
    ? varietyTypes
        .filter(vt => vt.cropTypeId === selectedCropTypeId)
        .map(vt => ({
          value: vt._id,
          label: vt.varietyName
        }))
    : [];

  return [
  {
    id: "general-info",
    title: "Información General",
    description: "Ingrese los datos generales del cuartel productivo",
    fields: [
      {
        id: "classificationZone",
        type: "text",
        label: "Zona de Clasificación",
        name: "classificationZone",
        placeholder: "Ingrese la zona de clasificación (opcional)",
        required: false,
        helperText: "Zona donde se encuentra clasificado el cuartel"
      },
      {
        id: "areaName",
        type: "text",
        label: "Nombre Cuartel/Potrero",
        name: "areaName",
        placeholder: "Nombre del cuartel o potrero",
        required: true,
        helperText: "Nombre identificativo del cuartel o potrero"
      },
      {
        id: "codeOptional",
        type: "text",
        label: "Código",
        name: "codeOptional",
        placeholder: "Ingrese el código (opcional)",
        required: false,
        helperText: "Código identificativo"
      },
      {
        id: "organic",
        type: "checkbox",
        label: "Orgánico",
        name: "organic",
        required: true,
        helperText: "Indica si el cuartel es de producción orgánica"
      },
      {
        id: "varietySpecies",
        type: "select",
        label: "Especie de Variedad",
        name: "varietySpecies",
        placeholder: "Seleccione la especie",
        required: true,
        helperText: "Tipo de especie",
        options: cropTypeOptions
      },
      {
        id: "variety",
        type: "select",
        label: "Variedad",
        name: "variety",
        placeholder: "Seleccione la variedad",
        required: true,
        helperText: "Variedad específica del cultivo",
        options: varietyTypeOptions
      },
      {
        id: "qualityType",
        type: "text",
        label: "Tipo de Calidad",
        name: "qualityType",
        placeholder: "Ingrese el tipo de calidad (opcional)",
        required: false,
        helperText: "Clasificación de calidad"
      },
      {
        id: "totalHa",
        type: "number",
        label: "Total Hectáreas",
        name: "totalHa",
        placeholder: "0",
        required: true,
        helperText: "Total de hectáreas"
      },
      {
        id: "totalPlants",
        type: "number",
        label: "Total Plantas",
        name: "totalPlants",
        placeholder: "0",
        required: true,
        helperText: "Número total de plantas"
      },
      {
        id: "percentToRepresent",
        type: "number",
        label: "Porcentaje a Representar",
        name: "percentToRepresent",
        placeholder: "0",
        required: false,
        helperText: "Porcentaje que representa"
      },
      {
        id: "availableRecord",
        type: "select",
        label: "Registro Disponible",
        name: "availableRecord",
        placeholder: "Seleccione...",
        required: true,
        helperText: "0: Sofia y AppSofia, 1: Solo AppSofia",
        options: [
          { value: "0", label: "Sofia y AppSofia" },
          { value: "1", label: "Solo AppSofia" }
        ]
      },
      {
        id: "active",
        type: "checkbox",
        label: "Activo",
        name: "active",
        required: true,
        helperText: "Indica si el cuartel está activo"
      },
      {
        id: "useProration",
        type: "checkbox",
        label: "Usar Prorrata",
        name: "useProration",
        required: true,
        helperText: "Indica si se utiliza prorrata"
      }
    ]
  },
  {
    id: "harvest-info",
    title: "Información de Cosecha",
    description: "Ingrese los datos de cosecha",
    fields: [
      {
        id: "firstHarvestDate",
        type: "text",
        label: "Fecha Primera Cosecha",
        name: "firstHarvestDate",
        placeholder: "YYYY-MM-DD",
        required: true,
        helperText: "Fecha de la primera cosecha"
      },
      {
        id: "firstHarvestDay",
        type: "number",
        label: "Día Primera Cosecha",
        name: "firstHarvestDay",
        placeholder: "0",
        required: true,
        helperText: "Día de la primera cosecha"
      },
      {
        id: "secondHarvestDate",
        type: "text",
        label: "Fecha Segunda Cosecha",
        name: "secondHarvestDate",
        placeholder: "YYYY-MM-DD",
        required: true,
        helperText: "Fecha de la segunda cosecha"
      },
      {
        id: "secondHarvestDay",
        type: "number",
        label: "Día Segunda Cosecha",
        name: "secondHarvestDay",
        placeholder: "0",
        required: true,
        helperText: "Día de la segunda cosecha"
      },
      {
        id: "thirdHarvestDate",
        type: "text",
        label: "Fecha Tercera Cosecha",
        name: "thirdHarvestDate",
        placeholder: "YYYY-MM-DD",
        required: true,
        helperText: "Fecha de la tercera cosecha"
      },
      {
        id: "thirdHarvestDay",
        type: "number",
        label: "Día Tercera Cosecha",
        name: "thirdHarvestDay",
        placeholder: "0",
        required: true,
        helperText: "Día de la tercera cosecha"
      }
    ]
  },
  {
    id: "soil-info",
    title: "Información del Suelo",
    description: "Ingrese los datos del suelo",
    fields: [
      {
        id: "soilType",
        type: "text",
        label: "Tipo de Suelo",
        name: "soilType",
        placeholder: "Ingrese el tipo de suelo",
        required: true,
        helperText: "Tipo de suelo"
      },
      {
        id: "texture",
        type: "text",
        label: "Textura",
        name: "texture",
        placeholder: "Ingrese la textura",
        required: true,
        helperText: "Textura del suelo"
      },
      {
        id: "depth",
        type: "text",
        label: "Profundidad",
        name: "depth",
        placeholder: "Ingrese la profundidad",
        required: true,
        helperText: "Profundidad del suelo"
      },
      {
        id: "soilPh",
        type: "number",
        label: "pH del Suelo",
        name: "soilPh",
        placeholder: "0",
        required: true,
        helperText: "pH del suelo"
      },
      {
        id: "percentPending",
        type: "number",
        label: "Porcentaje Pendiente",
        name: "percentPending",
        placeholder: "0",
        required: true,
        helperText: "Porcentaje de pendiente"
      }
    ]
  },
  {
    id: "plantation-info",
    title: "Información de Plantación",
    description: "Ingrese los datos de plantación",
    fields: [
      {
        id: "pattern",
        type: "text",
        label: "Patrón",
        name: "pattern",
        placeholder: "Ingrese el patrón",
        required: true,
        helperText: "Patrón de plantación"
      },
      {
        id: "plantationYear",
        type: "number",
        label: "Año de Plantación",
        name: "plantationYear",
        placeholder: "YYYY",
        required: true,
        helperText: "Año en que se realizó la plantación"
      },
      {
        id: "plantNumber",
        type: "number",
        label: "Número de Planta",
        name: "plantNumber",
        placeholder: "0",
        required: true,
        helperText: "Número de plantas"
      },
      {
        id: "rowsList",
        type: "text",
        label: "Lista de Filas",
        name: "rowsList",
        placeholder: "Ingrese la lista de filas",
        required: true,
        helperText: "Lista de filas de plantación"
      },
      {
        id: "plantForRow",
        type: "number",
        label: "Plantas por Fila",
        name: "plantForRow",
        placeholder: "0",
        required: true,
        helperText: "Número de plantas por fila"
      },
      {
        id: "distanceBetweenRowsMts",
        type: "number",
        label: "Distancia Entre Filas (m)",
        name: "distanceBetweenRowsMts",
        placeholder: "0",
        required: true,
        helperText: "Distancia entre filas en metros"
      },
      {
        id: "rowsTotal",
        type: "number",
        label: "Total de Filas",
        name: "rowsTotal",
        placeholder: "0",
        required: true,
        helperText: "Número total de filas"
      },
      {
        id: "area",
        type: "number",
        label: "Área",
        name: "area",
        placeholder: "0",
        required: true,
        helperText: "Área total"
      }
    ]
  },
  {
    id: "irrigation-info",
    title: "Información de Riego y Adicional",
    description: "Ingrese los datos de riego y adicionales",
    fields: [
      {
        id: "irrigationType",
        type: "text",
        label: "Tipo de Riego",
        name: "irrigationType",
        placeholder: "Ingrese el tipo de riego",
        required: true,
        helperText: "Tipo de sistema de riego"
      },
      {
        id: "ltsByHa",
        type: "number",
        label: "Litros por Ha",
        name: "ltsByHa",
        placeholder: "0",
        required: true,
        helperText: "Litros por hectárea"
      },
      {
        id: "irrigationZone",
        type: "checkbox",
        label: "Zona de Irrigación",
        name: "irrigationZone",
        required: true,
        helperText: "Indica si es una zona de irrigación"
      },
      {
        id: "barracksLotObject",
        type: "text",
        label: "Objeto de Lote de Cuarteles",
        name: "barracksLotObject",
        placeholder: "Ingrese el objeto",
        required: true,
        helperText: "Objeto de lote de cuarteles"
      },
      {
        id: "investmentNumber",
        type: "text",
        label: "Número de Inversión",
        name: "investmentNumber",
        placeholder: "Ingrese el número de inversión",
        required: true,
        helperText: "Número de referencia de inversión"
      },
      {
        id: "observation",
        type: "textarea",
        label: "Observación",
        name: "observation",
        placeholder: "Ingrese observaciones",
        required: true,
        helperText: "Observaciones adicionales"
      },
      {
        id: "mapSectorColor",
        type: "text",
        label: "Color de Sector en Mapa",
        name: "mapSectorColor",
        placeholder: "Ej: #FF0000",
        required: true,
        helperText: "Color de visualización en mapas"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Estado Activo",
        name: "state",
        required: true,
        helperText: "Indica si está en estado activo"
      }
    ]
  }
  ];
};

const BarracksWizard: React.FC<BarracksWizardProps> = ({ 
  onSubmit, 
  defaultValues,
  isEditMode = false 
}) => {
  const [step, setStep] = useState(0);
  const [isProductive, setIsProductive] = useState<boolean | null>(
    isEditMode && defaultValues?.isProductive !== undefined 
      ? defaultValues.isProductive 
      : null
  );
  const [cropTypes, setCropTypes] = useState<ICropType[]>([]);
  const [varietyTypes, setVarietyTypes] = useState<IVarietyType[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [cropTypesData, varietyTypesData] = await Promise.all([
          cropTypeService.findAll(),
          varietyTypeService.findAll()
        ]);
        setCropTypes(cropTypesData);
        setVarietyTypes(varietyTypesData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Si estamos en modo edición, saltamos el paso de selección y vamos directo al formulario
  React.useEffect(() => {
    if (isEditMode && defaultValues?.isProductive !== undefined) {
      setStep(1);
    }
  }, [isEditMode, defaultValues]);

  // Estado para el valor seleccionado de varietySpecies (para filtrado dinámico)
  const [selectedVarietySpecies] = useState<string>('');

  // Crear reglas de campo con datos cargados
  const fieldRules = useMemo(() => {
    if (!isProductive || cropTypes.length === 0 || varietyTypes.length === 0) {
      return undefined;
    }

    const cropTypesOptions = cropTypes.map(ct => ({
      _id: ct._id,
      cropName: ct.cropName,
      mapColor: ct.mapColor,
      cropListState: ct.cropListState,
      state: ct.state
    }));

    const varietyTypesOptions = varietyTypes.map(vt => ({
      _id: vt._id,
      varietyName: vt.varietyName,
      cropTypeId: vt.cropTypeId,
      state: vt.state
    }));

    return createBarracksRules({
      cropTypesOptions,
      varietyTypesOptions
    });
  }, [isProductive, cropTypes, varietyTypes]);

  // Función para obtener variety types filtrados
  const getFilteredVarietyTypes = (selectedCropTypeId: string) => {
    if (!selectedCropTypeId) return [];
    return varietyTypes.filter(vt => 
      vt.cropTypeId === selectedCropTypeId
    );
  };

  const handleProductiveSelection = (productive: boolean) => {
    setIsProductive(productive);
    setStep(1);
  };

  const handleFormSubmit = (data: any) => {
    // Agregar el campo isProductive a los datos
    const finalData = {
      ...data,
      isProductive: isProductive
    };
    console.log("datatosendfrombarrackwizard", finalData);
    onSubmit(finalData);
  };

  const handleBack = () => {
    if (step === 1 && !isEditMode) {
      setStep(0);
      setIsProductive(null);
    }
  };

  if (step === 0 && !isEditMode) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Tipo de Cuartel</h3>
          <p className="text-muted-foreground">
            Seleccione el tipo de cuartel que desea crear
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
            onClick={() => handleProductiveSelection(true)}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-2">
                <Sprout className="h-12 w-12 text-green-500" />
              </div>
              <CardTitle className="text-lg">Cuartel Productivo</CardTitle>
              <Badge variant="secondary" className="mx-auto">Completo</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Cuartel destinado a la producción agrícola. Requiere información detallada 
                sobre cultivos, cosechas, suelo, plantación y riego.
              </p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
            onClick={() => handleProductiveSelection(false)}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-2">
                <Building2 className="h-12 w-12 text-blue-500" />
              </div>
              <CardTitle className="text-lg">Area No Productiva</CardTitle>
              <Badge variant="outline" className="mx-auto">Básico</Badge>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Areas para otros usos (Administración, infraestructura, etc.). 
                Solo requiere información básica.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 1 && isProductive !== null) {
    // En modo de edición, priorizar el defaultValues?.varietySpecies para asegurar que las opciones se filtren correctamente
    const currentVarietySpecies = isEditMode && defaultValues?.varietySpecies 
      ? defaultValues.varietySpecies 
      : selectedVarietySpecies || defaultValues?.varietySpecies;
    
    if (process.env.NODE_ENV === 'development' && isEditMode) {
      console.log('🔧 BarracksWizard Edit Mode Debug:', {
        isEditMode,
        defaultVarietySpecies: defaultValues?.varietySpecies,
        defaultVariety: defaultValues?.variety,
        currentVarietySpecies,
        selectedVarietySpecies,
        cropTypesCount: cropTypes.length,
        varietyTypesCount: varietyTypes.length
      });
    }
      
    const sections = isProductive 
      ? createProductiveFormSections(cropTypes, varietyTypes, currentVarietySpecies) 
      : nonProductiveFormSections;
    const validationSchema = isProductive ? productiveValidationSchema : nonProductiveValidationSchema;
    
    // Preparar valores por defecto
    const formDefaultValues = isProductive 
      ? {
          isProductive: true,
          active: true,
          useProration: true,
          organic: false,
          irrigationZone: false,
          state: true,
          availableRecord: "0",
          ...defaultValues
        }
      : {
          isProductive: false,
          active: true,
          observation: "",
          state: true,
          availableRecord: "0",
          ...defaultValues
        };

    return (
      <div className="space-y-4">
        {!isEditMode && (
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Badge variant={isProductive ? "default" : "secondary"}>
              {isProductive ? "Cuartel Productivo" : "Cuartel No Productivo"}
            </Badge>
          </div>
        )}
        
        {loading && (
          <div className="flex items-center justify-center p-4">
            <div className="text-sm text-muted-foreground">Cargando datos...</div>
          </div>
        )}
        
        {!loading && (
          <DynamicForm
            sections={sections}
            onSubmit={handleFormSubmit}
            validationSchema={validationSchema}
            defaultValues={formDefaultValues}
            fieldRules={fieldRules}
          />
        )}
      </div>
    );
  }

  return null;
};

export default BarracksWizard; 