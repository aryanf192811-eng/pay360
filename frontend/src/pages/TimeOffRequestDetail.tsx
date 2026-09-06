import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, X } from 'lucide-react';
import { getRequest, approveRequest, refuseRequest } from '../api/timeOff.api';
import { useAuthStore, HR_ROLES } from '../store/auth.store';
import { StatusBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CardSkeleton } from '../components/ui/skeleton';

export function TimeOffRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isHr = !!user && HR_ROLES.includes(user.role);
  const queryClient = useQueryClient();

  const { data: request, isLoading } = useQuery({ queryKey: ['timeoff-request', id], queryFn: () => getRequest(id!), enabled: !!id });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['timeoff-request', id] });
    queryClient.invalidateQueries({ queryKey: ['timeoff-requests'] });
  };
  const approveMut = useMutation({ mutationFn: () => approveRequest(id!), onSuccess: invalidate });
  const refuseMut = useMutation({ mutationFn: () => refuseRequest(id!), onSuccess: invalidate });

  if (isLoading || !request) return <CardSkeleton />;

  return (
    <div className="mx-auto max-w-[700px] space-y-24">
      <button onClick={() => navigate('/time-off')} className="flex items-center gap-4 text-sm text-text-muted hover:text-text">
        <ArrowLeft className="h-[14px] w-[14px]" /> Back to Time Off
      </button>

      <Card>
        <CardContent className="flex items-center justify-between pt-24">
          <div className="flex items-center gap-16">
            <Avatar seed={request.employee_id} initials={`${request.first_name?.charAt(0) ?? ''}${request.last_name?.charAt(0) ?? ''}`} size="lg" />
            <div>
              <div className="text-xl font-bold text-text">{request.first_name} {request.last_name}</div>
              <div className="text-sm text-text-muted">{request.type_name} · {request.duration} day(s)</div>
            </div>
          </div>
          <StatusBadge status={request.status} domain="timeOffRequest" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Request Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-16 text-sm">
          <div><div className="text-xs font-medium uppercase text-text-muted">From</div><div className="mt-4 text-text">{request.date_from}</div></div>
          <div><div className="text-xs font-medium uppercase text-text-muted">To</div><div className="mt-4 text-text">{request.date_to}</div></div>
          <div><div className="text-xs font-medium uppercase text-text-muted">Duration</div><div className="mt-4 font-mono text-text">{request.duration} day(s)</div></div>
          <div><div className="text-xs font-medium uppercase text-text-muted">Type</div><div className="mt-4 text-text">{request.type_name}</div></div>
          <div><div className="text-xs font-medium uppercase text-text-muted">Approved/Refused By</div><div className="mt-4 text-text">{request.approved_by_email || '—'}</div></div>
          <div><div className="text-xs font-medium uppercase text-text-muted">Decided At</div><div className="mt-4 text-text">{request.decided_at ? new Date(request.decided_at).toLocaleString() : '—'}</div></div>
        </CardContent>
        {isHr && request.status === 'submitted' && (
          <CardContent className="flex justify-end gap-8 pt-0">
            <Button variant="secondary" onClick={() => refuseMut.mutate()} disabled={approveMut.isPending || refuseMut.isPending}>
              <X className="h-[14px] w-[14px]" /> Refuse
            </Button>
            <Button onClick={() => approveMut.mutate()} disabled={approveMut.isPending || refuseMut.isPending}>
              <Check className="h-[14px] w-[14px]" /> Approve
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
