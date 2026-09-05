import { apiClient } from './client';

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'create' | 'update' | 'status_change';
  changed_fields: Record<string, unknown>;
  created_at: string;
  user_email: string | null;
}

export async function listAuditLogs(params?: { table_name?: string; record_id?: string; before?: string; limit?: number }) {
  const { data } = await apiClient.get('/api/audit-logs', { params });
  return data.data as AuditLog[];
}
