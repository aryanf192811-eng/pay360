import { apiClient } from './client';

export interface AppUser {
  id: string;
  email: string;
  role: string;
  employee_id: string | null;
  employee_first_name?: string | null;
  employee_last_name?: string | null;
  is_active: boolean;
  created_at: string;
}

export async function listUsers() {
  const { data } = await apiClient.get('/api/users');
  return data.data as AppUser[];
}

export async function updateUser(id: string, payload: { role?: string; employee_id?: string | null }) {
  const { data } = await apiClient.patch(`/api/users/${id}`, payload);
  return data.data as AppUser;
}
