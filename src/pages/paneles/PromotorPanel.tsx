
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from '@/components/Header';
import {
  User,
  UserPlus,
  LogOut,
  Printer,
  Search,
  Users,
  Info
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  ubicacion_gps: string | null;
}

interface Promotor {
  nombre: string | null;
  email: string;
  fotografia: string | null;
}

const PromotorPanel = () => {
  const navigate = useNavigate();
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [filteredAfiliados, setFilteredAfiliados] = useState<Afiliado[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAfiliado, setSelectedAfiliado] = useState<Afiliado | null>(null);
  const [showCredencial, setShowCredencial] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [promotorInfo, setPromotorInfo] = useState<Promotor | null>(null);
  const [limiteAfiliados, setLimiteAfiliados] = useState<number>(50);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchAfiliados();
    fetchPromotorInfo();
    fetchLimiteAfiliados();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAfiliados(afiliados);
      return;
    }

    const searchTermLower = searchTerm.toLowerCase();
    const filtered = afiliados.filter(afiliado => 
      afiliado.nombre.toLowerCase().includes(searchTermLower) ||
      afiliado.apellido_paterno.toLowerCase().includes(searchTermLower) ||
      afiliado.apellido_materno.toLowerCase().includes(searchTermLower) ||
      afiliado.curp.toLowerCase().includes(searchTermLower)
    );
    setFilteredAfiliados(filtered);
  }, [searchTerm, afiliados]);

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

    if (error || userData?.rol !== 'Promotor') {
      toast({
        variant: "destructive",
        title: "Acceso denegado",
        description: "No tienes permiso para acceder a este panel.",
      });
      navigate('/');
    }
  };

  const fetchPromotorInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('usuarios')
      .select('nombre, email, fotografia')
      .eq('id', user.id)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar la información del promotor",
      });
      return;
    }

    setPromotorInfo(data);
  };

  const fetchAfiliados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('afiliados')
        .select('*')
        .eq('promotor_id', user.id);

      if (error) throw error;
      setAfiliados(data || []);
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

  const fetchLimiteAfiliados = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('asignaciones')
      .select('limite_afiliados')
      .eq('promotor_id', user.id)
      .single();

    if (!error && data) {
      setLimiteAfiliados(data.limite_afiliados);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handlePrintCredencial = (afiliado: Afiliado) => {
    setSelectedAfiliado(afiliado);
    setShowCredencial(true);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleShowDetails = (afiliado: Afiliado) => {
    setSelectedAfiliado(afiliado);
    setShowDetails(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const Credencial = ({ afiliado }: { afiliado: Afiliado }) => (
    <div className="print:block hidden p-4 bg-white rounded-lg shadow-lg w-[340px] h-[200px] border-2 border-gray-300">
      <div className="flex justify-between">
        <div>
          <h3 className="font-bold text-lg">Credencial de Afiliado</h3>
          <p className="text-sm mt-2">
            <span className="font-bold">Nombre:</span> {afiliado.nombre} {afiliado.apellido_paterno} {afiliado.apellido_materno}
          </p>
          <p className="text-sm">
            <span className="font-bold">CURP:</span> {afiliado.curp}
          </p>
          <p className="text-sm">
            <span className="font-bold">Clave Elector:</span> {afiliado.clave_elector}
          </p>
          <p className="text-sm">
            <span className="font-bold">Categoría:</span> {afiliado.categoria}
          </p>
        </div>
        {afiliado.fotografia && (
          <img 
            src={afiliado.fotografia} 
            alt="Foto del afiliado" 
            className="w-24 h-24 object-cover rounded-lg"
          />
        )}
      </div>
      <div className="mt-2 text-xs text-gray-600">
        <p>{afiliado.direccion}</p>
        {afiliado.telefono && <p>Tel: {afiliado.telefono}</p>}
      </div>
    </div>
  );

  const DetallesAfiliado = ({ afiliado }: { afiliado: Afiliado }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-24 w-24">
          {afiliado.fotografia ? (
            <AvatarImage src={afiliado.fotografia} alt={`${afiliado.nombre} ${afiliado.apellido_paterno}`} />
          ) : (
            <AvatarFallback className="text-2xl">{afiliado.nombre[0]}{afiliado.apellido_paterno[0]}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <h3 className="text-xl font-bold">
            {afiliado.nombre} {afiliado.apellido_paterno} {afiliado.apellido_materno}
          </h3>
          <p className="text-gray-500">Categoría: {afiliado.categoria}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold">CURP</p>
          <p className="text-gray-600">{afiliado.curp}</p>
        </div>
        <div>
          <p className="font-semibold">Clave de Elector</p>
          <p className="text-gray-600">{afiliado.clave_elector}</p>
        </div>
        <div>
          <p className="font-semibold">Fecha de Nacimiento</p>
          <p className="text-gray-600">{formatDate(afiliado.fecha_nacimiento)}</p>
        </div>
        <div>
          <p className="font-semibold">Teléfono</p>
          <p className="text-gray-600">{afiliado.telefono || 'No proporcionado'}</p>
        </div>
      </div>

      <div>
        <p className="font-semibold">Dirección</p>
        <p className="text-gray-600">{afiliado.direccion}</p>
      </div>

      {afiliado.ubicacion_gps && (
        <div>
          <p className="font-semibold">Ubicación GPS</p>
          <p className="text-gray-600">{afiliado.ubicacion_gps}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="p-4">
        <div className="flex flex-col gap-4 mb-6">
          {promotorInfo && (
            <div className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg">
              <Avatar className="h-12 w-12">
                {promotorInfo.fotografia ? (
                  <AvatarImage src={promotorInfo.fotografia} alt={promotorInfo.nombre || 'Promotor'} />
                ) : (
                  <AvatarFallback>{promotorInfo.nombre ? promotorInfo.nombre[0] : 'P'}</AvatarFallback>
                )}
              </Avatar>
              <div className="text-white">
                <h2 className="font-medium">{promotorInfo.nombre || 'Promotor'}</h2>
                <p className="text-sm text-gray-400">{promotorInfo.email}</p>
              </div>
              <div className="ml-auto flex items-center gap-2 bg-gray-700 px-4 py-2 rounded-lg">
                <Users size={20} className="text-gray-400" />
                <div className="text-white">
                  <span className="font-bold">{afiliados.length}</span>
                  <span className="text-gray-400"> / </span>
                  <span className="text-gray-400">{limiteAfiliados}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <User className="mr-2" />
              Panel de Promotor
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={() => navigate('/registro-afiliado')}
                className="bg-green-600 hover:bg-green-700"
                disabled={afiliados.length >= limiteAfiliados}
              >
                <UserPlus className="mr-2" />
                Nuevo Afiliado
              </Button>
              <Button
                onClick={handleLogout}
                variant="destructive"
              >
                <LogOut className="mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        {afiliados.length >= limiteAfiliados && (
          <div className="mb-4 p-3 bg-yellow-600/20 border border-yellow-600/40 rounded-lg text-yellow-200">
            Has alcanzado el límite máximo de afiliados asignados ({limiteAfiliados}). Contacta a tu supervisor si necesitas registrar más.
          </div>
        )}

        <div className="mb-6 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre o CURP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 text-white border-gray-700"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-white">Cargando...</div>
        ) : (
          <div className="grid gap-4">
            {filteredAfiliados.map((afiliado) => (
              <div
                key={afiliado.id}
                className="bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center"
              >
                <div className="flex items-center gap-4 text-white">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-12 w-12">
                      {afiliado.fotografia ? (
                        <AvatarImage src={afiliado.fotografia} alt={`${afiliado.nombre} ${afiliado.apellido_paterno}`} />
                      ) : (
                        <AvatarFallback>{afiliado.nombre[0]}{afiliado.apellido_paterno[0]}</AvatarFallback>
                      )}
                    </Avatar>
                    <Button
                      onClick={() => handleShowDetails(afiliado)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                    >
                      <Info className="w-4 h-4 mr-1" />
                      Detalles
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-bold">
                      {afiliado.nombre} {afiliado.apellido_paterno} {afiliado.apellido_materno}
                    </h3>
                    <p className="text-gray-400">
                      CURP: {afiliado.curp}
                    </p>
                    <p className="text-gray-400">
                      Categoría: {afiliado.categoria}
                    </p>
                  </div>
                </div>
                <div>
                  <Button
                    onClick={() => handlePrintCredencial(afiliado)}
                    variant="outline"
                  >
                    <Printer className="mr-2" />
                    Imprimir Credencial
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCredencial && selectedAfiliado && (
        <Credencial afiliado={selectedAfiliado} />
      )}

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Afiliado</DialogTitle>
          </DialogHeader>
          {selectedAfiliado && <DetallesAfiliado afiliado={selectedAfiliado} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromotorPanel;
