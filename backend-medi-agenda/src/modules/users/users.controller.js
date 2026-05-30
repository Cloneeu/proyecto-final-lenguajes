import { usersService } from './users.service.js';
import { sendSuccess } from '../../utils/response.js';

// Controlador de usuarios
export const usersController = {
  // Obtiene el listado de usuarios usando los filtros enviados por query
  async list(req, res, next) {
    try {
      const data = await usersService.list(req.query);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  // Obtiene el listado paginado de usuarios para la vista de administración
  async listPaginated(req, res, next) {
    try {
      const data = await usersService.listPaginated(req.query);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  // Devuelve un usuario específico por su identificador
  async getById(req, res, next) {
    try {
      const data = await usersService.getById(req.params.id);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },

  // Crea un nuevo usuario con los datos recibidos en el cuerpo de la petición
  async create(req, res, next) {
    try {
      const data = await usersService.create(req.body, req.user);
      sendSuccess(res, data, 201, 'Usuario creado');
    } catch (err) {
      next(err);
    }
  },

  // Permite que una recepcionista cree un paciente
  async createPatient(req, res, next) {
    try {
      const data = await usersService.create({ ...req.body, role: 'patient' }, req.user);
      sendSuccess(res, data, 201, 'Paciente creado');
    } catch (err) {
      next(err);
    }
  },

  // Actualiza los datos de un usuario existente
  async update(req, res, next) {
    try {
      const data = await usersService.update(req.params.id, req.body, req.user);
      sendSuccess(res, data, 200, 'Usuario actualizado');
    } catch (err) {
      next(err);
    }
  },

  // Cambia el estado activo/inactivo del usuario
  async toggleActive(req, res, next) {
    try {
      const data = await usersService.setActive(req.params.id, req.body.isActive, req.user);
      sendSuccess(res, data, 200, 'Estado actualizado');
    } catch (err) {
      next(err);
    }
  },

  // Asigna un recepcionista a un usuario
  async assignReceptionist(req, res, next) {
    try {
      const data = await usersService.assignReceptionist(req.params.id, req.body.receptionistId, req.user);
      sendSuccess(res, data, 200, 'Recepcionista asignada');
    } catch (err) {
      next(err);
    }
  },

  // Realiza una eliminación lógica del usuario
  async softDelete(req, res, next) {
    try {
      await usersService.softDelete(req.params.id, req.user);
      sendSuccess(res, null, 200, 'Usuario eliminado');
    } catch (err) {
      next(err);
    }
  },
};
