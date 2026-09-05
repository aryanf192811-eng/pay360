import { apiClient } from './client';

export interface AttendanceAnomalyEmployee {
  employee_id: string;
  first_name: string;
  last_name: string;
  employee_code: string;
  department: string | null;
  total_days: number;
  late_count: number;
  absent_count: number;
  missing_checkout_count: number;
  late_rate: number;
  absent_rate: number;
  is_late_anomaly?: boolean;
  is_absence_anomaly?: boolean;
}

export interface AttendanceAnomalies {
  period: { start: string; end: string };
  method: string;
  population_size: number;
  population_too_small: boolean;
  warning?: string;
  employees: AttendanceAnomalyEmployee[];
  anomaly_count: number | null;
}

export async function getAttendanceAnomalies(params: { period_start: string; period_end: string; department_id?: string }) {
  const { data } = await apiClient.get('/api/insights/attendance-anomalies', { params });
  return data.data as AttendanceAnomalies;
}

export interface DepartmentLoad {
  department: string;
  approved_days: number;
  pending_days: number;
}

export interface AtRiskAllocation {
  employee_id: string;
  first_name: string;
  last_name: string;
  type_name: string;
  allocated: number;
  taken: number;
  remaining: number;
  avg_monthly_consumption: number;
  months_of_runway: number;
}

export interface LeaveForecast {
  period: { start: string; end: string };
  department_load: DepartmentLoad[];
  runway_threshold_months: number;
  at_risk_allocations: AtRiskAllocation[];
}

export async function getLeaveForecast(params: { period_start: string; period_end: string; department_id?: string; runway_months?: number }) {
  const { data } = await apiClient.get('/api/insights/leave-forecast', { params });
  return data.data as LeaveForecast;
}
