import express from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import {
    getAllSpecialties,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
} from './specialties.controller.js';

const router = express.Router();

// La lectura es pública (solo la consumen páginas admin autenticadas)
router.get('/', getAllSpecialties);

// La escritura está restringida a administradores
router.post('/', authenticate, authorize('admin'), createSpecialty);
router.put('/:id', authenticate, authorize('admin'), updateSpecialty);
router.delete('/:id', authenticate, authorize('admin'), deleteSpecialty);

export default router;
