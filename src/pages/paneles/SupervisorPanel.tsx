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
    if (!editingPromotor || nuevoLimite <= 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El límite debe ser mayor a 0",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Primero verificamos si hay una asignación existente
      const { data: existingAssignment, error: checkError } = await supabase
        .from('asignaciones')
        .select('*')
        .eq('promotor_id', editingPromotor.promotorId)
        .eq('supervisor_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 es el código para "no se encontraron resultados"
        throw checkError;
      }

      let error;
      if (!existingAssignment) {
        // Si no existe, creamos una nueva asignación
        const { error: insertError } = await supabase
          .from('asignaciones')
          .insert([{
            supervisor_id: user.id,
            promotor_id: editingPromotor.promotorId,
            limite_afiliados: nuevoLimite
          }]);
        error = insertError;
      } else {
        // Si existe, actualizamos el límite
        const { error: updateError } = await supabase
          .from('asignaciones')
          .update({ limite_afiliados: nuevoLimite })
          .eq('promotor_id', editingPromotor.promotorId)
          .eq('supervisor_id', user.id);
        error = updateError;
      }

      if (error) throw error;

      // Actualizamos el estado local inmediatamente
      setAfiliados(prevAfiliados => 
        prevAfiliados.map(promotor => 
          promotor.promotorId === editingPromotor.promotorId
            ? { ...promotor, limiteAfiliados: nuevoLimite }
            : promotor
        )
      );

      toast({
        title: "Límite actualizado",
        description: "El límite de afiliados ha sido actualizado correctamente.",
      });

      setEditingPromotor(null);
      setNuevoLimite(0);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar el límite",
      });
    }
  };

  const handleEditPromotor = (promotor: any) => {
    setEditingPromotor(promotor);
    setNuevoLimite(promotor.limiteAfiliados);
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
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4 mb-6">
          {supervisorData && (
            <div className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg">
              <div className="text-white">
                <h2 className="font-medium">{supervisorData.nombre || 'Supervisor'}</h2>
                <p className="text-sm text-gray-400">{supervisorData.email}</p>
              </div>
              <Button
                onClick={() => navigate('/auth')}
                variant="destructive"
                size="sm"
                className="ml-auto"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-3">
          <StatCard
            title="Total de Afiliados"
            value={getTotalAfiliados()}
            icon={<Users className="h-4 w-4" />}
          />
          <StatCard
            title="Promedio por Promotor"
            value={getPromedioAfiliados()}
            icon={<Target className="h-4 w-4" />}
          />
          <StatCard
            title="Mejor Promotor"
            value={getMejorPromotor()?.promotorInfo?.nombre || 'N/A'}
            subValue={`${getMejorPromotor()?.afiliados.length || 0} afiliados`}
            icon={<TrendingUp className="h-4 w-4" />}
          />
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Promotores Asignados</h2>
          <Button
            onClick={printPromotores}
            variant="outline"
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Lista
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-white">Cargando...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {afiliados.map((promotor) => (
              <PromotorCard
                key={promotor.promotorId}
                promotor={promotor}
                onEditLimit={() => handleEditPromotor(promotor)}
                onViewAfiliados={(promotorId, promotorNombre) => navigate(`/afiliados/${promotorId}`)}
              />
            ))}
          </div>
        )}

        {/* Modal para editar límite */}
        <Dialog open={!!editingPromotor} onOpenChange={(open) => !open && setEditingPromotor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Límite de Afiliados</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Promotor: {editingPromotor?.promotorInfo?.nombre || editingPromotor?.promotorInfo?.email}
                </label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="1"
                    value={nuevoLimite}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= 0) {
                        setNuevoLimite(value);
                      }
                    }}
                    placeholder="Nuevo límite de afiliados"
                  />
                </div>
                {editingPromotor && (
                  <p className="text-sm text-muted-foreground">
                    Afiliados actuales: {editingPromotor.afiliados.length}
                  </p>
                )}
                {nuevoLimite < (editingPromotor?.afiliados?.length || 0) && (
                  <p className="text-sm text-destructive">
                    Advertencia: El nuevo límite es menor que el número actual de afiliados
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingPromotor(null)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateLimite}
                disabled={nuevoLimite <= 0}
              >
                Guardar cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SupervisorPanel;
