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
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 shadow-xs">
        {/* Top Row: Breadcrumb, Search, Add Employee, View Toggles */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Breadcrumb Title */}
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <span className="text-[#714B67] font-bold hover:underline cursor-pointer">
            PeoplePay360
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-slate-800 font-semibold">Employees</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-[#00A09D] font-bold bg-[#00A09D]/10 px-3 py-1 rounded-full text-xs">
            Active Hub ({employees.length} Staff)
          </span>
        </div>

        {/* Action Controls: Search, View Switcher, Add Employee */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search Bar (Upgraded size) */}
          <div className="relative min-w-[240px] sm:min-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, role, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67] focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("kanban")}
              title="Kanban Board View"
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-[#714B67] shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              title="List View"
              className={`px-3 py-1.5 rounded-md text-xs sm:text-sm flex items-center gap-1.5 transition-all ${
                viewMode === "list"
                  ? "bg-white text-[#714B67] shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
          </div>

          {/* Add Employee CTA - Prominent Odoo Teal (#00A09D) */}
          <button
            onClick={() => setIsAddEmployeeOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#00A09D] hover:bg-[#008A87] active:bg-[#006E6B] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-all duration-150 hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Filter Pills (Legible text-sm) */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Filter className="w-4 h-4 text-slate-400 mr-1 shrink-0" />
        {filterTabs.map((tab) => {
          const isSelected = activeFilter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                isSelected
                  ? "bg-[#714B67] text-white shadow-xs font-bold"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isSelected ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
