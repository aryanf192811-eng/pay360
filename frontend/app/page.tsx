"use client";

import React from "react";
import { StoreProvider, useStore } from "@/lib/store-context";
import { TopBar } from "@/components/navigation/top-bar";
import { HubHeader } from "@/components/employee-hub/hub-header";
import { EmployeeCard } from "@/components/employee-hub/employee-card";
import { EmployeeList } from "@/components/employee-hub/employee-list";
import { EmployeeDrawer } from "@/components/employee-hub/employee-drawer";
import { AddEmployeeDialog } from "@/components/employee-hub/add-employee-dialog";
import { ContractsHub } from "@/components/contracts/contracts-hub";
import { AttendanceHub } from "@/components/attendance/attendance-hub";
import { TimeOffHub } from "@/components/time-off/time-off-hub";
import { PayrunBatchView } from "@/components/payroll/payrun-batch-view";
import { PayrunWizardDialog } from "@/components/payroll/payrun-wizard-dialog";
import { PayslipModal } from "@/components/payroll/payslip-modal";
import { PayrollDashboard } from "@/components/dashboard/payroll-dashboard";
import { EnterpriseFooter } from "@/components/footer/enterprise-footer";
import { Users, Plus } from "lucide-react";

function MainContent() {
  const {
    employees,
    viewMode,
    activeFilter,
    searchQuery,
    activeNavTab,
    setIsAddEmployeeOpen,
  } = useStore();

  // Filter employees based on activeFilter and searchQuery
  const filteredEmployees = employees.filter((emp) => {
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "On Leave" && emp.status === "On Leave") ||
      emp.department === activeFilter;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      emp.name.toLowerCase().includes(query) ||
      emp.role.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.id.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F8FAFC]">
      <TopBar />

      {/* Module 1: Employees Hub (Screen 1) */}
      {activeNavTab === "Employees" && (
        <div className="flex-1 flex flex-col">
          <HubHeader />

          <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
            {filteredEmployees.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 shadow-xs">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No employees found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search query or department filter pill.
                </p>
                <button
                  onClick={() => setIsAddEmployeeOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 bg-[#00A09D] hover:bg-[#008A87] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add New Employee</span>
                </button>
              </div>
            ) : viewMode === "kanban" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredEmployees.map((emp) => (
                  <EmployeeCard key={emp.id} employee={emp} />
                ))}
              </div>
            ) : (
              <EmployeeList employees={filteredEmployees} />
            )}
          </main>
        </div>
      )}

      {/* Module 2: Contracts Management Hub (Screen 2) */}
      {activeNavTab === "Contracts" && (
        <main className="flex-1 py-4 max-w-7xl w-full mx-auto">
          <ContractsHub />
        </main>
      )}

      {/* Module 3: Attendance Matrix Hub */}
      {activeNavTab === "Attendance" && (
        <main className="flex-1 py-4 max-w-7xl w-full mx-auto">
          <AttendanceHub />
        </main>
      )}

      {/* Module 4: Time Off & Leave Approvals Hub */}
      {activeNavTab === "Time Off" && (
        <main className="flex-1 py-4 max-w-7xl w-full mx-auto">
          <TimeOffHub />
        </main>
      )}

      {/* Module 5: Payrun Batch Processing & Computation (Screen 3 & Screen 4) */}
      {activeNavTab === "Payroll" && (
        <main className="flex-1 py-4 max-w-7xl w-full mx-auto">
          <PayrunBatchView />
        </main>
      )}

      {/* Module 6: Executive Payroll Dashboard (Screen 5 - Reports) */}
      {activeNavTab === "Reports" && (
        <main className="flex-1 py-4 max-w-7xl w-full mx-auto">
          <PayrollDashboard />
        </main>
      )}

      {/* Enterprise Footer */}
      <EnterpriseFooter />

      {/* Global Interactive Modals & Slide-Overs */}
      <EmployeeDrawer />
      <AddEmployeeDialog />
      <PayrunWizardDialog />
      <PayslipModal />
    </div>
  );
}

export default function Home() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
