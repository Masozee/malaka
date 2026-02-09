/**
 * HR Module Type Definitions
 */

export interface Employee {
  id: string
  employee_code: string
  employee_name: string
  email: string
  phone: string
  position: string
  department: string
  hire_date: string
  birth_date?: string
  gender: 'M' | 'F'
  marital_status: 'Single' | 'Married' | 'Divorced' | 'Widowed'
  address: string
  id_number: string
  tax_id: string
  bank_account: string
  bank_name: string
  basic_salary: number
  allowances: number
  total_salary: number
  employment_status: 'ACTIVE' | 'INACTIVE' | 'TERMINATED'
  supervisor_id?: string
  user_id?: string
  profile_image_url?: string
  createdAt: string
  updatedAt: string
}

export interface EmployeeFilters {
  search?: string
  department?: string
  position?: string
  employment_status?: Employee['employment_status']
  gender?: Employee['gender']
  hireStartDate?: string
  hireEndDate?: string
  salaryMin?: number
  salaryMax?: number
}

export interface EmployeeFormData {
  employee_code: string
  employee_name: string
  email: string
  phone: string
  position: string
  department: string
  hire_date: string
  birth_date?: string
  gender: Employee['gender']
  marital_status: Employee['marital_status']
  address: string
  id_number: string
  tax_id: string
  bank_account: string
  bank_name: string
  basic_salary: number
  allowances: number
  employment_status: Employee['employment_status']
  supervisor_id?: string | null
  profile_image_url?: string
}

// Payroll Types
export interface PayrollPeriod {
  id: string
  year: number
  month: number
  startDate: string
  endDate: string
  status: 'draft' | 'processing' | 'completed' | 'locked'
  totalEmployees: number
  totalGrossPay: number
  totalDeductions: number
  totalNetPay: number
  processedAt?: string
  processedBy?: string
  createdAt: string
  updatedAt: string
}

export interface PayrollItemEmployee {
  id: string
  employeeId: string
  name: string
  position: string
  department: string
}

export interface PayrollItem {
  id: string
  payrollPeriodId: string
  employeeId: string
  employee: PayrollItemEmployee
  basicSalary: number
  allowances: PayrollAllowance[]
  deductions: PayrollDeduction[]
  overtime: PayrollOvertime[]
  grossPay: number
  totalDeductions: number
  netPay: number
  status: 'draft' | 'calculated' | 'approved' | 'paid'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PayrollAllowance {
  id: string
  type: 'transport' | 'meal' | 'housing' | 'medical' | 'bonus' | 'other'
  name: string
  amount: number
  isTaxable: boolean
}

export interface PayrollDeduction {
  id: string
  type: 'tax' | 'insurance' | 'pension' | 'loan' | 'advance' | 'other'
  name: string
  amount: number
  isPreTax: boolean
}

export interface PayrollOvertime {
  id: string
  date: string
  hours: number
  rate: number
  amount: number
  description?: string
}

export interface PayrollSummary {
  period: PayrollPeriod
  totalEmployees: number
  processedEmployees: number
  pendingEmployees: number
  totalGrossPay: number
  totalAllowances: number
  totalDeductions: number
  totalNetPay: number
  averageSalary: number
  departmentBreakdown: {
    department: string
    employeeCount: number
    totalPay: number
  }[]
}

export interface PayrollFilters {
  search?: string
  department?: string
  status?: PayrollItem['status']
  periodId?: string
  salaryMin?: number
  salaryMax?: number
  year?: number
  month?: number
}

export interface PayrollSettings {
  id: string
  companyName: string
  payPeriod: 'monthly' | 'biweekly' | 'weekly'
  overtimeRate: number
  taxSettings: {
    incomeTaxRate: number
    socialSecurityRate: number
    healthInsuranceRate: number
  }
  allowanceSettings: {
    transportAllowance: number
    mealAllowance: number
    housingAllowance: number
  }
  workingDays: number
  workingHours: number
  createdAt: string
  updatedAt: string
}

// Leave Management Types
export interface LeaveType {
  id: string
  name: string
  description?: string
  max_days_per_year: number
  requires_approval: boolean
  is_paid: boolean
  color?: string
  createdAt: string
  updatedAt: string
}

export interface LeaveRequest {
  id: string
  employee_id: string
  employee_name: string
  department: string
  leave_type_id: string
  leave_type: string
  start_date: string
  end_date: string
  total_days: number
  reason: string
  emergency_contact?: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  applied_date: string
  approved_by?: string
  approved_date?: string
  rejected_reason?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface LeaveBalance {
  id: string
  employee_id: string
  leave_type_id: string
  year: number
  total_days: number
  used_days: number
  remaining_days: number
  carried_forward: number
  createdAt: string
  updatedAt: string
}

export interface LeaveFormData {
  employee_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  reason: string
  emergency_contact?: string
  notes?: string
}

export interface LeaveFilters {
  search?: string
  status?: LeaveRequest['status']
  leave_type?: string
  employee_id?: string
  department?: string
  start_date?: string
  end_date?: string
}

export interface LeaveStatistics {
  total_requests: number
  pending_requests: number
  approved_requests: number
  rejected_requests: number
  total_days_requested: number
  approval_rate: number
  avg_processing_time: number
}