import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  Building2,
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
import DynamicForm, { SectionConfig } from "@/components/DynamicForm/DynamicForm";
import { z } from "zod";
import { BarracksList } from "@/types/barracksList";
import listaCuartelesService from "@/_services/listaCuartelesService";
import { toast } from "@/components/ui/use-toast";

// Render function for the boolean columns
const renderBoolean = (value: boolean) => {
  return value ? (
    <div className="flex items-center">
      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
      <span>Sí</span>
    </div>
  ) : (
    <div className="flex items-center">
      <XCircle className="h-4 w-4 text-red-500 mr-2" />
      <span>No</span>
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
    id: "barracksPaddockName",
    header: "Nombre Cuartel/Potrero",
    accessor: "barracksPaddockName",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "classificationZone",
    header: "Zona de Clasificación",
    accessor: "classificationZone",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "codeOptional",
    header: "Código",
    accessor: "codeOptional",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "organic",
    header: "Orgánico",
    accessor: "organic",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderBoolean,
  },
  {
    id: "varietySpecies",
    header: "Especie",
    accessor: "varietySpecies",
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
    id: "qualityType",
    header: "Tipo de Calidad",
    accessor: "qualityType",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "totalHa",
    header: "Total Ha",
    accessor: "totalHa",
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
    render: renderBoolean,
  }
];

// Expandable content for each row
const expandableContent = (row: any) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-4">{row.barracksPaddockName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <h4 className="font-medium">Información General</h4>
        <p><strong>Zona:</strong> {row.classificationZone}</p>
        <p><strong>Código:</strong> {row.codeOptional}</p>
        <p><strong>Orgánico:</strong> {row.organic ? "Sí" : "No"}</p>
        <p><strong>Especie:</strong> {row.varietySpecies}</p>
        <p><strong>Variedad:</strong> {row.variety}</p>
        <p><strong>Tipo Calidad:</strong> {row.qualityType}</p>
        <p><strong>Total Ha:</strong> {row.totalHa}</p>
        <p><strong>Total Plantas:</strong> {row.totalPlants}</p>
        <p><strong>% a Representar:</strong> {row.percentToRepresent}%</p>
        <p><strong>Registro Disponible:</strong> {row.availableRecord}</p>
        <p><strong>Activo:</strong> {row.active ? "Sí" : "No"}</p>
        <p><strong>Usar Prorrata:</strong> {row.useProration ? "Sí" : "No"}</p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Cosechas</h4>
        <p><strong>1ª Fecha:</strong> {row.firstHarvestDate}</p>
        <p><strong>1ª Día:</strong> {row.firstHarvestDay}</p>
        <p><strong>2ª Fecha:</strong> {row.secondHarvestDate}</p>
        <p><strong>2ª Día:</strong> {row.secondHarvestDay}</p>
        <p><strong>3ª Fecha:</strong> {row.thirdHarvestDate}</p>
        <p><strong>3ª Día:</strong> {row.thirdHarvestDay}</p>
        
        <h4 className="font-medium mt-4">Suelo</h4>
        <p><strong>Tipo:</strong> {row.soilType}</p>
        <p><strong>Textura:</strong> {row.texture}</p>
        <p><strong>Profundidad:</strong> {row.depth}</p>
        <p><strong>pH:</strong> {row.soilPh}</p>
        <p><strong>% Pendiente:</strong> {row.percentPending}%</p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Plantación</h4>
        <p><strong>Patrón:</strong> {row.pattern}</p>
        <p><strong>Año:</strong> {row.plantationYear}</p>
        <p><strong>Número Planta:</strong> {row.plantNumber}</p>
        <p><strong>Lista Filas:</strong> {row.rowsList}</p>
        <p><strong>Planta por Fila:</strong> {row.plantForRow}</p>
        <p><strong>Distancia:</strong> {row.distanceBetweenRowsMts} mts</p>
        <p><strong>Total Filas:</strong> {row.rowsTotal}</p>
        <p><strong>Área:</strong> {row.area}</p>
        
        <h4 className="font-medium mt-4">Riego e Información Adicional</h4>
        <p><strong>Tipo Riego:</strong> {row.irrigationType}</p>
        <p><strong>ITs por Ha:</strong> {row.itsByHa}</p>
        <p><strong>Zona Irrigación:</strong> {row.irrigationZone ? "Sí" : "No"}</p>
        <p><strong>Observación:</strong> {row.observation}</p>
        <p><strong>Color Mapa:</strong> {row.mapSectorColor}</p>
      </div>
    </div>
  </div>
);

