import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import * as patientsController from './patients.controller.js';

const router = Router();

router.use(authenticate);

router.post('/', patientsController.createPatient);
router.get('/', patientsController.getAllPatients);
router.get('/:id', patientsController.getPatientById);
router.get('/:id/history', patientsController.getPatientHistory);

export default router;

// Ruta para agregar un nuevo registro al expediente

router.post('/:id/records', patientsController.addPatientRecord);