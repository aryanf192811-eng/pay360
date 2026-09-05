import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { FlaskConical } from 'lucide-react';
import { listEmployees } from '../api/employees.api';
import { listSalaryStructures } from '../api/salary.api';
import { simulatePayslip, type SimulationResult } from '../api/payroll.api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input, Label, Select } from '../components/ui/input';
import { cn } from '../lib/utils';

const CATEGORY_LABEL: Record<string, string> = {
  basic: 'Basic',
  allowance: 'Allowance',
  gross: 'Gross',
  deduction: 'Deduction',
  net: 'Net',
};

// Tier 2 "What-If Simulator" (CLAUDE.md): must call the same payroll-engine function used for
// real computation, in a dry-run mode — never a second, parallel calculation path that could
// drift from the real one. This page is a thin form over POST /api/payslip-simulations, which
// calls the exact same computePayslipCore() the real payrun compute step uses, inside a
// transaction it unconditionally rolls back. Nothing here is ever persisted.
export function WhatIfSimulator() {
  const { data: employees } = useQuery({ queryKey: ['employees', 'all'], queryFn: () => listEmployees() });
  const { data: structures } = useQuery({ queryKey: ['salary-structures'], queryFn: listSalaryStructures });

  const [form, setForm] = useState({ employee_id: '', salary_structure_id: '', period_start: '', period_end: '' });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const simulateMut = useMutation({
    mutationFn: () => simulatePayslip(form),
    onSuccess: (data) => { setResult(data); setError(null); },
    onError: (err: unknown) => {
      setResult(null);
      setError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Simulation failed');
    },
  });

  const netLine = result?.lines?.length ? [...result.lines].reverse().find((l) => l.category === 'net') : undefined;

  return (
    <div className="space-y-24">
      <div>
        <h1 className="flex items-center gap-8 text-2xl font-bold text-text"><FlaskConical className="h-20 w-20" /> What-If Simulator</h1>
        <p className="text-sm text-text-muted">
          Dry-runs the real payroll engine for a hypothetical employee/structure/period combination. Nothing here is ever saved — every simulation is computed then discarded.
        </p>
      </div>

      <Card>
        <CardContent className="pt-24">
          <form
            className="grid grid-cols-2 gap-16"
            onSubmit={(e) => {
              e.preventDefault();
              simulateMut.mutate();
            }}
          >
            <div className="space-y-4">
              <Label>Employee</Label>
              <Select required value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })}>
                <option value="">Select employee…</option>
                {employees?.map((e) => (
                  <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_code})</option>
                ))}
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Salary Structure</Label>
              <Select required value={form.salary_structure_id} onChange={(e) => setForm({ ...form, salary_structure_id: e.target.value })}>
                <option value="">Select structure…</option>
                {structures?.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Period Start</Label>
              <Input type="date" required value={form.period_start} onChange={(e) => setForm({ ...form, period_start: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Period End</Label>
              <Input type="date" required value={form.period_end} onChange={(e) => setForm({ ...form, period_end: e.target.value })} />
            </div>
            {error && <div className="col-span-2 rounded-md bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-12 py-8 text-sm text-danger">{error}</div>}
            <div className="col-span-2 flex justify-end">
              <Button type="submit" disabled={simulateMut.isPending}>{simulateMut.isPending ? 'Simulating…' : 'Run Simulation'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader><CardTitle>Simulated Result (not saved)</CardTitle></CardHeader>
          <CardContent>
            {!result.computed ? (
              <div className="py-16 text-sm text-warning">Could not compute: {result.reason || 'no applicable contract for this employee/period.'}</div>
            ) : (
              <div className="space-y-4">
                {result.lines.map((line, i) => (
                  <div key={line.id ?? `${line.code}-${i}`} className="flex items-center justify-between border-b border-border py-12 last:border-0">
                    <div className="flex items-center gap-12">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-bg font-mono text-xs text-text-muted">{i + 1}</div>
                      <div>
                        <div className="text-sm font-medium text-text">{line.name}</div>
                        <div className="text-xs text-text-muted">{CATEGORY_LABEL[line.category]} · code <span className="font-mono">{line.code}</span></div>
                      </div>
                    </div>
                    <div className={cn('font-mono text-base font-semibold tabular-nums', line.category === 'deduction' ? 'text-danger' : line.category === 'net' ? 'text-success' : 'text-text')}>
                      {line.category === 'deduction' ? '−' : ''}₹{Math.abs(Number(line.amount)).toLocaleString()}
                    </div>
                  </div>
                ))}
                {netLine && (
                  <div className="mt-16 flex items-center justify-between rounded-md bg-bg px-16 py-16">
                    <div className="text-base font-semibold text-text">Simulated Net Pay</div>
                    <div className="font-mono text-2xl font-bold tabular-nums text-success">₹{Number(netLine.amount).toLocaleString()}</div>
                  </div>
                )}
                {result.warnings.length > 0 && (
                  <div className="mt-16 space-y-4">
                    {result.warnings.map((w, i) => (
                      <div key={i} className="rounded-md bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] px-12 py-8 text-sm text-warning">{w.message}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
