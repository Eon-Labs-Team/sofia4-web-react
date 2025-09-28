import React from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Building2,
  ChevronRight,
  ChevronsUpDown,
  Plus,
  Home,
  BarChart3,
  Users,
  FileText,
  Briefcase,
  UserCheck,
  Presentation,
  Beaker,
  Droplets,
  Leaf,
  CloudRain,
  Trash,
  Scale,
  Wrench,
  Recycle,
  Calculator,
  Zap,
  Shovel,
  Ruler,
  Tag,
  FileSpreadsheet,
  CheckCircle,
  Award,
  PieChart,
  Wheat,
  Bot,
  TestTubeDiagonal,
  TrendingUp,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/lib/store/authStore"
import { useSidebarStore, NavItem } from "@/lib/store/sidebarStore"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { useSofiaChat } from "@/lib/hooks/useSofiaChat"
import SofiaChat from "@/components/SofiaChat/SofiaChat"

// Esta es la configuración de menús específicos según el tipo de acción
const generateMenuForAction = (actionId: string, propertyId: string | number): NavItem[] => {
  switch (actionId) {
    case "good-practices":
      return [
        // { icon: <BarChart3 size={16} />, label: "Orden de aplicación", path: "/orden-aplicacion" },
        { icon: <TrendingUp size={16} />, label: "Dashboard", path: "/dashboard" },
        { icon: <TestTubeDiagonal size={16} />, label: "Ordenes de aplicación", path: "/orden-aplicacion-new" },
        { icon: <BarChart3 size={16} />, label: "Faenas Agrícolas", path: "/faenas-agricolas" },
        { icon: <BarChart3 size={16} />, label: "Cosechas", path: "/cosechas" },
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
        {
          icon: <Briefcase size={16} />,
          label: "Configuraciones",
          children: [
            { icon: <Building2 size={16} />, label: "Lista Cuarteles", path: "/lista-cuarteles" },
            { icon: <Building2 size={16} />, label: "Bodegas", path: "/bodegas" },
            { icon: <Wrench size={16} />, label: "Lista Maquinarias", path: "/lista-maquinarias" },
            { icon: <Users size={16} />, label: "Lista Trabajadores", path: "/lista-trabajadores" },
            // { icon: <Briefcase size={16} />, label: "Faenas", path: "/faenas" },
            // { icon: <Briefcase size={16} />, label: "Labores", path: "/labores" },
          ]
        },
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

const data = {
  user: {
    name: "Sofia",
    email: "sofia@agro.com",
    avatar: "/avatars/sofia.jpg",
  },
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { actionMode, activeAction, resetActiveAction } = useSidebarStore()
  const { isChatOpen, isChatMinimized, openChat, closeChat, toggleChatSize } = useSofiaChat()

  // Menús por defecto cuando no hay acción específica
  const defaultNavItems: NavItem[] = [
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
  ];

  // Determinar qué menús mostrar
  const navItems = React.useMemo(() => {
    if (actionMode && activeAction) {
      return generateMenuForAction(activeAction.actionId, activeAction.propertyId);
    }
    return defaultNavItems;
  }, [actionMode, activeAction]);

  // Filtrar elementos de navegación basado en roles
  const filterNavItems = (items: NavItem[]): NavItem[] => {
    return items.filter(item => {
      if (!item.requiredRole) return true;
      if (!user) return false;

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

  const handleLogout = () => {
    logout();
    resetActiveAction();
  };

  const handleHomeClick = () => {
    resetActiveAction();
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              asChild
            >
              <Link to="/" onClick={handleHomeClick}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Sofia</span>
                  <span className="truncate text-xs">Gestión Agrícola</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarMenu>
            {filterNavItems(navItems).map((item, index) => (
              <SidebarMenuItem key={index}>
                {item.children ? (
                  <Collapsible
                    defaultOpen={item.isExpanded}
                    className="group/collapsible"
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.label}>
                        {item.icon}
                        <span>{item.label}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map((subItem, subIndex) => (
                          <SidebarMenuSubItem key={subIndex}>
                            <SidebarMenuSubButton asChild>
                              <Link to={subItem.path || "#"}>
                                {subItem.icon}
                                <span>{subItem.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuButton 
                    tooltip={item.label} 
                    asChild
                    isActive={location.pathname === item.path}
                  >
                    <Link to={item.path || "#"}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          {/* sofIA Chat Button */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={openChat} tooltip="sofIA Chat">
              <Bot className="size-4" />
              <span>sofIA Chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <div className="flex items-center">
                <ThemeToggle variant="sidebar" showLabel />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={data.user.avatar} alt={user?.username || "Usuario"} />
                    <AvatarFallback className="rounded-lg">
                      {user?.username?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.username || "Usuario"}</span>
                    <span className="truncate text-xs">{user?.email || "usuario@email.com"}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={data.user.avatar} alt={user?.username || "Usuario"} />
                      <AvatarFallback className="rounded-lg">
                        {user?.username?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{user?.username || "Usuario"}</span>
                      <span className="truncate text-xs">{user?.email || "usuario@email.com"}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      
      {/* sofIA Chat */}
      <SofiaChat
        isOpen={isChatOpen}
        onClose={closeChat}
        onToggleSize={toggleChatSize}
        isMinimized={isChatMinimized}
      />
    </Sidebar>
  )
}