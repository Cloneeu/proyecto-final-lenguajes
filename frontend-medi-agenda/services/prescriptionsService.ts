const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Definición de tipos para las recetas médicas, y funciones para interactuar con la API de recetas médicas
export interface Medication {
  name: string;
  dose: string;
  frequency: string;
  duration: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  date: string;
  medications: Medication[];
  diagnosis?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreatePrescriptionDto = Omit<Prescription, 'id' | 'createdAt' | 'updatedAt'>;

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Request failed');
  return json.data as T;
}

export const prescriptionsService = {
  getAll(): Promise<Prescription[] | unknown> {
    return fetch(`${API_BASE}/prescriptions`, { headers: authHeaders() }).then(handleResponse);
  },

  getById(id: string): Promise<Prescription | unknown> {
    return fetch(`${API_BASE}/prescriptions/${id}`, { headers: authHeaders() }).then(handleResponse);
  },

  create(dto: CreatePrescriptionDto): Promise<Prescription | unknown> {
    return fetch(`${API_BASE}/prescriptions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(dto),
    }).then(handleResponse);
  },

  update(id: string, dto: Partial<CreatePrescriptionDto>): Promise<Prescription | unknown> {
    return fetch(`${API_BASE}/prescriptions/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(dto),
    }).then(handleResponse);
  },

  delete(id: string): Promise<void | unknown> {
    return fetch(`${API_BASE}/prescriptions/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse);
  },
};
