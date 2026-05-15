import { authRepository } from './auth.repository.js';
import { hashPassword, comparePassword, generateToken } from '../../utils/authUtils.js';
import { AppError } from '../../utils/AppError.js';

export const authService = {
  async register({ email, password, name, role }) {
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) throw new AppError('El usuario ya existe', 400);

    const hashedPassword = await hashPassword(password);
    
    const newUser = await authRepository.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || 'patient',
      createdAt: new Date().toISOString()
    });

    const token = generateToken({ id: newUser.id, role: newUser.role });
    return { token, user: { id: newUser.id, name: newUser.name, role: newUser.role } };
  },

  async login(email, password) {
    const user = await authRepository.findByEmail(email);
    if (!user) throw new AppError('Credenciales inválidas', 401);

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new AppError('Credenciales inválidas', 401);

    const token = generateToken({ id: user.id, role: user.role });
    return { token, user: { id: user.id, name: user.name, role: user.role } };
  }
};