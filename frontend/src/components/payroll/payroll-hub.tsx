"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import { PayrunEngine } from "./payrun-engine";
import { SalaryStructure, SalaryRule, PayslipRecord, INITIAL_SALARY_RULES, INITIAL_STRUCTURES } from "@/lib/mock-data";
import { Search, Info, TrendingUp, Users, Calendar, AlertCircle } from "lucide-react";

export function PayrollHub() {
  const { activePayrollTab, setActivePayrollTab } = useStore();

  if (activePayrollTab === "Payruns") {
    return <PayrunEngine setActivePayrollTab={setActivePayrollTab} />;
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
    <div className="flex-1 p-4 md:p-8 bg-white min-h-full">
      <div className="mb-8 border-b border-slate-100 pb-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payroll Dashboard</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Dashboard should help payroll/HR users understand payments, staffing impact, leave patterns, and attendance quality for the selected period.</p>
      </div>

      {/* Filters (Mock UI) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Period</label>
          <select className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm outline-none text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
            <option>Sep 2026</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Department</label>
          <select className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm outline-none text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
            <option>All Departments</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Employee Type</label>
          <select className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm outline-none text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
            <option>All Types</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1">Company</label>
          <select className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm outline-none text-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
            <option>Odo Pvt ltd</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-bold text-slate-600 mb-2">Total Net Salary Paid</p>
          <div>
            <h3 className="text-3xl font-black text-slate-900">₹ 18.4L</h3>
            <p className="text-xs font-bold text-emerald-600 mt-2">+2.5% vs previous month</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-bold text-slate-600 mb-2">Payslips Generated</p>
          <div>
            <h3 className="text-3xl font-black text-slate-900">{payslipsGenerated}</h3>
            <p className="text-xs font-bold text-slate-500 mt-2">142 paid, 6 pending</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-bold text-slate-600 mb-2">Avg Salary / Employee</p>
          <div>
            <h3 className="text-3xl font-black text-slate-900">₹ {avgSalary.toLocaleString('en-IN')}</h3>
            <p className="text-xs font-bold text-slate-500 mt-2">Based on current payrun</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-bold text-slate-600 mb-2">Approved Time Off Days</p>
          <div>
            <h3 className="text-3xl font-black text-slate-900">{approvedTimeOff} Days</h3>
            <p className="text-xs font-bold text-slate-500 mt-2">Across selected period</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <p className="text-sm font-bold text-slate-600 mb-2">Attendance Health</p>
          <div>
            <h3 className="text-3xl font-black text-slate-900">{attendanceHealth}%</h3>
            <p className="text-xs font-bold text-slate-500 mt-2">Present / reviewed records</p>
          </div>
        </div>
      </div>

      {/* Middle Row Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Chart 1: Salary Cost by Department */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900">Salary Cost by Department</h2>
            <p className="text-xs text-slate-500 font-medium">Source: Payslips + Employee Department</p>
          </div>
          <div className="flex-1 flex items-end justify-around gap-4 px-2 h-40">
            {[
              { label: "HR", val: 110, display: "₹ 1.1L" },
              { label: "Sales", val: 180, display: "₹ 1.8L" },
              { label: "Support", val: 90, display: "₹ 0.9L" },
              { label: "Finance", val: 130, display: "₹ 1.3L" },
              { label: "IT", val: 270, display: "₹ 2.7L" },
            ].map(col => (
              <div key={col.label} className="flex flex-col items-center justify-end w-full group h-full">
                <div className="text-[10px] font-bold text-blue-600 mb-2">{col.display}</div>
                <div 
                  className="w-full max-w-[48px] bg-[#D6F0FF] rounded-t-xl transition-all hover:bg-[#BDE6FF]"
                  style={{ height: `${(col.val / 300) * 100}%` }}
                ></div>
                <div className="text-xs font-bold text-slate-600 mt-3">{col.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Monthly Net Salary Trend */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900">Monthly Net Salary Trend</h2>
            <p className="text-xs text-slate-500 font-medium">Source: Historical Payslips / Payruns</p>
          </div>
          <div className="flex-1 relative w-full h-40">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-x-0 bottom-6 border-b border-slate-100"></div>
            <div className="absolute inset-x-0 bottom-[calc(6px+25%)] border-b border-slate-100"></div>
            <div className="absolute inset-x-0 bottom-[calc(6px+50%)] border-b border-slate-100"></div>
            <div className="absolute inset-x-0 bottom-[calc(6px+75%)] border-b border-slate-100"></div>
            
            {/* Mock Line Chart Using SVG */}
            <svg className="absolute inset-0 w-full h-full pb-6" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path 
                d="M 5,80 L 23,75 L 41,85 L 59,70 L 77,82 L 95,65" 
                fill="none" 
                stroke="#3B82F6" 
                strokeWidth="2.5" 
                vectorEffect="non-scaling-stroke"
              />
              <circle cx="59" cy="70" r="3.5" fill="#3B82F6" />
            </svg>
            <div className="absolute left-[54%] top-[45%] text-[10px] font-bold text-blue-600 bg-white px-1.5 py-0.5 rounded shadow-sm">18.4L</div>
            
            {/* X-axis labels */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
              <span className="text-xs text-slate-500 font-bold">Apr</span>
              <span className="text-xs text-slate-500 font-bold">May</span>
              <span className="text-xs text-slate-500 font-bold">Jun</span>
              <span className="text-xs text-slate-500 font-bold">Jul</span>
              <span className="text-xs text-slate-500 font-bold">Aug</span>
              <span className="text-xs text-slate-500 font-bold">Sep</span>
            </div>
          </div>
        </div>

        {/* Chart 3: Alerts & Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900">Payslip Status & Payroll Alerts</h2>
            <p className="text-xs text-slate-500 font-medium">Source: Payrun + Payslip validation</p>
          </div>
          <div className="mb-6">
            <p className="text-sm font-bold text-slate-700 mb-3">Status split</p>
            {/* Stacked Bar */}
            <div className="w-full h-8 rounded-lg overflow-hidden flex shadow-sm border border-slate-200">
              <div className="h-full bg-[#8DE8B6]" style={{ width: '55%' }}></div>
              <div className="h-full bg-[#BDE6FF]" style={{ width: '25%' }}></div>
              <div className="h-full bg-[#FFE5B4]" style={{ width: '15%' }}></div>
              <div className="h-full bg-[#FFC5C5]" style={{ width: '5%' }}></div>
            </div>
            <div className="flex justify-between mt-3 px-1">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#8DE8B6]"></div><span className="text-xs font-bold text-slate-600">Paid</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#BDE6FF]"></div><span className="text-xs font-bold text-slate-600">Done</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#FFE5B4]"></div><span className="text-xs font-bold text-slate-600">Pending</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#FFC5C5]"></div><span className="text-xs font-bold text-slate-600">Warning</span></div>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700 mb-3">Current alerts</p>
            <ul className="space-y-2">
              <li className="text-xs font-bold text-rose-600 flex items-center gap-2">• 2 employees missing bank account</li>
              <li className="text-xs font-bold text-rose-600 flex items-center gap-2">• 1 duplicate payslip warning</li>
              <li className="text-xs font-bold text-slate-700 flex items-center gap-2">• 4 drafts still not validated</li>
              <li className="text-xs font-bold text-slate-700 flex items-center gap-2">• 3 contracts expiring this month</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Row Overviews */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-8">
        
        {/* Attendance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col relative">
          <div className="mb-6">
            <h2 className="text-base font-bold text-slate-900">Attendance Overview</h2>
            <p className="text-xs text-slate-500 font-medium">Source: Attendance</p>
          </div>
          <div className="flex-1 flex items-end justify-around gap-2 h-24 mb-6">
            <div className="flex flex-col items-center justify-end w-full group">
              <div className="text-[10px] font-bold text-blue-600 mb-1">94</div>
              <div className="w-10 bg-[#D6F0FF] rounded-t-lg h-24"></div>
              <div className="text-xs font-bold text-slate-600 mt-2">Present</div>
            </div>
            <div className="flex flex-col items-center justify-end w-full group">
              <div className="text-[10px] font-bold text-blue-600 mb-1">18</div>
              <div className="w-10 bg-[#D6F0FF] rounded-t-lg h-8"></div>
              <div className="text-xs font-bold text-slate-600 mt-2">Late</div>
            </div>
            <div className="flex flex-col items-center justify-end w-full group">
              <div className="text-[10px] font-bold text-blue-600 mb-1">9</div>
              <div className="w-10 bg-[#D6F0FF] rounded-t-lg h-4"></div>
              <div className="text-xs font-bold text-slate-600 mt-2">Absent</div>
            </div>
            <div className="flex flex-col items-center justify-end w-full group">
              <div className="text-[10px] font-bold text-blue-600 mb-1">4</div>
              <div className="w-10 bg-[#D6F0FF] rounded-t-lg h-2"></div>
              <div className="text-xs font-bold text-slate-600 mt-2">Overtime</div>
            </div>
          </div>
          <div className="text-[11px] font-bold text-slate-600 space-y-1">
            <div className="flex justify-between"><span>Missing check-outs:</span> <span>5</span></div>
            <div className="flex justify-between"><span>Manual attendance edits:</span> <span>7</span></div>
            <div className="flex justify-between"><span>Attendance coverage:</span> <span>94%</span></div>
          </div>
        </div>

        {/* Time Off */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col col-span-2 overflow-x-auto">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Time Off Overview</h2>
            <p className="text-xs text-slate-500 font-medium">Source: Time Off Requests + Allocations</p>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden mt-2">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-700 border-b border-r border-slate-200">Type</th>
                  <th className="px-4 py-3 font-bold text-slate-700 border-b border-r border-slate-200">Approved Days</th>
                  <th className="px-4 py-3 font-bold text-slate-700 border-b border-r border-slate-200">Pending</th>
                  <th className="px-4 py-3 font-bold text-slate-700 border-b">Remaining Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900 border-b border-r border-slate-200">Paid Time Off</td>
                  <td className="px-4 py-3 font-medium text-slate-700 border-b border-r border-slate-200">24</td>
                  <td className="px-4 py-3 font-medium text-slate-700 border-b border-r border-slate-200">3</td>
                  <td className="px-4 py-3 font-medium text-slate-700 border-b">118 Days</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900 border-b border-r border-slate-200">Sick Leave</td>
                  <td className="px-4 py-3 font-medium text-slate-700 border-b border-r border-slate-200">6</td>
                  <td className="px-4 py-3 font-medium text-slate-700 border-b border-r border-slate-200">1</td>
                  <td className="px-4 py-3 font-medium text-slate-400 italic border-b">N/A</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900 border-r border-slate-200">Comp Off</td>
                  <td className="px-4 py-3 font-medium text-slate-700 border-r border-slate-200">4</td>
                  <td className="px-4 py-3 font-medium text-slate-700 border-r border-slate-200">2</td>
                  <td className="px-4 py-3 font-medium text-slate-700">11 Days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-x-auto">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              Department Overview
            </h2>
            <p className="text-xs text-slate-500 font-medium ml-4">Source: Employee + Contract + Payslip totals</p>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden mt-2">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-700 border-b border-r border-slate-200">Department</th>
                  <th className="px-4 py-3 font-bold text-slate-700 border-b border-r border-slate-200">Headcount</th>
                  <th className="px-4 py-3 font-bold text-slate-700 border-b">Monthly Salary</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900 border-b border-r border-slate-200">IT</td>
                  <td className="px-4 py-3 font-medium text-slate-700 border-b border-r border-slate-200">18</td>
                  <td className="px-4 py-3 font-medium text-slate-700 border-b">₹ 4.2L</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900 border-b border-r border-slate-200">Sales</td>
                  <td className="px-4 py-3 font-medium text-slate-700 border-b border-r border-slate-200">22</td>
                  <td className="px-4 py-3 font-medium text-slate-700 border-b">₹ 5.8L</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900 border-b border-r border-slate-200">HR</td>
                  <td className="px-4 py-3 font-medium text-slate-700 border-b border-r border-slate-200">8</td>
                  <td className="px-4 py-3 font-medium text-slate-700 border-b">₹ 1.9L</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-slate-900 border-r border-slate-200">Support</td>
                  <td className="px-4 py-3 font-medium text-slate-700 border-r border-slate-200">14</td>
                  <td className="px-4 py-3 font-medium text-slate-700">₹ 3.3L</td>
                </tr>
              </tbody>
            </table>
          </div>
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
      <div className="flex-1 p-6 md:p-8 bg-white min-h-full flex flex-col">
        <div className="mb-6">
          <div className="flex flex-col mb-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Payslip / {selectedPayslip.employeeName} / {selectedPayslip.period}
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Detailed salary computation for one employee.</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors">
              Compute
            </button>
            <button className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors border border-slate-200">
              Mark Paid
            </button>
            <button onClick={() => window.print()} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors border border-slate-200 ml-4 flex items-center gap-2">
              Print Payslip
            </button>
            <div className="flex-1 text-right">
              <button onClick={() => setSelectedPayslip(null)} className="text-sm text-slate-400 hover:text-slate-600 font-bold tracking-wider mr-2">← Back to Payslips</button>
            </div>
          </div>
        </div>
        
        {/* Form View mimicking the screenshot */}
        <div className="max-w-4xl mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-4 mb-10">
            <div className="flex items-center border-b border-slate-100 py-2">
              <span className="text-sm font-bold text-slate-600 w-1/3">Employee</span>
              <span className="text-sm font-medium text-slate-900">{selectedPayslip.employeeName}</span>
            </div>
            <div className="flex items-center border-b border-slate-100 py-2">
              <span className="text-sm font-bold text-slate-600 w-1/3">Period</span>
              <span className="text-sm font-medium text-slate-900">{selectedPayslip.period}</span>
            </div>
            <div className="flex items-center border-b border-slate-100 py-2">
              <span className="text-sm font-bold text-slate-600 w-1/3">Salary Structure</span>
              <span className="text-sm font-medium text-slate-900">Regular Salary</span>
            </div>
            <div className="flex items-center border-b border-slate-100 py-2">
              <span className="text-sm font-bold text-slate-600 w-1/3">Status</span>
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{selectedPayslip.status}</span>
            </div>
            <div className="flex items-center border-b border-slate-100 py-2">
              <span className="text-sm font-bold text-slate-600 w-1/3">Date</span>
              <span className="text-sm font-medium text-slate-900">February 2026</span>
            </div>
            <div className="flex items-center border-b border-slate-100 py-2">
              <span className="text-sm font-bold text-slate-600 w-1/3">Worked Days</span>
              <span className="text-sm font-medium text-slate-900">{selectedPayslip.workedDays}</span>
            </div>
          </div>
          
          <h3 className="text-sm font-bold text-blue-600 mb-3">Salary Computation</h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-4 font-bold text-slate-600">Rule</th>
                  <th className="py-3 px-4 font-bold text-slate-600">Category</th>
                  <th className="py-3 px-4 font-bold text-slate-600 text-right">Amount</th>
                  <th className="py-3 px-4 font-bold text-slate-600 text-right">Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">Basic Salary</td>
                  <td className="py-3 px-4 text-slate-500">Basic</td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">{selectedPayslip.basic.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-slate-500">BASIC</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">House Rent Allowance</td>
                  <td className="py-3 px-4 text-slate-500">Allowance</td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">{selectedPayslip.hra.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-slate-500">HRA</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">Standard Allowance</td>
                  <td className="py-3 px-4 text-slate-500">Allowance</td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">{selectedPayslip.specialAllowance.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-slate-500">SA</td>
                </tr>
                <tr className="bg-slate-50 font-bold border-y border-slate-200">
                  <td className="py-3 px-4 text-slate-900">Gross Salary</td>
                  <td className="py-3 px-4 text-slate-900">Gross</td>
                  <td className="py-3 px-4 text-right text-slate-900">{selectedPayslip.gross.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-slate-500">GROSS</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">Provident Fund</td>
                  <td className="py-3 px-4 text-slate-500">Deduction</td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">-{selectedPayslip.pf.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-slate-500">PF</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-slate-900">TDS</td>
                  <td className="py-3 px-4 text-slate-500">Deduction</td>
                  <td className="py-3 px-4 text-right font-medium text-slate-900">-{selectedPayslip.tds.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-slate-500">TDS</td>
                </tr>
                {selectedPayslip.lop > 0 && (
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">Loss of Pay</td>
                    <td className="py-3 px-4 text-slate-500">Deduction</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-900">-{selectedPayslip.lop.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right text-slate-500">LOP</td>
                  </tr>
                )}
                <tr className="bg-slate-50 font-bold border-t border-slate-200">
                  <td className="py-3 px-4 text-slate-900">Net Salary</td>
                  <td className="py-3 px-4 text-slate-900">Net</td>
                  <td className="py-3 px-4 text-right text-slate-900">{selectedPayslip.netPay.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-4 text-right text-slate-500">NET</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-4 italic font-medium">Useful note: The PRINT action generates the employee payslip as PDF, that PDF can be sent from the parent Payrun.</p>
        </div>
      </div>
    );
  }

  // Payslips List View
  return (
    <div className="flex-1 p-6 md:p-8 bg-white min-h-full flex flex-col">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payslips</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">List view of employee payslips.</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-64">
          <input type="text" placeholder="Search payslips..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg shadow-sm outline-none focus:border-blue-500" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <div className="relative">
          <select className="pl-4 pr-8 py-2 bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm rounded-lg shadow-sm outline-none appearance-none">
            <option>Period: Feb 2026</option>
          </select>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden flex-1 bg-white">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600">Employee</th>
              <th className="px-6 py-4 font-bold text-slate-600">Period</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-right">Basic</th>
              <th className="px-6 py-4 font-bold text-slate-600 text-right">Net Salary</th>
              <th className="px-6 py-4 font-bold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payrunBatch.payslips.map(slip => (
              <tr key={slip.id} onClick={() => setSelectedPayslip(slip)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                <td className="px-6 py-4 font-bold text-slate-900">{slip.employeeName}</td>
                <td className="px-6 py-4 font-medium text-slate-600">{slip.period}</td>
                <td className="px-6 py-4 font-medium text-slate-700 text-right">{slip.basic.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4 font-medium text-slate-700 text-right">{slip.netPay.toLocaleString('en-IN')}</td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-bold ${
                    slip.status === "Paid" ? "text-emerald-600" :
                    slip.status === "Draft" ? "text-slate-500" :
                    "text-blue-600"
                  }`}>
                    {slip.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pt-4 text-xs font-medium text-slate-500 italic">
        Useful note: selecting any payslip opens the detailed salary computation and PDF action for that employee.
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
      <div className="flex-1 p-6 md:p-8 bg-white min-h-full flex flex-col">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Salary Structure / {selectedStr.name}
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Form view with its salary rules.</p>
            </div>
            <button onClick={() => setSelectedStr(null)} className="text-sm text-slate-400 hover:text-slate-600 font-bold tracking-wider mr-2">← Back to Structures</button>
          </div>
        </div>

        <div className="max-w-4xl mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6 mb-10">
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-500 mb-2">Structure Name</label>
              <input type="text" readOnly value={selectedStr.name} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm outline-none text-slate-700" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-500 mb-2">Active</label>
              <input type="text" readOnly value={selectedStr.status === "Active" ? "True" : "False"} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm outline-none text-slate-700" />
            </div>
          </div>
          
          <h3 className="text-sm font-bold text-blue-600 mb-3">Salary Rules</h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm border-collapse bg-white">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-bold text-slate-600">Rule Name</th>
                  <th className="py-3 px-4 font-bold text-slate-600">Code</th>
                  <th className="py-3 px-4 font-bold text-slate-600">Category</th>
                  <th className="py-3 px-4 font-bold text-slate-600 text-right">Sequence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INITIAL_SALARY_RULES.filter(r => selectedStr.ruleCodes.includes(r.code)).map(rule => (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-900">{rule.name}</td>
                    <td className="py-3 px-4 font-medium text-slate-500">{rule.code}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{rule.category}</td>
                    <td className="py-3 px-4 font-medium text-slate-900 text-right">{rule.sequence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 mt-4 italic font-medium">Useful note: the order matters here. Keep sequence visible so participants understand the calculation order. Rules reordered here is just for reference.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-white min-h-full flex flex-col">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Salary Structures</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">List view.</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-64">
          <input type="text" placeholder="Search structures..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg shadow-sm outline-none focus:border-blue-500" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden flex-1 bg-white">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600">Structure Name</th>
              <th className="px-6 py-4 font-bold text-slate-600">Rules</th>
              <th className="px-6 py-4 font-bold text-slate-600">Employees</th>
              <th className="px-6 py-4 font-bold text-slate-600">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {INITIAL_STRUCTURES.map(str => (
              <tr key={str.id} onClick={() => setSelectedStr(str)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                <td className="px-6 py-4 font-bold text-slate-900">{str.name}</td>
                <td className="px-6 py-4 font-medium text-slate-700">{str.rulesCount} rules</td>
                <td className="px-6 py-4 font-medium text-slate-700">14 employees</td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-bold ${str.status === "Active" ? "text-emerald-600" : "text-slate-500"}`}>
                    {str.status === "Active" ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pt-4 text-xs font-medium text-slate-500 italic">
        Useful note: the salary structure selected on an employee contract will define rule calculations.
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
      <div className="flex-1 p-6 md:p-8 bg-white min-h-full flex flex-col">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Salary Rule / {selectedRule.name}
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Form view.</p>
            </div>
            <button onClick={() => setSelectedRule(null)} className="text-sm text-slate-400 hover:text-slate-600 font-bold tracking-wider mr-2">← Back to Rules</button>
          </div>
          <button className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-lg shadow-sm transition-colors border border-slate-200">
            Edit
          </button>
        </div>

        <div className="max-w-4xl mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
            <div className="space-y-6">
               <div className="flex flex-col">
                  <label className="text-sm font-bold text-slate-500 mb-2">Rule Name</label>
                  <input type="text" readOnly value={selectedRule.name} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm outline-none text-slate-700" />
               </div>
               <div className="flex flex-col">
                  <label className="text-sm font-bold text-slate-500 mb-2">Code</label>
                  <input type="text" readOnly value={selectedRule.code} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm outline-none text-slate-700" />
               </div>
               <div className="flex flex-col">
                  <label className="text-sm font-bold text-slate-500 mb-2">Category</label>
                  <input type="text" readOnly value={selectedRule.category} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm outline-none text-slate-700" />
               </div>
               <div className="flex flex-col">
                  <label className="text-sm font-bold text-slate-500 mb-2">Sequence</label>
                  <input type="text" readOnly value={selectedRule.sequence} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm outline-none text-slate-700" />
               </div>
            </div>
            
            <div className="space-y-6">
               <div className="flex flex-col">
                  <label className="text-sm font-bold text-slate-500 mb-2">Salary Structure</label>
                  <input type="text" readOnly value="Regular Salary" className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm outline-none text-blue-600" />
               </div>
               
               <div className="pt-2">
                 <h4 className="text-sm font-bold text-slate-600 mb-4 border-b border-slate-100 pb-2">Computation options from the source</h4>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="flex flex-col">
                      <label className="text-xs font-bold text-slate-500 mb-1">Computation</label>
                      <input type="text" readOnly value={selectedRule.computationMethod} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm outline-none text-slate-700" />
                   </div>
                   <div className="flex flex-col">
                      <label className="text-xs font-bold text-slate-500 mb-1">Percentage (%)</label>
                      <input type="text" readOnly value={selectedRule.equation.includes('%') ? selectedRule.equation.split('%')[0] : 'N/A'} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm outline-none text-slate-700" />
                   </div>
                   <div className="flex flex-col col-span-2">
                      <label className="text-xs font-bold text-slate-500 mb-1">Based on</label>
                      <input type="text" readOnly value={selectedRule.equation.includes('of') ? selectedRule.equation.split('of ')[1] : 'Fixed'} className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold shadow-sm outline-none text-slate-700" />
                   </div>
                 </div>
               </div>
            </div>

            <div className="md:col-span-2 mt-6">
              <h4 className="font-bold text-slate-800 mb-2 text-sm">Computation Note:</h4>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                - <strong>Fixed Amount:</strong> uses the exact value entered in the rule, e.g. Meal Allowance = 2,000.<br/>
                - <strong>Percentage:</strong> calculates the rule as a percentage of a selected base such as Contract Wage, Basic Salary, or Gross Salary, e.g. HRA = 20% × Basic Salary.<br/>
                - <strong>Python Code / Formula:</strong> is used for advanced calculations where fixed or percentage methods are not sufficient, such as attendance-based salary, overtime, unpaid leave deductions, or calculations using multiple salary-rule values.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 bg-white min-h-full flex flex-col">
      <div className="mb-6 border-b border-slate-100 pb-4">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Salary Rules</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">List view.</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-64">
          <input type="text" placeholder="Search salary rules..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg shadow-sm outline-none focus:border-blue-500" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <div className="relative">
          <select className="pl-4 pr-8 py-2 bg-blue-50 border border-blue-100 text-blue-700 font-bold text-sm rounded-lg shadow-sm outline-none appearance-none">
            <option>Regular Salary</option>
          </select>
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden flex-1 bg-white">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-600">Rule Name</th>
              <th className="px-6 py-4 font-bold text-slate-600">Code</th>
              <th className="px-6 py-4 font-bold text-slate-600">Category</th>
              <th className="px-6 py-4 font-bold text-slate-600">Structure</th>
              <th className="px-6 py-4 font-bold text-slate-600">Sequence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {INITIAL_SALARY_RULES.map(rule => (
              <tr key={rule.id} onClick={() => setSelectedRule(rule)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                <td className="px-6 py-4 font-bold text-slate-900">{rule.name}</td>
                <td className="px-6 py-4 font-medium text-slate-500">{rule.code}</td>
                <td className="px-6 py-4 font-medium text-slate-700">{rule.category}</td>
                <td className="px-6 py-4 font-medium text-slate-700">Regular Salary</td>
                <td className="px-6 py-4 font-medium text-slate-900">{rule.sequence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
