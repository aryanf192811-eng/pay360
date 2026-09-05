import { apiClient } from './client';

export interface User {
  id: string;
  email: string;
  role: string;
  employee_id: string | null;
}

export async function login(email: string, password: string) {
  const { data } = await apiClient.post('/api/auth/login', { email, password });
  return data.data as { user: User; accessToken: string };
}

export async function me() {
  const { data } = await apiClient.get('/api/auth/me');
  return data.data as User;
}

export async function logout() {
  await apiClient.post('/api/auth/logout');
}
