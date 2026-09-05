"use client";

import React from "react";
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  Filter,
  ChevronRight,
} from "lucide-react";
import { useStore } from "@/lib/store-context";
import { motion } from "framer-motion";

export function HubHeader() {
  const {
    employees,
    viewMode,
    setViewMode,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    setIsAddEmployeeOpen,
  } = useStore();

  const filterTabs = [
    { label: "All", value: "All", count: employees.length },
    {
      label: "Engineering",
      value: "Engineering",
      count: employees.filter((e) => e.department === "Engineering").length,
    },
    {
      label: "Product",
      value: "Product",
      count: employees.filter((e) => e.department === "Product").length,
    },
    {
      label: "HR",
      value: "Human Resources",
      count: employees.filter((e) => e.department === "Human Resources").length,
    },
    {
      label: "Sales",
      value: "Sales",
      count: employees.filter((e) => e.department === "Sales").length,
    },
    {
      label: "On Leave",
      value: "On Leave",
      count: employees.filter((e) => e.status === "On Leave").length,
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200/60 px-6 sm:px-8 py-5 shadow-sm relative z-20">
      <div className="max-w-[1600px] mx-auto">
        {/* Top Row: Search, Add Employee, View Toggles */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">          {/* Action Controls: Search, View Switcher, Add Employee */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search Bar */}
            <div className="relative min-w-[280px] sm:min-w-[340px] group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#714B67] transition-colors" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 focus:border-[#714B67]/50 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium shadow-sm"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shadow-sm">
              <button
                onClick={() => setViewMode("kanban")}
                title="Kanban Board View"
                className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all ${
                  viewMode === "kanban"
                    ? "bg-white text-[#714B67] shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="List View"
                className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all ${
                  viewMode === "list"
                    ? "bg-white text-[#714B67] shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <List className="w-4 h-4" />
                <span className="hidden sm:inline">List</span>
              </button>
            </div>

            {/* Add Employee Button */}
            <button
              onClick={() => setIsAddEmployeeOpen(true)}
              className="bg-gradient-to-r from-[#00A09D] to-[#008f8c] hover:from-[#008f8c] hover:to-[#007f7c] text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-[#00A09D]/20 transition-all flex items-center gap-2 text-sm hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Employee</span>
            </button>
          </div>
        </div>

        {/* Bottom Row: Filter Tabs */}
        <div className="flex items-center gap-4 mt-6 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest px-2">
            <Filter className="w-4 h-4" /> Filters
          </div>
          
          <div className="flex gap-2">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveFilter(tab.value)}
                  className={`relative px-4 py-1.5 rounded-full flex items-center gap-2 text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "text-white shadow-md shadow-[#714B67]/20"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="filter-active-pill"
                      className="absolute inset-0 bg-gradient-to-r from-[#714B67] to-[#8C6081] rounded-full -z-10"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  {tab.label}
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-200/80 text-slate-500"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
