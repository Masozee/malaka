'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Badge } from '@/components/ui/badge'
import { HRService } from '@/services/hr'
import { LeaveRequestForm } from '@/components/forms/leave-request-form'
import type { LeaveRequest as LeaveRequestType, LeaveFormData } from '@/types/hr'
import { 
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  TrendingUp,
  Plane,
  Heart,
  UserX,
  Search
} from 'lucide-react'

// Use the proper LeaveRequest type from @/types/hr
interface LeaveRequest {
  id: string
  employeeId: string
  employeeName: string
  department: string
  leaveType: 'annual' | 'sick' | 'maternity' | 'personal' | 'emergency' | 'unpaid'
  startDate: string
  endDate: string
  totalDays: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  appliedDate: string
  approvedBy?: string
  approvedDate?: string
  notes?: string
  emergencyContact?: string
}

// Status and type color mappings
const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800'
}

const typeColors = {
  annual: 'bg-blue-100 text-blue-800',
  sick: 'bg-red-100 text-red-800',
  maternity: 'bg-pink-100 text-pink-800',
  personal: 'bg-purple-100 text-purple-800',
  emergency: 'bg-orange-100 text-orange-800',
  unpaid: 'bg-gray-100 text-gray-800'
}

const typeIcons = {
  annual: Plane,
  sick: Heart,
  maternity: Users,
  personal: UserX,
  emergency: AlertCircle,
  unpaid: XCircle
}

