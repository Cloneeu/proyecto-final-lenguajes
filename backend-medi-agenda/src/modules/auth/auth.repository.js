import { db } from '../../config/firebase.js';

export const authRepository = {
  async findByEmail(email) {
    const snapshot = await db.collection('users').where('email', '==', email).get();
    if (snapshot.empty) return null;
    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
  },

  async createUser(userData) {
    const docRef = await db.collection('users').add(userData);
    return { id: docRef.id, ...userData };
  }
};