/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE EXTENSION IF NOT EXISTS citext;
    CREATE EXTENSION IF NOT EXISTS btree_gist;

    -- ========== USERS / AUTH ==========
    CREATE TABLE departments (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text UNIQUE NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE working_schedules (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      schedule_type text NOT NULL CHECK (schedule_type IN ('full_time','part_time','shift')),
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE schedule_lines (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      schedule_id uuid NOT NULL REFERENCES working_schedules(id) ON DELETE CASCADE,
      day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
      start_time time NOT NULL,
      end_time time NOT NULL,
      break_minutes int NOT NULL DEFAULT 0 CHECK (break_minutes >= 0),
      UNIQUE (schedule_id, day_of_week),
      CHECK (end_time > start_time)
    );

    CREATE TABLE employees (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_code text UNIQUE NOT NULL,
      first_name text NOT NULL,
      last_name text NOT NULL,
      email citext UNIQUE NOT NULL,
      phone text,
      department_id uuid REFERENCES departments(id),
      manager_id uuid REFERENCES employees(id),
      job_position text,
      schedule_id uuid REFERENCES working_schedules(id),
      employee_type text NOT NULL CHECK (employee_type IN ('full_time','part_time','contract')),
      status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
      hire_date date NOT NULL,
      bank_account_number text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email citext UNIQUE NOT NULL,
      password_hash text NOT NULL,
      role text NOT NULL CHECK (role IN ('employee','hr_manager','hr_payroll_user','hr_payroll_manager','admin')),
      employee_id uuid UNIQUE REFERENCES employees(id),
      is_active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE refresh_tokens (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash text NOT NULL,
      expires_at timestamptz NOT NULL,
      revoked boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX ON refresh_tokens (user_id);

    -- ========== SALARY CONFIG ==========
    CREATE TABLE salary_structures (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text UNIQUE NOT NULL,
      active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE salary_rules (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      structure_id uuid NOT NULL REFERENCES salary_structures(id) ON DELETE CASCADE,
      name text NOT NULL,
      code text NOT NULL,
      category text NOT NULL CHECK (category IN ('basic','allowance','gross','deduction','net')),
      sequence int NOT NULL DEFAULT 10,
      computation_method text NOT NULL CHECK (computation_method IN ('fixed','percentage','formula')),
      amount numeric(12,2),
      percentage numeric(6,3),
      base_code text,
      formula text,
      active boolean NOT NULL DEFAULT true,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (structure_id, code)
    );

    -- ========== CONTRACTS (effective-dated, see DB_GUIDE.md) ==========
    CREATE TABLE contracts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      department_id uuid REFERENCES departments(id),
      position text,
      wage numeric(12,2) NOT NULL CHECK (wage >= 0),
      salary_structure_id uuid REFERENCES salary_structures(id),
      date_start date NOT NULL,
      date_end date,
      status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','expired','cancelled')),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CHECK (date_end IS NULL OR date_end >= date_start),
      date_range daterange GENERATED ALWAYS AS
        (daterange(date_start, COALESCE(date_end, 'infinity'::date), '[]')) STORED
    );
    CREATE INDEX ON contracts (employee_id);

    -- DB-level guard: no two overlapping ACTIVE contracts for the same employee.
    ALTER TABLE contracts
      ADD CONSTRAINT no_overlapping_active_contracts
      EXCLUDE USING gist (employee_id WITH =, date_range WITH &&)
      WHERE (status = 'active');

    -- ========== ATTENDANCE ==========
    CREATE TABLE attendances (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      check_in timestamptz NOT NULL,
      check_out timestamptz,
      worked_hours numeric(6,2) GENERATED ALWAYS AS
        (CASE WHEN check_out IS NULL THEN NULL
              ELSE ROUND(EXTRACT(EPOCH FROM (check_out - check_in))::numeric / 3600.0, 2) END) STORED,
      status text NOT NULL DEFAULT 'present' CHECK (status IN ('present','late','absent','overtime','missing_checkout')),
      is_manual_correction boolean NOT NULL DEFAULT false,
      corrected_by uuid REFERENCES users(id),
      notes text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CHECK (check_out IS NULL OR check_out > check_in)
    );
    CREATE INDEX ON attendances (employee_id, check_in);

    -- ========== TIME OFF (ledger: allocations = grants, requests = movements) ==========
    CREATE TABLE time_off_types (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text UNIQUE NOT NULL,
      unit text NOT NULL CHECK (unit IN ('days','hours')),
      requires_allocation boolean NOT NULL DEFAULT true,
      payroll_integrated boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE TABLE time_off_allocations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      time_off_type_id uuid NOT NULL REFERENCES time_off_types(id),
      allocated numeric(8,2) NOT NULL CHECK (allocated >= 0),
      valid_from date NOT NULL,
      valid_to date,
      status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','approved','refused')),
      approved_by uuid REFERENCES users(id),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX ON time_off_allocations (employee_id);

    CREATE TABLE time_off_requests (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      time_off_type_id uuid NOT NULL REFERENCES time_off_types(id),
      allocation_id uuid REFERENCES time_off_allocations(id),
      date_from date NOT NULL,
      date_to date NOT NULL,
      duration numeric(8,2) NOT NULL CHECK (duration > 0),
      status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft','submitted','approved','refused','cancelled')),
      approved_by uuid REFERENCES users(id),
      decided_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CHECK (date_to >= date_from)
    );
    CREATE INDEX ON time_off_requests (employee_id, status);
    CREATE INDEX ON time_off_requests (allocation_id);

    -- ========== PAYROLL ==========
    CREATE TABLE payruns (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      salary_structure_id uuid REFERENCES salary_structures(id),
      period_start date NOT NULL,
      period_end date NOT NULL,
      status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','computed','validated','paid')),
      created_by uuid REFERENCES users(id),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CHECK (period_end >= period_start)
    );

    CREATE TABLE payrun_employees (
      payrun_id uuid NOT NULL REFERENCES payruns(id) ON DELETE CASCADE,
      employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      PRIMARY KEY (payrun_id, employee_id)
    );

    CREATE TABLE payslips (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      payrun_id uuid NOT NULL REFERENCES payruns(id) ON DELETE CASCADE,
      employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      contract_id uuid REFERENCES contracts(id),
      structure_id uuid REFERENCES salary_structures(id),
      period_start date NOT NULL,
      period_end date NOT NULL,
      worked_days numeric(5,2),
      status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','computed','validated','paid')),
      email_status text NOT NULL DEFAULT 'not_sent' CHECK (email_status IN ('not_sent','queued_no_provider','sent','failed')),
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE (payrun_id, employee_id)
    );
    CREATE INDEX ON payslips (employee_id);

    -- Ledger rows: a payslip's Basic/Allowances/Deductions/Gross/Net live ONLY here,
    -- never as a stored column on payslips (see DB_GUIDE.md Ledger Pattern).
    CREATE TABLE payslip_lines (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      payslip_id uuid NOT NULL REFERENCES payslips(id) ON DELETE CASCADE,
      salary_rule_id uuid REFERENCES salary_rules(id),
      code text NOT NULL,
      name text NOT NULL,
      category text NOT NULL CHECK (category IN ('basic','allowance','gross','deduction','net')),
      sequence int NOT NULL,
      amount numeric(12,2) NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX ON payslip_lines (payslip_id);

    CREATE TABLE payroll_warnings (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      payslip_id uuid REFERENCES payslips(id) ON DELETE CASCADE,
      payrun_id uuid REFERENCES payruns(id) ON DELETE CASCADE,
      warning_type text NOT NULL CHECK (warning_type IN ('missing_bank_details','duplicate_payslip','contract_missing','negative_net','other')),
      message text NOT NULL,
      resolved boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      CHECK (payslip_id IS NOT NULL OR payrun_id IS NOT NULL)
    );

    -- ========== AUDIT (Phase 6+, see DB_GUIDE.md) ==========
    CREATE TABLE audit_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      table_name text NOT NULL,
      record_id uuid NOT NULL,
      user_id uuid REFERENCES users(id),
      action text NOT NULL CHECK (action IN ('create','update','status_change')),
      changed_fields jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX ON audit_logs (table_name, record_id);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS audit_logs, payroll_warnings, payslip_lines, payslips, payrun_employees,
      payruns, time_off_requests, time_off_allocations, time_off_types, attendances, contracts,
      salary_rules, salary_structures, refresh_tokens, users, employees, schedule_lines,
      working_schedules, departments CASCADE;
  `);
};
