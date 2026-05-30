// Roles permitidos para los usuarios del sistema
const VALID_ROLES = ['admin', 'doctor', 'patient', 'receptionist'];
// Expresión regular básica para validar el formato del correo electrónico
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCreateUser(body) {
  // El nombre es obligatorio y no puede contener solo espacios
  if (!body.name || !body.name.trim()) return { error: 'El nombre es obligatorio' };

  // Se valida que el correo tenga un formato válido
  if (!body.email || !EMAIL_RE.test(body.email)) return { error: 'Correo electrónico inválido' };

  // La contraseña debe cumplir con una longitud mínima
  if (!body.password || body.password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres' };

  // Solo se aceptan roles definidos en VALID_ROLES
  if (!body.role || !VALID_ROLES.includes(body.role)) return { error: 'Rol inválido' };

  // Solo los doctores pueden tener una recepcionista asignada
  if (body.assignedReceptionistId !== undefined && body.role !== 'doctor') {
    return { error: 'Solo los doctores pueden tener recepcionista asignada' };
  }

  return { error: null };
}

export function validateUpdateUser(body) {
  // Si se actualiza el correo, se verifica su formato
  if (body.email !== undefined && !EMAIL_RE.test(body.email)) return { error: 'Correo electrónico inválido' };

  // Si se actualiza el rol, debe ser uno de los permitidos
  if (body.role !== undefined && !VALID_ROLES.includes(body.role)) return { error: 'Rol inválido' };

  // El campo isActive solo admite valores booleanos
  if (body.isActive !== undefined && typeof body.isActive !== 'boolean') return { error: 'isActive debe ser booleano' };

  // assignedReceptionistId puede ser un string o null para desasignar
  if (body.assignedReceptionistId !== undefined) {
    if (body.assignedReceptionistId !== null && typeof body.assignedReceptionistId !== 'string') {
      return { error: 'assignedReceptionistId debe ser un string o null' };
    }
  }

  return { error: null };
}

export function validateToggleActive(body) {
  // El estado activo/inactivo debe enviarse como booleano
  if (typeof body.isActive !== 'boolean') return { error: 'isActive debe ser booleano' };

  return { error: null };
}

export function validateAssignReceptionist(body) {
  // receptionistId es obligatorio para asignar o desasignar
  if (body.receptionistId === undefined) return { error: 'receptionistId es obligatorio' };

  // Se acepta un identificador string o null
  if (body.receptionistId !== null && typeof body.receptionistId !== 'string') {
    return { error: 'receptionistId debe ser un string o null' };
  }

  return { error: null };
}
