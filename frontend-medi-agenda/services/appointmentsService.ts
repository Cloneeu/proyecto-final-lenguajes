const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Definición de tipos para las citas, y funciones para interactuar con la API de citas
export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Para crear o actualizar una cita, se omiten los campos que se generan automáticamente o no son necesarios
export type CreateAppointmentDto = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>;

// Función para manejar las respuestas de la API, lanzando un error si la respuesta indica que no fue exitosa
async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Falló la solicitud');
  return json.data as T;
}

export const appointmentsService = {
  getAll(): Promise<Appointment[] | unknown> {
    return fetch(`${API_BASE}/appointments`, { headers: authHeaders() }).then(handleResponse);
  },

  getById(id: string): Promise<Appointment | unknown> {
    return fetch(`${API_BASE}/appointments/${id}`, { headers: authHeaders() }).then(handleResponse);
  },

  create(dto: CreateAppointmentDto): Promise<Appointment | unknown> {
    return fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(dto),
    }).then(handleResponse);
  },

  update(id: string, dto: Partial<CreateAppointmentDto>): Promise<Appointment | unknown> {
    return fetch(`${API_BASE}/appointments/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(dto),
    }).then(handleResponse);
  },

  updateStatus(id: string, status: Appointment['status']): Promise<Appointment | unknown> {
    return fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    }).then(handleResponse);
  },

  delete(id: string): Promise<void | unknown> {
    return fetch(`${API_BASE}/appointments/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse);
  },
};
