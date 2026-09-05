import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2 } from 'lucide-react';
import { getDashboard } from '../api/dashboard.api';
import { listDepartments } from '../api/reference.api';
import { AiAssistantCard } from '../components/AiAssistantCard';
import { CardSkeleton } from '../components/ui/skeleton';
import { Select, Input } from '../components/ui/input';

const WARNING_LABEL: Record<string, string> = {
  contract_missing: 'Missing Contract',
  missing_bank_details: 'Missing Bank Details',
  duplicate_payslip: 'Duplicate Payslip',
  negative_net: 'Negative Net Pay',
};

const EMPLOYEE_TYPES = ['full_time', 'part_time', 'contract'];

export function Dashboard() {
  const navigate = useNavigate();
  const [departmentId, setDepartmentId] = useState('');
  const [employeeType, setEmployeeType] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: listDepartments });
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', departmentId, employeeType, periodStart, periodEnd],
    queryFn: () =>
      getDashboard({
        department_id: departmentId || undefined,
        employee_type: employeeType || undefined,
        period_start: periodStart || undefined,
        period_end: periodEnd || undefined,
      }),
  });

  if (isLoading || !data) return <CardSkeleton />;

  const maxDeptCost = Math.max(...data.salary_cost_by_department.map((d) => d.total_net_cost), 1);
  const maxTrend = Math.max(...data.monthly_net_salary_trend.map((t) => t.total_net), 1);

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-6 flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-[#172b4d]">Payroll Overview</h1>
        <div className="flex flex-wrap items-end gap-[16px]">
          <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-[140px] h-[36px] text-sm border-[#dfe1e6]" title="Period start" />
          <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="w-[140px] h-[36px] text-sm border-[#dfe1e6]" title="Period end" />
          <Select value={employeeType} onChange={(e) => setEmployeeType(e.target.value)} className="w-[140px] h-[36px] text-sm border-[#dfe1e6]">
            <option value="">All Types</option>
            {EMPLOYEE_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </Select>
          <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-[160px] h-[36px] text-sm border-[#dfe1e6]">
            <option value="">All Depts</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
          <button onClick={() => navigate('/payroll')} className="bg-[#3062e1] hover:bg-[#2552cc] text-white font-semibold text-xs px-[16px] py-2 rounded transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#e6f0ff] h-[36px] flex items-center">
            Run Payroll
          </button>
        </div>
      </div>

      {/* Top KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px]">
        <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] p-[16px] flex flex-col gap-2">
          <span className="font-semibold text-[12px] text-[#5e6c84] uppercase tracking-wider">Total Net Paid</span>
          <span className="font-bold text-[32px] leading-tight text-[#172b4d]">₹{data.kpis.total_net_paid.toLocaleString()}</span>
          <div className="flex items-center gap-1 text-[#5e6c84]">
            <span className="text-[12px]">Aggregated across all payslips</span>
          </div>
        </div>

        <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] p-[16px] flex flex-col gap-2">
          <span className="font-semibold text-[12px] text-[#5e6c84] uppercase tracking-wider">Payslips Generated</span>
          <span className="font-bold text-[32px] leading-tight text-[#172b4d]">{data.kpis.payslips_generated}</span>
          <div className="flex items-center gap-1 text-[#5e6c84]">
            <span className="text-[12px]">For the current period selection</span>
          </div>
        </div>

        <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] p-[16px] flex flex-col gap-2">
          <span className="font-semibold text-[12px] text-[#5e6c84] uppercase tracking-wider">Average Salary</span>
          <span className="font-bold text-[32px] leading-tight text-[#172b4d]">₹{data.kpis.average_salary.toLocaleString()}</span>
          <div className="flex items-center gap-1 text-[#5e6c84]">
            <span className="text-[12px]">Stable across selection</span>
          </div>
        </div>

        <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] p-[16px] flex flex-col gap-2">
          <span className="font-semibold text-[12px] text-[#5e6c84] uppercase tracking-wider">Approved Time Off</span>
          <span className="font-bold text-[32px] leading-tight text-[#172b4d]">{data.kpis.approved_time_off_days}<span className="text-xl ml-1">days</span></span>
          <div className="flex items-center gap-1 text-[#de350b]">
            <span className="text-[12px] font-medium">Potential impact on processing</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Chart & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[16px] mt-2">
        {/* Chart Area */}
        <div className="lg:col-span-8 bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] flex flex-col">
          <div className="p-[16px] border-b border-[#ebecf0] flex justify-between items-center">
            <h2 className="font-semibold text-[16px] text-[#172b4d]">Salary Cost by Department</h2>
          </div>
          <div className="p-[16px] flex-1 h-[280px] relative overflow-y-auto">
            {data.salary_cost_by_department.length === 0 ? (
              <div className="py-24 text-center text-sm text-[#5e6c84]">No paid payslips yet for this filter.</div>
            ) : (
              <div className="space-y-4">
                {data.salary_cost_by_department.map((d) => (
                  <div key={d.department} className="space-y-2">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="flex items-center gap-2 font-semibold text-[#172b4d]">
                        {d.department}
                      </span>
                      <span className="font-mono text-[#5e6c84]">₹{d.total_net_cost.toLocaleString()} · {d.headcount} paid</span>
                    </div>
                    <div className="h-[16px] w-full rounded-[2px] bg-[#ebecf0]">
                      <div
                        className={`h-[16px] rounded-[2px] bg-[#3062e1] transition-all`}
                        style={{ width: `${Math.max((d.total_net_cost / maxDeptCost) * 100, 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alerts Area */}
        <div className="lg:col-span-4 bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] flex flex-col">
          <div className="p-[16px] border-b border-[#ebecf0] flex justify-between items-center">
            <h2 className="font-semibold text-[16px] text-[#172b4d]">Pending Alerts</h2>
            <span className="bg-[#ffebe6] text-[#bf2600] font-semibold text-[11px] px-2 py-0.5 rounded">{data.payroll_alerts.length} New</span>
          </div>
          <div className="flex flex-col flex-1 overflow-y-auto max-h-[280px]">
            {data.payroll_alerts.length === 0 ? (
              <div className="p-[16px] text-sm text-[#5e6c84]">No open alerts.</div>
            ) : (
              data.payroll_alerts.map((a) => (
                <div key={a.warning_type} className="p-[16px] border-b border-[#ebecf0] hover:bg-[#f4f5f7] transition-colors flex gap-3 items-start cursor-pointer group">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-[13px] text-[#172b4d]">{WARNING_LABEL[a.warning_type] || a.warning_type}</span>
                    <span className="text-[12px] text-[#5e6c84]">Count: {a.count} occurrences in current processing period.</span>
                    <span className="text-[12px] text-[#3062e1] mt-1 font-medium">Review Details →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Monthly Net Salary Trend */}
      <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] flex flex-col mt-2">
        <div className="p-[16px] border-b border-[#ebecf0] flex justify-between items-center">
          <h2 className="font-semibold text-[16px] text-[#172b4d]">Monthly Net Salary Trend</h2>
        </div>
        <div className="p-[16px]">
          {data.monthly_net_salary_trend.length === 0 ? (
            <div className="py-24 text-center text-sm text-[#5e6c84]">No historical payroll data yet.</div>
          ) : (
            <div className="space-y-4">
              {data.monthly_net_salary_trend.map((t) => (
                <div key={t.month} className="space-y-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="font-semibold text-[#172b4d]">{t.month}</span>
                    <span className="font-mono text-[#5e6c84]">₹{t.total_net.toLocaleString()}</span>
                  </div>
                  <div className="h-[16px] w-full rounded-[2px] bg-[#ebecf0]">
                    <div
                      className="h-[16px] rounded-[2px] bg-[#3062e1] transition-all"
                      style={{ width: `${Math.max((t.total_net / maxTrend) * 100, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Attendance & Time Off */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[16px] mt-2">
        <div className="lg:col-span-8 bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] flex flex-col overflow-hidden">
          <div className="p-[16px] border-b border-[#ebecf0] flex justify-between items-center">
            <h2 className="font-semibold text-[16px] text-[#172b4d]">Attendance Health (Current Period)</h2>
          </div>
          <div className="p-[16px] flex flex-wrap gap-[16px] text-sm">
             <div className="flex gap-2">
               <span className="text-[#5e6c84]">Present:</span><span className="font-semibold text-[#006644]">{data.attendance_overview.present}</span>
             </div>
             <div className="flex gap-2">
               <span className="text-[#5e6c84]">Late:</span><span className="font-semibold text-[#ff8b00]">{data.attendance_overview.late}</span>
             </div>
             <div className="flex gap-2">
               <span className="text-[#5e6c84]">Absent:</span><span className="font-semibold text-[#bf2600]">{data.attendance_overview.absent}</span>
             </div>
             <div className="flex gap-2">
               <span className="text-[#5e6c84]">Overtime:</span><span className="font-semibold text-[#3062e1]">{data.attendance_overview.overtime}</span>
             </div>
             <div className="flex gap-2">
               <span className="text-[#5e6c84]">Missing Checkouts:</span><span className="font-semibold text-[#172b4d]">{data.attendance_overview.missing_checkouts}</span>
             </div>
             <div className="flex gap-2">
               <span className="text-[#5e6c84]">Manual Edits:</span><span className="font-semibold text-[#172b4d]">{data.attendance_overview.manual_edits}</span>
             </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] flex flex-col overflow-hidden">
          <div className="p-[16px] border-b border-[#ebecf0] flex justify-between items-center">
            <h2 className="font-semibold text-[16px] text-[#172b4d]">Time Off Overview</h2>
          </div>
          <div className="p-[16px] flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#5e6c84]">Approved Days</span><span className="font-semibold text-[#006644]">{data.time_off_overview.approved_days}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5e6c84]">Pending Requests</span><span className="font-semibold text-[#ff8b00]">{data.time_off_overview.pending_requests}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Department Overview */}
      <div className="bg-[#fefefe] border border-[#dfe1e6] rounded-[6px] flex flex-col mt-2">
        <div className="p-[16px] border-b border-[#ebecf0] flex justify-between items-center">
          <h2 className="font-semibold text-[16px] text-[#172b4d]">Department Overview</h2>
        </div>
        <div className="p-[16px] grid grid-cols-1 gap-[16px] sm:grid-cols-2 lg:grid-cols-3">
          {data.department_overview.map((d) => (
            <div key={d.department} className="flex items-center gap-3 rounded-[6px] border border-[#dfe1e6] p-[16px]">
              <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-[6px] bg-[#3062e1] text-white">
                <Building2 className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-semibold text-[#172b4d]">{d.department}</div>
                <div className="mt-1 flex items-center justify-between text-[12px] text-[#5e6c84]">
                  <span>{d.headcount} employees</span>
                  <span className="font-mono font-semibold text-[#172b4d]">₹{d.total_salary.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AiAssistantCard
        filters={{
          period_start: periodStart || undefined,
          period_end: periodEnd || undefined,
          department_id: departmentId || undefined,
          employee_type: employeeType || undefined,
        }}
      />
    </div>
  );
}
