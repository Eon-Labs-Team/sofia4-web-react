import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  FileText,
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
  FieldType
} from "@/components/DynamicForm/DynamicForm";
import { IFieldWorkApportionment } from "@/types/IFieldWorkApportionment";
import fieldWorkApportionmentService from "@/_services/fieldWorkApportionmentService";
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
    id: "orderNumber",
    header: "Número de Orden",
    accessor: "orderNumber",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "dateExecution",
    header: "Fecha de Ejecución",
    accessor: "dateExecution",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "typeLabor",
    header: "Tipo de Labor",
    accessor: "typeLabor",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "phenologicalState",
    header: "Estado Fenológico",
    accessor: "phenologicalState",
    visible: true,
    sortable: true,
  },
  {
    id: "totalHectare",
    header: "Total Hectáreas",
    accessor: "totalHectare",
    visible: true,
    sortable: true,
  },
  {
    id: "coverage",
    header: "Cobertura",
    accessor: "coverage",
    visible: true,
    sortable: true,
  },
  {
    id: "laborState",
    header: "Estado de Labor",
    accessor: "laborState",
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
    <h3 className="text-lg font-semibold mb-2">{row.orderNumber}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p><strong>Fecha de Ejecución:</strong> {row.dateExecution}</p>
        <p><strong>Tipo de Labor:</strong> {row.typeLabor}</p>
        <p><strong>Estado Fenológico:</strong> {row.phenologicalState}</p>
        <p><strong>Total Hectáreas:</strong> {row.totalHectare}</p>
        <p><strong>Cobertura:</strong> {row.coverage}</p>
      </div>
      <div>
        <p><strong>Objetivo General:</strong> {row.generalObjective}</p>
        <p><strong>Observación:</strong> {row.observation}</p>
        <p><strong>Estado de Labor:</strong> {row.laborState}</p>
        <p><strong>Descargar App Sofia:</strong> {row.toDownLoadSofiaApp ? 'Sí' : 'No'}</p>
        <p><strong>Usuario App Sofia:</strong> {row.userSofiaApp}</p>
      </div>
      <div>
        <p><strong>Temperatura:</strong> {row.temperature}</p>
        <p><strong>Condición Climática:</strong> {row.weatherCondition}</p>
        <p><strong>Condición del Viento:</strong> {row.windCondition}</p>
        <p><strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}</p>
      </div>
    </div>
  </div>
);

// Custom type for array fields
const arrayFieldType = 'selectableGrid' as FieldType;

