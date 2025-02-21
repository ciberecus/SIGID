
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, PenSquare, Image, User, Phone, Mail, Lock } from "lucide-react";

interface UserFormProps {
  newUserData: {
    email: string;
    password: string;
    rol: 'Supervisor' | 'Promotor';
    nombre: string;
    telefono: string;
    fotografia: string | null;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCreateUser: () => void;
  handleEditUser: () => void;
  handleCancelEdit: () => void;
  isCreatingUser: boolean;
  editingUser: any | null;
}

export const UserForm: React.FC<UserFormProps> = ({
  newUserData,
  handleInputChange,
  handleFileChange,
  handleCreateUser,
  handleEditUser,
  handleCancelEdit,
  isCreatingUser,
  editingUser
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl text-white mb-4 flex items-center">
        {editingUser ? (
          <>
            <PenSquare className="mr-2" />
            Editar Usuario
          </>
        ) : (
          <>
            <UserPlus className="mr-2" />
            Nuevo Usuario
          </>
        )}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="relative">
            <Input
              name="email"
              placeholder="Correo electrónico"
              value={newUserData.email}
              onChange={handleInputChange}
              className="bg-gray-700 text-white pl-10"
              disabled={editingUser}
            />
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          {!editingUser && (
            <div className="relative">
              <Input
                name="password"
                type="password"
                placeholder="Contraseña"
                value={newUserData.password}
                onChange={handleInputChange}
                className="bg-gray-700 text-white pl-10"
              />
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            </div>
          )}
          <div className="relative">
            <Input
              name="nombre"
              placeholder="Nombre completo"
              value={newUserData.nombre}
              onChange={handleInputChange}
              className="bg-gray-700 text-white pl-10"
            />
            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <Input
              name="telefono"
              placeholder="Teléfono"
              value={newUserData.telefono}
              onChange={handleInputChange}
              className="bg-gray-700 text-white pl-10"
            />
            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          <div className="relative">
            <select
              name="rol"
              value={newUserData.rol}
              onChange={handleInputChange}
              className="w-full bg-gray-700 text-white rounded-md border border-gray-600 px-3 py-2"
            >
              <option value="Supervisor">Supervisor</option>
              <option value="Promotor">Promotor</option>
            </select>
          </div>
          <div className="relative">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="bg-gray-700 text-white"
            />
            <Image className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        {editingUser ? (
          <>
            <Button 
              onClick={handleEditUser}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <PenSquare className="mr-2" />
              Actualizar Usuario
            </Button>
            <Button 
              onClick={handleCancelEdit}
              variant="destructive"
            >
              Cancelar
            </Button>
          </>
        ) : (
          <Button 
            onClick={handleCreateUser} 
            className="bg-green-600 hover:bg-green-700"
            disabled={isCreatingUser}
          >
            <UserPlus className="mr-2" />
            {isCreatingUser ? 'Creando...' : 'Agregar Usuario'}
          </Button>
        )}
      </div>
    </div>
  );
};
