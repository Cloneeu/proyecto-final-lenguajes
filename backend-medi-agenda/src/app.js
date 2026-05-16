import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import authRoutes from './modules/auth/auth.routes.js';
import patientsRouter from './modules/patients/patients.routes.js';

const app = express();

// Permite peticiones desde el frontend configurado en el entorno
app.use(cors({ origin: env.corsOrigin }));
// Habilita parseo automático de JSON en el body
app.use(express.json());

// Endpoint para checar que el server si este vivo
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Aqui van las rutas de la API, cada una debe tener su router
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRouter);

// El middleware de manejo de errores va al final para atrapar cualquier error que haya ocurrido en las rutas anteriores
app.use(errorHandler);

export default app;
