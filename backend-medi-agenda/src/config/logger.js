export const logger = {
  // Mensajes informativos
  info: (...args) => console.log('[INFO]', new Date().toISOString(), ...args),
  // Advertencias
  warn: (...args) => console.warn('[WARN]', new Date().toISOString(), ...args),
  // Errores para registrar fallos y excepciones.
  error: (...args) => console.error('[ERROR]', new Date().toISOString(), ...args),
};
