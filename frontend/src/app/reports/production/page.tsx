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

interface ProductionReport {
  id: string
  reportName: string
  reportType: 'efficiency' | 'output' | 'quality' | 'downtime' | 'material_usage' | 'labor'
  category: 'performance' | 'quality_control' | 'cost_analysis' | 'planning'
  period: string
  totalUnits: number
  efficiencyRate: number
  defectRate: number
  status: 'generated' | 'processing' | 'scheduled' | 'failed'
  generatedDate: string
  generatedBy: string
  productionLine: string
}

const mockProductionReports: ProductionReport[] = [
  {
    id: '1',
    reportName: 'Production Efficiency - July 2024',
    reportType: 'efficiency',
    category: 'performance',
    period: 'July 2024',
    totalUnits: 12450,
    efficiencyRate: 87.5,
    defectRate: 2.3,
    status: 'generated',
    generatedDate: '2024-07-25',
    generatedBy: 'Production Manager',
    productionLine: 'All Lines'
  },
  {
    id: '2',
    reportName: 'Output Analysis - Week 30',
    reportType: 'output',
    category: 'performance',
    period: 'Week 30, 2024',
    totalUnits: 2890,
    efficiencyRate: 89.2,
    defectRate: 1.8,
    status: 'generated',
    generatedDate: '2024-07-24',
    generatedBy: 'Shift Supervisor',
    productionLine: 'Line A'
  },
  {
    id: '3',
    reportName: 'Quality Control Report - Q2 2024',
    reportType: 'quality',
    category: 'quality_control',
    period: 'Q2 2024',
    totalUnits: 38900,
    efficiencyRate: 85.8,
    defectRate: 2.7,
    status: 'generated',
    generatedDate: '2024-07-20',
    generatedBy: 'QC Manager',
    productionLine: 'All Lines'
  },
  {
    id: '4',
    reportName: 'Downtime Analysis - July 2024',
    reportType: 'downtime',
    category: 'performance',
    period: 'July 2024',
    totalUnits: 12450,
    efficiencyRate: 87.5,
    defectRate: 2.3,
    status: 'processing',
    generatedDate: '2024-07-25',
    generatedBy: 'Maintenance Manager',
    productionLine: 'All Lines'
  },
  {
    id: '5',
    reportName: 'Material Usage Report - July 2024',
    reportType: 'material_usage',
    category: 'cost_analysis',
    period: 'July 2024',
    totalUnits: 12450,
    efficiencyRate: 92.1,
    defectRate: 1.5,
    status: 'generated',
    generatedDate: '2024-07-23',
    generatedBy: 'Production Planner',
    productionLine: 'All Lines'
  },
  {
    id: '6',
    reportName: 'Labor Productivity - Q2 2024',
    reportType: 'labor',
    category: 'cost_analysis',
    period: 'Q2 2024',
    totalUnits: 38900,
    efficiencyRate: 86.3,
    defectRate: 2.1,
    status: 'scheduled',
    generatedDate: '2024-07-26',
    generatedBy: 'System Scheduler',
    productionLine: 'All Lines'
  },
  {
    id: '7',
    reportName: 'Line B Output - July 2024',
    reportType: 'output',
    category: 'performance',
    period: 'July 2024',
    totalUnits: 6780,
    efficiencyRate: 84.7,
    defectRate: 3.1,
    status: 'generated',
    generatedDate: '2024-07-25',
    generatedBy: 'Line Supervisor',
    productionLine: 'Line B'
  },
  {
    id: '8',
    reportName: 'Annual Production Review - 2023',
    reportType: 'efficiency',
    category: 'planning',
    period: '2023',
    totalUnits: 156780,
    efficiencyRate: 86.9,
    defectRate: 2.4,
    status: 'failed',
    generatedDate: '2024-01-15',
    generatedBy: 'Production Director',
    productionLine: 'All Lines'
  }
]

const statusColors = {
  generated: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

const typeColors = {
  efficiency: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  output: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  quality: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  downtime: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  material_usage: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  labor: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400'
}

const categoryColors = {
  performance: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  quality_control: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  cost_analysis: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  planning: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
}

export default function ProductionReportsPage() {
  const [mounted, setMounted] = useState(false)
  const [reportsData, setReportsData] = useState<ProductionReport[]>(mockProductionReports)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredData, setFilteredData] = useState<ProductionReport[]>(mockProductionReports)
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
        item.productionLine.toLowerCase().includes(searchTerm.toLowerCase())
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
      key: 'reportName' as keyof ProductionReport,
      title: 'Report Name',
      render: (value: unknown, item: ProductionReport) => (
        <div>
          <div className="font-medium max-w-64 truncate" title={item.reportName}>
            {item.reportName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{item.period}</div>
        </div>
      )
    },
    {
      key: 'reportType' as keyof ProductionReport,
      title: 'Type',
      render: (value: unknown, item: ProductionReport) => (
        <Badge className={typeColors[item.reportType]}>
          {item.reportType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </Badge>
      )
    },
    {
      key: 'category' as keyof ProductionReport,
      title: 'Category',
      render: (value: unknown, item: ProductionReport) => (
        <Badge className={categoryColors[item.category]}>
          {item.category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </Badge>
      )
    },
    {
      key: 'totalUnits' as keyof ProductionReport,
      title: 'Units',
      render: (value: unknown, item: ProductionReport) => (
        <div className="text-center font-medium">{item.totalUnits.toLocaleString()}</div>
      )
    },
    {
      key: 'efficiencyRate' as keyof ProductionReport,
      title: 'Efficiency',
      render: (value: unknown, item: ProductionReport) => (
        <div className="text-center font-medium text-green-600 dark:text-green-400">
          {item.efficiencyRate}%
        </div>
      )
    },
    {
      key: 'defectRate' as keyof ProductionReport,
      title: 'Defect Rate',
      render: (value: unknown, item: ProductionReport) => (
        <div className="text-center font-medium text-red-600 dark:text-red-400">
          {item.defectRate}%
        </div>
      )
    },
    {
      key: 'status' as keyof ProductionReport,
      title: 'Status',
      render: (value: unknown, item: ProductionReport) => (
        <Badge className={statusColors[item.status]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      )
    },
    {
      key: 'productionLine' as keyof ProductionReport,
      title: 'Production Line',
      render: (value: unknown, item: ProductionReport) => (
        <div className="text-xs">{item.productionLine}</div>
      )
    }
  ]

  const breadcrumbs = [
    { label: 'Reporting', href: '/reports' },
    { label: 'Production Reports', href: '/reports/production' }
  ]

  const typeOptions = [
    { value: 'efficiency', label: 'Efficiency' },
    { value: 'output', label: 'Output' },
    { value: 'quality', label: 'Quality' },
    { value: 'downtime', label: 'Downtime' },
    { value: 'material_usage', label: 'Material Usage' },
    { value: 'labor', label: 'Labor' }
  ]

  const categoryOptions = [
    { value: 'performance', label: 'Performance' },
    { value: 'quality_control', label: 'Quality Control' },
    { value: 'cost_analysis', label: 'Cost Analysis' },
    { value: 'planning', label: 'Planning' }
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
        title="Production Reports"
        description="Manufacturing efficiency and quality metrics"
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
                placeholder="Search by report name, period, or production line..."
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
              <p className="text-muted-foreground">Loading production reports...</p>
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