# PeoplePay360 — Backend Implementation Guide
### For Q&A Preparation · Odoo Hackathon 2026

---

## 1. BIRD'S-EYE ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React / Postman)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP  (Bearer JWT in header)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     server.js  (entry point)                    │
│  • loads .env via dotenv                                        │
│  • calls app.listen(PORT)                                       │
│  • handles SIGTERM/SIGINT → graceful shutdown (drains pool)     │
│  • catches unhandledRejection so crashes are always logged      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         app.js  (Express app)                   │
│                                                                 │
│  Middleware stack (applied top-to-bottom on EVERY request):     │
│  1. helmet()        — security headers (XSS, HSTS, etc.)       │
│  2. cors()          — allows CORS_ORIGIN + credentials:true     │
│  3. rateLimit()     — 200 req / 15 min / IP (global)           │
│  4. express.json()  — parses JSON body                         │
│  5. cookieParser()  — parses httpOnly refresh-token cookie      │
│  6. pinoHttp()      — structured request logging               │
│                                                                 │
│  Routes mounted:                                                │
│  GET  /health           → inline 200 (no DB, always fast)      │
│  /api/auth              → auth.routes.js                       │
│  /api/departments       → departments.routes.js                │
│  /api/working-schedules → workingSchedules.routes.js           │
│  /api/employees         → employees.routes.js                  │
│  /api/contracts         → contracts.routes.js                  │
│  /api/attendances       → attendances.routes.js                │
│  /api/time-off-types    → timeOffTypes.routes.js               │
│  /api/time-off-allocations → timeOffAllocations.routes.js      │
│  /api/time-off-requests → timeOffRequests.routes.js            │
│  /api/salary-structures → salaryStructures.routes.js           │
│  /api/salary-rules      → salaryRules.routes.js                │
│  /api/payruns           → payruns.routes.js                    │
│  /api/payslips          → payslips.routes.js                   │
│  /api/dashboard         → dashboard.routes.js                  │
│                                                                 │
│  404 catch-all → sendError(res, 'Not found', 404)              │
│  Centralised error handler → err.statusCode || 500             │
│    (never leaks stack traces in production)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
             middleware/          db/pool.js
              auth.js            (pg.Pool)
          authenticate()            │
          optionalAuthenticate()    ▼
          authorize(...roles)   PostgreSQL
                                peoplepay360
```

---

## 2. REQUEST LIFECYCLE (full journey of one request)

```
POST /api/payruns/:id/compute

  1. app.js middleware stack runs (helmet, cors, rate-limit, json, cookie, pino)
  2. Router match → payruns.routes.js
  3. authenticate() — extracts Bearer token, jwt.verify() with HS256
         • pins algorithms: ['HS256'] → prevents "alg:none" attack
         • sets req.user = { id, role }
  4. authorize('hr_payroll_user','hr_payroll_manager','admin')
         • checks req.user.role is in allowed list → else 403
  5. ctrl.compute() called
         • queries DB for payrun
         • calls computePayrun(payrunId) from payrollEngine.service.js
         • updates payruns.status = 'computed'
         • returns sendSuccess(res, { results, warnings })
  6. On any throw → next(err) → centralised error handler in app.js
         • maps err.statusCode to HTTP status
         • hides internal details in production
```

---

## 3. AUTHENTICATION DEEP DIVE

### Token Strategy
```
┌──────────────────────────────────────────────────────────┐
│  LOGIN  →  TWO tokens issued                             │
│                                                          │
│  ACCESS TOKEN                 REFRESH TOKEN              │
│  ─────────────────────        ──────────────────────     │
│  JWT (HS256)                  Opaque 64-byte hex         │
│  Payload: { sub, role }       (NOT a JWT)                │
│  TTL: 15 min (env)            TTL: 7 days (env)          │
│  Sent in: Authorization       Sent in: httpOnly cookie   │
│           Bearer header                                  │
│  Stored: client memory        Stored: DB as SHA-256 hash │
│                               (never raw in DB)          │
└──────────────────────────────────────────────────────────┘
```

### auth.service.js — Key Functions

| Function | What it does | Key security detail |
|---|---|---|
| `register()` | Creates user+bcrypt hash | Self-register locked to `employee` role; only admin can create other roles |
| `login()` | Validates credentials | Always runs bcrypt.compare even for unknown emails (timing-safe, prevents user enumeration) |
| `refresh()` | Rotates refresh token | Uses DB transaction: revoke old hash, insert new. Checks `revoked` + `expires_at` + `is_active` |
| `logout()` | Revokes refresh token | SHA-256 hash lookup → set `revoked = true` |
| `getMe()` | Fresh DB read | Not just token payload — catches deactivated users |

### middleware/auth.js — Three Guards

```
authenticate()          — HARD gate. 401 if no/invalid token.
optionalAuthenticate()  — SOFT gate. Never rejects; sets req.user if valid.
                          Used on POST /api/auth/register so unauthenticated
                          self-register works AND admin can create roles.
