"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">¡Bienvenido al Dashboard de Medi-Agenda! 🏥</h1>
      <p className="mb-8">Aquí irá tu panel de control principal.</p>
      
      {/* Este es el botón que te pide tu tarea */}
      <Button onClick={() => router.push('/dashboard/nuevo-paciente')} className="bg-green-600 hover:bg-green-700">
        Crear Nuevo Paciente
      </Button>
    </div>
  );
}