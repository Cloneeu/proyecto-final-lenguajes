import { db } from '../../config/firebase.js';

const COLLECTION = 'users';

// Filtrar password_hash antes de enviar al cliente
function sanitizeUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

export const usersRepository = {
  // Obtiene usuarios con filtros opcionales por rol, estado activo y texto de búsqueda
  async findAll({ role, isActive, search } = {}) {
    let query = db.collection(COLLECTION);
    if (role !== undefined) query = query.where('role', '==', role); // Filtra por rol si se especifica
    if (isActive !== undefined) query = query.where('isActive', '==', isActive); // Filtra por estado activo si se especifica

    // Ejecuta la consulta base en Firestore
    const snap = await query.get();
    let results = snap.docs.map(doc => sanitizeUser({ id: doc.id, ...doc.data() }));

    // Si se recibe búsqueda, filtra por nombre o correo
    if (search) {
      const lower = search.toLowerCase();
      results = results.filter(
        u => u.name?.toLowerCase().includes(lower) || u.email?.toLowerCase().includes(lower)
      );
    }

    // Ordena por fecha de creación, dejando primero los registros más recientes
    return results.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  },

  // Busca un usuario por su identificador
  async findById(id) {
    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return sanitizeUser({ id: doc.id, ...doc.data() });
  },

  // Busca un usuario por correo electrónico
  async findByEmail(email) {
    const snap = await db.collection(COLLECTION).where('email', '==', email).get();
    if (snap.empty) return null;
    const doc = snap.docs[0]; // Asumimos que el correo es único, por lo que tomamos el primer resultado
    return { id: doc.id, ...doc.data() }; 
  },

  // Crea un usuario nuevo con fechas iniciales y estado activo
  async create(data) {
    const now = new Date().toISOString();
    const ref = await db.collection(COLLECTION).add({ ...data, isActive: true, createdAt: now, updatedAt: now });
    const doc = await ref.get();
    return sanitizeUser({ id: doc.id, ...doc.data() });
  },

  // Actualiza un usuario existente y refresca la marca de última modificación
  async update(id, data) {
    const ref = db.collection(COLLECTION).doc(id);
    await ref.update({ ...data, updatedAt: new Date().toISOString() });
    const doc = await ref.get();
    return sanitizeUser({ id: doc.id, ...doc.data() });
  },

  // Realiza una eliminación lógica, marcando el usuario como inactivo
  async softDelete(id) {
    const now = new Date().toISOString();
    await db.collection(COLLECTION).doc(id).set(
      { isActive: false, deletedAt: now, updatedAt: now },
      { merge: true }
    );
  },

  // Obtiene los doctores asignados a un recepcionista específico
  async findDoctorsByReceptionist(receptionistId) {
    const snap = await db.collection(COLLECTION)
      .where('role', '==', 'doctor')
      .where('assignedReceptionistId', '==', receptionistId)
      .get();
    return snap.docs.map(doc => sanitizeUser({ id: doc.id, ...doc.data() }));
  },
};
