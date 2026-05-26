import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { auditsController } from './audits.controller.js';

const router = Router();

// Solo los administradores deberían poder ver las auditorías
router.use(authenticate);
router.get('/', authorize('admin'), auditsController.listPaginated);

export default router;