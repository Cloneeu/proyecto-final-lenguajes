import { specialtiesRepository } from './specialties.repository.js';
import { usersRepository } from '../users/users.repository.js';
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
    },

    updateSpecialty: async (id, name, currentUser) => {
        const current = await specialtiesRepository.findById(id);
        if (!current) {
            throw Object.assign(new Error("Especialidad no encontrada"), { status: 404 });
        }

        // El nombre no puede chocar con otra especialidad distinta
        const allSpecialties = await specialtiesRepository.findAll();
        const exists = allSpecialties.some(
            spec => spec.id !== id && spec.name.toLowerCase() === name.toLowerCase()
        );
        if (exists) {
            throw new Error("Ya existe otra especialidad con ese nombre. 😨");
        }

        const updated = await specialtiesRepository.update(id, name);

        await auditsService.logAction({
            currentUser,
            action: 'UPDATE',
            resource: 'SPECIALTY',
            resourceId: id,
            details: `Especialidad actualizada: ${current.name} → ${name}`
        }).catch(err => console.error("Error auditoría:", err));

        return updated;
    },

    deleteSpecialty: async (id, currentUser) => {
        const current = await specialtiesRepository.findById(id);
        if (!current) {
            throw Object.assign(new Error("Especialidad no encontrada"), { status: 404 });
        }

        // No se puede borrar una especialidad que algún doctor esté usando
        const doctors = await usersRepository.findAll({ role: 'doctor' });
        const inUse = doctors.filter(d => d.specialtyId === id).length;
        if (inUse > 0) {
            throw Object.assign(
                new Error(`No se puede borrar: ${inUse} doctor(es) usan esta especialidad`),
                { status: 409 }
            );
        }

        await specialtiesRepository.remove(id);

        await auditsService.logAction({
            currentUser,
            action: 'DELETE',
            resource: 'SPECIALTY',
            resourceId: id,
            details: `Especialidad eliminada: ${current.name}`
        }).catch(err => console.error("Error auditoría:", err));
    }
};