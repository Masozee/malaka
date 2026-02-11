'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
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

interface SalesReport {
  id: string
  reportName: string
  reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
  category: 'revenue' | 'volume' | 'customer' | 'product' | 'channel' | 'regional'
  period: string
  totalRevenue: number
  totalOrders: number
  avgOrderValue: number
  customersCount: number
  status: 'generated' | 'processing' | 'scheduled' | 'failed'
  generatedDate: string
  generatedBy: string
  description: string
  formats: string[]
}

// Mock sales reports data
const mockSalesReports: SalesReport[] = [
  {
    id: '1',
    reportName: 'Monthly Sales Performance - July 2024',
    reportType: 'monthly',
    category: 'revenue',
    period: 'July 2024',
    totalRevenue: 125000000,
    totalOrders: 1547,
    avgOrderValue: 80800,
    customersCount: 1234,
    status: 'generated',
    generatedDate: '2024-07-25',
    generatedBy: 'Sales Manager',
    description: 'Comprehensive monthly sales analysis including revenue, orders, and customer metrics',
    formats: ['PDF', 'Excel', 'CSV']
  },
  {
    id: '2',
    reportName: 'Product Category Analysis - Q2 2024',
    reportType: 'quarterly',
    category: 'product',
    period: 'Q2 2024',
    totalRevenue: 348000000,
    totalOrders: 4892,
    avgOrderValue: 71100,
    customersCount: 2890,
    status: 'generated',
    generatedDate: '2024-07-20',
    generatedBy: 'Product Manager',
    description: 'Quarterly analysis of product performance by categories and models',
    formats: ['PDF', 'Excel', 'PowerPoint']
  },
  {
    id: '3',
    reportName: 'Customer Acquisition Report - June 2024',
    reportType: 'monthly',
    category: 'customer',
    period: 'June 2024',
    totalRevenue: 98500000,
    totalOrders: 1234,
    avgOrderValue: 79900,
    customersCount: 456,
    status: 'generated',
    generatedDate: '2024-07-18',
    generatedBy: 'Marketing Director',
    description: 'New customer acquisition analysis and retention metrics',
    formats: ['PDF', 'Excel']
  },
  {
    id: '4',
    reportName: 'Weekly Sales Trend - Week 30',
    reportType: 'weekly',
    category: 'revenue',
    period: 'Week 30, 2024',
    totalRevenue: 28500000,
    totalOrders: 378,
    avgOrderValue: 75400,
    customersCount: 289,
    status: 'processing',
    generatedDate: '2024-07-25',
    generatedBy: 'Data Analyst',
    description: 'Weekly sales performance tracking and trend analysis',
    formats: ['PDF', 'Excel']
  },
  {
    id: '5',
    reportName: 'Regional Sales Distribution - H1 2024',
    reportType: 'custom',
    category: 'regional',
    period: 'H1 2024',
    totalRevenue: 650000000,
    totalOrders: 8967,
    avgOrderValue: 72500,
    customersCount: 5234,
    status: 'generated',
    generatedDate: '2024-07-15',
    generatedBy: 'Regional Manager',
    description: 'Half-yearly regional sales performance and market penetration analysis',
    formats: ['PDF', 'Excel', 'PowerPoint', 'Interactive']
  },
  {
    id: '6',
    reportName: 'Sales Channel Performance - July 2024',
    reportType: 'monthly',
    category: 'channel',
    period: 'July 2024',
    totalRevenue: 125000000,
    totalOrders: 1547,
    avgOrderValue: 80800,
    customersCount: 1234,
    status: 'scheduled',
    generatedDate: '2024-07-26',
    generatedBy: 'System Scheduler',
    description: 'Monthly performance comparison across online, retail, and wholesale channels',
    formats: ['PDF', 'Excel']
  },
  {
    id: '7',
    reportName: 'Daily Sales Flash Report - July 25',
    reportType: 'daily',
    category: 'revenue',
    period: 'July 25, 2024',
    totalRevenue: 4200000,
    totalOrders: 67,
    avgOrderValue: 62700,
    customersCount: 58,
    status: 'generated',
    generatedDate: '2024-07-25',
    generatedBy: 'Auto System',
    description: 'Daily sales summary and key performance indicators',
    formats: ['PDF', 'Email']
  },
  {
    id: '8',
    reportName: 'Annual Sales Review - 2023',
    reportType: 'yearly',
    category: 'revenue',
    period: '2023',
    totalRevenue: 1456000000,
    totalOrders: 18734,
    avgOrderValue: 77700,
    customersCount: 12456,
    status: 'failed',
    generatedDate: '2024-07-10',
    generatedBy: 'Finance Director',
    description: 'Comprehensive annual sales review and business performance analysis',
    formats: ['PDF', 'Excel', 'PowerPoint']
  }
]

