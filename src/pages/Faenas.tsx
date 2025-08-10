import React, { useState, useEffect, useCallback } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
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
import { ITaskType, WorkType, UsageScope } from "@eon-lib/eon-mongoose";
import faenaService from "@/_services/faenaService";
import propertyService from "@/_services/propertyService";
import { toast } from "@/components/ui/use-toast";

// La interfaz extendida para manejar el _id
interface FaenaWithId {
  _id: string;
  name: string;
  optionalCode?: string;
  workType: WorkType;
  usageScope: UsageScope;
  usesCalibrationPerHa: boolean;
  allowedFarms: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Render function for the workType column
const renderWorkType = (value: WorkType) => {
  const types = {
    'T': 'Labor Agrícola',
    'A': 'Aplicaciones',
    'C': 'Cosecha'
  };
  
  return <span>{types[value] || value}</span>;
};

// Render function for the usageScope column
const renderUsageScope = (value: UsageScope) => {
  const scopes = {
    '0': 'Módulo Web',
    '1': 'Aplicación Móvil',
    '2': 'Ambos',
    '3': 'Desactivado'
  };
  
  return <span>{scopes[value] || value}</span>;
};

// Render function for the boolean fields
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
    id: "name",
    header: "Nombre de Faena",
    accessor: "name",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "optionalCode",
    header: "Código Opcional",
    accessor: "optionalCode",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "workType",
    header: "Tipo Faena",
    accessor: "workType",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderWorkType,
  },
  {
    id: "usageScope",
    header: "Usar en",
    accessor: "usageScope",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderUsageScope,
  },
  {
    id: "usesCalibrationPerHa",
    header: "Utiliza Calibración Ha",
    accessor: "usesCalibrationPerHa",
    visible: true,
    sortable: true,
    render: renderBoolean,
  },
  {
    id: "allowedFarms",
    header: "Predios Permitidos",
    accessor: "allowedFarms",
    visible: true,
    render: (value: string[]) => value ? value.join(", ") : '',
  }
];

// Expandable content for each row
const expandableContent = (row: FaenaWithId) => (
  <div className="p-4">
    <h3 className="text-lg font-semibold mb-2">{row.name}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <p>
          <strong>Código Opcional:</strong> {row.optionalCode || 'N/A'}
        </p>
        <p>
          <strong>Tipo Faena:</strong> {renderWorkType(row.workType)}
        </p>
      </div>
      <div>
        <p>
          <strong>Usar en:</strong> {renderUsageScope(row.usageScope)}
        </p>
        <p>
          <strong>Utiliza Calibración Ha:</strong> {row.usesCalibrationPerHa ? 'Sí' : 'No'}
        </p>
        <p>
          <strong>Predios Permitidos:</strong> {row.allowedFarms && row.allowedFarms.length > 0 ? row.allowedFarms.join(", ") : 'Todos'}
        </p>
      </div>
    </div>
  </div>
);

