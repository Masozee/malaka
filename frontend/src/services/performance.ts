import { apiClient } from '@/lib/api'

export interface PerformanceReview {
  id: string
  employeeId: string
  employeeName: string
  employeeCode: string
  department: string
  position: string
  reviewPeriod: string
  reviewType: 'quarterly' | 'annual' | 'probation' | 'mid-year'
  overallScore: number | null
  status: 'draft' | 'pending' | 'completed' | 'overdue'
  reviewDate: string | null
  submissionDate: string | null
  completionDate: string | null
  notes: string
  selfReviewCompleted: boolean
  managerReviewCompleted: boolean
  reviewer: string
  lastUpdated: string
  goals: {
    achieved: number
    total: number
  }
  competencies: {
    technical: number
    communication: number
    leadership: number
    teamwork: number
    problemSolving: number
  }
  goalDetails?: PerformanceReviewGoal[]
  competencyDetails?: PerformanceCompetency[]
}

export interface PerformanceReviewGoal {
  id: string
  goalId: string
  goalTitle: string
  goalCategory: string
  targetValue: string
  actualValue: string
  achievementPercentage: number
  isAchieved: boolean
  comments: string
}

export interface PerformanceCompetency {
  id: string
  competencyId: string
  competencyName: string
  category: string
  selfScore: number
  managerScore: number
  finalScore: number
  selfComments: string
  managerComments: string
}

export interface PerformanceStatistics {
  totalReviews: number
  completedReviews: number
  pendingReviews: number
  overdueReviews: number
  draftReviews: number
  averageScore: number
  highPerformers: number
  completionRate: number
}

export interface PerformanceReviewFilters {
  status?: string
  employeeId?: string
  reviewPeriod?: string
  page?: number
  pageSize?: number
}

export interface PerformanceReviewResponse {
  data: PerformanceReview[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

class PerformanceService {
  async getAll(filters?: PerformanceReviewFilters): Promise<PerformanceReviewResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters?.status) params.append('status', filters.status)
      if (filters?.employeeId) params.append('employee_id', filters.employeeId)
      if (filters?.reviewPeriod) params.append('review_period', filters.reviewPeriod)
      if (filters?.page) params.append('page', filters.page.toString())
      if (filters?.pageSize) params.append('page_size', filters.pageSize.toString())

      const queryString = params.toString()
      const url = `/api/v1/hr/performance/reviews/${queryString ? `?${queryString}` : ''}`
      
      const response = await apiClient.get<{
        success: boolean
        message: string
        data: PerformanceReviewResponse
      }>(url)

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch performance reviews')
      }

      return response.data
    } catch (error) {
      console.error('Error fetching performance reviews:', error)
      throw error
    }
  }

  async getById(id: string): Promise<PerformanceReview> {
    try {
      const response = await apiClient.get<{
        success: boolean
        message: string
        data: PerformanceReview
      }>(`/api/v1/hr/performance/reviews/${id}`)

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch performance review')
      }

      return response.data
    } catch (error) {
      console.error('Error fetching performance review:', error)
      throw error
    }
  }

  async getStatistics(filters?: { employeeId?: string; reviewPeriod?: string }): Promise<PerformanceStatistics> {
    try {
      const params = new URLSearchParams()
      
      if (filters?.employeeId) params.append('employee_id', filters.employeeId)
      if (filters?.reviewPeriod) params.append('review_period', filters.reviewPeriod)

      const queryString = params.toString()
      const url = `/api/v1/hr/performance/statistics${queryString ? `?${queryString}` : ''}`
      
      const response = await apiClient.get<{
        success: boolean
        message: string
        data: PerformanceStatistics
      }>(url)

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch performance statistics')
      }

      return response.data
    } catch (error) {
      console.error('Error fetching performance statistics:', error)
      throw error
    }
  }

  async getByEmployee(employeeId: string): Promise<PerformanceReview[]> {
    try {
      const response = await apiClient.get<{
        success: boolean
        message: string
        data: PerformanceReview[]
      }>(`/api/v1/hr/performance/reviews/employee/${employeeId}`)

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch employee performance reviews')
      }

      return response.data
    } catch (error) {
      console.error('Error fetching employee performance reviews:', error)
      throw error
    }
  }

  async getByPeriod(period: string): Promise<PerformanceReview[]> {
    try {
      const response = await apiClient.get<{
        success: boolean
        message: string
        data: PerformanceReview[]
      }>(`/api/v1/hr/performance/reviews/period/${period}`)

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch performance reviews by period')
      }

      return response.data
    } catch (error) {
      console.error('Error fetching performance reviews by period:', error)
      throw error
    }
  }

  async getByStatus(status: string): Promise<PerformanceReview[]> {
    try {
      const response = await apiClient.get<{
        success: boolean
        message: string
        data: PerformanceReview[]
      }>(`/api/v1/hr/performance/reviews/status/${status}`)

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch performance reviews by status')
      }

      return response.data
    } catch (error) {
      console.error('Error fetching performance reviews by status:', error)
      throw error
    }
  }
}

export const performanceService = new PerformanceService()