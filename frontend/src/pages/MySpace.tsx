import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Clock, CalendarClock, Wallet, LogIn } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { getEmployee, listEmployeeAttendances, listEmployeeAllocations } from '../api/employees.api';
import { listPayslips } from '../api/payroll.api';
import { checkInOut } from '../api/attendances.api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { StatusBadge } from '../components/StatusBadge';
import { CardSkeleton } from '../components/ui/skeleton';

/**
 * Self-service home for the `employee` role (PS §3: "View own employee details, attendance
 * records, and leave balances; create attendance entries and Time Off Requests, with no
 * payroll or HR administration access"). This is deliberately a different shape from the HR
 * Employee List — the point of RBAC is that it changes what you see, not just what buttons work.
 */
export function MySpace() {
  const { user } = useAuthStore();
  const employeeId = user?.employee_id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: employee, isLoading } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => getEmployee(employeeId!),
    enabled: !!employeeId,
  });
  const { data: attendances } = useQuery({
    queryKey: ['employee-attendances', employeeId],
    queryFn: () => listEmployeeAttendances(employeeId!),
    enabled: !!employeeId,
  });
  const { data: allocations } = useQuery({
    queryKey: ['employee-allocations', employeeId],
    queryFn: () => listEmployeeAllocations(employeeId!),
    enabled: !!employeeId,
  });
  const { data: payslips } = useQuery({
    queryKey: ['payslips', employeeId],
    queryFn: () => listPayslips({ employee_id: employeeId! }),
    enabled: !!employeeId,
  });

  const checkMutation = useMutation({
    mutationFn: () => checkInOut(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employee-attendances', employeeId] }),
  });

  if (!employeeId) {
    return (
      <Card>
        <CardContent className="pt-24 text-sm text-text-muted">
          Your account isn't linked to an employee record yet — ask HR to link it.
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !employee) return <CardSkeleton />;

  const openEntry = attendances?.find((a: Record<string, unknown>) => !a.check_out);
  const totalRemaining = (allocations ?? []).reduce((sum: number, a: Record<string, unknown>) => sum + Number(a.remaining || 0), 0);
  const latestPayslip = payslips?.[0];

  return (
    <div className="space-y-24">
      <div>
        <h1 className="text-2xl font-bold text-text">Good to see you, {employee.first_name}</h1>
        <p className="text-sm text-text-muted">{employee.job_position || 'Employee'} · {(employee as Record<string, unknown>).department_name as string || 'No department'}</p>
      </div>

      <div className="grid grid-cols-1 gap-16 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-16">
            <div className="flex items-center gap-8 text-xs font-medium uppercase tracking-wide text-text-muted">
              <Clock className="h-14 w-14" /> Today
            </div>
            <div className="mt-8 text-lg font-semibold text-text">{openEntry ? 'Checked In' : 'Not checked in'}</div>
            <Button size="sm" className="mt-12 w-full" variant={openEntry ? 'secondary' : 'primary'} onClick={() => checkMutation.mutate()}>
              <LogIn className="h-14 w-14" /> {openEntry ? 'Check Out' : 'Check In'}
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer" onClick={() => navigate('/time-off')}>
          <CardContent className="pt-16">
            <div className="flex items-center gap-8 text-xs font-medium uppercase tracking-wide text-text-muted">
              <CalendarClock className="h-14 w-14" /> Leave Balance
            </div>
            <div className="mt-8 font-mono text-2xl font-bold text-text">{totalRemaining}</div>
            <div className="text-xs text-text-muted">days remaining across all types</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-16">
            <div className="flex items-center gap-8 text-xs font-medium uppercase tracking-wide text-text-muted">
              <Wallet className="h-14 w-14" /> Latest Payslip
            </div>
            {latestPayslip ? (
              <>
                <div className="mt-8 font-mono text-2xl font-bold text-text">
                  {latestPayslip.net != null ? `₹${Number(latestPayslip.net).toLocaleString()}` : '—'}
                </div>
                <div className="text-xs text-text-muted">{latestPayslip.period_start} → {latestPayslip.period_end}</div>
              </>
            ) : (
              <div className="mt-8 text-sm text-text-muted">No payslips yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-24 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Attendance</CardTitle></CardHeader>
          <CardContent className="space-y-8">
            {(attendances ?? []).slice(0, 5).map((a: Record<string, unknown>) => (
              <div key={a.id as string} className="flex items-center justify-between border-b border-border pb-8 text-sm last:border-0">
                <span className="text-text-muted">{new Date(a.check_in as string).toLocaleDateString()}</span>
                <StatusBadge status={a.status as string} domain="attendance" />
              </div>
            ))}
            {(!attendances || attendances.length === 0) && <div className="text-sm text-text-muted">No attendance records yet.</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>My Payslips</CardTitle></CardHeader>
          <CardContent className="space-y-8">
            {(payslips ?? []).slice(0, 5).map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/payroll/payslips/${p.id}`)}
                className="flex w-full items-center justify-between border-b border-border pb-8 text-sm last:border-0 hover:text-primary"
              >
                <span>{p.period_start} → {p.period_end}</span>
                <span className="font-mono font-semibold">{p.net != null ? `₹${Number(p.net).toLocaleString()}` : 'Pending'}</span>
              </button>
            ))}
            {(!payslips || payslips.length === 0) && <div className="text-sm text-text-muted">No payslips yet.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
