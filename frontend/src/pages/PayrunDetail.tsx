import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle, Mail, Calculator, CheckCircle, DollarSign } from 'lucide-react';
import { getPayrun, listPayslips, computePayrun, validatePayrun, markPayrunPaid, sendPayslips } from '../api/payroll.api';
import { StatusBadge } from '../components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/table';
import { CardSkeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

const WARNING_SEVERITY: Record<string, 'danger' | 'warning'> = {
  contract_missing: 'danger',
  missing_bank_details: 'warning',
  duplicate_payslip: 'danger',
  negative_net: 'warning',
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

  const computeMut = useMutation({ mutationFn: () => computePayrun(id!), onSuccess: invalidate });
  const validateMut = useMutation({ mutationFn: () => validatePayrun(id!), onSuccess: invalidate });
  const markPaidMut = useMutation({ mutationFn: () => markPayrunPaid(id!), onSuccess: invalidate });
  const sendMut = useMutation({ mutationFn: () => sendPayslips(id!), onSuccess: invalidate });

  if (isLoading || !payrun) return <CardSkeleton />;

  const warnings = payrun.warnings ?? [];
  const blocking = warnings.filter((w) => WARNING_SEVERITY[w.warning_type] === 'danger' && !w.resolved);
  const advisory = warnings.filter((w) => WARNING_SEVERITY[w.warning_type] !== 'danger' && !w.resolved);

  const anyMutating = computeMut.isPending || validateMut.isPending || markPaidMut.isPending || sendMut.isPending;

  return (
    <div className="space-y-24">
      <button onClick={() => navigate('/payroll')} className="flex items-center gap-4 text-sm text-text-muted hover:text-text">
        <ArrowLeft className="h-[14px] w-[14px]" /> Back to Payroll
      </button>

      <Card>
        <CardContent className="flex items-center justify-between pt-24">
          <div>
            <div className="text-xl font-bold text-text">{payrun.name}</div>
            <div className="mt-4 text-sm text-text-muted">{payrun.period_start} → {payrun.period_end}</div>
          </div>
          <StatusBadge status={payrun.status} domain="payrun" />
        </CardContent>
        <CardContent className="flex gap-8 border-t border-border pt-16">
          <Button onClick={() => computeMut.mutate()} disabled={anyMutating || payrun.status === 'paid'} variant="secondary">
            <Calculator className="h-16 w-16" /> Compute
          </Button>
          <Button
            onClick={() => validateMut.mutate()}
            disabled={anyMutating || payrun.status !== 'computed' || blocking.length > 0}
            variant="secondary"
          >
            <CheckCircle className="h-16 w-16" /> Validate
          </Button>
          <Button onClick={() => markPaidMut.mutate()} disabled={anyMutating || payrun.status !== 'validated'} variant="secondary">
            <DollarSign className="h-16 w-16" /> Mark Paid
          </Button>
          <Button onClick={() => sendMut.mutate()} disabled={anyMutating || payrun.status === 'draft'} variant="secondary">
            <Mail className="h-16 w-16" /> Send Payslips
          </Button>
        </CardContent>
      </Card>

      {/* Payroll Preflight / Health Center — surfaces warnings before finalization (PS §B6) */}
      {warnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-8">
              <AlertTriangle className="h-16 w-16 text-warning" /> Payroll Preflight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {blocking.map((w) => (
              <div key={w.id} className="flex items-center gap-8 rounded-md bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] px-12 py-8 text-sm">
                <span className="text-danger">●</span>
                <span className="text-text">{w.message}</span>
                <span className="ml-auto text-xs text-text-muted">blocks validation</span>
              </div>
            ))}
            {advisory.map((w) => (
              <div key={w.id} className="flex items-center gap-8 rounded-md bg-[color-mix(in_srgb,var(--warning)_8%,transparent)] px-12 py-8 text-sm">
                <span className="text-warning">●</span>
                <span className="text-text">{w.message}</span>
                <span className="ml-auto text-xs text-text-muted">advisory</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Payslips ({payslips?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <Thead>
              <tr>
                <Th>Employee</Th>
                <Th>Worked Days</Th>
                <Th>Net</Th>
                <Th>Status</Th>
                <Th></Th>
              </tr>
            </Thead>
            <Tbody>
              {(payslips ?? []).map((p) => (
                <Tr key={p.id} className="cursor-pointer" onClick={() => navigate(`/payroll/payslips/${p.id}`)}>
                  <Td className="font-medium">{p.first_name} {p.last_name}</Td>
                  <Td className="font-mono">{p.worked_days ?? '—'}</Td>
                  <Td className={cn('font-mono font-semibold', p.net == null && 'text-text-muted')}>
                    {p.net != null ? `₹${Number(p.net).toLocaleString()}` : 'Not computed'}
                  </Td>
                  <Td><StatusBadge status={p.status} domain="payslip" /></Td>
                  <Td><Button size="sm" variant="ghost">View →</Button></Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
