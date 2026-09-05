import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

// Pattern 9: every empty list gets an icon + specific message + CTA in a card — never a bare
// icon floating on blank white.
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-8 py-64 pt-64 text-center">
        <div className="flex h-48 w-48 items-center justify-center rounded-full bg-bg">
          <Icon className="h-24 w-24 text-text-muted" />
        </div>
        <div className="text-base font-semibold text-text">{title}</div>
        <div className="max-w-sm text-sm text-text-muted">{description}</div>
        {actionLabel && onAction && (
          <Button size="sm" onClick={onAction} className="mt-8">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
