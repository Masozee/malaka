"use client"

import * as React from "react"
import Link from 'next/link'
import { TwoLevelLayout } from '@/components/ui/two-level-layout'
import { Header } from '@/components/ui/header'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  PackageIcon,
  DeliveryTruck01Icon,
  CheckmarkCircle01Icon,
  Time04Icon,
  AlertCircleIcon
} from '@hugeicons/core-free-icons'

const shippingModules = [
  {
    title: 'Outbound Shipments',
    description: 'Manage outgoing shipments and delivery tracking',
    href: '/shipping/outbound',
    stats: '234 active shipments',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Airwaybill Management',
    description: 'Generate and track airwaybills for shipments',
    href: '/shipping/airwaybill',
    stats: '89 AWBs today',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Manifest Control',
    description: 'Create and manage shipping manifests',
    href: '/shipping/manifest',
    stats: '12 manifests pending',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Courier Management',
    description: 'Manage courier partners and delivery services',
    href: '/shipping/couriers',
    stats: '15 active couriers',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Shipping Invoices',
    description: 'Handle shipping costs and billing management',
    href: '/shipping/invoices',
    stats: '45 invoices pending',
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Route Management',
    description: 'Optimize delivery routes and logistics planning',
    href: '/shipping/management',
    stats: '8 routes optimized',
    color: 'bg-gray-100 text-gray-600'
  }
]

export default function ShippingPage() {
  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Shipping & Logistics"
          description="Manage shipments, deliveries, and logistics operations"
          breadcrumbs={[{ label: 'Shipping & Logistics', href: '/shipping' }]}
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Shipments</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">1,247</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={PackageIcon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">+15.2%</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Transit</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">234</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={DeliveryTruck01Icon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-blue-600 font-medium">89 today</span>
                <span className="text-sm text-gray-500 ml-1">new shipments</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Delivered</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">956</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
              <div className="mt-2">
                <span className="text-sm text-green-600 font-medium">98.5%</span>
                <span className="text-sm text-gray-500 ml-1">success rate</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Delivery Time</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">2.4</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={Time04Icon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Shipping Modules</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Shipment tracking, courier management, and delivery logistics</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {shippingModules.map((module) => (
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

          {/* Shipping Alerts */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-5 w-5 text-gray-900 dark:text-gray-100" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Shipping Alerts</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white dark:bg-gray-800">
                <div className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Delayed Shipments</p>
                  <p className="text-sm text-gray-500">8 shipments are overdue for delivery</p>
                </div>
                <Link href="/shipping/outbound?status=delayed">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">View</Button>
                </Link>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white dark:bg-gray-800">
                <div className="h-2 w-2 rounded-full bg-yellow-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Weather Warning</p>
                  <p className="text-sm text-gray-500">Heavy rain expected in Central Java</p>
                </div>
                <Link href="/shipping/management">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">View</Button>
                </Link>
              </div>

              <div className="flex items-center space-x-3 p-3 border rounded-lg bg-white dark:bg-gray-800">
                <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">Route Optimization</p>
                  <p className="text-sm text-gray-500">New route to Surabaya available</p>
                </div>
                <Link href="/shipping/management">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">View</Button>
                </Link>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </TwoLevelLayout>
  )
}
