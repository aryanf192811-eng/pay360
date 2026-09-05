"use client";

import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Search,
  Filter,
  Users,
  AlertCircle,
  FileCheck,
  Check,
  X,
  Layers,
  Settings,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { LeaveAllocation } from "@/lib/mock-data";

export function TimeOffHub() {
  const {
    timeOff,
    employees,
    allocations,
    timeOffTypes,
    approveTimeOff,
    refuseTimeOff,
    addAllocation,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"requests" | "allocations" | "types">("requests");
  const [requestSubTab, setRequestSubTab] = useState<"pending" | "all">("pending");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isNewAllocationOpen, setIsNewAllocationOpen] = useState(false);

  // New Allocation Form State
  const [allocEmpId, setAllocEmpId] = useState(employees[0]?.id || "EMP-101");
  const [allocType, setAllocType] = useState("Paid Time Off (Annual)");
  const [allocDays, setAllocDays] = useState(18);
  const [allocFrom, setAllocFrom] = useState("2026-01-01");
  const [allocTo, setAllocTo] = useState("2026-12-31");

  const handleApprove = (id: string, name: string) => {
    approveTimeOff(id);
    setFeedback(`Leave request for ${name} has been APPROVED. Assigned allocation consumed.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleRefuse = (id: string, name: string) => {
    refuseTimeOff(id);
    setFeedback(`Leave request for ${name} has been REFUSED.`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSaveAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === allocEmpId);
    if (!emp) return;

    const newAlloc: LeaveAllocation = {
      id: `ALC-${Date.now()}`,
      employeeId: allocEmpId,
      employeeName: emp.name,
      leaveType: allocType,
      allocatedDays: allocDays,
      takenDays: 0,
      remainingDays: allocDays,
      validFrom: allocFrom,
      validTo: allocTo,
      status: "Approved",
    };

    addAllocation(newAlloc);
    setIsNewAllocationOpen(false);
    setFeedback(`Leave allocation of ${allocDays} days granted to ${emp.name}!`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const pendingRequests = timeOff.filter((t) => t.status === "Pending");
  const displayList = requestSubTab === "pending" ? pendingRequests : timeOff;

  return (
    <div className="space-y-6 pb-12">
      {/* Time Off Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                Time Off &amp; Leave Operations (A4)
              </h1>
              {pendingRequests.length > 0 && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  {pendingRequests.length} Pending Approval
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Review leave requests, manage employee allocations, and configure organizational time off types and deduction rules.
            </p>
          </div>

          {/* Sub-Tab Navigation Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab("requests")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "requests"
                    ? "bg-[#714B67] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Requests ({pendingRequests.length})
              </button>
              <button
                onClick={() => setActiveTab("allocations")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "allocations"
                    ? "bg-[#714B67] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Allocations ({allocations.length})
              </button>
              <button
                onClick={() => setActiveTab("types")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "types"
                    ? "bg-[#714B67] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Time Off Types ({timeOffTypes.length})
              </button>
            </div>

            {activeTab === "allocations" && (
              <button
                onClick={() => setIsNewAllocationOpen(true)}
                className="inline-flex items-center gap-2 bg-[#00A09D] hover:bg-[#008A87] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Grant Allocation</span>
              </button>
            )}
          </div>
        </div>

        {feedback && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}
      </div>

      {/* VIEW 1: LEAVE REQUESTS */}
      {activeTab === "requests" && (
        <div className="px-6 space-y-6">
          {/* Leave Allocation KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Paid Time Off (Annual)
                </span>
                <div className="p-2 rounded-lg bg-purple-50 text-[#714B67]">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">18 Days</div>
              <div className="text-xs text-slate-500 mt-1">Annual standard allotment</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Sick Leave
                </span>
                <div className="p-2 rounded-lg bg-teal-50 text-[#00A09D]">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">10 Days</div>
              <div className="text-xs text-slate-500 mt-1">Medical coverage</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Casual Leave
                </span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">6 Days</div>
              <div className="text-xs text-slate-500 mt-1">Short notice personal leaves</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Loss of Pay (LOP)
                </span>
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-600 mt-2">1 Day Pending</div>
              <div className="text-xs text-slate-500 mt-1">Deducted in September payrun</div>
            </div>
          </div>

          {/* Requests Table with ONE-CLICK APPROVE & REFUSE Buttons */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRequestSubTab("pending")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    requestSubTab === "pending"
                      ? "bg-[#714B67] text-white"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  Pending Requests ({pendingRequests.length})
                </button>
                <button
                  onClick={() => setRequestSubTab("all")}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    requestSubTab === "all"
                      ? "bg-[#714B67] text-white"
                      : "bg-white text-slate-700 border border-slate-200"
                  }`}
                >
                  All History ({timeOff.length})
                </button>
              </div>

              <span className="text-xs text-slate-500 font-semibold">
                {displayList.length} entries shown
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-5">Employee</th>
                    <th className="py-3.5 px-5">Leave Type</th>
                    <th className="py-3.5 px-5">Duration &amp; Dates</th>
                    <th className="py-3.5 px-5 text-center">Days</th>
                    <th className="py-3.5 px-5">Reason</th>
                    <th className="py-3.5 px-5">Current Status</th>
                    <th className="py-3.5 px-5 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                        No pending leave requests at this time!
                      </td>
                    </tr>
                  ) : (
                    displayList.map((req) => {
                      const emp = employees.find((e) => e.id === req.employeeId);
                      const empName = emp ? emp.name : req.employeeId;

                      return (
                        <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              {emp && (
                                <img
                                  src={emp.avatar}
                                  alt={empName}
                                  className="w-9 h-9 rounded-full object-cover border"
                                />
                              )}
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{empName}</div>
                                <div className="text-xs text-slate-500 font-mono">{req.employeeId}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-5 font-semibold text-slate-800">
                            {req.leaveType}
                          </td>

                          <td className="py-3.5 px-5 text-slate-700 text-xs font-mono">
                            {req.startDate} to {req.endDate}
                          </td>

                          <td className="py-3.5 px-5 text-center font-black text-slate-900">
                            {req.days} {req.days === 1 ? "day" : "days"}
                          </td>

                          <td className="py-3.5 px-5 text-slate-600 text-xs italic">
                            &ldquo;{req.reason}&rdquo;
                          </td>

                          <td className="py-3.5 px-5">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                                req.status === "Approved"
                                  ? "bg-teal-50 text-teal-800 border border-teal-200"
                                  : req.status === "Refused"
                                  ? "bg-rose-50 text-rose-800 border border-rose-200"
                                  : "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                              }`}
                            >
                              {req.status}
                            </span>
                          </td>

                          {/* One-Click Action Buttons */}
                          <td className="py-3.5 px-5 text-right">
                            {req.status === "Pending" ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApprove(req.id, empName)}
                                  className="inline-flex items-center gap-1 bg-[#00A09D] hover:bg-[#008A87] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleRefuse(req.id, empName)}
                                  className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Refuse</span>
                                </button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-semibold">
                                Completed
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LEAVE ALLOCATIONS TABLE (A4 Feature) */}
      {activeTab === "allocations" && (
        <div className="px-6 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Employee Leave Allocations &amp; Balances (A4)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tracks total allocated days, consumed balance, remaining availability, and annual validity window.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#714B67]/10 text-[#714B67]">
                {allocations.length} Active Allocations
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-5">Employee</th>
                    <th className="py-3.5 px-5">Leave Type</th>
                    <th className="py-3.5 px-5 text-center">Allocated</th>
                    <th className="py-3.5 px-5 text-center">Taken</th>
                    <th className="py-3.5 px-5 text-center">Remaining Balance</th>
                    <th className="py-3.5 px-5">Validity Period</th>
                    <th className="py-3.5 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allocations.map((alc) => (
                    <tr key={alc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 text-sm">{alc.employeeName}</div>
                        <div className="text-xs text-slate-500 font-mono">{alc.employeeId}</div>
                      </td>
                      <td className="py-3.5 px-5 font-semibold text-slate-800">{alc.leaveType}</td>
                      <td className="py-3.5 px-5 text-center font-bold text-slate-700">{alc.allocatedDays}d</td>
                      <td className="py-3.5 px-5 text-center font-bold text-amber-600">{alc.takenDays}d</td>
                      <td className="py-3.5 px-5 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-teal-50 text-teal-800 border border-teal-200">
                          {alc.remainingDays} days left
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 text-xs font-mono">
                        {alc.validFrom} to {alc.validTo}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{alc.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TIME OFF TYPES CONFIGURATION (A4 Feature) */}
      {activeTab === "types" && (
        <div className="px-6 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Configured Time Off Types &amp; Policies (A4)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Defines leave units, allocation requirements, approval workflows, and automated payroll deduction links.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#00A09D]/10 text-[#00A09D]">
                {timeOffTypes.length} Policies Configured
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-5">Policy Name</th>
                    <th className="py-3.5 px-5">Code</th>
                    <th className="py-3.5 px-5">Unit</th>
                    <th className="py-3.5 px-5">Allocation Required?</th>
                    <th className="py-3.5 px-5">Approval Workflow</th>
                    <th className="py-3.5 px-5">Payroll Integration Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {timeOffTypes.map((tot) => (
                    <tr key={tot.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold border ${tot.color}`}>
                          {tot.name}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-slate-800 text-xs">{tot.code}</td>
                      <td className="py-4 px-5 font-semibold text-slate-700 text-sm">{tot.unit}</td>
                      <td className="py-4 px-5">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${tot.allocationRequired ? "bg-purple-100 text-[#714B67]" : "bg-slate-100 text-slate-600"}`}>
                          {tot.allocationRequired ? "Yes (Mandatory)" : "No (Unlimited)"}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-xs font-semibold text-slate-700">
                        {tot.requiresApproval ? "Manager Approval Required" : "Automatic Approval"}
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-black ${tot.payrollImpact === "Paid" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
                          {tot.payrollImpact}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Allocation Modal */}
      {isNewAllocationOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto select-none bg-slate-900/50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#714B67] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Grant Leave Allocation (A4)</h3>
              <button
                onClick={() => setIsNewAllocationOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAllocation} className="p-6 space-y-4 text-sm text-slate-800">
              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">
                  Employee
                </label>
                <select
                  value={allocEmpId}
                  onChange={(e) => setAllocEmpId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-900"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">
                  Leave Type
                </label>
                <select
                  value={allocType}
                  onChange={(e) => setAllocType(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-900"
                >
                  <option value="Paid Time Off (Annual)">Paid Time Off (Annual)</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">
                  Number of Days
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={allocDays}
                  onChange={(e) => setAllocDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">Valid From</label>
                  <input
                    type="date"
                    value={allocFrom}
                    onChange={(e) => setAllocFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">Valid To</label>
                  <input
                    type="date"
                    value={allocTo}
                    onChange={(e) => setAllocTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewAllocationOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00A09D] hover:bg-[#008A87] text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
