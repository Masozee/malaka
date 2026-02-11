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

interface FinancialReport {
  id: string
  reportName: string
  reportType: 'profit_loss' | 'balance_sheet' | 'cash_flow' | 'trial_balance' | 'general_ledger' | 'budget_variance'
  category: 'income_statement' | 'balance_sheet' | 'cash_flow' | 'management' | 'statutory'
  period: string
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  status: 'generated' | 'processing' | 'scheduled' | 'failed'
  generatedDate: string
  generatedBy: string
  fiscalYear: string
}

const mockFinancialReports: FinancialReport[] = [
  {
    id: '1',
    reportName: 'Profit & Loss Statement - July 2024',
    reportType: 'profit_loss',
    category: 'income_statement',
    period: 'July 2024',
    totalRevenue: 2400000000,
    totalExpenses: 1800000000,
    netProfit: 600000000,
    status: 'generated',
    generatedDate: '2024-07-25',
    generatedBy: 'Finance Manager',
    fiscalYear: 'FY 2024'
  },
  {
    id: '2',
    reportName: 'Balance Sheet - Q2 2024',
    reportType: 'balance_sheet',
    category: 'balance_sheet',
    period: 'Q2 2024',
    totalRevenue: 7200000000,
    totalExpenses: 5400000000,
    netProfit: 1800000000,
    status: 'generated',
    generatedDate: '2024-07-20',
    generatedBy: 'CFO',
    fiscalYear: 'FY 2024'
  },
  {
    id: '3',
    reportName: 'Cash Flow Statement - H1 2024',
    reportType: 'cash_flow',
    category: 'cash_flow',
    period: 'H1 2024',
    totalRevenue: 14400000000,
    totalExpenses: 10800000000,
    netProfit: 3600000000,
    status: 'generated',
    generatedDate: '2024-07-18',
    generatedBy: 'Finance Director',
    fiscalYear: 'FY 2024'
  },
  {
    id: '4',
    reportName: 'Trial Balance - July 2024',
    reportType: 'trial_balance',
    category: 'management',
    period: 'July 2024',
    totalRevenue: 2400000000,
    totalExpenses: 1800000000,
    netProfit: 600000000,
    status: 'processing',
    generatedDate: '2024-07-25',
    generatedBy: 'Accountant',
    fiscalYear: 'FY 2024'
  },
  {
    id: '5',
    reportName: 'General Ledger Report - July 2024',
    reportType: 'general_ledger',
    category: 'management',
    period: 'July 2024',
    totalRevenue: 2400000000,
    totalExpenses: 1800000000,
    netProfit: 600000000,
    status: 'generated',
    generatedDate: '2024-07-24',
    generatedBy: 'Senior Accountant',
    fiscalYear: 'FY 2024'
  },
  {
    id: '6',
    reportName: 'Budget vs Actual - Q2 2024',
    reportType: 'budget_variance',
    category: 'management',
    period: 'Q2 2024',
    totalRevenue: 7200000000,
    totalExpenses: 5400000000,
    netProfit: 1800000000,
    status: 'scheduled',
    generatedDate: '2024-07-26',
    generatedBy: 'System Scheduler',
    fiscalYear: 'FY 2024'
  },
  {
    id: '7',
    reportName: 'Annual Financial Statement - 2023',
    reportType: 'profit_loss',
    category: 'statutory',
    period: '2023',
    totalRevenue: 28800000000,
    totalExpenses: 21600000000,
    netProfit: 7200000000,
    status: 'generated',
    generatedDate: '2024-01-15',
    generatedBy: 'CFO',
    fiscalYear: 'FY 2023'
  },
  {
    id: '8',
    reportName: 'Monthly P&L - June 2024',
    reportType: 'profit_loss',
    category: 'income_statement',
    period: 'June 2024',
    totalRevenue: 2200000000,
    totalExpenses: 1700000000,
    netProfit: 500000000,
    status: 'failed',
    generatedDate: '2024-07-10',
    generatedBy: 'Finance Manager',
    fiscalYear: 'FY 2024'
  }
]

