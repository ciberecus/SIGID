
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Section {
  id: number;
  numero_seccion: number;
}

export const SectionPanel = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [newSection, setNewSection] = useState<number>(0);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('secciones')
        .select('*')
        .order('numero_seccion');

      if (error) throw error;
      setSections(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleCreateSection = async () => {
    try {
      const { error } = await supabase
        .from('secciones')
        .insert([{ numero_seccion: newSection }]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Sección creada correctamente",
      });

      setNewSection(0);
      fetchSections();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleUpdateSection = async () => {
    if (!editingSection) return;

    try {
      const { error } = await supabase
        .from('secciones')
        .update({ numero_seccion: editingSection.numero_seccion })
        .eq('id', editingSection.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Sección actualizada correctamente",
      });

      setEditingSection(null);
      fetchSections();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleDeleteSection = async (id: number) => {
    try {
      const { error } = await supabase
        .from('secciones')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Sección eliminada correctamente",
      });

      fetchSections();
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
        <h2 className="text-xl font-bold text-white mb-4">Crear Nueva Sección</h2>
        <div className="flex gap-4">
          <Input
            type="number"
            value={newSection || ''}
            onChange={(e) => setNewSection(Number(e.target.value))}
            placeholder="Número de sección"
            className="bg-gray-700 text-white"
          />
          <Button onClick={handleCreateSection} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2" />
            Crear Sección
          </Button>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Listado de Secciones</h2>
        <div className="space-y-2">
          {sections.map((section) => (
            <div key={section.id} className="flex items-center justify-between bg-gray-700 p-3 rounded">
              {editingSection?.id === section.id ? (
                <div className="flex items-center gap-4 flex-1">
                  <Input
                    type="number"
                    value={editingSection.numero_seccion}
                    onChange={(e) => setEditingSection({ ...editingSection, numero_seccion: Number(e.target.value) })}
                    className="bg-gray-600 text-white"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateSection} className="bg-yellow-600 hover:bg-yellow-700">
                      Guardar
                    </Button>
                    <Button onClick={() => setEditingSection(null)} variant="destructive">
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="text-white">Sección {section.numero_seccion}</span>
                  <div className="flex gap-2">
                    <Button onClick={() => setEditingSection(section)} className="bg-yellow-600 hover:bg-yellow-700">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleDeleteSection(section.id)} variant="destructive">
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
