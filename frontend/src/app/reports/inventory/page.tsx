'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Badge } from '@/components/ui/badge'

interface InventoryReport {
  id: string
  reportName: string
  reportType: 'stock-level' | 'movement' | 'valuation' | 'turnover' | 'aging' | 'forecasting'
  period: string
  warehouseId: string
  warehouseName: string
  totalItems: number
  totalValue: number
  lowStockItems: number
  overstockItems: number
  turnoverRate: number
  status: 'generated' | 'processing' | 'scheduled' | 'failed'
  generatedDate: string
  generatedBy: string
  description: string
  formats: string[]
}

interface InventoryMetric {
  id: string
  title: string
  value: string
  change: number
  changeType: 'increase' | 'decrease'
  period: string
  color: string
}

interface StockAlert {
  id: string
  itemCode: string
  itemName: string
  currentStock: number
  minimumStock: number
  maximumStock: number
  alertType: 'low-stock' | 'out-of-stock' | 'overstock' | 'expiring'
  warehouse: string
  daysUntilExpiry?: number
  lastMovement: string
}

// Mock inventory reports data
const mockInventoryReports: InventoryReport[] = [
  {
    id: '1',
    reportName: 'Monthly Stock Level Analysis - July 2024',
    reportType: 'stock-level',
    period: 'July 2024',
    warehouseId: 'WH001',
    warehouseName: 'Main Warehouse Jakarta',
    totalItems: 2847,
    totalValue: 480000000,
    lowStockItems: 45,
    overstockItems: 12,
    turnoverRate: 8.5,
    status: 'generated',
    generatedDate: '2024-07-25',
    generatedBy: 'Warehouse Manager',
    description: 'Comprehensive monthly inventory stock level analysis with alerts and recommendations',
    formats: ['PDF', 'Excel', 'CSV']
  },
  {
    id: '2',
    reportName: 'Inventory Movement Report - Q2 2024',
    reportType: 'movement',
    period: 'Q2 2024',
    warehouseId: 'ALL',
    warehouseName: 'All Warehouses',
    totalItems: 8456,
    totalValue: 1250000000,
    lowStockItems: 67,
    overstockItems: 23,
    turnoverRate: 6.8,
    status: 'generated',
    generatedDate: '2024-07-20',
    generatedBy: 'Inventory Controller',
    description: 'Quarterly inventory movement analysis including receipts, issues, and transfers',
    formats: ['PDF', 'Excel', 'PowerPoint']
  },
  {
    id: '3',
    reportName: 'Inventory Valuation Report - June 2024',
    reportType: 'valuation',
    period: 'June 2024',
    warehouseId: 'WH002',
    warehouseName: 'Distribution Center Surabaya',
    totalItems: 1567,
    totalValue: 230000000,
    lowStockItems: 23,
    overstockItems: 8,
    turnoverRate: 9.2,
    status: 'generated',
    generatedDate: '2024-07-18',
    generatedBy: 'Finance Manager',
    description: 'Monthly inventory valuation using FIFO method with cost analysis',
    formats: ['PDF', 'Excel']
  },
  {
    id: '4',
    reportName: 'Inventory Turnover Analysis - H1 2024',
    reportType: 'turnover',
    period: 'H1 2024',
    warehouseId: 'ALL',
    warehouseName: 'All Warehouses',
    totalItems: 8456,
    totalValue: 1250000000,
    lowStockItems: 89,
    overstockItems: 34,
    turnoverRate: 7.3,
    status: 'processing',
    generatedDate: '2024-07-25',
    generatedBy: 'Data Analyst',
    description: 'Half-yearly inventory turnover analysis with performance metrics',
    formats: ['PDF', 'Excel']
  },
  {
    id: '5',
    reportName: 'Slow Moving Items Report - July 2024',
    reportType: 'aging',
    period: 'July 2024',
    warehouseId: 'WH003',
    warehouseName: 'Warehouse Bandung',
    totalItems: 892,
    totalValue: 145000000,
    lowStockItems: 12,
    overstockItems: 45,
    turnoverRate: 3.2,
    status: 'generated',
    generatedDate: '2024-07-22',
    generatedBy: 'Inventory Analyst',
    description: 'Analysis of slow-moving and obsolete inventory items requiring action',
    formats: ['PDF', 'Excel', 'PowerPoint']
  },
  {
    id: '6',
    reportName: 'Demand Forecasting Report - Q3 2024',
    reportType: 'forecasting',
    period: 'Q3 2024 Forecast',
    warehouseId: 'ALL',
    warehouseName: 'All Warehouses',
    totalItems: 8456,
    totalValue: 1350000000,
    lowStockItems: 0,
    overstockItems: 0,
    turnoverRate: 8.7,
    status: 'scheduled',
    generatedDate: '2024-07-28',
    generatedBy: 'System Scheduler',
    description: 'Quarterly demand forecasting based on historical data and trends',
    formats: ['PDF', 'Excel', 'Interactive']
  }
]

