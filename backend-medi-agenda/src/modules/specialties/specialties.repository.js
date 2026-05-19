import { db } from '../../config/firebase.js';

export const specialtiesRepository = {
    findAll: async () => {
        const snapshot = await db.collection('specialties').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    create: async (name) => {
        const newSpecialty = { name, createdAt: new Date().toISOString() };
        const docRef = await db.collection('specialties').add(newSpecialty);
        return { id: docRef.id, ...newSpecialty };
    }
};