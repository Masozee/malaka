"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from '@hugeicons/react'
import {
  File01Icon,
  ChartLineData01Icon,
  FilterHorizontalIcon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
  Download01Icon,
  Time04Icon
} from '@hugeicons/core-free-icons'

import Link from "next/link"

interface ReportCard {
  id: string
  title: string
  description: string
  category: string
  href: string
  lastUpdated: string
  dataPoints: number
  status: 'active' | 'updating' | 'error'
}

const reports: ReportCard[] = [
  {
    id: "sales-dashboard",
    title: "Sales Dashboard",
    description: "Real-time sales performance and trends",
    category: "Sales",
    href: "/reports/sales",
    lastUpdated: "2 minutes ago",
    dataPoints: 1234,
    status: "active"
  },
  {
    id: "inventory-reports",
    title: "Inventory Reports",
    description: "Stock levels, movements, and analytics",
    category: "Inventory",
    href: "/reports/inventory",
    lastUpdated: "5 minutes ago",
    dataPoints: 2456,
    status: "active"
  },
  {
    id: "financial-reports",
    title: "Financial Reports",
    description: "P&L, balance sheet, and financial analytics",
    category: "Financial",
    href: "/reports/financial",
    lastUpdated: "10 minutes ago",
    dataPoints: 3678,
    status: "updating"
  },
  {
    id: "hr-reports",
    title: "HR Reports",
    description: "Employee performance and attendance analytics",
    category: "HR",
    href: "/reports/hr",
    lastUpdated: "15 minutes ago",
    dataPoints: 567,
    status: "active"
  },
  {
    id: "production-reports",
    title: "Production Reports",
    description: "Manufacturing efficiency and quality metrics",
    category: "Production",
    href: "/reports/production",
    lastUpdated: "8 minutes ago",
    dataPoints: 890,
    status: "active"
  },
  {
    id: "bi-dashboard",
    title: "BI Dashboard",
    description: "Executive dashboard with key metrics",
    category: "Business Intelligence",
    href: "/reports/dashboard",
    lastUpdated: "1 minute ago",
    dataPoints: 4567,
    status: "active"
  },
  {
    id: "custom-reports",
    title: "Custom Reports",
    description: "Build and manage custom report templates",
    category: "Custom",
    href: "/reports/custom",
    lastUpdated: "1 hour ago",
    dataPoints: 234,
    status: "active"
  },
  {
    id: "static-reports",
    title: "Static Reports",
    description: "Pre-built regulatory and compliance reports",
    category: "Compliance",
    href: "/reports/static",
    lastUpdated: "30 minutes ago",
    dataPoints: 1890,
    status: "active"
  }
]

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")

  const categories = ["all", ...Array.from(new Set(reports.map(r => r.category)))]

  const filteredReports = selectedCategory === "all"
    ? reports
    : reports.filter(report => report.category === selectedCategory)

  // Neutral status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return { color: "bg-gray-800" } // Dark gray/black
      case "updating":
        return { color: "bg-gray-400" } // Medium gray
      case "error":
        return { color: "bg-gray-200" } // Light gray
      default:
        return { color: "bg-gray-300" }
    }
  }

  const breadcrumbs = [
    { label: "Reports & Analytics", href: "/reports" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Reports & Analytics"
          description="Business intelligence and reporting dashboard"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                Refresh All
              </Button>
              <Button variant="outline" size="sm">
                Export
              </Button>
              <Button size="sm" asChild>
                <Link href="/reports/custom">
                  New Report
                </Link>
              </Button>
            </div>
          }
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Quick Stats - Neutral Design */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{reports.length}</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={File01Icon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Reports</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {reports.filter(r => r.status === 'active').length}
                  </p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {categories.length - 1}
                  </p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={FilterHorizontalIcon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">1m</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex items-center justify-center">
                  <HugeiconsIcon icon={Time04Icon} className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap"
                  >
                    {category === "all" ? "All Reports" : category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReports.map((report) => {
              const statusBadge = getStatusBadge(report.status)

              return (
                <Card
                  key={report.id}
                  className="group hover:shadow-md transition-all duration-200 border bg-white dark:bg-gray-800"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 w-full">
                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <HugeiconsIcon icon={ChartLineData01Icon} className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold truncate text-gray-900 dark:text-gray-100">
                            {report.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs text-gray-500 border-gray-200 dark:border-gray-700">
                              {report.category}
                            </Badge>
                            <div className={`w-2 h-2 rounded-full ${statusBadge.color}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 h-10">
                      {report.description}
                    </CardDescription>

                    <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Data Points</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{report.dataPoints.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Updated</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{report.lastUpdated}</span>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" asChild className="flex-1" variant="outline">
                          <Link href={report.href}>
                            View Report
                          </Link>
                        </Button>
                        <Button size="sm" variant="ghost" className="px-2">
                          <HugeiconsIcon icon={Download01Icon} className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}