const Faenas = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [faenas, setFaenas] = useState<FaenaWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFaena, setSelectedFaena] = useState<FaenaWithId | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  
  // Fetch faenas on component mount
  useEffect(() => {
    fetchFaenas();
    fetchProperties();
  }, []);
  
  // Function to fetch properties data
  const fetchProperties = async () => {
    try {
      const data = await propertyService.findAll();
      // Format properties for the selectable grid
      const formattedProperties = data.map((property: any) => ({
        id: property._id,
        propertyName: property.propertyName,
        region: property.region,
        city: property.city
      }));
      setProperties(formattedProperties);
    } catch (error) {
      console.error("Error loading properties:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los predios. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };
  
  // Function to fetch faenas data
  const fetchFaenas = async () => {
    setIsLoading(true);
    try {
      const data = await faenaService.findAll();
      setFaenas(data as FaenaWithId[]);
    } catch (error) {
      console.error("Error loading faenas:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las faenas. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle adding a new faena
  const handleAddFaena = async (data: Partial<ITaskType>) => {
    try {
      await faenaService.createFaena(data);
      
      toast({
        title: "Éxito",
        description: "Faena agregada correctamente.",
      });
      
      // Refresh data
      fetchFaenas();
      // Close dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error al agregar faena:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar la faena. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle updating a faena
  const handleUpdateFaena = async (id: string | number, data: Partial<ITaskType>) => {
    try {
      await faenaService.updateFaena(id, data);
      
      toast({
        title: "Éxito",
        description: "Faena actualizada correctamente.",
      });
      
      // Refresh data
      fetchFaenas();
      // Close dialog
      setIsDialogOpen(false);
      // Reset selected faena
      setSelectedFaena(null);
      // Reset edit mode
      setIsEditMode(false);
    } catch (error) {
      console.error(`Error al actualizar faena ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la faena. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Function to handle deleting a faena
  const handleDeleteFaena = async (id: string | number) => {
    try {
      await faenaService.softDeleteFaena(id);
      
      toast({
        title: "Éxito",
        description: "Faena eliminada correctamente.",
      });
      
      // Refresh data
      fetchFaenas();
    } catch (error) {
      console.error(`Error al eliminar faena ${id}:`, error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la faena. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Form configuration for adding new faena
  const getFormSections = useCallback((): SectionConfig[] => [
    {
      id: "faena-info",
      title: "Información de la Faena",
      description: "Ingrese los datos de la nueva faena",
      fields: [
        {
          id: "name",
          type: "text",
          label: "Nombre de la Faena *",
          name: "name",
          placeholder: "Ingrese nombre de la faena",
          required: true,
          helperText: "Ingrese el nombre identificativo de la faena"
        },
        {
          id: "optionalCode",
          type: "text",
          label: "Código Opcional",
          name: "optionalCode",
          placeholder: "Código de referencia",
          required: false,
          helperText: "Código opcional de referencia interna"
        },
        {
          id: "workType",
          type: "select",
          label: "Tipo Faena *",
          name: "workType",
          required: true,
          options: [
            { value: "T", label: "Labor Agrícola" },
            { value: "A", label: "Aplicaciones" },
            { value: "C", label: "Cosecha" }
          ],
          helperText: "Seleccione el tipo de faena"
        },
        {
          id: "usageScope",
          type: "select",
          label: "Usar en *",
          name: "usageScope",
          required: true,
          options: [
            { value: "0", label: "Módulo Web" },
            { value: "1", label: "Aplicación Móvil" },
            { value: "2", label: "Ambos" },
            { value: "3", label: "Desactivado" }
          ],
          helperText: "Seleccione dónde se usará esta faena"
        },
        {
          id: "usesCalibrationPerHa",
          type: "checkbox",
          label: "Utiliza Calibración Ha",
          name: "usesCalibrationPerHa",
          required: false,
          helperText: "Indica si la faena requiere calibración por hectárea"
        },
        {
          id: "allowedFarms",
          type: "selectableGrid",
          label: "Predios Permitidos",
          name: "allowedFarms",
          required: false,
          helperText: "Seleccione los predios donde está permitida la faena (deje vacío para todos)",
          gridConfig: {
            columns: [
              { id: "propertyName", header: "Nombre Predio", accessor: "propertyName" },
              { id: "region", header: "Región", accessor: "region" },
              { id: "city", header: "Ciudad", accessor: "city" }
            ],
            data: properties,
            idField: "id"
          }
        }
      ],
    }
  ], [properties]);

  // Form validation schema
  const formValidationSchema = z.object({
    name: z.string().min(1, { message: "El nombre de la faena es obligatorio" }),
    optionalCode: z.string().optional(),
    workType: z.string().min(1, { message: "El tipo de faena es obligatorio" }),
    usageScope: z.string().min(1, { message: "El alcance de uso es obligatorio" }),
    usesCalibrationPerHa: z.boolean().default(false),
    allowedFarms: z.array(z.any()).optional().default([])
  });

  // Form submit handler
  const handleFormSubmit = (data: Partial<ITaskType>) => {
    // Extract property IDs from the selected rows
    const processedData = { ...data };
    
    // Check if allowedFarms is an array of objects (from selectableGrid)
    if (Array.isArray(processedData.allowedFarms) && 
        processedData.allowedFarms.length > 0 && 
        typeof processedData.allowedFarms[0] === 'object') {
      // Map to array of property IDs
      processedData.allowedFarms = processedData.allowedFarms.map((farm: any) => farm.id);
    }
    
    if (isEditMode && selectedFaena && selectedFaena._id) {
      handleUpdateFaena(selectedFaena._id, processedData);
    } else {
      handleAddFaena(processedData);
    }
  };

  // Handle edit button click
  const handleEditClick = (faena: FaenaWithId) => {
    setSelectedFaena(faena);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Render action buttons for each row
  const renderActions = (row: FaenaWithId) => {
    return (
      <div className="flex items-center space-x-2">
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
            if (window.confirm(`¿Está seguro de eliminar la faena ${row.name}?`)) {
              handleDeleteFaena(row._id);
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Tipos de Faena</h1>
          <p className="text-muted-foreground">
            Gestione los tipos de faena para su organización
          </p>
        </div>
        <Button
          onClick={() => {
            setIsEditMode(false);
            setSelectedFaena(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Agregar Faena
        </Button>
      </div>

      <Grid
        data={faenas}
        columns={columns}
        expandableContent={expandableContent}
        actions={renderActions}
        gridId="faenas-grid"
        idField="_id"
        title="Faenas"
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Faena" : "Agregar Nueva Faena"}
            </DialogTitle>
            <DialogDescription>
              Complete el formulario para {isEditMode ? "actualizar" : "agregar"} una faena.
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={getFormSections()}
            defaultValues={isEditMode && selectedFaena ? {
              name: selectedFaena.name,
              optionalCode: selectedFaena.optionalCode || "",
              workType: selectedFaena.workType,
              usageScope: selectedFaena.usageScope,
              usesCalibrationPerHa: selectedFaena.usesCalibrationPerHa,
              allowedFarms: properties.filter(p => 
                selectedFaena.allowedFarms && 
                selectedFaena.allowedFarms.includes(p.id)
              )
            } : {
              usesCalibrationPerHa: false,
              allowedFarms: []
            }}
            validationSchema={formValidationSchema}
            onSubmit={handleFormSubmit}
          />
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="dynamic-form">
              {isEditMode ? "Actualizar" : "Agregar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Faenas; 