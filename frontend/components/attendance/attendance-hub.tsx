"use client";

import React, { useState } from "react";
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Users,
  ShieldCheck,
  Building,
  UserCheck,
  X,
  Layers,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { AttendanceRecord, WorkingSchedule, calculateWeeklyHours } from "@/lib/mock-data";

export function AttendanceHub() {
  const { attendance, employees, schedules, addSchedule, addAttendanceRecord } = useStore();
  const [activeTab, setActiveTab] = useState<"matrix" | "schedules">("matrix");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [isNewScheduleOpen, setIsNewScheduleOpen] = useState(false);

  // Manual correction form state
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || "EMP-101");
  const [dateInput, setDateInput] = useState("2026-09-05");
  const [checkInInput, setCheckInInput] = useState("09:00");
  const [checkOutInput, setCheckOutInput] = useState("18:00");
  const [statusInput, setStatusInput] = useState<"Present" | "Late" | "Absent" | "On Leave">("Present");

  // New Working Schedule form state (A3: Auto-calculated hours)
  const [schedName, setSchedName] = useState("");
  const [schedCode, setSchedCode] = useState("");
  const [schedType, setSchedType] = useState<"Full-Time" | "Part-Time" | "Flex">("Full-Time");
  const [schedDaysCount, setSchedDaysCount] = useState<number>(5);
  const [schedStart, setSchedStart] = useState("09:00");
  const [schedEnd, setSchedEnd] = useState("18:00");
  const [schedBreak, setSchedBreak] = useState(60);

  // Live auto-calculated weekly hours!
  const liveWeeklyHours = calculateWeeklyHours(schedStart, schedEnd, schedBreak, schedDaysCount);

  const handleSaveCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    const inHour = parseInt(checkInInput.split(":")[0]) || 9;
    const outHour = parseInt(checkOutInput.split(":")[0]) || 18;
    const hours = Math.max(0, outHour - inHour);

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      employeeId: selectedEmpId,
      date: dateInput,
      checkIn: checkInInput,
      checkOut: checkOutInput,
      workedHours: Number(hours.toFixed(1)),
      status: statusInput,
    };

    addAttendanceRecord(newRecord);
    setIsCorrectionOpen(false);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedName || !schedCode) return;

    const newSched: WorkingSchedule = {
      id: `SCH-${Date.now()}`,
      name: schedName,
      code: schedCode.toUpperCase(),
      type: schedType,
      weeklyHours: liveWeeklyHours,
      days: `${schedDaysCount} Days / Week`,
      startTime: schedStart,
      endTime: schedEnd,
      breakMinutes: schedBreak,
      assignedEmployeesCount: 0,
    };

    addSchedule(newSched);
    setIsNewScheduleOpen(false);
    setSchedName("");
    setSchedCode("");
  };

  const filteredRecords = attendance.filter((rec) => {
    const emp = employees.find((e) => e.id === rec.employeeId);
    const empName = emp ? emp.name.toLowerCase() : "";
    return (
      empName.includes(searchTerm.toLowerCase()) ||
      rec.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.date.includes(searchTerm)
    );
  });

  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const lateCount = attendance.filter((a) => a.status === "Late").length;
  const onLeaveCount = attendance.filter((a) => a.status === "On Leave").length;

  return (
    <div className="space-y-6 pb-12">
      {/* Attendance Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                Attendance &amp; Schedule Management
              </h1>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                Odoo 18 Operations
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Verify biometric daily check-in/out, handle authorized corrections, and configure standardized working schedules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Sub-Tab Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setActiveTab("matrix")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "matrix"
                    ? "bg-[#714B67] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Daily Attendance
              </button>
              <button
                onClick={() => setActiveTab("schedules")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "schedules"
                    ? "bg-[#714B67] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Working Schedules ({schedules.length})
              </button>
            </div>

            {activeTab === "matrix" ? (
              <button
                onClick={() => setIsCorrectionOpen(true)}
                className="inline-flex items-center gap-2 bg-[#00A09D] hover:bg-[#008A87] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ Manual Correction</span>
              </button>
            ) : (
              <button
                onClick={() => setIsNewScheduleOpen(true)}
                className="inline-flex items-center gap-2 bg-[#00A09D] hover:bg-[#008A87] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>+ New Working Schedule</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW 1: DAILY ATTENDANCE MATRIX */}
      {activeTab === "matrix" && (
        <div className="px-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Present Today</span>
                <div className="p-2 rounded-lg bg-teal-50 text-[#00A09D]">
                  <UserCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{presentCount} Staff</div>
              <div className="text-xs text-slate-500 mt-1">Biometric verified</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Late Exceptions</span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-700 mt-2">{lateCount} Exception</div>
              <div className="text-xs text-slate-500 mt-1">Arrival after 09:15 AM</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">On Leave</span>
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 mt-2">{onLeaveCount} Staff</div>
              <div className="text-xs text-slate-500 mt-1">Approved Time Off</div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Health Index</span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-2">95.8%</div>
              <div className="text-xs text-slate-500 mt-1">Punctuality rating</div>
            </div>
          </div>

          {/* Daily Logs Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-sm text-slate-900">
                Daily Check-In &amp; Check-Out Log (September 2026)
              </h3>
              <div className="relative min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search employee or date..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67] text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-5">Employee</th>
                    <th className="py-3.5 px-5">Date</th>
                    <th className="py-3.5 px-5">Check In</th>
                    <th className="py-3.5 px-5">Check Out</th>
                    <th className="py-3.5 px-5 text-right">Worked Hours</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Assigned Working Schedule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((rec) => {
                    const emp = employees.find((e) => e.id === rec.employeeId);

                    return (
                      <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            {emp && (
                              <img
                                src={emp.avatar}
                                alt={emp.name}
                                className="w-9 h-9 rounded-full object-cover border"
                              />
                            )}
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {emp ? emp.name : rec.employeeId}
                              </div>
                              <div className="text-xs text-slate-500">{emp?.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5 text-slate-700 font-mono text-xs">{rec.date}</td>
                        <td className="py-3.5 px-5 font-bold text-slate-800">{rec.checkIn}</td>
                        <td className="py-3.5 px-5 font-bold text-slate-800">{rec.checkOut}</td>
                        <td className="py-3.5 px-5 text-right font-black text-slate-900">
                          {rec.workedHours > 0 ? `${rec.workedHours} hrs` : "-"}
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                              rec.status === "Present"
                                ? "bg-teal-50 text-teal-800 border border-teal-200"
                                : rec.status === "Late"
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : "bg-purple-50 text-purple-800 border border-purple-200"
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-slate-600 font-medium">
                          {emp?.workingSchedule || "Standard 40h/week"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: WORKING SCHEDULES SETUP (A3 Feature) */}
      {activeTab === "schedules" && (
        <div className="px-6 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Standardized Working Schedules
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculates total weekly hours automatically from day pattern, shift timings, and breaks.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#714B67]/10 text-[#714B67]">
                {schedules.length} Active Templates
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-bold">
                  <tr>
                    <th className="py-3.5 px-5">Schedule Name &amp; Code</th>
                    <th className="py-3.5 px-5">Type</th>
                    <th className="py-3.5 px-5">Working Days</th>
                    <th className="py-3.5 px-5">Daily Shift</th>
                    <th className="py-3.5 px-5 text-center">Break</th>
                    <th className="py-3.5 px-5 text-right">Weekly Hours (Auto-Computed)</th>
                    <th className="py-3.5 px-5 text-center">Assigned Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedules.map((sc) => (
                    <tr key={sc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 text-sm">{sc.name}</div>
                        <div className="text-xs text-[#714B67] font-mono font-bold">{sc.code}</div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {sc.type}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-slate-700 text-sm font-medium">{sc.days}</td>
                      <td className="py-4 px-5 text-slate-700 text-sm font-mono">
                        {sc.startTime} - {sc.endTime}
                      </td>
                      <td className="py-4 px-5 text-center text-slate-600 text-xs font-medium">
                        {sc.breakMinutes} mins
                      </td>
                      <td className="py-4 px-5 text-right font-black text-base text-[#00A09D]">
                        {sc.weeklyHours} hrs / wk
                      </td>
                      <td className="py-4 px-5 text-center font-bold text-slate-800 text-sm">
                        {sc.assignedEmployeesCount} Staff
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Manual Correction Modal */}
      {isCorrectionOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto select-none bg-slate-900/50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#714B67] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00A09D]" />
                <h3 className="font-bold text-sm text-white">Manual Attendance Correction</h3>
              </div>
              <button
                onClick={() => setIsCorrectionOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCorrection} className="p-6 space-y-4 text-sm text-slate-800">
              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">
                  Select Employee
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-900"
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} ({e.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">Status</label>
                  <select
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-900"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late Exception</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">Check In Time</label>
                  <input
                    type="time"
                    value={checkInInput}
                    onChange={(e) => setCheckInInput(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">Check Out Time</label>
                  <input
                    type="time"
                    value={checkOutInput}
                    onChange={(e) => setCheckOutInput(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCorrectionOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00A09D] hover:bg-[#008A87] text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Working Schedule Modal (A3 Feature) */}
      {isNewScheduleOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto select-none bg-slate-900/50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#714B67] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#00A09D]" />
                <h3 className="font-bold text-sm text-white">Setup Working Schedule (A3)</h3>
              </div>
              <button
                onClick={() => setIsNewScheduleOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-6 space-y-4 text-sm text-slate-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">
                    Schedule Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engineering 40h"
                    value={schedName}
                    onChange={(e) => setSchedName(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">
                    Schedule Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ENG_40H"
                    value={schedCode}
                    onChange={(e) => setSchedCode(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm uppercase text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">
                    Schedule Type
                  </label>
                  <select
                    value={schedType}
                    onChange={(e) => setSchedType(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-900"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Flex">Flex Hours</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">
                    Days Per Week
                  </label>
                  <select
                    value={schedDaysCount}
                    onChange={(e) => setSchedDaysCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-900"
                  >
                    <option value={5}>5 Days (Monday - Friday)</option>
                    <option value={6}>6 Days (Monday - Saturday)</option>
                    <option value={4}>4 Days (Monday - Thursday)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">Start Time</label>
                  <input
                    type="time"
                    value={schedStart}
                    onChange={(e) => setSchedStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">End Time</label>
                  <input
                    type="time"
                    value={schedEnd}
                    onChange={(e) => setSchedEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs uppercase tracking-wider">Break (Mins)</label>
                  <input
                    type="number"
                    value={schedBreak}
                    onChange={(e) => setSchedBreak(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Automatic Weekly Hours Calculation Callout (A3 Requirement) */}
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-800 block">
                    Calculated Weekly Hours (Automatic)
                  </span>
                  <p className="text-xs text-teal-700 mt-0.5">
                    ({schedStart} to {schedEnd} - {schedBreak}m break) × {schedDaysCount} days
                  </p>
                </div>
                <div className="text-2xl font-black text-[#00A09D]">
                  {liveWeeklyHours} hrs
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewScheduleOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#714B67] hover:bg-[#5C3D54] text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