authorize(...roles)     — Middleware factory. Returns a function that
                          checks req.user.role against allowed list → 403.
```

> **Q: Why pin algorithms: ['HS256']?**  
> Without it, an attacker who knows the server's RSA public key can forge tokens by setting `alg: RS256` with the public key as the "secret". Pinning to HS256 makes this impossible.

---

## 4. DATABASE LAYER

### pool.js — Critical Lines Explained

```javascript
// LINE 14 — THE MOST IMPORTANT LINE IN POOL.JS:
types.setTypeParser(1082, (val) => val);
```

**Why?** OID 1082 = Postgres `DATE` type. Without this, node-pg converts `DATE` → JS `Date` object → `toISOString()` → UTC string. At UTC+5:30, `2026-01-01` becomes `2025-12-31T18:30:00.000Z`. This breaks every contract date, hire date, payslip period. The fix returns the raw `YYYY-MM-DD` string. `timestamptz` columns are NOT affected (they're correct instants).

```
Pool config:
  max: 20             — max simultaneous DB connections
  idleTimeoutMillis: 30_000  — release idle connections after 30s
  connectionTimeoutMillis: 5_000  — fail fast if DB unreachable
```

### db/seed.js — Idempotent Pattern
```
ON CONFLICT (employee_code) DO UPDATE SET ...  ← employees
ON CONFLICT (email) DO UPDATE SET ...          ← users
ON CONFLICT (name) DO UPDATE SET ...           ← departments
schedule_lines: DELETE then re-INSERT inside same transaction
All wrapped in BEGIN / COMMIT → atomic, safe to re-run
```

---

## 5. PAYROLL ENGINE — The Core Algorithm

```
computePayrun(payrunId)
  └── for each payslip under payrun:
        computePayslip(payslipId)
          │
          ├─ FOR UPDATE lock on payslip row (prevents concurrent recomputes)
          │
          ├─ DELETE prior payslip_lines  ← idempotent recompute
          ├─ DELETE prior payroll_warnings
          │
          ├─ Check bank_account_number → warning: missing_bank_details
          │
          ├─ Resolve contract:
          │    SELECT WHERE status='active'
          │      AND date_range && daterange(period_start, period_end, '[]')
          │    → No contract? → warning: contract_missing → RETURN early
          │
          ├─ computeWorkedDays():
          │    COUNT(DISTINCT check_in::date) WHERE status IN (present/late/overtime)
          │
          ├─ Load salary_rules ORDER BY sequence ASC
          │
          ├─ RULE EVALUATION LOOP:
          │    context = { BASIC: contract.wage, WORKED_DAYS: workedDays }
          │
          │    for each rule (in sequence order):
          │      if fixed      → amount = rule.amount
          │      if percentage → amount = context[base_code] * (pct/100)
          │      if formula    → amount = mathjs.evaluate(formula, context)
          │                      ← NEVER eval() or new Function()!
          │      context[rule.code] = amount  ← later rules can reference it
          │
          ├─ INSERT payslip_lines (frozen ledger — never updated)
          │
          ├─ Net < 0? → warning: negative_net
          │
          └─ UPDATE payslips SET status='computed', contract_id, worked_days
```

### Why mathjs instead of eval()?
`eval()` on a user-edited DB field = arbitrary code execution on the server. mathjs's `evaluate()` is a sandboxed expression parser — no access to `require`, `process`, or filesystem.

### Payrun State Machine
```
draft → computed → validated → paid
         ↑
    (can recompute)

Blocking validate: contract_missing warnings must be 0
Blocking mark-paid: status must be 'validated'
```

---

## 6. TIME OFF — CONCURRENCY GUARD

### The Race Condition Problem
```
Two HR managers approve the SAME request simultaneously:

Without locking:
  Manager A reads remaining = 5 days
  Manager B reads remaining = 5 days  (stale!)
  Request is for 5 days
  Both approve → employee now has -5 days remaining  ← BUG

