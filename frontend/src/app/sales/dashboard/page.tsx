'use client'

import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const salesModules = [
  {
    title: 'Sales Orders',
    description: 'Create and manage customer sales orders',
    href: '/sales/orders',
    stats: '156 active orders'
  },
  {
    title: 'Customers',
    description: 'Manage customer database and relationships',
    href: '/sales/customers',
    stats: '2,450 customers'
  },
  {
    title: 'Invoices',
    description: 'Generate and track sales invoices',
    href: '/sales/invoices',
    stats: '89 pending invoices'
  },
  {
    title: 'Quotations',
    description: 'Create and manage price quotations',
    href: '/sales/quotations',
    stats: '34 open quotations'
  },
  {
    title: 'Returns',
    description: 'Process sales returns and refunds',
    href: '/sales/returns',
    stats: '12 pending returns'
  },
  {
    title: 'Analytics',
    description: 'Sales analytics and reporting dashboard',
    href: '/sales/analytics',
    stats: 'Monthly insights'
  }
]

export default function SalesDashboardPage() {
  const breadcrumbs = [
    { label: 'Sales Management', href: '/sales/dashboard' }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Sales Management"
          description="Manage sales orders, customers, and revenue tracking"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/sales/analytics">
                  Analytics
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/sales/settings">
                  Settings
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/sales/orders/new">
                  New Order
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rp 4.8B</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">1,234</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+156 new</span>
                <span className="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Customers</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">2,450</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+45 new</span>
                <span className="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Order Value</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rp 3.9M</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+8.2%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          </div>

          {/* Sales Modules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sales Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {salesModules.map((module) => (
                <Card key={module.title} className="p-6 hover:shadow-md transition-shadow duration-200">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{module.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
                    <p className="text-xs text-gray-500">{module.stats}</p>
                  </div>

                  <div className="mt-4">
                    <Link href={module.href}>
                      <Button variant="outline" size="sm" className="w-full">
                        View {module.title}
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
                    <p className="font-medium text-gray-900 dark:text-gray-100">New Sales Order</p>
                    <p className="text-sm text-gray-500">Create a new customer order</p>
                  </div>
                  <Link href="/sales/orders/new">
                    <Button size="sm">Create</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Create Quotation</p>
                    <p className="text-sm text-gray-500">Generate price quotation</p>
                  </div>
                  <Link href="/sales/quotations/new">
                    <Button size="sm">Create</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Add Customer</p>
                    <p className="text-sm text-gray-500">Register new customer</p>
                  </div>
                  <Link href="/sales/customers/new">
                    <Button size="sm">Add</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Sales Orders</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">SO-2024-1234</p>
                    <p className="text-sm text-gray-500">Toko Sepatu Merdeka - Rp 45,000,000</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">SO-2024-1235</p>
                    <p className="text-sm text-gray-500">CV Retail Nusantara - Rp 32,500,000</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">Processing</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">SO-2024-1236</p>
                    <p className="text-sm text-gray-500">PT Distributor Jaya - Rp 78,750,000</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">SO-2024-1237</p>
                    <p className="text-sm text-gray-500">Toko Malioboro - Rp 15,200,000</p>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Customers This Month</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">PT Retail Nusantara</p>
                      <p className="text-xs text-gray-500">12 orders</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Rp 245M</p>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">CV Distributor Jaya</p>
                      <p className="text-xs text-gray-500">8 orders</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Rp 189M</p>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Toko Sepatu Merdeka</p>
                      <p className="text-xs text-gray-500">6 orders</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Rp 156M</p>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                      4
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Toko Malioboro</p>
                      <p className="text-xs text-gray-500">5 orders</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">Rp 98M</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Regional Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Regional Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Jakarta</h4>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">+15.2%</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Rp 1.8B</p>
                <p className="text-xs text-gray-500">456 orders</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Surabaya</h4>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">+8.7%</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Rp 1.2B</p>
                <p className="text-xs text-gray-500">312 orders</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Bandung</h4>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">+12.1%</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Rp 890M</p>
                <p className="text-xs text-gray-500">234 orders</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Yogyakarta</h4>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">-2.3%</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Rp 520M</p>
                <p className="text-xs text-gray-500">145 orders</p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Semarang</h4>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">+5.8%</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">Rp 370M</p>
                <p className="text-xs text-gray-500">87 orders</p>
              </div>
            </div>
          </Card>

          {/* Sales Alerts */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Sales Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-red-800">Overdue Invoices</p>
                  <p className="text-sm text-red-700">5 invoices are overdue for payment</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/sales/invoices?status=overdue">View Invoices</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-yellow-800">Low Stock Alert</p>
                  <p className="text-sm text-yellow-700">8 products have low stock affecting pending orders</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/inventory/stock-control?status=low">Check Stock</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-blue-800">New Customer Opportunity</p>
                  <p className="text-sm text-blue-700">3 new leads from marketing campaign ready for follow-up</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/sales/customers?status=lead">View Leads</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
