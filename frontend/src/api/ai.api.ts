import { apiClient } from './client';

export async function getAiStatus() {
  const { data } = await apiClient.get('/api/ai/status');
  return data.data as { configured: boolean };
}

export async function askAi(payload: { question: string; period_start?: string; period_end?: string; department_id?: string; employee_type?: string }) {
  const { data } = await apiClient.post('/api/ai/ask', payload);
  return data.data as { answer: string };
}
