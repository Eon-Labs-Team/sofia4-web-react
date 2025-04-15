import { Suspense, useState, useEffect } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import Cuarteles from "./pages/Cuarteles";
import ListaCuarteles from "./pages/ListaCuarteles";
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
