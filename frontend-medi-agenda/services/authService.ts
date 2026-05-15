const API_URL = 'http://localhost:4000/api/auth';

export const authService = {
  async login(credentials: any) {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error en el login');
    return data;
  },

  async register(userData: any) {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error en el registro');
    return data;
  },

  async getMe(token: string) {
    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Token inválido');
    return data;
  }
};