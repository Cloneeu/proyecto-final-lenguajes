import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { env } from './env.js';

// Inicializa Firebase solo una vez para evitar duplicar
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey,
    }),
  });
}

// Exporta la conexion a la DB
export const db = getFirestore();
