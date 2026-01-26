'use client'

import { useState, useEffect, useMemo } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import { EmployeeCard } from '@/components/hr/employee-card'

import type { Employee, EmployeeFilters as FilterType } from '@/types/hr'
import { HRService } from '@/services/hr'
import Link from 'next/link'

type ViewMode = 'grid' | 'table'

const statusColors = {
  ACTIVE: 'bg-green-500',
  INACTIVE: 'bg-yellow-500',
  TERMINATED: 'bg-red-500'
}

const statusLabels = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  TERMINATED: 'Terminated'
}

export default function EmployeesPage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filters, setFilters] = useState<FilterType>({})
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [departments, setDepartments] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('employee_name')

  // Handle client-side hydration and data fetching
  useEffect(() => {
    setMounted(true)
    fetchEmployees()
    setDepartments(['Operasional', 'Penjualan', 'Logistik', 'Keuangan', 'IT', 'SDM', 'Keamanan', 'Maintenance', 'Administrasi', 'Produksi', 'Pemasaran'])
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await HRService.getEmployees({ page, limit, ...filters })
      setEmployees(response.data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  // Refetch when filters change
  useEffect(() => {
    if (mounted) {
      fetchEmployees()
    }
  }, [filters, page, limit, mounted])

  // Filter employees based on current filters
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          employee.employee_name.toLowerCase().includes(searchLower) ||
          employee.email.toLowerCase().includes(searchLower) ||
          employee.employee_code.toLowerCase().includes(searchLower) ||
          employee.position.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }

      // Department filter
      if (filters.department && employee.department !== filters.department) {
        return false
      }

      // Position filter
      if (filters.position && employee.position !== filters.position) {
        return false
      }

      // Status filter
      if (filters.employment_status && employee.employment_status !== filters.employment_status) {
        return false
      }

      // Gender filter
      if (filters.gender && employee.gender !== filters.gender) {
        return false
      }

      // Hire date range filter
      if (filters.hireStartDate) {
        if (new Date(employee.hire_date) < new Date(filters.hireStartDate)) {
          return false
        }
      }
      if (filters.hireEndDate) {
        if (new Date(employee.hire_date) > new Date(filters.hireEndDate)) {
          return false
        }
      }

      // Salary range filter
      if (filters.salaryMin && employee.total_salary < filters.salaryMin) {
        return false
      }
      if (filters.salaryMax && employee.total_salary > filters.salaryMax) {
        return false
      }

      return true
    })
  }, [employees, filters])

  // Paginated employees for current view
  const paginatedEmployees = useMemo(() => {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    return filteredEmployees.slice(startIndex, endIndex)
  }, [filteredEmployees, page, limit])

  const totalPages = Math.ceil(filteredEmployees.length / limit)

  // Statistics - calculated only after mounting to prevent hydration issues
  const stats = useMemo(() => {
    if (!mounted) {
      return { total: 0, active: 0, inactive: 0, terminated: 0 }
    }
    
    const total = employees.length
    const active = employees.filter(e => e.employment_status === 'ACTIVE').length
    const inactive = employees.filter(e => e.employment_status === 'INACTIVE').length
    const terminated = employees.filter(e => e.employment_status === 'TERMINATED').length
    
    return { total, active, inactive, terminated }
  }, [employees, mounted])

  const clearFilters = () => {
    setFilters({})
    setPage(1)
  }

  // Table columns for DataTable
  const columns = [
    {
      key: 'employee_name' as keyof Employee,
      title: 'Employee',
      render: (value: unknown, record: Employee) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-sm font-medium">
              {record.employee_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div>
            <Link 
              href={`/hr/employees/${record.id}`}
              className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              {record.employee_name}
            </Link>
            <p className="text-xs text-gray-500">{record.employee_code}</p>
          </div>
        </div>
      )
    },
    {
      key: 'position' as keyof Employee,
      title: 'Position',
      render: (value: unknown, record: Employee) => (
        <div>
          <p className="font-medium">{record.position}</p>
          <p className="text-xs text-gray-500">{record.department}</p>
        </div>
      )
    },
    {
      key: 'email' as keyof Employee,
      title: 'Contact',
      render: (value: unknown, record: Employee) => (
        <div>
          <p className="text-xs">{record.email}</p>
          <p className="text-xs text-gray-500">{record.phone}</p>
        </div>
      )
    },
    {
      key: 'hire_date' as keyof Employee,
      title: 'Hire Date',
      render: (value: unknown, record: Employee) => {
        if (!mounted) return ''
        return new Date(record.hire_date).toLocaleDateString('id-ID')
      }
    },
    {
      key: 'total_salary' as keyof Employee,
      title: 'Total Salary',
      render: (value: unknown, record: Employee) => {
        if (!mounted) return ''
        return `Rp ${record.total_salary.toLocaleString('id-ID')}`
      }
    },
    {
      key: 'employment_status' as keyof Employee,
      title: 'Status',
      render: (value: unknown, record: Employee) => (
        <Badge className={`${statusColors[record.employment_status]} text-white`}>
          {statusLabels[record.employment_status]}
        </Badge>
      )
    }
  ]

  const breadcrumbs = [
    { label: 'HR', href: '/hr' },
    { label: 'Employees', href: '/hr/employees' }
  ]

  return (
    <TwoLevelLayout>
      <Header 
        title="Employees"
        description="Manage your company employees and their information"
        breadcrumbs={breadcrumbs}
        actions={
          <Link href="/hr/employees/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </Link>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.inactive}</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Terminated</p>
                <p className="text-3xl font-bold text-red-600">{stats.terminated}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search employees..." 
                className="pl-9"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select 
              value={filters.department || ''} 
              onValueChange={(value) => setFilters({ ...filters, department: value || undefined })}
            >
              <SelectTrigger className="w-32">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {mounted && (departments || []).map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.employment_status || ''}
              onValueChange={(value) => setFilters({ ...filters, employment_status: (value || undefined) as 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | undefined })}
            >
              <SelectTrigger className="w-32">
                <div className="h-3 w-3 bg-gray-400 rounded-full mr-2"></div>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="TERMINATED">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* View Toggle & Sort */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <SquaresFour className="h-4 w-4 mr-2" />
                Cards
              </Button>
              <Button 
                variant={viewMode === 'table' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('table')}
              >
                <List className="h-4 w-4 mr-2" />
                Table
              </Button>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44">
                <ChartBar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee_name">Name</SelectItem>
                <SelectItem value="hire_date">Hire Date</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="total_salary">Salary</SelectItem>
                <SelectItem value="employment_status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {filteredEmployees.length} of {employees.length} employees
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <UploadSimple className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm">
                <DownloadSimple className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </Card>
              ))
            ) : paginatedEmployees.length > 0 ? (
              paginatedEmployees.map(employee => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
                <p className="text-gray-500 mb-4">
                  {Object.keys(filters).length > 0 
                    ? 'Try adjusting your filters to see more results.'
                    : 'Get started by adding your first employee.'
                  }
                </p>
                {Object.keys(filters).length > 0 ? (
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Link href="/hr/employees/new">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Employee
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={paginatedEmployees}
            pagination={{
              current: page,
              pageSize: limit,
              total: filteredEmployees.length,
              onChange: (page, pageSize) => {
                setPage(page)
                setLimit(pageSize)
              }
            }}
          />
        )}
      </div>
    </TwoLevelLayout>
  )
}