import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Clock, CalendarClock, Wallet, Pencil } from 'lucide-react';
import {
  getEmployee,
  listEmployeeContracts,
  listEmployeeAttendances,
  listEmployeeTimeOffRequests,
  listEmployeeAllocations,
} from '../api/employees.api';
import { StatusBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import { Card, CardContent } from '../components/ui/card';
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

  // Odoo-style "smart buttons": each is both a live count and a tab switch — the same real data
  // that used to sit in a separate, redundant "Quick Stats" grid.
  const smartButtons: { key: Tab; label: string; count: number; icon: typeof FileText }[] = [
    { key: 'contracts', label: 'Contracts', count: contracts?.length ?? 0, icon: FileText },
    { key: 'attendance', label: 'Attendance', count: attendances?.length ?? 0, icon: Clock },
    { key: 'timeoff', label: 'Time Off', count: requests?.length ?? 0, icon: CalendarClock },
    { key: 'allocations', label: 'Allocations', count: allocations?.length ?? 0, icon: Wallet },
  ];

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
      {/* Left Sidebar: Profile Card */}
      <aside className="md:col-span-3 flex flex-col gap-16">
        <Card>
          <CardContent className="flex flex-col items-center pt-24 text-center">
            <div className="mb-8 flex w-full justify-start">
              <button onClick={() => navigate('/employees')} className="flex items-center gap-4 text-sm font-medium text-text-muted hover:text-text">
                <ArrowLeft className="h-[14px] w-[14px]" /> Back
              </button>
            </div>
            <Avatar seed={employee.id} size="lg" className="mb-16 h-[96px] w-[96px] text-3xl" initials={`${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}`} />
            <h1 className="mb-4 text-lg font-semibold text-text">{employee.first_name} {employee.last_name}</h1>
            <p className="mb-16 text-sm font-medium text-primary">{employee.job_position || 'No position'}</p>
            <div className="mb-16"><StatusBadge status={employee.status} domain="employee" /></div>

            <div className="flex w-full flex-col gap-8 border-t border-border pt-16 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Department</span>
                <span className="text-sm text-text">{(employee as Record<string, unknown>).department_name as string || 'No department'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Manager</span>
                <span className="text-sm text-text">
                  {(employee as Record<string, unknown>).manager_first_name
                    ? `${(employee as Record<string, unknown>).manager_first_name} ${(employee as Record<string, unknown>).manager_last_name}`
                    : 'No manager'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-text-muted">Employee ID</span>
                <span className="font-mono text-sm text-text">{employee.employee_code}</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/employees/${id}/edit`)}
              className="mt-16 flex w-full items-center justify-center gap-4 rounded-md border border-border bg-surface px-16 py-8 text-xs font-semibold text-text transition-colors hover:bg-bg"
            >
              <Pencil className="h-[14px] w-[14px]" /> Edit Profile
            </button>
          </CardContent>
        </Card>
      </aside>

      {/* Right Main Area: Smart buttons + tab content */}
      <div className="md:col-span-9 flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-tinted min-h-[600px]">
        <div className="grid grid-cols-2 gap-8 border-b border-border p-16 sm:grid-cols-4">
          {smartButtons.map(({ key, label, count, icon: Icon }, i) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              onClick={() => setTab(key)}
              className={cn(
                'flex flex-col gap-4 rounded-md border px-16 py-12 text-left transition-colors',
                tab === key ? 'border-primary bg-primary-light' : 'border-border hover:bg-bg'
              )}
            >
              <div className="flex items-center gap-6 text-text-muted">
                <Icon className="h-[14px] w-[14px]" />
                <span className="text-xs font-medium uppercase tracking-wide">{label}</span>
              </div>
              <span className={cn('text-xl font-bold', tab === key ? 'text-primary' : 'text-text')}>{count}</span>
            </motion.button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-x-auto">
          {tab === 'contracts' && (
            <Table>
              <Thead>
                <tr>
                  <Th>Position</Th>
                  <Th className="text-right">Wage</Th>
                  <Th>Start Date</Th>
                  <Th>End Date</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {!contracts || contracts.length === 0 ? (
                  <tr><Td colSpan={5} className="py-32 text-center text-text-muted">No contracts found.</Td></tr>
                ) : (
                  contracts.map((c: Record<string, unknown>) => (
                    <Tr key={c.id as string}>
                      <Td className="font-medium">
                        <div className="flex items-center gap-4">
                          <FileText className="h-[14px] w-[14px] text-text-muted" />
                          {(c.position as string) || '—'}
                        </div>
                      </Td>
                      <Td className="text-right font-mono text-primary">₹{Number(c.wage).toLocaleString()}</Td>
                      <Td>{c.date_start as string}</Td>
                      <Td className="text-text-muted">{(c.date_end as string) || 'Ongoing'}</Td>
                      <Td><StatusBadge status={c.status as string} domain="contract" /></Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          )}

          {tab === 'attendance' && (
            <Table>
              <Thead>
                <tr>
                  <Th>Check In</Th>
                  <Th>Check Out</Th>
                  <Th className="text-right">Worked Hours</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {!attendances || attendances.length === 0 ? (
                  <tr><Td colSpan={4} className="py-32 text-center text-text-muted">No attendance records found.</Td></tr>
                ) : (
                  attendances.map((a: Record<string, unknown>) => (
                    <Tr key={a.id as string}>
                      <Td>
                        <div className="flex items-center gap-4">
                          <Clock className="h-[14px] w-[14px] text-text-muted" />
                          {new Date(a.check_in as string).toLocaleString()}
                        </div>
                      </Td>
                      <Td className="text-text-muted">{a.check_out ? new Date(a.check_out as string).toLocaleString() : '—'}</Td>
                      <Td className="text-right font-mono">{(a.worked_hours as string) ?? '—'}</Td>
                      <Td><StatusBadge status={a.status as string} domain="attendance" /></Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          )}

          {tab === 'timeoff' && (
            <Table>
              <Thead>
                <tr>
                  <Th>From Date</Th>
                  <Th>To Date</Th>
                  <Th className="text-right">Duration (Days)</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {!requests || requests.length === 0 ? (
                  <tr><Td colSpan={4} className="py-32 text-center text-text-muted">No time off requests found.</Td></tr>
                ) : (
                  requests.map((r: Record<string, unknown>) => (
                    <Tr key={r.id as string}>
                      <Td>
                        <div className="flex items-center gap-4">
                          <CalendarClock className="h-[14px] w-[14px] text-text-muted" />
                          {r.date_from as string}
                        </div>
                      </Td>
                      <Td className="text-text-muted">{r.date_to as string}</Td>
                      <Td className="text-right font-mono">{r.duration as string}</Td>
                      <Td><StatusBadge status={r.status as string} domain="timeOffRequest" /></Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          )}

          {tab === 'allocations' && (
            <Table>
              <Thead>
                <tr>
                  <Th className="text-right">Allocated</Th>
                  <Th className="text-right">Taken</Th>
                  <Th className="text-right">Remaining</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {!allocations || allocations.length === 0 ? (
                  <tr><Td colSpan={4} className="py-32 text-center text-text-muted">No allocations found.</Td></tr>
                ) : (
                  allocations.map((a: Record<string, unknown>) => (
                    <Tr key={a.id as string}>
                      <Td className="text-right font-mono">{a.allocated as string}</Td>
                      <Td className="text-right font-mono text-text-muted">{a.taken as string}</Td>
                      <Td className="text-right font-mono font-bold text-primary">{a.remaining as string}</Td>
                      <Td><StatusBadge status={a.status as string} domain="timeOffAllocation" /></Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          )}
        </div>

        <div className="mt-auto border-t border-border p-16 text-xs font-medium text-text-muted">
          Viewing {tab} records
        </div>
      </div>
    </div>
  );
}
