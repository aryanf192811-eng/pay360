'use strict';

const pool = require('../db/pool');
const { sendSuccess } = require('../utils/response');

/**
 * Tier 3 "Attendance/leave intelligence" (CLAUDE.md: "good product ideas, not PS-required" —
 * explicitly optional, built after Tier 0-2 were solid). Deliberately NOT a black-box model:
 * every number here is a real, explainable statistic computed live from attendance/time-off
 * rows (Dynamic Data Mandate) — an "anomaly" is "more than 1.5 standard deviations above this
 * exact population's own mean for this exact period," not a hidden hardcoded percentage, so an
 * HR user can always ask "anomalous compared to what?" and get a real, auditable answer.
 */

const Z_THRESHOLD = 1.5; // stddev multiplier past the mean before a rate counts as anomalous
const MIN_SAMPLE_DAYS = 3; // an employee needs at least this many attendance rows in the window
// to be scored at all — a single late day for someone with 1 attendance row isn't a "100% late
// rate anomaly", it's just no data. Below this, the employee is simply excluded from scoring.
const MIN_POPULATION_SIZE = 4; // a real statistical property, not a tuning knob: for exactly 2
// points, every population's stddev always equals precisely half their absolute difference, so
// each point's z-score is always exactly 1.0 - no 2-point population can EVER cross a 1.5x
// threshold, regardless of how extreme one value looks. Below this size, "anomalous compared to
// what?" doesn't have a meaningful answer, so the endpoint says so explicitly instead of quietly
// returning `false` for everyone in a way that reads as "nothing's wrong."

// ─── GET /api/insights/attendance-anomalies?department_id=&period_start=&period_end= ───────────

async function attendanceAnomalies(req, res, next) {
  try {
    const { department_id, period_start, period_end } = req.query;
    if (!period_start || !period_end) {
      const e = new Error('period_start and period_end are required'); e.statusCode = 422; throw e;
    }
    if (new Date(period_end) < new Date(period_start)) {
      const e = new Error('period_end must not be before period_start'); e.statusCode = 422; throw e;
    }

    const params = [period_start, period_end];
    let deptFilter = '';
    if (department_id) { params.push(department_id); deptFilter = `AND e.department_id = $${params.length}`; }

    const { rows } = await pool.query(
      `WITH employee_stats AS (
         SELECT
           e.id AS employee_id, e.first_name, e.last_name, e.employee_code,
           d.name AS department,
           COUNT(a.id) AS total_days,
           COUNT(*) FILTER (WHERE a.status = 'late') AS late_count,
           COUNT(*) FILTER (WHERE a.status = 'absent') AS absent_count,
           COUNT(*) FILTER (WHERE a.check_out IS NULL) AS missing_checkout_count,
           (COUNT(*) FILTER (WHERE a.status = 'late'))::numeric / NULLIF(COUNT(a.id), 0) AS late_rate,
           (COUNT(*) FILTER (WHERE a.status = 'absent'))::numeric / NULLIF(COUNT(a.id), 0) AS absent_rate
         FROM employees e
         LEFT JOIN departments d ON d.id = e.department_id
         LEFT JOIN attendances a
           ON a.employee_id = e.id AND a.check_in::date BETWEEN $1::date AND $2::date
         WHERE e.status = 'active' ${deptFilter}
         GROUP BY e.id, e.first_name, e.last_name, e.employee_code, d.name
         HAVING COUNT(a.id) >= ${MIN_SAMPLE_DAYS}
       ),
       population AS (
         SELECT AVG(late_rate) AS mean_late, STDDEV_POP(late_rate) AS sd_late,
                AVG(absent_rate) AS mean_absent, STDDEV_POP(absent_rate) AS sd_absent
         FROM employee_stats
       )
       SELECT es.*, p.mean_late, p.sd_late, p.mean_absent, p.sd_absent,
         (es.late_rate > p.mean_late + ${Z_THRESHOLD} * GREATEST(p.sd_late, 0.01)) AS is_late_anomaly,
         (es.absent_rate > p.mean_absent + ${Z_THRESHOLD} * GREATEST(p.sd_absent, 0.01)) AS is_absence_anomaly
       FROM employee_stats es CROSS JOIN population p
       ORDER BY (es.late_rate + es.absent_rate) DESC`,
      params
    );

    const toNum = (v) => (v === null ? null : Number(v));
    const scored = rows.map((r) => ({
      employee_id: r.employee_id,
      first_name: r.first_name,
      last_name: r.last_name,
      employee_code: r.employee_code,
      department: r.department,
      total_days: Number(r.total_days),
      late_count: Number(r.late_count),
      absent_count: Number(r.absent_count),
      missing_checkout_count: Number(r.missing_checkout_count),
      late_rate: Math.round(toNum(r.late_rate) * 1000) / 1000,
      absent_rate: Math.round(toNum(r.absent_rate) * 1000) / 1000,
      is_late_anomaly: r.is_late_anomaly,
      is_absence_anomaly: r.is_absence_anomaly,
    }));

    const populationTooSmall = rows.length < MIN_POPULATION_SIZE;
    return sendSuccess(res, {
      period: { start: period_start, end: period_end },
      method: `Flagged when an employee's rate exceeds this exact population's mean by more than ${Z_THRESHOLD}x its standard deviation for the same period (minimum ${MIN_SAMPLE_DAYS} attendance records to be scored).`,
      population_size: rows.length,
      population_too_small: populationTooSmall,
      ...(populationTooSmall && {
        warning: `Only ${rows.length} employee(s) had enough attendance data to compare (need at least ${MIN_POPULATION_SIZE}) — anomaly flags below are not statistically meaningful at this sample size and are omitted.`,
      }),
      employees: populationTooSmall
        ? scored.map(({ is_late_anomaly, is_absence_anomaly, ...rest }) => rest)
        : scored,
      anomaly_count: populationTooSmall ? null : scored.filter((s) => s.is_late_anomaly || s.is_absence_anomaly).length,
    });
  } catch (err) { next(err); }
}

