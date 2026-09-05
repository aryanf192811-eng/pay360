"use client";

import React, { useState } from "react";
import {
  X,
  FileText,
  Clock,
  Calendar,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Mail,
  Phone,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { calculateSalaryBreakdown } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";

export function EmployeeDrawer() {
  const {
    selectedEmployee,
    setSelectedEmployee,
    updateEmployeeBankDetails,
    setActiveNavTab,
  } = useStore();

  const [activeDrawerTab, setActiveDrawerTab] = useState<
    "work" | "contract" | "banking" | "attendance"
  >("work");

  // Inline bank edit form state for fixing Rahul Mishra anomaly
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankNameInput, setBankNameInput] = useState("");
  const [accountNumberInput, setAccountNumberInput] = useState("");
  const [ifscInput, setIfscInput] = useState("");
  const [bankSuccessMsg, setBankSuccessMsg] = useState(false);

  if (!selectedEmployee) return null;

  const emp = selectedEmployee;
  const isBankMissing = !emp.bankDetails.isVerified || !emp.bankDetails.accountNumber;
  const salary = calculateSalaryBreakdown(emp.monthlyCTC, 0);

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumberInput || !ifscInput) return;

    updateEmployeeBankDetails(emp.id, {
      accountNumber: accountNumberInput,
      bankName: bankNameInput || "HDFC Bank",
      ifscCode: ifscInput.toUpperCase(),
    });

    setBankSuccessMsg(true);
    setIsEditingBank(false);
    setTimeout(() => setBankSuccessMsg(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        onClick={() => setSelectedEmployee(null)}
        className="absolute inset-0 bg-slate-900/50 transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Drawer Top Bar: Employee Identity Header */}
          <div className="bg-[#714B67] text-white px-6 py-5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-4">
              <div className="relative">
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white/80 shadow-xs"
                />
                <span
                  className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    emp.status === "Active" ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-extrabold text-white">{emp.name}</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono font-semibold">
                    {emp.id}
                  </span>
                </div>
                <p className="text-sm text-white/90 font-medium mt-0.5">
                  {emp.role} • <span className="text-[#00A09D] font-bold">{emp.department}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedEmployee(null)}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* ODOO SMART BUTTONS RIBBON (Requested Prominent Feature!) */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center gap-2.5 overflow-x-auto">
            {/* Smart Button 1: Contracts */}
            <button
              onClick={() => setActiveDrawerTab("contract")}
              title="View Contract"
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg border transition-all shadow-xs ${
                activeDrawerTab === "contract"
                  ? "bg-[#714B67] border-[#714B67] text-white shadow-xs font-bold"
                  : "bg-white border-slate-200 text-slate-800 hover:border-[#714B67]/50 hover:bg-slate-50"
              }`}
            >
              <FileText className={`w-4 h-4 ${activeDrawerTab === "contract" ? "text-white" : "text-[#714B67]"}`} />
              <div className="text-left leading-tight">
                <div className="font-extrabold text-xs">
                  Contracts: {emp.smartMetrics.contractsCount} Active
                </div>
                <div className={`text-xs ${activeDrawerTab === "contract" ? "text-white/80" : "text-slate-400"}`}>
                  {emp.smartMetrics.activeContractId}
                </div>
              </div>
            </button>

            {/* Smart Button 2: Attendance */}
            <button
              onClick={() => setActiveDrawerTab("attendance")}
              title="View Attendance History"
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg border transition-all shadow-xs ${
                activeDrawerTab === "attendance"
                  ? "bg-[#00A09D] border-[#00A09D] text-white shadow-xs font-bold"
                  : "bg-white border-slate-200 text-slate-800 hover:border-[#00A09D]/50 hover:bg-slate-50"
              }`}
            >
              <Clock className={`w-4 h-4 ${activeDrawerTab === "attendance" ? "text-white" : "text-[#00A09D]"}`} />
              <div className="text-left leading-tight">
                <div className="font-extrabold text-xs">
                  Attendance: {emp.smartMetrics.attendancePercentage}%
                </div>
                <div className={`text-xs ${activeDrawerTab === "attendance" ? "text-white/80" : "text-slate-400"}`}>
                  9.0 hrs / day
                </div>
              </div>
            </button>

            {/* Smart Button 3: Leaves */}
            <button
              onClick={() => setActiveDrawerTab("attendance")}
              title="View Leave Balance"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition-all shadow-xs"
            >
              <Calendar className="w-4 h-4 text-purple-600" />
              <div className="text-left leading-tight">
                <div className="font-extrabold text-xs">
                  Leaves: {emp.smartMetrics.leaveBalance} Bal
                </div>
                <div className="text-xs text-slate-400">Allocated: 18d</div>
              </div>
            </button>

            {/* Smart Button 4: Payslips */}
            <button
              onClick={() => setActiveDrawerTab("contract")}
              title="View Payslips"
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition-all shadow-xs"
            >
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <div className="text-left leading-tight">
                <div className="font-extrabold text-xs">
                  Payslips: {emp.smartMetrics.payslipsCount}
                </div>
                <div className="text-xs text-slate-400">Processed</div>
              </div>
            </button>
          </div>

          {/* Navigation Tabs Inside Drawer */}
          <div className="border-b border-slate-200 px-6 flex items-center gap-5 bg-white text-sm font-bold">
            <button
              onClick={() => setActiveDrawerTab("work")}
              className={`py-3.5 border-b-2 transition-colors ${
                activeDrawerTab === "work"
                  ? "border-[#714B67] text-[#714B67]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Work Information
            </button>
            <button
              onClick={() => setActiveDrawerTab("contract")}
              className={`py-3.5 border-b-2 transition-colors ${
                activeDrawerTab === "contract"
                  ? "border-[#714B67] text-[#714B67]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Contract &amp; Salary Rules
            </button>
            <button
              onClick={() => setActiveDrawerTab("banking")}
              className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
                activeDrawerTab === "banking"
                  ? "border-[#714B67] text-[#714B67]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>Banking &amp; Statutory</span>
              {isBankMissing && (
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              )}
            </button>
            <button
              onClick={() => setActiveDrawerTab("attendance")}
              className={`py-3.5 border-b-2 transition-colors ${
                activeDrawerTab === "attendance"
                  ? "border-[#714B67] text-[#714B67]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              Attendance &amp; Time Off
            </button>
          </div>

          {/* Tab Content Container (Upgraded text-sm) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 text-sm">
            {/* TAB 1: WORK INFORMATION */}
            {activeDrawerTab === "work" && (
              <div className="space-y-5">
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Employment Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 block text-xs font-medium">Department</span>
                      <span className="font-bold text-slate-900 text-base">{emp.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs font-medium">Job Title</span>
                      <span className="font-bold text-slate-900 text-base">{emp.role}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs font-medium">Reports To (Manager)</span>
                      <span className="font-semibold text-slate-800 text-sm">{emp.manager}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs font-medium">Joined Date</span>
                      <span className="font-semibold text-slate-800 text-sm">{emp.joinedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Contact &amp; Location
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-100 text-[#714B67]">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs font-medium">Work Email</span>
                        <span className="font-semibold text-slate-900 text-sm">{emp.email}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-100 text-[#00A09D]">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs font-medium">Work Phone</span>
                        <span className="font-semibold text-slate-900 text-sm">{emp.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Working Schedule (Odoo Standard)
                  </h4>
                  <div className="flex items-center gap-2.5 text-slate-800">
                    <Clock className="w-5 h-5 text-[#714B67]" />
                    <span className="font-bold text-sm">{emp.workingSchedule}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Standard 40 hrs/week (8 hrs/day). Used for time tracking and automated payroll variance computations.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: CONTRACT & SALARY RULES */}
            {activeDrawerTab === "contract" && (
              <div className="space-y-5">
                {/* Active Contract Summary Banner */}
                <div className="bg-gradient-to-r from-purple-50 to-teal-50 border border-purple-200 rounded-xl p-5 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#714B67] uppercase tracking-wider">
                      Active Contract Reference
                    </div>
                    <div className="text-base font-extrabold text-slate-900 mt-1">
                      {emp.smartMetrics.activeContractId} — {emp.role}
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Structure: Standard Indian Corporate Payroll
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-500 font-medium">Agreed Monthly CTC</div>
                    <div className="text-2xl font-black text-[#714B67]">
                      {formatINR(emp.monthlyCTC)}
                    </div>
                  </div>
                </div>

                {/* Salary Rules Computation Matrix */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="bg-slate-100 px-5 py-3 font-bold text-slate-800 text-sm flex items-center justify-between">
                    <span>Standard Salary Rules Breakdown</span>
                    <span className="text-xs font-semibold text-slate-500">Monthly Run</span>
                  </div>

                  <table className="w-full text-left text-sm">
                    <tbody className="divide-y divide-slate-100">
                      {/* Earnings */}
                      <tr className="bg-emerald-50/50">
                        <td className="py-2.5 px-5 font-bold text-emerald-900 text-xs tracking-wider" colSpan={3}>
                          EARNINGS (GROSS SALARY)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-5 text-slate-800 font-medium">Basic Salary</td>
                        <td className="py-2.5 px-5 text-slate-500 text-xs">50% of CTC</td>
                        <td className="py-2.5 px-5 text-right font-bold text-slate-900">
                          {formatINR(salary.basic)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-5 text-slate-800 font-medium">House Rent Allowance (HRA)</td>
                        <td className="py-2.5 px-5 text-slate-500 text-xs">40% of Basic (20% CTC)</td>
                        <td className="py-2.5 px-5 text-right font-bold text-slate-900">
                          {formatINR(salary.hra)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-5 text-slate-800 font-medium">Special Allowance</td>
                        <td className="py-2.5 px-5 text-slate-500 text-xs">Remainder (30% CTC)</td>
                        <td className="py-2.5 px-5 text-right font-bold text-slate-900">
                          {formatINR(salary.specialAllowance)}
                        </td>
                      </tr>
                      <tr className="bg-slate-50 font-bold">
                        <td className="py-3 px-5 text-slate-900">Total Gross Salary</td>
                        <td className="py-3 px-5 text-slate-500 text-xs">Sum of earnings</td>
                        <td className="py-3 px-5 text-right font-black text-slate-900">
                          {formatINR(salary.gross)}
                        </td>
                      </tr>

                      {/* Deductions */}
                      <tr className="bg-rose-50/50">
                        <td className="py-2.5 px-5 font-bold text-rose-900 text-xs tracking-wider" colSpan={3}>
                          STATUTORY DEDUCTIONS
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-5 text-slate-800 font-medium">Provident Fund (PF)</td>
                        <td className="py-2.5 px-5 text-slate-500 text-xs">12% of Basic</td>
                        <td className="py-2.5 px-5 text-right font-bold text-rose-600">
                          - {formatINR(salary.pf)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-5 text-slate-800 font-medium">Tax Deducted at Source (TDS)</td>
                        <td className="py-2.5 px-5 text-slate-500 text-xs">10% on Gross &gt; ₹50,000</td>
                        <td className="py-2.5 px-5 text-right font-bold text-rose-600">
                          - {formatINR(salary.tds)}
                        </td>
                      </tr>
                      {salary.lop > 0 && (
                        <tr>
                          <td className="py-2.5 px-5 text-slate-800 font-medium">Loss of Pay (LOP)</td>
                          <td className="py-2.5 px-5 text-slate-500 text-xs">Unpaid absence deduction</td>
                          <td className="py-2.5 px-5 text-right font-bold text-rose-600">
                            - {formatINR(salary.lop)}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-slate-50 font-bold">
                        <td className="py-3 px-5 text-slate-900">Total Deductions</td>
                        <td className="py-3 px-5 text-slate-500 text-xs">PF + TDS + LOP</td>
                        <td className="py-3 px-5 text-right font-black text-rose-600">
                          - {formatINR(salary.totalDeductions)}
                        </td>
                      </tr>

                      {/* Net Take-Home */}
                      <tr className="bg-[#714B67]/10 border-t-2 border-[#714B67]">
                        <td className="py-4 px-5 font-black text-slate-900 text-base">
                          Estimated Net Take-Home
                        </td>
                        <td className="py-4 px-5 text-slate-600 text-xs">Gross - Deductions</td>
                        <td className="py-4 px-5 text-right font-black text-[#714B67] text-xl">
                          {formatINR(salary.netPay)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    Odoo Contract Reference: <strong>{emp.smartMetrics.activeContractId}</strong>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedEmployee(null);
                      setActiveNavTab("Contracts");
                    }}
                    className="inline-flex items-center gap-2 text-sm text-[#714B67] hover:underline font-bold"
                  >
                    <span>View in Contracts Hub</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: BANKING & STATUTORY (With Anomaly Warning for Rahul Mishra) */}
            {activeDrawerTab === "banking" && (
              <div className="space-y-5">
                {/* DELIBERATE ANOMALY WARNING BANNER */}
                {isBankMissing ? (
                  <div className="p-5 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-900 space-y-3 shadow-xs">
                    <div className="flex items-start gap-3.5">
                      <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-sm text-amber-900">
                          Critical Validation Warning: Missing Bank Account Details
                        </h4>
                        <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                          This employee ({emp.name}) does not have an active bank account number or IFSC code recorded in the system. 
                          Automated salary payruns cannot disburse funds until valid banking details are linked.
                        </p>
                      </div>
                    </div>

                    {!isEditingBank && (
                      <div className="pt-2 border-t border-amber-200 flex justify-end">
                        <button
                          onClick={() => {
                            setIsEditingBank(true);
                            setBankNameInput("HDFC Bank");
                            setAccountNumberInput("50100492817263");
                            setIfscInput("HDFC0004512");
                          }}
                          className="bg-[#00A09D] hover:bg-[#008A87] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Link Bank Account Now</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <span className="font-bold text-sm">
                        Bank account verified &amp; ready for automated pay runs
                      </span>
                    </div>
                    {bankSuccessMsg && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-md">
                        Updated Successfully!
                      </span>
                    )}
                  </div>
                )}

                {/* Inline Bank Update Form */}
                {isEditingBank ? (
                  <form onSubmit={handleSaveBank} className="p-5 border border-slate-200 rounded-xl bg-slate-50 space-y-4">
                    <h4 className="font-bold text-slate-900 text-sm">Enter Bank Disbursement Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Bank Name</label>
                        <input
                          type="text"
                          required
                          value={bankNameInput}
                          onChange={(e) => setBankNameInput(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Account Number</label>
                        <input
                          type="text"
                          required
                          value={accountNumberInput}
                          onChange={(e) => setAccountNumberInput(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-semibold text-slate-700 block mb-1">IFSC Code</label>
                        <input
                          type="text"
                          required
                          value={ifscInput}
                          onChange={(e) => setIfscInput(e.target.value)}
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-lg bg-white text-sm text-slate-900 uppercase focus:outline-none focus:ring-2 focus:ring-[#714B67]"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingBank(false)}
                        className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#714B67] hover:bg-[#5C3D54] text-white rounded-lg text-xs font-bold"
                      >
                        Save &amp; Verify Account
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Bank Account Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-500 block text-xs font-medium">Bank Name</span>
                        <span className="font-bold text-slate-900 text-base">
                          {emp.bankDetails.bankName || "None"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs font-medium">Account Number</span>
                        <span className="font-mono font-bold text-slate-900 text-base">
                          {emp.bankDetails.accountNumber ? `•••• •••• ${emp.bankDetails.accountNumber.slice(-4)}` : "Not provided"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs font-medium">IFSC Code</span>
                        <span className="font-mono font-bold text-slate-900 text-base">
                          {emp.bankDetails.ifscCode || "Not provided"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs font-medium">Verification Status</span>
                        <span className="font-bold text-slate-900 text-sm">
                          {emp.bankDetails.isVerified ? "Verified (Automated)" : "Unverified"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statutory Numbers */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Indian Statutory Compliance Identifiers
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 block text-xs font-medium">PAN (Income Tax)</span>
                      <span className="font-mono font-bold text-slate-900 text-base">{emp.panNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs font-medium">UAN (EPFO / Provident Fund)</span>
                      <span className="font-mono font-bold text-slate-900 text-base">{emp.uanNumber}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ATTENDANCE & TIME OFF */}
            {activeDrawerTab === "attendance" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <div className="text-slate-500 text-xs font-semibold">Attendance Rate</div>
                    <div className="text-3xl font-black text-[#00A09D] mt-1">
                      {emp.smartMetrics.attendancePercentage}%
                    </div>
                    <div className="text-xs text-slate-600 mt-1">Current month health</div>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <div className="text-slate-500 text-xs font-semibold">Paid Leave Balance</div>
                    <div className="text-3xl font-black text-[#714B67] mt-1">
                      {emp.smartMetrics.leaveBalance} Days
                    </div>
                    <div className="text-xs text-slate-600 mt-1">Out of 18 allocated</div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-5 py-3 font-bold text-slate-800 text-sm">
                    Recent Daily Check-In Logs
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-xs border-b border-slate-200 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="py-2.5 px-4">Date</th>
                        <th className="py-2.5 px-4">In</th>
                        <th className="py-2.5 px-4">Out</th>
                        <th className="py-2.5 px-4 text-right">Hours</th>
                        <th className="py-2.5 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-900">2026-09-04</td>
                        <td className="py-2.5 px-4 text-slate-700">08:58</td>
                        <td className="py-2.5 px-4 text-slate-700">18:05</td>
                        <td className="py-2.5 px-4 text-right text-slate-800 font-semibold">9.1 hrs</td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="px-2.5 py-0.5 rounded-md text-xs bg-teal-50 text-teal-800 font-bold border border-teal-200">
                            Present
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-900">2026-09-03</td>
                        <td className="py-2.5 px-4 text-slate-700">09:05</td>
                        <td className="py-2.5 px-4 text-slate-700">18:00</td>
                        <td className="py-2.5 px-4 text-right text-slate-800 font-semibold">8.9 hrs</td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="px-2.5 py-0.5 rounded-md text-xs bg-teal-50 text-teal-800 font-bold border border-teal-200">
                            Present
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 font-bold text-slate-900">2026-09-02</td>
                        <td className="py-2.5 px-4 text-slate-700">09:12</td>
                        <td className="py-2.5 px-4 text-slate-700">18:15</td>
                        <td className="py-2.5 px-4 text-right text-slate-800 font-semibold">9.0 hrs</td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="px-2.5 py-0.5 rounded-md text-xs bg-teal-50 text-teal-800 font-bold border border-teal-200">
                            Present
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between text-sm text-slate-600">
            <span>Employee Master: <strong>{emp.id}</strong></span>
            <button
              onClick={() => setSelectedEmployee(null)}
              className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
