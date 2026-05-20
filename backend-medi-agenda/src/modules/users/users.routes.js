import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import {
  validateCreateUser,
  validateUpdateUser,
  validateToggleActive,
  validateAssignReceptionist,
} from './users.validator.js';
import { usersController } from './users.controller.js';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// GET: Todos los usuarios pueden listar/consultar usuarios
router.get('/', authorize('admin', 'receptionist', 'patient', 'doctor'), usersController.list);
router.get('/:id', authorize('admin', 'receptionist', 'patient', 'doctor'), usersController.getById);

// POST: solo admin puede crear usuarios, receptionist solo puede crear pacientes
router.post('/', authorize('admin'), validate(validateCreateUser), usersController.create);
router.put('/:id', validate(validateUpdateUser), usersController.update);

// PUT/PATCH/DELETE: solo admin puede actualizar o eliminar usuarios
router.put('/:id', authorize('admin'), validate(validateUpdateUser), usersController.update);
router.patch('/:id/active', authorize('admin'), validate(validateToggleActive), usersController.toggleActive);
router.patch('/:id/receptionist', authorize('admin'), validate(validateAssignReceptionist), usersController.assignReceptionist);
router.delete('/:id', authorize('admin'), usersController.softDelete);

// POST: receptionist solo puede crear pacientes
router.post('/patients', authorize('receptionist'), validate(validateCreateUser), usersController.createPatient);

export default router;
