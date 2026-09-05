"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import {
  Employee,
  Contract,
  AttendanceRecord,
  TimeOffRecord,
  PayslipRecord,
  PayrunBatch,
  WorkingSchedule,
  LeaveAllocation,
  TimeOffTypeConfig,
  SalaryStructure,
  SalaryRule,
  UserRole,
  INITIAL_EMPLOYEES,
  INITIAL_CONTRACTS,
  INITIAL_ATTENDANCE,
  INITIAL_TIMEOFF,
  INITIAL_PAYRUN,
  INITIAL_SCHEDULES,
  INITIAL_ALLOCATIONS,
  INITIAL_TIMEOFF_TYPES,
  INITIAL_STRUCTURES,
  INITIAL_SALARY_RULES,
  createPayslipRecord,
} from "./mock-data";

interface StoreContextType {
  // Role & Company Switcher
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentCompany: string;
  setCurrentCompany: (company: string) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (v: boolean) => void;

  employees: Employee[];
  contracts: Contract[];
  attendance: AttendanceRecord[];
  timeOff: TimeOffRecord[];
  schedules: WorkingSchedule[];
  allocations: LeaveAllocation[];
  timeOffTypes: TimeOffTypeConfig[];
  salaryStructures: SalaryStructure[];
  salaryRules: SalaryRule[];

  selectedEmployee: Employee | null;
  setSelectedEmployee: (emp: Employee | null) => void;
  isAddEmployeeOpen: boolean;
  setIsAddEmployeeOpen: (open: boolean) => void;
  viewMode: "kanban" | "list";
  setViewMode: (mode: "kanban" | "list") => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  addEmployee: (newEmp: Omit<Employee, "id" | "smartMetrics" | "joinedDate">) => void;
  updateEmployeeBankDetails: (empId: string, bank: { accountNumber: string; bankName: string; ifscCode: string }) => void;

  // Working Schedules
  addSchedule: (schedule: WorkingSchedule) => void;

  // Attendance & Time Off Actions
  approveTimeOff: (id: string) => void;
  refuseTimeOff: (id: string) => void;
  addAllocation: (allocation: LeaveAllocation) => void;
  addAttendanceRecord: (record: AttendanceRecord) => void;

