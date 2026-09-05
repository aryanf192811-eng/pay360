# PeoplePay360 Frontend Audit — Phase 0

## Overview
**Total Pages/Routes Detected:** 13
*The application strictly uses RBAC via `ProtectedRoute` and a central layout structure.*

---

## Page Inventory

### 1. Landing Page
- **PAGE:** `Landing.tsx`
- **ROUTE:** `/`
- **ROLE:** Unprotected
- **REAL FEATURES:** Value proposition, Hero section, Feature pillars.
- **API/DATA:** None (reads from auth store state).
- **ACTIONS:** Sign In (redirects).
- **DEPENDENCIES:** `lucide-react`, `auth.store.ts`

### 2. Login Page
- **PAGE:** `Login.tsx`
- **ROUTE:** `/login`
- **ROLE:** Unprotected
- **REAL FEATURES:** Auth form.
- **API/DATA:** Auth API (`/api/auth/login`).
- **ACTIONS:** Submit credentials.
- **DEPENDENCIES:** `auth.api.ts`

### 3. Employee Self-Service (My Space)
- **PAGE:** `MySpace.tsx`
- **ROUTE:** `/my-space`
- **ROLE:** All Authenticated Users (`EMPLOYEE`, `HR_*`, `ADMIN`)
- **REAL FEATURES:** Personal dashboard, Live attendance check-in/out widget, Leave balance summary, Latest payslip peek, recent attendance list.
- **API/DATA:** `getEmployee`, `listEmployeeAttendances`, `listEmployeeAllocations`, `listPayslips`.
- **ACTIONS:** Check In, Check Out, Click through to Time Off / Payslip.
- **DEPENDENCIES:** `employees.api.ts`, `payroll.api.ts`, `attendances.api.ts`

### 4. Employee Directory
- **PAGE:** `EmployeeList.tsx`
- **ROUTE:** `/employees`
- **ROLE:** `HR_ROLES`
- **REAL FEATURES:** List of all employees, department filtering, Kanban vs. Table view toggle, Employee overview stats.
- **API/DATA:** `listEmployees`, `listDepartments`.
- **ACTIONS:** Filter by department, switch view, open details.
- **DEPENDENCIES:** `employees.api.ts`, `reference.api.ts`

### 5. Employee Detail 360
- **PAGE:** `EmployeeDetail.tsx`
- **ROUTE:** `/employees/:id`
- **ROLE:** `HR_ROLES`
- **REAL FEATURES:** Employee header (status, code, manager), 4-tab layout (Contracts, Attendance, Time Off, Allocations).
- **API/DATA:** `getEmployee`, `listEmployeeContracts`, `listEmployeeAttendances`, `listEmployeeTimeOffRequests`, `listEmployeeAllocations`.
- **ACTIONS:** Tab switching.
- **DEPENDENCIES:** `employees.api.ts`

### 6. Contracts Management
- **PAGE:** `ContractList.tsx`
- **ROUTE:** `/contracts`
- **ROLE:** `HR_ROLES`
- **REAL FEATURES:** Contracts table, New Contract Form (binds employee + structure + wage + dates).
- **API/DATA:** `listContracts`, `listEmployees`, `listSalaryStructures`, `createContract`.
- **ACTIONS:** Create Contract.
- **DEPENDENCIES:** `contracts.api.ts`, `employees.api.ts`, `salary.api.ts`

### 7. Attendance Hub
- **PAGE:** `AttendanceList.tsx`
- **ROUTE:** `/attendance`
- **ROLE:** All Authenticated Users
- **REAL FEATURES:** 
  - *If Employee:* Check-in/out widget + personal history.
  - *If HR:* Master table with employee filter + manual correction dropdown.
- **API/DATA:** `listAttendances`, `listEmployees`, `checkInOut`, `correctAttendance`.
- **ACTIONS:** Check in/out, Filter, Correct Status (Present/Late/Absent/Overtime).
- **DEPENDENCIES:** `attendances.api.ts`, `employees.api.ts`

### 8. Time Off Management
- **PAGE:** `TimeOffPage.tsx`
- **ROUTE:** `/time-off`
- **ROLE:** All Authenticated Users
- **REAL FEATURES:** 
  - 3 Tabs: Requests, Allocations (HR only), Types (HR only).
  - *Requests:* Create request, approve/refuse (HR).
  - *Allocations:* Create allocation, approve (HR).
  - *Types:* Create type (days/hours, integration toggles).
