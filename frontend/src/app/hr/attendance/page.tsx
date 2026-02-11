'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TanStackDataTable, type TanStackColumn } from '@/components/ui/tanstack-data-table'
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
  return rawData.map(record => {
    // Find matching employee
    const employee = employees.find(emp => emp.id === record.employee_id)
    if (!employee) {
      return null
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
          const attendanceResponse = await HRService.getAttendanceRecords()
          const transformedData = transformAttendanceData(attendanceResponse.data, employeesResponse.data)
          setAttendanceData(transformedData)
        } catch (attendanceError) {
          console.error('Error fetching attendance data:', attendanceError)
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
    } else if (selectedDate === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const recordDate = new Date(record.attendance_date || '')
      matchesDate = recordDate >= weekAgo
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

    return matchesSearch && matchesDepartment && matchesStatus && matchesDate && matchesMonth && matchesYear
  })

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

  const columns: TanStackColumn<AttendanceRecord>[] = [
    {
      id: 'employee',
      header: 'Employee',
      accessorKey: 'employee_id',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.employee?.employee_name || 'Unknown Employee'}</div>
          <div className="text-xs text-muted-foreground">{row.original.employee?.employee_code || 'N/A'} • {row.original.employee?.department || 'N/A'}</div>
        </div>
      )
    },
    {
      id: 'date',
      header: 'Date',
      accessorKey: 'attendance_date',
      cell: ({ row }) => (
        <div className="text-xs">
          {mounted && row.original.attendance_date ? new Date(row.original.attendance_date).toLocaleDateString('id-ID', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : ''}
        </div>
      )
    },
    {
      id: 'check_in',
      header: 'Check In',
      accessorKey: 'actual_in',
      cell: ({ row }) => (
        <div className="text-xs font-mono">
          {row.original?.actual_in ? new Date(row.original.actual_in).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          }) : '-'}
        </div>
      )
    },
    {
      id: 'check_out',
      header: 'Check Out',
      accessorKey: 'actual_out',
      cell: ({ row }) => (
        <div className="text-xs font-mono">
          {row.original?.actual_out ? new Date(row.original.actual_out).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
          }) : '-'}
        </div>
      )
    },
    {
      id: 'work_hours',
      header: 'Working Hours',
      accessorKey: 'work_hours',
      cell: ({ row }) => (
        <div className="text-xs">
          {row.original?.work_hours ? `${row.original.work_hours.toFixed(1)}h` : '-'}
          {row.original?.overtime_hours && row.original.overtime_hours > 0 ? (
            <span className="text-purple-600 ml-1">+{row.original.overtime_hours.toFixed(1)}h</span>
          ) : null}
        </div>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = (row.original.status || 'PRESENT') as keyof typeof statusColors
        return (
          <Badge className={statusColors[status]}>
            {status ? status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown'}
          </Badge>
        )
      }
    },
    {
      id: 'remarks',
      header: 'Remarks',
      accessorKey: 'remarks',
      cell: ({ row }) => (
        <div className="text-xs text-muted-foreground max-w-xs truncate">
          {row.original?.remarks || '-'}
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
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{totalEmployees}</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={UserGroupIcon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Present Today</p>
                <p className="text-2xl font-bold text-green-600">{presentCount}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-600">{absentCount}</p>
              </div>
              <div className="h-10 w-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={CancelIcon} className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Late Arrivals</p>
                <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
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
          <TanStackDataTable
            data={paginatedData}
            columns={columns}
            searchPlaceholder="Search employees, departments, or locations..."
            pagination={{
              pageIndex: currentPage - 1,
              pageSize: pageSize,
              totalRows: totalItems,
              onPageChange: (page) => setCurrentPage(page + 1),
              onPageSizeChange: (size) => setPageSize(size)
            }}
          />
        )}
      </div>
    </TwoLevelLayout>
  )
}