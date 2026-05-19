"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Clock, CalendarCheck, PlusCircle, Loader2 } from 'lucide-react';

export default function DashboardPaciente() {
  const router = useRouter();
  const { user } = useAuth();
  const [citas, setCitas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const cargarDatos = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/appointments/my-appointments', {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          }
        });
        
        const data = await response.json();
        
        if (response.ok && data && data.length > 0) {
          setCitas(data);
        } else {
          // Cita de prueba hasta que se haga lo de los demás dashboards
          setCitas([{ 
            id: 1, 
            doctorName: 'Dr. Alejandro Vega', 
            date: '2026-05-25 10:00 AM', 
            reason: 'Chequeo general inicial', 
            status: 'pendiente' 
          }]);
        }
      } catch (err) {
        console.error("Error al conectar con el servidor de citas:", err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [user, router]);

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-emerald-500">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Encabezado Personalizado */}
        <div className="flex justify-between items-end border-b border-emerald-500/30 pb-6">
          <div>
            <h1 className="text-4xl font-bold">
              Bienvenido, <span className="text-emerald-500">{user?.name || 'Paciente'}</span>
            </h1>
            <p className="text-gray-400 mt-2">Estado actual de tus solicitudes médicas.</p>
          </div>
          <Button 
            onClick={() => router.push('/registro')} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-6 rounded-xl flex gap-2"
          >
            <PlusCircle size={20} /> Nueva Cita
          </Button>
        </div>

+        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-yellow-500 flex items-center gap-3">
            <Clock size={24} /> Consultas en Espera de Confirmación
          </h2>
          
          <div className="grid gap-5">
            {citas.map((cita) => (
              <Card key={cita.id} className="bg-[#111] border-yellow-500/20 shadow-2xl">
                <CardContent className="flex items-center justify-between p-8">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white">{cita.doctorName}</h3>
                    <p className="text-emerald-500 font-medium">{cita.date}</p>
                    <p className="text-gray-400 text-sm">MOTIVO: {cita.reason}</p>
                  </div>
                  <span className="px-5 py-2 rounded-full border border-yellow-500 text-yellow-500 text-xs font-black bg-yellow-500/5">
                    PENDIENTE
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        
        <div className="space-y-6 opacity-60 mt-10">
          <h2 className="text-xl font-semibold text-green-500 flex items-center gap-3">
            <CalendarCheck size={24} /> Citas Confirmadas
          </h2>
          <p className="text-gray-700 text-sm pl-2">Aún no hay citas confirmadas por la secretaría.</p>
        </div>

      </div>
    </div>
  );
}