"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function NuevoPacientePage() {
  const [paciente, setPaciente] = useState({
    nombre: '',
    correo: '',
  });

  const handleChange = (e: any) => {
    setPaciente({
      ...paciente,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Datos del paciente a guardar:", paciente);
    // Más adelante aquí conectaremos con tu backend
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h2 className="text-2xl font-bold mb-6">Registrar Paciente</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
        <div className="flex flex-col gap-2">
          <label>Nombre Completo</label>
          <input 
            type="text" 
            name="nombre" 
            value={paciente.nombre} 
            onChange={handleChange} 
            className="border p-2 rounded text-black"
            required
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label>Correo Electrónico</label>
          <input 
            type="email" 
            name="correo" 
            value={paciente.correo} 
            onChange={handleChange} 
            className="border p-2 rounded text-black"
            required
          />
        </div>

        <Button type="submit" className="mt-4">
          Guardar Paciente
        </Button>
      </form>
    </div>
  );
}