'use client'

import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import Link from 'next/link'

const procurementModules = [
  {
    title: 'Purchase Requests',
    description: 'Create and manage internal purchase requests from departments',
    href: '/procurement/purchase-requests',
    stats: '23 pending requests'
  },
  {
    title: 'Purchase Orders',
    description: 'Generate and track purchase orders to suppliers',
    href: '/procurement/purchase-orders',
    stats: '89 active orders'
  },
  {
    title: 'RFQ Management',
    description: 'Request for quotations and bid management',
    href: '/procurement/rfq',
    stats: '12 open RFQs'
  },
  {
    title: 'Suppliers',
    description: 'Manage supplier database and relationships',
    href: '/procurement/suppliers',
    stats: '156 active suppliers'
  },
  {
    title: 'Contracts',
    description: 'Contract management and compliance tracking',
    href: '/procurement/contracts',
    stats: '45 active contracts'
  },
  {
    title: 'Vendor Evaluation',
    description: 'Evaluate and score vendor performance',
    href: '/procurement/vendor-evaluation',
    stats: '8 evaluations due'
  },
  {
    title: 'Analytics',
    description: 'Procurement analytics and reporting dashboard',
    href: '/procurement/analytics',
    stats: 'Monthly insights'
  }
]

export default function ProcurementPage() {
  const breadcrumbs = [
    { label: 'Procurement Management', href: '/procurement' }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Procurement Management"
          description="Manage purchasing, suppliers, and procurement processes"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/procurement/analytics">
                  Analytics
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/procurement/settings">
                  Settings
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/procurement/purchase-requests/new">
                  New Request
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spending</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rp 2.4B</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+8.5%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Orders</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">89</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">12 new</span>
                <span className="text-sm text-gray-500 ml-1">this week</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Suppliers</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">156</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+3 new</span>
                <span className="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost Savings</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">12.8%</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">Target: 10%</span>
                <span className="text-sm text-gray-500 ml-1">achieved</span>
              </div>
            </div>
          </div>

          {/* Procurement Modules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Procurement Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {procurementModules.map((module) => {
                return (
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
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">New Purchase Request</p>
                    <p className="text-sm text-gray-500">Create a new procurement request</p>
                  </div>
                  <Link href="/procurement/purchase-requests/new">
                    <Button size="sm">Create</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Request for Quotation</p>
                    <p className="text-sm text-gray-500">Start new RFQ process</p>
                  </div>
                  <Link href="/procurement/rfq/new">
                    <Button size="sm">Start RFQ</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Add Supplier</p>
                    <p className="text-sm text-gray-500">Register new supplier</p>
                  </div>
                  <Link href="/procurement/suppliers/new">
                    <Button size="sm">Add</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Purchase Orders</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">PO-2024-0234</p>
                    <p className="text-sm text-gray-500">Premium Leather Supplier - Rp 45,000,000</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Delivered</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">PO-2024-0235</p>
                    <p className="text-sm text-gray-500">Hardware Components - Rp 12,500,000</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">PO-2024-0236</p>
                    <p className="text-sm text-gray-500">Fabric Materials - Rp 28,750,000</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">PO-2024-0237</p>
                    <p className="text-sm text-gray-500">Office Supplies - Rp 3,200,000</p>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Pending Approvals</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">PR-2024-0089</p>
                    <p className="text-sm text-gray-500">Production Department - Raw Materials</p>
                  </div>
                  <span className="text-sm text-gray-500">2 days ago</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">PR-2024-0090</p>
                    <p className="text-sm text-gray-500">IT Department - Software Licenses</p>
                  </div>
                  <span className="text-sm text-gray-500">1 day ago</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">CT-2024-0015</p>
                    <p className="text-sm text-gray-500">Supplier Contract Renewal</p>
                  </div>
                  <span className="text-sm text-gray-500">5 hours ago</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">VE-2024-0012</p>
                    <p className="text-sm text-gray-500">Vendor Performance Evaluation</p>
                  </div>
                  <span className="text-sm text-gray-500">3 hours ago</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Alerts and Notifications */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Procurement Alerts</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-red-800">Overdue Purchase Orders</p>
                  <p className="text-sm text-red-700">3 purchase orders are overdue for delivery</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/procurement/purchase-orders?status=overdue">View Orders</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-yellow-800">Contract Expiry Warning</p>
                  <p className="text-sm text-yellow-700">5 supplier contracts are expiring within 30 days</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/procurement/contracts?status=expiring">Review Contracts</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-blue-800">Cost Savings Opportunity</p>
                  <p className="text-sm text-blue-700">New supplier offers 15% cost reduction on raw materials</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/procurement/rfq/new">Create RFQ</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