With SELECT FOR UPDATE:
  Manager A locks allocation row
  Manager B waits at FOR UPDATE
  Manager A commits (remaining now 0)
  Manager B re-reads remaining = 0
  Manager B → 409 "would exceed allocation"  ← CORRECT
```

### approveRequest() — Lock Order
```javascript
BEGIN
  SELECT ... FROM time_off_requests WHERE id=$1 FOR UPDATE   // lock request
  SELECT ... FROM time_off_allocations WHERE id=$1 FOR UPDATE // lock allocation
  SELECT SUM(duration) ... WHERE status='approved'           // live balance
  if (request.duration > remaining) → 409
  UPDATE time_off_requests SET status='approved'
COMMIT
```

### Ledger Pattern (no stored balance column)
```sql
-- Balance is ALWAYS computed live — never stored
SELECT
  a.allocated,
  SUM(r.duration) FILTER (WHERE r.status='approved') AS taken,
  a.allocated - SUM(...) AS remaining
FROM time_off_allocations a
LEFT JOIN time_off_requests r ON r.allocation_id = a.id
WHERE a.id = $1
GROUP BY a.id, a.allocated
```

---

## 7. CONTRACTS — EXCLUSION CONSTRAINT

### The Problem with Overlapping Contracts
If an employee has two "active" contracts for the same period, payroll doesn't know which wage to use.

### The Solution: PostgreSQL Exclusion Constraint
```sql
-- From migration (enforced at DB level, not app level):
EXCLUDE USING GIST (
  employee_id WITH =,
  date_range WITH &&
) WHERE (status = 'active')
```

When this fires → Postgres error code `23P01` → mapped in controller to:
```javascript
if (err.code === '23P01') {
  err.message = 'overlapping active contracts';
  err.statusCode = 409;
}
```

### Effective-Dated Design (Never Edit in Place)
```
Raise Alice's salary in April:
  ✗ WRONG: UPDATE contracts SET wage=90000 WHERE id='...'
            (would corrupt March payslip retroactively)

  ✓ RIGHT: UPDATE contracts SET date_end='2026-03-31', status='expired'
           INSERT contracts (date_start='2026-04-01', wage=90000, status='active')

Payslip for March → resolves to OLD contract (wage=70000) ✓
Payslip for April → resolves to NEW contract (wage=90000) ✓
payslip_lines are FROZEN at compute time → March payslip never changes
```

---

## 8. RESPONSE SHAPE — ALWAYS CONSISTENT

```javascript
// utils/response.js pattern (used everywhere)

Success:
{ success: true, data: <payload> }

Error:
{ success: false, error: { message: "...", code: "SNAKE_CASE_CODE" } }

Status codes:
  200 — OK (read, update)
  201 — Created
  401 — Unauthenticated
  403 — Authenticated but forbidden
  404 — Not found
  409 — Conflict (duplicate, exclusion constraint, wrong state)
  422 — Unprocessable (validation failure, missing required field)
  429 — Rate limited
  500 — Server error (message hidden in production)
```

---

## 9. ROLE SYSTEM

```
Role               Can do
─────────────────────────────────────────────────────────────
employee           View own record, own attendances, own time-off
hr_manager         All employee data, approve time-off, manual attendance
hr_payroll_user    Read payroll data, compute payruns
hr_payroll_manager Full payroll write (validate, mark-paid, structures)
admin              Everything + create privileged-role users
```

### Ownership Check Pattern (in controllers, NOT middleware)
```javascript
function assertOwnRecordOrHr(req, resourceEmployeeId) {
  if (req.user.role === 'employee' && req.user.employee_id !== resourceEmployeeId) {
    const e = new Error('...'); e.statusCode = 403; throw e;
  }
}
// Called AFTER fetching the row, inside the controller.
// authorize() only checks role — ownership is a separate check.
```

---

## 10. ATTENDANCE — CHECK-IN/OUT WIDGET LOGIC

```
POST /api/attendances

  Is there an open entry (check_out IS NULL) for this employee?
    YES → UPDATE that row SET check_out=now()  → 200 (same row id)
    NO  → INSERT new row SET check_in=now()    → 201

This mirrors a real kiosk widget — one button, two behaviours.
NOT two separate API calls.

PATCH /api/attendances/:id  — MANUAL CORRECTION
  Restricted to: hr_manager, hr_payroll_user, hr_payroll_manager, admin
  Auto-sets: is_manual_correction = true, corrected_by = req.user.id
  Client can NEVER send corrected_by — server always sets it.
```

---

## 11. DASHBOARD — ALL LIVE SQL, ZERO HARDCODING

```
GET /api/dashboard?period_start=&period_end=&department_id=&employee_type=

