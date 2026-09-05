import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listUsers, updateUser } from '../api/users.api';
import { listEmployees } from '../api/employees.api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { TableSkeleton } from '../components/ui/skeleton';
import { EmptyState } from '../components/EmptyState';
import { Users as UsersIcon } from 'lucide-react';

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

  if (isLoading) return <TableSkeleton rows={6} cols={4} />;
  if (!users || users.length === 0) {
    return <EmptyState icon={UsersIcon} title="No user accounts yet" description="User accounts are created via registration." />;
  }

  return (
    <div className="space-y-24">
      <div>
        <h1 className="text-2xl font-bold text-text">User Management</h1>
        <p className="text-sm text-text-muted">Link login accounts to employee records and assign roles.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Accounts ({users.length})</CardTitle></CardHeader>
        <CardContent>
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
                          <Badge tone={u.is_active ? 'success' : 'neutral'}>{u.is_active ? 'Active' : 'Inactive'}</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
