import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, AlertTriangle, CalendarClock, HelpCircle, X } from 'lucide-react';
import { getAttendanceAnomalies, getLeaveForecast } from '../api/insights.api';
import { listDepartments } from '../api/reference.api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input, Label, Select } from '../components/ui/input';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/table';
import { EmptyState } from '../components/EmptyState';
import { CardSkeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  // toISOString() converts to UTC first, which silently shifts the date back a day for any
  // timezone ahead of UTC (e.g. UTC+5:30) — build the YYYY-MM-DD string from local fields instead.
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return { start: fmt(start), end: fmt(end) };
}

// Tier 3 "Attendance/leave intelligence" (CLAUDE.md: explicitly optional, good-product-idea
// territory, not PS-required). Every number rendered here comes straight from a real, explainable
// statistic computed live in insights.controller.js — no hardcoded thresholds, no black-box model.
export function InsightsPage() {
  const defaultRange = currentMonthRange();
  const [periodStart, setPeriodStart] = useState(defaultRange.start);
  const [periodEnd, setPeriodEnd] = useState(defaultRange.end);
  const [departmentId, setDepartmentId] = useState('');
  const [runwayMonths, setRunwayMonths] = useState(2);
  const [showHelp, setShowHelp] = useState(false);

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: listDepartments });
  const selectedDeptName = departmentId ? departments?.find((d) => d.id === departmentId)?.name : null;

  const { data: anomalies, isLoading: anomaliesLoading } = useQuery({
    queryKey: ['insights', 'attendance-anomalies', periodStart, periodEnd, departmentId],
    queryFn: () => getAttendanceAnomalies({ period_start: periodStart, period_end: periodEnd, department_id: departmentId || undefined }),
    enabled: !!periodStart && !!periodEnd,
  });

  const { data: forecast, isLoading: forecastLoading } = useQuery({
    queryKey: ['insights', 'leave-forecast', periodStart, periodEnd, departmentId, runwayMonths],
    queryFn: () => getLeaveForecast({ period_start: periodStart, period_end: periodEnd, department_id: departmentId || undefined, runway_months: runwayMonths }),
    enabled: !!periodStart && !!periodEnd,
  });

  const flaggedEmployees = anomalies?.employees.filter((e) => e.is_late_anomaly || e.is_absence_anomaly) ?? [];

  return (
    <div className="space-y-24">
      <div>
        <div className="flex items-center gap-8">
          <h1 className="flex items-center gap-8 text-2xl font-bold text-text"><Activity className="h-[20px] w-[20px]" /> Attendance & Leave Insights</h1>
          <button
            onClick={() => setShowHelp((v) => !v)}
            title="How this works"
            aria-label="How this works"
            className="flex h-24 w-24 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-primary hover:text-primary"
          >
            <HelpCircle className="h-16 w-16" />
          </button>
        </div>
        <p className="text-sm text-text-muted">Statistical outliers and leave-balance runway, computed live — never a hardcoded threshold.</p>
      </div>

      {showHelp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-8"><HelpCircle className="h-16 w-16" /> How this page works</CardTitle>
            <button onClick={() => setShowHelp(false)} className="rounded p-4 text-text-muted hover:bg-bg hover:text-text">
              <X className="h-16 w-16" />
            </button>
          </CardHeader>
          <CardContent className="space-y-16 text-sm text-text">
            <div>
              <div className="font-semibold text-text">Attendance Anomalies — how "anomalous" is decided</div>
              <p className="mt-4 text-text-muted">
                An employee is flagged only when their late-rate or absent-rate for the selected period
                exceeds <b className="text-text">this exact comparison group's own average by more than 1.5×
                its standard deviation</b> — never a fixed percentage picked in advance. Narrowing the
                department filter changes the comparison group, so the same person can be flagged
                company-wide but clean within their own department (or vice versa) if their teammates
                share the same pattern.
              </p>
              <ul className="mt-8 list-disc space-y-4 pl-20 text-text-muted">
                <li>An employee needs at least <b className="text-text">3 attendance records</b> in the period before being scored at all — one late day out of one record isn't a "100% late" anomaly, it's just missing data.</li>
                <li>At least <b className="text-text">4 employees</b> are required in the comparison group before any anomaly is computed. Below that, the page says so explicitly instead of silently showing "no anomalies" — for exactly 2 data points, the statistical spread always works out so no point can ever cross the threshold, so a 2-person comparison can't produce a meaningful answer either way.</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-text">Leave Runway — how "months of runway" is projected</div>
              <p className="mt-4 text-text-muted">
                For each approved leave allocation, the page computes the employee's real historical
                consumption rate — approved days taken so far, divided by the months the allocation has
                actually been active — and projects that rate forward against the remaining balance.
                An allocation is flagged "at risk" when it's on track to run out within the runway
                threshold you set above. Nothing here is a guess; it's the same arithmetic HR would do
                by hand, just kept current automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="grid grid-cols-4 gap-16 pt-24">
          <div className="space-y-4">
            <Label>Period Start</Label>
            <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
          </div>
          <div className="space-y-4">
            <Label>Period End</Label>
            <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
          </div>
          <div className="space-y-4">
            <Label>Department</Label>
            <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">All departments</option>
              {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
          <div className="space-y-4">
            <Label>Runway alert threshold (months)</Label>
            <Input type="number" min={0.5} step={0.5} value={runwayMonths} onChange={(e) => setRunwayMonths(Number(e.target.value) || 2)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-8"><AlertTriangle className="h-16 w-16" /> Attendance Anomalies</CardTitle></CardHeader>
        <CardContent>
          {!anomaliesLoading && anomalies && (
            <div className="mb-12 rounded-md bg-[color-mix(in_srgb,var(--primary)_6%,transparent)] px-12 py-8 text-xs text-text-muted">
              Compared against <b className="text-text">{selectedDeptName || 'all departments'}</b> only
              (<b className="text-text">{anomalies.population_size}</b> {anomalies.population_size === 1 ? 'employee' : 'employees'} in this period) —
              narrowing the department filter changes who counts as "anomalous," since it's always relative to whoever is currently being compared, never a fixed global threshold. The
              same person can be flagged company-wide but not within their own department if their teammates share the same pattern, or vice versa.
            </div>
          )}
          {anomaliesLoading ? (
            <CardSkeleton />
          ) : !anomalies ? null : anomalies.population_too_small ? (
            <div className="rounded-md bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] px-16 py-12 text-sm text-warning">{anomalies.warning}</div>
          ) : flaggedEmployees.length === 0 ? (
            <EmptyState icon={Activity} title="No anomalies" description={`No employee's late/absence rate exceeded the population threshold for this period. ${anomalies.method}`} />
          ) : (
            <>
              <p className="mb-12 text-xs text-text-muted">{anomalies.method}</p>
              <Table>
                <Thead>
                  <tr>
                    <Th>Employee</Th>
                    <Th>Department</Th>
                    <Th>Late Rate</Th>
                    <Th>Absent Rate</Th>
                    <Th>Days Sampled</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {flaggedEmployees.map((e) => (
                    <Tr key={e.employee_id}>
                      <Td className="font-medium">{e.first_name} {e.last_name} <span className="font-mono text-xs text-text-muted">({e.employee_code})</span></Td>
                      <Td>{e.department || '—'}</Td>
                      <Td className={cn('font-mono', e.is_late_anomaly && 'font-semibold text-danger')}>{(e.late_rate * 100).toFixed(1)}%</Td>
                      <Td className={cn('font-mono', e.is_absence_anomaly && 'font-semibold text-danger')}>{(e.absent_rate * 100).toFixed(1)}%</Td>
                      <Td className="font-mono text-text-muted">{e.total_days}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-8"><CalendarClock className="h-16 w-16" /> Leave Runway At Risk</CardTitle></CardHeader>
        <CardContent>
          {forecastLoading ? (
            <CardSkeleton />
          ) : !forecast ? null : forecast.at_risk_allocations.length === 0 ? (
            <EmptyState icon={CalendarClock} title="Nothing at risk" description={`No approved allocation is projected to run out within ${runwayMonths} month(s) at its current consumption pace.`} />
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Employee</Th>
                  <Th>Type</Th>
                  <Th>Remaining</Th>
                  <Th>Avg Monthly Use</Th>
                  <Th>Runway</Th>
                </tr>
              </Thead>
              <Tbody>
                {forecast.at_risk_allocations.map((a, i) => (
                  <Tr key={`${a.employee_id}-${i}`}>
                    <Td className="font-medium">{a.first_name} {a.last_name}</Td>
                    <Td>{a.type_name}</Td>
                    <Td className="font-mono">{a.remaining}</Td>
                    <Td className="font-mono">{a.avg_monthly_consumption}</Td>
                    <Td className="font-mono font-semibold text-warning">{a.months_of_runway} mo</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {forecast && forecast.department_load.length > 0 && (
            <div className="mt-24">
              <div className="mb-8 text-sm font-medium text-text">Department Leave Load (this period)</div>
              <Table>
                <Thead>
                  <tr>
                    <Th>Department</Th>
                    <Th>Approved Days</Th>
                    <Th>Pending Days</Th>
                  </tr>
                </Thead>
                <Tbody>
                  {forecast.department_load.map((d) => (
                    <Tr key={d.department}>
                      <Td className="font-medium">{d.department}</Td>
                      <Td className="font-mono">{d.approved_days}</Td>
                      <Td className="font-mono text-text-muted">{d.pending_days}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
