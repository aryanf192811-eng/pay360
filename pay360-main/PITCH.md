# PITCH.md — PeoplePay360

## One-line problem
HR platforms store employees, attendance, leave, and salary as separate records — but payroll
is only correct when all four agree on the same period at the same time.

## One-line solution
PeoplePay360 makes the employee record the hub, treats contracts and leave balances as
append-only ledgers instead of editable fields, and turns payroll into a two-step wizard that
surfaces its own warnings before anything is finalized.

## Unfair advantage
Most hackathon HR/payroll builds are CRUD screens wearing a payroll costume — a `salary` field
you can edit, a `remaining leave` field you can edit, one contract per employee. Ours can't do
that even if we tried: two overlapping active contracts for one employee are rejected by a
Postgres exclusion constraint, not app-level validation; leave balances and payslip totals are
always summed live from movement rows, never stored-and-drifted. A judge asking "what happens if
this employee gets a raise mid-cycle?" gets a live demo answer, not a shrug.

## Demo script (5 minutes)

| # | Screen/Action | What it proves |
|---|---|---|
| 1 | Login as HR Payroll Manager → Employee list (Kanban) | Unified hub, role-based landing |
| 2 | Open an employee → smart buttons to Contracts/Attendance/Time Off | Employee as operational hub (PS §B2) |
| 3 | Try to create a second overlapping active contract for that employee | 409 from the exclusion constraint — real DB guarantee, not a UI check |
| 4 | Time Off → approve a pending request | Balance updates immediately, computed live, no manual refresh |
| 5 | Payroll → New Payrun → Step 1 (structure+period) → Step 2 (select employees) → Create | Two-step wizard exactly per PS §B5 |
| 6 | Compute → show payslip line breakdown (Basic/Allowances/Deductions/Net) + a surfaced warning | Rule engine + proactive warnings, not silent failure |
| 7 | Validate → Mark Paid → Print Payslip PDF | Full lifecycle to a real artifact |
| 8 | Payroll Dashboard, filter by department/period | Live aggregation, not a static chart |

## Judging-criteria alignment

| Criterion | Where we hit it |
|---|---|
| Problem understanding | [fill in after judging brief, if more detail is given] |
| Innovation | Ledger-pattern balances, DB-level contract guard, effective-dated records |
| Technical implementation | Raw PERN, real SQL, JWT/bcrypt owned end-to-end, exclusion constraints |
| UI/UX design | Ledger design system (UI_GUIDE.md) — no generic template palette |
| Team collaboration | 3 contributors, per-person branches, PR-reviewed merges into `main` |
| Demo-ability | Script above, rehearsed before presenting |

## Shipped vs. Cut (update honestly as we go)

**Shipped:** _(update per phase — nothing yet, bootstrap only)_

**Cut / deferred:** _(mirrors CLAUDE.md's Cut Line — update here as decisions are actually made)_

## Future roadmap (if we had another week)

- Field-level audit log (`audit_logs` table already designed in DB_GUIDE.md, not built for MVP)
- Full forgot-password/OTP arc (auth currently register/login/refresh only)
- Retroactive payroll recalculation when a contract is corrected after payslips were already paid
- Configurable approval chains for Time Off (currently single-approver)
