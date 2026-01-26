'use client'

import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import Link from 'next/link'

const salesModules = [
  {
    title: 'Point of Sale',
    description: 'Process in-store transactions, handle payments, and manage cash registers',
    href: '/sales/pos',
    stats: '142 transactions today',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Online Sales',
    description: 'Manage e-commerce orders, online customers, and digital transactions',
    href: '/sales/online',
    stats: '789 orders this month',
    color: 'bg-green-100 text-green-600'
  },
  {
    title: 'Direct Sales',
    description: 'Handle direct customer sales, B2B transactions, and wholesale orders',
    href: '/sales/direct',
    stats: '234 direct sales',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    title: 'Sales Orders',
    description: 'Create, manage, and track all sales orders and customer requests',
    href: '/sales/orders',
    stats: '567 active orders',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    title: 'Returns',
    description: 'Process returns, exchanges, and handle customer refunds',
    href: '/sales/returns',
    stats: '23 returns pending',
    color: 'bg-red-100 text-red-600'
  },
  {
    title: 'Consignment',
    description: 'Manage consignment inventory, track sales, and handle settlements',
    href: '/sales/consignment',
    stats: '45 consignment items',
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    title: 'Promotions',
    description: 'Create and manage promotional campaigns, discounts, and special offers',
    href: '/sales/promotions',
    stats: '8 active campaigns',
    color: 'bg-pink-100 text-pink-600'
  },
  {
    title: 'Sales Targets',
    description: 'Set sales goals, track performance, and monitor achievement progress',
    href: '/sales/targets',
    stats: 'Q3: 78% achieved',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    title: 'Competitors',
    description: 'Monitor competitor prices, analyze market trends, and track competition',
    href: '/sales/competitors',
    stats: '12 competitors tracked',
    color: 'bg-cyan-100 text-cyan-600'
  },
  {
    title: 'Reconciliation',
    description: 'Reconcile sales data, verify transactions, and ensure data accuracy',
    href: '/sales/reconciliation',
    stats: '12 items to reconcile',
    color: 'bg-emerald-100 text-emerald-600'
  }
]

export default function SalesPage() {
  const breadcrumbs = [
    { label: 'Sales Management', href: '/sales' }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Sales Management"
          description="Manage all sales operations, transactions, and customer relationships"
          breadcrumbs={breadcrumbs}
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Daily Sales</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rp 45.2M</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
                <span className="text-sm text-gray-500 ml-1">vs yesterday</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">1,247</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+8.2%</span>
                <span className="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Customers</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">8,934</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+156</span>
                <span className="text-sm text-gray-500 ml-1">new this week</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Monthly Target</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">78%</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">On track</span>
                <span className="text-sm text-gray-500 ml-1">Rp 350M goal</span>
              </div>
            </div>
          </div>

          {/* Sales Modules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sales Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {salesModules.map((module) => {
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
                    <p className="font-medium text-gray-900 dark:text-gray-100">New Sale</p>
                    <p className="text-sm text-gray-500">Start a new POS transaction</p>
                  </div>
                  <Link href="/sales/pos/new">
                    <Button size="sm">Start</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Create Order</p>
                    <p className="text-sm text-gray-500">Create a new sales order</p>
                  </div>
                  <Link href="/sales/orders/new">
                    <Button size="sm">Create</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Sales Report</p>
                    <p className="text-sm text-gray-500">View detailed sales analytics</p>
                  </div>
                  <Link href="/sales/reports">
                    <Button size="sm">View</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Sales Activity</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Order #SO-12345 completed</p>
                    <p className="text-sm text-gray-500">Customer: PT ABC Indonesia - Rp 2,450,000</p>
                  </div>
                  <span className="text-sm text-gray-500">2 min ago</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">New online order received</p>
                    <p className="text-sm text-gray-500">Order #SO-12346 - 3 items - Rp 875,000</p>
                  </div>
                  <span className="text-sm text-gray-500">5 min ago</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Return processed</p>
                    <p className="text-sm text-gray-500">Order #SO-12320 - Refund Rp 450,000</p>
                  </div>
                  <span className="text-sm text-gray-500">1 hour ago</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Promotion campaign started</p>
                    <p className="text-sm text-gray-500">"Summer Sale 2024" - 20% off selected items</p>
                  </div>
                  <span className="text-sm text-gray-500">3 hours ago</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
