import React, { useState, useEffect } from "react";
import { Grid } from "@/components/Grid/Grid";
import {
  Warehouse,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  MapPin,
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
import type { IInventoryWarehouse } from "@eon-lib/eon-mongoose";
import inventoryWarehouseService from "@/_services/inventoryWarehouseService";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/lib/store/authStore";
import DynamicForm, { SectionConfig } from "@/components/DynamicForm/DynamicForm";

// Render function for boolean status
const renderStatus = (value: boolean) => {
  return value ? (
    <div className="flex items-center">
      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
      <span>Activa</span>
    </div>
  ) : (
    <div className="flex items-center">
      <XCircle className="h-4 w-4 text-red-500 mr-2" />
      <span>Inactiva</span>
    </div>
  );
};

// Render function for location
const renderLocation = (value: any, row: any) => {
  const location = row.location;
  if (!location) return '-';
  
  return (
    <div className="flex items-center">
      <MapPin className="h-4 w-4 text-blue-500 mr-2" />
      <div>
        <div>{location.name}</div>
        {location.capacity && (
          <div className="text-sm text-gray-500">
            Capacidad: {location.capacity}
          </div>
        )}
      </div>
    </div>
  );
};

// Column configuration for central warehouses grid
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
    header: "Nombre de Bodega",
    accessor: "name",
    visible: true,
    sortable: true,
    groupable: true,
  },
  {
    id: "status",
    header: "Estado",
    accessor: "status",
    visible: true,
    sortable: true,
    groupable: true,
    render: renderStatus,
  },
  {
    id: "location",
    header: "Ubicación",
    accessor: "location",
    visible: true,
    sortable: false,
    render: renderLocation,
  },
  {
    id: "createdAt",
    header: "Fecha Creación",
    accessor: "createdAt",
    visible: true,
    sortable: true,
    render: (value: string) => {
      return new Date(value).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
  },
];

interface WarehouseListProps {
  isModal?: boolean;
  onClose?: () => void;
}

const WarehouseList: React.FC<WarehouseListProps> = ({ isModal = false, onClose }) => {
  const [warehouses, setWarehouses] = useState<IInventoryWarehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<IInventoryWarehouse | null>(null);
  const { user } = useAuthStore();

  // Form sections for warehouse creation/editing
  const formSections: SectionConfig[] = [
    {
      id: "warehouse-basic",
      title: "Información Básica de la Bodega",
      description: "Datos principales de la bodega central",
      fields: [
        {
          id: "name",
          type: "text",
          label: "Nombre de la Bodega",
          name: "name",
          placeholder: "Ej: Bodega Central Principal",
          required: true,
        },
        {
          id: "status",
          type: "checkbox",
          label: "Estado Activo",
          name: "status",
          defaultValue: true,
        },
      ],
    },
    {
      id: "warehouse-location",
      title: "Ubicación",
      description: "Información de ubicación y capacidad",
      fields: [
        {
          id: "location.name",
          type: "text",
          label: "Nombre de la Ubicación",
          name: "location.name",
          placeholder: "Ej: Sector Norte - Galpón A",
          required: true,
        },
        {
          id: "location.capacity",
          type: "number",
          label: "Capacidad (opcional)",
          name: "location.capacity",
          placeholder: "Ej: 1000",
        },
      ],
    },
  ];

  // Fetch central warehouses on component mount
  useEffect(() => {
    fetchCentralWarehouses();
  }, []);

  const fetchCentralWarehouses = async () => {
    try {
      setLoading(true);
      const data = await inventoryWarehouseService.getCentralWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error('Error fetching central warehouses:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las bodegas centrales",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedWarehouse(null);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (warehouse: IInventoryWarehouse) => {
    setSelectedWarehouse(warehouse);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await inventoryWarehouseService.deleteWarehouse(id);
      toast({
        title: "Éxito",
        description: "Bodega eliminada correctamente",
      });
      fetchCentralWarehouses();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la bodega",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      // Ensure we're creating/updating a central warehouse
      const warehouseData = {
        ...data,
        propertyId: '0', // Central warehouse marker
      };

      if (isEditMode && selectedWarehouse) {
        await inventoryWarehouseService.updateWarehouse(selectedWarehouse._id, warehouseData);
        toast({
          title: "Éxito",
          description: "Bodega central actualizada correctamente",
        });
      } else {
        await inventoryWarehouseService.createWarehouse(warehouseData);
        toast({
          title: "Éxito",
          description: "Bodega central creada correctamente",
        });
      }

      setIsDialogOpen(false);
      fetchCentralWarehouses();
    } catch (error) {
      console.error('Error saving warehouse:', error);
      toast({
        title: "Error",
        description: `No se pudo ${isEditMode ? 'actualizar' : 'crear'} la bodega central`,
        variant: "destructive",
      });
    }
  };

  const gridActions = [
    {
      icon: Edit,
      label: "Editar",
      onClick: (row: IInventoryWarehouse) => handleEdit(row),
    },
    {
      icon: Trash2,
      label: "Eliminar",
      onClick: (row: IInventoryWarehouse) => handleDelete(row._id),
      variant: "destructive" as const,
    },
  ];

  return (
    <div className={isModal ? "w-full h-full flex flex-col" : "container mx-auto py-6"}>
      {/* Header - conditional rendering for modal */}
      {!isModal && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Warehouse className="mr-3 h-8 w-8" />
              Bodegas Centrales
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Gestión de bodegas centrales del sistema de inventario
            </p>
          </div>
          <Button onClick={handleCreate} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Bodega Central
          </Button>
        </div>
      )}

      {/* Header for modal */}
      {isModal && (
        <div className="flex justify-between items-center mb-4">
          <Button onClick={handleCreate} className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Bodega Central
          </Button>
        </div>
      )}

      {/* Main Grid */}
      <div className={`px-[1px] ${isModal ? 'flex-1 min-h-0' : ''}`}>
        <Grid
          data={warehouses}
          columns={columns}
          loading={loading}
          onRefresh={fetchCentralWarehouses}
          actions={gridActions}
          searchable={true}
          exportable={true}
          pageSize={isModal ? 8 : 10}
        />
      </div>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className={isModal ? "max-w-xl" : "max-w-2xl"}>
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Editar Bodega Central" : "Nueva Bodega Central"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Modifica los datos de la bodega central seleccionada." 
                : "Crea una nueva bodega central para el sistema de inventario."
              }
            </DialogDescription>
          </DialogHeader>

          <DynamicForm
            sections={formSections}
            onSubmit={handleFormSubmit}
            defaultValues={selectedWarehouse || {
              name: "",
              status: true,
              location: {
                name: "",
                capacity: undefined,
              }
            }}
            submitButtonText={isEditMode ? "Actualizar Bodega" : "Crear Bodega"}
            cancelButtonText="Cancelar"
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WarehouseList;