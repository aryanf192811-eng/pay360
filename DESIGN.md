# PeoplePay360 — Odoo 18 Enterprise Design System

> **Project:** PeoplePay360 - Odoo Enterprise HRMS  
> **Design System:** Odoo 18 Enterprise Design System  
> **Component Library:** shadcn/ui (Radix UI primitives + Tailwind CSS)  
> **Typography:** Inter (Headlines & Body)  
> **Corner Roundness:** 8px (`ROUND_EIGHT` / `rounded-lg`)  
> **Color Mode:** Light (with Dark Mode parity) | Variant: Vibrant  

---

## 1. Brand Identity & Color Tokens

PeoplePay360 utilizes the Odoo 18 Enterprise visual language, anchored by deep Aubergine (`#714B67`) and complemented by high-contrast Odoo Teal (`#00A09D`).

### Core Swatches

| Token Name | Hex Code | HSL Representation | Semantic Function |
| :--- | :--- | :--- | :--- |
| **Primary (Odoo Aubergine)** | `#714B67` | `hsl(314, 20%, 37%)` | Main navigation, active module items, primary call-to-actions, focus rings. |
| **Primary Hover** | `#5C3D54` | `hsl(314, 20%, 30%)` | Hover state for primary buttons and interactive elements. |
| **Secondary (Odoo Teal)** | `#00A09D` | `hsl(179, 100%, 31%)` | Metric highlights, secondary actions, success tags, positive delta indicators. |
| **Secondary Hover** | `#008A87` | `hsl(179, 100%, 27%)` | Hover state for secondary buttons. |
| **Background (Canvas)** | `#F9FAFB` | `hsl(210, 20%, 98%)` | Application workspace background. |
| **Surface (Card)** | `#FFFFFF` | `hsl(0, 0%, 100%)` | Elevated content containers, data grids, modal dialogs. |
| **Border / Divider** | `#E2E8F0` | `hsl(214, 32%, 91%)` | Table borders, card outlines, form element borders. |
| **Muted Surface** | `#F1F5F9` | `hsl(210, 40%, 96%)` | Table header background, inactive tabs, disabled fields. |

---

## 2. Typography Guidelines

- **Font Family**: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Scale Hierarchy**:
  - **H1 (Page Title)**: `24px` (`1.5rem`), SemiBold (`font-semibold`), Letter Spacing `-0.02em`
  - **H2 (Card / Section Header)**: `18px` (`1.125rem`), SemiBold (`font-semibold`), Letter Spacing `-0.01em`
  - **H3 (Widget Subheading)**: `15px` (`0.9375rem`), Medium (`font-medium`)
  - **Body Text**: `14px` (`0.875rem`), Regular (`font-normal`), Line Height `1.4`
  - **Table Cells & Input**: `13px` or `14px`, Regular
  - **Caption & Badge**: `12px` (`0.75rem`), Medium / SemiBold, Tracking `+0.01em`

---

## 3. Shape & Elevation

- **Border Radius**:
  - Elements (Inputs, Buttons, Dropdowns, Badges): `8px` (`ROUND_EIGHT` / `rounded-lg`)
  - Cards & Data Grids: `8px` (`rounded-lg`)
  - Modals & Sheets: `12px` (`rounded-xl`)
  - Status Pills & Avatars: `9999px` (`rounded-full`)
- **Elevation Shadows**:
  - Card Default: `0 1px 2px 0 rgb(0 0 0 / 0.05)` (`shadow-sm`)
  - Card Hover: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` (`shadow-md`)
  - Dialog / Popover: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` (`shadow-lg`)

---

## 4. shadcn/ui Component Standards

1. **Button Variants**:
   - `default`: Background `#714B67`, text `#FFFFFF`, rounded `8px`, subtle shadow.
   - `secondary`: Background `#00A09D`, text `#FFFFFF`, rounded `8px`.
   - `outline`: Border `1px solid #E2E8F0`, background `#FFFFFF`, hover background `#F8FAFC`.
   - `ghost`: Transparent background, hover background `#F1F5F9`.
2. **Data Tables**:
   - Headers: Upper case, text `12px`, font-weight `600`, color `#64748B`, background `#F8FAFC`.
   - Alternating row hover: `hover:bg-slate-50/75`.
   - Dense padding: `py-3 px-4`.
3. **Status Badges**:
   - Paid / Approved: Green/Teal tint (`bg-[#00A09D]/10 text-[#00A09D] border-[#00A09D]/20`).
   - Pending / Submitted: Amber tint (`bg-amber-50 text-amber-700 border-amber-200`).
   - Draft: Slate tint (`bg-slate-100 text-slate-700 border-slate-200`).
   - Rejected: Rose tint (`bg-rose-50 text-rose-700 border-rose-200`).

---

## 5. HRMS Modules Layout Specifications

- **Dashboard / KPI Overview**: 4-column metric grid (Total Employees, Active Payroll, On Leave Today, Open Positions) above recent activity and payroll processing progress.
- **Payroll Processing**: Split view with salary structure tree on the left and computed slip ledger on the right.
- **Attendance Punch Matrix**: Daily calendar heatmap and punch table with biometric timestamps and geolocation tags.
- **Recruitment Kanban**: 5-stage drag-and-drop hiring pipeline with candidate rating cards and interview scheduling shortcuts.
