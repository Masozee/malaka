"use client"

import * as React from "react"
import { TwoLevelLayout } from "@/components/ui/two-level-layout"
import { Header } from "@/components/ui/header"
import { ModuleSettings } from "@/components/ui/module-settings"

export default function ReportingSettingsPage() {
  const [settings, setSettings] = React.useState([
    {
      id: "auto_report_generation",
      label: "Auto Report Generation",
      description: "Automatically generate daily/weekly/monthly reports",
      type: "toggle" as const,
      value: true,
      category: "Report Automation"
    },
    {
      id: "report_email_delivery",
      label: "Email Report Delivery",
      description: "Automatically email reports to stakeholders",
      type: "toggle" as const,
      value: true,
      category: "Report Automation"
    },
    {
      id: "data_refresh_frequency",
      label: "Data Refresh Frequency",
      description: "How often to refresh report data",
      type: "select" as const,
      value: "hourly",
      options: [
        { label: "Real-time", value: "realtime" },
        { label: "Hourly", value: "hourly" },
        { label: "Daily", value: "daily" }
      ],
      category: "Data Management"
    }
  ])

  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const handleSettingChange = (settingId: string, value: any) => {
    setSettings(prev => prev.map(setting => 
      setting.id === settingId ? { ...setting, value } : setting
    ))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setHasUnsavedChanges(false)
    setIsLoading(false)
  }

  const handleReset = () => {
    setHasUnsavedChanges(false)
  }

  const breadcrumbs = [
    { label: "Reporting", href: "/reports" },
    { label: "Settings" }
  ]

  return (
    <TwoLevelLayout>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Reporting Settings" breadcrumbs={breadcrumbs} />
        <div className="flex-1 overflow-auto p-6">
          <ModuleSettings
            moduleName="Reporting"
            moduleId="reporting"
            settings={settings}
            onSettingChange={handleSettingChange}
            onSave={handleSave}
            onReset={handleReset}
            isLoading={isLoading}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>
      </div>
    </TwoLevelLayout>
  )
}