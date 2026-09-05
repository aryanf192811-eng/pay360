import * as React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, dark, ...props }: React.HTMLAttributes<HTMLDivElement> & { dark?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-lg border shadow-tinted',
        dark ? 'border-transparent bg-surface-dark text-surface-dark-foreground' : 'border-border bg-surface text-text',
        className
      )}
      {...props}
    />
  );
}
export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-between px-16 pt-16 pb-8', className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-bold tracking-tight', className)} {...props} />;
}
export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('px-16 pb-16', className)} {...props} />;
}
