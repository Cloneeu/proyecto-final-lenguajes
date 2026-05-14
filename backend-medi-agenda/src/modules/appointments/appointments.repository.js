import { db } from '../../config/firebase.js';

const COLLECTION = 'appointments';

export const appointmentsRepository = {
  async findAll() {
    // Ordena por fecha de creación para mostrar primero lo más reciente
    const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async findById(id) {
    // Recupera una cita por su identificador en Firestore
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  },

  async findByDoctor(doctorId) {
    // Filtra las citas de un doctor específico
    const snap = await db.collection(COLLECTION)
      .where('doctorId', '==', doctorId)
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async findByPatient(patientId) {
    // Filtra las citas de un paciente específico
    const snap = await db.collection(COLLECTION)
      .where('patientId', '==', patientId)
      .orderBy('createdAt', 'desc')
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async findByDoctorAndDate(doctorId, date) {
    // Busca citas activas del doctor en una fecha concreta para detectar choques
    const snap = await db.collection(COLLECTION)
      .where('doctorId', '==', doctorId)
      .where('date', '==', date)
      .where('status', 'not-in', ['cancelled'])
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async create(data) {
    // Crea la cita y guarda datos para auditoría (los timestamps)
    const now = new Date().toISOString();
    const ref = await db.collection(COLLECTION).add({
      ...data,
      status: data.status ?? 'pending',
      createdAt: now,
      updatedAt: now,
    });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },

  async update(id, data) {
    // Actualiza la cita y refresca la fecha de modificación
    const ref = db.collection(COLLECTION).doc(id);
    await ref.update({ ...data, updatedAt: new Date().toISOString() });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },

  async delete(id) {
    // Elimina la cita con un softdelete, el merge es para que no sobreescriba y se guarde junto con los otros datos
    await db.collection(COLLECTION).doc(id).set({ deletedAt: new Date().toISOString() }, { merge: true });
  },
};
