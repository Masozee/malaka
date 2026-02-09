"use client"

import * as React from "react"
import Link from "next/link"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ChartLineData01Icon,
  DollarCircleIcon,
  PackageIcon,
  Factory01Icon,
  UserMultiple02Icon,
  FileEditIcon,
  Calendar03Icon,
  ChartIcon
} from '@hugeicons/core-free-icons'

const reportModules = [
  {
    title: 'Sales Reports',
    href: '/reports/sales',
    description: 'Revenue, orders, and customer analytics',
    stats: '12 reports',
    icon: ChartLineData01Icon,
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Inventory Reports',
    href: '/reports/inventory',
    description: 'Stock levels, turnover, and valuation',
    stats: '8 reports',
    icon: PackageIcon,
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Financial Reports',
    href: '/reports/financial',
    description: 'P&L, balance sheet, and cash flow',
    stats: '15 reports',
    icon: DollarCircleIcon,
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Production Reports',
    href: '/reports/production',
    description: 'Output, efficiency, and quality metrics',
    stats: '6 reports',
    icon: Factory01Icon,
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'HR Reports',
    href: '/reports/hr',
    description: 'Attendance, payroll, and performance',
    stats: '9 reports',
    icon: UserMultiple02Icon,
    color: 'bg-gray-100 text-gray-600'
  },
  {
    title: 'Custom Reports',
    href: '/reports/custom',
    description: 'Build and save custom report templates',
    stats: '15 templates',
    icon: FileEditIcon,
    color: 'bg-gray-100 text-gray-600'
  }
]

const quickStats = [
  {
    title: 'Total Reports',
    value: '54',
    icon: ChartIcon,
    iconColor: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50'
  },
  {
    title: 'Active Reports',
    value: '48',
    icon: ChartLineData01Icon,
    iconColor: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50'
  },
  {
    title: 'Categories',
    value: '6',
    icon: FileEditIcon,
    iconColor: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50'
  },
  {
    title: 'Last Updated',
    value: 'Today',
    icon: Calendar03Icon,
    iconColor: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50'
  }
]

export default function ReportsPage() {
  return (
    <TwoLevelLayout>
      <Header
        title="Reports & Analytics"
        description="Business intelligence dashboard and comprehensive reporting"
        breadcrumbs={[
          { label: "Reports & Analytics" }
        ]}
        actions={
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" aria-label="Refresh all reports">
              Refresh All
            </Button>
            <Button variant="outline" size="sm" aria-label="Export all reports">
              Export
            </Button>
            <Button size="sm" asChild>
              <Link href="/reports/custom/new">
                New Report
              </Link>
            </Button>
          </div>
        }
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
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Report Modules */}
        <div>
          <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
            Report Categories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportModules.map((module) => (
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
                        View &rarr;
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
