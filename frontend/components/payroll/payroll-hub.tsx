"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import { PayrunEngine } from "./payrun-engine";
import { SalaryStructure, SalaryRule, PayslipRecord, INITIAL_SALARY_RULES, INITIAL_STRUCTURES } from "@/lib/mock-data";
import { Search, Info, TrendingUp, Users, Calendar, AlertCircle } from "lucide-react";

export function PayrollHub() {
  const { activePayrollTab } = useStore();

  if (activePayrollTab === "Payruns") {
    return <PayrunEngine />;
  }

  if (activePayrollTab === "Payslips") {
    return <PayslipsHub />;
  }

  if (activePayrollTab === "Structures") {
    return <StructuresHub />;
  }

  if (activePayrollTab === "Rules") {
    return <RulesHub />;
  }

  // Default is Dashboard
  return <PayrollDashboard />;
}

// ----------------------------------------------------------------------
// 1. DASHBOARD COMPONENT
// ----------------------------------------------------------------------
function PayrollDashboard() {
  const { payrunBatch, timeOff, employees } = useStore();
  
  // Calculate top level stats based on mock data
  const totalNetPaid = 1840000;
  const payslipsGenerated = 148;
  const avgSalary = 12432;
  const approvedTimeOff = 34;
  const attendanceHealth = 94;

  return (
    <div className="flex-1 p-4 md:p-8 bg-slate-50 min-h-full">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payroll Dashboard</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Dashboard should help payroll/HR users understand payments, staffing impact, leave patterns, and attendance quality for the selected period.</p>
        </div>
      </div>

      {/* Filters (Mock UI) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Period</label>
          <select className="w-full p-2 bg-white border border-slate-200 rounded-md text-sm font-medium shadow-sm outline-none">
            <option>Sep 2026</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Department</label>
          <select className="w-full p-2 bg-white border border-slate-200 rounded-md text-sm font-medium shadow-sm outline-none">
            <option>All Departments</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Employee Type</label>
          <select className="w-full p-2 bg-white border border-slate-200 rounded-md text-sm font-medium shadow-sm outline-none">
            <option>All Types</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Company</label>
          <select className="w-full p-2 bg-white border border-slate-200 rounded-md text-sm font-medium shadow-sm outline-none">
            <option>Odo Pvt ltd</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Net Salary Paid</p>
          <div className="mt-2">
            <h3 className="text-2xl font-black text-slate-900">₹ 18.4L</h3>
            <p className="text-xs font-medium text-emerald-600 mt-1">+8.5% vs previous month</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payslips Generated</p>
          <div className="mt-2">
            <h3 className="text-2xl font-black text-slate-900">{payslipsGenerated}</h3>
            <p className="text-xs font-medium text-slate-500 mt-1">142 paid, 6 pending</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Salary / Employee</p>
          <div className="mt-2">
            <h3 className="text-2xl font-black text-slate-900">₹ {avgSalary.toLocaleString('en-IN')}</h3>
            <p className="text-xs font-medium text-slate-500 mt-1">Based on current payrun</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Time Off Days</p>
          <div className="mt-2">
            <h3 className="text-2xl font-black text-slate-900">{approvedTimeOff} Days</h3>
            <p className="text-xs font-medium text-emerald-600 mt-1">Across selected period</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attendance Health</p>
          <div className="mt-2">
            <h3 className="text-2xl font-black text-slate-900">{attendanceHealth}%</h3>
            <p className="text-xs font-medium text-slate-500 mt-1">Present / reviewed records</p>
          </div>
        </div>
      </div>

      {/* Middle Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart 1: Salary Cost by Department */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-900">Salary Cost by Department</h2>
            <p className="text-xs text-slate-500">Source: Payslips + Employee Department</p>
          </div>
          <div className="flex-1 flex items-end justify-around gap-2 px-2 h-40">
            {/* Mock Bars */}
            {[
              { label: "HR", val: 110 },
              { label: "Sales", val: 210 },
              { label: "Support", val: 90 },
              { label: "Finance", val: 130 },
              { label: "IT", val: 270 },
            ].map(col => (
              <div key={col.label} className="flex flex-col items-center justify-end w-full group">
                <div className="text-[10px] font-bold text-blue-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">₹{col.val}k</div>
                <div 
                  className="w-full max-w-[40px] bg-blue-100 border border-blue-300 rounded-t-md relative"
                  style={{ height: `${(col.val / 300) * 100}%` }}
                ></div>
                <div className="text-xs font-medium text-slate-600 mt-2">{col.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Monthly Net Salary Trend */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-900">Monthly Net Salary Trend</h2>
            <p className="text-xs text-slate-500">Source: Historical Payslips / Payruns</p>
          </div>
          <div className="flex-1 relative w-full h-40 border-b border-l border-slate-100">
            {/* Mock Line Chart Using SVG */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path 
                d="M 0,70 L 20,60 L 40,80 L 60,65 L 80,75 L 100,60" 
                fill="none" 
                stroke="#2563eb" 
                strokeWidth="2" 
                vectorEffect="non-scaling-stroke"
              />
              <circle cx="60" cy="65" r="3" fill="#2563eb" />
            </svg>
            <div className="absolute left-[56%] top-[55%] text-[10px] font-bold text-blue-600 bg-white px-1">15.0L</div>
            
            {/* X-axis labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-2">
              <span className="text-[10px] text-slate-400 font-medium">Apr</span>
              <span className="text-[10px] text-slate-400 font-medium">May</span>
              <span className="text-[10px] text-slate-400 font-medium">Jun</span>
              <span className="text-[10px] text-slate-400 font-medium">Jul</span>
              <span className="text-[10px] text-slate-400 font-medium">Aug</span>
              <span className="text-[10px] text-slate-400 font-medium">Sep</span>
            </div>
          </div>
        </div>

        {/* Chart 3: Alerts & Status */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900">Payslip Status & Payroll Alerts</h2>
            <p className="text-xs text-slate-500">Source: Payrun + Payslip validation</p>
          </div>
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-700 mb-2">Status split</p>
            {/* Stacked Bar */}
            <div className="w-full h-6 rounded-md overflow-hidden flex border border-slate-200 shadow-inner">
              <div className="h-full bg-emerald-200 border-r border-emerald-300" style={{ width: '55%' }}></div>
              <div className="h-full bg-blue-200 border-r border-blue-300" style={{ width: '25%' }}></div>
              <div className="h-full bg-amber-200 border-r border-amber-300" style={{ width: '15%' }}></div>
              <div className="h-full bg-rose-200" style={{ width: '5%' }}></div>
            </div>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300"></div><span className="text-[10px] font-bold text-slate-600">Paid</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-200 border border-blue-300"></div><span className="text-[10px] font-bold text-slate-600">Done</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-200 border border-amber-300"></div><span className="text-[10px] font-bold text-slate-600">Pending</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-200 border border-rose-300"></div><span className="text-[10px] font-bold text-slate-600">Warning</span></div>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700 mb-2">Current alerts</p>
            <ul className="space-y-1.5">
              <li className="text-xs font-medium text-rose-600 flex items-center gap-2">• 2 employees missing bank account</li>
              <li className="text-xs font-medium text-rose-600 flex items-center gap-2">• 1 duplicate payslip warning</li>
              <li className="text-xs font-medium text-slate-600 flex items-center gap-2">• 4 drafts still not validated</li>
              <li className="text-xs font-medium text-slate-600 flex items-center gap-2">• 3 contracts expiring this month</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Row Overviews */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-8">
        
        {/* Attendance */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col relative">
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-900">Attendance Overview</h2>
            <p className="text-xs text-slate-500">Source: Attendance</p>
          </div>
          <div className="flex-1 flex items-end justify-around gap-2 h-24">
            <div className="flex flex-col items-center justify-end w-full group">
              <div className="text-[10px] font-bold text-blue-600 mb-1">94</div>
              <div className="w-8 bg-blue-100 border border-blue-300 rounded-t-md h-20"></div>
              <div className="text-xs font-medium text-slate-600 mt-2">Present</div>
            </div>
            <div className="flex flex-col items-center justify-end w-full group">
              <div className="text-[10px] font-bold text-blue-600 mb-1">18</div>
              <div className="w-8 bg-blue-100 border border-blue-300 rounded-t-md h-8"></div>
              <div className="text-xs font-medium text-slate-600 mt-2">Late</div>
            </div>
            <div className="flex flex-col items-center justify-end w-full group">
              <div className="text-[10px] font-bold text-blue-600 mb-1">9</div>
              <div className="w-8 bg-blue-100 border border-blue-300 rounded-t-md h-4"></div>
              <div className="text-xs font-medium text-slate-600 mt-2">Absent</div>
            </div>
            <div className="flex flex-col items-center justify-end w-full group">
              <div className="text-[10px] font-bold text-blue-600 mb-1">4</div>
              <div className="w-8 bg-blue-100 border border-blue-300 rounded-t-md h-2"></div>
              <div className="text-xs font-medium text-slate-600 mt-2">Over</div>
            </div>
          </div>
          {/* Mock Tooltip / Overlay note */}
          <div className="absolute right-4 bottom-12 text-[10px] font-bold text-slate-500 leading-tight">
            Missing check-outs: 5<br/>
            Manual attendance edits: 8<br/>
            Attendance coverage: 94%
          </div>
        </div>

        {/* Time Off */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col col-span-2 overflow-x-auto">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900">Time Off Overview</h2>
            <p className="text-xs text-slate-500">Source: Time Off Requests + Allocations</p>
          </div>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 font-bold text-slate-600 border-r border-slate-200">Type</th>
                <th className="px-3 py-2 font-bold text-slate-600 border-r border-slate-200">Approved Days</th>
                <th className="px-3 py-2 font-bold text-slate-600 border-r border-slate-200">Pending</th>
                <th className="px-3 py-2 font-bold text-slate-600">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">Paid Time Off</td>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">24</td>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">3</td>
                <td className="px-3 py-2 font-medium text-slate-800">118 Days</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">Sick Leave</td>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">6</td>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">1</td>
                <td className="px-3 py-2 font-medium text-slate-800 italic text-slate-400">N/A</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">Casual Leave</td>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">4</td>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">2</td>
                <td className="px-3 py-2 font-medium text-slate-800">11 Days</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Department Overview */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-x-auto">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
              Department Overview
            </h2>
            <p className="text-xs text-slate-500 ml-3.5">Source: Employee + Contract + Payslip totals</p>
          </div>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-3 py-2 font-bold text-slate-600 border-r border-slate-200">Department</th>
                <th className="px-3 py-2 font-bold text-slate-600 border-r border-slate-200">Headcount</th>
                <th className="px-3 py-2 font-bold text-slate-600">Monthly Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">IT</td>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">18</td>
                <td className="px-3 py-2 font-medium text-slate-800">₹ 4.2L</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">Sales</td>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">22</td>
                <td className="px-3 py-2 font-medium text-slate-800">₹ 5.8L</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">HR</td>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">5</td>
                <td className="px-3 py-2 font-medium text-slate-800">₹ 1.9L</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">Support</td>
                <td className="px-3 py-2 font-medium text-slate-800 border-r border-slate-200">14</td>
                <td className="px-3 py-2 font-medium text-slate-800">₹ 3.3L</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 2. PAYSLIPS HUB
// ----------------------------------------------------------------------
function PayslipsHub() {
  const { payrunBatch } = useStore();
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipRecord | null>(null);

  if (selectedPayslip) {
    return (
      <div className="flex-1 p-6 md:p-8 bg-[#F4F6FA] min-h-full flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <button onClick={() => setSelectedPayslip(null)} className="text-sm text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider mr-2">← Back</button>
            Payslip / {selectedPayslip.employeeName} / {selectedPayslip.period}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Detailed salary computation for one employee.</p>
        </div>
        
        {/* Form View mimicking the screenshot */}
        <div className="max-w-5xl bg-white border border-slate-200 p-8 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm font-bold text-slate-500">Employee</span>
                <span className="text-sm font-bold text-slate-900">{selectedPayslip.employeeName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm font-bold text-slate-500">Salary Structure</span>
                <span className="text-sm font-bold text-slate-900">Regular Salary</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm font-bold text-slate-500">Pay Date</span>
                <span className="text-sm font-bold text-slate-900">February 2026</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm font-bold text-slate-500">Period</span>
                <span className="text-sm font-bold text-slate-900">{selectedPayslip.period}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm font-bold text-slate-500">Status</span>
                <span className="text-sm font-bold text-emerald-600">{selectedPayslip.status}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-sm font-bold text-slate-500">Worked Days</span>
                <span className="text-sm font-bold text-slate-900">{selectedPayslip.workedDays}</span>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-black text-[#714B67] mb-4 border-b-2 border-slate-100 pb-2">Salary computation</h3>
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200">
                <th className="py-3 px-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider">Name</th>
                <th className="py-3 px-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider">Category</th>
                <th className="py-3 px-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider text-right">Amount</th>
                <th className="py-3 px-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider text-right">Code</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-800">Basic Salary</td>
                <td className="py-3 px-4 text-slate-500">Basic</td>
                <td className="py-3 px-4 text-right font-medium text-slate-800">₹ {selectedPayslip.basic.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-right text-slate-400">BASIC</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-800">House Rent Allowance</td>
                <td className="py-3 px-4 text-slate-500">Allowance</td>
                <td className="py-3 px-4 text-right font-medium text-slate-800">₹ {selectedPayslip.hra.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-right text-slate-400">HRA</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-800">Standard Allowance</td>
                <td className="py-3 px-4 text-slate-500">Allowance</td>
                <td className="py-3 px-4 text-right font-medium text-slate-800">₹ {selectedPayslip.specialAllowance.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-right text-slate-400">SA</td>
              </tr>
              <tr className="bg-slate-50 font-bold border-y border-slate-200">
                <td className="py-3 px-4 text-slate-900">Gross Salary</td>
                <td className="py-3 px-4 text-slate-900">Gross</td>
                <td className="py-3 px-4 text-right text-slate-900">₹ {selectedPayslip.gross.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-right text-slate-400">GROSS</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-medium text-rose-600">Provident Fund</td>
                <td className="py-3 px-4 text-slate-500">Deduction</td>
                <td className="py-3 px-4 text-right font-medium text-rose-600">- ₹ {selectedPayslip.pf.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-right text-slate-400">PF</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="py-3 px-4 font-medium text-rose-600">TDS</td>
                <td className="py-3 px-4 text-slate-500">Deduction</td>
                <td className="py-3 px-4 text-right font-medium text-rose-600">- ₹ {selectedPayslip.tds.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 text-right text-slate-400">TDS</td>
              </tr>
              {selectedPayslip.lop > 0 && (
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-rose-600">Loss of Pay</td>
                  <td className="py-3 px-4 text-slate-500">Deduction</td>
                  <td className="py-3 px-4 text-right font-medium text-rose-600">- ₹ {selectedPayslip.lop.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-slate-400">LOP</td>
                </tr>
              )}
              <tr className="bg-[#00A09D]/5 font-black border-t border-b border-[#00A09D]/20">
                <td className="py-4 px-4 text-[#00A09D]">Net Salary</td>
                <td className="py-4 px-4 text-[#00A09D]">Net</td>
                <td className="py-4 px-4 text-right text-[#00A09D] text-lg">₹ {selectedPayslip.netPay.toLocaleString('en-IN')}</td>
                <td className="py-4 px-4 text-right text-[#00A09D]/60">NET</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-slate-400 mt-6 italic">Useful note: This form allows printing/PDF export for the final employee.</p>
        </div>
      </div>
    );
  }

  // Payslips List View
  return (
    <div className="flex-1 p-6 md:p-8 bg-[#F4F6FA] min-h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Payslips</h1>
          <p className="text-sm font-medium text-slate-500">A list of all individual payslips generated across payruns.</p>
        </div>
        <button className="px-4 py-2 bg-white text-slate-700 font-bold text-sm rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50">
          Export Payslips
        </button>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="relative w-72">
          <input type="text" placeholder="Search payslips..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg shadow-sm outline-none focus:border-[#00A09D]" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1 bg-white">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600">Employee</th>
              <th className="px-6 py-4 font-bold text-slate-600">Period</th>
              <th className="px-6 py-4 font-bold text-slate-600">Basic</th>
              <th className="px-6 py-4 font-bold text-slate-600">Net Salary</th>
              <th className="px-6 py-4 font-bold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payrunBatch.payslips.map(slip => (
              <tr key={slip.id} onClick={() => setSelectedPayslip(slip)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                <td className="px-6 py-4 font-bold text-slate-900">{slip.employeeName}</td>
                <td className="px-6 py-4 font-medium text-slate-700">{slip.period}</td>
                <td className="px-6 py-4 font-medium text-slate-700">₹ {slip.basic.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 font-black text-[#00A09D]">₹ {slip.netPay.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    slip.status === "Paid" ? "bg-emerald-100 text-emerald-700" :
                    slip.status === "Draft" ? "bg-slate-100 text-slate-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {slip.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-[#F8F9EC] border-t border-slate-200 text-xs font-medium text-slate-500 italic">
          Useful note: selecting any payslip opens the detailed salary computation.
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 3. STRUCTURES HUB
// ----------------------------------------------------------------------
function StructuresHub() {
  const [selectedStr, setSelectedStr] = useState<SalaryStructure | null>(null);

  if (selectedStr) {
    return (
      <div className="flex-1 p-6 md:p-8 bg-[#F4F6FA] min-h-full flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <button onClick={() => setSelectedStr(null)} className="text-sm text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider mr-2">← Back</button>
            Salary Structure / {selectedStr.name}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Form view with its salary rules.</p>
        </div>

        <div className="max-w-5xl bg-white border border-slate-200 p-8 rounded-xl shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-6 border-b border-slate-100">
             <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">Structure Name</label>
                <div className="text-lg font-black text-slate-900">{selectedStr.name}</div>
             </div>
             <div>
                <label className="block text-sm font-bold text-slate-500 mb-1">Status</label>
                <div className="text-lg font-black text-[#00A09D]">{selectedStr.status}</div>
             </div>
          </div>
          
          <h3 className="text-lg font-black text-[#714B67] mb-4">Salary Rules</h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm border-collapse bg-white">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider">Name</th>
                  <th className="py-3 px-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider">Code</th>
                  <th className="py-3 px-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider">Category</th>
                  <th className="py-3 px-4 font-bold text-slate-600 uppercase text-[10px] tracking-wider text-right">Sequence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INITIAL_SALARY_RULES.filter(r => selectedStr.ruleCodes.includes(r.code)).map(rule => (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{rule.name}</td>
                    <td className="py-3 px-4 font-medium text-slate-500">{rule.code}</td>
                    <td className="py-3 px-4 font-medium text-slate-500">{rule.category}</td>
                    <td className="py-3 px-4 font-medium text-slate-500 text-right">{rule.sequence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-6 italic">Useful note: rules within structure determine the computed payslip lines.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-[#F4F6FA] min-h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Salary Structures</h1>
          <p className="text-sm font-medium text-slate-500">List view of configured salary structures.</p>
        </div>
        <button className="px-5 py-2.5 bg-[#00A09D] hover:bg-[#008A87] text-white font-bold text-sm rounded-lg shadow-sm transition-colors uppercase tracking-wider">
          New Structure
        </button>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="relative w-72">
          <input type="text" placeholder="Search structures..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg shadow-sm outline-none focus:border-[#00A09D]" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600">Structure Name</th>
              <th className="px-6 py-4 font-bold text-slate-600">Code</th>
              <th className="px-6 py-4 font-bold text-slate-600">Rules</th>
              <th className="px-6 py-4 font-bold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {INITIAL_STRUCTURES.map(str => (
              <tr key={str.id} onClick={() => setSelectedStr(str)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                <td className="px-6 py-4 font-bold text-slate-900">{str.name}</td>
                <td className="px-6 py-4 font-medium text-slate-500">{str.code}</td>
                <td className="px-6 py-4 font-medium text-slate-700">{str.rulesCount} rules</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${str.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {str.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-[#F8F9EC] border-t border-slate-200 text-xs font-medium text-slate-500 italic">
          Useful note: the salary structure selected on an employee contract will define rule calculations.
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// 4. RULES HUB
// ----------------------------------------------------------------------
function RulesHub() {
  const [selectedRule, setSelectedRule] = useState<SalaryRule | null>(null);

  if (selectedRule) {
    return (
      <div className="flex-1 p-6 md:p-8 bg-[#F4F6FA] min-h-full flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <button onClick={() => setSelectedRule(null)} className="text-sm text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider mr-2">← Back</button>
            Salary Rule / {selectedRule.name}
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Configuration form for a specific salary computation rule.</p>
        </div>

        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          <div className="space-y-6">
             <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Rule Name</label>
                <input type="text" readOnly value={selectedRule.name} className="w-full p-2.5 bg-white border border-slate-200 rounded-md font-bold text-slate-900 shadow-sm" />
             </div>
             <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                <input type="text" readOnly value={selectedRule.category} className="w-full p-2.5 bg-white border border-slate-200 rounded-md font-bold text-slate-900 shadow-sm" />
             </div>
             <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Code</label>
                <input type="text" readOnly value={selectedRule.code} className="w-full p-2.5 bg-white border border-slate-200 rounded-md font-bold text-slate-900 shadow-sm" />
             </div>
          </div>
          <div className="space-y-6">
             <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Computation Method</label>
                <input type="text" readOnly value={selectedRule.computationMethod} className="w-full p-2.5 bg-white border border-slate-200 rounded-md font-bold text-slate-900 shadow-sm" />
             </div>
             <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Computation Details</label>
                <input type="text" readOnly value={selectedRule.equation} className="w-full p-2.5 bg-white border border-slate-200 rounded-md font-bold text-slate-900 shadow-sm" />
             </div>
             <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Condition based on</label>
                <input type="text" readOnly value={selectedRule.condition} className="w-full p-2.5 bg-white border border-slate-200 rounded-md font-bold text-slate-900 shadow-sm" />
             </div>
          </div>

          <div className="md:col-span-2 mt-4 bg-[#F8F9EC] border border-slate-200 rounded-xl p-6 relative">
            <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-[#00A09D]"/> Computation Note:</h4>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-2 mt-3">
               <li><strong>Fixed Amount:</strong> uses the exact value entered, e.g. Meal Allowance = 2,000.</li>
               <li><strong>Percentage:</strong> uses the rule as a percentage of a selected base such as Contract Wage, Basic Salary, or Gross Salary, e.g. HRA = 20% × Basic Salary.</li>
               <li><strong>Python Code / Formula:</strong> is used for advanced calculations where fixed or percentage methods are not sufficient, such as attendance-based salary, overtime, unpaid leave deductions, or calculations using multiple salary-rule values.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-[#F4F6FA] min-h-full flex flex-col">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Salary Rules</h1>
          <p className="text-sm font-medium text-slate-500">List view of building blocks for salary computation.</p>
        </div>
        <button className="px-5 py-2.5 bg-[#00A09D] hover:bg-[#008A87] text-white font-bold text-sm rounded-lg shadow-sm transition-colors uppercase tracking-wider">
          New Rule
        </button>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="relative w-72">
          <input type="text" placeholder="Search rules..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg shadow-sm outline-none focus:border-[#00A09D]" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600">Rule Name</th>
              <th className="px-6 py-4 font-bold text-slate-600">Code</th>
              <th className="px-6 py-4 font-bold text-slate-600">Category</th>
              <th className="px-6 py-4 font-bold text-slate-600">Computation</th>
              <th className="px-6 py-4 font-bold text-slate-600">Sequence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {INITIAL_SALARY_RULES.map(rule => (
              <tr key={rule.id} onClick={() => setSelectedRule(rule)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                <td className="px-6 py-4 font-bold text-slate-900">{rule.name}</td>
                <td className="px-6 py-4 font-medium text-slate-500">{rule.code}</td>
                <td className="px-6 py-4 font-medium text-slate-700">{rule.category}</td>
                <td className="px-6 py-4 font-medium text-slate-700">{rule.computationMethod}</td>
                <td className="px-6 py-4 font-medium text-slate-500">{rule.sequence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
