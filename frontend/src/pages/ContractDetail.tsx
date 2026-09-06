import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil } from 'lucide-react';
import { getContract, updateContract } from '../api/contracts.api';
import { getEmployee } from '../api/employees.api';
import { listSalaryStructures } from '../api/salary.api';
import { listDepartments } from '../api/reference.api';
import { StatusBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input, Label, Select } from '../components/ui/input';
import { CardSkeleton } from '../components/ui/skeleton';

const STATUSES = ['draft', 'active', 'expired', 'cancelled'] as const;

export function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<{ department_id: string; position: string; wage: string; salary_structure_id: string; date_start: string; date_end: string; status: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: contract, isLoading } = useQuery({ queryKey: ['contract', id], queryFn: () => getContract(id!), enabled: !!id });
  const { data: employee } = useQuery({ queryKey: ['employee', contract?.employee_id], queryFn: () => getEmployee(contract!.employee_id), enabled: !!contract?.employee_id });
  const { data: structures } = useQuery({ queryKey: ['salary-structures'], queryFn: listSalaryStructures });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: listDepartments });

  const mutation = useMutation({
    mutationFn: () => updateContract(id!, {
      department_id: form!.department_id || undefined,
      position: form!.position || undefined,
      wage: Number(form!.wage),
      salary_structure_id: form!.salary_structure_id || undefined,
      date_start: form!.date_start,
      date_end: form!.date_end || undefined,
      status: form!.status as typeof STATUSES[number],
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', id] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setEditing(false);
      setError(null);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e?.response?.data?.error?.message || 'Failed to update contract');
    },
  });

  if (isLoading || !contract) return <CardSkeleton />;

  const structureName = structures?.find((s) => s.id === contract.salary_structure_id)?.name;
  const departmentName = departments?.find((d) => d.id === contract.department_id)?.name;

  function startEdit() {
    setForm({
      department_id: contract!.department_id || '',
      position: contract!.position || '',
      wage: String(contract!.wage),
      salary_structure_id: contract!.salary_structure_id || '',
      date_start: contract!.date_start,
      date_end: contract!.date_end || '',
      status: contract!.status,
    });
    setError(null);
    setEditing(true);
  }

  return (
    <div className="mx-auto max-w-[900px] space-y-24">
      <button onClick={() => navigate('/contracts')} className="flex items-center gap-4 text-sm text-text-muted hover:text-text">
        <ArrowLeft className="h-[14px] w-[14px]" /> Back to Contracts
      </button>

      <Card>
        <CardContent className="flex items-center justify-between pt-24">
          <div className="flex items-center gap-16">
            {employee && (
              <button onClick={() => navigate(`/employees/${employee.id}`)} className="shrink-0">
                <Avatar seed={employee.id} initials={`${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}`} size="lg" />
              </button>
            )}
            <div>
              <div className="text-xl font-bold text-text">
                {employee ? (
                  <button onClick={() => navigate(`/employees/${employee.id}`)} className="hover:text-primary hover:underline">
                    {employee.first_name} {employee.last_name}
                  </button>
                ) : '—'}
              </div>
              <div className="text-sm text-text-muted">{contract.position || 'No position'} {departmentName && `· ${departmentName}`}</div>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <StatusBadge status={contract.status} domain="contract" />
            {!editing && (
              <Button variant="secondary" size="sm" onClick={startEdit}>
                <Pencil className="h-[14px] w-[14px]" /> Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Contract Terms</CardTitle></CardHeader>
        <CardContent>
          {!editing ? (
            <div className="grid grid-cols-2 gap-16 text-sm">
              <div><div className="text-xs font-medium uppercase text-text-muted">Wage</div><div className="mt-4 font-mono text-lg font-semibold text-text">₹{Number(contract.wage).toLocaleString()}</div></div>
              <div><div className="text-xs font-medium uppercase text-text-muted">Salary Structure</div><div className="mt-4 text-text">{structureName || '—'}</div></div>
              <div><div className="text-xs font-medium uppercase text-text-muted">Start Date</div><div className="mt-4 text-text">{contract.date_start}</div></div>
              <div><div className="text-xs font-medium uppercase text-text-muted">End Date</div><div className="mt-4 text-text">{contract.date_end || 'Ongoing'}</div></div>
              <div><div className="text-xs font-medium uppercase text-text-muted">Active Today</div><div className="mt-4 text-text">{contract.is_active_for_today ? 'Yes' : 'No'}</div></div>
              <div><div className="text-xs font-medium uppercase text-text-muted">Department</div><div className="mt-4 text-text">{departmentName || '—'}</div></div>
            </div>
          ) : (
            <form
              className="grid grid-cols-2 gap-16"
              onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
            >
              <div className="space-y-4">
                <Label>Department</Label>
                <Select value={form!.department_id} onChange={(e) => setForm({ ...form!, department_id: e.target.value })}>
                  <option value="">None</option>
                  {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
              </div>
              <div className="space-y-4">
                <Label>Position</Label>
                <Input value={form!.position} onChange={(e) => setForm({ ...form!, position: e.target.value })} />
              </div>
              <div className="space-y-4">
                <Label>Salary Structure</Label>
                <Select value={form!.salary_structure_id} onChange={(e) => setForm({ ...form!, salary_structure_id: e.target.value })}>
                  <option value="">None</option>
                  {structures?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
              </div>
              <div className="space-y-4">
                <Label>Wage</Label>
                <Input type="number" required value={form!.wage} onChange={(e) => setForm({ ...form!, wage: e.target.value })} />
              </div>
              <div className="space-y-4">
                <Label>Start Date</Label>
                <Input type="date" required value={form!.date_start} onChange={(e) => setForm({ ...form!, date_start: e.target.value })} />
              </div>
              <div className="space-y-4">
                <Label>End Date</Label>
                <Input type="date" value={form!.date_end} onChange={(e) => setForm({ ...form!, date_end: e.target.value })} />
              </div>
              <div className="space-y-4">
                <Label>Status</Label>
                <Select value={form!.status} onChange={(e) => setForm({ ...form!, status: e.target.value })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
              </div>
              {error && <div className="col-span-2 rounded-md bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-12 py-8 text-sm text-danger">{error}</div>}
              <div className="col-span-2 flex justify-end gap-8">
                <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
                <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save Changes'}</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