// Mock inventory metrics
const mockInventoryMetrics: InventoryMetric[] = [
  {
    id: '1',
    title: 'Total Inventory Value',
    value: 'Rp 1.25B',
    change: 5.2,
    changeType: 'increase',
    period: 'vs last month',
    color: 'text-blue-600'
  },
  {
    id: '2',
    title: 'Total SKUs',
    value: '8,456',
    change: 2.8,
    changeType: 'increase',
    period: 'vs last month',
    color: 'text-green-600'
  },
  {
    id: '3',
    title: 'Inventory Turnover',
    value: '8.5x',
    change: 12.3,
    changeType: 'increase',
    period: 'vs last month',
    color: 'text-purple-600'
  },
  {
    id: '4',
    title: 'Stock Accuracy',
    value: '98.2%',
    change: 0.5,
    changeType: 'increase',
    period: 'vs last month',
    color: 'text-teal-600'
  },
  {
    id: '5',
    title: 'Low Stock Items',
    value: '89',
    change: -15.2,
    changeType: 'decrease',
    period: 'vs last month',
    color: 'text-orange-600'
  },
  {
    id: '6',
    title: 'Days Sales Outstanding',
    value: '42.5',
    change: -8.1,
    changeType: 'decrease',
    period: 'vs last month',
    color: 'text-indigo-600'
  }
]

// Mock stock alerts
const mockStockAlerts: StockAlert[] = [
  {
    id: '1',
    itemCode: 'RS-001-BLK-42',
    itemName: 'Air Runner Pro Black Size 42',
    currentStock: 5,
    minimumStock: 20,
    maximumStock: 100,
    alertType: 'low-stock',
    warehouse: 'Main Warehouse Jakarta',
    lastMovement: '2024-07-23'
  },
  {
    id: '2',
    itemCode: 'CS-002-WHT-39',
    itemName: 'Canvas Classic White Size 39',
    currentStock: 0,
    minimumStock: 15,
    maximumStock: 80,
    alertType: 'out-of-stock',
    warehouse: 'Distribution Center Surabaya',
    lastMovement: '2024-07-20'
  },
  {
    id: '3',
    itemCode: 'BT-003-BRN-41',
    itemName: 'Winter Boot Brown Size 41',
    currentStock: 150,
    minimumStock: 10,
    maximumStock: 50,
    alertType: 'overstock',
    warehouse: 'Warehouse Bandung',
    lastMovement: '2024-07-15'
  },
  {
    id: '4',
    itemCode: 'LTH-004-PRM',
    itemName: 'Premium Leather Roll',
    currentStock: 25,
    minimumStock: 10,
    maximumStock: 100,
    alertType: 'expiring',
    warehouse: 'Raw Materials Warehouse',
    daysUntilExpiry: 15,
    lastMovement: '2024-07-10'
  }
]

// Status and type color mappings
const statusColors = {
  generated: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800'
}

const typeColors = {
  'stock-level': 'bg-blue-100 text-blue-800',
  'movement': 'bg-green-100 text-green-800',
  'valuation': 'bg-purple-100 text-purple-800',
  'turnover': 'bg-orange-100 text-orange-800',
  'aging': 'bg-red-100 text-red-800',
  'forecasting': 'bg-teal-100 text-teal-800'
}

const alertColors = {
  'low-stock': 'bg-yellow-100 text-yellow-800',
  'out-of-stock': 'bg-red-100 text-red-800',
  'overstock': 'bg-purple-100 text-purple-800',
  'expiring': 'bg-orange-100 text-orange-800'
}

