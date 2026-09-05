# API_GUIDE.md — PeoplePay360 HTTP Contract

Frozen conventions for every route, front and back. Deviating from this file is a review flag.

## HTTP Verbs

| Verb | Use for | Idempotent? |
|---|---|---|
| GET | Read one/many, never mutates | Yes |
| POST | Create a resource, OR trigger a non-idempotent action (Compute, Validate, Approve) | No |
| PUT | Full replace of a resource | Yes |
| PATCH | Partial update | No (but should be safe to retry) |
| DELETE | Remove (rare here — we don't hard-delete employees/contracts, see DB_GUIDE) | Yes |

Actions that don't map to CRUD (Compute, Validate, Mark Paid, Send Payslips, Approve, Refuse)
are `POST /api/{resource}/:id/{action}` — a verb-shaped sub-route, not a fake PATCH with a
status field the client invents.

## URL Structure

```
/api/{resource}                 GET (list, paginated+filtered), POST (create)
/api/{resource}/:id              GET, PATCH, DELETE
/api/{resource}/:id/{sub}        nested list scoped to parent, e.g. /api/employees/:id/contracts
/api/{resource}/:id/{action}     POST, action verbs listed above
```
Resources are always plural, kebab-case for multi-word (`/api/time-off-requests`,
`/api/salary-structures`, `/api/salary-rules`, `/api/payrun-employees` never appears directly —
it's manipulated only through `/api/payruns/:id` wizard steps).

## Status Codes

| Code | When |
|---|---|
| 200 | Successful GET/PATCH/PUT/action that returns a body |
| 201 | Successful POST that created a resource |
| 204 | Successful DELETE, or an action with no body to return |
| 400 | Malformed request (bad JSON, missing required field shape) |
| 401 | Missing/invalid/expired auth token |
| 403 | Valid token, wrong role for this route |
| 404 | Resource doesn't exist (or exists but caller's role can't see it — never leak existence via 403 in that case, return 404) |
| 409 | Conflict — overlapping contract, duplicate payslip, request already decided, exclusion-constraint violation |
| 422 | Validation failed (enum/range/format) on an otherwise well-formed request |
| 429 | Rate limit hit |
| 500 | Unhandled — should be rare; every foreseeable failure above has its own code |

Nothing outside this list without writing the reason next to the route in this file first.

## Response Wrapper Shapes (frozen)

```js
// utils/response.js
sendSuccess(res, data, status = 200) // { success: true, data }
sendError(res, message, status, code = null) // { success: false, error: { message, code } }
sendPaginated(res, rows, { page, pageSize, total }) // { success: true, data: rows, pagination: { page, pageSize, total, totalPages } }
```
Every controller ends its happy path with exactly one of these three — never `res.json(...)`
directly.

## Route File Template

```js
// routes/employees.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/employees.controller');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('employee','hr_manager','hr_payroll_user','hr_payroll_manager','admin'), ctrl.list);
router.post('/', authorize('hr_manager','hr_payroll_manager','admin'), ctrl.create);
router.get('/:id', authorize('employee','hr_manager','hr_payroll_user','hr_payroll_manager','admin'), ctrl.getById);
router.patch('/:id', authorize('hr_manager','hr_payroll_manager','admin'), ctrl.update);
router.get('/:id/contracts', authorize('employee','hr_manager','hr_payroll_user','hr_payroll_manager','admin'), ctrl.listContracts);

module.exports = router;
```
Employee-role read routes still need a controller-level check that `req.user.employee_id === :id`
when `req.user.role === 'employee'` (self-service scope) — the router's `authorize` only checks
role, never ownership.

## Controller Template — validate → persist → side-effects → log

```js
// controllers/timeOffRequests.controller.js
async function approve(req, res, next) {
  try {
    // 1. VALIDATE
    const { id } = req.params;
    if (!isUuid(id)) { const e = new Error('Invalid id'); e.statusCode = 422; throw e; }

    // 2. PERSIST (transaction — see DB_GUIDE ledger pattern)
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `UPDATE time_off_requests SET status='approved', approved_by=$2, decided_at=now()
         WHERE id=$1 AND status='submitted' RETURNING id, allocation_id, duration, employee_id`,
        [id, req.user.id]
      );
      if (rows.length === 0) { const e = new Error('Request already decided or not found'); e.statusCode = 409; throw e; }
      await client.query('COMMIT');
      var request = rows[0];
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }

    // 3. SIDE EFFECTS (none required here — balance is a live SUM, see DB_GUIDE)

    // 4. LOG
    logger.info({ requestId: id, approvedBy: req.user.id }, 'time_off_request approved');

    return sendSuccess(res, request);
  } catch (err) { next(err); }
}
```
Errors always `throw` with `err.statusCode` set, and always end in `next(err)` — never a bare
`res.status(500)` inline. The final error-handling middleware reads `err.statusCode || 500`.

## Input Validation Rules

- Validate in the controller (or a thin `validate*()` helper it calls), not in the route file.
- Every enum column (`status`, `role`, `category`, `computation_method`, `unit`, `warning_type`)
  is checked against its allowed set before it reaches SQL — the DB `CHECK` constraint is the
  last line of defense, not the first.
- Range checks: `wage >= 0`, `percentage` between 0–100 (or documented business range),
  `date_end >= date_start` when present, `duration > 0`.
- "Is it present" is never sufficient — an empty string passes a naive presence check and fails
  everything downstream silently.
- On failure: `const e = new Error('...'); e.statusCode = 422; throw e;`

## Auth Header Convention

`Authorization: Bearer <access_token>`. Access tokens are short-lived JWTs (15 min,
`algorithms: ['HS256']` pinned on every verify call — never trust `alg` from the token header).
Refresh tokens are opaque, stored hashed in `refresh_tokens`, delivered as an `httpOnly`,
`secure`, `sameSite=strict` cookie — never in a JS-readable location. `POST /api/auth/refresh`
reads the cookie, rotates the token (issue new, revoke old), returns a new access token in the
body.

## Frontend API Layer Pattern

```
src/api/client.ts        one axios instance, baseURL from VITE_API_URL, request interceptor
                          attaches Authorization header from the auth store; response
                          interceptor catches 401 → attempts /auth/refresh once → retries
                          original request → on second failure, clears auth store and redirects
                          to /login.
src/api/employees.api.ts one file per domain: getEmployees(), getEmployee(id),
                          createEmployee(payload), ... — thin wrappers around client, typed
                          with the domain's TS types, nothing else.
```
TanStack Query wraps every call (`useQuery`/`useMutation` in a `src/hooks/use{Domain}.ts` or
inline in the page). **Never call an `*.api.ts` function directly from inside a component
body** — always through a Query/Mutation hook, so caching, loading state, and invalidation stay
centralized. Mutations that change a ledger-backed number (payslip compute, time-off approve)
invalidate the relevant dashboard/list query keys on success so the UI updates without a manual
refresh (pattern 10 requirement).

## Full Route List (Phase reference — see chatbot.md for build order)

```
POST   /api/auth/register            (self-register as 'employee' only)
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/departments              POST /api/departments

GET    /api/working-schedules        POST /api/working-schedules
GET    /api/working-schedules/:id    PATCH .../:id

GET    /api/employees                POST /api/employees
GET    /api/employees/:id            PATCH .../:id
GET    /api/employees/:id/contracts
GET    /api/employees/:id/attendances
GET    /api/employees/:id/time-off-requests
GET    /api/employees/:id/allocations

GET    /api/contracts                POST /api/contracts
GET    /api/contracts/:id            PATCH .../:id

GET    /api/attendances              POST /api/attendances (check-in/out)
PATCH  /api/attendances/:id          (manual correction, authorized roles only)

GET    /api/time-off-types           POST /api/time-off-types
GET    /api/time-off-allocations     POST /api/time-off-allocations
POST   /api/time-off-allocations/:id/approve
GET    /api/time-off-requests        POST /api/time-off-requests
POST   /api/time-off-requests/:id/approve
POST   /api/time-off-requests/:id/refuse

GET    /api/salary-structures        POST /api/salary-structures
GET    /api/salary-structures/:id    PATCH .../:id
GET    /api/salary-rules             POST /api/salary-rules   (query by ?structure_id=)
PATCH  /api/salary-rules/:id

POST   /api/payruns/draft            (wizard step 1: scope + period → returns draft, no row yet)
POST   /api/payruns                  (wizard step 2: finalize with employee_ids[] → creates payrun + payrun_employees + draft payslips)
GET    /api/payruns                  GET /api/payruns/:id
POST   /api/payruns/:id/compute
POST   /api/payruns/:id/validate
POST   /api/payruns/:id/mark-paid
POST   /api/payruns/:id/send-payslips

GET    /api/payslips                 GET /api/payslips/:id
GET    /api/payslips/:id/pdf

GET    /api/dashboard?period_start=&period_end=&department_id=&employee_type=
```
