# Odoo 18 Enterprise Design Tokens (PeoplePay360 HRMS)

This document provides the canonical token definitions and CSS variable specifications for the **Odoo 18 Enterprise Design System** implemented with Tailwind CSS and shadcn/ui.

---

## 1. Color Palette

### Primary (Odoo Aubergine / Purple)
- **Base / 500**: `#714B67`
- **Hover / 600**: `#5C3D54`
- **Dark / 700**: `#482F42`
- **Light / 100**: `#F3EDF1`
- **Light / 50**: `#FAF7F9`

### Secondary (Odoo Teal)
- **Base / 500**: `#00A09D`
- **Hover / 600**: `#008A87`
- **Dark / 700**: `#006E6B`
- **Light / 100**: `#E6F6F6`
- **Light / 50**: `#F0FAF9`

### Semantic Feedback
- **Success**: `#10B981` (Emerald-500) | Light: `#ECFDF5` | Text: `#065F46`
- **Warning**: `#F59E0B` (Amber-500) | Light: `#FFFBEB` | Text: `#92400E`
- **Destructive / Error**: `#EF4444` (Red-500) | Light: `#FEF2F2` | Text: `#991B1B`
- **Info**: `#3B82F6` (Blue-500) | Light: `#EFF6FF` | Text: `#1E40AF`

---

## 2. CSS Custom Variables

Add these to your `globals.css` or `index.css`:

```css
@layer base {
  :root {
    --background: 0 0% 98%;           /* #FAFAFA */
    --foreground: 222 47% 11%;         /* #0F172A */

    --card: 0 0% 100%;                 /* #FFFFFF */
    --card-foreground: 222 47% 11%;

    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    /* Odoo Aubergine #714B67 -> HSL: 314 20% 37% */
    --primary: 314 20% 37%;
    --primary-foreground: 0 0% 100%;

    /* Odoo Teal #00A09D -> HSL: 179 100% 31% */
    --secondary: 179 100% 31%;
    --secondary-foreground: 0 0% 100%;

    --muted: 210 40% 96.1%;            /* #F1F5F9 */
    --muted-foreground: 215.4 16.3% 46.9%; /* #64748B */

    --accent: 314 20% 95%;             /* Light Aubergine tint */
    --accent-foreground: 314 20% 25%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;

    --border: 214.3 31.8% 91.4%;       /* #E2E8F0 */
    --input: 214.3 31.8% 91.4%;
    --ring: 314 20% 37%;

    --radius: 0.5rem; /* 8px (ROUND_EIGHT) */
  }

  .dark {
    --background: 222 47% 7%;          /* #0B1120 */
    --foreground: 210 40% 98%;

    --card: 222 47% 10%;              /* #111827 */
    --card-foreground: 210 40% 98%;

    --popover: 222 47% 10%;
    --popover-foreground: 210 40% 98%;

    --primary: 314 25% 55%;           /* #A37095 */
    --primary-foreground: 0 0% 100%;

    --secondary: 179 100% 38%;         /* #00C2BE */
    --secondary-foreground: 179 100% 10%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 314 20% 20%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 314 25% 55%;
  }
}
```

---

## 3. Typography Scale (Inter Font Family)

| Scale | Tailwind Class | Font Size | Line Height | Tracking | Recommended Use |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `text-4xl font-bold` | 36px (2.25rem) | 40px | `-0.025em` | Main dashboard summary figures |
| **Headline 1** | `text-2xl font-bold` | 24px (1.5rem) | 32px | `-0.02em` | Page title, module headers |
| **Headline 2** | `text-xl font-semibold` | 20px (1.25rem) | 28px | `-0.015em` | Card section titles, modal headers |
| **Headline 3** | `text-lg font-semibold` | 18px (1.125rem) | 26px | `-0.01em` | Group headers, widget headings |
| **Body (Default)** | `text-sm font-normal` | 14px (0.875rem) | 20px | `0` | Table cell text, form labels, body copy |
| **Body (Muted)** | `text-sm text-slate-500` | 14px (0.875rem) | 20px | `0` | Secondary descriptions, timestamps |
| **Caption / Tag** | `text-xs font-medium` | 12px (0.75rem) | 16px | `0.01em` | Status badges, table headers, breadcrumbs |

---

## 4. Spacing & Border Radius

- **Border Radius**:
  - `rounded-sm`: 4px (`ROUND_FOUR` - Small chips, sub-tags)
  - `rounded-md`: 6px
  - `rounded-lg`: 8px (`ROUND_EIGHT` - Default buttons, cards, inputs, dropdowns)
  - `rounded-xl`: 12px (`ROUND_TWELVE` - Large modal windows, dashboard master containers)
  - `rounded-full`: 9999px (Pills, circular avatars, badge pills)
- **Container Layout**:
  - Maximum content width: `max-w-7xl` or fluid with `px-4 sm:px-6 lg:px-8`
  - Card internal padding: `p-5` or `p-6`
  - Compact table padding: `px-4 py-3`
