'use client'

import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const reportModules = [
  {
    title: 'Sales Reports',
    description: 'Revenue, orders, and customer analytics',
    href: '/reports/sales',
    stats: '12 reports available'
  },
  {
    title: 'Financial Reports',
    description: 'P&L, balance sheet, and cash flow',
    href: '/reports/financial',
    stats: '8 reports available'
  },
  {
    title: 'Inventory Reports',
    description: 'Stock levels, turnover, and valuation',
    href: '/reports/inventory',
    stats: '10 reports available'
  },
  {
    title: 'Production Reports',
    description: 'Output, efficiency, and quality metrics',
    href: '/reports/production',
    stats: '6 reports available'
  },
  {
    title: 'HR Reports',
    description: 'Attendance, payroll, and performance',
    href: '/reports/hr',
    stats: '9 reports available'
  },
  {
    title: 'Custom Reports',
    description: 'Build and save custom report templates',
    href: '/reports/custom',
    stats: '15 saved templates'
  }
]

export default function ReportsDashboardPage() {
  const breadcrumbs = [
    { label: 'Reports & Analytics', href: '/reports/dashboard' }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Reports & Analytics"
          description="Business intelligence dashboard and comprehensive reporting"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/reports/scheduled">
                  Scheduled
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/reports/settings">
                  Settings
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/reports/custom/new">
                  New Report
                </Link>
              </Button>
            </div>
          }
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue (MTD)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rp 4.8B</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium" aria-hidden="true">+12.5%</span>
                <span className="sr-only">Increased by 12.5 percent</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders (MTD)</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">8,457</p>
              <div className="mt-2">
                <span className="text-sm text-red-600 font-medium" aria-hidden="true">-3.2%</span>
                <span className="sr-only">Decreased by 3.2 percent</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Customers</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">3,289</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+8.1%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inventory Value</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rp 480M</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+5.7%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          </div>

          {/* Report Modules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Report Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {reportModules.map((module) => (
                <Card key={module.title} className="p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{module.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
                    <p className="text-xs text-gray-500">{module.stats}</p>
                  </div>

                  <div className="mt-4">
                    <Link href={module.href}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Reports
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Generate Sales Report</p>
                    <p className="text-sm text-gray-500">Monthly sales summary</p>
                  </div>
                  <Link href="/reports/sales/generate">
                    <Button size="sm" aria-label="Generate monthly sales summary report">Generate</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Export Financial Data</p>
                    <p className="text-sm text-gray-500">Download to Excel/PDF</p>
                  </div>
                  <Link href="/reports/financial/export">
                    <Button size="sm" aria-label="Export financial data to Excel or PDF">Export</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Schedule Report</p>
                    <p className="text-sm text-gray-500">Setup automated delivery</p>
                  </div>
                  <Link href="/reports/scheduled/new">
                    <Button size="sm" aria-label="Schedule automated report delivery">Schedule</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recently Generated Reports</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Monthly Sales Summary</p>
                    <p className="text-sm text-gray-500">January 2024 • Generated by Admin</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Inventory Valuation Report</p>
                    <p className="text-sm text-gray-500">Q4 2023 • Generated by Finance</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Customer Analytics Report</p>
                    <p className="text-sm text-gray-500">January 2024 • Generated by Marketing</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Production Efficiency Report</p>
                    <p className="text-sm text-gray-500">Weekly • Generated by Operations</p>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Scheduled Reports</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Daily Sales Summary</p>
                    <p className="text-sm text-gray-500">Every day at 08:00 AM</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Weekly Inventory Report</p>
                    <p className="text-sm text-gray-500">Every Monday at 09:00 AM</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Monthly Financial Statement</p>
                    <p className="text-sm text-gray-500">1st of every month at 07:00 AM</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Quarterly Performance Review</p>
                    <p className="text-sm text-gray-500">End of each quarter</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Key Metrics Overview */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Metrics Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Gross Margin</h4>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">+2.3%</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">32.5%</p>
                <p className="text-xs text-gray-500">Target: 30%</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Inventory Turnover</h4>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">+0.5</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">4.2x</p>
                <p className="text-xs text-gray-500">Target: 4.0x</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Customer Retention</h4>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">-1.2%</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">87.3%</p>
                <p className="text-xs text-gray-500">Target: 90%</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Order Fulfillment</h4>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">+3.1%</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">96.8%</p>
                <p className="text-xs text-gray-500">Target: 95%</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Production Yield</h4>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">+1.8%</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">94.2%</p>
                <p className="text-xs text-gray-500">Target: 93%</p>
              </div>
            </div>
          </Card>

          {/* Report Alerts */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Report Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-red-800">Failed Report Generation</p>
                  <p className="text-sm text-red-700">Production Efficiency Report failed to generate - data source unavailable</p>
                </div>
                <Button variant="outline" size="sm" aria-label="Retry failed production efficiency report">
                  <Link href="/reports/production/retry">Retry</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-yellow-800">Data Delay Warning</p>
                  <p className="text-sm text-yellow-700">Sales data sync delayed by 2 hours - reports may show stale data</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/reports/settings/sync">Check Status</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-blue-800">New Report Available</p>
                  <p className="text-sm text-blue-700">Customer Segmentation Analysis report template is now available</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/reports/custom/templates">View Template</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
