import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  Building2,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Sprout,
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
import { IOperationalArea } from "@eon-lib/eon-mongoose/types";
import listaCuartelesService from "@/_services/listaCuartelesService";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/store/authStore";
import BarracksWizard from "@/components/BarracksWizard/BarracksWizard";

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

// Render function for the productive type
const renderProductiveType = (value: boolean) => {
  return value ? (
    <div className="flex items-center">
      <Sprout className="h-4 w-4 text-green-500 mr-2" />
      <span>Productivo</span>
    </div>
  ) : (
    <div className="flex items-center">
      <Building2 className="h-4 w-4 text-blue-500 mr-2" />
      <span>No Productivo</span>
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
    id: "isProductive",
    header: "Tipo",
    accessor: "isProductive",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderProductiveType,
  },
  {
    id: "areaName",
    header: "Nombre área",
    accessor: "areaName",
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
    <h3 className="text-lg font-semibold mb-4 flex items-center">
      {row.isProductive ? (
        <Sprout className="h-5 w-5 text-green-500 mr-2" />
      ) : (
        <Building2 className="h-5 w-5 text-blue-500 mr-2" />
      )}
      {row.areaName}
      <span className="ml-2 text-sm font-normal text-muted-foreground">
        ({row.isProductive ? "Productivo" : "No Productivo"})
      </span>
    </h3>
    
    {/* Información básica para todos los cuarteles */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div className="space-y-2">
        <h4 className="font-medium">Información Básica</h4>
        <p><strong>Zona:</strong> {row.classificationZone}</p>
        <p><strong>Código:</strong> {row.codeOptional}</p>
        <p><strong>Estado:</strong> {row.state ? "Activo" : "Inactivo"}</p>
        {row.observation && <p><strong>Observación:</strong> {row.observation}</p>}
      </div>
    </div>

    {/* Información detallada solo para cuarteles productivos */}
    {row.isProductive && (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium">Información General</h4>
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
          <p><strong>Color Mapa:</strong> {row.mapSectorColor}</p>
        </div>
      </div>
    )}
  </div>
);

const ListaCuarteles = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [listaCuarteles, setListaCuarteles] = useState<IOperationalArea[]>([]);
  const [isLoading, setIsLoading] = useState(false);  
  const [selectedCuartel, setSelectedCuartel] = useState<IOperationalArea | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Get propertyId from auth store
  const { propertyId } = useAuthStore();
  
  // Fetch lista cuarteles on component mount and when propertyId changes
  useEffect(() => {
    console.log('🔄 ListaCuarteles useEffect triggered - propertyId:', propertyId);
    if (propertyId) {
      fetchListaCuarteles();
    } else {
      console.log('⚠️ No propertyId available, skipping fetch');
      setListaCuarteles([]);
    }
  }, [propertyId]);
  
  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('📊 listaCuarteles state updated:', {
      length: listaCuarteles.length,
      data: listaCuarteles,
      isArray: Array.isArray(listaCuarteles)
    });
  }, [listaCuarteles]);
  
  // Function to fetch lista cuarteles data
  const fetchListaCuarteles = async () => {
    if (!propertyId) {
      console.log('❌ Cannot fetch cuarteles: no propertyId');
      toast({
        title: "Error",
        description: "No hay una propiedad seleccionada",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    console.log('🚀 Starting fetchListaCuarteles with propertyId:', propertyId);
    
    try {
      const rawData = await listaCuartelesService.findAll();
      console.log('📥 Raw data received from service:', rawData);
      
      // Handle potential double-wrapped data
      let processedData: IOperationalArea[];
      
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
      
      setListaCuarteles(processedData);
      
      if (processedData.length === 0) {
        console.log('ℹ️ No cuarteles found for this property');
        toast({
          title: "Sin datos",
          description: "No se encontraron cuarteles para esta propiedad",
        });
      } else {
        console.log(`✅ Successfully loaded ${processedData.length} cuarteles`);
      }
      
    } catch (error) {
      console.error("💥 Error loading lista cuarteles:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos. Por favor intente nuevamente.",
        variant: "destructive",
      });
      setListaCuarteles([]); // Reset to empty array on error
    } finally {
      setIsLoading(false);
      console.log('🏁 fetchListaCuarteles completed');
    }
  };
  
  // Function to handle adding a new lista cuarteles
  const handleAddListaCuarteles = async (data: Partial<IOperationalArea>) => {
    try {
      const newListaCuarteles = await listaCuartelesService.createBarracksList(data);
      await fetchListaCuarteles();
      setIsDialogOpen(false);
      toast({
        title: "Cuartel creado",
        description: `El cuartel ${newListaCuarteles.areaName} ha sido creado exitosamente.`,
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
  const handleUpdateListaCuarteles = async (id: string | number, data: Partial<IOperationalArea>) => {
    try {
      const updatedListaCuarteles = await listaCuartelesService.updateBarracksList(id, data);
      await fetchListaCuarteles();
      setIsDialogOpen(false);
      setIsEditMode(false);
      setSelectedCuartel(null);
      toast({
        title: "Cuartel actualizado",
        description: `El cuartel ${data.areaName} ha sido actualizado exitosamente.`,
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
  const handleEdit = (cuartel: IOperationalArea) => {
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
  const actionsRenderer = (row: IOperationalArea) => (
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
          if (window.confirm(`¿Está seguro que desea eliminar el cuartel ${row.areaName}?`)) {
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
            Gestione la información de cuarteles productivos y no productivos en el sistema
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
        title={`Lista de Cuarteles (${listaCuarteles.length} registros)`}
        expandableContent={expandableContent}
        actions={actionsRenderer}
        key={`cuarteles-grid-${listaCuarteles.length}-${propertyId}`}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Editar Cuartel" : "Añadir Nuevo Cuartel"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Modifique el formulario para actualizar el cuartel." 
                : "Seleccione el tipo de cuartel y complete la información correspondiente."
              }
            </DialogDescription>
          </DialogHeader>
          <BarracksWizard
            onSubmit={handleFormSubmit}
            isEditMode={isEditMode}
            defaultValues={
              isEditMode && selectedCuartel
                ? {
                    isProductive: selectedCuartel.isProductive,
                    classificationZone: selectedCuartel.classificationZone,
                    areaName: selectedCuartel.areaName,
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
                    ltsByHa: selectedCuartel.ltsByHa,
                    irrigationZone: selectedCuartel.irrigationZone,
                    barracksLotObject: selectedCuartel.barracksLotObject,
                    investmentNumber: selectedCuartel.investmentNumber,
                    observation: selectedCuartel.observation,
                    mapSectorColor: selectedCuartel.mapSectorColor,
                    state: selectedCuartel.state,
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListaCuarteles; 