import { Badge } from './ui/badge';

type Domain = 'contract' | 'attendance' | 'timeOffRequest' | 'timeOffAllocation' | 'payrun' | 'payslip' | 'employee';

// One fixed mapping per domain+status — never an ad hoc color chosen per screen (UI_GUIDE.md).
const MAP: Record<Domain, Record<string, { label: string; tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary' }>> = {
  contract: {
    draft: { label: 'Draft', tone: 'neutral' },
    active: { label: 'Active', tone: 'success' },
    expired: { label: 'Expired', tone: 'neutral' },
    cancelled: { label: 'Cancelled', tone: 'danger' },
  },
  attendance: {
    present: { label: 'Present', tone: 'success' },
    late: { label: 'Late', tone: 'warning' },
    absent: { label: 'Absent', tone: 'danger' },
    overtime: { label: 'Overtime', tone: 'info' },
    missing_checkout: { label: 'Missing Checkout', tone: 'warning' },
  },
  timeOffRequest: {
    draft: { label: 'Draft', tone: 'neutral' },
    submitted: { label: 'Pending', tone: 'warning' },
    approved: { label: 'Approved', tone: 'success' },
    refused: { label: 'Refused', tone: 'danger' },
    cancelled: { label: 'Cancelled', tone: 'neutral' },
  },
  timeOffAllocation: {
    draft: { label: 'Pending Approval', tone: 'warning' },
    approved: { label: 'Approved', tone: 'success' },
    refused: { label: 'Refused', tone: 'danger' },
  },
  payrun: {
    draft: { label: 'Draft', tone: 'neutral' },
    computed: { label: 'Computed', tone: 'info' },
    validated: { label: 'Validated', tone: 'primary' },
    paid: { label: 'Paid', tone: 'success' },
  },
  payslip: {
    draft: { label: 'Draft', tone: 'neutral' },
    computed: { label: 'Computed', tone: 'info' },
    validated: { label: 'Validated', tone: 'primary' },
    paid: { label: 'Paid', tone: 'success' },
  },
  employee: {
    active: { label: 'Active', tone: 'success' },
    inactive: { label: 'Inactive', tone: 'neutral' },
  },
};

export function StatusBadge({ status, domain }: { status: string; domain: Domain }) {
  const entry = MAP[domain]?.[status] ?? { label: status, tone: 'neutral' as const };
  return <Badge tone={entry.tone}>{entry.label}</Badge>;
}
