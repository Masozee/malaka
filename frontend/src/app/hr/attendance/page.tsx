'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Download01Icon,
  PlusSignIcon,
  UserGroupIcon,
  CheckmarkCircle01Icon,
  CancelIcon,
  AlertCircleIcon,
  Clock01Icon,
  Search01Icon,
  FilterIcon,
  Calendar01Icon,
  ChartColumnIcon
} from '@hugeicons/core-free-icons'

import { HRService } from '@/services/hr'
import type { Employee } from '@/types/hr'

interface AttendanceRecord {
  id: string
  employee_id: string
  employee: Pick<Employee, 'id' | 'employee_code' | 'employee_name' | 'department' | 'position'>
  attendance_date: string
  scheduled_in: string | null
  scheduled_out: string | null
  actual_in: string | null
  actual_out: string | null
  late_minutes: number
  early_out_minutes: number
  work_hours: number | null
  overtime_hours: number | null
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'OVERTIME'
  remarks?: string
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

// Transform backend attendance data to match frontend interface
const transformAttendanceData = (rawData: any[], employees: Employee[]): AttendanceRecord[] => {
  console.log('Transforming attendance data:', rawData.length, 'records with', employees.length, 'employees')
  
  return rawData.map(record => {
    // Find matching employee
    const employee = employees.find(emp => emp.id === record.employee_id)
    if (!employee) {
      console.warn('No employee found for attendance record:', record.employee_id)
      return null
    }
    
    // Format times from timestamps
    const formatTime = (timestamp: string | null): string | null => {
      if (!timestamp) return null
      const date = new Date(timestamp)
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    }
    
    return {
      id: record.id,
      employee_id: record.employee_id,
      employee: {
        id: employee.id,
        employee_code: employee.employee_code,
        employee_name: employee.employee_name,
        department: employee.department,
        position: employee.position
      },
      attendance_date: record.attendance_date,
      scheduled_in: record.scheduled_in,
      scheduled_out: record.scheduled_out,
      actual_in: record.actual_in,
      actual_out: record.actual_out,
      late_minutes: record.late_minutes || 0,
      early_out_minutes: record.early_out_minutes || 0,
      work_hours: record.work_hours,
      overtime_hours: record.overtime_hours,
      status: record.status,
      remarks: record.remarks,
      approved_by: record.approved_by,
      approved_at: record.approved_at,
      created_at: record.created_at,
      updated_at: record.updated_at
    }
  }).filter(Boolean) as AttendanceRecord[]
}

// Status color mapping (updated for backend format)
const statusColors = {
  PRESENT: 'bg-green-100 text-green-800',
  ABSENT: 'bg-red-100 text-red-800',
  LATE: 'bg-yellow-100 text-yellow-800',
  HALF_DAY: 'bg-blue-100 text-blue-800',
  OVERTIME: 'bg-purple-100 text-purple-800'
}

export default function AttendancePage() {
  const [mounted, setMounted] = useState(false)
  const [activeView, setActiveView] = useState<'cards' | 'table'>('table')
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState<string>('week')
  const [selectedMonth, setSelectedMonth] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    setMounted(true)
    
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch employees first
        const employeesResponse = await HRService.getEmployees()
        setEmployees(employeesResponse.data)
        
        // Fetch real attendance data from API
        try {
          console.log('Fetching attendance records...')
          const attendanceResponse = await HRService.getAttendanceRecords()
          console.log('Attendance API response:', attendanceResponse)
          console.log('Number of employees for transformation:', employeesResponse.data.length)
          
          const transformedData = transformAttendanceData(attendanceResponse.data, employeesResponse.data)
          console.log('Transformed attendance data:', transformedData.length, 'records')
          setAttendanceData(transformedData)
        } catch (attendanceError) {
          console.error('Error fetching attendance data:', attendanceError)
          console.error('Setting empty attendance data due to error')
          // Show error but don't crash the page
          setAttendanceData([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setEmployees([])
        setAttendanceData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const breadcrumbs = [
    { label: 'Human Resources', href: '/hr' },
    { label: 'Attendance', href: '/hr/attendance' }
  ]

  // Filter data based on selected filters
  const filteredData = attendanceData.filter(record => {
    const matchesSearch = !searchTerm || 
      record.employee?.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee?.employee_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee?.department?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = selectedDepartment === 'all' || record.employee?.department === selectedDepartment
    const matchesStatus = selectedStatus === 'all' || record.status?.toLowerCase() === selectedStatus.toLowerCase()
    
    let matchesDate = true
    if (selectedDate === 'today') {
      const today = new Date().toISOString().split('T')[0]
      const recordDate = record.attendance_date?.split('T')[0] || ''
      matchesDate = recordDate === today
      console.log('Today filter:', {today, recordDate, matches: matchesDate})
    } else if (selectedDate === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const recordDate = new Date(record.attendance_date || '')
      matchesDate = recordDate >= weekAgo
      console.log('Week filter:', {weekAgo: weekAgo.toISOString(), recordDate: recordDate.toISOString(), matches: matchesDate})
    } else if (selectedDate === 'all') {
      matchesDate = true
    }
    
    // Month/Year filter
    let matchesMonth = true
    let matchesYear = true
    
    if (selectedMonth !== 'all' && record.attendance_date) {
      const recordDate = new Date(record.attendance_date)
      matchesMonth = (recordDate.getMonth() + 1).toString() === selectedMonth
    }
    
    if (selectedYear !== 'all' && record.attendance_date) {
      const recordDate = new Date(record.attendance_date)
      matchesYear = recordDate.getFullYear().toString() === selectedYear
    }
    
    const finalMatch = matchesSearch && matchesDepartment && matchesStatus && matchesDate && matchesMonth && matchesYear
    if (!finalMatch && process.env.NODE_ENV === 'development') {
      console.log('Record filtered out:', {
        record: record.id,
        employee: record.employee?.employee_name || 'Unknown',
        matchesSearch,
        matchesDepartment,
        matchesStatus,
        matchesDate
      })
    }
    return finalMatch
  })

  console.log('Final filtered data:', filteredData.length, 'records from', attendanceData.length, 'total')
  
  // Pagination logic
  const totalItems = filteredData.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedDepartment, selectedStatus, selectedDate, selectedMonth, selectedYear])
  
  // Calculate statistics for today
  const today = new Date().toISOString().split('T')[0]
  const todayRecords = attendanceData.filter(record => record.attendance_date?.split('T')[0] === today)
  
  const totalEmployees = todayRecords.length
  const presentCount = todayRecords.filter(record => 
    ['PRESENT', 'LATE', 'HALF_DAY', 'OVERTIME'].includes(record.status || '')
  ).length
  const absentCount = todayRecords.filter(record => record.status === 'ABSENT').length
  const lateCount = todayRecords.filter(record => record.status === 'LATE').length
  const overtimeCount = todayRecords.filter(record => record.status === 'OVERTIME').length
  const avgWorkingHours = todayRecords
    .filter(record => record.work_hours !== null)
    .reduce((sum, record) => sum + (record.work_hours || 0), 0) / 
    Math.max(1, todayRecords.filter(record => record.work_hours !== null).length)
  const attendanceRate = totalEmployees > 0 ? ((presentCount / totalEmployees) * 100) : 0

  // Get unique departments
  const departments = Array.from(new Set(employees.map(emp => emp.department))).sort()
  
  // Generate month and year options
  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]
  
  // Get unique years from attendance data
  const years = Array.from(new Set(
    attendanceData
      .filter(record => record.attendance_date)
      .map(record => new Date(record.attendance_date).getFullYear())
  )).sort((a, b) => b - a) // Sort descending (newest first)

  const columns: Array<{
    key: keyof AttendanceRecord;
    title: string;
    render?: (value: unknown, record: AttendanceRecord) => React.ReactNode;
  }> = [
    {
      key: 'employee' as keyof AttendanceRecord,
      title: 'Employee',
      render: (value: unknown, record: AttendanceRecord) => (
        <div>
          <div className="font-medium">{record.employee?.employee_name || 'Unknown Employee'}</div>
          <div className="text-sm text-muted-foreground">{record.employee?.employee_code || 'N/A'} • {record.employee?.department || 'N/A'}</div>
        </div>
      )
    },
    {
      key: 'attendance_date' as keyof AttendanceRecord,
      title: 'Date',
      render: (value: unknown, record: AttendanceRecord) => (
        <div className="text-sm">
          {mounted && record.attendance_date ? new Date(record.attendance_date).toLocaleDateString('id-ID', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : ''}
        </div>
      )
    },
    {
      key: 'actual_in' as keyof AttendanceRecord,
      title: 'Check In',
      render: (value: unknown, record: AttendanceRecord) => (
        <div className="text-sm font-mono">
          {record?.actual_in ? new Date(record.actual_in).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          }) : '-'}
        </div>
      )
    },
    {
      key: 'actual_out' as keyof AttendanceRecord,
      title: 'Check Out',
      render: (value: unknown, record: AttendanceRecord) => (
        <div className="text-sm font-mono">
          {record?.actual_out ? new Date(record.actual_out).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          }) : '-'}
        </div>
      )
    },
    {
      key: 'work_hours' as keyof AttendanceRecord,
      title: 'Working Hours',
      render: (value: unknown, record: AttendanceRecord) => (
        <div className="text-sm">
          {record?.work_hours ? `${record.work_hours.toFixed(1)}h` : '-'}
          {record?.overtime_hours && record.overtime_hours > 0 && (
            <span className="text-purple-600 ml-1">+{record.overtime_hours.toFixed(1)}h</span>
          )}
        </div>
      )
    },
    {
      key: 'status' as keyof AttendanceRecord,
      title: 'Status',
      render: (value: unknown, record: AttendanceRecord) => {
        const status = (record.status || 'PRESENT') as keyof typeof statusColors
        return (
          <Badge className={statusColors[status]}>
            {status ? status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
          </Badge>
        )
      }
    },
    {
      key: 'remarks' as keyof AttendanceRecord,
      title: 'Remarks',
      render: (value: unknown, record: AttendanceRecord) => (
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {record?.remarks || '-'}
        </div>
      )
    }
  ]

  const AttendanceCard = ({ record }: { record: AttendanceRecord }) => {
    const status = (record.status || 'PRESENT') as keyof typeof statusColors
    return (
      <Card className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{record.employee?.employee_name || 'Unknown Employee'}</h3>
            <p className="text-sm text-gray-500">{record.employee?.employee_code || 'N/A'} • {record.employee?.department || 'N/A'}</p>
          </div>
          <Badge className={statusColors[status]}>
            {status ? status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
          </Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Date:</span>
            <span>{mounted && record.attendance_date ? new Date(record.attendance_date).toLocaleDateString('id-ID') : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Check In:</span>
            <span className="font-mono">
              {record?.actual_in ? new Date(record.actual_in).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              }) : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Check Out:</span>
            <span className="font-mono">
              {record?.actual_out ? new Date(record.actual_out).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              }) : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Working Hours:</span>
            <span>
              {record?.work_hours ? `${record.work_hours.toFixed(1)}h` : '-'}
              {record?.overtime_hours && record.overtime_hours > 0 && (
                <span className="text-purple-600 ml-1">+{record.overtime_hours.toFixed(1)}h</span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Late:</span>
            <span className={(record.late_minutes || 0) > 0 ? 'text-yellow-600' : 'text-green-600'}>
              {(record.late_minutes || 0) > 0 ? `${record.late_minutes || 0} min` : 'On time'}
            </span>
          </div>
          {record?.remarks && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
              <span className="font-medium">Remarks: </span>
              {record?.remarks}
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <TwoLevelLayout>
      <Header 
        title="Attendance Management"
        description="Track and manage employee attendance records"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
              Add Record
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HugeiconsIcon icon={UserGroupIcon} className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Present Today</p>
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <HugeiconsIcon icon={CancelIcon} className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Late Arrivals</p>
                <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Overtime</p>
                <p className="text-2xl font-bold text-purple-600">{overtimeCount}</p>
              </div>
            </div>
          </Card>

        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees, departments..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-40">
                <HugeiconsIcon icon={FilterIcon} className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="overtime">Overtime</SelectItem>
                <SelectItem value="half_day">Half Day</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger className="w-32">
                <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="today">Today</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-32">
                <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Months</SelectItem>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-24">
                <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Toggle & Sort */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button 
                variant={activeView === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('cards')}
              >
                Cards
              </Button>
              <Button 
                variant={activeView === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('table')}
              >
                Table
              </Button>
            </div>
            <Select>
              <SelectTrigger className="w-44">
                <HugeiconsIcon icon={ChartColumnIcon} className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
                <SelectItem value="name-asc">Name A-Z</SelectItem>
                <SelectItem value="name-desc">Name Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} records</span>
            <div className="flex items-center gap-2">
              <span>Show:</span>
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span>per page</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : activeView === 'cards' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedData.map((record) => (
                <AttendanceCard key={record.id} record={record} />
              ))}
            </div>
            
            {/* Pagination Controls for Cards */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} records
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <AdvancedDataTable
            data={paginatedData}
            columns={columns}
            searchPlaceholder="Search employees, departments, or locations..."
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              onChange: (page, size) => {
                setCurrentPage(page)
                setPageSize(size)
              }
            }}
          />
        )}
      </div>
    </TwoLevelLayout>
  )
}