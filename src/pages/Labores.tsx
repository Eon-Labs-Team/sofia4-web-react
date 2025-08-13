import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import { useAuthStore } from "@/lib/store/authStore";
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
  FieldType,
} from "@/components/DynamicForm/DynamicForm";
import { ITask, AssociatedProductsType } from "@eon-lib/eon-mongoose";
import laborService from "@/_services/laborService";
import { toast } from "@/components/ui/use-toast";
import faenaService from "@/_services/faenaService";
import { ITaskType } from "@eon-lib/eon-mongoose";
import { z } from "zod";

// Extendemos la interfaz ITask para incluir _id que es usado en MongoDB
interface ITaskWithId extends ITask {
  _id: string;
}

// Extendemos la interfaz ITaskType para incluir _id que es usado en MongoDB
interface ITaskTypeWithId extends ITaskType {
  _id: string;
}

// Render function for the boolean values
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

// Render function for the context field
const renderContext = (value: string) => {
  switch (value) {
    case "0":
      return "Solo web";
    case "1":
      return "Solo app";
    case "2":
      return "Web y app";
    case "3":
      return "Desactivado";
    default:
      return value;
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
    id: "taskName",
    header: "Nombre",
    accessor: "taskName",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "optionalCode",
    header: "Código",
    accessor: "optionalCode",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "taskPrice",
    header: "Precio",
    accessor: "taskPrice",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "optimalYield",
    header: "Rendimiento Óptimo",
    accessor: "optimalYield",
    visible: true,
    sortable: true,
  },
  {
    id: "maxHarvestYield",
    header: "Rendimiento Máx. Cosecha",
    accessor: "maxHarvestYield",
    visible: true,
    sortable: true,
  },
  {
    id: "isEditableInApp",
    header: "Editable en App",
    accessor: "isEditableInApp",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderBoolean,
  },
  {
    id: "usesWetCalculationPerHa",
    header: "Cálculo Húmedo por Hectárea",
    accessor: "usesWetCalculationPerHa",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderBoolean,
  },
  {
    id: "usageContext",
    header: "Contexto de Uso",
    accessor: "usageContext",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderContext,
  },
  {
    id: "showTotalEarningsInApp",
    header: "Mostrar Ganancias en App",
    accessor: "showTotalEarningsInApp",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderBoolean,
  },
  {
    id: "requiresRowCount",
    header: "Requiere Conteo de Filas",
    accessor: "requiresRowCount",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderBoolean,
  },
  {
    id: "requiresHourLog",
    header: "Requiere Registro de Horas",
    accessor: "requiresHourLog",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderBoolean,
  },
];

// Expandable content for each row
const expandableContent = (row: any) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.taskName}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Código:</strong> {row.optionalCode || "N/A"}
        </p>
        <p>
          <strong>Precio:</strong> {row.taskPrice}
        </p>
        <p>
          <strong>Rendimiento Óptimo:</strong> {row.optimalYield}
        </p>
      </div>
      <div>
        <p>
          <strong>Rendimiento Máx. Cosecha:</strong> {row.maxHarvestYield}
        </p>
        <p>
          <strong>Contexto de Uso:</strong> {renderContext(row.usageContext)}
        </p>
        <p>
          <strong>Productos Asociados:</strong> {row.associatedProducts?.length || 0}
        </p>
      </div>
    </div>
  </div>
);

