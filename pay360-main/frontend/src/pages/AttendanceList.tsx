import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, LogIn } from 'lucide-react';
import { listAttendances, checkInOut, correctAttendance } from '../api/attendances.api';
import { listEmployees } from '../api/employees.api';
import { useAuthStore, HR_ROLES } from '../store/auth.store';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/ui/skeleton';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Select } from '../components/ui/input';

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
    <div className="space-y-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Attendance</h1>
          <p className="text-sm text-text-muted">Check-in/out widget, exception review, and manual corrections.</p>
        </div>
        {isHr && (
          <Select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} className="w-[220px]">
            <option value="">All Employees</option>
            {employees?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.first_name} {e.last_name}
              </option>
            ))}
          </Select>
        )}
      </div>

      {!isHr && (
        <Card>
          <CardContent className="flex items-center justify-between pt-16">
            <div className="flex items-center gap-12">
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]">
                <Clock className="h-[20px] w-[20px] text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-text">{myOpenEntry ? 'You are checked in' : 'Not checked in today'}</div>
                <div className="text-xs text-text-muted">
                  {myOpenEntry ? `Since ${new Date(myOpenEntry.check_in).toLocaleTimeString()}` : 'Tap to check in'}
                </div>
              </div>
            </div>
            <Button onClick={() => checkMutation.mutate()} disabled={checkMutation.isPending} variant={myOpenEntry ? 'secondary' : 'primary'}>
              <LogIn className="h-16 w-16" />
              {myOpenEntry ? 'Check Out' : 'Check In'}
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : !attendances || attendances.length === 0 ? (
        <EmptyState icon={Clock} title="No attendance records" description="Check-ins will appear here as employees clock in and out." />
      ) : (
        <Table>
          <Thead>
            <tr>
              {isHr && <Th>Employee</Th>}
              <Th>Check In</Th>
              <Th>Check Out</Th>
              <Th>Worked Hours</Th>
              <Th>Status</Th>
              {isHr && <Th>Correction</Th>}
            </tr>
          </Thead>
          <Tbody>
            {attendances.map((a) => (
              <Tr key={a.id}>
                {isHr && (
                  <Td className="font-medium">
                    {a.first_name} {a.last_name}
                  </Td>
                )}
                <Td>{new Date(a.check_in).toLocaleString()}</Td>
                <Td>{a.check_out ? new Date(a.check_out).toLocaleString() : '—'}</Td>
                <Td className="font-mono">{a.worked_hours ?? '—'}</Td>
                <Td>
                  <StatusBadge status={a.status} domain="attendance" />
                  {a.is_manual_correction && <span className="ml-8 text-xs text-text-muted">(corrected)</span>}
                </Td>
                {isHr && (
                  <Td>
                    <Select
                      className="h-[32px] w-[140px] text-xs"
                      value={a.status}
                      onChange={(e) => correctMutation.mutate({ id: a.id, status: e.target.value })}
                    >
                      <option value="present">Present</option>
                      <option value="late">Late</option>
                      <option value="absent">Absent</option>
                      <option value="overtime">Overtime</option>
                    </Select>
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
