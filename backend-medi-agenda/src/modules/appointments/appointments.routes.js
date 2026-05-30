import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { validateCreateAppointment, validateUpdateStatus } from './appointments.validator.js';
import { appointmentsController } from './appointments.controller.js';

const router = Router();

// Todas las rutas de appointments requieren usuario autenticado
router.use(authenticate);

// Lectura de citas
router.get('/', appointmentsController.getAll);
router.get('/:id', appointmentsController.getById);

// Creación y modificación restringidas por rol
router.post('/', authorize('admin', 'receptionist', 'patient'), validate(validateCreateAppointment), appointmentsController.create);
router.put('/:id', authorize('admin', 'receptionist'), appointmentsController.update);

// El cambio de estado usa una validación específica del payload
router.patch('/:id/status', validate(validateUpdateStatus), appointmentsController.updateStatus);
router.delete('/:id', authorize('admin'), appointmentsController.delete);

export default router;
