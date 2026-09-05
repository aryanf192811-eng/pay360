"use client";

import React from "react";
import { Employee } from "@/lib/mock-data";
import { useStore } from "@/lib/store-context";
import { motion } from "framer-motion";
import { MoreHorizontal, Mail, Phone, ExternalLink } from "lucide-react";

export function EmployeeList({ employees }: { employees: Employee[] }) {
  const { setSelectedEmployee } = useStore();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-sm flex flex-col h-full">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="py-4 px-6 font-bold">Employee</th>
              <th className="py-4 px-6 font-bold">Contact Info</th>
              <th className="py-4 px-6 font-bold">Role & Dept</th>
              <th className="py-4 px-6 font-bold">Manager</th>
              <th className="py-4 px-6 font-bold text-center">Status</th>
              <th className="py-4 px-6 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp, idx) => {
              const isActive = emp.status.toLowerCase() === "active";
              const avatarUrl = emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name || emp.email)}&background=714B67&color=fff&bold=true&rounded=true`;
              return (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="hover:bg-[#714B67]/5 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img src={avatarUrl} alt={emp.name} className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover bg-white" />
                        <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-[#714B67] transition-colors">{emp.name}</p>
                        <p className="text-[11px] font-medium text-slate-500">{emp.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="flex items-center gap-1.5 text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400" /> {emp.email}</span>
                      <span className="flex items-center gap-1.5 text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400" /> {emp.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-700">{emp.role}</p>
                    <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {emp.department}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-medium text-slate-700">{emp.manager}</p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" : "bg-amber-50 text-amber-700 border border-amber-200/50"
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="p-2 text-slate-400 hover:text-[#714B67] hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-50/50 border-t border-slate-100 text-[11px] font-medium text-slate-400 text-center uppercase tracking-widest">
        Showing {employees.length} Employees
      </div>
    </div>
  );
}
