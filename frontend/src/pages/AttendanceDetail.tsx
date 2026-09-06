import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Pencil } from 'lucide-react';
import { getAttendance, correctAttendance } from '../api/attendances.api';
import { useAuthStore, HR_ROLES } from '../store/auth.store';
import { StatusBadge } from '../components/StatusBadge';
import { Avatar } from '../components/Avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input, Label, Select } from '../components/ui/input';
import { CardSkeleton } from '../components/ui/skeleton';

const STATUSES = ['present', 'late', 'absent', 'overtime', 'missing_checkout'] as const;

function toLocalInput(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AttendanceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isHr = !!user && HR_ROLES.includes(user.role);
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ check_in: '', check_out: '', status: 'present' as typeof STATUSES[number], notes: '' });

  const { data: attendance, isLoading } = useQuery({ queryKey: ['attendance', id], queryFn: () => getAttendance(id!), enabled: !!id });

  useEffect(() => {
    if (attendance) {
      setForm({
        check_in: toLocalInput(attendance.check_in),
        check_out: toLocalInput(attendance.check_out),
        status: attendance.status,
        notes: attendance.notes || '',
      });
    }
  }, [attendance]);

  const mutation = useMutation({
    mutationFn: () => correctAttendance(id!, {
      check_in: form.check_in ? new Date(form.check_in).toISOString() : undefined,
      check_out: form.check_out ? new Date(form.check_out).toISOString() : null,
      status: form.status,
      notes: form.notes || undefined,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', id] });
      queryClient.invalidateQueries({ queryKey: ['attendances'] });
      setEditing(false);
    },
  });

  if (isLoading || !attendance) return <CardSkeleton />;

  return (
    <div className="mx-auto max-w-[700px] space-y-24">
      <button onClick={() => navigate('/attendance')} className="flex items-center gap-4 text-sm text-text-muted hover:text-text">
        <ArrowLeft className="h-[14px] w-[14px]" /> Back to Attendance
      </button>

      <Card>
        <CardContent className="flex items-center justify-between pt-24">
          <div className="flex items-center gap-16">
            <Avatar seed={attendance.employee_id} initials={`${attendance.first_name?.charAt(0) ?? ''}${attendance.last_name?.charAt(0) ?? ''}`} size="lg" />
            <div>
              <div className="text-xl font-bold text-text">{attendance.first_name} {attendance.last_name}</div>
              <div className="text-sm text-text-muted">{attendance.department || 'No department'} · {new Date(attendance.check_in).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-12">
            <StatusBadge status={attendance.status} domain="attendance" />
            {isHr && !editing && (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-[14px] w-[14px]" /> Correct
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Attendance Record</CardTitle></CardHeader>
        <CardContent>
          {!editing ? (
            <div className="grid grid-cols-2 gap-16 text-sm">
              <div><div className="text-xs font-medium uppercase text-text-muted">Check In</div><div className="mt-4 text-text">{new Date(attendance.check_in).toLocaleString()}</div></div>
              <div><div className="text-xs font-medium uppercase text-text-muted">Check Out</div><div className="mt-4 text-text">{attendance.check_out ? new Date(attendance.check_out).toLocaleString() : '—'}</div></div>
              <div><div className="text-xs font-medium uppercase text-text-muted">Worked Hours</div><div className="mt-4 font-mono text-text">{attendance.worked_hours ?? '—'}</div></div>
              <div><div className="text-xs font-medium uppercase text-text-muted">Manual Correction</div><div className="mt-4 text-text">{attendance.is_manual_correction ? `Yes${attendance.corrected_by_email ? ` (by ${attendance.corrected_by_email})` : ''}` : 'No'}</div></div>
              <div className="col-span-2">
                <div className="text-xs font-medium uppercase text-text-muted">Notes</div>
                <div className="mt-4 text-text">{attendance.notes || 'System-generated from check in/out.'}</div>
              </div>
            </div>
          ) : (
            <form className="grid grid-cols-2 gap-16" onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}>
              <div className="space-y-4">
                <Label>Check In</Label>
                <Input type="datetime-local" required value={form.check_in} onChange={(e) => setForm({ ...form, check_in: e.target.value })} />
              </div>
              <div className="space-y-4">
                <Label>Check Out</Label>
                <Input type="datetime-local" value={form.check_out} onChange={(e) => setForm({ ...form, check_out: e.target.value })} />
              </div>
              <div className="space-y-4">
                <Label>Status</Label>
                <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as typeof STATUSES[number] })}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </Select>
              </div>
              <div className="col-span-2 space-y-4">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Reason for correction…" />
              </div>
              <div className="col-span-2 flex justify-end gap-8">
                <Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
                <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save Correction'}</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
