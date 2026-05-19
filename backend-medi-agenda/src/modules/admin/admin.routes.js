import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { adminController } from './admin.controller.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', adminController.getStats);

export default router;
