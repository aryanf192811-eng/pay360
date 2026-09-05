import { apiClient } from './client';

export interface Attendance {
  id: string;
  employee_id: string;
  check_in: string;
  check_out: string | null;
  worked_hours: string | number | null;
  status: 'present' | 'late' | 'absent' | 'overtime' | 'missing_checkout';
  is_manual_correction: boolean;
  corrected_by: string | null;
  notes: string | null;
  first_name?: string;
  last_name?: string;
}

export async function listAttendances(params?: { employee_id?: string; status?: string }) {
  const { data } = await apiClient.get('/api/attendances', { params });
  return data.data as Attendance[];
}

export async function checkInOut(employee_id?: string) {
  const { data } = await apiClient.post('/api/attendances', employee_id ? { employee_id } : {});
  return data.data as Attendance;
}

export async function correctAttendance(id: string, payload: Partial<Attendance>) {
  const { data } = await apiClient.patch(`/api/attendances/${id}`, payload);
  return data.data as Attendance;
}
