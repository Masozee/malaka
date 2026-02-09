'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DataTable } from '@/components/ui/data-table'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Search01Icon,
  ReloadIcon,
  Download01Icon,
  Cancel01Icon,
  PlusSignIcon
} from '@hugeicons/core-free-icons'

interface HRReport {
  id: string
  reportName: string
  reportType: 'attendance' | 'payroll' | 'performance' | 'leave' | 'recruitment' | 'training'
  category: 'operational' | 'compliance' | 'analytics' | 'management'
  period: string
  employeeCount: number
  totalCost: number
  status: 'generated' | 'processing' | 'scheduled' | 'failed'
  generatedDate: string
  generatedBy: string
  department: string
}

const mockHRReports: HRReport[] = [
  {
    id: '1',
    reportName: 'Monthly Attendance Report - July 2024',
    reportType: 'attendance',
    category: 'operational',
    period: 'July 2024',
    employeeCount: 245,
    totalCost: 0,
    status: 'generated',
    generatedDate: '2024-07-25',
    generatedBy: 'HR Manager',
    department: 'All Departments'
  },
  {
    id: '2',
    reportName: 'Payroll Summary - July 2024',
    reportType: 'payroll',
    category: 'compliance',
    period: 'July 2024',
    employeeCount: 245,
    totalCost: 1850000000,
    status: 'generated',
    generatedDate: '2024-07-24',
    generatedBy: 'Payroll Specialist',
    department: 'All Departments'
  },
  {
    id: '3',
    reportName: 'Performance Review - Q2 2024',
    reportType: 'performance',
    category: 'analytics',
    period: 'Q2 2024',
    employeeCount: 245,
    totalCost: 0,
    status: 'generated',
    generatedDate: '2024-07-20',
    generatedBy: 'HR Director',
    department: 'All Departments'
  },
  {
    id: '4',
    reportName: 'Leave Balance Report - July 2024',
    reportType: 'leave',
    category: 'operational',
    period: 'July 2024',
    employeeCount: 245,
    totalCost: 0,
    status: 'processing',
    generatedDate: '2024-07-25',
    generatedBy: 'HR Coordinator',
    department: 'All Departments'
  },
  {
    id: '5',
    reportName: 'Recruitment Analytics - H1 2024',
    reportType: 'recruitment',
    category: 'analytics',
    period: 'H1 2024',
    employeeCount: 45,
    totalCost: 125000000,
    status: 'generated',
    generatedDate: '2024-07-18',
    generatedBy: 'Recruitment Manager',
    department: 'HR'
  },
  {
    id: '6',
    reportName: 'Training & Development - Q2 2024',
    reportType: 'training',
    category: 'management',
    period: 'Q2 2024',
    employeeCount: 178,
    totalCost: 89000000,
    status: 'scheduled',
    generatedDate: '2024-07-26',
    generatedBy: 'System Scheduler',
    department: 'All Departments'
  },
  {
    id: '7',
    reportName: 'Production Team Attendance - July 2024',
    reportType: 'attendance',
    category: 'operational',
    period: 'July 2024',
    employeeCount: 156,
    totalCost: 0,
    status: 'generated',
    generatedDate: '2024-07-25',
    generatedBy: 'Production Manager',
    department: 'Production'
  },
  {
    id: '8',
    reportName: 'Annual Performance Review - 2023',
    reportType: 'performance',
    category: 'compliance',
    period: '2023',
    employeeCount: 234,
    totalCost: 0,
    status: 'failed',
    generatedDate: '2024-01-15',
    generatedBy: 'HR Director',
    department: 'All Departments'
  }
]

