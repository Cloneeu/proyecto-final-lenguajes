import { db } from '../../config/firebase.js';

const PATIENTS_COLLECTION = 'patients';
const RECORDS_COLLECTION = 'medical_records';

export const createPatient = async (patientData) => {
  const docRef = await db.collection(PATIENTS_COLLECTION).add(patientData);
  return { id: docRef.id, ...patientData };
};

export const getAllPatients = async () => {
  const snapshot = await db.collection(PATIENTS_COLLECTION).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getPatientById = async (id) => {
  const doc = await db.collection(PATIENTS_COLLECTION).doc(id).get();
  if (!doc.exists) return null; 
  return { id: doc.id, ...doc.data() };
};

export const updatePatient = async (id, updateData) => {
  await db.collection(PATIENTS_COLLECTION).doc(id).update(updateData);
  return getPatientById(id);
};

export const deletePatient = async (id) => {
  await db.collection(PATIENTS_COLLECTION).doc(id).delete();
  return true;
};

export const getPatientHistory = async (patientId) => {
  const snapshot = await db.collection(RECORDS_COLLECTION)
    .where('patientId', '==', patientId)
    .get();
    
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};