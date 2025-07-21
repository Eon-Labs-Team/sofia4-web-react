import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutDashboard,
  Settings,
  Users,
  BarChart3,
  FileText,
  Building2,
  UserPlus,
  ChevronDown,
  Beaker,
  Droplets,
  Leaf,
  CloudRain,
  Trash,
  Scale,
  Wrench,
  Recycle,
  Calculator,
  UserCheck,
  Presentation,
  Zap,
  Shovel,
  Ruler,
  Tag,
  Briefcase,
  FileSpreadsheet,
  CheckCircle,
  Award,
  PieChart,
  Wheat,
} from "lucide-react";
import UserMenu from "./UserMenu";
import { useAuthStore } from "@/lib/store/authStore";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useSidebarStore, NavItem } from "@/lib/store/sidebarStore";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  hidden?: boolean;
  onToggleVisibility?: () => void;
}

// Función para generar menús específicos según el tipo de acción
const generateMenuForAction = (actionId: string, propertyId: string | number): NavItem[] => {  
    
  
  switch (actionId) {
    case "good-practices":
      return [
        { icon: <BarChart3 size={16} />, label: "Orden de aplicación", path: "/orden-aplicacion" },
        { icon: <BarChart3 size={16} />, label: "Faenas Agrícolas", path: "/faenas-agricolas" },
        { icon: <BarChart3 size={16} />, label: "Trabajos realizados", path: "/trabajos-realizados" },

        {
          icon: <FileText size={20} />,
          label: "Registros de control",
          children: [
            { icon: <UserCheck size={16} />, label: "Registro de Visitas", path: "/visitor-log" },
            { icon: <UserCheck size={16} />, label: "Dotación al Personal", path: "/personnel-provision" },
            { icon: <Presentation size={16} />, label: "Capacitaciones", path: "/capacitaciones" }
          ],
          isExpanded: false
        },
        {
          icon: <FileText size={20} />,
          label: "Registros de campo",
          children: [
            { icon: <Building2 size={16} />, label: "Monitoreo Estado Fenológico", path: "/monitoreo-estado-fenologico" },
            { icon: <Building2 size={16} />, label: "Monitoreo de Maleza", path: "/monitoreo-maleza" },
            { icon: <Beaker size={16} />, label: "Análisis de Suelo", path: "/analisis-suelo" },
            { icon: <Beaker size={16} />, label: "Fertilización de Suelo", path: "/fertilizacion-suelo" },
            { icon: <Droplets size={16} />, label: "Registro de Riego", path: "/registro-riego" },
            { icon: <Leaf size={16} />, label: "Análisis Foliar", path: "/analisis-foliar" },
            { icon: <CloudRain size={16} />, label: "Eventos Climáticos", path: "/eventos-climaticos" },
            { icon: <Trash size={16} />, label: "Limpieza Maquinaria", path: "/limpieza-maquinaria" },
            { icon: <Scale size={16} />, label: "Balance de Masa", path: "/balance-masa" },
            { icon: <Droplets size={16} />, label: "Análisis de Agua", path: "/analisis-agua" },
            { icon: <Droplets size={16} />, label: "Calibrar Aspersión", path: "/calibrar-aspersion" },
            { icon: <Wrench size={16} />, label: "Mantención para Riego Tecnificado", path: "/mantencion-riego-tecnificado" },
            { icon: <Building2 size={16} />, label: "Ingreso de Animales", path: "/ingreso-animales" },
            { icon: <Droplets size={16} />, label: "Aforo por Sector de Riego", path: "/aforo-sector-riego" },
            { icon: <Recycle size={16} />, label: "Retiro de Residuos", path: "/retiro-residuos" },
            { icon: <Recycle size={16} />, label: "Manejo de Residuos", path: "/manejo-residuos" },
            { icon: <Scale size={16} />, label: "Calibración Equipo", path: "/calibracion-equipos" },
            { icon: <Scale size={16} />, label: "Calibración Equipos de Medición", path: "/calibracion-equipos-medicion" },
            { icon: <Calculator size={16} />, label: "Cálculo Bomba de Espalda", path: "/back-pump-calculation" },
          ],
          isExpanded: false
        },
        { icon: <Briefcase size={16} />, 
        label: "Configuraciones", 
        children: [
          { icon: <Building2 size={16} />, label: "Lista Cuarteles", path: "/lista-cuarteles" },
          { icon: <Wrench size={16} />, label: "Lista Maquinarias", path: "/lista-maquinarias" },
          { icon: <Users size={16} />, label: "Lista Trabajadores", path: "/lista-trabajadores" },
          { icon: <Briefcase size={16} />, label: "Faenas", path: "/faenas" },
          { icon: <Briefcase size={16} />, label: "Labores", path: "/labores" },
        ] },

      ];
    case "management":
      return [
        { 
          icon: <BarChart3 size={20} />, 
          label: "Gestión", 
          children: [
            { icon: <BarChart3 size={16} />, label: "Indicadores", path: "/indicadores" },
            { icon: <Users size={16} />, label: "Personal", path: "/personal" },
            { icon: <PieChart size={16} />, label: "Recursos", path: "/recursos" },
            { icon: <Briefcase size={16} />, label: "Labores", path: "/labores" },
          ],
          isExpanded: true
        }
      ];
    case "harvest":
      return [
        { 
          icon: <Wheat size={20} />, 
          label: "Cosecha", 
          children: [
            { icon: <Wheat size={16} />, label: "Registro de Cosecha", path: "/cosecha" },
            { icon: <BarChart3 size={16} />, label: "Estadísticas", path: "/estadisticas-cosecha" },
            { icon: <Briefcase size={16} />, label: "Faenas", path: "/faenas" },
            { icon: <Briefcase size={16} />, label: "Labores", path: "/labores" },
          ],
          isExpanded: true
        }
      ];
    case "certifications":
      return [
        { 
          icon: <Award size={20} />, 
          label: "Certificaciones", 
          children: [
            { icon: <Award size={16} />, label: "Certificados", path: "/certificados" },
            { icon: <CheckCircle size={16} />, label: "Estándares", path: "/estandares" },
            { icon: <BarChart3 size={16} />, label: "Reportes", path: "/reportes-certificaciones" },
          ],
          isExpanded: true
        }
      ];
    default:
      return [];
  }
};

