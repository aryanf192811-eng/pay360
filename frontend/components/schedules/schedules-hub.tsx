"use client";

import React, { useState } from "react";
import {
  Clock,
  Calendar,
  Users,
  Plus,
  CheckCircle2,
  AlertCircle,
  Building2,
  Briefcase,
  ChevronRight,
  Info,
  X,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { WorkingSchedule } from "@/lib/mock-data";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function SchedulesHub() {
  const { schedules, employees, addSchedule } = useStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<WorkingSchedule | null>(
    schedules[0] || null
  );

  // Form State for New Schedule
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [activeDays, setActiveDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [breakMins, setBreakMins] = useState(60);

  // Dynamic Calculator for Weekly Hours
  const calculateDailyHours = (start: string, end: string, brk: number) => {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const totalMinutes = endH * 60 + endM - (startH * 60 + startM) - brk;
    return Math.max(0, Number((totalMinutes / 60).toFixed(1)));
  };

  const dailyHours = calculateDailyHours(startTime, endTime, breakMins);
  const weeklyHours = Number((dailyHours * activeDays.length).toFixed(1));

  const toggleDay = (dayFull: string) => {
    if (activeDays.includes(dayFull)) {
      if (activeDays.length > 1) {
        setActiveDays(activeDays.filter((d) => d !== dayFull));
      }
    } else {
      setActiveDays([...activeDays, dayFull]);
    }
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSched: WorkingSchedule = {
      id: `SCHED-${Date.now()}`,
      name,
      code: code || name.substring(0, 4).toUpperCase(),
      type: "Full-Time",
      weeklyHours,
      hoursPerWeek: weeklyHours,
      days: `${activeDays.join(", ")} (${activeDays.length} Days)`,
      daysPerWeek: activeDays.length,
      startTime,
      shiftStart: startTime,
      endTime,
      shiftEnd: endTime,
      breakMinutes: breakMins,
      breakDurationMinutes: breakMins,
      activeDays,
      assignedEmployeesCount: 0,
    };

    addSchedule(newSched);
    setSelectedSchedule(newSched);
    setIsCreateModalOpen(false);
    setName("");
    setCode("");
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span>PeoplePay360</span>
            <span className="text-slate-300">/</span>
            <span className="text-[#714B67] font-bold">Working Schedules</span>
            <span className="text-slate-300">/</span>
            <span>Odoo Standard A3</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-[#714B67]" />
            <span>Working Schedules &amp; Weekly Hours</span>
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Configure standardized working patterns, compute daily/weekly working hours, and associate contracts.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00A09D] hover:bg-[#008A87] text-white text-sm font-bold shadow-xs hover:shadow-md transition-all self-start md:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Working Schedule</span>
        </button>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">Configured Schedules</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{schedules.length} Profiles</div>
          <div className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% compliant with Odoo 18</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">Standard Work Week</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">40.0 hrs/wk</div>
          <div className="text-xs font-medium text-slate-500 mt-1">8.0 hrs/day • Mon-Fri pattern</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">Staff Assigned</div>
          <div className="text-2xl font-extrabold text-[#714B67] mt-1">{employees.length} Employees</div>
          <div className="text-xs font-medium text-slate-500 mt-1">All contracts mapped to schedules</div>
        </div>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-4 shadow-xs">
          <div className="text-xs uppercase tracking-wider font-bold text-slate-500">Payroll Integration</div>
          <div className="text-2xl font-extrabold text-[#00A09D] mt-1">Automated</div>
          <div className="text-xs font-medium text-slate-500 mt-1">Powers LOP &amp; overtime variance</div>
        </div>
      </div>

      {/* Main Grid: Schedule Cards & Live Selected Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Schedule Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Standardized Schedules</h2>
            <span className="text-xs font-semibold text-slate-500">{schedules.length} templates active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((sched) => {
              const isSelected = selectedSchedule?.id === sched.id;
              const assignedEmployees = employees.filter((e) =>
                e.workingSchedule.toLowerCase().includes(sched.name.toLowerCase().split(" ")[0])
              );

              return (
                <div
                  key={sched.id}
                  onClick={() => setSelectedSchedule(sched)}
                  className={`bg-white/80 backdrop-blur-md rounded-2xl border p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? "border-[#714B67] ring-2 ring-[#714B67]/20 shadow-md bg-white"
                      : "border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#714B67]/10 text-[#714B67]">
                            {sched.code}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">ID: {sched.id}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1.5">{sched.name}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-[#00A09D]">
                          {sched.hoursPerWeek || sched.weeklyHours}h
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">per week</div>
                      </div>
                    </div>

                    {/* Shift details */}
                    <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Shift Timings</span>
                        <span className="font-bold text-slate-800">
                          {sched.shiftStart || sched.startTime} – {sched.shiftEnd || sched.endTime}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-500 block text-[10px] uppercase font-bold">Lunch / Break</span>
                        <span className="font-bold text-slate-800">
                          {sched.breakDurationMinutes || sched.breakMinutes} mins
                        </span>
                      </div>
                    </div>

                    {/* Days Pill Row */}
                    <div className="mt-3.5 flex items-center gap-1">
                      {DAYS_OF_WEEK.map((day) => {
                        const activeList = sched.activeDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                        const isDayActive = activeList.some((d: string) =>
                          d.toLowerCase().startsWith(day.toLowerCase())
                        );
                        return (
                          <span
                            key={day}
                            className={`flex-1 text-center py-1 rounded-md text-[10px] font-bold transition-colors ${
                              isDayActive
                                ? "bg-[#714B67] text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {day}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer: Assigned Staff Avatars */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center -space-x-2">
                      {assignedEmployees.slice(0, 4).map((emp) => (
                        <img
                          key={emp.id}
                          src={emp.avatar}
                          alt={emp.name}
                          title={emp.name}
                          className="w-7 h-7 rounded-full object-cover border-2 border-white ring-1 ring-slate-200"
                        />
                      ))}
                      {assignedEmployees.length > 4 && (
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center border-2 border-white">
                          +{assignedEmployees.length - 4}
                        </div>
                      )}
                      {assignedEmployees.length === 0 && (
                        <span className="text-xs text-slate-400 italic">No direct assignments</span>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-slate-600">
                      {assignedEmployees.length} staff
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Selected Schedule Inspection Card */}
        {selectedSchedule && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#00A09D]/10 text-[#00A09D]">
                  Selected Working Schedule
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">
                  {selectedSchedule.code}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedSchedule.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Standard template applied during contract initialization and payroll work-day calculations.
              </p>
            </div>

            {/* Computation breakdown */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#00A09D]" />
                <span>Dynamic Hours Breakdown</span>
              </div>

              <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200">
                <span className="text-slate-600">Active Working Days:</span>
                <span className="font-bold text-slate-900">{selectedSchedule.daysPerWeek || 5} days / week</span>
              </div>

              <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200">
                <span className="text-slate-600">Daily Gross Duration:</span>
                <span className="font-bold text-slate-900">
                  {selectedSchedule.shiftStart || selectedSchedule.startTime} to {selectedSchedule.shiftEnd || selectedSchedule.endTime} (9.0h)
                </span>
              </div>

              <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200">
                <span className="text-slate-600">Unpaid Meal Break:</span>
                <span className="font-bold text-rose-600">
                  -{selectedSchedule.breakDurationMinutes || selectedSchedule.breakMinutes} mins (1.0h)
                </span>
              </div>

              <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200">
                <span className="text-slate-600 font-semibold">Net Daily Hours:</span>
                <span className="font-extrabold text-slate-900">8.0 hrs / day</span>
              </div>

              <div className="flex items-center justify-between text-sm pt-1 bg-white p-2.5 rounded-lg border border-slate-200 font-bold">
                <span className="text-[#714B67]">Total Weekly Target:</span>
                <span className="text-base text-[#714B67]">{selectedSchedule.hoursPerWeek || selectedSchedule.weeklyHours} hrs / week</span>
              </div>
            </div>

            {/* Odoo Standard Rule Note */}
            <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Info className="w-4 h-4 text-teal-700" />
                <span>Odoo 18 Enterprise Rule (A3)</span>
              </div>
              <p className="text-teal-800 leading-relaxed">
                Working schedules determine baseline expected hours. If an employee logs biometric check-ins below this threshold without approved time off, the system automatically computes Loss of Pay (LOP) during the monthly payrun.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Employee Schedule Assignment Matrix */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Employee Working Schedule Assignments</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Active contracts linked to employee profiles with configured working schedules
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 px-3 py-1 bg-slate-100 rounded-full">
            {employees.length} Staff Mapped
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3 px-5">Employee</th>
                <th className="py-3 px-5">Department</th>
                <th className="py-3 px-5">Assigned Working Schedule</th>
                <th className="py-3 px-5 text-center">Daily Hours</th>
                <th className="py-3 px-5 text-center">Weekly Hours</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{emp.name}</div>
                        <div className="text-xs text-slate-500">{emp.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {emp.department}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-[#714B67] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#00A09D]" />
                      <span>{emp.workingSchedule}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-center font-bold text-slate-700">8.0 hrs</td>
                  <td className="py-3.5 px-5 text-center font-extrabold text-slate-900">40.0 hrs</td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog: + Create Working Schedule */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#00A09D]/10 text-[#00A09D]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">New Working Schedule</h3>
                  <p className="text-xs text-slate-500">Configure weekly working hours &amp; days</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Schedule Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard 40h Full-Time (Mon-Fri)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A09D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Code Identifier
                  </label>
                  <input
                    type="text"
                    placeholder="STD40"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A09D]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Break Duration (mins)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={180}
                    value={breakMins}
                    onChange={(e) => setBreakMins(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A09D]"
                  />
                </div>
              </div>

              {/* Working Days Checkbox Pills */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Active Working Days ({activeDays.length} Selected)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                    "Sunday",
                  ].map((day) => {
                    const isChecked = activeDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          isChecked
                            ? "bg-[#714B67] text-white border-[#714B67]"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shift Timings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Shift Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A09D]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Shift End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A09D]"
                  />
                </div>
              </div>

              {/* Live Hours Calculator Banner */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase text-slate-500">
                    Live Computed Total
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {dailyHours} hrs/day × {activeDays.length} days
                  </div>
                </div>
                <div className="text-xl font-extrabold text-[#00A09D]">
                  {weeklyHours} hrs/week
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-[#00A09D] hover:bg-[#008A87] rounded-xl shadow-xs"
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
