import { authService } from './auth.service.js';
import { sendSuccess } from '../../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    // Orden correcto: res, data, statusCode, message
    sendSuccess(res, result, 201, 'Usuario registrado con éxito');
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    sendSuccess(res, result, 200, 'Login exitoso');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  sendSuccess(res, req.user, 200, 'Datos del usuario');
};

export const logout = async (req, res) => {
  sendSuccess(res, null, 200, 'Sesión cerrada exitosamente');
};