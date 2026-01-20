'use client'

import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ShoppingCart, 
  CreditCard, 
  TrendingUp, 
  Store,
  FileText,
  RefreshCw,
  Package,
  Gift,
  Target,
  BarChart,
  CheckCircle,
  ArrowRight,
  Plus,
  DollarSign,
  Users,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

const salesModules = [
  {
    title: 'Point of Sale',
    description: 'Process in-store transactions, handle payments, and manage cash registers',
    icon: CreditCard,
    href: '/sales/pos',
    stats: '142 transactions today',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Online Sales',
    description: 'Manage e-commerce orders, online customers, and digital transactions',
    icon: TrendingUp,
    href: '/sales/online',
    stats: '789 orders this month',
    color: 'bg-green-100 text-green-600'
  },
  {
    title: 'Direct Sales',
    description: 'Handle direct customer sales, B2B transactions, and wholesale orders',
    icon: Store,
    href: '/sales/direct',
    stats: '234 direct sales',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    title: 'Sales Orders',
    description: 'Create, manage, and track all sales orders and customer requests',
    icon: FileText,
    href: '/sales/orders',
    stats: '567 active orders',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    title: 'Returns',
    description: 'Process returns, exchanges, and handle customer refunds',
    icon: RefreshCw,
    href: '/sales/returns',
    stats: '23 returns pending',
    color: 'bg-red-100 text-red-600'
  },
  {
    title: 'Consignment',
    description: 'Manage consignment inventory, track sales, and handle settlements',
    icon: Package,
    href: '/sales/consignment',
    stats: '45 consignment items',
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    title: 'Promotions',
    description: 'Create and manage promotional campaigns, discounts, and special offers',
    icon: Gift,
    href: '/sales/promotions',
    stats: '8 active campaigns',
    color: 'bg-pink-100 text-pink-600'
  },
  {
    title: 'Sales Targets',
    description: 'Set sales goals, track performance, and monitor achievement progress',
    icon: Target,
    href: '/sales/targets',
    stats: 'Q3: 78% achieved',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    title: 'Competitors',
    description: 'Monitor competitor prices, analyze market trends, and track competition',
    icon: BarChart,
    href: '/sales/competitors',
    stats: '12 competitors tracked',
    color: 'bg-cyan-100 text-cyan-600'
  },
  {
    title: 'Reconciliation',
    description: 'Reconcile sales data, verify transactions, and ensure data accuracy',
    icon: CheckCircle,
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
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Daily Sales</p>
                  <p className="text-3xl font-bold text-gray-900">Rp 45.2M</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+12.5%</span>
                <span className="text-sm text-gray-500 ml-1">vs yesterday</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-green-600">1,247</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+8.2%</span>
                <span className="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="text-3xl font-bold text-yellow-600">8,934</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+156</span>
                <span className="text-sm text-gray-500 ml-1">new this week</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Target</p>
                  <p className="text-3xl font-bold text-purple-600">78%</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
              </div>
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
                const Icon = module.icon
                return (
                  <Card key={module.title} className="p-6 hover: transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${module.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <Link href={module.href}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900">{module.title}</h3>
                      <p className="text-sm text-gray-600">{module.description}</p>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">New Sale</p>
                    <p className="text-sm text-gray-500">Start a new POS transaction</p>
                  </div>
                  <Link href="/sales/pos/new">
                    <Button size="sm">Start</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Create Order</p>
                    <p className="text-sm text-gray-500">Create a new sales order</p>
                  </div>
                  <Link href="/sales/orders">
                    <Button size="sm">Create</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Sales Report</p>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales Activity</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Order #SO-12345 completed</p>
                      <p className="text-sm text-gray-500">Customer: PT ABC Indonesia - Rp 2,450,000</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">2 min ago</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">New online order received</p>
                      <p className="text-sm text-gray-500">Order #SO-12346 - 3 items - Rp 875,000</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">5 min ago</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <RefreshCw className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Return processed</p>
                      <p className="text-sm text-gray-500">Order #SO-12320 - Refund Rp 450,000</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">1 hour ago</span>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Gift className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Promotion campaign started</p>
                      <p className="text-sm text-gray-500">"Summer Sale 2024" - 20% off selected items</p>
                    </div>
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