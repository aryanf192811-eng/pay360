# shadcn/ui Component Catalog (Odoo 18 Enterprise Styled)

This catalog specifies the core shadcn/ui components customized with the Odoo 18 Enterprise Design System tokens (`#714B67`, `#00A09D`, Inter, 8px radius).

---

## 1. Button (`components/ui/button.tsx`)

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#714B67] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#714B67] text-white shadow hover:bg-[#5C3D54] active:bg-[#482F42]",
        secondary: "bg-[#00A09D] text-white shadow hover:bg-[#008A87] active:bg-[#006E6B]",
        outline: "border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900",
        ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800",
        link: "text-[#714B67] underline-offset-4 hover:underline",
        destructive: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
        odooSubtle: "bg-[#714B67]/10 text-[#714B67] hover:bg-[#714B67]/15",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)
```

---

## 2. Card (`components/ui/card.tsx`)

Standard card container for enterprise dashboard widgets, metric summaries, and form blocks:

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-slate-200/80 bg-white text-slate-900 shadow-sm transition-shadow duration-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50",
        className
      )}
      {...props}
    />
  )
)
Card.displayName = "Card"
```

---

## 3. Metric / KPI Stat Card (HRMS Pattern)

```tsx
import { ArrowUpRight, ArrowDownRight, Users, CreditCard, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"

export function HRMSMetricCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  accentColor = "purple", // "purple" | "teal"
}: {
  title: string
  value: string
  change: string
  isPositive: boolean
  icon: any
  accentColor?: "purple" | "teal"
}) {
  const iconBg = accentColor === "teal" ? "bg-[#00A09D]/10 text-[#00A09D]" : "bg-[#714B67]/10 text-[#714B67]"

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        <span className={`inline-flex items-center text-xs font-semibold ${isPositive ? 'text-teal-600' : 'text-rose-600'}`}>
          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
          {change}
        </span>
      </div>
    </Card>
  )
}
```

---

## 4. Status Badge (`components/ui/badge.tsx`)

```tsx
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#714B67] text-white",
        secondary: "border-transparent bg-[#00A09D] text-white",
        success: "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300",
        warning: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
        destructive: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
        neutral: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
```

---

## 5. Data Table (Odoo 18 Grid Standard)

```tsx
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"

export function HRMSDataTable({ headers, rows }: { headers: string[], rows: any[] }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50/80 border-b border-slate-200">
          <TableRow>
            {headers.map((h, i) => (
              <TableHead key={i} className="text-xs font-semibold text-slate-600 uppercase tracking-wider py-3.5">
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-none">
              {row.map((cell: any, ci: number) => (
                <TableCell key={ci} className="py-3 px-4 text-sm text-slate-700">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```
