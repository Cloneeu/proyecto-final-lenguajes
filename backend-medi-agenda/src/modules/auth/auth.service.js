import { authRepository } from './auth.repository.js';
import { hashPassword, comparePassword, generateToken } from '../../utils/authUtils.js';
import { AppError } from '../../utils/AppError.js';
import { auditsService } from '../audits/audits.service.js';

export const authService = {
    async register(data) {
    const { email, password, name, role, ...extraData } = data;
    
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) throw new AppError('El usuario ya existe', 400);

    const hashedPassword = await hashPassword(password);
    
    const newUser = await authRepository.createUser({
      name,
      email,
      password_hash: hashedPassword,
      role: role || 'patient',
      isActive: true,
      createdAt: new Date().toISOString()
    });

    // Si es un paciente y envió datos de cita, la creamos automáticamente como pendiente
    if (newUser.role === 'patient' && extraData.doctorId && extraData.fechaCita) {
      const { appointmentsRepository } = await import('../appointments/appointments.repository.js');
      
      // Separar fecha y hora si vienen juntas (formato datetime-local)
      const [date, fullTime] = extraData.fechaCita.split('T');
      const startTime = fullTime ? fullTime.substring(0, 5) : "00:00";
      
      // Calcular una hora de fin genérica (30 min después)
      const [h, m] = startTime.split(':').map(Number);
      const endM = (m + 30) % 60;
      const endH = h + Math.floor((m + 30) / 60);
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      await appointmentsRepository.create({
        patientId: newUser.id,
        doctorId: extraData.doctorId,
        date: date,
        startTime: startTime,
        endTime: endTime,
        reason: extraData.motivo || 'Primera cita (Registro)',
        status: 'pending', // <--- Clave para la recepcionista
        notes: `Teléfono: ${extraData.telefono || 'No provisto'}. Edad: ${extraData.edad || '?'}`
      });
    }

    const token = generateToken({ id: newUser.id, role: newUser.role });

    // Registro de auditoría
    await auditsService.logAction({
      currentUser: { id: newUser.id, name: newUser.name, role: newUser.role },
      action: 'CREATE',
      resource: 'AUTH',
      resourceId: newUser.id,
      details: `Nuevo usuario registrado: ${newUser.email} con rol ${newUser.role}`
    }).catch(err => console.error("Error auditoría:", err));

    return { token, user: { id: newUser.id, name: newUser.name, role: newUser.role } };
  },

  async login(email, password) {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new AppError('Credenciales inválidas', 401);

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) throw new AppError('Credenciales inválidas', 401);

    const token = generateToken({ id: user.id, role: user.role });

    // Registro de auditoría
    await auditsService.logAction({
      currentUser: user,
      action: 'LOGIN',
      resource: 'AUTH',
      resourceId: user.id,
      details: `Inicio de sesión exitoso como ${user.role}`
    }).catch(err => console.error("Error auditoría:", err));

    return { token, user: { id: user.id, name: user.name, role: user.role } };
  }
};