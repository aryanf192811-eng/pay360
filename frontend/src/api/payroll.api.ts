import { apiClient } from './client';

export interface Payrun {
  id: string;
  name: string;
  salary_structure_id: string;
  period_start: string;
  period_end: string;
  status: 'draft' | 'computed' | 'validated' | 'paid';
  payslip_count?: number | string;
  warnings?: PayrollWarning[];
}

export interface PayrollWarning {
  id: string;
  payslip_id: string | null;
  warning_type: string;
  message: string;
  resolved: boolean;
}

export interface PayslipLine {
  id: string;
  salary_rule_id: string;
  code: string;
  name: string;
  category: 'basic' | 'allowance' | 'gross' | 'deduction' | 'net';
  sequence: number;
  amount: string | number;
}

export interface Payslip {
  id: string;
  payrun_id: string;
  employee_id: string;
  contract_id: string | null;
  structure_id: string;
  period_start: string;
  period_end: string;
  worked_days: string | number | null;
  status: 'draft' | 'computed' | 'validated' | 'paid';
  email_status: string;
  first_name?: string;
  last_name?: string;
  employee_code?: string;
  structure_name?: string;
  payrun_name?: string;
  net?: string | number | null;
  lines?: PayslipLine[];
}

export interface EligibleEmployee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  department_id: string | null;
  employee_type: string;
  has_contract: boolean;
}

export async function draftPayrun(payload: { salary_structure_id: string; period_start: string; period_end: string }) {
  const { data } = await apiClient.post('/api/payruns/draft', payload);
  return data.data as { salary_structure: { id: string; name: string }; eligible_employees: EligibleEmployee[] };
}

export async function createPayrun(payload: {
  name: string;
  salary_structure_id: string;
  period_start: string;
  period_end: string;
  employee_ids: string[];
}) {
  const { data } = await apiClient.post('/api/payruns', payload);
  return data.data as Payrun;
}

export async function listPayruns() {
  const { data } = await apiClient.get('/api/payruns');
  return data.data as Payrun[];
}

export async function getPayrun(id: string) {
  const { data } = await apiClient.get(`/api/payruns/${id}`);
  return data.data as Payrun;
}

export async function computePayrun(id: string) {
  const { data } = await apiClient.post(`/api/payruns/${id}/compute`);
  return data.data;
}

export async function validatePayrun(id: string) {
  const { data } = await apiClient.post(`/api/payruns/${id}/validate`);
  return data.data;
}

export async function markPayrunPaid(id: string) {
  const { data } = await apiClient.post(`/api/payruns/${id}/mark-paid`);
  return data.data;
}

export async function sendPayslips(id: string) {
  const { data } = await apiClient.post(`/api/payruns/${id}/send-payslips`);
  return data.data as { message: string; stats: { sent: number; queued: number; failed: number } };
}

export async function listPayslips(params?: { payrun_id?: string; employee_id?: string }) {
  const { data } = await apiClient.get('/api/payslips', { params });
  return data.data as Payslip[];
}

export async function getPayslip(id: string) {
  const { data } = await apiClient.get(`/api/payslips/${id}`);
  return data.data as Payslip;
}

// A plain <a href> to this endpoint would 401 — browsers never attach the Authorization
// header on a top-level navigation, only axios's interceptor does that on XHR/fetch. So this
// is fetched as an authenticated blob and handed to the caller as an object URL instead.
export async function fetchPayslipPdfObjectUrl(id: string) {
  const { data } = await apiClient.get(`/api/payslips/${id}/pdf`, { responseType: 'blob' });
  return URL.createObjectURL(data as Blob);
}
