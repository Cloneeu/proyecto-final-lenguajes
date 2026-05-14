export class AppError extends Error {
  constructor(message, statusCode = 500) {
    // Extiende Error para transportar también un código HTTP
    super(message);
    this.statusCode = statusCode;
    // Marca el error como esperado y controlado por la app
    this.isOperational = true;
    // Esto es para conservar de donde viene el error en el stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