const statusColors = {
  generated: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

const typeColors = {
  attendance: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  payroll: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  performance: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  leave: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  recruitment: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
  training: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400'
}

const categoryColors = {
  operational: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  compliance: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  analytics: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  management: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
}

export default function HRReportsPage() {
  const [mounted, setMounted] = useState(false)
  const [reportsData, setReportsData] = useState<HRReport[]>(mockHRReports)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredData, setFilteredData] = useState<HRReport[]>(mockHRReports)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let filtered = reportsData

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.reportType === selectedType)
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory)
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus)
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchTerm, selectedType, selectedCategory, selectedStatus, reportsData])

  const totalItems = filteredData.length
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filteredData.slice(startIndex, endIndex)

  const handlePageChange = (page: number, newPageSize: number) => {
    setCurrentPage(page)
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize)
      setCurrentPage(1)
    }
  }

  const columns = [
    {
      key: 'reportName' as keyof HRReport,
      title: 'Report Name',
      render: (value: unknown, item: HRReport) => (
        <div>
          <div className="font-medium max-w-64 truncate" title={item.reportName}>
            {item.reportName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{item.period}</div>
        </div>
      )
    },
    {
      key: 'reportType' as keyof HRReport,
      title: 'Type',
      render: (value: unknown, item: HRReport) => (
        <Badge className={typeColors[item.reportType]}>
          {item.reportType.charAt(0).toUpperCase() + item.reportType.slice(1)}
        </Badge>
      )
    },
    {
      key: 'category' as keyof HRReport,
      title: 'Category',
      render: (value: unknown, item: HRReport) => (
        <Badge className={categoryColors[item.category]}>
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </Badge>
      )
    },
    {
      key: 'employeeCount' as keyof HRReport,
      title: 'Employees',
      render: (value: unknown, item: HRReport) => (
        <div className="text-center font-medium">{item.employeeCount}</div>
      )
    },
    {
      key: 'totalCost' as keyof HRReport,
      title: 'Total Cost',
      render: (value: unknown, item: HRReport) => (
        <div className="text-xs font-medium">
          {mounted && item.totalCost > 0 ? item.totalCost.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : '-'}
        </div>
      )
    },
    {
      key: 'status' as keyof HRReport,
      title: 'Status',
      render: (value: unknown, item: HRReport) => (
        <Badge className={statusColors[item.status]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      )
    },
    {
      key: 'department' as keyof HRReport,
      title: 'Department',
      render: (value: unknown, item: HRReport) => (
        <div className="text-xs">{item.department}</div>
      )
    },
    {
      key: 'generatedBy' as keyof HRReport,
      title: 'Generated By',
      render: (value: unknown, item: HRReport) => (
        <div className="text-xs">{item.generatedBy}</div>
      )
    }
  ]

  const breadcrumbs = [
    { label: 'Reporting', href: '/reports' },
    { label: 'HR Reports', href: '/reports/hr' }
  ]

  const typeOptions = [
    { value: 'attendance', label: 'Attendance' },
    { value: 'payroll', label: 'Payroll' },
    { value: 'performance', label: 'Performance' },
    { value: 'leave', label: 'Leave' },
    { value: 'recruitment', label: 'Recruitment' },
    { value: 'training', label: 'Training' }
  ]

  const categoryOptions = [
    { value: 'operational', label: 'Operational' },
    { value: 'compliance', label: 'Compliance' },
    { value: 'analytics', label: 'Analytics' },
    { value: 'management', label: 'Management' }
  ]

  const statusOptions = [
    { value: 'generated', label: 'Generated' },
    { value: 'processing', label: 'Processing' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'failed', label: 'Failed' }
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="HR Reports"
        description="Employee performance, attendance, and payroll analytics"
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setLoading(!loading)}>
              <HugeiconsIcon icon={ReloadIcon} className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button size="sm">
              <HugeiconsIcon icon={PlusSignIcon} className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by report name, period, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {typeOptions.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {statusOptions.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchTerm || selectedType !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedType('all')
                  setSelectedCategory('all')
                  setSelectedStatus('all')
                }}
              >
                <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}

            <Select>
              <SelectTrigger className="w-36">
                <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">Export as PDF</SelectItem>
                <SelectItem value="excel">Export as Excel</SelectItem>
                <SelectItem value="csv">Export as CSV</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading HR reports...</p>
            </div>
          </div>
        ) : (
          <DataTable
            data={paginatedData}
            columns={columns}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalItems,
              onChange: handlePageChange
            }}
          />
        )}
      </div>
    </TwoLevelLayout>
  )
}