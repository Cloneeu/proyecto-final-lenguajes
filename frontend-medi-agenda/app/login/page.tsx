"use client"

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData);
    } catch (err: any) {
      // Con fetch, el error viene directamente en err.message
      setError(err.message || 'Credenciales inválidas');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-muted/30">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Medi-Agenda</CardTitle>
          <CardDescription className="text-center">
            Inicia sesión para gestionar tus pacientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="doctor@ejemplo.com"
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            {error && <p className="text-sm font-medium text-red-500 text-center">{error}</p>}
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
              Acceder
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}