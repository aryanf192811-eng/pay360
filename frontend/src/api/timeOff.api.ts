import { apiClient } from './client';

export interface TimeOffType {
  id: string;
  name: string;
  unit: 'days' | 'hours';
  requires_allocation: boolean;
  payroll_integrated: boolean;
}

export interface TimeOffAllocation {
  id: string;
  employee_id: string;
  time_off_type_id: string;
  allocated: string | number;
  taken: string | number;
  remaining: string | number;
  valid_from: string;
  valid_to: string | null;
  status: 'draft' | 'approved' | 'refused';
  approved_by?: string | null;
  approved_by_email?: string | null;
  created_at?: string;
  first_name?: string;
  last_name?: string;
  employee_code?: string;
  type_name?: string;
}

export interface TimeOffRequest {
  id: string;
  employee_id: string;
  time_off_type_id: string;
  allocation_id: string | null;
  date_from: string;
  date_to: string;
  duration: string | number;
  status: 'draft' | 'submitted' | 'approved' | 'refused' | 'cancelled';
  approved_by?: string | null;
  approved_by_email?: string | null;
  decided_at?: string | null;
  created_at?: string;
  first_name?: string;
  last_name?: string;
  employee_code?: string;
  type_name?: string;
}

export async function listTimeOffTypes() {
  const { data } = await apiClient.get('/api/time-off-types');
  return data.data as TimeOffType[];
}
export async function getTimeOffType(id: string) {
  const { data } = await apiClient.get(`/api/time-off-types/${id}`);
  return data.data as TimeOffType;
}
export async function createTimeOffType(payload: Partial<TimeOffType>) {
  const { data } = await apiClient.post('/api/time-off-types', payload);
  return data.data as TimeOffType;
}
export async function updateTimeOffType(id: string, payload: Partial<TimeOffType>) {
  const { data } = await apiClient.patch(`/api/time-off-types/${id}`, payload);
  return data.data as TimeOffType;
}

export async function listAllocations(employee_id?: string) {
  const { data } = await apiClient.get('/api/time-off-allocations', { params: employee_id ? { employee_id } : undefined });
  return data.data as TimeOffAllocation[];
}
export async function getAllocation(id: string) {
  const { data } = await apiClient.get(`/api/time-off-allocations/${id}`);
  return data.data as TimeOffAllocation;
}
export async function createAllocation(payload: Partial<TimeOffAllocation>) {
  const { data } = await apiClient.post('/api/time-off-allocations', payload);
  return data.data as TimeOffAllocation;
}
export async function approveAllocation(id: string) {
  const { data } = await apiClient.post(`/api/time-off-allocations/${id}/approve`);
  return data.data;
}

export async function listRequests(params?: { employee_id?: string; status?: string }) {
  const { data } = await apiClient.get('/api/time-off-requests', { params });
  return data.data as TimeOffRequest[];
}
export async function getRequest(id: string) {
  const { data } = await apiClient.get(`/api/time-off-requests/${id}`);
  return data.data as TimeOffRequest;
}
export async function createRequest(payload: Partial<TimeOffRequest>) {
  const { data } = await apiClient.post('/api/time-off-requests', payload);
  return data.data as TimeOffRequest;
}
export async function approveRequest(id: string) {
  const { data } = await apiClient.post(`/api/time-off-requests/${id}/approve`);
  return data.data;
}
export async function refuseRequest(id: string) {
  const { data } = await apiClient.post(`/api/time-off-requests/${id}/refuse`);
  return data.data;
}
