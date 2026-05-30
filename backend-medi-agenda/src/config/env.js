import 'dotenv/config';

export const env = {
  // Configuracion de la API
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  // Credenciales de Firebase 
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  // Config de CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4000',
};

if (!env.jwtSecret) {
  // Sin esta clave no se pueden firmar los tokens JWT
  throw new Error('JWT_SECRET es requerido en las variables de entorno');
}
