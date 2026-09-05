'use strict';

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./pool');
const logger = require('../utils/logger');
const { logAudit } = require('../utils/audit');
const { computePayrun } = require('../services/payrollEngine.service');

// Fixed "today" the demo data is built around — matches whatever the real clock says at seed
// time, so re-running this script later keeps the story coherent (payruns still land in the
// past, "today" attendance still makes sense) instead of drifting stale.
const TODAY = new Date();
function isoDate(d) {
  return d.toISOString().slice(0, 10);
}
function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

// Deterministic-ish pseudo-random so the seed produces a stable, reviewable demo instead of a
// different anomaly pattern every run.
let rngState = 42;
function rand() {
  rngState = (rngState * 1103515245 + 12345) & 0x7fffffff;
  return rngState / 0x7fffffff;
}

async function seed() {
  try {
    logger.info('Starting seed script...');

    // ── 0. Clean slate — delete in FK-safe order so this script is re-runnable and never
    // accumulates stray test data from manual QA sessions (scratch payruns, throwaway accounts).
    // Departments/schedules/employees are NOT deleted — they're upserted below, keyed by their
    // natural unique identifiers, so re-seeding never orphans a real employee record.
    logger.info('Clearing previous demo/test data...');
    await pool.query(`DELETE FROM audit_logs`);
    await pool.query(`DELETE FROM payroll_warnings`);
    await pool.query(`DELETE FROM payslip_lines`);
    await pool.query(`DELETE FROM payslips`);
    await pool.query(`DELETE FROM payrun_employees`);
    await pool.query(`DELETE FROM payruns`);
    await pool.query(`DELETE FROM time_off_requests`);
    await pool.query(`DELETE FROM time_off_allocations`);
    await pool.query(`DELETE FROM time_off_types`);
    await pool.query(`DELETE FROM attendances`);
    await pool.query(`DELETE FROM contracts`);
    await pool.query(`DELETE FROM salary_rules`);
    await pool.query(`DELETE FROM salary_structures`);

    // 1. Departments
    logger.info('Seeding departments...');
    const depts = ['Engineering', 'Human Resources', 'Sales'];
    const deptIds = {};
    for (const d of depts) {
      const res = await pool.query(
        `INSERT INTO departments (name) VALUES ($1)
         ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
         RETURNING id`,
        [d]
      );
      deptIds[d] = res.rows[0].id;
    }

    // 2. Working Schedules
    logger.info('Seeding working schedules...');
    const schedules = [
      { name: 'Standard 40h', type: 'full_time' },
      { name: 'Part Time 20h', type: 'part_time' },
    ];
    const schedIds = {};
    for (const s of schedules) {
      let res = await pool.query(`SELECT id FROM working_schedules WHERE name = $1`, [s.name]);
      if (res.rows.length === 0) {
        res = await pool.query(
          `INSERT INTO working_schedules (name, schedule_type) VALUES ($1, $2) RETURNING id`,
          [s.name, s.type]
        );
      }
      schedIds[s.name] = res.rows[0].id;

      await pool.query(`DELETE FROM schedule_lines WHERE schedule_id = $1`, [schedIds[s.name]]);

      if (s.type === 'full_time') {
        for (let i = 1; i <= 5; i++) {
          await pool.query(
            `INSERT INTO schedule_lines (schedule_id, day_of_week, start_time, end_time, break_minutes)
             VALUES ($1, $2, '09:00', '18:00', 60)`,
            [schedIds[s.name], i]
          );
        }
      } else {
        for (let i = 1; i <= 5; i++) {
          await pool.query(
            `INSERT INTO schedule_lines (schedule_id, day_of_week, start_time, end_time, break_minutes)
             VALUES ($1, $2, '09:00', '13:00', 0)`,
            [schedIds[s.name], i]
          );
        }
      }
    }

    // 3. Employees + linked login accounts
    // job_position and bank_account_number are deliberately incomplete for two employees
    // (Frank, Heidi) and Grace gets no contract at all further down — real, live-computed
    // payroll_warnings (missing_bank_details / contract_missing) come from these gaps, not from
    // a fabricated warnings list.
    logger.info('Seeding employees...');
    const employees = [
      { code: 'EMP-001', first: 'Alice', last: 'Admin', email: 'alice.admin@example.com', dept: 'Human Resources', type: 'full_time', sched: 'Standard 40h', role: 'admin', position: 'HR Director', bank: '000111222001', hire: '2023-01-01' },
      { code: 'EMP-002', first: 'Bob', last: 'HR', email: 'bob.hr@example.com', dept: 'Human Resources', type: 'full_time', sched: 'Standard 40h', role: 'hr_manager', position: 'HR Manager', bank: '000111222002', hire: '2023-03-01' },
      { code: 'EMP-003', first: 'Charlie', last: 'Payroll', email: 'charlie.payroll@example.com', dept: 'Human Resources', type: 'full_time', sched: 'Standard 40h', role: 'hr_payroll_user', position: 'Payroll Specialist', bank: '000111222003', hire: '2023-06-01' },
      { code: 'EMP-004', first: 'Diana', last: 'PayrollMgr', email: 'diana.pm@example.com', dept: 'Human Resources', type: 'full_time', sched: 'Standard 40h', role: 'hr_payroll_manager', position: 'Payroll Manager', bank: '000111222004', hire: '2023-01-15' },
      { code: 'EMP-005', first: 'Eve', last: 'Engineer', email: 'eve.engineer@example.com', dept: 'Engineering', type: 'full_time', sched: 'Standard 40h', role: 'employee', position: 'Senior Software Engineer', bank: '000111222005', hire: '2024-01-01' },
      { code: 'EMP-006', first: 'Frank', last: 'Engineer', email: 'frank.engineer@example.com', dept: 'Engineering', type: 'full_time', sched: 'Standard 40h', role: 'employee', position: 'Software Engineer', bank: null, hire: '2024-06-01' },
      { code: 'EMP-007', first: 'Grace', last: 'Sales', email: 'grace.sales@example.com', dept: 'Sales', type: 'full_time', sched: 'Standard 40h', role: 'employee', position: 'Sales Executive', bank: '000111222007', hire: '2025-05-01' },
      { code: 'EMP-008', first: 'Heidi', last: 'SalesPT', email: 'heidi.sales@example.com', dept: 'Sales', type: 'part_time', sched: 'Part Time 20h', role: 'employee', position: 'Sales Associate', bank: null, hire: '2025-06-01' },
      { code: 'EMP-009', first: 'Ivan', last: 'Contractor', email: 'ivan.c@example.com', dept: 'Engineering', type: 'contract', sched: 'Standard 40h', role: 'employee', position: 'Contract Developer', bank: '000111222009', hire: '2025-03-01' },
    ];

    const passwordHash = await bcrypt.hash('SeedPass1!', 10);
    const empIds = {};
    const userIds = {};

    for (const e of employees) {
      const res = await pool.query(
        `INSERT INTO employees (employee_code, first_name, last_name, email, department_id, schedule_id, employee_type, status, hire_date, job_position, bank_account_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8, $9, $10)
         ON CONFLICT (employee_code) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            department_id = EXCLUDED.department_id,
            schedule_id = EXCLUDED.schedule_id,
            job_position = EXCLUDED.job_position,
            bank_account_number = EXCLUDED.bank_account_number,
            hire_date = EXCLUDED.hire_date
         RETURNING id`,
        [e.code, e.first, e.last, e.email, deptIds[e.dept], schedIds[e.sched], e.type, e.hire, e.position, e.bank]
      );
      empIds[e.code] = res.rows[0].id;

      const userRes = await pool.query(
        `INSERT INTO users (email, password_hash, role, employee_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE SET
            role = EXCLUDED.role,
            employee_id = EXCLUDED.employee_id
         RETURNING id`,
        [e.email, passwordHash, e.role, empIds[e.code]]
      );
      userIds[e.code] = userRes.rows[0].id;
    }

    // Remove stray accounts created ad-hoc during manual QA (never part of the canonical demo
    // roster) — safe now that audit_logs/time_off rows referencing users are already cleared.
    const canonicalEmails = employees.map((e) => e.email);
    await pool.query(`DELETE FROM users WHERE email <> ALL($1::citext[])`, [canonicalEmails]);

    // Org structure: Alice leads HR directly; Bob manages the payroll specialists; Eve leads
    // the engineers she works alongside; Grace leads sales.
    await pool.query(`UPDATE employees SET manager_id = $1 WHERE employee_code IN ('EMP-002')`, [empIds['EMP-001']]);
    await pool.query(`UPDATE employees SET manager_id = $1 WHERE employee_code IN ('EMP-003', 'EMP-004')`, [empIds['EMP-002']]);
    await pool.query(`UPDATE employees SET manager_id = $1 WHERE employee_code IN ('EMP-006', 'EMP-009')`, [empIds['EMP-005']]);
    await pool.query(`UPDATE employees SET manager_id = $1 WHERE employee_code IN ('EMP-008')`, [empIds['EMP-007']]);

    const actorUserId = userIds['EMP-004']; // Diana, hr_payroll_manager — attributed as the actor for seeded audit events

    // 4. Salary Structures + Rules
    // "Regular Salary" mirrors a typical Indian payroll breakup (HRA % of Basic, PF deduction),
    // computed live by the same engine real payruns use — nothing here is a pre-baked number.
    logger.info('Seeding salary structures & rules...');
    async function upsertStructure(name) {
      const res = await pool.query(
        `INSERT INTO salary_structures (name, active) VALUES ($1, true)
         ON CONFLICT (name) DO UPDATE SET active = true
         RETURNING id`,
        [name]
      );
      return res.rows[0].id;
    }
    const regularStructId = await upsertStructure('Regular Salary');
    const contractorStructId = await upsertStructure('Contractor Rate');
    await pool.query(`DELETE FROM salary_rules WHERE structure_id IN ($1, $2)`, [regularStructId, contractorStructId]);

    async function addRule(structureId, r) {
      await pool.query(
        `INSERT INTO salary_rules (structure_id, name, code, category, sequence, computation_method, amount, percentage, base_code, formula, active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)`,
        [structureId, r.name, r.code, r.category, r.sequence, r.method, r.amount ?? null, r.percentage ?? null, r.base_code ?? null, r.formula ?? null]
      );
    }
    await addRule(regularStructId, { name: 'House Rent Allowance', code: 'HRA', category: 'allowance', sequence: 10, method: 'percentage', percentage: 40, base_code: 'BASIC' });
    await addRule(regularStructId, { name: 'Gross Salary', code: 'GROSS', category: 'gross', sequence: 20, method: 'formula', formula: 'BASIC + HRA' });
    await addRule(regularStructId, { name: 'Provident Fund', code: 'PF', category: 'deduction', sequence: 30, method: 'percentage', percentage: 12, base_code: 'BASIC' });
    await addRule(regularStructId, { name: 'Net Salary', code: 'NET', category: 'net', sequence: 40, method: 'formula', formula: 'GROSS - PF' });

    await addRule(contractorStructId, { name: 'Gross Salary', code: 'GROSS', category: 'gross', sequence: 10, method: 'formula', formula: 'BASIC' });
    await addRule(contractorStructId, { name: 'Net Salary', code: 'NET', category: 'net', sequence: 20, method: 'formula', formula: 'GROSS' });

    // 5. Contracts
    // Grace deliberately has NO contract at all — the live contract_missing warning and the
    // Payroll Preflight block on validate() both come from this real gap, not a fake row.
    // Eve has two contracts (a real raise, old one properly closed) so payslip diff / audit
    // timeline / what-if simulator all have a genuine before/after to show.
    logger.info('Seeding contracts...');
    async function addContract(code, { position, wage, structureId, dateStart, dateEnd, status }) {
      const res = await pool.query(
        `INSERT INTO contracts (employee_id, department_id, position, wage, salary_structure_id, date_start, date_end, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [empIds[code], null, position, wage, structureId, dateStart, dateEnd, status]
      );
      await logAudit(pool, {
        tableName: 'contracts', recordId: res.rows[0].id, userId: actorUserId, action: 'create',
        changedFields: { employee_id: empIds[code], wage, salary_structure_id: structureId, date_start: dateStart, date_end: dateEnd, status },
      });
      return res.rows[0].id;
    }

    await addContract('EMP-001', { position: 'HR Director', wage: 95000, structureId: regularStructId, dateStart: '2023-01-01', dateEnd: null, status: 'active' });
    await addContract('EMP-002', { position: 'HR Manager', wage: 75000, structureId: regularStructId, dateStart: '2023-03-01', dateEnd: null, status: 'active' });
    await addContract('EMP-003', { position: 'Payroll Specialist', wage: 65000, structureId: regularStructId, dateStart: '2023-06-01', dateEnd: null, status: 'active' });
    await addContract('EMP-004', { position: 'Payroll Manager', wage: 85000, structureId: regularStructId, dateStart: '2023-01-15', dateEnd: null, status: 'active' });
    // Eve's raise: old contract properly closed (date_end set) rather than status flipped to
    // 'expired' — the payroll engine only resolves contracts WHERE status = 'active' regardless
    // of date range, so a superseded-but-historically-valid contract must stay 'active' with its
    // date range closed off. The exclusion constraint only blocks OVERLAPPING active ranges, so
    // both of Eve's contracts being 'active' at once is fine since 2024-01-01..2026-08-31 and
    // 2026-09-01.. don't overlap.
    await addContract('EMP-005', { position: 'Senior Software Engineer', wage: 85000, structureId: regularStructId, dateStart: '2024-01-01', dateEnd: '2026-08-31', status: 'active' });
    await addContract('EMP-005', { position: 'Senior Software Engineer', wage: 95000, structureId: regularStructId, dateStart: '2026-09-01', dateEnd: null, status: 'active' });
    await addContract('EMP-006', { position: 'Software Engineer', wage: 70000, structureId: regularStructId, dateStart: '2024-06-01', dateEnd: null, status: 'active' });
    // EMP-007 Grace: intentionally no contract.
    await addContract('EMP-008', { position: 'Sales Associate', wage: 35000, structureId: regularStructId, dateStart: '2025-06-01', dateEnd: null, status: 'active' });
    await addContract('EMP-009', { position: 'Contract Developer', wage: 80000, structureId: contractorStructId, dateStart: '2025-03-01', dateEnd: null, status: 'active' });

    // 6. Attendance
    // Real check-in/out rows across July 1 -> yesterday for every attendance-tracked employee
    // (contractors are exempt, matching real-world practice). Frank is deliberately given an
    // elevated late-rate so the Insights attendance-anomaly detector has a genuine outlier to
    // find against the rest of the population, not a hand-picked "anomalous" flag.
    logger.info('Seeding attendance records...');
    const attendanceEmployees = ['EMP-001', 'EMP-002', 'EMP-003', 'EMP-004', 'EMP-005', 'EMP-006', 'EMP-007', 'EMP-008'];
    const rangeStart = new Date('2026-07-01T00:00:00Z');
    const rangeEnd = addDays(TODAY, -1); // through yesterday — "today" itself may be mid-day/unworked yet

    for (const code of attendanceEmployees) {
      const isPartTime = code === 'EMP-008';
      const startHour = 9;
      const endHour = isPartTime ? 13 : 18;
      const lateRate = code === 'EMP-006' ? 0.35 : 0.08; // Frank: real outlier, not a flag
      const absentRate = code === 'EMP-006' ? 0.05 : 0.02;

      for (let d = new Date(rangeStart); d <= rangeEnd; d = addDays(d, 1)) {
        const dow = d.getUTCDay(); // 0 = Sunday
        if (dow === 0 || dow === 6) continue; // weekends only, matches the seeded Mon-Fri schedules

        const dateStr = isoDate(d);
        const roll = rand();

        if (roll < absentRate) {
          const checkIn = `${dateStr}T${String(startHour).padStart(2, '0')}:00:00Z`;
          await pool.query(
            `INSERT INTO attendances (employee_id, check_in, status, is_manual_correction, notes)
             VALUES ($1, $2, 'absent', true, 'Marked absent by HR — no show, no prior notice')`,
            [empIds[code], checkIn]
          );
          continue;
        }

        const isLate = roll < absentRate + lateRate;
        const checkInMinute = isLate ? 25 + Math.floor(rand() * 40) : Math.floor(rand() * 12);
        const checkInHour = startHour + Math.floor(checkInMinute / 60);
        const checkIn = `${dateStr}T${String(checkInHour).padStart(2, '0')}:${String(checkInMinute % 60).padStart(2, '0')}:00Z`;

        // Rare missing-checkout day (skip check_out entirely).
        if (rand() < 0.02) {
          await pool.query(
            `INSERT INTO attendances (employee_id, check_in, status) VALUES ($1, $2, 'missing_checkout')`,
            [empIds[code], checkIn]
          );
          continue;
        }

        const isOvertime = !isLate && rand() < 0.05;
        const checkOutHour = isOvertime ? endHour + 2 + Math.floor(rand() * 2) : endHour;
        const checkOutMinute = Math.floor(rand() * 15);
        const checkOut = `${dateStr}T${String(checkOutHour).padStart(2, '0')}:${String(checkOutMinute).padStart(2, '0')}:00Z`;
        const status = isOvertime ? 'overtime' : isLate ? 'late' : 'present';
        const manual = rand() < 0.03;

        await pool.query(
          `INSERT INTO attendances (employee_id, check_in, check_out, status, is_manual_correction, notes)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [empIds[code], checkIn, checkOut, status, manual, manual ? 'Corrected by HR after review' : null]
        );
      }
    }

    // 7. Time Off Types
    // Annual/Sick are payroll_integrated: approved days count as paid worked days (the PS's own
    // central "time off feeds payroll" thesis). Unpaid Leave deliberately is not.
    logger.info('Seeding time off types...');
    async function upsertType(t) {
      const res = await pool.query(
        `INSERT INTO time_off_types (name, unit, requires_allocation, payroll_integrated)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (name) DO UPDATE SET unit = EXCLUDED.unit, requires_allocation = EXCLUDED.requires_allocation, payroll_integrated = EXCLUDED.payroll_integrated
         RETURNING id`,
        [t.name, t.unit, t.requiresAllocation, t.payrollIntegrated]
      );
      return res.rows[0].id;
    }
    const annualTypeId = await upsertType({ name: 'Annual Leave', unit: 'days', requiresAllocation: true, payrollIntegrated: true });
    const sickTypeId = await upsertType({ name: 'Sick Leave', unit: 'days', requiresAllocation: true, payrollIntegrated: true });
    await upsertType({ name: 'Unpaid Leave', unit: 'days', requiresAllocation: false, payrollIntegrated: false });

    // 8. Time Off Allocations
    // Frank's Annual Leave allocation is deliberately small and recent so, combined with his
    // approved request below, the leave-runway insight has a real "at risk" balance to surface
    // — not a hardcoded "at risk" flag, just numbers that happen to compute that way.
    logger.info('Seeding time off allocations...');
    const allocEmployees = ['EMP-001', 'EMP-002', 'EMP-003', 'EMP-004', 'EMP-005', 'EMP-006', 'EMP-007', 'EMP-008'];
    const allocIds = {};
    for (const code of allocEmployees) {
      const annualAllocated = code === 'EMP-006' ? 3 : 18;
      const annualValidFrom = code === 'EMP-006' ? '2026-08-01' : '2026-01-01';
      const res1 = await pool.query(
        `INSERT INTO time_off_allocations (employee_id, time_off_type_id, allocated, valid_from, status, approved_by)
         VALUES ($1, $2, $3, $4, 'approved', $5) RETURNING id`,
        [empIds[code], annualTypeId, annualAllocated, annualValidFrom, userIds['EMP-002']]
      );
      allocIds[`${code}-annual`] = res1.rows[0].id;

      const res2 = await pool.query(
        `INSERT INTO time_off_allocations (employee_id, time_off_type_id, allocated, valid_from, status, approved_by)
         VALUES ($1, $2, 10, '2026-01-01', 'approved', $3) RETURNING id`,
        [empIds[code], sickTypeId, userIds['EMP-002']]
      );
      allocIds[`${code}-sick`] = res2.rows[0].id;
    }

    // 9. Time Off Requests — a real mix of every status the UI needs to demo.
    logger.info('Seeding time off requests...');
    async function addRequest(code, { typeId, allocationId, from, to, duration, status, decided }) {
      await pool.query(
        `INSERT INTO time_off_requests (employee_id, time_off_type_id, allocation_id, date_from, date_to, duration, status, approved_by, decided_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [empIds[code], typeId, allocationId, from, to, duration, status, decided ? userIds['EMP-002'] : null, decided ? new Date() : null]
      );
    }
    await addRequest('EMP-005', { typeId: annualTypeId, allocationId: allocIds['EMP-005-annual'], from: '2026-07-10', to: '2026-07-12', duration: 3, status: 'approved', decided: true });
    await addRequest('EMP-006', { typeId: annualTypeId, allocationId: allocIds['EMP-006-annual'], from: '2026-08-17', to: '2026-08-18', duration: 2, status: 'approved', decided: true });
    await addRequest('EMP-008', { typeId: annualTypeId, allocationId: allocIds['EMP-008-annual'], from: '2026-06-15', to: '2026-06-16', duration: 2, status: 'refused', decided: true });
    await addRequest('EMP-007', { typeId: sickTypeId, allocationId: allocIds['EMP-007-sick'], from: '2026-09-10', to: '2026-09-10', duration: 1, status: 'submitted', decided: false });
    await pool.query(
      `INSERT INTO time_off_requests (employee_id, time_off_type_id, allocation_id, date_from, date_to, duration, status)
       VALUES ($1, (SELECT id FROM time_off_types WHERE name = 'Unpaid Leave'), NULL, '2026-07-20', '2026-07-20', 1, 'approved')`,
      [empIds['EMP-001']]
    );

    // 10. Payruns — computed with the real payroll engine (computePayrun), never hand-inserted
    // payslip_lines. July & September go all the way to paid; August is left at computed on
    // purpose, blocked from validation by Grace's real contract_missing warning, so the Payroll
    // Preflight / Health Center has a genuine open issue to show, not a staged one.
    logger.info('Seeding payruns (computed live by the real payroll engine)...');

    async function createPayrun(name, periodStart, periodEnd, structureId, employeeCodes) {
      const payrunRes = await pool.query(
        `INSERT INTO payruns (name, salary_structure_id, period_start, period_end, status, created_by)
         VALUES ($1, $2, $3, $4, 'draft', $5) RETURNING id`,
        [name, structureId, periodStart, periodEnd, actorUserId]
      );
      const payrunId = payrunRes.rows[0].id;
      for (const code of employeeCodes) {
        await pool.query(`INSERT INTO payrun_employees (payrun_id, employee_id) VALUES ($1, $2)`, [payrunId, empIds[code]]);
        await pool.query(
          `INSERT INTO payslips (payrun_id, employee_id, structure_id, period_start, period_end, status)
           VALUES ($1, $2, $3, $4, $5, 'draft')`,
          [payrunId, empIds[code], structureId, periodStart, periodEnd]
        );
      }
      await computePayrun(payrunId); // real engine — contracts/attendance/time-off seeded above drive this
      await pool.query(`UPDATE payruns SET status = 'computed', updated_at = now() WHERE id = $1`, [payrunId]);
      await logAudit(pool, {
        tableName: 'payruns', recordId: payrunId, userId: actorUserId, action: 'status_change',
        changedFields: { from: 'draft', to: 'computed', payslip_count: employeeCodes.length },
      });
      return payrunId;
    }

    async function validateAndPay(payrunId) {
      await pool.query(`UPDATE payruns SET status = 'validated', updated_at = now() WHERE id = $1`, [payrunId]);
      await pool.query(`UPDATE payslips SET status = 'validated', updated_at = now() WHERE payrun_id = $1 AND status = 'computed'`, [payrunId]);
      await logAudit(pool, { tableName: 'payruns', recordId: payrunId, userId: actorUserId, action: 'status_change', changedFields: { from: 'computed', to: 'validated' } });

      await pool.query(`UPDATE payruns SET status = 'paid', updated_at = now() WHERE id = $1`, [payrunId]);
      await pool.query(`UPDATE payslips SET status = 'paid', updated_at = now() WHERE payrun_id = $1 AND status = 'validated'`, [payrunId]);
      await logAudit(pool, { tableName: 'payruns', recordId: payrunId, userId: actorUserId, action: 'status_change', changedFields: { from: 'validated', to: 'paid' } });
    }

    const regularEmployees = ['EMP-001', 'EMP-002', 'EMP-003', 'EMP-004', 'EMP-005', 'EMP-006', 'EMP-008'];

    const julyId = await createPayrun('July 2026 Payroll', '2026-07-01', '2026-07-31', regularStructId, regularEmployees);
    await validateAndPay(julyId);

    // August intentionally includes Grace (no contract) — this payrun stays stuck at
    // 'computed' with a real, unresolved contract_missing warning blocking validation.
    await createPayrun('August 2026 Payroll', '2026-08-01', '2026-08-31', regularStructId, [...regularEmployees, 'EMP-007']);

    const septId = await createPayrun('September 2026 Payroll', '2026-09-01', '2026-09-30', regularStructId, regularEmployees);
    await validateAndPay(septId);

    const contractorJulyId = await createPayrun('Contractors - July 2026', '2026-07-01', '2026-07-31', contractorStructId, ['EMP-009']);
    await validateAndPay(contractorJulyId);

    logger.info('Seed script completed successfully.');
  } catch (err) {
    logger.error({ err }, 'Seed script failed');
    process.exit(1);
  }
}

seed().then(() => {
  pool.end();
});