const Sidebar = ({ 
  collapsed = false, 
  onToggle = () => {},
  hidden = true, // Por defecto, el sidebar está oculto
  onToggleVisibility = () => {}
}: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [isHidden, setIsHidden] = useState(hidden);
  const { actionMode, activeAction, resetActiveAction } = useSidebarStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Estado local para los items de navegación
  const [localNavItems, setLocalNavItems] = useState<NavItem[]>([
    { icon: <Home size={20} />, label: "Inicio", path: "/" },
    { icon: <Building2 size={20} />, label: "Lista Cuarteles", path: "/lista-cuarteles" },
    { 
      icon: <Briefcase size={20} />, 
      label: "Faenas", 
      path: "/faenas"
    },
    { 
      icon: <Briefcase size={20} />, 
      label: "Labores", 
      path: "/labores"
    },
    /*
    // Commented items omitted for brevity
    */
  ]);

  // Actualizar el estado local cuando cambia el prop
  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  useEffect(() => {
    setIsHidden(hidden);
  }, [hidden]);

  // Si estamos en modo acción, reemplazamos los ítems de navegación con los específicos para esa acción
  useEffect(() => {
    if (actionMode && activeAction) {
      const specificNavItems = generateMenuForAction(activeAction.actionId, activeAction.propertyId);
      setLocalNavItems(specificNavItems);
    } else {
      // Restaurar ítems originales
      setLocalNavItems([
        { icon: <Home size={20} />, label: "Inicio", path: "/" },
        { icon: <Building2 size={20} />, label: "Lista Cuarteles", path: "/lista-cuarteles" },
        { 
          icon: <Briefcase size={20} />, 
          label: "Faenas", 
          path: "/faenas"
        },
        { 
          icon: <Briefcase size={20} />, 
          label: "Labores", 
          path: "/labores"
        },
      ]);
    }
  }, [actionMode, activeAction]);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle();
  };

  const toggleSubmenu = (index: number) => {
    setLocalNavItems(items => 
      items.map((item, i) => 
        i === index 
          ? { ...item, isExpanded: !item.isExpanded } 
          : item
      )
    );
  };

  const goToHomePage = () => {
    resetActiveAction();
    navigate('/');
  };

  const filterNavItems = (items: NavItem[]): NavItem[] => {
    const { user } = useAuthStore();

    return items.filter(item => {
      // Si el ítem no tiene restricción de rol, lo mostramos
      if (!item.requiredRole) return true;

      // Si requiere un rol pero no hay usuario, no lo mostramos
      if (!user) return false;

      // Comprobamos si el usuario tiene el rol requerido
      switch (item.requiredRole) {
        case 'admin':
          return user.role === 'admin';
        case 'manager':
          return user.role === 'admin' || user.role === 'manager';
        default:
          return true;
      }
    });
  };

  const renderNavItem = (item: NavItem, index: number) => {
    return item.children && item.children.length > 0
      ? renderSubmenu(item, index)
      : renderLink(item, index);
  };

  const renderLink = (item: NavItem, index: number) => (
    <li key={index} className="mb-1">
      {item.path ? (
        <Link
          to={item.path}
          className={cn(
            "flex items-center justify-between h-10 w-full rounded-md px-3 text-sm font-medium",
            "hover:bg-accent hover:text-accent-foreground",
            location.pathname === item.path && "bg-accent text-accent-foreground",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <div className="flex items-center">
            {item.icon}
            {!isCollapsed && <span className="ml-3">{item.label}</span>}
          </div>
        </Link>
      ) : (
        <div
          className={cn(
            "flex items-center justify-between h-10 w-full rounded-md px-3 text-sm font-medium",
            "text-muted-foreground",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <div className="flex items-center">
            {item.icon}
            {!isCollapsed && <span className="ml-3">{item.label}</span>}
          </div>
        </div>
      )}
    </li>
  );

  const renderSubmenu = (item: NavItem, index: number) => (
    <Collapsible
      key={index}
      open={item.isExpanded}
      className="mb-1"
    >
      <CollapsibleTrigger 
        asChild
        onClick={(e) => {
          e.preventDefault();
          toggleSubmenu(index);
        }}
      >
        <div
          className={cn(
            "flex items-center justify-between h-10 w-full rounded-md px-3 text-sm font-medium cursor-pointer",
            "hover:bg-accent hover:text-accent-foreground",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <div className="flex items-center">
            {item.icon}
            {!isCollapsed && <span className="ml-3">{item.label}</span>}
          </div>
          {!isCollapsed && (
            <ChevronDown
              size={16}
              className={cn(
                "transition-transform duration-200",
                item.isExpanded && "transform rotate-180"
              )}
            />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className={cn(!isCollapsed ? "pl-9" : "px-3")}>
        <ul className="mt-1 space-y-1">
          {item.children?.map((child, childIndex) => (
            <li key={childIndex}>
              <Link
                to={child.path || "#"}
                className={cn(
                  "flex items-center h-8 w-full rounded-md px-3 text-sm font-medium",
                  "hover:bg-accent hover:text-accent-foreground",
                  location.pathname === child.path && "bg-accent text-accent-foreground",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                {isCollapsed ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>{child.icon}</span>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{child.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <>
                    {child.icon}
                    <span className="ml-3">{child.label}</span>
                  </>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );

  // Si estamos en la página de inicio y el sidebar debe ocultarse, retornamos null
  if (location.pathname === "/" && !actionMode) {
    return null;
  }

  return (
    <div
      className={cn(
        "shrink-0 border-r bg-card h-screen flex flex-col overflow-hidden transition-all duration-300",
        isCollapsed ? "w-20" : "w-64",
        isHidden ? "-translate-x-full md:translate-x-0" : "translate-x-0",
      )}
    >
      {/* Header del sidebar con el botón de toggle y el título */}
      <div className="h-14 pl-4 pr-4 flex items-center justify-between border-b">
        {!isCollapsed ? (
          <div className="flex items-center cursor-pointer" onClick={goToHomePage}>
            <span className="text-xl font-bold">Sofia</span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full cursor-pointer" onClick={goToHomePage}>
            <span className="text-xl font-bold">S</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={handleToggle}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>

      {/* Contenido del sidebar */}
      <div className="flex-1 overflow-y-auto p-2">
        <ul>
          {filterNavItems(localNavItems).map((item, index) => 
            renderNavItem(item, index)
          )}
        </ul>
      </div>

      {/* Footer del sidebar con el menú de usuario */}
      <div className="shrink-0 p-4 border-t">
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "")}>
          <UserMenu variant="sidebar" />
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium">Cuenta</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
