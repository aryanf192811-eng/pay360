"use client";

import React from "react";
import { Employee } from "@/lib/mock-data";
import { useStore } from "@/lib/store-context";

export function EmployeeList({ employees }: { employees: Employee[] }) {
  const { setSelectedEmployee } = useStore();

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
            <tr>
              <th className="py-4 px-6">Employee</th>
              <th className="py-4 px-6">Work Email</th>
              <th className="py-4 px-6">Job Position</th>
              <th className="py-4 px-6">Department</th>
              <th className="py-4 px-6">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => (
              <tr
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="py-4 px-6 font-bold text-slate-900">{emp.name}</td>
                <td className="py-4 px-6 font-medium text-slate-600">{emp.email}</td>
                <td className="py-4 px-6 font-medium text-slate-700">{emp.role}</td>
                <td className="py-4 px-6 font-medium text-slate-700">{emp.department}</td>
                <td className="py-4 px-6">
                  <span className={`font-bold ${emp.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs font-medium text-slate-500 italic">
        Useful note: the list view is the main entry point for finding a specific employee record quickly.
      </div>
    </div>
  );
}
