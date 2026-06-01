import { db } from '../../config/firebase.js';

const COLLECTION = 'prescriptions';

export const prescriptionsRepository = {
  async findAll() {
    // Obtiene todas las recetas ordenadas por creación (más recientes primero)
    const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(rx => !rx.deletedAt); // Filtra las recetas que no tienen la marca de "deletedAt"
  },

  async findById(id) {
    // Recupera una receta por su identificador en Firestore
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async findByDoctor(doctorId) {
    // Filtra las recetas de un doctor específico
    const snap = await db.collection(COLLECTION)
      .where('doctorId', '==', doctorId)
      .get();
    // Convertir los docs de firestore a objetos de javascript y ordenar por fecha de creación para mostrar primero lo más reciente
    return snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(rx => !rx.deletedAt) 
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  },

  async findByPatient(patientId) {
    // Filtra las recetas de un paciente específico
    const snap = await db.collection(COLLECTION)
      .where('patientId', '==', patientId)
      .get();
    // Convertir los docs de firestore a objetos de javascript y ordenar por fecha de creación para mostrar primero lo más reciente
    return snap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(rx => !rx.deletedAt)
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
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
