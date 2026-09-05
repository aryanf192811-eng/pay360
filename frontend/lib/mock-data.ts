export interface BankDetails {
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  isVerified: boolean;
}

export interface SmartMetrics {
  contractsCount: number;
  activeContractId: string;
  attendancePercentage: number;
  leaveBalance: number;
  payslipsCount: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  department: 'Engineering' | 'Product' | 'Human Resources' | 'Sales';
  manager: string;
  status: 'Active' | 'On Leave';
  monthlyCTC: number;
  workingSchedule: string;
  bankDetails: BankDetails;
  panNumber: string;
  uanNumber: string;
  joinedDate: string;
  smartMetrics: SmartMetrics;
}

export interface Contract {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  department: string;
  wage: number; // Monthly CTC
  structure: string;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Draft' | 'Expired';
  workingSchedule: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workedHours: number;
  status: 'Present' | 'Late' | 'Absent' | 'On Leave';
}

export interface TimeOffRecord {
  id: string;
  employeeId: string;
  leaveType: 'Paid Time Off' | 'Sick Leave' | 'Casual Leave' | 'Unpaid (LOP)';
  startDate: string;
  endDate: string;
  days: number;
  status: 'Approved' | 'Pending' | 'Refused';
  reason: string;
}

export interface SalaryBreakdown {
  basic: number;
  hra: number;
  specialAllowance: number;
  gross: number;
  pf: number;
  tds: number;
  lop: number;
  totalDeductions: number;
  netPay: number;
}

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: "EMP-101",
    name: "Aarav Sharma",
    email: "aarav.sharma@peoplepay360.com",
    phone: "+91 98201 44521",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    role: "VP of Engineering",
    department: "Engineering",
    manager: "Sanjay Singhania (CTO)",
    status: "Active",
    monthlyCTC: 160000,
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
    bankDetails: {
      accountNumber: "50100429811234",
      bankName: "HDFC Bank",
      ifscCode: "HDFC0001234",
      isVerified: true,
    },
    panNumber: "ABCPS1234F",
    uanNumber: "101234567890",
    joinedDate: "2022-03-15",
    smartMetrics: {
      contractsCount: 1,
      activeContractId: "CTR-2022-101",
      attendancePercentage: 98,
      leaveBalance: 12,
      payslipsCount: 24,
    },
  },
  {
    id: "EMP-102",
    name: "Priya Patel",
    email: "priya.patel@peoplepay360.com",
    phone: "+91 97123 88910",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    role: "Lead Product Manager",
    department: "Product",
    manager: "Ananya Mehta (VP Product)",
    status: "Active",
    monthlyCTC: 140000,
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
    bankDetails: {
      accountNumber: "002405012398",
      bankName: "ICICI Bank",
      ifscCode: "ICIC0002468",
      isVerified: true,
    },
    panNumber: "BKRPP4567H",
    uanNumber: "101987654321",
    joinedDate: "2022-07-01",
    smartMetrics: {
      contractsCount: 1,
      activeContractId: "CTR-2022-102",
      attendancePercentage: 96,
      leaveBalance: 14,
      payslipsCount: 20,
    },
  },
  {
    id: "EMP-103",
    name: "Rahul Mishra",
    email: "rahul.mishra@peoplepay360.com",
    phone: "+91 99876 54321",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    role: "Senior Backend Engineer",
    department: "Engineering",
    manager: "Aarav Sharma (VP Eng)",
    status: "Active",
    monthlyCTC: 95000,
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
    // Deliberate anomaly for payroll validation warning!
    bankDetails: {
      accountNumber: "",
      bankName: "Pending Verification",
      ifscCode: "",
      isVerified: false,
    },
    panNumber: "DJRPM9876K",
    uanNumber: "101456789123",
    joinedDate: "2023-01-10",
    smartMetrics: {
      contractsCount: 1,
      activeContractId: "CTR-2023-103",
      attendancePercentage: 94,
      leaveBalance: 9,
      payslipsCount: 14,
    },
  },
  {
    id: "EMP-104",
    name: "Ananya Iyer",
    email: "ananya.iyer@peoplepay360.com",
    phone: "+91 94451 22334",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    role: "HR Operations Manager",
    department: "Human Resources",
    manager: "Kavita Rao (Head of People)",
    status: "Active",
    monthlyCTC: 85000,
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
    bankDetails: {
      accountNumber: "91801004561237",
      bankName: "Axis Bank",
      ifscCode: "UTIB0001357",
      isVerified: true,
    },
    panNumber: "ALMPI3456L",
    uanNumber: "101654321987",
    joinedDate: "2023-04-18",
    smartMetrics: {
      contractsCount: 1,
      activeContractId: "CTR-2023-104",
      attendancePercentage: 99,
      leaveBalance: 16,
      payslipsCount: 12,
    },
  },
  {
    id: "EMP-105",
    name: "Vikram Malhotra",
    email: "vikram.malhotra@peoplepay360.com",
    phone: "+91 98110 99887",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    role: "Enterprise Sales Director",
    department: "Sales",
    manager: "Rajeev Goel (Chief Commercial Officer)",
    status: "Active",
    monthlyCTC: 150000,
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
    bankDetails: {
      accountNumber: "20485910293",
      bankName: "State Bank of India",
      ifscCode: "SBIN0004567",
      isVerified: true,
    },
    panNumber: "BXVM9012M",
    uanNumber: "101789456123",
    joinedDate: "2022-11-01",
    smartMetrics: {
      contractsCount: 1,
      activeContractId: "CTR-2022-105",
      attendancePercentage: 92,
      leaveBalance: 11,
      payslipsCount: 18,
    },
  },
  {
    id: "EMP-106",
    name: "Sneha Kulkarni",
    email: "sneha.kulkarni@peoplepay360.com",
    phone: "+91 98234 55667",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    role: "Senior Frontend Engineer",
    department: "Engineering",
    manager: "Aarav Sharma (VP Eng)",
    status: "Active",
    monthlyCTC: 90000,
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
    bankDetails: {
      accountNumber: "6548123901",
      bankName: "Kotak Mahindra Bank",
      ifscCode: "KKBK0000987",
      isVerified: true,
    },
    panNumber: "CFPSK7890N",
    uanNumber: "101321654987",
    joinedDate: "2023-06-05",
    smartMetrics: {
      contractsCount: 1,
      activeContractId: "CTR-2023-106",
      attendancePercentage: 97,
      leaveBalance: 13,
      payslipsCount: 10,
    },
  },
  {
    id: "EMP-107",
    name: "Rohan Verma",
    email: "rohan.verma@peoplepay360.com",
    phone: "+91 98990 11223",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    role: "Sales Account Executive",
    department: "Sales",
    manager: "Vikram Malhotra (Sales Dir)",
    status: "On Leave",
    monthlyCTC: 55000,
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
    bankDetails: {
      accountNumber: "1234000100456789",
      bankName: "Punjab National Bank",
      ifscCode: "PUNB0006789",
      isVerified: true,
    },
    panNumber: "DRPRV5678P",
    uanNumber: "101654987321",
    joinedDate: "2023-09-12",
    smartMetrics: {
      contractsCount: 1,
      activeContractId: "CTR-2023-107",
      attendancePercentage: 88,
      leaveBalance: 5,
      payslipsCount: 7,
    },
  },
  {
    id: "EMP-108",
    name: "Kavita Reddy",
    email: "kavita.reddy@peoplepay360.com",
    phone: "+91 97011 33445",
    avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80",
    role: "Talent Acquisition Specialist",
    department: "Human Resources",
    manager: "Ananya Iyer (HR Ops Mgr)",
    status: "Active",
    monthlyCTC: 48000,
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
    bankDetails: {
      accountNumber: "01420100056789",
      bankName: "Bank of Baroda",
      ifscCode: "BARB0007890",
      isVerified: true,
    },
    panNumber: "EYPKR1234Q",
    uanNumber: "101951753852",
    joinedDate: "2023-11-20",
    smartMetrics: {
      contractsCount: 1,
      activeContractId: "CTR-2023-108",
      attendancePercentage: 95,
      leaveBalance: 15,
      payslipsCount: 5,
    },
  },
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: "CTR-2022-101",
    employeeId: "EMP-101",
    employeeName: "Aarav Sharma",
    title: "VP of Engineering Contract",
    department: "Engineering",
    wage: 160000,
    structure: "Standard Indian Corporate Payroll",
    startDate: "2022-03-15",
    status: "Active",
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
  },
  {
    id: "CTR-2022-102",
    employeeId: "EMP-102",
    employeeName: "Priya Patel",
    title: "Lead Product Manager Contract",
    department: "Product",
    wage: 140000,
    structure: "Standard Indian Corporate Payroll",
    startDate: "2022-07-01",
    status: "Active",
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
  },
  {
    id: "CTR-2023-103",
    employeeId: "EMP-103",
    employeeName: "Rahul Mishra",
    title: "Senior Backend Engineer Contract",
    department: "Engineering",
    wage: 95000,
    structure: "Standard Indian Corporate Payroll",
    startDate: "2023-01-10",
    status: "Active",
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
  },
  {
    id: "CTR-2023-104",
    employeeId: "EMP-104",
    employeeName: "Ananya Iyer",
    title: "HR Operations Manager Contract",
    department: "Human Resources",
    wage: 85000,
    structure: "Standard Indian Corporate Payroll",
    startDate: "2023-04-18",
    status: "Active",
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
  },
  {
    id: "CTR-2022-105",
    employeeId: "EMP-105",
    employeeName: "Vikram Malhotra",
    title: "Enterprise Sales Director Contract",
    department: "Sales",
    wage: 150000,
    structure: "Standard Indian Corporate Payroll",
    startDate: "2022-11-01",
    status: "Active",
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
  },
  {
    id: "CTR-2023-106",
    employeeId: "EMP-106",
    employeeName: "Sneha Kulkarni",
    title: "Senior Frontend Engineer Contract",
    department: "Engineering",
    wage: 90000,
    structure: "Standard Indian Corporate Payroll",
    startDate: "2023-06-05",
    status: "Active",
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
  },
  {
    id: "CTR-2023-107",
    employeeId: "EMP-107",
    employeeName: "Rohan Verma",
    title: "Sales Account Executive Contract",
    department: "Sales",
    wage: 55000,
    structure: "Standard Indian Corporate Payroll",
    startDate: "2023-09-12",
    status: "Active",
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
  },
  {
    id: "CTR-2023-108",
    employeeId: "EMP-108",
    employeeName: "Kavita Reddy",
    title: "Talent Acquisition Contract",
    department: "Human Resources",
    wage: 48000,
    structure: "Standard Indian Corporate Payroll",
    startDate: "2023-11-20",
    status: "Active",
    workingSchedule: "Standard 40h/week (Mon-Fri 09:00 - 18:00)",
  },
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: "ATT-1", employeeId: "EMP-101", date: "2026-09-04", checkIn: "08:58", checkOut: "18:05", workedHours: 9.1, status: "Present" },
  { id: "ATT-2", employeeId: "EMP-102", date: "2026-09-04", checkIn: "09:02", checkOut: "18:00", workedHours: 8.9, status: "Present" },
  { id: "ATT-3", employeeId: "EMP-103", date: "2026-09-04", checkIn: "09:35", checkOut: "18:40", workedHours: 9.0, status: "Late" },
  { id: "ATT-4", employeeId: "EMP-104", date: "2026-09-04", checkIn: "08:55", checkOut: "18:02", workedHours: 9.1, status: "Present" },
  { id: "ATT-5", employeeId: "EMP-105", date: "2026-09-04", checkIn: "09:10", checkOut: "18:15", workedHours: 9.0, status: "Present" },
  { id: "ATT-6", employeeId: "EMP-106", date: "2026-09-04", checkIn: "08:59", checkOut: "18:00", workedHours: 9.0, status: "Present" },
  { id: "ATT-7", employeeId: "EMP-107", date: "2026-09-04", checkIn: "-", checkOut: "-", workedHours: 0, status: "On Leave" },
  { id: "ATT-8", employeeId: "EMP-108", date: "2026-09-04", checkIn: "09:00", checkOut: "18:05", workedHours: 9.0, status: "Present" },
];

