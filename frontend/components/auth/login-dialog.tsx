"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  UserCheck,
  User,
  Lock,
  Mail,
  X,
  Sparkles,
  Building2,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  Check,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { UserRole } from "@/lib/mock-data";

export function LoginDialog() {
  const { isAuthOpen, setIsAuthOpen, currentRole, setCurrentRole, currentCompany } = useStore();

  const [email, setEmail] = useState("aarav.sharma@peoplepay360.com");
  const [password, setPassword] = useState("••••••••••••");
  const [rememberMe, setRememberMe] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isAuthOpen) return null;

  const handleRoleLogin = (role: UserRole, userEmail: string) => {
    setCurrentRole(role);
    setEmail(userEmail);
    setToastMessage(`Switched active session to ${role}!`);
    setTimeout(() => {
      setToastMessage(null);
      setIsAuthOpen(false);
    }, 1000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(`Authenticated as ${currentRole}!`);
    setTimeout(() => {
      setToastMessage(null);
      setIsAuthOpen(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative overflow-hidden">
        {/* Subtle Brand Ambient Glows */}
        <div className="absolute -top-24 -right-24 w-52 h-52 rounded-full bg-[#714B67]/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-52 h-52 rounded-full bg-[#00A09D]/15 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#714B67] to-[#00A09D] text-white shadow-md mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            PeoplePay360
          </h2>
          <p className="text-xs font-semibold text-[#714B67] mt-0.5">
            Odoo 18 Enterprise HR &amp; Payroll Platform
          </p>
          <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600 border border-slate-200/60">
            <Building2 className="w-3.5 h-3.5 text-[#00A09D]" />
            <span>{currentCompany}</span>
          </div>
        </div>

        {/* Feedback Alert */}
        {toastMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Three 1-Click Fast Login Demo Buttons (As requested by User) */}
        <div className="space-y-2 mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#00A09D]" />
              <span>1-Click Fast Login Demo</span>
            </span>
            <span className="text-slate-400 font-normal">Instant Switch</span>
          </div>

          <button
            type="button"
            onClick={() => handleRoleLogin("Admin", "aarav.sharma@peoplepay360.com")}
            className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between text-left cursor-pointer ${
              currentRole === "Admin"
                ? "bg-[#714B67] text-white border-[#714B67] shadow-md"
                : "bg-slate-50/80 hover:bg-slate-100/90 text-slate-800 border-slate-200/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${currentRole === "Admin" ? "bg-white/20 text-white" : "bg-[#714B67]/10 text-[#714B67]"}`}>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Login as Admin (Full Control)</div>
                <div className={`text-[10px] ${currentRole === "Admin" ? "text-white/80" : "text-slate-500"}`}>
                  Access all modules, contracts &amp; payroll batch computation
                </div>
              </div>
            </div>
            {currentRole === "Admin" && <Check className="w-4 h-4 text-white shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => handleRoleLogin("HR Manager", "ananya.iyer@peoplepay360.com")}
            className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between text-left cursor-pointer ${
              currentRole === "HR Manager"
                ? "bg-[#00A09D] text-white border-[#00A09D] shadow-md"
                : "bg-slate-50/80 hover:bg-slate-100/90 text-slate-800 border-slate-200/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${currentRole === "HR Manager" ? "bg-white/20 text-white" : "bg-[#00A09D]/10 text-[#00A09D]"}`}>
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Login as HR Manager (Leaves &amp; Profiles)</div>
                <div className={`text-[10px] ${currentRole === "HR Manager" ? "text-white/80" : "text-slate-500"}`}>
                  Manage employee records, time off approvals &amp; attendance
                </div>
              </div>
            </div>
            {currentRole === "HR Manager" && <Check className="w-4 h-4 text-white shrink-0" />}
          </button>

          <button
            type="button"
            onClick={() => handleRoleLogin("Employee", "priya.patel@peoplepay360.com")}
            className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between text-left cursor-pointer ${
              currentRole === "Employee"
                ? "bg-slate-900 text-white border-slate-900 shadow-md"
                : "bg-slate-50/80 hover:bg-slate-100/90 text-slate-800 border-slate-200/80"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${currentRole === "Employee" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"}`}>
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold">Login as Employee (Self-Service Slip)</div>
                <div className={`text-[10px] ${currentRole === "Employee" ? "text-white/80" : "text-slate-500"}`}>
                  Employee self-service, leave requests &amp; printable PDF payslip
                </div>
              </div>
            </div>
            {currentRole === "Employee" && <Check className="w-4 h-4 text-white shrink-0" />}
          </button>
        </div>

        {/* Traditional Credentials Form */}
        <form onSubmit={handleFormSubmit} className="space-y-3 pt-2 border-t border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Corporate Email ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A09D] bg-white"
                placeholder="user@peoplepay360.com"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A09D] bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-[#714B67] focus:ring-[#714B67]"
              />
              <span>Remember session</span>
            </label>
            <span className="text-[11px] text-slate-400">Odoo SSO v18</span>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#714B67] hover:bg-[#5E3D55] text-white text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Authenticate Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
