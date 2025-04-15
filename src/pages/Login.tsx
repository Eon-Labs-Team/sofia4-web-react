import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/store/authStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [enterprise, setEnterprise] = useState('');

  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get auth state and actions from the store
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to the page they were trying to access, or to home page
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
      
      // Show welcome message
      toast({
        title: 'Bienvenido',
        description: 'Has iniciado sesión exitosamente.',
      });
    }
  }, [isAuthenticated, navigate, location, toast]);
  
  // Clear any previous errors when unmounting
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password ||!enterprise) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa usuario y contraseña',
        variant: 'destructive',
      });
      return;
    }
    
    // Call login action
    await login({ enterprise,username, password });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="enterprise">Empresa</Label>
              <Input
                id="enterprise"
                placeholder="Ingresa la empresa"
                value={enterprise}
                onChange={(e) => setEnterprise(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                placeholder="Ingresa tu nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center text-sm text-gray-600">
          <div>
            <p>Usuario de prueba: user / user123</p>
            <p>Admin de prueba: admin / admin123</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
