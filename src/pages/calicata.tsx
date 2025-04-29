import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  Building2,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Shovel,
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
import { ICalicata } from "@/types";
import calicataService from "@/_services/calicataService";
import { toast } from "@/components/ui/use-toast";
import { format } from "date-fns";

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

// Format date for display
const formatDate = (value: string | Date) => {
  if (!value) return "";
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    return value.toString();
  }
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
    render: formatDate,
  },
  {
    id: "fieldOrPlot",
    header: "Campo/Parcela",
    accessor: "fieldOrPlot",
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
    id: "responsible",
    header: "Responsable",
    accessor: "responsible",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "observations",
    header: "Observaciones",
    accessor: "observations",
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
    <h3 className="text-lg font-semibold mb-2">Calicata - {row.fieldOrPlot}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Fecha:</strong> {formatDate(row.date)}
        </p>
        <p>
          <strong>Campo/Parcela:</strong> {row.fieldOrPlot}
        </p>
        <p>
          <strong>Profundidad:</strong> {row.depth}
        </p>
      </div>
      <div>
        <p>
          <strong>Responsable:</strong> {row.responsible}
        </p>
        <p>
          <strong>Observaciones:</strong> {row.observations || 'N/A'}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
    {(row.image1 || row.image2 || row.image3) && (
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Imágenes:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {row.image1 && (
            <div>
              <img src={row.image1} alt="Imagen 1" className="w-full h-auto rounded" />
            </div>
          )}
          {row.image2 && (
            <div>
              <img src={row.image2} alt="Imagen 2" className="w-full h-auto rounded" />
            </div>
          )}
          {row.image3 && (
            <div>
              <img src={row.image3} alt="Imagen 3" className="w-full h-auto rounded" />
            </div>
          )}
        </div>
      </div>
    )}
    {row.signature && (
      <div className="mt-4">
        <h4 className="font-semibold mb-2">Firma:</h4>
        <img src={row.signature} alt="Firma" className="max-w-xs h-auto" />
      </div>
    )}
  </div>
);

// Form configuration for adding new calicata
const formSections: SectionConfig[] = [
  {
    id: "calicata-info",
    title: "Información de la Calicata",
    description: "Ingrese los datos de la nueva calicata",
    fields: [
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        required: true,
        helperText: "Fecha en que se realizó la calicata"
      },
      {
        id: "fieldOrPlot",
        type: "text",
        label: "Campo/Parcela",
        name: "fieldOrPlot",
        placeholder: "Ingrese el campo o parcela",
        required: true,
        helperText: "Identificador del campo o parcela donde se realizó la calicata"
      },
      {
        id: "depth",
        type: "number",
        label: "Profundidad (cm)",
        name: "depth",
        placeholder: "Profundidad en cm",
        helperText: "Profundidad de la calicata en centímetros"
      },
      {
        id: "responsible",
        type: "text",
        label: "Responsable",
        name: "responsible",
        placeholder: "Nombre del responsable",
        required: true,
        helperText: "Persona responsable del registro"
      },
      {
        id: "observations",
        type: "textarea",
        label: "Observaciones",
        name: "observations",
        placeholder: "Observaciones generales",
        helperText: "Observaciones adicionales sobre la calicata"
      },
      {
        id: "image1",
        type: "file",
        label: "Imagen 1",
        name: "image1",
        accept: "image/*",
        helperText: "Primera imagen de la calicata (opcional)"
      },
      {
        id: "image2",
        type: "file",
        label: "Imagen 2",
        name: "image2",
        accept: "image/*",
        helperText: "Segunda imagen de la calicata (opcional)"
      },
      {
        id: "image3",
        type: "file",
        label: "Imagen 3",
        name: "image3",
        accept: "image/*",
        helperText: "Tercera imagen de la calicata (opcional)"
      },
      {
        id: "signature",
        type: "signature",
        label: "Firma",
        name: "signature",
        helperText: "Firma del responsable (opcional)"
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
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  fieldOrPlot: z.string().min(1, { message: "El campo/parcela es obligatorio" }),
  depth: z.number().optional(),
  responsible: z.string().min(1, { message: "El responsable es obligatorio" }),
  observations: z.string().optional(),
  image1: z.string().optional(),
  image2: z.string().optional(),
  image3: z.string().optional(),
  signature: z.string().optional(),
  state: z.boolean().default(true)
});

const Calicata = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [calicatas, setCalicatas] = useState<ICalicata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCalicata, setSelectedCalicata] = useState<ICalicata | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch calicatas on component mount
  useEffect(() => {
    fetchCalicatas();
  }, []);
  
  // Function to fetch calicatas data
  const fetchCalicatas = async () => {
    setIsLoading(true);
    try {
      const data = await calicataService.findAll();
      setCalicatas(data.data || data);
    } catch (error) {
      console.error("Error loading calicatas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de calicatas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new calicata
  const handleAddCalicata = async (data: Partial<ICalicata>) => {
    try {
      await calicataService.createCalicata(data);
      await fetchCalicatas();
      setIsDialogOpen(false);
      toast({
        title: "Éxito",
        description: "Calicata agregada correctamente",
      });
    } catch (error) {
      console.error("Error adding calicata:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la calicata",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a calicata
  const handleUpdateCalicata = async (id: string | number, data: Partial<ICalicata>) => {
    try {
      await calicataService.updateCalicata(id, data);
      await fetchCalicatas();
      setIsDialogOpen(false);
      setSelectedCalicata(null);
      setIsEditMode(false);
      toast({
        title: "Éxito",
        description: "Calicata actualizada correctamente",
      });
    } catch (error) {
      console.error("Error updating calicata:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la calicata",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a calicata
  const handleDeleteCalicata = async (id: string | number) => {
    if (window.confirm("¿Está seguro de que desea eliminar esta calicata?")) {
      try {
        await calicataService.softDeleteCalicata(id);
        await fetchCalicatas();
        toast({
          title: "Éxito",
          description: "Calicata eliminada correctamente",
        });
      } catch (error) {
        console.error("Error deleting calicata:", error);
        toast({
          title: "Error",
          description: "No se pudo eliminar la calicata",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle form submission
  const handleFormSubmit = (data: Partial<ICalicata>) => {
    if (isEditMode && selectedCalicata) {
      handleUpdateCalicata(selectedCalicata._id, data);
    } else {
      handleAddCalicata(data);
    }
  };

  // Handle edit button click
  const handleEditClick = (calicata: ICalicata) => {
    setSelectedCalicata(calicata);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: ICalicata) => {
    return (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleEditClick(row)}
          title="Editar"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteCalicata(row._id)}
          title="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Calicatas</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedCalicata(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Calicata
        </Button>
      </div>

      <Grid
        data={calicatas}
        columns={columns}
        renderExpandedContent={expandableContent}
        renderRowActions={renderActions}
        isLoading={isLoading}
        emptyMessage="No hay calicatas registradas"
        gridId="calicata-grid"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Calicata" : "Agregar Nueva Calicata"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Actualice la información de la calicata seleccionada"
                : "Complete el formulario para agregar una nueva calicata"}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            initialValues={isEditMode && selectedCalicata ? selectedCalicata : undefined}
            submitButtonLabel={isEditMode ? "Actualizar" : "Agregar"}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calicata; 