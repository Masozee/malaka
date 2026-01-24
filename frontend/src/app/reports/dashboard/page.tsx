'use client'

import { useState, useEffect } from 'react'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface KPIMetric {
  id: string
  title: string
  value: string
  change: number
  changeType: 'increase' | 'decrease'
  period: string
  color: string
}

interface ReportWidget {
  id: string
  title: string
  type: 'chart' | 'table' | 'metric' | 'gauge'
  description: string
  lastUpdated: string
  status: 'active' | 'loading' | 'error'
  priority: 'high' | 'medium' | 'low'
}

// Mock KPI data
const mockKPIMetrics: KPIMetric[] = [
  {
    id: '1',
    title: 'Total Revenue',
    value: 'Rp 1.2B',
    change: 12.5,
    changeType: 'increase',
    period: 'vs last month',
    color: 'text-green-600'
  },
  {
    id: '2',
    title: 'Sales Volume',
    value: '8,457',
    change: -3.2,
    changeType: 'decrease',
    period: 'vs last month',
    color: 'text-blue-600'
  },
  {
    id: '3',
    title: 'Active Customers',
    value: '3,289',
    change: 8.1,
    changeType: 'increase',
    period: 'vs last month',
    color: 'text-purple-600'
  },
  {
    id: '4',
    title: 'Inventory Value',
    value: 'Rp 480M',
    change: 5.7,
    changeType: 'increase',
    period: 'vs last month',
    color: 'text-orange-600'
  },
  {
    id: '5',
    title: 'Production Output',
    value: '15,234',
    change: 15.3,
    changeType: 'increase',
    period: 'vs last month',
    color: 'text-teal-600'
  },
  {
    id: '6',
    title: 'Shipments',
    value: '2,156',
    change: -1.8,
    changeType: 'decrease',
    period: 'vs last month',
    color: 'text-indigo-600'
  }
]

// Mock report widgets
const mockReportWidgets: ReportWidget[] = [
  {
    id: '1',
    title: 'Sales Performance Trend',
    type: 'chart',
    description: 'Monthly sales revenue and volume trends',
    lastUpdated: '5 minutes ago',
    status: 'active',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Product Category Analysis',
    type: 'chart',
    description: 'Revenue breakdown by product categories',
    lastUpdated: '10 minutes ago',
    status: 'active',
    priority: 'high'
  },
  {
    id: '3',
    title: 'Top Performing Products',
    type: 'table',
    description: 'Best selling products by revenue and quantity',
    lastUpdated: '15 minutes ago',
    status: 'active',
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Customer Acquisition',
    type: 'chart',
    description: 'New customer registration and retention rates',
    lastUpdated: '20 minutes ago',
    status: 'active',
    priority: 'medium'
  },
  {
    id: '5',
    title: 'Inventory Turnover',
    type: 'gauge',
    description: 'Inventory turnover ratio and stock levels',
    lastUpdated: '1 hour ago',
    status: 'loading',
    priority: 'medium'
  },
  {
    id: '6',
    title: 'Financial Health Score',
    type: 'metric',
    description: 'Overall financial performance indicators',
    lastUpdated: '2 hours ago',
    status: 'active',
    priority: 'high'
  },
  {
    id: '7',
    title: 'Production Efficiency',
    type: 'chart',
    description: 'Manufacturing output and efficiency metrics',
    lastUpdated: '30 minutes ago',
    status: 'error',
    priority: 'low'
  },
  {
    id: '8',
    title: 'Regional Sales Map',
    type: 'chart',
    description: 'Geographic distribution of sales performance',
    lastUpdated: '45 minutes ago',
    status: 'active',
    priority: 'medium'
  }
]

const statusColors = {
  active: 'bg-green-100 text-green-800',
  loading: 'bg-blue-100 text-blue-800',
  error: 'bg-red-100 text-red-800'
}

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-gray-100 text-gray-800'
}


export default function BIDashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Reporting', href: '/reports' },
    { label: 'BI Dashboard', href: '/reports/dashboard' }
  ]

  const KPICard = ({ metric }: { metric: KPIMetric }) => {
    const trendColor = metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gray-100`}>
            <div className={`h-6 w-6 ${metric.color}`} />
          </div>
          <div className={`flex items-center space-x-1 ${trendColor}`}>
            <span className="text-sm font-medium">{metric.changeType === 'increase' ? '+' : '-'}{Math.abs(metric.change)}%</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
          <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
          <p className="text-xs text-gray-500">{metric.period}</p>
        </div>
      </Card>
    )
  }

  const ReportWidgetCard = ({ widget }: { widget: ReportWidget }) => {
    return (
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{widget.title}</h3>
              <p className="text-sm text-gray-500">{widget.description}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Badge className={statusColors[widget.status]} size="sm">
              {widget.status.charAt(0).toUpperCase() + widget.status.slice(1)}
            </Badge>
            <Badge className={priorityColors[widget.priority]} size="sm">
              {widget.priority.charAt(0).toUpperCase() + widget.priority.slice(1)}
            </Badge>
          </div>
        </div>

        <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
          <div className="text-center text-gray-500">
            <div className="h-12 w-12 mx-auto mb-2 bg-muted rounded-lg" />
            <p className="text-sm font-medium">{widget.title}</p>
            <p className="text-xs">Interactive {widget.type} would be here</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Updated {widget.lastUpdated}</span>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline">
              View
            </Button>
            <Button size="sm" variant="outline">
              Export
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <TwoLevelLayout>
      <div className="flex-1 space-y-6">
        <Header 
          title="Business Intelligence Dashboard"
          breadcrumbs={breadcrumbs}
        />

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="12m">Last 12 months</option>
              </select>
            </div>
            <Button variant="outline" size="sm">
              Filters
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              Customize
            </Button>
            <Button size="sm">
              Export Dashboard
            </Button>
          </div>
        </div>

        {/* KPI Metrics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {mockKPIMetrics.map((metric) => (
              <KPICard key={metric.id} metric={metric} />
            ))}
          </div>
        </div>

        {/* Report Widgets */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Reports & Analytics</h2>
            <Button variant="outline" size="sm">
              Manage Widgets
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockReportWidgets.map((widget) => (
              <ReportWidgetCard key={widget.id} widget={widget} />
            ))}
          </div>
        </div>

        {/* Quick Access */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access Reports</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { label: 'Sales Report', href: '/reports/sales' },
              { label: 'Inventory Report', href: '/reports/inventory' },
              { label: 'Financial Report', href: '/reports/financial' },
              { label: 'Production Report', href: '/reports/production' },
              { label: 'HR Report', href: '/reports/hr' },
              { label: 'Custom Reports', href: '/reports/custom' }
            ].map((report, index) => {
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                >
                  <div className="h-6 w-6 bg-muted rounded" />
                  <span className="text-xs text-center">{report.label}</span>
                </Button>
              )
            })}
          </div>
        </Card>
      </div>
    </TwoLevelLayout>
  )
}