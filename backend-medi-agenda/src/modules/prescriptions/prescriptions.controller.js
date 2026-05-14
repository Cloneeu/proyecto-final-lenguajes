import { prescriptionsService } from './prescriptions.service.js';
import { sendSuccess } from '../../utils/response.js';

export const prescriptionsController = {
  async getAll(req, res, next) {
    try {
      // Devuelve las recetas visibles para el usuario autenticado
      // Los permisos se resuelven en el service según el rol del usuario
      const data = await prescriptionsService.getAll(req.user);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      // Recupera una receta por id y valida que el usuario pueda verla
      const data = await prescriptionsService.getById(req.params.id, req.user);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      // Crea una nueva receta, si el usuario es doctor, se le asigna como autor
      const data = await prescriptionsService.create(req.body, req.user);
      sendSuccess(res, data, 201, 'Receta creada');
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      // Actualiza una receta existente verificando los permisos del usuario
      const data = await prescriptionsService.update(req.params.id, req.body, req.user);
      sendSuccess(res, data, 200, 'Receta actualizada');
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      // Elimina una receta si el usuario tiene permisos para hacerlo
      await prescriptionsService.delete(req.params.id, req.user);
      sendSuccess(res, null, 200, 'Receta eliminada');
    } catch (err) {
      next(err);
    }
  },
};
