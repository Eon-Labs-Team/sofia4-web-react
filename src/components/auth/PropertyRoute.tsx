import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store/authStore';
import { toast } from '@/components/ui/use-toast';

interface PropertyRouteProps {
  children: React.ReactNode;
}

/**
 * PropertyRoute ensures the user has selected a property
 * before allowing access to property-specific routes
 */
const PropertyRoute: React.FC<PropertyRouteProps> = ({ children }) => {
  const { propertyId } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if propertyId exists in the auth store
  React.useEffect(() => {
    if (!propertyId) {
      toast({
        title: "Acceso denegado",
        description: "Debe seleccionar una propiedad primero para acceder a esta página.",
        variant: "destructive",
      });
      // Navigate back to home after showing toast
      navigate('/');
    }
  }, [propertyId, navigate]);
  
  // If there's no propertyId, show nothing while redirecting
  if (!propertyId) {
    return null;
  }
  
  // If propertyId exists, render the children
  return <>{children}</>;
};

export default PropertyRoute; 