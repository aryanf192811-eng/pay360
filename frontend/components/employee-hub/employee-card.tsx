"use client";

import React from "react";
import { Employee } from "@/lib/mock-data";
import { useStore } from "@/lib/store-context";

export function EmployeeCard({ employee }: { employee: Employee }) {
  const { setSelectedEmployee } = useStore();

  return (
    <div
      onClick={() => setSelectedEmployee(employee)}
      className="group bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-[#714B67] transition-all cursor-pointer flex items-start gap-4"
    >
      <div className="w-12 h-12 rounded-full border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-sm font-bold text-[#714B67] shrink-0 overflow-hidden">
        {employee.avatar ? (
          <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
        ) : (
          employee.name.split(' ').map(n => n[0]).join('')
        )}
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-900 group-hover:text-[#714B67] transition-colors">
          {employee.name}
        </h3>
        <p className="text-sm font-medium text-slate-500 mb-2">{employee.role}</p>
        
        <div className="flex flex-col gap-1 mt-3">
          <span className="text-xs font-bold text-slate-600">{employee.department}</span>
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${employee.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="text-xs font-bold text-emerald-600">{employee.status}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
