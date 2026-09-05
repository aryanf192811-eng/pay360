import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Pencil, LayoutGrid, List as ListIcon, Search } from 'lucide-react';
import { listEmployees } from '../api/employees.api';
import { listDepartments } from '../api/reference.api';
import { Select, Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, Thead, Tbody, Tr, Th, Td } from '../components/ui/table';
import { EmptyState } from '../components/EmptyState';
import { Avatar } from '../components/Avatar';
import { cn } from '../lib/utils';

// PS §A1/§B1: "Support Kanban, List, and Form views for employee records" / "Employees can be
// accessed via Kanban or List views" — both leading to the same Employee Form. Kanban is the
// default view per the PS's own ordering ("Kanban, List, and Form").
export function EmployeeList() {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [departmentId, setDepartmentId] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: listDepartments });
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', departmentId],
    queryFn: () => listEmployees(departmentId ? { department_id: departmentId } : undefined),
  });

  const filtered = useMemo(() => {
    if (!employees) return employees;
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      `${e.first_name} ${e.last_name} ${e.employee_code} ${e.job_position ?? ''}`.toLowerCase().includes(q)
    );
  }, [employees, search]);

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto flex flex-col gap-16">
      <Card>
        <CardContent className="flex flex-col gap-16 pt-16 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">Employees</h1>
            <p className="text-sm text-text-muted">Manage your organization's directory and personnel files.</p>
          </div>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-56">
              <Search className="pointer-events-none absolute left-8 top-1/2 h-14 w-14 -translate-y-1/2 text-text-muted" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, code, role…" className="pl-28" />
            </div>
            <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full sm:w-48">
              <option value="">All Departments</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
            <div className="flex shrink-0 rounded-md border border-border p-2">
              <button
                onClick={() => setView('kanban')}
                title="Kanban view"
                className={cn('rounded p-6 transition-colors', view === 'kanban' ? 'bg-primary text-white' : 'text-text-muted hover:bg-bg')}
              >
                <LayoutGrid className="h-16 w-16" />
              </button>
              <button
                onClick={() => setView('list')}
                title="List view"
                className={cn('rounded p-6 transition-colors', view === 'list' ? 'bg-primary text-white' : 'text-text-muted hover:bg-bg')}
              >
                <ListIcon className="h-16 w-16" />
              </button>
            </div>
            <button
              onClick={() => navigate('/employees/new')}
              className="flex h-10 shrink-0 items-center justify-center gap-4 rounded-md bg-primary px-16 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              <Plus className="h-16 w-16" /> Add Employee
            </button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <Card><CardContent className="py-32 text-center text-sm text-text-muted pt-32">Loading employees…</CardContent></Card>
      ) : !filtered || filtered.length === 0 ? (
        <EmptyState icon={Search} title="No employees found" description="Try a different search term or department filter." />
      ) : view === 'kanban' ? (
        <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((e, i) => (
            <motion.button
              key={e.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04 }}
              whileHover={{ y: -3 }}
              onClick={() => navigate(`/employees/${e.id}`)}
              className="rounded-lg border border-border bg-surface p-16 text-left shadow-tinted transition-shadow hover:shadow-tinted-lg"
            >
              <div className="flex items-center justify-between">
                <Avatar seed={e.id} initials={`${e.first_name.charAt(0)}${e.last_name.charAt(0)}`} />
                <Badge tone={e.status === 'active' ? 'success' : 'neutral'}>{e.status === 'active' ? 'Active' : 'Inactive'}</Badge>
              </div>
              <div className="mt-12 text-sm font-semibold text-text">{e.first_name} {e.last_name}</div>
              <div className="font-mono text-xs text-text-muted">{e.employee_code}</div>
              <div className="mt-8 text-xs text-text-muted">{e.job_position || 'No position'} · {e.department_name || 'No department'}</div>
              <div className="mt-12 flex gap-16 border-t border-border pt-8 text-xs text-text-muted">
                <span>{e.contract_count ?? 0} contracts</span>
                <span>{e.pending_time_off_count ?? 0} pending leave</span>
              </div>
            </motion.button>
          ))}
        </div>
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Employee Name</Th>
              <Th>Job Position</Th>
              <Th>Department</Th>
              <Th>Type</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </Thead>
          <Tbody>
            {filtered.map((e) => (
              <Tr key={e.id} className="group cursor-pointer" onClick={() => navigate(`/employees/${e.id}`)}>
                <Td>
                  <div className="flex items-center gap-8">
                    <Avatar seed={e.id} size="sm" initials={`${e.first_name.charAt(0)}${e.last_name.charAt(0)}`} />
                    <span className="font-medium text-text">{e.first_name} {e.last_name}</span>
                  </div>
                </Td>
                <Td className="text-text-muted">{e.job_position || '—'}</Td>
                <Td className="text-text-muted">{e.department_name || '—'}</Td>
                <Td className="capitalize text-text-muted">{e.employee_type.replace('_', ' ')}</Td>
                <Td><Badge tone={e.status === 'active' ? 'success' : 'neutral'}>{e.status === 'active' ? 'Active' : 'Inactive'}</Badge></Td>
                <Td className="text-right">
                  <button
                    onClick={(ev) => { ev.stopPropagation(); navigate(`/employees/${e.id}/edit`); }}
                    className="rounded p-4 text-text-muted opacity-0 transition-colors hover:text-primary group-hover:opacity-100 focus:opacity-100"
                  >
                    <Pencil className="h-16 w-16" />
                  </button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </div>
  );
}
