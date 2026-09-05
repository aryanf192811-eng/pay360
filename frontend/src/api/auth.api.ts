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

// Self-service registration always creates an 'employee' account — the backend rejects any
// other role from an unauthenticated caller (auth.service.js ALLOWED_SELF_ROLES). Privileged
// accounts (hr_manager and up) are created by an admin via registerUserAsAdmin below, which
// hits the exact same endpoint but authenticated, letting the backend allow any role.
export async function register(email: string, password: string) {
  const { data } = await apiClient.post('/api/auth/register', { email, password });
  return data.data as { id: string; email: string; role: string };
}

export async function registerUserAsAdmin(payload: { email: string; password: string; role: string }) {
  const { data } = await apiClient.post('/api/auth/register', payload);
  return data.data as { id: string; email: string; role: string };
}
