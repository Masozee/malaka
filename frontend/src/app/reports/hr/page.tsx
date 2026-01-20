"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Clock, Calendar, Award, FileText, Download } from "lucide-react"

export default function HRReportsPage() {
  const breadcrumbs = [
    { label: "Reports", href: "/reports" },
    { label: "HR Reports" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="HR Reports"
          description="Human resources analytics and reports"
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
          {/* HR Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 text-white rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Employees</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">156</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 text-white rounded-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-300">Attendance Rate</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">94.2%</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 text-white rounded-lg">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Leave Requests</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">23</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500 text-white rounded-lg">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Avg Performance</p>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">4.2/5</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Available Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover: transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Attendance Report</span>
                </CardTitle>
                <CardDescription>
                  Employee attendance patterns and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="hover: transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Performance Report</span>
                </CardTitle>
                <CardDescription>
                  Employee performance evaluations and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Generate Report</Button>
              </CardContent>
            </Card>

            <Card className="hover: transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Leave Report</span>
                </CardTitle>
                <CardDescription>
                  Leave balances and usage analytics
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