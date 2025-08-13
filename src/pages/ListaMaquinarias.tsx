import { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  Wrench,
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
import { IMachineryList } from "@eon-lib/eon-mongoose";
import listaMaquinariasService from "@/_services/listaMaquinariasService";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/store/authStore";

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
    id: "equipment",
    header: "Equipo",
    accessor: "equipment",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "classifyZone",
    header: "Zona de Clasificación",
    accessor: "classifyZone",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "machineryCode",
    header: "Código de Maquinaria",
    accessor: "machineryCode",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "licensePlate",
    header: "Patente",
    accessor: "licensePlate",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "machineType",
    header: "Tipo de Máquina",
    accessor: "machineType",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "brand",
    header: "Marca",
    accessor: "brand",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "machineryModel",
    header: "Modelo",
    accessor: "machineryModel",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "madeYear",
    header: "Año de Fabricación",
    accessor: "madeYear",
    visible: true,
    sortable: true,
  },
  {
    id: "machineryState",
    header: "Estado de Maquinaria",
    accessor: "machineryState",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderBoolean,
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
    <h3 className="text-lg font-semibold mb-4">{row.equipment}</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="space-y-2">
        <h4 className="font-medium">Información General</h4>
        <p><strong>Equipo:</strong> {row.equipment}</p>
        <p><strong>Zona:</strong> {row.classifyZone}</p>
        <p><strong>Código:</strong> {row.machineryCode}</p>
        <p><strong>Código Anterior:</strong> {row.oldMachineryCode}</p>
        <p><strong>Patente:</strong> {row.licensePlate}</p>
        <p><strong>Tipo:</strong> {row.machineType}</p>
        <p><strong>Marca:</strong> {row.brand}</p>
        <p><strong>Modelo:</strong> {row.machineryModel}</p>
        <p><strong>Año:</strong> {row.madeYear}</p>
        <p><strong>Precio/Hora:</strong> {row.priceHour}</p>
        <p><strong>A Cargo:</strong> {row.onCharge}</p>
        <p><strong>Estado Maquinaria:</strong> {row.machineryState ? "Activo" : "Inactivo"}</p>
        <p><strong>Objetivo:</strong> {row.objective}</p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Especificaciones Técnicas</h4>
        <p><strong>Capacidad (Litros):</strong> {row.litersCapacity}</p>
        <p><strong>Mejora L/Ha:</strong> {row.improvementLiterHa}</p>
        <p><strong>Presión (Bar):</strong> {row.pressureBar}</p>
        <p><strong>Revolución:</strong> {row.revolution}</p>
        <p><strong>Cambio:</strong> {row.change}</p>
        <p><strong>Km/Hora:</strong> {row.kmByHour}</p>
        
        <h4 className="font-medium mt-4">Registros</h4>
        <p><strong>Registro Limpieza:</strong> {row.cleaningRecord ? "Sí" : "No"}</p>
        <p><strong>Temperatura:</strong> {row.temperature ? "Sí" : "No"}</p>
        <p><strong>Registro Mantención:</strong> {row.maintenanceRecord ? "Sí" : "No"}</p>
        <p><strong>Equipo Temperatura:</strong> {row.temperatureEquipment ? "Sí" : "No"}</p>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium">Información Comercial</h4>
        <p><strong>Clasificar Costo:</strong> {row.classifyCost}</p>
        <p><strong>Sub-clasificar Costo:</strong> {row.subClassifyCost}</p>
        <p><strong>Factura/Guía:</strong> {row.invoicePurchaseGuide}</p>
        <p><strong>Fecha Compra:</strong> {row.purchaseDate}</p>
        <p><strong>Proveedor:</strong> {row.supplier}</p>
        
        <h4 className="font-medium mt-4">GPS y Otros</h4>
        <p><strong>Código GPS:</strong> {row.gpsCode}</p>
        <p><strong>Proveedor GPS:</strong> {row.gpsSupplier}</p>
        <p><strong>Fecha Préstamos:</strong> {row.loansDate}</p>
        <p><strong>Observación Préstamos:</strong> {row.loansObservation}</p>
        <p><strong>Observación:</strong> {row.observation}</p>
      </div>
    </div>
  </div>
);

