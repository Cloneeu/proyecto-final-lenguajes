const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Falló la solicitud');
  return json.data as T; 
}

export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  timestamp: string;
  performedBy: {
    id: string;
    name: string;
    role: string;
  };
}

export interface PaginatedAudits {
  data: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const auditsService = {
  getPaginated(page = 1, pageSize = 15): Promise<PaginatedAudits> {
    return fetch(`${API_BASE}/audits?page=${page}&pageSize=${pageSize}`, { 
      headers: authHeaders() 
    }).then(res => handleResponse<PaginatedAudits>(res));
  },
};