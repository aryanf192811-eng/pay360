import { apiClient } from './client';

export interface DashboardData {
  kpis: {
    total_net_paid: number;
    payslips_generated: number;
    average_salary: number;
    approved_time_off_days: number;
    attendance_health_pct: number;
  };
  salary_cost_by_department: { department: string; headcount: number; total_net_cost: number }[];
  monthly_net_salary_trend: { month: string; total_net: number }[];
  payroll_alerts: { warning_type: string; count: number }[];
  attendance_overview: {
    present: number; late: number; absent: number; overtime: number;
    missing_checkouts: number; manual_edits: number;
  };
  time_off_overview: { approved_days: number; pending_requests: number };
  department_overview: { department: string; headcount: number; total_salary: number }[];
}

export async function getDashboard(params?: { period_start?: string; period_end?: string; department_id?: string; employee_type?: string }) {
  const { data } = await apiClient.get('/api/dashboard', { params });
  return data.data as DashboardData;
}
