"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store-context";
import { Employee } from "@/lib/mock-data";
import { Mail, Phone, Briefcase, ChevronRight, Star, HeartHandshake } from "lucide-react";

export function EmployeeCard({ employee, index = 0 }: { employee: Employee, index?: number }) {
  const { setSelectedEmployee } = useStore();
  const [showKudos, setShowKudos] = useState(false);

  const name = employee.name || employee.email;
  const avatarUrl = employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=714B67&color=fff&bold=true&rounded=true`;

  const isActive = employee.status?.toLowerCase() === "active";

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (employee.phone) {
      window.location.href = `tel:${employee.phone}`;
    }
  };

  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (employee.email) {
      window.location.href = `mailto:${employee.email}`;
    }
  };

  const handleKudos = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowKudos(true);
    setTimeout(() => setShowKudos(false), 2000); // Hide after 2s
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -6, scale: 1.01 }}
      onClick={() => setSelectedEmployee(employee)}
      className="group relative bg-white border border-slate-200/80 rounded-[24px] p-6 shadow-sm hover:shadow-2xl hover:border-[#714B67]/30 transition-all duration-300 cursor-pointer flex flex-col gap-4 overflow-hidden"
    >
      {/* Premium Background Blurs */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#714B67]/10 via-[#714B67]/5 to-transparent rounded-bl-full blur-2xl group-hover:bg-[#714B67]/20 transition-colors duration-500 -z-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#00A09D]/10 via-[#00A09D]/5 to-transparent rounded-tr-full blur-2xl group-hover:bg-[#00A09D]/20 transition-colors duration-500 -z-10" />

      {/* Top Section: Avatar & Action Buttons */}
      <div className="flex justify-between items-start w-full relative z-10">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-[3px] border-white shadow-md flex flex-col items-center justify-center bg-white transform group-hover:-rotate-3 transition-transform duration-300 overflow-hidden ring-2 ring-slate-100">
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          </div>
          {/* Status Indicator */}
          <div 
            className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
              isActive ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
        </div>

        {/* Quick Actions (Always Visible) */}
        <div className="flex gap-2">
          <button 
            onClick={handleKudos}
            title="Send Kudos"
            className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 hover:bg-amber-500 hover:text-white hover:scale-110 transition-all shadow-sm"
          >
            <Star className="w-4 h-4" />
          </button>
          <button 
            onClick={handleCall}
            title="Call Employee"
            className="w-8 h-8 rounded-full bg-[#00A09D]/10 flex items-center justify-center text-[#00A09D] hover:bg-[#00A09D] hover:text-white hover:scale-110 transition-all shadow-sm"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button 
            onClick={handleEmail}
            title="Email Employee"
            className="w-8 h-8 rounded-full bg-[#714B67]/10 flex items-center justify-center text-[#714B67] hover:bg-[#714B67] hover:text-white hover:scale-110 transition-all shadow-sm"
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle Section: Details */}
      <div className="relative z-10 mt-2">
        <h3 className="text-lg font-black text-slate-900 group-hover:text-[#714B67] transition-colors line-clamp-1 mb-1 tracking-tight">
          {name}
        </h3>
        <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5 line-clamp-1 mb-4">
          <Briefcase className="w-4 h-4 text-slate-400" /> {employee.role || "Employee"}
        </p>

        {/* Contact Quick Info */}
        <div className="space-y-2 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400" /> 
            <span className="truncate">{employee.email}</span>
          </div>
          {employee.phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> 
              <span>{employee.phone}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom Section: Badges */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100/80 relative z-10">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-widest shadow-sm">
          {employee.department || "Dept"}
        </span>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${
          isActive ? "bg-emerald-50 border border-emerald-200/50 text-emerald-700" : "bg-amber-50 border border-amber-200/50 text-amber-700"
        }`}>
          {employee.status}
        </span>
      </div>

      {/* Kudos Success Overlay */}
      <AnimatePresence>
        {showKudos && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md rounded-[24px]"
          >
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center mb-3 shadow-lg animate-bounce">
              <HeartHandshake className="w-7 h-7" />
            </div>
            <p className="font-black text-lg text-slate-900">Kudos Sent!</p>
            <p className="text-sm font-medium text-slate-500 mt-1">Great job rewarding {employee.name.split(' ')[0]}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
