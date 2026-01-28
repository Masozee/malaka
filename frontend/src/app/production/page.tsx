"use client"

import * as React from "react"
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { mockProductionSummary, mockWorkOrders, mockQualityControls } from '@/services/production'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'

const productionModules = [
  {
    title: 'Suppliers',
    description: 'Manage supplier relationships and contact information',
    href: '/production/suppliers',
    stats: '67 active suppliers',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Warehouses',
    description: 'Monitor warehouse locations and storage capacity',
    href: '/production/warehouses',
    stats: '8 active warehouses',
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    title: 'Purchase Orders',
    description: 'Create and track procurement orders for materials',
    href: '/production/purchase-orders',
    stats: '89 pending orders',
    color: 'bg-purple-100 text-purple-600'
  },
  {
    title: 'Work Orders',
    description: 'Manage production schedules and job tracking',
    href: '/production/work-orders',
    stats: `${mockProductionSummary.activeWorkOrders} active orders`,
    color: 'bg-orange-100 text-orange-600'
  },
  {
    title: 'Quality Control',
    description: 'Product testing, inspection, and quality assurance',
    href: '/production/quality-control',
    stats: `${mockProductionSummary.qualityScore}% avg quality score`,
    color: 'bg-teal-100 text-teal-600'
  },
  {
    title: 'Material Planning',
    description: 'Calculate material requirements (MRP) and inventory planning',
    href: '/production/material-planning',
    stats: '12 low stock items',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    title: 'Analytics',
    description: 'Production efficiency and output data analysis',
    href: '/production/analytics',
    stats: 'Daily insights',
    color: 'bg-pink-100 text-pink-600'
  },
  {
    title: 'Settings',
    description: 'Configure production parameters and workflows',
    href: '/production/settings',
    stats: 'System config',
    color: 'bg-gray-100 text-gray-600'
  }
]

export default function ProductionDashboard() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
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

  const getStatusBadge = (status: string, type: 'work_order' | 'quality') => {
    // Simplified status mapping for brevity, matching the style
    const colorMap: any = {
      work_order: {
        completed: 'bg-green-100 text-green-800',
        in_progress: 'bg-yellow-100 text-yellow-800',
        draft: 'bg-gray-100 text-gray-800',
      },
      quality: {
        passed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        testing: 'bg-blue-100 text-blue-800',
      }
    }
    const colorClass = colorMap[type]?.[status] || 'bg-gray-100 text-gray-800'
    return { className: `${colorClass} border-0 capitalize` }
  }

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Production Management"
          description="Monitor and manage all production activities"
          breadcrumbs={[{ label: 'Production', href: '/production' }]}
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Production</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{mockProductionSummary.totalProduction.toLocaleString()}</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">Units</span>
                <span className="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Efficiency Rate</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{mockProductionSummary.averageEfficiency}%</p>
              <div className="mt-2 w-full">
                <Progress value={mockProductionSummary.averageEfficiency} className="h-1.5" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Work Orders</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{mockProductionSummary.activeWorkOrders}</p>
              <div className="mt-2">
                <span className="text-sm text-blue-600 font-medium">{mockProductionSummary.delayedWorkOrders > 0 ? `${mockProductionSummary.delayedWorkOrders} delayed` : 'On schedule'}</span>
                <span className="text-sm text-gray-500 ml-1">total</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality Score</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{mockProductionSummary.qualityScore}%</p>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">Target: 98%</span>
              </div>
            </div>
          </div>

          {/* Production Modules */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Production Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productionModules.map((module) => (
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



        </div>
      </div>
    </TwoLevelLayout>
  )
}
