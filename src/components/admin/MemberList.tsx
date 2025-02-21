
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Member {
  id: number;
  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;
  fotografia: string | null;
  promotor_id: string;
  created_by: string;
}

interface User {
  id: string;
  nombre: string;
  email: string;
}

interface MemberListProps {
  users: User[];
}

export const MemberList: React.FC<MemberListProps> = ({ users }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('afiliados')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? (user.nombre || user.email) : 'Usuario no encontrado';
  };

  if (loading) {
    return (
      <div className="text-white p-4 bg-gray-800 rounded-lg">
        <p>Cargando afiliados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Listado de Afiliados</h2>
        <div className="grid gap-4">
          {members.map((member) => (
            <div key={member.id} className="bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.fotografia || undefined} alt={member.nombre} />
                  <AvatarFallback>{member.nombre.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-medium">
                    {member.nombre} {member.apellido_paterno} {member.apellido_materno}
                  </h3>
                  <div className="text-gray-300 text-sm">
                    <p>Supervisor: {getUserName(member.created_by)}</p>
                    <p>Promotor: {getUserName(member.promotor_id)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
