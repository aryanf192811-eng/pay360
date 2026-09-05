# PeoplePay360: Integrated HR & Payroll Operations Platform
**Odoo 18 Enterprise Edition • Gandhinagar Hackathon**

PeoplePay360 is a fully functional, integrated HR & Payroll Operations ERP built strictly to the official Hackathon Specification and the **Odoo 18 Enterprise Design System** (`#714B67` Aubergine, `#00A09D` Teal, `#2D1C29` Dark Aubergine, `#F8FAFC` Canvas).

---

## 🚀 Hackathon Specification & Feature Verification

### 1. User Roles & RBAC (Section 3)
Switch between all 5 official roles directly via the top bar role switcher:
- **`Admin`**: Complete access across all modules, configurations, and operations.
- **`HR Payroll Manager`**: Full CRUD access to Payruns, Payslips, Salary Structures, and Salary Rules.
- **`HR Payroll User`**: Payrun creation, computation, and payslip generation with read-only structure rules.
- **`HR Manager`**: Full HR management (Employees, Contracts, Working Schedules, Time Off approval/refusal), excluding payroll disbursement.
- **`Employee`**: Self-service portal: view personal profile, active contract, daily attendance check-ins, and leave balances.

---

### 2. A) HR Backend (Configuration & Master Data Area)

#### **A1) Employee Master Management (`/Employees`)**
- **Unified Views**: Kanban Grid, Dense List View, and Slide-Over Form Drawer.
- **Essential Information**: Department, Manager, Schedule, Job Position, Bank Details, PAN, UAN, and presence status.
- **Odoo Smart Buttons**: Interactive header pills with live counters:
  - `[ Contracts: 1 Active ]` ➔ Opens active contract details and salary rules matrix.
  - `[ Attendance: 96% ]` ➔ Displays attendance rate and daily check-in logs.
  - `[ Leaves: 12d Bal ]` ➔ Tracks annual paid leave availability.
  - `[ Payslips: 24 Paid ]` ➔ Historical payroll records.
- **Anomaly Handling**: Built-in inline bank linking form for Rahul Mishra (`EMP-103`) to resolve missing bank credentials.

#### **A2) Contract Management (`/Contracts`)**
- Historical contract tracking per employee.
- Enforces single active contract rule per payroll period.
- Captures agreed wage, salary structure container, working schedule, and period start/end dates.

#### **A3) Working Schedule Setup (`/Attendance` ➔ Working Schedules)**
- Standardized templates: `Standard 40h General`, `Tech Team Flex 40h`, and `Part-Time 20h`.
- **Automatic Weekly Hours Calculation**: Calculates weekly hours automatically using the mathematical formula:
  $$\text{Weekly Hours} = \left(\frac{(\text{End Time} - \text{Start Time}) - \text{Break Minutes}}{60}\right) \times \text{Days Per Week}$$
- Interactive modal to configure custom shift patterns without manual input errors.

#### **A4) Time Off Types & Allocation Setup (`/Time Off`)**
- **Leave Requests Queue**: Review requests with instant one-click **"Approve"** or **"Refuse"** buttons.
- **Leave Allocations**: Tracks allocated days, taken days, remaining balance, and annual validity window.
- **Automatic Balance Consumption**: Approving a leave request immediately deducts days from the employee's active allocation and smart metrics.
- **Time Off Types Matrix**: Configured policies for *Paid Time Off (Annual)*, *Sick Leave*, *Casual Leave*, and *Loss of Pay (LOP)* with payroll deduction integration.

#### **A5) Salary Structures & A6) Salary Rules (`/Payroll` ➔ Structures & Rules)**
- **Salary Structures Container**: Defines collections of salary rules (e.g., `Standard Indian Corporate Payroll`).
- **Sequenced Execution Pipeline**:
  - `Seq 10 - BASIC`: Basic Salary ($50\%$ of CTC)
  - `Seq 20 - HRA`: House Rent Allowance ($40\%$ of Basic / $20\%$ of CTC)
  - `Seq 30 - SPECIAL`: Special Allowance (Remainder gross)
  - `Seq 40 - GROSS`: Total Gross Salary ($\text{BASIC} + \text{HRA} + \text{SPECIAL}$)
  - `Seq 50 - PF`: Provident Fund Employee Deduction ($12\%$ of Basic)
  - `Seq 60 - TDS`: Tax Deducted at Source ($10\%$ on Gross if Gross $> ₹50,000$)
  - `Seq 70 - LOP`: Loss of Pay Deduction ($(\text{Gross} / 30) \times \text{Unpaid Days}$)
  - `Seq 100 - NET`: Net Disbursable Salary ($\text{GROSS} - (\text{PF} + \text{TDS} + \text{LOP})$)

#### **A7 & B9) Payroll Dashboard & Reporting (`/Reports`)**
- **Interactive Multi-Dimensional Filtering**:
  - Period: *September 2026*, *August 2026*, *July 2026*.
  - Department: *All Departments*, *Engineering*, *Product*, *Human Resources*, *Sales*.
  - Staff Type: *All Staff Types*, *Permanent (Full-Time)*, *Consultant / Probation*.
- **Live KPI Metrics**: Net Salary Disbursed ($₹8,28,000$), Active Headcount ($8$ Staff), Average Wage ($₹92,500$), Attendance Health ($95.8\%$).
- **Department Salary Expenditure**: Visual progress breakdown across Engineering ($₹4.45\text{L}$), Sales ($₹2.05\text{L}$), Product ($₹1.40\text{L}$), and HR ($₹1.33\text{L}$).
- **Attendance & Leave Ratio**: Visual stacked ratio (Present $92.0\%$, Late $3.8\%$, Approved PTO $3.2\%$, LOP $1.0\%$).
- **Operational Alerts**: Direct interactive shortcuts to resolve Rahul Mishra's missing bank details and Rohan Verma's pending leave.

---

### 3. B) HR & Payroll Frontend (Operational Flow)

#### **B5) Two-Step Payrun Creation Wizard**
- **Step 1 (Scope & Structure)**: Choose Period, Salary Structure container, and Department filter.
- **Step 2 (Staff Verification & Alerts)**: Select employees with checkboxes, preview total batch gross estimate, and review pre-run validation warnings (flagging Rahul Mishra's missing bank credentials).

#### **B6) Payrun Processing & Statusbar Pipeline**
- 4-Stage Odoo lifecycle pipeline:
  $$\text{Draft} \longrightarrow \text{Computed} \longrightarrow \text{Validated} \longrightarrow \text{Paid}$$
- Actions: **Recompute Rules**, **Validate Batch**, **Send Payslips (Bulk Email)**, and **Mark as Paid**.

#### **B7 & B8) Printable Payslip & PDF Generation**
- Opens a high-fidelity payslip modal with corporate header, employee details, two-column earnings/deductions breakdown, and emerald Net Payable highlight.
- Amount written in words dynamically (e.g. *"Rupees Eighty-Two Thousand Two Hundred Only"*).
- Functional **"Print / Save PDF"** (`window.print()`) and **"Email Payslip"** dispatch notification.

---

## 🛠️ Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS with Odoo 18 Enterprise Design Tokens
- **Icons**: Lucide React
- **Architecture**: In-memory Reactive Store Provider with parent-child relational integrity
