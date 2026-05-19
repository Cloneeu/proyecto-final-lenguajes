import { db } from '../../config/firebase.js';

export const doctorsRepository = {
    findAll: async () => {
        const snapshot = await db.collection('doctors').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    create: async (doctorData) => {
        const newDoctor = {
            ...doctorData,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('doctors').add(newDoctor);
        return { id: docRef.id, ...newDoctor };
    },

    findById: async (id) => {
        const doc = await db.collection('doctors').doc(id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    updateStatus: async (id, newStatus) => {
        await db.collection('doctors').doc(id).update({ status: newStatus });
        return { id, status: newStatus };
    }
};