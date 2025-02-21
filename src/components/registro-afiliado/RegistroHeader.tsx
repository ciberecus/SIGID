
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RegistroHeaderProps {
  onBack: () => void;
}

const RegistroHeader = ({ onBack }: RegistroHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <Button
        variant="ghost"
        className="text-gray-400 hover:text-white"
        onClick={onBack}
      >
        <ArrowLeft className="mr-2" />
        Volver
      </Button>
      <h1 className="text-2xl font-bold text-white flex items-center">
        <UserPlus className="mr-2" />
        Registro de Afiliado
      </h1>
    </div>
  );
};

export default RegistroHeader;
