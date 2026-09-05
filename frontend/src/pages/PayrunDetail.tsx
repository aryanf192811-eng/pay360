import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Calculator, ClipboardCheck, BadgeCheck, Mail, AlertCircle, AlertTriangle, Check } from 'lucide-react';
import { getPayrun, listPayslips, computePayrun, validatePayrun, markPayrunPaid, sendPayslips } from '../api/payroll.api';
import { StatusBadge } from '../components/StatusBadge';
import { CardSkeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

const LIFECYCLE_STAGES = ['draft', 'computed', 'validated', 'paid'] as const;

function LifecycleStepper({ status }: { status: string }) {
  const currentIndex = LIFECYCLE_STAGES.indexOf(status as (typeof LIFECYCLE_STAGES)[number]);
  return (
    <div className="flex items-center">
      {LIFECYCLE_STAGES.map((stage, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <div key={stage} className="flex items-center">
            <div className="flex flex-col items-center gap-4">
              <motion.div
                initial={false}
                animate={{ scale: active ? 1.1 : 1 }}
                className={cn(
                  'flex h-24 w-24 items-center justify-center rounded-full border-2 text-xs font-bold',
                  done && 'border-success bg-success text-white',
                  active && 'border-primary bg-primary text-white',
                  !done && !active && 'border-border bg-surface text-text-muted'
                )}
              >
                {done ? <Check className="h-[14px] w-[14px]" /> : i + 1}
              </motion.div>
              <span className={cn('text-[10px] font-medium capitalize', active ? 'text-primary' : 'text-text-muted')}>{stage}</span>
            </div>
            {i < LIFECYCLE_STAGES.length - 1 && (
              <div className={cn('mx-8 h-2 w-24 rounded-full sm:w-40', i < currentIndex ? 'bg-success' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-6 py-[16px] flex flex-col gap-[16px] shrink-0 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[16px]">
        <div>
          <button onClick={() => navigate('/payroll')} className="flex items-center gap-1 text-[13px] text-[var(--text-muted)] hover:text-[var(--text)] mb-2 font-medium">
            <ArrowLeft className="h-[14px] w-[14px]" /> Back to Payroll
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text)] mb-1">{payrun.name}</h1>
            <StatusBadge status={payrun.status} domain="payrun" />
          </div>
          <p className="text-[13px] text-[var(--text-muted)]">Period: {payrun.period_start} → {payrun.period_end}</p>
        </div>
        <div className="flex gap-2 shrink-0 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          <button
            onClick={() => computeMut.mutate()}
            disabled={anyMutating || payrun.status === 'paid'}
            className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg)] disabled:opacity-50 whitespace-nowrap font-semibold text-[12px] flex items-center gap-2 rounded px-[16px] py-2 transition-colors"
          >
            <Calculator className="h-[16px] w-[16px]" /> Compute
          </button>
          <button
            onClick={() => validateMut.mutate()}
            disabled={anyMutating || payrun.status !== 'computed' || blocking.length > 0}
            className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg)] disabled:opacity-50 whitespace-nowrap font-semibold text-[12px] flex items-center gap-2 rounded px-[16px] py-2 transition-colors"
          >
            <ClipboardCheck className="h-[16px] w-[16px]" /> Validate
          </button>
          <button
            onClick={() => markPaidMut.mutate()}
            disabled={anyMutating || payrun.status !== 'validated'}
            className="bg-[var(--primary)] text-[var(--surface)] hover:bg-[var(--primary-hover)] disabled:opacity-50 whitespace-nowrap font-semibold text-[12px] flex items-center gap-2 rounded px-[16px] py-2 transition-colors"
          >
            <BadgeCheck className="h-[16px] w-[16px]" /> Mark Paid
          </button>
          <button
            onClick={() => sendMut.mutate()}
            disabled={anyMutating || payrun.status === 'draft'}
            className="bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg)] disabled:opacity-50 whitespace-nowrap font-semibold text-[12px] flex items-center gap-2 rounded px-[16px] py-2 transition-colors"
          >
            <Mail className="h-[16px] w-[16px]" /> {sendMut.isPending ? 'Sending…' : 'Send Payslips'}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <LifecycleStepper status={payrun.status} />
      </div>
      </div>

      {sendResult && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-[16px] text-[13px] text-[var(--text)] shadow-sm shrink-0">
          Payslip emails processed —{' '}
          {sendResult.sent > 0 && <span className="font-medium text-[var(--success)]">{sendResult.sent} sent</span>}
          {sendResult.sent > 0 && sendResult.queued > 0 && ', '}
          {sendResult.queued > 0 && (
            <span className="font-medium text-[var(--warning)]">{sendResult.queued} queued (no email provider configured)</span>
          )}
          {sendResult.failed > 0 && <span className="font-medium text-[var(--danger)]">, {sendResult.failed} failed</span>}
        </div>
      )}

      {/* Scrollable Content Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-[16px] h-full">

          {/* Left Column: Payrun Health */}
          <div className="md:col-span-3 flex flex-col gap-[16px]">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] p-[16px] h-full flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-[16px] pb-2 border-b border-[var(--border)]">
                <h2 className="font-semibold text-[16px] text-[var(--text)]">Payrun Health</h2>
                {warnings.length > 0 && (
                  <span className="bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-[var(--danger)] font-medium text-[11px] px-2 py-0.5 rounded">{warnings.length} Issues</span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto pr-1">
                {warnings.length === 0 ? (
                  <div className="text-[13px] text-[var(--text-muted)] text-center mt-[32px]">No warnings. Payrun looks good!</div>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {blocking.map((w) => (
                      <li key={w.id} className="p-3 border border-[color-mix(in_srgb,var(--danger)_20%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] rounded flex items-start gap-3">
                        <AlertCircle className="h-[20px] w-[20px] mt-0.5 shrink-0 text-[var(--danger)]" fill="color-mix(in_srgb,var(--danger)_20%,transparent)" />
                        <div>
                          <div className="font-semibold text-[12px] text-[var(--danger)]">{WARNING_SHORT_LABEL[w.warning_type] || w.warning_type}</div>
                          <div className="font-medium text-[13px] text-[var(--text)] mt-1">{w.message}</div>
                          <div className="font-medium text-[11px] text-[var(--text-muted)] mt-1">Blocks validation</div>
                        </div>
                      </li>
                    ))}
                    {advisory.map((w) => (
                      <li key={w.id} className="p-3 border border-[color-mix(in_srgb,var(--warning)_20%,transparent)] bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] rounded flex items-start gap-3">
                        <AlertTriangle className="h-[20px] w-[20px] mt-0.5 shrink-0 text-[var(--warning)]" fill="color-mix(in_srgb,var(--warning)_20%,transparent)" />
                        <div>
                          <div className="font-semibold text-[12px] text-[var(--warning)]">{WARNING_SHORT_LABEL[w.warning_type] || w.warning_type}</div>
                          <div className="font-medium text-[13px] text-[var(--text)] mt-1">{w.message}</div>
                          <div className="font-medium text-[11px] text-[var(--text-muted)] mt-1">Advisory</div>
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
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] flex-1 flex flex-col overflow-hidden shadow-sm">
              <div className="p-3 border-b border-[var(--border)] flex justify-between items-center bg-[color-mix(in_srgb,var(--warning)_8%,transparent)]">
                <div className="font-semibold text-[14px] text-[var(--text)]">Payslips ({payslips?.length ?? 0})</div>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr>
                      <th className="bg-[var(--bg)] border-b border-[var(--border)] font-semibold text-[12px] text-[var(--text-muted)] p-3 whitespace-nowrap">Employee</th>
                      <th className="bg-[var(--bg)] border-b border-[var(--border)] font-semibold text-[12px] text-[var(--text-muted)] p-3 whitespace-nowrap">Warning</th>
                      <th className="bg-[var(--bg)] border-b border-[var(--border)] font-semibold text-[12px] text-[var(--text-muted)] p-3 text-right whitespace-nowrap">Worked Days</th>
                      <th className="bg-[var(--bg)] border-b border-[var(--border)] font-semibold text-[12px] text-[var(--text-muted)] p-3 text-right whitespace-nowrap">Net Pay</th>
                      <th className="bg-[var(--bg)] border-b border-[var(--border)] font-semibold text-[12px] text-[var(--text-muted)] p-3 whitespace-nowrap">Status</th>
                      <th className="bg-[var(--bg)] border-b border-[var(--border)] p-3"></th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] text-[var(--text)]">
                    {(payslips ?? []).map((p) => {
                      const warning = warningsByPayslip.get(p.id);
                      return (
                        <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors cursor-pointer" onClick={() => navigate(`/payroll/payslips/${p.id}`)}>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="w-[32px] h-[32px] rounded-full bg-[var(--primary)] text-[var(--surface)] font-semibold flex items-center justify-center shrink-0 text-[13px]">
                                {p.first_name?.charAt(0)}{p.last_name?.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{p.first_name} {p.last_name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            {warning ? (
                              <span className={cn('text-[12px] font-semibold', warning.severity === 'danger' ? 'text-[var(--danger)]' : 'text-[var(--warning)]')}>
                                {WARNING_SHORT_LABEL[warning.type] ?? warning.type}
                              </span>
                            ) : (
                              <span className="text-[var(--text-muted)]">—</span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono">{p.worked_days ?? '—'}</td>
                          <td className="p-3 text-right font-semibold">
                            {p.net != null ? `₹${Number(p.net).toLocaleString()}` : <span className="text-[var(--text-muted)] font-normal">Not computed</span>}
                          </td>
                          <td className="p-3">
                            <StatusBadge status={p.status} domain="payslip" />
                          </td>
                          <td className="p-3 text-right">
                            <button className="text-[var(--primary)] hover:underline font-semibold text-[12px]">Review</button>
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