const statusColors = {
  generated: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

const typeColors = {
  profit_loss: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  balance_sheet: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  cash_flow: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  trial_balance: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  general_ledger: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
  budget_variance: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400'
}

const categoryColors = {
  income_statement: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  balance_sheet: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  cash_flow: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  management: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  statutory: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

export default function FinancialReportsPage() {
  const [mounted, setMounted] = useState(false)
  const [reportsData, setReportsData] = useState<FinancialReport[]>(mockFinancialReports)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredData, setFilteredData] = useState<FinancialReport[]>(mockFinancialReports)
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
        item.fiscalYear.toLowerCase().includes(searchTerm.toLowerCase())
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
      key: 'reportName' as keyof FinancialReport,
      title: 'Report Name',
      render: (value: unknown, item: FinancialReport) => (
        <div>
          <div className="font-medium max-w-64 truncate" title={item.reportName}>
            {item.reportName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{item.period}</div>
        </div>
      )
    },
    {
      key: 'reportType' as keyof FinancialReport,
      title: 'Type',
      render: (value: unknown, item: FinancialReport) => (
        <Badge className={typeColors[item.reportType]}>
          {item.reportType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </Badge>
      )
    },
    {
      key: 'category' as keyof FinancialReport,
      title: 'Category',
      render: (value: unknown, item: FinancialReport) => (
        <Badge className={categoryColors[item.category]}>
          {item.category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </Badge>
      )
    },
    {
      key: 'totalRevenue' as keyof FinancialReport,
      title: 'Revenue',
      render: (value: unknown, item: FinancialReport) => (
        <div className="text-xs font-medium">
          {mounted ? item.totalRevenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    },
    {
      key: 'netProfit' as keyof FinancialReport,
      title: 'Net Profit',
      render: (value: unknown, item: FinancialReport) => (
        <div className="text-xs font-medium text-green-600 dark:text-green-400">
          {mounted ? item.netProfit.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    },
    {
      key: 'status' as keyof FinancialReport,
      title: 'Status',
      render: (value: unknown, item: FinancialReport) => (
        <Badge className={statusColors[item.status]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      )
    },
    {
      key: 'fiscalYear' as keyof FinancialReport,
      title: 'Fiscal Year',
      render: (value: unknown, item: FinancialReport) => (
        <div className="text-xs">{item.fiscalYear}</div>
      )
    },
    {
      key: 'generatedBy' as keyof FinancialReport,
      title: 'Generated By',
      render: (value: unknown, item: FinancialReport) => (
        <div className="text-xs">{item.generatedBy}</div>
      )
    }
  ]

  const breadcrumbs = [
    { label: 'Reporting', href: '/reports' },
    { label: 'Financial Reports', href: '/reports/financial' }
  ]

  const typeOptions = [
    { value: 'profit_loss', label: 'P&L' },
    { value: 'balance_sheet', label: 'Balance Sheet' },
    { value: 'cash_flow', label: 'Cash Flow' },
    { value: 'trial_balance', label: 'Trial Balance' },
    { value: 'general_ledger', label: 'General Ledger' },
    { value: 'budget_variance', label: 'Budget Variance' }
  ]

  const categoryOptions = [
    { value: 'income_statement', label: 'Income Statement' },
    { value: 'balance_sheet', label: 'Balance Sheet' },
    { value: 'cash_flow', label: 'Cash Flow' },
    { value: 'management', label: 'Management' },
    { value: 'statutory', label: 'Statutory' }
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
        title="Financial Reports"
        description="P&L, balance sheet, and financial analytics"
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
                placeholder="Search by report name, period, or fiscal year..."
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
              <SelectTrigger className="w-36" aria-label="Export format">
                <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 mr-2" aria-hidden="true" />
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
          <div className="flex justify-center items-center py-12" role="status" aria-live="polite">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" aria-hidden="true"></div>
              <p className="text-muted-foreground">Loading financial reports...</p>
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