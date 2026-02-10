/**
 * HR Service
 * API service for HR-related operations
 */

import { apiClient } from '@/lib/api'
import type { 
  Employee, 
  EmployeeFilters, 
  EmployeeFormData,
  PayrollPeriod,
  PayrollItem,
  PayrollSummary,
  PayrollFilters,
  PayrollSettings
} from '@/types/hr'
import type { PaginatedResponse, PaginationParams } from '@/lib/api'

export class HRService {
  private static readonly BASE_URL = '/api/v1/hr'

  static async getEmployees(
    params: PaginationParams & EmployeeFilters = {}
  ): Promise<PaginatedResponse<Employee>> {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
      )
      
      const response = await apiClient.get<{success: boolean, message: string, data: Employee[]}>(`${this.BASE_URL}/employees/`, filteredParams)

      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }

      const records = response.data || []

      // Convert to paginated response format
      return {
        data: records,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: records.length,
          totalPages: Math.ceil(records.length / (params.limit || 10))
        }
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      // Return mock data as fallback during development
      return {
        data: mockEmployeesUpdated,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: mockEmployeesUpdated.length,
          totalPages: Math.ceil(mockEmployeesUpdated.length / (params.limit || 10))
        }
      }
    }
  }

  static async getEmployeeById(id: string): Promise<Employee> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: Employee}>(`${this.BASE_URL}/employees/${id}`)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error fetching employee by ID:', error)
      throw error
    }
  }

  static async createEmployee(data: EmployeeFormData): Promise<Employee> {
    try {
      const response = await apiClient.post<{success: boolean, message: string, data: Employee}>(`${this.BASE_URL}/employees/`, data)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error creating employee:', error)
      throw error
    }
  }

  static async updateEmployee(id: string, data: Partial<EmployeeFormData>): Promise<Employee> {
    try {
      // Clean the data before sending to avoid UUID parsing errors
      const cleanedData = {
        ...data,
        // Ensure supervisor_id is either a valid UUID string or null
        supervisor_id: data.supervisor_id?.trim() || null
      }
      
      const response = await apiClient.put<{success: boolean, message: string, data: Employee}>(`${this.BASE_URL}/employees/${id}`, cleanedData)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error updating employee:', error)
      throw error
    }
  }

  static async deleteEmployee(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<{success: boolean, message: string}>(`${this.BASE_URL}/employees/${id}`)

      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
      throw error
    }
  }

  static async getEmployeeByUserId(userId: string): Promise<Employee | null> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: Employee}>(`${this.BASE_URL}/employees/by-user/${userId}`)

      if (!response.success || !response.data) {
        return null
      }

      return response.data
    } catch {
      return null
    }
  }

  static async getDepartments(): Promise<string[]> {
    return apiClient.get<string[]>(`${this.BASE_URL}/departments`)
  }

  static async getDivisions(): Promise<string[]> {
    return apiClient.get<string[]>(`${this.BASE_URL}/divisions`)
  }

  static async getPositions(): Promise<string[]> {
    return apiClient.get<string[]>(`${this.BASE_URL}/positions`)
  }

  // Payroll methods
  static async getPayrollPeriods(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<PayrollPeriod>> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: PayrollPeriod[]}>(`${this.BASE_URL}/payroll/periods/`, params)

      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }

      const records = response.data || []

      // Convert to paginated response format
      return {
        data: records,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: records.length,
          totalPages: Math.ceil(records.length / (params.limit || 10))
        }
      }
    } catch (error) {
      console.error('Error fetching payroll periods:', error)
      // Return mock data as fallback during development
      return {
        data: mockPayrollPeriods,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: mockPayrollPeriods.length,
          totalPages: Math.ceil(mockPayrollPeriods.length / (params.limit || 10))
        }
      }
    }
  }

  static async getPayrollPeriodById(id: string): Promise<PayrollPeriod> {
    return apiClient.get<PayrollPeriod>(`${this.BASE_URL}/payroll/periods/${id}`)
  }

  static async createPayrollPeriod(data: Omit<PayrollPeriod, 'id' | 'createdAt' | 'updatedAt'>): Promise<PayrollPeriod> {
    return apiClient.post<PayrollPeriod>(`${this.BASE_URL}/payroll/periods`, data)
  }

  static async updatePayrollPeriod(id: string, data: Partial<PayrollPeriod>): Promise<PayrollPeriod> {
    return apiClient.put<PayrollPeriod>(`${this.BASE_URL}/payroll/periods/${id}`, data)
  }

  static async deletePayrollPeriod(id: string): Promise<void> {
    return apiClient.delete<void>(`${this.BASE_URL}/payroll/periods/${id}`)
  }

  static async getPayrollItems(
    params: PaginationParams & PayrollFilters = {}
  ): Promise<PaginatedResponse<PayrollItem>> {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
      )
      
      const response = await apiClient.get<{success: boolean, message: string, data: PayrollItem[]}>(`${this.BASE_URL}/payroll/items/`, filteredParams)

      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }

      const records = response.data || []

      // Convert to paginated response format
      return {
        data: records,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: records.length,
          totalPages: Math.ceil(records.length / (params.limit || 10))
        }
      }
    } catch (error) {
      console.error('Error fetching payroll items:', error)
      // Return mock data as fallback during development
      return {
        data: mockPayrollItems,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: mockPayrollItems.length,
          totalPages: Math.ceil(mockPayrollItems.length / (params.limit || 10))
        }
      }
    }
  }

  static async getPayrollItemById(id: string): Promise<PayrollItem> {
    return apiClient.get<PayrollItem>(`${this.BASE_URL}/payroll/items/${id}`)
  }

  static async updatePayrollItem(id: string, data: Partial<PayrollItem>): Promise<PayrollItem> {
    return apiClient.put<PayrollItem>(`${this.BASE_URL}/payroll/items/${id}`, data)
  }

  static async processPayroll(periodId: string): Promise<PayrollSummary> {
    return apiClient.post<PayrollSummary>(`${this.BASE_URL}/payroll/process/${periodId}`)
  }

  static async getPayrollSummary(periodId: string): Promise<PayrollSummary> {
    return apiClient.get<PayrollSummary>(`${this.BASE_URL}/payroll/summary/${periodId}`)
  }

  static async getPayrollSettings(): Promise<PayrollSettings> {
    return apiClient.get<PayrollSettings>(`${this.BASE_URL}/payroll/settings`)
  }

  static async updatePayrollSettings(data: Partial<PayrollSettings>): Promise<PayrollSettings> {
    return apiClient.put<PayrollSettings>(`${this.BASE_URL}/payroll/settings`, data)
  }

  // Attendance methods
  static async getAttendanceRecords(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<any>> {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
      )
      
      const response = await apiClient.get<{success: boolean, message: string, data: any[]}>(`${this.BASE_URL}/attendance/`, filteredParams)

      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }

      const records = response.data || []

      // Convert to paginated response format
      return {
        data: records,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 100,
          total: records.length,
          totalPages: Math.ceil(records.length / (params.limit || 100))
        }
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error)
      console.error('Full error details:', JSON.stringify(error, null, 2))
      // Throw error to let the UI handle it properly
      throw error
    }
  }

  // Leave Management methods
  static async getLeaveRequests(
    params: PaginationParams & { status?: string, employee_id?: string } = {}
  ): Promise<PaginatedResponse<any>> {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
      )
      
      const response = await apiClient.get<{success: boolean, message: string, data: any[]}>(`${this.BASE_URL}/leave/requests/`, filteredParams)

      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }

      const records = response.data || []

      // Convert to paginated response format
      return {
        data: records,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: records.length,
          totalPages: Math.ceil(records.length / (params.limit || 10))
        }
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error)
      throw error
    }
  }

  static async getLeaveRequestById(id: string): Promise<any> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: any}>(`${this.BASE_URL}/leave/requests/${id}`)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error fetching leave request by ID:', error)
      throw error
    }
  }

  static async createLeaveRequest(data: any): Promise<any> {
    try {
      const response = await apiClient.post<{success: boolean, message: string, data: any}>(`${this.BASE_URL}/leave/requests/`, data)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error creating leave request:', error)
      throw error
    }
  }

  static async updateLeaveRequest(id: string, data: any): Promise<any> {
    try {
      const response = await apiClient.put<{success: boolean, message: string, data: any}>(`${this.BASE_URL}/leave/requests/${id}`, data)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error updating leave request:', error)
      throw error
    }
  }

  static async approveLeaveRequest(id: string, comments?: string): Promise<void> {
    try {
      const response = await apiClient.post<{success: boolean, message: string}>(`${this.BASE_URL}/leave/requests/${id}/approve`, { comments })
      
      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }
    } catch (error) {
      console.error('Error approving leave request:', error)
      throw error
    }
  }

  static async rejectLeaveRequest(id: string, reason: string): Promise<void> {
    try {
      const response = await apiClient.post<{success: boolean, message: string}>(`${this.BASE_URL}/leave/requests/${id}/reject`, { reason })
      
      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }
    } catch (error) {
      console.error('Error rejecting leave request:', error)
      throw error
    }
  }

  static async getLeaveTypes(): Promise<any[]> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: any[]}>(`${this.BASE_URL}/leave/types/`)

      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data || []
    } catch (error) {
      console.error('Error fetching leave types:', error)
      throw error
    }
  }

  static async getLeaveStatistics(): Promise<any> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: any}>(`${this.BASE_URL}/leave/statistics`)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error fetching leave statistics:', error)
      throw error
    }
  }

  // Performance Management methods
  static async getPerformanceReviews(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<any>> {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
      )
      
      const response = await apiClient.get<{success: boolean, message: string, data: {data: any[], total: number, page: number, page_size: number, total_pages: number}}>(`${this.BASE_URL}/performance/reviews/`, filteredParams)

      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }

      // Convert to paginated response format
      return {
        data: response.data?.data || [],
        pagination: {
          page: response.data?.page || 1,
          limit: response.data?.page_size || 50,
          total: response.data?.total || 0,
          totalPages: response.data?.total_pages || 1
        }
      }
    } catch (error) {
      console.error('Error fetching performance reviews:', error)
      throw error
    }
  }

  // Training Management methods
  static async getTrainingPrograms(
    params: PaginationParams = {}
  ): Promise<PaginatedResponse<any>> {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
      )
      
      const response = await apiClient.get<{success: boolean, message: string, data: {data: any[], total: number, page: number, page_size: number, total_pages: number}}>(`${this.BASE_URL}/training/programs/`, filteredParams)

      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }

      // Convert to paginated response format
      return {
        data: response.data?.data || [],
        pagination: {
          page: response.data?.page || 1,
          limit: response.data?.page_size || 50,
          total: response.data?.total || 0,
          totalPages: response.data?.total_pages || 1
        }
      }
    } catch (error) {
      console.error('Error fetching training programs:', error)
      throw error
    }
  }

  static async getTrainingProgramById(id: string): Promise<any> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: any}>(`${this.BASE_URL}/training/programs/${id}`)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error fetching training program by ID:', error)
      throw error
    }
  }

  static async createTrainingProgram(data: any): Promise<any> {
    try {
      const response = await apiClient.post<{success: boolean, message: string, data: any}>(`${this.BASE_URL}/training/programs/`, data)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error creating training program:', error)
      throw error
    }
  }

  static async updateTrainingProgram(id: string, data: any): Promise<any> {
    try {
      const response = await apiClient.put<{success: boolean, message: string, data: any}>(`${this.BASE_URL}/training/programs/${id}`, data)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error updating training program:', error)
      throw error
    }
  }

  static async deleteTrainingProgram(id: string): Promise<void> {
    try {
      const response = await apiClient.delete<{success: boolean, message: string}>(`${this.BASE_URL}/training/programs/${id}`)
      
      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }
    } catch (error) {
      console.error('Error deleting training program:', error)
      throw error
    }
  }

  static async getTrainingEnrollments(
    params: PaginationParams & { program_id?: string, employee_id?: string } = {}
  ): Promise<PaginatedResponse<any>> {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
      )
      
      const response = await apiClient.get<{success: boolean, message: string, data: any[]}>(`${this.BASE_URL}/training/enrollments/`, filteredParams)

      if (!response.success) {
        throw new Error(`API Error: ${response.message}`)
      }

      const records = response.data || []

      // Convert to paginated response format
      return {
        data: records,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 10,
          total: records.length,
          totalPages: Math.ceil(records.length / (params.limit || 10))
        }
      }
    } catch (error) {
      console.error('Error fetching training enrollments:', error)
      throw error
    }
  }

  static async enrollInTraining(programId: string, employeeId: string): Promise<any> {
    try {
      const response = await apiClient.post<{success: boolean, message: string, data: any}>(`${this.BASE_URL}/training/enrollments/`, {
        program_id: programId,
        employee_id: employeeId
      })
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error enrolling in training:', error)
      throw error
    }
  }

  static async updateTrainingProgress(enrollmentId: string, progress: number, score?: number): Promise<any> {
    try {
      const response = await apiClient.put<{success: boolean, message: string, data: any}>(`${this.BASE_URL}/training/enrollments/${enrollmentId}/progress`, {
        progress_percentage: progress,
        final_score: score
      })
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error updating training progress:', error)
      throw error
    }
  }

  static async completeTraining(enrollmentId: string, score: number): Promise<any> {
    try {
      const response = await apiClient.post<{success: boolean, message: string, data: any}>(`${this.BASE_URL}/training/enrollments/${enrollmentId}/complete`, {
        final_score: score
      })
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error completing training:', error)
      throw error
    }
  }

  static async getTrainingStatistics(): Promise<any> {
    try {
      const response = await apiClient.get<{success: boolean, message: string, data: any}>(`${this.BASE_URL}/training/statistics`)
      
      if (!response.success || !response.data) {
        throw new Error(`API Error: ${response.message}`)
      }

      return response.data
    } catch (error) {
      console.error('Error fetching training statistics:', error)
      throw error
    }
  }
}