// Form configuration for adding/editing field work apportionment
const formSections: SectionConfig[] = [
  {
    id: "basic-info",
    title: "Información Básica",
    description: "Datos básicos de la orden de aplicación",
    fields: [
      {
        id: "orderNumber",
        type: "text",
        label: "Número de Orden",
        name: "orderNumber",
        placeholder: "Número de orden",
        required: true,
        helperText: "Ingrese el número de orden"
      },
      {
        id: "dateExecution",
        type: "date",
        label: "Fecha de Ejecución",
        name: "dateExecution",
        required: true,
        helperText: "Fecha en que se ejecutará la orden"
      },
      {
        id: "typeLabor",
        type: "text",
        label: "Tipo de Labor",
        name: "typeLabor",
        placeholder: "Tipo de labor a realizar",
        required: true,
        helperText: "Indique el tipo de labor a realizar"
      },
      {
        id: "phenologicalState",
        type: "text",
        label: "Estado Fenológico",
        name: "phenologicalState",
        placeholder: "Estado fenológico",
        required: true,
        helperText: "Estado fenológico actual"
      },
      {
        id: "totalHectare",
        type: "number",
        label: "Total Hectáreas",
        name: "totalHectare",
        placeholder: "Total de hectáreas",
        required: true,
        helperText: "Superficie total en hectáreas"
      },
      {
        id: "coverage",
        type: "text",
        label: "Cobertura",
        name: "coverage",
        placeholder: "Cobertura",
        required: true,
        helperText: "Indique la cobertura"
      },
    ]
  },
  {
    id: "details",
    title: "Detalles",
    description: "Detalles adicionales de la orden",
    fields: [
      {
        id: "generalObjective",
        type: "textarea",
        label: "Objetivo General",
        name: "generalObjective",
        placeholder: "Objetivo general de la orden",
        required: true,
        helperText: "Describa el objetivo general"
      },
      {
        id: "observation",
        type: "textarea",
        label: "Observación",
        name: "observation",
        placeholder: "Observaciones adicionales",
        required: false,
        helperText: "Agregue observaciones si es necesario"
      },
      {
        id: "laborState",
        type: "text",
        label: "Estado de Labor",
        name: "laborState",
        placeholder: "Estado de la labor",
        required: true,
        helperText: "Indique el estado actual de la labor"
      },
      {
        id: "toDownLoadSofiaApp",
        type: "checkbox",
        label: "Descargar App Sofia",
        name: "toDownLoadSofiaApp",
        required: false,
        helperText: "¿Se debe descargar la aplicación Sofia?"
      },
      {
        id: "userSofiaApp",
        type: "text",
        label: "Usuario App Sofia",
        name: "userSofiaApp",
        placeholder: "Usuario de la app Sofia",
        required: false,
        helperText: "Usuario de la aplicación Sofia"
      },
    ]
  },
  {
    id: "crop-info",
    title: "Información de Cultivo",
    description: "Datos relacionados con el cultivo",
    fields: [
      {
        id: "crop",
        type: arrayFieldType,
        label: "Cultivo(s)",
        name: "crop",
        placeholder: "Cultivos",
        required: true,
        helperText: "Agregue los cultivos relacionados"
      },
      {
        id: "variety",
        type: arrayFieldType,
        label: "Variedad(es)",
        name: "variety",
        placeholder: "Variedades",
        required: true,
        helperText: "Agregue las variedades relacionadas"
      },
      {
        id: "classification",
        type: arrayFieldType,
        label: "Clasificación(es)",
        name: "classification",
        placeholder: "Clasificaciones",
        required: true,
        helperText: "Agregue las clasificaciones relacionadas"
      },
      {
        id: "barracksPaddock",
        type: arrayFieldType,
        label: "Cuartel(es)",
        name: "barracksPaddock",
        placeholder: "Cuarteles",
        required: true,
        helperText: "Agregue los cuarteles relacionados"
      },
    ]
  },
  {
    id: "conditions",
    title: "Condiciones",
    description: "Condiciones ambientales y técnicas",
    fields: [
      {
        id: "temperature",
        type: "number",
        label: "Temperatura",
        name: "temperature",
        placeholder: "Temperatura en °C",
        required: true,
        helperText: "Temperatura en grados Celsius"
      },
      {
        id: "weatherCondition",
        type: "text",
        label: "Condición Climática",
        name: "weatherCondition",
        placeholder: "Condición climática",
        required: true,
        helperText: "Describa la condición climática"
      },
      {
        id: "windCondition",
        type: "text",
        label: "Condición del Viento",
        name: "windCondition",
        placeholder: "Condición del viento",
        required: true,
        helperText: "Describa la condición del viento"
      },
      {
        id: "endLackDate",
        type: "date",
        label: "Fecha Final de Carencia",
        name: "endLackDate",
        required: false,
        helperText: "Fecha final de carencia"
      },
      {
        id: "reEntryDate",
        type: "date",
        label: "Fecha de Reingreso",
        name: "reEntryDate",
        required: false,
        helperText: "Fecha de reingreso"
      },
      {
        id: "reEntryHour",
        type: "text",
        label: "Hora de Reingreso",
        name: "reEntryHour",
        placeholder: "HH:MM",
        required: false,
        helperText: "Hora de reingreso (formato HH:MM)"
      },
    ]
  },
  {
    id: "labor-info",
    title: "Información de Labor",
    description: "Detalles técnicos de la labor",
    fields: [
      {
        id: "laborOrJob",
        type: "text",
        label: "Labor o Trabajo",
        name: "laborOrJob",
        placeholder: "Labor o trabajo a realizar",
        required: true,
        helperText: "Describa la labor o trabajo a realizar"
      },
      {
        id: "work",
        type: "text",
        label: "Trabajo",
        name: "work",
        placeholder: "Trabajo específico",
        required: true,
        helperText: "Detalle el trabajo específico"
      },
      {
        id: "typeWork",
        type: "text",
        label: "Tipo de Trabajo",
        name: "typeWork",
        placeholder: "Tipo de trabajo",
        required: true,
        helperText: "Indique el tipo de trabajo"
      },
      {
        id: "calibrationHa",
        type: "number",
        label: "Calibración por Hectárea",
        name: "calibrationHa",
        placeholder: "Calibración por Ha",
        required: false,
        helperText: "Calibración por hectárea"
      },
      {
        id: "optimalPerformance",
        type: "number",
        label: "Rendimiento Óptimo",
        name: "optimalPerformance",
        placeholder: "Rendimiento óptimo",
        required: false,
        helperText: "Rendimiento óptimo esperado"
      },
      {
        id: "initialBonusWorker",
        type: "number",
        label: "Bonificación Inicial",
        name: "initialBonusWorker",
        placeholder: "Bonificación inicial",
        required: false,
        helperText: "Bonificación inicial para el trabajador"
      },
    ]
  },
  {
    id: "payment-info",
    title: "Información de Pago",
    description: "Detalles relacionados con el pago",
    fields: [
      {
        id: "formPaymentToWorker",
        type: "text",
        label: "Forma de Pago al Trabajador",
        name: "formPaymentToWorker",
        placeholder: "Forma de pago",
        required: false,
        helperText: "Indique la forma de pago al trabajador"
      },
      {
        id: "paymentType",
        type: "text",
        label: "Tipo de Pago",
        name: "paymentType",
        placeholder: "Tipo de pago",
        required: false,
        helperText: "Indique el tipo de pago"
      },
      {
        id: "range",
        type: "number",
        label: "Rango 1",
        name: "range",
        placeholder: "Rango 1",
        required: false,
        helperText: "Primer rango de pago"
      },
      {
        id: "priceLabor",
        type: "number",
        label: "Precio Labor 1",
        name: "priceLabor",
        placeholder: "Precio labor 1",
        required: false,
        helperText: "Precio de la labor para el primer rango"
      },
      {
        id: "secondRange",
        type: "number",
        label: "Rango 2",
        name: "secondRange",
        placeholder: "Rango 2",
        required: false,
        helperText: "Segundo rango de pago"
      },
      {
        id: "secondPriceLabor",
        type: "number",
        label: "Precio Labor 2",
        name: "secondPriceLabor",
        placeholder: "Precio labor 2",
        required: false,
        helperText: "Precio de la labor para el segundo rango"
      },
      {
        id: "thirdRange",
        type: "number",
        label: "Rango 3",
        name: "thirdRange",
        placeholder: "Rango 3",
        required: false,
        helperText: "Tercer rango de pago"
      },
      {
        id: "thirdPriceLabor",
        type: "number",
        label: "Precio Labor 3",
        name: "thirdPriceLabor",
        placeholder: "Precio labor 3",
        required: false,
        helperText: "Precio de la labor para el tercer rango"
      },
      {
        id: "fourthRange",
        type: "number",
        label: "Rango 4",
        name: "fourthRange",
        placeholder: "Rango 4",
        required: false,
        helperText: "Cuarto rango de pago"
      },
      {
        id: "fourthPriceLabor",
        type: "number",
        label: "Precio Labor 4",
        name: "fourthPriceLabor",
        placeholder: "Precio labor 4",
        required: false,
        helperText: "Precio de la labor para el cuarto rango"
      },
      {
        id: "fifthRange",
        type: "number",
        label: "Rango 5",
        name: "fifthRange",
        placeholder: "Rango 5",
        required: false,
        helperText: "Quinto rango de pago"
      },
      {
        id: "fifthPriceLabor",
        type: "number",
        label: "Precio Labor 5",
        name: "fifthPriceLabor",
        placeholder: "Precio labor 5",
        required: false,
        helperText: "Precio de la labor para el quinto rango"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si la orden está activa"
      },
    ]
  }
];