// Form validation schema - matches exactly the model requirements
const formValidationSchema = z.object({
  equipment: z.string().min(1, { message: "El equipo es obligatorio" }),
  classifyZone: z.string().min(1, { message: "La zona de clasificación es obligatoria" }),
  machineryCode: z.string().min(1, { message: "El código de maquinaria es obligatorio" }),
  oldMachineryCode: z.string().optional(),
  licensePlate: z.string().min(1, { message: "La patente es obligatoria" }),
  machineType: z.string().min(1, { message: "El tipo de máquina es obligatorio" }),
  brand: z.string().min(1, { message: "La marca es obligatoria" }),
  machineryModel: z.string().min(1, { message: "El modelo es obligatorio" }),
  madeYear: z.string().min(1, { message: "El año de fabricación es obligatorio" }),
  priceHour: z.string().min(1, { message: "El precio por hora es obligatorio" }),
  onCharge: z.string().min(1, { message: "El responsable es obligatorio" }),
  machineryState: z.boolean().default(true),
  objective: z.string().min(1, { message: "El objetivo es obligatorio" }),
  litersCapacity: z.number().positive({ message: "La capacidad debe ser positiva" }),
  improvementLiterHa: z.number().positive({ message: "La mejora L/Ha debe ser positiva" }),
  pressureBar: z.number().positive({ message: "La presión debe ser positiva" }),
  revolution: z.string().optional(),
  change: z.string().optional(),
  kmByHour: z.number().positive({ message: "Los Km/Hora deben ser positivos" }),
  cleaningRecord: z.boolean().default(false),
  temperature: z.boolean().default(false),
  maintenanceRecord: z.boolean().default(false),
  temperatureEquipment: z.boolean().default(false),
  classifyCost: z.string().optional(),
  subClassifyCost: z.string().optional(),
  invoicePurchaseGuide: z.string().optional(),
  purchaseDate: z.string().optional(),
  supplier: z.string().optional(),
  observation: z.string().optional(),
  gpsCode: z.string().optional(),
  gpsSupplier: z.string().optional(),
  propertyLoans: z.array(z.string()).default([]),
  loansDate: z.string().optional(),
  loansObservation: z.string().optional(),
  image: z.string().optional(),
  state: z.boolean().default(true)
});