// Mock data for development
export const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    name: 'Budi Santoso',
    email: 'budi.santoso@malaka.co.id',
    phone: '021-1234-5678',
    position: 'Senior Developer',
    department: 'Technology',
    division: 'IT',
    hireDate: '2022-01-15',
    status: 'active',
    salary: 15000000,
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    emergencyContact: {
      name: 'Sari Santoso',
      phone: '021-8765-4321',
      relationship: 'Spouse'
    },
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    notes: 'Excellent team player with strong technical skills',
    createdAt: '2022-01-15T09:00:00Z',
    updatedAt: '2024-07-20T14:30:00Z'
  },
  {
    id: '2',
    employeeId: 'EMP002',
    name: 'Sari Dewi',
    email: 'sari.dewi@malaka.co.id',
    phone: '021-2345-6789',
    position: 'Marketing Manager',
    department: 'Marketing',
    division: 'Sales & Marketing',
    hireDate: '2021-06-10',
    status: 'active',
    salary: 12000000,
    address: 'Jl. Kebon Jeruk No. 456, Jakarta Barat',
    emergencyContact: {
      name: 'Ahmad Dewi',
      phone: '021-9876-5432',
      relationship: 'Father'
    },
    skills: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
    notes: 'Creative professional with excellent campaign management skills',
    createdAt: '2021-06-10T10:00:00Z',
    updatedAt: '2024-07-18T16:45:00Z'
  },
  {
    id: '3',
    employeeId: 'EMP003',
    name: 'Ahmad Hidayat',
    email: 'ahmad.hidayat@malaka.co.id',
    phone: '021-3456-7890',
    position: 'Finance Analyst',
    department: 'Finance',
    division: 'Finance & Accounting',
    hireDate: '2023-03-20',
    status: 'active',
    salary: 10000000,
    address: 'Jl. Thamrin No. 789, Jakarta Pusat',
    emergencyContact: {
      name: 'Dewi Hidayat',
      phone: '021-5432-1098',
      relationship: 'Spouse'
    },
    skills: ['Financial Analysis', 'Excel', 'SAP', 'Budgeting'],
    notes: 'Detail-oriented analyst with strong analytical skills',
    createdAt: '2023-03-20T08:30:00Z',
    updatedAt: '2024-07-22T11:20:00Z'
  },
  {
    id: '4',
    employeeId: 'EMP004',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@malaka.co.id',
    phone: '021-4567-8901',
    position: 'HR Specialist',
    department: 'Human Resources',
    division: 'HR & Admin',
    hireDate: '2020-11-05',
    status: 'active',
    salary: 9500000,
    address: 'Jl. Gatot Subroto No. 321, Jakarta Selatan',
    emergencyContact: {
      name: 'Budi Lestari',
      phone: '021-1098-7654',
      relationship: 'Brother'
    },
    skills: ['Recruitment', 'Employee Relations', 'Training', 'HR Policies'],
    notes: 'Experienced HR professional with excellent interpersonal skills',
    createdAt: '2020-11-05T09:15:00Z',
    updatedAt: '2024-07-19T13:40:00Z'
  },
  {
    id: '5',
    employeeId: 'EMP005',
    name: 'Andi Wijaya',
    email: 'andi.wijaya@malaka.co.id',
    phone: '021-5678-9012',
    position: 'Operations Manager',
    department: 'Operations',
    division: 'Operations',
    hireDate: '2019-08-12',
    status: 'active',
    salary: 16000000,
    address: 'Jl. Kuningan No. 654, Jakarta Selatan',
    emergencyContact: {
      name: 'Sri Wijaya',
      phone: '021-2109-8765',
      relationship: 'Mother'
    },
    skills: ['Operations Management', 'Process Improvement', 'Leadership', 'Six Sigma'],
    notes: 'Experienced operations manager with proven track record',
    createdAt: '2019-08-12T07:45:00Z',
    updatedAt: '2024-07-21T15:10:00Z'
  },
  {
    id: '6',
    employeeId: 'EMP006',
    name: 'Rizki Pratama',
    email: 'rizki.pratama@malaka.co.id',
    phone: '021-6789-0123',
    position: 'Junior Developer',
    department: 'Technology',
    division: 'IT',
    hireDate: '2024-02-01',
    status: 'active',
    salary: 8000000,
    address: 'Jl. Casablanca No. 987, Jakarta Selatan',
    emergencyContact: {
      name: 'Maya Pratama',
      phone: '021-3210-9876',
      relationship: 'Sister'
    },
    skills: ['Python', 'Django', 'PostgreSQL', 'Git'],
    notes: 'Promising junior developer with eagerness to learn',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-07-23T10:25:00Z'
  },
  {
    id: '7',
    employeeId: 'EMP007',
    name: 'Maya Sari',
    email: 'maya.sari@malaka.co.id',
    phone: '021-7890-1234',
    position: 'Sales Executive',
    department: 'Sales',
    division: 'Sales & Marketing',
    hireDate: '2021-09-15',
    status: 'inactive',
    salary: 11000000,
    address: 'Jl. Senayan No. 147, Jakarta Pusat',
    emergencyContact: {
      name: 'Indra Sari',
      phone: '021-4321-0987',
      relationship: 'Husband'
    },
    skills: ['Sales', 'Customer Relations', 'Negotiation', 'CRM'],
    notes: 'Currently on maternity leave',
    createdAt: '2021-09-15T09:30:00Z',
    updatedAt: '2024-06-15T12:00:00Z'
  },
  {
    id: '8',
    employeeId: 'EMP008',
    name: 'Fajar Nugroho',
    email: 'fajar.nugroho@malaka.co.id',
    phone: '021-8901-2345',
    position: 'Quality Assurance',
    department: 'Technology',
    division: 'IT',
    hireDate: '2022-07-20',
    status: 'terminated',
    salary: 9000000,
    address: 'Jl. Menteng No. 258, Jakarta Pusat',
    emergencyContact: {
      name: 'Rina Nugroho',
      phone: '021-5432-1098',
      relationship: 'Wife'
    },
    skills: ['Manual Testing', 'Automation Testing', 'Selenium', 'JIRA'],
    notes: 'Contract ended in June 2024',
    createdAt: '2022-07-20T08:15:00Z',
    updatedAt: '2024-06-30T17:00:00Z'
  }
]

