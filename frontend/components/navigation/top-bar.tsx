"use client";

import React from "react";
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
} from "lucide-react";
import { useStore } from "@/lib/store-context";

export function TopBar() {
  const { activeNavTab, setActiveNavTab, employees, timeOff, contracts, currentRole, setCurrentRole } = useStore();

  const pendingLeavesCount = timeOff.filter((t) => t.status === "Pending").length;

  const navItems = [
    { name: "Employees", icon: Users, count: employees.length },
    { name: "Contracts", icon: FileText, count: contracts.length },
    { name: "Attendance", icon: Clock },
    { name: "Time Off", icon: Calendar, badge: pendingLeavesCount > 0 ? `${pendingLeavesCount} Pending` : undefined },
    { name: "Payroll", icon: CreditCard },
    { name: "Reports", icon: BarChart3, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#714B67] text-white shadow-md select-none">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Section: Brand & Odoo App Switcher */}
        <div className="flex items-center gap-4">
          <button
            title="Odoo App Launcher"
            className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            <LayoutGrid className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveNavTab("Employees")}>
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

          {/* Module Navigation Tabs (Upgraded to text-sm font-medium) */}
          <nav className="hidden lg:flex items-center ml-5 space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNavTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveNavTab(item.name)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
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
        <div className="flex items-center gap-3.5">
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

          {/* Company Selector */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium text-white/90 hover:bg-white/15 cursor-pointer border border-white/10">
            <Building2 className="h-4 w-4 text-[#00A09D]" />
            <span className="font-semibold">PeoplePay360 Corp (IN)</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-70" />
          </div>

          {/* Notification Bell */}
          <button
            title="Notifications & Alerts"
            className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#00A09D] ring-2 ring-[#714B67]" />
          </button>

          {/* Role Switcher (Official 5 User Roles from Hackathon Spec) */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/15 border border-white/20 text-xs font-semibold text-white">
            <ShieldCheck className="h-4 w-4 text-[#00A09D]" />
            <span className="hidden sm:inline text-white/80">Role:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as any)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              <option value="Admin" className="text-slate-900 font-bold">Admin (Full Access)</option>
              <option value="HR Payroll Manager" className="text-slate-900 font-bold">HR Payroll Manager</option>
              <option value="HR Payroll User" className="text-slate-900 font-bold">HR Payroll User</option>
              <option value="HR Manager" className="text-slate-900 font-bold">HR Manager</option>
              <option value="Employee" className="text-slate-900 font-bold">Employee (Self-Service)</option>
            </select>
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/20">
            <div className="relative cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="HR Admin"
                className="h-9 w-9 rounded-full border-2 border-white/50 object-cover"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#714B67]" />
            </div>
            <div className="hidden sm:block text-left text-xs leading-tight">
              <div className="font-bold text-white text-sm">Aarav Sharma</div>
              <div className="text-xs text-white/80 font-medium">{currentRole}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