const Labores = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [labores, setLabores] = useState<ITaskWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLabor, setSelectedLabor] = useState<ITaskWithId | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [taskTypes, setTaskTypes] = useState<ITaskTypeWithId[]>([]);
  
  // Form configuration for adding/editing labor
  const formSections: SectionConfig[] = [
    {
      id: "labor-info",
      title: "Información de la Labor",
      description: "Ingrese los datos de la labor",
      fields: [
        {
          id: "taskTypeId",
          type: "select",
          label: "Faena",
          name: "taskTypeId",
          placeholder: "Seleccione una faena",
          required: true,
          helperText: "Seleccione la faena a la que pertenece esta labor",
          options: taskTypes.map(taskType => ({
            value: taskType._id,
            label: taskType.name
          }))
        },
        {
          id: "taskName",
          type: "text",
          label: "Nombre de la Labor",
          name: "taskName",
          placeholder: "Nombre de la labor",
          required: true,
          helperText: "Ingrese el nombre identificativo de la labor"
        },
        {
          id: "optionalCode",
          type: "text",
          label: "Código (Opcional)",
          name: "optionalCode",
          placeholder: "Código interno",
          required: false,
          helperText: "Código opcional de referencia interna"
        },
        {
          id: "taskPrice",
          type: "number",
          label: "Precio",
          name: "taskPrice",
          placeholder: "Ej: 1000",
          required: true,
          helperText: "Precio de la tarea"
        },
        {
          id: "optimalYield",
          type: "number",
          label: "Rendimiento Óptimo",
          name: "optimalYield",
          placeholder: "Ej: 80",
          required: true,
          helperText: "Rendimiento óptimo esperado"
        },
        {
          id: "maxHarvestYield",
          type: "number",
          label: "Rendimiento Máximo de Cosecha",
          name: "maxHarvestYield",
          placeholder: "Ej: 100",
          required: true,
          helperText: "Rendimiento máximo esperado para cosecha"
        },
      ],
    },
    {
      id: "labor-settings",
      title: "Configuración de la Labor",
      description: "Configure las opciones de la labor",
      fields: [
        {
          id: "isEditableInApp",
          type: "checkbox",
          label: "Editable en App",
          name: "isEditableInApp",
          required: false,
          helperText: "Indica si es editable en la aplicación móvil"
        },
        {
          id: "usesWetCalculationPerHa",
          type: "checkbox",
          label: "Usa Cálculo Húmedo por Hectárea",
          name: "usesWetCalculationPerHa",
          required: false,
          helperText: "Indica si utiliza cálculo húmedo por hectárea"
        },
        {
          id: "usageContext",
          type: "select",
          label: "Contexto de Uso",
          name: "usageContext",
          options: [
            { value: "0", label: "Solo Web" },
            { value: "1", label: "Solo App" },
            { value: "2", label: "Web y App" },
            { value: "3", label: "Desactivado" },
          ],
          required: true,
          helperText: "Especifica dónde se puede utilizar esta labor"
        },
        {
          id: "showTotalEarningsInApp",
          type: "checkbox",
          label: "Mostrar Ganancias Totales en App",
          name: "showTotalEarningsInApp",
          required: false,
          helperText: "Indica si se deben mostrar las ganancias totales en la app"
        },
        {
          id: "requiresRowCount",
          type: "checkbox",
          label: "Requiere Conteo de Filas",
          name: "requiresRowCount",
          required: false,
          helperText: "Indica si la labor requiere conteo de filas"
        },
        {
          id: "requiresHourLog",
          type: "checkbox",
          label: "Requiere Registro de Horas",
          name: "requiresHourLog",
          required: false,
          helperText: "Indica si la labor requiere registro de horas"
        },
      ],
    }
  ];

  // Form validation schema
  const formValidationSchema = z.object({
    taskTypeId: z.string().min(1, { message: "La faena es obligatoria" }),
    taskName: z.string().min(1, { message: "El nombre de la labor es obligatorio" }),
    optionalCode: z.string().optional(),
    taskPrice: z.number().min(0, { message: "El precio debe ser un número positivo" }),
    optimalYield: z.number().min(0, { message: "El rendimiento óptimo debe ser un número positivo" }),
    maxHarvestYield: z.number().min(0, { message: "El rendimiento máximo debe ser un número positivo" }),
    isEditableInApp: z.boolean().default(true),
    usesWetCalculationPerHa: z.boolean().default(false),
    usageContext: z.string().default("2"),
    showTotalEarningsInApp: z.boolean().default(true),
    requiresRowCount: z.boolean().default(false),
    requiresHourLog: z.boolean().default(false),
    associatedProducts: z.array(z.object({
      productId: z.string(),
      quantity: z.number(),
    })).default([]),
  });
  
  // Fetch labores and task types on component mount
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
  
  useEffect(() => {
    if (propertyId) {
      fetchLabores();
      fetchTaskTypes();
    }
  }, [propertyId]);
  
  // Function to fetch labores data
  const fetchLabores = async () => {
    setIsLoading(true);
    try {
      const data = await laborService.findAll(propertyId);
      // Cast the data to include _id since we know MongoDB adds it
      setLabores(data as ITaskWithId[]);
    } catch (error) {
      console.error("Error loading labores:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las labores",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to fetch task types (faenas)
  const fetchTaskTypes = async () => {
    try {
      const data = await faenaService.findAll(propertyId);
      setTaskTypes(data as ITaskTypeWithId[]);
    } catch (error) {
      console.error("Error loading faenas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las faenas",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle adding a new labor
  const handleAddLabor = async (data: Partial<ITask>) => {
    try {
      await laborService.createLabor(data, propertyId);
      toast({
        title: "Éxito",
        description: "Labor creada correctamente",
      });
      fetchLabores();
    } catch (error) {
      console.error("Error creating labor:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la labor",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a labor
  const handleUpdateLabor = async (id: string | number, data: Partial<ITask>) => {
    try {
      await laborService.updateLabor(id, data);
      toast({
        title: "Éxito",
        description: "Labor actualizada correctamente",
      });
      fetchLabores();
    } catch (error) {
      console.error(`Error updating labor ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la labor",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a labor
  const handleDeleteLabor = async (id: string | number) => {
    try {
      await laborService.softDeleteLabor(id);
      toast({
        title: "Éxito",
        description: "Labor eliminada correctamente",
      });
      fetchLabores();
    } catch (error) {
      console.error(`Error deleting labor ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la labor",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<ITask>) => {
    if (isEditMode && selectedLabor) {
      handleUpdateLabor(selectedLabor._id, data);
    } else {
      handleAddLabor(data);
    }
    setIsDialogOpen(false);
  };
  
  // Function to handle edit button click
  const handleEditClick = (labor: ITaskWithId) => {
    setSelectedLabor(labor);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render function for action buttons
  const renderActions = (row: ITaskWithId) => {
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
          onClick={() => handleDeleteLabor(row._id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Labores</h1>
          <p className="text-muted-foreground">
            Gestiona las labores disponibles en el sistema
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedLabor(null);
            setIsEditMode(false);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Labor
        </Button>
      </div>
      
      <Grid 
        data={labores}
        columns={columns}
        gridId="labores"
        title="Labores"
        expandableContent={expandableContent}
        actions={renderActions}
        idField="_id"
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Labor" : "Agregar Nueva Labor"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique los datos de la labor existente"
                : "Complete el formulario para agregar una nueva labor"}
            </DialogDescription>
          </DialogHeader>
          
          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            validationSchema={formValidationSchema}
            defaultValues={selectedLabor || {}}
          />
          
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Labores; 