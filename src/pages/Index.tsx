
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogIn } from "lucide-react";
import Header from '@/components/Header';

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log("Usuario autenticado:", user);
        await redirectBasedOnRole(user.id);
      }
    } catch (error) {
      console.error("Error al verificar sesión:", error);
    }
  };

  const redirectBasedOnRole = async (userId: string) => {
    try {
      console.log("Obteniendo rol para usuario:", userId);
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error al obtener rol:', error);
        throw error;
      }

      if (!data) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se encontró el usuario",
        });
        return;
      }

      switch (data.rol) {
        case 'Administrador':
          navigate('/admin');
          break;
        case 'Supervisor':
          navigate('/supervisor');
          break;
        case 'Promotor':
          navigate('/promotor');
          break;
        default:
          toast({
            variant: "destructive",
            title: "Error",
            description: "Rol no válido: " + data.rol,
          });
      }
    } catch (error: any) {
      console.error("Error en redirectBasedOnRole:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al obtener el rol del usuario: " + error.message,
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Intentando iniciar sesión con:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        console.log("Login exitoso:", data.user);
        await redirectBasedOnRole(data.user.id);
      }
    } catch (error: any) {
      console.error("Error en login:", error);
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#800020]">
      <Header />
      <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
        <div className="bg-gray-900 bg-opacity-90 p-8 rounded-lg shadow-2xl w-full max-w-md space-y-6 border border-gray-800">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">¡Bienvenido!</h1>
            <p className="text-gray-400">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white"
            >
              {isLoading ? (
                'Iniciando sesión...'
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Credenciales de prueba:
            </p>
            <p className="text-xs text-gray-500">
              Email: ciberecus@gmail.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
