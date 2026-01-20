"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, TrendingUp, TrendingDown, FileText, Download } from "lucide-react"

export default function FinancialReportsPage() {
  const breadcrumbs = [
    { label: "Reports", href: "/reports" },
    { label: "Financial Reports" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Financial Reports"
          description="Financial performance and accounting reports"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          }
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-500 text-white rounded-xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Revenue</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">Rp 2.4B</p>
                  <p className="text-sm text-green-600 dark:text-green-400">+12.5% vs last month</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-500 text-white rounded-xl">
                  <TrendingDown className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-900 dark:text-red-100">Rp 1.8B</p>
                  <p className="text-sm text-red-600 dark:text-red-400">+8.2% vs last month</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 text-white rounded-xl">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Net Profit</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">Rp 600M</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">+25.3% vs last month</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Available Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover: transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Profit & Loss</span>
                </CardTitle>
                <CardDescription>
                  Comprehensive P&L statement for the current period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="hover: transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Balance Sheet</span>
                </CardTitle>
                <CardDescription>
                  Assets, liabilities, and equity summary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="hover: transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Cash Flow</span>
                </CardTitle>
                <CardDescription>
                  Cash flow statement and analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}