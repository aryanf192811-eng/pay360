"use client";

import React from "react";
import {
  Mail,
  Phone,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  Calendar,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { Employee } from "@/lib/mock-data";
import { useStore } from "@/lib/store-context";
import { formatINR } from "@/lib/utils";

const DEPARTMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Engineering: { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  Product: { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  "Human Resources": { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200" },
  Sales: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
};

export function EmployeeCard({ employee }: { employee: Employee }) {
  const { setSelectedEmployee } = useStore();
  const deptStyle = DEPARTMENT_COLORS[employee.department] || {
    bg: "bg-slate-50",
    text: "text-slate-800",
    border: "border-slate-200",
  };

  const isBankMissing = !employee.bankDetails.isVerified || !employee.bankDetails.accountNumber;

  return (
    <div
      onClick={() => setSelectedEmployee(employee)}
      className="group relative bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-[#714B67]/40 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* Top Row: Avatar, Identity, Status */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5">
            {/* Avatar with Presence Indicator */}
            <div className="relative shrink-0">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-13 h-13 rounded-full object-cover border-2 border-slate-200/80 group-hover:scale-105 transition-transform"
              />
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  employee.status === "Active" ? "bg-emerald-500" : "bg-amber-500"
                }`}
                title={`Status: ${employee.status}`}
              />
            </div>

            {/* Name and Role */}
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-[#714B67] transition-colors line-clamp-1">
                {employee.name}
              </h3>
              <p className="text-sm font-medium text-slate-600 line-clamp-1">{employee.role}</p>
              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${deptStyle.bg} ${deptStyle.text} ${deptStyle.border}`}
                >
                  {employee.department}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    employee.status === "Active"
                      ? "bg-teal-50/80 text-teal-800 border-teal-200"
                      : "bg-amber-50/80 text-amber-800 border-amber-200"
                  }`}
                >
                  {employee.status}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Click Arrow */}
          <div className="text-slate-300 group-hover:text-[#714B67] transition-colors p-1">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>

        {/* CTC & Bank Status Highlights */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              Monthly CTC
            </div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {formatINR(employee.monthlyCTC)}
              <span className="text-xs font-normal text-slate-500 ml-1">/ mo</span>
            </div>
          </div>

          {/* Bank Verification Warning Chip */}
          <div>
            {isBankMissing ? (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300"
                title="Missing Bank Account & IFSC Code"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>No Bank</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                title={`Bank Linked: ${employee.bankDetails.bankName}`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Verified</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Smart Counters Ribbon (Odoo Paradigm - Upgraded size) */}
      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-4 gap-1 text-center bg-slate-50/90 p-2.5 rounded-xl text-xs">
        <div title="Active Contracts" className="px-1">
          <div className="text-slate-500 flex items-center justify-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs font-semibold">Contracts</span>
          </div>
          <div className="font-bold text-slate-800 text-sm mt-0.5">
            {employee.smartMetrics.contractsCount}
          </div>
        </div>
        <div title="Attendance Rate" className="px-1">
          <div className="text-slate-500 flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#00A09D]" />
            <span className="text-xs font-semibold">Attd</span>
          </div>
          <div className="font-bold text-[#00A09D] text-sm mt-0.5">
            {employee.smartMetrics.attendancePercentage}%
          </div>
        </div>
        <div title="Leave Balance" className="px-1">
          <div className="text-slate-500 flex items-center justify-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            <span className="text-xs font-semibold">Leaves</span>
          </div>
          <div className="font-bold text-slate-800 text-sm mt-0.5">
            {employee.smartMetrics.leaveBalance}d
          </div>
        </div>
        <div title="Payslips Generated" className="px-1">
          <div className="text-slate-500 flex items-center justify-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-semibold">Slips</span>
          </div>
          <div className="font-bold text-slate-800 text-sm mt-0.5">
            {employee.smartMetrics.payslipsCount}
          </div>
        </div>
      </div>

      {/* Quick Action Footer */}
      <div className="mt-3.5 flex items-center justify-between text-xs text-slate-500 pt-1">
        <span className="text-xs font-bold text-slate-500 font-mono">ID: {employee.id}</span>
        <div className="flex items-center gap-2">
          <a
            href={`mailto:${employee.email}`}
            onClick={(e) => e.stopPropagation()}
            title={`Email ${employee.name}`}
            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-[#714B67] transition-colors text-slate-600"
          >
            <Mail className="w-4 h-4" />
          </a>
          <a
            href={`tel:${employee.phone}`}
            onClick={(e) => e.stopPropagation()}
            title={`Call ${employee.name}`}
            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-[#00A09D] transition-colors text-slate-600"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
