import { Suspense, useState, useEffect } from "react";
import { useRoutes, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home, { SidebarContext } from "./pages/home";
import Faenas from "./pages/Faenas";
import Labores from "./pages/Labores";
import ListaCuarteles from "./pages/ListaCuarteles";
import BodegasList from "./pages/BodegasList";
import ListaMaquinarias from "./pages/ListaMaquinarias";
import ListaCuadrillas from "./pages/ListaCuadrillas";
import ListaTrabajadores from "./pages/ListaTrabajadores";
import MonitoreoEstadoFenologico from "./pages/MonitoreoEstadoFenologico";
import MonitoreoMaleza from "./pages/MonitoreoMaleza";
import SoilAnalysis from "./pages/SoilAnalysis";
import FertilizacionSuelo from "./pages/FertilizacionSuelo";
import IrrigationRecord from "./pages/IrrigationRecord";
import AnalisisFoliar from "./pages/AnalisisFoliar";
import EventosClimaticos from "./pages/EventosClimaticos";
import LimpiezaMaquinaria from "./pages/LimpiezaMaquinaria";
import FacilityCleaning from "./pages/FacilityCleaning";
import MassBalance from "./pages/MassBalance";
import DynamicFormExample from "./pages/DynamicFormExample";
import FormBuilderExample from "./pages/FormBuilderExample";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import routes from "tempo-routes";
import { AppSidebar } from "./components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Toaster } from "./components/ui/toaster";
import { useAuthStore } from "./lib/store/authStore";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PropertyRoute from "./components/auth/PropertyRoute";
import AnalisisAgua from "./pages/analisis-agua";
import CalibrarAspersion from "./pages/CalibrarAspersion";
import TechnicalIrrigationMaintenance from "./pages/TechnicalIrrigationMaintenance";
import AnimalAdmission from "./pages/AnimalAdmission";
import IrrigationSectorCapacity from "./pages/IrrigationSectorCapacity";
import WasteRemoval from "./pages/WasteRemoval";
import WasteManagement from "./pages/WasteManagement";
import EquipmentCalibration from "./pages/EquipmentCalibration";
import CalibrationMeasuringEquipment from "./pages/CalibrationMeasuringEquipment";
import BackPumpCalculation from "./pages/backPumpCalculation";
import VisitorLog from "./pages/VisitorLog";
import PersonnelProvision from "./pages/PersonnelProvision";
import Capacitaciones from "./pages/Capacitaciones";
import LavadoManos from "./pages/LavadoManos";
import ElectricityConsumption from "./pages/electricity-consumption";
import WaterConsumption from "./pages/water-consumption";
import HygieneSanitation from "./pages/HygieneSanitation";
import Calicata from "./pages/calicata";
import ChlorineRegistration from "./pages/ChlorineRegistration";
import WaterChlorination from "./pages/WaterChlorination";
import ProductCategories from "./pages/ProductCategories";
import TrabajosRealizados from "./pages/TrabajosRealizados";
import SubcategoryProduct from "./pages/subcategory-product";
import OrdenAplicacion from "./pages/OrdenAplicacion";
import WizardExample from "./components/Wizard/WizardExample";
import FaenasAgricolas from "./pages/faenas-agricolas";
import { useSidebarStore } from "./lib/store/sidebarStore";

function App() {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const { actionMode } = useSidebarStore();

  // Determine if sidebar should be shown based on current route and action mode
  const shouldShowSidebar = () => {
    return location.pathname !== "/" || actionMode;
  };

  // Contexto para proporcionar la función de toggle a los componentes hijos
  const sidebarContextValue = {
    toggleSidebar: () => {} // Mantenemos la compatibilidad pero ya no es necesario
  };

  // Mapeo de títulos para cada ruta
  const getPageTitle = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    const titleMap: Record<string, string> = {
      'lista-cuarteles': 'Lista Cuarteles',
      'faenas': 'Faenas',
      'labores': 'Labores',
      'orden-aplicacion': 'Orden de Aplicación',
      'bodegas': 'Bodegas',
      'monitoreo-estado-fenologico': 'Monitoreo Estado Fenológico',
      'analisis-suelo': 'Análisis de Suelo',
      'fertilizacion-suelo': 'Fertilización de Suelo',
      'registro-riego': 'Registro de Riego',
      'analisis-foliar': 'Análisis Foliar',
      'eventos-climaticos': 'Eventos Climáticos',
      // Agregar más mapeos según sea necesario
    };

    if (segments.length === 0) return 'Inicio';

    const lastSegment = segments[segments.length - 1];
    return titleMap[lastSegment] || lastSegment.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Layout with sidebar for authenticated users
  const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
    const showSidebar = shouldShowSidebar();

    if (!showSidebar) {
      // Para la página de inicio sin sidebar
      return (
        <main className="min-h-screen bg-background">
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Cargando...</div>}>
            {children}
          </Suspense>
        </main>
      );
    }

    return (
      <SidebarProvider className="bg-sidebar flex w-full min-h-screen">
        {/* Ocultamos el borde lateral del menú y aplicamos efecto de card al área inset */}
        <AppSidebar className="border-transparent flex-shrink-0" />
        <SidebarInset className="m-2 rounded-xl border text-foreground shadow flex flex-col min-w-0 w-full">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4 min-w-0 w-full">
              <SidebarTrigger className="-ml-1 flex-shrink-0" />
              <Separator orientation="vertical" className="mr-2 h-4 flex-shrink-0" />
              {/* Título de la página (reemplaza breadcrumb) */}
              <h1 className="text-lg font-semibold tracking-tight truncate">{getPageTitle(location.pathname)}</h1>
            </div>
          </header>
          {/* Contenido dentro del inset (sin card adicional) */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden min-w-0">
            <div className="flex-1 overflow-auto p-4 pt-0 min-w-0">
              <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]">Cargando...</div>}>
                {children}
              </Suspense>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  };

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Home route - protected but doesn't need PropertyRoute */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Home />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/faenas"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <Faenas />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/labores"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <Labores />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/lista-cuarteles"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <ListaCuarteles />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/bodegas"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <BodegasList />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/lista-maquinarias"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <ListaMaquinarias />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/lista-cuadrillas"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <ListaCuadrillas />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/lista-trabajadores"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <ListaTrabajadores />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        
        <Route
          path="/monitoreo-estado-fenologico"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <MonitoreoEstadoFenologico />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/monitoreo-maleza"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <MonitoreoMaleza />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/analisis-suelo"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <SoilAnalysis />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/fertilizacion-suelo"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <FertilizacionSuelo />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/registro-riego"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <IrrigationRecord />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/analisis-foliar"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <AnalisisFoliar />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/eventos-climaticos"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <EventosClimaticos />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/limpieza-maquinaria"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <LimpiezaMaquinaria />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
            path="/balance-masa"
            element={
              <ProtectedRoute>
                <PropertyRoute>
                  <AuthenticatedLayout>
                    <MassBalance />
                  </AuthenticatedLayout>
                </PropertyRoute>
              </ProtectedRoute>
            }
          />
        
        
        <Route
          path="/analisis-agua"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <AnalisisAgua />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/calibrar-aspersion"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <CalibrarAspersion />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/form-builder"
          element={
            <ProtectedRoute requiredRole="admin">
              <PropertyRoute>
                <AuthenticatedLayout>
                  <FormBuilderExample />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/mantencion-riego-tecnificado"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <TechnicalIrrigationMaintenance />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/ingreso-animales"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <AnimalAdmission />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/aforo-sector-riego"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <IrrigationSectorCapacity />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/retiro-residuos"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <WasteRemoval />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/manejo-residuos"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <WasteManagement />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/calibracion-equipos"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <EquipmentCalibration />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/calibracion-equipos-medicion"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <CalibrationMeasuringEquipment />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/back-pump-calculation"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <BackPumpCalculation />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/visitor-log"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <VisitorLog />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/personnel-provision"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <PersonnelProvision />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/capacitaciones"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <Capacitaciones />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/lavado-manos"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <LavadoManos />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/electricity-consumption"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <ElectricityConsumption />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/water-consumption"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <WaterConsumption />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/hygiene-sanitation"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <HygieneSanitation />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/calicata"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <Calicata />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/chlorine-registration"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <ChlorineRegistration />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/water-chlorination"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <WaterChlorination />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/product-categories"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <ProductCategories />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/subcategory-product"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <SubcategoryProduct />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        
        <Route
          path="/trabajos-realizados"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <TrabajosRealizados />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/orden-aplicacion"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <OrdenAplicacion />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/wizard-example"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <WizardExample />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
         
        
        <Route
          path="/faenas-agricolas"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <FaenasAgricolas />
                </AuthenticatedLayout>
              </PropertyRoute>
            </ProtectedRoute>
          }
        />
        
        {/* Tempo routes (if applicable) */}
        {import.meta.env.VITE_TEMPO === "true" && (
          <Route
            path="/tempobook/*"
            element={
              <ProtectedRoute>
                <PropertyRoute>
                  <AuthenticatedLayout>
                    {useRoutes(routes)}
                  </AuthenticatedLayout>
                </PropertyRoute>
              </ProtectedRoute>
            }
          />
        )}
        
        {/* Redirect any unknown routes to home or login depending on auth state */}
        <Route 
          path="*" 
          element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/login" />} 
        />
      </Routes>
      
      <Toaster />
    </SidebarContext.Provider>
  );
}

export default App;
