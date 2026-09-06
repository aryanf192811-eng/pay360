import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, Plus, AlertTriangle } from 'lucide-react';
import { listPayruns, draftPayrun, createPayrun, type EligibleEmployee } from '../api/payroll.api';
import { listSalaryStructures } from '../api/salary.api';
import { StatusBadge } from '../components/StatusBadge';
import { WizardStepper } from '../components/WizardStepper';
import { TableSkeleton } from '../components/ui/skeleton';
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
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-[16px] md:px-[24px] py-[24px] flex flex-col gap-[12px]">
      
      {/* Page Header */}
      <div className="flex justify-between items-center mb-[8px]">
        <h1 className="text-[28px] font-bold text-[var(--text)] tracking-tight">Payroll Overview</h1>
        {!showWizard && (
          <button 
            onClick={() => setShowWizard(true)}
            className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--surface)] font-semibold text-[12px] px-[16px] py-[8px] rounded transition-colors flex items-center gap-[4px]"
          >
            <Plus className="h-[16px] w-[16px]" /> Run Payroll
          </button>
        )}
      </div>

      {showWizard ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] shadow-sm overflow-hidden mb-[24px]">
          <div className="p-[24px] border-b border-[var(--border)]">
            <WizardStepper steps={['Scope & Period', 'Select Employees']} currentStep={step} />
          </div>
          <div className="p-[24px]">
            {step === 1 && (
              <form
                className="grid grid-cols-2 gap-[16px]"
                onSubmit={(e) => {
                  e.preventDefault();
                  draftMut.mutate();
                }}
              >
                <div className="col-span-2 flex flex-col gap-[8px]">
                  <label className="text-[12px] font-semibold text-[var(--text)]">Payrun Name</label>
                  <input required value={scope.name} onChange={(e) => setScope({ ...scope, name: e.target.value })} placeholder="e.g. January 2026 Payroll" className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none w-full" />
                </div>
                <div className="flex flex-col gap-[8px]">
                  <label className="text-[12px] font-semibold text-[var(--text)]">Salary Structure</label>
                  <select required value={scope.salary_structure_id} onChange={(e) => setScope({ ...scope, salary_structure_id: e.target.value })} className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none w-full">
                    <option value="">Select structure…</option>
                    {structures?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div />
                <div className="flex flex-col gap-[8px]">
                  <label className="text-[12px] font-semibold text-[var(--text)]">Period Start</label>
                  <input type="date" required value={scope.period_start} onChange={(e) => setScope({ ...scope, period_start: e.target.value })} className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none w-full" />
                </div>
                <div className="flex flex-col gap-[8px]">
                  <label className="text-[12px] font-semibold text-[var(--text)]">Period End</label>
                  <input type="date" required value={scope.period_end} onChange={(e) => setScope({ ...scope, period_end: e.target.value })} className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none w-full" />
                </div>
                {error && <div className="col-span-2 rounded bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-[12px] py-[8px] text-[13px] text-[var(--danger)] font-medium border border-[color-mix(in_srgb,var(--danger)_20%,transparent)]">{error}</div>}
                <div className="col-span-2 flex justify-end gap-[8px] mt-[16px]">
                  <button type="button" onClick={resetWizard} className="px-[16px] py-[8px] border border-[var(--border)] rounded text-[12px] font-semibold text-[var(--text)] hover:bg-[var(--bg)] transition-colors bg-[var(--surface)]">Cancel</button>
                  <button type="submit" disabled={draftMut.isPending} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--surface)] font-semibold text-[12px] px-[16px] py-[8px] rounded transition-colors disabled:opacity-50">
                    {draftMut.isPending ? 'Loading…' : 'Continue'}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-[16px]">
                <div className="text-[13px] text-[var(--text-muted)] font-medium">
                  {selectedIds.size} of {eligible.length} employees selected
                </div>
                <div className="border border-[var(--border)] rounded-[6px] overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                        <th className="py-[8px] px-[12px] w-[40px]"></th>
                        <th className="py-[8px] px-[12px] text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Employee</th>
                        <th className="py-[8px] px-[12px] text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Code</th>
                        <th className="py-[8px] px-[12px] text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Type</th>
                        <th className="py-[8px] px-[12px] text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Has Applicable Contract</th>
                      </tr>
                    </thead>
                    <tbody className="text-[13px] text-[var(--text)]">
                      {eligible.map((e) => (
                        <tr key={e.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)] cursor-pointer transition-colors" onClick={() => toggleSelect(e.id)}>
                          <td className="py-[8px] px-[12px]">
                            <input type="checkbox" checked={selectedIds.has(e.id)} onChange={() => toggleSelect(e.id)} className="h-[16px] w-[16px] rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]" />
                          </td>
                          <td className="py-[8px] px-[12px] font-medium">{e.first_name} {e.last_name}</td>
                          <td className="py-[8px] px-[12px] font-mono text-[12px] text-[var(--text-muted)]">{e.employee_code}</td>
                          <td className="py-[8px] px-[12px] capitalize">{e.employee_type.replace('_', ' ')}</td>
                          <td className="py-[8px] px-[12px]">{e.has_contract ? <span className="text-[var(--success)] font-semibold">✓ Yes</span> : <span className="text-[var(--warning)] font-semibold">⚠ No contract</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {error && <div className="rounded bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-[12px] py-[8px] text-[13px] text-[var(--danger)] font-medium border border-[color-mix(in_srgb,var(--danger)_20%,transparent)]">{error}</div>}
                <div className="flex justify-between mt-[8px]">
                  <button type="button" onClick={() => setStep(1)} className="px-[16px] py-[8px] border border-[var(--border)] rounded text-[12px] font-semibold text-[var(--text)] hover:bg-[var(--bg)] transition-colors bg-[var(--surface)]">Back</button>
                  <div className="flex gap-[8px]">
                    <button type="button" onClick={resetWizard} className="px-[16px] py-[8px] border border-[var(--border)] rounded text-[12px] font-semibold text-[var(--text)] hover:bg-[var(--bg)] transition-colors bg-[var(--surface)]">Cancel</button>
                    <button onClick={() => createMut.mutate()} disabled={selectedIds.size === 0 || createMut.isPending} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--surface)] font-semibold text-[12px] px-[16px] py-[8px] rounded transition-colors disabled:opacity-50">
                      {createMut.isPending ? 'Creating…' : 'Create Payrun'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Payruns Data Table */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] flex flex-col overflow-hidden shadow-sm">
            <div className="p-[16px] border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
              <h2 className="font-semibold text-[18px] text-[var(--text)]">Payrun History</h2>
            </div>
            <div className="overflow-x-auto w-full">
              {isLoading ? (
                <TableSkeleton />
              ) : !payruns || payruns.length === 0 ? (
                <div className="py-[48px] flex flex-col items-center justify-center text-[var(--text-muted)]">
                  <Wallet className="h-[32px] w-[32px] mb-[16px] opacity-50" />
                  <p className="text-[14px] font-medium">No payruns yet</p>
                  <p className="text-[12px] mt-[4px]">Create a payrun to compute payslips for a period.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Name</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Period</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Payslips</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Warnings</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="font-medium text-[13px] text-[var(--text)]">
                    {payruns.map((p) => (
                      <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors cursor-pointer group" onClick={() => navigate(`/payroll/payruns/${p.id}`)}>
                        <td className="py-[12px] px-[12px]">{p.name}</td>
                        <td className="py-[12px] px-[12px] text-[var(--text-muted)] font-normal">{p.period_start} → {p.period_end}</td>
                        <td className="py-[12px] px-[12px] font-mono text-[var(--text-muted)]">{p.payslip_count}</td>
                        <td className="py-[12px] px-[12px]">
                          {p.warning_count ? (
                            <span className="flex items-center gap-4 text-xs font-semibold text-danger">
                              <AlertTriangle className="h-[14px] w-[14px]" /> {p.warning_count} warning{p.warning_count === 1 ? '' : 's'}
                            </span>
                          ) : (
                            <span className="text-xs text-text-muted">No warnings</span>
                          )}
                        </td>
                        <td className="py-[12px] px-[12px]"><StatusBadge status={p.status} domain="payrun" /></td>
                        <td className="py-[12px] px-[12px] text-right">
                           <span className="text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity">Review →</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
