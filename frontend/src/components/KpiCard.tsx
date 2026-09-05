import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { cn } from '../lib/utils';

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}) {
  const toneClasses = {
    default: { text: 'text-primary', chipBg: 'bg-primary/10' },
    success: { text: 'text-success', chipBg: 'bg-success/10' },
    warning: { text: 'text-warning', chipBg: 'bg-warning/10' },
    danger: { text: 'text-danger', chipBg: 'bg-danger/10' },
  }[tone];

  return (
    <Card className="relative overflow-hidden transition-shadow hover:shadow-md">
      <div className={cn('absolute inset-x-0 top-0 h-2', toneClasses.chipBg)} />
      <CardContent className="pt-16">
        <div className="flex items-start justify-between">
          <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">{label}</div>
          {Icon && (
            <div className={cn('flex h-32 w-32 shrink-0 items-center justify-center rounded-md', toneClasses.chipBg)}>
              <Icon className={cn('h-16 w-16', toneClasses.text)} />
            </div>
          )}
        </div>
        <div className={cn('mt-12 font-mono text-3xl font-bold tabular-nums', toneClasses.text)}>{value}</div>
        {hint && <div className="mt-4 text-xs text-text-muted">{hint}</div>}
      </CardContent>
    </Card>
  );
}
