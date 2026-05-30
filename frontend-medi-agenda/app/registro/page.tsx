"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { authService } from '@/services/authService';

export default function RegistroPacientePage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    edad: '',
    telefono: '',
    doctorId: '',
    fechaCita: '',
    motivo: '',
    correo: '',
    password: ''
  });

  const [doctores, setDoctores] = useState<any[]>([]);

  useEffect(() => {
    const cargarDoctores = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/doctors');
        if (!res.ok) throw new Error('No se pudieron cargar los doctores');
        
        const data = await res.json();
        setDoctores(data);
      } catch (error) {
        alert(error.message || 'Error al cargar los doctores');}
    };
    
    cargarDoctores();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: `${formData.nombre} ${formData.apellidos}`,
        email: formData.correo,
        password: formData.password,
        role: "patient",
        edad: formData.edad,
        telefono: formData.telefono,
        doctorId: formData.doctorId,
        fechaCita: formData.fechaCita,
        motivo: formData.motivo
      };

      await authService.register(payload);
      alert("Registro exitoso");
      router.push('/login');
    } catch (error: any) {
      alert(error.message || "Error al registrasse");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Registro de Paciente</CardTitle>
          <CardDescription>Completa el formulario para solicitar tu cita.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input name="nombre" placeholder="Nombre" required onChange={handleChange} />
              <Input name="apellidos" placeholder="Apellidos" required onChange={handleChange} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input type="number" name="edad" placeholder="Edad" required onChange={handleChange} />
              <Input name="telefono" placeholder="Teléfono" required onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label>Médico</Label>
              <select name="doctorId" required onChange={handleChange} className="w-full border p-2 rounded bg-sidebar text-black">
                <option value="">Selecciona un médico</option>
                {doctores.map((doc) => (
                  <option key={doc.id} value={doc.id}>{doc.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input type="datetime-local" name="fechaCita" required onChange={handleChange} />
              <Input name="motivo" placeholder="Motivo de consulta" required onChange={handleChange} />
            </div>

            <Input type="email" name="correo" placeholder="Correo" required onChange={handleChange} />
            <Input type="password" name="password" placeholder="Contraseña" required onChange={handleChange} />
            
            <Button type="submit" className="w-full">Registrar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}