const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Genera los encabezados necesarios, incluyendo el token si existe
function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Los controllers de especialidades devuelven un JSON crudo,
// así que validamos res.ok y devolvemos el cuerpo directo :))).
async function handleRaw<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((json as { message?: string }).message ?? 'Falló la solicitud');
  }
  return json as T;
}

export interface Specialty {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export const specialtiesService = {
  getAll(): Promise<Specialty[]> {
    return fetch(`${API_BASE}/specialties`, { headers: authHeaders() }).then(res =>
      handleRaw<Specialty[]>(res)
    );
  },

  create(name: string): Promise<Specialty> {
    return fetch(`${API_BASE}/specialties`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name }),
    }).then(res => handleRaw<Specialty>(res));
  },

  update(id: string, name: string): Promise<Specialty> {
    return fetch(`${API_BASE}/specialties/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ name }),
    }).then(res => handleRaw<Specialty>(res));
  },

  remove(id: string): Promise<{ message: string }> {
    return fetch(`${API_BASE}/specialties/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(res => handleRaw<{ message: string }>(res));
  },
};
