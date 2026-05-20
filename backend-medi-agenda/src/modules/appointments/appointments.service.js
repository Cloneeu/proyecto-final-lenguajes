import { appointmentsRepository } from './appointments.repository.js';
import { AppError } from '../../utils/AppError.js';

function timesOverlap(s1, e1, s2, e2) {
  // Dos rangos se cruzan si el inicio de uno cae antes del fin del otro
  return s1 < e2 && e1 > s2;
}

async function assertNoConflict(doctorId, date, startTime, endTime, excludeId = null) {
  // Revisa si ya existe otra cita del doctor en el mismo horario
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
  // El administrador puede hacer cualquier cambio de estado.
  if (role === 'admin') return;
    // Recepción solo maneja confirmación o cancelación
  if (role === 'receptionist' && ['confirmed', 'cancelled'].includes(newStatus)) return;
  // El doctor puede marcar como completada o cancelada
  if (role === 'doctor' && ['completed', 'cancelled'].includes(newStatus)) return;
  // El paciente solo puede cancelar su propia cita
  if (role === 'patient' && newStatus === 'cancelled') return;
  throw new AppError(`El ROL: '${role}' no puede cambiar el STATUS a: '${newStatus}'`, 403);
}

function assertOwnership(appt, user) {
  // Verifica que el rol del usuario para que acceda a sus propias citas
  if (user.role === 'doctor' && appt.doctorId !== user.id) {
    throw new AppError('Prohibido', 403);
  }
  if (user.role === 'patient' && appt.patientId !== user.id) {
    throw new AppError('Prohibido', 403);
  }
}

export const appointmentsService = {
    async getAll(user) {
    // El administrador ve todo
    if (user.role === 'admin') return appointmentsRepository.findAll();
    
    // El doctor ve sus citas
    if (user.role === 'doctor') return appointmentsRepository.findByDoctor(user.id);
    
    // El paciente ve sus citas
    if (user.role === 'patient') return appointmentsRepository.findByPatient(user.id);
    
    // La recepcionista ve las citas de los doctores que tiene asignados
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
    // Busca la cita y valida que el usuario tenga acceso a ella
    const appt = await appointmentsRepository.findById(id);
    if (!appt) throw new AppError('Cita no encontrada', 404);
    assertOwnership(appt, user);
    return appt;
  },

  async create(data, user) {
    // Si el creador es paciente, su identidad queda asociada automáticamente
    if (user.role === 'patient') data.patientId = user.id;
    // Antes de guardar, se valida que no exista una cita superpuesta
    await assertNoConflict(data.doctorId, data.date, data.startTime, data.endTime);
    return appointmentsRepository.create(data);
  },

  async update(id, data, user) {
    // Carga el registro actual para comparar cambios y mantener consistencia
    const appt = await appointmentsRepository.findById(id);
    if (!appt) throw new AppError('Cita no encontrada', 404);

    // Si cambia algún dato relevante, hay que volver a comprobar conflictos
    const doctorId = data.doctorId ?? appt.doctorId;
    const date = data.date ?? appt.date;
    const startTime = data.startTime ?? appt.startTime;
    const endTime = data.endTime ?? appt.endTime;

    if (data.doctorId || data.date || data.startTime || data.endTime) {
      await assertNoConflict(doctorId, date, startTime, endTime, id);
    }

    return appointmentsRepository.update(id, data);
  },

  async updateStatus(id, status, user) {
    // Hay que validar la existencia, propiedad y transición de un estado antes de actualizar la cita
    const appt = await appointmentsRepository.findById(id);
    // Validamos que la cita exista antes de intentar actualizar su estado
    if (!appt || appt.deletedAt) throw new AppError('Cita no encontrada', 404);
    assertOwnership(appt, user);
    assertStatusTransition(appt.status, status, user.role);
    return appointmentsRepository.update(id, { status });
  },

  async delete(id) {
    const appt = await appointmentsRepository.findById(id);
    // Validamos que la cita exista antes de intentar eliminarla
    if (!appt || appt.deletedAt) throw new AppError('Cita no encontrada', 404);
    await appointmentsRepository.delete(id);
  },
};
