"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Calculator, Building, CreditCard, ShieldCheck, ChevronRight, ChevronLeft, CheckCircle2, UploadCloud, FileText as FileTextIcon } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { calculateSalaryBreakdown } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";

export function AddEmployeeDialog() {
  const { isAddEmployeeOpen, setIsAddEmployeeOpen, addEmployee } = useStore();

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState<"Engineering" | "Product" | "Human Resources" | "Sales">("Engineering");
  const [manager, setManager] = useState("");
  
  const [monthlyCTC, setMonthlyCTC] = useState<number>(75000);
  
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [status, setStatus] = useState<"Active" | "On Leave">("Active");

  // Document Upload State Feature
  const [uploadedDocs, setUploadedDocs] = useState<{name: string, size: string}[]>([]);

  if (!isAddEmployeeOpen) return null;

  const salary = calculateSalaryBreakdown(monthlyCTC, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < totalSteps) {
      setStep(step + 1);
      return;
    }

    if (!name || !email) return;

    setIsSubmitting(true);
    try {
      await addEmployee({
        name,
        email,
        phone,
        avatar: avatarUrl || `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
        role,
        department,
        manager,
        status,
        monthlyCTC,
        workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
        bankDetails: {
          accountNumber,
          bankName,
          ifscCode,
          isVerified: !!(accountNumber && ifscCode),
        },
        panNumber: "NEWPN1234Z",
        uanNumber: "101999888777",
      });
      
      setIsAddEmployeeOpen(false);
      setTimeout(() => {
        setStep(1);
        setName("");
        setEmail("");
        setAvatarUrl("");
        setPhone("");
        setIsSubmitting(false);
      }, 300);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto select-none flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsAddEmployeeOpen(false)}
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#714B67] to-[#5C3D54] text-white px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 shadow-sm border border-white/5">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Create New Employee</h3>
              <p className="text-xs text-white/80 mt-0.5">
                Step {step} of {totalSteps}: {step === 1 ? 'Personal Info' : step === 2 ? 'Contract & Compensation' : 'Banking & Compliance'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddEmployeeOpen(false)}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="px-8 pt-6 pb-2">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                  step >= s ? "bg-[#714B67] text-white shadow-sm" : "bg-slate-100 text-slate-400"
                }`}>
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 rounded-full transition-colors ${
                    step > s ? "bg-[#714B67]" : "bg-slate-100"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-8 min-h-[360px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                  <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                    <UserPlus className="w-4 h-4 text-[#714B67]" /> Personal & Organizational Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                      <input
                        type="text" required
                        placeholder="e.g. Vikramaditya Sen"
                        value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Work Email *</label>
                      <input
                        type="email" required
                        placeholder="e.g. v.sen@peoplepay360.com"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Job Title *</label>
                      <input
                        type="text" required
                        value={role} onChange={(e) => setRole(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Profile Picture URL (Optional)</label>
                      <div className="flex gap-3">
                        {avatarUrl ? (
                          <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden shrink-0 bg-white">
                            <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full border border-slate-200 border-dashed shrink-0 bg-slate-50 flex items-center justify-center text-slate-400">
                            <UploadCloud className="w-4 h-4" />
                          </div>
                        )}
                        <input
                          type="url"
                          placeholder="e.g. https://example.com/photo.jpg"
                          value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Department *</label>
                      <select
                        value={department} onChange={(e) => setDepartment(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                      >
                        <option value="Engineering">Engineering</option>
                        <option value="Product">Product</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Sales">Sales</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                   <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                    <Calculator className="w-4 h-4 text-[#714B67]" /> Compensation Simulator
                  </h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Monthly Gross CTC (₹) *</label>
                    <input
                      type="number" required
                      min={10000} step={1000}
                      value={monthlyCTC} onChange={(e) => setMonthlyCTC(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                    />
                  </div>
                  
                  {/* Real-time Simulator */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-4">
                    <h5 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Odoo 18 Simulated Salary Breakdown
                    </h5>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Basic (50%)</span>
                          <span className="font-semibold">{formatINR(salary.basic)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">HRA (40% of Basic)</span>
                          <span className="font-semibold">{formatINR(salary.hra)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Special Allowance</span>
                          <span className="font-semibold">{formatINR(salary.specialAllowance)}</span>
                        </div>
                      </div>
                      <div className="space-y-2 border-l border-slate-200 pl-4">
                        <div className="flex justify-between text-rose-700">
                          <span>PF Deduction</span>
                          <span>-{formatINR(salary.pf)}</span>
                        </div>
                        <div className="flex justify-between text-rose-700">
                          <span>TDS Estimate</span>
                          <span>-{formatINR(salary.tds)}</span>
                        </div>
                        <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
                          <span>Net In-Hand</span>
                          <span className="text-emerald-700">{formatINR(salary.netPay)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                   <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
                    <CreditCard className="w-4 h-4 text-[#714B67]" /> Bank & Compliance Settings
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Bank Name</label>
                      <input
                        type="text"
                        value={bankName} onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Account Number</label>
                      <input
                        type="text"
                        value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">IFSC Code</label>
                      <input
                        type="text"
                        value={ifscCode} onChange={(e) => setIfscCode(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Initial Status</label>
                      <select
                        value={status} onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                      >
                        <option value="Active">Active</option>
                        <option value="On Leave">On Leave</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Document Upload Area */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <UploadCloud className="w-4 h-4 text-[#714B67]" /> Upload Verification Documents
                    </label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 hover:border-[#714B67]/40 transition-colors cursor-pointer"
                         onClick={() => {
                           // Mock file upload
                           if (uploadedDocs.length < 2) {
                             const mockDocs = [{name: 'pan_card_copy.pdf', size: '1.2 MB'}, {name: 'cancelled_check.png', size: '840 KB'}];
                             setUploadedDocs([...uploadedDocs, mockDocs[uploadedDocs.length]]);
                           }
                         }}>
                      <div className="p-3 bg-white shadow-sm rounded-full mb-3 text-[#00A09D]">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-700">Click to upload or drag & drop</p>
                      <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG or PDF (max. 5MB)</p>
                    </div>
                    
                    {/* File List */}
                    {uploadedDocs.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uploadedDocs.map((doc, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-[#714B67]/10 rounded-md text-[#714B67]">
                                <FileTextIcon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-700">{doc.name}</p>
                                <p className="text-[10px] text-slate-500">{doc.size}</p>
                              </div>
                            </div>
                            <button type="button" onClick={() => setUploadedDocs(uploadedDocs.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-rose-500 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="bg-slate-50 px-8 py-5 border-t border-slate-200 flex items-center justify-between rounded-b-2xl">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div /> // Spacer
            )}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 px-6 py-2.5 bg-[#714B67] hover:bg-[#5C3D54] text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                 <span className="flex items-center gap-2">Creating... <UploadCloud className="w-4 h-4 animate-bounce" /></span>
              ) : step < totalSteps ? (
                <>Next Step <ChevronRight className="w-4 h-4" /></>
              ) : (
                <>Create Employee <CheckCircle2 className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
