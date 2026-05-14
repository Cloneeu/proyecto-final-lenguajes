import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { validateCreatePrescription } from './prescriptions.validator.js';
import { prescriptionsController } from './prescriptions.controller.js';

const router = Router();

router.use(authenticate);

// Lectura de recetas 
router.get('/', authorize('admin', 'doctor', 'patient'), prescriptionsController.getAll);
router.get('/:id', authorize('admin', 'doctor', 'patient'), prescriptionsController.getById);

// Creación y modificación de recetas
router.post('/', authorize('admin', 'doctor'), validate(validateCreatePrescription), prescriptionsController.create);
router.put('/:id', authorize('admin', 'doctor'), prescriptionsController.update);
router.delete('/:id', authorize('admin', 'doctor'), prescriptionsController.delete);

export default router;
