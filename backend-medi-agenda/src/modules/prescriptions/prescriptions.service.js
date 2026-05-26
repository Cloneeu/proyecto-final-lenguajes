import { prescriptionsRepository } from './prescriptions.repository.js';
import { AppError } from '../../utils/AppError.js';
import { auditsService } from '../audits/audits.service.js';

function assertOwnership(rx, user) {
  if (user.role === 'doctor' && rx.doctorId !== user.id) throw new AppError('Prohibido', 403);
  if (user.role === 'patient' && rx.patientId !== user.id) throw new AppError('Prohibido', 403);
}

export const prescriptionsService = {
  async getAll(user) {
    if (user.role === 'doctor') return prescriptionsRepository.findByDoctor(user.id);
    if (user.role === 'patient') return prescriptionsRepository.findByPatient(user.id);
    return prescriptionsRepository.findAll();
  },

  async getById(id, user) {
    const rx = await prescriptionsRepository.findById(id);
    if (!rx) throw new AppError('Receta no encontrada', 404);
    assertOwnership(rx, user);
    return rx;
  },

  async create(data, user) {
    if (user.role === 'doctor') data.doctorId = user.id;
    const newPrescription = await prescriptionsRepository.create(data);

    await auditsService.logAction({
      currentUser: user,
      action: 'CREATE',
      resource: 'PRESCRIPTION',
      resourceId: newPrescription.id,
      details: `Receta emitida para Paciente ID: ${data.patientId}`
    }).catch(err => console.error("Error auditoría:", err));

    return newPrescription;
  },

  async update(id, data, user) {
    const rx = await prescriptionsRepository.findById(id);
    if (!rx || rx.deletedAt) throw new AppError('Receta no encontrada', 404);
    assertOwnership(rx, user);
    const updated = await prescriptionsRepository.update(id, data);

    await auditsService.logAction({
      currentUser: user,
      action: 'UPDATE',
      resource: 'PRESCRIPTION',
      resourceId: id,
      details: `Receta actualizada`
    }).catch(err => console.error("Error auditoría:", err));

    return updated;
  },

  async delete(id, user) {
    const rx = await prescriptionsRepository.findById(id);
    if (!rx || rx.deletedAt) throw new AppError('Receta no encontrada', 404);
    assertOwnership(rx, user);
    await prescriptionsRepository.delete(id);

    await auditsService.logAction({
      currentUser: user,
      action: 'DELETE',
      resource: 'PRESCRIPTION',
      resourceId: id,
      details: `Receta eliminada`
    }).catch(err => console.error("Error auditoría:", err));
  },
};