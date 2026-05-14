import { prescriptionsRepository } from './prescriptions.repository.js';
import { AppError } from '../../utils/AppError.js';

function assertOwnership(rx, user) {
  // Verifica que el usuario solo manipule recetas que le pertenecen
  if (user.role === 'doctor' && rx.doctorId !== user.id) throw new AppError('Prohibido', 403);
  if (user.role === 'patient' && rx.patientId !== user.id) throw new AppError('Prohibido', 403);
}

export const prescriptionsService = {
  async getAll(user) {
    // Devuelve recetas según el rol, doctor ve las suyas, paciente las suyas, el admin todas.
    if (user.role === 'doctor') return prescriptionsRepository.findByDoctor(user.id);
    if (user.role === 'patient') return prescriptionsRepository.findByPatient(user.id);
    return prescriptionsRepository.findAll();
  },

  async getById(id, user) {
    // Recupera la recetea y valida el acceso
    const rx = await prescriptionsRepository.findById(id);
    if (!rx) throw new AppError('Receta no encontrada', 404);
    assertOwnership(rx, user);
    return rx;
  },

  async create(data, user) {
    // Si el usuario es doctor se le asigna como autor de la receta
    if (user.role === 'doctor') data.doctorId = user.id;
    return prescriptionsRepository.create(data);
  },

  async update(id, data, user) {
    // Actualiza solo si existe y el usuario tiene permisos
    const rx = await prescriptionsRepository.findById(id);
    if (rx.deletedAt) throw new AppError('Receta no encontrada', 404);
    if (!rx) throw new AppError('Prescription not found', 404);
    assertOwnership(rx, user);
    return prescriptionsRepository.update(id, data);
  },

  async delete(id, user) {
    // Verifica su existencia y propiedad antes de eliminar
    const rx = await prescriptionsRepository.findById(id);
    if (rx.deletedAt) throw new AppError('Receta no encontrada', 404);
    if (!rx) throw new AppError('Prescription not found', 404);
    assertOwnership(rx, user);
    await prescriptionsRepository.delete(id);
  },
};
