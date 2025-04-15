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
} from "lucide-react";
import UserMenu from "./UserMenu";
import { useAuthStore } from "@/lib/store/authStore";

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  requiredRole?: 'admin' | 'manager' | 'user';
}

const Sidebar = ({ collapsed = false, onToggle = () => {} }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const location = useLocation();
  const { user } = useAuthStore();

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
    onToggle();
  };

  const navItems: NavItem[] = [
    { icon: <Home size={20} />, label: "Inicio", path: "/" },
    {
      icon: <LayoutDashboard size={20} />,
      label: "Dashboard",
      path: "/dashboard",
      requiredRole: 'manager'
    },
    { 
      icon: <BarChart3 size={20} />, 
      label: "Estadísticas", 
      path: "/analytics",
      requiredRole: 'manager'
    },
    { 
      icon: <Users size={20} />, 
      label: "Usuarios", 
      path: "/users",
      requiredRole: 'admin'
    },
    { icon: <Building2 size={20} />, label: "Cuarteles", path: "/cuarteles" },
    { icon: <Building2 size={20} />, label: "Lista Cuarteles", path: "/lista-cuarteles" },
    {
      icon: <FileText size={20} />,
      label: "Formulario Dinámico",
      path: "/dynamic-form",
    },
    {
      icon: <FileText size={20} />,
      label: "Constructor de Formularios",
      path: "/form-builder",
      requiredRole: 'admin'
    },
    { 
      icon: <FileText size={20} />, 
      label: "Reportes", 
      path: "/reports",
      requiredRole: 'manager'
    },
    { 
      icon: <Settings size={20} />, 
      label: "Configuración", 
      path: "/settings",
      requiredRole: 'admin'
    },
  ];

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    if (!item.requiredRole) return true;
    if (!user) return false;
    
    // Admin can access everything
    if (user.role === 'admin') return true;
    
    // Manager can access user and manager items
    if (user.role === 'manager' && item.requiredRole !== 'admin') return true;
    
    // Regular user can only access user items
    return user.role === item.requiredRole;
  });

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
          {filteredNavItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={index}>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        className={`flex items-center p-2 rounded-md hover:bg-accent transition-colors ${isActive ? "bg-accent" : ""}`}
                      >
                        <span className="text-foreground">{item.icon}</span>
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
          })}
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
