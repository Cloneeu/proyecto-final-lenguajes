import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import appointmentsRouter from './modules/appointments/appointments.routes.js';
import prescriptionsRouter from './modules/prescriptions/prescriptions.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import patientsRouter from './modules/patients/patients.routes.js';
import doctorRoutes from './modules/doctors/doctors.routes.js';
import specialtyRoutes from './modules/specialties/specialties.routes.js';

const app = express();

// Middlewares
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Aqui van las rutas de la API, cada una debe tener su router
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/specialties', specialtyRoutes); 
app.use('/api/doctors', doctorRoutes);      

app.use(errorHandler);

export default app;