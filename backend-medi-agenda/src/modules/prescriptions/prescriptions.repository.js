import { db } from '../../config/firebase.js';

const COLLECTION = 'prescriptions';

export const prescriptionsRepository = {
  async findAll() {
    // Obtiene todas las recetas ordenadas por creación (más recientes primero)
    const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async findById(id) {
    // Recupera una receta por su identificador en Firestore
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async findByDoctor(doctorId) {
    // Filtra recetas creadas por un doctor en concreto
    const snap = await db.collection(COLLECTION)
      .where('doctorId', '==', doctorId)
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async findByPatient(patientId) {
    // Filtra recetas asociadas a un paciente en concreto
    const snap = await db.collection(COLLECTION)
      .where('patientId', '==', patientId)
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async create(data) {
    // Añade timestamps y guarda la receta en la colección
    const now = new Date().toISOString();
    const ref = await db.collection(COLLECTION).add({
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },

  async update(id, data) {
    // Actualiza campos de la receta y la marca con updatedAt
    const ref = db.collection(COLLECTION).doc(id);
    await ref.update({ ...data, updatedAt: new Date().toISOString() });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },

  async delete(id) {
    // Elimina la receta de la base de datos con un softdelete
    await db.collection(COLLECTION).doc(id).set({ deletedAt: new Date().toISOString() }, { merge: true });
  },
};