All 4 filters are optional. Applied consistently across every sub-query.

KPIs computed:
  total_net_paid      = SUM(payslip_lines.amount WHERE category='net' AND payslip.status='paid')
  payslips_generated  = COUNT(DISTINCT payslips.id WHERE status='paid')
  average_salary      = AVG(net lines)
  approved_time_off   = SUM(time_off_requests.duration WHERE status='approved')
  attendance_health%  = (present + late + overtime) / total * 100

Sub-sections:
  salary_cost_by_department  — GROUP BY departments.name
  monthly_net_salary_trend   — GROUP BY to_char(period_start, 'YYYY-MM')
  payroll_alerts             — GROUP BY warning_type WHERE resolved=false
  attendance_overview        — COUNT(*) FILTER (WHERE status=X)
  time_off_overview          — approved_days + pending count
  department_overview        — headcount + salary across ALL time
```

---

## 12. PDF + EMAIL (T-013)

```
GET /api/payslips/:id/pdf
  1. Fetch payslip + employee data from DB
  2. Fetch payslip_lines from DB
  3. generatePayslipPdf(payslip, lines) → pdfkit → Buffer
  4. res.setHeader('Content-Type', 'application/pdf')
  5. res.end(buffer)
  Numbers in PDF = same payslip_lines data as JSON endpoint. Never separate.

POST /api/payruns/:id/send-payslips
  For each payslip under the payrun:
    1. generatePayslipPdf()
    2. sendPayslipEmail(email, period_start, period_end, pdfBuffer)
       → if SMTP_HOST not set: email_status = 'queued_no_provider' (NEVER 500)
       → if SMTP configured + send fails: email_status = 'failed'
       → if sent: email_status = 'sent'
    3. UPDATE payslips SET email_status = ...
  Returns: { stats: { sent, queued, failed } }
```

---

## 13. SALARY RULES — THREE COMPUTATION METHODS

```
Rule sequence matters — evaluated in ORDER BY sequence ASC.
Context object grows as each rule fires.

fixed:
  amount = rule.amount (literal number)

percentage:
  base_code must already be in context (earlier sequence)
  amount = context[rule.base_code] * (rule.percentage / 100)
  Example: HRA = BASIC * 0.40

formula:
  amount = mathjs.evaluate(rule.formula, { ...context })
  Example: "BASIC + HRA - DEDUCTIONS"
  Validated: must return a finite number

After each rule:
  context[rule.code] = amount   ← available to later rules
  amount = Math.round(amount * 100) / 100  ← 2 decimal places
