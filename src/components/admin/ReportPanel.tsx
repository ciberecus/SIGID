import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileDown, Users, UserCheck } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AfiliadoSummary {
  total: number;
  por_supervisor: {
    supervisor_nombre: string;
    total_afiliados: number;
    promotores: {
      promotor_nombre: string;
      total_afiliados: number;
    }[];
  }[];
}

export const ReportPanel = () => {
  const [summary, setSummary] = useState<AfiliadoSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummaryData();
  }, []);

  const fetchSummaryData = async () => {
    try {
      // 1. Obtener supervisores y sus afiliados
      const { data: supervisoresData, error: supervisoresError } = await supabase
        .from('usuarios')
        .select(`
          id,
          nombre,
          asignaciones!supervisor_id (
            promotor:usuarios!promotor_id (
              id,
              nombre,
              afiliados:afiliados!promotor_id (
                count
              )
            )
          )
        `)
        .eq('rol', 'Supervisor');

      if (supervisoresError) throw supervisoresError;

      // Procesar los datos
      const summaryData: AfiliadoSummary = {
        total: 0,
        por_supervisor: []
      };

      supervisoresData.forEach(supervisor => {
        const supervisorSummary = {
          supervisor_nombre: supervisor.nombre,
          total_afiliados: 0,
          promotores: [] as { promotor_nombre: string; total_afiliados: number; }[]
        };

        supervisor.asignaciones?.forEach((asignacion: any) => {
          const promotor = asignacion.promotor;
          if (promotor) {
            const totalAfiliados = promotor.afiliados?.[0]?.count || 0;
            supervisorSummary.total_afiliados += totalAfiliados;
            supervisorSummary.promotores.push({
              promotor_nombre: promotor.nombre,
              total_afiliados: totalAfiliados
            });
          }
        });

        summaryData.total += supervisorSummary.total_afiliados;
        summaryData.por_supervisor.push(supervisorSummary);
      });

      setSummary(summaryData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!summary) return;

    const csvContent = [
      ['Reporte de Afiliados'],
      ['Total de Afiliados:', summary.total],
      [],
      ['Supervisor', 'Promotor', 'Total Afiliados'],
      ...summary.por_supervisor.flatMap(supervisor => 
        supervisor.promotores.map(promotor => [
          supervisor.supervisor_nombre,
          promotor.promotor_nombre,
          promotor.total_afiliados
        ])
      )
    ]
    .map(row => row.join(','))
    .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_afiliados_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="text-center text-white">Cargando reporte...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Reporte de Afiliados</h2>
        <Button onClick={downloadReport} className="bg-green-600 hover:bg-green-700">
          <FileDown className="mr-2 h-4 w-4" />
          Descargar CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gray-800 text-white">
          <div className="flex items-center gap-4">
            <Users className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Total de Afiliados</p>
              <p className="text-2xl font-bold">{summary?.total || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-gray-800 text-white">
          <div className="flex items-center gap-4">
            <UserCheck className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Total de Supervisores</p>
              <p className="text-2xl font-bold">{summary?.por_supervisor.length || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="rounded-md border border-gray-700">
        <Table>
          <TableHeader className="bg-gray-800">
            <TableRow>
              <TableHead className="text-white">Supervisor</TableHead>
              <TableHead className="text-white">Promotores</TableHead>
              <TableHead className="text-white text-right">Total Afiliados</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary?.por_supervisor.map((supervisor, index) => (
              <TableRow key={index} className="border-b border-gray-700">
                <TableCell className="font-medium text-white">
                  {supervisor.supervisor_nombre}
                </TableCell>
                <TableCell className="text-gray-300">
                  <div className="space-y-1">
                    {supervisor.promotores.map((promotor, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{promotor.promotor_nombre}</span>
                        <span className="text-gray-400">{promotor.total_afiliados}</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right text-white">
                  {supervisor.total_afiliados}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
