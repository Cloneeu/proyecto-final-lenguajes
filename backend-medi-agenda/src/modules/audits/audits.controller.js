import { auditsService } from './audits.service.js';
import { sendSuccess } from '../../utils/response.js';

export const auditsController = {
  async listPaginated(req, res, next) {
    try {
      const data = await auditsService.listPaginated(req.query);
      sendSuccess(res, data);
    } catch (err) {
      next(err);
    }
  }
};