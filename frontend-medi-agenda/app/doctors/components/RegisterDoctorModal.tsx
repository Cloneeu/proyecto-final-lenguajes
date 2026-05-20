'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Specialty {
    id: string;
    name: string;
}

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RegisterDoctorModal({ isOpen, onClose, onSuccess }: RegisterModalProps) {
    const [specialties, setSpecialties] = useState<Specialty[]>([]);
    const [name, setName] = useState('');
    const [specialtyId, setSpecialtyId] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Cargar las especialidades válidas desde el backend
    useEffect(() => {
        if (isOpen) {
        fetch('http://localhost:4000/api/specialties')
            .then((res) => res.json())
            .then((data) => setSpecialties(Array.isArray(data) ? data : []))
            .catch((err) => console.error('Error al traer especialidades:', err));
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSubmitting(true);

        try {
            const res = await fetch('http://localhost:4000/api/doctors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, specialtyId, email, phone }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Error al procesar el registro');
            }

            // Limpiar formulario y refrescar tabla principal
            setName('');
            setSpecialtyId('');
            setEmail('');
            setPhone('');
            onSuccess();
            onClose();
        } catch (err) {
            if (err instanceof Error) {
                setErrorMsg(err.message);
            } else {
                setErrorMsg('Ocurrió un error inesperado al registrar.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-100 overflow-hidden flex flex-col">
            {/* Header del Modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
                <h3 className="font-bold text-lg text-slate-900">Registrar Nuevo Médico</h3>
                <p className="text-xs text-slate-500">Completa la información del profesional.</p>
            </div>
            <button onClick={onClose} type="button" className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
            </button>
            </div>

            {/* Cuerpo / Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 bg-white">
            {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
                {errorMsg}
                </div>
            )}

            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Nombre Completo *</label>
                <input
                type="text"
                required
                autoComplete="off"
                name="doctor-full-name-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Dr. Pablo Martínez"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-950 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Especialidad Asignada *</label>
                <select
                required
                value={specialtyId}
                onChange={(e) => setSpecialtyId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-950 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                >
                <option value="" className="text-slate-500">Selecciona una opción...</option>
                {specialties.map((spec) => (
                    <option key={spec.id} value={spec.id} className="text-slate-950">
                    {spec.name}
                    </option>
                ))}
                </select>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Correo Electrónico</label>
                <input
                    type="text" 
                    inputMode="email" 
                    autoComplete="new-password" 
                    data-1password-ignore="true" 
                    name="doctor-email-field-clean"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@clinica.com"
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-950 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all shadow-none"
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Teléfono de Contacto</label>
                <input
                type="tel"
                autoComplete="off"
                name="doctor-private-phone-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="4641234567"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-950 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
                />
            </div>

            {/* Acciones */}
            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6 bg-white">
                <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                Cancelar
                </button>
                <button
                type="submit"
                disabled={submitting}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-50 shadow-sm transition-all"
                >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Guardar Médico</span>
                </button>
            </div>
            </form>
        </div>
        </div>
    );
}