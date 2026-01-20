"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Factory, BarChart3, CheckCircle, AlertTriangle, FileText, Download } from "lucide-react"

export default function ProductionReportsPage() {
  const breadcrumbs = [
    { label: "Reports", href: "/reports" },
    { label: "Production Reports" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Production Reports"
          description="Manufacturing and production analytics"
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
          {/* Production Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 text-white rounded-lg">
                  <Factory className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Work Orders</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">45</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 text-white rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Completed</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">38</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500 text-white rounded-lg">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">7</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 text-white rounded-lg">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Efficiency</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">92.3%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Available Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover: transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Factory className="h-5 w-5" />
                  <span>Production Efficiency</span>
                </CardTitle>
                <CardDescription>
                  Manufacturing efficiency and throughput analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="hover: transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Quality Control</span>
                </CardTitle>
                <CardDescription>
                  Quality metrics and defect analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="hover: transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Work Order Analysis</span>
                </CardTitle>
                <CardDescription>
                  Work order performance and timeline analysis
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