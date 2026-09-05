"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Sparkles,
  ExternalLink,
  AlertTriangle,
  Calendar,
  FileText,
  User,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { useStore } from "@/lib/store-context";

export function TopBar() {
  const {
    activeNavTab,
    setActiveNavTab,
    currentRole,
    setIsAuthOpen,
    setSelectedEmployee,
    employees,
  } = useStore();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navTabs = [
    { key: "Employees", label: "Employees" },
    { key: "Contracts", label: "Contracts" },
    { key: "Attendance", label: "Attendance" },
    { key: "Time Off", label: "Time Off" },
    { key: "Payroll", label: "Payroll" },
    { key: "Reports", label: "Reports" },
  ];

  return (
    <nav className="bg-white w-full border-b border-slate-200 px-6 h-16 flex items-center justify-between shadow-sm z-30 select-none">
      {/* Left: Bold Brand Mark */}
      <div
        className="flex items-center gap-2 cursor-pointer h-full"
        onClick={() => setActiveNavTab("Employees")}
      >
        <div className="bg-[#714B67] text-white p-1.5 rounded-md flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="font-bold text-base text-slate-900 tracking-tight">
          PeoplePay360
        </div>
      </div>

      {/* Center Navigation: Flat Text Links with Bottom Border (Excalidraw style) */}
      <div className="flex items-center h-full gap-6">
        {navTabs.map((tab) => {
          const isActive = activeNavTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveNavTab(tab.key)}
              className={`h-full flex items-center transition-colors cursor-pointer text-sm whitespace-nowrap border-b-2 px-1 ${
                isActive
                  ? "border-[#714B67] text-[#714B67] font-semibold"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 font-medium"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right Profile & Quick Actions */}
      <div className="flex items-center gap-4 h-full">
        {/* Notification Bell with Dynamic Badge */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="System Alerts"
            className="relative p-2 rounded-xl bg-slate-100/90 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
          </button>

          {/* Live Alerts Popover */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-96 rounded-3xl bg-white text-slate-900 shadow-2xl border border-slate-200/90 p-4 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#714B67]/10 text-[#714B67]">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                      Live Operational Alerts
                    </h4>
                    <span className="text-[10px] text-slate-400">3 items require attention</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs text-[#00A09D] font-bold hover:underline cursor-pointer"
                >
                  Dismiss
                </button>
              </div>

              {/* 3 Real System Alerts */}
              <div className="divide-y divide-slate-100 mt-2 space-y-2">
                {/* Alert 1 */}
                <div className="pt-2 text-xs">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">
                        Rahul Mishra: Bank Account &amp; IFSC Missing
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Direct NEFT transfer will fail during September batch payout.
                      </p>
                      <button
                        onClick={() => {
                          const rahul = employees.find((e) => e.id === "EMP-103");
                          if (rahul) setSelectedEmployee(rahul);
                          setActiveNavTab("Employees");
                          setIsNotifOpen(false);
                        }}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200 cursor-pointer"
                      >
                        <span>Resolve Bank Details</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Alert 2 */}
                <div className="pt-2 text-xs">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-[#714B67] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">
                        Rohan Verma: 3-Day Time-Off Pending
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Casual vacation submitted for Sep 2026. Awaiting approval.
                      </p>
                      <button
                        onClick={() => {
                          setActiveNavTab("Time Off");
                          setIsNotifOpen(false);
                        }}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#714B67] bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200 cursor-pointer"
                      >
                        <span>Review in Time Off</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Alert 3 */}
                <div className="pt-2 text-xs">
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-slate-900">
                        Contract CTR-2022-101: Renewal Upcoming
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Aarav Sharma contract term renewal scheduled in 30 days.
                      </p>
                      <button
                        onClick={() => {
                          setActiveNavTab("Contracts");
                          setIsNotifOpen(false);
                        }}
                        className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200 cursor-pointer"
                      >
                        <span>Inspect Contract</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Management Settings Dropdown */}
        <div className="relative" ref={settingsRef}>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#714B67]" />
            <span className="hidden sm:inline">Users & Settings</span>
            <span className="sm:hidden">Users</span>
            <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400" />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-bold text-slate-900">System Administration</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Manage roles and permissions</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setActiveNavTab("User Management");
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors flex items-center gap-2"
                >
                  <User className="w-3.5 h-3.5" />
                  User Management
                </button>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-md transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Security Settings
                </button>
              </div>
              <div className="p-1.5 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                >
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar with Green Online Ring & Role Badge */}
        <div
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="flex items-center gap-2.5 pl-1 cursor-pointer group"
          title="Click to Open Settings"
        >
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
              alt="Aarav Sharma"
              className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs group-hover:scale-105 transition-transform"
            />
            {/* Green Online Ring */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-900 group-hover:text-[#714B67] transition-colors leading-tight">
              Aarav Sharma
            </div>
            <div className="mt-0.5">
              <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-[#714B67]/10 text-[#714B67] border border-[#714B67]/20">
                {currentRole}
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
