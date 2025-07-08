import { Suspense, useState, useEffect } from "react";
import { useRoutes, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home, { SidebarContext } from "./pages/home";
import Faenas from "./pages/Faenas";
import Labores from "./pages/Labores";
import ListaCuarteles from "./pages/ListaCuarteles";
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
import Sidebar from "./components/layout/Sidebar";
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
import UnidadesMedida from "./pages/unidadesMedida";
import ProductCategories from "./pages/ProductCategories";
import TrabajosRealizados from "./pages/TrabajosRealizados";
import TipoCultivo from "./pages/TipoCultivo";
import Variedades from "./pages/Variedades";
import TiposSuelo from "./pages/TiposSuelo";
import SubcategoryProduct from "./pages/subcategory-product";
import OrdenAplicacion from "./pages/OrdenAplicacion";
import FaenasAgricolas from "./pages/faenas-agricolas";
import { useSidebarStore } from "./lib/store/sidebarStore";

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const { actionMode } = useSidebarStore();

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Determine if sidebar should be shown based on current route and action mode
  const shouldShowSidebar = () => {
    return location.pathname !== "/" || actionMode;
  };

  // Contexto para proporcionar la función de toggle a los componentes hijos
  const sidebarContextValue = {
    toggleSidebar: () => setSidebarCollapsed(prev => !prev)
  };

  // Layout with sidebar for authenticated users
  const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
    const showSidebar = shouldShowSidebar();
    
    return (
      <div className="flex h-screen overflow-hidden">
        {showSidebar && (
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onToggle={handleSidebarToggle}
          />
        )}
        <main className="flex-1 overflow-auto">
          <Suspense fallback={<p>Cargando...</p>}>
            {children}
          </Suspense>
        </main>
      </div>
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
          path="/variedades"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <Variedades />
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
          path="/limpieza-instalaciones"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <FacilityCleaning />
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
          path="/unidades-medida"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <UnidadesMedida />
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
          path="/tipo-cultivo"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <TipoCultivo />
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
          path="/tipos-suelo"
          element={
            <ProtectedRoute>
              <PropertyRoute>
                <AuthenticatedLayout>
                  <TiposSuelo />
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
