import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/authStore';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Acceso No Autorizado</CardTitle>
          <CardDescription className="text-center">
            No tienes permiso para acceder a esta página.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="text-center text-gray-700">
            <p className="mb-2">
              Tu cuenta de usuario ({user?.username || 'Desconocido'}) no cuenta con los permisos necesarios para 
              acceder al recurso solicitado.
            </p>
            <p>
              Si crees que deberías tener acceso, por favor contacta al administrador del sistema.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => navigate('/')} 
            className="flex items-center"
          >
            <Home className="mr-2 h-4 w-4" />
            Volver al Inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Unauthorized; 