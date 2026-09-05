"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  LayoutGrid,
  Bell,
  Building2,
  ChevronDown,
  Users,
  FileText,
  Clock,
  Calendar,
  CreditCard,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Lock,
  UserCheck,
  LogOut,
  User,
  Check,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { UserRole } from "@/lib/mock-data";

export function TopBar() {
  const {
    activeNavTab,
    setActiveNavTab,
    employees,
    timeOff,
    contracts,
    currentRole,
    setCurrentRole,
    currentCompany,
    setCurrentCompany,
    setIsAuthOpen,
    setSelectedEmployee,
  } = useStore();

  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const companyRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifsOpen(false);
      }
      if (companyRef.current && !companyRef.current.contains(event.target as Node)) {
        setIsCompanyOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pendingLeavesCount = timeOff.filter((t) => t.status === "Pending").length;

  const navItems = [
    { name: "Employees", icon: Users, count: employees.length },
    { name: "Contracts", icon: FileText, count: contracts.length },
    { name: "Working Schedules", icon: Clock },
    { name: "Time Off", icon: Calendar, badge: pendingLeavesCount > 0 ? `${pendingLeavesCount} Pending` : undefined },
    { name: "Payroll", icon: CreditCard },
    { name: "Reports", icon: BarChart3, highlight: true },
  ];

  const companies = [
    { name: "PeoplePay360 Corp (IN) - Gandhinagar HQ", region: "India • Primary", active: true },
    { name: "PeoplePay360 EMEA Ltd - London", region: "United Kingdom", active: false },
    { name: "PeoplePay360 US Inc - Delaware", region: "United States", active: false },
  ];

  const roles: { role: UserRole; title: string; desc: string }[] = [
    {
      role: "Admin",
      title: "Admin / HR Payroll Manager",
      desc: "Full CRUD access across employees, contracts & payroll computation",
    },
    {
      role: "HR Manager",
      title: "HR Manager",
      desc: "Manage employees, attendance & leave approvals (no payroll batch run)",
    },
    {
      role: "Employee",
      title: "Employee Self-Service (Aarav Sharma)",
      desc: "View personal profile, submit time off & view own payslips",
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#714B67] text-white shadow-md select-none">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Section: Brand & Odoo App Switcher */}
        <div className="flex items-center gap-4">
          <button
            title="Odoo App Launcher"
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white cursor-pointer"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>

          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveNavTab("Employees")}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00A09D] text-white font-black text-sm shadow-sm">
              P360
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-lg text-white">
                  PeoplePay360
                </span>
                <span className="text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/15 text-slate-100 hidden sm:inline">
                  Enterprise
                </span>
              </div>
              <span className="text-[10px] text-white/70 tracking-wide hidden sm:block">
                Odoo 18 HR &amp; Payroll Platform
              </span>
            </div>
          </div>

          {/* Module Navigation Tabs */}
          <nav className="hidden lg:flex items-center ml-5 space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNavTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveNavTab(item.name)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-white/20 text-white font-bold shadow-xs border border-white/20"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[#00A09D]" : "text-white/80"}`} />
                  <span>{item.name}</span>
                  {item.count !== undefined && (
                    <span
                      className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isActive
                          ? "bg-[#00A09D] text-white"
                          : "bg-white/15 text-white/90"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-900 text-[10px] font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Multi-Company, Alerts, Profile */}
        <div className="flex items-center gap-3">
          {/* Mobile Tab Select Dropdown */}
          <div className="block lg:hidden">
            <select
              value={activeNavTab}
              onChange={(e) => setActiveNavTab(e.target.value)}
              className="bg-white/15 text-white border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
            >
              {navItems.map((i) => (
                <option key={i.name} value={i.name} className="text-slate-900">
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          {/* 1. Functional Company Switcher Dropdown */}
          <div className="relative hidden md:block" ref={companyRef}>
            <button
              onClick={() => setIsCompanyOpen(!isCompanyOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-medium text-white hover:bg-white/20 cursor-pointer border border-white/15 transition-colors"
            >
              <Building2 className="h-4 w-4 text-[#00A09D] shrink-0" />
              <span className="font-semibold max-w-[170px] truncate">
                {currentCompany.split(" - ")[0]}
              </span>
              <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition-transform ${isCompanyOpen ? "rotate-180" : ""}`} />
            </button>

            {isCompanyOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Operating Entity
                  </div>
                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    Multi-Company Partitioning (Odoo 18)
                  </div>
                </div>
                <div className="py-1 space-y-1">
                  {companies.map((comp) => {
                    const isSelected = currentCompany.startsWith(comp.name.split(" - ")[0]);
                    return (
                      <button
                        key={comp.name}
                        onClick={() => {
                          setCurrentCompany(comp.name);
                          setIsCompanyOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-[#714B67]/10 text-[#714B67] font-bold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div>
                          <div className="font-bold line-clamp-1">{comp.name}</div>
                          <div className="text-[10px] text-slate-500">{comp.region}</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#714B67] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. Functional Notification Bell Popover */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifsOpen(!isNotifsOpen)}
              title="System Notifications"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl hover:bg-white/15 text-white transition-colors cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#00A09D] ring-2 ring-[#714B67] animate-pulse" />
            </button>

            {isNotifsOpen && (
              <div className="absolute right-0 mt-2 w-96 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-[#714B67]" />
                    <span className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Live Operational Alerts (3)
                    </span>
                  </div>
                  <button
                    onClick={() => setIsNotifsOpen(false)}
                    className="text-[11px] font-semibold text-[#00A09D] hover:underline cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>

                {/* 3 Real System Alerts */}
                <div className="divide-y divide-slate-100 py-1 space-y-1">
                  {/* Alert 1: Rahul Mishra Bank Details */}
                  <div className="p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-slate-900">
                        Rahul Mishra: Bank Account &amp; IFSC Missing
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Direct NEFT dispatch will fail during September batch payout.
                      </p>
                      <button
                        onClick={() => {
                          const rahul = employees.find((e) => e.id === "EMP-103");
                          if (rahul) setSelectedEmployee(rahul);
                          setActiveNavTab("Employees");
                          setIsNotifsOpen(false);
                        }}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md hover:bg-amber-200 transition-colors cursor-pointer"
                      >
                        <span>Resolve Bank Account</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Alert 2: Rohan Verma Time Off Request */}
                  <div className="p-2.5 rounded-xl hover:bg-purple-50/70 transition-colors flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-[#714B67] shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-slate-900">
                        Rohan Verma: 3-Day Time Off Request Pending
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Casual leave submitted for 2026-09-20. Requires manager review.
                      </p>
                      <button
                        onClick={() => {
                          setActiveNavTab("Time Off");
                          setIsNotifsOpen(false);
                        }}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#714B67] bg-purple-100/80 px-2 py-0.5 rounded-md hover:bg-purple-200 transition-colors cursor-pointer"
                      >
                        <span>Review in Time Off Hub</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Alert 3: Contract Renewal */}
                  <div className="p-2.5 rounded-xl hover:bg-blue-50/70 transition-colors flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                      <div className="font-bold text-slate-900">
                        Contract CTR-2022-101: Renewal Upcoming
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Aarav Sharma contract term expires in 30 days.
                      </p>
                      <button
                        onClick={() => {
                          setActiveNavTab("Contracts");
                          setIsNotifsOpen(false);
                        }}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md hover:bg-blue-200 transition-colors cursor-pointer"
                      >
                        <span>Inspect Contract</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Functional User Profile & Role Switcher Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="Aarav Sharma"
                  className="h-9 w-9 rounded-full border-2 border-white/60 object-cover"
                />
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#714B67]" />
              </div>

              <div className="hidden sm:block text-left text-xs leading-tight">
                <div className="font-bold text-white text-sm flex items-center gap-1">
                  <span>Aarav Sharma</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </div>
                <div className="text-[11px] text-white/80 font-medium">{currentRole}</div>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in">
                {/* User Header */}
                <div className="flex items-center gap-3 p-2 border-b border-slate-100 pb-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Aarav Sharma"
                    className="h-11 w-11 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="font-bold text-sm text-slate-900">Aarav Sharma</div>
                    <div className="text-xs text-slate-500">aarav.sharma@peoplepay360.com</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#714B67]/10 text-[#714B67]">
                      Role: {currentRole}
                    </span>
                  </div>
                </div>

                {/* Role Switcher Section */}
                <div className="py-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
                    Switch Active Persona (Odoo RBAC)
                  </div>
                  <div className="space-y-1">
                    {roles.map((r) => {
                      const isSelected = currentRole === r.role;
                      return (
                        <button
                          key={r.role}
                          onClick={() => {
                            setCurrentRole(r.role);
                            setIsProfileOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-start justify-between cursor-pointer ${
                            isSelected
                              ? "bg-[#00A09D]/10 text-[#00A09D] font-bold"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div>
                            <div className="font-bold">{r.title}</div>
                            <div className="text-[10px] text-slate-500 font-normal leading-tight">
                              {r.desc}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#00A09D] shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Quick Action: Open Sign In Modal */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      setIsAuthOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00A09D]" />
                    <span>Sign In / Switch Account Portal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
