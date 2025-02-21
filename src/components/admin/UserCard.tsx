import React from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PenSquare, Key, UserMinus } from "lucide-react";

interface UserCardProps {
  user: any;
  assignmentInfo: string;
  handleToggleActive: (userId: string, currentState: boolean) => void;
  handleStartEdit: (user: any) => void;
  startPasswordReset: (user: any) => void;
  handleDeleteUser: (id: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  assignmentInfo,
  handleToggleActive,
  handleStartEdit,
  startPasswordReset,
  handleDeleteUser
}) => {
  return (
    <div className="flex justify-between items-center bg-gray-800 p-6 rounded-lg w-full">
      <div className="flex items-center gap-6 text-white">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center flex-shrink-0">
          {user.fotografia ? (
            <img 
              src={user.fotografia} 
              alt={user.nombre || user.email}
              className="w-full h-full object-cover"
              key={Date.now()}
            />
          ) : (
            <span className="text-xs text-gray-400">Sin foto</span>
          )}
        </div>
        <div className="flex-grow">
          {user.nombre && <p className="text-lg text-white font-medium">{user.nombre}</p>}
          <p className="text-sm text-gray-400">{user.email}</p>
          <div className="flex gap-4 mt-1">
            <p className="text-sm text-gray-400">Rol: {user.rol}</p>
            {user.telefono && <p className="text-sm text-gray-400">Teléfono: {user.telefono}</p>}
          </div>
          <p className="text-sm text-blue-400 mt-1">{assignmentInfo}</p>
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-2 mr-4">
          <Switch
            checked={user.activo}
            onCheckedChange={() => handleToggleActive(user.id, user.activo)}
          />
          <span className={`text-sm ${user.activo ? 'text-green-400' : 'text-red-400'}`}>
            {user.activo ? 'Activo' : 'Inactivo'}
          </span>
        </div>
        <Button
          onClick={() => handleStartEdit(user)}
          className="bg-yellow-600 hover:bg-yellow-700"
          size="sm"
        >
          <PenSquare className="mr-2 h-4 w-4" />
          Editar
        </Button>
        <Button
          onClick={() => startPasswordReset(user)}
          variant="outline"
          className="bg-blue-600 hover:bg-blue-700"
          size="sm"
        >
          <Key className="mr-2 h-4 w-4" />
          Restablecer
        </Button>
        <Button
          onClick={() => handleDeleteUser(user.id)}
          variant="destructive"
          size="sm"
        >
          <UserMinus className="mr-2 h-4 w-4" />
          Eliminar
        </Button>
      </div>
    </div>
  );
};
