export function sendSuccess(res, data, statusCode = 200, message = 'OK') {
  // Para tener una respuesta estándar para casos exitosos
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendError(res, message, statusCode = 500) {
  // Para tener un estándar para errores 
  return res.status(statusCode).json({ success: false, message, data: null });
}
