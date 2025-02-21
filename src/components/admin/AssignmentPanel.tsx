import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface AssignmentPanelProps {
  users: any[];
  refreshData: () => void;
}

interface Promoter {
  id: string;
  nombre: string;
  email: string;
  fotografia: string;
  isAssigned?: boolean;
}

export const AssignmentPanel: React.FC<AssignmentPanelProps> = ({ users, refreshData }) => {
  const [selectedSupervisor, setSelectedSupervisor] = useState<string | null>(null);
  const [assignedPromoters, setAssignedPromoters] = useState<string[]>([]);
  const [allAssignedPromoters, setAllAssignedPromoters] = useState<string[]>([]);

  const supervisors = users.filter(user => user.rol === 'Supervisor');
  const promoters = users.filter(user => user.rol === 'Promotor');

  const getAllAssignedPromoters = async () => {
    const { data, error } = await supabase
      .from('asignaciones')
      .select('promotor_id');
    
    if (error) {
      console.error('Error fetching all assigned promoters:', error);
      return [];
    }
    
    return data?.map(assignment => assignment.promotor_id) || [];
  };

  const getAssignedPromoters = async (supervisorId: string) => {
    const { data, error } = await supabase
      .from('asignaciones')
      .select('promotor_id')
      .eq('supervisor_id', supervisorId);
    
    if (error) {
      console.error('Error fetching assigned promoters:', error);
      return [];
    }
    
    return data?.map(assignment => assignment.promotor_id) || [];
  };

  useEffect(() => {
    const loadAllAssignedPromoters = async () => {
      const allAssigned = await getAllAssignedPromoters();
      setAllAssignedPromoters(allAssigned);
    };

    loadAllAssignedPromoters();
  }, []);

  useEffect(() => {
    const loadAssignedPromoters = async () => {
      if (selectedSupervisor) {
        const assigned = await getAssignedPromoters(selectedSupervisor);
        setAssignedPromoters(assigned);
      } else {
        setAssignedPromoters([]);
      }
    };

    loadAssignedPromoters();
  }, [selectedSupervisor]);

  const handleSelectSupervisor = async (supervisorId: string) => {
    setSelectedSupervisor(supervisorId);
  };

  const handleAssignPromoter = async (promoterId: string) => {
    try {
      const { data: existingAssignment } = await supabase
        .from('asignaciones')
        .select('supervisor_id')
        .eq('promotor_id', promoterId)
        .single();

      if (existingAssignment) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Este promotor ya está asignado a un supervisor.",
        });
        return;
      }

      const { error } = await supabase
        .from('asignaciones')
        .insert([{
          supervisor_id: selectedSupervisor,
          promotor_id: promoterId,
          seccion_id: 1
        }]);

      if (error) throw error;

      toast({
        title: "Promotor asignado",
        description: "El promotor ha sido asignado correctamente.",
      });
      refreshData();
      setAssignedPromoters(prev => [...prev, promoterId]);
      setAllAssignedPromoters(prev => [...prev, promoterId]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleUnassignPromoter = async (promoterId: string) => {
    try {
      const { error } = await supabase
        .from('asignaciones')
        .delete()
        .eq('promotor_id', promoterId);

      if (error) throw error;

      toast({
        title: "Promotor desvinculado",
        description: "El promotor ha sido desvinculado correctamente.",
      });
      refreshData();
      setAssignedPromoters(prev => prev.filter(id => id !== promoterId));
      setAllAssignedPromoters(prev => prev.filter(id => id !== promoterId));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const isPromoterAssigned = (promoterId: string) => {
    return assignedPromoters.includes(promoterId);
  };

  const isPromoterAssignedToAnySupervisor = (promoterId: string) => {
    return allAssignedPromoters.includes(promoterId);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Supervisores</h3>
          <div className="space-y-2">
            {supervisors.map((supervisor) => (
              <div
                key={supervisor.id}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${
                  selectedSupervisor === supervisor.id
                    ? 'bg-blue-600'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                onClick={() => handleSelectSupervisor(supervisor.id)}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={supervisor.fotografia} alt={supervisor.nombre || supervisor.email} />
                    <AvatarFallback>
                      {(supervisor.nombre || supervisor.email).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">
                      {supervisor.nombre || 'Sin nombre'}
                    </p>
                    <p className="text-sm text-gray-300">
                      {supervisor.email}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Promotores Asignados</h3>
          <div className="space-y-2">
            {selectedSupervisor && promoters
              .filter(promoter => isPromoterAssigned(promoter.id))
              .map((promoter) => (
                <div
                  key={promoter.id}
                  className="flex justify-between items-center bg-gray-800 p-4 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={promoter.fotografia} alt={promoter.nombre || promoter.email} />
                      <AvatarFallback>
                        {(promoter.nombre || promoter.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">
                        {promoter.nombre || 'Sin nombre'}
                      </p>
                      <p className="text-sm text-gray-300">
                        {promoter.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleUnassignPromoter(promoter.id)}
                    variant="destructive"
                  >
                    <UserMinus className="mr-2" />
                    Desvincular
                  </Button>
                </div>
              ))}
            {selectedSupervisor && promoters.filter(p => isPromoterAssigned(p.id)).length === 0 && (
              <p className="text-gray-400 text-center p-4">No hay promotores asignados</p>
            )}
            {!selectedSupervisor && (
              <p className="text-gray-400 text-center p-4">Selecciona un supervisor para ver sus promotores asignados</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Promotores Disponibles</h3>
          <div className="space-y-2">
            {promoters
              .filter(promoter => !isPromoterAssignedToAnySupervisor(promoter.id))
              .map((promoter) => (
                <div
                  key={promoter.id}
                  className="flex justify-between items-center bg-gray-800 p-4 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={promoter.fotografia} alt={promoter.nombre || promoter.email} />
                      <AvatarFallback>
                        {(promoter.nombre || promoter.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-white font-medium">
                        {promoter.nombre || 'Sin nombre'}
                      </p>
                      <p className="text-sm text-gray-300">
                        {promoter.email}
                      </p>
                    </div>
                  </div>
                  {selectedSupervisor && (
                    <Button
                      onClick={() => handleAssignPromoter(promoter.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserPlus className="mr-2" />
                      Asignar
                    </Button>
                  )}
                </div>
              ))}
            {promoters.filter(p => !isPromoterAssignedToAnySupervisor(p.id)).length === 0 && (
              <p className="text-gray-400 text-center p-4">No hay promotores disponibles</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
