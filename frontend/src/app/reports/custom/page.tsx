"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CustomReportsPage() {
  const breadcrumbs = [
    { label: "Reports", href: "/reports" },
    { label: "Custom Reports" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Custom Reports"
          description="Build and manage custom report templates"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button size="sm" aria-label="Create new custom report">
                New Custom Report
              </Button>
            </div>
          }
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Custom Reports List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Monthly Sales by Region</span>
                </CardTitle>
                <CardDescription>
                  Custom sales breakdown by regional territories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1" aria-label="View Monthly Sales by Region report">
                    View
                  </Button>
                  <Button size="sm" variant="outline" aria-label="Edit Monthly Sales by Region report">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" aria-label="Download Monthly Sales by Region report">
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>Inventory Aging Report</span>
                </CardTitle>
                <CardDescription>
                  Stock aging analysis with ABC classification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1" aria-label="View Inventory Aging report">
                    View
                  </Button>
                  <Button size="sm" variant="outline" aria-label="Edit Inventory Aging report">
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" aria-label="Download Inventory Aging report">
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover: transition-shadow border-dashed border-2">
              <CardContent className="flex items-center justify-center h-full min-h-[200px]">
                <div className="text-center">
                  <div className="h-12 w-12 mx-auto mb-4 bg-muted rounded-lg" />
                  <h3 className="text-lg font-semibold mb-2">Create New Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Build custom reports with drag-and-drop interface
                  </p>
                  <Button aria-label="Get started creating a new custom report">
                    Get Started
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}