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

interface InventoryReport {
  id: string
  reportName: string
  reportType: 'stock_level' | 'movement' | 'valuation' | 'turnover' | 'aging' | 'reorder'
  category: 'finished_goods' | 'raw_materials' | 'wip' | 'packaging' | 'all'
  period: string
  totalItems: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  status: 'generated' | 'processing' | 'scheduled' | 'failed'
  generatedDate: string
  generatedBy: string
  warehouse: string
}

const mockInventoryReports: InventoryReport[] = [
  {
    id: '1',
    reportName: 'Stock Level Summary - July 2024',
    reportType: 'stock_level',
    category: 'all',
    period: 'July 2024',
    totalItems: 1245,
    totalValue: 487000000,
    lowStockItems: 23,
    outOfStockItems: 5,
    status: 'generated',
    generatedDate: '2024-07-25',
    generatedBy: 'Warehouse Manager',
    warehouse: 'Main Warehouse'
  },
  {
    id: '2',
    reportName: 'Inventory Movement Report - Week 30',
    reportType: 'movement',
    category: 'finished_goods',
    period: 'Week 30, 2024',
    totalItems: 456,
    totalValue: 189000000,
    lowStockItems: 12,
    outOfStockItems: 2,
    status: 'generated',
    generatedDate: '2024-07-24',
    generatedBy: 'Stock Controller',
    warehouse: 'Main Warehouse'
  },
  {
    id: '3',
    reportName: 'Inventory Valuation - Q2 2024',
    reportType: 'valuation',
    category: 'all',
    period: 'Q2 2024',
    totalItems: 1567,
    totalValue: 623000000,
    lowStockItems: 34,
    outOfStockItems: 8,
    status: 'generated',
    generatedDate: '2024-07-20',
    generatedBy: 'Finance Manager',
    warehouse: 'All Warehouses'
  },
  {
    id: '4',
    reportName: 'Stock Turnover Analysis - H1 2024',
    reportType: 'turnover',
    category: 'finished_goods',
    period: 'H1 2024',
    totalItems: 892,
    totalValue: 356000000,
    lowStockItems: 18,
    outOfStockItems: 4,
    status: 'processing',
    generatedDate: '2024-07-25',
    generatedBy: 'Inventory Analyst',
    warehouse: 'Main Warehouse'
  },
  {
    id: '5',
    reportName: 'Raw Materials Aging Report - July 2024',
    reportType: 'aging',
    category: 'raw_materials',
    period: 'July 2024',
    totalItems: 234,
    totalValue: 98000000,
    lowStockItems: 8,
    outOfStockItems: 1,
    status: 'generated',
    generatedDate: '2024-07-23',
    generatedBy: 'Procurement Manager',
    warehouse: 'Raw Materials Store'
  },
  {
    id: '6',
    reportName: 'Reorder Point Analysis - July 2024',
    reportType: 'reorder',
    category: 'all',
    period: 'July 2024',
    totalItems: 1245,
    totalValue: 487000000,
    lowStockItems: 23,
    outOfStockItems: 5,
    status: 'scheduled',
    generatedDate: '2024-07-26',
    generatedBy: 'System Scheduler',
    warehouse: 'All Warehouses'
  },
  {
    id: '7',
    reportName: 'WIP Inventory Status - July 2024',
    reportType: 'stock_level',
    category: 'wip',
    period: 'July 2024',
    totalItems: 178,
    totalValue: 67000000,
    lowStockItems: 5,
    outOfStockItems: 0,
    status: 'generated',
    generatedDate: '2024-07-25',
    generatedBy: 'Production Manager',
    warehouse: 'Production Floor'
  },
  {
    id: '8',
    reportName: 'Packaging Materials Report - July 2024',
    reportType: 'stock_level',
    category: 'packaging',
    period: 'July 2024',
    totalItems: 89,
    totalValue: 23000000,
    lowStockItems: 4,
    outOfStockItems: 1,
    status: 'failed',
    generatedDate: '2024-07-24',
    generatedBy: 'Packaging Supervisor',
    warehouse: 'Packaging Store'
  }
]

const statusColors = {
  generated: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

const typeColors = {
  stock_level: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  movement: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  valuation: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  turnover: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  aging: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
  reorder: 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400'
}

const categoryColors = {
  finished_goods: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  raw_materials: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  wip: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  packaging: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  all: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
}

export default function InventoryReportsPage() {
  const [mounted, setMounted] = useState(false)
  const [reportsData, setReportsData] = useState<InventoryReport[]>(mockInventoryReports)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredData, setFilteredData] = useState<InventoryReport[]>(mockInventoryReports)
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
        item.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
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
      key: 'reportName' as keyof InventoryReport,
      title: 'Report Name',
      render: (value: unknown, item: InventoryReport) => (
        <div>
          <div className="font-medium max-w-64 truncate" title={item.reportName}>
            {item.reportName}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{item.period}</div>
        </div>
      )
    },
    {
      key: 'reportType' as keyof InventoryReport,
      title: 'Type',
      render: (value: unknown, item: InventoryReport) => (
        <Badge className={typeColors[item.reportType]}>
          {item.reportType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </Badge>
      )
    },
    {
      key: 'category' as keyof InventoryReport,
      title: 'Category',
      render: (value: unknown, item: InventoryReport) => (
        <Badge className={categoryColors[item.category]}>
          {item.category.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </Badge>
      )
    },
    {
      key: 'totalItems' as keyof InventoryReport,
      title: 'Items',
      render: (value: unknown, item: InventoryReport) => (
        <div className="text-center font-medium">{item.totalItems}</div>
      )
    },
    {
      key: 'totalValue' as keyof InventoryReport,
      title: 'Total Value',
      render: (value: unknown, item: InventoryReport) => (
        <div className="text-xs font-medium">
          {mounted ? item.totalValue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    },
    {
      key: 'lowStockItems' as keyof InventoryReport,
      title: 'Low Stock',
      render: (value: unknown, item: InventoryReport) => (
        <div className="text-center text-yellow-600 dark:text-yellow-400 font-medium">{item.lowStockItems}</div>
      )
    },
    {
      key: 'status' as keyof InventoryReport,
      title: 'Status',
      render: (value: unknown, item: InventoryReport) => (
        <Badge className={statusColors[item.status]}>
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </Badge>
      )
    },
    {
      key: 'warehouse' as keyof InventoryReport,
      title: 'Warehouse',
      render: (value: unknown, item: InventoryReport) => (
        <div className="text-xs">{item.warehouse}</div>
      )
    }
  ]

  const breadcrumbs = [
    { label: 'Reporting', href: '/reports' },
    { label: 'Inventory Reports', href: '/reports/inventory' }
  ]

  const typeOptions = [
    { value: 'stock_level', label: 'Stock Level' },
    { value: 'movement', label: 'Movement' },
    { value: 'valuation', label: 'Valuation' },
    { value: 'turnover', label: 'Turnover' },
    { value: 'aging', label: 'Aging' },
    { value: 'reorder', label: 'Reorder' }
  ]

  const categoryOptions = [
    { value: 'finished_goods', label: 'Finished Goods' },
    { value: 'raw_materials', label: 'Raw Materials' },
    { value: 'wip', label: 'WIP' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'all', label: 'All Categories' }
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
        title="Inventory Reports"
        description="Stock levels, movements, and valuation analytics"
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
                placeholder="Search by report name, period, or warehouse..."
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
              <p className="text-muted-foreground">Loading inventory reports...</p>
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