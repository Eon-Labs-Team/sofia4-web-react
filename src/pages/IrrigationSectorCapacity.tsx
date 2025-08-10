import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
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
  DialogFooter,
} from "@/components/ui/dialog";
import DynamicForm, {
  SectionConfig,
} from "@/components/DynamicForm/DynamicForm";
import { z } from "zod";
import { IIrrigationSectorCapacity } from "@eon-lib/eon-mongoose";
import irrigationSectorCapacityService from "@/_services/irrigationSectorCapacityService";
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
    id: "variety",
    header: "Variedad",
    accessor: "variety",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "sector",
    header: "Sector",
    accessor: "sector",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "centerCost",
    header: "Centro de Costo",
    accessor: "centerCost",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "ltsByMin",
    header: "Litros por Minuto",
    accessor: "ltsByMin",
    visible: true,
    sortable: true,
  },
  {
    id: "pressure",
    header: "Presión",
    accessor: "pressure",
    visible: true,
    sortable: true,
  },
  {
    id: "pressureUnit",
    header: "Unidad de Presión",
    accessor: "pressureUnit",
    visible: true,
    sortable: true,
  },
  {
    id: "inCharge",
    header: "Responsable",
    accessor: "inCharge",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "createDate",
    header: "Fecha de Creación",
    accessor: "createDate",
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
    <h3 className="text-lg font-semibold mb-2">Aforo del Sector: {row.sector}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Fecha:</strong> {row.date}
        </p>
        <p>
          <strong>Variedad:</strong> {row.variety}
        </p>
        <p>
          <strong>Centro de Costo:</strong> {row.centerCost}
        </p>
        <p>
          <strong>Litros por Minuto:</strong> {row.ltsByMin}
        </p>
      </div>
      <div>
        <p>
          <strong>Presión:</strong> {row.pressure} {row.pressureUnit}
        </p>
        <p>
          <strong>Responsable:</strong> {row.inCharge}
        </p>
        <p>
          <strong>Fecha de Creación:</strong> {row.createDate}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new irrigation sector capacity
const formSections: SectionConfig[] = [
  {
    id: "irrigation-sector-capacity-info",
    title: "Información del Aforo por Sector de Riego",
    description: "Ingrese los datos del nuevo aforo",
    fields: [
      {
        id: "date",
        type: "text",
        label: "Fecha",
        name: "date",
        required: true,
        helperText: "Fecha en que se realizó el aforo"
      },
      {
        id: "variety",
        type: "text",
        label: "Variedad",
        name: "variety",
        placeholder: "Variedad de cultivo",
        required: true,
        helperText: "Variedad específica del cultivo"
      },
      {
        id: "sector",
        type: "text",
        label: "Sector",
        name: "sector",
        placeholder: "Sector de riego",
        required: true,
        helperText: "Sector donde se realizó el aforo"
      },
      {
        id: "centerCost",
        type: "text",
        label: "Centro de Costo",
        name: "centerCost",
        placeholder: "Centro de costo",
        required: true,
        helperText: "Centro de costo asociado"
      },
      {
        id: "ltsByMin",
        type: "number",
        label: "Litros por Minuto",
        name: "ltsByMin",
        placeholder: "Litros por minuto",
        required: true,
        helperText: "Cantidad de litros por minuto del aforo"
      },
      {
        id: "pressure",
        type: "number",
        label: "Presión",
        name: "pressure",
        placeholder: "Presión del agua",
        required: true,
        helperText: "Presión del agua en el sistema"
      },
      {
        id: "pressureUnit",
        type: "text",
        label: "Unidad de Presión",
        name: "pressureUnit",
        placeholder: "Ej: PSI, BAR",
        required: true,
        helperText: "Unidad de medida de la presión"
      },
      {
        id: "inCharge",
        type: "text",
        label: "Responsable",
        name: "inCharge",
        placeholder: "Nombre del responsable",
        required: true,
        helperText: "Persona responsable de realizar el aforo"
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
  variety: z.string().min(1, { message: "La variedad es obligatoria" }),
  sector: z.string().min(1, { message: "El sector es obligatorio" }),
  centerCost: z.string().min(1, { message: "El centro de costo es obligatorio" }),
  ltsByMin: z.number({ required_error: "Los litros por minuto son obligatorios" }),
  pressure: z.number({ required_error: "La presión es obligatoria" }),
  pressureUnit: z.string().min(1, { message: "La unidad de presión es obligatoria" }),
  inCharge: z.string().min(1, { message: "El responsable es obligatorio" }),
  state: z.boolean().default(true)
});

const IrrigationSectorCapacity = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [irrigationSectorCapacities, setIrrigationSectorCapacities] = useState<IIrrigationSectorCapacity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIrrigationSectorCapacity, setSelectedIrrigationSectorCapacity] = useState<IIrrigationSectorCapacity | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch irrigation sector capacities on component mount
  useEffect(() => {
    fetchIrrigationSectorCapacities();
  }, []);
  
  // Function to fetch irrigation sector capacities data
  const fetchIrrigationSectorCapacities = async () => {
    setIsLoading(true);
    try {
      const response = await irrigationSectorCapacityService.findAll();

      const data = response && typeof response === 'object' && 'data' in response 
      ? response.data as IIrrigationSectorCapacity[]
      : Array.isArray(response) ? response as IIrrigationSectorCapacity[] : [] as IIrrigationSectorCapacity[];
      setIrrigationSectorCapacities(data);


    } catch (error) {
      console.error("Error loading irrigation sector capacities:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de aforo por sector de riego",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new irrigation sector capacity
  const handleAddIrrigationSectorCapacity = async (data: Partial<IIrrigationSectorCapacity>) => {
    try {
      // Add current date as createDate if not provided
      if (!data.createDate) {
        data.createDate = new Date().toISOString().split('T')[0];
      }

      await irrigationSectorCapacityService.createIrrigationSectorCapacity(data);
      
      toast({
        title: "Éxito",
        description: "Aforo por sector de riego añadido correctamente",
        variant: "default",
      });
      
      // Refresh the list
      fetchIrrigationSectorCapacities();
      
      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating irrigation sector capacity:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el aforo por sector de riego",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating an irrigation sector capacity
  const handleUpdateIrrigationSectorCapacity = async (id: string | number, data: Partial<IIrrigationSectorCapacity>) => {
    try {
      await irrigationSectorCapacityService.updateIrrigationSectorCapacity(id, data);
      
      toast({
        title: "Éxito",
        description: "Aforo por sector de riego actualizado correctamente",
        variant: "default",
      });
      
      // Refresh the list
      fetchIrrigationSectorCapacities();
      
      // Close the dialog
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedIrrigationSectorCapacity(null);
    } catch (error) {
      console.error(`Error updating irrigation sector capacity ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el aforo por sector de riego",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting an irrigation sector capacity
  const handleDeleteIrrigationSectorCapacity = async (id: string | number) => {
    try {
      await irrigationSectorCapacityService.softDeleteIrrigationSectorCapacity(id);
      
      toast({
        title: "Éxito",
        description: "Aforo por sector de riego eliminado correctamente",
        variant: "default",
      });
      
      // Refresh the list
      fetchIrrigationSectorCapacities();
    } catch (error) {
      console.error(`Error deleting irrigation sector capacity ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el aforo por sector de riego",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission (both add and update)
  const handleFormSubmit = (data: Partial<IIrrigationSectorCapacity>) => {
    if (isEditMode && selectedIrrigationSectorCapacity?._id) {
      handleUpdateIrrigationSectorCapacity(selectedIrrigationSectorCapacity._id, data);
    } else {
      handleAddIrrigationSectorCapacity(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (irrigationSectorCapacity: IIrrigationSectorCapacity) => {
    setSelectedIrrigationSectorCapacity(irrigationSectorCapacity);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Function to render action buttons for each row
  const renderActions = (row: IIrrigationSectorCapacity) => {
    return (
      <div className="flex gap-2">
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
            handleDeleteIrrigationSectorCapacity(row._id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Aforo por Sector de Riego</h1>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedIrrigationSectorCapacity(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Aforo
        </Button>
      </div>
      
      <Grid
        gridId="irrigation-sector-capacity-grid"
        data={irrigationSectorCapacities}
        columns={columns}
        idField="_id"
        title="Aforo por Sector de Riego"
        expandableContent={expandableContent}
        actions={renderActions}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Aforo por Sector de Riego" : "Agregar Aforo por Sector de Riego"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique los detalles del aforo por sector de riego y guarde los cambios."
                : "Complete el formulario para agregar un nuevo aforo por sector de riego."}
            </DialogDescription>
          </DialogHeader>
          
          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode ? selectedIrrigationSectorCapacity || {} : {}}
          />
          
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setIsEditMode(false);
                setSelectedIrrigationSectorCapacity(null);
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

export default IrrigationSectorCapacity; 