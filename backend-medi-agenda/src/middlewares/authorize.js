import { AppError } from '../utils/AppError.js';

export function authorize(...roles) {
  return (req, res, next) => {
    // Primero hay que confirmar que el usuario ya esté autenticado
    if (!req.user) return next(new AppError('Not authenticated', 401));
    // Luego hay que validar que su rol esté dentro de los permitidos
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
}