export default function LeavePage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [statistics, setStatistics] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestType | undefined>()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    fetchLeaveData()
  }, [])

  const fetchLeaveData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch leave requests and statistics in parallel
      const [requestsResponse, statsResponse] = await Promise.all([
        HRService.getLeaveRequests(),
        HRService.getLeaveStatistics()
      ])

      // Transform API response to match frontend interface
      const transformedRequests = requestsResponse.data.map((item: any) => ({
        id: item.id,
        employeeId: item.employee_id,
        employeeName: item.employee_name || 'Unknown Employee',
        department: item.department || 'Unknown Department',
        leaveType: mapLeaveType(item.leave_type),
        startDate: item.start_date,
        endDate: item.end_date,
        totalDays: item.total_days,
        reason: item.reason,
        status: item.status,
        appliedDate: item.applied_date,
        approvedBy: item.approved_by,
        approvedDate: item.approved_date,
        notes: item.notes,
        emergencyContact: item.emergency_contact
      }))

      setLeaveRequests(transformedRequests)
      setStatistics(statsResponse)
    } catch (error) {
      console.error('Error fetching leave data:', error)
      setError('Failed to load leave data. Please try again.')
      // Don't use fallback data - show error state instead
    } finally {
      setLoading(false)
    }
  }

  const mapLeaveType = (leaveType: string): 'annual' | 'sick' | 'maternity' | 'personal' | 'emergency' | 'unpaid' => {
    if (!leaveType) return 'personal'
    
    if (leaveType.includes('Annual') || leaveType.includes('Tahunan')) return 'annual'
    if (leaveType.includes('Sick') || leaveType.includes('Sakit')) return 'sick'
    if (leaveType.includes('Maternity') || leaveType.includes('Melahirkan')) return 'maternity'
    if (leaveType.includes('Emergency') || leaveType.includes('Darurat')) return 'emergency'
    if (leaveType.includes('Unpaid') || leaveType.includes('Tanpa Gaji')) return 'unpaid'
    return 'personal'
  }

  const breadcrumbs = [
    { label: 'HR Management', href: '/hr' },
    { label: 'Leave Management', href: '/hr/leave' }
  ]

  // Use statistics from API or calculate from data
  const totalRequests = statistics.total_requests || leaveRequests.length
  const pendingRequests = statistics.pending_requests || leaveRequests.filter(leave => leave.status === 'pending').length
  const approvedRequests = statistics.approved_requests || leaveRequests.filter(leave => leave.status === 'approved').length
  const rejectedRequests = statistics.rejected_requests || leaveRequests.filter(leave => leave.status === 'rejected').length
  const totalDaysRequested = statistics.total_days_requested || leaveRequests.filter(leave => leave.status === 'approved').reduce((sum, leave) => sum + leave.totalDays, 0)
  const avgProcessingTime = statistics.avg_processing_time || 2.5
  const approvalRate = statistics.approval_rate || (totalRequests > pendingRequests ? ((approvedRequests / (totalRequests - pendingRequests)) * 100) : 0)

  // Handler functions for leave request actions
  const handleApproveRequest = async (requestId: string) => {
    try {
      await HRService.approveLeaveRequest(requestId)
      await fetchLeaveData() // Refresh data after action
    } catch (error) {
      console.error('Error approving leave request:', error)
      setError('Failed to approve leave request. Please try again.')
    }
  }

  const handleRejectRequest = async (requestId: string, reason: string) => {
    try {
      await HRService.rejectLeaveRequest(requestId, reason)
      await fetchLeaveData() // Refresh data after action
    } catch (error) {
      console.error('Error rejecting leave request:', error)
      setError('Failed to reject leave request. Please try again.')
    }
  }

  // Form handlers
  const handleCreateRequest = () => {
    setFormMode('create')
    setSelectedRequest(undefined)
    setFormOpen(true)
  }

  const handleEditRequest = (request: LeaveRequest) => {
    setFormMode('edit')
    // Convert local interface to API type
    const apiRequest: LeaveRequestType = {
      id: request.id,
      employee_id: request.employeeId,
      employee_name: request.employeeName,
      department: request.department,
      leave_type_id: '', // We'll need to map this
      leave_type: request.leaveType,
      start_date: request.startDate,
      end_date: request.endDate,
      total_days: request.totalDays,
      reason: request.reason,
      emergency_contact: request.emergencyContact,
      status: request.status,
      applied_date: request.appliedDate,
      approved_by: request.approvedBy,
      approved_date: request.approvedDate,
      rejected_reason: '',
      notes: request.notes,
      created_at: '',
      updated_at: ''
    }
    setSelectedRequest(apiRequest)
    setFormOpen(true)
  }

  const handleDeleteRequest = async (request: LeaveRequest) => {
    if (confirm('Are you sure you want to delete this leave request?')) {
      try {
        await HRService.updateLeaveRequest(request.id, { status: 'cancelled' })
        await fetchLeaveData()
      } catch (error) {
        console.error('Error deleting leave request:', error)
        setError('Failed to delete leave request. Please try again.')
      }
    }
  }

  const handleFormSubmit = async (data: LeaveFormData) => {
    try {
      if (formMode === 'create') {
        await HRService.createLeaveRequest(data)
      } else if (selectedRequest) {
        await HRService.updateLeaveRequest(selectedRequest.id, data)
      }
      await fetchLeaveData() // Refresh data
      setFormOpen(false)
    } catch (error) {
      console.error('Error submitting leave request:', error)
      throw error // Let the form handle the error
    }
  }

  const columns = [
    {
      key: 'employeeId',
      title: 'Employee',
      sortable: true,
      render: (value: unknown, record: LeaveRequest) => (
        <div>
          <div className="font-medium">{record.employeeName}</div>
          <div className="text-sm text-gray-500">{record.employeeId} • {record.department}</div>
        </div>
      )
    },
    {
      key: 'leaveType',
      title: 'Type',
      sortable: true,
      filterType: 'select' as const,
      filterOptions: [
        { value: 'annual', label: 'Annual Leave' },
        { value: 'sick', label: 'Sick Leave' },
        { value: 'maternity', label: 'Maternity Leave' },
        { value: 'personal', label: 'Personal Leave' },
        { value: 'emergency', label: 'Emergency Leave' },
        { value: 'unpaid', label: 'Unpaid Leave' }
      ],
      render: (value: unknown, record: LeaveRequest) => {
        const type = record.leaveType
        const Icon = typeIcons[type]
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge className={typeColors[type]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'startDate',
      title: 'Start Date',
      sortable: true,
      render: (value: unknown, record: LeaveRequest) => (
        <div className="text-sm">
          {mounted ? new Date(record.startDate).toLocaleDateString('id-ID') : ''}
        </div>
      )
    },
    {
      key: 'endDate',
      title: 'End Date',
      sortable: true,
      render: (value: unknown, record: LeaveRequest) => (
        <div className="text-sm">
          {mounted ? new Date(record.endDate).toLocaleDateString('id-ID') : ''}
        </div>
      )
    },
    {
      key: 'totalDays',
      title: 'Days',
      sortable: true,
      render: (value: unknown, record: LeaveRequest) => (
        <div className="text-center font-medium">
          {record.totalDays}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      filterType: 'select' as const,
      filterOptions: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'cancelled', label: 'Cancelled' }
      ],
      render: (value: unknown, record: LeaveRequest) => {
        const status = record.status
        return (
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      }
    },
    {
      key: 'appliedDate',
      title: 'Applied',
      sortable: true,
      render: (value: unknown, record: LeaveRequest) => (
        <div className="text-sm">
          {mounted ? new Date(record.appliedDate).toLocaleDateString('id-ID') : ''}
        </div>
      )
    },
    {
      key: 'reason',
      title: 'Reason',
      searchable: true,
      render: (value: unknown, record: LeaveRequest) => (
        <div className="text-sm max-w-48 truncate" title={record.reason}>
          {record.reason}
        </div>
      )
    }
  ]

  const LeaveCard = ({ request }: { request: LeaveRequest }) => {
    const Icon = typeIcons[request.leaveType]
    
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{request.employeeName}</h3>
            <p className="text-sm text-gray-500">{request.employeeId} • {request.department}</p>
          </div>
          <Badge className={statusColors[request.status]}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge className={typeColors[request.leaveType]}>
              {request.leaveType.charAt(0).toUpperCase() + request.leaveType.slice(1)}
            </Badge>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Duration:</span>
            <span>
              {mounted ? new Date(request.startDate).toLocaleDateString('id-ID') : ''} - {' '}
              {mounted ? new Date(request.endDate).toLocaleDateString('id-ID') : ''} ({request.totalDays} days)
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500">Applied:</span>
            <span>{mounted ? new Date(request.appliedDate).toLocaleDateString('id-ID') : ''}</span>
          </div>
          
          {request.approvedBy && (
            <div className="flex justify-between">
              <span className="text-gray-500">Approved by:</span>
              <span>{request.approvedBy}</span>
            </div>
          )}
          
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <span className="font-medium">Reason: </span>
            {request.reason}
          </div>
          
          {request.notes && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
              <span className="font-medium">Notes: </span>
              {request.notes}
            </div>
          )}
        </div>
        
        {request.status === 'pending' && (
          <div className="flex space-x-2 mt-4">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => handleApproveRequest(request.id)}
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={() => handleRejectRequest(request.id, 'Rejected by HR')}
              disabled={loading}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </Card>
    )
  }

  return (
    <TwoLevelLayout>
      <Header 
        title="Leave Management"
        description="Manage employee leave requests and track leave balances"
        breadcrumbs={breadcrumbs}
        actions={
          <Button size="sm" onClick={handleCreateRequest}>
            <FileText className="h-4 w-4 mr-2" />
            New Request
          </Button>
        }
      />
      
      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards (max 4 cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{totalRequests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingRequests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedRequests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedRequests}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters (no outer border) */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                placeholder="Search employees, leave types..."
                className="pl-9 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="">All Types</option>
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal Leave</option>
            </select>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Filter Period
            </Button>
            <Button variant="outline" size="sm">Export</Button>
          </div>
        </div>

        {/* View Toggle & Sort */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button 
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
              >
                Cards
              </Button>
              <Button 
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
              >
                Table
              </Button>
            </div>
            <select className="h-9 w-44 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs">
              <option>Sort by Applied Date</option>
              <option>Sort by Status</option>
              <option>Sort by Employee</option>
            </select>
          </div>
          <div className="text-sm text-muted-foreground">
            {leaveRequests.length} of {totalRequests} items
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500">Loading leave data...</div>
          </Card>
        ) : error ? (
          <Card className="p-8 text-center">
            <div className="text-red-500 mb-4">{error}</div>
            <Button onClick={fetchLeaveData} variant="outline">
              Try Again
            </Button>
          </Card>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveRequests.map((request) => (
              <LeaveCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <AdvancedDataTable
            data={leaveRequests}
            columns={columns}
            searchPlaceholder="Search employees, leave types, or reasons..."
            loading={loading}
            exportEnabled={true}
            onAdd={handleCreateRequest}
            onEdit={handleEditRequest}
            onDelete={handleDeleteRequest}
            addButtonText="New Request"
          />
        )}

        {/* Leave Request Form */}
        <LeaveRequestForm
          isOpen={formOpen}
          onClose={() => setFormOpen(false)}
          onSubmit={handleFormSubmit}
          initialData={selectedRequest}
          mode={formMode}
        />
      </div>
    </TwoLevelLayout>
  )
}