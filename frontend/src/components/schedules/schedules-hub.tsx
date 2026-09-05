"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import { Search, Plus, Calendar, ArrowLeft } from "lucide-react";
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
      <div className="flex-1 p-6 md:p-8 bg-slate-50 h-full flex flex-col relative overflow-hidden">
        {/* Premium Background Blurs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#714B67]/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00A09D]/5 rounded-full blur-3xl -z-10" />

        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedSchedule(null)}
              className="w-10 h-10 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-full flex items-center justify-center text-slate-500 hover:text-[#714B67] hover:bg-white transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {req ? req.name : "New Schedule"}
              </h1>
              <p className="text-sm font-medium text-slate-500">{isNew ? 'Create a new working schedule' : 'Edit working schedule details'}</p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedSchedule(null)}
            className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all"
          >
            Save Changes
          </button>
        </div>

        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-12 bg-white/60 backdrop-blur-xl border border-slate-200/60 p-8 rounded-[24px] shadow-sm">
          {/* Top Info */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Schedule Name</label>
              <input type="text" defaultValue={req ? req.name : ""} className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Days per Week</label>
                <input type="text" defaultValue={req ? req.daysPerWeek : ""} className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Hours per Week</label>
                <input type="text" defaultValue={req ? `${req.hoursPerWeek}h` : ""} className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Company</label>
              <input type="text" defaultValue="My Company" className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all" />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Timezone</label>
              <input type="text" defaultValue="Company timezone" className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all" />
            </div>
          </div>
        </div>

        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-900">Weekly Schedule</h2>
            <button className="px-5 py-2 text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-xl text-sm font-bold transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Day
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
    <div className="flex-1 p-6 md:p-8 bg-slate-50 h-full flex flex-col relative overflow-hidden">
      {/* Premium Background Blurs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#714B67]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00A09D]/5 rounded-full blur-3xl -z-10" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Working Schedules</h1>
          <p className="text-sm font-medium text-slate-500">Configure standardized work hours and shifts</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={() => setSelectedSchedule("NEW")}
            className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Schedule
          </button>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-6">
        <button 
          onClick={() => setActiveTab("List")}
          className={`text-sm font-bold pb-2 px-1 border-b-2 transition-all ${activeTab === "List" ? "text-[#714B67] border-[#714B67]" : "text-slate-500 border-transparent hover:text-slate-700"}`}
        >
          List View
        </button>
        <button 
          onClick={() => setActiveTab("Calendar")}
          className={`text-sm font-bold pb-2 px-1 border-b-2 transition-all ${activeTab === "Calendar" ? "text-[#714B67] border-[#714B67]" : "text-slate-500 border-transparent hover:text-slate-700"}`}
        >
          Calendar View
        </button>
      </div>

      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-[24px] overflow-hidden shadow-sm flex-1">
        {activeTab === "Calendar" ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
            <Calendar className="w-12 h-12 mb-4 text-slate-300" />
            <p className="font-bold text-lg text-slate-700">Calendar View</p>
            <p className="text-sm">This view will display schedules in a calendar format.</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
