import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Search, UserCheck } from 'lucide-react';

interface Afiliado {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  curp: string;
  clave_elector: string;
  direccion: string;
  telefono: string | null;
  categoria: string;
  fotografia: string | null;
  fecha_nacimiento: string;
}

const AfiliadosLista = () => {
  const { promotorId } = useParams();
  const navigate = useNavigate();
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [promotorInfo, setPromotorInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkAuth();
    fetchData();
  }, [promotorId]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: userData, error } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (error || userData?.rol !== 'Supervisor') {
      toast({
        variant: "destructive",
        title: "Acceso denegado",
        description: "No tienes permiso para ver esta información.",
      });
      navigate('/');
    }
  };

  const fetchData = async () => {
    try {
      // Obtener información del promotor
      const { data: promotorData, error: promotorError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', promotorId)
        .single();

      if (promotorError) throw promotorError;
      setPromotorInfo(promotorData);

      // Obtener afiliados del promotor
      const { data: afiliadosData, error: afiliadosError } = await supabase
        .from('afiliados')
        .select('*')
        .eq('promotor_id', promotorId);

      if (afiliadosError) throw afiliadosError;
      setAfiliados(afiliadosData || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAfiliados = afiliados.filter(afiliado => {
    const searchLower = searchTerm.toLowerCase();
    return (
      afiliado.nombre.toLowerCase().includes(searchLower) ||
      afiliado.apellido_paterno.toLowerCase().includes(searchLower) ||
      afiliado.apellido_materno.toLowerCase().includes(searchLower) ||
      afiliado.curp.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-white">
            Afiliados del Promotor
          </h1>
        </div>

        {promotorInfo && (
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {promotorInfo.fotografia ? (
                  <AvatarImage src={promotorInfo.fotografia} />
                ) : (
                  <AvatarFallback>
                    {promotorInfo.nombre ? promotorInfo.nombre[0] : 'P'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {promotorInfo.nombre || promotorInfo.email}
                </h2>
                <p className="text-gray-400">{promotorInfo.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <UserCheck className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">
                    {afiliados.length} afiliados registrados
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por nombre o CURP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 text-white border-gray-700"
          />
        </div>

        {loading ? (
          <div className="text-center text-white">Cargando...</div>
        ) : (
          <div className="space-y-4">
            {filteredAfiliados.map((afiliado) => (
              <div
                key={afiliado.id}
                className="bg-gray-800 p-4 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    {afiliado.fotografia ? (
                      <AvatarImage src={afiliado.fotografia} alt={afiliado.nombre} />
                    ) : (
                      <AvatarFallback>
                        {afiliado.nombre[0]}{afiliado.apellido_paterno[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {afiliado.nombre} {afiliado.apellido_paterno} {afiliado.apellido_materno}
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm">
                      <p className="text-gray-400">
                        <span className="text-gray-500">CURP:</span> {afiliado.curp}
                      </p>
                      <p className="text-gray-400">
                        <span className="text-gray-500">Clave Elector:</span> {afiliado.clave_elector}
                      </p>
                      <p className="text-gray-400">
                        <span className="text-gray-500">Categoría:</span> {afiliado.categoria}
                      </p>
                      <p className="text-gray-400">
                        <span className="text-gray-500">Fecha de Nacimiento:</span>{' '}
                        {formatDate(afiliado.fecha_nacimiento)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredAfiliados.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                No se encontraron afiliados que coincidan con la búsqueda
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AfiliadosLista;
