import { env } from './config/env.js';
import { logger } from './config/logger.js';
import app from './app.js';

// Inicia el servidor HTTP en el puerto de la config
app.listen(env.port, () => {
  console.log(`Servidor corriendo en el puerto: ${env.port}`);
  console.log(`Checar: http://localhost:${env.port}/health para verificar que todo este bien`);
});
