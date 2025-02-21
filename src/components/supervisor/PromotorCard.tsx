import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ClipboardList, Edit } from "lucide-react";

interface PromotorCardProps {
  promotor: any;
  onEditLimit: (promotorId: string, currentLimit: number) => void;
  onViewAfiliados: (promotorId: string, promotorNombre: string) => void;
}

export const PromotorCard = ({
  promotor,
  onEditLimit,
  onViewAfiliados
}: PromotorCardProps) => {
  const progress = (promotor.afiliados.length / promotor.limiteAfiliados) * 100;
  const initials = promotor.promotorInfo?.nombre
    ? promotor.promotorInfo.nombre.split(' ').map((n: string) => n[0]).join('')
    : '??';

  return (
    <Card className="bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={promotor.promotorInfo?.fotografia} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base font-medium">
              {promotor.promotorInfo?.nombre || promotor.promotorInfo?.email}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {promotor.promotorInfo?.email}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Afiliados registrados: {promotor.afiliados.length}</span>
              <span>Límite: {promotor.limiteAfiliados}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEditLimit(promotor.promotorId, promotor.limiteAfiliados)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar límite
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewAfiliados(promotor.promotorId, promotor.promotorInfo?.nombre)}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Ver afiliados
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
