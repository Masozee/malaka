"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return { variant: "default" as const, label: "Active", color: "bg-green-500" }
      case "updating":
        return { variant: "secondary" as const, label: "Updating", color: "bg-yellow-500" }
      case "error":
        return { variant: "destructive" as const, label: "Error", color: "bg-red-500" }
      default:
        return { variant: "outline" as const, label: "Unknown", color: "bg-gray-500" }
    }
  }

  const breadcrumbs = [
    { label: "Reports & Analytics" }
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
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0 ">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 text-white rounded-lg">
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Reports</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{reports.length}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-0 ">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 text-white rounded-lg">
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Active Reports</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {reports.filter(r => r.status === 'active').length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-0 ">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 text-white rounded-lg">
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Categories</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {categories.length - 1}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-0 ">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500 text-white rounded-lg">
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Last Updated</p>
                  <p className="text-lg font-bold text-orange-900 dark:text-orange-100">1 min ago</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="flex space-x-2 overflow-x-auto">
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
                  className="group hover: transition-all duration-200 border-0  bg-gradient-to-br from-white via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base font-semibold truncate">
                            {report.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {report.category}
                            </Badge>
                            <div className={`w-2 h-2 rounded-full ${statusBadge.color}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <CardDescription className="text-sm text-muted-foreground mb-4">
                      {report.description}
                    </CardDescription>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Data Points</span>
                        <span className="font-medium">{report.dataPoints.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Updated</span>
                        <span className="font-medium">{report.lastUpdated}</span>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" asChild className="flex-1">
                          <Link href={report.href}>
                            View
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline">
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
