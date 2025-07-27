import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DynamicForm, { SectionConfig } from "@/components/DynamicForm/DynamicForm";
import { z } from "zod";
import { Sprout, Building2, ArrowLeft, ArrowRight } from "lucide-react";

interface BarracksWizardProps {
  onSubmit: (data: any) => void;
  defaultValues?: any;
  isEditMode?: boolean;
}

// Esquema de validación para cuarteles no productivos (campos básicos)
const nonProductiveValidationSchema = z.object({
  isProductive: z.boolean().default(false),
  classificationZone: z.string().min(1, { message: "La zona de clasificación es obligatoria" }),
  barracksPaddockName: z.string().min(1, { message: "El nombre del cuartel/potrero es obligatorio" }),
  codeOptional: z.string().min(1, { message: "El código es obligatorio" }),
  observation: z.string().optional(),
  state: z.boolean().default(true)
});

// Esquema de validación completo para cuarteles productivos
const productiveValidationSchema = z.object({
  isProductive: z.boolean().default(true),
  classificationZone: z.string().min(1, { message: "La zona de clasificación es obligatoria" }),
  barracksPaddockName: z.string().min(1, { message: "El nombre del cuartel/potrero es obligatorio" }),
  codeOptional: z.string().min(1, { message: "El código es obligatorio" }),
  organic: z.boolean().default(false),
  varietySpecies: z.string().min(1, { message: "La especie de variedad es obligatoria" }),
  variety: z.string().min(1, { message: "La variedad es obligatoria" }),
  qualityType: z.string().min(1, { message: "El tipo de calidad es obligatorio" }),
  totalHa: z.number().positive({ message: "El total de hectáreas debe ser positivo" }),
  totalPlants: z.number().positive({ message: "El total de plantas debe ser positivo" }),
  percentToRepresent: z.number().min(0).max(100, { message: "El porcentaje debe estar entre 0 y 100" }),
  availableRecord: z.string().min(1, { message: "El registro disponible es obligatorio" }),
  active: z.boolean().default(true),
  useProration: z.boolean().default(true),

  firstHarvestDate: z.string().min(1, { message: "La fecha de primera cosecha es obligatoria" }),
  firstHarvestDay: z.number().positive({ message: "El día de primera cosecha debe ser positivo" }),
  secondHarvestDate: z.string().min(1, { message: "La fecha de segunda cosecha es obligatoria" }),
  secondHarvestDay: z.number().positive({ message: "El día de segunda cosecha debe ser positivo" }),
  thirdHarvestDate: z.string().min(1, { message: "La fecha de tercera cosecha es obligatoria" }),
  thirdHarvestDay: z.number().positive({ message: "El día de tercera cosecha debe ser positivo" }),

  soilType: z.string().min(1, { message: "El tipo de suelo es obligatorio" }),
  texture: z.string().min(1, { message: "La textura es obligatoria" }),
  depth: z.string().min(1, { message: "La profundidad es obligatoria" }),
  soilPh: z.number().positive({ message: "El pH del suelo debe ser positivo" }),
  percentPending: z.number().min(0).max(100, { message: "El porcentaje pendiente debe estar entre 0 y 100" }),

  pattern: z.string().min(1, { message: "El patrón es obligatorio" }),
  plantationYear: z.number().positive({ message: "El año de plantación debe ser positivo" }),
  plantNumber: z.number().positive({ message: "El número de planta debe ser positivo" }),
  rowsList: z.string().min(1, { message: "La lista de filas es obligatoria" }),
  plantForRow: z.number().positive({ message: "La planta por fila debe ser positiva" }),
  distanceBetweenRowsMts: z.number().positive({ message: "La distancia entre filas debe ser positiva" }),
  rowsTotal: z.number().positive({ message: "El total de filas debe ser positivo" }),
  area: z.number().positive({ message: "El área debe ser positiva" }),

  irrigationType: z.string().min(1, { message: "El tipo de riego es obligatorio" }),
  itsByHa: z.number().positive({ message: "ITsByHa debe ser positivo" }),
  irrigationZone: z.boolean().default(false),

  barracksLotObject: z.string().min(1, { message: "El objeto de lote de cuarteles es obligatorio" }),
  investmentNumber: z.string().min(1, { message: "El número de inversión es obligatorio" }),
  observation: z.string().min(1, { message: "La observación es obligatoria" }),
  mapSectorColor: z.string().min(1, { message: "El color del sector del mapa es obligatorio" }),
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
        placeholder: "Ingrese la zona de clasificación",
        required: true,
        helperText: "Zona donde se encuentra clasificado el cuartel"
      },
      {
        id: "barracksPaddockName",
        type: "text",
        label: "Nombre Cuartel/Potrero",
        name: "barracksPaddockName",
        placeholder: "Nombre del cuartel o potrero",
        required: true,
        helperText: "Nombre identificativo del cuartel o potrero"
      },
      {
        id: "codeOptional",
        type: "text",
        label: "Código",
        name: "codeOptional",
        placeholder: "Ingrese el código",
        required: true,
        helperText: "Código identificativo"
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

// Configuración del formulario completo para cuarteles productivos
const productiveFormSections: SectionConfig[] = [
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
        placeholder: "Ingrese la zona de clasificación",
        required: true,
        helperText: "Zona donde se encuentra clasificado el cuartel"
      },
      {
        id: "barracksPaddockName",
        type: "text",
        label: "Nombre Cuartel/Potrero",
        name: "barracksPaddockName",
        placeholder: "Nombre del cuartel o potrero",
        required: true,
        helperText: "Nombre identificativo del cuartel o potrero"
      },
      {
        id: "codeOptional",
        type: "text",
        label: "Código",
        name: "codeOptional",
        placeholder: "Ingrese el código",
        required: true,
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
        type: "text",
        label: "Especie de Variedad",
        name: "varietySpecies",
        placeholder: "Ingrese la especie",
        required: true,
        helperText: "Tipo de especie"
      },
      {
        id: "variety",
        type: "text",
        label: "Variedad",
        name: "variety",
        placeholder: "Ingrese la variedad",
        required: true,
        helperText: "Variedad específica del cultivo"
      },
      {
        id: "qualityType",
        type: "text",
        label: "Tipo de Calidad",
        name: "qualityType",
        placeholder: "Ingrese el tipo de calidad",
        required: true,
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
        required: true,
        helperText: "Porcentaje que representa"
      },
      {
        id: "availableRecord",
        type: "text",
        label: "Registro Disponible",
        name: "availableRecord",
        placeholder: "Ingrese el registro disponible",
        required: true,
        helperText: "Registro disponible"
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
        id: "itsByHa",
        type: "number",
        label: "ITs por Ha",
        name: "itsByHa",
        placeholder: "0",
        required: true,
        helperText: "ITs por hectárea"
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

  // Si estamos en modo edición, saltamos el paso de selección y vamos directo al formulario
  React.useEffect(() => {
    if (isEditMode && defaultValues?.isProductive !== undefined) {
      setStep(1);
    }
  }, [isEditMode, defaultValues]);

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
    const sections = isProductive ? productiveFormSections : nonProductiveFormSections;
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
          ...defaultValues
        }
      : {
          isProductive: false,
          state: true,
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
        
        <DynamicForm
          sections={sections}
          onSubmit={handleFormSubmit}
          validationSchema={validationSchema}
          defaultValues={formDefaultValues}
        />
      </div>
    );
  }

  return null;
};

export default BarracksWizard; 