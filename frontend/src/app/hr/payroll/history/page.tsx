'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  Eye
} from 'lucide-react'
import type { PayrollPeriod, PayrollItem } from '@/types/hr'
import { HRService } from '@/services/hr'
import { formatCurrency, formatDate, formatPeriod } from '@/lib/payroll-utils'

export default function PayrollHistoryPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string>('2024')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([])
  const [payrollItems, setPayrollItems] = useState<PayrollItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'periods' | 'employees'>('periods')

  useEffect(() => {
    setMounted(true)
    
    const fetchData = async () => {
      try {
        setLoading(true)
        const [periodsResponse, itemsResponse] = await Promise.all([
          HRService.getPayrollPeriods(),
          HRService.getPayrollItems({ year: parseInt(selectedYear), month: 10 })
        ])
        setPayrollPeriods(periodsResponse.data)
        setPayrollItems(itemsResponse.data)
      } catch (error) {
        console.error('Error fetching payroll data:', error)
        setPayrollPeriods([])
        setPayrollItems([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedYear])

  const breadcrumbs = [
    { label: 'Human Resources', href: '/hr' },
    { label: 'Payroll', href: '/hr/payroll' },
    { label: 'History', href: '/hr/payroll/history' }
  ]

  const filteredPeriods = payrollPeriods.filter(period => {
    if (selectedYear === 'all') return true
    return period?.year?.toString() === selectedYear
  })

  const filteredPayrollItems = payrollItems.filter(item => {
    if (selectedDepartment !== 'all' && item?.employee?.department !== selectedDepartment) return false
    if (searchTerm && !item?.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const departments = Array.from(new Set(payrollItems.map(item => item?.employee?.department).filter(Boolean)))
  const years = Array.from(new Set(payrollPeriods.map(period => period?.year?.toString()).filter(Boolean)))

  const getStatusBadge = (status: PayrollPeriod['status']) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      processing: { variant: 'default' as const, label: 'Processing' },
      completed: { variant: 'default' as const, label: 'Completed' },
      locked: { variant: 'outline' as const, label: 'Locked' }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status }
  }

  const getPayrollItemStatusBadge = (status: PayrollItem['status']) => {
    const statusConfig = {
      draft: { variant: 'secondary' as const, label: 'Draft' },
      calculated: { variant: 'default' as const, label: 'Calculated' },
      approved: { variant: 'default' as const, label: 'Approved' },
      paid: { variant: 'outline' as const, label: 'Paid' }
    }
    return statusConfig[status] || { variant: 'secondary' as const, label: status }
  }

  // Summary statistics
  const summaryStats = {
    totalPeriods: filteredPeriods.length,
    completedPeriods: filteredPeriods.filter(p => p?.status === 'completed').length,
    totalPayroll: filteredPeriods.reduce((sum, period) => sum + (period?.totalNetPay || 0), 0),
    averagePayroll: filteredPeriods.length > 0 ? 
      filteredPeriods.reduce((sum, period) => sum + (period?.totalNetPay || 0), 0) / filteredPeriods.length : 0
  }

  const periodColumns = [
    { 
      key: 'period' as keyof PayrollPeriod, 
      title: 'Period', 
      render: (period: PayrollPeriod) => (
        <div>
          <div className="font-medium">
            {formatPeriod(period?.month, period?.year, mounted)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatDate(period?.startDate, mounted)} - {formatDate(period?.endDate, mounted)}
          </div>
        </div>
      )
    },
    { 
      key: 'status' as keyof PayrollPeriod, 
      title: 'Status',
      render: (period: PayrollPeriod) => {
        if (!period?.status) return ''
        const { variant, label } = getStatusBadge(period.status)
        return <Badge variant={variant}>{label}</Badge>
      }
    },
    { 
      key: 'totalEmployees' as keyof PayrollPeriod, 
      title: 'Employees',
      render: (period: PayrollPeriod) => (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{period?.totalEmployees || 0}</span>
        </div>
      )
    },
    { 
      key: 'totalGrossPay' as keyof PayrollPeriod, 
      title: 'Gross Pay',
      render: (period: PayrollPeriod) => formatCurrency(period?.totalGrossPay, mounted)
    },
    { 
      key: 'totalDeductions' as keyof PayrollPeriod, 
      title: 'Deductions',
      render: (period: PayrollPeriod) => formatCurrency(period?.totalDeductions, mounted)
    },
    { 
      key: 'totalNetPay' as keyof PayrollPeriod, 
      title: 'Net Pay',
      render: (period: PayrollPeriod) => (
        <div className="font-semibold text-green-600">
          {formatCurrency(period?.totalNetPay, mounted)}
        </div>
      )
    },
    { 
      key: 'processedAt' as keyof PayrollPeriod, 
      title: 'Processed',
      render: (period: PayrollPeriod) => formatDate(period?.processedAt, mounted) || '-'
    },
    {
      key: 'actions' as keyof PayrollPeriod,
      title: 'Actions',
      render: (period: PayrollPeriod) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const employeeColumns = [
    {
      key: 'employee' as keyof PayrollItem,
      title: 'Employee',
      render: (item: PayrollItem) => (
        <div>
          <div className="font-medium">{item?.employee?.name || ''}</div>
          <div className="text-sm text-muted-foreground">{item?.employee?.employeeId || ''} • {item?.employee?.department || ''}</div>
        </div>
      )
    },
    {
      key: 'position' as keyof PayrollItem,
      title: 'Position',
      render: (item: PayrollItem) => item?.employee?.position || ''
    },
    {
      key: 'basicSalary' as keyof PayrollItem,
      title: 'Basic Salary',
      render: (item: PayrollItem) => formatCurrency(item?.basicSalary, mounted)
    },
    {
      key: 'grossPay' as keyof PayrollItem,
      title: 'Gross Pay',
      render: (item: PayrollItem) => formatCurrency(item?.grossPay, mounted)
    },
    {
      key: 'netPay' as keyof PayrollItem,
      title: 'Net Pay',
      render: (item: PayrollItem) => (
        <div className="font-semibold text-green-600">
          {formatCurrency(item?.netPay, mounted)}
        </div>
      )
    },
    {
      key: 'status' as keyof PayrollItem,
      title: 'Status',
      render: (item: PayrollItem) => {
        if (!item?.status) return ''
        const { variant, label } = getPayrollItemStatusBadge(item.status)
        return <Badge variant={variant}>{label}</Badge>
      }
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Payroll History & Reports"
          description="View historical payroll data and generate reports"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Date Range
              </Button>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
              <Button size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          }
        />

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Periods</p>
                <p className="text-2xl font-bold mt-1">{summaryStats.totalPeriods}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {summaryStats.completedPeriods} completed
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payroll</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${summaryStats.totalPayroll.toLocaleString('id-ID')}` : ''}
                </p>
                <p className="text-sm text-green-600 mt-1">+8.2% vs last year</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Payroll</p>
                <p className="text-2xl font-bold mt-1">
                  {mounted ? `Rp ${summaryStats.averagePayroll.toLocaleString('id-ID')}` : ''}
                </p>
                <p className="text-sm text-blue-600 mt-1">Per period</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Employees</p>
                <p className="text-2xl font-bold mt-1">{departments.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Departments</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center space-x-4 flex-1">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex-1">
                <Label htmlFor="search">Search Employee</Label>
                <Input
                  id="search"
                  placeholder="Search by employee name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'periods' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('periods')}
          >
            Payroll Periods
          </Button>
          <Button
            variant={activeTab === 'employees' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('employees')}
          >
            Employee Payroll
          </Button>
        </div>

        {/* Data Tables */}
        {activeTab === 'periods' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Payroll Periods History</h2>
            <AdvancedDataTable
              data={filteredPeriods}
              columns={periodColumns}
              searchable={false}
              filterable={false}
              pagination={{
                pageSize: 10,
                currentPage: 1,
                totalPages: Math.ceil(filteredPeriods.length / 10),
                totalItems: filteredPeriods.length,
                onChange: () => {}
              }}
            />
          </div>
        )}

        {activeTab === 'employees' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Employee Payroll History</h2>
            <AdvancedDataTable
              data={filteredPayrollItems}
              columns={employeeColumns}
              searchable={false}
              filterable={false}
              pagination={{
                pageSize: 10,
                currentPage: 1,
                totalPages: Math.ceil(filteredPayrollItems.length / 10),
                totalItems: filteredPayrollItems.length,
                onChange: () => {}
              }}
            />
          </div>
        )}
      </div>
    </TwoLevelLayout>
  )
}