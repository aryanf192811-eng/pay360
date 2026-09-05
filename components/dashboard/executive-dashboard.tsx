"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  CreditCard,
  Calendar,
  Sparkles,
  ArrowUpRight,
  FileText,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { useAuthStore } from "@/lib/store/auth.store";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export function ExecutiveDashboard() {
  const { setActiveNavTab, setIsPayrunWizardOpen } = useStore();
  const { user } = useAuthStore();

  const [selectedPeriod] = useState("September 2026");

  // Mock data for the dashboard
  const deptBreakdown = [
    { name: "Engineering", amount: 445000, percentage: 53.7, color: "bg-[#714B67]" },
    { name: "Sales", amount: 205000, percentage: 24.7, color: "bg-[#00A09D]" },
    { name: "Product", amount: 140000, percentage: 16.9, color: "bg-amber-500" },
    { name: "Human Resources", amount: 133000, percentage: 16.0, color: "bg-indigo-500" },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* 1. Dynamic Welcome Banner */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-br from-white via-white to-slate-50 rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6"
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #714B67 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#714B67] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#00A09D]" />
            <span>Odoo 18 Enterprise Core</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Good afternoon, {user?.email ? user.email.split('@')[0].split('.')[0].replace(/^\w/, c => c.toUpperCase()) : 'Aarav'}!
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Here is today&apos;s real-time payroll health across all active contracts for {selectedPeriod}.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsPayrunWizardOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#00A09D] to-[#008A87] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Generate Payrun</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveNavTab("Time Off")}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#714B67] hover:bg-[#714B67]/5 text-sm font-bold border-2 border-[#714B67]/20 shadow-sm transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Review Approvals</span>
          </motion.button>
        </div>
      </motion.div>

      {/* 2. Bento Grid KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Net Disbursed", value: "₹8,28,000", change: "+4.2%", icon: CreditCard, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
          { title: "Payslips Generated", value: "8", change: "100% Target", icon: FileText, color: "text-[#714B67]", bg: "bg-purple-50", border: "border-purple-100" },
          { title: "Average Salary", value: "₹1,03,500", change: "+1.1%", icon: DollarSign, color: "text-[#00A09D]", bg: "bg-teal-50", border: "border-teal-100" },
          { title: "Compliance Score", value: "100%", change: "Audit Passed", icon: ShieldCheck, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100" },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`group bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden`}
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${kpi.bg} opacity-50 group-hover:scale-150 transition-transform duration-500 ease-out`} />
            <div className="relative z-10 flex items-center justify-between mb-4">
              <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
                {kpi.title}
              </span>
              <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color} shadow-sm`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
                <ArrowUpRight className="w-3 h-3" />
                {kpi.change}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. Main Dashboard Content - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col - 2 spans */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Department Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#714B67]" />
                  Department Cost Center
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Salary allocation across departments for {selectedPeriod}</p>
              </div>
              <button className="text-xs font-bold text-[#00A09D] hover:underline">View Details</button>
            </div>
            <div className="space-y-4">
              {deptBreakdown.map((dept, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-bold text-slate-700">{dept.name}</span>
                    <span className="font-black text-slate-900">₹{dept.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.percentage}%` }}
                      transition={{ duration: 1, delay: 0.2 + idx * 0.1 }}
                      className={`h-full ${dept.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Activity Mini-Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
             <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Recent Platform Activity
              </h3>
              <div className="space-y-4">
                {[
                  { icon: CheckCircle2, title: "Payrun 'PAY-SEP-2026' Computed", time: "10 mins ago", color: "text-emerald-600", bg: "bg-emerald-50" },
                  { icon: AlertTriangle, title: "Bank details missing for EMP-003", time: "1 hour ago", color: "text-amber-600", bg: "bg-amber-50" },
                  { icon: Users, title: "Alice Admin updated HR Policies", time: "3 hours ago", color: "text-[#714B67]", bg: "bg-purple-50" },
                ].map((act, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className={`p-2 rounded-lg ${act.bg} ${act.color}`}>
                      <act.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{act.title}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{act.time}</p>
                    </div>
                  </div>
                ))}
              </div>
          </div>
        </motion.div>

        {/* Right Col - 1 span */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Quick Stats Widget */}
          <div className="bg-gradient-to-b from-[#714B67] to-[#5C3D54] rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Users className="w-32 h-32" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-6 relative z-10">Workforce Health</h3>
            
            <div className="space-y-5 relative z-10">
              <div>
                <div className="text-4xl font-black">92%</div>
                <div className="text-sm font-medium text-white/80 mt-1">Overall Attendance Rate</div>
              </div>
              <div className="h-px bg-white/20 w-full" />
              <div>
                <div className="text-4xl font-black">8</div>
                <div className="text-sm font-medium text-white/80 mt-1">Active Contracts</div>
              </div>
              <div className="h-px bg-white/20 w-full" />
              <div>
                <div className="text-4xl font-black">3</div>
                <div className="text-sm font-medium text-white/80 mt-1">Pending Leave Requests</div>
              </div>
            </div>
            
            <motion.button 
              whileHover={{ x: 4 }}
              onClick={() => setActiveNavTab("Employees")}
              className="mt-6 flex items-center gap-2 text-sm font-bold text-white hover:text-white/80 transition-colors relative z-10"
            >
              View Directory <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
