import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FileText, Clock, CalendarClock, Wallet, Pencil } from 'lucide-react';
import {
  getEmployee,
  listEmployeeContracts,
  listEmployeeAttendances,
  listEmployeeTimeOffRequests,
  listEmployeeAllocations,
} from '../api/employees.api';
import { StatusBadge } from '../components/StatusBadge';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar } from '../components/Avatar';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/table';
import { CardSkeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

type Tab = 'contracts' | 'attendance' | 'timeoff' | 'allocations';

export function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('contracts');

  const { data: employee, isLoading } = useQuery({ queryKey: ['employee', id], queryFn: () => getEmployee(id!), enabled: !!id });
  const { data: contracts } = useQuery({ queryKey: ['employee-contracts', id], queryFn: () => listEmployeeContracts(id!), enabled: !!id });
  const { data: attendances } = useQuery({ queryKey: ['employee-attendances', id], queryFn: () => listEmployeeAttendances(id!), enabled: !!id });
  const { data: requests } = useQuery({ queryKey: ['employee-timeoff', id], queryFn: () => listEmployeeTimeOffRequests(id!), enabled: !!id });
  const { data: allocations } = useQuery({ queryKey: ['employee-allocations', id], queryFn: () => listEmployeeAllocations(id!), enabled: !!id });

  if (isLoading || !employee) return <CardSkeleton />;

  const smartButtons: { key: Tab; label: string; count: number; icon: typeof FileText }[] = [
    { key: 'contracts', label: 'Contracts', count: contracts?.length ?? 0, icon: FileText },
    { key: 'attendance', label: 'Attendance', count: attendances?.length ?? 0, icon: Clock },
    { key: 'timeoff', label: 'Time Off', count: requests?.length ?? 0, icon: CalendarClock },
    { key: 'allocations', label: 'Allocations', count: allocations?.length ?? 0, icon: Wallet },
  ];

  return (
    <div className="space-y-24">
      <button onClick={() => navigate('/employees')} className="flex items-center gap-4 text-sm text-text-muted hover:text-text">
        <ArrowLeft className="h-[14px] w-[14px]" /> Back to Employees
      </button>

      <Card>
        <CardContent className="flex items-center justify-between pt-24">
          <div className="flex items-center gap-16">
            <Avatar seed={(employee as Record<string, unknown>).department_name as string || employee.employee_code} size="lg" />
            <div>
              <div className="text-xl font-bold text-text">
                {employee.first_name} {employee.last_name}
              </div>
              <div className="font-mono text-xs text-text-muted">{employee.employee_code}</div>
              <div className="mt-4 flex gap-16 text-sm text-text-muted">
                <span>{(employee as Record<string, unknown>).department_name as string || 'No department'}</span>
                <span>{employee.job_position || 'No position'}</span>
                <span>{(employee as Record<string, unknown>).schedule_name as string || 'No schedule'}</span>
                {(employee as Record<string, unknown>).manager_first_name ? (
                  <span>
                    Reports to {(employee as Record<string, unknown>).manager_first_name as string}{' '}
                    {(employee as Record<string, unknown>).manager_last_name as string}
                  </span>
                ) : (
                  <span>No manager</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <StatusBadge status={employee.status} domain="employee" />
            <Button size="sm" variant="secondary" onClick={() => navigate(`/employees/${id}/edit`)}>
              <Pencil className="h-[14px] w-[14px]" /> Edit
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-16 sm:grid-cols-4">
        {smartButtons.map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              'rounded-lg border p-16 text-left transition-colors',
              tab === key ? 'border-primary bg-surface shadow-sm' : 'border-border bg-surface hover:bg-bg'
            )}
          >
            <Icon className={cn('h-16 w-16', tab === key ? 'text-primary' : 'text-text-muted')} />
            <div className="mt-8 font-mono text-xl font-bold text-text">{count}</div>
            <div className="text-xs text-text-muted">{label}</div>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-16">
          {tab === 'contracts' && (
            <Table>
              <Thead>
                <tr>
                  <Th>Position</Th>
                  <Th>Wage</Th>
                  <Th>Start</Th>
                  <Th>End</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {(contracts ?? []).map((c: Record<string, unknown>) => (
                  <Tr key={c.id as string}>
                    <Td>{(c.position as string) || '—'}</Td>
                    <Td className="font-mono">₹{Number(c.wage).toLocaleString()}</Td>
                    <Td>{c.date_start as string}</Td>
                    <Td>{(c.date_end as string) || 'Ongoing'}</Td>
                    <Td>
                      <StatusBadge status={c.status as string} domain="contract" />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {tab === 'attendance' && (
            <Table>
              <Thead>
                <tr>
                  <Th>Check In</Th>
                  <Th>Check Out</Th>
                  <Th>Worked Hours</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {(attendances ?? []).map((a: Record<string, unknown>) => (
                  <Tr key={a.id as string}>
                    <Td>{new Date(a.check_in as string).toLocaleString()}</Td>
                    <Td>{a.check_out ? new Date(a.check_out as string).toLocaleString() : '—'}</Td>
                    <Td className="font-mono">{(a.worked_hours as string) ?? '—'}</Td>
                    <Td>
                      <StatusBadge status={a.status as string} domain="attendance" />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {tab === 'timeoff' && (
            <Table>
              <Thead>
                <tr>
                  <Th>From</Th>
                  <Th>To</Th>
                  <Th>Duration</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {(requests ?? []).map((r: Record<string, unknown>) => (
                  <Tr key={r.id as string}>
                    <Td>{r.date_from as string}</Td>
                    <Td>{r.date_to as string}</Td>
                    <Td>{r.duration as string}</Td>
                    <Td>
                      <StatusBadge status={r.status as string} domain="timeOffRequest" />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {tab === 'allocations' && (
            <Table>
              <Thead>
                <tr>
                  <Th>Allocated</Th>
                  <Th>Taken</Th>
                  <Th>Remaining</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {(allocations ?? []).map((a: Record<string, unknown>) => (
                  <Tr key={a.id as string}>
                    <Td className="font-mono">{a.allocated as string}</Td>
                    <Td className="font-mono">{a.taken as string}</Td>
                    <Td className="font-mono font-semibold">{a.remaining as string}</Td>
                    <Td>
                      <StatusBadge status={a.status as string} domain="timeOffAllocation" />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
