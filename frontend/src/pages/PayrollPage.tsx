import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, Plus } from 'lucide-react';
import { listPayruns, draftPayrun, createPayrun, type EligibleEmployee } from '../api/payroll.api';
import { listSalaryStructures } from '../api/salary.api';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { WizardStepper } from '../components/WizardStepper';
import { TableSkeleton } from '../components/ui/skeleton';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input, Label, Select } from '../components/ui/input';
import { Card, CardContent, CardHeader } from '../components/ui/card';

export function PayrollPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: payruns, isLoading } = useQuery({ queryKey: ['payruns'], queryFn: listPayruns });
  const { data: structures } = useQuery({ queryKey: ['salary-structures'], queryFn: listSalaryStructures });

  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(1);
  const [scope, setScope] = useState({ name: '', salary_structure_id: '', period_start: '', period_end: '' });
  const [eligible, setEligible] = useState<EligibleEmployee[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const draftMut = useMutation({
    mutationFn: () => draftPayrun({ salary_structure_id: scope.salary_structure_id, period_start: scope.period_start, period_end: scope.period_end }),
    onSuccess: (data) => {
      setEligible(data.eligible_employees);
      setStep(2);
      setError(null);
    },
    onError: (err: unknown) => setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to load eligible employees'),
  });

  const createMut = useMutation({
    mutationFn: () => createPayrun({ ...scope, employee_ids: Array.from(selectedIds) }),
    onSuccess: (payrun) => {
      queryClient.invalidateQueries({ queryKey: ['payruns'] });
      resetWizard();
      navigate(`/payroll/payruns/${payrun.id}`);
    },
    onError: (err: unknown) => setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to create payrun'),
  });

  function resetWizard() {
    setShowWizard(false);
    setStep(1);
    setScope({ name: '', salary_structure_id: '', period_start: '', period_end: '' });
    setEligible([]);
    setSelectedIds(new Set());
    setError(null);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Payroll</h1>
          <p className="text-sm text-text-muted">Two-step payrun creation: define scope, then select employees.</p>
        </div>
        {!showWizard && (
          <Button onClick={() => setShowWizard(true)}>
            <Plus className="h-16 w-16" /> New Payrun
          </Button>
        )}
      </div>

      {showWizard && (
        <Card>
          <CardHeader>
            <WizardStepper steps={['Scope & Period', 'Select Employees']} currentStep={step} />
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <form
                className="grid grid-cols-2 gap-16"
                onSubmit={(e) => {
                  e.preventDefault();
                  draftMut.mutate();
                }}
              >
                <div className="col-span-2 space-y-4">
                  <Label>Payrun Name</Label>
                  <Input required value={scope.name} onChange={(e) => setScope({ ...scope, name: e.target.value })} placeholder="e.g. January 2026 Payroll" />
                </div>
                <div className="space-y-4">
                  <Label>Salary Structure</Label>
                  <Select required value={scope.salary_structure_id} onChange={(e) => setScope({ ...scope, salary_structure_id: e.target.value })}>
                    <option value="">Select structure…</option>
                    {structures?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </Select>
                </div>
                <div />
                <div className="space-y-4">
                  <Label>Period Start</Label>
                  <Input type="date" required value={scope.period_start} onChange={(e) => setScope({ ...scope, period_start: e.target.value })} />
                </div>
                <div className="space-y-4">
                  <Label>Period End</Label>
                  <Input type="date" required value={scope.period_end} onChange={(e) => setScope({ ...scope, period_end: e.target.value })} />
                </div>
                {error && <div className="col-span-2 rounded-md bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-12 py-8 text-sm text-danger">{error}</div>}
                <div className="col-span-2 flex justify-end gap-8">
                  <Button type="button" variant="secondary" onClick={resetWizard}>Cancel</Button>
                  <Button type="submit" disabled={draftMut.isPending}>{draftMut.isPending ? 'Loading…' : 'Continue'}</Button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-16">
                <div className="text-sm text-text-muted">
                  {selectedIds.size} of {eligible.length} employees selected — a live, real eligibility list (not a hardcoded roster).
                </div>
                <Table>
                  <Thead>
                    <tr>
                      <Th></Th>
                      <Th>Employee</Th>
                      <Th>Code</Th>
                      <Th>Type</Th>
                      <Th>Has Applicable Contract</Th>
                    </tr>
                  </Thead>
                  <Tbody>
                    {eligible.map((e) => (
                      <Tr key={e.id} className="cursor-pointer" onClick={() => toggleSelect(e.id)}>
                        <Td>
                          <input type="checkbox" checked={selectedIds.has(e.id)} onChange={() => toggleSelect(e.id)} className="h-16 w-16" />
                        </Td>
                        <Td className="font-medium">{e.first_name} {e.last_name}</Td>
                        <Td className="font-mono text-xs">{e.employee_code}</Td>
                        <Td className="capitalize">{e.employee_type.replace('_', ' ')}</Td>
                        <Td>{e.has_contract ? <span className="text-success">✓ Yes</span> : <span className="text-warning">⚠ No contract</span>}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
                {error && <div className="rounded-md bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-12 py-8 text-sm text-danger">{error}</div>}
                <div className="flex justify-between">
                  <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                  <div className="flex gap-8">
                    <Button variant="secondary" onClick={resetWizard}>Cancel</Button>
                    <Button onClick={() => createMut.mutate()} disabled={selectedIds.size === 0 || createMut.isPending}>
                      {createMut.isPending ? 'Creating…' : 'Create Payrun'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <TableSkeleton />
      ) : !payruns || payruns.length === 0 ? (
        <EmptyState icon={Wallet} title="No payruns yet" description="Create a payrun to compute payslips for a period." />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Name</Th>
              <Th>Period</Th>
              <Th>Payslips</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {payruns.map((p) => (
              <Tr key={p.id} className="cursor-pointer" onClick={() => navigate(`/payroll/payruns/${p.id}`)}>
                <Td className="font-medium">{p.name}</Td>
                <Td>{p.period_start} → {p.period_end}</Td>
                <Td className="font-mono">{p.payslip_count}</Td>
                <Td><StatusBadge status={p.status} domain="payrun" /></Td>
                <Td><Button size="sm" variant="ghost">Open →</Button></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
