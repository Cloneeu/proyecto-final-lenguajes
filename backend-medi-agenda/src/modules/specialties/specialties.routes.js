import express from 'express';
import { getAllSpecialties, createSpecialty } from './specialties.controller.js';

const router = express.Router();

router.get('/', getAllSpecialties);

router.post('/', createSpecialty);

export default router;
