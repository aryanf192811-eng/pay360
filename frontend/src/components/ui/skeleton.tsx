import { cn } from '../../lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-border/60', className)} />;
}

/** Shaped like a real data table — pattern 9: never a bare spinner. */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="bg-bg px-16 py-8 flex gap-24">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-10 flex-1" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-16 py-12 flex gap-24">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-16 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-surface p-16 space-y-8">
      <Skeleton className="h-12 w-1/3" />
      <Skeleton className="h-32 w-2/3" />
    </div>
  );
}
