import { AppError } from '../utils/AppError.js';
import { logger } from '../config/logger.js';

export function errorHandler(err, req, res, next) {
  // Devolver el error con su código y mensaje
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: null,
    });
  }

  // Cualquier otro error hay que registrarlo en el logger 
  // y se responde como fallo interno del server
  logger.error(err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    data: null,
  });
}