// Form validation schema - matches exactly the model requirements
const formValidationSchema = z.object({
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

// Form configuration for adding new ListaCuarteles
const formSections: SectionConfig[] = [
  {
    id: "general-info",
    title: "Información General",
    description: "Ingrese los datos generales del cuartel",
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
        label: "Código Opcional",
        name: "codeOptional",
        placeholder: "Ingrese el código",
        required: true,
        helperText: "Código identificativo opcional"
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

const ListaCuarteles = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [listaCuarteles, setListaCuarteles] = useState<BarracksList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCuartel, setSelectedCuartel] = useState<BarracksList | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch lista cuarteles on component mount
  useEffect(() => {
    fetchListaCuarteles();
  }, []);
  
  // Function to fetch lista cuarteles data
  const fetchListaCuarteles = async () => {
    setIsLoading(true);
    try {
      const data = await listaCuartelesService.findAll();
      setListaCuarteles(data.data || data);
    } catch (error) {
      console.error("Error loading lista cuarteles:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new lista cuarteles
  const handleAddListaCuarteles = async (data: Partial<BarracksList>) => {
    try {
      const newListaCuarteles = await listaCuartelesService.createBarracksList(data);
      await fetchListaCuarteles();
      setIsDialogOpen(false);
      toast({
        title: "Cuartel creado",
        description: `El cuartel ${newListaCuarteles.barracksPaddockName} ha sido creado exitosamente.`,
      });
    } catch (error) {
      console.error("Error creating lista cuarteles:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el cuartel. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating an existing lista cuarteles
  const handleUpdateListaCuarteles = async (id: string | number, data: Partial<BarracksList>) => {
    try {
      const updatedListaCuarteles = await listaCuartelesService.updateBarracksList(id, data);
      await fetchListaCuarteles();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedCuartel(null);
      toast({
        title: "Cuartel actualizado",
        description: `El cuartel ${data.barracksPaddockName} ha sido actualizado exitosamente.`,
      });
    } catch (error) {
      console.error("Error updating lista cuarteles:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el cuartel. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a lista cuarteles
  const handleDeleteListaCuarteles = async (id: string | number) => {
    try {
      await listaCuartelesService.softDeleteBarracksList(id);
      setListaCuarteles((prev) => prev.filter((cuartel) => cuartel._id !== id));
      toast({
        title: "Cuartel eliminado",
        description: "El cuartel ha sido eliminado exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting lista cuarteles:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el cuartel. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Handle edit button click
  const handleEdit = (cuartel: BarracksList) => {
    setSelectedCuartel(cuartel);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Handle form submission (determines whether to create or update)
  const handleFormSubmit = (data: any) => {
    if (isEditMode && selectedCuartel?._id) {
      handleUpdateListaCuarteles(selectedCuartel._id, data);
    } else {
      handleAddListaCuarteles(data);
    }
  };

  // Actions column renderer for the grid
  const actionsRenderer = (row: BarracksList) => (
    <div className="flex space-x-2">
      <Button
        onClick={(e) => {
          e.stopPropagation();
          handleEdit(row);
        }}
        size="sm"
        variant="ghost"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm(`¿Está seguro que desea eliminar el cuartel ${row.barracksPaddockName}?`)) {
            handleDeleteListaCuarteles(row._id as string);
          }
        }}
        size="sm"
        variant="ghost"
        className="text-red-500 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lista de Cuarteles</h1>
          <p className="text-muted-foreground">
            Gestione la información de cuarteles en el sistema
          </p>
        </div>
        <Button 
          onClick={() => {
            setIsEditMode(false);
            setSelectedCuartel(null);
            setIsDialogOpen(true);
          }}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Cuartel
        </Button>
      </div>
      
      <Grid
        gridId="lista-cuarteles-grid"
        data={listaCuarteles}
        columns={columns}
        idField="_id"
        title="Lista de Cuarteles"
        expandableContent={expandableContent}
        actions={actionsRenderer}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Cuartel" : "Añadir Nuevo Cuartel"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Modifique el formulario para actualizar el cuartel." 
                : "Complete el formulario para añadir un nuevo cuartel al sistema."
              }
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            validationSchema={formValidationSchema}
            defaultValues={
              isEditMode && selectedCuartel 
                ? {
                    classificationZone: selectedCuartel.classificationZone,
                    barracksPaddockName: selectedCuartel.barracksPaddockName,
                    codeOptional: selectedCuartel.codeOptional,
                    organic: selectedCuartel.organic,
                    varietySpecies: selectedCuartel.varietySpecies,
                    variety: selectedCuartel.variety,
                    qualityType: selectedCuartel.qualityType,
                    totalHa: selectedCuartel.totalHa,
                    totalPlants: selectedCuartel.totalPlants,
                    percentToRepresent: selectedCuartel.percentToRepresent,
                    availableRecord: selectedCuartel.availableRecord,
                    active: selectedCuartel.active,
                    useProration: selectedCuartel.useProration,
                    firstHarvestDate: selectedCuartel.firstHarvestDate,
                    firstHarvestDay: selectedCuartel.firstHarvestDay,
                    secondHarvestDate: selectedCuartel.secondHarvestDate,
                    secondHarvestDay: selectedCuartel.secondHarvestDay,
                    thirdHarvestDate: selectedCuartel.thirdHarvestDate,
                    thirdHarvestDay: selectedCuartel.thirdHarvestDay,
                    soilType: selectedCuartel.soilType,
                    texture: selectedCuartel.texture,
                    depth: selectedCuartel.depth,
                    soilPh: selectedCuartel.soilPh,
                    percentPending: selectedCuartel.percentPending,
                    pattern: selectedCuartel.pattern,
                    plantationYear: selectedCuartel.plantationYear,
                    plantNumber: selectedCuartel.plantNumber,
                    rowsList: selectedCuartel.rowsList,
                    plantForRow: selectedCuartel.plantForRow,
                    distanceBetweenRowsMts: selectedCuartel.distanceBetweenRowsMts,
                    rowsTotal: selectedCuartel.rowsTotal,
                    area: selectedCuartel.area,
                    irrigationType: selectedCuartel.irrigationType,
                    itsByHa: selectedCuartel.itsByHa,
                    irrigationZone: selectedCuartel.irrigationZone,
                    barracksLotObject: selectedCuartel.barracksLotObject,
                    investmentNumber: selectedCuartel.investmentNumber,
                    observation: selectedCuartel.observation,
                    mapSectorColor: selectedCuartel.mapSectorColor,
                    state: selectedCuartel.state,
                  }
                : {
                    active: true,
                    useProration: true,
                    organic: false,
                    irrigationZone: false,
                    state: true,
                  }
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListaCuarteles; 