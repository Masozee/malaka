"use client"

import * as React from "react"
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PackageIcon,
  TruckDeliveryIcon,
  ShippingTruck01Icon,
  Exchange01Icon,
  Settings01Icon,
  ClipboardIcon,
  AlertCircleIcon,
  Coins01Icon
} from '@hugeicons/core-free-icons'
import {
  stockService,
  goodsReceiptService,
  goodsIssueService,
  stockTransferService,
  stockAdjustmentService,
  stockOpnameService
} from '@/services/inventory'

const inventoryModules = [
  {
    title: 'Stock Control',
    href: '/inventory/stock-control',
    description: 'Monitor and manage inventory levels across all locations',
    icon: PackageIcon,
  },
  {
    title: 'Goods Receipt',
    href: '/inventory/goods-receipt',
    description: 'Record incoming inventory and supplier deliveries',
    icon: TruckDeliveryIcon,
  },
  {
    title: 'Goods Issue',
    href: '/inventory/goods-issue',
    description: 'Process outgoing inventory and shipments',
    icon: ShippingTruck01Icon,
  },
  {
    title: 'Stock Transfer',
    href: '/inventory/stock-transfer',
    description: 'Transfer stock between warehouses and locations',
    icon: Exchange01Icon,
  },
  {
    title: 'Stock Adjustments',
    href: '/inventory/adjustments',
    description: 'Adjust inventory levels for discrepancies',
    icon: Settings01Icon,
  },
  {
    title: 'Stock Opname',
    href: '/inventory/stock-opname',
    description: 'Physical inventory counting and reconciliation',
    icon: ClipboardIcon,
  }
]

interface DashboardStats {
  totalItems: number
  lowStockItems: number
  pendingReceipts: number
  stockValue: number
  moduleStats: Record<string, string>
}

export default function InventoryPage() {
  const [mounted, setMounted] = React.useState(false)
  const [stats, setStats] = React.useState<DashboardStats>({
    totalItems: 0,
    lowStockItems: 0,
    pendingReceipts: 0,
    stockValue: 0,
    moduleStats: {}
  })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setMounted(true)
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch data from multiple endpoints in parallel
      const [stockRes, grRes, giRes, transferRes, adjRes, opnameRes] = await Promise.allSettled([
        stockService.getAll(),
        goodsReceiptService.getAll(),
        goodsIssueService.getAll(),
        stockTransferService.getAll(),
        stockAdjustmentService.getAll(),
        stockOpnameService.getAll(),
      ])

      const stockData = stockRes.status === 'fulfilled' ? stockRes.value.data : []
      const grData = grRes.status === 'fulfilled' ? grRes.value.data : []
      const giData = giRes.status === 'fulfilled' ? giRes.value.data : []
      const transferData = transferRes.status === 'fulfilled' ? transferRes.value.data : []
      const adjData = adjRes.status === 'fulfilled' ? adjRes.value.data : []
      const opnameData = opnameRes.status === 'fulfilled' ? opnameRes.value.data : []

      const totalItems = stockData.length
      const lowStockItems = stockData.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').length
      const pendingReceipts = grData.filter(r => r.status === 'DRAFT' || r.status === 'draft').length
      const stockValue = stockData.reduce((acc, item) => acc + (item.totalValue || 0), 0)

      setStats({
        totalItems,
        lowStockItems,
        pendingReceipts,
        stockValue,
        moduleStats: {
          'Stock Control': `${totalItems} items`,
          'Goods Receipt': `${grData.length} total`,
          'Goods Issue': `${giData.length} total`,
          'Stock Transfer': `${transferData.length} total`,
          'Stock Adjustments': `${adjData.length} total`,
          'Stock Opname': `${opnameData.length} sessions`,
        }
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const quickStats = [
    {
      title: 'Total Items',
      value: stats.totalItems.toLocaleString(),
      icon: PackageIcon,
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems.toString(),
      icon: AlertCircleIcon,
    },
    {
      title: 'Pending Receipts',
      value: stats.pendingReceipts.toString(),
      icon: TruckDeliveryIcon,
    },
    {
      title: 'Stock Value',
      value: mounted ? `Rp ${(stats.stockValue / 1000000).toFixed(1)}M` : '-',
      icon: Coins01Icon,
    }
  ]

  return (
    <TwoLevelLayout>
      <Header
        title="Inventory Management"
        description="Manage stock levels, track inventory movements, and optimize warehouse operations"
        breadcrumbs={[
          { label: "Inventory" }
        ]}
      />

      <div className="flex-1 p-6 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-2 text-gray-900 dark:text-gray-100">
                      {loading ? '-' : stat.value}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted">
                    <HugeiconsIcon icon={stat.icon} className="h-6 w-6 text-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Inventory Modules */}
        <div>
          <h2 className="text-lg font-semibold mb-1 text-gray-900 dark:text-gray-100">
            Inventory Modules
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Track stock levels, manage movements, and optimize warehouse operations</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventoryModules.map((module) => (
              <Link key={module.title} href={module.href}>
                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer h-full border hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{module.title}</CardTitle>
                      <div className="p-2.5 rounded-lg bg-muted">
                        <HugeiconsIcon icon={module.icon} className="h-5 w-5 text-foreground" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {module.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {loading ? '...' : (stats.moduleStats[module.title] || '0')}
                      </span>
                      <Button variant="ghost" size="sm" className="text-xs text-gray-500 dark:text-gray-400">
                        Manage &rarr;
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
