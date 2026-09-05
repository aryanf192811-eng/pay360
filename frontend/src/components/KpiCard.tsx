import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';

export function KpiCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const valueColor = {
    default: 'text-text',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
  }[tone];

  return (
    <Card>
      <CardContent className="pt-16">
        <div className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</div>
        <div className={cn('mt-4 font-mono text-2xl font-bold tabular-nums', valueColor)}>{value}</div>
        {hint && <div className="mt-4 text-xs text-text-muted">{hint}</div>}
      </CardContent>
    </Card>
  );
}
