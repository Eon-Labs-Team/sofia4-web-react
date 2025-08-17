import React, { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Leaf,
  BarChart3,
  Wheat,
  Award,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Menu,
  Warehouse,
  Settings,
} from "lucide-react";
import { IProperty } from "@eon-lib/eon-mongoose";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/store/sidebarStore";
import { useAuthStore } from "@/lib/store/authStore";
import propertyService from "@/_services/propertyService";
import UserMenu from "../components/layout/UserMenu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BodegaCentral from "./BodegaCentral";
import GeneralConfigurationsModal from "@/components/GeneralConfigurationsModal";

interface Permission {
  canView: boolean;
}

interface BarrackOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  permission: Permission;
}

const barrackOptions: BarrackOption[] = [
  {
    id: "good-practices",
    title: "Buenas Prácticas Agrícolas",
    description: "Gestión de buenas prácticas agrícolas",
    icon: <Leaf className="h-6 w-6" />,
    permission: { canView: true },
  },
  {
    id: "management",
    title: "Gestión",
    description: "Gestión de recursos y operaciones",
    icon: <BarChart3 className="h-6 w-6" />,
    permission: { canView: true },
  },
  {
    id: "harvest",
    title: "Cosecha",
    description: "Control y seguimiento de cosechas",
    icon: <Wheat className="h-6 w-6" />,
    permission: { canView: true },
  },
  {
    id: "certifications",
    title: "Certificaciones",
    description: "Gestión de certificaciones y estándares",
    icon: <Award className="h-6 w-6" />,
    permission: { canView: true },
  },
];

const PropertiesTable = ({ 
  properties, 
  onActionClick 
}: { 
  properties: IProperty[], 
  onActionClick: (actionId: string, propertyId: string | number) => void 
}) => {
  const { user } = useAuthStore();

  const hasPermission = (actionId: string): boolean => {
    if (!user) return false;
    
    switch (actionId) {
      case "good-practices":
        return user.permission.bpa;
      case "management":
        return user.permission.gestion;
      case "harvest":
        return user.permission.cosecha;
      case "certifications":
        return user.permission.certificacion;
      default:
        return false;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>            
            <TableHead>Nombre</TableHead>            
            <TableHead>Estado</TableHead>
            <TableHead>Módulos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {properties.map((property) => (
            <TableRow key={property.taxId}>
              <TableCell>{property.propertyName}</TableCell>
              <TableCell>
                {property.status ? (
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    <span>Activo</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    <span>Inactivo</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {barrackOptions.map((option) => (
                    hasPermission(option.id) && (
                      <TooltipProvider key={option.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                              onClick={() => onActionClick(option.id, property._id)}
                            >
                              {option.icon}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{option.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )
                  ))}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Vamos a definir un contexto para el control del sidebar
// Esto es opcional, otra alternativa sería pasar la función por props 
// desde el componente App hasta el Home
export const SidebarContext = React.createContext<{
  toggleSidebar?: () => void;
}>({});

const HomePage = () => {
  const { 
    toggleActionMode, 
    setActiveAction, 
    resetActiveAction,
    actionMode, 
    activeAction: storeActiveAction
  } = useSidebarStore();
  
  const { setPropertyId, clearPropertyId } = useAuthStore();
  const [properties, setProperties] = useState<IProperty[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isConfigurationsModalOpen, setIsConfigurationsModalOpen] = useState(false);
  const { toggleSidebar } = React.useContext(SidebarContext);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties= async () => {
    setIsLoading(true);
    try {
      const response = await propertyService.findAll();
      console.log("Properties fetched:", response);
      setProperties(response);
    } catch (error) {
      console.error("Error loading properties:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las propiedades. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (actionId: string, propertyId: string | number) => {
    // Datos para el título en el sidebar
    const actionTitle = barrackOptions.find(opt => opt.id === actionId)?.title || '';
    const propertyName = properties.find(c => c._id === propertyId)?.propertyName || '';
    
    // Set the propertyId in the auth store
    setPropertyId(propertyId);
    
    // Activamos el modo acción en el sidebar
    toggleActionMode(true);
    setActiveAction({
      actionId,
      propertyId,
      title: actionTitle,
      subtitle: propertyName
    });

    // Mostrar el sidebar si está oculto
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  const handleBackToHome = () => {
    // Clear the propertyId from the auth store
    clearPropertyId();
    
    // Restauramos el menú original y reseteamos el modo acción
    resetActiveAction();
    
    // Ocultar el sidebar
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  const handleInventoryClick = () => {
    setIsInventoryModalOpen(true);
  };

  const handleConfigurationsClick = () => {
    setIsConfigurationsModalOpen(true);
  };

  return (
    <div className="flex-1 h-full overflow-hidden">
      {actionMode && storeActiveAction ? (
        <div className="w-full h-full p-6">
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              className="mr-2" 
              onClick={handleBackToHome}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Volver
            </Button>
            <h1 className="text-2xl font-bold">
              {barrackOptions.find(opt => opt.id === storeActiveAction.actionId)?.title} - 
              {properties.find(c => c._id === storeActiveAction.propertyId)?.propertyName || ''}
            </h1>
            {toggleSidebar && (
              <Button 
                variant="ghost" 
                className="ml-auto" 
                onClick={toggleSidebar}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
          <div className="h-full">
            <p className="text-muted-foreground">
              Seleccione una opción del menú lateral para comenzar a trabajar.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Bienvenido a Sofia</h1>
              <p className="text-muted-foreground">
                Selecciona un predio para comenzar a trabajar.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleConfigurationsClick}
                variant="outline"
                className="flex items-center"
              >
                <Settings className="mr-2 h-4 w-4" />
                Configuraciones Generales
              </Button>
              <Button
                onClick={handleInventoryClick}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Warehouse className="mr-2 h-4 w-4" />
                Inventario Central
              </Button>
              <div className="ml-auto">
                <UserMenu />
              </div>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Predios / campos</h2>
            {isLoading ? (
              <p>Cargando predios...</p>
            ) : properties.length > 0 ? (
              <PropertiesTable 
                properties={properties} 
                onActionClick={handleActionClick} 
              />
            ) : (
              <p>No hay predios disponibles.</p>
            )}
          </div>
        </div>
      )}

      {/* Inventory Central Modal */}
      <Dialog open={isInventoryModalOpen} onOpenChange={setIsInventoryModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center">
              <Warehouse className="mr-2 h-5 w-5" />
              Inventario Central
            </DialogTitle>
            <DialogDescription>
              Gestión centralizada del sistema de inventario - independiente de predios específicos
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            <BodegaCentral isModal={true} onClose={() => setIsInventoryModalOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      {/* General Configurations Modal */}
      <GeneralConfigurationsModal
        isOpen={isConfigurationsModalOpen}
        onClose={() => setIsConfigurationsModalOpen(false)}
      />
    </div>
  );
};

export default HomePage;
