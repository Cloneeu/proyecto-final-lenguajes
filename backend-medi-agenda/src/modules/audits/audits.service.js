import { auditsRepository } from './audits.repository.js';

export const auditsService = {
  // Función principal para registrar eventos en cualquier parte del sistema
  async logAction({ currentUser, action, resource, resourceId, details }) {
    const performedBy = currentUser ? {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role
    } : { id: 'system', name: 'Sistema', role: 'system' };

    return auditsRepository.create({
      performedBy,
      action,           
      resource,         
      resourceId,       
      details           
    });
  },

  async listPaginated(filters) {
    const { page, pageSize } = filters ?? {};
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedPageSize = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 15));
    
    return auditsRepository.findPaginated({
      page: parsedPage,
      pageSize: parsedPageSize,
    });
  }
};