export const mockDepartments = [
  'Technology',
  'Marketing',
  'Finance',
  'Human Resources',
  'Operations',
  'Sales'
]

export const mockDivisions = [
  'IT',
  'Sales & Marketing',
  'Finance & Accounting',
  'HR & Admin',
  'Operations'
]

export const mockPositions = [
  'Senior Developer',
  'Junior Developer',
  'Marketing Manager',
  'Finance Analyst',
  'HR Specialist',
  'Operations Manager',
  'Sales Executive',
  'Quality Assurance'
]

// Mock payroll data
export const mockPayrollPeriods: PayrollPeriod[] = [
  {
    id: '1',
    year: 2024,
    month: 7,
    startDate: '2024-07-01',
    endDate: '2024-07-31',
    status: 'completed',
    totalEmployees: 6,
    totalGrossPay: 71500000,
    totalDeductions: 14300000,
    totalNetPay: 57200000,
    processedAt: '2024-07-31T23:59:59Z',
    processedBy: 'Dewi Lestari',
    createdAt: '2024-07-01T09:00:00Z',
    updatedAt: '2024-07-31T23:59:59Z'
  },
  {
    id: '2',
    year: 2024,
    month: 8,
    startDate: '2024-08-01',
    endDate: '2024-08-31',
    status: 'processing',
    totalEmployees: 6,
    totalGrossPay: 71500000,
    totalDeductions: 14300000,
    totalNetPay: 57200000,
    createdAt: '2024-08-01T09:00:00Z',
    updatedAt: '2024-08-15T14:30:00Z'
  },
  {
    id: '3',
    year: 2024,
    month: 9,
    startDate: '2024-09-01',
    endDate: '2024-09-30',
    status: 'draft',
    totalEmployees: 6,
    totalGrossPay: 0,
    totalDeductions: 0,
    totalNetPay: 0,
    createdAt: '2024-09-01T09:00:00Z',
    updatedAt: '2024-09-01T09:00:00Z'
  }
]

