import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet, Plus } from 'lucide-react';
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
        <h1 className="text-[28px] font-bold text-[#172b4d] tracking-tight">Payroll Overview</h1>
        {!showWizard && (
          <button 
            onClick={() => setShowWizard(true)}
            className="bg-[#3062e1] hover:bg-[#2552cc] text-[#ffffff] font-semibold text-[12px] px-[16px] py-[8px] rounded transition-colors flex items-center gap-[4px]"
          >
            <Plus className="h-[16px] w-[16px]" /> Run Payroll
          </button>
        )}
      </div>

      {showWizard ? (
        <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] shadow-sm overflow-hidden mb-[24px]">
          <div className="p-[24px] border-b border-[#ebecf0]">
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
                  <label className="text-[12px] font-semibold text-[#172b4d]">Payrun Name</label>
                  <input required value={scope.name} onChange={(e) => setScope({ ...scope, name: e.target.value })} placeholder="e.g. January 2026 Payroll" className="h-[36px] px-[12px] text-[13px] border border-[#dfe1e6] rounded bg-[#ffffff] focus:border-[#3062e1] focus:ring-1 focus:ring-[#3062e1] focus:outline-none w-full" />
                </div>
                <div className="flex flex-col gap-[8px]">
                  <label className="text-[12px] font-semibold text-[#172b4d]">Salary Structure</label>
                  <select required value={scope.salary_structure_id} onChange={(e) => setScope({ ...scope, salary_structure_id: e.target.value })} className="h-[36px] px-[12px] text-[13px] border border-[#dfe1e6] rounded bg-[#ffffff] focus:border-[#3062e1] focus:ring-1 focus:ring-[#3062e1] focus:outline-none w-full">
                    <option value="">Select structure…</option>
                    {structures?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div />
                <div className="flex flex-col gap-[8px]">
                  <label className="text-[12px] font-semibold text-[#172b4d]">Period Start</label>
                  <input type="date" required value={scope.period_start} onChange={(e) => setScope({ ...scope, period_start: e.target.value })} className="h-[36px] px-[12px] text-[13px] border border-[#dfe1e6] rounded bg-[#ffffff] focus:border-[#3062e1] focus:ring-1 focus:ring-[#3062e1] focus:outline-none w-full" />
                </div>
                <div className="flex flex-col gap-[8px]">
                  <label className="text-[12px] font-semibold text-[#172b4d]">Period End</label>
                  <input type="date" required value={scope.period_end} onChange={(e) => setScope({ ...scope, period_end: e.target.value })} className="h-[36px] px-[12px] text-[13px] border border-[#dfe1e6] rounded bg-[#ffffff] focus:border-[#3062e1] focus:ring-1 focus:ring-[#3062e1] focus:outline-none w-full" />
                </div>
                {error && <div className="col-span-2 rounded bg-[#ffebe6] px-[12px] py-[8px] text-[13px] text-[#de350b] font-medium border border-[#ffdad6]">{error}</div>}
                <div className="col-span-2 flex justify-end gap-[8px] mt-[16px]">
                  <button type="button" onClick={resetWizard} className="px-[16px] py-[8px] border border-[#dfe1e6] rounded text-[12px] font-semibold text-[#172b4d] hover:bg-[#f4f5f7] transition-colors bg-[#fefefe]">Cancel</button>
                  <button type="submit" disabled={draftMut.isPending} className="bg-[#3062e1] hover:bg-[#2552cc] text-[#ffffff] font-semibold text-[12px] px-[16px] py-[8px] rounded transition-colors disabled:opacity-50">
                    {draftMut.isPending ? 'Loading…' : 'Continue'}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-[16px]">
                <div className="text-[13px] text-[#434654] font-medium">
                  {selectedIds.size} of {eligible.length} employees selected
                </div>
                <div className="border border-[#dfe1e6] rounded-[6px] overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f4f5f7] border-b border-[#dfe1e6]">
                        <th className="py-[8px] px-[12px] w-[40px]"></th>
                        <th className="py-[8px] px-[12px] text-[12px] font-semibold text-[#434654] uppercase tracking-wider">Employee</th>
                        <th className="py-[8px] px-[12px] text-[12px] font-semibold text-[#434654] uppercase tracking-wider">Code</th>
                        <th className="py-[8px] px-[12px] text-[12px] font-semibold text-[#434654] uppercase tracking-wider">Type</th>
                        <th className="py-[8px] px-[12px] text-[12px] font-semibold text-[#434654] uppercase tracking-wider">Has Applicable Contract</th>
                      </tr>
                    </thead>
                    <tbody className="text-[13px] text-[#172b4d]">
                      {eligible.map((e) => (
                        <tr key={e.id} className="border-b border-[#ebecf0] hover:bg-[#f4f5f7] cursor-pointer transition-colors" onClick={() => toggleSelect(e.id)}>
                          <td className="py-[8px] px-[12px]">
                            <input type="checkbox" checked={selectedIds.has(e.id)} onChange={() => toggleSelect(e.id)} className="h-[16px] w-[16px] rounded border-[#dfe1e6] text-[#3062e1] focus:ring-[#3062e1]" />
                          </td>
                          <td className="py-[8px] px-[12px] font-medium">{e.first_name} {e.last_name}</td>
                          <td className="py-[8px] px-[12px] font-mono text-[12px] text-[#434654]">{e.employee_code}</td>
                          <td className="py-[8px] px-[12px] capitalize">{e.employee_type.replace('_', ' ')}</td>
                          <td className="py-[8px] px-[12px]">{e.has_contract ? <span className="text-[#006644] font-semibold">✓ Yes</span> : <span className="text-[#ff991f] font-semibold">⚠ No contract</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {error && <div className="rounded bg-[#ffebe6] px-[12px] py-[8px] text-[13px] text-[#de350b] font-medium border border-[#ffdad6]">{error}</div>}
                <div className="flex justify-between mt-[8px]">
                  <button type="button" onClick={() => setStep(1)} className="px-[16px] py-[8px] border border-[#dfe1e6] rounded text-[12px] font-semibold text-[#172b4d] hover:bg-[#f4f5f7] transition-colors bg-[#fefefe]">Back</button>
                  <div className="flex gap-[8px]">
                    <button type="button" onClick={resetWizard} className="px-[16px] py-[8px] border border-[#dfe1e6] rounded text-[12px] font-semibold text-[#172b4d] hover:bg-[#f4f5f7] transition-colors bg-[#fefefe]">Cancel</button>
                    <button onClick={() => createMut.mutate()} disabled={selectedIds.size === 0 || createMut.isPending} className="bg-[#3062e1] hover:bg-[#2552cc] text-[#ffffff] font-semibold text-[12px] px-[16px] py-[8px] rounded transition-colors disabled:opacity-50">
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
          <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] flex flex-col overflow-hidden shadow-sm">
            <div className="p-[16px] border-b border-[#ebecf0] flex justify-between items-center bg-[#ffffff]">
              <h2 className="font-semibold text-[18px] text-[#172b4d]">Payrun History</h2>
            </div>
            <div className="overflow-x-auto w-full">
              {isLoading ? (
                <TableSkeleton />
              ) : !payruns || payruns.length === 0 ? (
                <div className="py-[48px] flex flex-col items-center justify-center text-[#434654]">
                  <Wallet className="h-[32px] w-[32px] mb-[16px] opacity-50" />
                  <p className="text-[14px] font-medium">No payruns yet</p>
                  <p className="text-[12px] mt-[4px]">Create a payrun to compute payslips for a period.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#f4f5f7] border-b border-[#dfe1e6]">
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[#434654] uppercase tracking-wider">Name</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[#434654] uppercase tracking-wider">Period</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[#434654] uppercase tracking-wider">Payslips</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[#434654] uppercase tracking-wider">Status</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[#434654] uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="font-medium text-[13px] text-[#172b4d]">
                    {payruns.map((p) => (
                      <tr key={p.id} className="border-b border-[#ebecf0] hover:bg-[#f4f5f7] transition-colors cursor-pointer group" onClick={() => navigate(`/payroll/payruns/${p.id}`)}>
                        <td className="py-[12px] px-[12px]">{p.name}</td>
                        <td className="py-[12px] px-[12px] text-[#434654] font-normal">{p.period_start} → {p.period_end}</td>
                        <td className="py-[12px] px-[12px] font-mono text-[#434654]">{p.payslip_count}</td>
                        <td className="py-[12px] px-[12px]"><StatusBadge status={p.status} domain="payrun" /></td>
                        <td className="py-[12px] px-[12px] text-right">
                           <span className="text-[#3062e1] opacity-0 group-hover:opacity-100 transition-opacity">Review →</span>
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
