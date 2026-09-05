"use client";

import React, { useState, useEffect } from "react";
import { Mail, Lock, CheckCircle2, ShieldCheck, ArrowRight, Check, Loader2, X } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { login } from "@/lib/api/auth.api";
import { useAuthStore } from "@/lib/store/auth.store";

export function LoginDialog() {
  const {
    isAuthOpen,
    setIsAuthOpen,
    setCurrentRole,
    setActiveNavTab,
  } = useStore();

  const { isAuthenticated, setAuth } = useAuthStore();

  const [email, setEmail] = useState("alice.admin@example.com");
  const [password, setPassword] = useState("SeedPass1!");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Reset Password Flow State
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // Carousel State
  const images = [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80",
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1920&q=80"
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isAuthenticated) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated, images.length]);

  const isGateMode = !isAuthenticated;

  if (!isGateMode && !isAuthOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorToast(null);
    try {
      setIsLoading(true);
      const data = await login(email, password);
      setAuth(data.user as any, data.accessToken);
      
      // Map the role for the UI components that still expect specific strings
      const roleStr = data.user.role.toLowerCase();
      if (roleStr.includes('admin')) setCurrentRole("Admin" as any);
      else if (roleStr.includes('manager')) setCurrentRole("HR Manager" as any);
      else setCurrentRole("Employee" as any);

      setActiveNavTab("Employees");
      setToastMessage(`Authenticating...`);
      setTimeout(() => {
        setToastMessage(null);
        setIsAuthOpen(false);
      }, 900);
    } catch (err: any) {
      setErrorToast(err.response?.data?.error?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[PeoplePay360 Auth] Your OTP is: ${generatedOtp}`);
    setOtpSent(true);
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    alert("OTP Verified (Demo). You can now reset your password.");
    setIsResetMode(false);
    setOtpSent(false);
    setOtp("");
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        isGateMode
          ? "bg-white" // Full screen for gate mode
          : "bg-slate-900/50 animate-in fade-in p-4" // Overlay for dialog mode
      }`}
    >
      <div className={`${isGateMode ? "w-full h-full flex" : "bg-white rounded-lg max-w-[500px] w-full shadow-lg border border-slate-200 relative overflow-hidden"}`}>
        
        {/* Left Side Image Carousel (Only visible in Gate Mode on Desktop) */}
        {isGateMode && (
          <div className="hidden lg:flex w-1/2 relative items-center justify-center overflow-hidden bg-black">
            {/* Dark overlay instead of pink, so text is readable */}
            <div className="absolute inset-0 bg-black/40 z-10 transition-all duration-1000" />
            
            {images.map((src, idx) => (
              <img 
                key={idx}
                src={src} 
                alt={`Corporate Office ${idx + 1}`} 
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                  idx === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            
            <div className="relative z-20 text-white p-12 max-w-xl text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md mb-8 shadow-lg border border-white/20">
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-black mb-6 drop-shadow-md">PeoplePay360</h1>
              <p className="text-xl text-white/90 leading-relaxed font-medium drop-shadow-sm">
                The integrated Human Resource and Payroll Operations Platform designed for modern enterprise efficiency.
              </p>
            </div>
          </div>
        )}

        {/* Right Side Form */}
        <div className={`${isGateMode ? "w-full lg:w-1/2 flex items-center justify-center p-8 bg-white" : "p-8 w-full bg-[#F4F6FA]"}`}>
          <div className={`w-full max-w-[480px] ${isGateMode ? "p-4 sm:p-8" : "bg-white p-10 sm:p-12 rounded-xl shadow-sm border border-slate-200"}`}>
            {/* Header Branding */}
            <div className="text-center mb-10">
              {!isGateMode && (
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#714B67] text-white shadow-md mb-6">
                  <ShieldCheck className="w-8 h-8" />
                </div>
              )}
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {isResetMode ? "Reset Password" : "Welcome Back"}
              </h2>
              <p className="text-base font-medium text-slate-500 mt-2">
                {isResetMode ? "We'll send a code to your email." : "Sign in to Odoo Enterprise HRMS"}
              </p>
            </div>

              {errorToast && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <X className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorToast}</span>
                </div>
              )}

            {/* Form Area */}
            {!isResetMode ? (
              <form onSubmit={handleFormSubmit} className="space-y-6">
                {/* Standard Email Input */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-base rounded-lg focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all"
                      required
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>

                {/* Standard Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-slate-700">
                      Password
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setIsResetMode(true)}
                      className="text-sm text-[#00A09D] hover:underline font-bold"
                    >
                      Reset Password
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-base rounded-lg focus:outline-none focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67] transition-all"
                      required
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 relative overflow-hidden group bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[13px] transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center mt-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <Lock className="w-4 h-4" />
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                    </div>
                  )}
                </button>
              </form>
            ) : (
              // Reset Password Flow
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                {!otpSent ? (
                  <form onSubmit={handleSendOTP} className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Registered Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-base rounded-lg focus:outline-none focus:border-[#00A09D] focus:ring-1 focus:ring-[#00A09D] transition-all"
                          required
                        />
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-[#00A09D] hover:bg-[#008A87] text-white text-base font-black rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <span>Send OTP Code</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-emerald-900">OTP Sent Successfully</p>
                        <p className="text-xs text-emerald-700 mt-1">Please check your console logs for the demo OTP code.</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Enter 6-Digit OTP
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="••••••"
                        maxLength={6}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-center text-2xl tracking-[0.5em] font-black text-slate-900 rounded-lg focus:outline-none focus:border-[#00A09D] focus:ring-1 focus:ring-[#00A09D] transition-all"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 relative overflow-hidden group bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-[13px] transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center mt-6"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <div className="flex items-center justify-center gap-2 relative z-10">
                          <Check className="w-4 h-4" />
                          <span>Verify & Reset</span>
                        </div>
                      )}
                    </button>
                  </form>
                )}

                <div className="text-center pt-2">
                  <button 
                    onClick={() => {
                      setIsResetMode(false);
                      setOtpSent(false);
                      setOtp("");
                    }}
                    className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success Toast Overlay */}
        {toastMessage && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm animate-in zoom-in-95 duration-200">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
            <h3 className="text-2xl font-black text-slate-900">{toastMessage}</h3>
            <p className="text-base font-medium text-slate-500 mt-2 text-center max-w-[300px]">
              Initializing PeoplePay360 Workspace...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
