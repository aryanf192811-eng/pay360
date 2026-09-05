import * as React from 'react';
import { cn } from '../../lib/utils';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'primary';

// Explicit color-mix() arbitrary values — our theme colors are plain hex CSS custom properties,
// so Tailwind's `/10` opacity-modifier shorthand can't reliably derive alpha from them. This is
// the safe, version-independent way to get a tinted background + full-strength text/border.
const toneClasses: Record<Tone, string> = {
  neutral: 'bg-bg text-text-muted border-border',
  success: 'bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-success border-[color-mix(in_srgb,var(--success)_30%,transparent)]',
  warning: 'bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-warning border-[color-mix(in_srgb,var(--warning)_30%,transparent)]',
  danger: 'bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] text-danger border-[color-mix(in_srgb,var(--danger)_30%,transparent)]',
  info: 'bg-[color-mix(in_srgb,var(--info)_12%,transparent)] text-info border-[color-mix(in_srgb,var(--info)_30%,transparent)]',
  primary: 'bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-primary border-[color-mix(in_srgb,var(--primary)_30%,transparent)]',
};

export function Badge({ tone = 'neutral', className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-8 py-2 text-xs font-medium leading-none whitespace-nowrap',
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
