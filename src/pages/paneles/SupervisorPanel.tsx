import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from '@/components/Header';
import { StatCard } from '@/components/supervisor/StatCard';
import { PromotorCard } from '@/components/supervisor/PromotorCard';
import {
  Users,
  UserCheck,
  LogOut,
  Printer,
  Target,
  TrendingUp
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const SupervisorPanel = () => {
  const navigate = useNavigate();
  const [afiliados, setAfiliados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supervisorData, setSupervisorData] = useState<any>(null);
  const [editingPromotor, setEditingPromotor] = useState<any>(null);
  const [nuevoLimite, setNuevoLimite] = useState<number>(0);

  useEffect(() => {
    checkAuth();
    fetchAfiliados();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: userData, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || userData?.rol !== 'Supervisor') {
      toast({
        variant: "destructive",
        title: "Acceso denegado",
        description: "No tienes permiso para acceder a este panel.",
      });
      navigate('/');
      return;
    }

    setSupervisorData(userData);
  };

  const fetchAfiliados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Primero, obtener todas las asignaciones del supervisor
      const { data: asignaciones, error: asignacionesError } = await supabase
        .from('asignaciones')
        .select('promotor_id, limite_afiliados')
        .eq('supervisor_id', user.id);

      if (asignacionesError) throw asignacionesError;

      // Obtener IDs únicos de promotores
      const promotorIds = [...new Set(asignaciones?.map(a => a.promotor_id) || [])];

      // Obtener información de usuarios (promotores) y sus afiliados
      const { data: promotoresData, error: promotoresError } = await supabase
        .from('usuarios')
        .select('*')
        .in('id', promotorIds);

      if (promotoresError) throw promotoresError;

      const { data: afiliadosData, error: afiliadosError } = await supabase
        .from('afiliados')
        .select('*')
        .in('promotor_id', promotorIds);

      if (afiliadosError) throw afiliadosError;

      // Estructurar los datos
      const afiliadosPorPromotor = promotorIds.map(promotorId => {
        const promotorInfo = promotoresData.find(p => p.id === promotorId);
        const afiliadosPromotor = afiliadosData.filter(a => a.promotor_id === promotorId);
        const asignacion = asignaciones.find(a => a.promotor_id === promotorId);
        
        return {
          promotorId,
          promotorInfo,
          afiliados: afiliadosPromotor,
          limiteAfiliados: asignacion?.limite_afiliados || 50
        };
      });

      setAfiliados(afiliadosPorPromotor);
    } catch (error: any) {
      console.error('Error al obtener datos:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLimite = async () => {
    if (!editingPromotor) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('asignaciones')
        .update({ limite_afiliados: nuevoLimite })
        .eq('promotor_id', editingPromotor.promotorId)
        .eq('supervisor_id', user.id);

      if (error) throw error;

      toast({
        title: "Límite actualizado",
        description: "El límite de afiliados ha sido actualizado correctamente.",
      });

      setEditingPromotor(null);
      fetchAfiliados();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const getTotalAfiliados = () => {
    return afiliados.reduce((total, promotor) => total + promotor.afiliados.length, 0);
  };

  const getPromedioAfiliados = () => {
    if (afiliados.length === 0) return 0;
    return (getTotalAfiliados() / afiliados.length).toFixed(1);
  };

  const getMejorPromotor = () => {
    if (afiliados.length === 0) return null;
    return afiliados.reduce((mejor, actual) => 
      actual.afiliados.length > mejor.afiliados.length ? actual : mejor
    );
  };

  const printPromotores = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const promotoresContent = afiliados.map(promotor => `
      <tr>
        <td>${promotor.promotorInfo?.nombre || promotor.promotorInfo?.email}</td>
        <td>${promotor.promotorInfo?.email}</td>
        <td>${promotor.afiliados.length}</td>
        <td>${promotor.limiteAfiliados}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Listado de Promotores</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 8pt; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ccc; padding: 4px; text-align: left; }
            th { background-color: #f0f0f0; }
            .header { font-size: 10pt; font-weight: bold; margin-bottom: 10px; }
            .date { font-size: 8pt; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            Listado de Promotores Asignados
            <div class="date">Fecha: ${new Date().toLocaleDateString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Afiliados Registrados</th>
                <th>Límite de Afiliados</th>
              </tr>
            </thead>
            <tbody>
              ${promotoresContent}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const mejorPromotor = getMejorPromotor();

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Panel de Supervisor</h1>
          <Button onClick={printPromotores}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir reporte
          </Button>
        </div>

        {/* Estadísticas generales */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <StatCard
            title="Total de Promotores"
            value={afiliados.length}
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Total de Afiliados"
            value={getTotalAfiliados()}
            icon={<UserCheck className="h-4 w-4" />}
          />
          <StatCard
            title="Promedio de Afiliados"
            value={getPromedioAfiliados()}
            icon={<Target className="h-4 w-4" />}
            description="Por promotor"
          />
          <StatCard
            title="Mejor Promotor"
            value={mejorPromotor ? mejorPromotor.afiliados.length : 0}
            icon={<TrendingUp className="h-4 w-4" />}
            description={mejorPromotor?.promotorInfo?.nombre || 'No hay datos'}
          />
        </div>

        {/* Lista de promotores */}
        <h2 className="text-xl font-semibold mb-4">Promotores Asignados</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {afiliados.map((promotor: any) => (
            <PromotorCard
              key={promotor.promotorId}
              promotor={promotor}
              onEditLimit={(id, currentLimit) => {
                setEditingPromotor(promotor);
                setNuevoLimite(currentLimit);
              }}
              onViewAfiliados={(id, nombre) => {
                navigate(`/afiliados/${id}`);
              }}
            />
          ))}
        </div>

        {/* Modal para editar límite */}
        <Dialog open={!!editingPromotor} onOpenChange={() => setEditingPromotor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Límite de Afiliados</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                type="number"
                value={nuevoLimite}
                onChange={(e) => setNuevoLimite(parseInt(e.target.value))}
                min={1}
                className="w-full"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPromotor(null)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateLimite}>
                Guardar cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default SupervisorPanel;
