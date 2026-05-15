import express from 'express';

import { getAllDoctors, createDoctor, toggleDoctorStatus } from './doctors.controller.js';

const router = express.Router();

router.get('/', getAllDoctors);
router.post('/', createDoctor);
router.patch('/:id/toggle', toggleDoctorStatus);


export default router;