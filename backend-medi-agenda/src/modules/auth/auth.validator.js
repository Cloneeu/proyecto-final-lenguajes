export const registerSchema = (body) => {
  if (!body.name) return { error: 'El nombre es obligatorio' };
  if (!body.email || !body.email.includes('@')) return { error: 'Correo electrónico inválido' };
  if (!body.password || body.password.length < 6) return { error: 'La contraseña debe tener al menos 6 caracteres' };
  
  const validRoles = ['admin', 'doctor', 'patient', 'receptionist'];
  if (body.role && !validRoles.includes(body.role)) {
    return { error: 'El rol proporcionado no es válido' };
  }

  return { error: null };
};

export const loginSchema = (body) => {
  if (!body.email) return { error: 'El correo electrónico es obligatorio' };
  if (!body.password) return { error: 'La contraseña es obligatoria' };
  return { error: null };
};