const FieldWorkApportionment = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [fieldWorkApportionments, setFieldWorkApportionments] = useState<IFieldWorkApportionment[]>([]);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingFieldWorkApportionment, setEditingFieldWorkApportionment] = useState<IFieldWorkApportionment | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedFieldWorkApportionmentId, setSelectedFieldWorkApportionmentId] = useState<string | number | null>(null);

  // Fetch all field work apportionments when component mounts
  useEffect(() => {
    fetchFieldWorkApportionments();
  }, []);

  // Fetch all field work apportionments from API
  const fetchFieldWorkApportionments = async () => {
    setIsLoading(true);
    try {
      const response = await fieldWorkApportionmentService.findAll();

      const data = Array.isArray(response) ? response : 
      (response as any).data || [];
      setFieldWorkApportionments(data);
    } catch (error) {
      console.error("Failed to fetch field work apportionments:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las órdenes de aplicación.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission for adding a new field work apportionment
  const handleAddFieldWorkApportionment = async (data: Partial<IFieldWorkApportionment>) => {
    try {
      await fieldWorkApportionmentService.createFieldWorkApportionment(data);
      
      toast({
        title: "Éxito",
        description: "Orden de aplicación creada correctamente.",
      });
      
      // Refresh the data
      fetchFieldWorkApportionments();
      
      // Close the dialog
      setIsFormDialogOpen(false);
    } catch (error) {
      console.error("Failed to create field work apportionment:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la orden de aplicación.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission for updating an existing field work apportionment
  const handleUpdateFieldWorkApportionment = async (id: string | number, data: Partial<IFieldWorkApportionment>) => {
    try {
      // If we're updating, remove the ID field as it shouldn't be updated
      if (data._id) {
        delete data._id;
      }
      
      await fieldWorkApportionmentService.updateFieldWorkApportionment(id, data);
      
      toast({
        title: "Éxito",
        description: "Orden de aplicación actualizada correctamente.",
      });
      
      // Refresh the data
      fetchFieldWorkApportionments();
      
      // Close the dialog
      setIsFormDialogOpen(false);
      setEditingFieldWorkApportionment(null);
    } catch (error) {
      console.error(`Failed to update field work apportionment ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la orden de aplicación.",
        variant: "destructive",
      });
    }
  };

  // Handle deletion of a field work apportionment
  const handleDeleteFieldWorkApportionment = async (id: string | number) => {
    try {
      await fieldWorkApportionmentService.softDeleteFieldWorkApportionment(id);
      
      toast({
        title: "Éxito",
        description: "Orden de aplicación eliminada correctamente.",
      });
      
      // Refresh the data
      fetchFieldWorkApportionments();
      
      // Close confirmation dialog
      setIsConfirmDialogOpen(false);
      setSelectedFieldWorkApportionmentId(null);
    } catch (error) {
      console.error(`Failed to delete field work apportionment ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la orden de aplicación.",
        variant: "destructive",
      });
    }
  };

  // Handle form submission - either add or update
  const handleFormSubmit = (data: Partial<IFieldWorkApportionment>) => {
    if (editingFieldWorkApportionment) {
      handleUpdateFieldWorkApportionment(editingFieldWorkApportionment._id, data);
    } else {
      handleAddFieldWorkApportionment(data);
    }
  };

  // Set up editing mode
  const handleEditClick = (fieldWorkApportionment: IFieldWorkApportionment) => {
    setEditingFieldWorkApportionment(fieldWorkApportionment);
    setIsFormDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: IFieldWorkApportionment) => {
    return (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleEditClick(row)}
          aria-label="Editar"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setSelectedFieldWorkApportionmentId(row._id);
            setIsConfirmDialogOpen(true);
          }}
          aria-label="Eliminar"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Órdenes de Aplicación</h1>
        <Button
          onClick={() => {
            setEditingFieldWorkApportionment(null);
            setIsFormDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Orden
        </Button>
      </div>

      {/* Grid component */}
      <Grid
        data={fieldWorkApportionments}
        columns={columns}
        gridId="fieldWorkApportionments"
        actions={renderActions}
        expandableContent={expandableContent}
      />

      {/* Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFieldWorkApportionment
                ? "Editar Orden de Aplicación"
                : "Agregar Nueva Orden de Aplicación"}
            </DialogTitle>
            <DialogDescription>
              Complete los campos para {editingFieldWorkApportionment ? "actualizar" : "crear"} la orden de aplicación.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            defaultValues={editingFieldWorkApportionment || {}}
          />

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsFormDialogOpen(false);
                setEditingFieldWorkApportionment(null);
              }}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar esta orden de aplicación? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmDialogOpen(false);
                setSelectedFieldWorkApportionmentId(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedFieldWorkApportionmentId !== null) {
                  handleDeleteFieldWorkApportionment(selectedFieldWorkApportionmentId);
                }
              }}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FieldWorkApportionment; 