export const INITIAL_TIMEOFF: TimeOffRecord[] = [
  { id: "TO-1", employeeId: "EMP-107", leaveType: "Paid Time Off", startDate: "2026-09-03", endDate: "2026-09-07", days: 3, status: "Approved", reason: "Family Vacation" },
  { id: "TO-2", employeeId: "EMP-103", leaveType: "Sick Leave", startDate: "2026-08-20", endDate: "2026-08-21", days: 1, status: "Approved", reason: "Viral fever" },
  { id: "TO-3", employeeId: "EMP-106", leaveType: "Casual Leave", startDate: "2026-09-15", endDate: "2026-09-16", days: 2, status: "Pending", reason: "Personal work" },
];

/**
 * Standard Salary Rules Calculation Engine:
 * - Basic: 50% of CTC
 * - HRA: 40% of Basic (20% of CTC)
 * - Special Allowance: Remainder (30% of CTC)
 * - Gross = Basic + HRA + Special Allowance = CTC
 * - PF Deduction: 12% of Basic
 * - TDS Deduction: 10% on Gross if Gross > ₹50,000, else 0
 * - LOP (Loss of Pay): (Gross / 30) * days
 */
export function calculateSalaryBreakdown(monthlyCTC: number, lopDays: number = 0): SalaryBreakdown {
  const basic = Math.round(monthlyCTC * 0.50);
  const hra = Math.round(basic * 0.40);
  const specialAllowance = monthlyCTC - basic - hra;
  const gross = monthlyCTC;

  // Deductions
  const pf = Math.round(basic * 0.12);
  const tds = gross > 50000 ? Math.round(gross * 0.10) : 0;
  const lop = lopDays > 0 ? Math.round((gross / 30) * lopDays) : 0;

  const totalDeductions = pf + tds + lop;
  const netPay = gross - totalDeductions;

  return {
    basic,
    hra,
    specialAllowance,
    gross,
    pf,
    tds,
    lop,
    totalDeductions,
    netPay,
  };
}

