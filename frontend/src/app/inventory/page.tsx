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
  ArrowUpRight01Icon,
  ArrowDownRight01Icon,
  Coins01Icon
} from '@hugeicons/core-free-icons'

const inventoryModules = [
  {
    title: 'Stock Control',
    href: '/inventory/stock-control',
    description: 'Monitor and manage inventory levels across all locations',
    stats: '1.2k items',
    icon: PackageIcon,
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Goods Receipt',
    href: '/inventory/goods-receipt',
    description: 'Record incoming inventory and supplier deliveries',
    stats: '34 pending',
    icon: TruckDeliveryIcon,
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Goods Issue',
    href: '/inventory/goods-issue',
    description: 'Process outgoing inventory and shipments',
    stats: '78 today',
    icon: ShippingTruck01Icon,
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Stock Transfer',
    href: '/inventory/stock-transfer',
    description: 'Transfer stock between warehouses and locations',
    stats: '16 active',
    icon: Exchange01Icon,
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Stock Adjustments',
    href: '/inventory/adjustments',
    description: 'Adjust inventory levels for discrepancies',
    stats: '5 this week',
    icon: Settings01Icon,
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Stock Opname',
    href: '/inventory/stock-opname',
    description: 'Physical inventory counting and reconciliation',
    stats: '3 scheduled',
    icon: ClipboardIcon,
    color: 'bg-gray-100 text-gray-600'
  }
]

const quickStats = [
  {
    title: 'Total Items',
    value: '1,245',
    change: '+12%',
    trend: 'up',
    icon: PackageIcon,
    iconColor: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50'
  },
  {
    title: 'Low Stock Items',
    value: '23',
    change: '-5%',
    trend: 'down',
    icon: AlertCircleIcon,
    iconColor: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50'
  },
  {
    title: 'Pending Receipts',
    value: '34',
    change: '+8%',
    trend: 'up',
    icon: TruckDeliveryIcon,
    iconColor: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50'
  },
  {
    title: 'Stock Value',
    value: '$487K',
    change: '+15%',
    trend: 'up',
    icon: Coins01Icon,
    iconColor: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50'
  }
]

export default function InventoryPage() {
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
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.iconColor}`}>
                    <HugeiconsIcon icon={stat.icon} className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span className={`flex items-center text-sm font-medium ${stat.trend === 'up'
                    ? 'text-gray-900 dark:text-gray-100' // Changed to neutral from green/red
                    : 'text-gray-900 dark:text-gray-100'
                    }`}>
                    <HugeiconsIcon
                      icon={stat.trend === 'up' ? ArrowUpRight01Icon : ArrowDownRight01Icon}
                      className="h-4 w-4 mr-1 text-gray-500" // Icon color neutral
                    />
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Inventory Modules */}
        <div>
          <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
            Inventory Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventoryModules.map((module) => (
              <Link key={module.title} href={module.href}>
                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer h-full border hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{module.title}</CardTitle>
                      <div className={`p-2.5 rounded-lg ${module.color} dark:bg-gray-700/50 dark:text-gray-300`}>
                        <HugeiconsIcon icon={module.icon} className="h-5 w-5" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {module.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {module.stats}
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

        {/* Recent Activity - Neutralized */}
        <div>
          <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
            Recent Activity
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {[
                  { action: 'Goods Receipt', item: 'Nike Air Force 1 - White', qty: '+50', time: '2 hours ago', icon: TruckDeliveryIcon },
                  { action: 'Stock Issue', item: 'Adidas Ultraboost - Black', qty: '-25', time: '4 hours ago', icon: ShippingTruck01Icon },
                  { action: 'Stock Transfer', item: 'Puma Suede - Red', qty: '10', time: '6 hours ago', icon: Exchange01Icon },
                  { action: 'Stock Adjustment', item: 'Converse Chuck Taylor', qty: '+5', time: '1 day ago', icon: Settings01Icon }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      {/* Neutral Icon Backgrounds */}
                      <div className="p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        <HugeiconsIcon icon={activity.icon} className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                          {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {activity.item}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {/* Neutral text for Quantity */}
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {activity.qty} units
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
