'use client';

import { useEffect, useState } from 'react';
import { Plus, ToggleLeft, ToggleRight, Loader2, Mail, Phone } from 'lucide-react';
import RegisterDoctorModal from './components/RegisterDoctorModal';

export interface Doctor {
    id: string;
    name: string;
    specialtyId: string;
    email: string;
    phone: string;
    status: 'active' | 'inactive';
}

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Cargar la lista de médicos 
    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:4000/api/doctors');
            const data = await res.json();
            setDoctors(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error al cargar médicos:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await fetchDoctors();
        };
        
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cambiar el estado del médico 
    const handleToggleStatus = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:4000/api/doctors/${id}/toggle`, {
                method: 'PATCH',
            });
            if (res.ok) {
                const updatedDoctor = await res.json();
                setDoctors((prev) =>
                    prev.map((doc) => (doc.id === id ? { ...doc, status: updatedDoctor.status } : doc))
                );
            }
        } catch (err) {
            console.error('Error al cambiar estado:', err);
        }
    };

    return (

        <div className="min-h-screen bg-slate-50 text-slate-900 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Encabezado */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Personal Médico</h1>
                        <p className="text-sm text-slate-500">Administra los profesionales y sus especialidades activas.</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 shadow-sm transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Registrar Médico</span>
                    </button>
                </div>

                {/* Contenedor de la Tabla */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 flex flex-col items-center justify-center text-slate-500 gap-3 bg-white">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                            <p className="text-sm font-medium">Sincronizando con Firestore...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="p-4 pl-6">Nombre del Médico</th>
                                        {/* SE ACTUALIZÓ EL ENCABEZADO AQUÍ */}
                                        <th className="p-4">ID Médico</th>
                                        <th className="p-4">Contacto</th>
                                        <th className="p-4">Estado</th>
                                        <th className="p-4 text-center pr-6">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm text-slate-700 bg-white">
                                    {doctors.map((doctor) => (
                                        <tr key={doctor.id} className="hover:bg-slate-50/60 transition-colors">
                                            <td className="p-4 pl-6 font-semibold text-slate-900">{doctor.name}</td>
                                            {/* SE CAMBIÓ LA VISUALIZACIÓN PARA MOSTRAR EL ID DEL MÉDICO */}
                                            <td className="p-4">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-mono tracking-wider border border-slate-200/40">
                                                    <span className="text-slate-400 font-sans font-medium">#</span>
                                                    {doctor.id}
                                                </span>
                                            </td>
                                            <td className="p-4 space-y-1">
                                                {doctor.email && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{doctor.email}</span>
                                                    </div>
                                                )}
                                                {doctor.phone && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{doctor.phone}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
                                                        doctor.status === 'active'
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    }`}
                                                >
                                                    {doctor.status === 'active' ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center pr-6">
                                                <button
                                                    onClick={() => handleToggleStatus(doctor.id)}
                                                    className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                                                        doctor.status === 'active'
                                                            ? 'text-rose-600 hover:text-rose-700'
                                                            : 'text-emerald-600 hover:text-emerald-700'
                                                    }`}
                                                >
                                                    {doctor.status === 'active' ? (
                                                        <>
                                                            <ToggleLeft className="w-5 h-5 text-rose-500" />
                                                            <span>Desactivar</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ToggleRight className="w-5 h-5 text-emerald-500" />
                                                            <span>Activar</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {doctors.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-slate-400 font-medium bg-white">
                                                No se encontraron médicos en la base de datos.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal para registro de un nuevo médico */}
                <RegisterDoctorModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchDoctors}
                />
            </div>
        </div>
    );
}