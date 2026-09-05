import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, FileCheck, TrendingUp, CalendarClock, Activity, ArrowUpRight, Building2 } from 'lucide-react';
import { getDashboard } from '../api/dashboard.api';
import { listDepartments } from '../api/reference.api';
import { KpiCard } from '../components/KpiCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CardSkeleton } from '../components/ui/skeleton';
import { Select, Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const DEPT_ACCENTS = ['bg-primary', 'bg-accent', 'bg-warning', 'bg-info', 'bg-danger'];

const WARNING_LABEL: Record<string, string> = {
  contract_missing: 'Missing Contract',
  missing_bank_details: 'Missing Bank Details',
  duplicate_payslip: 'Duplicate Payslip',
  negative_net: 'Negative Net Pay',
};

const EMPLOYEE_TYPES = ['full_time', 'part_time', 'contract'];

export function Dashboard() {
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
    <div className="space-y-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Payroll Dashboard</h1>
          <p className="text-sm text-text-muted">Live data aggregated across Employees, Contracts, Payroll, Attendance, and Time Off.</p>
        </div>
        <div className="flex flex-wrap items-end gap-8">
          <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} className="w-[160px]" title="Period start" />
          <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} className="w-[160px]" title="Period end" />
          <Select value={employeeType} onChange={(e) => setEmployeeType(e.target.value)} className="w-[160px]">
            <option value="">All Employee Types</option>
            {EMPLOYEE_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </Select>
          <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-[200px]">
            <option value="">All Departments</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
        <Card dark className="relative overflow-hidden lg:col-span-5">
          <div className="absolute -right-[100px] -top-[100px] h-[200px] w-[200px] rounded-full bg-white/5" />
          <div className="absolute -right-8 top-32 h-[120px] w-[120px] rounded-full bg-accent/20" />
          <CardContent className="relative pt-24">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-surface-dark-foreground/60">Total Net Paid</div>
              <div className="flex h-[36px] w-[36px] items-center justify-center rounded-md bg-gradient-to-br from-accent to-accent/70 shadow-tinted">
                <Wallet className="h-[18px] w-[18px] text-white" />
              </div>
            </div>
            <div className="mt-16 font-mono text-4xl font-bold tabular-nums text-white">₹{data.kpis.total_net_paid.toLocaleString()}</div>
            <div className="mt-16 flex items-center gap-8 text-xs text-surface-dark-foreground/70">
              <FileCheck className="h-[14px] w-[14px] text-accent" />
              {data.kpis.payslips_generated} payslips generated this period
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-16 lg:col-span-7">
          <KpiCard icon={TrendingUp} label="Average Salary" value={`₹${data.kpis.average_salary.toLocaleString()}`} />
          <KpiCard icon={CalendarClock} label="Approved Time Off" value={`${data.kpis.approved_time_off_days} days`} tone="success" />
          <KpiCard icon={FileCheck} label="Payslips Generated" value={String(data.kpis.payslips_generated)} tone="default" />
          <KpiCard
            icon={Activity}
            label="Attendance Health"
            value={`${data.kpis.attendance_health_pct}%`}
            tone={data.kpis.attendance_health_pct >= 90 ? 'success' : data.kpis.attendance_health_pct >= 70 ? 'warning' : 'danger'}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader><CardTitle>Salary Cost by Department</CardTitle></CardHeader>
          <CardContent className="space-y-16">
            {data.salary_cost_by_department.length === 0 ? (
              <div className="py-24 text-center text-sm text-text-muted">No paid payslips yet for this filter.</div>
            ) : (
              data.salary_cost_by_department.map((d, i) => (
                <div key={d.department} className="space-y-8">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-8 font-semibold text-text">
                      <Building2 className={`h-[14px] w-[14px] ${DEPT_ACCENTS[i % DEPT_ACCENTS.length].replace('bg-', 'text-')}`} />
                      {d.department}
                    </span>
                    <span className="font-mono text-text-muted">₹{d.total_net_cost.toLocaleString()} · {d.headcount} paid</span>
                  </div>
                  <div className="h-10 w-full rounded-full bg-bg">
                    <div
                      className={`h-10 rounded-full ${DEPT_ACCENTS[i % DEPT_ACCENTS.length]} shadow-tinted transition-all`}
                      style={{ width: `${Math.max((d.total_net_cost / maxDeptCost) * 100, 6)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader><CardTitle>Monthly Net Salary Trend</CardTitle></CardHeader>
          <CardContent>
            {data.monthly_net_salary_trend.length === 0 ? (
              <div className="py-24 text-center text-sm text-text-muted">No historical payroll data yet.</div>
            ) : (
              <div className="h-[160px] px-4">
                {(() => {
                  const trend = data.monthly_net_salary_trend;
                  const single = trend.length === 1;
                  // Percentage-based positions so marker dots (plain HTML, not SVG) never get
                  // squished by the SVG's preserveAspectRatio="none" line/area underneath them.
                  const points = trend.map((t, i) => ({
                    xPct: single ? 50 : (i / (trend.length - 1)) * 100,
                    yPct: 100 - Math.max((t.total_net / maxTrend) * 100, 3),
                    t,
                  }));
                  const svgPoints = single
                    ? [{ ...points[0], xPct: 0 }, { ...points[0], xPct: 100 }] // flat reference line
                    : points;
                  const path = svgPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.xPct} ${p.yPct}`).join(' ');
                  const area = `${path} L 100 100 L 0 100 Z`;
                  return (
                    <div className="h-full overflow-hidden">
                      <div className="relative h-[128px] w-full overflow-hidden">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                          <path d={area} fill="color-mix(in srgb, var(--primary) 12%, transparent)" stroke="none" />
                          <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        </svg>
                        {points.map((p, i) => (
                          <div
                            key={i}
                            title={`₹${p.t.total_net.toLocaleString()}`}
                            className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-tinted"
                            style={{ left: `${p.xPct}%`, top: `${p.yPct}%` }}
                          />
                        ))}
                      </div>
                      <div className="mt-8 flex justify-between text-xs text-text-muted">
                        {trend.map((t) => (
                          <span key={t.month} title={`₹${t.total_net.toLocaleString()}`}>{t.month}</span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Payroll Alerts</CardTitle></CardHeader>
          <CardContent className="space-y-8">
            {data.payroll_alerts.length === 0 ? (
              <div className="text-sm text-text-muted">No open alerts.</div>
            ) : (
              data.payroll_alerts.map((a) => (
                <div key={a.warning_type} className="flex items-center justify-between rounded-md bg-[color-mix(in_srgb,var(--warning)_8%,transparent)] px-12 py-8 text-sm">
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
            <div className="flex justify-between"><span className="text-text-muted">Present</span><span className="font-mono font-semibold text-success">{data.attendance_overview.present}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Late</span><span className="font-mono font-semibold text-warning">{data.attendance_overview.late}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Absent</span><span className="font-mono font-semibold text-danger">{data.attendance_overview.absent}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Overtime</span><span className="font-mono font-semibold text-info">{data.attendance_overview.overtime}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Missing Checkouts</span><span className="font-mono font-semibold text-text">{data.attendance_overview.missing_checkouts}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Manual Edits</span><span className="font-mono font-semibold text-text">{data.attendance_overview.manual_edits}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Time Off Overview</CardTitle></CardHeader>
          <CardContent className="space-y-8 text-sm">
            <div className="flex justify-between"><span className="text-text-muted">Approved Days</span><span className="font-mono font-semibold text-success">{data.time_off_overview.approved_days}</span></div>
            <div className="flex justify-between"><span className="text-text-muted">Pending Requests</span><span className="font-mono font-semibold text-warning">{data.time_off_overview.pending_requests}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Department Overview</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3">
          {data.department_overview.map((d, i) => (
            <div key={d.department} className="flex items-center gap-12 rounded-md border border-border p-16 transition-shadow hover:shadow-tinted">
              <div className={`flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-md text-white ${DEPT_ACCENTS[i % DEPT_ACCENTS.length]}`}>
                <Building2 className="h-[18px] w-[18px]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-text">{d.department}</div>
                <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
                  <span>{d.headcount} employees</span>
                  <span className="flex items-center gap-4 font-mono font-semibold text-text">
                    ₹{d.total_salary.toLocaleString()} <ArrowUpRight className="h-12 w-12 text-success" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
