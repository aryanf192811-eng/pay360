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
  Briefcase,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { UserRole } from "@/lib/mock-data";

interface RoleConfig {
  role: UserRole;
  label: string;
  desc: string;
  email: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}

export function LoginDialog() {
  const {
    isAuthOpen,
    setIsAuthOpen,
    currentRole,
    setCurrentRole,
    currentCompany,
    isAuthenticated,
    setIsAuthenticated,
  } = useStore();

  const [email, setEmail] = useState("aarav.sharma@peoplepay360.com");
  const [password, setPassword] = useState("••••••••••••");
  const [rememberMe, setRememberMe] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show as full-screen gate when NOT yet authenticated, or as a dialog overlay when already in
  const isGateMode = !isAuthenticated;

  if (!isGateMode && !isAuthOpen) return null;

  const roleConfigs: RoleConfig[] = [
    {
      role: "Admin",
      label: "Admin (Full System Access)",
      desc: "All modules, user management, payroll, configurations",
      email: "aarav.sharma@peoplepay360.com",
      color: "bg-[#714B67] text-white border-[#714B67] shadow-md",
      bg: "bg-[#714B67]/10 text-[#714B67]",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      role: "HR Payroll Manager",
      label: "HR Payroll Manager",
      desc: "Full CRUD on Payruns, Payslips, Salary Structures & Rules",
      email: "priya.patel@peoplepay360.com",
      color: "bg-indigo-600 text-white border-indigo-600 shadow-md",
      bg: "bg-indigo-50 text-indigo-700",
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      role: "HR Payroll User",
      label: "HR Payroll User",
      desc: "Create & manage Payruns, Payslips; read-only Salary Structures",
      email: "rohan.verma@peoplepay360.com",
      color: "bg-[#00A09D] text-white border-[#00A09D] shadow-md",
      bg: "bg-[#00A09D]/10 text-[#00A09D]",
      icon: <Lock className="w-4 h-4" />,
    },
    {
      role: "HR Manager",
      label: "HR Manager (Leaves & Profiles)",
      desc: "Employees, Contracts, Attendance, Working Schedules, Time Off; no payroll access",
      email: "ananya.iyer@peoplepay360.com",
      color: "bg-purple-600 text-white border-purple-600 shadow-md",
      bg: "bg-purple-50 text-purple-700",
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      role: "Employee",
      label: "Employee (Self-Service)",
      desc: "Own profile, attendance entries, leave requests, printable payslip",
      email: "rahul.mishra@peoplepay360.com",
      color: "bg-slate-900 text-white border-slate-900 shadow-md",
      bg: "bg-slate-100 text-slate-700",
      icon: <User className="w-4 h-4" />,
    },
  ];

  const handleRoleLogin = (rc: RoleConfig) => {
    setCurrentRole(rc.role);
    setEmail(rc.email);
    setToastMessage(`Session started as ${rc.role}!`);
    setTimeout(() => {
      setToastMessage(null);
      setIsAuthenticated(true);
      setIsAuthOpen(false);
    }, 900);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(`Authenticated as ${currentRole}!`);
    setTimeout(() => {
      setToastMessage(null);
      setIsAuthenticated(true);
      setIsAuthOpen(false);
    }, 900);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isGateMode
          ? "bg-[#F4F6FA]"
          : "bg-slate-900/50 backdrop-blur-md animate-in fade-in"
      }`}
    >
      {/* Gate-mode: subtle ambient glows behind the card */}
      {isGateMode && (
        <>
          <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-[#714B67]/12 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#00A09D]/10 blur-3xl pointer-events-none" />
        </>
      )}

      <div className="bg-white/98 backdrop-blur-2xl rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200/80 relative overflow-hidden">
        {/* Subtle Brand Ambient Glows inside card */}
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-[#714B67]/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-[#00A09D]/10 blur-2xl pointer-events-none" />

        <div className="relative p-6 sm:p-8">
          {/* Close Button — only when not gate mode */}
          {!isGateMode && (
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header Branding */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#714B67] to-[#00A09D] text-white shadow-lg mb-3">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">PeoplePay360</h2>
            <p className="text-xs font-semibold text-[#714B67] mt-0.5">
              Odoo 18 Enterprise — HR &amp; Payroll Platform
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

          {/* Five Role Login Buttons (PDF Section 3) */}
          <div className="space-y-2 mb-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between mb-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#00A09D]" />
                <span>1-Click Fast Login — Select Your Role</span>
              </span>
              <span className="text-slate-400 font-normal normal-case">PDF §3 Roles</span>
            </div>

            {roleConfigs.map((rc) => {
              const isActive = currentRole === rc.role;
              return (
                <button
                  key={rc.role}
                  type="button"
                  onClick={() => handleRoleLogin(rc)}
                  className={`w-full p-3 rounded-2xl border-2 transition-all flex items-center justify-between text-left cursor-pointer ${
                    isActive ? rc.color : "bg-slate-50/80 hover:bg-slate-100/90 text-slate-800 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isActive ? "bg-white/20 text-white" : rc.bg}`}>
                      {rc.icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{rc.label}</div>
                      <div className={`text-[10px] mt-0.5 leading-tight ${isActive ? "text-white/80" : "text-slate-500"}`}>
                        {rc.desc}
                      </div>
                    </div>
                  </div>
                  {isActive && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          {/* Traditional Credentials Form */}
          <form onSubmit={handleFormSubmit} className="space-y-3 pt-3 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Or sign in with credentials
            </div>
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
              <span>Authenticate &amp; Enter Platform</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
