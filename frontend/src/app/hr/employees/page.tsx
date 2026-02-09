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
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon, Search01Icon, UserGroupIcon } from '@hugeicons/core-free-icons'

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
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [filters, setFilters] = useState<FilterType>({})
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)
  const [departments, setDepartments] = useState<string[]>([])

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
        breadcrumbs={breadcrumbs}
        actions={
          <Link href="/hr/employees/new">
            <Button size="sm">
              <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
              Add Employee
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <HugeiconsIcon icon={UserGroupIcon} className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">{stats.inactive}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center">
                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Terminated</p>
                <p className="text-2xl font-bold">{stats.terminated}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search employees..."
                className="pl-10"
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
              <SelectTrigger className="w-40">
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
              <SelectTrigger className="w-36">
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

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
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
          <span className="text-sm text-muted-foreground">
            Showing {filteredEmployees.length} employees
          </span>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
          </div>
        ) : viewMode === 'grid' ? (
          paginatedEmployees.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedEmployees.map(employee => (
                <EmployeeCard key={employee.id} employee={employee} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No employees found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {Object.keys(filters).length > 0
                  ? 'Try adjusting your filters to see more results.'
                  : 'Get started by adding your first employee.'
                }
              </p>
              {Object.keys(filters).length > 0 ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Link href="/hr/employees/new">
                  <Button size="sm">Add Employee</Button>
                </Link>
              )}
            </div>
          )
        ) : (
          <DataTable
            columns={columns}
            data={paginatedEmployees}
            pagination={{
              current: page,
              pageSize: limit,
              total: filteredEmployees.length,
              onChange: (p, ps) => {
                setPage(p)
                setLimit(ps)
              }
            }}
          />
        )}
      </div>
    </TwoLevelLayout>
  )
}