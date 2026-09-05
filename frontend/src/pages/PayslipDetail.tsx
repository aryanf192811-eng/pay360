import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Printer } from 'lucide-react';
import { getPayslip, fetchPayslipPdfObjectUrl } from '../api/payroll.api';
import { useAuthStore, PAYROLL_ROLES } from '../store/auth.store';
import { StatusBadge } from '../components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CardSkeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

const CATEGORY_LABEL: Record<string, string> = {
  basic: 'Basic',
  allowance: 'Allowance',
  gross: 'Gross',
  deduction: 'Deduction',
  net: 'Net',
};

export function PayslipDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canOpenPayrun = !!user && PAYROLL_ROLES.includes(user.role);
  const { data: payslip, isLoading } = useQuery({ queryKey: ['payslip', id], queryFn: () => getPayslip(id!), enabled: !!id });
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  if (isLoading || !payslip) return <CardSkeleton />;

  const handlePrint = async () => {
    setPdfError(null);
    setPdfLoading(true);
    try {
      const url = await fetchPayslipPdfObjectUrl(payslip.id);
      window.open(url, '_blank', 'noreferrer');
    } catch {
      setPdfError('Failed to load the PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const lines = payslip.lines ?? [];
  const netLine = [...lines].reverse().find((l) => l.category === 'net');

  return (
    <div className="space-y-24">
      <button onClick={() => navigate(-1)} className="flex items-center gap-4 text-sm text-text-muted hover:text-text">
        <ArrowLeft className="h-[14px] w-[14px]" /> Back
      </button>

      <Card>
        <CardContent className="flex items-center justify-between pt-24">
          <div>
            <div className="text-xl font-bold text-text">{payslip.first_name} {payslip.last_name}</div>
            <div className="font-mono text-xs text-text-muted">{payslip.employee_code}</div>
            <div className="mt-4 text-sm text-text-muted">{payslip.period_start} → {payslip.period_end} · {payslip.worked_days ?? '—'} worked days</div>
            {/* PS §B7: Structure + Pay Run are required identification attributes, not just Employee/Period */}
            <div className="mt-8 flex gap-16 text-xs text-text-muted">
              <span>Structure: <span className="font-medium text-text">{payslip.structure_name || '—'}</span></span>
              {payslip.payrun_id && canOpenPayrun ? (
                <button onClick={() => navigate(`/payroll/payruns/${payslip.payrun_id}`)} className="hover:text-primary hover:underline">
                  Pay Run: <span className="font-medium text-text">{payslip.payrun_name || '—'}</span>
                </button>
              ) : (
                <span>Pay Run: <span className="font-medium text-text">{payslip.payrun_name || '—'}</span></span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-12">
              <StatusBadge status={payslip.status} domain="payslip" />
              <Button variant="secondary" size="sm" onClick={handlePrint} disabled={pdfLoading}>
                <Printer className="h-[14px] w-[14px]" /> {pdfLoading ? 'Loading…' : 'Print Payslip'}
              </Button>
            </div>
            {pdfError && <span className="text-xs text-danger">{pdfError}</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Salary Computation</CardTitle></CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <div className="py-32 text-center text-sm text-text-muted">This payslip hasn't been computed yet.</div>
          ) : (
            <div className="space-y-4">
              {/* Calculation Trace — every rule that fired, in the sequence it ran, showing the
                  real pipeline instead of just a final number. */}
              {lines.map((line, i) => (
                <div key={line.id} className="flex items-center justify-between border-b border-border py-12 last:border-0">
                  <div className="flex items-center gap-12">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-bg font-mono text-xs text-text-muted">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-text">{line.name}</div>
                      <div className="text-xs text-text-muted">
                        {CATEGORY_LABEL[line.category]} · code <span className="font-mono">{line.code}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'font-mono text-base font-semibold tabular-nums',
                      line.category === 'deduction' ? 'text-danger' : line.category === 'net' ? 'text-success' : 'text-text'
                    )}
                  >
                    {line.category === 'deduction' ? '−' : ''}₹{Math.abs(Number(line.amount)).toLocaleString()}
                  </div>
                </div>
              ))}

              {netLine && (
                <div className="mt-16 flex items-center justify-between rounded-md bg-bg px-16 py-16">
                  <div className="text-base font-semibold text-text">Net Pay</div>
                  <div className="font-mono text-2xl font-bold tabular-nums text-success">
                    ₹{Number(netLine.amount).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
