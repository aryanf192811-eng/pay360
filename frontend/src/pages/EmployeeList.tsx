import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Pencil } from 'lucide-react';
import { listEmployees } from '../api/employees.api';
import { listDepartments } from '../api/reference.api';
import { Select } from '../components/ui/input';

export function EmployeeList() {

  const [departmentId, setDepartmentId] = useState('');
  const navigate = useNavigate();

  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: listDepartments });
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', departmentId],
    queryFn: () => listEmployees(departmentId ? { department_id: departmentId } : undefined),
  });

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col space-y-6">
      {/* Header Card */}
      <section className="bg-[#fefefe] border border-[#dfe1e6] rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1c0d]">Employees</h1>
          <p className="text-[13px] text-[#434654] mt-1">Manage your organization's directory and personnel files.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
          <div className="relative w-full sm:w-48">
            <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full pl-3 pr-8 py-2 bg-[#fefefe] border border-[#dfe1e6] rounded focus:border-[#3062e1] focus:ring-2 focus:ring-[#bfd2fd]/50 transition-shadow text-[13px] text-[#1d1c0d] h-[36px]">
              <option value="">All Departments</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
          </div>
          <button onClick={() => navigate('/employees/new')} className="w-full sm:w-auto bg-[#3062e1] text-[#ffffff] hover:bg-[#0048c6] transition-colors rounded px-4 py-2 font-semibold text-[12px] flex items-center justify-center gap-1 active:ring-2 active:ring-[#3062e1]/50 h-[36px]">
            <Plus className="w-[18px] h-[18px] mr-1" />
            Add Employee
          </button>
        </div>
      </section>

      {/* Data Table Container */}
      <section className="bg-[#fefefe] border border-[#dfe1e6] rounded-lg overflow-hidden shadow-sm flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#ede9cf] border-b border-[#ebecf0]">
                <th className="py-2 px-3 font-semibold text-[12px] text-[#1d1c0d]">Employee Name</th>
                <th className="py-2 px-3 font-semibold text-[12px] text-[#1d1c0d]">Job Position</th>
                <th className="py-2 px-3 font-semibold text-[12px] text-[#1d1c0d]">Department</th>
                <th className="py-2 px-3 font-semibold text-[12px] text-[#1d1c0d]">Schedule</th>
                <th className="py-2 px-3 font-semibold text-[12px] text-[#1d1c0d] text-center">Status</th>
                <th className="py-2 px-3 font-semibold text-[12px] text-[#1d1c0d] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-[#1d1c0d]">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#434654]">Loading employees...</td>
                </tr>
              ) : !employees || employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#434654]">No employees found.</td>
                </tr>
              ) : (
                employees.map((e, idx) => (
                  <tr key={e.id} className={`border-b border-[#ebecf0] hover:bg-[#f8f4da] transition-colors group cursor-pointer ${idx % 2 === 0 ? '' : 'bg-[#ffffff]'}`} onClick={() => navigate(`/employees/${e.id}`)}>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-[#bfd2fd] text-[#475a7e] flex items-center justify-center font-semibold text-[12px] shrink-0 border border-[#dfe1e6]">
                           {e.first_name.charAt(0)}{e.last_name.charAt(0)}
                        </div>
                        <span className="font-medium text-[#1d1c0d]">{e.first_name} {e.last_name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-[#434654]">{e.job_position || '—'}</td>
                    <td className="py-2 px-3 text-[#434654]">{e.department_name || '—'}</td>
                    <td className="py-2 px-3 text-[#434654] capitalize">{e.employee_type.replace('_', ' ')}</td>
                    <td className="py-2 px-3 text-center">
                       {e.status === 'active' ? (
                         <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#e6f0ff] text-[#3062e1] font-semibold text-[12px] border border-[#3062e1]/20">Active</span>
                       ) : (
                         <span className="inline-flex items-center px-2 py-0.5 rounded bg-[#ede9cf] text-[#434654] font-semibold text-[12px] border border-[#dfe1e6]">Inactive</span>
                       )}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={(ev) => { ev.stopPropagation(); navigate(`/employees/${e.id}/edit`); }}
                        className="text-[#434654] hover:text-[#0048c6] transition-colors p-1 rounded opacity-0 group-hover:opacity-100 focus:opacity-100"
                      >
                        <Pencil className="h-[18px] w-[18px]" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && employees && employees.length > 0 && (
          <div className="bg-[#ffffff] border-t border-[#dfe1e6] p-3 flex justify-between items-center text-[#434654] text-[13px]">
            <span>Showing {employees.length} entries</span>
          </div>
        )}
      </section>
    </div>
  );
}
