import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { getTimeOffType, updateTimeOffType } from '../api/timeOff.api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input, Label, Select } from '../components/ui/input';
import { CardSkeleton } from '../components/ui/skeleton';

export function TimeOffTypeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: type, isLoading } = useQuery({ queryKey: ['timeoff-type', id], queryFn: () => getTimeOffType(id!), enabled: !!id });

  const [form, setForm] = useState<{ name: string; unit: 'days' | 'hours'; requires_allocation: boolean; payroll_integrated: boolean }>({ name: '', unit: 'days', requires_allocation: true, payroll_integrated: false });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (type) setForm({ name: type.name, unit: type.unit, requires_allocation: type.requires_allocation, payroll_integrated: type.payroll_integrated });
  }, [type]);

  const mutation = useMutation({
    mutationFn: () => updateTimeOffType(id!, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff-type', id] });
      queryClient.invalidateQueries({ queryKey: ['timeoff-types'] });
      setError(null);
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e?.response?.data?.error?.message || 'Failed to update time off type');
    },
  });

  if (isLoading || !type) return <CardSkeleton />;

  return (
    <div className="mx-auto max-w-[600px] space-y-24">
      <button onClick={() => navigate('/time-off')} className="flex items-center gap-4 text-sm text-text-muted hover:text-text">
        <ArrowLeft className="h-[14px] w-[14px]" /> Back to Time Off
      </button>

      <Card>
        <CardHeader><CardTitle>Time Off Type / {type.name}</CardTitle></CardHeader>
        <CardContent>
          <form className="grid grid-cols-2 gap-16" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
            <div className="col-span-2 space-y-4">
              <Label>Name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-4">
              <Label>Unit</Label>
              <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value as 'days' | 'hours' })}>
                <option value="days">Days</option>
                <option value="hours">Hours</option>
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Requires Allocation</Label>
              <Select value={form.requires_allocation ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, requires_allocation: e.target.value === 'yes' })}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Payroll Integrated</Label>
              <Select value={form.payroll_integrated ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, payroll_integrated: e.target.value === 'yes' })}>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </Select>
            </div>
            {error && <div className="col-span-2 rounded-md bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-12 py-8 text-sm text-danger">{error}</div>}
            <div className="col-span-2 flex justify-end gap-8">
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save Changes'}</Button>
            </div>
          </form>
          <p className="mt-16 text-xs text-text-muted">
            {form.requires_allocation
              ? 'Requests of this type draw down an approved allocation\'s balance.'
              : 'Requests of this type do not require a pre-approved allocation.'}{' '}
            {form.payroll_integrated && 'Approved leave of this type also affects payroll calculation for the active period.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
