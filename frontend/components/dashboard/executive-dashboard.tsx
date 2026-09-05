"use client";

import React, { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  CreditCard,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Building2,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  FileText,
  Filter,
  Sparkles,
  ExternalLink,
  Percent,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { formatINR } from "@/lib/utils";

export function ExecutiveDashboard() {
  const {
    employees,
    timeOff,
    setActiveNavTab,
    setIsPayrunWizardOpen,
    setSelectedEmployee,
  } = useStore();

  const [selectedPeriod, setSelectedPeriod] = useState("September 2026");

  // Department Breakdown (Excalidraw Section 5 & Prompt specification)
  const deptBreakdown = [
    { name: "Engineering", amount: 445000, percentage: 53.7, color: "bg-[#714B67]", text: "text-[#714B67]" },
    { name: "Sales", amount: 205000, percentage: 24.7, color: "bg-[#00A09D]", text: "text-[#00A09D]" },
    { name: "Product", amount: 140000, percentage: 16.9, color: "bg-amber-500", text: "text-amber-700" },
    { name: "Human Resources", amount: 133000, percentage: 16.0, color: "bg-indigo-500", text: "text-indigo-700" },
  ];

  // Attendance & Leave Distribution (Prompt specification)
  const attendanceMetrics = [
    { label: "Present", value: "92%", color: "bg-emerald-500", count: "168 logged shifts", barWidth: "92%" },
    { label: "Late Check-ins", value: "4%", color: "bg-amber-500", count: "7 events recorded", barWidth: "4%" },
    { label: "Approved Paid Leave", value: "3%", color: "bg-blue-500", count: "6 days approved", barWidth: "3%" },
    { label: "Unpaid / LOP", value: "1%", color: "bg-rose-500", count: "1 day (Wage deduction)", barWidth: "1%" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Aesthetic Welcome Banner */}
      <div className="bg-gradient-to-r from-white/90 via-white/80 to-purple-50/70 backdrop-blur-md rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#714B67] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#00A09D]" />
            <span>Odoo 18 Enterprise Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Good afternoon, Aarav!
          </h1>
          <p className="text-sm font-medium text-slate-600">
            Here is today&apos;s payroll health across all 8 active contracts.
          </p>
        </div>

        {/* Quick Action Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsPayrunWizardOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00A09D] hover:bg-[#008A87] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Run Payrun Wizard</span>
          </button>
          <button
            onClick={() => setActiveNavTab("Time Off")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#714B67] hover:bg-purple-50 text-xs font-bold border border-[#714B67]/30 shadow-xs transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#714B67]" />
            <span>Review 1 Pending Leave</span>
          </button>
        </div>
      </div>

      {/* 2. Hero KPI Cards Row (4 Glass Cards with Icons) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Net Disbursed */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-[#714B67]/30 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Total Net Disbursed
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">₹8,28,000</div>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ArrowUpRight className="w-3 h-3" />
              <span>+4.2% vs last cycle</span>
            </span>
          </div>
        </div>

        {/* KPI 2: Active Payroll Headcount */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-[#714B67]/30 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Active Payroll Headcount
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-[#714B67]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black text-[#714B67]">8 Employees</div>
          </div>
          <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
            <span className="text-amber-700 font-bold">1 On Leave</span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-700 font-bold">1 Missing Bank</span>
          </div>
        </div>

        {/* KPI 3: Average Monthly Wage */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-[#714B67]/30 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Average Monthly Wage
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-[#00A09D]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black text-[#00A09D]">₹92,500</div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Across 8 corporate contracts</span>
          </div>
        </div>

        {/* KPI 4: Attendance Health */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-[#714B67]/30 transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Attendance Health
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">96.2% On-Time</div>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Biometric log synchronized</span>
          </div>
        </div>
      </div>

      {/* 3. Interactive Analytics Grid (Two Columns as requested) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Card: Department Payroll Expenditure */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-[#714B67]/30 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Department Payroll Expenditure</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monthly gross salary distribution across functional units
                </p>
              </div>
              <Building2 className="w-5 h-5 text-slate-400" />
            </div>

            <div className="mt-5 space-y-4">
              {deptBreakdown.map((dept) => (
                <div key={dept.name}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-slate-800">{dept.name}</span>
                    <span className={`font-black ${dept.text}`}>
                      {formatINR(dept.amount)} ({dept.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${dept.color} rounded-full transition-all duration-500`}
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Engineering accounts for 53.7% of total payroll</span>
            <button
              onClick={() => setActiveNavTab("Employees")}
              className="font-bold text-[#714B67] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View Employee Roster</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Card: Attendance & Leave Distribution */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-[#714B67]/30 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Attendance &amp; Leave Distribution</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Biometric check-in and leave breakdown for current cycle
                </p>
              </div>
              <Clock className="w-5 h-5 text-[#00A09D]" />
            </div>

            {/* Segmented Progress Bar */}
            <div className="mt-5">
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: "92%" }} title="Present 92%" />
                <div className="bg-amber-500 h-full" style={{ width: "4%" }} title="Late 4%" />
                <div className="bg-blue-500 h-full" style={{ width: "3%" }} title="Approved Leave 3%" />
                <div className="bg-rose-500 h-full" style={{ width: "1%" }} title="Unpaid LOP 1%" />
              </div>
            </div>

            {/* Metric Items */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {attendanceMetrics.map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color} shrink-0`} />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.count}</div>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Only 1 unpaid day deducted in payrun</span>
            <button
              onClick={() => setActiveNavTab("Time Off")}
              className="font-bold text-[#00A09D] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Open Time Off Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Alerts Table: Live List of System Anomalies with Direct Fix Links */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">System Anomalies &amp; Operational Alerts</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified verification warnings across banking records, time off requests, and contracts
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
            3 Active Anomalies
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-5">Severity</th>
                <th className="py-3 px-5">Module / Entity</th>
                <th className="py-3 px-5">Description &amp; Payroll Impact</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Anomaly 1: Rahul Mishra */}
              <tr className="hover:bg-amber-50/40 transition-colors">
                <td className="py-3.5 px-5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>High</span>
                  </span>
                </td>
                <td className="py-3.5 px-5 font-bold text-slate-900">
                  Rahul Mishra (EMP-103)
                </td>
                <td className="py-3.5 px-5 text-xs text-slate-600">
                  Bank Account Number &amp; IFSC code missing. Net salary computed, but direct NEFT transfer will fail.
                </td>
                <td className="py-3.5 px-5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Pending Fix
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <button
                    onClick={() => {
                      const rahul = employees.find((e) => e.id === "EMP-103");
                      if (rahul) setSelectedEmployee(rahul);
                      setActiveNavTab("Employees");
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <span>Fix Banking</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </td>
              </tr>

              {/* Anomaly 2: Rohan Verma */}
              <tr className="hover:bg-purple-50/40 transition-colors">
                <td className="py-3.5 px-5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                    <Calendar className="w-3.5 h-3.5 text-[#714B67]" />
                    <span>Medium</span>
                  </span>
                </td>
                <td className="py-3.5 px-5 font-bold text-slate-900">
                  Rohan Verma (EMP-107)
                </td>
                <td className="py-3.5 px-5 text-xs text-slate-600">
                  3-day Casual Vacation request pending approval. Will deduct from remaining 14-day balance upon approval.
                </td>
                <td className="py-3.5 px-5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Requires Review
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <button
                    onClick={() => setActiveNavTab("Time Off")}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#714B67] hover:bg-[#5E3D55] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <span>Review Leave</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </td>
              </tr>

              {/* Anomaly 3: Contract CTR-2022-101 */}
              <tr className="hover:bg-blue-50/40 transition-colors">
                <td className="py-3.5 px-5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>Low</span>
                  </span>
                </td>
                <td className="py-3.5 px-5 font-bold text-slate-900">
                  CTR-2022-101 (Aarav Sharma)
                </td>
                <td className="py-3.5 px-5 text-xs text-slate-600">
                  Annual contract term renewal scheduled in 30 days. No salary gap expected.
                </td>
                <td className="py-3.5 px-5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    Upcoming Review
                  </span>
                </td>
                <td className="py-3.5 px-5 text-right">
                  <button
                    onClick={() => setActiveNavTab("Contracts")}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
