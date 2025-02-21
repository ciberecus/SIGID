import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface Seccion {
  id: number;
  numero_seccion: number;
}

interface AfiliadoFormProps {
  formData: {
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string;
    curp: string;
    clave_elector: string;
    fecha_nacimiento: string;
    direccion: string;
    telefono: string;
    seccion_id: string;
    categoria: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const AfiliadoForm = ({ formData, onChange }: AfiliadoFormProps) => {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSecciones = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Iniciando fetch de secciones...');
        
        const { data: seccionesData, error: seccionesError } = await supabase
          .from('secciones')
          .select('id, numero_seccion')
          .order('numero_seccion');

        if (seccionesError) {
          console.error('Error Supabase:', seccionesError);
          throw seccionesError;
        }

        if (!seccionesData) {
          console.log('No se encontraron secciones');
          throw new Error('No se encontraron secciones');
        }

        console.log('Secciones obtenidas:', seccionesData);

        if (isMounted) {
          setSecciones(seccionesData);
          if (seccionesData.length === 0) {
            setError('No hay secciones disponibles');
          }
        }
      } catch (err) {
        console.error('Error al cargar secciones:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Error al cargar secciones');
          toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudieron cargar las secciones electorales.",
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSecciones();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    console.log('Estado actual de secciones:', secciones);
  }, [secciones]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300">
          Nombre
        </label>
        <Input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={onChange}
          required
          className="mt-1"
          placeholder="Nombre(s)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Apellido Paterno
        </label>
        <Input
          type="text"
          name="apellido_paterno"
          value={formData.apellido_paterno}
          onChange={onChange}
          required
          className="mt-1"
          placeholder="Apellido Paterno"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Apellido Materno
        </label>
        <Input
          type="text"
          name="apellido_materno"
          value={formData.apellido_materno}
          onChange={onChange}
          required
          className="mt-1"
          placeholder="Apellido Materno"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          CURP
        </label>
        <Input
          type="text"
          name="curp"
          value={formData.curp}
          onChange={onChange}
          required
          className="mt-1"
          placeholder="CURP"
          maxLength={18}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Clave de Elector
        </label>
        <Input
          type="text"
          name="clave_elector"
          value={formData.clave_elector}
          onChange={onChange}
          required
          className="mt-1"
          placeholder="Clave de Elector"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Fecha de Nacimiento
        </label>
        <Input
          type="date"
          name="fecha_nacimiento"
          value={formData.fecha_nacimiento}
          onChange={onChange}
          required
          className="mt-1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Dirección
        </label>
        <Input
          type="text"
          name="direccion"
          value={formData.direccion}
          onChange={onChange}
          required
          className="mt-1"
          placeholder="Dirección completa"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Teléfono
        </label>
        <Input
          type="tel"
          name="telefono"
          value={formData.telefono}
          onChange={onChange}
          className="mt-1"
          placeholder="Teléfono (opcional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Sección Electoral
        </label>
        <select
          name="seccion_id"
          value={formData.seccion_id}
          onChange={onChange}
          required
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          disabled={loading}
        >
          <option value="">Seleccione una sección</option>
          {secciones.map((seccion) => (
            <option key={seccion.id} value={seccion.id}>
              {seccion.numero_seccion}
            </option>
          ))}
        </select>
        {loading && (
          <p className="text-sm text-gray-400 mt-1">Cargando secciones...</p>
        )}
        {error && (
          <p className="text-sm text-red-500 mt-1">{error}</p>
        )}
        {!loading && !error && secciones.length === 0 && (
          <p className="text-sm text-yellow-500 mt-1">No hay secciones disponibles</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          Categoría
        </label>
        <select
          name="categoria"
          value={formData.categoria}
          onChange={onChange}
          required
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="Militante">Militante</option>
          <option value="Simpatizante">Simpatizante</option>
          <option value="Indeciso">Indeciso</option>
          <option value="Adversario">Adversario</option>
        </select>
      </div>
    </div>
  );
};

export default AfiliadoForm;
