import { AppError } from '../utils/AppError.js';

export function validate(schema) {
  return (req, res, next) => {
    // Valida el body con el esquema recibido
    const { error } = schema(req.body);
    if (error) return next(new AppError(error, 400));
    next();
  };
}