```

---

## 14. FILE MAP — WHERE IS WHAT

```
backend/
├── src/
│   ├── server.js          ← entry point, graceful shutdown
│   ├── app.js             ← express setup, all middleware, all route mounts
│   │
│   ├── middleware/
│   │   └── auth.js        ← authenticate / optionalAuthenticate / authorize
│   │
│   ├── db/
│   │   ├── pool.js        ← pg.Pool + DATE type fix (OID 1082)
│   │   └── seed.js        ← idempotent dev data seeder
│   │
│   ├── services/          ← BUSINESS LOGIC (no res/req objects)
│   │   ├── auth.service.js          ← register/login/refresh/logout/getMe
│   │   ├── contracts.service.js     ← resolveApplicableContract / listEligibleEmployees
│   │   ├── payrollEngine.service.js ← computePayslip / computePayrun / computeWorkedDays
│   │   ├── timeOff.service.js       ← approveRequest (with FOR UPDATE) / approveAllocation
│   │   ├── pdf.service.js           ← generatePayslipPdf (pdfkit)
│   │   └── email.service.js         ← sendPayslipEmail (nodemailer, graceful degrade)
│   │
│   ├── controllers/       ← HTTP layer (req/res, validation, calls services or pool directly)
│   │   ├── auth.controller.js
│   │   ├── employees.controller.js  ← + sub-lists: contracts/attendances/time-off
│   │   ├── contracts.controller.js  ← 23P01 exclusion-constraint mapping
│   │   ├── attendances.controller.js← check-in/out widget logic
│   │   ├── departments.controller.js
│   │   ├── workingSchedules.controller.js
│   │   ├── timeOffTypes.controller.js
│   │   ├── timeOffAllocations.controller.js
│   │   ├── timeOffRequests.controller.js
│   │   ├── salaryStructures.controller.js
│   │   ├── salaryRules.controller.js
│   │   ├── payruns.controller.js    ← 5-step state machine
│   │   ├── payslips.controller.js   ← list / getById / getPdf
│   │   └── dashboard.controller.js  ← 7 live aggregation queries
│   │
│   ├── routes/            ← express Router, middleware application, maps URL → controller
│   │   └── *.routes.js    (one per domain)
│   │
│   └── utils/
│       ├── logger.js      ← pino (structured JSON logs)
│       └── response.js    ← sendSuccess() / sendError()
│
├── postman/
│   ├── collection.json    ← full test suite (Auth+Payroll+TimeOff)
│   └── environment.json   ← base_url + dynamic env vars
│
└── .env                   ← DATABASE_URL, JWT secrets, SMTP config
```

---

## 15. LIKELY Q&A QUESTIONS + ANSWERS

### Q: Why not use an ORM like Prisma or Sequelize?
Raw SQL gives full control over query shape, transaction isolation, generated columns (`worked_hours`, `date_range`), and exclusion constraints. ORMs often abstract these away or make them awkward.

### Q: How do you prevent SQL injection?
Parameterized queries everywhere (`$1, $2, ...`). Never string-interpolating user input into SQL. The only dynamic SQL is column name selection in PATCH handlers, which only allows a hardcoded allowlist of field names.

### Q: How do you handle the date timezone bug?
`types.setTypeParser(1082, val => val)` in pool.js. Returns raw `YYYY-MM-DD` string for all `DATE` columns. `timestamptz` (check_in, created_at) still go through normal Date handling.

### Q: What happens if payroll compute is called twice?
`computePayslip()` starts with `DELETE FROM payslip_lines WHERE payslip_id = $1` and `DELETE FROM payroll_warnings WHERE payslip_id = $1` inside a `FOR UPDATE` locked transaction — fully idempotent recompute.

### Q: How do you prevent over-allocation in time off?
`SELECT FOR UPDATE` on the allocation row inside a transaction. This serializes concurrent approvers — the second one always sees the updated balance after the first commits.

### Q: How does salary formula evaluation work safely?
`mathjs.evaluate(formula, context)` — sandboxed math parser with no Node.js globals. Cannot `require()`, access `process`, or execute arbitrary code, unlike `eval()` or `new Function()`.

### Q: What is the ledger pattern?
`payslip_lines` is append-only after compute. No balance column on `payslips`. Net = `SUM(payslip_lines.amount WHERE category='net')`, always read live. Time-off balance similarly = allocation - SUM of approved requests. Historical data never corrupts.

### Q: Why does `POST /api/attendances` return 200 sometimes and 201 other times?
201 = new check-in row created. 200 = existing open (no check_out) row was updated with check_out. Same endpoint, two behaviours — mirrors a real check-in/check-out kiosk.

### Q: What is the effective-dated contract pattern?
Salary raises create a NEW contract row with a new `date_start`; the old one gets `status='expired'` and `date_end` set. Payroll resolves the contract valid for the PERIOD being computed, not "the currently active one". This ensures March payslips stay correct after an April raise.

### Q: How does the refresh token rotation work?
Raw 64-byte random hex stored only in the httpOnly cookie. DB stores SHA-256 hash. On refresh: single transaction → revoke old hash → insert new hash → issue new access JWT. If token is already revoked (replay attack), immediately 401.

### Q: What error code does Postgres throw for exclusion constraint violations?
`23P01` — distinct from `23505` (unique violation). The contracts controller catches this and maps it to a 409 with a human-readable message.

### Q: Why is there a separate `draft` step in payruns?
It's a wizard pattern. Step 1 (POST /draft) returns eligible employees WITHOUT creating any DB row — just a preview. Step 2 (POST /) creates the payrun + payrun_employees + payslips in a single transaction. This prevents orphaned payruns if the user cancels.

### Q: What warning types exist and which block validation?
| Warning Type | Advisory or Blocking? |
|---|---|
| `contract_missing` | **BLOCKING** — validate() returns 409 if any unresolved |
| `missing_bank_details` | Advisory only |
| `negative_net` | Advisory only |

### Q: How does the employee code get generated race-safely?
```sql
SELECT 'EMP-' || nextval('employee_code_seq') AS code
```
PostgreSQL sequences are atomic — no two concurrent inserts can get the same value, unlike `MAX(id)+1` which has a race condition.

### Q: What does `COALESCE` do in the dashboard queries?
Returns 0 instead of NULL when there's no data. This ensures an empty dashboard never errors — it returns zeroed fields (the "graceful empty state" pattern).
