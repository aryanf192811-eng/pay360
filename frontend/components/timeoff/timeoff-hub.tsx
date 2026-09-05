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
      <div className="flex-1 p-6 md:p-8 bg-white h-full flex flex-col">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
            Time Off Request {req ? `/ ${req.employeeName}` : "/ New"}
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Form view of one request
          </p>
        </div>

        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
          <button 
            onClick={(e) => {
              if (req) handleApprove(e, req.id);
            }}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-colors"
          >
            Approve
          </button>
          <button 
            onClick={(e) => {
              if (req) handleRefuse(e, req.id);
            }}
            className="px-6 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm transition-colors"
          >
            Refuse
          </button>
          <button 
            onClick={() => setSelectedRequest(null)}
            className="px-6 py-2 ml-auto text-slate-500 hover:text-slate-700 font-medium transition-colors"
          >
            Back to List
          </button>
        </div>

        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Employee</label>
              <input 
                type="text" 
                value={req ? (employees.find(e => e.id === req.employeeId)?.name || req.employeeId) : ""} 
                readOnly 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Time Off Type</label>
              <input 
                type="text" 
                value={req ? (req.leaveType || req.type || "Paid Time Off") : "Paid Time Off"} 
                readOnly 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Start Date</label>
              <input 
                type="text" 
                value={req ? req.startDate : ""} 
                readOnly 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">End Date</label>
              <input 
                type="text" 
                value={req ? req.endDate : ""} 
                readOnly 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Duration</label>
              <input 
                type="text" 
                value={req ? `${req.days} Days` : ""} 
                readOnly 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Status</label>
              <input 
                type="text" 
                value={req ? req.status : "Pending"} 
                readOnly 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Approver</label>
              <input 
                type="text" 
                value={req ? "Sara Khan" : ""} 
                readOnly 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Allocation Used</label>
              <input 
                type="text" 
                value={req ? `${req.leaveType || req.type} 2026` : ""} 
                readOnly 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-md font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Full Width Reason */}
          <div className="md:col-span-2 mt-4 bg-slate-50 border border-slate-200 rounded-xl p-6 relative">
            <label className="block text-sm font-bold text-slate-700 mb-3">Reason</label>
            <p className="text-slate-800 font-medium whitespace-pre-wrap min-h-[100px]">
              {req ? req.reason || "Family vacation" : ""}
            </p>
            <p className="text-xs text-slate-500 absolute bottom-4 left-6 italic">
              Useful note: if the leave type requires allocation, the request should clearly show which balance was consumed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard / Time offs view
  if (activeTimeOffTab === "Dashboard" || activeTimeOffTab === "Time offs") {
    return (
      <div className="flex-1 p-6 md:p-8 bg-[#F4F6FA] h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Time Off Requests</h1>
          <p className="text-sm font-medium text-slate-500">
            List view opened from Time Off <span className="mx-1">→</span> {activeTimeOffTab}
          </p>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <button 
            onClick={() => setSelectedRequest("NEW")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition-colors uppercase text-sm tracking-wider"
          >
            New
          </button>
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-slate-900 text-sm rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          <button className="px-4 py-2 bg-white text-blue-700 font-bold text-sm rounded-lg border border-blue-200 shadow-sm">
            My Team
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-600">Employee</th>
                <th className="px-6 py-4 font-bold text-slate-600">Time Off Type</th>
                <th className="px-6 py-4 font-bold text-slate-600">Start</th>
                <th className="px-6 py-4 font-bold text-slate-600">End</th>
                <th className="px-6 py-4 font-bold text-slate-600">Duration</th>
                <th className="px-6 py-4 font-bold text-slate-600">Status</th>
                <th className="px-6 py-4 font-bold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredRequests.map((req) => (
                <tr 
                  key={req.id} 
                  onClick={() => setSelectedRequest(req)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-bold text-slate-900">{employees.find(e => e.id === req.employeeId)?.name || req.employeeId}</td>
                  <td className="px-6 py-4 font-medium text-slate-700">{req.leaveType || req.type}</td>
                  <td className="px-6 py-4 text-slate-600">{req.startDate}</td>
                  <td className="px-6 py-4 text-slate-600">{req.endDate}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{req.days} Day{req.days > 1 ? 's' : ''}</td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${
                      req.status === "Approved" ? "text-emerald-600" :
                      req.status === "Refused" ? "text-rose-600" :
                      "text-amber-600"
                    }`}>
                      {req.status === "Pending" ? "To Approve" : req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <button 
                        onClick={(e) => handleApprove(e, req.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700 transition-colors uppercase tracking-wider"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={(e) => handleRefuse(e, req.id)}
                        className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-[10px] font-bold rounded hover:bg-slate-50 transition-colors uppercase tracking-wider"
                      >
                        Refuse
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