export interface PayslipRecord {
  id: string;
  payrunId: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  department: string;
  avatar: string;
  email: string;
  period: string;
  workedDays: number;
  lopDays: number;
  basic: number;
  hra: number;
  specialAllowance: number;
  gross: number;
  pf: number;
  tds: number;
  lop: number;
  totalDeductions: number;
  netPay: number;
  status: "Draft" | "Computed" | "Validated" | "Paid";
  bankAccount: string;
  bankName: string;
  ifscCode: string;
  hasBankWarning: boolean;
  panNumber: string;
  uanNumber: string;
}

export interface PayrunBatch {
  id: string;
  name: string;
  period: string;
  structure: string;
  departmentScope: string;
  status: "Draft" | "Computed" | "Validated" | "Paid";
  createdAt: string;
  payslips: PayslipRecord[];
}

export function createPayslipRecord(
  emp: Employee,
  payrunId: string,
  period: string,
  lopDays: number = 0,
  batchStatus: "Draft" | "Computed" | "Validated" | "Paid" = "Computed"
): PayslipRecord {
  const breakdown = calculateSalaryBreakdown(emp.monthlyCTC, lopDays);
  const hasBankWarning = !emp.bankDetails.isVerified || !emp.bankDetails.accountNumber;

  return {
    id: `SLIP-${period.replace(/\s+/g, "-").toUpperCase()}-${emp.id}`,
    payrunId,
    employeeId: emp.id,
    employeeName: emp.name,
    employeeRole: emp.role,
    department: emp.department,
    avatar: emp.avatar,
    email: emp.email,
    period,
    workedDays: 30 - lopDays,
    lopDays,
    basic: breakdown.basic,
    hra: breakdown.hra,
    specialAllowance: breakdown.specialAllowance,
    gross: breakdown.gross,
    pf: breakdown.pf,
    tds: breakdown.tds,
    lop: breakdown.lop,
    totalDeductions: breakdown.totalDeductions,
    netPay: breakdown.netPay,
    status: batchStatus,
    bankAccount: emp.bankDetails.accountNumber || "MISSING",
    bankName: emp.bankDetails.bankName || "Unlinked",
    ifscCode: emp.bankDetails.ifscCode || "MISSING",
    hasBankWarning,
    panNumber: emp.panNumber,
    uanNumber: emp.uanNumber,
  };
}

