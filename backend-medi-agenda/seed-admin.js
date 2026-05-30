/*
  Script para crear el usuario de admin en nuestro firebase,
  si el admin ya existe, no hace nada.
*/

import { db } from './src/config/firebase.js';
import { hashPassword } from './src/utils/authUtils.js';

const email = "admin@mediagenda.com";
const password = "12345678";
const name = "admin";

async function seed() {
  const snap = await db.collection('users').where('email', '==', email).get();
  if (!snap.empty) {
    console.log(`Admin ya existe (id: ${snap.docs[0].id}), skip.`);
    process.exit(0);
  }

  const password_hash = await hashPassword(password);
  const now = new Date().toISOString();

  const ref = await db.collection('users').add({
    name,
    email,
    password_hash,
    role: 'admin',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  console.log(`Admin creado: ${ref.id} (${email})`);
  process.exit(0);
}

seed().catch(err => {
  console.error('Error en seed-admin:', err);
  process.exit(1);
});
