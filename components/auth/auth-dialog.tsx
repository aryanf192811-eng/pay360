"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  X,
  Sparkles,
  Building2,
  CheckCircle2,
  KeyRound,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { UserRole } from "@/lib/mock-data";
import { login } from "@/lib/api/auth.api";
import { useAuthStore } from "@/lib/store/auth.store";

export function AuthDialog() {
  const { isAuthOpen, setIsAuthOpen, currentRole, setCurrentRole, currentCompany } = useStore();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("aarav.sharma@peoplepay360.com");
  const [password, setPassword] = useState("password123");
  const [rememberMe, setRememberMe] = useState(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthOpen) return null;

  const handleFastLogin = async (role: UserRole, userEmail: string) => {
    setEmail(userEmail);
    setPassword("password123");
    setErrorToast(null);
    try {
      setIsLoading(true);
      const data = await login(userEmail, "password123");
      setAuth(data.user as any, data.accessToken);
      setCurrentRole(role);
      
      setSuccessToast(`Signed in successfully as ${role}!`);
      setTimeout(() => {
        setSuccessToast(null);
        setIsAuthOpen(false);
      }, 1200);
    } catch (err: any) {
      setErrorToast(err.response?.data?.error?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast(null);
    try {
      setIsLoading(true);
      const data = await login(email, password);
      setAuth(data.user as any, data.accessToken);
      
      const roleStr = data.user.role.toLowerCase();
      let mappedRole: any = "Employee";
      if (roleStr.includes('admin')) mappedRole = "Admin";
      else if (roleStr.includes('manager')) mappedRole = "HR Manager";
        
      setCurrentRole(mappedRole);
      
      setSuccessToast(`Authenticated as ${mappedRole}!`);
      setTimeout(() => {
        setSuccessToast(null);
        setIsAuthOpen(false);
      }, 1200);
    } catch (err: any) {
      setErrorToast(err.response?.data?.error?.message || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 animate-in fade-in">
      <div className="bg-white rounded-lg max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200/90 relative overflow-hidden">
        {/* Subtle Decorative Ambient Glows */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-[#714B67]/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-[#00A09D]/15 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Welcome Banner */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#714B67] to-[#00A09D] text-white shadow-md mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Welcome to PeoplePay360
          </h2>
          <p className="text-xs font-semibold text-[#714B67] mt-0.5">
            Enterprise HR &amp; Payroll Operations Portal
          </p>
          <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600 border border-slate-200/60">
            <Building2 className="w-3 h-3 text-[#00A09D]" />
            <span>{currentCompany}</span>
          </div>
        </div>

        {/* Success / Error Toasts */}
        {successToast && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
        )}
        {errorToast && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <X className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorToast}</span>
          </div>
        )}

        {/* Fast 1-Click Role Switch Demo Bar */}
        <div className="mb-5 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#00A09D]" />
              <span>Fast 1-Click Role Switch</span>
            </span>
            <span className="text-slate-400 font-normal">Demo mode</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleFastLogin("Admin", "aarav.sharma@peoplepay360.com")}
              className={`px-2 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                currentRole === "Admin"
                  ? "bg-[#714B67] text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>

            <button
              type="button"
              onClick={() => handleFastLogin("HR Manager", "ananya.iyer@peoplepay360.com")}
              className={`px-2 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                currentRole === "HR Manager"
                  ? "bg-[#00A09D] text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>HR Manager</span>
            </button>

            <button
              type="button"
              onClick={() => handleFastLogin("Employee", "priya.patel@peoplepay360.com")}
              className={`px-2 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                currentRole === "Employee"
                  ? "bg-slate-800 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Employee</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
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
                placeholder="name@peoplepay360.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Password
              </label>
              <a href="#" className="text-[11px] font-semibold text-[#00A09D] hover:underline">
                Forgot password?
              </a>
            </div>
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
              disabled={isLoading}
              className="w-full h-11 relative overflow-hidden group bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[13px] transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <div className="flex items-center justify-center gap-2 relative z-10">
                  <Lock className="w-4 h-4" />
                  <span>Secure Login</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                </div>
              )}
            </button>
        </form>

        {/* Security badge footer */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Lock className="w-3 h-3 text-emerald-600" />
          <span>256-bit TLS Encrypted • Odoo Enterprise Security</span>
        </div>
      </div>
    </div>
  );
}
