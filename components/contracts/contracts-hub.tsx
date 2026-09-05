"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import { Search, FileSignature, ArrowLeft, Calendar, Building2, Briefcase, IndianRupee, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Contract } from "@/lib/mock-data";
import { formatINR } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ContractsHub() {
  const { contracts, employees } = useStore();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContracts = contracts.filter((c) =>
    c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 md:p-8 bg-slate-50 h-full overflow-hidden flex flex-col relative">
      <AnimatePresence mode="wait">
        {!selectedContract ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col h-full"
          >
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Contracts</h1>
                <p className="text-sm font-medium text-slate-500">Manage employee agreements and structures</p>
              </div>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contracts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#714B67] shadow-sm transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContracts.map((contract, idx) => {
                  const emp = employees.find(e => e.id === contract.employeeId);
                  const isActive = contract.status === "Active";

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -4, scale: 1.02 }}
                      key={contract.id}
                      onClick={() => setSelectedContract(contract)}
                      className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-[#714B67]/30 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#714B67]/5 to-transparent rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform" />
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#714B67]/10 flex items-center justify-center text-[#714B67]">
                            <FileSignature className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 group-hover:text-[#714B67] transition-colors">{contract.id}</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{contract.title}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}>
                          {contract.status}
                        </span>
                      </div>

                      <div className="space-y-3 mb-5">
                        <div className="flex items-center gap-2 text-sm">
                          <img src={emp?.avatar || `https://ui-avatars.com/api/?name=${contract.employeeName.replace(' ', '+')}&background=random`} alt="" className="w-6 h-6 rounded-full" />
                          <span className="font-semibold text-slate-700">{contract.employeeName}</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <span className="text-xs text-slate-500 font-medium">Monthly Wage</span>
                          <span className="font-black text-[#00A09D]">{formatINR(contract.wage)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-3 border-t border-slate-100">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {contract.startDate}</span>
                        <span>{contract.department}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#714B67] to-[#8C6081] px-8 py-6 text-white flex justify-between items-center relative overflow-hidden shrink-0">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="relative z-10 flex items-center gap-4">
                <button 
                  onClick={() => setSelectedContract(null)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-2xl font-black">{selectedContract.id}</h2>
                  <p className="text-white/80 font-medium text-sm flex items-center gap-2">
                    {selectedContract.title} <span className="w-1 h-1 bg-white/50 rounded-full" /> {selectedContract.employeeName}
                  </p>
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <button
                  onClick={(e) => {
                    const btn = e.currentTarget;
                    const originalText = btn.innerHTML;
                    btn.innerHTML = '<svg class="animate-spin w-4 h-4 inline mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg> Downloading...';
                    setTimeout(() => {
                      btn.innerHTML = '<svg class="w-4 h-4 inline mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> Downloaded';
                      btn.classList.add('bg-emerald-500', 'border-emerald-400');
                      setTimeout(() => {
                        btn.innerHTML = originalText;
                        btn.classList.remove('bg-emerald-500', 'border-emerald-400');
                      }, 2000);
                    }, 1500);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-md border bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all flex items-center shadow-sm"
                >
                  <FileSignature className="w-4 h-4 inline mr-2" />
                  Download PDF
                </button>
                <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider backdrop-blur-md border ${
                  selectedContract.status === 'Active' ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-50' : 'bg-slate-500/20 border-slate-400/50 text-slate-50'
                }`}>
                  {selectedContract.status === 'Active' ? <CheckCircle2 className="w-4 h-4 inline mr-1" /> : <AlertCircle className="w-4 h-4 inline mr-1" />}
                  {selectedContract.status}
                </span>
              </div>
            </div>

            {/* Document Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
              <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-slate-200 shadow-sm relative">
                
                {/* Watermark */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                  <Building2 className="w-96 h-96" />
                </div>

                <div className="flex justify-between items-start mb-12 border-b border-slate-100 pb-8 relative z-10">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Employee Info</h3>
                    <p className="text-xl font-black text-slate-900">{selectedContract.employeeName}</p>
                    <p className="text-slate-600 font-medium flex items-center gap-1.5 mt-2">
                      <Briefcase className="w-4 h-4 text-slate-400" /> {selectedContract.title}
                    </p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Contract Duration</h3>
                    <p className="text-base font-bold text-slate-800 flex items-center justify-end gap-2">
                      <Calendar className="w-4 h-4 text-[#714B67]" /> {selectedContract.startDate} — {selectedContract.endDate || "Present"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12 relative z-10">
                  <div>
                    <h4 className="text-sm font-bold text-[#714B67] flex items-center gap-2 mb-6 uppercase tracking-wider border-b border-slate-100 pb-2">
                      <IndianRupee className="w-4 h-4" /> Salary Information
                    </h4>
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Wage</p>
                        <p className="text-3xl font-black text-[#00A09D]">{formatINR(selectedContract.wage)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Salary Structure</p>
                        <p className="text-sm font-semibold text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-100">{selectedContract.structure}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#714B67] flex items-center gap-2 mb-6 uppercase tracking-wider border-b border-slate-100 pb-2">
                      <Building2 className="w-4 h-4" /> Role & Schedule
                    </h4>
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                        <p className="text-sm font-semibold text-slate-800 inline-flex items-center px-3 py-1.5 bg-slate-100 rounded-md">
                          {selectedContract.department}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Working Schedule</p>
                        <p className="text-sm font-semibold text-slate-800 flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-md w-max">
                          <Clock className="w-4 h-4" /> {selectedContract.workingSchedule}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Signature Area Mockup */}
                <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between relative z-10">
                  <div className="w-48 text-center">
                    <div className="border-b-2 border-slate-300 h-16 mb-2"></div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employer Signature</p>
                  </div>
                  <div className="w-48 text-center">
                    <div className="border-b-2 border-slate-300 h-16 mb-2 flex items-end justify-center pb-2">
                       <span className="font-['Cedarville_Cursive'] text-2xl text-slate-800 opacity-60 transform -rotate-2">{selectedContract.employeeName.split(' ')[0]}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Signature</p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
