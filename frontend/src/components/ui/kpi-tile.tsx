import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'info';

const toneClasses: Record<Tone, string> = {
  primary: 'bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-primary',
  success: 'bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-success',
  warning: 'bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-warning',
  danger: 'bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-danger',
  info: 'bg-[color-mix(in_srgb,var(--info)_12%,transparent)] text-info',
};

export interface KpiTileProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  hint?: string;
  delta?: { direction: 'up' | 'down' | 'flat'; label: string };
  tone?: Tone;
  index?: number;
  className?: string;
}

// Shared bento-grid KPI tile: icon badge + big number + optional delta pill, with a staggered
// fade/rise entrance keyed off `index` so a row of tiles animates in sequence, not all at once.
export function KpiTile({ icon: Icon, label, value, hint, delta, tone = 'primary', index = 0, className }: KpiTileProps) {
  const DeltaIcon = delta?.direction === 'up' ? ArrowUpRight : delta?.direction === 'down' ? ArrowDownRight : Minus;
  const deltaTone = delta?.direction === 'up' ? 'success' : delta?.direction === 'down' ? 'danger' : 'neutral';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      className={cn(
        'flex flex-col gap-12 rounded-lg border border-border bg-surface p-16 shadow-tinted transition-shadow hover:shadow-tinted-lg',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn('flex h-32 w-32 items-center justify-center rounded-md', toneClasses[tone])}>
          <Icon className="h-16 w-16" />
        </span>
        {delta && (
          <span
            className={cn(
              'flex items-center gap-2 rounded-full px-8 py-2 text-xs font-medium',
              deltaTone === 'success' && 'bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-success',
              deltaTone === 'danger' && 'bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-danger',
              deltaTone === 'neutral' && 'bg-bg text-text-muted'
            )}
          >
            <DeltaIcon className="h-10 w-10" /> {delta.label}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold leading-tight text-text">{value}</div>
        <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</div>
      </div>
      {hint && <div className="text-xs text-text-muted">{hint}</div>}
    </motion.div>
  );
}
