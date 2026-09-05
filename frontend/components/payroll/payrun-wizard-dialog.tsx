"use client";

import React, { useState } from "react";
import {
  X,
  CreditCard,
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Calculator,
  Building2,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { formatINR } from "@/lib/utils";

export function PayrunWizardDialog() {
  const {
    isPayrunWizardOpen,
    setIsPayrunWizardOpen,
    employees,
    createPayrunBatch,
    recomputeBatch,
  } = useStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [period, setPeriod] = useState<string>("September 2026");
  const [structure, setStructure] = useState<string>("Standard Indian Corporate Payroll");
  const [deptFilter, setDeptFilter] = useState<string>("All Departments");

  // Selected employee IDs (defaults to all employees)
  const [selectedEmpIds, setSelectedEmpIds] = useState<string[]>(
    employees.map((e) => e.id)
  );

  if (!isPayrunWizardOpen) return null;

  // Filter staff based on Step 1 department filter
  const eligibleStaff = employees.filter(
    (e) => deptFilter === "All Departments" || e.department === deptFilter
  );

  const toggleEmployee = (id: string) => {
    setSelectedEmpIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedEmpIds.length === eligibleStaff.length) {
      setSelectedEmpIds([]);
    } else {
      setSelectedEmpIds(eligibleStaff.map((e) => e.id));
    }
  };

  // Compute live estimates
  const selectedStaffList = employees.filter((e) => selectedEmpIds.includes(e.id));
  const totalGrossEstimate = selectedStaffList.reduce((sum, e) => sum + e.monthlyCTC, 0);
  const hasRahulMishraSelected = selectedEmpIds.includes("EMP-103");

  const handleFinalGenerate = () => {
    createPayrunBatch(period, structure, deptFilter, selectedEmpIds);
    // Automatically trigger initial computation
    setTimeout(() => {
      recomputeBatch();
    }, 100);
    setIsPayrunWizardOpen(false);
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto select-none">
      <div
        onClick={() => setIsPayrunWizardOpen(false)}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
          {/* Header */}
          <div className="bg-[#714B67] text-white px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-white/10">
                <CreditCard className="w-5 h-5 text-[#00A09D]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <span>Payrun Batch Creation Wizard</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 font-bold">
                    Step {step} of 2
                  </span>
                </h3>
                <p className="text-xs text-white/80 font-medium mt-0.5">
                  {step === 1
                    ? "Step 1: Define Payroll Scope, Salary Structure & Period"
                    : "Step 2: Staff Verification & Pre-Run Validation Warnings"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsPayrunWizardOpen(false)}
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 1
                    ? "bg-[#714B67] text-white"
                    : "bg-emerald-600 text-white"
                }`}
              >
                {step > 1 ? "✓" : "1"}
              </div>
              <span className={`font-bold text-sm ${step === 1 ? "text-[#714B67]" : "text-slate-600"}`}>
                1. Scope &amp; Structure
              </span>
            </div>

            <div className="h-0.5 flex-1 mx-4 bg-slate-200">
              <div
                className={`h-full bg-[#714B67] transition-all duration-300 ${
                  step === 2 ? "w-full" : "w-1/2"
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === 2
                    ? "bg-[#00A09D] text-white ring-2 ring-[#00A09D]/30"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                2
              </div>
              <span className={`font-bold text-sm ${step === 2 ? "text-[#00A09D]" : "text-slate-400"}`}>
                2. Staff Verification &amp; Alerts
              </span>
            </div>
          </div>

          {/* Step 1: Scope & Structure */}
          {step === 1 && (
            <div className="p-6 space-y-5 text-sm text-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Pay Period */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Pay Period (Month &amp; Year) *
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67] font-semibold text-slate-900"
                  >
                    <option value="September 2026">September 2026 (01/09/2026 - 30/09/2026)</option>
                    <option value="August 2026">August 2026 (01/08/2026 - 31/08/2026)</option>
                    <option value="October 2026">October 2026 (01/10/2026 - 31/10/2026)</option>
                  </select>
                  <p className="text-xs text-slate-500 font-medium">
                    Determines applicable contract period and working days (30 days).
                  </p>
                </div>

                {/* Salary Structure */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Salary Structure Container *
                  </label>
                  <select
                    value={structure}
                    onChange={(e) => setStructure(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67] font-semibold text-slate-900"
                  >
                    <option value="Standard Indian Corporate Payroll">
                      Standard Indian Corporate Payroll (Basic 50%, HRA 20%, PF 12%, TDS 10%)
                    </option>
                    <option value="Executive Compensation Structure">
                      Executive Compensation Structure (Variable Performance bonus)
                    </option>
                    <option value="Contractor &amp; Consultant Hourly Structure">
                      Contractor &amp; Consultant Hourly Structure
                    </option>
                  </select>
                  <p className="text-xs text-slate-500 font-medium">
                    Sequences computation rules: Earnings -&gt; Deductions -&gt; Net Salary.
                  </p>
                </div>

                {/* Department Scope Filter */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Department Scope Filter
                  </label>
                  <select
                    value={deptFilter}
                    onChange={(e) => {
                      setDeptFilter(e.target.value);
                      const filtered = employees.filter(
                        (emp) => e.target.value === "All Departments" || emp.department === e.target.value
                      );
                      setSelectedEmpIds(filtered.map((emp) => emp.id));
                    }}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#714B67] font-semibold text-slate-900"
                  >
                    <option value="All Departments">All Departments (8 Eligible Employees)</option>
                    <option value="Engineering">Engineering (3 Employees)</option>
                    <option value="Product">Product (1 Employee)</option>
                    <option value="Human Resources">Human Resources (2 Employees)</option>
                    <option value="Sales">Sales (2 Employees)</option>
                  </select>
                </div>

                {/* Payrun Name */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-slate-700 text-xs uppercase tracking-wider">
                    Batch Run Designation
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${period} - ${deptFilter}`}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-100 text-slate-700 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Informational Callout */}
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 flex items-start gap-3.5">
                <Layers className="w-5 h-5 text-[#714B67] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#714B67] text-sm">
                    Period-Based Contract Enforcement (Odoo 18 Rule)
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    The wizard will only select active contracts that overlap with {period}.
                    Employees without an active contract or with overlapping expired terms will be flagged.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Staff Verification & Pre-Run Validation Warnings */}
          {step === 2 && (
            <div className="p-6 space-y-4 text-sm text-slate-800">
              {/* OPERATIONAL ANOMALY WARNING BANNER */}
              {hasRahulMishraSelected && (
                <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-xs flex items-start gap-3.5 animate-in fade-in duration-200">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-amber-900 flex items-center gap-2">
                      <span>Operational Pre-Run Validation Warning: Missing Banking Credentials</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-amber-200/80 font-extrabold">
                        Action Required
                      </span>
                    </h4>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      ⚠️ <strong>Warning: Rahul Mishra</strong> has missing bank account credentials (Account Number &amp; IFSC missing). 
                      While gross salary will be computed according to the salary structure, bank transfer file generation will fail unless banking details are linked.
                    </p>
                  </div>
                </div>
              )}

              {/* Staff Checklist Table Header */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 font-bold text-slate-800 hover:text-[#714B67] text-sm"
                  >
                    {selectedEmpIds.length === eligibleStaff.length ? (
                      <CheckSquare className="w-5 h-5 text-[#714B67]" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                    <span>Select All ({eligibleStaff.length})</span>
                  </button>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 font-medium text-xs">
                    {selectedEmpIds.length} of {eligibleStaff.length} selected
                  </span>
                </div>

                <div className="text-xs text-slate-500">
                  Target Period: <strong className="text-slate-800 font-bold">{period}</strong>
                </div>
              </div>

              {/* Staff Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold text-xs uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">Include</th>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4 text-right">Agreed CTC</th>
                      <th className="py-3 px-4">Bank Details</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {eligibleStaff.map((emp) => {
                      const isSelected = selectedEmpIds.includes(emp.id);
                      const isBankMissing = !emp.bankDetails.isVerified || !emp.bankDetails.accountNumber;

                      return (
                        <tr
                          key={emp.id}
                          onClick={() => toggleEmployee(emp.id)}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                            isSelected ? "bg-purple-50/20" : ""
                          }`}
                        >
                          <td className="py-2.5 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}}
                              className="w-4 h-4 rounded text-[#714B67] focus:ring-[#714B67] accent-[#714B67]"
                            />
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={emp.avatar}
                                alt={emp.name}
                                className="w-7 h-7 rounded-full object-cover border"
                              />
                              <span>{emp.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 font-medium">{emp.department}</td>
                          <td className="py-2.5 px-4 text-right font-black text-slate-900">
                            {formatINR(emp.monthlyCTC)}
                          </td>
                          <td className="py-2.5 px-4">
                            {isBankMissing ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-100 text-amber-900 text-xs font-bold">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                <span>Missing A/c</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>{emp.bankDetails.bankName}</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="px-2.5 py-1 rounded-md text-xs bg-teal-50 text-teal-800 font-semibold border border-teal-200">
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Summary Bar */}
              <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                    Batch Pre-Run Total Estimate
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-0.5">
                    {formatINR(totalGrossEstimate)}
                    <span className="text-xs font-normal text-slate-500 ml-1.5">
                      Gross across {selectedStaffList.length} staff
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-slate-400 block text-xs">Selected Staff</span>
                    <span className="font-bold text-[#714B67] text-base">
                      {selectedStaffList.length} Employees
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Navigation Buttons */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            {step === 1 ? (
              <div>
                <button
                  type="button"
                  onClick={() => setIsPayrunWizardOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Scope</span>
              </button>
            )}

            {step === 1 ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 bg-[#714B67] hover:bg-[#5C3D54] text-white px-5 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                <span>Continue to Staff Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalGenerate}
                disabled={selectedStaffList.length === 0}
                className="inline-flex items-center gap-2 bg-[#00A09D] hover:bg-[#008A87] disabled:opacity-50 text-white px-5 py-2.5 rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                <Calculator className="w-4 h-4" />
                <span>Generate &amp; Compute Payrun Batch</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
