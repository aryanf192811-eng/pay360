"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import { Search, Plus } from "lucide-react";
import { TimeOffRecord } from "@/lib/mock-data";

export function TimeOffHub() {
  const { timeOff, employees, approveTimeOff, refuseTimeOff, activeTimeOffTab, allocations, timeOffTypes } = useStore();
  const [selectedRequest, setSelectedRequest] = useState<TimeOffRecord | "NEW" | null>(null);
  const [selectedAllocation, setSelectedAllocation] = useState<any | "NEW" | null>(null);
  const [selectedType, setSelectedType] = useState<any | "NEW" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRequests = timeOff.filter((req) => {
    const empName = employees.find(e => e.id === req.employeeId)?.name || req.employeeId;
    return empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (req.leaveType || req.type || "").toLowerCase().includes(searchQuery.toLowerCase());
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
                onClick={() => setSelectedRequest(null)}
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
              <input 
                type="text" 
                defaultValue={req ? (employees.find(e => e.id === req.employeeId)?.name || req.employeeId) : ""} 
                readOnly={!isNew}
                className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Time Off Type</label>
              <input 
                type="text" 
                defaultValue={req ? (req.leaveType || req.type || "Paid Time Off") : ""} 
                readOnly={!isNew}
                className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Start Date</label>
              <input 
                type="date" 
                defaultValue={req ? req.startDate : ""} 
                readOnly={!isNew}
                className="w-full p-3 bg-white border border-slate-200/80 rounded-xl font-medium text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">End Date</label>
              <input 
                type="date" 
                defaultValue={req ? req.endDate : ""} 
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
                type="text" 
                defaultValue={req ? `${req.days} Days` : ""} 
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

  // Dashboard / Time offs view
  if (activeTimeOffTab === "Dashboard" || activeTimeOffTab === "Time offs") {
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
            <button className="px-5 py-2 bg-white/80 backdrop-blur-md border border-slate-200/80 text-slate-700 font-bold text-sm rounded-xl hover:bg-white transition-all shadow-sm">
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
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors text-sm">Approve</button>
              <button className="px-6 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm transition-colors text-sm">Refuse</button>
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
      return (
        <div className="flex-1 p-6 md:p-8 bg-white h-full flex flex-col">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <button onClick={() => setSelectedType(null)} className="text-sm text-slate-400 hover:text-slate-600 font-bold uppercase tracking-wider mr-2">← Back</button>
              Time Off Type / {typ ? typ.name : "New"}
            </h1>
            <p className="text-sm font-medium text-slate-500 mb-8 mt-2">Form view of one time off type</p>
            <button className="px-6 py-2 border-2 border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm transition-colors text-sm hover:bg-slate-50">EDIT</button>
          </div>
          <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Type Name</label>
                <input type="text" readOnly value={typ ? typ.name : ""} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Unit</label>
                <input type="text" readOnly value={typ ? typ.unit : "Days"} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Requires Allocation</label>
                <input type="text" readOnly value={typ ? (typ.allocationRequired ? "Yes" : "No") : "Yes"} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Active</label>
                <input type="text" readOnly value="True" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Approval</label>
                <input type="text" readOnly value={typ ? (typ.requiresApproval ? "Manager" : "None") : "Manager"} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Payroll / Work Entry</label>
                <input type="text" readOnly value="Leave Work Entry" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-bold text-slate-600 mb-2">Display Color</label>
                <input type="text" readOnly value="Blue" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900" />
              </div>
            </div>
            <div className="md:col-span-2 mt-4 bg-slate-50 border border-slate-200 rounded-xl p-6 relative">
              <label className="block text-sm font-bold text-slate-700 mb-3">Configuration Notes</label>
              <p className="text-slate-800 font-medium whitespace-pre-wrap min-h-[60px]">
                Standard annual leave. Balance comes from approved allocations.
              </p>
              <p className="text-xs text-slate-500 absolute bottom-4 left-6 italic">
                Useful note: Time Off Type drives approval behavior and whether a request needs an allocation.
              </p>
            </div>
          </div>
        </div>
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
