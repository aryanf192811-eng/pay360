import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, LayoutGrid, List as ListIcon, Plus } from 'lucide-react';
import { listEmployees } from '../api/employees.api';
import { listDepartments } from '../api/reference.api';
import { StatusBadge } from '../components/StatusBadge';
import { EmptyState } from '../components/EmptyState';
import { TableSkeleton } from '../components/ui/skeleton';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/table';
import { Select } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';

export function EmployeeList() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [departmentId, setDepartmentId] = useState('');
  const navigate = useNavigate();

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: listDepartments });
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', departmentId],
    queryFn: () => listEmployees(departmentId ? { department_id: departmentId } : undefined),
  });

  return (
    <div className="space-y-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Employees</h1>
          <p className="text-sm text-text-muted">The central hub for contracts, attendance, and time off.</p>
        </div>
        <div className="flex items-center gap-8">
          <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-[200px]">
            <option value="">All Departments</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.headcount})
              </option>
            ))}
          </Select>
          <div className="flex rounded-md border border-border p-2">
            <button
              onClick={() => setView('kanban')}
              className={cn('rounded p-6', view === 'kanban' ? 'bg-primary text-white' : 'text-text-muted')}
            >
              <LayoutGrid className="h-16 w-16" />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn('rounded p-6', view === 'list' ? 'bg-primary text-white' : 'text-text-muted')}
            >
              <ListIcon className="h-16 w-16" />
            </button>
          </div>
          <Button onClick={() => navigate('/employees/new')}>
            <Plus className="h-16 w-16" /> New Employee
          </Button>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : !employees || employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees yet"
          description="Employees you add will appear here, acting as the hub for their contracts, attendance, and time off."
          actionLabel="New Employee"
          onAction={() => navigate('/employees/new')}
        />
      ) : view === 'kanban' ? (
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {employees.map((e) => (
            <button
              key={e.id}
              onClick={() => navigate(`/employees/${e.id}`)}
              className="rounded-lg border border-border bg-surface p-16 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-40 w-40 items-center justify-center rounded-full bg-primary font-mono text-sm font-semibold text-white">
                  {e.first_name[0]}
                  {e.last_name[0]}
                </div>
                <StatusBadge status={e.status} domain="employee" />
              </div>
              <div className="mt-12 text-sm font-semibold text-text">
                {e.first_name} {e.last_name}
              </div>
              <div className="font-mono text-xs text-text-muted">{e.employee_code}</div>
              <div className="mt-8 text-xs text-text-muted">{e.department_name || 'No department'}</div>
              <div className="mt-12 flex gap-16 border-t border-border pt-8 text-xs text-text-muted">
                <span>{e.contract_count ?? 0} contracts</span>
                <span>{e.pending_time_off_count ?? 0} pending leave</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Employee</Th>
              <Th>Code</Th>
              <Th>Department</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th></Th>
            </tr>
          </Thead>
          <Tbody>
            {employees.map((e) => (
              <Tr key={e.id} className="cursor-pointer" onClick={() => navigate(`/employees/${e.id}`)}>
                <Td className="font-medium">
                  {e.first_name} {e.last_name}
                </Td>
                <Td className="font-mono text-xs">{e.employee_code}</Td>
                <Td>{e.department_name || '—'}</Td>
                <Td className="capitalize">{e.employee_type.replace('_', ' ')}</Td>
                <Td>
                  <StatusBadge status={e.status} domain="employee" />
                </Td>
                <Td>
                  <Button size="sm" variant="ghost">
                    View →
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
