import { db } from '../../config/firebase.js';

// Cuenta la cantidad total de documentos en una colección específica
async function countCollection(collectionName) {
  const snap = await db.collection(collectionName).get();
  return snap.size;
}

// Cuenta usuarios filtrando por el rol indicado
async function countUsersBy(role) {
  const snap = await db.collection('users').where('role', '==', role).get();
  return snap.size;
}

// Obtiene el número de citas registradas en los últimos 7 días
async function getAppointmentsLast7Days() {
  const today = new Date();
  const days = [];

  // Genera una lista con las fechas de los últimos 7 días en formato YYYY-MM-DD
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  // Trae todas las citas y las compara con cada fecha generada
  const snap = await db.collection('appointments').get();
  const all = snap.docs.map(doc => doc.data());

  // Devuelve un arreglo con la fecha y la cantidad de citas de ese día
  return days.map(date => ({
    date,
    count: all.filter(a => a.date === date).length,
  }));
}

// Obtiene los usuarios más recientes y elimina campos sensibles como la contra
async function getRecentUsers(limit = 5) {
  const snap = await db.collection('users').orderBy('createdAt', 'desc').limit(limit).get();
  return snap.docs.map(doc => {
    // Se excluye password_hash para no exponer información sensible :p
    const { id: _id, password_hash: _pw, ...rest } = { id: doc.id, ...doc.data() };
    return { id: doc.id, name: rest.name, role: rest.role, createdAt: rest.createdAt };
  });
}

export const adminService = {
  async getStats() {
    // Ejecuta todas las consultas en paralelo para mejorar el rendimiento
    const [totalUsers, doctors, patients, receptionists, appointments, prescriptions, appointmentsLast7Days, recentUsers] =
      await Promise.all([
        countCollection('users'),
        countUsersBy('doctor'),
        countUsersBy('patient'),
        countUsersBy('receptionist'),
        countCollection('appointments'),
        countCollection('prescriptions'),
        getAppointmentsLast7Days(),
        getRecentUsers(),
      ]);

    // Devuelve un resumen general para el panel de administración
    return {
      totals: { users: totalUsers, doctors, patients, receptionists, appointments, prescriptions },
      appointmentsLast7Days,
      recentUsers,
    };
  },
};