// ─── GET /api/insights/leave-forecast?department_id=&period_start=&period_end=&runway_months= ──

async function leaveForecast(req, res, next) {
  try {
    const { department_id, period_start, period_end } = req.query;
    const runwayThreshold = req.query.runway_months ? Number(req.query.runway_months) : 2;
    if (!period_start || !period_end) {
      const e = new Error('period_start and period_end are required'); e.statusCode = 422; throw e;
    }
    if (new Date(period_end) < new Date(period_start)) {
      const e = new Error('period_end must not be before period_start'); e.statusCode = 422; throw e;
    }
    if (!Number.isFinite(runwayThreshold) || runwayThreshold <= 0) {
      const e = new Error('runway_months must be a positive number'); e.statusCode = 422; throw e;
    }

    const deptParams = [period_start, period_end];
    let deptFilter = '';
    if (department_id) { deptParams.push(department_id); deptFilter = `AND d.id = $${deptParams.length}`; }

    // Projected load: real approved + submitted (pending) requests overlapping the given window,
    // grouped by department — "how many leave-days is this department on the hook for" is a
    // staffing-planning number a manager can act on before the period arrives.
    const { rows: byDepartment } = await pool.query(
      `SELECT d.name AS department,
              COALESCE(SUM(r.duration) FILTER (WHERE r.status = 'approved'), 0) AS approved_days,
              COALESCE(SUM(r.duration) FILTER (WHERE r.status = 'submitted'), 0) AS pending_days
       FROM departments d
       LEFT JOIN employees e ON e.department_id = d.id
       LEFT JOIN time_off_requests r
         ON r.employee_id = e.id
         AND r.date_from <= $2::date AND r.date_to >= $1::date
         AND r.status IN ('approved', 'submitted')
       WHERE 1=1 ${deptFilter}
       GROUP BY d.name
       ORDER BY d.name`,
      deptParams
    );

    // Runway: for each approved allocation, its real historical consumption rate (approved days
    // taken per month since valid_from) projected forward against its real remaining balance —
    // "at this pace, this allocation runs out in N months." Never a hardcoded burn rate.
    const { rows: runway } = await pool.query(
      `WITH consumption AS (
         SELECT a.id AS allocation_id, a.employee_id, a.time_off_type_id, a.allocated, a.valid_from, a.valid_to,
                COALESCE(SUM(r.duration) FILTER (WHERE r.status = 'approved'), 0) AS taken,
                GREATEST(EXTRACT(EPOCH FROM (LEAST(COALESCE(a.valid_to::timestamptz, now()), now()) - a.valid_from::timestamptz)) / (86400.0 * 30), 1) AS months_active
         FROM time_off_allocations a
         LEFT JOIN time_off_requests r ON r.allocation_id = a.id
         WHERE a.status = 'approved'
         GROUP BY a.id
       )
       SELECT c.allocation_id, c.employee_id, e.first_name, e.last_name, t.name AS type_name,
              c.allocated, c.taken, (c.allocated - c.taken) AS remaining,
              (c.taken / c.months_active) AS avg_monthly_consumption
       FROM consumption c
       JOIN employees e ON e.id = c.employee_id
       JOIN time_off_types t ON t.id = c.time_off_type_id
       WHERE e.status = 'active' ${department_id ? 'AND e.department_id = $1' : ''}
       ORDER BY (c.allocated - c.taken) ASC`,
      department_id ? [department_id] : []
    );

    const atRisk = runway
      .map((r) => {
        const remaining = Number(r.remaining);
        const rate = Number(r.avg_monthly_consumption);
        const monthsOfRunway = rate > 0 ? Math.round((remaining / rate) * 10) / 10 : null;
        return {
          employee_id: r.employee_id,
          first_name: r.first_name,
          last_name: r.last_name,
          type_name: r.type_name,
          allocated: Number(r.allocated),
          taken: Number(r.taken),
          remaining,
          avg_monthly_consumption: Math.round(rate * 100) / 100,
          months_of_runway: monthsOfRunway,
        };
      })
      .filter((r) => r.months_of_runway !== null && r.months_of_runway < runwayThreshold);

    return sendSuccess(res, {
      period: { start: period_start, end: period_end },
      department_load: byDepartment.map((d) => ({
        department: d.department,
        approved_days: Number(d.approved_days),
        pending_days: Number(d.pending_days),
      })),
      runway_threshold_months: runwayThreshold,
      at_risk_allocations: atRisk,
    });
  } catch (err) { next(err); }
}

module.exports = { attendanceAnomalies, leaveForecast };
