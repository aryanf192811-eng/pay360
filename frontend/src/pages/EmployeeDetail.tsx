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
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-[16px] md:px-[24px] py-[24px] grid grid-cols-1 md:grid-cols-12 gap-[12px] items-start">
      {/* Left Sidebar: Profile Card */}
      <aside className="md:col-span-3 flex flex-col gap-[16px]">
        <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-lg flex flex-col items-center p-[24px] text-center shadow-sm">
          <div className="flex w-full justify-start mb-2">
            <button onClick={() => navigate('/employees')} className="flex items-center gap-1 text-[13px] text-[#434654] hover:text-[#172b4d] font-medium">
              <ArrowLeft className="h-[14px] w-[14px]" /> Back
            </button>
          </div>
          <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-[#dfe1e6] mb-[16px] bg-[#dedbc2] flex items-center justify-center text-[40px] font-bold text-[#4c5e83] shadow-sm">
             {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
          </div>
          <h1 className="text-[18px] font-semibold text-[#1d1c0d] mb-[4px]">{employee.first_name} {employee.last_name}</h1>
          <p className="text-[13px] text-[#4c5e83] font-medium mb-[16px]">{employee.job_position || 'No position'}</p>
          <div className="mb-[16px]"><StatusBadge status={employee.status} domain="employee" /></div>
          
          <div className="w-full border-t border-[#dfe1e6] pt-[16px] flex flex-col gap-[8px] text-left">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-[#737686] uppercase tracking-wider font-medium">Department</span>
              <span className="text-[13px] text-[#1d1c0d]">{(employee as Record<string, unknown>).department_name as string || 'No department'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-[#737686] uppercase tracking-wider font-medium">Manager</span>
              <span className="text-[13px] text-[#1d1c0d]">
                {(employee as Record<string, unknown>).manager_first_name ? 
                  `${(employee as Record<string, unknown>).manager_first_name} ${(employee as Record<string, unknown>).manager_last_name}` : 
                  'No manager'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-[#737686] uppercase tracking-wider font-medium">Employee ID</span>
              <span className="text-[13px] text-[#1d1c0d] font-mono">{employee.employee_code}</span>
            </div>
          </div>
          <button onClick={() => navigate(`/employees/${id}/edit`)} className="mt-[16px] w-full flex items-center justify-center gap-[4px] px-[16px] py-[8px] border border-[#dfe1e6] rounded text-[12px] font-semibold text-[#1d1c0d] hover:bg-[#e7e3ca] transition-colors bg-[#fefefe]">
            <Pencil className="h-[14px] w-[14px]" /> Edit Profile
          </button>
        </div>

        {/* Quick Stats Bento */}
        <div className="grid grid-cols-2 gap-[12px]">
          <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-lg p-[16px] flex flex-col shadow-sm">
            <span className="text-[11px] text-[#737686] uppercase font-medium mb-[4px]">Contracts</span>
            <span className="text-[18px] font-semibold text-[#1d1c0d]">{contracts?.length ?? 0}</span>
          </div>
          <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-lg p-[16px] flex flex-col shadow-sm">
            <span className="text-[11px] text-[#737686] uppercase font-medium mb-[4px]">Allocations</span>
            <span className="text-[18px] font-semibold text-[#3062e1]">{allocations?.length ?? 0}</span>
          </div>
        </div>
      </aside>

      {/* Right Main Area: Tabbed Interface */}
      <div className="md:col-span-9 bg-[#fefefe] border border-[#dfe1e6] rounded-lg flex flex-col overflow-hidden min-h-[600px] shadow-sm">
        {/* Tabs Header */}
        <div className="flex border-b border-[#dfe1e6] bg-[#ffffff] px-[16px] pt-[8px] gap-[16px] overflow-x-auto hide-scrollbar">
          {smartButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'text-[12px] font-semibold pb-[4px] px-[4px] transition-colors cursor-pointer whitespace-nowrap',
                tab === key ? 'text-[#3062e1] border-b-2 border-[#3062e1]' : 'text-[#434654] hover:text-[#3062e1] border-b-2 border-transparent'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-0 overflow-x-auto flex-1">
          {tab === 'contracts' && (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#ebecf0] text-[#1d1c0d] text-[12px] font-semibold border-b border-[#dfe1e6]">
                  <th className="py-[8px] px-[12px] whitespace-nowrap">Position</th>
                  <th className="py-[8px] px-[12px] whitespace-nowrap text-right">Wage</th>
                  <th className="py-[8px] px-[12px] whitespace-nowrap">Start Date</th>
                  <th className="py-[8px] px-[12px] whitespace-nowrap">End Date</th>
                  <th className="py-[8px] px-[12px] whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#1d1c0d]">
                {!contracts || contracts.length === 0 ? (
                  <tr><td colSpan={5} className="py-[32px] text-center text-[#737686]">No contracts found.</td></tr>
                ) : (
                  contracts.map((c: Record<string, unknown>) => (
                    <tr key={c.id as string} className="border-b border-[#ebecf0] hover:bg-[#e7e3ca] transition-colors">
                      <td className="py-[8px] px-[12px] font-medium">
                        <div className="flex items-center gap-[4px]">
                          <FileText className="h-[14px] w-[14px] text-[#737686]" />
                          {(c.position as string) || '—'}
                        </div>
                      </td>
                      <td className="py-[8px] px-[12px] text-right font-mono text-[#3062e1]">₹{Number(c.wage).toLocaleString()}</td>
                      <td className="py-[8px] px-[12px]">{c.date_start as string}</td>
                      <td className="py-[8px] px-[12px] text-[#737686]">{(c.date_end as string) || 'Ongoing'}</td>
                      <td className="py-[8px] px-[12px]">
                        <StatusBadge status={c.status as string} domain="contract" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {tab === 'attendance' && (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#ebecf0] text-[#1d1c0d] text-[12px] font-semibold border-b border-[#dfe1e6]">
                  <th className="py-[8px] px-[12px] whitespace-nowrap">Check In</th>
                  <th className="py-[8px] px-[12px] whitespace-nowrap">Check Out</th>
                  <th className="py-[8px] px-[12px] whitespace-nowrap text-right">Worked Hours</th>
                  <th className="py-[8px] px-[12px] whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#1d1c0d]">
                {!attendances || attendances.length === 0 ? (
                  <tr><td colSpan={4} className="py-[32px] text-center text-[#737686]">No attendance records found.</td></tr>
                ) : (
                  attendances.map((a: Record<string, unknown>) => (
                    <tr key={a.id as string} className="border-b border-[#ebecf0] hover:bg-[#e7e3ca] transition-colors">
                      <td className="py-[8px] px-[12px]">
                        <div className="flex items-center gap-[4px]">
                          <Clock className="h-[14px] w-[14px] text-[#737686]" />
                          {new Date(a.check_in as string).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-[8px] px-[12px] text-[#737686]">{a.check_out ? new Date(a.check_out as string).toLocaleString() : '—'}</td>
                      <td className="py-[8px] px-[12px] text-right font-mono">{(a.worked_hours as string) ?? '—'}</td>
                      <td className="py-[8px] px-[12px]">
                        <StatusBadge status={a.status as string} domain="attendance" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {tab === 'timeoff' && (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#ebecf0] text-[#1d1c0d] text-[12px] font-semibold border-b border-[#dfe1e6]">
                  <th className="py-[8px] px-[12px] whitespace-nowrap">From Date</th>
                  <th className="py-[8px] px-[12px] whitespace-nowrap">To Date</th>
                  <th className="py-[8px] px-[12px] whitespace-nowrap text-right">Duration (Days)</th>
                  <th className="py-[8px] px-[12px] whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#1d1c0d]">
                {!requests || requests.length === 0 ? (
                  <tr><td colSpan={4} className="py-[32px] text-center text-[#737686]">No time off requests found.</td></tr>
                ) : (
                  requests.map((r: Record<string, unknown>) => (
                    <tr key={r.id as string} className="border-b border-[#ebecf0] hover:bg-[#e7e3ca] transition-colors">
                      <td className="py-[8px] px-[12px]">
                         <div className="flex items-center gap-[4px]">
                          <CalendarClock className="h-[14px] w-[14px] text-[#737686]" />
                          {r.date_from as string}
                        </div>
                      </td>
                      <td className="py-[8px] px-[12px] text-[#737686]">{r.date_to as string}</td>
                      <td className="py-[8px] px-[12px] text-right font-mono">{r.duration as string}</td>
                      <td className="py-[8px] px-[12px]">
                        <StatusBadge status={r.status as string} domain="timeOffRequest" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {tab === 'allocations' && (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#ebecf0] text-[#1d1c0d] text-[12px] font-semibold border-b border-[#dfe1e6]">
                  <th className="py-[8px] px-[12px] whitespace-nowrap text-right">Allocated</th>
                  <th className="py-[8px] px-[12px] whitespace-nowrap text-right">Taken</th>
                  <th className="py-[8px] px-[12px] whitespace-nowrap text-right">Remaining</th>
                  <th className="py-[8px] px-[12px] whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#1d1c0d]">
                {!allocations || allocations.length === 0 ? (
                  <tr><td colSpan={4} className="py-[32px] text-center text-[#737686]">No allocations found.</td></tr>
                ) : (
                  allocations.map((a: Record<string, unknown>) => (
                    <tr key={a.id as string} className="border-b border-[#ebecf0] hover:bg-[#e7e3ca] transition-colors">
                      <td className="py-[8px] px-[12px] text-right font-mono">{a.allocated as string}</td>
                      <td className="py-[8px] px-[12px] text-right font-mono text-[#737686]">{a.taken as string}</td>
                      <td className="py-[8px] px-[12px] text-right font-mono font-bold text-[#3062e1]">{a.remaining as string}</td>
                      <td className="py-[8px] px-[12px]">
                        <StatusBadge status={a.status as string} domain="timeOffAllocation" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Table Footer Actions */}
        <div className="border-t border-[#dfe1e6] bg-[#ffffff] p-[16px] flex justify-between items-center mt-auto">
          <span className="text-[11px] text-[#737686] font-medium">Viewing {tab} records</span>
        </div>
      </div>
    </div>
  );
}
