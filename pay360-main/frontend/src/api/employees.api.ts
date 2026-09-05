import { apiClient } from './client';

export interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  department_id: string | null;
  department_name?: string;
  manager_id: string | null;
  job_position: string | null;
  schedule_id: string | null;
  employee_type: 'full_time' | 'part_time' | 'contract';
  status: 'active' | 'inactive';
  hire_date: string;
  bank_account_number: string | null;
  contract_count?: number | string;
  pending_time_off_count?: number | string;
  attendance_exception_count?: number | string;
}

export async function listEmployees(params?: { department_id?: string; status?: string; employee_type?: string }) {
  const { data } = await apiClient.get('/api/employees', { params });
  return data.data as Employee[];
}

export async function getEmployee(id: string) {
  const { data } = await apiClient.get(`/api/employees/${id}`);
  return data.data as Employee & Record<string, unknown>;
}

export async function createEmployee(payload: Partial<Employee>) {
  const { data } = await apiClient.post('/api/employees', payload);
  return data.data as Employee;
}

export async function updateEmployee(id: string, payload: Partial<Employee>) {
  const { data } = await apiClient.patch(`/api/employees/${id}`, payload);
  return data.data as Employee;
}

export async function listEmployeeContracts(id: string) {
  const { data } = await apiClient.get(`/api/employees/${id}/contracts`);
  return data.data;
}

export async function listEmployeeAttendances(id: string) {
  const { data } = await apiClient.get(`/api/employees/${id}/attendances`);
  return data.data;
}

export async function listEmployeeTimeOffRequests(id: string) {
  const { data } = await apiClient.get(`/api/employees/${id}/time-off-requests`);
  return data.data;
}

export async function listEmployeeAllocations(id: string) {
  const { data } = await apiClient.get(`/api/employees/${id}/allocations`);
  return data.data;
}
