import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Clock, CalendarClock, Wallet, LogIn, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { getEmployee, listEmployeeAttendances, listEmployeeAllocations } from '../api/employees.api';
import { listPayslips } from '../api/payroll.api';
import { checkInOut } from '../api/attendances.api';
import { StatusBadge } from '../components/StatusBadge';
import { CardSkeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

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
      <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] shadow-sm p-[24px]">
        <div className="text-[14px] text-[#434654]">
          Your account isn't linked to an employee record yet — ask HR to link it.
        </div>
      </div>
    );
  }

  if (isLoading || !employee) return <CardSkeleton />;

  const openEntry = attendances?.find((a: Record<string, unknown>) => !a.check_out);
  const totalRemaining = (allocations ?? []).reduce((sum: number, a: Record<string, unknown>) => sum + Number(a.remaining || 0), 0);
  const latestPayslip = payslips?.[0];

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-[16px] md:px-[24px] py-[24px] flex flex-col gap-[24px]">
      <div>
        <h1 className="text-[28px] font-bold text-[#172b4d] tracking-tight mb-[4px]">Good to see you, {employee.first_name}</h1>
        <p className="text-[13px] text-[#434654]">{employee.job_position || 'Employee'} · {(employee as Record<string, unknown>).department_name as string || 'No department'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px]">
        {/* Today Card */}
        <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] shadow-sm p-[24px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-[8px] text-[11px] font-bold uppercase tracking-widest text-[#434654] mb-[12px]">
              <Clock className="h-[14px] w-[14px]" /> Today
            </div>
            <div className="text-[20px] font-bold text-[#172b4d]">{openEntry ? 'Checked In' : 'Not checked in'}</div>
          </div>
          <button 
            className={cn("w-full mt-[16px] font-semibold text-[13px] px-[16px] py-[8px] rounded transition-colors flex items-center justify-center gap-[6px]", openEntry ? "bg-[#e6f0ff] hover:bg-[#c2d7f8] text-[#3062e1]" : "bg-[#3062e1] hover:bg-[#2552cc] text-[#ffffff]")}
            onClick={() => checkMutation.mutate()}
          >
            <LogIn className="h-[14px] w-[14px]" /> {openEntry ? 'Check Out' : 'Check In'}
          </button>
        </div>

        {/* Leave Balance Card */}
        <div 
          className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] shadow-sm p-[24px] flex flex-col justify-between cursor-pointer hover:border-[#3062e1] hover:shadow-md transition-all group"
          onClick={() => navigate('/time-off')}
        >
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-[#434654] mb-[12px]">
              <div className="flex items-center gap-[8px]"><CalendarClock className="h-[14px] w-[14px]" /> Leave Balance</div>
              <ChevronRight className="h-[14px] w-[14px] text-[#434654] group-hover:text-[#3062e1] transition-colors" />
            </div>
            <div className="font-mono text-[32px] font-bold text-[#172b4d] leading-none mb-[4px]">{totalRemaining}</div>
            <div className="text-[12px] text-[#434654]">days remaining across all types</div>
          </div>
        </div>

        {/* Latest Payslip Card */}
        <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] shadow-sm p-[24px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-[8px] text-[11px] font-bold uppercase tracking-widest text-[#434654] mb-[12px]">
              <Wallet className="h-[14px] w-[14px]" /> Latest Payslip
            </div>
            {latestPayslip ? (
              <>
                <div className="font-mono text-[28px] font-bold text-[#172b4d] leading-none mb-[8px]">
                  {latestPayslip.net != null ? `₹${Number(latestPayslip.net).toLocaleString()}` : '—'}
                </div>
                <div className="text-[12px] text-[#434654]">{latestPayslip.period_start} → {latestPayslip.period_end}</div>
              </>
            ) : (
              <div className="text-[14px] text-[#434654]">No payslips yet</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[24px]">
        {/* Recent Attendance */}
        <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] shadow-sm overflow-hidden flex flex-col">
          <div className="px-[24px] py-[16px] border-b border-[#ebecf0] bg-[#ffffff]">
            <h2 className="text-[16px] font-semibold text-[#172b4d]">Recent Attendance</h2>
          </div>
          <div className="p-[24px] flex flex-col gap-[12px]">
            {(attendances ?? []).slice(0, 5).map((a: Record<string, unknown>) => (
              <div key={a.id as string} className="flex items-center justify-between border-b border-[#ebecf0] pb-[12px] last:border-0 last:pb-0">
                <span className="text-[13px] text-[#434654]">{new Date(a.check_in as string).toLocaleDateString()}</span>
                <StatusBadge status={a.status as string} domain="attendance" />
              </div>
            ))}
            {(!attendances || attendances.length === 0) && <div className="text-[13px] text-[#434654]">No attendance records yet.</div>}
          </div>
        </div>

        {/* My Payslips */}
        <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] shadow-sm overflow-hidden flex flex-col">
          <div className="px-[24px] py-[16px] border-b border-[#ebecf0] bg-[#ffffff]">
            <h2 className="text-[16px] font-semibold text-[#172b4d]">My Payslips</h2>
          </div>
          <div className="p-[24px] flex flex-col gap-[12px]">
            {(payslips ?? []).slice(0, 5).map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/payroll/payslips/${p.id}`)}
                className="flex w-full items-center justify-between border-b border-[#ebecf0] pb-[12px] last:border-0 last:pb-0 text-[13px] hover:text-[#3062e1] group"
              >
                <span className="text-[#434654] group-hover:text-[#3062e1] transition-colors">{p.period_start} → {p.period_end}</span>
                <span className="font-mono font-semibold text-[#172b4d] group-hover:text-[#3062e1] transition-colors">{p.net != null ? `₹${Number(p.net).toLocaleString()}` : 'Pending'}</span>
              </button>
            ))}
            {(!payslips || payslips.length === 0) && <div className="text-[13px] text-[#434654]">No payslips yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
