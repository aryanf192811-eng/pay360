"use client";

import React from "react";
import { ShieldCheck, Building2, Terminal } from "lucide-react";

export function EnterpriseFooter() {
  return (
    <footer className="mt-auto bg-white border-t border-slate-200 py-5 px-6 select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-800">PeoplePay360 Enterprise ERP</span>
          <span>•</span>
          <span className="text-[#714B67] font-semibold">Odoo 18 Compatible</span>
          <span>•</span>
          <span className="text-slate-600">Gandhinagar Edition</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Statutory Compliance Engine Active</span>
          </span>
          <span>•</span>
          <span>Version 18.0.4 Enterprise</span>
        </div>
      </div>
    </footer>
  );
}
