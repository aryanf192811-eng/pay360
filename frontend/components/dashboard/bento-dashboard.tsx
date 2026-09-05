"use client";

import React, { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Users,
  Building2,
  CreditCard,
  Calendar,
  Check,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { formatINR } from "@/lib/utils";

export function BentoDashboard() {
  const { employees, setActiveNavTab, setSelectedEmployee, setIsPayrunWizardOpen } = useStore();

  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(27900); // 7h 45m

  // Department Spend for vertical bar chart
  const deptSpend = [
    { name: "Engineering", amount: "₹4.45L", height: "92%", percentage: "53.7%", color: "bg-[#714B67]" },
    { name: "Sales", amount: "₹2.05L", height: "55%", percentage: "24.7%", color: "bg-[#00A09D]" },
    { name: "Product", amount: "₹1.40L", height: "38%", percentage: "16.9%", color: "bg-amber-500" },
    { name: "HR", amount: "₹1.33L", height: "35%", percentage: "16.0%", color: "bg-indigo-500" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Welcome Row */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#714B67]/10 text-[#714B67] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00A09D]" />
              <span>Odoo 18 Enterprise HRMS</span>
            </span>
            <span className="text-xs text-slate-400 font-medium">Session: Active</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Welcome in, PeoplePay360
          </h1>

          {/* Quick Progress Pills */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {/* Attendance Progress Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#714B67]" />
              <span>Attendance: 96%</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="w-[96%] h-full bg-[#714B67] rounded-full" />
              </div>
            </div>

            {/* Payroll Progress Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-[#00A09D]" />
              <span>Payroll: 100% Validated</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="w-[100%] h-full bg-[#00A09D] rounded-full" />
              </div>
            </div>

            {/* On-Time Presence */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>On-Time: 94%</span>
            </div>
          </div>
        </div>

        {/* Right Stat Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70 shrink-0">
          <div className="px-3 border-r border-slate-200/80">
            <div className="text-[11px] font-bold uppercase text-slate-400">Net Disbursed</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">₹8.28L</div>
            <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5">
              <ArrowUpRight className="w-3 h-3" />
              <span>+4.2%</span>
            </div>
          </div>

          <div className="px-3 border-r border-slate-200/80">
            <div className="text-[11px] font-bold uppercase text-slate-400">Active Staff</div>
            <div className="text-xl font-black text-[#714B67] mt-0.5">8 Staff</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">1 On-Leave</div>
          </div>

          <div className="px-3 sm:border-r border-slate-200/80">
            <div className="text-[11px] font-bold uppercase text-slate-400">Departments</div>
            <div className="text-xl font-black text-[#00A09D] mt-0.5">4 Units</div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">All synced</div>
          </div>

          <div className="px-3">
            <div className="text-[11px] font-bold uppercase text-slate-400">Action Needed</div>
            <div className="text-xl font-black text-amber-600 mt-0.5">1 Item</div>
            <div className="text-[10px] text-amber-700 font-bold mt-0.5 flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse" />
              <span>Missing Bank</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Bento Grid Layout (12 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-5">
        {/* Bento 1: Employee Spotlight Card (Col-span 3) */}
        <div className="col-span-1 md:col-span-4 lg:col-span-3 rounded-3xl bg-white/95 border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative overflow-hidden h-[340px] flex flex-col justify-end group">
          {/* Top Background Cover Image */}
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80"
            alt="Ananya Sharma"
            className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />

          {/* Gradient Shadow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent" />

          {/* Top Pill */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm border border-white/50">
              ⭐ Top Performer
            </span>
          </div>

          {/* Bottom Glass Overlay Banner */}
          <div className="relative z-10 p-5 bg-white/10 backdrop-blur-md border-t border-white/20 m-3 rounded-2xl text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white tracking-tight leading-tight">
                  Ananya Sharma
                </h3>
                <p className="text-xs text-slate-200 font-medium mt-0.5">
                  Lead HR Operations
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-black bg-[#00A09D] text-white shadow-xs">
                ₹95,000 / mo
              </span>
            </div>
          </div>
        </div>

        {/* Bento 2: Payroll Spend Breakdown (Col-span 4) */}
        <div className="col-span-1 md:col-span-4 lg:col-span-4 rounded-3xl bg-white/95 border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between h-[340px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Department Spend</h3>
                <p className="text-xs text-slate-500 mt-0.5">Monthly allocation share</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+4.2%</span>
              </span>
            </div>

            {/* Modern Vertical Bar Chart */}
            <div className="mt-5 flex items-end justify-between gap-3 h-40 px-2">
              {deptSpend.map((dept) => (
                <div key={dept.name} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {dept.amount}
                  </span>
                  <div
                    className={`w-full ${dept.color} rounded-xl shadow-xs group-hover:brightness-110 transition-all`}
                    style={{ height: dept.height }}
                  />
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-700 block">{dept.name}</span>
                    <span className="text-[10px] text-slate-400">{dept.percentage}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Engineering accounts for 53.7%</span>
            <button
              onClick={() => setActiveNavTab("Payroll")}
              className="font-bold text-[#714B67] hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <span>View Payrun</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Bento 3: Biometric Time Tracker Widget (Col-span 3) */}
        <div className="col-span-1 md:col-span-4 lg:col-span-3 rounded-3xl bg-white/95 border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between h-[340px]">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Biometric Tracker</h3>
                <p className="text-xs text-slate-500 mt-0.5">Today&apos;s shift logged</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Active</span>
              </span>
            </div>

            {/* Circular Progress Gauge (SVG Ring) */}
            <div className="mt-4 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  {/* Progress Arc: 7.75 hrs out of 8.0 hrs = 96.8% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#00A09D"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset="8"
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                {/* Center Content */}
                <div className="absolute text-center">
                  <div className="text-xl font-black text-slate-900 tracking-tight">07:45 hrs</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Worked</div>
                </div>
              </div>

              {/* Status and Controls */}
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>On-Time Presence</span>
                </span>

                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    isTimerRunning
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-[#00A09D] text-white"
                  }`}
                  title={isTimerRunning ? "Pause timer" : "Resume timer"}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Shift Target: 08:00 hrs</span>
            <span className="font-bold text-slate-700">15m to EOD</span>
          </div>
        </div>

        {/* Bento 4: Payroll Action & Alerts Bento (Col-span 2, Dark Obsidian Card #0F172A text-white) */}
        <div className="col-span-1 md:col-span-12 lg:col-span-2 rounded-3xl bg-[#0F172A] text-white p-5 shadow-md flex flex-col justify-between h-[340px] border border-slate-800 relative overflow-hidden">
          {/* Subtle Ambient Radial Top Glow */}
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#714B67]/30 blur-xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-extrabold text-sm text-white tracking-tight">
                Payrun Tasks
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#00A09D] text-white">
                3/4
              </span>
            </div>

            {/* Checklist */}
            <div className="mt-3.5 space-y-2.5 text-xs">
              {/* Task 1: Checked */}
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-4 h-4 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="line-through text-slate-400">Time Off Approved</span>
              </div>

              {/* Task 2: Checked */}
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-4 h-4 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="line-through text-slate-400">Contracts Synced</span>
              </div>

              {/* Task 3: Warning Anomaly (Amber Pulse) */}
              <div className="flex items-start gap-2 text-amber-300 pt-1">
                <div className="w-4 h-4 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/50 mt-0.5 animate-pulse">
                  <AlertTriangle className="w-2.5 h-2.5" />
                </div>
                <div className="leading-tight">
                  <span className="font-bold text-amber-300">Rahul Mishra</span>
                  <span className="block text-[10px] text-amber-400/80">Bank IFSC Missing</span>
                </div>
              </div>

              {/* Task 4: Next step */}
              <div className="flex items-center gap-2 text-slate-400 pt-1">
                <div className="w-4 h-4 rounded-md border border-slate-700 bg-slate-800 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                </div>
                <span>Disburse Transfer</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const rahul = employees.find((e) => e.id === "EMP-103");
              if (rahul) setSelectedEmployee(rahul);
              setActiveNavTab("Employees");
            }}
            className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Resolve Anomaly</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Secondary Row: Active System Anomalies & Direct Fix Table */}
      <div className="rounded-3xl bg-white/95 border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">System Verification &amp; Operational Anomalies</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified verification items across banking, time-off requests, and employment contracts
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
            3 Active Items
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-5">Severity</th>
                <th className="py-3 px-5">Employee / Entity</th>
                <th className="py-3 px-5">Operational Detail</th>
                <th className="py-3 px-5">Payroll Consequence</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Row 1: Rahul */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>High</span>
                  </span>
                </td>
                <td className="py-3.5 px-5 font-bold text-slate-900">
                  Rahul Mishra (EMP-103)
                </td>
                <td className="py-3.5 px-5 text-xs text-slate-600">
                  Account number and IFSC credentials missing on employee file.
                </td>
                <td className="py-3.5 px-5 text-xs text-rose-600 font-semibold">
                  NEFT disbursement file exclusion
                </td>
                <td className="py-3.5 px-5 text-right">
                  <button
                    onClick={() => {
                      const rahul = employees.find((e) => e.id === "EMP-103");
                      if (rahul) setSelectedEmployee(rahul);
                      setActiveNavTab("Employees");
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <span>Fix Banking</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </td>
              </tr>

              {/* Row 2: Rohan */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200">
                    <Calendar className="w-3 h-3 text-[#714B67]" />
                    <span>Medium</span>
                  </span>
                </td>
                <td className="py-3.5 px-5 font-bold text-slate-900">
                  Rohan Verma (EMP-107)
                </td>
                <td className="py-3.5 px-5 text-xs text-slate-600">
                  3-day Casual Vacation request pending approval.
                </td>
                <td className="py-3.5 px-5 text-xs text-slate-600">
                  Deducts from 14-day balance upon authorization
                </td>
                <td className="py-3.5 px-5 text-right">
                  <button
                    onClick={() => setActiveNavTab("Time Off")}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#714B67] hover:bg-[#5E3D55] text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    <span>Review Leave</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </td>
              </tr>

              {/* Row 3: Contract */}
              <tr className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    <span>Low</span>
                  </span>
                </td>
                <td className="py-3.5 px-5 font-bold text-slate-900">
                  CTR-2022-101 (Aarav Sharma)
                </td>
                <td className="py-3.5 px-5 text-xs text-slate-600">
                  Annual contract term review due in 30 days.
                </td>
                <td className="py-3.5 px-5 text-xs text-slate-600">
                  No salary gap; appraisal scheduled
                </td>
                <td className="py-3.5 px-5 text-right">
                  <button
                    onClick={() => setActiveNavTab("Contracts")}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
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
