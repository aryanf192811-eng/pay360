"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import { Search } from "lucide-react";
import { Contract } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";

export function ContractsHub() {
  const { contracts } = useStore();
  const [selectedContract, setSelectedContract] = useState<Contract | "NEW" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContracts = contracts.filter((c) =>
    c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedContract) {
    const isNew = selectedContract === "NEW";
    const req = isNew ? null : selectedContract;

    return (
      <div className="flex-1 p-6 md:p-8 bg-white h-full flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Contract / {req ? req.id : "New"}
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Form view of one contract
          </p>
        </div>

        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
          <button 
            onClick={() => setSelectedContract(null)}
            className="px-6 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm transition-colors"
          >
            Back to List
          </button>
        </div>

        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="flex items-center">
              <label className="w-1/3 text-sm font-bold text-slate-600">Employee</label>
              <div className="w-2/3">
                <input type="text" readOnly value={req ? req.employeeName : ""} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-sm font-bold text-slate-600">Start Date</label>
              <div className="w-2/3">
                <input type="text" readOnly value={req ? req.startDate : ""} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-sm font-bold text-slate-600">End Date</label>
              <div className="w-2/3">
                <input type="text" readOnly value={req ? (req.endDate || "-") : ""} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-sm font-bold text-slate-600">Status</label>
              <div className="w-2/3">
                <input type="text" readOnly value={req ? (req.status === "Active" ? "Running" : "Expired") : "Running"} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="flex items-center">
              <label className="w-1/3 text-sm font-bold text-slate-600">Department</label>
              <div className="w-2/3">
                <input type="text" readOnly value={req ? req.department : ""} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-sm font-bold text-slate-600">Job Position</label>
              <div className="w-2/3">
                <input type="text" readOnly value={req ? req.title : ""} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-sm font-bold text-slate-600">Wage</label>
              <div className="w-2/3">
                <input type="text" readOnly value={req ? formatINR(req.wage) : ""} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
            </div>
            <div className="flex items-center">
              <label className="w-1/3 text-sm font-bold text-slate-600">Working Schedule</label>
              <div className="w-2/3">
                <input type="text" readOnly value={req ? req.workingSchedule : ""} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
            </div>
          </div>

          {/* Full Width Salary Structure / Notes */}
          <div className="md:col-span-2 mt-4 bg-slate-50 border border-slate-200 rounded-xl p-6 relative">
            <label className="block text-sm font-bold text-slate-700 mb-3">Salary Structure / Notes</label>
            <p className="text-slate-800 font-medium whitespace-pre-wrap min-h-[80px]">
              {req ? ((req as any).salaryStructure || "Structure Type: Employee Salary\nThis running contract is the source for payroll calculation in the active period.") : ""}
            </p>
            <p className="text-xs text-slate-500 absolute bottom-4 left-6 italic">
              Useful note: for the problem statement, one employee should not have multiple Running contracts for the same period.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="flex-1 p-6 md:p-8 bg-white h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Contracts</h1>
        <p className="text-sm font-medium text-slate-500">
          List view of employee contracts
        </p>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <button 
          onClick={() => setSelectedContract("NEW")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition-colors uppercase text-sm tracking-wider"
        >
          New
        </button>
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search contracts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600">Contract</th>
              <th className="px-6 py-4 font-bold text-slate-600">Employee</th>
              <th className="px-6 py-4 font-bold text-slate-600">Start</th>
              <th className="px-6 py-4 font-bold text-slate-600">End</th>
              <th className="px-6 py-4 font-bold text-slate-600">Wage / Month</th>
              <th className="px-6 py-4 font-bold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filteredContracts.map((c) => (
              <tr 
                key={c.id} 
                onClick={() => setSelectedContract(c)}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 font-medium text-slate-900">{c.id}</td>
                <td className="px-6 py-4 font-bold text-slate-900">{c.employeeName}</td>
                <td className="px-6 py-4 font-medium text-slate-700">{c.startDate}</td>
                <td className="px-6 py-4 font-medium text-slate-700">{c.endDate || "-"}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{formatINR(c.wage)}</td>
                <td className="px-6 py-4">
                  <span className={`font-bold ${c.status === "Active" ? "text-emerald-600" : "text-rose-600"}`}>
                    {c.status === "Active" ? "Running" : "Expired"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs font-medium text-slate-500 italic">
          Useful note: retain contract history, but make the active Running contract obvious because payroll depends on it.
        </div>
      </div>
    </div>
  );
}
