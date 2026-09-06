import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, AlertTriangle } from 'lucide-react';
import { listPayslips } from '../api/payroll.api';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { Card, CardContent } from '../components/ui/card';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/table';
import { Input, Label } from '../components/ui/input';
import { TableSkeleton } from '../components/ui/skeleton';

export function PayslipList() {
  const navigate = useNavigate();
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [search, setSearch] = useState('');

  const { data: payslips, isLoading } = useQuery({
    queryKey: ['payslips', 'all', periodStart, periodEnd],
    queryFn: () => listPayslips({ period_start: periodStart || undefined, period_end: periodEnd || undefined }),
  });

  const filtered = payslips?.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${p.first_name} ${p.last_name} ${p.employee_code} ${p.payrun_name}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-24">
      <div className="flex flex-wrap items-end justify-between gap-16">
        <div>
          <h1 className="text-2xl font-bold text-text">Payslips</h1>
          <p className="text-sm text-text-muted">Every payslip across every payrun — search or filter by period, then open one for the full breakdown.</p>
        </div>
        <div className="flex flex-wrap items-end gap-12">
          <div className="space-y-4">
            <Label>Search</Label>
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Employee, code, payrun…" className="w-[220px]" />
          </div>
          <div className="space-y-4">
            <Label>Period Start</Label>
            <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-[150px]" />
          </div>
          <div className="space-y-4">
            <Label>Period End</Label>
            <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="w-[150px]" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <Card><CardContent className="pt-16"><TableSkeleton rows={6} cols={7} /></CardContent></Card>
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No payslips found" description="Try a different search term or period range, or run payroll to generate some." />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Employee</Th>
              <Th>Warning</Th>
              <Th>Period</Th>
              <Th className="text-right">Basic</Th>
              <Th className="text-right">Gross</Th>
              <Th className="text-right">Net</Th>
              <Th>Structure</Th>
              <Th>Status</Th>
            </tr>
          </Thead>
          <Tbody>
            {filtered.map((p) => (
              <Tr key={p.id} className="cursor-pointer" onClick={() => navigate(`/payroll/payslips/${p.id}`)}>
                <Td className="font-medium">
                  {p.first_name} {p.last_name} <span className="font-mono text-xs text-text-muted">({p.employee_code})</span>
                </Td>
                <Td>
                  {p.warning_count ? (
                    <span className="flex items-center gap-4 text-xs font-semibold text-danger">
                      <AlertTriangle className="h-[14px] w-[14px]" /> {p.warning_count}
                    </span>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </Td>
                <Td className="text-text-muted">{p.period_start} → {p.period_end}</Td>
                <Td className="text-right font-mono">{p.basic != null ? `₹${Number(p.basic).toLocaleString()}` : '—'}</Td>
                <Td className="text-right font-mono">{p.gross != null ? `₹${Number(p.gross).toLocaleString()}` : '—'}</Td>
                <Td className="text-right font-mono font-semibold">{p.net != null ? `₹${Number(p.net).toLocaleString()}` : '—'}</Td>
                <Td className="text-text-muted">{p.structure_name || '—'}</Td>
                <Td><StatusBadge status={p.status} domain="payslip" /></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
