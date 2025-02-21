import { createWorker } from 'tesseract.js';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { ScanLine } from "lucide-react";

interface CredentialScannerProps {
  imageData: string;
  onDataExtracted: (data: {
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    curp?: string;
    clave_elector?: string;
    direccion?: string;
  }) => void;
  onReset: () => void;
}

const CredentialScanner = ({ imageData, onDataExtracted, onReset }: CredentialScannerProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const updateStatus = (message: string) => {
    console.log('Estado actual:', message);
    setStatus(message);
    toast({
      title: "Procesando",
      description: message,
    });
  };

  const processImage = async () => {
    setIsProcessing(true);
    setProgress(0);
    let worker = null;

    try {
      updateStatus("Iniciando procesamiento de imagen...");
      console.log('Creando worker de Tesseract...');
      
      worker = await createWorker();
      setProgress(20);
      
      console.log('Worker creado, comenzando reconocimiento...');
      updateStatus("Extrayendo texto de la credencial...");
      setProgress(40);
      
      // Procesar la imagen con configuración optimizada
      const result = await worker.recognize(imageData, {
        lang: 'spa',
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789 ',
        tessedit_pageseg_mode: '1',
      });
      setProgress(60);

      const text = result.data.text;
      console.log('Texto extraído:', text);
      
      updateStatus("Analizando datos de la credencial...");
      setProgress(80);
      
      // Extraer datos relevantes usando expresiones regulares
      const extractedData = {
        nombre: extractName(text),
        apellido_paterno: extractLastName(text),
        apellido_materno: extractSecondLastName(text),
        curp: extractCURP(text),
        clave_elector: extractClaveElector(text),
        direccion: extractAddress(text),
      };

      console.log('Datos procesados:', extractedData);
      setProgress(90);

      // Validar si se encontraron datos
      const foundFields = Object.entries(extractedData).filter(([_, value]) => value && value.length > 0);
      
      if (foundFields.length === 0) {
        throw new Error('No se pudieron detectar datos en la imagen. Intenta tomar una nueva foto con mejor iluminación.');
      }
      
      // Enviar datos extraídos al componente padre
      onDataExtracted(extractedData);
      setProgress(100);
      
      toast({
        title: "Éxito",
        description: `Se encontraron ${foundFields.length} campos en la credencial.`,
      });
      
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron extraer los datos de la credencial.",
      });
    } finally {
      if (worker) {
        try {
          await worker.terminate();
        } catch (e) {
          console.error('Error al terminar el worker:', e);
        }
      }
      setIsProcessing(false);
      setStatus('');
      setProgress(0);
    }
  };

  // Funciones auxiliares para extraer datos específicos
  const extractName = (text: string): string => {
    console.log('Extrayendo nombre...');
    const nameMatch = text.match(/NOMBRE[S]?\s*([A-ZÁÉÍÓÚÑ\s]+?)(?=\n|DOMICILIO|CLAVE|$)/i);
    return nameMatch ? nameMatch[1].trim() : '';
  };

  const extractLastName = (text: string): string => {
    console.log('Extrayendo apellido paterno...');
    const match = text.match(/APELLIDO\s+PATERNO\s*([A-ZÁÉÍÓÚÑ\s]+?)(?=\n|APELLIDO\s+MATERNO|$)/i);
    return match ? match[1].trim() : '';
  };

  const extractSecondLastName = (text: string): string => {
    console.log('Extrayendo apellido materno...');
    const match = text.match(/APELLIDO\s+MATERNO\s*([A-ZÁÉÍÓÚÑ\s]+?)(?=\n|CLAVE|DOMICILIO|$)/i);
    return match ? match[1].trim() : '';
  };

  const extractCURP = (text: string): string => {
    console.log('Extrayendo CURP...');
    const curpMatch = text.match(/[A-Z]{4}\d{6}[HM][A-Z]{5}[0-9A-Z]\d/);
    return curpMatch ? curpMatch[0] : '';
  };

  const extractClaveElector = (text: string): string => {
    console.log('Extrayendo clave de elector...');
    const claveMatch = text.match(/CLAVE\s+DE\s+ELECTOR\s*([A-Z0-9]{18})/i);
    return claveMatch ? claveMatch[1] : '';
  };

  const extractAddress = (text: string): string => {
    console.log('Extrayendo dirección...');
    const addressMatch = text.match(/DOMICILIO\s*(.+?)(?=\n|CLAVE|CURP|$)/i);
    return addressMatch ? addressMatch[1].trim() : '';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button
          onClick={processImage}
          disabled={isProcessing}
          className="flex items-center gap-2"
        >
          <ScanLine className="w-4 h-4" />
          {isProcessing ? 'Procesando...' : 'Extraer datos'}
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isProcessing}
        >
          Tomar nueva foto
        </Button>
      </div>
      
      {status && (
        <div className="text-sm text-blue-400 animate-pulse text-center">
          {status}
        </div>
      )}
      
      {isProcessing && (
        <div className="text-center text-sm text-gray-500">
          <div className="mb-2">
            Por favor espere mientras se procesa la imagen...
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mb-2">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500">
            {progress}%
          </div>
        </div>
      )}
    </div>
  );
};

export default CredentialScanner;
