"use client";

import React from "react";
import { ShieldCheck, Cpu } from "lucide-react";

export function EnterpriseFooter() {
  return (
    <footer className="mt-auto bg-white/85 backdrop-blur-md border-t border-slate-200/80 py-4 px-6 select-none z-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
        {/* Left Section */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">PeoplePay360 Enterprise</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">Connected HR, Attendance &amp; Payroll Engine</span>
        </div>

        {/* Center Section */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-[#714B67]">Odoo 18 Compatible</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">Built for Odoo Hackathon Gandhinagar</span>
        </div>

        {/* Right Section: Real-time operational latency badge */}
        <div className="flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>All Systems Operational</span>
            <span className="text-emerald-300">|</span>
            <span>Next Cycle: Sep 30, 2026</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
