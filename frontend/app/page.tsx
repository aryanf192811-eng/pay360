"use client";

import React from "react";
import { StoreProvider, useStore } from "@/lib/store-context";
import { TopBar } from "@/components/navigation/top-bar";
import { HubHeader } from "@/components/employee-hub/hub-header";
import { EmployeeCard } from "@/components/employee-hub/employee-card";
import { EmployeeList } from "@/components/employee-hub/employee-list";
import { EmployeeForm } from "@/components/employee-hub/employee-form";
import { AddEmployeeDialog } from "@/components/employee-hub/add-employee-dialog";
import { ContractsHub } from "@/components/contracts/contracts-hub";
import { AttendanceHub } from "@/components/attendance/attendance-hub";
import { TimeOffHub } from "@/components/timeoff/timeoff-hub";
import { PayrunEngine } from "@/components/payroll/payrun-engine";
import { ExecutiveDashboard } from "@/components/dashboard/executive-dashboard";
import { UserManagementHub } from "@/components/user-management/user-management-hub";
import { SchedulesHub } from "@/components/schedules/schedules-hub";

import { PayrunWizardDialog } from "@/components/payroll/payrun-wizard-dialog";
import { PayslipModal } from "@/components/payroll/payslip-modal";
import { LoginDialog } from "@/components/auth/login-dialog";
import { EnterpriseFooter } from "@/components/footer/enterprise-footer";
import { Clock, FileText, Calendar, Building, Briefcase, MapPin, Mail, UserCheck, Phone, Users, Plus } from "lucide-react";

function MainContent() {
  const {
    employees,
    selectedEmployee,
    viewMode,
    activeFilter,
    searchQuery,
    activeNavTab,
    setIsAddEmployeeOpen,
    isAuthenticated,
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

  // Auth Gate: block the whole app until user logs in (Excalidraw flow block 0)
  if (!isAuthenticated) {
    return <LoginDialog />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <TopBar />



      {/* Module 1: Employees Hub — PDF §B1, B2 */}
      {activeNavTab === "Employees" && (
        <div className="flex-1 flex flex-col">
          <HubHeader />

          <main className="flex-1 p-4 sm:p-6 w-full mx-auto">
            {selectedEmployee ? (
              <EmployeeForm employee={selectedEmployee} />
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-16 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 p-8 shadow-xs">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No employees found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search query or department filter pill.
                </p>
                <button
                  onClick={() => setIsAddEmployeeOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 bg-[#00A09D] hover:bg-[#008A87] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer"
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

      {/* Module 2: Contracts Management Hub — PDF §A2 */}
      {activeNavTab === "Contracts" && (
        <main className="flex-1 p-4 sm:p-6 w-full mx-auto">
          <ContractsHub />
        </main>
      )}

      {/* Module 3: Attendance — PDF §A3 Working Schedules + §B3 Attendance List/Form */}
      {activeNavTab === "Attendance" && (
        <main className="flex-1 p-4 sm:p-6 w-full mx-auto">
          <AttendanceHub />
        </main>
      )}

      {/* Module 4: Time Off & Leave Approvals — PDF §A4 + §B4 */}
      {activeNavTab === "Time Off" && (
        <main className="flex-1 p-4 sm:p-6 w-full mx-auto">
          <TimeOffHub />
        </main>
      )}

      {/* Module 5: Payrun Engine Pipeline — PDF §B5 B6 B7 B8 */}
      {activeNavTab === "Payroll" && (
        <main className="flex-1 p-4 sm:p-6 w-full mx-auto">
          <PayrunEngine />
        </main>
      )}

      {/* Module 6: Executive Reports Dashboard */}
      {activeNavTab === "Reports" && (
        <main className="flex-1 p-4 sm:p-6 w-full mx-auto">
          <ExecutiveDashboard />
        </main>
      )}

      {/* Admin Module: User Management */}
      {activeNavTab === "User Management" && (
        <UserManagementHub />
      )}

      {/* Module: Working Schedules */}
      {activeNavTab === "Working Schedule" && (
        <main className="flex-1 p-4 sm:p-6 w-full mx-auto">
          <SchedulesHub />
        </main>
      )}

      {/* Enterprise Footer */}
      <EnterpriseFooter />

      {/* Global Interactive Modals & Slide-Overs */}
      <AddEmployeeDialog />
      <PayrunWizardDialog />
      <PayslipModal />
      {/* LoginDialog used for role-switch when already authenticated */}
      <LoginDialog />
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
