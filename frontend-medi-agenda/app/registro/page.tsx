"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function RegistroPacientePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: ''
  });

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registrando nuevo paciente...", formData);
    // Aquí después conectarás con tu servicio de registro del backend
    
    // Simular que el registro fue exitoso y regresarlo al login
    alert("Paciente registrado con éxito");
    router.push('/login');
  };

  return (
    <div className="flex h-screen items-center justify-center p-4">
      <div className="w-full max-w-md p-8 border rounded-lg shadow-lg bg-gray-900/50">
        <h2 className="text-2xl font-bold mb-2 text-center text-white">Registro de Paciente</h2>
        <p className="text-gray-400 text-center mb-6 text-sm">Ingresa tus datos para crear una cuenta en Medi-Agenda</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300">Nombre Completo</label>
            <input 
              type="text" 
              name="nombre" 
              value={formData.nombre} 
              onChange={handleChange} 
              className="border border-gray-700 bg-gray-800 p-2 rounded text-white focus:outline-none focus:border-green-500"
              placeholder="Ej. Juan Pérez"
              required
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300">Correo Electrónico</label>
            <input 
              type="email" 
              name="correo" 
              value={formData.correo} 
              onChange={handleChange} 
              className="border border-gray-700 bg-gray-800 p-2 rounded text-white focus:outline-none focus:border-green-500"
              placeholder="paciente@ejemplo.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-300">Contraseña</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              className="border border-gray-700 bg-gray-800 p-2 rounded text-white focus:outline-none focus:border-green-500"
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white">
            Crear Cuenta
          </Button>

          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.push('/login')}
            className="w-full mt-2 text-gray-400 hover:text-white"
          >
            Cancelar y volver
          </Button>
        </form>
      </div>
    </div>
  );
}