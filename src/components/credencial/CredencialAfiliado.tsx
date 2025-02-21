import { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Printer } from 'lucide-react';

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

interface CredencialAfiliadoProps {
  afiliado: Afiliado;
  onClose: () => void;
  open: boolean;
}

const CredencialAfiliado = ({ afiliado, onClose, open }: CredencialAfiliadoProps) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const qrData = JSON.stringify({
    id: afiliado.id,
    curp: afiliado.curp,
    clave_elector: afiliado.clave_elector
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const CredencialContent = () => (
    <div className={`bg-white rounded-lg shadow-lg w-[340px] h-[210px] border-2 border-gray-300 overflow-hidden ${isPrinting ? '' : 'm-4'}`}>
      {/* Franja superior */}
      <div className="h-8 bg-gradient-to-r from-blue-600 to-blue-800" />
      
      <div className="p-4">
        <div className="flex justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-blue-800">Credencial de Afiliado</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm">
                <span className="font-semibold">Nombre:</span><br/>
                {afiliado.nombre} {afiliado.apellido_paterno} {afiliado.apellido_materno}
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <p>
                  <span className="font-semibold">CURP:</span><br/>
                  {afiliado.curp}
                </p>
                <p>
                  <span className="font-semibold">Clave Elector:</span><br/>
                  {afiliado.clave_elector}
                </p>
              </div>
              <p className="text-xs">
                <span className="font-semibold">Categoría:</span> {afiliado.categoria}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {afiliado.fotografia ? (
              <img 
                src={afiliado.fotografia} 
                alt="Foto del afiliado" 
                className="w-24 h-24 object-cover rounded-lg border border-gray-300"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center border border-gray-300">
                <span className="text-4xl text-gray-400">
                  {afiliado.nombre[0]}{afiliado.apellido_paterno[0]}
                </span>
              </div>
            )}
            <div className="w-20 h-20">
              <QRCodeCanvas
                value={qrData}
                size={80}
                level="H"
                includeMargin={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Franja inferior */}
      <div className="h-4 bg-gradient-to-r from-blue-600 to-blue-800 mt-auto" />
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={() => !isPrinting && onClose()}>
        <DialogContent className="max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              Vista Previa de Credencial
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            <CredencialContent />
            <Button onClick={handlePrint} className="w-full">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Credencial
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Versión para imprimir */}
      <div className="print:block hidden">
        <CredencialContent />
      </div>

      <style>{`
        @media print {
          @page {
            size: 89mm 51mm;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          .print\\:block,
          .print\\:block * {
            visibility: visible;
          }
          .print\\:block {
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
    </>
  );
};

export default CredencialAfiliado;
