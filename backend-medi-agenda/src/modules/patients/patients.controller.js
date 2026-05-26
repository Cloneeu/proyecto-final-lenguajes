import { AppError } from '../../utils/AppError.js';
import { sendSuccess } from '../../utils/response.js';
import * as patientsService from './patients.service.js'; 

export const createPatient = async (req, res, next) => {
  try {
    const patientData = req.body;
    const newPatient = await patientsService.createPatient(patientData);
    return sendSuccess(res, newPatient, 201, 'Paciente creado exitosamente');
  } catch (error) {
    next(error);
  }
};

export const getPatientById = async (req, res, next) => {
  try {
    const patientIdRequested = req.params.id;
    const userIdFromToken = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'patient' && patientIdRequested !== userIdFromToken) {
      throw new AppError('Acceso denegado: Solo puedes consultar tu propio expediente.', 403);
    }

    const patient = await patientsService.getPatientById(patientIdRequested);
    return sendSuccess(res, patient, 200, 'Datos obtenidos correctamente');
  } catch (error) {
    next(error);
  }
};

export const getPatientHistory = async (req, res, next) => {
  try {
    const patientIdRequested = req.params.id;
    const userIdFromToken = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'patient' && patientIdRequested !== userIdFromToken) {
      throw new AppError('Acceso denegado: Solo puedes consultar tu propio historial médico.', 403);
    }

    const history = await patientsService.getPatientHistory(patientIdRequested);
    return sendSuccess(res, { patientId: patientIdRequested, history }, 200, `Obteniendo historial del paciente ${patientIdRequested}`);
  } catch (error) {
    next(error);
  }
};

export const getAllPatients = async (req, res, next) => {
  try {
    if (req.user.role === 'patient') {
        throw new AppError('Acceso denegado: Los pacientes no pueden ver el directorio general.', 403);
    }

    const patients = await patientsService.getAllPatients();
    return sendSuccess(res, patients, 200, 'Lista de pacientes obtenida');
  } catch (error) {
    next(error);
  }
};


export const addPatientRecord = async (req, res, next) => {
  try {
    const patientId = req.params.id;
    const recordData = req.body; 

    const newRecord = await patientsService.addPatientRecord(patientId, recordData);
    
    return sendSuccess(res, newRecord, 201, 'Registro añadido al expediente');
  } catch (error) {
    next(error);
  }
};