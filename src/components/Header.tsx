import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente."
      });
      
      navigate('/auth');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  return (
    <div className="w-full bg-gray-900 p-4 flex justify-between items-center">
      <div className="flex-1 flex justify-center">
        <img 
          src="/lovable-uploads/0cf8f5b5-7e50-4a08-a69e-dabf7019839e.png" 
          alt="Izcalli - Servir con Pasión" 
          className="h-16 object-contain"
        />
      </div>
      <Button
        variant="ghost"
        className="text-white hover:bg-gray-800"
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Cerrar Sesión
      </Button>
    </div>
  );
};

export default Header;
