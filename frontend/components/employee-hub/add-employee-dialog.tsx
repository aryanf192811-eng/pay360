"use client";

import React, { useState } from "react";
import { X, UserPlus, Calculator, Building, CreditCard, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { calculateSalaryBreakdown } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";

export function AddEmployeeDialog() {
  const { isAddEmployeeOpen, setIsAddEmployeeOpen, addEmployee } = useStore();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91 98");
  const [role, setRole] = useState("Software Engineer");
  const [department, setDepartment] = useState<"Engineering" | "Product" | "Human Resources" | "Sales">("Engineering");
  const [manager, setManager] = useState("Aarav Sharma (VP Eng)");
  const [monthlyCTC, setMonthlyCTC] = useState<number>(75000);
  const [bankName, setBankName] = useState("HDFC Bank");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("HDFC0001234");
  const [status, setStatus] = useState<"Active" | "On Leave">("Active");

  if (!isAddEmployeeOpen) return null;

  const salary = calculateSalaryBreakdown(monthlyCTC, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addEmployee({
      name,
      email,
      phone,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
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
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto select-none">
      <div
        onClick={() => setIsAddEmployeeOpen(false)}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-[#714B67] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/10">
                <UserPlus className="w-5 h-5 text-[#00A09D]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Create New Employee & Contract</h3>
                <p className="text-[11px] text-white/80">
                  Initializes master record, active contract, and statutory rules in PeoplePay360
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddEmployeeOpen(false)}
              className="p-1 rounded text-white/70 hover:text-white hover:bg-white/15 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-slate-800">
            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikramaditya Sen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. v.sen@peoplepay360.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title (Role) *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department *</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Manager</label>
                <input
                  type="text"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                />
              </div>
            </div>

            {/* Compensation & Live Salary Calculator */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Calculator className="w-4 h-4 text-[#714B67]" />
                  <span>Monthly Compensation & Salary Rules Preview</span>
                </div>
                <div className="text-[11px] text-slate-500">Auto-Computed Rules</div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Agreed Monthly CTC: <span className="font-bold text-[#714B67]">{formatINR(monthlyCTC)}</span>
                </label>
                <input
                  type="range"
                  min="30000"
                  max="200000"
                  step="5000"
                  value={monthlyCTC}
                  onChange={(e) => setMonthlyCTC(Number(e.target.value))}
                  className="w-full accent-[#714B67]"
                />
              </div>

              <div className="grid grid-cols-4 gap-2 text-center bg-white p-2.5 rounded-lg border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Basic (50%)</span>
                  <span className="font-bold text-slate-800">{formatINR(salary.basic)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">HRA (20%)</span>
                  <span className="font-bold text-slate-800">{formatINR(salary.hra)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">PF (12%)</span>
                  <span className="font-bold text-rose-600">- {formatINR(salary.pf)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Net Pay</span>
                  <span className="font-black text-[#00A09D]">{formatINR(salary.netPay)}</span>
                </div>
              </div>
            </div>

            {/* Banking Details */}
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <CreditCard className="w-4 h-4 text-[#00A09D]" />
                <span>Banking Disbursement Details (Optional)</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">Account Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 50100492812"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[11px] mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddEmployeeOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#00A09D] hover:bg-[#008A87] text-white rounded-lg font-bold shadow-sm transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Create Employee & Contract</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
