import { Suspense, useState, useEffect } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import Cuarteles from "./pages/Cuarteles";
import ListaCuarteles from "./pages/ListaCuarteles";
import ListaCuadrillas from "./pages/ListaCuadrillas";
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

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAuthenticated } = useAuthStore();

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Layout with sidebar for authenticated users
  const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <main className="flex-1 transition-all duration-300 overflow-auto">
        <Suspense fallback={<p>Loading...</p>}>
          {children}
        </Suspense>
      </main>
    </div>
  );

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Protected routes with sidebar layout */}
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
          path="/cuarteles"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Cuarteles />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/lista-cuarteles"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ListaCuarteles />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/lista-cuadrillas"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ListaCuadrillas />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/monitoreo-estado-fenologico"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <MonitoreoEstadoFenologico />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/monitoreo-maleza"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <MonitoreoMaleza />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/analisis-suelo"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <SoilAnalysis />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/fertilizacion-suelo"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <FertilizacionSuelo />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/registro-riego"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <IrrigationRecord />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/analisis-foliar"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <AnalisisFoliar />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/eventos-climaticos"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <EventosClimaticos />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/limpieza-maquinaria"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <LimpiezaMaquinaria />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/limpieza-instalaciones"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <FacilityCleaning />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
            path="/balance-masa"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <MassBalance />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
        
        
        <Route
          path="/analisis-agua"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <AnalisisAgua />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/calibrar-aspersion"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <CalibrarAspersion />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/form-builder"
          element={
            <ProtectedRoute requiredRole="admin">
              <AuthenticatedLayout>
                <FormBuilderExample />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/mantencion-riego-tecnificado"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <TechnicalIrrigationMaintenance />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/ingreso-animales"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <AnimalAdmission />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/aforo-sector-riego"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <IrrigationSectorCapacity />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/retiro-residuos"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <WasteRemoval />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/manejo-residuos"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <WasteManagement />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/calibracion-equipos"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <EquipmentCalibration />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/calibracion-equipos-medicion"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <CalibrationMeasuringEquipment />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/back-pump-calculation"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <BackPumpCalculation />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/visitor-log"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <VisitorLog />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/personnel-provision"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <PersonnelProvision />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/capacitaciones"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Capacitaciones />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/lavado-manos"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <LavadoManos />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/electricity-consumption"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <ElectricityConsumption />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/water-consumption"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <WaterConsumption />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/hygiene-sanitation"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <HygieneSanitation />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/calicata"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <Calicata />
              </AuthenticatedLayout>
            </ProtectedRoute>
          }
        />
        
        {/* Tempo routes (if applicable) */}
        {import.meta.env.VITE_TEMPO === "true" && (
          <Route
            path="/tempobook/*"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  {useRoutes(routes)}
                </AuthenticatedLayout>
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
    </>
  );
}

export default App;
