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
  Search,
  Command,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { useAuthStore } from "@/lib/store/auth.store";
import { logout as apiLogout } from "@/lib/api/auth.api";
import { motion, AnimatePresence } from "framer-motion";

export function TopBar() {
  const {
    activeNavTab,
    setActiveNavTab,
    currentRole,
    setIsAuthOpen,
    setSelectedEmployee,
    employees,
    setActiveTimeOffTab,
    setActivePayrollTab,
  } = useStore();

  const { user, clearAuth } = useAuthStore();

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
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-xl w-full border-b border-slate-200/60 px-6 h-16 flex items-center justify-between shadow-sm z-30 select-none sticky top-0">
      {/* Left: Brand Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer h-full group"
        onClick={() => setActiveNavTab("Employees")}
      >
        <img src="/logo.png" alt="PeoplePay360" className="h-8 md:h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform" />
        <div className="hidden sm:flex flex-col justify-center">
          <span className="text-xl font-black text-slate-900 tracking-tight leading-none group-hover:text-[#714B67] transition-colors">PeoplePay360</span>
          <span className="text-[10px] font-bold text-[#00A09D] uppercase tracking-widest mt-0.5">Enterprise HR</span>
        </div>
      </div>

      {/* Center Navigation: Animated Pills */}
      <div className="hidden md:flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50">
        {navTabs.map((tab) => {
          const isActive = activeNavTab === tab.key;
          const isDropdownTab = tab.key === "Employees" || tab.key === "Time Off" || tab.key === "Payroll";

          return (
            <div key={tab.key} className="relative group">
              <button
                onClick={() => setActiveNavTab(tab.key)}
                className={`relative px-4 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer text-sm font-semibold whitespace-nowrap z-10 ${
                  isActive ? "text-white" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 bg-gradient-to-r from-[#714B67] to-[#8C6081] rounded-full shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
                {tab.label}
                {isDropdownTab && (
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform group-hover:rotate-180 ${isActive ? 'text-white/80' : 'text-slate-400'}`} />
                )}
              </button>

              {/* Dropdown Menu on Hover */}
              {isDropdownTab && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-xl rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2 overflow-hidden">
                  {tab.key === "Employees" && (
                     <>
                      <button onClick={() => setActiveNavTab("Employees")} className="w-full text-left px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#714B67] font-semibold transition-colors">Employees</button>
                      <button onClick={() => setActiveNavTab("Contracts")} className="w-full text-left px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#714B67] font-semibold transition-colors">Contracts</button>
                      <button onClick={() => setActiveNavTab("Working Schedule")} className="w-full text-left px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#714B67] font-semibold transition-colors">Working Schedule</button>
                    </>
                  )}
                  {tab.key === "Time Off" && (
                    <>
                      <button onClick={() => { setActiveNavTab("Time Off"); setActiveTimeOffTab("Dashboard"); }} className="w-full text-left px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#714B67] font-semibold transition-colors">Dashboard</button>
                      <button onClick={() => { setActiveNavTab("Time Off"); setActiveTimeOffTab("Time offs"); }} className="w-full text-left px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#714B67] font-semibold transition-colors">Time offs</button>
                      <button onClick={() => { setActiveNavTab("Time Off"); setActiveTimeOffTab("Time off Types"); }} className="w-full text-left px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#714B67] font-semibold transition-colors">Time off Types</button>
                      <button onClick={() => { setActiveNavTab("Time Off"); setActiveTimeOffTab("Allocations"); }} className="w-full text-left px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#714B67] font-semibold transition-colors">Allocations</button>
                    </>
                  )}
                  {tab.key === "Payroll" && (
                    <>
                      <button onClick={() => { setActiveNavTab("Payroll"); setActivePayrollTab("Dashboard"); }} className="w-full text-left px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#714B67] font-semibold transition-colors">Dashboard</button>
                      <button onClick={() => { setActiveNavTab("Payroll"); setActivePayrollTab("Payruns"); }} className="w-full text-left px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#714B67] font-semibold transition-colors">Payruns</button>
                      <button onClick={() => { setActiveNavTab("Payroll"); setActivePayrollTab("Payslips"); }} className="w-full text-left px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#714B67] font-semibold transition-colors">Payslips</button>
                      <button onClick={() => { setActiveNavTab("Payroll"); setActivePayrollTab("Structures"); }} className="w-full text-left px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#714B67] font-semibold transition-colors">Structures</button>
                      <button onClick={() => { setActiveNavTab("Payroll"); setActivePayrollTab("Rules"); }} className="w-full text-left px-5 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#714B67] font-semibold transition-colors">Rules</button>
                    </>
                  )}
                </div>
              )}
            </div>
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
            className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white shadow-sm animate-pulse" />
          </button>

          {/* Live Alerts Popover */}
          <AnimatePresence>
            {isNotifOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-96 rounded-2xl bg-white/95 backdrop-blur-xl text-slate-900 shadow-2xl border border-slate-200/60 p-5 z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-[#714B67]/20 to-[#714B67]/5 text-[#714B67]">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
                      <span className="text-xs text-slate-500">3 items require attention</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs text-[#714B67] font-bold hover:underline cursor-pointer"
                  >
                    Mark all as read
                  </button>
                </div>

                {/* 3 Real System Alerts */}
                <div className="mt-4 space-y-3">
                  <div className="group p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 cursor-pointer text-xs">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Rahul Mishra: Missing Bank Details</div>
                        <p className="text-slate-500 mt-1">Direct NEFT transfer will fail during September batch payout.</p>
                        <button className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 group-hover:underline">
                          Resolve Issue <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="group p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 cursor-pointer text-xs">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-purple-100 text-[#714B67] rounded-lg shrink-0 mt-0.5">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Rohan Verma: Time-Off Request</div>
                        <p className="text-slate-500 mt-1">Casual vacation submitted for Sep 2026. Awaiting your approval.</p>
                        <button className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#714B67] group-hover:underline">
                          Review Request <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="group p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100 cursor-pointer text-xs">
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">Contract Renewal Upcoming</div>
                        <p className="text-slate-500 mt-1">Aarav Sharma's contract term renewal is scheduled in 30 days.</p>
                        <button className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 group-hover:underline">
                          View Contract <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-slate-200 mx-1 hidden md:block"></div>

        {/* User Avatar & Settings Dropdown */}
        <div className="relative" ref={settingsRef}>
          <div
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="flex items-center gap-3 pl-2 cursor-pointer group"
          >
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {user?.email?.split('@')[0] || "Admin"}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 rounded-sm mt-0.5">
                {currentRole}
              </span>
            </div>
            <div className="w-9 h-9 rounded-full border border-slate-200 overflow-hidden bg-slate-100 group-hover:ring-2 group-hover:ring-[#714B67]/30 transition-all shadow-sm">
              <img
                src={`https://ui-avatars.com/api/?name=${user?.email?.split('@')[0] || 'Admin'}&background=714B67&color=fff`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <AnimatePresence>
            {isSettingsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-3 w-64 rounded-2xl bg-white/95 backdrop-blur-xl text-slate-900 shadow-2xl border border-slate-200/60 p-2 z-50"
              >
                <div className="px-4 py-3 border-b border-slate-100 mb-2">
                  <p className="text-sm font-bold text-slate-900">
                    {user?.email?.split('@')[0] || "Admin User"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{user?.email || "admin@peoplepay360.com"}</p>
                </div>
                <div className="space-y-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#714B67] rounded-xl font-medium flex items-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4" /> My Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#714B67] rounded-xl font-medium flex items-center gap-2 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" /> Roles & Permissions
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-[#714B67] rounded-xl font-medium flex items-center gap-2 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" /> What's New
                  </button>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={async () => {
                      if (user) {
                        try {
                          await apiLogout();
                        } catch (e) {
                          console.error(e);
                        }
                      }
                      clearAuth();
                      setIsSettingsOpen(false);
                      setIsAuthOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-xl font-bold flex items-center gap-2 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
