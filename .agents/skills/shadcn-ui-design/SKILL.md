---
name: shadcn-ui-design
description: >-
  Use this skill whenever designing, building, prototyping, or reviewing UI screens, design tokens, and components using shadcn/ui and Tailwind CSS, specifically tailored for the PeoplePay360 Odoo 18 Enterprise HRMS design system and Stitch MCP design workflows.
---

# shadcn/ui Design Skill — Odoo 18 Enterprise Design System

This skill empowers Antigravity agents to create cohesive, accessible, high-fidelity UI designs using **shadcn/ui** primitives and the **Odoo 18 Enterprise Design System** for **PeoplePay360 (Odoo Enterprise HRMS)**.

---

## Core Philosophy

1. **Composition over Monoliths**: Build interfaces using composable, accessible primitives powered by Radix UI, Tailwind CSS, and `lucide-react` icons.
2. **Odoo 18 Enterprise Aesthetic**:
   - **Primary Brand**: Aubergine/Purple (`#714B67`) — Used for top-level navigation, primary buttons, key accents, active sidebar states.
   - **Secondary Accent**: Odoo Teal (`#00A09D`) — Used for positive indicators, primary metric highlights, secondary buttons, success chips, and badges.
   - **Typography**: Inter across both Headline and Body font families for high legibility in dense data tables and enterprise dashboards.
   - **Roundness**: `8px` (`ROUND_EIGHT` / `rounded-lg` / `rounded-md`) balancing clean corporate sharpness with modern softness.
3. **Enterprise HRMS Ergonomics**:
   - Optimized for high data density (payroll grids, attendance matrix, leave calendar, recruitment pipeline).
   - Clear visual hierarchy with subtle borders (`border-slate-200 dark:border-slate-800`) and soft card elevations.

---

## Design System Tokens Quick Reference

| Token | Light Mode Value | Dark Mode Value | Usage |
| :--- | :--- | :--- | :--- |
| `--primary` | `#714B67` (Odoo Aubergine) | `#A37095` | Brand headers, primary CTA, active states |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | Text on primary elements |
| `--secondary` | `#00A09D` (Odoo Teal) | `#00C2BE` | Key metric badges, secondary CTA, status tags |
| `--secondary-foreground` | `#FFFFFF` | `#003837` | Text on secondary elements |
| `--background` | `#F9FAFB` (Neutral Slate-50) | `#0F172A` (Slate-900) | App workspace canvas |
| `--card` | `#FFFFFF` | `#1E293B` (Slate-800) | Content containers, form cards, modals |
| `--muted` | `#F1F5F9` | `#334155` | Table header backgrounds, inactive tabs |
| `--border` | `#E2E8F0` | `#334155` | Dividers, card borders, input borders |
| `--ring` | `#714B67` (with 20% opacity) | `#A37095` | Keyboard focus ring |
| `--radius` | `0.5rem` (`8px`) | `0.5rem` (`8px`) | Default corner roundness |

Detailed specifications are documented in:
- [Design Tokens Guide](./references/design-tokens.md)
- [Component Specifications & Examples](./references/components-catalog.md)
- [HRMS Domain Patterns](./references/odoo-hrms-patterns.md)
- [Stitch MCP Integration](./references/stitch-integration.md)

---

## Step-by-Step UI Design Workflow

### Step 1: Analyze Layout & Information Hierarchy
When generating or editing a screen:
1. **Identify the Screen Archetype**:
   - **Dashboard / Analytics**: KPI metric cards, payroll distribution charts, attendance overview.
   - **Data Table / List View**: Employee master list, attendance punch logs, salary slips list.
   - **Kanban / Pipeline**: Recruitment pipeline, applicant tracking, appraisal stages.
   - **Detail / Form View**: Employee onboarding profile, salary structure builder, leave application.
2. **Structure the Canvas**:
   - **Header / App Bar**: Global breadcrumbs, search (`Cmd+K`), notification bell, user profile avatar.
   - **Sidebar**: Odoo purple active navigation pills, expandable HRMS modules (Payroll, Attendance, Leaves, Employees, Recruitment, Expenses).
   - **Main Content**: Padding `p-6` or `p-8`, fluid max width `max-w-7xl`, responsive column grids.

### Step 2: Select shadcn/ui Components
Assemble the UI using the verified shadcn/ui components:
- **Navigation**: `NavigationMenu`, `Sidebar`, `Breadcrumb`, `Tabs`.
- **Forms & Inputs**: `Form`, `Input`, `Select`, `DatePicker`, `Checkbox`, `RadioGroup`, `Switch`.
- **Feedback & Overlays**: `Dialog`, `Sheet`, `DropdownMenu`, `Tooltip`, `Toast`, `Badge`.
- **Data Display**: `Table`, `Card`, `Avatar`, `Separator`, `Accordion`.

### Step 3: Apply Odoo 18 Enterprise Styling Rules
1. **Buttons**:
   - Primary Action: `bg-[#714B67] hover:bg-[#5C3D54] text-white font-medium rounded-lg shadow-sm px-4 py-2`
   - Secondary / Accent: `bg-[#00A09D] hover:bg-[#008A87] text-white font-medium rounded-lg shadow-sm px-4 py-2`
   - Outline: `border border-[#E2E8F0] hover:bg-slate-50 text-slate-700 rounded-lg px-4 py-2`
   - Ghost: `hover:bg-slate-100 text-slate-700 rounded-lg px-3 py-1.5`
2. **Data Tables**:
   - Header: `bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider`
   - Rows: Hover `hover:bg-slate-50/80 transition-colors`, cell padding `py-3 px-4 text-sm text-slate-700`
   - Actions: Right-aligned kebab menu (`DropdownMenu`) for quick actions (Edit, View Payslip, Approve).
3. **Status Badges**:
   - Approved / Paid: `bg-teal-50 text-teal-700 border border-teal-200`
   - Pending / Submitted: `bg-amber-50 text-amber-700 border border-amber-200`
   - Draft: `bg-slate-100 text-slate-600 border border-slate-200`
   - Rejected / Cancelled: `bg-rose-50 text-rose-700 border border-rose-200`

### Step 4: Stitch MCP Design & Prototyping
When working with Stitch MCP:
1. Ensure the Stitch project is initialized with title `PeoplePay360 - Odoo Enterprise HRMS`.
2. Reference the root [DESIGN.md](../../../DESIGN.md) when invoking `generate_screen_from_text` or `create_design_system_from_design_md`.
3. Use `scripts/stitch_bridge.mjs` for automation or standalone verification.

---

## Code Generation Conventions

1. **Utility `cn()` Helper**:
   Always use standard clsx + twMerge:
   ```typescript
   import { clsx, type ClassValue } from "clsx"
   import { twMerge } from "tailwind-merge"

   export function cn(...inputs: ClassValue[]) {
     return twMerge(clsx(inputs))
   }
   ```
2. **Icons**:
   Always use `lucide-react` icons (e.g. `Users`, `CreditCard`, `CalendarCheck`, `FileText`, `CheckCircle2`, `Clock`, `ArrowUpRight`).
3. **Accessibility**:
   Ensure all interactive elements have descriptive `aria-label`, visible keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-[#714B67]`), and proper HTML semantic hierarchy (`main`, `nav`, `header`, `section`).
