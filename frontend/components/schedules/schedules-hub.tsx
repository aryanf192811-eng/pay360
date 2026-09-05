"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import { Search, Plus, Calendar } from "lucide-react";
import { WorkingSchedule } from "@/lib/mock-data";

export function SchedulesHub() {
  const { schedules } = useStore();
  const [selectedSchedule, setSelectedSchedule] = useState<WorkingSchedule | "NEW" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"List" | "Calendar">("List");

  const filteredSchedules = schedules.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const mockWeeklySchedule = [
    { day: "Monday", start: "9:00 AM", end: "6:00 PM", break: "1h", hours: "8h" },
    { day: "Tuesday", start: "9:00 AM", end: "6:00 PM", break: "1h", hours: "8h" },
    { day: "Wednesday", start: "9:00 AM", end: "6:00 PM", break: "1h", hours: "8h" },
    { day: "Thursday", start: "9:00 AM", end: "6:00 PM", break: "1h", hours: "8h" },
    { day: "Friday", start: "9:00 AM", end: "6:00 PM", break: "1h", hours: "8h" },
  ];

  if (selectedSchedule) {
    const isNew = selectedSchedule === "NEW";
    const req = isNew ? null : selectedSchedule;

    return (
      <div className="flex-1 p-6 md:p-8 bg-white h-full flex flex-col">
        <div className="mb-8 flex items-center gap-4">
          <button 
            onClick={() => setSelectedSchedule(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-sm font-bold uppercase tracking-wider"
          >
            ← Back to list
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {req ? req.name : "New Schedule"}
          </h1>
        </div>

        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-12">
          {/* Top Info */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-600 mb-2">Schedule Name</label>
              <input type="text" readOnly value={req ? req.name : ""} className="w-full p-2.5 bg-white border border-slate-200 rounded-md font-medium text-slate-900 shadow-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Days per Week</label>
                <input type="text" readOnly value={req ? req.daysPerWeek : ""} className="w-full p-2.5 bg-white border border-slate-200 rounded-md font-medium text-slate-900 shadow-sm" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Hours per Week</label>
                <input type="text" readOnly value={req ? `${req.hoursPerWeek}h` : ""} className="w-full p-2.5 bg-white border border-slate-200 rounded-md font-medium text-slate-900 shadow-sm" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-600 mb-2">Company</label>
              <input type="text" readOnly value="My Company" className="w-full p-2.5 bg-white border border-slate-200 rounded-md font-medium text-slate-900 shadow-sm" />
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-bold text-slate-600 mb-2">Timezone</label>
              <input type="text" readOnly value="Company timezone" className="w-full p-2.5 bg-white border border-slate-200 rounded-md font-medium text-slate-900 shadow-sm" />
            </div>
          </div>
        </div>

        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-900">Weekly Schedule</h2>
            <button className="px-4 py-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-md text-sm font-bold transition-colors">
              + Add Day
            </button>
          </div>
          
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-600">Day</th>
                  <th className="px-6 py-4 font-bold text-slate-600">Start Time</th>
                  <th className="px-6 py-4 font-bold text-slate-600">End Time</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-center">Break</th>
                  <th className="px-6 py-4 font-bold text-slate-600 text-center">Hours</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {mockWeeklySchedule.map((day, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{day.day}</td>
                    <td className="px-6 py-4">
                      <div className="w-24 p-2 bg-white border border-slate-200 rounded text-slate-700 font-medium text-center">{day.start}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24 p-2 bg-white border border-slate-200 rounded text-slate-700 font-medium text-center">{day.end}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="w-16 mx-auto p-2 bg-white border border-slate-200 rounded text-slate-700 font-medium">{day.break}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-center">{day.hours}</td>
                    <td className="px-6 py-4 text-slate-400 text-center">x</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end items-center gap-12 pr-24">
              <span className="font-bold text-slate-600">Total Weekly Hours:</span>
              <span className="font-black text-slate-900">{req ? `${req.hoursPerWeek}h` : "40h"}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="flex-1 p-6 md:p-8 bg-[#F4F6FA] h-full flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => setSelectedSchedule("NEW")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition-colors text-sm"
        >
          + New Schedule
        </button>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Working Schedules</h1>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <button 
          onClick={() => setActiveTab("List")}
          className={`text-sm font-bold pb-1 px-1 border-b-2 ${activeTab === "List" ? "text-[#714B67] border-[#714B67]" : "text-slate-500 border-transparent hover:text-slate-700"}`}
        >
          List
        </button>
        <button 
          onClick={() => setActiveTab("Calendar")}
          className={`text-sm font-bold pb-1 px-1 border-b-2 ${activeTab === "Calendar" ? "text-[#714B67] border-[#714B67]" : "text-slate-500 border-transparent hover:text-slate-700"}`}
        >
          Calendar
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1">
        {activeTab === "Calendar" ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Calendar className="w-12 h-12 mb-4 text-slate-300" />
            <p className="font-bold text-lg text-slate-700">Calendar View</p>
            <p className="text-sm">This view will display schedules in a calendar format.</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative w-96">
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-white text-slate-700 font-medium text-sm rounded-lg border border-slate-200 shadow-sm">Filter</button>
            <button className="px-4 py-2 bg-white text-slate-700 font-medium text-sm rounded-lg border border-slate-200 shadow-sm">Columns</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider">Schedule Name</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-center">Days / Week</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-center">Hours / Week</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-center">Company</th>
                <th className="px-6 py-4 font-bold text-slate-500 text-xs uppercase tracking-wider text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSchedules.map((s, idx) => (
                <tr 
                  key={s.id} 
                  onClick={() => setSelectedSchedule(s)}
                  className={`cursor-pointer transition-colors ${idx === 0 ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-slate-50"}`}
                >
                  <td className={`px-6 py-4 font-bold ${idx === 0 ? "text-blue-700" : "text-slate-900"}`}>{s.name}</td>
                  <td className={`px-6 py-4 font-medium text-center ${idx === 0 ? "text-blue-700" : "text-slate-600"}`}>{s.daysPerWeek}</td>
                  <td className={`px-6 py-4 font-medium text-center ${idx === 0 ? "text-blue-700" : "text-slate-600"}`}>{s.hoursPerWeek}h</td>
                  <td className={`px-6 py-4 font-medium text-center ${idx === 0 ? "text-blue-700" : "text-slate-600"}`}>My Company</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-white border border-emerald-200 text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
