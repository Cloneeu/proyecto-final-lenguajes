import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export function authenticate(req, res, next) {
  // Lee el token desde el header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  // Extrae solo el valor del token
  const token = authHeader.slice(7);
  try {
    // Verifica la firma y guarda el payload en la request
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    next();
  } catch {
    // Si falla la verificación, el token pues no es valido o ya expiró
    next(new AppError('Invalid or expired token', 401));
  }
}
