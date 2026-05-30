const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface Patient {
  id: string;
  name: string;
  email?: string;
  age?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type CreatePatientDto = Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>;

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  notes: string;
  diagnosis?: string;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!json.success) throw new Error(json.message ?? 'Falló la solicitud');
  return json.data as T;
}

export const patientsService = {
  getAll(): Promise<Patient[] | unknown> {
    return fetch(`${API_BASE}/patients`, { headers: authHeaders() }).then(handleResponse);
  },

  getById(id: string): Promise<Patient | unknown> {
    return fetch(`${API_BASE}/patients/${id}`, { headers: authHeaders() }).then(handleResponse);
  },

  create(dto: CreatePatientDto): Promise<Patient | unknown> {
    return fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(dto),
    }).then(handleResponse);
  },

  getHistory(id: string): Promise<MedicalRecord[] | unknown> {
    return fetch(`${API_BASE}/patients/${id}/history`, { headers: authHeaders() })
      .then(handleResponse)
      .then((data: any) => data.history); 
  },
};