export default function InventoryReportsPage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Reporting', href: '/reports' },
    { label: 'Inventory Reports', href: '/reports/inventory' }
  ]

  // Calculate statistics
  const totalReports = mockInventoryReports.length
  const generatedReports = mockInventoryReports.filter(report => report.status === 'generated').length
  const processingReports = mockInventoryReports.filter(report => report.status === 'processing').length
  const scheduledReports = mockInventoryReports.filter(report => report.status === 'scheduled').length
  const totalValue = mockInventoryReports.reduce((sum, report) => sum + report.totalValue, 0)
  const totalItems = mockInventoryReports.reduce((sum, report) => sum + report.totalItems, 0)
  const avgTurnover = mockInventoryReports.reduce((sum, report) => sum + report.turnoverRate, 0) / totalReports
  const totalAlerts = mockStockAlerts.length

  const columns = [
    {
      accessorKey: 'reportName',
      header: 'Report Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium max-w-64 truncate" title={row.getValue('reportName')}>
            {row.getValue('reportName')}
          </div>
          <div className="text-xs text-gray-500">{row.original.warehouseName}</div>
        </div>
      )
    },
    {
      accessorKey: 'reportType',
      header: 'Type',
      cell: ({ row }: any) => {
        const type = row.getValue('reportType') as keyof typeof typeColors
        return (
          <Badge className={typeColors[type]}>
            {type.replace('-', ' ').charAt(0).toUpperCase() + type.replace('-', ' ').slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'period',
      header: 'Period',
      cell: ({ row }: any) => (
        <div className="text-xs">{row.getValue('period')}</div>
      )
    },
    {
      accessorKey: 'totalItems',
      header: 'Items',
      cell: ({ row }: any) => (
        <div className="text-center font-medium">{row.getValue('totalItems')}</div>
      )
    },
    {
      accessorKey: 'totalValue',
      header: 'Value',
      cell: ({ row }: any) => (
        <div className="text-xs font-medium">
          {mounted ? row.getValue('totalValue').toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    },
    {
      accessorKey: 'turnoverRate',
      header: 'Turnover',
      cell: ({ row }: any) => (
        <div className="text-center font-medium">{row.getValue('turnoverRate')}x</div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status') as keyof typeof statusColors
        return (
          <Badge className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'generatedDate',
      header: 'Generated',
      cell: ({ row }: any) => (
        <div className="text-xs">
          {mounted ? new Date(row.getValue('generatedDate')).toLocaleDateString('id-ID') : ''}
        </div>
      )
    }
  ]

  const ReportCard = ({ report }: { report: InventoryReport }) => (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2" title={report.reportName}>
            {report.reportName}
          </h3>
          <p className="text-sm text-gray-500">{report.description}</p>
        </div>
        <Badge className={statusColors[report.status]}>
          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
        </Badge>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Type:</span>
          <Badge className={typeColors[report.reportType]}>
            {report.reportType.replace('-', ' ').charAt(0).toUpperCase() + report.reportType.replace('-', ' ').slice(1)}
          </Badge>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Warehouse:</span>
          <span className="font-medium max-w-32 truncate" title={report.warehouseName}>
            {report.warehouseName}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Period:</span>
          <span className="font-medium">{report.period}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Total Items:</span>
          <span className="font-medium">{report.totalItems}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Total Value:</span>
          <span className="font-medium">
            {mounted ? report.totalValue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Turnover Rate:</span>
          <span className="font-medium">{report.turnoverRate}x</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Generated:</span>
          <span>{mounted ? new Date(report.generatedDate).toLocaleDateString('id-ID') : ''}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Formats:</span>
          <span className="text-xs">{report.formats.join(', ')}</span>
        </div>
      </div>
      
      <div className="flex space-x-2 mt-4">
        <Button size="sm" variant="outline" className="flex-1">
          View
        </Button>
        <Button size="sm" className="flex-1" disabled={report.status !== 'generated'}>
          Download
        </Button>
      </div>
    </Card>
  )

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Inventory Reports"
          breadcrumbs={breadcrumbs}
        />

        {/* Inventory Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {mockInventoryMetrics.map((metric) => {
              const trendColor = metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'

              return (
                <Card key={metric.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <div className={`h-5 w-5 ${metric.color}`} />
                    </div>
                    <div className={`flex items-center space-x-1 ${trendColor}`}>
                      <span className="text-xs font-medium">{metric.changeType === 'increase' ? '+' : '-'}{Math.abs(metric.change)}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{metric.title}</p>
                    <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-xs text-gray-500">{metric.period}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Stock Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Stock Alerts</h3>
            <Badge className="bg-red-100 text-red-800">
              {totalAlerts} Active Alerts
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockStockAlerts.map((alert) => (
              <div key={alert.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={alertColors[alert.alertType]} size="sm">
                    {alert.alertType.replace('-', ' ').charAt(0).toUpperCase() + alert.alertType.replace('-', ' ').slice(1)}
                  </Badge>
                  {alert.alertType === 'expiring' && (
                    <span className="text-xs text-orange-600 font-medium">
                      {alert.daysUntilExpiry} days
                    </span>
                  )}
                </div>
                <h4 className="font-medium text-sm mb-1">{alert.itemCode}</h4>
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">{alert.itemName}</p>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current:</span>
                    <span className="font-medium">{alert.currentStock}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Min/Max:</span>
                    <span className="font-medium">{alert.minimumStock}/{alert.maximumStock}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Generated</p>
                <p className="text-2xl font-bold text-green-600">{generatedReports}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-blue-600">{processingReports}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-yellow-600">{scheduledReports}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <div className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mounted ? (totalValue / 1000000000).toFixed(1) : ''}B
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <div className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {(totalItems / 1000).toFixed(1)}K
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <div className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Turnover</p>
                <p className="text-2xl font-bold text-teal-600">
                  {mounted ? avgTurnover.toFixed(1) : ''}x
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <div className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Alerts</p>
                <p className="text-2xl font-bold text-red-600">{totalAlerts}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* View Toggle and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              Cards
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
            >
              Table
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Filter Reports
            </Button>
            <Button variant="outline" size="sm">
              Schedule Report
            </Button>
            <Button size="sm">
              Generate Report
            </Button>
          </div>
        </div>

        {/* Data Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockInventoryReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <Card>
            <AdvancedDataTable
              data={mockInventoryReports}
              columns={columns}
              searchPlaceholder="Search report names, types, or warehouses..."
              showFilters={true}
            />
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}