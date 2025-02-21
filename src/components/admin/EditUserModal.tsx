import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { User, Phone, Mail, Lock, Image } from "lucide-react";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUserUpdated: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    rol: '',
    telefono: '',
    password: '',
    fotografia: null as string | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        rol: user.rol || 'Promotor',
        telefono: user.telefono || '',
        password: '',
        fotografia: user.fotografia
      });
      setPreviewImage(user.fotografia);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const BUCKET_NAME = 'fotos'; // Cambiado a un nombre más descriptivo
    
    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setIsLoading(true);
      
      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `usuarios/${fileName}`;

      // Subir nueva imagen
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        if (uploadError.message.includes('bucket') && uploadError.message.includes('not found')) {
          throw new Error(
            'El bucket de almacenamiento no está configurado. Por favor, sigue estos pasos:\n\n' +
            '1. Ve al panel de Supabase (https://app.supabase.com)\n' +
            '2. Selecciona tu proyecto\n' +
            '3. Ve a "Storage" en el menú lateral\n' +
            '4. Haz clic en "New Bucket"\n' +
            '5. Nombre del bucket: "fotos"\n' +
            '6. Marca la opción "Public bucket"\n' +
            '7. Haz clic en "Create bucket"\n\n' +
            'Después de crear el bucket, intenta subir la imagen nuevamente.'
          );
        }
        throw uploadError;
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      // Si había una imagen anterior, eliminarla
      if (formData.fotografia) {
        try {
          const oldUrl = new URL(formData.fotografia);
          const oldPath = oldUrl.pathname.split('/').pop();
          if (oldPath) {
            await supabase.storage
              .from(BUCKET_NAME)
              .remove([`usuarios/${oldPath}`]);
          }
        } catch (error) {
          console.error('Error al eliminar imagen anterior:', error);
        }
      }

      setFormData(prev => ({
        ...prev,
        fotografia: publicUrl
      }));

      toast({
        title: "Imagen actualizada",
        description: "La imagen se ha subido correctamente."
      });
    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      toast({
        variant: "destructive",
        title: "Error de configuración",
        description: error.message
      });
      // Restaurar la imagen anterior en caso de error
      setPreviewImage(formData.fotografia);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Validar campos requeridos
      if (!formData.nombre || !formData.email) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "El nombre y el email son campos requeridos."
        });
        return;
      }

      // Actualizar datos del usuario
      const updates = {
        nombre: formData.nombre,
        rol: formData.rol,
        telefono: formData.telefono,
        fotografia: formData.fotografia,
      };

      const { error: updateError } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Si se proporcionó una nueva contraseña, actualizarla
      if (formData.password) {
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: formData.password }
        );

        if (passwordError) throw passwordError;
      }

      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados exitosamente."
      });

      onUserUpdated();
      onClose();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Editar Usuario
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Modifica los datos del usuario. La contraseña es opcional.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre completo</Label>
            <div className="relative">
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="bg-gray-700 pl-10"
                placeholder="Nombre completo"
              />
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-gray-700 pl-10"
                placeholder="Correo electrónico"
                disabled
              />
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Nueva contraseña (opcional)</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-gray-700 pl-10"
                placeholder="Dejar en blanco para mantener la actual"
              />
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <div className="relative">
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="bg-gray-700 pl-10"
                placeholder="Teléfono"
              />
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rol">Rol</Label>
            <select
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
            >
              <option value="Supervisor">Supervisor</option>
              <option value="Promotor">Promotor</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fotografia">Fotografía</Label>
            <div className="space-y-2">
              {previewImage && (
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="relative">
                <Input
                  id="fotografia"
                  name="fotografia"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="bg-gray-700"
                  disabled={isLoading}
                />
                <Image className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? "Actualizando..." : "Guardar cambios"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