  // Payroll specific state
  payrunBatch: PayrunBatch;
  setPayrunBatch: React.Dispatch<React.SetStateAction<PayrunBatch>>;
  selectedPayslip: PayslipRecord | null;
  setSelectedPayslip: (slip: PayslipRecord | null) => void;
  isPayrunWizardOpen: boolean;
  setIsPayrunWizardOpen: (open: boolean) => void;
  recomputeBatch: () => void;
  validateBatch: () => void;
  markBatchPaid: () => void;
  createPayrunBatch: (period: string, structure: string, departmentScope: string, selectedEmpIds: string[]) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("Admin");
  const [currentCompany, setCurrentCompany] = useState<string>("PeoplePay360 Corp (IN) - Gandhinagar HQ");
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [timeOff, setTimeOff] = useState<TimeOffRecord[]>(INITIAL_TIMEOFF);
  const [schedules, setSchedules] = useState<WorkingSchedule[]>(INITIAL_SCHEDULES);
  const [allocations, setAllocations] = useState<LeaveAllocation[]>(INITIAL_ALLOCATIONS);
  const [timeOffTypes] = useState<TimeOffTypeConfig[]>(INITIAL_TIMEOFF_TYPES);
  const [salaryStructures] = useState<SalaryStructure[]>(INITIAL_STRUCTURES);
  const [salaryRules] = useState<SalaryRule[]>(INITIAL_SALARY_RULES);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeNavTab, setActiveNavTab] = useState<string>("Employees");

  // Payroll state
  const [payrunBatch, setPayrunBatch] = useState<PayrunBatch>(INITIAL_PAYRUN);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipRecord | null>(null);
  const [isPayrunWizardOpen, setIsPayrunWizardOpen] = useState(false);

  const addEmployee = (data: Omit<Employee, "id" | "smartMetrics" | "joinedDate">) => {
    const nextNum = employees.length + 101;
    const newId = `EMP-${nextNum}`;
    const newContractId = `CTR-2026-${nextNum}`;

    const newEmp: Employee = {
      ...data,
      id: newId,
      joinedDate: new Date().toISOString().split("T")[0],
      smartMetrics: {
        contractsCount: 1,
        activeContractId: newContractId,
        attendancePercentage: 100,
        leaveBalance: 18,
        payslipsCount: 0,
      },
    };

    const newContract: Contract = {
      id: newContractId,
      employeeId: newId,
      employeeName: data.name,
      title: `${data.role} Contract`,
      department: data.department,
      wage: data.monthlyCTC,
      structure: "Standard Indian Corporate Payroll",
      startDate: new Date().toISOString().split("T")[0],
      status: "Active",
      workingSchedule: data.workingSchedule,
    };

    setEmployees((prev) => [newEmp, ...prev]);
    setContracts((prev) => [newContract, ...prev]);
  };

  const updateEmployeeBankDetails = (empId: string, bank: { accountNumber: string; bankName: string; ifscCode: string }) => {
    const isVerified = !!(bank.accountNumber && bank.ifscCode);

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === empId
          ? {
              ...emp,
              bankDetails: {
                ...bank,
                isVerified,
              },
            }
          : emp
      )
    );

    setSelectedEmployee((prev) =>
      prev && prev.id === empId
        ? {
            ...prev,
            bankDetails: {
              ...bank,
              isVerified,
            },
          }
        : prev
    );

    setPayrunBatch((prev) => ({
      ...prev,
      payslips: prev.payslips.map((slip) =>
        slip.employeeId === empId
          ? {
              ...slip,
              bankAccount: bank.accountNumber,
              bankName: bank.bankName,
              ifscCode: bank.ifscCode,
              hasBankWarning: !isVerified,
            }
          : slip
      ),
    }));

    setSelectedPayslip((prev) =>
      prev && prev.employeeId === empId
        ? {
            ...prev,
            bankAccount: bank.accountNumber,
            bankName: bank.bankName,
            ifscCode: bank.ifscCode,
            hasBankWarning: !isVerified,
          }
        : prev
    );
  };

  // Add working schedule
  const addSchedule = (sched: WorkingSchedule) => {
    setSchedules((prev) => [sched, ...prev]);
  };

  // Approve a time off request (and deduct from employee allocation balance!)
  const approveTimeOff = (id: string) => {
    const req = timeOff.find((t) => t.id === id);
    if (!req) return;

    // 1. Mark request approved
    setTimeOff((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Approved" } : t))
    );

    // 2. Automatically deduct from employee leave balance & allocations (A4 Outcome)
    setAllocations((prev) =>
      prev.map((a) =>
        a.employeeId === req.employeeId && a.remainingDays >= req.days
          ? {
              ...a,
              takenDays: a.takenDays + req.days,
              remainingDays: a.remainingDays - req.days,
            }
          : a
      )
    );

    // 3. Update employee smart metrics leaveBalance
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === req.employeeId
          ? {
              ...e,
              smartMetrics: {
                ...e.smartMetrics,
                leaveBalance: Math.max(0, e.smartMetrics.leaveBalance - req.days),
              },
            }
          : e
      )
    );
  };

  // Refuse a time off request
  const refuseTimeOff = (id: string) => {
    setTimeOff((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Refused" } : t))
    );
  };

  // Add leave allocation
  const addAllocation = (alloc: LeaveAllocation) => {
    setAllocations((prev) => [alloc, ...prev]);
  };

  // Add an attendance correction record
  const addAttendanceRecord = (record: AttendanceRecord) => {
    setAttendance((prev) => [record, ...prev]);
  };

  const recomputeBatch = () => {
    setPayrunBatch((prev) => {
      const updatedSlips = prev.payslips.map((slip) => {
        const emp = employees.find((e) => e.id === slip.employeeId);
        if (!emp) return slip;
        return createPayslipRecord(emp, prev.id, prev.period, slip.lopDays, "Computed");
      });
      return {
        ...prev,
        status: "Computed",
        payslips: updatedSlips,
      };
    });
  };

  const validateBatch = () => {
    setPayrunBatch((prev) => ({
      ...prev,
      status: "Validated",
      payslips: prev.payslips.map((s) => ({ ...s, status: "Validated" })),
    }));
  };

  const markBatchPaid = () => {
    setPayrunBatch((prev) => ({
      ...prev,
      status: "Paid",
      payslips: prev.payslips.map((s) => ({ ...s, status: "Paid" })),
    }));
  };

  const createPayrunBatch = (
    period: string,
    structure: string,
    departmentScope: string,
    selectedEmpIds: string[]
  ) => {
    const selectedList = employees.filter((e) => selectedEmpIds.includes(e.id));
    const newRunId = `PAY-${period.replace(/\s+/g, "-").toUpperCase()}`;

    const newSlips = selectedList.map((emp) =>
      createPayslipRecord(emp, newRunId, period, emp.id === "EMP-107" ? 1 : 0, "Draft")
    );

    setPayrunBatch({
      id: newRunId,
      name: `${period} Corporate Payrun`,
      period,
      structure,
      departmentScope,
      status: "Draft",
      createdAt: new Date().toISOString().split("T")[0],
      payslips: newSlips,
    });
  };

  return (
    <StoreContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentCompany,
        setCurrentCompany,
        isAuthOpen,
        setIsAuthOpen,
        isAuthenticated,
        setIsAuthenticated,
        employees,
        contracts,
        attendance,
        timeOff,
        schedules,
        allocations,
        timeOffTypes,
        salaryStructures,
        salaryRules,

        selectedEmployee,
        setSelectedEmployee,
        isAddEmployeeOpen,
        setIsAddEmployeeOpen,
        viewMode,
        setViewMode,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        activeNavTab,
        setActiveNavTab,
        addEmployee,
        updateEmployeeBankDetails,

        addSchedule,
        approveTimeOff,
        refuseTimeOff,
        addAllocation,
        addAttendanceRecord,

        payrunBatch,
        setPayrunBatch,
        selectedPayslip,
        setSelectedPayslip,
        isPayrunWizardOpen,
        setIsPayrunWizardOpen,
        recomputeBatch,
        validateBatch,
        markBatchPaid,
        createPayrunBatch,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
