"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth.store";
import { listEmployees, createEmployee } from "@/lib/api/employees.api";
import { createPayrun, computePayrun, validatePayrun, markPayrunPaid } from "@/lib/api/payroll.api";
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
  activeTimeOffTab: string;
  setActiveTimeOffTab: (tab: string) => void;
  activePayrollTab: string;
  setActivePayrollTab: (tab: string) => void;
  addEmployee: (newEmp: Omit<Employee, "id" | "smartMetrics" | "joinedDate">) => Promise<void>;
  updateEmployeeBankDetails: (empId: string, bank: { accountNumber: string; bankName: string; ifscCode: string }) => void;

  // Working Schedules
  addSchedule: (schedule: WorkingSchedule) => void;

  // Attendance & Time Off Actions
  approveTimeOff: (id: string) => void;
  refuseTimeOff: (id: string) => void;
  addAllocation: (allocation: LeaveAllocation) => void;
  addAttendanceRecord: (record: AttendanceRecord) => void;
  updateAttendance: (id: string, updates: Partial<AttendanceRecord>) => void;

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

  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [contracts, setContracts] = useState<Contract[]>(INITIAL_CONTRACTS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [timeOff, setTimeOff] = useState<TimeOffRecord[]>(INITIAL_TIMEOFF);

  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;
    
    async function loadData() {
      try {
        const apiEmployees = await listEmployees();
        
        // Map backend Employee format to the frontend UI Employee format
        const mappedEmployees: Employee[] = apiEmployees.map((apiEmp: any, idx: number) => {
          let status: Employee["status"] = "Active";
          if (apiEmp.status === "inactive") status = "On Leave";
          
          return {
            id: apiEmp.id,
            name: `${apiEmp.first_name} ${apiEmp.last_name}`,
            role: apiEmp.job_position || "Employee",
            department: apiEmp.department_name || "General",
            location: "Gandhinagar",
            status,
            email: apiEmp.email,
            phone: apiEmp.phone || "+91 00000 00000",
            avatar: `https://ui-avatars.com/api/?name=${apiEmp.first_name}+${apiEmp.last_name}&background=random`,
            manager: apiEmp.manager_id ? "Manager" : "None",
            joinedDate: new Date(apiEmp.hire_date).toISOString().split('T')[0],
            smartMetrics: {
              attendance: 100,
              performance: 100,
              leaveBalance: 12,
              payrollStatus: "Processed",
              contractsCount: 1,
              activeContractId: `CTR-${apiEmp.id}`,
              attendancePercentage: 100,
              payslipsCount: 12,
            },
            monthlyCTC: 75000,
            workingSchedule: "Standard 40h/week",
            bankDetails: {
              accountNumber: apiEmp.bank_account_number || "",
              bankName: "",
              ifscCode: "",
              isVerified: false,
            },
            panNumber: "",
            uanNumber: "",
          };
        });
        
        if (mappedEmployees.length > 0) {
          setEmployees(mappedEmployees);

          // Align mock data to use the real IDs from the backend
          setAttendance(INITIAL_ATTENDANCE.map((rec, i) => ({
            ...rec,
            employeeId: mappedEmployees[i % mappedEmployees.length].id
          })));

          setTimeOff(INITIAL_TIMEOFF.map((rec, i) => ({
            ...rec,
            employeeId: mappedEmployees[i % mappedEmployees.length].id
          })));

          setContracts(INITIAL_CONTRACTS.map((rec, i) => ({
            ...rec,
            employeeId: mappedEmployees[i % mappedEmployees.length].id,
            employeeName: mappedEmployees[i % mappedEmployees.length].name
          })));

          setAllocations(INITIAL_ALLOCATIONS.map((rec, i) => ({
            ...rec,
            employeeId: mappedEmployees[i % mappedEmployees.length].id,
            employeeName: mappedEmployees[i % mappedEmployees.length].name
          })));
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      }
    }
    
    loadData();
  }, [isAuthenticated]);
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
  const [activeTimeOffTab, setActiveTimeOffTab] = useState<string>("Time offs");
  const [activePayrollTab, setActivePayrollTab] = useState<string>("Dashboard");

  // Payroll state
  const [payrunBatch, setPayrunBatch] = useState<PayrunBatch>(INITIAL_PAYRUN);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipRecord | null>(null);
  const [isPayrunWizardOpen, setIsPayrunWizardOpen] = useState(false);

  const addEmployee = async (data: Omit<Employee, "id" | "smartMetrics" | "joinedDate">) => {
    try {
      // 1. Call Backend API
      const [firstName, ...lastNameParts] = data.name.split(" ");
      const lastName = lastNameParts.join(" ") || "Employee";
      
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email: data.email,
        phone: data.phone,
        department_name: data.department,
        job_position: data.role,
        employee_type: "full_time" as const,
        status: data.status.toLowerCase() as "active" | "inactive",
        hire_date: new Date().toISOString().split("T")[0],
        bank_account_number: data.bankDetails?.accountNumber || null,
      };
      
      const createdDbEmployee = await createEmployee(payload);
      
      // 2. Refetch full list to keep UI in sync with backend
      const apiEmployees = await listEmployees();
      const mappedEmployees: Employee[] = apiEmployees.map((apiEmp: any) => {
        let status: Employee["status"] = "Active";
        if (apiEmp.status === "inactive") status = "On Leave";
        
        return {
          id: apiEmp.id,
          name: `${apiEmp.first_name} ${apiEmp.last_name}`,
          role: apiEmp.job_position || "Employee",
          department: apiEmp.department_name || "General",
          location: "Gandhinagar",
          status,
          email: apiEmp.email,
          phone: apiEmp.phone || "+91 00000 00000",
          avatar: `https://ui-avatars.com/api/?name=${apiEmp.first_name}+${apiEmp.last_name}&background=random`,
          manager: apiEmp.manager_id ? "Manager" : "None",
          joinedDate: new Date(apiEmp.hire_date).toISOString().split('T')[0],
          smartMetrics: {
            attendance: 100,
            performance: 100,
            leaveBalance: 12,
            payrollStatus: "Processed",
            contractsCount: 1,
            activeContractId: `CTR-${apiEmp.id}`,
            attendancePercentage: 100,
            payslipsCount: 12,
          },
          monthlyCTC: data.monthlyCTC,
          workingSchedule: data.workingSchedule,
          bankDetails: data.bankDetails,
          panNumber: data.panNumber,
          uanNumber: data.uanNumber,
        };
      });
      
      setEmployees(mappedEmployees);

      // Create local mock contract (Backend for contracts pending)
      const newContract: Contract = {
        id: `CTR-2026-${createdDbEmployee.id.substring(0, 4)}`,
        employeeId: createdDbEmployee.id,
        employeeName: data.name,
        title: `${data.role} Contract`,
        department: data.department,
        wage: data.monthlyCTC,
        structure: "Standard Indian Corporate Payroll",
        startDate: new Date().toISOString().split("T")[0],
        status: "Active",
        workingSchedule: data.workingSchedule,
      };
      setContracts((prev) => [newContract, ...prev]);

    } catch (err) {
      console.error("Failed to add employee to backend:", err);
      // Fallback for presentation purposes if DB is unreachable
      const newEmp: Employee = {
        ...data,
        id: `EMP-${Math.floor(Math.random() * 1000)}`,
        joinedDate: new Date().toISOString().split("T")[0],
        smartMetrics: { contractsCount: 1, activeContractId: "NEW", attendancePercentage: 100, leaveBalance: 18, payslipsCount: 0 },
      };
      setEmployees((prev) => [newEmp, ...prev]);
    }
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

  const recomputeBatch = async () => {
    try {
      if (payrunBatch.id.startsWith("PAY-") && !payrunBatch.id.includes("MOCK")) {
        // If it's a real API ID (we'll save the API ID in departmentScope hack for demo)
        await computePayrun(payrunBatch.departmentScope);
      }
    } catch (e) {
      console.error("Failed to compute payrun on backend", e);
    }
    
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

  const validateBatch = async () => {
    try {
      if (payrunBatch.id.startsWith("PAY-") && !payrunBatch.id.includes("MOCK")) {
        await validatePayrun(payrunBatch.departmentScope);
      }
    } catch (e) {
      console.error("Failed to validate payrun on backend", e);
    }

    setPayrunBatch((prev) => ({
      ...prev,
      status: "Validated",
      payslips: prev.payslips.map((s) => ({ ...s, status: "Validated" })),
    }));
  };

  const markBatchPaid = async () => {
    try {
      if (payrunBatch.id.startsWith("PAY-") && !payrunBatch.id.includes("MOCK")) {
        await markPayrunPaid(payrunBatch.departmentScope);
      }
    } catch (e) {
      console.error("Failed to mark payrun paid on backend", e);
    }

    setPayrunBatch((prev) => ({
      ...prev,
      status: "Paid",
      payslips: prev.payslips.map((s) => ({ ...s, status: "Paid" })),
    }));
  };

  const createPayrunBatch = async (
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

    let apiPayrunId = departmentScope; // default to original
    try {
      // Hardcode salary structure ID to standard for the demo integration
      const apiPayrun = await createPayrun({
        name: `${period} Corporate Payrun`,
        salary_structure_id: "00000000-0000-0000-0000-000000000001", // The seeded Regular structure ID
        period_start: "2026-09-01",
        period_end: "2026-09-30",
        employee_ids: selectedEmpIds
      });
      apiPayrunId = apiPayrun.id;
    } catch (e) {
      console.error("Failed to create payrun on backend", e);
    }

    setPayrunBatch({
      id: newRunId,
      name: `${period} Corporate Payrun`,
      period,
      structure,
      departmentScope: apiPayrunId, // Hack to store the real API ID
      status: "Draft",
      createdAt: new Date().toISOString().split("T")[0],
      payslips: newSlips,
    });
  };

  const updateAttendance = (id: string, updates: Partial<AttendanceRecord>) => {
    setAttendance((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, ...updates } : rec))
    );
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
        activeTimeOffTab,
        setActiveTimeOffTab,
        activePayrollTab,
        setActivePayrollTab,
        addEmployee,
        updateEmployeeBankDetails,

        addSchedule,
        approveTimeOff,
        refuseTimeOff,
        addAllocation,
        addAttendanceRecord,
        updateAttendance,

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
