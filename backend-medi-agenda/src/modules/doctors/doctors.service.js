import { doctorsRepository } from '../doctors/doctors.repository.js';
import { specialtiesRepository } from '../specialties/specialties.repository.js';

export const doctorsService = {
    getAllDoctors: async () => {
        return await doctorsRepository.findAll();
    },

    createDoctor: async (doctorData) => {
        const specialty = await specialtiesRepository.findById(doctorData.specialtyId);
        if (!specialty) {
            throw new Error("La especialidad seleccionada no existe en el sistema.");
        }
        return await doctorsRepository.create(doctorData);
    },

    toggleStatus: async (id) => {
        const doctor = await doctorsRepository.findById(id);
        if (!doctor) throw new Error("Médico no encontrado.");
        
        const newStatus = doctor.status === 'active' ? 'inactive' : 'active';
        return await doctorsRepository.updateStatus(id, newStatus);
    }
};