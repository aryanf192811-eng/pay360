"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import { Search, Plus } from "lucide-react";
import { TimeOffRecord } from "@/lib/mock-data";

function TimeOffTypeDetail({ initialType, isNew, onBack }: { initialType: any, isNew: boolean, onBack: () => void }) {
  const [isEditing, setIsEditing] = useState(isNew);
  const [typ, setTyp] = useState(initialType || { name: "", unit: "Days", allocationRequired: true, requiresApproval: true });

  return (
    <div className="flex-1 p-6 md:p-8 bg-white h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider mr-2">← Back</button>
          Time Off Type / {typ.name || "New"}
        </h1>
        <p className="text-sm font-medium text-slate-500 mb-8 mt-2">Form view of one time off type</p>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className={`px-6 py-2 border-2 border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm transition-colors text-sm ${isEditing ? 'bg-blue-50 border-blue-200 text-blue-700' : 'hover:bg-slate-50'}`}
        >
          {isEditing ? "SAVE" : "EDIT"}
        </button>
      </div>
      <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <div className="space-y-6">
          <div className="flex flex-col">
            <label className="text-sm font-bold text-slate-600 mb-2">Type Name</label>
            <input 
              type="text" 
              readOnly={!isEditing} 
              value={typ.name} 
              onChange={(e) => setTyp({ ...typ, name: e.target.value })}
              className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900 ${isEditing ? 'focus:ring-2 focus:ring-blue-500 bg-white' : ''}`} 
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-slate-600 mb-2">Unit</label>
            <input 
              type="text" 
              readOnly={!isEditing} 
              value={typ.unit} 
              onChange={(e) => setTyp({ ...typ, unit: e.target.value })}
              className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900 ${isEditing ? 'focus:ring-2 focus:ring-blue-500 bg-white' : ''}`} 
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-slate-600 mb-2">Requires Allocation</label>
            <select 
              disabled={!isEditing} 
              value={typ.allocationRequired ? "Yes" : "No"} 
              onChange={(e) => setTyp({ ...typ, allocationRequired: e.target.value === "Yes" })}
              className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900 ${isEditing ? 'focus:ring-2 focus:ring-blue-500 bg-white' : ''}`} 
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-slate-600 mb-2">Active</label>
            <input type="text" readOnly value="True" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex flex-col">
            <label className="text-sm font-bold text-slate-600 mb-2">Approval</label>
            <select 
              disabled={!isEditing} 
              value={typ.requiresApproval ? "Manager" : "None"} 
              onChange={(e) => setTyp({ ...typ, requiresApproval: e.target.value === "Manager" })}
              className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900 ${isEditing ? 'focus:ring-2 focus:ring-blue-500 bg-white' : ''}`} 
            >
              <option value="Manager">Manager</option>
              <option value="None">None</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-slate-600 mb-2">Payroll / Work Entry</label>
            <input type="text" readOnly={!isEditing} defaultValue="Leave Work Entry" className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900 ${isEditing ? 'focus:ring-2 focus:ring-blue-500 bg-white' : ''}`} />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-bold text-slate-600 mb-2">Display Color</label>
            <input type="text" readOnly={!isEditing} defaultValue="Blue" className={`w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900 ${isEditing ? 'focus:ring-2 focus:ring-blue-500 bg-white' : ''}`} />
          </div>
        </div>
        <div className="md:col-span-2 mt-4 bg-slate-50 border border-slate-200 rounded-xl p-6 relative">
          <label className="block text-sm font-bold text-slate-700 mb-3">Configuration Notes</label>
          <textarea 
            readOnly={!isEditing}
            className={`w-full p-3 font-medium text-slate-800 bg-transparent min-h-[60px] border-none resize-none ${isEditing ? 'bg-white rounded-md border border-slate-200 focus:ring-2 focus:ring-blue-500' : ''}`}
            defaultValue="Standard annual leave. Balance comes from approved allocations."
          />
          <p className="text-xs text-slate-500 absolute bottom-4 left-6 italic">
            Useful note: Time Off Type drives approval behavior and whether a request needs an allocation.
          </p>
        </div>
      </div>
    </div>
  );
}

export function TimeOffHub() {
  const { timeOff, employees, approveTimeOff, refuseTimeOff, activeTimeOffTab, setActiveTimeOffTab, allocations, timeOffTypes, addTimeOffRecord, updateAllocation } = useStore();
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRecord | "NEW" | null>(null);
  const [selectedAllocation, setSelectedAllocation] = useState<any | "NEW" | null>(null);
  const [selectedType, setSelectedType] = useState<any | "NEW" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMyTeam, setShowMyTeam] = useState(false);

  const [formData, setFormData] = useState({
    employeeId: employees.length > 0 ? employees[0].id : "",
    type: "Paid Time Off",
    startDate: "",
    endDate: "",
    days: 1,
    reason: ""
  });

  const filteredRequests = timeOff.filter((req) => {
    const empName = employees.find(e => e.id === req.employeeId)?.name || req.employeeId;
    const matchesSearch = empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (req.leaveType || req.type || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    if (showMyTeam) {
      // Mock "My Team" filter: employees 2 and 3 if they exist
      const myTeamIds = [employees[1]?.id, employees[2]?.id].filter(Boolean);
      return matchesSearch && myTeamIds.includes(req.employeeId);
    }
    return matchesSearch;
  });

  const handleApprove = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    approveTimeOff(id);
    if (selectedRequest && selectedRequest !== "NEW" && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status: "Approved" });
    }
  };

  const handleRefuse = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    refuseTimeOff(id);
    if (selectedRequest && selectedRequest !== "NEW" && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status: "Refused" });
    }
  };

  if (selectedRequest) {
    const isNew = selectedRequest === "NEW";
    const req = isNew ? null : selectedRequest;

    return (
      <div className="flex-1 p-6 md:p-8 bg-slate-50 h-full flex flex-col relative overflow-hidden">
        {/* Premium Background Blurs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#714B67]/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00A09D]/5 rounded-full blur-3xl -z-10" />

        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedRequest(null)}
              className="w-10 h-10 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-full flex items-center justify-center text-slate-500 hover:text-[#714B67] hover:bg-white transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {isNew ? "New Time Off Request" : `Time Off Request / ${employees.find(e => e.id === req?.employeeId)?.name || req?.employeeId}`}
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">{isNew ? "Submit a new leave request" : "Review or process employee leave request"}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isNew ? (
              <button 
                onClick={() => {
                  addTimeOffRecord({
                    employeeId: formData.employeeId,
                    type: formData.type as any,
                    leaveType: formData.type as any,
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    days: formData.days,
                    status: "Pending",
                    reason: formData.reason,
                  });
                  setSelectedRequest(null);
                }}
                className="px-6 py-2.5 bg-[#714B67] hover:bg-[#5C3D54] text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Submit Request
              </button>
            ) : (
              <>
                <button 
                  onClick={(e) => {
                    if (req) handleApprove(e, req.id);
                  }}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  Approve
                </button>
                <button 
                  onClick={(e) => {
                    if (req) handleRefuse(e, req.id);
                  }}
                  className="px-6 py-2.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                  Refuse
                </button>
              </>
            )}
          </div>
        </div>

        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-12 bg-white/60 backdrop-blur-xl border border-slate-200/60 p-8 rounded-[24px] shadow-sm">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Employee</label>
              <select
                value={isNew ? formData.employeeId : req?.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                disabled={!isNew}
                className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all"
              >
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Time Off Type</label>
              <select
                value={isNew ? formData.type : (req?.leaveType || req?.type || "Paid Time Off")}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                disabled={!isNew}
                className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all"
              >
                <option value="Paid Time Off">Paid Time Off</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Start Date</label>
              <input 
                type="date" 
                value={isNew ? formData.startDate : req?.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                readOnly={!isNew}
                className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">End Date</label>
              <input 
                type="date" 
                value={isNew ? formData.endDate : req?.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                readOnly={!isNew}
                className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Duration</label>
              <input 
                type="number" 
                value={isNew ? formData.days : req?.days}
                onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                readOnly={!isNew}
                className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Status</label>
              <input 
                type="text" 
                defaultValue={req ? req.status : "Pending"} 
                readOnly
                className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Approver</label>
              <input 
                type="text" 
                defaultValue={req ? "Sara Khan" : "Admin"} 
                readOnly
                className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Allocation Used</label>
              <input 
                type="text" 
                defaultValue={req ? `${req.leaveType || req.type} 2026` : ""} 
                readOnly={!isNew}
                className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all"
              />
            </div>
          </div>

          {/* Full Width Reason */}
          <div className="md:col-span-2 space-y-2 mt-4 bg-white/80 border border-slate-200 rounded-xl p-6 relative shadow-sm">
            <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider">Reason</label>
            {isNew ? (
              <textarea 
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all min-h-[100px]"
                placeholder="Explain the reason for this leave..."
              />
            ) : (
              <p className="text-slate-800 font-medium whitespace-pre-wrap min-h-[60px] text-sm">
                {req?.reason || "Family vacation"}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard view
  if (activeTimeOffTab === "Dashboard") {
    const pendingApprovals = timeOff.filter(r => r.status === "Pending").length;
    const approvedLeaves = timeOff.filter(r => r.status === "Approved").length;
    const today = new Date().toISOString().split('T')[0];
    const onLeaveToday = timeOff.filter(r => 
      r.status === "Approved" && r.startDate <= today && r.endDate >= today
    ).length;

    return (
      <div className="flex-1 p-6 md:p-8 bg-slate-50/50 h-full flex flex-col overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Time Off Dashboard</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Company-wide overview of leave requests and balances</p>
          </div>
          <button 
            onClick={() => setActiveTimeOffTab("Time offs")}
            className="px-5 py-2.5 bg-[#714B67] hover:bg-[#5a3a52] text-white font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Request
          </button>
        </div>
  
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden group hover:border-amber-300 transition-colors">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-amber-400"></div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 mt-2">Pending Approvals</h3>
            <p className="text-4xl font-black text-slate-900">{pendingApprovals}</p>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded mt-2">Action Required</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden group hover:border-emerald-300 transition-colors">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-emerald-400"></div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 mt-2">Approved Leaves</h3>
            <p className="text-4xl font-black text-slate-900">{approvedLeaves}</p>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-2">This Month</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden group hover:border-[#714B67] transition-colors">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-[#714B67]"></div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 mt-2">On Leave Today</h3>
            <p className="text-4xl font-black text-slate-900">{onLeaveToday}</p>
            <span className="text-xs font-bold text-[#714B67] bg-[#714B67]/10 px-2 py-0.5 rounded mt-2">{employees.length ? ((onLeaveToday / employees.length) * 100).toFixed(0) : 0}% of Workforce</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden group hover:border-blue-300 transition-colors">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-400"></div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 mt-2">Total Allocations</h3>
            <p className="text-4xl font-black text-slate-900">{allocations.length}</p>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-2">Active Plans</span>
          </div>
        </div>
  
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Trend Chart (Mock) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="mb-6 flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Leave Trends</h2>
                <p className="text-xs text-slate-500 font-medium">Monthly time off distribution</p>
              </div>
              <select className="text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded px-2 py-1 outline-none">
                <option>Year 2026</option>
                <option>Year 2025</option>
              </select>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-4 h-48 mt-4 relative">
              {/* Horizontal Grid lines */}
              <div className="absolute inset-x-0 bottom-0 border-b border-slate-100"></div>
              <div className="absolute inset-x-0 bottom-[25%] border-b border-slate-100"></div>
              <div className="absolute inset-x-0 bottom-[50%] border-b border-slate-100"></div>
              <div className="absolute inset-x-0 bottom-[75%] border-b border-slate-100"></div>
  
              {/* Bars */}
              {[
                { label: 'Jan', val1: 40, val2: 20 },
                { label: 'Feb', val1: 30, val2: 15 },
                { label: 'Mar', val1: 60, val2: 25 },
                { label: 'Apr', val1: 50, val2: 10 },
                { label: 'May', val1: 80, val2: 40 },
                { label: 'Jun', val1: 70, val2: 30 },
                { label: 'Jul', val1: 45, val2: 20 },
                { label: 'Aug', val1: 90, val2: 50 },
              ].map((m, i) => (
                <div key={i} className="flex flex-col items-center w-full z-10 group">
                  <div className="flex items-end gap-1 w-full justify-center h-40 relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      {m.val1 + m.val2} Days
                    </div>
                    <div className="w-1/3 bg-[#714B67] rounded-t-sm transition-all group-hover:opacity-80 group-hover:w-1/2" style={{ height: `${m.val1}%` }}></div>
                    <div className="w-1/3 bg-[#D6F0FF] rounded-t-sm transition-all group-hover:opacity-80 group-hover:w-1/2" style={{ height: `${m.val2}%` }}></div>
                  </div>
                  <div className="text-xs font-bold text-slate-500 mt-2">{m.label}</div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100 justify-center">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#714B67]"></div><span className="text-xs font-bold text-slate-600">Paid Time Off</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-[#D6F0FF]"></div><span className="text-xs font-bold text-slate-600">Sick Leave</span></div>
            </div>
          </div>
  
          {/* Needs Attention / Recent List */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="mb-4 border-b border-slate-100 pb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Pending Requests
              </h2>
              <p className="text-xs text-slate-500 font-medium">Action required by HR/Manager</p>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {timeOff.filter(r => r.status === "Pending").slice(0, 5).map(req => {
                const emp = employees.find(e => e.id === req.employeeId);
                return (
                  <div key={req.id} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#714B67]/10 text-[#714B67] flex items-center justify-center font-bold text-xs shrink-0">
                      {emp?.name.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{emp?.name || req.employeeId}</p>
                      <p className="text-xs text-slate-500">{req.leaveType} • <span className="font-bold">{req.days} Days</span></p>
                      <p className="text-[10px] text-slate-400 mt-1">{req.startDate} to {req.endDate}</p>
                    </div>
                  </div>
                );
              })}
              
              {pendingApprovals === 0 && (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-700">All caught up!</p>
                  <p className="text-xs text-slate-500 mt-1">No pending requests to review.</p>
                </div>
              )}
            </div>
            
            {pendingApprovals > 0 && (
              <button 
                onClick={() => setActiveTimeOffTab("Time offs")}
                className="mt-4 w-full py-2 text-xs font-bold text-[#714B67] bg-[#714B67]/5 hover:bg-[#714B67]/10 rounded-lg transition-colors"
              >
                View All {pendingApprovals} Requests →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Time offs view
  if (activeTimeOffTab === "Time offs") {
    return (
      <div className="flex-1 p-6 md:p-8 bg-slate-50 h-full flex flex-col relative overflow-hidden">
        {/* Premium Background Blurs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#714B67]/5 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00A09D]/5 rounded-full blur-3xl -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Time Off Requests</h1>
            <p className="text-sm font-medium text-slate-500">
              Manage employee leave requests and balances
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all shadow-sm"
              />
            </div>
            <button 
              onClick={() => setShowMyTeam(!showMyTeam)}
              className={`px-5 py-2 backdrop-blur-md border border-slate-200/80 font-bold text-sm rounded-xl transition-all shadow-sm ${showMyTeam ? 'bg-blue-50 text-blue-700' : 'bg-white/80 text-slate-700 hover:bg-white'}`}>
              My Team
            </button>
            <button 
              onClick={() => setSelectedRequest("NEW")}
              className="bg-[#714B67] hover:bg-[#5a3a52] text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Request
            </button>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-[24px] overflow-hidden shadow-sm flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-bold">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Time Off Type</th>
                <th className="px-6 py-4">Start</th>
                <th className="px-6 py-4">End</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80 bg-transparent">
              {filteredRequests.map((req) => (
                <tr 
                  key={req.id} 
                  onClick={() => setSelectedRequest(req)}
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{employees.find(e => e.id === req.employeeId)?.name || req.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">{req.leaveType || req.type}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{req.startDate}</td>
                  <td className="px-6 py-4 text-slate-600 font-mono text-xs">{req.endDate}</td>
                  <td className="px-6 py-4 font-black text-slate-800">{req.days} Day{req.days > 1 ? 's' : ''}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      req.status === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                      req.status === "Refused" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                      "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {req.status === "Pending" ? "To Approve" : req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button 
                        onClick={(e) => handleApprove(e, req.id)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors flex items-center justify-center group"
                        title="Approve"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      </button>
                      <button 
                        onClick={(e) => handleRefuse(e, req.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors flex items-center justify-center"
                        title="Refuse"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-4 bg-[#F8F9EC] border-t border-slate-200 text-xs font-medium text-slate-500 italic">
            Useful note: request status should show the approval lifecycle clearly.
          </div>
        </div>
      </div>
    );
  }

  // Allocations view
  if (activeTimeOffTab === "Allocations") {
    if (selectedAllocation) {
      const isNew = selectedAllocation === "NEW";
      const alloc = isNew ? null : selectedAllocation;
      return (
        <div className="flex-1 p-6 md:p-8 bg-white h-full flex flex-col">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <button onClick={() => setSelectedAllocation(null)} className="text-sm text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider mr-2">← Back</button>
              Allocation / {alloc ? alloc.employeeName : "New"}
            </h1>
            <p className="text-sm font-medium text-slate-500 mb-8 mt-2">Form view of one allocation record</p>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (alloc) {
                    updateAllocation(alloc.id, { status: "Approved" });
                    setSelectedAllocation({ ...alloc, status: "Approved" });
                  }
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors text-sm"
              >
                Approve
              </button>
              <button 
                onClick={() => {
                  if (alloc) {
                    updateAllocation(alloc.id, { status: "Refused" as any });
                    setSelectedAllocation({ ...alloc, status: "Refused" });
                  }
                }}
                className="px-6 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm transition-colors text-sm"
              >
                Refuse
              </button>
            </div>
          </div>
          <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Employee</label>
                <input type="text" readOnly value={alloc ? alloc.employeeName : ""} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Time Off Type</label>
                <input type="text" readOnly value={alloc ? alloc.leaveType : "Paid Time Off"} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Allocated</label>
                <input type="text" readOnly value={alloc ? alloc.allocatedDays : ""} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Status</label>
                <input type="text" readOnly value={alloc ? alloc.status : "Approved"} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Taken</label>
                <input type="text" readOnly value={alloc ? `${alloc.takenDays} Days` : ""} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Remaining</label>
                <input type="text" readOnly value={alloc ? `${alloc.remainingDays} Days` : ""} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Approver</label>
                <input type="text" readOnly value="Sara Khan" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Validity</label>
                <input type="text" readOnly value="2026 Annual Balance" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
            </div>
            <div className="md:col-span-2 mt-4 bg-slate-50 border border-slate-200 rounded-xl p-6 relative">
              <label className="block text-sm font-bold text-slate-700 mb-3">Description</label>
              <p className="text-slate-800 font-medium whitespace-pre-wrap min-h-[60px]">
                Annual leave balance granted at start of policy year.
              </p>
              <p className="text-xs text-slate-500 absolute bottom-4 left-6 italic">
                Useful note: approved allocation is what creates available leave balance for the employee.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 p-6 md:p-8 bg-[#F4F6FA] h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Allocations</h1>
          <p className="text-sm font-medium text-slate-500">
            List view opened from Time Off <span className="mx-1">→</span> Allocations
          </p>
        </div>
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => setSelectedAllocation("NEW")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition-colors uppercase text-sm tracking-wider"
          >
            New
          </button>
          <div className="relative w-72">
            <input type="text" placeholder="Search allocations..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-600">Employee</th>
                <th className="px-6 py-4 font-bold text-slate-600">Type</th>
                <th className="px-6 py-4 font-bold text-slate-600">Allocated</th>
                <th className="px-6 py-4 font-bold text-slate-600">Taken</th>
                <th className="px-6 py-4 font-bold text-slate-600">Remaining</th>
                <th className="px-6 py-4 font-bold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {allocations.map((alloc) => (
                <tr key={alloc.id} onClick={() => setSelectedAllocation(alloc)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-bold text-slate-900">{alloc.employeeName}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{alloc.leaveType}</td>
                  <td className="px-6 py-4 font-bold text-slate-600">{alloc.allocatedDays} days</td>
                  <td className="px-6 py-4 font-bold text-slate-600">{alloc.takenDays} days</td>
                  <td className="px-6 py-4 font-black text-[#00A09D]">{alloc.remainingDays} days</td>
                  <td className="px-6 py-4"><span className="font-bold text-emerald-600">{alloc.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-[#F8F9EC] border-t border-slate-200 text-xs font-medium text-slate-500 italic">
            Useful note: the list should expose the balance math at a glance - Allocated, Taken and Remaining.
          </div>
        </div>
      </div>
    );
  }

  // Time off Types view
  if (activeTimeOffTab === "Time off Types") {
    if (selectedType) {
      const isNew = selectedType === "NEW";
      const typ = isNew ? null : selectedType;
      // Define inline component state for editing so it persists during edit
      return (
        <TimeOffTypeDetail 
          initialType={typ} 
          isNew={isNew} 
          onBack={() => setSelectedType(null)} 
        />
      );
    }

    return (
      <div className="flex-1 p-6 md:p-8 bg-[#F4F6FA] h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Time Off Types</h1>
          <p className="text-sm font-medium text-slate-500">
            List view opened from Time Off <span className="mx-1">→</span> Time Off Types
          </p>
        </div>
        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => setSelectedType("NEW")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition-colors uppercase text-sm tracking-wider"
          >
            New
          </button>
          <div className="relative w-72">
            <input type="text" placeholder="Search time off types..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-600">Time Off Type</th>
                <th className="px-6 py-4 font-bold text-slate-600">Unit</th>
                <th className="px-6 py-4 font-bold text-slate-600">Allocation</th>
                <th className="px-6 py-4 font-bold text-slate-600">Approval</th>
                <th className="px-6 py-4 font-bold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {timeOffTypes.map((typ) => (
                <tr key={typ.id} onClick={() => setSelectedType(typ)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 font-bold text-slate-900">{typ.name}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{typ.unit}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{typ.allocationRequired ? "Required" : "No"}</td>
                  <td className="px-6 py-4 font-medium text-slate-600">{typ.requiresApproval ? "Manager" : "None"}</td>
                  <td className="px-6 py-4"><span className="font-bold text-emerald-600">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-[#F8F9EC] border-t border-slate-200 text-xs font-medium text-slate-500 italic">
            Useful note: this list defines policy rules, not employee transactions.
          </div>
        </div>
      </div>
    );
  }

  return null;
}
