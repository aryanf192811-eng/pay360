import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calculator, ClipboardCheck, BadgeCheck, Mail, AlertCircle, AlertTriangle } from 'lucide-react';
import { getPayrun, listPayslips, computePayrun, validatePayrun, markPayrunPaid, sendPayslips } from '../api/payroll.api';
import { StatusBadge } from '../components/StatusBadge';
import { CardSkeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

const WARNING_SEVERITY: Record<string, 'danger' | 'warning'> = {
  contract_missing: 'danger',
  missing_bank_details: 'warning',
  duplicate_payslip: 'danger',
  negative_net: 'warning',
};

const WARNING_SHORT_LABEL: Record<string, string> = {
  contract_missing: 'No Contract',
  missing_bank_details: 'A/C Missing',
  duplicate_payslip: 'Duplicate',
  negative_net: 'Negative Net',
};

export function PayrunDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: payrun, isLoading } = useQuery({ queryKey: ['payrun', id], queryFn: () => getPayrun(id!), enabled: !!id });
  const { data: payslips } = useQuery({ queryKey: ['payslips', id], queryFn: () => listPayslips({ payrun_id: id! }), enabled: !!id });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['payrun', id] });
    queryClient.invalidateQueries({ queryKey: ['payslips', id] });
  };

  const [sendResult, setSendResult] = useState<{ sent: number; queued: number; failed: number } | null>(null);

  const computeMut = useMutation({ mutationFn: () => computePayrun(id!), onSuccess: invalidate });
  const validateMut = useMutation({ mutationFn: () => validatePayrun(id!), onSuccess: invalidate });
  const markPaidMut = useMutation({ mutationFn: () => markPayrunPaid(id!), onSuccess: invalidate });
  const sendMut = useMutation({
    mutationFn: () => sendPayslips(id!),
    onSuccess: (data) => {
      setSendResult(data.stats);
      invalidate();
    },
  });

  if (isLoading || !payrun) return <CardSkeleton />;

  const warnings = payrun.warnings ?? [];
  const blocking = warnings.filter((w) => WARNING_SEVERITY[w.warning_type] === 'danger' && !w.resolved);
  const advisory = warnings.filter((w) => WARNING_SEVERITY[w.warning_type] !== 'danger' && !w.resolved);

  // Per-payslip warning lookup — surfaces the same warning inline in the row (matches the
  // reference wireframe's "Warning" column), not just aggregated in the Preflight card above.
  const warningsByPayslip = new Map<string, { type: string; severity: 'danger' | 'warning' }>();
  for (const w of warnings) {
    if (w.resolved || !w.payslip_id) continue;
    const severity = WARNING_SEVERITY[w.warning_type] ?? 'warning';
    const existing = warningsByPayslip.get(w.payslip_id);
    if (!existing || (severity === 'danger' && existing.severity !== 'danger')) {
      warningsByPayslip.set(w.payslip_id, { type: w.warning_type, severity });
    }
  }

  const anyMutating = computeMut.isPending || validateMut.isPending || markPaidMut.isPending || sendMut.isPending;

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-6 flex flex-col h-[calc(100vh-64px)] overflow-hidden gap-[16px]">
      {/* Top App Bar / Page Header */}
      <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-lg px-6 py-[16px] flex flex-col md:flex-row md:items-center justify-between gap-[16px] shrink-0 shadow-sm">
        <div>
          <button onClick={() => navigate('/payroll')} className="flex items-center gap-1 text-[13px] text-[#434654] hover:text-[#172b4d] mb-2 font-medium">
            <ArrowLeft className="h-[14px] w-[14px]" /> Back to Payroll
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#172b4d] mb-1">{payrun.name}</h1>
            <StatusBadge status={payrun.status} domain="payrun" />
          </div>
          <p className="text-[13px] text-[#434654]">Period: {payrun.period_start} → {payrun.period_end}</p>
        </div>
        <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          <button
            onClick={() => computeMut.mutate()}
            disabled={anyMutating || payrun.status === 'paid'}
            className="bg-[#fefefe] text-[#172b4d] border border-[#dfe1e6] hover:bg-[#f4f5f7] disabled:opacity-50 whitespace-nowrap font-semibold text-[12px] flex items-center gap-2 rounded px-[16px] py-2 transition-colors"
          >
            <Calculator className="h-[16px] w-[16px]" /> Compute
          </button>
          <button
            onClick={() => validateMut.mutate()}
            disabled={anyMutating || payrun.status !== 'computed' || blocking.length > 0}
            className="bg-[#fefefe] text-[#172b4d] border border-[#dfe1e6] hover:bg-[#f4f5f7] disabled:opacity-50 whitespace-nowrap font-semibold text-[12px] flex items-center gap-2 rounded px-[16px] py-2 transition-colors"
          >
            <ClipboardCheck className="h-[16px] w-[16px]" /> Validate
          </button>
          <button
            onClick={() => markPaidMut.mutate()}
            disabled={anyMutating || payrun.status !== 'validated'}
            className="bg-[#3062e1] text-[#ffffff] hover:bg-[#2552cc] disabled:opacity-50 whitespace-nowrap font-semibold text-[12px] flex items-center gap-2 rounded px-[16px] py-2 transition-colors"
          >
            <BadgeCheck className="h-[16px] w-[16px]" /> Mark Paid
          </button>
          <button
            onClick={() => sendMut.mutate()}
            disabled={anyMutating || payrun.status === 'draft'}
            className="bg-[#fefefe] text-[#172b4d] border border-[#dfe1e6] hover:bg-[#f4f5f7] disabled:opacity-50 whitespace-nowrap font-semibold text-[12px] flex items-center gap-2 rounded px-[16px] py-2 transition-colors"
          >
            <Mail className="h-[16px] w-[16px]" /> {sendMut.isPending ? 'Sending…' : 'Send Payslips'}
          </button>
        </div>
      </div>

      {sendResult && (
        <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-lg p-[16px] text-[13px] text-[#172b4d] shadow-sm shrink-0">
          Payslip emails processed —{' '}
          {sendResult.sent > 0 && <span className="font-medium text-[#006644]">{sendResult.sent} sent</span>}
          {sendResult.sent > 0 && sendResult.queued > 0 && ', '}
          {sendResult.queued > 0 && (
            <span className="font-medium text-[#ff8b00]">{sendResult.queued} queued (no email provider configured)</span>
          )}
          {sendResult.failed > 0 && <span className="font-medium text-[#de350b]">, {sendResult.failed} failed</span>}
        </div>
      )}

      {/* Scrollable Content Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-[16px] h-full">

          {/* Left Column: Payrun Health */}
          <div className="md:col-span-3 flex flex-col gap-[16px]">
            <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] p-[16px] h-full flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-[16px] pb-2 border-b border-[#ebecf0]">
                <h2 className="font-semibold text-[16px] text-[#172b4d]">Payrun Health</h2>
                {warnings.length > 0 && (
                  <span className="bg-[#ffebe6] text-[#bf2600] font-medium text-[11px] px-2 py-0.5 rounded">{warnings.length} Issues</span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto pr-1">
                {warnings.length === 0 ? (
                  <div className="text-[13px] text-[#5e6c84] text-center mt-[32px]">No warnings. Payrun looks good!</div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {blocking.map((w) => (
                      <li key={w.id} className="p-3 border border-[#ffdad6] bg-[#fff5f5] rounded flex items-start gap-3">
                        <AlertCircle className="h-[20px] w-[20px] mt-0.5 shrink-0 text-[#de350b]" fill="#ffdad6" />
                        <div>
                          <div className="font-semibold text-[12px] text-[#de350b]">{WARNING_SHORT_LABEL[w.warning_type] || w.warning_type}</div>
                          <div className="font-medium text-[13px] text-[#172b4d] mt-1">{w.message}</div>
                          <div className="font-medium text-[11px] text-[#5e6c84] mt-1">Blocks validation</div>
                        </div>
                      </li>
                    ))}
                    {advisory.map((w) => (
                      <li key={w.id} className="p-3 border border-[#ffe0b2] bg-[#fff8e1] rounded flex items-start gap-3">
                        <AlertTriangle className="h-[20px] w-[20px] mt-0.5 shrink-0 text-[#ff991f]" fill="#ffe0b2" />
                        <div>
                          <div className="font-semibold text-[12px] text-[#b97a00]">{WARNING_SHORT_LABEL[w.warning_type] || w.warning_type}</div>
                          <div className="font-medium text-[13px] text-[#172b4d] mt-1">{w.message}</div>
                          <div className="font-medium text-[11px] text-[#5e6c84] mt-1">Advisory</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Payslips Detail */}
          <div className="md:col-span-9 flex flex-col">
            <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] flex-1 flex flex-col overflow-hidden shadow-sm">
              <div className="p-3 border-b border-[#ebecf0] flex justify-between items-center bg-[#fefae0]">
                <div className="font-semibold text-[14px] text-[#172b4d]">Payslips ({payslips?.length ?? 0})</div>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr>
                      <th className="bg-[#f4f5f7] border-b border-[#dfe1e6] font-semibold text-[12px] text-[#434654] p-3 whitespace-nowrap">Employee</th>
                      <th className="bg-[#f4f5f7] border-b border-[#dfe1e6] font-semibold text-[12px] text-[#434654] p-3 whitespace-nowrap">Warning</th>
                      <th className="bg-[#f4f5f7] border-b border-[#dfe1e6] font-semibold text-[12px] text-[#434654] p-3 text-right whitespace-nowrap">Worked Days</th>
                      <th className="bg-[#f4f5f7] border-b border-[#dfe1e6] font-semibold text-[12px] text-[#434654] p-3 text-right whitespace-nowrap">Net Pay</th>
                      <th className="bg-[#f4f5f7] border-b border-[#dfe1e6] font-semibold text-[12px] text-[#434654] p-3 whitespace-nowrap">Status</th>
                      <th className="bg-[#f4f5f7] border-b border-[#dfe1e6] p-3"></th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] text-[#172b4d]">
                    {(payslips ?? []).map((p) => {
                      const warning = warningsByPayslip.get(p.id);
                      return (
                        <tr key={p.id} className="border-b border-[#ebecf0] hover:bg-[#f4f5f7] transition-colors cursor-pointer" onClick={() => navigate(`/payroll/payslips/${p.id}`)}>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-[32px] h-[32px] rounded-full bg-[#3062e1] text-[#ffffff] font-semibold flex items-center justify-center shrink-0 text-[13px]">
                                {p.first_name?.charAt(0)}{p.last_name?.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{p.first_name} {p.last_name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            {warning ? (
                              <span className={cn('text-[12px] font-semibold', warning.severity === 'danger' ? 'text-[#de350b]' : 'text-[#ff991f]')}>
                                {WARNING_SHORT_LABEL[warning.type] ?? warning.type}
                              </span>
                            ) : (
                              <span className="text-[#5e6c84]">—</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono">{p.worked_days ?? '—'}</td>
                          <td className="p-3 text-right font-semibold">
                            {p.net != null ? `₹${Number(p.net).toLocaleString()}` : <span className="text-[#5e6c84] font-normal">Not computed</span>}
                          </td>
                          <td className="p-3">
                            <StatusBadge status={p.status} domain="payslip" />
                          </td>
                          <td className="p-3 text-right">
                            <button className="text-[#3062e1] hover:underline font-semibold text-[12px]">Review</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
