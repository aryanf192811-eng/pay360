"use client";

import React, { useState } from "react";
import {
  X,
  Printer,
  Mail,
  Building2,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  FileCheck,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { formatINR, amountInWords } from "@/lib/utils";

export function PayslipModal() {
  const { selectedPayslip, setSelectedPayslip } = useStore();
  const [emailSuccess, setEmailSuccess] = useState(false);

  if (!selectedPayslip) return null;

  const slip = selectedPayslip;

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    setEmailSuccess(true);
    setTimeout(() => setEmailSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto select-none bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Top Actions Ribbon (Hidden during print) */}
        <div className="bg-[#714B67] text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-[#00A09D]" />
            <span className="font-bold text-sm">Payslip Document Preview: {slip.id}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleEmail}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00A09D] hover:bg-[#008A87] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Mail className="w-4 h-4" />
              <span>Email Payslip</span>
            </button>
            <button
              onClick={() => setSelectedPayslip(null)}
              className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {emailSuccess && (
          <div className="bg-emerald-50 text-emerald-800 px-6 py-3 border-b border-emerald-200 text-sm font-semibold flex items-center gap-2 print:hidden animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Payslip PDF successfully dispatched to {slip.email}!</span>
          </div>
        )}

        {/* PRINTABLE SLIP CONTAINER */}
        <div className="p-8 space-y-6 text-slate-800 text-sm bg-white" id="printable-payslip">
          {/* Header Section */}
          <div className="border-b-2 border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#714B67] text-white font-black text-sm">
                  P360
                </div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">
                  PeoplePay360 Solutions Pvt Ltd
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                CIN: U72200GJ2022PTC123456 • GSTIN: 24AAACP1234F1Z8
              </p>
              <p className="text-xs text-slate-500 font-medium">
                Infocity, IT Tower 3, Gandhinagar, Gujarat - 382007, India
              </p>
            </div>

            <div className="sm:text-right">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#714B67] bg-purple-50 px-3 py-1 rounded-md border border-purple-200 inline-block">
                SALARY PAYSLIP
              </span>
              <div className="text-sm font-bold text-slate-900 mt-2">
                Period: {slip.period}
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Slip No: {slip.id}
              </div>
            </div>
          </div>

          {/* Employee & Bank Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 text-sm">
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block">
                Employee Name
              </span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">{slip.employeeName}</span>
              <span className="text-xs text-slate-500 block font-mono">ID: {slip.employeeId}</span>
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block">
                Position &amp; Dept
              </span>
              <span className="font-semibold text-slate-800 text-sm block mt-0.5">{slip.employeeRole}</span>
              <span className="text-xs text-slate-500 block">{slip.department}</span>
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block">
                Bank &amp; Account
              </span>
              {slip.hasBankWarning ? (
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md inline-block mt-0.5 border border-amber-300">
                  MISSING (A/c Unlinked)
                </span>
              ) : (
                <>
                  <span className="font-semibold text-slate-800 text-sm block mt-0.5">{slip.bankName}</span>
                  <span className="text-xs text-slate-500 font-mono block">
                    •••• •••• {slip.bankAccount.slice(-4)}
                  </span>
                </>
              )}
            </div>

            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block">
                Statutory / Days
              </span>
              <span className="text-xs text-slate-700 font-mono block mt-0.5">
                PAN: {slip.panNumber}
              </span>
              <span className="text-xs text-slate-700 font-medium block">
                Worked Days: {slip.workedDays} / 30
              </span>
            </div>
          </div>

          {/* Two-Column Salary Rules Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left Column: Earnings */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-700 text-xs flex justify-between uppercase tracking-wider">
                <span>EARNINGS</span>
                <span>AMOUNT (INR)</span>
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Basic Salary (50%)</span>
                  <span className="font-semibold text-slate-900">{formatINR(slip.basic)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">House Rent Allowance (HRA 20%)</span>
                  <span className="font-semibold text-slate-900">{formatINR(slip.hra)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Special Allowance</span>
                  <span className="font-semibold text-slate-900">{formatINR(slip.specialAllowance)}</span>
                </div>
              </div>
              <div className="bg-purple-50/70 border-t border-purple-200 px-4 py-3 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Gross Salary (A)</span>
                <span className="text-base font-black">{formatINR(slip.gross)}</span>
              </div>
            </div>

            {/* Right Column: Deductions */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-4 py-2.5 font-bold text-slate-700 text-xs flex justify-between uppercase tracking-wider">
                <span>DEDUCTIONS</span>
                <span>AMOUNT (INR)</span>
              </div>
              <div className="p-4 space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Provident Fund (PF - 12%)</span>
                  <span className="font-semibold text-rose-600">- {formatINR(slip.pf)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Tax Deducted at Source (TDS 10%)</span>
                  <span className="font-semibold text-rose-600">
                    {slip.tds > 0 ? `- ${formatINR(slip.tds)}` : "₹0"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">Loss of Pay (LOP Deduction)</span>
                  <span className="font-semibold text-rose-600">
                    {slip.lop > 0 ? `- ${formatINR(slip.lop)} (1 day)` : "₹0"}
                  </span>
                </div>
              </div>
              <div className="bg-rose-50/70 border-t border-rose-200 px-4 py-3 flex justify-between font-bold text-sm text-rose-700">
                <span>Total Deductions (B)</span>
                <span className="text-base font-black">- {formatINR(slip.totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* Net Payable Highlight Box (Emerald Block) */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 text-slate-900 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                  Net Salary Payable (A - B)
                </span>
                <span className="text-3xl font-black text-emerald-700 mt-1 block">
                  {formatINR(slip.netPay)}
                </span>
              </div>

              <div className="sm:text-right">
                <span className="text-xs uppercase font-bold text-slate-400 block">
                  Disbursement Mode
                </span>
                <span className="text-sm font-bold text-slate-800">
                  Direct Bank Credit / NEFT
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-emerald-200/80 text-xs text-slate-700">
              <strong className="font-bold">Amount in words:</strong> {amountInWords(slip.netPay)}
            </div>
          </div>

          {/* Legal Sign-off Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Electronically validated payslip by PeoplePay360 HRMS. No physical signature required.</span>
            </div>
            <div className="font-medium">Authorized Signatory</div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden on Print) */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500 font-medium">
            Generated from payrun: <strong>{slip.payrunId}</strong>
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSelectedPayslip(null)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 text-xs font-bold"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#714B67] hover:bg-[#5C3D54] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
