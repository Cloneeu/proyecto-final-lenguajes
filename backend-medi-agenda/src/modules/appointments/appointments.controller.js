import { appointmentsService } from './appointments.service.js';
import { sendSuccess } from '../../utils/response.js';

export const appointmentsController = {
  async getAll(req, res, next) {
    try {
      // Devuelve solo las citas visibles para el usuario autenticado
      const data = await appointmentsService.getAll(req.user);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      // Busca una cita concreta aplicando permisos de acceso
      const data = await appointmentsService.getById(req.params.id, req.user);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      // Crea una nueva cita usando los datos recibidos en el body
      const data = await appointmentsService.create(req.body, req.user);
      sendSuccess(res, data, 201, 'Appointment created');
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      // Actualiza los campos editables de una cita existente
      const data = await appointmentsService.update(req.params.id, req.body, req.user);
      sendSuccess(res, data, 200, 'Appointment updated');
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req, res, next) {
    try {
      // Cambia únicamente el estado de la cita
      const data = await appointmentsService.updateStatus(req.params.id, req.body.status, req.user);
      sendSuccess(res, data, 200, 'Status updated');
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      // Elimina la cita seleccionada
      await appointmentsService.delete(req.params.id);
      sendSuccess(res, null, 200, 'Appointment deleted');
    } catch (err) {
      next(err);
    }
  },
};
