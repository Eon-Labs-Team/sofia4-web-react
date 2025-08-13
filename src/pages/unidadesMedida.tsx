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
  Ruler,
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
import { IMeasurementUnits } from "@eon-lib/eon-mongoose";
import { z } from "zod";
import measurementUnitsService from "@/_services/measurementUnitsService";
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
    id: "type",
    header: "Tipo",
    accessor: "type",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "optionalCode",
    header: "Código opcional",
    accessor: "optionalCode",
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
    <h3 className="text-lg font-semibold mb-2">{row.type}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Tipo:</strong> {row.type}
        </p>
        <p>
          <strong>Código opcional:</strong> {row.optionalCode || 'No especificado'}
        </p>
      </div>
      <div>
        <p>
          <strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}
        </p>
      </div>
    </div>
  </div>
);

// Form configuration for adding new measurement unit
const formSections: SectionConfig[] = [
  {
    id: "measurement-unit-info",
    title: "Información de la Unidad de Medida",
    description: "Ingrese los datos de la nueva unidad de medida",
    fields: [
      {
        id: "type",
        type: "text",
        label: "Tipo de Unidad",
        name: "type",
        placeholder: "Ej: Kilogramo, Litro, Metro",
        required: true,
        helperText: "Ingrese el tipo de unidad de medida"
      },
      {
        id: "optionalCode",
        type: "text",
        label: "Código opcional",
        name: "optionalCode",
        placeholder: "Ej: kg, l, m",
        required: false,
        helperText: "Ingrese un código opcional para esta unidad (si aplica)"
      },
      {
        id: "state",
        type: "checkbox",
        label: "Activo",
        name: "state",
        required: true,
        helperText: "Indica si la unidad está actualmente en uso"
      },
    ],
  }
];

// Form validation schema
const formValidationSchema = z.object({
  type: z.string().min(1, { message: "El tipo de unidad es obligatorio" }),
  optionalCode: z.string().optional(),
  state: z.boolean().default(true)
});

const UnidadesMedida = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [measurementUnits, setMeasurementUnits] = useState<IMeasurementUnits[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<IMeasurementUnits | null>(null);
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
  
  // Fetch measurement units on component mount and when propertyId changes
  useEffect(() => {
    if (propertyId) {
      fetchMeasurementUnits();
    }
  }, [propertyId]);
  
  // Function to fetch measurement units data
  const fetchMeasurementUnits = async () => {
    setIsLoading(true);
    try {
      const response = await measurementUnitsService.findAll();
      // Handle both array and object response formats
      let units: IMeasurementUnits[] = [];
      
      if (Array.isArray(response)) {
        units = response;
      } else {
        // Use type assertion to handle possible API response format
        const apiResponse = response as { data?: IMeasurementUnits[] };
        if (apiResponse && apiResponse.data && Array.isArray(apiResponse.data)) {
          units = apiResponse.data;
        }
      }
      
      setMeasurementUnits(units);
    } catch (error) {
      console.error("Error loading measurement units:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las unidades de medida",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new measurement unit
  const handleAddMeasurementUnit = async (data: Partial<IMeasurementUnits>) => {
    try {
      const unitData: Partial<IMeasurementUnits> = {
        type: data.type,
        optionalCode: data.optionalCode || '',
        state: data.state !== undefined ? data.state : true
      };
      
      await measurementUnitsService.createMeasurementUnit(unitData);
      
      toast({
        title: "Éxito",
        description: "Unidad de medida creada correctamente",
      });
      
      // Refresh the data
      await fetchMeasurementUnits();
      
      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating measurement unit:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la unidad de medida",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle updating a measurement unit
  const handleUpdateMeasurementUnit = async (id: string | number, data: Partial<IMeasurementUnits>) => {
    try {
      await measurementUnitsService.updateMeasurementUnit(id, data);
      
      toast({
        title: "Éxito",
        description: "Unidad de medida actualizada correctamente",
      });
      
      // Refresh the data
      await fetchMeasurementUnits();
      
      // Reset form and close dialog
      setSelectedUnit(null);
      setIsEditMode(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error(`Error updating measurement unit ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la unidad de medida",
        variant: "destructive",
      });
    }
  };
  
  // Function to handle deleting a measurement unit
  const handleDeleteMeasurementUnit = async (id: string | number) => {
    if (window.confirm("¿Está seguro que desea desactivar esta unidad de medida?")) {
      try {
        await measurementUnitsService.softDeleteMeasurementUnit(id);
        
        toast({
          title: "Éxito",
          description: "Unidad de medida desactivada correctamente",
        });
        
        // Refresh the data
        await fetchMeasurementUnits();
      } catch (error) {
        console.error(`Error disabling measurement unit ${id}:`, error);
        toast({
          title: "Error",
          description: "No se pudo desactivar la unidad de medida",
          variant: "destructive",
        });
      }
    }
  };
  
  // Function to handle form submission
  const handleFormSubmit = (data: Partial<IMeasurementUnits>) => {
    if (isEditMode && selectedUnit) {
      handleUpdateMeasurementUnit(selectedUnit._id, data);
    } else {
      handleAddMeasurementUnit(data);
    }
  };
  
  // Function to handle edit button click
  const handleEditClick = (unit: IMeasurementUnits) => {
    setSelectedUnit(unit);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };
  
  // Render action buttons for each row
  const renderActions = (row: IMeasurementUnits) => {
    return (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleEditClick(row)}
          className="h-8 w-8"
          title="Editar unidad"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteMeasurementUnit(row._id)}
          className="h-8 w-8 text-destructive"
          title="Eliminar unidad"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Unidades de Medida</h1>
        <Button
          onClick={() => {
            setSelectedUnit(null);
            setIsEditMode(false);
            setIsDialogOpen(true);
          }}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span>Agregar Unidad</span>
        </Button>
      </div>

      <Grid 
        columns={columns}
        data={measurementUnits}
        gridId="measurement-units-grid"
        expandableContent={expandableContent}
        actions={renderActions}
        title="Unidades de Medida"
      />

      {/* Dialog for adding/editing measurement units */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Unidad de Medida" : "Agregar Unidad de Medida"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Modifique los datos de la unidad de medida"
                : "Complete el formulario para agregar una nueva unidad de medida"}
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            validationSchema={formValidationSchema}
            defaultValues={isEditMode && selectedUnit ? selectedUnit : {}}
          />
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="dynamic-form">
              {isEditMode ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UnidadesMedida; 