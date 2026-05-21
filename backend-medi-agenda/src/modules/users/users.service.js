import { usersRepository } from './users.repository.js';
import { hashPassword } from '../../utils/authUtils.js';
import { AppError } from '../../utils/AppError.js';

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
  // Devuelve la lista de usuarios aplicando filtros opcionales
  async list(filters) {
    const { role, isActive, search } = filters ?? {};
    const parsedIsActive = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return usersRepository.findAll({ role, isActive: parsedIsActive, search });
  },

  // Busca un usuario por su ID
  async getById(id) {
    const user = await usersRepository.findById(id);
    if (!user) throw new AppError('Usuario no encontrado', 404);
    return user;
  },

  // Crea un usuario nuevo validando rol, email y asignación de recepcionista
  async create({ name, email, password, role, assignedReceptionistId, specialtyId }, currentUser) {
    if (!VALID_ROLES.includes(role)) throw new AppError('Rol inválido', 400);

    // Las recepcionistas solo pueden crear pacientes
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
    if (role === 'doctor' && assignedReceptionistId) data.assignedReceptionistId = assignedReceptionistId; // Se asigna la recepcionista solo si el rol es doctor
    if (role === 'doctor' && specialtyId) data.specialtyId = specialtyId; // Se asigna la especialidad solo si el rol es doctor

    return usersRepository.create(data);
  },

  // Actualiza los datos de un usuario y mantiene consistencia en las relaciones
  async update(id, { name, email, role, isActive, assignedReceptionistId, specialtyId }) {
    // Verifica que el usuario exista antes de aplicar cualquier cambio
    const user = await usersRepository.findById(id);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    // Solo se aceptan los roles definidos en la constante de validación
    if (role !== undefined && !VALID_ROLES.includes(role)) throw new AppError('Rol inválido', 400);

    // Acumula únicamente los campos que fueron enviados en la petición
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) {
      // Evita que dos usuarios distintos compartan el mismo correo
      const other = await usersRepository.findByEmail(email);
      if (other && other.id !== id) throw new AppError('Email ya registrado', 409);
      updates.email = email;
    }
    if (role !== undefined) {
      // Si el rol cambia a uno que no sea doctor, se elimina la asignación
      updates.role = role;
      if (role !== 'doctor') updates.assignedReceptionistId = null;
    }
    if (isActive !== undefined) updates.isActive = isActive;

    if (assignedReceptionistId !== undefined) {
      // Solo un doctor puede tener recepcionista asignada
      const targetRole = role ?? user.role;
      if (targetRole !== 'doctor') throw new AppError('Solo los doctores pueden tener recepcionista asignada', 400);
      // Si se asigna una recepcionista, se valida que exista, sea recepcionista y esté activa
      if (assignedReceptionistId !== null) await assertValidReceptionist(assignedReceptionistId);
      updates.assignedReceptionistId = assignedReceptionistId;
    }

    // Solo un doctor puede tener especialidad asignada
    if (specialtyId !== undefined) {
      const targetRole = role ?? user.role;
      if (targetRole !== 'doctor') throw new AppError('Solo los doctores pueden tener especialidad asignada', 400);
      updates.specialtyId = specialtyId;
    }

    // Persiste la actualización final después de validar todas las reglas
    return usersRepository.update(id, updates);
  },

  // Cambia el estado activo/inactivo y limpia asignaciones si el usuario es recepcionista
  async setActive(id, isActive) {
    const user = await usersRepository.findById(id);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const updated = await usersRepository.update(id, { isActive });

    if (!isActive && user.role === 'receptionist') {
      await clearReceptionistFromDoctors(id);
    }

    return updated;
  },

  // Asigna o elimina una recepcionista para un doctor.
  async assignReceptionist(doctorId, receptionistId) {
    const doctor = await usersRepository.findById(doctorId);
    if (!doctor) throw new AppError('Doctor no encontrado', 404);
    if (doctor.role !== 'doctor') throw new AppError('El usuario no es doctor', 400);

    if (receptionistId !== null) await assertValidReceptionist(receptionistId);

    return usersRepository.update(doctorId, { assignedReceptionistId: receptionistId ?? null });
  },

  // Realiza una eliminación lógica del usuario y libera relaciones asociadas.
  async softDelete(id) {
    const user = await usersRepository.findById(id);
    if (!user) throw new AppError('Usuario no encontrado', 404);

    await usersRepository.softDelete(id);

    if (user.role === 'receptionist') {
      await clearReceptionistFromDoctors(id);
    }
  },
};