export const INITIAL_PAYRUN: PayrunBatch = {
  id: "PAY-2026-SEP",
  name: "September 2026 Regular Corporate Payroll",
  period: "September 2026",
  structure: "Standard Indian Corporate Payroll",
  departmentScope: "All Departments",
  status: "Computed",
  createdAt: "2026-09-01",
  payslips: INITIAL_EMPLOYEES.map((emp) =>
    // Rahul Mishra has missing bank account; Rohan Verma has 1 LOP day for testing
    createPayslipRecord(emp, "PAY-2026-SEP", "September 2026", emp.id === "EMP-107" ? 1 : 0, "Computed")
  ),
};

// ==========================================
// A3: Working Schedule Models & Initial Data
// ==========================================
export interface WorkingSchedule {
  id: string;
  name: string;
  code: string;
  type: "Full-Time" | "Part-Time" | "Flex";
  weeklyHours: number;
  days: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  assignedEmployeesCount: number;
}

export const INITIAL_SCHEDULES: WorkingSchedule[] = [
  {
    id: "SCH-01",
    name: "Standard 40h General Schedule",
    code: "STD_40H",
    type: "Full-Time",
    weeklyHours: 40.0,
    days: "Monday - Friday (5 Days)",
    startTime: "09:00",
    endTime: "18:00",
    breakMinutes: 60,
    assignedEmployeesCount: 6,
  },
  {
    id: "SCH-02",
    name: "Tech Team Flex Schedule",
    code: "TECH_FLEX_40H",
    type: "Flex",
    weeklyHours: 40.0,
    days: "Monday - Friday (5 Days)",
    startTime: "09:30",
    endTime: "18:30",
    breakMinutes: 60,
    assignedEmployeesCount: 2,
  },
  {
    id: "SCH-03",
    name: "Part-Time Consulting Schedule",
    code: "CONSULT_20H",
    type: "Part-Time",
    weeklyHours: 20.0,
    days: "Monday - Thursday (4 Days)",
    startTime: "10:00",
    endTime: "15:30",
    breakMinutes: 30,
    assignedEmployeesCount: 0,
  },
];

