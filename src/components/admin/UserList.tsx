import React, { useState } from 'react';
import { UserCard } from "./UserCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UserForm } from "./UserForm";
import { EditUserModal } from "./EditUserModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface UserListProps {
  users: any[];
  startPasswordReset: (user: any) => void;
  handleDeleteUser: () => void;
  fetchUsers: () => void;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  startPasswordReset,
  handleDeleteUser,
  fetchUsers
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    rol: 'Promotor' as 'Supervisor' | 'Promotor',
    nombre: '',
    telefono: '',
    fotografia: null as string | null
  });

  const handleStartEdit = (user: any) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditingUser(null);
    setShowEditModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const BUCKET_NAME = 'fotos';

    try {
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

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      setNewUserData(prev => ({
        ...prev,
        fotografia: publicUrl
      }));

      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente."
      });
    } catch (error: any) {
      console.error('Error al subir imagen:', error);
      toast({
        variant: "destructive",
        title: "Error de configuración",
        description: error.message
      });
    }
  };

  const handleCreateUser = async () => {
    if (!newUserData.email || !newUserData.password || !newUserData.nombre) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor complete los campos requeridos (email, contraseña y nombre)."
      });
      return;
    }

    setIsCreatingUser(true);

    try {
      // 1. Crear el usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserData.email,
        password: newUserData.password
      });

      if (authError) throw authError;

      // 2. Crear el perfil del usuario
      const { error: profileError } = await supabase
        .from('usuarios')
        .insert([{
          id: authData.user?.id,
          email: newUserData.email,
          nombre: newUserData.nombre,
          rol: newUserData.rol,
          telefono: newUserData.telefono,
          fotografia: newUserData.fotografia,
          activo: true
        }]);

      if (profileError) throw profileError;

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente."
      });

      // Limpiar el formulario y cerrar
      setNewUserData({
        email: '',
        password: '',
        rol: 'Promotor',
        nombre: '',
        telefono: '',
        fotografia: null
      });
      setShowCreateForm(false);
      fetchUsers();

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleToggleActive = async (userId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: !currentState })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Estado actualizado",
        description: `Usuario ${!currentState ? 'activado' : 'desactivado'} exitosamente.`
      });

      fetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button 
          onClick={() => setShowCreateForm(true)} 
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2" />
          Crear Usuario
        </Button>
      </div>

      {showCreateForm && (
        <UserForm
          newUserData={newUserData}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          handleCreateUser={handleCreateUser}
          handleEditUser={() => {}}
          handleCancelEdit={() => setShowCreateForm(false)}
          isCreatingUser={isCreatingUser}
          editingUser={null}
        />
      )}

      <div className="flex flex-col space-y-4">
        {users.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            onPasswordReset={() => startPasswordReset(user)}
            onDelete={() => handleDeleteUser()}
            handleStartEdit={() => handleStartEdit(user)}
            handleToggleActive={handleToggleActive}
            assignmentInfo=""
          />
        ))}
      </div>

      <EditUserModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        user={editingUser}
        onUserUpdated={fetchUsers}
      />
    </div>
  );
};
