import { db } from '../../config/firebase.js';

const COLLECTION = 'audit_logs';

export const auditsRepository = {
  async create(data) {
    const now = new Date().toISOString();
    const ref = await db.collection(COLLECTION).add({ ...data, timestamp: now });
    const doc = await ref.get();
    return { id: doc.id, ...doc.data() };
  },

  // Obtiene los logs ordenados por los más recientes 
  async findPaginated({ page, pageSize } = {}) {
    const snap = await db.collection(COLLECTION).get();
    let results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Ordena por fecha de creación 
    results.sort((a, b) => (b.timestamp ?? '').localeCompare(a.timestamp ?? ''));

    const total = results.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const data = results.slice(start, start + pageSize);

    return { data, total, page, pageSize, totalPages };
  }
};