// Helper to auto-calculate weekly hours from schedule inputs
export function calculateWeeklyHours(
  startTime: string,
  endTime: string,
  breakMinutes: number,
  daysPerWeek: number = 5
): number {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startMinutes = (startH || 0) * 60 + (startM || 0);
  const endMinutes = (endH || 0) * 60 + (endM || 0);
  const dailyWorkMinutes = Math.max(0, endMinutes - startMinutes - (breakMinutes || 0));
  const dailyHours = dailyWorkMinutes / 60;
  return Number((dailyHours * daysPerWeek).toFixed(1));
}

// ==========================================
// A4: Time Off Types & Allocation Models
// ==========================================
export interface TimeOffTypeConfig {
  id: string;
  name: string;
  code: string;
  unit: "Days" | "Hours";
  allocationRequired: boolean;
  requiresApproval: boolean;
  payrollImpact: "Paid" | "Deduction (LOP)";
  color: string;
}

export const INITIAL_TIMEOFF_TYPES: TimeOffTypeConfig[] = [
  {
    id: "TOT-01",
    name: "Paid Time Off (Annual)",
    code: "PTO",
    unit: "Days",
    allocationRequired: true,
    requiresApproval: true,
    payrollImpact: "Paid",
    color: "text-purple-700 bg-purple-50 border-purple-200",
  },
  {
    id: "TOT-02",
    name: "Sick Leave",
    code: "SL",
    unit: "Days",
    allocationRequired: true,
    requiresApproval: true,
    payrollImpact: "Paid",
    color: "text-teal-700 bg-teal-50 border-teal-200",
  },
  {
    id: "TOT-03",
    name: "Casual Leave",
    code: "CL",
    unit: "Days",
    allocationRequired: true,
    requiresApproval: true,
    payrollImpact: "Paid",
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
  {
    id: "TOT-04",
    name: "Loss of Pay (Unpaid LOP)",
    code: "LOP",
    unit: "Days",
    allocationRequired: false,
    requiresApproval: false,
    payrollImpact: "Deduction (LOP)",
    color: "text-rose-700 bg-rose-50 border-rose-200",
  },
];

export interface LeaveAllocation {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  allocatedDays: number;
  takenDays: number;
  remainingDays: number;
  validFrom: string;
  validTo: string;
  status: "Approved" | "Draft";
}

export const INITIAL_ALLOCATIONS: LeaveAllocation[] = [
  { id: "ALC-101", employeeId: "EMP-101", employeeName: "Aarav Sharma", leaveType: "Paid Time Off (Annual)", allocatedDays: 18, takenDays: 6, remainingDays: 12, validFrom: "2026-01-01", validTo: "2026-12-31", status: "Approved" },
  { id: "ALC-102", employeeId: "EMP-102", employeeName: "Priya Patel", leaveType: "Paid Time Off (Annual)", allocatedDays: 18, takenDays: 4, remainingDays: 14, validFrom: "2026-01-01", validTo: "2026-12-31", status: "Approved" },
  { id: "ALC-103", employeeId: "EMP-103", employeeName: "Rahul Mishra", leaveType: "Paid Time Off (Annual)", allocatedDays: 18, takenDays: 9, remainingDays: 9, validFrom: "2026-01-01", validTo: "2026-12-31", status: "Approved" },
  { id: "ALC-104", employeeId: "EMP-104", employeeName: "Ananya Iyer", leaveType: "Paid Time Off (Annual)", allocatedDays: 18, takenDays: 2, remainingDays: 16, validFrom: "2026-01-01", validTo: "2026-12-31", status: "Approved" },
  { id: "ALC-105", employeeId: "EMP-105", employeeName: "Vikram Malhotra", leaveType: "Paid Time Off (Annual)", allocatedDays: 18, takenDays: 7, remainingDays: 11, validFrom: "2026-01-01", validTo: "2026-12-31", status: "Approved" },
  { id: "ALC-106", employeeId: "EMP-106", employeeName: "Sneha Kulkarni", leaveType: "Paid Time Off (Annual)", allocatedDays: 18, takenDays: 5, remainingDays: 13, validFrom: "2026-01-01", validTo: "2026-12-31", status: "Approved" },
  { id: "ALC-107", employeeId: "EMP-107", employeeName: "Rohan Verma", leaveType: "Paid Time Off (Annual)", allocatedDays: 18, takenDays: 13, remainingDays: 5, validFrom: "2026-01-01", validTo: "2026-12-31", status: "Approved" },
  { id: "ALC-108", employeeId: "EMP-108", employeeName: "Kavita Reddy", leaveType: "Paid Time Off (Annual)", allocatedDays: 18, takenDays: 3, remainingDays: 15, validFrom: "2026-01-01", validTo: "2026-12-31", status: "Approved" },
];

// ==========================================
// A5: Salary Structures & A6: Salary Rules
// ==========================================
export interface SalaryStructure {
  id: string;
  name: string;
  code: string;
  rulesCount: number;
  assignedEmployeesCount: number;
  status: "Active" | "Draft";
  description: string;
  ruleCodes: string[];
}

export const INITIAL_STRUCTURES: SalaryStructure[] = [
  {
    id: "STR-01",
    name: "Standard Indian Corporate Payroll",
    code: "IN_CORP_01",
    rulesCount: 8,
    assignedEmployeesCount: 8,
    status: "Active",
    description: "Standard statutory structure with Basic, HRA, Special Allowance, PF, TDS and LOP.",
    ruleCodes: ["BASIC", "HRA", "SPECIAL", "GROSS", "PF", "TDS", "LOP", "NET"],
  },
  {
    id: "STR-02",
    name: "Executive Compensation Structure",
    code: "EXEC_01",
    rulesCount: 8,
    assignedEmployeesCount: 2,
    status: "Active",
    description: "Tailored for VP and Director level compensation with performance variable provisions.",
    ruleCodes: ["BASIC", "HRA", "SPECIAL", "GROSS", "PF", "TDS", "LOP", "NET"],
  },
  {
    id: "STR-03",
    name: "Contractor & Consultant Hourly Structure",
    code: "CONSULT_01",
    rulesCount: 3,
    assignedEmployeesCount: 0,
    status: "Draft",
    description: "Simple hourly rate x approved attendance billing structure without PF/ESI.",
    ruleCodes: ["GROSS", "TDS", "NET"],
  },
];

export interface SalaryRule {
  id: string;
  name: string;
  code: string;
  category: "Basic" | "Allowance" | "Gross" | "Deduction" | "Net";
  sequence: number;
  computationMethod: "Percentage" | "Fixed" | "Formula";
  equation: string;
  condition: string;
  status: "Active" | "Draft";
}

export const INITIAL_SALARY_RULES: SalaryRule[] = [
  {
    id: "SR-01",
    name: "Basic Salary",
    code: "BASIC",
    category: "Basic",
    sequence: 10,
    computationMethod: "Percentage",
    equation: "contract.wage * 0.50",
    condition: "Always True",
    status: "Active",
  },
  {
    id: "SR-02",
    name: "House Rent Allowance (HRA)",
    code: "HRA",
    category: "Allowance",
    sequence: 20,
    computationMethod: "Percentage",
    equation: "BASIC * 0.40 (20% of Wage)",
    condition: "contract.wage > 0",
    status: "Active",
  },
  {
    id: "SR-03",
    name: "Special Allowance",
    code: "SPECIAL",
    category: "Allowance",
    sequence: 30,
    computationMethod: "Formula",
    equation: "contract.wage - BASIC - HRA",
    condition: "contract.wage > 0",
    status: "Active",
  },
  {
    id: "SR-04",
    name: "Total Gross Salary",
    code: "GROSS",
    category: "Gross",
    sequence: 40,
    computationMethod: "Formula",
    equation: "BASIC + HRA + SPECIAL",
    condition: "Always True",
    status: "Active",
  },
  {
    id: "SR-05",
    name: "Provident Fund (PF - Employee)",
    code: "PF",
    category: "Deduction",
    sequence: 50,
    computationMethod: "Percentage",
    equation: "BASIC * 0.12",
    condition: "contract.wage > 0",
    status: "Active",
  },
  {
    id: "SR-06",
    name: "Tax Deducted at Source (TDS)",
    code: "TDS",
    category: "Deduction",
    sequence: 60,
    computationMethod: "Percentage",
    equation: "GROSS > 50000 ? GROSS * 0.10 : 0",
    condition: "GROSS > 50000",
    status: "Active",
  },
  {
    id: "SR-07",
    name: "Loss of Pay (LOP Deduction)",
    code: "LOP",
    category: "Deduction",
    sequence: 70,
    computationMethod: "Formula",
    equation: "(GROSS / 30) * unpaid_days",
    condition: "unpaid_days > 0",
    status: "Active",
  },
  {
    id: "SR-08",
    name: "Net Payable Salary",
    code: "NET",
    category: "Net",
    sequence: 100,
    computationMethod: "Formula",
    equation: "GROSS - (PF + TDS + LOP)",
    condition: "Always True",
    status: "Active",
  },
];

// User Roles
export type UserRole = "Admin" | "HR Payroll Manager" | "HR Payroll User" | "HR Manager" | "Employee";


