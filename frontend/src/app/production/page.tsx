'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Progress } from '@/components/ui/progress'
import { 
  Factory, 
  Package, 
  Truck, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Eye,
  Settings,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import { mockProductionSummary, mockWorkOrders, mockQualityControls, mockPurchaseOrders } from '@/services/production'
import type { WorkOrder, QualityControl, PurchaseOrder } from '@/types/production'

export default function ProductionDashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const breadcrumbs = [
    { label: 'Production', href: '/production' }
  ]

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
    const configs = {
      work_order: {
        draft: { variant: 'secondary' as const, label: 'Draft' },
        scheduled: { variant: 'default' as const, label: 'Scheduled' },
        in_progress: { variant: 'default' as const, label: 'In Progress' },
        paused: { variant: 'outline' as const, label: 'Paused' },
        completed: { variant: 'default' as const, label: 'Completed' },
        cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
      },
      quality: {
        draft: { variant: 'secondary' as const, label: 'Draft' },
        testing: { variant: 'default' as const, label: 'Testing' },
        passed: { variant: 'default' as const, label: 'Passed' },
        failed: { variant: 'destructive' as const, label: 'Failed' },
        conditional: { variant: 'outline' as const, label: 'Conditional' }
      },
      purchase: {
        draft: { variant: 'secondary' as const, label: 'Draft' },
        sent: { variant: 'outline' as const, label: 'Sent' },
        confirmed: { variant: 'default' as const, label: 'Confirmed' },
        partial: { variant: 'default' as const, label: 'Partial' },
        delivered: { variant: 'default' as const, label: 'Delivered' },
        cancelled: { variant: 'destructive' as const, label: 'Cancelled' }
      }
    }
    return configs[type][status as keyof typeof configs[typeof type]] || { variant: 'secondary' as const, label: status }
  }

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Production Dashboard"
          description="Monitor and manage all production activities"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/production/reports">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Reports
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/production/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/production/work-orders/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Work Order
                </Link>
              </Button>
            </div>
          }
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Work Orders</p>
                <p className="text-2xl font-bold mt-1">{mockProductionSummary.totalWorkOrders}</p>
                <p className="text-sm text-blue-600 mt-1">
                  {mockProductionSummary.activeWorkOrders} active
                </p>
              </div>
              <Factory className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Production Output</p>
                <p className="text-2xl font-bold mt-1">{mockProductionSummary.totalProduction.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">Units this month</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Efficiency Rate</p>
                <p className="text-2xl font-bold mt-1">{mockProductionSummary.averageEfficiency}%</p>
                <div className="mt-2">
                  <Progress value={mockProductionSummary.averageEfficiency} className="h-2" />
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quality Score</p>
                <p className="text-2xl font-bold mt-1">{mockProductionSummary.qualityScore}%</p>
                <div className="mt-2">
                  <Progress value={mockProductionSummary.qualityScore} className="h-2" />
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </Card>
          </div>

          {/* Quick Access Menu */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover: transition-shadow cursor-pointer" asChild>
            <Link href="/production/work-orders">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Factory className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Work Orders</h3>
                  <p className="text-sm text-muted-foreground">Manage production work orders</p>
                  <p className="text-sm font-medium text-blue-600 mt-1">
                    {mockProductionSummary.activeWorkOrders} active orders
                  </p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover: transition-shadow cursor-pointer" asChild>
            <Link href="/production/quality-control">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Quality Control</h3>
                  <p className="text-sm text-muted-foreground">Monitor quality inspections</p>
                  <p className="text-sm font-medium text-green-600 mt-1">
                    {mockProductionSummary.qualityScore}% quality score
                  </p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover: transition-shadow cursor-pointer" asChild>
            <Link href="/production/material-planning">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Material Planning</h3>
                  <p className="text-sm text-muted-foreground">Plan material requirements</p>
                  <p className="text-sm font-medium text-purple-600 mt-1">MRP & scheduling</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover: transition-shadow cursor-pointer" asChild>
            <Link href="/production/suppliers">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Truck className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Suppliers</h3>
                  <p className="text-sm text-muted-foreground">Manage supplier relationships</p>
                  <p className="text-sm font-medium text-orange-600 mt-1">67 active suppliers</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover: transition-shadow cursor-pointer" asChild>
            <Link href="/production/warehouses">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Package className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Warehouses</h3>
                  <p className="text-sm text-muted-foreground">Warehouse management</p>
                  <p className="text-sm font-medium text-gray-600 mt-1">8 warehouses</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 hover: transition-shadow cursor-pointer" asChild>
            <Link href="/production/purchase-orders">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Purchase Orders</h3>
                  <p className="text-sm text-muted-foreground">Procurement management</p>
                  <p className="text-sm font-medium text-red-600 mt-1">89 pending orders</p>
                </div>
              </div>
            </Link>
          </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Work Orders */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Work Orders</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/production/work-orders">
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Link>
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentWorkOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{order.workOrderNumber}</span>
                      <Badge {...getStatusBadge(order.status, 'work_order')} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {order.productName} • {order.quantity} units
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due: {formatDate(order.plannedEndDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{order.efficiency}%</p>
                    <Progress value={order.efficiency} className="h-1 w-16 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Quality Controls */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Quality Control</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/production/quality-control">
                  <Eye className="h-4 w-4 mr-1" />
                  View All
                </Link>
              </Button>
            </div>
            
            <div className="space-y-3">
              {recentQualityControls.map((qc) => (
                <div key={qc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{qc.qcNumber}</span>
                      <Badge {...getStatusBadge(qc.status, 'quality')} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {qc.productName} • {qc.quantityTested} tested
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(qc.testDate)} • {qc.inspector}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{qc.overallScore || 'N/A'}</p>
                    {qc.overallScore > 0 && (
                      <Progress value={qc.overallScore * 10} className="h-1 w-16 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
          </div>

          {/* Recent Purchase Orders */}
          <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Purchase Orders</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/production/purchase-orders">
                <Eye className="h-4 w-4 mr-1" />
                View All
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentPurchaseOrders.map((po) => (
              <div key={po.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{po.orderNumber}</span>
                  <Badge {...getStatusBadge(po.status, 'purchase')} />
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {po.supplier.name}
                </p>
                <p className="text-sm font-medium">
                  {formatCurrency(po.totalAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Due: {formatDate(po.expectedDate)}
                </p>
              </div>
            ))}
          </div>
          </Card>

          {/* Production Alerts */}
          <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="text-lg font-semibold">Production Alerts</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-800">Material Shortage Alert</p>
                <p className="text-sm text-yellow-700">Premium Leather Black is running low (12 units remaining)</p>
              </div>
              <Button variant="outline" size="sm">
                <Link href="/production/materials">View Details</Link>
              </Button>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <Clock className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-red-800">Delayed Work Orders</p>
                <p className="text-sm text-red-700">{mockProductionSummary.delayedWorkOrders} work orders are behind schedule</p>
              </div>
              <Button variant="outline" size="sm">
                <Link href="/production/work-orders?status=delayed">Review Orders</Link>
              </Button>
            </div>
          </div>
          </Card>
        </div>
      </div>
    </TwoLevelLayout>
  )
}