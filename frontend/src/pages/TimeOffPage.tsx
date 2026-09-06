import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarClock, Plus, Check, X } from 'lucide-react';
import {
  listRequests, createRequest, approveRequest, refuseRequest,
  listAllocations, createAllocation, approveAllocation,
  listTimeOffTypes, createTimeOffType,
} from '../api/timeOff.api';
import { listEmployees, listEmployeeAllocations } from '../api/employees.api';
import type { TimeOffAllocation } from '../api/timeOff.api';
import { useAuthStore, HR_ROLES } from '../store/auth.store';
import { StatusBadge } from '../components/StatusBadge';
import { TableSkeleton } from '../components/ui/skeleton';
import { cn } from '../lib/utils';

type SubTab = 'requests' | 'allocations' | 'types';

function ErrorBanner({ error }: { error: unknown }) {
  const msg = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
  if (!msg) return null;
  return <div className="rounded-md bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-12 py-8 text-sm text-danger">{msg}</div>;
}

export function TimeOffPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<SubTab>('requests');
  const { user } = useAuthStore();
  const isHr = !!user && HR_ROLES.includes(user.role);
  const queryClient = useQueryClient();

  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => listEmployees(), enabled: isHr });
  const { data: types } = useQuery({ queryKey: ['timeoff-types'], queryFn: listTimeOffTypes });
  const { data: requests, isLoading: loadingRequests } = useQuery({ queryKey: ['timeoff-requests'], queryFn: () => listRequests() });
  const { data: allocations, isLoading: loadingAllocations } = useQuery({ queryKey: ['timeoff-allocations'], queryFn: () => listAllocations() });

  const approveReqMut = useMutation({
    mutationFn: approveRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timeoff-requests'] }),
  });
  const refuseReqMut = useMutation({
    mutationFn: refuseRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timeoff-requests'] }),
  });
  const approveAllocMut = useMutation({
    mutationFn: approveAllocation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['timeoff-allocations'] }),
  });

  const [showReqForm, setShowReqForm] = useState(false);
  const [reqForm, setReqForm] = useState({ employee_id: '', time_off_type_id: '', allocation_id: '', date_from: '', date_to: '', duration: '' });
  const [reqError, setReqError] = useState<unknown>(null);
  const createReqMut = useMutation({
    mutationFn: () => createRequest({ ...reqForm, duration: Number(reqForm.duration), allocation_id: reqForm.allocation_id || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff-requests'] });
      setShowReqForm(false);
      setReqError(null);
      setReqForm({ employee_id: '', time_off_type_id: '', allocation_id: '', date_from: '', date_to: '', duration: '' });
    },
    onError: setReqError,
  });

  // Self-service employees never see the Employee select above — the effective employee is
  // always their own record. HR picks it explicitly.
  const effectiveEmployeeId = isHr ? reqForm.employee_id : user?.employee_id || '';
  const selectedReqType = types?.find((t) => t.id === reqForm.time_off_type_id);
  const { data: reqEmployeeAllocations } = useQuery({
    queryKey: ['employee-allocations-for-request', effectiveEmployeeId],
    queryFn: () => listEmployeeAllocations(effectiveEmployeeId) as Promise<TimeOffAllocation[]>,
    enabled: !!effectiveEmployeeId && !!selectedReqType?.requires_allocation,
  });
  const usableAllocations = (reqEmployeeAllocations || []).filter(
    (a) => a.time_off_type_id === reqForm.time_off_type_id && a.status === 'approved' && Number(a.remaining) > 0
  );

  const [showAllocForm, setShowAllocForm] = useState(false);
  const [allocForm, setAllocForm] = useState({ employee_id: '', time_off_type_id: '', allocated: '', valid_from: '' });
  const [allocError, setAllocError] = useState<unknown>(null);
  const createAllocMut = useMutation({
    mutationFn: () => createAllocation({ ...allocForm, allocated: Number(allocForm.allocated) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff-allocations'] });
      setShowAllocForm(false);
      setAllocError(null);
    },
    onError: setAllocError,
  });

  const [showTypeForm, setShowTypeForm] = useState(false);
  const [typeForm, setTypeForm] = useState({ name: '', unit: 'days', requires_allocation: true });
  const createTypeMut = useMutation({
    mutationFn: () => createTimeOffType(typeForm as never),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeoff-types'] });
      setShowTypeForm(false);
    },
  });

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-[16px] md:px-[24px] py-[24px] flex flex-col gap-[24px]">
      <header>
        <h1 className="text-[28px] font-bold text-[var(--text)] tracking-tight mb-[4px]">Time Off Management</h1>
        <p className="text-[13px] text-[var(--text-muted)]">Review pending requests, allocations, and manage time off types.</p>
      </header>

      <div className="flex gap-[16px] border-b border-[var(--border)]">
        {(['requests', 'allocations', 'types'] as SubTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-[16px] py-[8px] text-[13px] font-semibold capitalize border-b-2 -mb-px transition-colors',
              tab === t ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'requests' && (
        <div className="flex flex-col gap-[16px]">
          <div className="flex justify-end">
            <button
              onClick={() => setShowReqForm((v) => !v)}
              className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--surface)] font-semibold text-[12px] px-[16px] py-[8px] rounded transition-colors flex items-center gap-[4px]"
            >
              <Plus className="h-[16px] w-[16px]" /> New Request
            </button>
          </div>
          {showReqForm && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] shadow-sm overflow-hidden">
              <div className="px-[24px] py-[16px] border-b border-[var(--border)]">
                <h2 className="text-[16px] font-semibold text-[var(--text)]">New Time Off Request</h2>
              </div>
              <div className="p-[24px]">
                <form className="grid grid-cols-2 gap-[16px]" onSubmit={(e) => { e.preventDefault(); createReqMut.mutate(); }}>
                  {isHr && (
                    <div className="flex flex-col gap-[8px] col-span-2">
                      <label className="text-[12px] font-semibold text-[var(--text)]">Employee</label>
                      <select required value={reqForm.employee_id} onChange={(e) => setReqForm({ ...reqForm, employee_id: e.target.value, allocation_id: '' })} className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:outline-none w-full">
                        <option value="">Select employee…</option>
                        {employees?.map((e) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                      </select>
                    </div>
                  )}
                  <div className="flex flex-col gap-[8px]">
                    <label className="text-[12px] font-semibold text-[var(--text)]">Type</label>
                    <select required value={reqForm.time_off_type_id} onChange={(e) => setReqForm({ ...reqForm, time_off_type_id: e.target.value, allocation_id: '' })} className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:outline-none w-full">
                      <option value="">Select type…</option>
                      {types?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  {selectedReqType?.requires_allocation && (
                    <div className="flex flex-col gap-[8px]">
                      <label className="text-[12px] font-semibold text-[var(--text)]">Allocation</label>
                      {!effectiveEmployeeId ? (
                        <div className="flex h-[36px] items-center text-[12px] text-[var(--text-muted)]">Select an employee first.</div>
                      ) : usableAllocations.length === 0 ? (
                        <div className="flex h-[36px] items-center text-[12px] text-[var(--danger)]">No approved balance available for this type.</div>
                      ) : (
                        <select required value={reqForm.allocation_id} onChange={(e) => setReqForm({ ...reqForm, allocation_id: e.target.value })} className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:outline-none w-full">
                          <option value="">Select allocation…</option>
                          {usableAllocations.map((a) => (
                            <option key={a.id} value={a.id}>
                              Remaining {a.remaining} of {a.allocated} (from {a.valid_from})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col gap-[8px]">
                    <label className="text-[12px] font-semibold text-[var(--text)]">Duration (days)</label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      step={1}
                      required
                      value={reqForm.duration}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') { setReqForm({ ...reqForm, duration: '' }); return; }
                        // Whole days only, never negative/zero, capped at a sane yearly max — a
                        // bare `min`/`step` attribute only blocks native form submission, not
                        // typing or the spinner arrows, so clamp the value itself here too.
                        const clamped = Math.min(365, Math.max(1, Math.round(Number(raw))));
                        setReqForm({ ...reqForm, duration: String(clamped) });
                      }}
                      className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:outline-none w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <label className="text-[12px] font-semibold text-[var(--text)]">From</label>
                    <input type="date" required value={reqForm.date_from} onChange={(e) => setReqForm({ ...reqForm, date_from: e.target.value })} className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:outline-none w-full" />
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <label className="text-[12px] font-semibold text-[var(--text)]">To</label>
                    <input type="date" required value={reqForm.date_to} onChange={(e) => setReqForm({ ...reqForm, date_to: e.target.value })} className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:outline-none w-full" />
                  </div>
                  <div className="col-span-2">
                    <ErrorBanner error={reqError} />
                  </div>
                  <div className="col-span-2 flex justify-end gap-[8px] mt-[8px]">
                    <button type="button" onClick={() => setShowReqForm(false)} className="px-[16px] py-[8px] border border-[var(--border)] rounded text-[12px] font-semibold text-[var(--text)] hover:bg-[var(--bg)] transition-colors bg-[var(--surface)]">Cancel</button>
                    <button
                      type="submit"
                      disabled={createReqMut.isPending || !!(selectedReqType?.requires_allocation && (usableAllocations.length === 0 || !reqForm.allocation_id))}
                      className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--surface)] font-semibold text-[12px] px-[16px] py-[8px] rounded transition-colors disabled:opacity-50"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] overflow-hidden shadow-sm">
            <div className="px-[16px] py-[12px] border-b border-[var(--border)] bg-[var(--surface)] flex justify-between items-center">
              <h2 className="text-[14px] font-semibold text-[var(--text)]">Time Off Requests</h2>
            </div>
            <div className="overflow-x-auto w-full">
              {loadingRequests ? <TableSkeleton /> : !requests || requests.length === 0 ? (
                <div className="py-[48px] flex flex-col items-center justify-center text-[var(--text-muted)]">
                  <CalendarClock className="h-[32px] w-[32px] mb-[16px] opacity-50" />
                  <p className="text-[14px] font-medium">No time off requests</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Employee</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Type</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">From</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">To</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Duration</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                      {isHr && <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="font-medium text-[13px] text-[var(--text)]">
                    {requests.map((r) => (
                      <tr key={r.id} className="cursor-pointer border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors" onClick={() => navigate(`/time-off/requests/${r.id}`)}>
                        <td className="py-[12px] px-[12px] font-semibold">{r.first_name} {r.last_name}</td>
                        <td className="py-[12px] px-[12px] text-[var(--text-muted)]">{r.type_name}</td>
                        <td className="py-[12px] px-[12px] text-[var(--text-muted)] font-normal">{r.date_from}</td>
                        <td className="py-[12px] px-[12px] text-[var(--text-muted)] font-normal">{r.date_to}</td>
                        <td className="py-[12px] px-[12px] font-mono text-[var(--text-muted)]">{r.duration}d</td>
                        <td className="py-[12px] px-[12px]"><StatusBadge status={r.status} domain="timeOffRequest" /></td>
                        {isHr && (
                          <td className="py-[12px] px-[12px] text-right">
                            {r.status === 'submitted' ? (
                              <div className="flex gap-[4px] justify-end">
                                <button onClick={(e) => { e.stopPropagation(); approveReqMut.mutate(r.id); }} className="bg-[var(--primary-light)] hover:bg-[var(--primary-light)] text-[var(--success)] p-[4px] rounded transition-colors"><Check className="h-[14px] w-[14px]" /></button>
                                <button onClick={(e) => { e.stopPropagation(); refuseReqMut.mutate(r.id); }} className="bg-[color-mix(in_srgb,var(--danger)_12%,transparent)] hover:bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] text-[var(--danger)] p-[4px] rounded transition-colors"><X className="h-[14px] w-[14px]" /></button>
                              </div>
                            ) : (
                              <span className="text-[12px] text-[var(--text-muted)]">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'allocations' && isHr && (
        <div className="flex flex-col gap-[16px]">
          <div className="flex justify-end">
            <button onClick={() => setShowAllocForm((v) => !v)} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--surface)] font-semibold text-[12px] px-[16px] py-[8px] rounded transition-colors flex items-center gap-[4px]">
              <Plus className="h-[16px] w-[16px]" /> New Allocation
            </button>
          </div>
          {showAllocForm && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] shadow-sm overflow-hidden">
              <div className="px-[24px] py-[16px] border-b border-[var(--border)]">
                <h2 className="text-[16px] font-semibold text-[var(--text)]">New Allocation</h2>
              </div>
              <div className="p-[24px]">
                <form className="grid grid-cols-2 gap-[16px]" onSubmit={(e) => { e.preventDefault(); createAllocMut.mutate(); }}>
                  <div className="flex flex-col gap-[8px] col-span-2">
                    <label className="text-[12px] font-semibold text-[var(--text)]">Employee</label>
                    <select required value={allocForm.employee_id} onChange={(e) => setAllocForm({ ...allocForm, employee_id: e.target.value })} className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:outline-none w-full">
                      <option value="">Select employee…</option>
                      {employees?.map((e) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <label className="text-[12px] font-semibold text-[var(--text)]">Type</label>
                    <select required value={allocForm.time_off_type_id} onChange={(e) => setAllocForm({ ...allocForm, time_off_type_id: e.target.value })} className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:outline-none w-full">
                      <option value="">Select type…</option>
                      {types?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <label className="text-[12px] font-semibold text-[var(--text)]">Allocated (days)</label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      step={1}
                      required
                      value={allocForm.allocated}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === '') { setAllocForm({ ...allocForm, allocated: '' }); return; }
                        const clamped = Math.min(365, Math.max(1, Math.round(Number(raw))));
                        setAllocForm({ ...allocForm, allocated: String(clamped) });
                      }}
                      className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:outline-none w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <label className="text-[12px] font-semibold text-[var(--text)]">Valid From</label>
                    <input type="date" required value={allocForm.valid_from} onChange={(e) => setAllocForm({ ...allocForm, valid_from: e.target.value })} className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:outline-none w-full" />
                  </div>
                  <div className="col-span-2">
                    <ErrorBanner error={allocError} />
                  </div>
                  <div className="col-span-2 flex justify-end gap-[8px] mt-[8px]">
                    <button type="button" onClick={() => setShowAllocForm(false)} className="px-[16px] py-[8px] border border-[var(--border)] rounded text-[12px] font-semibold text-[var(--text)] hover:bg-[var(--bg)] transition-colors bg-[var(--surface)]">Cancel</button>
                    <button type="submit" disabled={createAllocMut.isPending} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--surface)] font-semibold text-[12px] px-[16px] py-[8px] rounded transition-colors disabled:opacity-50">Create Allocation</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] overflow-hidden shadow-sm">
            <div className="px-[16px] py-[12px] border-b border-[var(--border)] bg-[var(--surface)] flex justify-between items-center">
              <h2 className="text-[14px] font-semibold text-[var(--text)]">Allocations</h2>
            </div>
            <div className="overflow-x-auto w-full">
              {loadingAllocations ? <TableSkeleton /> : !allocations || allocations.length === 0 ? (
                <div className="py-[48px] flex flex-col items-center justify-center text-[var(--text-muted)]">
                  <CalendarClock className="h-[32px] w-[32px] mb-[16px] opacity-50" />
                  <p className="text-[14px] font-medium">No allocations</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Employee</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Type</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Allocated</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Taken</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Remaining</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Status</th>
                      <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-medium text-[13px] text-[var(--text)]">
                    {allocations.map((a) => (
                      <tr key={a.id} className="cursor-pointer border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors" onClick={() => navigate(`/time-off/allocations/${a.id}`)}>
                        <td className="py-[12px] px-[12px]">
                          {a.first_name ? (
                            <>
                              {a.first_name} {a.last_name}{' '}
                              <span className="font-mono text-[11px] text-[var(--text-muted)]">({a.employee_code})</span>
                            </>
                          ) : (
                            <span className="font-mono text-[12px] text-[var(--text-muted)]">{a.employee_id.slice(0, 8)}</span>
                          )}
                        </td>
                        <td className="py-[12px] px-[12px] text-[var(--text-muted)]">{a.type_name ?? '—'}</td>
                        <td className="py-[12px] px-[12px] font-mono text-[var(--text-muted)]">{a.allocated}</td>
                        <td className="py-[12px] px-[12px] font-mono text-[var(--text-muted)]">{a.taken}</td>
                        <td className="py-[12px] px-[12px] font-mono font-bold text-[var(--text)]">{a.remaining}</td>
                        <td className="py-[12px] px-[12px]"><StatusBadge status={a.status} domain="timeOffAllocation" /></td>
                        <td className="py-[12px] px-[12px] text-right">
                          {a.status === 'draft' ? (
                            <button onClick={(e) => { e.stopPropagation(); approveAllocMut.mutate(a.id); }} className="bg-[var(--primary-light)] hover:bg-[var(--primary-light)] text-[var(--primary)] text-[11px] font-bold px-[8px] py-[4px] rounded transition-colors">Approve</button>
                          ) : (
                            <span className="text-[12px] text-[var(--text-muted)]">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'types' && isHr && (
        <div className="flex flex-col gap-[16px]">
          <div className="flex justify-end">
            <button onClick={() => setShowTypeForm((v) => !v)} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--surface)] font-semibold text-[12px] px-[16px] py-[8px] rounded transition-colors flex items-center gap-[4px]">
              <Plus className="h-[16px] w-[16px]" /> New Type
            </button>
          </div>
          {showTypeForm && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] shadow-sm overflow-hidden">
              <div className="px-[24px] py-[16px] border-b border-[var(--border)]">
                <h2 className="text-[16px] font-semibold text-[var(--text)]">New Time Off Type</h2>
              </div>
              <div className="p-[24px]">
                <form className="grid grid-cols-2 gap-[16px]" onSubmit={(e) => { e.preventDefault(); createTypeMut.mutate(); }}>
                  <div className="flex flex-col gap-[8px]">
                    <label className="text-[12px] font-semibold text-[var(--text)]">Name</label>
                    <input required value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:outline-none w-full" />
                  </div>
                  <div className="flex flex-col gap-[8px]">
                    <label className="text-[12px] font-semibold text-[var(--text)]">Unit</label>
                    <select value={typeForm.unit} onChange={(e) => setTypeForm({ ...typeForm, unit: e.target.value })} className="h-[36px] px-[12px] text-[13px] border border-[var(--border)] rounded bg-[var(--surface)] focus:border-[var(--primary)] focus:ring-1 focus:outline-none w-full">
                      <option value="days">Days</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                  <div className="col-span-2 flex justify-end gap-[8px] mt-[8px]">
                    <button type="button" onClick={() => setShowTypeForm(false)} className="px-[16px] py-[8px] border border-[var(--border)] rounded text-[12px] font-semibold text-[var(--text)] hover:bg-[var(--bg)] transition-colors bg-[var(--surface)]">Cancel</button>
                    <button type="submit" disabled={createTypeMut.isPending} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--surface)] font-semibold text-[12px] px-[16px] py-[8px] rounded transition-colors disabled:opacity-50">Create Type</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[6px] overflow-hidden shadow-sm">
            <div className="px-[16px] py-[12px] border-b border-[var(--border)] bg-[var(--surface)] flex justify-between items-center">
              <h2 className="text-[14px] font-semibold text-[var(--text)]">Time Off Types</h2>
            </div>
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                    <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Name</th>
                    <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Unit</th>
                    <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Requires Allocation</th>
                    <th className="py-[8px] px-[12px] font-semibold text-[12px] text-[var(--text-muted)] uppercase tracking-wider">Payroll Integrated</th>
                  </tr>
                </thead>
                <tbody className="font-medium text-[13px] text-[var(--text)]">
                  {types?.map((t) => (
                    <tr key={t.id} className="cursor-pointer border-b border-[var(--border)] hover:bg-[var(--bg)] transition-colors" onClick={() => navigate(`/time-off/types/${t.id}`)}>
                      <td className="py-[12px] px-[12px] font-semibold">{t.name}</td>
                      <td className="py-[12px] px-[12px] capitalize text-[var(--text-muted)]">{t.unit}</td>
                      <td className="py-[12px] px-[12px] text-[var(--text-muted)]">{t.requires_allocation ? 'Yes' : 'No'}</td>
                      <td className="py-[12px] px-[12px] text-[var(--text-muted)]">{t.payroll_integrated ? 'Yes' : 'No'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
