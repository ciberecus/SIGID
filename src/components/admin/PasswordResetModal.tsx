
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Lock } from "lucide-react";

interface PasswordResetModalProps {
  resettingPasswordFor: { id: string; email: string } | null;
  newPassword: string;
  setNewPassword: (password: string) => void;
  handleResetPassword: () => void;
  cancelPasswordReset: () => void;
}

export const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
  resettingPasswordFor,
  newPassword,
  setNewPassword,
  handleResetPassword,
  cancelPasswordReset
}) => {
  if (!resettingPasswordFor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-xl text-white mb-4 flex items-center">
          <Key className="mr-2" />
          Restablecer Contraseña
        </h3>
        <p className="text-gray-300 mb-4">
          Establecer nueva contraseña para: {resettingPasswordFor.email}
        </p>
        <div className="space-y-4">
          <div className="relative">
            <Input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-gray-700 text-white pl-10"
            />
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              onClick={handleResetPassword}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Key className="mr-2" />
              Actualizar Contraseña
            </Button>
            <Button
              onClick={cancelPasswordReset}
              variant="destructive"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
