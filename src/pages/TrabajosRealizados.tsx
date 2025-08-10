import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Briefcase,
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
import { IWorkers } from "@eon-lib/eon-mongoose";
import workerService from "@/_services/workerService";
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

// Column configuration for the grid - based on the model structure
const columns: Column[] = [
  {
    id: "id",
    header: "ID",
    accessor: "_id",
    visible: true,
    sortable: true,
  },
  {
    id: "worker",
    header: "Trabajador",
    accessor: "worker.id",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "quadrille",
    header: "Cuadrilla",
    accessor: "quadrille",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "workingDay",
    header: "Jornada",
    accessor: "workingDay",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "paymentMethod",
    header: "Método de Pago",
    accessor: "paymentMethod",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "totalHectares",
    header: "Total Hectáreas",
    accessor: "totalHectares",
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
    id: "contractor",
    header: "Contratista",
    accessor: "contractor",
    visible: true,
    sortable: true,
    groupable: true,
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
    <h3 className="text-lg font-semibold mb-2">Detalles del Trabajo</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p><strong>Horas Extra:</strong> {row.overtime}</p>
        <p><strong>Bono:</strong> {row.bond}</p>
        <p><strong>Valor Día:</strong> {row.dayValue}</p>
        <p><strong>Total Trato:</strong> {row.totalDeal}</p>
      </div>
      <div>
        <p><strong>Bonificaciones:</strong> {row.bonuses}</p>
        <p><strong>Rendimiento Exportación:</strong> {row.exportPerformance}</p>
        <p><strong>Rendimiento Jugo:</strong> {row.juicePerformance}</p>
        <p><strong>Otros Rendimientos:</strong> {row.othersPerformance}</p>
      </div>
      <div>
        <p><strong>Total Diario:</strong> {row.dailyTotal}</p>
        <p><strong>Valor:</strong> {row.value}</p>
        <p><strong>Salario:</strong> {row.salary}</p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new trabajos realizados
const formSections: SectionConfig[] = [
  {
    id: "trabajo-info",
    title: "Información del Trabajo Realizado",
    description: "Ingrese los datos del trabajo realizado",
    fields: [
      {
        id: "classification",
        type: "text",
        label: "Clasificación",
        name: "classification",
        placeholder: "Clasificación del trabajo",
        required: true,
        helperText: "Ingrese la clasificación del trabajo realizado"
      },
      {
        id: "worker",
        type: "text",
        label: "ID del Trabajador",
        name: "worker.id",
        placeholder: "ID del trabajador",
        required: true,
        helperText: "Ingrese el ID del trabajador"
      },
      {
        id: "quadrille",
        type: "text",
        label: "Cuadrilla",
        name: "quadrille",
        placeholder: "Cuadrilla",
        required: true,
        helperText: "Cuadrilla asignada"
      },
      {
        id: "workingDay",
        type: "text",
        label: "Jornada",
        name: "workingDay",
        placeholder: "Jornada de trabajo",
        required: true,
        helperText: "Jornada de trabajo"
      },
      {
        id: "paymentMethod",
        type: "text",
        label: "Método de Pago",
        name: "paymentMethod",
        placeholder: "Método de pago",
        required: true,
        helperText: "Método de pago"
      },
      {
        id: "totalHectares",
        type: "text",
        label: "Total Hectáreas",
        name: "totalHectares",
        placeholder: "Total hectáreas",
        required: true,
        helperText: "Total de hectáreas"
      },
      {
        id: "overtime",
        type: "text",
        label: "Horas Extra",
        name: "overtime",
        placeholder: "Horas extra",
        required: true,
        helperText: "Horas extra trabajadas"
      },
      {
        id: "bond",
        type: "text",
        label: "Bono",
        name: "bond",
        placeholder: "Bono",
        required: true,
        helperText: "Bono asignado"
      },
      {
        id: "dayValue",
        type: "text",
        label: "Valor Día",
        name: "dayValue",
        placeholder: "Valor día",
        required: true,
        helperText: "Valor por día"
      },
      {
        id: "totalDeal",
        type: "text",
        label: "Total Trato",
        name: "totalDeal",
        placeholder: "Total trato",
        required: true,
        helperText: "Total del trato"
      },
      {
        id: "bonuses",
        type: "text",
        label: "Bonificaciones",
        name: "bonuses",
        placeholder: "Bonificaciones",
        required: true,
        helperText: "Bonificaciones adicionales"
      },
      {
        id: "exportPerformance",
        type: "text",
        label: "Rendimiento Exportación",
        name: "exportPerformance",
        placeholder: "Rendimiento exportación",
        required: true,
        helperText: "Rendimiento de exportación"
      },
      {
        id: "juicePerformance",
        type: "text",
        label: "Rendimiento Jugo",
        name: "juicePerformance",
        placeholder: "Rendimiento jugo",
        required: true,
        helperText: "Rendimiento de jugo"
      },
      {
        id: "othersPerformance",
        type: "text",
        label: "Otros Rendimientos",
        name: "othersPerformance",
        placeholder: "Otros rendimientos",
        required: true,
        helperText: "Otros rendimientos"
      },
      {
        id: "dailyTotal",
        type: "text",
        label: "Total Diario",
        name: "dailyTotal",
        placeholder: "Total diario",
        required: true,
        helperText: "Total diario"
      },
      {
        id: "value",
        type: "text",
        label: "Valor",
        name: "value",
        placeholder: "Valor",
        required: true,
        helperText: "Valor total"
      },
      {
        id: "salary",
        type: "text",
        label: "Salario",
        name: "salary",
        placeholder: "Salario",
        required: true,
        helperText: "Salario asignado"
      },
      {
        id: "date",
        type: "date",
        label: "Fecha",
        name: "date",
        placeholder: "Fecha",
        required: true,
        helperText: "Fecha del trabajo realizado"
      },
      {
        id: "contractor",
        type: "text",
        label: "Contratista",
        name: "contractor",
        placeholder: "Contratista",
        required: true,
        helperText: "Nombre del contratista"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si el trabajo está activo"
      },
    ],
  }
];

// Form validation schema
const formValidationSchema = z.object({
  classification: z.string().min(1, { message: "La clasificación es obligatoria" }),
  worker: z.object({
    id: z.string().min(1, { message: "El ID del trabajador es obligatorio" })
  }),
  quadrille: z.string().min(1, { message: "La cuadrilla es obligatoria" }),
  workingDay: z.string().min(1, { message: "La jornada es obligatoria" }),
  paymentMethod: z.string().min(1, { message: "El método de pago es obligatorio" }),
  totalHectares: z.string().min(1, { message: "El total de hectáreas es obligatorio" }),
  overtime: z.string().min(1, { message: "Las horas extra son obligatorias" }),
  bond: z.string().min(1, { message: "El bono es obligatorio" }),
  dayValue: z.string().min(1, { message: "El valor por día es obligatorio" }),
  totalDeal: z.string().min(1, { message: "El total del trato es obligatorio" }),
  bonuses: z.string().min(1, { message: "Las bonificaciones son obligatorias" }),
  exportPerformance: z.string().min(1, { message: "El rendimiento de exportación es obligatorio" }),
  juicePerformance: z.string().min(1, { message: "El rendimiento de jugo es obligatorio" }),
  othersPerformance: z.string().min(1, { message: "Otros rendimientos son obligatorios" }),
  dailyTotal: z.string().min(1, { message: "El total diario es obligatorio" }),
  value: z.string().min(1, { message: "El valor es obligatorio" }),
  salary: z.string().min(1, { message: "El salario es obligatorio" }),
  date: z.string().min(1, { message: "La fecha es obligatoria" }),
  contractor: z.string().min(1, { message: "El contratista es obligatorio" }),
  state: z.boolean().default(false)
});

const TrabajosRealizados = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [trabajos, setTrabajos] = useState<IWorkers[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrabajo, setSelectedTrabajo] = useState<IWorkers | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Fetch trabajos on component mount
  useEffect(() => {
    fetchTrabajos();
  }, []);
  
  // Function to fetch trabajos data
  const fetchTrabajos = async () => {
    setIsLoading(true);
    try {
      const data = await workerService.findAll();
      // Asegurarse que los datos son un array
      const trabajosData = Array.isArray(data) ? data : (data as any)?.data || [];
      setTrabajos(trabajosData);
    } catch (error) {
      console.error("Error loading trabajos:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los trabajos realizados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new trabajo
  const handleAddTrabajo = async (data: any) => {
    try {
      await workerService.createWorker({
        classification: data.classification,
        worker: {
          id: data.worker.id
        },
        quadrille: data.quadrille,
        workingDay: data.workingDay,
        paymentMethod: data.paymentMethod,
        totalHectares: data.totalHectares,
        overtime: data.overtime,
        bond: data.bond,
        dayValue: data.dayValue,
        totalDeal: data.totalDeal,
        bonuses: data.bonuses,
        exportPerformance: data.exportPerformance,
        juicePerformance: data.juicePerformance,
        othersPerformance: data.othersPerformance,
        dailyTotal: data.dailyTotal,
        value: data.value,
        salary: data.salary,
        date: data.date,
        contractor: data.contractor,
        state: data.state
      });
      
      toast({
        title: "Éxito",
        description: "Trabajo creado correctamente",
      });
      
      fetchTrabajos();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating trabajo:", error);
      toast({
        title: "Error",
        description: "Error al crear el trabajo",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a trabajo
  const handleUpdateTrabajo = async (id: string | number, data: any) => {
    try {
      await workerService.updateWorker(id, {
        // @ts-ignore
        classification: data.classification,
        worker: {
          id: data.worker.id
        },
        quadrille: data.quadrille,
        workingDay: data.workingDay,
        paymentMethod: data.paymentMethod,
        totalHectares: data.totalHectares,
        overtime: data.overtime,
        bond: data.bond,
        dayValue: data.dayValue,
        totalDeal: data.totalDeal,
        bonuses: data.bonuses,
        exportPerformance: data.exportPerformance,
        juicePerformance: data.juicePerformance,
        othersPerformance: data.othersPerformance,
        dailyTotal: data.dailyTotal,
        value: data.value,
        salary: data.salary,
        date: data.date,
        contractor: data.contractor,
        state: data.state
      });
      
      toast({
        title: "Éxito",
        description: "Trabajo actualizado correctamente",
      });
      
      fetchTrabajos();
      setIsDialogOpen(false);
      setSelectedTrabajo(null);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating trabajo:", error);
      toast({
        title: "Error",
        description: "Error al actualizar el trabajo",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a trabajo
  const handleDeleteTrabajo = async (id: string | number) => {
    try {
      await workerService.softDeleteWorker(id);
      
      toast({
        title: "Éxito",
        description: "Trabajo eliminado correctamente",
      });
      
      fetchTrabajos();
    } catch (error) {
      console.error("Error deleting trabajo:", error);
      toast({
        title: "Error",
        description: "Error al eliminar el trabajo",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission (add or update)
  const handleFormSubmit = (data: any) => {
    if (isEditMode && selectedTrabajo) {
      handleUpdateTrabajo(selectedTrabajo._id, data);
    } else {
      handleAddTrabajo(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (trabajo: IWorkers) => {
    setSelectedTrabajo(trabajo);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render action buttons for each row
  const renderActions = (row: IWorkers) => {
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
          onClick={() => handleDeleteTrabajo(row._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trabajos Realizados</h1>
        <Button onClick={() => {
          setIsEditMode(false);
          setSelectedTrabajo(null);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Agregar Trabajo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">Cargando...</div>
      ) : (
        <Grid
          data={trabajos}
          columns={columns}
          expandableContent={expandableContent}
          actions={renderActions}
          gridId="trabajos-realizados"
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Trabajo" : "Agregar Trabajo"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Actualice los detalles del trabajo realizado"
                : "Complete el formulario para agregar un nuevo trabajo realizado"}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
            defaultValues={isEditMode && selectedTrabajo ? {
              ...selectedTrabajo,
              // Ensure worker is properly formatted for the form
              worker: {
                id: selectedTrabajo.worker.id
              }
            } : undefined}
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

export default TrabajosRealizados; 