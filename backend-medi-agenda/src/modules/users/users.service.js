import { usersRepository } from './users.repository.js';
import { hashPassword } from '../../utils/authUtils.js';
import { AppError } from '../../utils/AppError.js';
import { auditsService } from '../audits/audits.service.js';

// Lista de roles permitidos para los usuarios.
const VALID_ROLES = ['admin', 'doctor', 'patient', 'receptionist'];

// Verifica que la recepcionista exista, tenga el rol correcto y esté activa
async function assertValidReceptionist(receptionistId) {
  const recep = await usersRepository.findById(receptionistId);
  if (!recep) throw new AppError('Recepcionista no encontrada', 404);
  if (recep.role !== 'receptionist') throw new AppError('El usuario no es recepcionista', 400);
  if (!recep.isActive) throw new AppError('La recepcionista está desactivada', 400);
}

// Quita la recepcionista indicada de todos los doctores asignados a ella
async function clearReceptionistFromDoctors(receptionistId) {
  const doctors = await usersRepository.findDoctorsByReceptionist(receptionistId);
  await Promise.all(
    doctors.map(d => usersRepository.update(d.id, { assignedReceptionistId: null }))
  );
}

export const usersService = {
  async list(filters) {
    const { role, isActive, search } = filters ?? {};
    const parsedIsActive = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return usersRepository.findAll({ role, isActive: parsedIsActive, search });
  },

  async listPaginated(filters) {
    const { role, isActive, search, page, pageSize } = filters ?? {};
    const parsedIsActive = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedPageSize = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 10));
    return usersRepository.findPaginated({
      role,
      isActive: parsedIsActive,
      search,
      page: parsedPage,
      pageSize: parsedPageSize,
    });
  },

  async getById(id) {
    const user = await usersRepository.findById(id);
    if (!user) throw new AppError('Usuario no encontrado', 404);
    return user;
  },

  async create({ name, email, password, role, assignedReceptionistId, specialtyId }, currentUser) {
    if (!VALID_ROLES.includes(role)) throw new AppError('Rol inválido', 400);

    if (currentUser && currentUser.role === 'receptionist' && role !== 'patient') {
      throw new AppError('Las recepcionistas solo pueden crear pacientes', 403);
    }

    const existing = await usersRepository.findByEmail(email);
    if (existing) throw new AppError('Email ya registrado', 409);

    if (assignedReceptionistId) {
      if (role !== 'doctor') throw new AppError('Solo los doctores pueden tener recepcionista asignada', 400);
      await assertValidReceptionist(assignedReceptionistId);
    }

    const password_hash = await hashPassword(password);
    const data = { name, email, password_hash, role };
    if (role === 'doctor' && assignedReceptionistId) data.assignedReceptionistId = assignedReceptionistId;
    if (role === 'doctor' && specialtyId) data.specialtyId = specialtyId;

    const newUser = await usersRepository.create(data);

    await auditsService.logAction({
      currentUser,
      action: 'CREATE',
      resource: 'USER',
      resourceId: newUser.id,
      details: `Creó un nuevo ${role}: ${newUser.email}`
    }).catch(err => console.error("Error auditoría:", err));

    return newUser;
  },

  async update(id, { name, email, role, isActive, assignedReceptionistId, specialtyId }, currentUser) {
    const user = await usersRepository.findById(id);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    if (role !== undefined && !VALID_ROLES.includes(role)) throw new AppError('Rol inválido', 400);

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) {
      const other = await usersRepository.findByEmail(email);
      if (other && other.id !== id) throw new AppError('Email ya registrado', 409);
      updates.email = email;
    }
    if (role !== undefined) {
      updates.role = role;
      if (role !== 'doctor') updates.assignedReceptionistId = null;
    }
    if (isActive !== undefined) updates.isActive = isActive;

    if (assignedReceptionistId !== undefined) {
      const targetRole = role ?? user.role;
      if (targetRole !== 'doctor') throw new AppError('Solo los doctores pueden tener recepcionista asignada', 400);
      if (assignedReceptionistId !== null) await assertValidReceptionist(assignedReceptionistId);
      updates.assignedReceptionistId = assignedReceptionistId;
    }

    if (specialtyId !== undefined) {
      const targetRole = role ?? user.role;
      if (targetRole !== 'doctor') throw new AppError('Solo los doctores pueden tener especialidad asignada', 400);
      updates.specialtyId = specialtyId;
    }

    const updatedUser = await usersRepository.update(id, updates);

    await auditsService.logAction({
      currentUser,
      action: 'UPDATE',
      resource: 'USER',
      resourceId: id,
      details: `Actualizó el usuario: ${user.email}`
    }).catch(err => console.error("Error auditoría:", err));

    return updatedUser;
  },

  async setActive(id, isActive, currentUser) {
    const user = await usersRepository.findById(id);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const updated = await usersRepository.update(id, { isActive });

    if (!isActive && user.role === 'receptionist') {
      await clearReceptionistFromDoctors(id);
    }

    await auditsService.logAction({
      currentUser,
      action: 'UPDATE',
      resource: 'USER',
      resourceId: id,
      details: `Cambió el estado activo a ${isActive} para el usuario: ${user.email}`
    }).catch(err => console.error("Error auditoría:", err));

    return updated;
  },

  async assignReceptionist(doctorId, receptionistId, currentUser) {
    const doctor = await usersRepository.findById(doctorId);
    if (!doctor) throw new AppError('Doctor no encontrado', 404);
    if (doctor.role !== 'doctor') throw new AppError('El usuario no es doctor', 400);

    if (receptionistId !== null) await assertValidReceptionist(receptionistId);

    const updated = await usersRepository.update(doctorId, { assignedReceptionistId: receptionistId ?? null });

    await auditsService.logAction({
      currentUser,
      action: 'UPDATE',
      resource: 'USER',
      resourceId: doctorId,
      details: receptionistId ? `Asignó la recepcionista ID ${receptionistId} al doctor` : 'Removió la recepcionista del doctor'
    }).catch(err => console.error("Error auditoría:", err));

    return updated;
  },

  async softDelete(id, currentUser) {
    const user = await usersRepository.findById(id);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    await usersRepository.softDelete(id);

    if (user.role === 'receptionist') {
      await clearReceptionistFromDoctors(id);
    }

    await auditsService.logAction({
      currentUser,
      action: 'DELETE',
      resource: 'USER',
      resourceId: id,
      details: `Eliminación lógica del usuario: ${user.email}`
    }).catch(err => console.error("Error auditoría:", err));
  },
};