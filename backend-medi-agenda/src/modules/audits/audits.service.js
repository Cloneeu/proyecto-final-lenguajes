import { auditsRepository } from './audits.repository.js';
import { db } from '../../config/firebase.js'; // Importamos db para buscar el nombre si falta

export const auditsService = {
  async logAction({ currentUser, action, resource, resourceId, details }) {
    let nameToSave = 'Sistema';
    
    // Si hay un usuario haciendo la acción, intentamos obtener su nombre
    if (currentUser) {
      nameToSave = currentUser.name;
      
      // Si el nombre es undefined (porque el currentUser viene del Token JWT)
      if (!nameToSave && currentUser.id) {
        try {
          // Buscamos rápidamente su nombre real en la colección de usuarios
          const userDoc = await db.collection('users').doc(currentUser.id).get();
          if (userDoc.exists) {
            nameToSave = userDoc.data().name;
          } else {
            nameToSave = 'Usuario';
          }
        } catch (error) {
          nameToSave = 'Usuario Desconocido';
        }
      }
    }

    // Construimos el objeto asegurándonos de no dejar undefined
    const performedBy = currentUser ? {
      id: currentUser.id || 'unknown',
      name: nameToSave || 'Desconocido',
      role: currentUser.role || 'unknown'
    } : { id: 'system', name: 'Sistema', role: 'system' };

    // Limpiamos los demás campos por seguridad
    const logData = {
      performedBy,
      action: action || 'UNKNOWN',
      resource: resource || 'UNKNOWN',
      resourceId: resourceId || 'N/A',
      details: details || 'Sin detalles'
    };
    return auditsRepository.create(logData);
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