// Status and category color mappings
const statusColors = {
  generated: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

const categoryColors = {
  revenue: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  volume: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  customer: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  product: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  channel: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400',
  regional: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
}

const typeColors = {
  daily: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
  weekly: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  monthly: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  quarterly: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  yearly: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  custom: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400'
}

export default function SalesReportsPage() {
  const [mounted, setMounted] = useState(false)
  const [reportsData, setReportsData] = useState<SalesReport[]>(mockSalesReports)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredData, setFilteredData] = useState<SalesReport[]>(mockSalesReports)
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
        item.generatedBy.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Pagination logic
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
      key: 'reportName' as keyof SalesReport,
      title: 'Report Name',
      render: (value: unknown, item: SalesReport) => (
        <div>
          <div className="font-medium max-w-64 truncate" title={item.reportName}>
            {item.reportName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{item.period}</div>
        </div>
      )
    },
    {
      key: 'reportType' as keyof SalesReport,
      title: 'Type',
      render: (value: unknown, item: SalesReport) => (
        <Badge className={typeColors[item.reportType]}>
          {item.reportType.charAt(0).toUpperCase() + item.reportType.slice(1)}
        </Badge>
      )
    },
    {
      key: 'category' as keyof SalesReport,
      title: 'Category',
      render: (value: unknown, item: SalesReport) => (
        <Badge className={categoryColors[item.category]}>
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </Badge>
      )
    },
    {
      key: 'totalRevenue' as keyof SalesReport,
      title: 'Revenue',
      render: (value: unknown, item: SalesReport) => (
        <div className="text-xs font-medium">
          {mounted ? item.totalRevenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    },
    {
      key: 'totalOrders' as keyof SalesReport,
      title: 'Orders',
      render: (value: unknown, item: SalesReport) => (
        <div className="text-center font-medium">{item.totalOrders}</div>
      )
    },
    {
      key: 'status' as keyof SalesReport,
      title: 'Status',
      render: (value: unknown, item: SalesReport) => (
        <Badge className={statusColors[item.status]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      )
    },
    {
      key: 'generatedDate' as keyof SalesReport,
      title: 'Generated',
      render: (value: unknown, item: SalesReport) => (
        <div className="text-xs">
          {mounted ? new Date(item.generatedDate).toLocaleDateString('id-ID') : ''}
        </div>
      )
    },
    {
      key: 'generatedBy' as keyof SalesReport,
      title: 'Generated By',
      render: (value: unknown, item: SalesReport) => (
        <div className="text-xs">{item.generatedBy}</div>
      )
    }
  ]

  const breadcrumbs = [
    { label: 'Reporting', href: '/reports' },
    { label: 'Sales Reports', href: '/reports/sales' }
  ]

  const typeOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom' }
  ]

  const categoryOptions = [
    { value: 'revenue', label: 'Revenue' },
    { value: 'volume', label: 'Volume' },
    { value: 'customer', label: 'Customer' },
    { value: 'product', label: 'Product' },
    { value: 'channel', label: 'Channel' },
    { value: 'regional', label: 'Regional' }
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
        title="Sales Reports"
        description="Revenue, orders, and customer analytics"
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
        {/* Filters and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by report name, period, or creator..."
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

        {/* Sales Reports Data Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12" role="status" aria-live="polite">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" aria-hidden="true"></div>
              <p className="text-muted-foreground">Loading sales reports...</p>
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