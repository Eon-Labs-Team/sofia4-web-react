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
import DynamicFormExample from "./pages/DynamicFormExample";
import FormBuilderExample from "./pages/FormBuilderExample";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import routes from "tempo-routes";
import Sidebar from "./components/layout/Sidebar";
import { Toaster } from "./components/ui/toaster";
import { useAuthStore } from "./lib/store/authStore";
import ProtectedRoute from "./components/auth/ProtectedRoute";

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
          path="/dynamic-form"
          element={
            <ProtectedRoute>
              <AuthenticatedLayout>
                <DynamicFormExample />
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