export const mockPayrollItems: PayrollItem[] = [
  {
    id: '1',
    payrollPeriodId: '1',
    employeeId: '1',
    employee: {
      id: '1',
      employeeId: 'EMP001',
      name: 'Budi Santoso',
      position: 'Senior Developer',
      department: 'Technology'
    },
    basicSalary: 15000000,
    allowances: [
      { id: '1', type: 'transport', name: 'Transport Allowance', amount: 500000, isTaxable: false },
      { id: '2', type: 'meal', name: 'Meal Allowance', amount: 300000, isTaxable: false }
    ],
    deductions: [
      { id: '1', type: 'tax', name: 'Income Tax', amount: 2400000, isPreTax: false },
      { id: '2', type: 'insurance', name: 'Health Insurance', amount: 150000, isPreTax: true }
    ],
    overtime: [
      { id: '1', date: '2024-07-15', hours: 4, rate: 125000, amount: 500000, description: 'Weekend project work' }
    ],
    grossPay: 16300000,
    totalDeductions: 2550000,
    netPay: 13750000,
    status: 'paid',
    createdAt: '2024-07-01T09:00:00Z',
    updatedAt: '2024-07-31T18:00:00Z'
  },
  {
    id: '2',
    payrollPeriodId: '1',
    employeeId: '2',
    employee: {
      id: '2',
      employeeId: 'EMP002',
      name: 'Sari Dewi',
      position: 'Marketing Manager',
      department: 'Marketing'
    },
    basicSalary: 12000000,
    allowances: [
      { id: '3', type: 'transport', name: 'Transport Allowance', amount: 500000, isTaxable: false },
      { id: '4', type: 'meal', name: 'Meal Allowance', amount: 300000, isTaxable: false },
      { id: '5', type: 'bonus', name: 'Performance Bonus', amount: 1000000, isTaxable: true }
    ],
    deductions: [
      { id: '3', type: 'tax', name: 'Income Tax', amount: 2070000, isPreTax: false },
      { id: '4', type: 'insurance', name: 'Health Insurance', amount: 120000, isPreTax: true }
    ],
    overtime: [],
    grossPay: 13800000,
    totalDeductions: 2190000,
    netPay: 11610000,
    status: 'paid',
    createdAt: '2024-07-01T09:00:00Z',
    updatedAt: '2024-07-31T18:00:00Z'
  }
]

