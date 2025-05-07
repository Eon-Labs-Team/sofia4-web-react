import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
const generateMenuForAction = (actionId: string, cuartelId: string | number): NavItem[] => {
  // Función para añadir el ID del cuartel a las rutas
  const withCuartelId = (path: string) => `${path}?cuartelId=${cuartelId}`;

  switch (actionId) {
    case "good-practices":
      return [
        { 
          icon: <Leaf size={20} />, 
          label: "Buenas Prácticas", 
          children: [
            { icon: <Leaf size={16} />, label: "Registro de Visitas", path: withCuartelId("/visitor-log") },
            { icon: <CheckCircle size={16} />, label: "Certificaciones", path: withCuartelId("/certificaciones") },
            { icon: <BarChart3 size={16} />, label: "Reportes", path: withCuartelId("/reportes-practicas") },
          ],
          isExpanded: true
        }
      ];
    case "management":
      return [
        { 
          icon: <BarChart3 size={20} />, 
          label: "Gestión", 
          children: [
            { icon: <BarChart3 size={16} />, label: "Indicadores", path: withCuartelId("/indicadores") },
            { icon: <Users size={16} />, label: "Personal", path: withCuartelId("/personal") },
            { icon: <PieChart size={16} />, label: "Recursos", path: withCuartelId("/recursos") },
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
            { icon: <Wheat size={16} />, label: "Registro de Cosecha", path: withCuartelId("/cosecha") },
            { icon: <BarChart3 size={16} />, label: "Estadísticas", path: withCuartelId("/estadisticas-cosecha") },
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
            { icon: <Award size={16} />, label: "Certificados", path: withCuartelId("/certificados") },
            { icon: <CheckCircle size={16} />, label: "Estándares", path: withCuartelId("/estandares") },
            { icon: <BarChart3 size={16} />, label: "Reportes", path: withCuartelId("/reportes-certificaciones") },
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
  
  // Estado local para los items de navegación
  const [localNavItems, setLocalNavItems] = useState<NavItem[]>([
    { icon: <Home size={20} />, label: "Inicio", path: "/" },
    /*
    // {
    //   icon: <LayoutDashboard size={20} />,
    //   label: "Dashboard",
    //   path: "/dashboard",
    //   requiredRole: 'manager'
    // },
    // { 
    //   icon: <BarChart3 size={20} />, 
    //   label: "Estadísticas", 
    //   path: "/analytics",
    //   requiredRole: 'manager'
    // },
    // { 
    //   icon: <Users size={20} />, 
    //   label: "Usuarios", 
    //   path: "/users",
    //   requiredRole: 'admin'
    // },
    { 
      icon: <Building2 size={20} />, 
      label: "Gestión de Cuarteles", 
      children: [
        { icon: <Building2 size={16} />, label: "Cuarteles", path: "/cuarteles" },
        { icon: <Building2 size={16} />, label: "Lista Cuarteles", path: "/lista-cuarteles" },
      ],
      isExpanded: false
    },
    { 
      icon: <UserPlus size={20} />, 
      label: "Lista Cuadrillas", 
      path: "/lista-cuadrillas" 
    },
    {
      icon: <FileText size={20} />,
      label: "Formularios",
      children: [
        { icon: <FileText size={16} />, label: "Formulario Dinámico", path: "/dynamic-form" },
        { 
          icon: <FileText size={16} />,
          label: "Constructor de Formularios", 
          path: "/form-builder",
          requiredRole: 'admin'
        },
      ],
      isExpanded: false
    },
    { 
      icon: <FileText size={20} />, 
      label: "Reportes", 
      path: "/reports",
      requiredRole: 'manager'
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

    {
      icon: <FileText size={20} />,
      label: "Registros de control",
      children: [
        { icon: <UserCheck size={16} />, label: "Registro de Visitas", path: "/visitor-log" },
        { icon: <UserCheck size={16} />, label: "Dotación al Personal", path: "/personnel-provision" },
        { icon: <Presentation size={16} />, label: "Capacitaciones", path: "/capacitaciones" },
        { icon: <Trash size={16} />, label: "Limpieza de Instalaciones", path: "/limpieza-instalaciones" },
        { icon: <Droplets size={16} />, label: "Lavado de Manos", path: "/lavado-manos" },
        { icon: <Zap size={16} />, label: "Consumo de Luz", path: "/electricity-consumption" },
        { icon: <Droplets size={16} />, label: "Consumo de Agua", path: "/water-consumption" },
        { icon: <Trash size={16} />, label: "Higiene y Sanidad", path: "/hygiene-sanitation" },
        { icon: <Shovel size={16} />, label: "Calicata", path: "/calicata" },
        { icon: <Droplets size={16} />, label: "Registro Cloro en Láminas de Espuma", path: "/chlorine-registration" },
        { icon: <Droplets size={16} />, label: "Cloración de Agua", path: "/water-chlorination" },
      ],
      isExpanded: false
    },

    { icon: <Briefcase size={16} />, label: "Trabajos Realizados", path: "/trabajos-realizados" },
    { icon: <FileSpreadsheet size={16} />, label: "Orden de Aplicación", path: "/orden-aplicacion" },

    { 
      icon: <Settings size={20} />, 
      label: "Configuraciones", 
      path: "/settings",
      requiredRole: 'admin',
      children:[
        { icon: <Ruler size={16} />, label: "Unidades de Medida", path: "/unidades-medida" },
        { icon: <Tag size={16} />, label: "Categorías de Productos", path: "/product-categories" },
        { icon: <Tag size={16} />, label: "Subcategorías de Productos", path: "/subcategory-product" },
        { icon: <Leaf size={16} />, label: "Tipo Cultivo", path: "/tipo-cultivo" },
        { icon: <Leaf size={16} />, label: "Variedades", path: "/variedades" },
        { icon: <Tag size={16} />, label: "Tipos de Suelo", path: "/tipos-suelo" },
      ],
      isExpanded: false
    },
    */
  ]);

  // Guardar los items originales del menú en el store global cuando se monta el componente
  useEffect(() => {
    const { saveOriginalNavItems } = useSidebarStore.getState();
    saveOriginalNavItems(localNavItems);
  }, []);
  
  // Cambiar el menú cuando se activa una acción
  useEffect(() => {
    if (actionMode && activeAction) {
      // Generar el menú específico para la acción
      const actionMenuItems = generateMenuForAction(
        activeAction.actionId, 
        activeAction.cuartelId
      );
      
      // Actualizar el menú local con el botón de volver y los elementos específicos
      setLocalNavItems([
        {
          icon: <ChevronLeft size={20} />,
          label: "Volver",
          path: "/",
          isExpanded: false
        },
        ...actionMenuItems
      ]);
    } else {
      // Restaurar el menú original si no estamos en modo acción
      const { originalNavItems } = useSidebarStore.getState();
      if (originalNavItems.length > 0) {
        setLocalNavItems(originalNavItems);
      }
    }
  }, [actionMode, activeAction]);

  const location = useLocation();
  const { user } = useAuthStore();

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle();
  };

  const toggleSubmenu = (index: number) => {
    const updatedItems = [...localNavItems];
    updatedItems[index] = { 
      ...updatedItems[index], 
      isExpanded: !updatedItems[index].isExpanded 
    };
    setLocalNavItems(updatedItems);
  };

  // Manejar clic en el botón "Volver"
  const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (actionMode && path === "/") {
      e.preventDefault();
      resetActiveAction();
    }
  };

  // Filter nav items based on user role
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      if (!item.requiredRole) return true;
      if (!user) return false;
      
      // Admin can access everything
      if (user.role === 'admin') return true;
      
      // Manager can access user and manager items
      if (user.role === 'manager' && item.requiredRole !== 'admin') return true;
      
      // Regular user can only access user items
      return user.role === item.requiredRole;
    }).map(item => {
      if (item.children) {
        return {
          ...item,
          children: filterNavItems(item.children)
        };
      }
      return item;
    });
  };

  const filteredNavItems = filterNavItems(localNavItems);

  // Renderizar un ítem de navegación
  const renderNavItem = (item: NavItem, index: number) => {
    if (item.children) {
      return renderSubmenu(item, index);
    }
    
    return renderLink(item, index);
  };

  // Renderizar un enlace
  const renderLink = (item: NavItem, index: number) => (
    <li key={index}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to={item.path || '#'}
              className={`flex items-center p-2 rounded-md transition-colors ${location.pathname === item.path ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"}`}
              onClick={(e) => item.path === "/" && actionMode ? handleBackClick(e, item.path) : null}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </Link>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">{item.label}</TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </li>
  );

  // Renderizar un submenú
  const renderSubmenu = (item: NavItem, index: number) => (
    <li key={index}>
      <Collapsible
        open={item.isExpanded}
        onOpenChange={() => toggleSubmenu(index)}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <button
            className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${location.pathname.startsWith(item.path || '#') ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"}`}
          >
            <div className="flex items-center">
              <span className="flex-shrink-0">{item.icon}</span>
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown
                size={16}
                className={`transition-transform ${item.isExpanded ? "transform rotate-180" : ""}`}
              />
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 pt-1">
          <ul className="space-y-1">
            {!isCollapsed &&
              item.children?.map((child, childIndex) => (
                <li key={childIndex}>
                  <Link
                    to={child.path || '#'}
                    className={`flex items-center p-1 rounded-md transition-colors ${location.pathname === child.path ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"}`}
                  >
                    <span className="flex-shrink-0">{child.icon}</span>
                    <span className="ml-3">{child.label}</span>
                  </Link>
                </li>
              ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
      {isCollapsed && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="px-2">
                <div className="w-10 h-1 bg-border mt-1 rounded-full mx-auto"></div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[250px]">
              <div className="space-y-1">
                {item.label}
                <ul className="space-y-1 mt-1">
                  {item.children?.map((child, childIndex) => (
                    <li key={childIndex}>
                      <Link
                        to={child.path || '#'}
                        className="flex items-center p-1 text-sm"
                      >
                        <span className="flex-shrink-0 mr-2">{child.icon}</span>
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </li>
  );

  // Si el sidebar está oculto, no renderizamos nada o retornamos un botón para mostrarlo
  if (isHidden) {
    return (
      <button 
        onClick={() => {
          setIsHidden(false);
          onToggleVisibility();
        }}
        className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-background border border-l-0 border-border p-2 rounded-r-md z-50 hover:bg-accent/20 transition-all duration-200"
      >
        <ChevronRight size={18} />
      </button>
    );
  }

  return (
    <div
      className={`h-screen bg-background border-r transition-all duration-300 flex flex-col ${isCollapsed ? "w-[70px]" : "w-[280px]"}`}
    >
      {/* Logo and collapse button */}
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div className="font-bold text-xl">
            {actionMode && activeAction ? (
              <span className="text-sm">{activeAction.title || 'Acción Cuartel'}</span>
            ) : (
              'Sofia App'
            )}
          </div>
        )}
        <div className="flex ml-auto">
          {/* Botón para ocultar completamente el sidebar */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsHidden(true);
              onToggleVisibility();
            }}
            className="mr-1"
            title="Ocultar menú"
          >
            <ChevronLeft size={18} />
          </Button>
          
          {/* Botón para colapsar/expandir */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
      </div>

      {/* Mostrar detalles del cuartel si estamos en modo acción */}
      {!isCollapsed && actionMode && activeAction && (
        <div className="px-4 pb-2">
          <span className="text-xs text-muted-foreground block">
            {activeAction.subtitle || `Cuartel ID: ${activeAction.cuartelId}`}
          </span>
        </div>
      )}

      <Separator />

      {/* Navigation Links */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-2 px-2">
          {filteredNavItems.map((item, index) => renderNavItem(item, index))}
        </ul>
      </nav>

      <Separator />

      {/* User Menu Section */}
      <div className="p-4 flex justify-center">
        <UserMenu />
      </div>
    </div>
  );
};

export default Sidebar;
