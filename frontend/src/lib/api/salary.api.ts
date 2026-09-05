import { apiClient } from './client';

export interface SalaryStructure {
  id: string;
  name: string;
  active: boolean;
  rule_count?: number | string;
  active_employee_count?: number | string;
}

export interface SalaryRule {
  id: string;
  structure_id: string;
  name: string;
  code: string;
  category: 'basic' | 'allowance' | 'gross' | 'deduction' | 'net';
  sequence: number;
  computation_method: 'fixed' | 'percentage' | 'formula';
  amount: string | number | null;
  percentage: string | number | null;
  base_code: string | null;
  formula: string | null;
  active: boolean;
}

export async function listSalaryStructures() {
  const { data } = await apiClient.get('/api/salary-structures');
  return data.data as SalaryStructure[];
}
export async function getSalaryStructure(id: string) {
  const { data } = await apiClient.get(`/api/salary-structures/${id}`);
  return data.data as SalaryStructure & { rules: SalaryRule[] };
}
export async function createSalaryStructure(name: string) {
  const { data } = await apiClient.post('/api/salary-structures', { name });
  return data.data as SalaryStructure;
}

export async function listSalaryRules(structure_id?: string) {
  const { data } = await apiClient.get('/api/salary-rules', { params: structure_id ? { structure_id } : undefined });
  return data.data as SalaryRule[];
}
export async function createSalaryRule(payload: Partial<SalaryRule>) {
  const { data } = await apiClient.post('/api/salary-rules', payload);
  return data.data as SalaryRule;
}