export const mockPayrollSettings: PayrollSettings = {
  id: '1',
  companyName: 'PT Malaka Indonesia',
  payPeriod: 'monthly',
  overtimeRate: 1.5,
  taxSettings: {
    incomeTaxRate: 15,
    socialSecurityRate: 4,
    healthInsuranceRate: 1
  },
  allowanceSettings: {
    transportAllowance: 500000,
    mealAllowance: 300000,
    housingAllowance: 1000000
  },
  workingDays: 22,
  workingHours: 8,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-07-15T10:30:00Z'
}

// Updated mock data that matches the API response format
export const mockEmployeesUpdated: Employee[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    employee_code: 'EMP001',
    employee_name: 'Budi Santoso',
    email: 'budi.santoso@malaka.co.id',
    phone: '081234567890',
    position: 'Manager Operasional',
    department: 'Operasional',
    hire_date: '2023-01-15',
    birth_date: '1985-05-12',
    gender: 'M',
    marital_status: 'Married',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    id_number: '3171051205850001',
    tax_id: '12.345.678.9-012.000',
    bank_account: '1234567890',
    bank_name: 'Bank BCA',
    basic_salary: 8500000,
    allowances: 2000000,
    total_salary: 10500000,
    employment_status: 'ACTIVE',
    supervisor_id: null,
    profile_image_url: null,
    createdAt: '2025-08-02T13:28:24.725073Z',
    updatedAt: '2025-08-02T13:28:24.725073Z'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    employee_code: 'EMP002',
    employee_name: 'Sari Dewi Lestari',
    email: 'sari.dewi@malaka.co.id',
    phone: '081234567891',
    position: 'Supervisor Penjualan',
    department: 'Penjualan',
    hire_date: '2023-03-20',
    birth_date: '1990-08-25',
    gender: 'F',
    marital_status: 'Single',
    address: 'Jl. Kebon Jeruk No. 45, Jakarta Barat',
    id_number: '3171042508900002',
    tax_id: '23.456.789.0-123.000',
    bank_account: '2345678901',
    bank_name: 'Bank Mandiri',
    basic_salary: 6500000,
    allowances: 1500000,
    total_salary: 8000000,
    employment_status: 'ACTIVE',
    supervisor_id: null,
    profile_image_url: null,
    createdAt: '2025-08-02T13:28:24.725073Z',
    updatedAt: '2025-08-02T13:28:24.725073Z'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    employee_code: 'EMP003',
    employee_name: 'Ahmad Hidayat',
    email: 'ahmad.hidayat@malaka.co.id',
    phone: '081234567892',
    position: 'Staff Gudang',
    department: 'Logistik',
    hire_date: '2023-06-10',
    birth_date: '1992-12-03',
    gender: 'M',
    marital_status: 'Married',
    address: 'Jl. Raya Tangerang No. 67, Tangerang',
    id_number: '3671030312920003',
    tax_id: '34.567.890.1-234.000',
    bank_account: '3456789012',
    bank_name: 'Bank BNI',
    basic_salary: 4500000,
    allowances: 800000,
    total_salary: 5300000,
    employment_status: 'ACTIVE',
    supervisor_id: null,
    profile_image_url: null,
    createdAt: '2025-08-02T13:28:24.725073Z',
    updatedAt: '2025-08-02T13:28:24.725073Z'
  }
]