- **API/DATA:** `listRequests`, `createRequest`, `approveRequest`, `refuseRequest`, `listAllocations`, `createAllocation`, `approveAllocation`, `listTimeOffTypes`, `createTimeOffType`, `listEmployees`.
- **ACTIONS:** Form submissions, Approve/Refuse actions.
- **DEPENDENCIES:** `timeOff.api.ts`, `employees.api.ts`

### 9. Payroll Operations
- **PAGE:** `PayrollPage.tsx`
- **ROUTE:** `/payroll`
- **ROLE:** `PAYROLL_ROLES`
- **REAL FEATURES:** Payruns master list, 2-Step Payrun Creation Wizard (1. Scope & Period -> 2. Select Eligible Employees).
- **API/DATA:** `listPayruns`, `draftPayrun`, `createPayrun`, `listSalaryStructures`.
- **ACTIONS:** Open wizard, set scope, toggle employee inclusion, submit.
- **DEPENDENCIES:** `payroll.api.ts`, `salary.api.ts`

### 10. Payrun Detail (The Command Center)
- **PAGE:** `PayrunDetail.tsx`
- **ROUTE:** `/payroll/payruns/:id`
- **ROLE:** `PAYROLL_ROLES`
- **REAL FEATURES:** 
  - Status pipeline (Compute -> Validate -> Mark Paid -> Send).
  - Payroll Preflight/Health Center (Blocks validation if danger warnings exist).
  - Payslips Table.
- **API/DATA:** `getPayrun`, `listPayslips`, `computePayrun`, `validatePayrun`, `markPayrunPaid`, `sendPayslips`.
- **ACTIONS:** Compute, Validate, Mark Paid, Send. Navigate to Payslip.
- **DEPENDENCIES:** `payroll.api.ts`

### 11. Payslip Calculation Trace
- **PAGE:** `PayslipDetail.tsx`
- **ROUTE:** `/payroll/payslips/:id`
- **ROLE:** `EMPLOYEE` + `PAYROLL_ROLES`
- **REAL FEATURES:** Payslip Header, PDF Print Link, Step-by-step Rule Trace (Basic -> Deductions -> Net).
- **API/DATA:** `getPayslip`, `payslipPdfUrl`.
- **ACTIONS:** Print PDF.
- **DEPENDENCIES:** `payroll.api.ts`

### 12. Salary Rule Configuration
- **PAGE:** `SalaryConfigPage.tsx`
- **ROUTE:** `/salary-config`
- **ROLE:** `PAYROLL_ROLES`
- **REAL FEATURES:** Left sidebar (Structures), Main panel (Rules for selected structure). Forms for new structure and new rules (Formula vs Fixed vs Percentage).
- **API/DATA:** `listSalaryStructures`, `getSalaryStructure`, `createSalaryStructure`, `createSalaryRule`.
- **ACTIONS:** Create structure, Create rule.
- **DEPENDENCIES:** `salary.api.ts`

### 13. Payroll Dashboard
- **PAGE:** `Dashboard.tsx`
- **ROUTE:** `/dashboard`
- **ROLE:** `PAYROLL_ROLES`
- **REAL FEATURES:** Department filter, 5 Top KPIs, Cost by Dept Bar Chart (CSS-based), Monthly Trend Chart (CSS-based), Payroll Alerts list, Attendance/Time-Off grids.
- **API/DATA:** `getDashboard`, `listDepartments`.
- **ACTIONS:** Filter.
- **DEPENDENCIES:** `dashboard.api.ts`, `reference.api.ts`

---

## Global Frontend Patterns Detected
1. **Forms/Inputs**: Primarily standard HTML inputs bound to React state, wrapped in basic `Card` and `CardContent`.
2. **Tables**: Simple HTML `table` implementation with custom `Th`/`Td` components.
3. **Data Fetching**: `useQuery` / `useMutation` via `@tanstack/react-query` exclusively.
4. **State Management**: `zustand` for Auth (`auth.store.ts`).
5. **Styling**: Tailwind CSS with custom variables (`bg`, `primary`, `text-muted`, etc.).
6. **Icons**: `lucide-react`.

## Important Design Constraints Identified
- The data is dense and highly relational. 
- There are multiple interactive tables that cannot be replaced with mere cards.
- **Action/Feature Parity is critical:** I must not add buttons like "Export CSV" if the API doesn't support it, nor remove "Mark Paid" if it's there.
- The distinction between HR vs Employee vs Payroll User views must remain visually distinct and respect the existing `useAuthStore` flags.
