import React, { useState } from "react";
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
} from "lucide-react";
import UserMenu from "./UserMenu";
import { useAuthStore } from "@/lib/store/authStore";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path?: string;
  requiredRole?: 'admin' | 'manager' | 'user';
  children?: NavItem[];
  isExpanded?: boolean;
}

const Sidebar = ({ collapsed = false, onToggle = () => {} }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [navItems, setNavItems] = useState<NavItem[]>([
    { icon: <Home size={20} />, label: "Inicio", path: "/" },
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
        { icon: <Scale size={16} />, label: "Calibración Equipo de Medición", path: "/calibracion-equipos-medicion" }
      ],
      isExpanded: false
    },
    { 
      icon: <Settings size={20} />, 
      label: "Configuraciones", 
      path: "/settings",
      requiredRole: 'admin'
    },
  ]);

  const location = useLocation();
  const { user } = useAuthStore();

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle();
  };

  const toggleSubmenu = (index: number) => {
    setNavItems(
      navItems.map((item, i) => 
        i === index ? { ...item, isExpanded: !item.isExpanded } : item
      )
    );
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

  const filteredNavItems = filterNavItems(navItems);

  const renderNavItem = (item: NavItem, index: number, level: number = 0) => {
    // Skip rendering if item has no children and doesn't pass the role filter
    if (!item.path && (!item.children || item.children.length === 0)) return null;

    // For items with children (submenus)
    if (item.children && item.children.length > 0) {
      return (
        <li key={`${level}-${index}`}>
          <Collapsible
            open={item.isExpanded}
            onOpenChange={() => toggleSubmenu(index)}
            className="w-full"
          >
            <div className={`flex w-full ${level > 0 ? "pl-4" : ""}`}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className={`flex w-full items-center justify-between p-2 rounded-md hover:bg-accent transition-colors ${!isCollapsed ? "text-sm" : ""}`}
                >
                  <div className="flex items-center">
                    <span className="text-foreground">{item.icon}</span>
                    {!isCollapsed && (
                      <span className="ml-3 text-sm">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown 
                      size={16} 
                      className={cn(
                        "transform transition-transform duration-200",
                        item.isExpanded ? "rotate-180" : ""
                      )}
                    />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            {isCollapsed ? (
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span></span>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <CollapsibleContent>
                <ul className="space-y-1 ml-5 mt-1">
                  {item.children.map((child, childIndex) => 
                    renderNavItem(child, childIndex, level + 1)
                  )}
                </ul>
              </CollapsibleContent>
            )}
          </Collapsible>
        </li>
      );
    }

    // For regular menu items
    const isActive = location.pathname === item.path;
    return (
      <li key={`${level}-${index}`}>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to={item.path || "#"}
                className={`flex items-center p-2 rounded-md hover:bg-accent transition-colors ${isActive ? "bg-accent" : ""} ${level > 0 ? "pl-4" : ""}`}
              >
                <span className="text-foreground">{item.icon || <div className="w-5" />}</span>
                {!isCollapsed && (
                  <span className="ml-3 text-sm">{item.label}</span>
                )}
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">{item.label}</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </li>
    );
  };

  return (
    <div
      className={`h-screen bg-background border-r transition-all duration-300 flex flex-col ${isCollapsed ? "w-[70px]" : "w-[280px]"}`}
    >
      {/* Logo and collapse button */}
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && <div className="font-bold text-xl">Sofia App</div>}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggle}
          className={`${isCollapsed ? "ml-auto mr-auto" : "ml-auto"}`}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

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
