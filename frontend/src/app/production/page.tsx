'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Progress } from '@/components/ui/progress'

import Link from 'next/link'
import { mockProductionSummary, mockWorkOrders, mockQualityControls, mockPurchaseOrders } from '@/services/production'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon, Settings01Icon, ChartIncreaseIcon } from '@hugeicons/core-free-icons'

export default function ProductionDashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatCurrency = (amount?: number): string => {
    if (!mounted || typeof amount !== 'number' || isNaN(amount)) return ''
    return `Rp ${amount.toLocaleString('id-ID')}`
  }

  const formatDate = (dateString?: string): string => {
    if (!mounted || !dateString) return ''
    return new Date(dateString).toLocaleDateString('id-ID')
  }

  // Recent activities
  const recentWorkOrders = mockWorkOrders.slice(0, 5)
  const recentQualityControls = mockQualityControls.slice(0, 3)
  const recentPurchaseOrders = mockPurchaseOrders.slice(0, 3)

  const getStatusBadge = (status: string, type: 'work_order' | 'quality' | 'purchase') => {
    const configs: any = {
      work_order: {
        draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
        scheduled: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
        in_progress: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' },
        paused: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200' },
        completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
        cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' }
      },
      quality: {
        draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
        testing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
        passed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
        failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' },
        conditional: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' }
      },
      purchase: {
        draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
        sent: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
        confirmed: { color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200' },
        partial: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200' },
        delivered: { color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
        cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200' }
      }
    }
    const config = configs[type][status] || { color: 'bg-gray-100 text-gray-800' }
    return { className: `${config.color} border-0 capitalize` }
  }

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Production Dashboard"
          description="Monitor and manage all production activities"
          breadcrumbs={[{ label: 'Production', href: '/production' }]}
          actions={
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <HugeiconsIcon icon={ChartIncreaseIcon} className="h-4 w-4 mr-2" />
                Reports
              </Button>
              <Button variant="outline">
                <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Link href="/production/work-orders/new">
                <Button>
                  <HugeiconsIcon icon={PlusSignIcon} className="h-4 w-4 mr-2" />
                  New Work Order
                </Button>
              </Link>
            </div>
          }
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Total Work Orders</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{mockProductionSummary.totalWorkOrders}</p>
                <p className="text-sm text-blue-600 mt-1">
                  {mockProductionSummary.activeWorkOrders} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Production Output</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{mockProductionSummary.totalProduction.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">Units this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Efficiency Rate</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{mockProductionSummary.averageEfficiency}%</p>
                <div className="mt-2">
                  <Progress value={mockProductionSummary.averageEfficiency} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground">Quality Score</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{mockProductionSummary.qualityScore}%</p>
                <div className="mt-2">
                  <Progress value={mockProductionSummary.qualityScore} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access Menu */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/production/work-orders">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Work Orders</h3>
                    <p className="text-sm text-muted-foreground">Manage production work orders</p>
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      {mockProductionSummary.activeWorkOrders} active orders
                    </p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/production/quality-control">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Quality Control</h3>
                    <p className="text-sm text-muted-foreground">Monitor quality inspections</p>
                    <p className="text-sm font-medium text-green-600 mt-1">
                      {mockProductionSummary.qualityScore}% quality score
                    </p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/production/material-planning">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Material Planning</h3>
                    <p className="text-sm text-muted-foreground">Plan material requirements</p>
                    <p className="text-sm font-medium text-purple-600 mt-1">MRP & scheduling</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/production/suppliers">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Suppliers</h3>
                    <p className="text-sm text-muted-foreground">Manage supplier relationships</p>
                    <p className="text-sm font-medium text-orange-600 mt-1">67 active suppliers</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/production/warehouses">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Warehouses</h3>
                    <p className="text-sm text-muted-foreground">Warehouse management</p>
                    <p className="text-sm font-medium text-gray-600 mt-1">8 warehouses</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/production/purchase-orders">
                <CardContent className="p-6 flex items-center space-x-4">
                  <div>
                    <h3 className="font-semibold text-foreground">Purchase Orders</h3>
                    <p className="text-sm text-muted-foreground">Procurement management</p>
                    <p className="text-sm font-medium text-red-600 mt-1">89 pending orders</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Work Orders */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Recent Work Orders</h3>
                  <Link href="/production/work-orders">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentWorkOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-foreground">{order.workOrderNumber}</span>
                          <Badge {...getStatusBadge(order.status, 'work_order')}>{order.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {order.productName} • {order.quantity} units
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {formatDate(order.plannedEndDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{order.efficiency}%</p>
                        <Progress value={order.efficiency} className="h-1 w-16 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Quality Controls */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Quality Control</h3>
                  <Link href="/production/quality-control">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentQualityControls.map((qc) => (
                    <div key={qc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-foreground">{qc.qcNumber}</span>
                          <Badge {...getStatusBadge(qc.status, 'quality')}>{qc.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {qc.productName} • {qc.quantityTested} tested
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(qc.testDate)} • {qc.inspector}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{qc.overallScore || 'N/A'}</p>
                        {qc.overallScore > 0 && (
                          <Progress value={qc.overallScore * 10} className="h-1 w-16 mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Purchase Orders & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Recent Purchase Orders</h3>
                  <Link href="/production/purchase-orders">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {recentPurchaseOrders.map((po) => (
                    <div key={po.id} className="p-4 border rounded-lg flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{po.orderNumber}</span>
                          <Badge {...getStatusBadge(po.status, 'purchase')}>{po.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{po.supplier.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {formatCurrency(po.totalAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {formatDate(po.expectedDate)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Production Alerts</h3>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">Material Shortage Alert</p>
                      <Link href="/production/material-planning">
                        <Button variant="outline" size="sm" className="h-7 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300">View</Button>
                      </Link>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">Premium Leather Black is running low (12 units remaining)</p>
                  </div>

                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-red-800 dark:text-red-200">Delayed Work Orders</p>
                      <Link href="/production/work-orders?status=delayed">
                        <Button variant="outline" size="sm" className="h-7 text-xs bg-red-100 hover:bg-red-200 text-red-800 border-red-300">Review</Button>
                      </Link>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300">{mockProductionSummary.delayedWorkOrders} work orders are behind schedule</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
