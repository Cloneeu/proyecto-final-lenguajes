const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Construye los encabezados necesarios para autenticar las peticiones
function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Procesa la respuesta y devuelve solo los datos útiles si la solicitud fue exitosa
async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Falló la solicitud');
  return json.data as T;
}

// Tipo que describe las estadísticas del panel de administración
export interface DashboardStats {
  totals: {
    // Total de usuarios registrados
    users: number;
    // Total de doctores registrados
    doctors: number;
    // Total de pacientes registrados
    patients: number;
    // Total de recepcionistas registrados
    receptionists: number;
    // Total de citas registradas
    appointments: number;
    // Total de recetas registradas
    prescriptions: number;
  };
  // Citas creadas en los últimos 7 días
  appointmentsLast7Days: { date: string; count: number }[];
  // Usuarios recientes para mostrar en el dashboard
  recentUsers: { id: string; name: string; role: string; createdAt: string }[];
}

// Servicio de administración con las funciones disponibles para el dashboard.
export const adminService = {
  // Obtiene las estadísticas generales del sistema.
  getStats(): Promise<DashboardStats | unknown> {
    return fetch(`${API_BASE}/admin/stats`, { headers: authHeaders() }).then(handleResponse);
  },
};
