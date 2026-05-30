import { specialtiesRepository } from './specialties.repository.js';
import { auditsService } from '../audits/audits.service.js';

export const specialtiesService = {
    getAllSpecialties: async () => {
        return await specialtiesRepository.findAll();
    },

    createSpecialty: async (name, currentUser) => {
        // ¿ya existe una especialidad con el mismo nombre?
        const allSpecialties = await specialtiesRepository.findAll();
        const exists = allSpecialties.some(
            spec => spec.name.toLowerCase() === name.toLowerCase()
        );

        if (exists) {
            throw new Error("Esta especialidad ya está registrada en el sistema. 😨");
        }

        const newSpecialty = await specialtiesRepository.create(name);

        await auditsService.logAction({
            currentUser,
            action: 'CREATE',
            resource: 'SPECIALTY',
            resourceId: newSpecialty.id || 'N/A',
            details: `Nueva especialidad creada: ${name}`
        }).catch(err => console.error("Error auditoría:", err));

        return newSpecialty;
    }
};