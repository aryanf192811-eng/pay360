import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { createEmployee, updateEmployee, getEmployee, listEmployees } from '../api/employees.api';
import { listDepartments, listSchedules } from '../api/reference.api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input, Label, Select } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { CardSkeleton } from '../components/ui/skeleton';

const EMPLOYEE_TYPES = ['full_time', 'part_time', 'contract'] as const;
const STATUSES = ['active', 'inactive'] as const;

const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  department_id: '',
  manager_id: '',
  job_position: '',
  schedule_id: '',
  employee_type: 'full_time' as (typeof EMPLOYEE_TYPES)[number],
  status: 'active' as (typeof STATUSES)[number],
  hire_date: '',
  bank_account_number: '',
};

export function EmployeeForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => getEmployee(id!),
    enabled: isEdit,
  });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: listDepartments });
  const { data: schedules } = useQuery({ queryKey: ['schedules'], queryFn: listSchedules });
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => listEmployees() });

  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        first_name: existing.first_name || '',
        last_name: existing.last_name || '',
        email: existing.email || '',
        phone: existing.phone || '',
        department_id: existing.department_id || '',
        manager_id: existing.manager_id || '',
        job_position: existing.job_position || '',
        schedule_id: existing.schedule_id || '',
        employee_type: existing.employee_type || 'full_time',
        status: existing.status || 'active',
        hire_date: existing.hire_date ? existing.hire_date.slice(0, 10) : '',
        bank_account_number: existing.bank_account_number || '',
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        ...form,
        phone: form.phone || undefined,
        department_id: form.department_id || undefined,
        manager_id: form.manager_id || undefined,
        job_position: form.job_position || undefined,
        schedule_id: form.schedule_id || undefined,
        bank_account_number: form.bank_account_number || undefined,
      };
      return isEdit ? updateEmployee(id!, payload) : createEmployee(payload);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', saved.id] });
      navigate(`/employees/${saved.id}`);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e?.response?.data?.error?.message || 'Failed to save employee');
    },
  });

  if (isEdit && loadingExisting) return <CardSkeleton />;

  const managerOptions = (employees || []).filter((e) => e.id !== id);

  return (
    <div className="space-y-24">
      <button
        onClick={() => navigate(isEdit ? `/employees/${id}` : '/employees')}
        className="flex items-center gap-4 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft className="h-[14px] w-[14px]" /> Back
      </button>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Employee' : 'New Employee'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid grid-cols-2 gap-16"
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
          >
            <div className="space-y-4">
              <Label>First Name</Label>
              <Input required value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Last Name</Label>
              <Input required value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Email</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Department</Label>
              <Select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}>
                <option value="">None</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Manager</Label>
              <Select value={form.manager_id} onChange={(e) => setForm({ ...form, manager_id: e.target.value })}>
                <option value="">None</option>
                {managerOptions.map((m) => (
                  <option key={m.id} value={m.id}>{m.first_name} {m.last_name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Job Position</Label>
              <Input value={form.job_position} onChange={(e) => setForm({ ...form, job_position: e.target.value })} placeholder="e.g. Senior Engineer" />
            </div>
            <div className="space-y-4">
              <Label>Working Schedule</Label>
              <Select value={form.schedule_id} onChange={(e) => setForm({ ...form, schedule_id: e.target.value })}>
                <option value="">None</option>
                {schedules?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.total_weekly_hours}h/week)</option>
                ))}
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Employee Type</Label>
              <Select required value={form.employee_type} onChange={(e) => setForm({ ...form, employee_type: e.target.value as typeof form.employee_type })}>
                {EMPLOYEE_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace('_', ' ')}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Status</Label>
              <Select required value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Hire Date</Label>
              <Input type="date" required value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Bank Account Number</Label>
              <Input value={form.bank_account_number} onChange={(e) => setForm({ ...form, bank_account_number: e.target.value })} />
            </div>
            {error && <div className="col-span-2 rounded-md bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-12 py-8 text-sm text-danger">{error}</div>}
            <div className="col-span-2 flex justify-end gap-8">
              <Button type="button" variant="secondary" onClick={() => navigate(isEdit ? `/employees/${id}` : '/employees')}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Employee'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
