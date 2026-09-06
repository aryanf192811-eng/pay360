import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listUsers, updateUser } from '../api/users.api';
import { registerUserAsAdmin } from '../api/auth.api';
import { listEmployees } from '../api/employees.api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input, Label, Select } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { TableSkeleton } from '../components/ui/skeleton';
import { EmptyState } from '../components/EmptyState';
import { Users as UsersIcon, Plus } from 'lucide-react';

const ROLE_OPTIONS = ['employee', 'hr_manager', 'hr_payroll_user', 'hr_payroll_manager', 'admin'];

/**
 * PS §3 Admin: "User management, role assignment, permission updates." This is the only place
 * a `users` row gets linked to an `employees` row after account creation — without it, a
 * self-registered employee account can never use self-service (own attendance/leave/payslips),
 * since every ownership check in the backend keys off `users.employee_id`.
 */
export function UserManagement() {
  const queryClient = useQueryClient();
  const [edits, setEdits] = useState<Record<string, { role?: string; employee_id?: string }>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({ email: '', password: '', role: 'hr_manager' });
  const [addError, setAddError] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: listUsers });
  const { data: employees } = useQuery({ queryKey: ['employees-for-linking'], queryFn: () => listEmployees() });

  const mutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { role?: string; employee_id?: string | null } }) =>
      updateUser(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEdits((prev) => {
        const next = { ...prev };
        delete next[variables.id];
        return next;
      });
    },
  });

  const toggleActiveMut = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => updateUser(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  // Reuses POST /api/auth/register, authenticated this time — the backend allows any role for
  // an admin caller (see auth.service.js), unlike the public self-register flow which is locked
  // to 'employee'. This is the only way a privileged (hr_manager and up) account gets created.
  const addAccountMut = useMutation({
    mutationFn: () => registerUserAsAdmin(newAccount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowAddForm(false);
      setNewAccount({ email: '', password: '', role: 'hr_manager' });
      setAddError(null);
    },
    onError: (err: unknown) =>
      setAddError((err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to create account'),
  });

  return (
    <div className="space-y-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">User Management</h1>
          <p className="text-sm text-text-muted">Link login accounts to employee records and assign roles.</p>
        </div>
        <Button onClick={() => setShowAddForm((v) => !v)}>
          <Plus className="h-16 w-16" /> Add Account
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader><CardTitle>Create Account</CardTitle></CardHeader>
          <CardContent>
            <form
              className="grid grid-cols-3 gap-16"
              onSubmit={(e) => { e.preventDefault(); addAccountMut.mutate(); }}
            >
              <div className="space-y-4">
                <Label>Email</Label>
                <Input type="email" required value={newAccount.email} onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })} placeholder="name@company.com" />
              </div>
              <div className="space-y-4">
                <Label>Password</Label>
                <Input type="password" required minLength={8} value={newAccount.password} onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })} placeholder="At least 8 characters" />
              </div>
              <div className="space-y-4">
                <Label>Role</Label>
                <Select value={newAccount.role} onChange={(e) => setNewAccount({ ...newAccount, role: e.target.value })}>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                  ))}
                </Select>
              </div>
              {addError && <div className="col-span-3 rounded-md bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] px-12 py-8 text-sm text-danger">{addError}</div>}
              <div className="col-span-3 flex justify-end gap-8">
                <Button type="button" variant="secondary" onClick={() => setShowAddForm(false)}>Cancel</Button>
                <Button type="submit" disabled={addAccountMut.isPending}>{addAccountMut.isPending ? 'Creating…' : 'Create Account'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>Accounts ({users?.length ?? 0})</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={6} cols={4} />
          ) : !users || users.length === 0 ? (
            <EmptyState icon={UsersIcon} title="No user accounts yet" description="Employees can self-register from the login screen, or add one directly above." />
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase text-text-muted">
                  <th className="py-8 pr-16">Email</th>
                  <th className="py-8 pr-16">Role</th>
                  <th className="py-8 pr-16">Linked Employee</th>
                  <th className="py-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => {
                  const edit = edits[u.id] || {};
                  const currentRole = edit.role ?? u.role;
                  const currentEmployeeId = edit.employee_id ?? (u.employee_id || '');
                  const dirty = edit.role !== undefined || edit.employee_id !== undefined;
                  return (
                    <tr key={u.id}>
                      <td className="py-12 pr-16">
                        <div className="font-medium text-text">{u.email}</div>
                        {u.employee_first_name && (
                          <div className="text-xs text-text-muted">
                            currently: {u.employee_first_name} {u.employee_last_name}
                          </div>
                        )}
                      </td>
                      <td className="py-12 pr-16">
                        <Select
                          value={currentRole}
                          onChange={(e) => setEdits((prev) => ({ ...prev, [u.id]: { ...prev[u.id], role: e.target.value } }))}
                          className="w-[180px]"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>
                          ))}
                        </Select>
                      </td>
                      <td className="py-12 pr-16">
                        <Select
                          value={currentEmployeeId}
                          onChange={(e) => setEdits((prev) => ({ ...prev, [u.id]: { ...prev[u.id], employee_id: e.target.value } }))}
                          className="w-[220px]"
                        >
                          <option value="">— Not linked —</option>
                          {(employees ?? []).map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_code})</option>
                          ))}
                        </Select>
                      </td>
                      <td className="py-12">
                        {dirty ? (
                          <Button
                            size="sm"
                            disabled={mutation.isPending}
                            onClick={() =>
                              mutation.mutate({
                                id: u.id,
                                payload: {
                                  ...(edit.role !== undefined ? { role: edit.role } : {}),
                                  ...(edit.employee_id !== undefined ? { employee_id: edit.employee_id || null } : {}),
                                },
                              })
                            }
                          >
                            Save
                          </Button>
                        ) : (
                          <Badge
                            role="button"
                            tone={u.is_active ? 'success' : 'neutral'}
                            className="cursor-pointer"
                            title={u.is_active ? 'Click to deactivate this account' : 'Click to reactivate this account'}
                            onClick={() => toggleActiveMut.mutate({ id: u.id, is_active: !u.is_active })}
                          >
                            {u.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
