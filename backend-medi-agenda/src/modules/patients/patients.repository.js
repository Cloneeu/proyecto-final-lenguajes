import { db } from '../../config/firebase.js';

// Los pacientes viven en la colección 'users' con role === 'patient'
const USERS_COLLECTION = 'users';
const RECORDS_COLLECTION = 'medical_records';

export const createPatient = async (patientData) => {
  // Al crear un paciente se guarda en users con role patient
  const data = { ...patientData, role: 'patient' };
  const docRef = await db.collection(USERS_COLLECTION).add(data);
  return { id: docRef.id, ...data };
};

export const getAllPatients = async () => {
  // FIX: filtrar users por role === 'patient' en vez de colección patients vacía
  const snapshot = await db.collection(USERS_COLLECTION)
    .where('role', '==', 'patient')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getPatientById = async (id) => {
  // FIX: buscar en users en vez de patients
  const doc = await db.collection(USERS_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data();
  // Verificar que sea paciente
  if (data.role !== 'patient') return null;
  return { id: doc.id, ...data };
};

export const updatePatient = async (id, updateData) => {
  await db.collection(USERS_COLLECTION).doc(id).update(updateData);
  return getPatientById(id);
};

export const deletePatient = async (id) => {
  await db.collection(USERS_COLLECTION).doc(id).delete();
  return true;
};
/*
export const getPatientHistory = async (patientId) => {
  // medical_records sí tiene su propia colección, esto no cambia
  const snapshot = await db.collection(RECORDS_COLLECTION)
    .where('patientId', '==', patientId)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
*/
// Agrega un registro al historial médico del paciente
export const addPatientRecord = async (patientId, recordData) => {
  // Guardaremos todo en una nueva colección raíz llamada 'records'
  const recordRef = await db.collection('records').add({
    patientId: patientId, 
    ...recordData,
    createdAt: new Date().toISOString()
  });
  
  return { id: recordRef.id, patientId, ...recordData };
};

export const getPatientHistory = async (patientId) => {
  try {
    // Vamos a buscar en la colección de recetas todas las que le pertenezcan a este paciente
    const snapshot = await db.collection('prescriptions')
      .where('patientId', '==', patientId)
      .get();

    if (snapshot.empty) {
      return [];
    }

    // Mapeamos los documentos para devolver el historial ordenado
    const history = [];
    snapshot.forEach(doc => {
      history.push({ id: doc.id, ...doc.data() });
    });

    // Las ordenamos por fecha para que el expediente salga de la más reciente a la más antigua
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    throw new Error('Error al obtener el expediente desde el repositorio: ' + error.message);
  }
};