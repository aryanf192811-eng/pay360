import { apiClient } from './client';

export interface Contract {
  id: string;
  employee_id: string;
  department_id: string | null;
  position: string | null;
  wage: string | number;
  salary_structure_id: string | null;
  date_start: string;
  date_end: string | null;
  status: 'draft' | 'active' | 'expired' | 'cancelled';
  is_active_for_today?: boolean;
  first_name?: string;
  last_name?: string;
}

export async function listContracts(employee_id?: string) {
  const { data } = await apiClient.get('/api/contracts', { params: employee_id ? { employee_id } : undefined });
  return data.data as Contract[];
}

export async function getContract(id: string) {
  const { data } = await apiClient.get(`/api/contracts/${id}`);
  return data.data as Contract;
}

export async function createContract(payload: Partial<Contract>) {
  const { data } = await apiClient.post('/api/contracts', payload);
  return data.data as Contract;
}

export async function updateContract(id: string, payload: Partial<Contract>) {
  const { data } = await apiClient.patch(`/api/contracts/${id}`, payload);
  return data.data as Contract;
}
