"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Plus,
  RefreshCw,
  CheckCircle2,
  Send,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingDown,
  Users,
  ShieldCheck,
  ChevronRight,
  Eye,
  Check,
  Layers,
  Settings,
  Calculator,
  Download,
  Mail,
  Sparkles,
  Lock,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { formatINR } from "@/lib/utils";
import { PayslipRecord } from "@/lib/mock-data";

export function PayrunEngine() {
  const {
    payrunBatch,
    recomputeBatch,
    validateBatch,
    markBatchPaid,
    setSelectedPayslip,
    setIsPayrunWizardOpen,
  } = useStore();

  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Compute summary metrics for batch
  const totalGross = payrunBatch.payslips.reduce((sum, s) => sum + s.gross, 0);
  const totalBasic = payrunBatch.payslips.reduce((sum, s) => sum + s.basic, 0);
  const totalHra = payrunBatch.payslips.reduce((sum, s) => sum + s.hra, 0);
  const totalSpecial = payrunBatch.payslips.reduce((sum, s) => sum + s.specialAllowance, 0);
  const totalPF = payrunBatch.payslips.reduce((sum, s) => sum + s.pf, 0);
  const totalTDS = payrunBatch.payslips.reduce((sum, s) => sum + s.tds, 0);
  const totalLOP = payrunBatch.payslips.reduce((sum, s) => sum + s.lop, 0);
  const totalDeductions = payrunBatch.payslips.reduce((sum, s) => sum + s.totalDeductions, 0);
  const totalNetPayout = payrunBatch.payslips.reduce((sum, s) => sum + s.netPay, 0);

  const missingBankCount = payrunBatch.payslips.filter((s) => s.hasBankWarning).length;

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const steps = ["Draft", "Computed", "Validated", "Paid"];
  const currentStepIdx = steps.indexOf(payrunBatch.status);

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>PeoplePay360</span>
            <span className="text-slate-300">/</span>
            <span className="text-[#714B67] font-bold">Payroll Pipeline</span>
            <span className="text-slate-300">/</span>
            <span>Batch {payrunBatch.id}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-[#714B67]" />
            <span>{payrunBatch.name}</span>
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Period: <span className="font-semibold text-slate-800">{payrunBatch.period}</span> • Structure:{" "}
            <span className="font-semibold text-slate-800">{payrunBatch.structure}</span> • Scope:{" "}
            <span className="font-semibold text-slate-800">{payrunBatch.departmentScope}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            onClick={() => setIsPayrunWizardOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00A09D] hover:bg-[#008A87] text-white text-sm font-bold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Payrun Wizard</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        </div>
      )}

      {/* Header Status Bar: Draft -> Computed -> Validated -> Paid (Glowing Active Indicator) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="text-sm uppercase tracking-wider font-bold text-slate-800 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#714B67]" />
              Payroll Execution Lifecycle
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Odoo 18 compliant state-machine enforcing audit compliance before fund disbursement.
            </div>
          </div>

          {/* Lifecycle Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {payrunBatch.status === "Draft" && (
              <button
                onClick={() => {
                  recomputeBatch();
                  showFeedback("Batch successfully computed! Earnings, PF, TDS and LOP applied.");
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#714B67] hover:bg-[#5E3D55] text-white text-xs font-bold shadow-md cursor-pointer transition-all active:scale-95"
              >
                <Calculator className="w-4 h-4" />
                <span>⚡ Compute Batch</span>
              </button>
            )}

            {payrunBatch.status === "Computed" && (
              <>
                <button
                  onClick={() => {
                    recomputeBatch();
                    showFeedback("Batch recomputed successfully against active employee records.");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer active:scale-95 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Recompute</span>
                </button>
                <button
                  onClick={() => {
                    validateBatch();
                    showFeedback("Payrun batch validated and locked against retroactive modifications!");
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00A09D] hover:bg-[#008A87] text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Validate & Lock</span>
                </button>
              </>
            )}

            {payrunBatch.status === "Validated" && (
              <button
                onClick={() => {
                  markBatchPaid();
                  showFeedback("Funds Disbursed! Bank files and payslips generated.");
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Disburse Funds</span>
              </button>
            )}
            {payrunBatch.status === "Paid" && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Disbursed (Ref #NEFT-SEP26-90218)</span>
                </span>
                <button
                  onClick={() => showFeedback("Bank NEFT transfer file downloaded successfully (.csv).")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export NEFT File</span>
                </button>
                <button
                  onClick={() => showFeedback("All 8 payslip PDFs emailed to employee personal inboxes.")}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#714B67]/10 hover:bg-[#714B67]/20 text-[#714B67] text-xs font-bold cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Payslips</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Animated Stepper Pipeline */}
        <div className="relative pt-4 pb-2 px-4 max-w-4xl mx-auto">
          {/* Connecting Line background */}
          <div className="absolute top-1/2 left-8 right-8 h-1.5 bg-slate-100 rounded-full -translate-y-1/2 z-0"></div>
          
          {/* Active progress line */}
          <div 
            className="absolute top-1/2 left-8 h-1.5 bg-[#714B67] rounded-full -translate-y-1/2 z-0 transition-all duration-700 ease-in-out" 
            style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
          />

          <div className="relative z-10 flex items-center justify-between">
            {steps.map((step, idx) => {
              const isActive = idx === currentStepIdx;
              const isPast = idx < currentStepIdx;
              const isFuture = idx > currentStepIdx;
              
              return (
                <div key={step} className="flex flex-col items-center gap-3 relative">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-[3px] transition-all duration-500 shadow-sm
                      ${isActive ? 'bg-white border-[#714B67] text-[#714B67] scale-110 shadow-md ring-4 ring-[#714B67]/10' : ''}
                      ${isPast ? 'bg-[#714B67] border-[#714B67] text-white' : ''}
                      ${isFuture ? 'bg-white border-slate-200 text-slate-400' : ''}
                    `}
                  >
                    {isPast ? <CheckCircle2 className="w-5 h-5" /> : (idx + 1)}
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider transition-colors duration-300
                    ${isActive ? 'text-[#714B67]' : isPast ? 'text-slate-700' : 'text-slate-400'}`}>
                    {step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pre-Run Validation Warning Banner (Rahul Mishra Missing Bank Credentials) */}
      {missingBankCount > 0 && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm text-amber-900">
                ⚠️ Operational Pre-Run Validation Warning: Missing Banking Credentials
              </div>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                <span className="font-bold">Rahul Mishra</span> lacks active bank credentials (Account Number &amp; IFSC missing). While his gross salary is computed according to the standard salary rules, direct NEFT file dispatch will exclude this entry until credentials are provided.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const rahulSlip = payrunBatch.payslips.find((s) => s.hasBankWarning);
              if (rahulSlip) setSelectedPayslip(rahulSlip);
            }}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            Review Rahul&apos;s Payslip
          </button>
        </div>
      )}

      {/* Bento Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">Total Gross Wages</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{formatINR(totalGross)}</div>
          <div className="text-xs text-slate-500 mt-1">Basic: {formatINR(totalBasic)} + HRA: {formatINR(totalHra)}</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">Statutory Deductions</div>
          <div className="text-2xl font-black text-rose-600 mt-1">-{formatINR(totalDeductions)}</div>
          <div className="text-xs text-slate-500 mt-1">PF: {formatINR(totalPF)} • TDS: {formatINR(totalTDS)} • LOP: {formatINR(totalLOP)}</div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">Net Take-Home Payout</div>
          <div className="text-2xl font-black text-[#00A09D] mt-1">{formatINR(totalNetPayout)}</div>
          <div className="text-xs font-semibold text-emerald-600 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ready for bank NEFT transfer</span>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">Eligible Employees</div>
          <div className="text-2xl font-black text-[#714B67] mt-1">{payrunBatch.payslips.length} Staff</div>
          <div className="text-xs text-slate-500 mt-1">
            {missingBankCount > 0 ? (
              <span className="text-amber-700 font-bold">1 Requires Banking Credentials</span>
            ) : (
              <span className="text-emerald-700 font-bold">All 8 accounts verified</span>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Salary Calculation Batch Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">September 2026 Batch Computation Table</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Salary rules applied: Basic (50%), HRA (20%), Special Allowance, PF (12%), TDS (10%), and Unpaid LOP
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 px-3 py-1 bg-slate-100 rounded-full">
            {payrunBatch.payslips.length} Calculated Rows
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4 text-right">Monthly CTC</th>
                <th className="py-3 px-4 text-center">LOP Days</th>
                <th className="py-3 px-4 text-right">Basic (50%)</th>
                <th className="py-3 px-4 text-right">HRA (20%)</th>
                <th className="py-3 px-4 text-right">Special Allw</th>
                <th className="py-3 px-4 text-right">Gross Pay</th>
                <th className="py-3 px-4 text-right">PF (12%)</th>
                <th className="py-3 px-4 text-right">TDS (10%)</th>
                <th className="py-3 px-4 text-right">Net Payout</th>
                <th className="py-3 px-4">Bank Verification</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrunBatch.payslips.map((slip) => (
                <tr key={slip.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Employee */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{slip.employeeName}</div>
                    <div className="text-xs text-slate-500">{slip.department}</div>
                  </td>

                  {/* Monthly CTC */}
                  <td className="py-3 px-4 text-right font-semibold text-slate-700">
                    {formatINR(slip.gross)}
                  </td>

                  {/* LOP Days */}
                  <td className="py-3 px-4 text-center">
                    {slip.lopDays > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {slip.lopDays}d (-{formatINR(slip.lop)})
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">0</span>
                    )}
                  </td>

                  {/* Earnings Breakdown */}
                  <td className="py-3 px-4 text-right text-xs text-slate-700">{formatINR(slip.basic)}</td>
                  <td className="py-3 px-4 text-right text-xs text-slate-700">{formatINR(slip.hra)}</td>
                  <td className="py-3 px-4 text-right text-xs text-slate-700">{formatINR(slip.specialAllowance)}</td>

                  {/* Gross Pay */}
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {formatINR(slip.gross - slip.lop)}
                  </td>

                  {/* Deductions */}
                  <td className="py-3 px-4 text-right text-xs text-rose-600 font-medium">-{formatINR(slip.pf)}</td>
                  <td className="py-3 px-4 text-right text-xs text-rose-600 font-medium">-{formatINR(slip.tds)}</td>

                  {/* Net Pay */}
                  <td className="py-3 px-4 text-right font-black text-sm text-[#00A09D]">
                    {formatINR(slip.netPay)}
                  </td>

                  {/* Bank Status */}
                  <td className="py-3 px-4">
                    {slip.hasBankWarning ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Missing Bank</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>{slip.bankName}</span>
                      </span>
                    )}
                  </td>

                  {/* View Payslip Modal trigger */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedPayslip(slip)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#714B67] hover:text-white text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
