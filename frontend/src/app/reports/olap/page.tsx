"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Database, Filter, RefreshCw } from "lucide-react"

export default function OLAPAnalysisPage() {
  const breadcrumbs = [
    { label: "Reports", href: "/reports" },
    { label: "OLAP Analysis" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="OLAP Analysis"
          description="Multi-dimensional data analysis and business intelligence"
          breadcrumbs={breadcrumbs}
          actions={
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </div>
          }
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* OLAP Cubes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover: transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Sales Cube</span>
                </CardTitle>
                <CardDescription>
                  Multi-dimensional sales analysis by time, product, and region
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span className="font-medium">5</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Measures</span>
                    <span className="font-medium">12</span>
                  </div>
                  <Button className="w-full">
                    <Database className="h-3 w-3 mr-2" />
                    Analyze
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover: transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Inventory Cube</span>
                </CardTitle>
                <CardDescription>
                  Inventory movement and stock level analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span className="font-medium">4</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Measures</span>
                    <span className="font-medium">8</span>
                  </div>
                  <Button className="w-full">
                    <Database className="h-3 w-3 mr-2" />
                    Analyze
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover: transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Financial Cube</span>
                </CardTitle>
                <CardDescription>
                  Financial performance across departments and time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span className="font-medium">6</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Measures</span>
                    <span className="font-medium">15</span>
                  </div>
                  <Button className="w-full">
                    <Database className="h-3 w-3 mr-2" />
                    Analyze
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Analysis Builder</CardTitle>
              <CardDescription>
                Build custom OLAP queries with drag-and-drop interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Filter className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Interactive Analysis Tool</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag dimensions and measures to create custom analysis views
                </p>
                <Button>
                  Launch Analysis Builder
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TwoLevelLayout>
  )
}