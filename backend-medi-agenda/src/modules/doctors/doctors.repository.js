import { db } from '../../config/firebase.js';

export const doctorsRepository = {
    findAll: async () => {
        // se filtra en users solo  los que son doctores 
        const snapshot = await db.collection('users').where('role', '==', 'doctor').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    create: async (doctorData) => {
        const newDoctor = {
            ...doctorData,
            role: 'doctor', 
            status: 'active',
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('users').add(newDoctor);
        return { id: docRef.id, ...newDoctor };
    },

    findById: async (id) => {
        const doc = await db.collection('users').doc(id).get();
        return (doc.exists && doc.data().role === 'doctor') // existes? , es doctor ?
            ? { id: doc.id, ...doc.data() } 
            : null;
    },

    updateStatus: async (id, newStatus) => {
        //a ctualizamos el estatus dentro de 'users'
        await db.collection('users').doc(id).update({ status: newStatus });
        return { id, status: newStatus };
    }
};