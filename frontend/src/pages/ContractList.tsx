import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus } from 'lucide-react';
import { listContracts, createContract } from '../api/contracts.api';
import { listEmployees } from '../api/employees.api';
import { listSalaryStructures } from '../api/salary.api';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/ui/skeleton';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input, Label, Select } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export function ContractList() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: contracts, isLoading } = useQuery({ queryKey: ['contracts'], queryFn: () => listContracts() });
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => listEmployees() });
  const { data: structures } = useQuery({ queryKey: ['salary-structures'], queryFn: listSalaryStructures });

  const [form, setForm] = useState({ employee_id: '', wage: '', salary_structure_id: '', date_start: '', date_end: '', status: 'active' });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createContract({
        ...form,
        wage: Number(form.wage),
        date_end: form.date_end || undefined,
        status: form.status as 'draft' | 'active',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setShowForm(false);
      setError(null);
      setForm({ employee_id: '', wage: '', salary_structure_id: '', date_start: '', date_end: '', status: 'active' });
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e?.response?.data?.error?.message || 'Failed to create contract');
    },
  });

  return (
    <div className="space-y-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Contracts</h1>
          <p className="text-sm text-text-muted">Payroll always uses the contract applicable to the selected period.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-16 w-16" /> New Contract
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Contract</CardTitle>
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
                <Label>Employee</Label>
                <Select required value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
                  <option value="">Select employee…</option>
                  {employees?.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.first_name} {e.last_name} ({e.employee_code})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-4">
                <Label>Salary Structure</Label>
                <Select value={form.salary_structure_id} onChange={(e) => setForm({ ...form, salary_structure_id: e.target.value })}>
                  <option value="">None</option>
                  {structures?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-4">
                <Label>Wage</Label>
                <Input type="number" required value={form.wage} onChange={(e) => setForm({ ...form, wage: e.target.value })} />
              </div>
              <div className="space-y-4">
                <Label>Status</Label>
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </Select>
              </div>
              <div className="space-y-4">
                <Label>Start Date</Label>
                <Input type="date" required value={form.date_start} onChange={(e) => setForm({ ...form, date_start: e.target.value })} />
              </div>
              <div className="space-y-4">
                <Label>End Date (optional)</Label>
                <Input type="date" value={form.date_end} onChange={(e) => setForm({ ...form, date_end: e.target.value })} />
              </div>
              {error && <div className="col-span-2 rounded-md bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-12 py-8 text-sm text-danger">{error}</div>}
              <div className="col-span-2 flex justify-end gap-8">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Creating…' : 'Create Contract'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : !contracts || contracts.length === 0 ? (
        <EmptyState icon={FileText} title="No contracts yet" description="Create a contract to define an employee's wage and salary structure for payroll." />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Employee</Th>
              <Th>Position</Th>
              <Th>Wage</Th>
              <Th>Start</Th>
              <Th>End</Th>
              <Th>Active Today</Th>
              <Th>Status</Th>
            </tr>
          </Thead>
          <Tbody>
            {contracts.map((c) => (
              <Tr key={c.id}>
                <Td className="font-medium">
                  {c.first_name} {c.last_name}
                </Td>
                <Td>{c.position || '—'}</Td>
                <Td className="font-mono">₹{Number(c.wage).toLocaleString()}</Td>
                <Td>{c.date_start}</Td>
                <Td>{c.date_end || 'Ongoing'}</Td>
                <Td>{c.is_active_for_today ? '✓' : '—'}</Td>
                <Td>
                  <StatusBadge status={c.status} domain="contract" />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
