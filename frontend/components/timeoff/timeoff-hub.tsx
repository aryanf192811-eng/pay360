"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Users,
  ShieldCheck,
  TrendingDown,
  Layers,
  Sparkles,
  X,
  FileCheck,
  Info,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { TimeOffRecord } from "@/lib/mock-data";

export function TimeOffHub() {
  const {
    timeOff,
    allocations,
    employees,
    approveTimeOff,
    refuseTimeOff,
  } = useStore();

  const [activeTab, setActiveTab] = useState<"requests" | "allocations">("requests");
  const [filterType, setFilterType] = useState<string>("All");
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

  // New Request Form State
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || "");
  const [leaveType, setLeaveType] = useState<"Paid Time Off" | "Sick Leave" | "Unpaid Leave">("Paid Time Off");
  const [startDate, setStartDate] = useState("2026-09-15");
  const [endDate, setEndDate] = useState("2026-09-16");
  const [days, setDays] = useState(2);
  const [reason, setReason] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Top Metrics
  const totalEntitled = 18;
  const totalTaken = 6;
  const remainingBal = totalEntitled - totalTaken; // 12
  const pendingRequests = timeOff.filter((t) => t.status === "Pending");

  const filteredRequests = timeOff.filter((req) => {
    if (filterType === "All") return true;
    if (filterType === "Pending") return req.status === "Pending";
    if (filterType === "Approved") return req.status === "Approved";
    if (filterType === "Refused") return req.status === "Refused";
    return true;
  });

  const handleApprove = (id: string, empName: string, daysCount: number) => {
    approveTimeOff(id);
    setActionNotice(`Approved ${daysCount} day(s) leave for ${empName}. Balance updated.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleRefuse = (id: string, empName: string) => {
    refuseTimeOff(id);
    setActionNotice(`Refused leave request for ${empName}.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === selectedEmpId);
    if (!emp) return;

    // Locally we trigger an approved or pending notification
    setActionNotice(`Submitted new ${leaveType} request for ${emp.name} (${days} days).`);
    setIsNewRequestOpen(false);
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>PeoplePay360</span>
            <span className="text-slate-300">/</span>
            <span className="text-[#714B67] font-bold">Time Off &amp; Leaves</span>
            <span className="text-slate-300">/</span>
            <span>Odoo Standard A4 &amp; B4</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-[#00A09D]" />
            <span>Time Off &amp; Leave Approvals</span>
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Manage annual leave allocations, approve employee time off requests, and compute automatic payroll deductions.
          </p>
        </div>

        <button
          onClick={() => setIsNewRequestOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00A09D] hover:bg-[#008A87] text-white text-sm font-bold shadow-xs hover:shadow-md transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Request Time Off</span>
        </button>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-sm font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Required Metrics Row: Entitled (18), Taken (6), Remaining (12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">Annual Entitled Days</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalEntitled} Days</div>
          <div className="text-xs font-medium text-slate-500 mt-1">Standard corporate entitlement/yr</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">Taken Days (Consumed)</div>
          <div className="text-2xl font-extrabold text-[#714B67] mt-1">{totalTaken} Days</div>
          <div className="text-xs font-medium text-slate-500 mt-1">Approved across 8 team members</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">Remaining Balance</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{remainingBal} Days</div>
          <div className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Average 66.7% balance remaining</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">Pending Approvals</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{pendingRequests.length} Requests</div>
          <div className="text-xs font-medium text-amber-700 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Immediate manager action needed</span>
          </div>
        </div>
      </div>

      {/* Section 1: Leave Allocations (Balance Cards per Type) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#714B67]" />
            <span>Leave Allocation Balances by Type (Section A4)</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">Odoo 18 Calendar Year 2026</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Paid Casual Leave */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    Paid Casual Leave (CL)
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">Annual Vacation &amp; Personal</h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-[#714B67]">8 Left</div>
                  <div className="text-[11px] text-slate-400">of 12 allocated</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Consumed: 4 days</span>
                  <span>Available: 8 days</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#714B67] rounded-full" style={{ width: "33%" }} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Full Wage (No deduction)</span>
              <span className="font-bold text-emerald-600">Active Pool</span>
            </div>
          </div>

          {/* Card 2: Sick Leave */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Medical &amp; Sick Leave (SL)
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">Health &amp; Recovery</h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-blue-700">4 Left</div>
                  <div className="text-[11px] text-slate-400">of 6 allocated</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Consumed: 2 days</span>
                  <span>Available: 4 days</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: "33%" }} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>Medical certificate &gt; 2 days</span>
              <span className="font-bold text-emerald-600">Active Pool</span>
            </div>
          </div>

          {/* Card 3: Unpaid Leave / Loss of Pay */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Loss of Pay (Unpaid LOP)
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-2">Payroll Wage Deduction</h3>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-rose-600">1 Logged</div>
                  <div className="text-[11px] text-slate-400">Rohan Verma</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Impacts September 2026 Payrun</span>
                  <span className="font-bold text-rose-600">-₹1,833 Deducted</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-rose-700 flex items-center justify-between font-semibold">
              <span>Auto-linked to Salary Structure</span>
              <span>Rule: (Wage/30) * Days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Leave Requests Table (Section B4) */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Leave Requests Ledger</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review pending requests, verify balances, and authorize or reject leaves
            </p>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
            {["All", "Pending", "Approved", "Refused"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterType(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterType === tab
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab}
                {tab === "Pending" && pendingRequests.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-5">Employee</th>
                <th className="py-3 px-5">Leave Type</th>
                <th className="py-3 px-5">Date Range</th>
                <th className="py-3 px-5 text-center">Duration</th>
                <th className="py-3 px-5">Reason</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => {
                const emp = employees.find((e) => e.id === req.employeeId);
                const empName = req.employeeName || emp?.name || "Team Member";
                const leaveTypeLabel = req.leaveType || req.type || "Paid Time Off";

                return (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Employee */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                          alt={empName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{empName}</div>
                          <div className="text-xs text-slate-500">{emp?.department}</div>
                        </div>
                      </div>
                    </td>

                    {/* Leave Type Badge */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          leaveTypeLabel.includes("Paid") || leaveTypeLabel.includes("Casual")
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : leaveTypeLabel.includes("Sick")
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {leaveTypeLabel}
                      </span>
                    </td>

                    {/* Date Range */}
                    <td className="py-3.5 px-5 font-medium text-slate-800">
                      {req.startDate} <span className="text-slate-400">to</span> {req.endDate}
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-5 text-center font-bold text-slate-900">
                      {req.days} {req.days === 1 ? "day" : "days"}
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-5 text-xs text-slate-600 max-w-xs truncate">
                      {req.reason}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          req.status === "Approved"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : req.status === "Pending"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {req.status === "Approved" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {req.status === "Pending" && <Clock className="w-3 h-3 text-amber-600" />}
                        {req.status === "Refused" && <XCircle className="w-3 h-3 text-rose-600" />}
                        <span>{req.status}</span>
                      </span>
                    </td>

                    {/* Interactive Action Buttons */}
                    <td className="py-3.5 px-5 text-right">
                      {req.status === "Pending" ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleApprove(req.id, empName, req.days)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRefuse(req.id, empName)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 cursor-pointer transition-colors"
                          >
                            Refuse
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">Completed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog: + Request Time Off */}
      {isNewRequestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#00A09D]/10 text-[#00A09D]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Request Time Off</h3>
                  <p className="text-xs text-slate-500">Submit leave request for approval</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewRequestOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Employee *
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A09D]"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.department} • Balance: {emp.smartMetrics.leaveBalance}d)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Time Off Type *
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A09D]"
                >
                  <option value="Paid Time Off">Paid Time Off (Casual / Vacation)</option>
                  <option value="Sick Leave">Sick Leave (Medical)</option>
                  <option value="Unpaid Leave">Unpaid Leave (Loss of Pay / LOP)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A09D]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A09D]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Duration (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A09D]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Reason / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Attending family wedding / Doctor consultation"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A09D]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewRequestOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-[#00A09D] hover:bg-[#008A87] rounded-xl shadow-xs"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
