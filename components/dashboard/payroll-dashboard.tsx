"use client";

import React, { useState } from "react";
import {
  Users,
  CreditCard,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  ArrowUpRight,
  Laptop,
  ShieldCheck,
  Building2,
  DollarSign,
  ArrowRight,
  Briefcase,
  Layers,
  PieChart,
  BarChart3,
  TrendingUp,
  Filter,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { formatINR } from "@/lib/utils";

export function PayrollDashboard() {
  const { employees, contracts, timeOff, setActiveNavTab, setSelectedEmployee } = useStore();

  // Interactive filters (A7 & B9 Requirements)
  const [filterPeriod, setFilterPeriod] = useState<string>("September 2026");
  const [filterDept, setFilterDept] = useState<string>("All Departments");
  const [filterEmpType, setFilterEmpType] = useState<string>("All Types");

  // Collapsible accordions on the featured profile card
  const [openAccordion, setOpenAccordion] = useState<string | null>("devices");

  // Timer tracker dial state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [workSeconds, setWorkSeconds] = useState(31500); // ~8h 45m

  // Interactive task checklist (matches Peoplexio style with dark aubergine theme)
  const [tasks, setTasks] = useState([
    { id: 1, title: "Welcome Kit & Access Credentials", date: "Sep 12, 09:30 AM", done: true },
    { id: 2, title: "Monthly Team Standup & Sync", date: "Sep 13, 10:30 AM", done: true },
    { id: 3, title: "Resolve Missing Bank Details (Rahul Mishra)", date: "Immediate Action Required", done: false, urgent: true },
    { id: 4, title: "Review Rohan Verma Leave Request (3 Days)", date: "Pending HR Approval", done: false, urgent: true },
    { id: 5, title: "Statutory PF & TDS Compliance Filing", date: "Sep 15, 02:00 PM", done: false },
    { id: 6, title: "September 2026 Payrun Batch Validation", date: "Sep 28, 05:00 PM", done: false },
  ]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const completedCount = tasks.filter((t) => t.done).length;

  const toggleAccordion = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  // Format workSeconds to HH:MM
  const formatTime = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    return `${hours < 10 ? "0" : ""}${hours}:${mins < 10 ? "0" : ""}${mins}`;
  };

  // Dynamically compute metrics based on active filters (A7 & B9)
  const activeStaff = employees.filter((e) => {
    const matchesDept = filterDept === "All Departments" || e.department === filterDept;
    const matchesType =
      filterEmpType === "All Types" ||
      (filterEmpType === "Permanent" && e.monthlyCTC >= 80000) ||
      (filterEmpType === "Contractor" && e.monthlyCTC < 80000);
    return matchesDept && matchesType;
  });

  const headcountDisplay = activeStaff.length;
  const onLeaveCount = activeStaff.filter((e) => e.status === "On Leave").length;
  const grossSpend = activeStaff.reduce((sum, e) => sum + e.monthlyCTC, 0);
  const netDisbursed = Math.round(grossSpend * 0.88); // ~12% deductions
  const avgWage = headcountDisplay > 0 ? Math.round(grossSpend / headcountDisplay) : 0;

  const featuredEmp = employees[0] || {
    id: "EMP-101",
    name: "Aarav Sharma",
    role: "VP of Engineering & HR Admin",
    monthlyCTC: 160000,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. TOP BANNER: Modern Peoplexio-Inspired Greeting & Pill Metrics */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
                Welcome to PeoplePay360
              </h1>
              <span className="px-3 py-1 rounded-full bg-[#714B67]/10 text-[#714B67] text-xs font-bold border border-[#714B67]/20">
                Odoo 18 Enterprise
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Empower. Engage. Elevate. Complete connected HR &amp; Payroll Operations.
            </p>
          </div>

          {/* Top Quick Status Stats Pills */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-sm font-semibold text-slate-700">
              <Users className="w-4 h-4 text-[#714B67]" />
              <span>Employees: <strong>128</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-sm font-semibold text-[#714B67]">
              <Briefcase className="w-4 h-4" />
              <span>Active Payroll: <strong>8 Staff</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-sm font-semibold text-[#00A09D]">
              <Building2 className="w-4 h-4" />
              <span>Departments: <strong>4 Units</strong></span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-800">
              <ShieldCheck className="w-4 h-4" />
              <span>Attendance: <strong>95.8%</strong></span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE DASHBOARD FILTER BAR (A7 & B9 Requirements) */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <Filter className="w-4 h-4 text-[#714B67]" />
            <span>Dashboard Scope Filters:</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Period Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Period:</span>
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="bg-white border border-slate-300 text-xs font-bold text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              >
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
              </select>
            </div>

            {/* Department Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Department:</span>
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="bg-white border border-slate-300 text-xs font-bold text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              >
                <option value="All Departments">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            {/* Employee Type Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 font-medium">Staff Type:</span>
              <select
                value={filterEmpType}
                onChange={(e) => setFilterEmpType(e.target.value)}
                className="bg-white border border-slate-300 text-xs font-bold text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              >
                <option value="All Types">All Staff Types</option>
                <option value="Permanent">Permanent (Full-Time)</option>
                <option value="Contractor">Consultant / Probation</option>
              </select>
            </div>

            {(filterDept !== "All Departments" || filterEmpType !== "All Types") && (
              <button
                onClick={() => {
                  setFilterDept("All Departments");
                  setFilterEmpType("All Types");
                }}
                className="text-xs text-[#714B67] hover:underline font-bold"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* 2. HERO METRICS ROW: 4 KPI Cards (Dynamically reacting to filters) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* KPI 1 */}
          <div className="bg-gradient-to-br from-purple-50/70 to-white rounded-xl border border-purple-200 p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Net Salary Disbursed
              </span>
              <div className="p-2.5 rounded-lg bg-[#714B67]/10 text-[#714B67]">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#0F172A] mt-2 tracking-tight">
              {formatINR(netDisbursed)}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md w-fit border border-emerald-200">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              <span>+4.2% vs last cycle</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-gradient-to-br from-teal-50/70 to-white rounded-xl border border-teal-200 p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Payroll Headcount
              </span>
              <div className="p-2.5 rounded-lg bg-[#00A09D]/10 text-[#00A09D]">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#0F172A] mt-2 tracking-tight">
              {headcountDisplay} Employees
            </div>
            <div className="mt-2 text-sm text-slate-600 font-medium">
              {headcountDisplay - onLeaveCount} Active •{" "}
              <span className="text-amber-700 font-semibold">{onLeaveCount} On Leave</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Average Monthly Wage
              </span>
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#0F172A] mt-2 tracking-tight">
              {formatINR(avgWage)}
            </div>
            <div className="mt-2 text-sm text-slate-500 font-medium">
              Across selected {filterDept} scope
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Attendance Health Index
              </span>
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700 mt-2 tracking-tight">95.8%</div>
            <div className="mt-2 text-sm text-emerald-800 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>98.2% on-time biometric punches</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN ANALYTICS VISUALS GRID (Excalidraw & B9 Requirement) */}
      <div className="px-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Analytics Card: Department Salary Expenditure */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#714B67]" />
                <span>Department Salary Expenditure</span>
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Monthly gross wage distribution across departments (Total: ₹9.23L)
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-[#714B67] border border-purple-200">
              {filterPeriod}
            </span>
          </div>

          {/* Custom Styled Progress Bars Breakdown */}
          <div className="space-y-3.5 pt-2">
            {/* Engineering */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#714B67]" />
                  <span className="font-bold text-slate-800">Engineering</span>
                  <span className="text-xs text-slate-500 font-medium">(3 Staff)</span>
                </div>
                <div className="font-black text-slate-900">
                  ₹4,45,000 <span className="text-xs font-semibold text-slate-500">(48%)</span>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#714B67] rounded-full transition-all duration-500"
                  style={{ width: "48%" }}
                />
              </div>
            </div>

            {/* Sales */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#00A09D]" />
                  <span className="font-bold text-slate-800">Sales</span>
                  <span className="text-xs text-slate-500 font-medium">(2 Staff)</span>
                </div>
                <div className="font-black text-slate-900">
                  ₹2,05,000 <span className="text-xs font-semibold text-slate-500">(22%)</span>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00A09D] rounded-full transition-all duration-500"
                  style={{ width: "22%" }}
                />
              </div>
            </div>

            {/* Product */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="font-bold text-slate-800">Product</span>
                  <span className="text-xs text-slate-500 font-medium">(1 Staff)</span>
                </div>
                <div className="font-black text-slate-900">
                  ₹1,40,000 <span className="text-xs font-semibold text-slate-500">(15%)</span>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: "15%" }}
                />
              </div>
            </div>

            {/* Human Resources */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-600" />
                  <span className="font-bold text-slate-800">Human Resources</span>
                  <span className="text-xs text-slate-500 font-medium">(2 Staff)</span>
                </div>
                <div className="font-black text-slate-900">
                  ₹1,33,000 <span className="text-xs font-semibold text-slate-500">(15%)</span>
                </div>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full transition-all duration-500"
                  style={{ width: "15%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Analytics Card: Attendance & Leave Ratio */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#00A09D]" />
                <span>Attendance &amp; Leave Ratio</span>
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Biometric check-in verification &amp; active leave ratio for current pay cycle
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              95.8% Overall Health
            </span>
          </div>

          {/* Segmented Visual Stacked Bar */}
          <div className="pt-2">
            <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-100 shadow-inner">
              <div style={{ width: "92%" }} className="bg-emerald-500 h-full" title="Present (92.0%)" />
              <div style={{ width: "3.8%" }} className="bg-amber-400 h-full" title="Late (3.8%)" />
              <div style={{ width: "3.2%" }} className="bg-purple-500 h-full" title="Approved Time Off (3.2%)" />
              <div style={{ width: "1.0%" }} className="bg-rose-500 h-full" title="Loss of Pay (1.0%)" />
            </div>
          </div>

          {/* Detailed Ratio Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <div className="text-xs font-bold text-emerald-800 uppercase">Present</div>
              <div className="text-xl font-black text-emerald-900 mt-1">92.0%</div>
              <div className="text-xs text-emerald-700 mt-0.5 font-medium">On-time check-in</div>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
              <div className="text-xs font-bold text-amber-800 uppercase">Late Arrival</div>
              <div className="text-xl font-black text-amber-900 mt-1">3.8%</div>
              <div className="text-xs text-amber-700 mt-0.5 font-medium">Biometric grace</div>
            </div>

            <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
              <div className="text-xs font-bold text-purple-800 uppercase">Approved PTO</div>
              <div className="text-xl font-black text-purple-900 mt-1">3.2%</div>
              <div className="text-xs text-purple-700 mt-0.5 font-medium">Paid Time Off</div>
            </div>

            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl">
              <div className="text-xs font-bold text-rose-800 uppercase">Loss of Pay</div>
              <div className="text-xl font-black text-rose-900 mt-1">1.0%</div>
              <div className="text-xs text-rose-700 mt-0.5 font-medium">1 day (Rohan V.)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MAIN DASHBOARD 3-COLUMN LAYOUT (High-Fidelity Peoplexio Architecture) */}
      <div className="px-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Featured Employee Card & Collapsible Profile Details (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Featured Profile Card */}
          <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 bg-gradient-to-b from-[#714B67] to-[#2D1C29] text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
                Featured Lead
              </span>
              <button
                onClick={() => {
                  setSelectedEmployee(featuredEmp as any);
                }}
                className="text-xs font-bold text-[#00A09D] hover:text-white transition-colors flex items-center gap-1"
              >
                <span>View Full Form</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={featuredEmp.avatar}
                alt={featuredEmp.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/60 shadow-md shrink-0"
              />
              <div>
                <h3 className="text-xl font-black text-white">{featuredEmp.name}</h3>
                <p className="text-sm text-white/80 font-medium">{featuredEmp.role}</p>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A09D] text-white font-extrabold text-sm shadow-sm">
                  <span>{formatINR(featuredEmp.monthlyCTC)}</span>
                  <span className="text-xs font-normal opacity-80">/ month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Accordions (Peoplexio Pattern) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100 text-sm">
            {/* Accordion 1: Devices */}
            <div>
              <button
                onClick={() => toggleAccordion("devices")}
                className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm">Assigned Devices &amp; Assets</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openAccordion === "devices" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "devices" && (
                <div className="px-5 pb-4 space-y-2.5 text-sm text-slate-600 animate-in fade-in">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <Laptop className="w-5 h-5 text-[#714B67]" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">MacBook Pro 14&quot; M2</div>
                        <div className="text-xs text-slate-500">Asset Tag: P360-DEV-042</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-[#00A09D]" />
                      <div>
                        <div className="font-bold text-slate-900 text-sm">YubiKey 5 NFC Hardware Token</div>
                        <div className="text-xs text-slate-500">2FA Security Token</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Verified
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Pension Contributions */}
            <div>
              <button
                onClick={() => toggleAccordion("pension")}
                className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm">Pension &amp; PF Contributions (EPFO)</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openAccordion === "pension" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "pension" && (
                <div className="px-5 pb-4 space-y-2 text-sm text-slate-600 animate-in fade-in">
                  <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Employee PF (12%)</span>
                      <span className="font-bold text-slate-900">₹9,600 / mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Employer Matching PF</span>
                      <span className="font-bold text-slate-900">₹9,600 / mo</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-purple-200">
                      <span className="font-semibold text-[#714B67]">UAN Number</span>
                      <span className="font-mono font-bold text-slate-900">101234567890</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Compensation Summary */}
            <div>
              <button
                onClick={() => toggleAccordion("compensation")}
                className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm">Compensation Structure</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openAccordion === "compensation" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "compensation" && (
                <div className="px-5 pb-4 space-y-2 text-sm animate-in fade-in">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Basic Salary (50%)</span>
                    <span className="font-bold text-slate-900">₹80,000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">HRA Allowance (20%)</span>
                    <span className="font-bold text-slate-900">₹32,000</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Special Allowance (30%)</span>
                    <span className="font-bold text-slate-900">₹48,000</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-bold text-emerald-700 bg-emerald-50 px-2 rounded-lg">
                    <span>Net Monthly Take-Home</span>
                    <span className="font-black text-base">₹1,34,400</span>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 4: Employee Benefits */}
            <div>
              <button
                onClick={() => toggleAccordion("benefits")}
                className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm">Statutory Benefits &amp; Insurance</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openAccordion === "benefits" ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openAccordion === "benefits" && (
                <div className="px-5 pb-4 text-sm text-slate-600 space-y-1.5 animate-in fade-in">
                  <p>• Group Medical Cover (GMC): ₹5,00,000 family floater</p>
                  <p>• Term Life Insurance: 3x Annual CTC</p>
                  <p>• Gratuity under Payment of Gratuity Act 1972</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Charts, Time Tracker & Calendar Schedule (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Row: Hiring & Payroll Progress Bar Chart + Time Tracker Dial */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Widget 1: Progress Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Monthly Payroll Trend
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-slate-400" />
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">₹8.28L</span>
                  <span className="text-xs font-bold text-emerald-600">+4.2% vs Aug</span>
                </div>
              </div>

              {/* Bar Chart Bars */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between h-24 px-2">
                {[
                  { month: "May", h: "65%", color: "bg-slate-200", val: "₹7.4L" },
                  { month: "Jun", h: "70%", color: "bg-slate-300", val: "₹7.6L" },
                  { month: "Jul", h: "78%", color: "bg-[#714B67]/60", val: "₹7.9L" },
                  { month: "Aug", h: "82%", color: "bg-[#714B67]/80", val: "₹7.95L" },
                  { month: "Sep", h: "95%", color: "bg-[#00A09D]", val: "₹8.28L" },
                ].map((b, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5" title={`${b.month}: ${b.val}`}>
                    <div className="w-6 rounded-t-md relative flex items-end justify-center">
                      <div
                        className={`w-full ${b.color} rounded-t-md transition-all duration-500`}
                        style={{ height: b.h }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-500">{b.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: Time Tracker Dial */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col items-center justify-between text-center">
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Time Tracker
                </span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>

              {/* Circular Dial Representation */}
              <div className="relative my-3 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border-4 border-slate-100 flex items-center justify-center relative">
                  <div
                    className="absolute inset-0 rounded-full border-4 border-[#714B67] border-t-transparent border-l-transparent transition-all"
                    style={{ transform: "rotate(45deg)" }}
                  />
                  <div className="text-center">
                    <div className="text-xl font-black text-slate-900 tracking-tight">
                      {formatTime(workSeconds)}
                    </div>
                    <span className="text-xs font-bold uppercase text-slate-400">Work Time</span>
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-2 rounded-full text-white transition-colors ${
                    isTimerRunning ? "bg-amber-500" : "bg-[#714B67] hover:bg-[#5C3D54]"
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <span className="text-sm font-semibold text-slate-700">
                  {isTimerRunning ? "Active Shift" : "Punched In"}
                </span>
              </div>
            </div>
          </div>

          {/* Weekly Shift Schedule & Payroll Timeline (September 2026) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  September 2026 Schedule &amp; Operational Events
                </h3>
                <p className="text-xs text-slate-500">Weekly team calendar &amp; payroll milestone locks</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#714B67] bg-purple-50 px-2.5 py-1 rounded-md">
                <Calendar className="w-3.5 h-3.5" />
                <span>Week 38</span>
              </div>
            </div>

            {/* Event Timeline Items */}
            <div className="space-y-3 text-sm">
              <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-9 rounded-full bg-[#714B67]" />
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">
                      Weekly HR &amp; Engineering Sync
                    </span>
                    <span className="text-xs text-slate-500">
                      Wed, 24 Sep • 09:00 AM - 10:00 AM
                    </span>
                  </div>
                </div>
                <div className="flex -space-x-1.5 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50"
                    className="w-7 h-7 rounded-full border border-white object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=50"
                    className="w-7 h-7 rounded-full border border-white object-cover"
                  />
                  <div className="w-7 h-7 rounded-full bg-[#714B67] text-white font-bold text-xs flex items-center justify-center border border-white">
                    +4
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-teal-50/80 border border-teal-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-9 rounded-full bg-[#00A09D]" />
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">
                      September Payrun Batch Computation &amp; Validation
                    </span>
                    <span className="text-xs text-slate-500">
                      Fri, 26 Sep • 04:00 PM - 05:30 PM (Deadline)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveNavTab("Payroll")}
                  className="px-3 py-1.5 rounded-lg bg-[#00A09D] text-white font-bold text-xs hover:bg-[#008A87] transition-colors"
                >
                  Go to Run
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-9 rounded-full bg-slate-400" />
                  <div>
                    <span className="font-bold text-slate-800 block text-sm">
                      New Staff Onboarding Orientation
                    </span>
                    <span className="text-xs text-slate-500">
                      Thu, 25 Sep • 11:00 AM - 12:00 PM
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2.5 py-1 rounded-md">
                  Scheduled
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Compliance Tasks Checklist & Live Operational Alerts (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Deep Aubergine / Navy Task Checklist Card */}
          <div className="rounded-2xl p-5 bg-[#2D1C29] text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base tracking-tight text-white">
                  Payroll &amp; HR Tasks
                </h3>
                <p className="text-xs text-white/70">Checklist for September run</p>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-[#00A09D]">
                  {completedCount}/{tasks.length}
                </span>
                <span className="text-xs text-white/60 block">Completed</span>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2.5 pt-2">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all border ${
                    t.done
                      ? "bg-white/5 border-white/10 text-white/50"
                      : t.urgent
                      ? "bg-amber-900/40 border-amber-500/50 text-white"
                      : "bg-white/10 border-white/15 text-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                        t.done
                          ? "bg-[#00A09D] border-[#00A09D] text-white"
                          : t.urgent
                          ? "border-amber-400"
                          : "border-white/50"
                      }`}
                    >
                      {t.done && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`text-sm font-bold leading-snug ${
                          t.done ? "line-through text-white/40" : ""
                        }`}
                      >
                        {t.title}
                      </div>
                      <div className="text-xs text-white/60 mt-1">{t.date}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Trigger Payrun CTA */}
            <button
              onClick={() => setActiveNavTab("Payroll")}
              className="w-full mt-2 py-3 bg-[#00A09D] hover:bg-[#008A87] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span>Execute Payrun Engine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Operational Alerts Widget */}
          <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Live Operational Alerts</span>
            </h4>

            <div className="space-y-2.5 text-sm">
              {/* Alert 1: Rahul Mishra */}
              <div
                onClick={() => {
                  const rahul = employees.find((e) => e.id === "EMP-103");
                  if (rahul) setSelectedEmployee(rahul);
                }}
                className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 cursor-pointer hover:bg-amber-100 transition-colors"
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Rahul Mishra: Missing Bank Details</span>
                </div>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Click to open form &amp; link account before final payout.
                </p>
              </div>

              {/* Alert 2: Rohan Verma */}
              <div
                onClick={() => setActiveNavTab("Time Off")}
                className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-[#714B67] cursor-pointer hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Calendar className="w-4 h-4 text-[#714B67] shrink-0" />
                  <span>Rohan Verma: 3 Days Pending Leave Approval</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Family vacation request pending in Time Off module.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
