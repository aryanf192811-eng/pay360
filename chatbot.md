# chatbot.md — Supervisor ↔ Subagent Task Board

## How this works

Claude Code (supervisor) writes a task with a narrow, unambiguous scope and a concrete
acceptance check. Antigravity (subagent) claims it, does the work, and writes its result and how
it verified it back into the same entry. Supervisor reviews — runs the acceptance check itself,
never takes "looks right" on faith — then either marks it `VERIFIED` or writes back exactly
what's wrong and re-queues it as `NEEDS_REVISION`.

**File-ownership rule:** no two `QUEUED`/`CLAIMED`/`IN_PROGRESS` tasks may list overlapping
files. Check every open task's file list before writing a new one.

**Escalation rule:** if a task needs a real design decision it wasn't given — a schema change, an
API contract change, anything security-relevant — stop and write the question into the task's
Result/Notes field instead of guessing. Do not continue on that task until the supervisor answers.

**Schema/migrations are never a subagent task.** Supervisor authors all migrations directly;
subagents may seed data into or query against an already-migrated schema.

**Research tasks** write findings to a real file under `docs/research/` and link it from the
task entry — raw research text never gets pasted into this file.

## Task entry template

```
### T-XXX — <title>
- Status: QUEUED | CLAIMED | IN_PROGRESS | SUBMITTED | NEEDS_REVISION | VERIFIED
- Owner: <unclaimed | Antigravity | name>
- Files allowed: <exact list — nothing outside this list>
- Spec: <what to build, referencing CLAUDE.md/API_GUIDE.md/DB_GUIDE.md/UI_GUIDE.md sections>
- Acceptance check: <exact curl/Postman/test command and expected result>
- Result/Notes: <filled in by whoever works the task>
```

---

## Phase 0 tasks

### T-001 — Backend skeleton: Express app + DB pool + logger + package.json
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/src/app.js`, `backend/src/server.js`, `backend/src/db/pool.js`, `backend/src/utils/logger.js`, `backend/src/utils/response.js`, `backend/package.json`, `backend/.env.example`
- Spec: Express app with `helmet`, `cors` (origin from `CORS_ORIGIN` env var), `express.json()`,
  `cookie-parser`, a `/health` route, centralized error-handling middleware reading
  `err.statusCode || 500` and returning the `sendError` shape from API_GUIDE.md (`sendSuccess`/
  `sendError`/`sendPaginated` exactly as specified there). `pino`/`pino-http` logger. `pg.Pool`
  reading `DATABASE_URL`. `package.json` deps: express, cors, helmet, cookie-parser, pg,
  node-pg-migrate, jsonwebtoken, bcrypt, pino, pino-http, dotenv, express-rate-limit; devDep:
  nodemon. Scripts: `dev` (nodemon), `start`, `migrate:up`/`migrate:down` (node-pg-migrate CLI
  pointed at `src/db/migrations`), `seed`. `.env.example` mirrors the variable names in
  CLAUDE.md's Environment Variables section with placeholder values only.
- Acceptance check: `npm install && npm run dev` in `backend/`, then `curl http://localhost:4000/health` → `200 {"success":true,"data":{"status":"ok"}}`
- Result/Notes: —

