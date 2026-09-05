"use client";

import React, { useState } from "react";
import {
  FileText,
  Search,
  CheckCircle2,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { formatINR } from "@/lib/utils";

export function ContractsHub() {
  const { contracts, employees, setSelectedEmployee } = useStore();
  const [contractFilter, setContractFilter] = useState<string>("All");
  const [contractSearch, setContractSearch] = useState<string>("");

  const filteredContracts = contracts.filter((c) => {
    const matchesFilter =
      contractFilter === "All" ||
      (contractFilter === "Active" && c.status === "Active") ||
      c.department === contractFilter;

    const matchesSearch =
      c.employeeName.toLowerCase().includes(contractSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(contractSearch.toLowerCase()) ||
      c.title.toLowerCase().includes(contractSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-5 pb-10">
      {/* Contracts Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[#0F172A]">
                Contracts Management Hub
              </h1>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#714B67]/10 text-[#714B67]">
                {contracts.length} Total Contracts
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Maintain historical and active employment terms governing payroll period computation
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative min-w-[260px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search contract, employee, ID..."
                value={contractSearch}
                onChange={(e) => setContractSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto">
          {["All", "Active", "Engineering", "Product", "Human Resources", "Sales"].map((tab) => (
            <button
              key={tab}
              onClick={() => setContractFilter(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                contractFilter === tab
                  ? "bg-[#714B67] text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Contracts Table */}
      <div className="px-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold text-xs">
                <tr>
                  <th className="py-3.5 px-5">Contract Reference</th>
                  <th className="py-3.5 px-5">Employee</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5 text-right">Monthly Wage (CTC)</th>
                  <th className="py-3.5 px-5">Salary Structure</th>
                  <th className="py-3.5 px-5">Start Date</th>
                  <th className="py-3.5 px-5">Working Schedule</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContracts.map((c) => {
                  const emp = employees.find((e) => e.id === c.employeeId);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => {
                        if (emp) setSelectedEmployee(emp);
                      }}
                      className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    >
                      {/* Contract ID */}
                      <td className="py-3.5 px-5 font-mono font-bold text-[#714B67]">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#714B67]" />
                          <span>{c.id}</span>
                        </div>
                      </td>

                      {/* Employee Name */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {emp && (
                            <img
                              src={emp.avatar}
                              alt={c.employeeName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                          )}
                          <div>
                            <div className="font-bold text-base text-[#0F172A] group-hover:text-[#714B67]">
                              {c.employeeName}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">{c.employeeId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-5 font-medium text-slate-800">{c.department}</td>

                      {/* Wage */}
                      <td className="py-3.5 px-5 text-right font-black text-base text-slate-900">
                        {formatINR(c.wage)}
                        <span className="text-xs font-normal text-slate-400 ml-1">/mo</span>
                      </td>

                      {/* Salary Structure */}
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold">
                          {c.structure}
                        </span>
                      </td>

                      {/* Start Date */}
                      <td className="py-3.5 px-5 text-slate-700 text-xs font-mono">{c.startDate}</td>

                      {/* Working Schedule */}
                      <td className="py-3.5 px-5 text-slate-600 text-xs">
                        <span className="truncate block max-w-[160px]" title={c.workingSchedule}>
                          {c.workingSchedule}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>Active Period</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (emp) setSelectedEmployee(emp);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#714B67] hover:text-white text-slate-800 text-xs font-bold transition-colors"
                        >
                          View Form
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
