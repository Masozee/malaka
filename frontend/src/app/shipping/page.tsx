'use client'

import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import Link from 'next/link'

const shippingModules = [
  {
    title: 'Outbound Shipments',
    description: 'Manage outgoing shipments and delivery tracking',
    href: '/shipping/outbound',
    stats: '234 active shipments',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Airwaybill Management',
    description: 'Generate and track airwaybills for shipments',
    href: '/shipping/airwaybill',
    stats: '89 AWBs today',
    color: 'bg-green-100 text-green-600'
  },
  {
    title: 'Manifest Control',
    description: 'Create and manage shipping manifests',
    href: '/shipping/manifest',
    stats: '12 manifests pending',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    title: 'Courier Management',
    description: 'Manage courier partners and delivery services',
    href: '/shipping/couriers',
    stats: '15 active couriers',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    title: 'Shipping Invoices',
    description: 'Handle shipping costs and billing management',
    href: '/shipping/invoices',
    stats: '45 invoices pending',
    color: 'bg-red-100 text-red-600'
  },
  {
    title: 'Route Management',
    description: 'Optimize delivery routes and logistics planning',
    href: '/shipping/management',
    stats: '8 routes optimized',
    color: 'bg-indigo-100 text-indigo-600'
  }
]

export default function ShippingPage() {
  const breadcrumbs = [
    { label: 'Shipping & Logistics', href: '/shipping' }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Shipping & Logistics"
          description="Manage shipments, deliveries, and logistics operations"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/shipping/analytics">
                  Analytics
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/shipping/settings">
                  Settings
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/shipping/outbound/new">
                  New Shipment
                </Link>
              </Button>
            </div>
          }
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                  <p className="text-3xl font-bold text-gray-900">1,247</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+15.2%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Transit</p>
                  <p className="text-3xl font-bold text-green-600">234</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-blue-600 font-medium">89 today</span>
                <span className="text-sm text-gray-500 ml-1">new shipments</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-3xl font-bold text-yellow-600">956</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">98.5%</span>
                <span className="text-sm text-gray-500 ml-1">success rate</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Delivery Time</p>
                  <p className="text-3xl font-bold text-purple-600">2.4</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">-0.3 days</span>
                <span className="text-sm text-gray-500 ml-1">improvement</span>
              </div>
            </div>
          </div>

          {/* Shipping Modules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shippingModules.map((module) => {
                return (
                  <Card key={module.title} className="p-6 hover: transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${module.color}`}>
                      </div>
                      <Link href={module.href}>
                        <Button variant="ghost" size="sm">
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">New Shipment</p>
                    <p className="text-sm text-gray-500">Create outbound shipment</p>
                  </div>
                  <Link href="/shipping/outbound/new">
                    <Button size="sm">Create</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Track Package</p>
                    <p className="text-sm text-gray-500">Search by AWB number</p>
                  </div>
                  <Link href="/shipping/tracking">
                    <Button size="sm">Track</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Generate AWB</p>
                    <p className="text-sm text-gray-500">Create new airwaybill</p>
                  </div>
                  <Link href="/shipping/airwaybill/new">
                    <Button size="sm">Generate</Button>
                  </Link>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Route Planning</p>
                    <p className="text-sm text-gray-500">Optimize delivery routes</p>
                  </div>
                  <Link href="/shipping/management">
                    <Button size="sm">Plan</Button>
                  </Link>
                </div>
              </Card>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Shipments</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/shipping/outbound">
                    View All
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">AWB-2024-089234</p>
                      <p className="text-sm text-gray-500">Jakarta → Surabaya • 5 packages</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Delivered</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">AWB-2024-089235</p>
                      <p className="text-sm text-gray-500">Jakarta → Bandung • 12 packages</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">In Transit</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">AWB-2024-089236</p>
                      <p className="text-sm text-gray-500">Jakarta → Medan • 8 packages</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">AWB-2024-089237</p>
                      <p className="text-sm text-gray-500">Jakarta → Makassar • 3 packages</p>
                    </div>
                  </div>
                  <Badge className="bg-gray-100 text-gray-800">Scheduled</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Courier Performance</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/shipping/couriers">
                    View All
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">JNE Express</p>
                      <p className="text-sm text-gray-500">156 shipments • 98.5% success</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">2.1 days</p>
                    <p className="text-xs text-gray-500">avg delivery</p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">J&T Express</p>
                      <p className="text-sm text-gray-500">234 shipments • 97.2% success</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">2.4 days</p>
                    <p className="text-xs text-gray-500">avg delivery</p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">SiCepat</p>
                      <p className="text-sm text-gray-500">89 shipments • 96.8% success</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-purple-600">2.8 days</p>
                    <p className="text-xs text-gray-500">avg delivery</p>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Pos Indonesia</p>
                      <p className="text-sm text-gray-500">45 shipments • 94.2% success</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">3.5 days</p>
                    <p className="text-xs text-gray-500">avg delivery</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Shipping Alerts */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Shipping Alerts</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-red-800">Delayed Shipments</p>
                  <p className="text-sm text-red-700">8 shipments are overdue for delivery</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/shipping/outbound?status=delayed">View Delayed</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-yellow-800">Weather Warning</p>
                  <p className="text-sm text-yellow-700">Heavy rain expected in Central Java - delays possible</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/shipping/management">Adjust Routes</Link>
                </Button>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-blue-800">Route Optimization</p>
                  <p className="text-sm text-blue-700">New route to Surabaya saves 15% delivery time</p>
                </div>
                <Button variant="outline" size="sm">
                  <Link href="/shipping/management">Apply Route</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
