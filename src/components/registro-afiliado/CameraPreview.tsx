import { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Camera, Video, CameraOff, CreditCard } from "lucide-react";
import CredentialScanner from './CredentialScanner';

interface CameraPreviewProps {
  onImageCapture: (imageData: string) => void;
  onCredentialData?: (data: {
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    curp?: string;
    clave_elector?: string;
    direccion?: string;
  }) => void;
}

const CameraPreview = ({ onImageCapture, onCredentialData }: CameraPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCredentialMode, setIsCredentialMode] = useState(false);

  useEffect(() => {
    const getCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        console.log('Cámaras disponibles:', videoDevices);
        setCameras(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedCamera(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error al obtener cámaras:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudieron obtener las cámaras disponibles.",
        });
      }
    };

    getCameras();
  }, []);

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      console.log('Iniciando cámara con deviceId:', selectedCamera);
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined
        }
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
        console.log('Video iniciado correctamente');
      }
    } catch (error) {
      console.error('Error al iniciar la cámara:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar la cámara.",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  const captureImage = () => {
    if (videoRef.current && stream) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        console.log('Imagen capturada correctamente');
        setCapturedImage(imageData);
        onImageCapture(imageData);
        stopCamera();
      }
    }
  };

  const toggleCredentialMode = () => {
    setIsCredentialMode(!isCredentialMode);
    if (capturedImage) {
      setCapturedImage(null);
      startCamera();
    }
  };

  const handleCredentialData = (data: any) => {
    console.log('Datos de credencial recibidos en CameraPreview:', data);
    if (onCredentialData) {
      onCredentialData(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ height: '300px' }}>
        {capturedImage ? (
          <div className="relative">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-full h-full object-contain"
            />
            {isCredentialMode && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
                <CredentialScanner
                  imageData={capturedImage}
                  onDataExtracted={handleCredentialData}
                  onReset={() => {
                    setCapturedImage(null);
                    startCamera();
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              autoPlay
            />
            {isCredentialMode && (
              <div className="absolute inset-0 border-2 border-white/30 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/70 text-sm">
                  Alinea la credencial dentro del marco
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="flex gap-2">
          {!stream ? (
            <Button onClick={startCamera} className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Iniciar cámara
            </Button>
          ) : (
            <>
              <Button onClick={captureImage} className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Capturar
              </Button>
              <Button onClick={stopCamera} variant="destructive" className="flex items-center gap-2">
                <CameraOff className="w-4 h-4" />
                Detener
              </Button>
            </>
          )}
        </div>
        
        <Button
          onClick={toggleCredentialMode}
          variant={isCredentialMode ? "secondary" : "outline"}
          className="flex items-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          {isCredentialMode ? 'Modo Credencial' : 'Modo Normal'}
        </Button>
      </div>

      {isCredentialMode && !capturedImage && (
        <div className="text-sm text-gray-500 text-center">
          Coloca la credencial de elector dentro del marco y toma la foto
        </div>
      )}

      {cameras.length > 1 && (
        <select
          value={selectedCamera}
          onChange={(e) => {
            setSelectedCamera(e.target.value);
            if (stream) {
              stopCamera();
              setTimeout(startCamera, 100);
            }
          }}
          className="w-full p-2 rounded border border-gray-600 bg-gray-800 text-white"
        >
          {cameras.map((camera) => (
            <option key={camera.deviceId} value={camera.deviceId}>
              {camera.label || `Cámara ${camera.deviceId}`}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default CameraPreview;
