import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, LogIn, Filter } from 'lucide-react';
import { listAttendances, checkInOut, correctAttendance } from '../api/attendances.api';
import { listEmployees } from '../api/employees.api';
import { useAuthStore, HR_ROLES } from '../store/auth.store';
import { StatusBadge } from '../components/StatusBadge';
import { TableSkeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

export function AttendanceList() {
  const { user } = useAuthStore();
  const isHr = !!user && HR_ROLES.includes(user.role);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => listEmployees(), enabled: isHr });
  const { data: attendances, isLoading } = useQuery({
    queryKey: ['attendances', employeeFilter],
    queryFn: () => listAttendances(employeeFilter ? { employee_id: employeeFilter } : undefined),
  });

  const checkMutation = useMutation({
    mutationFn: () => checkInOut(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendances'] }),
  });

  const correctMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => correctAttendance(id, { status: status as never }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendances'] }),
  });

  const myOpenEntry = attendances?.find((a) => a.employee_id === user?.employee_id && !a.check_out);

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-[16px] md:px-[24px] py-[24px] flex flex-col gap-[24px]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-[var(--text)] tracking-tight mb-[4px]">Attendance</h1>
          <p className="text-[13px] text-[var(--text-muted)]">Check-in/out widget, exception review, and manual corrections.</p>
        </div>
        {isHr && (
          <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} className="w-[220px] h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:outline-none">
            <option value="">All Employees</option>
            {employees?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.first_name} {e.last_name}
              </option>
            ))}
          </select>
        )}
      </div>

      {!isHr && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] shadow-sm overflow-hidden">
          <div className="p-[24px] flex items-center justify-between">
            <div className="flex items-center gap-[12px]">
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[var(--primary-light)]">
                <Clock className="h-[20px] w-[20px] text-[var(--primary)]" />
              </div>
              <div className="flex flex-col gap-[2px]">
                <div className="text-[14px] font-semibold text-[var(--text)]">{myOpenEntry ? 'You are checked in' : 'Not checked in today'}</div>
                <div className="text-[12px] text-[var(--text-muted)]">
                  {myOpenEntry ? `Since ${new Date(myOpenEntry.check_in).toLocaleTimeString()}` : 'Tap to check in'}
                </div>
              </div>
            </div>
            <button 
              onClick={() => checkMutation.mutate()} 
              disabled={checkMutation.isPending} 
              className={cn("font-semibold text-[13px] px-[16px] py-[8px] rounded transition-colors flex items-center gap-[6px]", myOpenEntry ? "border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)] bg-[var(--surface)]" : "bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--surface)]")}
            >
              <LogIn className="h-[16px] w-[16px]" />
              {myOpenEntry ? 'Check Out' : 'Check In'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] overflow-hidden flex flex-col shadow-sm">
        <div className="bg-[var(--surface)] px-[16px] py-[12px] border-b border-[var(--border)] flex justify-between items-center">
          <h2 className="text-[14px] font-semibold text-[var(--text)]">Daily Attendance Log</h2>
          <div className="flex gap-[8px]">
            <button className="border border-[var(--border)] text-[var(--text)] font-semibold text-[12px] px-[12px] py-[6px] rounded-[4px] hover:bg-[var(--bg)] transition-colors flex items-center gap-[4px] bg-[var(--surface)]">
              <Filter className="h-[14px] w-[14px]" /> Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <TableSkeleton rows={6} cols={5} />
          ) : !attendances || attendances.length === 0 ? (
            <div className="py-[48px] flex flex-col items-center justify-center text-[var(--text-muted)]">
              <Clock className="h-[32px] w-[32px] mb-[16px] opacity-50" />
              <p className="text-[14px] font-medium">No attendance records</p>
              <p className="text-[12px] mt-[4px]">Check-ins will appear here as employees clock in and out.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-[var(--bg)] border-b border-[var(--border)]">
                <tr>
                  {isHr && <th className="font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider py-[8px] px-[12px]">Employee</th>}
                  <th className="font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider py-[8px] px-[12px]">Check In</th>
                  <th className="font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider py-[8px] px-[12px]">Check Out</th>
                  <th className="font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider py-[8px] px-[12px]">Worked Hours</th>
                  <th className="font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider py-[8px] px-[12px]">Status</th>
                  {isHr && <th className="font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider py-[8px] px-[12px]">Correction</th>}
                </tr>
              </thead>
              <tbody className="text-[13px] font-medium text-[var(--text)]">
                {attendances.map((a) => (
                  <tr key={a.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors">
                    {isHr && (
                      <td className="py-[12px] px-[12px] font-semibold">
                        {a.first_name} {a.last_name}
                      </td>
                    )}
                    <td className="py-[12px] px-[12px] text-[var(--text-muted)]">{new Date(a.check_in).toLocaleString()}</td>
                    <td className="py-[12px] px-[12px] text-[var(--text-muted)]">{a.check_out ? new Date(a.check_out).toLocaleString() : '—'}</td>
                    <td className="py-[12px] px-[12px] font-mono text-[var(--text-muted)]">{a.worked_hours ?? '—'}</td>
                    <td className="py-[12px] px-[12px]">
                      <StatusBadge status={a.status} domain="attendance" />
                      {a.is_manual_correction && <span className="ml-[8px] text-[11px] text-[var(--text-muted)]">(corrected)</span>}
                    </td>
                    {isHr && (
                      <td className="py-[12px] px-[12px]">
                        <select
                          className="h-[28px] w-[120px] text-[12px] px-[8px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:outline-none"
                          value={a.status}
                          onChange={(e) => correctMutation.mutate({ id: a.id, status: e.target.value })}
                        >
                          <option value="present">Present</option>
                          <option value="late">Late</option>
                          <option value="absent">Absent</option>
                          <option value="overtime">Overtime</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
