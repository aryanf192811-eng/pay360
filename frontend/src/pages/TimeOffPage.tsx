import { useState } from 'react';
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
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/ui/skeleton';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input, Label, Select } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';

type SubTab = 'requests' | 'allocations' | 'types';

function ErrorBanner({ error }: { error: unknown }) {
  const msg = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
  if (!msg) return null;
  return <div className="rounded-md bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-12 py-8 text-sm text-danger">{msg}</div>;
}

export function TimeOffPage() {
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
    <div className="space-y-24">
      <div>
        <h1 className="text-2xl font-bold text-text">Time Off</h1>
        <p className="text-sm text-text-muted">Requests, Allocations, and configured Time Off Types.</p>
      </div>

      <div className="flex gap-4 border-b border-border">
        {(['requests', 'allocations', 'types'] as SubTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-16 py-8 text-sm font-medium capitalize border-b-2 -mb-px',
              tab === t ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text'
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'requests' && (
        <div className="space-y-16">
          <div className="flex justify-end">
            <Button onClick={() => setShowReqForm((v) => !v)}>
              <Plus className="h-16 w-16" /> New Request
            </Button>
          </div>
          {showReqForm && (
            <Card>
              <CardHeader><CardTitle>New Time Off Request</CardTitle></CardHeader>
              <CardContent>
                <form className="grid grid-cols-2 gap-16" onSubmit={(e) => { e.preventDefault(); createReqMut.mutate(); }}>
                  {isHr && (
                    <div className="space-y-4 col-span-2">
                      <Label>Employee</Label>
                      <Select required value={reqForm.employee_id} onChange={(e) => setReqForm({ ...reqForm, employee_id: e.target.value, allocation_id: '' })}>
                        <option value="">Select employee…</option>
                        {employees?.map((e) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                      </Select>
                    </div>
                  )}
                  <div className="space-y-4">
                    <Label>Type</Label>
                    <Select required value={reqForm.time_off_type_id} onChange={(e) => setReqForm({ ...reqForm, time_off_type_id: e.target.value, allocation_id: '' })}>
                      <option value="">Select type…</option>
                      {types?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </Select>
                  </div>
                  {selectedReqType?.requires_allocation && (
                    <div className="space-y-4">
                      <Label>Allocation</Label>
                      {!effectiveEmployeeId ? (
                        <div className="flex h-10 items-center text-xs text-text-muted">Select an employee first.</div>
                      ) : usableAllocations.length === 0 ? (
                        <div className="flex h-10 items-center text-xs text-danger">No approved balance available for this type.</div>
                      ) : (
                        <Select required value={reqForm.allocation_id} onChange={(e) => setReqForm({ ...reqForm, allocation_id: e.target.value })}>
                          <option value="">Select allocation…</option>
                          {usableAllocations.map((a) => (
                            <option key={a.id} value={a.id}>
                              Remaining {a.remaining} of {a.allocated} (from {a.valid_from})
                            </option>
                          ))}
                        </Select>
                      )}
                    </div>
                  )}
                  <div className="space-y-4">
                    <Label>Duration (days)</Label>
                    <Input type="number" step="0.5" required value={reqForm.duration} onChange={(e) => setReqForm({ ...reqForm, duration: e.target.value })} />
                  </div>
                  <div className="space-y-4">
                    <Label>From</Label>
                    <Input type="date" required value={reqForm.date_from} onChange={(e) => setReqForm({ ...reqForm, date_from: e.target.value })} />
                  </div>
                  <div className="space-y-4">
                    <Label>To</Label>
                    <Input type="date" required value={reqForm.date_to} onChange={(e) => setReqForm({ ...reqForm, date_to: e.target.value })} />
                  </div>
                  <ErrorBanner error={reqError} />
                  <div className="col-span-2 flex justify-end gap-8">
                    <Button type="button" variant="secondary" onClick={() => setShowReqForm(false)}>Cancel</Button>
                    <Button
                      type="submit"
                      disabled={createReqMut.isPending || !!(selectedReqType?.requires_allocation && (usableAllocations.length === 0 || !reqForm.allocation_id))}
                    >
                      Submit Request
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loadingRequests ? <TableSkeleton /> : !requests || requests.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No time off requests" description="Requests submitted by employees will appear here for approval." />
          ) : (
            <Table>
              <Thead><tr><Th>Employee</Th><Th>Type</Th><Th>From</Th><Th>To</Th><Th>Duration</Th><Th>Status</Th>{isHr && <Th>Actions</Th>}</tr></Thead>
              <Tbody>
                {requests.map((r) => (
                  <Tr key={r.id}>
                    <Td className="font-medium">{r.first_name} {r.last_name}</Td>
                    <Td>{r.type_name}</Td>
                    <Td>{r.date_from}</Td>
                    <Td>{r.date_to}</Td>
                    <Td className="font-mono">{r.duration}</Td>
                    <Td><StatusBadge status={r.status} domain="timeOffRequest" /></Td>
                    {isHr && (
                      <Td>
                        {r.status === 'submitted' && (
                          <div className="flex gap-4">
                            <Button size="sm" variant="secondary" onClick={() => approveReqMut.mutate(r.id)}><Check className="h-14 w-14 text-success" /></Button>
                            <Button size="sm" variant="secondary" onClick={() => refuseReqMut.mutate(r.id)}><X className="h-14 w-14 text-danger" /></Button>
                          </div>
                        )}
                      </Td>
                    )}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </div>
      )}

      {tab === 'allocations' && isHr && (
        <div className="space-y-16">
          <div className="flex justify-end">
            <Button onClick={() => setShowAllocForm((v) => !v)}><Plus className="h-16 w-16" /> New Allocation</Button>
          </div>
          {showAllocForm && (
            <Card>
              <CardHeader><CardTitle>New Allocation</CardTitle></CardHeader>
              <CardContent>
                <form className="grid grid-cols-2 gap-16" onSubmit={(e) => { e.preventDefault(); createAllocMut.mutate(); }}>
                  <div className="space-y-4 col-span-2">
                    <Label>Employee</Label>
                    <Select required value={allocForm.employee_id} onChange={(e) => setAllocForm({ ...allocForm, employee_id: e.target.value })}>
                      <option value="">Select employee…</option>
                      {employees?.map((e) => <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label>Type</Label>
                    <Select required value={allocForm.time_off_type_id} onChange={(e) => setAllocForm({ ...allocForm, time_off_type_id: e.target.value })}>
                      <option value="">Select type…</option>
                      {types?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </Select>
                  </div>
                  <div className="space-y-4">
                    <Label>Allocated (days)</Label>
                    <Input type="number" step="0.5" required value={allocForm.allocated} onChange={(e) => setAllocForm({ ...allocForm, allocated: e.target.value })} />
                  </div>
                  <div className="space-y-4">
                    <Label>Valid From</Label>
                    <Input type="date" required value={allocForm.valid_from} onChange={(e) => setAllocForm({ ...allocForm, valid_from: e.target.value })} />
                  </div>
                  <ErrorBanner error={allocError} />
                  <div className="col-span-2 flex justify-end gap-8">
                    <Button type="button" variant="secondary" onClick={() => setShowAllocForm(false)}>Cancel</Button>
                    <Button type="submit" disabled={createAllocMut.isPending}>Create Allocation</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {loadingAllocations ? <TableSkeleton /> : !allocations || allocations.length === 0 ? (
            <EmptyState icon={CalendarClock} title="No allocations" description="Grant employees a leave balance to enable Time Off Requests." />
          ) : (
            <Table>
              <Thead><tr><Th>Employee</Th><Th>Allocated</Th><Th>Taken</Th><Th>Remaining</Th><Th>Status</Th><Th>Actions</Th></tr></Thead>
              <Tbody>
                {allocations.map((a) => (
                  <Tr key={a.id}>
                    <Td className="font-mono text-xs">{a.employee_id.slice(0, 8)}</Td>
                    <Td className="font-mono">{a.allocated}</Td>
                    <Td className="font-mono">{a.taken}</Td>
                    <Td className="font-mono font-semibold">{a.remaining}</Td>
                    <Td><StatusBadge status={a.status} domain="timeOffAllocation" /></Td>
                    <Td>
                      {a.status === 'draft' && (
                        <Button size="sm" variant="secondary" onClick={() => approveAllocMut.mutate(a.id)}>Approve</Button>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </div>
      )}

      {tab === 'types' && isHr && (
        <div className="space-y-16">
          <div className="flex justify-end">
            <Button onClick={() => setShowTypeForm((v) => !v)}><Plus className="h-16 w-16" /> New Type</Button>
          </div>
          {showTypeForm && (
            <Card>
              <CardHeader><CardTitle>New Time Off Type</CardTitle></CardHeader>
              <CardContent>
                <form className="grid grid-cols-2 gap-16" onSubmit={(e) => { e.preventDefault(); createTypeMut.mutate(); }}>
                  <div className="space-y-4">
                    <Label>Name</Label>
                    <Input required value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} />
                  </div>
                  <div className="space-y-4">
                    <Label>Unit</Label>
                    <Select value={typeForm.unit} onChange={(e) => setTypeForm({ ...typeForm, unit: e.target.value })}>
                      <option value="days">Days</option>
                      <option value="hours">Hours</option>
                    </Select>
                  </div>
                  <div className="col-span-2 flex justify-end gap-8">
                    <Button type="button" variant="secondary" onClick={() => setShowTypeForm(false)}>Cancel</Button>
                    <Button type="submit" disabled={createTypeMut.isPending}>Create Type</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          <Table>
            <Thead><tr><Th>Name</Th><Th>Unit</Th><Th>Requires Allocation</Th><Th>Payroll Integrated</Th></tr></Thead>
            <Tbody>
              {types?.map((t) => (
                <Tr key={t.id}>
                  <Td className="font-medium">{t.name}</Td>
                  <Td className="capitalize">{t.unit}</Td>
                  <Td>{t.requires_allocation ? 'Yes' : 'No'}</Td>
                  <Td>{t.payroll_integrated ? 'Yes' : 'No'}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      )}
    </div>
  );
}
