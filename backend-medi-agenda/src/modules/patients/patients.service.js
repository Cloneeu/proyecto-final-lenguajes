import * as patientsRepository from './patients.repository.js';
import { AppError } from '../../utils/AppError.js';

export const createPatient = async (data) => {
  const newPatient = await patientsRepository.createPatient(data);
  return newPatient;
};

export const getAllPatients = async () => {
  return await patientsRepository.getAllPatients();
};

export const getPatientById = async (id) => {
  const patient = await patientsRepository.getPatientById(id);
  
  if (!patient) {
    throw new AppError('Paciente no encontrado', 404);
  }
  
  return patient;
};

export const updatePatient = async (id, data) => {
  await getPatientById(id); 
  return await patientsRepository.updatePatient(id, data);
};

export const deletePatient = async (id) => {
  await getPatientById(id); 
  return await patientsRepository.deletePatient(id);
};

export const getPatientHistory = async (patientId) => {
  await getPatientById(patientId);
  const history = await patientsRepository.getPatientHistory(patientId);
  return history;
};
/*
export const addPatientRecord = async (patientId, recordData) => {
  // Primero validamos que el paciente realmente exista
  await getPatientById(patientId); 

  return await patientsRepository.addPatientRecord(patientId, recordData);
};*/

export const addPatientRecord = async (patientId, recordData) => {
  await getPatientById(patientId); 
  
  // Llamamos al repositorio
  const newRecord = await patientsRepository.addPatientRecord(patientId, recordData);
  return newRecord;
};