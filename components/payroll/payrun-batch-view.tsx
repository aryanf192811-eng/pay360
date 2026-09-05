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
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { formatINR } from "@/lib/utils";
import { PayslipRecord } from "@/lib/mock-data";

export function PayrunBatchView() {
  const {
    payrunBatch,
    recomputeBatch,
    validateBatch,
    markBatchPaid,
    setSelectedPayslip,
    setIsPayrunWizardOpen,
    salaryStructures,
    salaryRules,
  } = useStore();

  const [activeModuleTab, setActiveModuleTab] = useState<"batch" | "structures" | "rules">("batch");
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
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const steps = ["Draft", "Computed", "Validated", "Paid"];
  const currentStepIndex = steps.indexOf(payrunBatch.status);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-[#714B67] bg-[#714B67]/10 px-2.5 py-1 rounded-md border border-[#714B67]/20">
                {payrunBatch.id}
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {payrunBatch.name}
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Period: <strong>{payrunBatch.period}</strong> • Structure: {payrunBatch.structure} • Scope: {payrunBatch.departmentScope}
            </p>
          </div>

          {/* Module Sub-Tabs (Batch, Structures, Rules) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveModuleTab("batch")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeModuleTab === "batch"
                    ? "bg-[#714B67] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Payrun Batches
              </button>
              <button
                onClick={() => setActiveModuleTab("structures")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeModuleTab === "structures"
                    ? "bg-[#714B67] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Salary Structures ({salaryStructures.length})
              </button>
              <button
                onClick={() => setActiveModuleTab("rules")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeModuleTab === "rules"
                    ? "bg-[#714B67] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Salary Rules ({salaryRules.length})
              </button>
            </div>

            {activeModuleTab === "batch" && (
              <button
                onClick={() => setIsPayrunWizardOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4 text-[#00A09D]" />
                <span>+ Create Payrun</span>
              </button>
            )}
          </div>
        </div>

        {/* Action Button Bar & Odoo Statusbar (Visible in Batch View) */}
        {activeModuleTab === "batch" && (
          <>
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                {/* Recompute */}
                <button
                  onClick={() => {
                    recomputeBatch();
                    showFeedback("Batch successfully recomputed with updated rules & attendance!");
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-[#714B67]" />
                  <span>Recompute Rules</span>
                </button>

                {/* Validate Batch */}
                <button
                  onClick={() => {
                    validateBatch();
                    showFeedback("Batch validated! Ready for bank disbursement.");
                  }}
                  disabled={payrunBatch.status === "Validated" || payrunBatch.status === "Paid"}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#714B67] hover:bg-[#5C3D54] disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Validate Batch</span>
                </button>

                {/* Send Payslips Bulk */}
                <button
                  onClick={() => {
                    showFeedback(`Bulk email dispatches queued: ${payrunBatch.payslips.length} payslips sent to employee registered emails!`);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-colors"
                >
                  <Send className="w-4 h-4 text-[#00A09D]" />
                  <span>Send Payslips (Bulk)</span>
                </button>

                {/* Mark as Paid */}
                <button
                  onClick={() => {
                    markBatchPaid();
                    showFeedback("Batch marked as Paid! Final financial journal entries posted.");
                  }}
                  disabled={payrunBatch.status === "Paid"}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00A09D] hover:bg-[#008A87] disabled:opacity-40 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Mark as Paid</span>
                </button>
              </div>

              {/* Odoo Lifecycle Pipeline Ribbon */}
              <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
                {steps.map((st, i) => {
                  const isPast = i < currentStepIndex;
                  const isCurrent = i === currentStepIndex;

                  return (
                    <div key={st} className="flex items-center">
                      <div
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all ${
                          isCurrent
                            ? "bg-[#714B67] text-white shadow-xs"
                            : isPast
                            ? "text-emerald-700 bg-emerald-50"
                            : "text-slate-400"
                        }`}
                      >
                        {isPast && <Check className="w-4 h-4 text-emerald-600" />}
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        )}
                        <span>{st}</span>
                      </div>
                      {i < steps.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-slate-300 mx-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Toast Feedback */}
            {actionFeedback && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionFeedback}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* VIEW 1: PAYRUN BATCHES */}
      {activeModuleTab === "batch" && (
        <div className="px-6 space-y-6">
          {/* Warning Banner if any employee has missing bank details */}
          {missingBankCount > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 flex items-start gap-3.5 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-bold text-sm">
                  Action Required: {missingBankCount} Employee(s) Missing Bank Account Details
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  <strong>Rahul Mishra</strong> does not have an active bank account on file. 
                  Net salary is computed, but automated disbursement will exclude this entry until bank account number and IFSC are updated.
                </p>
              </div>
            </div>
          )}

          {/* 3 Summary Metric Cards (Total Gross, Deductions, Net Payout) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Card 1: Total Gross */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Gross Earnings
                </span>
                <div className="p-2.5 rounded-lg bg-purple-50 text-[#714B67]">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">
                {formatINR(totalGross)}
              </div>
              <div className="text-xs text-slate-500 mt-1.5 flex items-center justify-between font-medium">
                <span>Basic: {formatINR(totalBasic)}</span>
                <span>HRA: {formatINR(totalHra)}</span>
              </div>
            </div>

            {/* Card 2: Total Deductions */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Deductions (PF+TDS+LOP)
                </span>
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-600 mt-2">
                - {formatINR(totalDeductions)}
              </div>
              <div className="text-xs text-slate-500 mt-1.5 flex items-center justify-between font-medium">
                <span>PF: {formatINR(totalPF)}</span>
                <span>TDS: {formatINR(totalTDS)}</span>
                {totalLOP > 0 && <span>LOP: {formatINR(totalLOP)}</span>}
              </div>
            </div>

            {/* Card 3: Net Payout */}
            <div className="bg-white rounded-xl border-2 border-[#00A09D]/30 p-5 shadow-xs bg-gradient-to-br from-teal-50/20 to-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#00A09D]">
                  Net Disbursable Payout
                </span>
                <div className="p-2.5 rounded-lg bg-[#00A09D]/10 text-[#00A09D]">
                  <CreditCard className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-[#00A09D] mt-2">
                {formatINR(totalNetPayout)}
              </div>
              <div className="text-xs text-slate-500 mt-1.5 font-medium">
                Across {payrunBatch.payslips.length} verified employee payslips
              </div>
            </div>
          </div>

          {/* Batch Table of Calculated Payslips */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="font-bold text-slate-800 text-sm flex items-center gap-2.5">
                <span>Computed Payslips for {payrunBatch.period}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                  {payrunBatch.payslips.length} records
                </span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Batch Status: <span className="font-bold text-[#714B67]">{payrunBatch.status}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4 text-right">Basic (50%)</th>
                    <th className="py-3.5 px-4 text-right">HRA (20%)</th>
                    <th className="py-3.5 px-4 text-right">Special All.</th>
                    <th className="py-3.5 px-4 text-right font-bold text-slate-900">Gross</th>
                    <th className="py-3.5 px-4 text-right text-rose-600">PF (12%)</th>
                    <th className="py-3.5 px-4 text-right text-rose-600">TDS (10%)</th>
                    <th className="py-3.5 px-4 text-right text-rose-600">LOP</th>
                    <th className="py-3.5 px-4 text-right font-black text-[#00A09D]">Net Payable</th>
                    <th className="py-3.5 px-4">Bank Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrunBatch.payslips.map((slip) => (
                    <tr
                      key={slip.id}
                      className="hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedPayslip(slip)}
                    >
                      {/* Employee Identity */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={slip.avatar}
                            alt={slip.employeeName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-[#714B67] transition-colors">
                              {slip.employeeName}
                            </div>
                            <div className="text-xs text-slate-500">{slip.employeeRole}</div>
                          </div>
                        </div>
                      </td>

                      {/* Earnings Columns */}
                      <td className="py-3 px-4 text-right text-slate-700 font-medium">{formatINR(slip.basic)}</td>
                      <td className="py-3 px-4 text-right text-slate-700 font-medium">{formatINR(slip.hra)}</td>
                      <td className="py-3 px-4 text-right text-slate-700 font-medium">{formatINR(slip.specialAllowance)}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">{formatINR(slip.gross)}</td>

                      {/* Deductions Columns */}
                      <td className="py-3 px-4 text-right text-rose-600 font-semibold">- {formatINR(slip.pf)}</td>
                      <td className="py-3 px-4 text-right text-rose-600 font-semibold">
                        {slip.tds > 0 ? `- ${formatINR(slip.tds)}` : "₹0"}
                      </td>
                      <td className="py-3 px-4 text-right text-rose-600 font-semibold">
                        {slip.lop > 0 ? `- ${formatINR(slip.lop)} (1d)` : "₹0"}
                      </td>

                      {/* Net Amount */}
                      <td className="py-3 px-4 text-right font-black text-base text-[#00A09D]">
                        {formatINR(slip.netPay)}
                      </td>

                      {/* Bank Status Flag */}
                      <td className="py-3 px-4">
                        {slip.hasBankWarning ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-xs font-bold animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Missing A/c</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        )}
                      </td>

                      {/* Row Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPayslip(slip);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#714B67] hover:text-white text-slate-700 text-xs font-bold transition-colors"
                            title="View Printable Payslip"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Payslip</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SALARY STRUCTURES (A5 Feature) */}
      {activeModuleTab === "structures" && (
        <div className="px-6 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Configured Salary Structures (A5)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Containers for sequenced collections of salary rules dictating how payslips are computed.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#714B67]/10 text-[#714B67]">
                {salaryStructures.length} Structures
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-5">Structure Name &amp; Code</th>
                    <th className="py-3.5 px-5">Description</th>
                    <th className="py-3.5 px-5 text-center">Rules Count</th>
                    <th className="py-3.5 px-5 text-center">Assigned Staff</th>
                    <th className="py-3.5 px-5">Rule Sequence Flow</th>
                    <th className="py-3.5 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salaryStructures.map((str) => (
                    <tr key={str.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-sm">{str.name}</div>
                        <div className="text-xs text-[#714B67] font-mono font-bold">{str.code}</div>
                      </td>
                      <td className="py-4 px-5 text-slate-600 text-xs max-w-xs">{str.description}</td>
                      <td className="py-4 px-5 text-center font-bold text-slate-800">{str.rulesCount} Rules</td>
                      <td className="py-4 px-5 text-center font-bold text-slate-800">{str.assignedEmployeesCount} Staff</td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1 flex-wrap">
                          {str.ruleCodes.map((code) => (
                            <span key={code} className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-50 text-[#714B67] border border-purple-200 font-bold">
                              {code}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${str.status === "Active" ? "bg-teal-50 text-teal-800 border border-teal-200" : "bg-slate-100 text-slate-600"}`}>
                          {str.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SALARY RULES SETUP (A6 Feature) */}
      {activeModuleTab === "rules" && (
        <div className="px-6 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Salary Rules Master Setup (A6)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ordered computation sequence calculating earnings, statutory deductions, and net salary.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#00A09D]/10 text-[#00A09D]">
                {salaryRules.length} Sequenced Rules
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-5 text-center">Seq</th>
                    <th className="py-3.5 px-5">Rule Name &amp; Code</th>
                    <th className="py-3.5 px-5">Category</th>
                    <th className="py-3.5 px-5">Method</th>
                    <th className="py-3.5 px-5 font-mono">Computation Equation</th>
                    <th className="py-3.5 px-5">Condition</th>
                    <th className="py-3.5 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salaryRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-5 text-center font-mono font-bold text-slate-500 text-xs">
                        #{rule.sequence}
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900 text-sm">{rule.name}</div>
                        <div className="text-xs text-[#714B67] font-mono font-bold">{rule.code}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                          rule.category === "Basic"
                            ? "bg-purple-100 text-purple-800"
                            : rule.category === "Allowance"
                            ? "bg-blue-100 text-blue-800"
                            : rule.category === "Gross"
                            ? "bg-slate-200 text-slate-800"
                            : rule.category === "Deduction"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {rule.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-xs font-medium text-slate-700">{rule.computationMethod}</td>
                      <td className="py-3.5 px-5 font-mono text-xs font-bold text-slate-900 bg-slate-50/50">
                        {rule.equation}
                      </td>
                      <td className="py-3.5 px-5 text-xs text-slate-500 font-mono">{rule.condition}</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {rule.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