// Form configuration for adding new ListaMaquinarias
const formSections: SectionConfig[] = [
  {
    id: "general-info",
    title: "Información General",
    description: "Ingrese los datos generales de la maquinaria",
    fields: [
      {
        id: "equipment",
        type: "text",
        label: "Equipo",
        name: "equipment",
        placeholder: "Ingrese el nombre del equipo",
        required: true,
        helperText: "Nombre del equipo o maquinaria"
      },
      {
        id: "classifyZone",
        type: "text",
        label: "Zona de Clasificación",
        name: "classifyZone",
        placeholder: "Ingrese la zona de clasificación",
        required: true,
        helperText: "Zona donde se clasifica la maquinaria"
      },
      {
        id: "machineryCode",
        type: "text",
        label: "Código de Maquinaria",
        name: "machineryCode",
        placeholder: "Ingrese el código",
        required: true,
        helperText: "Código identificativo de la maquinaria"
      },
      {
        id: "oldMachineryCode",
        type: "text",
        label: "Código Anterior",
        name: "oldMachineryCode",
        placeholder: "Código anterior (opcional)",
        required: false,
        helperText: "Código anterior si existiera"
      },
      {
        id: "licensePlate",
        type: "text",
        label: "Patente",
        name: "licensePlate",
        placeholder: "Ingrese la patente",
        required: true,
        helperText: "Patente del vehículo/maquinaria"
      },
      {
        id: "machineType",
        type: "text",
        label: "Tipo de Máquina",
        name: "machineType",
        placeholder: "Ingrese el tipo",
        required: true,
        helperText: "Tipo de máquina"
      },
      {
        id: "brand",
        type: "text",
        label: "Marca",
        name: "brand",
        placeholder: "Ingrese la marca",
        required: true,
        helperText: "Marca del fabricante"
      },
      {
        id: "machineryModel",
        type: "text",
        label: "Modelo",
        name: "machineryModel",
        placeholder: "Ingrese el modelo",
        required: true,
        helperText: "Modelo específico"
      },
      {
        id: "madeYear",
        type: "text",
        label: "Año de Fabricación",
        name: "madeYear",
        placeholder: "2024",
        required: true,
        helperText: "Año en que fue fabricada"
      },
      {
        id: "priceHour",
        type: "text",
        label: "Precio por Hora",
        name: "priceHour",
        placeholder: "0",
        required: true,
        helperText: "Costo por hora de uso"
      },
      {
        id: "onCharge",
        type: "text",
        label: "Responsable/A Cargo",
        name: "onCharge",
        placeholder: "Nombre del responsable",
        required: true,
        helperText: "Persona a cargo de la maquinaria"
      },
      {
        id: "machineryState",
        type: "checkbox",
        label: "Estado Activo",
        name: "machineryState",
        required: true,
        helperText: "Indica si la maquinaria está en estado activo"
      },
      {
        id: "objective",
        type: "text",
        label: "Objetivo",
        name: "objective",
        placeholder: "Descripción del objetivo",
        required: true,
        helperText: "Objetivo o propósito de la maquinaria"
      }
    ]
  },
  {
    id: "technical-specs",
    title: "Especificaciones Técnicas",
    description: "Ingrese las especificaciones técnicas",
    fields: [
      {
        id: "litersCapacity",
        type: "number",
        label: "Capacidad (Litros)",
        name: "litersCapacity",
        placeholder: "0",
        required: true,
        helperText: "Capacidad en litros"
      },
      {
        id: "improvementLiterHa",
        type: "number",
        label: "Mejora Litros/Ha",
        name: "improvementLiterHa",
        placeholder: "0",
        required: true,
        helperText: "Mejora en litros por hectárea"
      },
      {
        id: "pressureBar",
        type: "number",
        label: "Presión (Bar)",
        name: "pressureBar",
        placeholder: "0",
        required: true,
        helperText: "Presión en bares"
      },
      {
        id: "revolution",
        type: "text",
        label: "Revolución",
        name: "revolution",
        placeholder: "RPM",
        required: false,
        helperText: "Revoluciones por minuto"
      },
      {
        id: "change",
        type: "text",
        label: "Cambio",
        name: "change",
        placeholder: "Tipo de cambio",
        required: false,
        helperText: "Tipo de cambio o transmisión"
      },
      {
        id: "kmByHour",
        type: "number",
        label: "Km por Hora",
        name: "kmByHour",
        placeholder: "0",
        required: true,
        helperText: "Velocidad máxima en km/h"
      }
    ]
  },
  {
    id: "records",
    title: "Registros y Control",
    description: "Configure los registros y controles",
    fields: [
      {
        id: "cleaningRecord",
        type: "checkbox",
        label: "Registro de Limpieza",
        name: "cleaningRecord",
        required: false,
        helperText: "Lleva registro de limpieza"
      },
      {
        id: "temperature",
        type: "checkbox",
        label: "Control de Temperatura",
        name: "temperature",
        required: false,
        helperText: "Tiene control de temperatura"
      },
      {
        id: "maintenanceRecord",
        type: "checkbox",
        label: "Registro de Mantención",
        name: "maintenanceRecord",
        required: false,
        helperText: "Lleva registro de mantención"
      },
      {
        id: "temperatureEquipment",
        type: "checkbox",
        label: "Equipo de Temperatura",
        name: "temperatureEquipment",
        required: false,
        helperText: "Cuenta con equipo de temperatura"
      }
    ]
  },
  {
    id: "commercial-info",
    title: "Información Comercial",
    description: "Datos de compra y costos",
    fields: [
      {
        id: "classifyCost",
        type: "text",
        label: "Clasificar Costo",
        name: "classifyCost",
        placeholder: "Clasificación de costo",
        required: false,
        helperText: "Clasificación del costo"
      },
      {
        id: "subClassifyCost",
        type: "text",
        label: "Sub-clasificar Costo",
        name: "subClassifyCost",
        placeholder: "Sub-clasificación",
        required: false,
        helperText: "Sub-clasificación del costo"
      },
      {
        id: "invoicePurchaseGuide",
        type: "text",
        label: "Factura/Guía de Compra",
        name: "invoicePurchaseGuide",
        placeholder: "Número de factura",
        required: false,
        helperText: "Factura o guía de compra"
      },
      {
        id: "purchaseDate",
        type: "text",
        label: "Fecha de Compra",
        name: "purchaseDate",
        placeholder: "YYYY-MM-DD",
        required: false,
        helperText: "Fecha en que fue comprada"
      },
      {
        id: "supplier",
        type: "text",
        label: "Proveedor",
        name: "supplier",
        placeholder: "Nombre del proveedor",
        required: false,
        helperText: "Proveedor que vendió la maquinaria"
      }
    ]
  },
  {
    id: "additional-info",
    title: "Información Adicional",
    description: "GPS, préstamos y observaciones",
    fields: [
      {
        id: "gpsCode",
        type: "text",
        label: "Código GPS",
        name: "gpsCode",
        placeholder: "Código del GPS",
        required: false,
        helperText: "Código del sistema GPS"
      },
      {
        id: "gpsSupplier",
        type: "text",
        label: "Proveedor GPS",
        name: "gpsSupplier",
        placeholder: "Proveedor del GPS",
        required: false,
        helperText: "Proveedor del sistema GPS"
      },
      {
        id: "loansDate",
        type: "text",
        label: "Fecha de Préstamos",
        name: "loansDate",
        placeholder: "YYYY-MM-DD",
        required: false,
        helperText: "Fecha de préstamos"
      },
      {
        id: "loansObservation",
        type: "text",
        label: "Observación Préstamos",
        name: "loansObservation",
        placeholder: "Observaciones",
        required: false,
        helperText: "Observaciones sobre préstamos"
      },
      {
        id: "observation",
        type: "text",
        label: "Observación General",
        name: "observation",
        placeholder: "Observaciones generales",
        required: false,
        helperText: "Observaciones generales"
      },
      {
        id: "image",
        type: "text",
        label: "Imagen",
        name: "image",
        placeholder: "URL de la imagen",
        required: false,
        helperText: "URL de imagen de la maquinaria"
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

const ListaMaquinarias = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [listaMaquinarias, setListaMaquinarias] = useState<IMachineryList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMaquinaria, setSelectedMaquinaria] = useState<IMachineryList | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Get propertyId from auth store
  const { propertyId } = useAuthStore();
  
  // Fetch lista maquinarias on component mount and when propertyId changes
  useEffect(() => {
    console.log('🔄 ListaMaquinarias useEffect triggered - propertyId:', propertyId);
    if (propertyId) {
      fetchListaMaquinarias();
    } else {
      console.log('⚠️ No propertyId available, skipping fetch');
      setListaMaquinarias([]);
    }
  }, [propertyId]);
  
  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('📊 listaMaquinarias state updated:', {
      length: listaMaquinarias.length,
      data: listaMaquinarias,
      isArray: Array.isArray(listaMaquinarias)
    });
  }, [listaMaquinarias]);
  
  // Function to fetch lista maquinarias data
  const fetchListaMaquinarias = async () => {
    if (!propertyId) {
      console.log('❌ Cannot fetch maquinarias: no propertyId');
      toast({
        title: "Error",
        description: "No hay una propiedad seleccionada",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    console.log('🚀 Starting fetchListaMaquinarias with propertyId:', propertyId);
    
    try {
      const rawData = await listaMaquinariasService.findAll();
      console.log('📥 Raw data received from service:', rawData);
      
      // Handle potential double-wrapped data
      let processedData: IMachineryList[];
      
      if (Array.isArray(rawData)) {
        processedData = rawData;
        console.log('✅ Data is already an array');
      } else if (rawData && typeof rawData === 'object' && 'data' in rawData && Array.isArray((rawData as any).data)) {
        processedData = (rawData as any).data;
        console.log('✅ Extracted data from .data property');
      } else if (rawData && typeof rawData === 'object' && 'data' in rawData && (rawData as any).data && typeof (rawData as any).data === 'object' && 'data' in (rawData as any).data && Array.isArray((rawData as any).data.data)) {
        processedData = (rawData as any).data.data;
        console.log('✅ Extracted data from nested .data.data property');
      } else {
        console.error('❌ Unexpected data structure:', rawData);
        processedData = [];
      }
      
      console.log('🔍 Processed data:', {
        length: processedData.length,
        sample: processedData.slice(0, 2),
        isArray: Array.isArray(processedData)
      });
      
      setListaMaquinarias(processedData);
      
      if (processedData.length === 0) {
        console.log('ℹ️ No maquinarias found for this property');
        toast({
          title: "Sin datos",
          description: "No se encontraron maquinarias para esta propiedad",
        });
      } else {
        console.log(`✅ Successfully loaded ${processedData.length} maquinarias`);
      }
      
    } catch (error) {
      console.error("💥 Error loading lista maquinarias:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Por favor intente nuevamente.",
        variant: "destructive",
      });
      setListaMaquinarias([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding new maquinaria
  const handleAddListaMaquinarias = async (data: Partial<IMachineryList>) => {
    try {
      console.log('📝 Adding new maquinaria:', data);
      await listaMaquinariasService.createMachineryList(data);
      
      toast({
        title: "Éxito",
        description: "Maquinaria creada correctamente",
      });
      
      setIsDialogOpen(false);
      fetchListaMaquinarias(); // Refresh the list
    } catch (error) {
      console.error('💥 Error adding maquinaria:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la maquinaria. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Handle updating existing maquinaria
  const handleUpdateListaMaquinarias = async (id: string | number, data: Partial<IMachineryList>) => {
    try {
      console.log('📝 Updating maquinaria:', id, data);
      await listaMaquinariasService.updateMachineryList(id, data);
      
      toast({
        title: "Éxito",
        description: "Maquinaria actualizada correctamente",
      });
      
      setIsDialogOpen(false);
      setSelectedMaquinaria(null);
      setIsEditMode(false);
      fetchListaMaquinarias(); // Refresh the list
    } catch (error) {
      console.error('💥 Error updating maquinaria:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la maquinaria. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Handle deleting maquinaria (soft delete)
  const handleDeleteListaMaquinarias = async (id: string | number) => {
    try {
      console.log('🗑️ Soft deleting maquinaria:', id);
      await listaMaquinariasService.softDeleteMachineryList(id);
      
      toast({
        title: "Éxito",
        description: "Maquinaria eliminada correctamente",
      });
      
      fetchListaMaquinarias(); // Refresh the list
    } catch (error) {
      console.error('💥 Error deleting maquinaria:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la maquinaria. Por favor intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  // Handle edit button click
  const handleEdit = (maquinaria: IMachineryList) => {
    setSelectedMaquinaria(maquinaria);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Handle form submission
  const handleFormSubmit = (data: any) => {
    if (isEditMode && selectedMaquinaria) {
      handleUpdateListaMaquinarias(selectedMaquinaria._id, data);
    } else {
      handleAddListaMaquinarias(data);
    }
  };

  // Actions renderer for each row
  const actionsRenderer = (row: IMachineryList) => (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleEdit(row)}
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDeleteListaMaquinarias(row._id)}
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Lista de Maquinarias</h1>
          <p className="text-muted-foreground">
            Gestione la información de maquinarias en el sistema
          </p>
        </div>
        <Button 
          onClick={() => {
            setIsEditMode(false);
            setSelectedMaquinaria(null);
            setIsDialogOpen(true);
          }}
          className="flex items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar Maquinaria
        </Button>
      </div>
      
      <Grid
        gridId="lista-maquinarias-grid"
        data={listaMaquinarias}
        columns={columns}
        idField="_id"
        title={`Lista de Maquinarias (${listaMaquinarias.length} registros)`}
        expandableContent={expandableContent}
        actions={actionsRenderer}
        key={`maquinarias-grid-${listaMaquinarias.length}-${propertyId}`}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Maquinaria" : "Añadir Nueva Maquinaria"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Modifique el formulario para actualizar la maquinaria." 
                : "Complete el formulario para añadir una nueva maquinaria al sistema."
              }
            </DialogDescription>
          </DialogHeader>
          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            validationSchema={formValidationSchema}
            defaultValues={
              isEditMode && selectedMaquinaria 
                ? {
                    equipment: selectedMaquinaria.equipment,
                    classifyZone: selectedMaquinaria.classifyZone,
                    machineryCode: selectedMaquinaria.machineryCode,
                    oldMachineryCode: selectedMaquinaria.oldMachineryCode,
                    licensePlate: selectedMaquinaria.licensePlate,
                    machineType: selectedMaquinaria.machineType,
                    brand: selectedMaquinaria.brand,
                    machineryModel: selectedMaquinaria.machineryModel,
                    madeYear: selectedMaquinaria.madeYear,
                    priceHour: selectedMaquinaria.priceHour,
                    onCharge: selectedMaquinaria.onCharge,
                    machineryState: selectedMaquinaria.machineryState,
                    objective: selectedMaquinaria.objective,
                    litersCapacity: selectedMaquinaria.litersCapacity,
                    improvementLiterHa: selectedMaquinaria.improvementLiterHa,
                    pressureBar: selectedMaquinaria.pressureBar,
                    revolution: selectedMaquinaria.revolution,
                    change: selectedMaquinaria.change,
                    kmByHour: selectedMaquinaria.kmByHour,
                    cleaningRecord: selectedMaquinaria.cleaningRecord,
                    temperature: selectedMaquinaria.temperature,
                    maintenanceRecord: selectedMaquinaria.maintenanceRecord,
                    temperatureEquipment: selectedMaquinaria.temperatureEquipment,
                    classifyCost: selectedMaquinaria.classifyCost,
                    subClassifyCost: selectedMaquinaria.subClassifyCost,
                    invoicePurchaseGuide: selectedMaquinaria.invoicePurchaseGuide,
                    purchaseDate: selectedMaquinaria.purchaseDate,
                    supplier: selectedMaquinaria.supplier,
                    observation: selectedMaquinaria.observation,
                    gpsCode: selectedMaquinaria.gpsCode,
                    gpsSupplier: selectedMaquinaria.gpsSupplier,
                    propertyLoans: selectedMaquinaria.propertyLoans,
                    loansDate: selectedMaquinaria.loansDate,
                    loansObservation: selectedMaquinaria.loansObservation,
                    image: selectedMaquinaria.image,
                    state: selectedMaquinaria.state,
                  }
                : {
                    machineryState: true,
                    cleaningRecord: false,
                    temperature: false,
                    maintenanceRecord: false,
                    temperatureEquipment: false,
                    propertyLoans: [],
                    state: true,
                  }
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListaMaquinarias; 