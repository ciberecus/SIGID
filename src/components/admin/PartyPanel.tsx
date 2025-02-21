
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Party {
  id: number;
  nombre: string;
}

export const PartyPanel = () => {
  const [parties, setParties] = useState<Party[]>([]);
  const [newParty, setNewParty] = useState('');
  const [editingParty, setEditingParty] = useState<Party | null>(null);

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const { data, error } = await supabase
        .from('partidos_politicos')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setParties(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleCreateParty = async () => {
    if (!newParty.trim()) return;

    try {
      const { error } = await supabase
        .from('partidos_politicos')
        .insert([{ nombre: newParty }]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Partido político creado correctamente",
      });

      setNewParty('');
      fetchParties();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleUpdateParty = async () => {
    if (!editingParty) return;

    try {
      const { error } = await supabase
        .from('partidos_politicos')
        .update({ nombre: editingParty.nombre })
        .eq('id', editingParty.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Partido político actualizado correctamente",
      });

      setEditingParty(null);
      fetchParties();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleDeleteParty = async (id: number) => {
    try {
      const { error } = await supabase
        .from('partidos_politicos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Partido político eliminado correctamente",
      });

      fetchParties();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Crear Nuevo Partido Político</h2>
        <div className="flex gap-4">
          <Input
            value={newParty}
            onChange={(e) => setNewParty(e.target.value)}
            placeholder="Nombre del partido político"
            className="bg-gray-700 text-white"
          />
          <Button onClick={handleCreateParty} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2" />
            Crear Partido
          </Button>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Listado de Partidos Políticos</h2>
        <div className="space-y-2">
          {parties.map((party) => (
            <div key={party.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
              {editingParty?.id === party.id ? (
                <div className="flex items-center gap-4 flex-1">
                  <Input
                    value={editingParty.nombre}
                    onChange={(e) => setEditingParty({ ...editingParty, nombre: e.target.value })}
                    className="bg-gray-600 text-white"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateParty} className="bg-yellow-600 hover:bg-yellow-700">
                      Guardar
                    </Button>
                    <Button onClick={() => setEditingParty(null)} variant="destructive">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-white">{party.nombre}</span>
                  <div className="flex gap-2">
                    <Button onClick={() => setEditingParty(party)} className="bg-yellow-600 hover:bg-yellow-700">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDeleteParty(party.id)} variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
