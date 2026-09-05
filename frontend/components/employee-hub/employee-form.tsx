"use client";

import React from "react";
import { useStore } from "@/lib/store-context";
import { Employee } from "@/lib/mock-data";
import { Clock, FileText, Calendar, Building, Briefcase, MapPin, Mail, UserCheck, Phone } from "lucide-react";

export function EmployeeForm({ employee }: { employee: Employee }) {
  const { setSelectedEmployee, setActiveNavTab } = useStore();

  return (
    <div className="flex-1 p-6 md:p-8 bg-white h-full flex flex-col">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 flex items-center gap-2">
            <button 
              onClick={() => setSelectedEmployee(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              Employees
            </button>
            <span className="text-slate-300">/</span>
            {employee.name}
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Employee form with related HR actions
          </p>
        </div>
        
        {/* Smart Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveNavTab("Time Off")}
            className="flex flex-col items-center justify-center px-4 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg min-w-[100px] transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-wider">Time Off</span>
            <span className="text-lg font-black">{employee.smartMetrics.leaveBalance}</span>
          </button>
          <button 
            onClick={() => setActiveNavTab("Contracts")}
            className="flex flex-col items-center justify-center px-4 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg min-w-[100px] transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-wider">Contracts</span>
            <span className="text-lg font-black">{employee.smartMetrics.contractsCount}</span>
          </button>
          <button 
            onClick={() => setActiveNavTab("Attendance")}
            className="flex flex-col items-center justify-center px-4 py-2 border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg min-w-[100px] transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-wider">Attendance</span>
            <span className="text-lg font-black">{employee.smartMetrics.attendancePercentage}%</span>
          </button>
        </div>
      </div>

      <div className="flex items-start gap-6 mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-bold text-[#714B67] overflow-hidden">
            {employee.avatar ? (
              <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
            ) : (
              employee.name.split(' ').map(n => n[0]).join('')
            )}
          </div>
          <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${employee.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">{employee.name}</h2>
          <p className="text-slate-600 font-medium mb-1">{employee.role}</p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            {employee.email} | <Phone className="w-3.5 h-3.5 inline ml-1" /> {employee.phone}
          </p>
        </div>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4">
          <button className="px-4 py-3 text-sm font-bold text-[#714B67] border-b-2 border-[#714B67]">
            Work Information
          </button>
          <button className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700">
            Private Information
          </button>
        </div>
        
        <div className="p-6 md:p-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="flex items-center">
                <label className="w-1/3 text-sm font-bold text-slate-600">Department</label>
                <div className="w-2/3">
                  <input type="text" readOnly value={employee.department} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
                </div>
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-sm font-bold text-slate-600">Manager</label>
                <div className="w-2/3">
                  <input type="text" readOnly value={employee.manager} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
                </div>
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-sm font-bold text-slate-600">Working Schedule</label>
                <div className="w-2/3">
                  <input type="text" readOnly value={employee.workingSchedule} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
                </div>
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-sm font-bold text-slate-600">Company</label>
                <div className="w-2/3">
                  <input type="text" readOnly value="OXP Pvt Ltd" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="flex items-center">
                <label className="w-1/3 text-sm font-bold text-slate-600">Job Position</label>
                <div className="w-2/3">
                  <input type="text" readOnly value={employee.role} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
                </div>
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-sm font-bold text-slate-600">Work Location</label>
                <div className="w-2/3">
                  <input type="text" readOnly value="Mumbai" className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
                </div>
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-sm font-bold text-slate-600">Status</label>
                <div className="w-2/3">
                  <input type="text" readOnly value={employee.status} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
                </div>
              </div>
              <div className="flex items-center">
                <label className="w-1/3 text-sm font-bold text-slate-600">Work Email</label>
                <div className="w-2/3">
                  <input type="text" readOnly value={employee.email} className="w-full p-2 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-500 italic">
        Useful note: smart buttons open related Contracts, Attendance and Time Off records filtered for the current employee.
      </div>
    </div>
  );
}
