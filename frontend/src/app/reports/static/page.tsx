"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function StaticReportsPage() {
  const breadcrumbs = [
    { label: "Reports", href: "/reports" },
    { label: "Static Reports" }
  ]

  const staticReports = [
    {
      id: 1,
      title: "Monthly Financial Statement",
      description: "Comprehensive monthly financial performance report",
      category: "Financial",
      lastGenerated: "2024-01-15",
      status: "ready",
      frequency: "Monthly"
    },
    {
      id: 2,
      title: "Tax Compliance Report",
      description: "VAT and tax compliance documentation",
      category: "Compliance",
      lastGenerated: "2024-01-10",
      status: "ready",
      frequency: "Monthly"
    },
    {
      id: 3,
      title: "Regulatory Compliance",
      description: "Industry regulatory compliance summary",
      category: "Compliance",
      lastGenerated: "2024-01-05",
      status: "pending",
      frequency: "Quarterly"
    }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Static Reports"
          description="Pre-built regulatory and compliance reports"
          breadcrumbs={breadcrumbs}
        />

        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Static Reports List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staticReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center space-x-2">
                        <span>{report.title}</span>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {report.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-4">
                    <Badge variant="outline">{report.category}</Badge>
                    <Badge
                      variant={report.status === 'ready' ? 'default' : 'secondary'}
                      className="flex items-center space-x-1"
                    >
                      {report.status === 'ready' && <span className="h-3 w-3" />}
                      <span className="capitalize">{report.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Frequency</span>
                      <span className="font-medium">{report.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Generated</span>
                      <span className="font-medium">{report.lastGenerated}</span>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" className="flex-1" disabled={report.status !== 'ready'} aria-label={`Download ${report.title}`}>
                        Download
                      </Button>
                      <Button size="sm" variant="outline" aria-label={`Schedule ${report.title}`}>
                        Schedule
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </TwoLevelLayout>
  )
}