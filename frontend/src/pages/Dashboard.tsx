import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../api/dashboard.api';
import { listDepartments } from '../api/reference.api';
import { KpiCard } from '../components/KpiCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CardSkeleton } from '../components/ui/skeleton';
import { Select } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const WARNING_LABEL: Record<string, string> = {
  contract_missing: 'Missing Contract',
  missing_bank_details: 'Missing Bank Details',
  duplicate_payslip: 'Duplicate Payslip',
  negative_net: 'Negative Net Pay',
};

export function Dashboard() {
  const [departmentId, setDepartmentId] = useState('');
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: listDepartments });
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', departmentId],
    queryFn: () => getDashboard(departmentId ? { department_id: departmentId } : undefined),
  });

  if (isLoading || !data) return <CardSkeleton />;

  const maxDeptCost = Math.max(...data.salary_cost_by_department.map((d) => d.total_net_cost), 1);
  const maxTrend = Math.max(...data.monthly_net_salary_trend.map((t) => t.total_net), 1);

  return (
    <div className="space-y-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Payroll Dashboard</h1>
          <p className="text-sm text-text-muted">Live data aggregated across Employees, Contracts, Payroll, Attendance, and Time Off.</p>
        </div>
        <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-[200px]">
          <option value="">All Departments</option>
          {departments?.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-16 lg:grid-cols-5">
        <KpiCard label="Total Net Paid" value={`₹${data.kpis.total_net_paid.toLocaleString()}`} />
        <KpiCard label="Payslips Generated" value={String(data.kpis.payslips_generated)} />
        <KpiCard label="Average Salary" value={`₹${data.kpis.average_salary.toLocaleString()}`} />
        <KpiCard label="Approved Time Off" value={`${data.kpis.approved_time_off_days} days`} />
        <KpiCard
          label="Attendance Health"
          value={`${data.kpis.attendance_health_pct}%`}
          tone={data.kpis.attendance_health_pct >= 90 ? 'success' : data.kpis.attendance_health_pct >= 70 ? 'warning' : 'danger'}
        />
      </div>

      <div className="grid grid-cols-2 gap-24">
        <Card>
          <CardHeader><CardTitle>Salary Cost by Department</CardTitle></CardHeader>
          <CardContent className="space-y-12">
            {data.salary_cost_by_department.length === 0 ? (
              <div className="py-24 text-center text-sm text-text-muted">No paid payslips yet for this filter.</div>
            ) : (
              data.salary_cost_by_department.map((d) => (
                <div key={d.department} className="space-y-4">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-text">{d.department}</span>
                    <span className="font-mono text-text-muted">₹{d.total_net_cost.toLocaleString()} · {d.headcount} paid</span>
                  </div>
                  <div className="h-8 w-full rounded-full bg-bg">
                    <div className="h-8 rounded-full bg-primary" style={{ width: `${(d.total_net_cost / maxDeptCost) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Monthly Net Salary Trend</CardTitle></CardHeader>
          <CardContent>
            {data.monthly_net_salary_trend.length === 0 ? (
              <div className="py-24 text-center text-sm text-text-muted">No historical payroll data yet.</div>
            ) : (
              <div className="flex h-[140px] items-end gap-8">
                {data.monthly_net_salary_trend.map((t) => (
                  <div key={t.month} className="flex flex-1 flex-col items-center gap-4">
                    <div className="w-full rounded-t bg-accent" style={{ height: `${(t.total_net / maxTrend) * 120}px` }} />
                    <span className="text-xs text-text-muted">{t.month}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-24">
        <Card>
          <CardHeader><CardTitle>Payroll Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-8">
            {data.payroll_alerts.length === 0 ? (
              <div className="text-sm text-text-muted">No open alerts.</div>
            ) : (
              data.payroll_alerts.map((a) => (
                <div key={a.warning_type} className="flex items-center justify-between text-sm">
                  <span className="text-text">{WARNING_LABEL[a.warning_type] || a.warning_type}</span>
                  <Badge tone="warning">{a.count}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Attendance Overview</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-8 text-sm">
            <div className="flex justify-between"><span className="text-text-muted">Present</span><span className="font-mono text-success">{data.attendance_overview.present}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Late</span><span className="font-mono text-warning">{data.attendance_overview.late}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Absent</span><span className="font-mono text-danger">{data.attendance_overview.absent}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Overtime</span><span className="font-mono text-info">{data.attendance_overview.overtime}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Missing Checkouts</span><span className="font-mono">{data.attendance_overview.missing_checkouts}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Manual Edits</span><span className="font-mono">{data.attendance_overview.manual_edits}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Time Off Overview</CardTitle></CardHeader>
          <CardContent className="space-y-8 text-sm">
            <div className="flex justify-between"><span className="text-text-muted">Approved Days</span><span className="font-mono text-success">{data.time_off_overview.approved_days}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Pending Requests</span><span className="font-mono text-warning">{data.time_off_overview.pending_requests}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Department Overview</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-16">
          {data.department_overview.map((d) => (
            <div key={d.department} className="rounded-md border border-border p-16">
              <div className="text-sm font-semibold text-text">{d.department}</div>
              <div className="mt-4 flex justify-between text-xs text-text-muted">
                <span>{d.headcount} employees</span>
                <span className="font-mono">₹{d.total_salary.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
