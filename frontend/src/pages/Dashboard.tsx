import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Building2, Wallet, FileText, TrendingUp, CalendarClock, ShieldCheck } from 'lucide-react';
import { getDashboard } from '../api/dashboard.api';
import { listDepartments } from '../api/reference.api';
import { AiAssistantCard } from '../components/AiAssistantCard';
import { CardSkeleton } from '../components/ui/skeleton';
import { Select, Input, Label } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { KpiTile } from '../components/ui/kpi-tile';

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
    <div className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col gap-16">
      <div className="flex flex-wrap justify-between items-end gap-16">
        <div>
          <h1 className="text-2xl font-bold text-text">Payroll Overview</h1>
          <p className="text-sm text-text-muted">Every number below is computed live from real payslips — never a static figure.</p>
        </div>
        <div className="flex flex-wrap items-end gap-12">
          <div className="space-y-4">
            <Label>Period Start</Label>
            <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-[150px]" />
          </div>
          <div className="space-y-4">
            <Label>Period End</Label>
            <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="w-[150px]" />
          </div>
          <div className="space-y-4">
            <Label>Type</Label>
            <Select value={employeeType} onChange={(e) => setEmployeeType(e.target.value)} className="w-[140px]">
              <option value="">All Types</option>
              {EMPLOYEE_TYPES.map((t) => (
                <option key={t} value={t}>{t.replace('_', ' ')}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-4">
            <Label>Department</Label>
            <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-[160px]">
              <option value="">All Depts</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </div>
          <button
            onClick={() => navigate('/payroll')}
            className="h-10 rounded-md bg-primary px-16 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Run Payroll
          </button>
        </div>
      </div>

      {/* Bento KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-16">
        <KpiTile index={0} icon={Wallet} tone="primary" label="Total Net Paid" value={`₹${data.kpis.total_net_paid.toLocaleString()}`} hint="Aggregated across paid payslips" />
        <KpiTile index={1} icon={FileText} tone="info" label="Payslips Generated" value={data.kpis.payslips_generated} hint="Current period selection" />
        <KpiTile index={2} icon={TrendingUp} tone="success" label="Average Salary" value={`₹${data.kpis.average_salary.toLocaleString()}`} hint="Stable across selection" />
        <KpiTile index={3} icon={CalendarClock} tone="warning" label="Approved Time Off" value={`${data.kpis.approved_time_off_days} days`} hint="Potential impact on processing" />
        <KpiTile
          index={4}
          icon={ShieldCheck}
          tone={data.kpis.compliance_score === null ? 'primary' : data.kpis.compliance_score >= 90 ? 'success' : data.kpis.compliance_score >= 70 ? 'warning' : 'danger'}
          label="Compliance Score"
          value={data.kpis.compliance_score === null ? '—' : `${data.kpis.compliance_score}%`}
          hint={data.kpis.compliance_score === null ? 'No payslips in this period yet' : 'Payslips with zero unresolved warnings'}
        />
      </div>

      {/* Middle Row: Chart & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <Card className="lg:col-span-8">
          <CardHeader><CardTitle>Salary Cost by Department</CardTitle></CardHeader>
          <CardContent>
            {data.salary_cost_by_department.length === 0 ? (
              <div className="py-24 text-center text-sm text-text-muted">No paid payslips yet for this filter.</div>
            ) : (
              <div className="space-y-12">
                {data.salary_cost_by_department.map((d, i) => (
                  <div key={d.department} className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-text">{d.department}</span>
                      <span className="font-mono text-text-muted">₹{d.total_net_cost.toLocaleString()} · {d.headcount} paid</span>
                    </div>
                    <div className="h-8 w-full rounded-full bg-bg">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max((d.total_net_cost / maxDeptCost) * 100, 2)}%` }}
                        transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
                        className="h-8 rounded-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle>Pending Alerts</CardTitle>
            <span className="rounded-full bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] px-8 py-2 text-xs font-semibold text-danger">{data.payroll_alerts.length} New</span>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col overflow-y-auto p-0 max-h-[260px]">
            {data.payroll_alerts.length === 0 ? (
              <div className="px-16 pb-16 text-sm text-text-muted">No open alerts.</div>
            ) : (
              data.payroll_alerts.map((a) => (
                <button
                  key={a.warning_type}
                  onClick={() => navigate('/payroll')}
                  className="flex w-full cursor-pointer items-start gap-8 border-t border-border px-16 py-12 text-left transition-colors first:border-t-0 hover:bg-bg"
                >
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-text">{WARNING_LABEL[a.warning_type] || a.warning_type}</span>
                    <span className="text-xs text-text-muted">{a.count} occurrence(s) in current period.</span>
                    <span className="text-xs font-medium text-primary">Review in Payrun History →</span>
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Net Salary Trend */}
      <Card>
        <CardHeader><CardTitle>Monthly Net Salary Trend</CardTitle></CardHeader>
        <CardContent>
          {data.monthly_net_salary_trend.length === 0 ? (
            <div className="py-24 text-center text-sm text-text-muted">No historical payroll data yet.</div>
          ) : (
            <div className="space-y-12">
              {data.monthly_net_salary_trend.map((t, i) => (
                <div key={t.month} className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-text">{t.month}</span>
                    <span className="font-mono text-text-muted">₹{t.total_net.toLocaleString()}</span>
                  </div>
                  <div className="h-8 w-full rounded-full bg-bg">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max((t.total_net / maxTrend) * 100, 2)}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05, ease: 'easeOut' }}
                      className="h-8 rounded-full bg-accent"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workforce Health (dark panel) + Time Off */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        <Card dark className="lg:col-span-8">
          <CardHeader><CardTitle>Workforce Health — Attendance (Current Period)</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-16 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Present', value: data.attendance_overview.present },
              { label: 'Late', value: data.attendance_overview.late },
              { label: 'Absent', value: data.attendance_overview.absent },
              { label: 'Overtime', value: data.attendance_overview.overtime },
              { label: 'Missing Checkouts', value: data.attendance_overview.missing_checkouts },
              { label: 'Manual Edits', value: data.attendance_overview.manual_edits },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs opacity-70">{s.label}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader><CardTitle>Time Off Overview</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-8 text-sm">
            <div className="flex justify-between">
              <span className="text-text-muted">Approved Days</span><span className="font-semibold text-success">{data.time_off_overview.approved_days}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Pending Requests</span><span className="font-semibold text-warning">{data.time_off_overview.pending_requests}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Overview */}
      <Card>
        <CardHeader><CardTitle>Department Overview</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
          {data.department_overview.map((d) => (
            <div key={d.department} className="flex items-center gap-12 rounded-md border border-border p-16">
              <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-md bg-primary text-white">
                <Building2 className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-text">{d.department}</div>
                <div className="mt-2 flex items-center justify-between text-xs text-text-muted">
                  <span>{d.headcount} employees</span>
                  <span className="font-mono font-semibold text-text">₹{d.total_salary.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

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
