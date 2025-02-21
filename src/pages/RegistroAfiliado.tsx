import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus } from "lucide-react";
import LocationMap from '@/components/registro-afiliado/LocationMap';
import AfiliadoForm from '@/components/registro-afiliado/AfiliadoForm';
import CameraPreview from '@/components/registro-afiliado/CameraPreview';
import RegistroHeader from '@/components/registro-afiliado/RegistroHeader';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoiY2liZXJlY3VzIiwiYSI6ImNtN2JjbHNwOTBlajIyaXB2ZWI3c2NidXoifQ.CEJ9JxIKQTFZcICe7OeETQ';

const RegistroAfiliado = () => {
  const navigate = useNavigate();
  const [coordinates, setCoordinates] = useState<[number, number]>([0, 0]);
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    curp: '',
    clave_elector: '',
    fecha_nacimiento: '',
    direccion: '',
    telefono: '',
    seccion_id: '',
    categoria: 'Simpatizante' as const,
    ubicacion_gps: '',
    fotografia: null as string | null
  });

  useEffect(() => {
    const getCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('Posición GPS obtenida:', { latitude, longitude });
            setCoordinates([longitude, latitude]);
            setFormData(prev => ({
              ...prev,
              ubicacion_gps: `${latitude},${longitude}`
            }));
          },
          (error) => {
            console.error('Error al obtener ubicación:', error);
            toast({
              variant: "destructive",
              title: "Error de ubicación",
              description: "No se pudo obtener la ubicación GPS. Por favor, permite el acceso a tu ubicación.",
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      }
    };

    getCurrentLocation();
  }, []);

  const handleLocationChange = (lat: number, lng: number) => {
    console.log('Actualizando ubicación:', { lat, lng });
    setFormData(prev => ({
      ...prev,
      ubicacion_gps: `${lat},${lng}`
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageCapture = (imageData: string) => {
    setFormData(prev => ({
      ...prev,
      fotografia: imageData || null
    }));
  };

  const handleCredentialData = (data: {
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    curp?: string;
    clave_elector?: string;
    direccion?: string;
  }) => {
    console.log('Datos extraídos de la credencial:', data);
    
    // Actualizar el formulario con los datos extraídos, manteniendo los datos existentes si no hay nuevos
    setFormData(prev => {
      const newData = {
        ...prev,
        nombre: data.nombre?.trim() || prev.nombre,
        apellido_paterno: data.apellido_paterno?.trim() || prev.apellido_paterno,
        apellido_materno: data.apellido_materno?.trim() || prev.apellido_materno,
        curp: data.curp?.trim() || prev.curp,
        clave_elector: data.clave_elector?.trim() || prev.clave_elector,
        direccion: data.direccion?.trim() || prev.direccion
      };
      
      console.log('Datos actualizados del formulario:', newData);
      return newData;
    });

    toast({
      title: "Datos extraídos",
      description: "Los datos de la credencial han sido procesados exitosamente.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validar campos obligatorios
      const requiredFields = [
        { key: 'nombre', label: 'Nombre' },
        { key: 'apellido_paterno', label: 'Apellido Paterno' },
        { key: 'apellido_materno', label: 'Apellido Materno' },
        { key: 'curp', label: 'CURP' },
        { key: 'clave_elector', label: 'Clave de Elector' },
        { key: 'fecha_nacimiento', label: 'Fecha de Nacimiento' },
        { key: 'direccion', label: 'Dirección' },
        { key: 'seccion_id', label: 'Sección' },
        { key: 'categoria', label: 'Categoría' }
      ];

      // Verificar campos vacíos
      const emptyFields = requiredFields.filter(field => !formData[field.key]?.trim());
      if (emptyFields.length > 0) {
        const missingFields = emptyFields.map(field => field.label).join(', ');
        toast({
          variant: "destructive",
          title: "Error de validación",
          description: `Por favor complete los siguientes campos: ${missingFields}`,
        });
        return;
      }

      // Validar fotografía
      if (!formData.fotografia) {
        toast({
          variant: "destructive",
          title: "Error de validación",
          description: "Debe capturar una fotografía del afiliado.",
        });
        return;
      }

      // Validar ubicación GPS
      if (!formData.ubicacion_gps) {
        toast({
          variant: "destructive",
          title: "Error de validación",
          description: "Debe permitir el acceso a la ubicación GPS.",
        });
        return;
      }

      // Validar formato de CURP
      const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/;
      if (formData.curp && !curpRegex.test(formData.curp.toUpperCase())) {
        toast({
          variant: "destructive",
          title: "Error de validación",
          description: "El formato de la CURP no es válido.",
        });
        return;
      }

      // Validar formato de Clave de Elector (18 caracteres alfanuméricos, incluyendo letras y números)
      if (formData.clave_elector) {
        const claveElector = formData.clave_elector.toUpperCase();
        if (claveElector.length !== 18 || !/^[A-Z0-9]+$/.test(claveElector)) {
          toast({
            variant: "destructive",
            title: "Error de validación",
            description: "La Clave de Elector debe tener 18 caracteres alfanuméricos (letras y números).",
          });
          return;
        }
      }

      console.log('Enviando datos al servidor:', formData);

      const { data, error } = await supabase
        .from('afiliados')
        .insert([
          {
            ...formData,
            seccion_id: parseInt(formData.seccion_id),
            fotografia: formData.fotografia,
            ubicacion_gps: formData.ubicacion_gps,
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error al insertar en la base de datos:', error);
        throw error;
      }

      console.log('Registro exitoso:', data);

      toast({
        title: "Registro exitoso",
        description: "El afiliado ha sido registrado correctamente.",
      });

      navigate('/');
    } catch (error: any) {
      console.error('Error en el proceso de registro:', error);
      toast({
        variant: "destructive",
        title: "Error al registrar",
        description: error.message || "Ocurrió un error al registrar el afiliado.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#800020] p-4">
      <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-2xl p-6 space-y-8">
        <RegistroHeader onBack={() => navigate('/')} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-200 border-5 border-white rounded-lg p-6">
              <h2 className="text-xl text-gray-800 font-semibold mb-4">
                Fotografía del Afiliado
              </h2>
              <p className="text-gray-600 mb-4">
                Complete el formulario a continuación con los datos del afiliado.
              </p>
              <CameraPreview 
                onImageCapture={handleImageCapture}
                onCredentialData={handleCredentialData}
              />
            </div>
            
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
              <LocationMap 
                coordinates={coordinates}
                onLocationChange={handleLocationChange}
              />
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Datos del Afiliado</h2>
            <AfiliadoForm
              formData={formData}
              onChange={handleInputChange}
            />
            
            <Button 
              type="submit"
              onClick={handleSubmit}
              className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Registrar Afiliado
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroAfiliado;
