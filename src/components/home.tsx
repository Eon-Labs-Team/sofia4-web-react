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
} from "lucide-react";
import { Property } from "@/types/property";
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

const CuartelesTable = ({ 
  cuarteles, 
  onActionClick 
}: { 
  cuarteles: Property[], 
  onActionClick: (actionId: string, cuartelId: string | number) => void 
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
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cuarteles.map((cuartel) => (
            <TableRow key={cuartel.taxId}>
              <TableCell>{cuartel.propertyName}</TableCell>              
              <TableCell>
                {cuartel.status ? (
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
                              onClick={() => onActionClick(option.id, cuartel._id)}
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
  
  const [cuarteles, setCuarteles] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toggleSidebar } = React.useContext(SidebarContext);

  useEffect(() => {
    fetchCuarteles();
  }, []);

  const fetchCuarteles = async () => {
    setIsLoading(true);
    try {
      const response = await propertyService.findAll();
      setCuarteles(response);
    } catch (error) {
      console.error("Error loading cuarteles:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los cuarteles. Por favor intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (actionId: string, cuartelId: string | number) => {
    // Datos para el título en el sidebar
    const actionTitle = barrackOptions.find(opt => opt.id === actionId)?.title || '';
    const cuartelName = cuarteles.find(c => c._id === cuartelId)?.propertyName || '';
    
    // Activamos el modo acción en el sidebar
    toggleActionMode(true);
    setActiveAction({
      actionId,
      cuartelId,
      title: actionTitle,
      subtitle: cuartelName
    });

    // Mostrar el sidebar si está oculto
    if (toggleSidebar) {
      toggleSidebar();
    }
  };

  const handleBackToHome = () => {
    // Restauramos el menú original y reseteamos el modo acción
    resetActiveAction();
    
    // Ocultar el sidebar
    if (toggleSidebar) {
      toggleSidebar();
    }
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
              {cuarteles.find(c => c._id === storeActiveAction.cuartelId)?.propertyName || ''}
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
          <div className="p-4 border rounded-md">
            <p>Contenido para {storeActiveAction.actionId}</p>
            <p className="text-sm text-muted-foreground mt-2">
              El menú lateral ahora muestra las opciones para esta acción
              y es gestionado directamente por el componente Sidebar.
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full p-6">
          <div className="flex items-center mb-6">
            <h1 className="text-2xl font-bold">Cuarteles</h1>
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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Cargando cuarteles...</p>
            </div>
          ) : (
            <CuartelesTable 
              cuarteles={cuarteles} 
              onActionClick={handleActionClick}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;
