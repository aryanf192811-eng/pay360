"use client";

import React from "react";
import {
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  FileText,
} from "lucide-react";
import { Employee } from "@/lib/mock-data";
import { useStore } from "@/lib/store-context";
import { formatINR } from "@/lib/utils";

export function EmployeeList({ employees }: { employees: Employee[] }) {
  const { setSelectedEmployee } = useStore();

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-xs">
            <tr>
              <th className="py-3.5 px-5">Employee</th>
              <th className="py-3.5 px-5">Position &amp; Dept</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Monthly CTC</th>
              <th className="py-3.5 px-5">Bank Verification</th>
              <th className="py-3.5 px-5 text-center">Attendance</th>
              <th className="py-3.5 px-5 text-center">Leave Bal</th>
              <th className="py-3.5 px-5">Active Contract</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((emp) => {
              const isBankMissing = !emp.bankDetails.isVerified || !emp.bankDetails.accountNumber;

              return (
                <tr
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  {/* Name + Avatar */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3.5">
                      <div className="relative">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-200/80"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            emp.status === "Active" ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-base text-slate-900 group-hover:text-[#714B67] transition-colors">
                          {emp.name}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">{emp.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* Position + Dept */}
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-slate-900">{emp.role}</div>
                    <div className="text-xs text-slate-500 font-medium">{emp.department}</div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        emp.status === "Active"
                          ? "bg-teal-50/80 text-teal-800 border-teal-200"
                          : "bg-amber-50/80 text-amber-800 border-amber-200"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>

                  {/* Monthly CTC */}
                  <td className="py-3.5 px-5 text-right font-bold text-base text-slate-900">
                    {formatINR(emp.monthlyCTC)}
                  </td>

                  {/* Bank Verification */}
                  <td className="py-3.5 px-5">
                    {isBankMissing ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Action Required</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    )}
                  </td>

                  {/* Attendance */}
                  <td className="py-3.5 px-5 text-center">
                    <span className="font-bold text-sm text-[#00A09D]">
                      {emp.smartMetrics.attendancePercentage}%
                    </span>
                  </td>

                  {/* Leave Bal */}
                  <td className="py-3.5 px-5 text-center font-semibold text-slate-700">
                    {emp.smartMetrics.leaveBalance} days
                  </td>

                  {/* Active Contract */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-1.5 text-slate-700 font-mono text-xs">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>{emp.smartMetrics.activeContractId}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEmployee(emp);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#714B67] hover:text-white text-slate-700 text-xs font-bold transition-colors"
                    >
                      <span>View Form</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
