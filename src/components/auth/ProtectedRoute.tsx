import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredPermission,
  requiredRole
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page, but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check for required permission
  if (requiredPermission && user) {
    const hasPermission = user.permissions.includes(requiredPermission);
    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // Check for required role
  if (requiredRole && user) {
    if (user.role !== requiredRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // If all checks pass, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute; 