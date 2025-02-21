
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { UserList } from "@/components/admin/UserList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/Header';
import { PasswordResetModal } from '@/components/admin/PasswordResetModal';
import { AssignmentPanel } from '@/components/admin/AssignmentPanel';
import { SectionPanel } from '@/components/admin/SectionPanel';
import { PartyPanel } from '@/components/admin/PartyPanel';
import { MemberList } from '@/components/admin/MemberList';
import { ReportPanel } from '@/components/admin/ReportPanel';
import { Plus, Users, UserCog, ClipboardList, Building2, UserPlus, FileText } from 'lucide-react';

interface NewUserData {
  email: string;
  password: string;
  rol: 'Supervisor' | 'Promotor';
  nombre: string;
  telefono: string;
  fotografia: string | null;
}

const AdminPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [resettingPasswordFor, setResettingPasswordFor] = useState<{ id: string; email: string } | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('email');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleResetPassword = async () => {
    if (!resettingPasswordFor || !newPassword) return;

    try {
      const { error } = await supabase.auth.admin.updateUserById(
        resettingPasswordFor.id,
        { password: newPassword }
      );

      if (error) throw error;

      toast({
        title: "Contraseña actualizada",
        description: "La contraseña ha sido actualizada exitosamente.",
      });

      setResettingPasswordFor(null);
      setNewPassword('');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const startPasswordReset = (user: any) => {
    setResettingPasswordFor({ id: user.id, email: user.email });
  };

  const cancelPasswordReset = () => {
    setResettingPasswordFor(null);
    setNewPassword('');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
        </div>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="w-full bg-gray-800">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Asignaciones
            </TabsTrigger>
            <TabsTrigger value="sections" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Secciones
            </TabsTrigger>
            <TabsTrigger value="parties" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Partidos Políticos
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Afiliados
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reportes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <UserList
              users={users}
              startPasswordReset={startPasswordReset}
              handleDeleteUser={fetchUsers}
              fetchUsers={fetchUsers}
            />
          </TabsContent>

          <TabsContent value="assignments">
            <AssignmentPanel 
              users={users} 
              refreshData={fetchUsers}
            />
          </TabsContent>

          <TabsContent value="sections">
            <SectionPanel />
          </TabsContent>

          <TabsContent value="parties">
            <PartyPanel />
          </TabsContent>

          <TabsContent value="members">
            <MemberList users={users} />
          </TabsContent>

          <TabsContent value="reports">
            <ReportPanel />
          </TabsContent>
        </Tabs>

        <PasswordResetModal
          resettingPasswordFor={resettingPasswordFor}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          handleResetPassword={handleResetPassword}
          cancelPasswordReset={cancelPasswordReset}
        />
      </div>
    </div>
  );
};

export default AdminPanel;
