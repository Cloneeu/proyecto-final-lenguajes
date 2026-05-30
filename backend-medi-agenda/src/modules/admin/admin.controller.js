import { adminService } from './admin.service.js';
import { sendSuccess } from '../../utils/response.js';

// Controlador de admin
export const adminController = {
  async getStats(req, res, next) {
    try {
      const data = await adminService.getStats();
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  },
};
