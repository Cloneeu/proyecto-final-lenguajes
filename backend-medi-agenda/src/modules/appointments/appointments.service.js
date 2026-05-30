import { appointmentsRepository } from './appointments.repository.js';
import { AppError } from '../../utils/AppError.js';
import { auditsService } from '../audits/audits.service.js';

// Para checar si una cita se superpone con otra, en formato "HH:MM" y date es "YYYY-MM-DD".
function timesOverlap(s1, e1, s2, e2) {
  return s1 < e2 && e1 > s2;
}

async function assertNoConflict(doctorId, date, startTime, endTime, excludeId = null) {
  const existing = await appointmentsRepository.findByDoctorAndDate(doctorId, date);
  const conflict = existing.find(
    a => a.id !== excludeId && timesOverlap(startTime, endTime, a.startTime, a.endTime)
  );
  if (conflict) {
    throw new AppError(
      `El doctor ya tiene una cita de ${conflict.startTime} a ${conflict.endTime} en la fecha ${date}`,
      409
    );
  }
}

function assertStatusTransition(currentStatus, newStatus, role) {
  if (role === 'admin') return;
  if (role === 'receptionist' && ['confirmed', 'cancelled'].includes(newStatus)) return;
  if (role === 'doctor' && ['completed', 'cancelled'].includes(newStatus)) return;
  if (role === 'patient' && newStatus === 'cancelled') return;
  throw new AppError(`El ROL: '${role}' no puede cambiar el STATUS a: '${newStatus}'`, 403);
}

function assertOwnership(appt, user) {
  if (user.role === 'doctor' && appt.doctorId !== user.id) {
    throw new AppError('Prohibido', 403);
  }
  if (user.role === 'patient' && appt.patientId !== user.id) {
    throw new AppError('Prohibido', 403);
  }
}

export const appointmentsService = {
    async getAll(user) {
    if (user.role === 'admin') return appointmentsRepository.findAll();
    
    if (user.role === 'doctor') return appointmentsRepository.findByDoctor(user.id);
    
    if (user.role === 'patient') return appointmentsRepository.findByPatient(user.id);
    
    if (user.role === 'receptionist') {
      const { usersRepository } = await import('../users/users.repository.js');
      const assignedDoctors = await usersRepository.findDoctorsByReceptionist(user.id);
      const doctorIds = assignedDoctors.map(d => d.id);
      
      if (doctorIds.length === 0) return [];
      
      const allAppts = await appointmentsRepository.findAll();
      return allAppts.filter(a => doctorIds.includes(a.doctorId));
    }

    return [];
  },

  async getById(id, user) {
    const appt = await appointmentsRepository.findById(id);
    if (!appt) throw new AppError('Cita no encontrada', 404);
    assertOwnership(appt, user);
    return appt;
  },

  async create(data, user) {
    if (user.role === 'patient') data.patientId = user.id;
    await assertNoConflict(data.doctorId, data.date, data.startTime, data.endTime);
    
    const newAppointment = await appointmentsRepository.create(data);

    await auditsService.logAction({
      currentUser: user,
      action: 'CREATE',
      resource: 'APPOINTMENT',
      resourceId: newAppointment.id,
      details: `Cita programada para el paciente ID: ${data.patientId} con estado ${data.status || 'pending'}`
    }).catch(err => console.error("Error auditoría:", err));

    return newAppointment;
  },

  async update(id, data, user) {
    const appt = await appointmentsRepository.findById(id);
    if (!appt) throw new AppError('Cita no encontrada', 404);

    const doctorId = data.doctorId ?? appt.doctorId;
    const date = data.date ?? appt.date;
    const startTime = data.startTime ?? appt.startTime;
    const endTime = data.endTime ?? appt.endTime;

    if (data.doctorId || data.date || data.startTime || data.endTime) {
      await assertNoConflict(doctorId, date, startTime, endTime, id);
    }

    const updated = await appointmentsRepository.update(id, data);

    await auditsService.logAction({
      currentUser: user,
      action: 'UPDATE',
      resource: 'APPOINTMENT',
      resourceId: id,
      details: `Cita actualizada`
    }).catch(err => console.error("Error auditoría:", err));

    return updated;
  },

  async updateStatus(id, status, user) {
    const appt = await appointmentsRepository.findById(id);
    if (!appt || appt.deletedAt) throw new AppError('Cita no encontrada', 404);
    assertOwnership(appt, user);
    assertStatusTransition(appt.status, status, user.role);
    
    const updated = await appointmentsRepository.update(id, { status });

    await auditsService.logAction({
      currentUser: user,
      action: 'UPDATE',
      resource: 'APPOINTMENT',
      resourceId: id,
      details: `Cita cambiada a estado: ${status}`
    }).catch(err => console.error("Error auditoría:", err));

    return updated;
  },

  async delete(id, user) {
    const appt = await appointmentsRepository.findById(id);
    if (!appt || appt.deletedAt) throw new AppError('Cita no encontrada', 404);
    
    await appointmentsRepository.delete(id);

    await auditsService.logAction({
      currentUser: user,
      action: 'DELETE',
      resource: 'APPOINTMENT',
      resourceId: id,
      details: `Cita eliminada`
    }).catch(err => console.error("Error auditoría:", err));
  },
};