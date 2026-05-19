import { specialtiesRepository } from './specialties.repository.js';

export const specialtiesService = {
    getAllSpecialties: async () => {
        return await specialtiesRepository.findAll();
    },

    createSpecialty: async (name) => {
        //  ya existe una especialidad con el mismo nombre?
        const allSpecialties = await specialtiesRepository.findAll();
        const exists = allSpecialties.some(
            spec => spec.name.toLowerCase() === name.toLowerCase()
        );

        if (exists) {
            throw new Error("Esta especialidad ya está registrada en el sistema. 😨");
        }

        return await specialtiesRepository.create(name);
    }
};