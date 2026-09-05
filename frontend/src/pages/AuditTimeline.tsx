import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { History } from 'lucide-react';
import { listAuditLogs, type AuditLog } from '../api/auditLogs.api';
import { Card, CardContent } from '../components/ui/card';
import { Select } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

const TABLE_OPTIONS = [
  { value: '', label: 'All tables' },
  { value: 'contracts', label: 'Contracts' },
  { value: 'payruns', label: 'Payruns' },
];

const ACTION_STYLE: Record<AuditLog['action'], string> = {
  create: 'bg-[color-mix(in_srgb,var(--success)_12%,transparent)] text-success',
  update: 'bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-primary',
  status_change: 'bg-[color-mix(in_srgb,var(--warning)_12%,transparent)] text-warning',
};

// Tier 2 Audit Timeline (CLAUDE.md): read-only view over audit_logs, restricted server-side to
// hr_payroll_manager/admin. Cursor-paginated on created_at so "load more" stays stable even as
// new rows land while someone's scrolled halfway down.
export function AuditTimeline() {
  const [tableName, setTableName] = useState('');
  const [pages, setPages] = useState<AuditLog[][]>([]);

  const { data: firstPage, isLoading } = useQuery({
    queryKey: ['audit-logs', tableName],
    queryFn: () => listAuditLogs({ table_name: tableName || undefined, limit: 50 }),
  });

  const allRows = [...(firstPage ?? []), ...pages.flat()];
  const lastRow = allRows[allRows.length - 1];

  async function loadMore() {
    if (!lastRow) return;
    const next = await listAuditLogs({ table_name: tableName || undefined, before: lastRow.created_at, limit: 50 });
    setPages((prev) => [...prev, next]);
  }

  return (
    <div className="space-y-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-8 text-2xl font-bold text-text"><History className="h-[20px] w-[20px]" /> Audit Timeline</h1>
          <p className="text-sm text-text-muted">Every contract and payrun status change, who made it, and what changed.</p>
        </div>
        <Select className="w-auto" value={tableName} onChange={(e) => { setTableName(e.target.value); setPages([]); }}>
          {TABLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : allRows.length === 0 ? (
        <EmptyState icon={History} title="No audit entries yet" description="Contract and payrun changes will appear here as they happen." />
      ) : (
        <Card>
          <CardContent className="divide-y divide-border pt-16">
            {allRows.map((log) => (
              <div key={log.id} className="flex items-start justify-between gap-16 py-12 first:pt-0 last:pb-0">
                <div className="flex items-start gap-12">
                  <span className={cn('mt-2 rounded-full px-8 py-2 text-xs font-medium capitalize', ACTION_STYLE[log.action])}>
                    {log.action.replace('_', ' ')}
                  </span>
                  <div>
                    <div className="text-sm text-text">
                      <span className="font-medium">{log.table_name}</span>{' '}
                      <span className="font-mono text-xs text-text-muted">{log.record_id.slice(0, 8)}…</span>
                    </div>
                    <div className="mt-4 font-mono text-xs text-text-muted">
                      {Object.entries(log.changed_fields).map(([k, v]) => (
                        <span key={k} className="mr-12">{k}: {JSON.stringify(v)}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="whitespace-nowrap text-right text-xs text-text-muted">
                  <div>{log.user_email || 'system'}</div>
                  <div>{new Date(log.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {allRows.length > 0 && lastRow && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={loadMore}>Load more</Button>
        </div>
      )}
    </div>
  );
}