### T-002 — Auth: register/login/refresh/logout + JWT middleware
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/src/routes/auth.routes.js`, `backend/src/controllers/auth.controller.js`, `backend/src/services/auth.service.js`, `backend/src/middleware/auth.js`, `backend/src/utils/response.js`
- Spec: implement exactly the auth model in CLAUDE.md's Architecture section and API_GUIDE.md's
  Auth Header Convention — bcrypt hash (cost 12), JWT `HS256` pinned on every verify,
  httpOnly/secure/sameSite=strict refresh cookie, `refresh_tokens` table rotation. Self-register
  only allowed to create `role='employee'` users — any other role requires an already-
  authenticated `admin` caller (security baseline: no open path to a privileged role).
  `authorize(...roles)` middleware per the route template in API_GUIDE.md.
- Acceptance check: `POST /api/auth/register` with a new email → 201; `POST /api/auth/login` with
  wrong password → 401 with the *same response shape* as a nonexistent email (no enumeration);
  `GET /api/auth/me` with no token → 401; with an expired/tampered token → 401.
- Result/Notes: —

### T-003 — Frontend scaffold: Vite+TS+Tailwind+shadcn init, router shell, auth store
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `frontend/**` (new project scaffold only — no backend files)
- Spec: Vite React-TS template, Tailwind configured with the token values in UI_GUIDE.md
  (colors/spacing/radius as CSS vars in `src/index.css`), shadcn/ui initialized, React Router
  with a protected-route wrapper reading the Zustand auth store, `src/api/client.ts` per
  API_GUIDE.md's frontend layer pattern (axios instance + interceptors).
- Acceptance check: `npm run dev` serves the app; visiting `/employees` while logged out redirects
  to `/login`; `src/api/client.ts` attaches `Authorization` header from the auth store on a
  logged-in request (verify via browser network tab).
- Result/Notes: —

### T-004 — Postman collection + environment skeleton
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/postman/collection.json`, `backend/postman/environment.json`
- Spec: one collection with a folder per domain from API_GUIDE.md's route list (Auth,
  Departments, Employees, Contracts, Schedules, Attendance, Time Off, Salary, Payroll,
  Dashboard) — folders may be empty until routes ship, but the structure exists now.
  Environment has `baseUrl` and `accessToken` variables; login request's test script writes the
  returned token into `accessToken` automatically.
- Acceptance check: import both files into Postman without error; running the (empty) Auth
  folder's login request against a running backend populates `{{accessToken}}`.
- Result/Notes: —

### T-005 — Seed data script (departments, schedules, a handful of employees)
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/src/db/seed.js`
- Spec: idempotent seed script (safe to re-run — `ON CONFLICT DO NOTHING` or delete-then-insert
  in a transaction) creating: 3 departments, 2 working schedules with schedule_lines, 8–10
  employees across them with varied `employee_type`/`status`, 1 admin user + 1 of each other
  role. No fabricated payroll numbers — payslip/dashboard data must come from actually running
  the payroll flow once Phase 4 lands, not from this seed.
- Acceptance check: `node backend/src/db/seed.js` runs twice in a row without error; `SELECT
  count(*) FROM employees;` returns the expected count both times (not doubled).
- Result/Notes: —

### T-006 — Payroll calculation engine (the actual "algorithms" layer — Tier 0, not optional)
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/src/services/payrollEngine.service.js`, `backend/src/services/contracts.service.js`, `backend/src/controllers/payruns.controller.js`, `backend/package.json` (add `mathjs` dep only)
- Spec: This is the real dynamic-calculation core — no hardcoded numbers anywhere, per CLAUDE.md's Dynamic Data Mandate.
  1. `resolveApplicableContract(employeeId, periodStart, periodEnd)` — runs the exact query in
     DB_GUIDE.md "Real Key-Join Patterns #1". Returns the contract row or `null`.
  2. `computeWorkedDays(employeeId, periodStart, periodEnd)` — counts distinct calendar days in
     `attendances` within the period where `status IN ('present','late','overtime')`, using the
     employee's `working_schedules`/`schedule_lines` to know which weekdays are actually
     scheduled (a Saturday with no schedule line isn't a missed day).
  3. `computePayslip(payslipId)` — the rule engine itself:
     - Load `salary_rules` for the payslip's `structure_id`, ordered by `sequence` ASC.
     - Build a running `context` object: `{ BASIC: <contract.wage>, WORKED_DAYS: <from step 2>, ...}`
       seeded from the contract and worked-days figures — never a hardcoded seed value.
     - For each rule in sequence: `fixed` → `context[rule.code] = rule.amount`; `percentage` →
       `context[rule.code] = context[rule.base_code] * (rule.percentage / 100)`; `formula` →
       evaluate `rule.formula` (e.g. `"BASIC * 0.12"`, `"GROSS - PF - TAX"`) using **`mathjs`'s
       `evaluate(expr, scope)`** with `context` as the scope — **never** `eval()` or
       `new Function()` on the stored formula string, that's an arbitrary-code-execution hole on
       a field an HR Payroll Manager can edit.
     - Each rule's resulting amount becomes one `payslip_lines` row. Persist via the exact
       DELETE-then-bulk-INSERT transaction in DB_GUIDE.md's Ledger Pattern section (idempotent
       recompute). Update `payslips.status = 'computed'` and `worked_days` in the same
       transaction.
     - After computing, run warning checks and insert `payroll_warnings` rows (no dedup needed —
       recompute deletes prior lines but warnings should also be cleared/reinserted per
       recompute): missing `bank_account_number` → `missing_bank_details`; `resolveApplicableContract`
       returned null → `contract_missing` (and skip line computation for that employee); a
       `category='net'` line with a negative amount → `negative_net`.
  4. Wire into `POST /api/payruns/:id/compute` — loop every payslip under the payrun, call
     `computePayslip`, aggregate warnings, return the summary (per API_GUIDE.md's controller
     template: validate → persist → side effects → log).
  5. `POST /api/payruns/:id/validate` — blocks (`409`, per API_GUIDE status table) if any
     *unresolved* `payroll_warnings` of type `contract_missing` exist for payslips in this
     payrun (missing bank details / negative net are advisory, don't block); otherwise sets
     `payruns.status='validated'`.
- Acceptance check: seed two employees — one with a normal active contract + full attendance, one
  with a `bank_account_number` of `NULL` and no contract covering the period. Create a payrun
  covering both. `POST /api/payruns/:id/compute` → `200`; `GET /api/payslips?payrun_id=...` shows
  computed `payslip_lines` for employee 1 with a real `net` line whose value is NOT a value typed
  anywhere in seed data (it must be arithmetically derived — verify by hand-computing from the
  salary rules and comparing); employee 2's payslip has a `contract_missing` warning and no
  lines. `POST /api/payruns/:id/validate` → `409` while that warning is unresolved.
- Result/Notes: —

### T-007 — Time-off live balance service (ledger reads, no stored balance)
- Status: QUEUED
- Owner: unclaimed
- Files allowed: `backend/src/services/timeOff.service.js`, `backend/src/controllers/timeOffAllocations.controller.js`, `backend/src/controllers/timeOffRequests.controller.js`
- Spec: `getAllocationBalance(allocationId)` runs the exact live-SUM query in DB_GUIDE.md's Ledger
  Pattern section — never a stored `taken`/`remaining` column, never computed in JS from a
  cached value. `approveRequest(requestId, approverId)` runs inside a transaction that first
  does `SELECT allocated FROM time_off_allocations WHERE id = $1 FOR UPDATE` (row lock —
  prevents two concurrent approvals from both passing an over-allocation check), computes
  current taken+this request's duration against `allocated`, and only then updates the request
  to `approved`; if it would exceed the allocation, return `409` with the shortfall amount in the
  error message instead of silently approving. This is the security-baseline "atomic DB-level
  guard, not read-then-write race" applied to leave balances specifically.
- Acceptance check: create an allocation of 5 days; submit and approve two requests of 3 days
  each sequentially — first approves (200), second is rejected (409, "exceeds remaining balance
  by 1 day" or equivalent). `GET` the allocation and confirm `remaining` reflects only the
  approved request, computed live (change the DB row directly and re-GET to prove it's not cached).
- Result/Notes: —

<!-- Add Phase 1+ tasks here as each phase starts — keep this board to the current + next phase, not the whole roadmap at once, so it stays skimmable. -->
