'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AdvancedDataTable } from '@/components/ui/advanced-data-table'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  FileText,
  PieChart,
  LineChart,
  Target,
  Store
} from 'lucide-react'

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

interface SalesMetric {
  id: string
  title: string
  value: string
  change: number
  changeType: 'increase' | 'decrease'
  period: string
  icon: React.ComponentType<{ className?: string }>
  color: string
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

// Mock sales metrics
const mockSalesMetrics: SalesMetric[] = [
  {
    id: '1',
    title: 'Total Sales Revenue',
    value: 'Rp 1.2B',
    change: 15.3,
    changeType: 'increase',
    period: 'vs last month',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    id: '2',
    title: 'Total Orders',
    value: '8,457',
    change: 8.7,
    changeType: 'increase',
    period: 'vs last month',
    icon: ShoppingCart,
    color: 'text-blue-600'
  },
  {
    id: '3',
    title: 'Average Order Value',
    value: 'Rp 142K',
    change: -2.1,
    changeType: 'decrease',
    period: 'vs last month',
    icon: Target,
    color: 'text-purple-600'
  },
  {
    id: '4',
    title: 'Active Customers',
    value: '3,289',
    change: 12.4,
    changeType: 'increase',
    period: 'vs last month',
    icon: Users,
    color: 'text-orange-600'
  },
  {
    id: '5',
    title: 'Conversion Rate',
    value: '3.8%',
    change: 0.5,
    changeType: 'increase',
    period: 'vs last month',
    icon: TrendingUp,
    color: 'text-teal-600'
  },
  {
    id: '6',
    title: 'Return Rate',
    value: '2.1%',
    change: -0.3,
    changeType: 'decrease',
    period: 'vs last month',
    icon: Store,
    color: 'text-indigo-600'
  }
]

// Status and category color mappings
const statusColors = {
  generated: 'bg-green-100 text-green-800',
  processing: 'bg-blue-100 text-blue-800',
  scheduled: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800'
}

const categoryColors = {
  revenue: 'bg-green-100 text-green-800',
  volume: 'bg-blue-100 text-blue-800',
  customer: 'bg-purple-100 text-purple-800',
  product: 'bg-orange-100 text-orange-800',
  channel: 'bg-teal-100 text-teal-800',
  regional: 'bg-pink-100 text-pink-800'
}

const typeColors = {
  daily: 'bg-gray-100 text-gray-800',
  weekly: 'bg-blue-100 text-blue-800',
  monthly: 'bg-green-100 text-green-800',
  quarterly: 'bg-purple-100 text-purple-800',
  yearly: 'bg-orange-100 text-orange-800',
  custom: 'bg-pink-100 text-pink-800'
}

export default function SalesReportsPage() {
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table')

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Reporting', href: '/reports' },
    { label: 'Sales Reports', href: '/reports/sales' }
  ]

  // Calculate statistics
  const totalReports = mockSalesReports.length
  const generatedReports = mockSalesReports.filter(report => report.status === 'generated').length
  const processingReports = mockSalesReports.filter(report => report.status === 'processing').length
  const scheduledReports = mockSalesReports.filter(report => report.status === 'scheduled').length
  const failedReports = mockSalesReports.filter(report => report.status === 'failed').length
  const totalRevenue = mockSalesReports.reduce((sum, report) => sum + report.totalRevenue, 0)
  const totalOrders = mockSalesReports.reduce((sum, report) => sum + report.totalOrders, 0)
  const successRate = (generatedReports / totalReports) * 100

  const columns = [
    {
      accessorKey: 'reportName',
      header: 'Report Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium max-w-64 truncate" title={row.getValue('reportName')}>
            {row.getValue('reportName')}
          </div>
          <div className="text-sm text-gray-500">{row.original.period}</div>
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
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }: any) => {
        const category = row.getValue('category') as keyof typeof categoryColors
        return (
          <Badge className={categoryColors[category]}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Badge>
        )
      }
    },
    {
      accessorKey: 'totalRevenue',
      header: 'Revenue',
      cell: ({ row }: any) => (
        <div className="text-sm font-medium">
          {mounted ? row.getValue('totalRevenue').toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
        </div>
      )
    },
    {
      accessorKey: 'totalOrders',
      header: 'Orders',
      cell: ({ row }: any) => (
        <div className="text-center font-medium">{row.getValue('totalOrders')}</div>
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
        <div className="text-sm">
          {mounted ? new Date(row.getValue('generatedDate')).toLocaleDateString('id-ID') : ''}
        </div>
      )
    },
    {
      accessorKey: 'generatedBy',
      header: 'Generated By',
      cell: ({ row }: any) => (
        <div className="text-sm">{row.getValue('generatedBy')}</div>
      )
    }
  ]

  const ReportCard = ({ report }: { report: SalesReport }) => (
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
            {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)}
          </Badge>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Category:</span>
          <Badge className={categoryColors[report.category]}>
            {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
          </Badge>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Period:</span>
          <span className="font-medium">{report.period}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Revenue:</span>
          <span className="font-medium">
            {mounted ? report.totalRevenue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Orders:</span>
          <span className="font-medium">{report.totalOrders}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-500">Avg Order:</span>
          <span className="font-medium">
            {mounted ? report.avgOrderValue.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }) : ''}
          </span>
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
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button size="sm" className="flex-1" disabled={report.status !== 'generated'}>
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
      </div>
    </Card>
  )

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Sales Reports"
          breadcrumbs={breadcrumbs}
        />

        {/* Sales Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {mockSalesMetrics.map((metric) => {
              const Icon = metric.icon
              return (
                <Card key={metric.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className={`h-5 w-5 ${metric.color}`} />
                    </div>
                    <div className={`text-sm font-medium ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.changeType === 'increase' ? '+' : ''}{metric.change}%
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
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
                <FileText className="h-5 w-5 text-green-600" />
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
                <RefreshCw className="h-5 w-5 text-blue-600" />
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
                <Calendar className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-yellow-600">{scheduledReports}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FileText className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedReports}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">
                  {mounted ? (totalRevenue / 1000000000).toFixed(1) : ''}B
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {(totalOrders / 1000).toFixed(1)}K
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-teal-600">
                  {mounted ? successRate.toFixed(1) : ''}%
                </p>
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
              <Filter className="h-4 w-4 mr-2" />
              Filter Reports
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
            <Button size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Data Display */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockSalesReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <Card>
            <AdvancedDataTable
              data={mockSalesReports}
              columns={columns}
              searchPlaceholder="Search report names, periods, or categories..."
              showFilters={true}
            />
          </Card>
        )}
      </div>
    </TwoLevelLayout>
  )
}