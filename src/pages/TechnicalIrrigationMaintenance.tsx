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
  Wrench,
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
import { ITechnicalIrrigationMaintenance } from "@eon-lib/eon-mongoose/types";
import technicalIrrigationMaintenanceService from "@/_services/technicalIrrigationMaintenanceService";
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
    id: "barracks",
    header: "Cuartel",
    accessor: "barracks",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "supervisor",
    header: "Supervisor",
    accessor: "supervisor",
    visible: true,
    sortable: true,
    groupable: true,
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
    id: "hallNumber",
    header: "Número de Sala",
    accessor: "hallNumber",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "centerCost",
    header: "Centro de Costos",
    accessor: "centerCost",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "workType",
    header: "Tipo de Trabajo",
    accessor: "workType",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "workDone",
    header: "Trabajo Realizado",
    accessor: "workDone",
    visible: true,
    sortable: true,
    groupable: true,
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
    <h3 className="text-lg font-semibold mb-2">Mantención: {row.barracks}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Supervisor:</strong> {row.supervisor}
        </p>
        <p>
          <strong>Fecha:</strong> {row.date}
        </p>
        <p>
          <strong>Número de Sala:</strong> {row.hallNumber}
        </p>
        <p>
          <strong>Centro de Costos:</strong> {row.centerCost}
        </p>
      </div>
      <div>
        <p>
          <strong>Tipo de Trabajo:</strong> {row.workType}
        </p>
        <p>
          <strong>Trabajo Realizado:</strong> {row.workDone}
        </p>
        <p>
          <strong>Responsable:</strong> {row.responsible}
        </p>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new technical irrigation maintenance
const formSections: SectionConfig[] = [
  {
    id: "maintenance-info",
    title: "Información de Mantención para Riego Tecnificado",
    description: "Ingrese los datos de la mantención",
    fields: [
      {
        id: "barracks",
        type: "text",
        label: "Cuartel",
        name: "barracks",
        placeholder: "Ingrese el cuartel",
        required: true,
        helperText: "Cuartel donde se realizó la mantención"
      },
      {
        id: "supervisor",
        type: "text",
        label: "Supervisor",
        name: "supervisor",
        placeholder: "Ingrese el supervisor",
        required: true,
        helperText: "Nombre del supervisor"
      },
      {
        id: "date",
        type: "text",
        label: "Fecha",
        name: "date",
        placeholder: "YYYY-MM-DD",
        required: true,
        helperText: "Fecha en que se realizó la mantención"
      },
      {
        id: "hallNumber",
        type: "number",
        label: "Número de Sala",
        name: "hallNumber",
        placeholder: "0",
        required: true,
        helperText: "Número de sala donde se realizó la mantención"
      },
      {
        id: "centerCost",
        type: "text",
        label: "Centro de Costos",
        name: "centerCost",
        placeholder: "Ingrese el centro de costos",
        required: true,
        helperText: "Centro de costos asociado"
      },
      {
        id: "workType",
        type: "text",
        label: "Tipo de Trabajo",
        name: "workType",
        placeholder: "Ingrese el tipo de trabajo",
        required: true,
        helperText: "Tipo de trabajo realizado"
      },
      {
        id: "workDone",
        type: "textarea",
        label: "Trabajo Realizado",
        name: "workDone",
        placeholder: "Describa el trabajo realizado",
        required: true,
        helperText: "Descripción detallada del trabajo realizado"
      },
      {
        id: "responsible",
        type: "text",
        label: "Responsable",
        name: "responsible",
        placeholder: "Ingrese el responsable",
        required: true,
        helperText: "Persona responsable de la mantención"
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

const TechnicalIrrigationMaintenance = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [maintenances, setMaintenances] = useState<ITechnicalIrrigationMaintenance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<ITechnicalIrrigationMaintenance | null>(null);
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
  
  // Fetch maintenances on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchMaintenances();
    }
  }, [propertyId]);
  
  // Function to fetch maintenances data
  const fetchMaintenances = async () => {
    setIsLoading(true);
    try {
      const response = await technicalIrrigationMaintenanceService.findAll();
      // Handle the case where the response might be wrapped in a data property
      const data = Array.isArray(response) ? response : 
        (response as any).data || [];
      setMaintenances(data);
    } catch (error) {
      console.error("Error loading technical irrigation maintenances:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new maintenance
  const handleAddMaintenance = async (data: Partial<ITechnicalIrrigationMaintenance>) => {
    try {
      const newMaintenance = await technicalIrrigationMaintenanceService.createTechnicalIrrigationMaintenance(data);
      await fetchMaintenances();
      setIsDialogOpen(false);
      toast({
        title: "Mantención creada",
        description: `La mantención ha sido creada exitosamente.`,
      });
    } catch (error) {
      console.error("Error creating maintenance:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la mantención. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating an existing maintenance
  const handleUpdateMaintenance = async (id: string | number, data: Partial<ITechnicalIrrigationMaintenance>) => {
    try {
      await technicalIrrigationMaintenanceService.updateTechnicalIrrigationMaintenance(id, data);
      await fetchMaintenances();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedMaintenance(null);
      toast({
        title: "Mantención actualizada",
        description: `La mantención ha sido actualizada exitosamente.`,
      });
    } catch (error) {
      console.error("Error updating maintenance:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la mantención. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a maintenance
  const handleDeleteMaintenance = async (id: string | number) => {
    try {
      await technicalIrrigationMaintenanceService.softDeleteTechnicalIrrigationMaintenance(id);
      await fetchMaintenances();
      toast({
        title: "Mantención eliminada",
        description: "La mantención ha sido eliminada exitosamente.",
      });
    } catch (error) {
      console.error("Error deleting maintenance:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la mantención. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle edit button click
  const handleEdit = (maintenance: ITechnicalIrrigationMaintenance) => {
    setSelectedMaintenance(maintenance);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Handle form submission based on mode (create or edit)
  const handleFormSubmit = (data: Partial<ITechnicalIrrigationMaintenance>) => {
    if (isEditMode && selectedMaintenance && selectedMaintenance._id) {
      handleUpdateMaintenance(selectedMaintenance._id, data);
    } else {
      handleAddMaintenance(data);
    }
  };

  // Actions column renderer for the grid
  const actionsRenderer = (row: ITechnicalIrrigationMaintenance) => (
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
          if (window.confirm(`¿Está seguro que desea eliminar esta mantención?`)) {
            handleDeleteMaintenance(row._id as string);
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
          <h1 className="text-2xl font-bold">Mantención para Riego Tecnificado</h1>
          <p className="text-muted-foreground">
            Gestione las mantenciones para riego tecnificado en el sistema
          </p>
        </div>
        <Button 
          onClick={() => {
            setIsEditMode(false);
            setSelectedMaintenance(null);
            setIsDialogOpen(true);
          }}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Mantención
        </Button>
      </div>
      
      <Grid
        gridId="technical-irrigation-maintenance-grid"
        data={maintenances}
        columns={columns}
        idField="_id"
        title="Mantención para Riego Tecnificado"
        expandableContent={expandableContent}
        actions={actionsRenderer}
      />

      {/* Dialog for adding or editing maintenance */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Mantención" : "Agregar Mantención"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Edite los campos de la mantención"
                : "Complete el formulario para agregar una nueva mantención"}
            </DialogDescription>
          </DialogHeader>
          
          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            defaultValues={selectedMaintenance || {}}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechnicalIrrigationMaintenance; 