'use strict';

const pool = require('../db/pool');

/**
 * The real dashboard aggregation core, extracted so both the Dashboard route and the AI
 * Assistant (ai.controller.js) call the identical, already-correct queries — the AI never gets
 * its own parallel data-fetching path that could show a different number than the Dashboard for
 * the same filters. Every number here is computed live (CLAUDE.md Dynamic Data Mandate).
 */
async function getDashboardData({ period_start, period_end, department_id, employee_type } = {}) {
  // Shared filter fragments, applied consistently across every query below.
  const payslipFilters = [];
  const payslipParams = [];
  if (period_start) { payslipParams.push(period_start); payslipFilters.push(`p.period_start >= $${payslipParams.length}`); }
  if (period_end) { payslipParams.push(period_end); payslipFilters.push(`p.period_end <= $${payslipParams.length}`); }
  if (department_id) { payslipParams.push(department_id); payslipFilters.push(`e.department_id = $${payslipParams.length}`); }
  if (employee_type) { payslipParams.push(employee_type); payslipFilters.push(`e.employee_type = $${payslipParams.length}`); }
  const payslipWhere = payslipFilters.length ? `AND ${payslipFilters.join(' AND ')}` : '';

  const { rows: kpiRows } = await pool.query(
    `SELECT
       COALESCE(SUM(pl.amount) FILTER (WHERE pl.category = 'net'), 0) AS total_net_paid,
       COALESCE(AVG(pl.amount) FILTER (WHERE pl.category = 'net'), 0) AS average_salary
     FROM payslips p
     JOIN employees e ON e.id = p.employee_id
     LEFT JOIN payslip_lines pl ON pl.payslip_id = p.id
     WHERE p.status = 'paid' ${payslipWhere}`,
    payslipParams
  );

  const { rows: generatedRows } = await pool.query(
    `SELECT COUNT(DISTINCT p.id) AS payslips_generated
     FROM payslips p
     JOIN employees e ON e.id = p.employee_id
     WHERE p.status IN ('computed', 'validated', 'paid') ${payslipWhere}`,
    payslipParams
  );

  const timeOffParams = [];
  let timeOffWhere = `r.status = 'approved'`;
  if (period_start) { timeOffParams.push(period_start); timeOffWhere += ` AND r.date_to >= $${timeOffParams.length}`; }
  if (period_end) { timeOffParams.push(period_end); timeOffWhere += ` AND r.date_from <= $${timeOffParams.length}`; }
  if (department_id) { timeOffParams.push(department_id); timeOffWhere += ` AND e.department_id = $${timeOffParams.length}`; }
  if (employee_type) { timeOffParams.push(employee_type); timeOffWhere += ` AND e.employee_type = $${timeOffParams.length}`; }
  const { rows: timeOffRows } = await pool.query(
    `SELECT COALESCE(SUM(r.duration), 0) AS approved_days
     FROM time_off_requests r JOIN employees e ON e.id = r.employee_id
     WHERE ${timeOffWhere}`,
    timeOffParams
  );

  const attendanceParams = [];
  let attendanceWhere = '1=1';
  if (period_start) { attendanceParams.push(period_start); attendanceWhere += ` AND a.check_in::date >= $${attendanceParams.length}`; }
  if (period_end) { attendanceParams.push(period_end); attendanceWhere += ` AND a.check_in::date <= $${attendanceParams.length}`; }
  if (department_id) { attendanceParams.push(department_id); attendanceWhere += ` AND e.department_id = $${attendanceParams.length}`; }
  if (employee_type) { attendanceParams.push(employee_type); attendanceWhere += ` AND e.employee_type = $${attendanceParams.length}`; }
  const { rows: attRows } = await pool.query(
    `SELECT
       COUNT(*) FILTER (WHERE a.status = 'present') AS present,
       COUNT(*) FILTER (WHERE a.status = 'late') AS late,
       COUNT(*) FILTER (WHERE a.status = 'absent') AS absent,
       COUNT(*) FILTER (WHERE a.status = 'overtime') AS overtime,
       COUNT(*) FILTER (WHERE a.status = 'missing_checkout' OR a.check_out IS NULL) AS missing_checkouts,
       COUNT(*) FILTER (WHERE a.is_manual_correction) AS manual_edits,
       COUNT(*) AS total
     FROM attendances a JOIN employees e ON e.id = a.employee_id WHERE ${attendanceWhere}`,
    attendanceParams
  );
  const att = attRows[0];
  const totalAtt = Number(att.total);
  const healthyCount = Number(att.present) + Number(att.late) + Number(att.overtime);
  const attendance_health_pct = totalAtt > 0 ? Math.round((healthyCount / totalAtt) * 10000) / 100 : 0;

  const { rows: byDept } = await pool.query(
    `SELECT d.name AS department, COUNT(DISTINCT p.employee_id) AS headcount,
            COALESCE(SUM(pl.amount) FILTER (WHERE pl.category = 'net'), 0) AS total_net_cost
     FROM payslips p
     JOIN employees e ON e.id = p.employee_id
     JOIN departments d ON d.id = e.department_id
     LEFT JOIN payslip_lines pl ON pl.payslip_id = p.id
     WHERE p.status = 'paid' ${payslipWhere}
     GROUP BY d.name ORDER BY total_net_cost DESC`,
    payslipParams
  );

  const { rows: trend } = await pool.query(
    `SELECT to_char(p.period_start::date, 'YYYY-MM') AS month,
            COALESCE(SUM(pl.amount) FILTER (WHERE pl.category = 'net'), 0) AS total_net
     FROM payslips p
     JOIN employees e ON e.id = p.employee_id
     LEFT JOIN payslip_lines pl ON pl.payslip_id = p.id
     WHERE p.status = 'paid' ${payslipWhere}
     GROUP BY month ORDER BY month ASC`,
    payslipParams
  );

  const { rows: alerts } = await pool.query(
    `SELECT warning_type, COUNT(*) AS count
     FROM payroll_warnings WHERE resolved = false
     GROUP BY warning_type ORDER BY count DESC`
  );

  const pendingParams = [];
  let pendingWhere = `r.status = 'submitted'`;
  if (department_id) { pendingParams.push(department_id); pendingWhere += ` AND e.department_id = $${pendingParams.length}`; }
  if (employee_type) { pendingParams.push(employee_type); pendingWhere += ` AND e.employee_type = $${pendingParams.length}`; }
  const { rows: pendingRows } = await pool.query(
    `SELECT COUNT(*) AS pending FROM time_off_requests r JOIN employees e ON e.id = r.employee_id WHERE ${pendingWhere}`,
    pendingParams
  );

  const { rows: deptOverview } = await pool.query(
    `SELECT d.name AS department,
            COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'active') AS headcount,
            COALESCE(SUM(pl.amount) FILTER (WHERE pl.category = 'net' AND p.status = 'paid'), 0) AS total_salary
     FROM departments d
     LEFT JOIN employees e ON e.department_id = d.id
     LEFT JOIN payslips p ON p.employee_id = e.id
     LEFT JOIN payslip_lines pl ON pl.payslip_id = p.id
     GROUP BY d.name ORDER BY d.name ASC`
  );

  return {
    kpis: {
      total_net_paid: Number(kpiRows[0].total_net_paid),
      payslips_generated: Number(generatedRows[0].payslips_generated),
      average_salary: Math.round(Number(kpiRows[0].average_salary) * 100) / 100,
      approved_time_off_days: Number(timeOffRows[0].approved_days),
      attendance_health_pct,
    },
    salary_cost_by_department: byDept.map((r) => ({ department: r.department, headcount: Number(r.headcount), total_net_cost: Number(r.total_net_cost) })),
    monthly_net_salary_trend: trend.map((r) => ({ month: r.month, total_net: Number(r.total_net) })),
    payroll_alerts: alerts.map((r) => ({ warning_type: r.warning_type, count: Number(r.count) })),
    attendance_overview: {
      present: Number(att.present), late: Number(att.late), absent: Number(att.absent),
      overtime: Number(att.overtime), missing_checkouts: Number(att.missing_checkouts),
      manual_edits: Number(att.manual_edits),
    },
    time_off_overview: {
      approved_days: Number(timeOffRows[0].approved_days),
      pending_requests: Number(pendingRows[0].pending),
    },
    department_overview: deptOverview.map((r) => ({
      department: r.department, headcount: Number(r.headcount), total_salary: Number(r.total_salary),
    })),
  };
}

module.exports = { getDashboardData };
