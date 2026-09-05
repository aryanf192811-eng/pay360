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
  ArrowDownRight,
  ShieldCheck,
  ChevronRight,
  FileText,
  Filter,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { formatINR } from "@/lib/utils";

export function ExecutiveDashboard() {
  const { employees, payrunBatch, timeOff, setActiveNavTab, setSelectedEmployee } = useStore();
  const [selectedPeriod, setSelectedPeriod] = useState("September 2026");

  // Top KPIs
  const totalNetDisbursed = 828000;
  const activeHeadcount = 8;
  const avgTakeHome = 74500;
  const attendanceHealth = 96.2;

  // Department Breakdown (as requested by user)
  const deptBreakdown = [
    { name: "Engineering", amount: 445000, percentage: 48.2, color: "bg-[#714B67]", text: "text-[#714B67]" },
    { name: "Enterprise Sales", amount: 205000, percentage: 22.2, color: "bg-[#00A09D]", text: "text-[#00A09D]" },
    { name: "Product Management", amount: 140000, percentage: 15.2, color: "bg-amber-500", text: "text-amber-700" },
    { name: "Human Resources", amount: 133000, percentage: 14.4, color: "bg-indigo-500", text: "text-indigo-700" },
  ];

  // 6-Month Payroll Cost Trend (Apr - Sep 2026)
  const monthlyTrends = [
    { month: "Apr", amount: 760000, height: "65%", label: "₹7.60L" },
    { month: "May", amount: 785000, height: "72%", label: "₹7.85L" },
    { month: "Jun", amount: 790000, height: "75%", label: "₹7.90L" },
    { month: "Jul", amount: 810000, height: "85%", label: "₹8.10L" },
    { month: "Aug", amount: 815000, height: "88%", label: "₹8.15L" },
    { month: "Sep", amount: 828000, height: "98%", label: "₹8.28L", current: true },
  ];

  // Attendance Distribution
  const attendanceRatio = [
    { label: "Present (Biometric)", value: "92%", color: "bg-emerald-500", count: "168 shifts" },
    { label: "Late Check-in", value: "4%", color: "bg-amber-500", count: "7 events" },
    { label: "Approved Leaves", value: "3%", color: "bg-blue-500", count: "6 days" },
    { label: "Unpaid / LOP", value: "1%", color: "bg-rose-500", count: "1 day (Rohan)" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Executive Filter */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>PeoplePay360</span>
            <span className="text-slate-300">/</span>
            <span className="text-[#714B67] font-bold">Executive Analytics</span>
            <span className="text-slate-300">/</span>
            <span>Section B9 Real-Time</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-[#714B67]" />
            <span>Executive Payroll &amp; HR Dashboard</span>
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Real-time ledger aggregation combining employee profiles, contracts, attendance health, and payrun costs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="September 2026">September 2026 (Live)</option>
              <option value="August 2026">August 2026 (Audited)</option>
              <option value="July 2026">July 2026 (Audited)</option>
            </select>
          </div>

          <button
            onClick={() => setActiveNavTab("Payroll")}
            className="px-3.5 py-1.5 rounded-xl bg-[#00A09D] hover:bg-[#008A87] text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Launch Payrun Pipeline
          </button>
        </div>
      </div>

      {/* Top 4 KPI Row (Required Values & Indicators) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Net Disbursed */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Total Net Disbursed
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ArrowUpRight className="w-3 h-3" />
              <span>+4.2% MoM</span>
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">₹8,28,000</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>September 2026 batch computed</span>
          </div>
        </div>

        {/* KPI 2: Active Headcount */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Active Headcount
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              100% Retained
            </span>
          </div>
          <div className="text-2xl font-black text-[#714B67] mt-2">{activeHeadcount} Employees</div>
          <div className="text-xs text-slate-500 mt-1">
            7 Active on Duty • <span className="text-amber-700 font-bold">1 On Leave</span>
          </div>
        </div>

        {/* KPI 3: Avg Take-Home */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Avg Take-Home
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
              Post-Tax
            </span>
          </div>
          <div className="text-2xl font-black text-[#00A09D] mt-2">₹74,500</div>
          <div className="text-xs text-slate-500 mt-1">Average per salaried staff member</div>
        </div>

        {/* KPI 4: Attendance Health */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Attendance Health
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Biometric Sync
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{attendanceHealth}% On-Time</div>
          <div className="text-xs text-slate-500 mt-1">4% Late Check-ins • 1% Unpaid LOP</div>
        </div>
      </div>

      {/* Visual Charts Grid: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Department Payroll Distribution */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Department Wage Share</h3>
                <p className="text-xs text-slate-500 mt-0.5">Total monthly expenditure: ₹9.23L</p>
              </div>
              <Building2 className="w-5 h-5 text-slate-400" />
            </div>

            <div className="mt-4 space-y-4">
              {deptBreakdown.map((dept) => (
                <div key={dept.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800">{dept.name}</span>
                    <span className={`font-extrabold ${dept.text}`}>
                      {formatINR(dept.amount)} ({dept.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${dept.color} rounded-full transition-all duration-500`}
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Engineering accounts for &gt; 48%</span>
            <button
              onClick={() => setActiveNavTab("Employees")}
              className="font-bold text-[#714B67] hover:underline"
            >
              View Roster &rarr;
            </button>
          </div>
        </div>

        {/* Center: 6-Month Payroll Cost Trend */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">6-Month Payroll Cost Trend</h3>
                <p className="text-xs text-slate-500 mt-0.5">Steady growth aligned with headcount</p>
              </div>
              <TrendingUp className="w-5 h-5 text-[#00A09D]" />
            </div>

            {/* Visual Bar Graph */}
            <div className="mt-6 flex items-end justify-between h-44 px-2 gap-3">
              {monthlyTrends.map((t) => (
                <div key={t.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.label}
                  </div>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      t.current
                        ? "bg-[#00A09D] shadow-sm shadow-[#00A09D]/50"
                        : "bg-slate-200 hover:bg-[#714B67]/40"
                    }`}
                    style={{ height: t.height }}
                  />
                  <span
                    className={`text-xs font-bold ${
                      t.current ? "text-[#00A09D] font-black" : "text-slate-500"
                    }`}
                  >
                    {t.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Net +₹68,000 (+8.9%) since Apr</span>
            <span className="font-bold text-emerald-600">On Budget</span>
          </div>
        </div>

        {/* Right: Attendance Distribution */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Attendance Distribution</h3>
                <p className="text-xs text-slate-500 mt-0.5">Biometric logs for September cycle</p>
              </div>
              <Clock className="w-5 h-5 text-slate-400" />
            </div>

            <div className="mt-4 space-y-3">
              {attendanceRatio.map((item) => (
                <div
                  key={item.label}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-3 h-3 rounded-full ${item.color}`} />
                    <div>
                      <div className="text-xs font-bold text-slate-800">{item.label}</div>
                      <div className="text-[11px] text-slate-400">{item.count}</div>
                    </div>
                  </div>
                  <span className="text-base font-black text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>1 Unpaid LOP day impacts batch</span>
            <button
              onClick={() => setActiveNavTab("Time Off")}
              className="font-bold text-[#00A09D] hover:underline"
            >
              Time Off &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Real Operational Alerts & Actionable Insights Section */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Operational Compliance Alerts</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live checks enforced across banking credentials, contracts, and leave requests
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
            2 Items Requiring Attention
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Alert 1: Rahul Mishra Banking */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-sm text-amber-900">
                Missing Bank Account: Rahul Mishra (EMP-103)
              </div>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Rahul is included in the September 2026 payrun batch with gross earnings of ₹95,000, but has no bank account or IFSC recorded. Direct NEFT transfer will fail.
              </p>
              <button
                onClick={() => {
                  const rahul = employees.find((e) => e.id === "EMP-103");
                  if (rahul) {
                    setSelectedEmployee(rahul);
                    setActiveNavTab("Employees");
                  }
                }}
                className="mt-2 text-xs font-bold text-amber-900 underline cursor-pointer"
              >
                Open Rahul&apos;s Profile &amp; Link Bank Account &rarr;
              </button>
            </div>
          </div>

          {/* Alert 2: Time Off Approval */}
          <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 flex items-start gap-3">
            <Calendar className="w-5 h-5 text-[#714B67] shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-bold text-sm text-purple-900">
                Pending Leave Request: Rohan Verma (EMP-107)
              </div>
              <p className="text-xs text-purple-800 mt-0.5 leading-relaxed">
                Rohan submitted a 2-day Paid Vacation request for 2026-09-20 to 2026-09-21. Approval will adjust his remaining leave balance from 14 to 12 days.
              </p>
              <button
                onClick={() => setActiveNavTab("Time Off")}
                className="mt-2 text-xs font-bold text-[#714B67] underline cursor-pointer"
              >
                Review &amp; Authorize in Time Off Center &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
