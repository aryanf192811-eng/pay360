import { apiClient } from './client';

export interface Department {
  id: string;
  name: string;
  headcount?: number | string;
}

export interface ScheduleLine {
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_minutes: number;
}

export interface WorkingSchedule {
  id: string;
  name: string;
  schedule_type: 'full_time' | 'part_time' | 'shift';
  total_weekly_hours: number;
  lines?: (ScheduleLine & { day_name?: string })[];
}

export async function listDepartments() {
  const { data } = await apiClient.get('/api/departments');
  return data.data as Department[];
}

export async function createDepartment(name: string) {
  const { data } = await apiClient.post('/api/departments', { name });
  return data.data as Department;
}

export async function listSchedules() {
  const { data } = await apiClient.get('/api/working-schedules');
  return data.data as WorkingSchedule[];
}

export async function createSchedule(payload: { name: string; schedule_type: string; lines: ScheduleLine[] }) {
  const { data } = await apiClient.post('/api/working-schedules', payload);
  return data.data as WorkingSchedule;
}
