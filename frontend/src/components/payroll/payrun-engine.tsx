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
  Search,
  X
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { formatINR } from "@/lib/utils";
import { PayslipRecord } from "@/lib/mock-data";

export function PayrunEngine({ setActivePayrollTab }: { setActivePayrollTab?: (tab: string) => void }) {
  const {
    payrunBatch,
    recomputeBatch,
    validateBatch,
    markBatchPaid,
    setSelectedPayslip,
    isPayrunWizardOpen,
    setIsPayrunWizardOpen,
    employees,
    createPayrunBatch
  } = useStore();

  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Wizard state
  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [wizStructure, setWizStructure] = useState("Regular Pay");
  const [wizPeriodStr, setWizPeriodStr] = useState("February 2026");
  const [wizSelectedEmps, setWizSelectedEmps] = useState<Set<string>>(new Set(employees.map(e => e.id)));

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 4000);
  };

  const handleCreatePayrun = () => {
    createPayrunBatch(wizPeriodStr, wizStructure, "All Departments", Array.from(wizSelectedEmps));
    setIsPayrunWizardOpen(false);
    setWizardStep(1);
    setViewMode("detail");
    showFeedback("Payrun created successfully!");
  };

  if (isPayrunWizardOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[90vh]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h2 className="text-xl font-black text-slate-900">Create Payrun</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">
                {wizardStep === 1 ? "Step 1: Select Scope" : "Step 2: Select Employees"}
              </p>
            </div>
            <button onClick={() => setIsPayrunWizardOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 bg-white">
            {wizardStep === 1 ? (
              <div className="max-w-md mx-auto space-y-6 mt-4">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-slate-700 mb-2">Pay Structure</label>
                  <select 
                    value={wizStructure}
                    onChange={e => setWizStructure(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium shadow-sm outline-none focus:border-blue-500"
                  >
                    <option>Regular Pay</option>
                    <option>Executive Pay</option>
                    <option>Contractor Hourly</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-slate-700 mb-2">Period Name</label>
                  <input 
                    type="text" 
                    value={wizPeriodStr}
                    onChange={e => setWizPeriodStr(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium shadow-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-slate-700 mb-2">Period Start</label>
                    <input type="date" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium shadow-sm outline-none focus:border-blue-500" defaultValue="2026-02-01" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-bold text-slate-700 mb-2">Period End</label>
                    <input type="date" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium shadow-sm outline-none focus:border-blue-500" defaultValue="2026-02-28" />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4 text-sm font-medium text-slate-600">
                  Select the employees to include in this payrun.
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input 
                            type="checkbox" 
                            checked={wizSelectedEmps.size === employees.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setWizSelectedEmps(new Set(employees.map(em => em.id)));
                              } else {
                                setWizSelectedEmps(new Set());
                              }
                            }}
                          />
                        </th>
                        <th className="p-3 font-bold text-slate-600">Employee</th>
                        <th className="p-3 font-bold text-slate-600">Working Hours</th>
                        <th className="p-3 font-bold text-slate-600">Start Date</th>
                        <th className="p-3 font-bold text-slate-600">Wage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {employees.map(emp => (
                        <tr key={emp.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => {
                          const next = new Set(wizSelectedEmps);
                          if (next.has(emp.id)) next.delete(emp.id);
                          else next.add(emp.id);
                          setWizSelectedEmps(next);
                        }}>
                          <td className="p-3 text-center">
                            <input type="checkbox" checked={wizSelectedEmps.has(emp.id)} readOnly />
                          </td>
                          <td className="p-3 font-bold text-slate-900">{emp.name}</td>
                          <td className="p-3 text-slate-600">{emp.workingSchedule}</td>
                          <td className="p-3 text-slate-600">{emp.joinedDate}</td>
                          <td className="p-3 text-slate-900 font-medium">{formatINR(emp.monthlyCTC)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            {wizardStep === 1 ? (
              <>
                <button onClick={() => setIsPayrunWizardOpen(false)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={() => setWizardStep(2)} className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg shadow-sm cursor-pointer hover:bg-blue-700 transition-colors">
                  Continue
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setWizardStep(1)} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-sm rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                  ← Back
                </button>
                <button onClick={handleCreatePayrun} disabled={wizSelectedEmps.size === 0} className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg shadow-sm cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50">
                  Create Payrun
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="flex-1 p-6 md:p-8 bg-white min-h-full flex flex-col">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payruns</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Payrun list for payroll periods.</p>
            </div>
            <button onClick={() => setIsPayrunWizardOpen(true)} className="px-5 py-2.5 bg-[#00A09D] hover:bg-[#008A87] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" /> New
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-64">
            <input type="text" placeholder="Search payruns..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg shadow-sm outline-none focus:border-[#00A09D]" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Batch */}
          <div 
            onClick={() => setViewMode("detail")}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{payrunBatch.period}</h3>
                <p className="text-xs text-slate-500 font-medium">01-{payrunBatch.period.replace(" ", "-")} - 28-{payrunBatch.period.replace(" ", "-")}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1 text-slate-600 font-medium text-sm">
                <Users className="w-4 h-4 text-slate-400" /> {payrunBatch.payslips.length} Employees
              </div>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                payrunBatch.status === "Paid" ? "bg-emerald-100 text-emerald-700" :
                payrunBatch.status === "Validated" ? "bg-blue-100 text-blue-700" :
                "bg-slate-100 text-slate-700"
              }`}>
                {payrunBatch.status}
              </span>
            </div>
            {payrunBatch.payslips.filter(s => s.hasBankWarning).length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100/50 flex items-center gap-1.5 text-amber-600 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5" />
                {payrunBatch.payslips.filter(s => s.hasBankWarning).length} missing bank detail(s)
              </div>
            )}
          </div>

          {/* Dummy Paid Batch */}
          <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-lg">January 2026</h3>
                <p className="text-xs text-slate-500 font-medium">01-Jan-2026 - 31-Jan-2026</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1 text-slate-600 font-medium text-sm">
                <Users className="w-4 h-4 text-slate-400" /> 8 Employees
              </div>
              <span className="px-2 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                Paid
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Detail View
  const missingBankCount = payrunBatch.payslips.filter((s) => s.hasBankWarning).length;
  const steps = ["Draft", "Computed", "Validated", "Paid"];
  const currentStepIdx = steps.indexOf(payrunBatch.status);

  return (
    <div className="flex-1 p-6 md:p-8 bg-white min-h-full flex flex-col">
      {/* Top Header */}
      <div className="mb-6 border-b border-slate-100 pb-4">
        <div className="flex flex-col mb-4">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Payrun / {payrunBatch.period}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage payroll execution.</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {payrunBatch.status === "Draft" && (
            <button onClick={() => {
              recomputeBatch();
              showFeedback("Batch successfully computed! Earnings, PF, TDS and LOP applied.");
            }} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer">
              Compute
            </button>
          )}
          {payrunBatch.status === "Computed" && (
            <>
              <button onClick={() => {
                recomputeBatch();
                showFeedback("Batch recomputed successfully against active employee records.");
              }} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors border border-slate-200 cursor-pointer">
                Recompute
              </button>
              <button onClick={() => {
                validateBatch();
                showFeedback("Payrun batch validated and locked!");
              }} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer">
                Validate
              </button>
            </>
          )}
          {payrunBatch.status === "Validated" && (
            <button onClick={() => {
              markBatchPaid();
              showFeedback("Funds Disbursed! Bank files and payslips generated.");
            }} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer">
              Mark Paid
            </button>
          )}
          <button className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors border border-slate-200 ml-4">
            Send Payslips
          </button>
          <div className="flex-1 text-right">
            <button onClick={() => setViewMode("list")} className="text-sm text-slate-400 hover:text-slate-600 font-bold tracking-wider mr-2 cursor-pointer">← Back to Payruns</button>
          </div>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-center justify-between shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{actionFeedback}</span>
          </div>
        </div>
      )}

      {/* Form Details */}
      <div className="max-w-4xl mt-2 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4">
          <div className="flex items-center border-b border-slate-100 py-2">
            <span className="text-sm font-bold text-slate-600 w-1/3">Name</span>
            <span className="text-sm font-medium text-slate-900">{payrunBatch.name}</span>
          </div>
          <div className="flex items-center border-b border-slate-100 py-2">
            <span className="text-sm font-bold text-slate-600 w-1/3">Period</span>
            <span className="text-sm font-medium text-slate-900">{payrunBatch.period}</span>
          </div>
          <div className="flex items-center border-b border-slate-100 py-2">
            <span className="text-sm font-bold text-slate-600 w-1/3">Salary Structure</span>
            <span className="text-sm font-medium text-slate-900">{payrunBatch.structure}</span>
          </div>
          <div className="flex items-center border-b border-slate-100 py-2">
            <span className="text-sm font-bold text-slate-600 w-1/3">Status</span>
            <span className={`text-sm font-bold bg-slate-100 px-2 py-0.5 rounded ${
              payrunBatch.status === "Paid" ? "text-emerald-700 bg-emerald-50" : 
              payrunBatch.status === "Validated" ? "text-blue-700 bg-blue-50" : 
              "text-slate-700"
            }`}>
              {payrunBatch.status}
            </span>
          </div>
        </div>
      </div>

      {/* Payslips Table */}
      <h3 className="text-sm font-bold text-blue-600 mb-3">Payslips in this Payrun</h3>
      <div className="border border-slate-200 rounded-lg overflow-hidden flex-1">
        <table className="w-full text-left text-sm border-collapse bg-white">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 font-bold text-slate-600">Employee</th>
              <th className="py-3 px-4 font-bold text-slate-600">Working</th>
              <th className="py-3 px-4 font-bold text-slate-600 text-center">Worked (Days)</th>
              <th className="py-3 px-4 font-bold text-slate-600 text-right">Basic</th>
              <th className="py-3 px-4 font-bold text-slate-600 text-right">Gross</th>
              <th className="py-3 px-4 font-bold text-slate-600 text-right">Net</th>
              <th className="py-3 px-4 font-bold text-slate-600">Status</th>
              <th className="py-3 px-4 font-bold text-slate-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payrunBatch.payslips.map(slip => (
              <tr key={slip.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">{slip.employeeName}</td>
                <td className="py-3 px-4 font-medium text-slate-600">Standard 40h/week</td>
                <td className="py-3 px-4 font-medium text-slate-700 text-center">
                  {slip.workedDays} 
                  {slip.lopDays > 0 && <span className="text-rose-500 text-xs ml-1">(-{slip.lopDays})</span>}
                </td>
                <td className="py-3 px-4 font-medium text-slate-700 text-right">{formatINR(slip.basic)}</td>
                <td className="py-3 px-4 font-medium text-slate-700 text-right">{formatINR(slip.gross)}</td>
                <td className="py-3 px-4 font-medium text-[#00A09D] text-right">{formatINR(slip.netPay)}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    slip.status === "Paid" ? "bg-emerald-100 text-emerald-700" :
                    slip.status === "Validated" ? "bg-blue-100 text-blue-700" :
                    "bg-slate-100 text-slate-700"
                  }`}>
                    {slip.status}
                  </span>
                </td>
                  {/* View Payslip Modal trigger */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedPayslip(slip);
                        if (setActivePayrollTab) setActivePayrollTab("Payslips");
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#714B67] hover:text-white text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Payslip</span>
                    </button>
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
