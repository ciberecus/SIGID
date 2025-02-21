
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from '@/components/Header';

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectBasedOnRole = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('rol, activo')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (!userData.activo) {
        toast({
          variant: "destructive",
          title: "Acceso denegado",
          description: "Tu cuenta está desactivada. Contacta al administrador.",
        });
        await supabase.auth.signOut();
        return;
      }

      switch (userData.rol) {
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
          navigate('/');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (data.user) {
          await redirectBasedOnRole(data.user.id);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada. Por favor, espera a que el administrador active tu cuenta.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      style={{
        backgroundImage: "url('https://storage.googleapis.com/lovable-data/b8efc156-fa40-446f-b592-5409956bf37e.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh'
      }}
    >
      <div className="min-h-screen bg-black/30 backdrop-blur-sm">
        <Header />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-64px)]">
          <div className="w-full max-w-md space-y-6">
            <h2 className="text-2xl font-semibold text-center text-white mb-2">
              Servir con Pasión
            </h2>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Introduce tu usuario..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/20 border-white/30 text-white placeholder:text-white/70 backdrop-blur-md"
                />
              </div>
              
              <div>
                <Input
                  type="password"
                  placeholder="Introduce tu contraseña..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/20 border-white/30 text-white placeholder:text-white/70 backdrop-blur-md"
                />
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <button
                  type="button"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#800020] hover:bg-[#600018] text-white"
              >
                {isLoading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
              </Button>
            </form>
            
            <div className="text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-white/80 hover:text-white transition-colors"
              >
                {isLogin ? (
                  <>¿No tienes una cuenta? <span className="text-amber-300">Crear Cuenta</span></>
                ) : (
                  <>¿Ya tienes una cuenta? <span className="text-amber-300">Iniciar Sesión</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
