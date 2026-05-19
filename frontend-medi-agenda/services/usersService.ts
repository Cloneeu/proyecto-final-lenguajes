const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Genera los encabezados necesarios, incluyendo el token si existe
function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Procesa la respuesta del backend y devuelve solo la información útil
async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Falló la solicitud');
  return json.data as T;
}

// Modelo de datos de un usuario en la aplicación
export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient' | 'receptionist';
  isActive: boolean;
  assignedReceptionistId?: string | null;
  createdAt: string;
  updatedAt?: string;
}

// Datos requeridos para crear un usuario
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRecord['role'];
  assignedReceptionistId?: string | null;
}

// Datos opcionales para actualizar un usuario
export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: UserRecord['role'];
  isActive?: boolean;
  assignedReceptionistId?: string | null;
}

export const usersService = {
  // Obtiene la lista de usuarios con filtros opcionales
  getAll(filters?: { role?: string; isActive?: boolean; search?: string }): Promise<UserRecord[] | unknown> {
    const params = new URLSearchParams();
    if (filters?.role) params.set('role', filters.role);
    if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));
    if (filters?.search) params.set('search', filters.search);
    const qs = params.toString();
    return fetch(`${API_BASE}/users${qs ? `?${qs}` : ''}`, { headers: authHeaders() }).then(handleResponse);
  },

  // Obtiene un usuario por su identificador.
  getById(id: string): Promise<UserRecord | unknown> {
    return fetch(`${API_BASE}/users/${id}`, { headers: authHeaders() }).then(handleResponse);
  },

  // Crea un nuevo usuario.
  create(dto: CreateUserDto): Promise<UserRecord | unknown> {
    return fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(dto),
    }).then(handleResponse);
  },

  // Actualiza un usuario existente.
  update(id: string, dto: UpdateUserDto): Promise<UserRecord | unknown> {
    return fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(dto),
    }).then(handleResponse);
  },

  // Cambia el estado de activación de un usuario.
  toggleActive(id: string, isActive: boolean): Promise<UserRecord | unknown> {
    return fetch(`${API_BASE}/users/${id}/active`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ isActive }),
    }).then(handleResponse);
  },

  // Asigna o elimina el recepcionista asociado a un doctor.
  assignReceptionist(doctorId: string, receptionistId: string | null): Promise<UserRecord | unknown> {
    return fetch(`${API_BASE}/users/${doctorId}/receptionist`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ receptionistId }),
    }).then(handleResponse);
  },

  // Elimina un usuario del sistema.
  delete(id: string): Promise<void | unknown> {
    return fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse);
  },
};
