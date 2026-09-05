import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { listSchedules, getSchedule, createSchedule, updateSchedule } from '../api/reference.api';
import type { ScheduleLine } from '../api/reference.api';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/ui/skeleton';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input, Label, Select } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const SCHEDULE_TYPES = ['full_time', 'part_time', 'shift'] as const;
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type LineRow = ScheduleLine;

const EMPTY_LINE: LineRow = { day_of_week: 1, start_time: '09:00', end_time: '17:00', break_minutes: 30 };

// Live preview only — the authoritative total is always recomputed server-side on save
// (never trust a client-computed number as the stored value). Mirrors the same
// end-minus-start-minus-break arithmetic so the preview matches what gets saved.
function calculateWeeklyHours(rows: LineRow[]): number {
  const total = rows.reduce((sum, line) => {
    const [sh, sm] = line.start_time.split(':').map(Number);
    const [eh, em] = line.end_time.split(':').map(Number);
    const minutes = eh * 60 + em - (sh * 60 + sm) - (line.break_minutes || 0);
    return sum + Math.max(minutes, 0);
  }, 0);
  return Math.round((total / 60) * 100) / 100;
}

export function WorkingSchedules() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [scheduleType, setScheduleType] = useState<(typeof SCHEDULE_TYPES)[number]>('full_time');
  const [lines, setLines] = useState<LineRow[]>([{ ...EMPTY_LINE }]);
  const [error, setError] = useState<string | null>(null);

  const { data: schedules, isLoading } = useQuery({ queryKey: ['schedules'], queryFn: listSchedules });

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setScheduleType('full_time');
    setLines([{ ...EMPTY_LINE }]);
    setError(null);
  };

  const startCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const startEdit = async (id: string) => {
    setError(null);
    const full = await getSchedule(id);
    setEditingId(id);
    setName(full.name);
    setScheduleType(full.schedule_type);
    setLines(
      (full.lines || []).map((l) => ({
        day_of_week: l.day_of_week,
        start_time: l.start_time.slice(0, 5),
        end_time: l.end_time.slice(0, 5),
        break_minutes: l.break_minutes,
      }))
    );
    setShowForm(true);
  };

  const mutation = useMutation({
    mutationFn: () => {
      const payload = { name, schedule_type: scheduleType, lines };
      return editingId ? updateSchedule(editingId, payload) : createSchedule(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      setShowForm(false);
      resetForm();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: { message?: string } } } };
      setError(e?.response?.data?.error?.message || 'Failed to save schedule');
    },
  });

  const updateLine = (idx: number, patch: Partial<LineRow>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };
  const addLine = () => setLines((prev) => [...prev, { ...EMPTY_LINE }]);
  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Working Schedules</h1>
          <p className="text-sm text-text-muted">Weekly patterns assigned to employees — total hours are always computed, never typed in.</p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="h-16 w-16" /> New Schedule
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Schedule' : 'New Schedule'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-16"
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
            >
              <div className="grid grid-cols-2 gap-16">
                <div className="space-y-4">
                  <Label>Name</Label>
                  <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard 40h" />
                </div>
                <div className="space-y-4">
                  <Label>Type</Label>
                  <Select value={scheduleType} onChange={(e) => setScheduleType(e.target.value as typeof scheduleType)}>
                    {SCHEDULE_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace('_', ' ')}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <Label>Weekly Pattern</Label>
                  <div className="flex items-center gap-12">
                    <span className="font-mono text-sm font-semibold text-primary">{calculateWeeklyHours(lines)}h / week</span>
                    <Button type="button" size="sm" variant="secondary" onClick={addLine}>
                      <Plus className="h-[14px] w-[14px]" /> Add Day
                    </Button>
                  </div>
                </div>
                <div className="space-y-8">
                  {lines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-[1.3fr_1fr_1fr_1fr_auto] items-end gap-8 rounded-md border border-border p-12">
                      <div className="space-y-4">
                        <Label>Day</Label>
                        <Select value={line.day_of_week} onChange={(e) => updateLine(idx, { day_of_week: Number(e.target.value) })}>
                          {DAY_NAMES.map((d, i) => (
                            <option key={i} value={i}>{d}</option>
                          ))}
                        </Select>
                      </div>
                      <div className="space-y-4">
                        <Label>Start</Label>
                        <Input type="time" required value={line.start_time} onChange={(e) => updateLine(idx, { start_time: e.target.value })} />
                      </div>
                      <div className="space-y-4">
                        <Label>End</Label>
                        <Input type="time" required value={line.end_time} onChange={(e) => updateLine(idx, { end_time: e.target.value })} />
                      </div>
                      <div className="space-y-4">
                        <Label>Break (min)</Label>
                        <Input type="number" min={0} value={line.break_minutes} onChange={(e) => updateLine(idx, { break_minutes: Number(e.target.value) })} />
                      </div>
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeLine(idx)} disabled={lines.length === 1}>
                        <Trash2 className="h-[14px] w-[14px] text-danger" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {error && <div className="rounded-md bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-12 py-8 text-sm text-danger">{error}</div>}
              <div className="flex justify-end gap-8">
                <Button type="button" variant="secondary" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Saving…' : editingId ? 'Save Changes' : 'Create Schedule'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : !schedules || schedules.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No working schedules yet"
          description="Create a schedule to define an employee's weekly hours — total hours are computed automatically from the pattern."
          actionLabel="New Schedule"
          onAction={startCreate}
        />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Total Weekly Hours</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {schedules.map((s) => (
              <Tr key={s.id} className="cursor-pointer" onClick={() => startEdit(s.id)}>
                <Td className="font-medium">{s.name}</Td>
                <Td className="capitalize">{s.schedule_type.replace('_', ' ')}</Td>
                <Td className="font-mono">{s.total_weekly_hours}h</Td>
                <Td>
                  <Button size="sm" variant="ghost">Edit →</Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
