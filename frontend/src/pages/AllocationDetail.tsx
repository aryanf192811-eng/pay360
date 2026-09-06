import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check } from 'lucide-react';
import { getAllocation, approveAllocation } from '../api/timeOff.api';
import { StatusBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CardSkeleton } from '../components/ui/skeleton';

export function AllocationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: allocation, isLoading } = useQuery({ queryKey: ['timeoff-allocation', id], queryFn: () => getAllocation(id!), enabled: !!id });

  const approveMut = useMutation({
    mutationFn: () => approveAllocation(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff-allocation', id] });
      queryClient.invalidateQueries({ queryKey: ['timeoff-allocations'] });
    },
  });

  if (isLoading || !allocation) return <CardSkeleton />;

  return (
    <div className="mx-auto max-w-[700px] space-y-24">
      <button onClick={() => navigate('/time-off')} className="flex items-center gap-4 text-sm text-text-muted hover:text-text">
        <ArrowLeft className="h-[14px] w-[14px]" /> Back to Time Off
      </button>

      <Card>
        <CardContent className="flex items-center justify-between pt-24">
          <div className="flex items-center gap-16">
            <Avatar seed={allocation.employee_id} initials={`${allocation.first_name?.charAt(0) ?? ''}${allocation.last_name?.charAt(0) ?? ''}`} size="lg" />
            <div>
              <div className="text-xl font-bold text-text">{allocation.first_name} {allocation.last_name}</div>
              <div className="text-sm text-text-muted">{allocation.type_name}</div>
            </div>
          </div>
          <StatusBadge status={allocation.status} domain="timeOffAllocation" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Allocation Balance</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-16 text-sm">
          <div><div className="text-xs font-medium uppercase text-text-muted">Allocated</div><div className="mt-4 font-mono text-lg font-semibold text-text">{allocation.allocated}</div></div>
          <div><div className="text-xs font-medium uppercase text-text-muted">Taken</div><div className="mt-4 font-mono text-lg font-semibold text-text-muted">{allocation.taken}</div></div>
          <div><div className="text-xs font-medium uppercase text-text-muted">Remaining</div><div className="mt-4 font-mono text-lg font-semibold text-primary">{allocation.remaining}</div></div>
          <div><div className="text-xs font-medium uppercase text-text-muted">Valid From</div><div className="mt-4 text-text">{allocation.valid_from}</div></div>
          <div><div className="text-xs font-medium uppercase text-text-muted">Valid To</div><div className="mt-4 text-text">{allocation.valid_to || 'No expiry'}</div></div>
          <div><div className="text-xs font-medium uppercase text-text-muted">Approved By</div><div className="mt-4 text-text">{allocation.approved_by_email || '—'}</div></div>
        </CardContent>
        {allocation.status === 'draft' && (
          <CardContent className="flex justify-end pt-0">
            <Button onClick={() => approveMut.mutate()} disabled={approveMut.isPending}>
              <Check className="h-[14px] w-[14px]" /> {approveMut.isPending ? 'Approving…' : 'Approve'}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
