# PeoplePay360 — Odoo 18 Enterprise HRMS UX & Domain Patterns

This guide outlines specific layout and interaction patterns tailored for enterprise HRMS workflows in **PeoplePay360**, aligning with Odoo 18 UX paradigms and shadcn/ui building blocks.

---

## 1. Top Navigation & App Header (The Odoo Bar)

- **Top Bar Height**: `h-14` (56px)
- **Background**: Solid `#714B67` (Odoo Aubergine) or Clean White `#FFFFFF` with Aubergine accents.
- **Components**:
  1. **App Switcher Grid Icon**: 9-dot matrix icon opening module launcher (Payroll, Attendance, Time Off, Employees, Recruitment, Expenses, Appraisals).
  2. **Company Selector Dropdown**: Multi-company switcher for enterprise payroll entities.
  3. **Global Search**: `Cmd + K` search dialog for quickly finding employees, payslips, or leave requests.
  4. **Activity Bell**: Badged notification dropdown for pending manager approvals.
  5. **User Profile**: Circular avatar with status dot (Active, In Meeting, Out of Office).

---

## 2. Module Views & Screen Archetypes

### A. Employee Directory (Kanban / Card Grid & List View)
- Toggle button between Kanban cards and dense Table list.
- **Kanban Card Specs**:
  - Employee photo avatar (48x48 rounded-full) with department badge.
  - Name (font-semibold text-slate-900), Job Title (text-xs text-slate-500).
  - Quick badges: "On Leave" (amber), "Present" (teal), "Remote" (purple).
  - Footer actions: Direct Message icon, Email icon, Call icon.

### B. Payroll & Salary Slips Engine (Dense Matrix & Slip Preview)
- **Batch Processing Header**:
  - Pay Period selector (`Tabs`: "Sept 2026", "Aug 2026", "Custom").
  - Primary CTA: `Compute Payslips` (`bg-[#714B67]`).
  - Secondary CTA: `Export Bank Transfer File (ACH/SEPA)` (`bg-[#00A09D]`).
- **Slip Line Breakdown**:
  - Dual column layout: **Earnings** (Basic, HRA, Allowances, Bonus) vs **Deductions** (Tax, PF/401k, Insurance).
  - Net Pay Banner with large display typography (`text-3xl font-bold text-slate-900`).

### C. Attendance & Punch Tracking (Real-time Matrix)
- Today's Punch Matrix:
  - Time-in, Time-out, Total Hours Worked, Overtime indicator.
  - Daily status chips: Present (`bg-teal-50 text-teal-700`), Late (`bg-amber-50 text-amber-700`), Absent (`bg-rose-50 text-rose-700`).
- Biometric & Geo-location tag icons on punch logs.

### D. Time Off / Leave Approval Workflow
- Visual Leave Balance cards (Annual Leave: 14/20 days, Sick Leave: 8/10 days).
- Calendar heat-map / Gantt view showing team absence conflicts before manager sign-off.
- Multi-step approval state banner: `Draft` -> `Submitted` -> `First Approval` -> `Second Approval` -> `Approved`.

### E. Recruitment Pipeline (Kanban Board)
- Drag-and-drop recruitment columns:
  1. `Initial Qualification`
  2. `First Interview`
  3. `Technical Assessment`
  4. `Contract Proposal`
  5. `Contract Signed`
- Candidate card with star rating, salary expectation tag, and attached resume badge.

---

## 3. Odoo Action Ribbon & Status Bar Pattern

In Odoo Enterprise, documents (like an Employee Contract or Payslip) have an **Action Ribbon** at the top of the form:

```tsx
export function OdooStatusBar({
  currentState,
  states,
  onStateChange
}: {
  currentState: string
  states: { key: string, label: string }[]
  onStateChange: (state: string) => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-6 py-2.5 rounded-t-lg">
      <div className="flex items-center gap-2">
        <button className="bg-[#714B67] hover:bg-[#5C3D54] text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm">
          Approve
        </button>
        <button className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-md">
          Cancel
        </button>
      </div>

      {/* Breadcrumb-style stage pipeline */}
      <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white text-xs">
        {states.map((st, i) => {
          const isActive = st.key === currentState
          return (
            <div
              key={st.key}
              className={`px-3 py-1.5 font-medium transition-colors ${
                isActive
                  ? 'bg-[#714B67] text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              } ${i !== 0 ? 'border-l border-slate-200' : ''}`}
            >
              {st.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```
